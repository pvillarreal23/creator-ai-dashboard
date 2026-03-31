"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { LayoutDashboard, Clapperboard, Bot, TrendingUp, KeyRound, Search, Bell, Settings, ChevronLeft, ChevronRight, Activity } from "lucide-react";

// Shared types
export type Zone = "mission" | "content" | "workforce" | "growth" | "vault";

export interface AgentInfo { id: string; name: string; role: string; avatar_color: string; department: string; reports_to: string | null; direct_reports: string[]; collaborates_with: string[]; }
export interface ThreadMsg { id: string; sender_type: "user" | "agent"; sender_agent_id: string | null; sender_name?: string; content: string; created_at: string; status: string; }
export interface Thread { id: string; subject: string; participants: string[]; messages: ThreadMsg[]; status: string; updated_at: string; }
export interface ActivityData { running_count: number; completed_today: number; pending_escalations: number; total_agents: number; agent_statuses: { id: string; name: string; role: string; department: string; avatar_color: string; status: string; current_task: string }[]; recent_runs: { id: string; agent_id: string; task_name: string; status: string; summary: string | null; completed_at: string | null; thread_id: string | null }[]; escalations: { id: string; agent_id: string; reason: string; severity: string; thread_id: string; created_at: string }[] }
export interface FeedMsg { id: string; agent_id: string; agent_name: string; agent_color: string; channel: string; content: string; message_type: string; severity: string; thread_id: string | null; pinned: boolean; created_at: string; read: boolean }

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Agent personas
export const AGENT_PERSONAS: Record<string, { humanName: string; gender: "male" | "female" }> = {
  "ceo-agent": { humanName: "Marcus Chen", gender: "male" },
  "content-vp-agent": { humanName: "Sofia Rivera", gender: "female" },
  "operations-vp-agent": { humanName: "James Okafor", gender: "male" },
  "analytics-vp-agent": { humanName: "Priya Sharma", gender: "female" },
  "monetization-vp-agent": { humanName: "Daniel Kim", gender: "male" },
  "ai-and-tech-channel-manager-agent": { humanName: "Aisha Patel", gender: "female" },
  "finance-channel-manager-agent": { humanName: "Ryan Mitchell", gender: "male" },
  "psychology-channel-manager-agent": { humanName: "Elena Vasquez", gender: "female" },
  "scriptwriter-agent": { humanName: "Noah Thompson", gender: "male" },
  "hook-specialist-agent": { humanName: "Mia Jackson", gender: "female" },
  "storyteller-agent": { humanName: "Liam O'Connor", gender: "male" },
  "shorts-and-clips-agent": { humanName: "Zara Ahmed", gender: "female" },
  "thumbnail-designer-agent": { humanName: "Kai Nakamura", gender: "male" },
  "video-editor-agent": { humanName: "Isabella Torres", gender: "female" },
  "seo-specialist-agent": { humanName: "Ethan Park", gender: "male" },
  "project-manager-agent": { humanName: "Olivia Bennett", gender: "female" },
  "workflow-orchestrator-agent": { humanName: "Amir Hassan", gender: "male" },
  "qa-lead-agent": { humanName: "Hannah Lee", gender: "female" },
  "reflection-council-agent": { humanName: "Victor Andrei", gender: "male" },
  "senior-researcher-agent": { humanName: "Grace Nguyen", gender: "female" },
  "trend-researcher-agent": { humanName: "Leo Martinez", gender: "male" },
  "data-analyst-agent": { humanName: "Chloe Williams", gender: "female" },
  "partnership-manager-agent": { humanName: "Omar Farouk", gender: "male" },
  "affiliate-coordinator-agent": { humanName: "Natalie Brooks", gender: "female" },
  "digital-product-manager-agent": { humanName: "Raj Kapoor", gender: "male" },
  "newsletter-strategist-agent": { humanName: "Sarah Lindgren", gender: "female" },
  "community-manager-agent": { humanName: "Tyler Robinson", gender: "male" },
  "social-media-manager-agent": { humanName: "Jade Moreau", gender: "female" },
  "secretary-agent": { humanName: "Emma Fischer", gender: "female" },
  "compliance-officer-agent": { humanName: "David Reeves", gender: "male" },
  "web-designer-agent": { humanName: "Luna Chang", gender: "female" },
  "web-developer-agent": { humanName: "Alex Petrov", gender: "male" },
};

export function getAgentAvatar(agentId: string): string { return `/avatars/${agentId}.jpg`; }
export function getHumanName(agentId: string): string { return AGENT_PERSONAS[agentId]?.humanName || ""; }

export type Tier = "C-Suite" | "VP" | "Manager" | "Specialist" | "Support";
export const TIER_STYLES: Record<Tier, { bg: string; border: string; text: string; badge: string; ring: string }> = {
  "C-Suite": { bg: "bg-yellow-500/5", border: "border-yellow-500/30", text: "text-yellow-400", badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", ring: "ring-yellow-500/60" },
  "VP": { bg: "bg-purple-500/5", border: "border-purple-500/30", text: "text-purple-400", badge: "bg-purple-500/20 text-purple-300 border-purple-500/30", ring: "ring-purple-500/60" },
  "Manager": { bg: "bg-blue-500/5", border: "border-blue-500/30", text: "text-blue-400", badge: "bg-blue-500/20 text-blue-300 border-blue-500/30", ring: "ring-blue-500/60" },
  "Specialist": { bg: "bg-cyan-500/5", border: "border-cyan-500/30", text: "text-cyan-400", badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30", ring: "ring-cyan-500/60" },
  "Support": { bg: "bg-emerald-500/5", border: "border-emerald-500/30", text: "text-emerald-400", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", ring: "ring-emerald-500/60" },
};

export function getAgentTier(agentId: string): Tier {
  if (agentId === "ceo-agent") return "C-Suite";
  if (agentId.includes("-vp-")) return "VP";
  if (agentId.includes("channel-manager")) return "Manager";
  if (["project-manager-agent", "workflow-orchestrator-agent", "secretary-agent"].includes(agentId)) return "Support";
  return "Specialist";
}

export const DEPT_COLORS: Record<string, { dot: string; label: string }> = {
  executive: { dot: "bg-yellow-400", label: "Executive" },
  content: { dot: "bg-blue-400", label: "Content" },
  operations: { dot: "bg-amber-400", label: "Operations" },
  analytics: { dot: "bg-emerald-400", label: "Analytics" },
  monetization: { dot: "bg-red-400", label: "Monetization" },
  admin: { dot: "bg-slate-400", label: "Admin" },
  general: { dot: "bg-gray-400", label: "General" },
};

const ZONES: { id: Zone; label: string; icon: any; color: string; desc: string }[] = [
  { id: "mission", label: "Mission Control", icon: LayoutDashboard, color: "text-blue-400", desc: "Overview + Analytics" },
  { id: "content", label: "Content Engine", icon: Clapperboard, color: "text-cyan-400", desc: "Pipeline + Channels" },
  { id: "workforce", label: "AI Workforce", icon: Bot, color: "text-purple-400", desc: "Agents + Activity + Feed" },
  { id: "growth", label: "Growth Hub", icon: TrendingUp, color: "text-green-400", desc: "Newsletter + Social" },
  { id: "vault", label: "Vault", icon: KeyRound, color: "text-amber-400", desc: "Credentials + Keys" },
];

interface Props {
  children: (zone: Zone, data: DashboardData) => React.ReactNode;
}

export interface DashboardData {
  agents: AgentInfo[];
  threads: Thread[];
  activityData: ActivityData | null;
  feedMessages: FeedMsg[];
  feedUnread: { total: number; channels: Record<string, number> };
}

export default function DashboardLayout({ children }: Props) {
  const [zone, setZone] = useState<Zone>("mission");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [feedMessages, setFeedMessages] = useState<FeedMsg[]>([]);
  const [feedUnread, setFeedUnread] = useState<{ total: number; channels: Record<string, number> }>({ total: 0, channels: {} });

  // Fetch all data on mount
  useEffect(() => {
    fetch(`${API_URL}/api/agents`).then(r => r.json()).then(setAgents).catch(() => {});
    fetch(`${API_URL}/api/threads`).then(r => r.json()).then(setThreads).catch(() => {});
    fetch(`${API_URL}/api/scheduler/activity`).then(r => r.json()).then(setActivityData).catch(() => {});
    fetch(`${API_URL}/api/feed/messages?limit=50`).then(r => r.json()).then(setFeedMessages).catch(() => {});
    fetch(`${API_URL}/api/feed/unread_count`).then(r => r.json()).then(setFeedUnread).catch(() => {});
  }, []);

  // Poll every 10 seconds
  useEffect(() => {
    const poll = setInterval(() => {
      fetch(`${API_URL}/api/scheduler/activity`).then(r => r.json()).then(setActivityData).catch(() => {});
      fetch(`${API_URL}/api/feed/messages?limit=50`).then(r => r.json()).then(setFeedMessages).catch(() => {});
      fetch(`${API_URL}/api/feed/unread_count`).then(r => r.json()).then(setFeedUnread).catch(() => {});
      fetch(`${API_URL}/api/threads`).then(r => r.json()).then(setThreads).catch(() => {});
    }, 10000);
    return () => clearInterval(poll);
  }, []);

  const data: DashboardData = { agents, threads, activityData, feedMessages, feedUnread };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-56" : "w-16"} shrink-0 border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col transition-all duration-200`}>
        {/* Logo */}
        <div className="p-4 border-b border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shrink-0">
            <Clapperboard className="w-4 h-4" />
          </div>
          {sidebarOpen && <span className="text-sm font-bold">YouTube Empire</span>}
        </div>

        {/* Zones */}
        <nav className="flex-1 p-2 space-y-1">
          {ZONES.map(z => (
            <button
              key={z.id}
              onClick={() => setZone(z.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                zone === z.id
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              }`}
            >
              <z.icon className={`w-5 h-5 shrink-0 ${zone === z.id ? z.color : ""}`} />
              {sidebarOpen && (
                <div className="text-left">
                  <p className="font-medium text-xs">{z.label}</p>
                  <p className="text-[9px] text-white/25">{z.desc}</p>
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Agent pulse */}
        {activityData && sidebarOpen && (
          <div className="p-3 border-t border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-white/40">Autopilot Active</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-white/5 rounded-lg p-1.5">
                <p className="text-sm font-bold">{activityData.completed_today}</p>
                <p className="text-[8px] text-white/25">Done today</p>
              </div>
              <div className="bg-white/5 rounded-lg p-1.5">
                <p className="text-sm font-bold">{activityData.pending_escalations}</p>
                <p className="text-[8px] text-white/25">Needs you</p>
              </div>
            </div>
          </div>
        )}

        {/* Pedro */}
        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-2.5">
            <img src="/avatars/pedro.jpg" className="w-8 h-8 rounded-full object-cover ring-2 ring-purple-500/50" alt="" />
            {sidebarOpen && (
              <div>
                <p className="text-xs font-semibold">Pedro</p>
                <p className="text-[9px] text-white/30">Empire Operator</p>
              </div>
            )}
          </div>
        </div>

        {/* Collapse toggle */}
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 border-t border-white/5 text-white/20 hover:text-white/50">
          {sidebarOpen ? <ChevronLeft className="w-4 h-4 mx-auto" /> : <ChevronRight className="w-4 h-4 mx-auto" />}
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0">
          <div>
            <h1 className="text-sm font-bold">{ZONES.find(z => z.id === zone)?.label}</h1>
            <p className="text-[10px] text-white/30">{ZONES.find(z => z.id === zone)?.desc}</p>
          </div>
          <div className="flex items-center gap-3">
            {activityData && activityData.pending_escalations > 0 && (
              <button onClick={() => setZone("workforce")} className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[10px] text-amber-400">
                <Activity className="w-3 h-3" /> {activityData.pending_escalations} escalations
              </button>
            )}
            <button className="relative p-2 rounded-lg hover:bg-white/5">
              <Bell className="w-4 h-4 text-white/40" />
              {feedUnread.total > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 flex items-center justify-center bg-red-500 rounded-full text-[8px] font-bold px-1">{feedUnread.total}</span>}
            </button>
            <button className="p-2 rounded-lg hover:bg-white/5"><Settings className="w-4 h-4 text-white/40" /></button>
          </div>
        </header>

        {/* Zone content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children(zone, data)}
        </main>
      </div>
    </div>
  );
}
