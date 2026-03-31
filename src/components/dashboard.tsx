"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { BarChart3, PlayCircle, Youtube, Users, Eye, ThumbsUp, ArrowUpRight, ArrowDownRight, Target, Layers, Settings, Bell, Search, Plus, LayoutDashboard, Mic, Image, Type, Upload, LineChart, BookOpen, X, Edit3, Trash2, Save, ChevronRight, FileText, Clock, Zap, CheckCircle2, AlertCircle, RefreshCw, ExternalLink, MessageSquare, Send, Bot, User, ChevronDown } from "lucide-react";

type Tab = "overview" | "pipeline" | "channels" | "skills" | "automation" | "analytics" | "agents";

interface AgentInfo { id: string; name: string; role: string; avatar_color: string; department: string; reports_to: string | null; direct_reports: string[]; collaborates_with: string[]; }
interface ThreadMsg { id: string; sender_type: "user" | "agent"; sender_agent_id: string | null; sender_name?: string; content: string; created_at: string; status: string; }
interface Thread { id: string; subject: string; participants: string[]; messages: ThreadMsg[]; status: string; updated_at: string; }

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Human personas for agents — professional business headshots via uifaces
const AGENT_PERSONAS: Record<string, { humanName: string; gender: "male" | "female"; photo: string }> = {
  "ceo-agent":                        { humanName: "Marcus Chen",      gender: "male",   photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face" },
  "content-vp-agent":                 { humanName: "Sofia Rivera",     gender: "female", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face" },
  "operations-vp-agent":              { humanName: "James Okafor",     gender: "male",   photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" },
  "analytics-vp-agent":               { humanName: "Priya Sharma",     gender: "female", photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face" },
  "monetization-vp-agent":            { humanName: "Daniel Kim",       gender: "male",   photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" },
  "ai-and-tech-channel-manager-agent":{ humanName: "Aisha Patel",      gender: "female", photo: "https://images.unsplash.com/photo-1598550874175-4d0ef436c909?w=150&h=150&fit=crop&crop=face" },
  "finance-channel-manager-agent":    { humanName: "Ryan Mitchell",    gender: "male",   photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face" },
  "psychology-channel-manager-agent": { humanName: "Elena Vasquez",    gender: "female", photo: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=150&h=150&fit=crop&crop=face" },
  "scriptwriter-agent":               { humanName: "Noah Thompson",    gender: "male",   photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face" },
  "hook-specialist-agent":            { humanName: "Mia Jackson",      gender: "female", photo: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&h=150&fit=crop&crop=face" },
  "storyteller-agent":                { humanName: "Liam O'Connor",    gender: "male",   photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face" },
  "shorts-and-clips-agent":           { humanName: "Zara Ahmed",       gender: "female", photo: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=150&h=150&fit=crop&crop=face" },
  "thumbnail-designer-agent":         { humanName: "Kai Nakamura",     gender: "male",   photo: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=face" },
  "video-editor-agent":               { humanName: "Isabella Torres",  gender: "female", photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face" },
  "seo-specialist-agent":             { humanName: "Ethan Park",       gender: "male",   photo: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face" },
  "project-manager-agent":            { humanName: "Olivia Bennett",   gender: "female", photo: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face" },
  "workflow-orchestrator-agent":       { humanName: "Amir Hassan",      gender: "male",   photo: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&h=150&fit=crop&crop=face" },
  "qa-lead-agent":                    { humanName: "Hannah Lee",       gender: "female", photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" },
  "reflection-council-agent":         { humanName: "Victor Andrei",    gender: "male",   photo: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=150&h=150&fit=crop&crop=face" },
  "senior-researcher-agent":          { humanName: "Grace Nguyen",     gender: "female", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face" },
  "trend-researcher-agent":           { humanName: "Leo Martinez",     gender: "male",   photo: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face" },
  "data-analyst-agent":               { humanName: "Chloe Williams",   gender: "female", photo: "https://images.unsplash.com/photo-1614644147724-2d4785d69962?w=150&h=150&fit=crop&crop=face" },
  "partnership-manager-agent":        { humanName: "Omar Farouk",      gender: "male",   photo: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=150&h=150&fit=crop&crop=face" },
  "affiliate-coordinator-agent":      { humanName: "Natalie Brooks",   gender: "female", photo: "https://images.unsplash.com/photo-1589571894960-20bbe2828d0a?w=150&h=150&fit=crop&crop=face" },
  "digital-product-manager-agent":    { humanName: "Raj Kapoor",       gender: "male",   photo: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=150&h=150&fit=crop&crop=face" },
  "newsletter-strategist-agent":      { humanName: "Sarah Lindgren",   gender: "female", photo: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&h=150&fit=crop&crop=face" },
  "community-manager-agent":          { humanName: "Tyler Robinson",   gender: "male",   photo: "https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?w=150&h=150&fit=crop&crop=face" },
  "social-media-manager-agent":       { humanName: "Jade Moreau",      gender: "female", photo: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&h=150&fit=crop&crop=face" },
  "secretary-agent":                  { humanName: "Emma Fischer",     gender: "female", photo: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&h=150&fit=crop&crop=face" },
  "compliance-officer-agent":         { humanName: "David Reeves",     gender: "male",   photo: "https://images.unsplash.com/photo-1557862921-37829c790f19?w=150&h=150&fit=crop&crop=face" },
  "web-designer-agent":               { humanName: "Luna Chang",       gender: "female", photo: "https://images.unsplash.com/photo-1590086782957-93c06ef21604?w=150&h=150&fit=crop&crop=face" },
  "web-developer-agent":              { humanName: "Alex Petrov",      gender: "male",   photo: "https://images.unsplash.com/photo-1545167622-3a6ac756afa4?w=150&h=150&fit=crop&crop=face" },
};

function getAgentAvatar(agentId: string): string {
  const persona = AGENT_PERSONAS[agentId];
  if (persona) return persona.photo;
  return `https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face`;
}

function getHumanName(agentId: string): string {
  return AGENT_PERSONAS[agentId]?.humanName || "";
}

// Tier system based on org level
type Tier = "C-Suite" | "VP" | "Manager" | "Specialist" | "Support";
const TIER_STYLES: Record<Tier, { bg: string; border: string; text: string; badge: string; ring: string }> = {
  "C-Suite":    { bg: "bg-yellow-500/5",  border: "border-yellow-500/30", text: "text-yellow-400",  badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", ring: "ring-yellow-500/60" },
  "VP":         { bg: "bg-purple-500/5",  border: "border-purple-500/30", text: "text-purple-400",  badge: "bg-purple-500/20 text-purple-300 border-purple-500/30", ring: "ring-purple-500/60" },
  "Manager":    { bg: "bg-blue-500/5",    border: "border-blue-500/30",   text: "text-blue-400",    badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",     ring: "ring-blue-500/60" },
  "Specialist": { bg: "bg-cyan-500/5",    border: "border-cyan-500/30",   text: "text-cyan-400",    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",     ring: "ring-cyan-500/60" },
  "Support":    { bg: "bg-emerald-500/5", border: "border-emerald-500/30",text: "text-emerald-400", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", ring: "ring-emerald-500/60" },
};

function getAgentTier(agentId: string): Tier {
  if (agentId === "ceo-agent") return "C-Suite";
  if (agentId.includes("-vp-")) return "VP";
  if (agentId.includes("channel-manager")) return "Manager";
  if (["project-manager-agent","workflow-orchestrator-agent","secretary-agent"].includes(agentId)) return "Support";
  return "Specialist";
}

const DEPT_COLORS: Record<string, { dot: string; label: string }> = {
  executive:    { dot: "bg-yellow-400", label: "Executive" },
  content:      { dot: "bg-blue-400",   label: "Content" },
  operations:   { dot: "bg-amber-400",  label: "Operations" },
  analytics:    { dot: "bg-emerald-400",label: "Analytics" },
  monetization: { dot: "bg-red-400",    label: "Monetization" },
  admin:        { dot: "bg-slate-400",  label: "Admin" },
  general:      { dot: "bg-gray-400",   label: "General" },
};

type Status = "RESEARCHED" | "TITLED" | "SCRIPTED" | "PRODUCTION" | "READY" | "SCHEDULED" | "LIVE";

interface PipelineItem { id: string; title: string; channel: string; status: Status; date: string; views: string; }
interface Channel { id: string; name: string; subs: string; views: string; freq: string; color: string; growth: string; vids: string; ctr: string; revenue: string; nextVideo: string; }

const SC: Record<Status, string> = {
  RESEARCHED: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  TITLED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  SCRIPTED: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  PRODUCTION: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  READY: "bg-green-500/20 text-green-400 border-green-500/30",
  SCHEDULED: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  LIVE: "bg-red-500/20 text-red-400 border-red-500/30",
};

const STATUSES: Status[] = ["RESEARCHED","TITLED","SCRIPTED","PRODUCTION","READY","SCHEDULED","LIVE"];

const initialChannels: Channel[] = [
  { id:"1", name:"The AI Edge", subs:"0", views:"0", freq:"3x/week", color:"from-blue-600 to-cyan-500", growth:"+0%", vids:"0", ctr:"0%", revenue:"$0", nextVideo:"Apr 2" },
  { id:"2", name:"Cash Flow Code", subs:"—", views:"—", freq:"2x/week", color:"from-green-600 to-emerald-500", growth:"—", vids:"—", ctr:"—", revenue:"—", nextVideo:"Month 7" },
  { id:"3", name:"Mind Shift", subs:"—", views:"—", freq:"1x/week", color:"from-purple-600 to-pink-500", growth:"—", vids:"—", ctr:"—", revenue:"—", nextVideo:"Month 13" },
];

const initialPipeline: PipelineItem[] = [
  { id:"1", title:"5 AI Tools Replacing Jobs in 2026", channel:"The AI Edge", status:"SCRIPTED", date:"Apr 2", views:"-" },
  { id:"2", title:"Claude vs GPT-4o: Real Comparison", channel:"The AI Edge", status:"SCRIPTED", date:"Apr 5", views:"-" },
  { id:"4", title:"How I Built a $10K/mo AI Business", channel:"Cash Flow Code", status:"PRODUCTION", date:"Apr 12", views:"-" },
  { id:"5", title:"The Psychology of Going Viral", channel:"Mind Shift", status:"TITLED", date:"Apr 14", views:"-" },
  { id:"6", title:"AI Agents Will Replace SaaS", channel:"The AI Edge", status:"SCRIPTED", date:"Apr 16", views:"-" },
  { id:"7", title:"Why Most Side Hustles Fail in 2026", channel:"Cash Flow Code", status:"PRODUCTION", date:"Apr 19", views:"-" },
  { id:"8", title:"How YouTube Algorithm Actually Works", channel:"Mind Shift", status:"TITLED", date:"Apr 21", views:"-" },
  { id:"3", title:"How Make.com Automates Everything", channel:"The AI Edge", status:"SCRIPTED", date:"Apr 9", views:"-" },
];

const SKILLS = [
  { name:"research.md", desc:"Find trending topics & keywords", icon:BookOpen, file:"skills/research.md", status:"ready" },
  { name:"script_writer.md", desc:"Write 8–12 min scripts", icon:FileText, file:"skills/script_writer.md", status:"ready" },
  { name:"title_optimizer.md", desc:"Generate CTR-optimized titles", icon:Type, file:"skills/title_optimizer.md", status:"ready" },
  { name:"thumbnail_designer.md", desc:"Create thumbnail briefs & A/B variants", icon:Image, file:"skills/thumbnail_designer.md", status:"ready" },
  { name:"voiceover_director.md", desc:"Annotate scripts for AI voice", icon:Mic, file:"skills/voiceover_director.md", status:"ready" },
  { name:"description_writer.md", desc:"Write SEO descriptions + tags", icon:FileText, file:"skills/description_writer.md", status:"ready" },
  { name:"upload_scheduler.md", desc:"Build upload calendar", icon:Upload, file:"skills/upload_scheduler.md", status:"ready" },
  { name:"analytics_reviewer.md", desc:"Analyze performance + recommendations", icon:LineChart, file:"skills/analytics_reviewer.md", status:"ready" },
];

const AUTOMATIONS = [
  { id:"1", name:"Run Research", desc:"Claude finds trending topics for your next video", icon:BookOpen, color:"from-purple-600 to-blue-600", step:"Step 1", status:"idle" },
  { id:"2", name:"Generate Script", desc:"Claude writes full 8-12 min script from research", icon:FileText, color:"from-blue-600 to-cyan-600", step:"Step 2", status:"idle" },
  { id:"3", name:"Create Voiceover", desc:"ElevenLabs converts script to MP3 audio", icon:Mic, color:"from-cyan-600 to-teal-600", step:"Step 3", status:"idle" },
  { id:"4", name:"Build Thumbnail", desc:"Claude generates thumbnail brief for Canva", icon:Image, color:"from-orange-600 to-red-600", step:"Step 4", status:"idle" },
  { id:"5", name:"Optimize SEO", desc:"Claude writes title, description, tags & chapters", icon:Type, color:"from-green-600 to-emerald-600", step:"Step 5", status:"idle" },
  { id:"6", name:"Assemble Video", desc:"InVideo AI combines voiceover + footage + captions", icon:PlayCircle, color:"from-red-600 to-pink-600", step:"Step 6", status:"idle" },
  { id:"7", name:"Schedule Upload", desc:"Auto-uploads to YouTube at optimal time", icon:Upload, color:"from-yellow-600 to-orange-600", step:"Step 7", status:"idle" },
];

function Modal({ open, onClose, title, children }: { open:boolean; onClose:()=>void; title:string; children:React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#141414] border border-white/10 rounded-2xl p-6 w-full max-w-lg mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10"><X className="w-5 h-5 text-white/60" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function StatCard({ label, value, change, up, icon: Icon }: { label:string; value:string; change:string; up:boolean; icon:any }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all">
      <div className="flex items-center justify-between mb-3">
        <Icon className="w-5 h-5 text-white/40" />
        <span className={`flex items-center gap-1 text-xs font-medium ${up ? "text-green-400" : "text-red-400"}`}>
          {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{change}
        </span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-white/50 mt-1">{label}</p>
    </div>
  );
}

// Bracket-style card for a single agent
function BracketCard({ agent }: { agent: AgentInfo }) {
  const tier = getAgentTier(agent.id);
  const ts = TIER_STYLES[tier];
  const dept = DEPT_COLORS[agent.department] || DEPT_COLORS.general;
  return (
    <div className={`${ts.bg} border ${ts.border} rounded-lg px-3 py-2 flex items-center gap-2.5 min-w-0`}>
      <div className={`w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ${ts.ring}`}>
        <img src={getAgentAvatar(agent.id)} alt={agent.name} className="w-full h-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold truncate">{getHumanName(agent.id) || agent.name}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <span className={`text-[8px] px-1.5 py-0 rounded-full border font-medium ${ts.badge}`}>{tier}</span>
          <span className="text-[8px] px-1.5 py-0 rounded-full border border-white/10 text-white/40 flex items-center gap-0.5">
            <span className={`w-1 h-1 rounded-full ${dept.dot}`} />{dept.label}
          </span>
        </div>
      </div>
    </div>
  );
}

// Bracket connector: a vertical line from parent down, then horizontal to each child
function BracketGroup({ parent, children, agents, depth }: { parent: AgentInfo; children: AgentInfo[]; agents: AgentInfo[]; depth: number }) {
  const grandchildren = (agentId: string) => agents.filter(a => a.reports_to === agentId);
  return (
    <div className="flex items-start gap-0">
      {/* Parent card + vertical connector */}
      <div className="flex flex-col items-center shrink-0" style={{ minWidth: 200 }}>
        <BracketCard agent={parent} />
        {children.length > 0 && (
          <div className="w-px h-4 bg-white/15" />
        )}
      </div>

      {/* Children bracket */}
      {children.length > 0 && (
        <div className="flex flex-col relative" style={{ marginLeft: -1 }}>
          {/* Horizontal connector from parent */}
          <div className="absolute left-0 top-5 w-4 h-px bg-white/15" style={{ marginLeft: -16 }} />

          {children.map((child, i) => {
            const gc = grandchildren(child.id);
            return (
              <div key={child.id} className="flex items-start relative">
                {/* Vertical bracket line */}
                {children.length > 1 && (
                  <div className="absolute left-0 bg-white/15" style={{
                    width: 1,
                    top: i === 0 ? 16 : 0,
                    bottom: i === children.length - 1 ? "calc(100% - 16px)" : 0,
                    height: i === 0 ? "calc(100% - 16px)" : i === children.length - 1 ? 16 : "100%",
                  }} />
                )}
                {/* Horizontal line to child */}
                <div className="w-6 h-px bg-white/15 shrink-0 mt-4" />

                <div className="py-1">
                  {gc.length > 0 && depth < 2 ? (
                    <BracketGroup parent={child} children={gc} agents={agents} depth={depth + 1} />
                  ) : (
                    <BracketCard agent={child} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [pipeline, setPipeline] = useState<PipelineItem[]>(initialPipeline);
  const [channels] = useState<Channel[]>(initialChannels);
  const [editItem, setEditItem] = useState<PipelineItem | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<Status | "ALL">("ALL");
  const [newItem, setNewItem] = useState<Partial<PipelineItem>>({ title:"", channel:initialChannels[0].name, status:"RESEARCHED", date:"", views:"-" });
  const [autoStates, setAutoStates] = useState<Record<string, "idle"|"running"|"done">>(Object.fromEntries(AUTOMATIONS.map(a => [a.id, "idle"])));
  const [skillModal, setSkillModal] = useState<typeof SKILLS[0] | null>(null);

  // === Agents Tab State ===
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [agentPrompt, setAgentPrompt] = useState("");
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [agentSending, setAgentSending] = useState(false);
  const [agentView, setAgentView] = useState<"chat" | "directory" | "departments" | "org">("chat");
  const msgEndRef = useRef<HTMLDivElement>(null);

  // Fetch agents on mount
  useEffect(() => {
    fetch(`${API_URL}/api/agents`).then(r => r.json()).then(setAgents).catch(() => {});
    fetch(`${API_URL}/api/threads`).then(r => r.json()).then(setThreads).catch(() => {});
  }, []);

  // Poll active thread for new messages
  useEffect(() => {
    if (!activeThread) return;
    const poll = setInterval(() => {
      fetch(`${API_URL}/api/threads/${activeThread.id}`).then(r => r.json()).then((t: Thread) => {
        setActiveThread(t);
      }).catch(() => {});
    }, 3000);
    return () => clearInterval(poll);
  }, [activeThread?.id]);

  // Scroll to bottom on new messages
  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [activeThread?.messages?.length]);

  const sendToAgents = async () => {
    if (!agentPrompt.trim()) return;
    setAgentSending(true);
    try {
      // Find CEO agent
      const ceo = agents.find(a => a.id.includes("ceo"));
      const recipientId = ceo?.id || agents[0]?.id;
      if (!recipientId) { setAgentSending(false); return; }
      const res = await fetch(`${API_URL}/api/threads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: agentPrompt.slice(0, 60), recipient_agent_ids: [recipientId], content: agentPrompt }),
      });
      const thread = await res.json();
      setActiveThread({ ...thread, messages: [{ id: "user-0", sender_type: "user", sender_agent_id: null, content: agentPrompt, created_at: new Date().toISOString(), status: "sent" }] });
      setAgentPrompt("");
      setThreads(prev => [thread, ...prev]);
    } catch (e) { console.error(e); }
    setAgentSending(false);
  };

  const sendReply = async () => {
    if (!agentPrompt.trim() || !activeThread) return;
    setAgentSending(true);
    try {
      await fetch(`${API_URL}/api/threads/${activeThread.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: agentPrompt }),
      });
      setAgentPrompt("");
    } catch (e) { console.error(e); }
    setAgentSending(false);
  };

  const getAgentById = (id: string) => agents.find(a => a.id === id);

  const handleSaveEdit = () => { if (!editItem) return; setPipeline(prev => prev.map(p => p.id === editItem.id ? editItem : p)); setEditItem(null); };
  const handleDelete = (id: string) => setPipeline(prev => prev.filter(p => p.id !== id));
  const handleAddNew = () => {
    if (!newItem.title) return;
    const item: PipelineItem = { id: Date.now().toString(), title: newItem.title||"", channel: newItem.channel||initialChannels[0].name, status:(newItem.status as Status)||"RESEARCHED", date:newItem.date||"TBD", views:"-" };
    setPipeline(prev => [item, ...prev]);
    setNewItem({ title:"", channel:initialChannels[0].name, status:"RESEARCHED", date:"", views:"-" });
    setShowNewModal(false);
  };
  const handleStatusChange = (id: string, newStatus: Status) => setPipeline(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
  const filteredPipeline = filterStatus === "ALL" ? pipeline : pipeline.filter(p => p.status === filterStatus);

  const triggerAutomation = (id: string) => {
    setAutoStates(prev => ({ ...prev, [id]: "running" }));
    setTimeout(() => setAutoStates(prev => ({ ...prev, [id]: "done" })), 2500);
  };

  const stats = [
    { label:"Total Monthly Revenue", value:"$0", change:"+0%", up:true, icon:Eye },
    { label:"Total Subscribers", value:"0", change:"+0%", up:true, icon:Users },
    { label:"Videos Published", value:"0", change:"Month 0", up:true, icon:Clock },
    { label:"Tool Spend", value:"$105/mo", change:"On budget", up:true, icon:Target },
  ];

  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id:"overview", label:"Overview", icon:LayoutDashboard },
    { id:"pipeline", label:"Pipeline", icon:Layers },
    { id:"channels", label:"Channels", icon:Youtube },
    { id:"skills", label:"Skills", icon:BookOpen },
    { id:"automation", label:"Automation", icon:Zap },
    { id:"analytics", label:"Analytics", icon:BarChart3 },
    { id:"agents", label:"Agents", icon:MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center"><PlayCircle className="w-5 h-5" /></div>
            <span className="text-lg font-semibold">Creator AI</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60 hidden sm:inline">Agency Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-white/5"><Bell className="w-5 h-5 text-white/60" /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" /></button>
            <button className="p-2 rounded-lg hover:bg-white/5"><Settings className="w-5 h-5 text-white/60" /></button>
            <div className="w-px h-6 bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-2.5 hidden sm:flex">
              <div className="w-9 h-9 rounded-full ring-2 ring-purple-500/50 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&crop=face" alt="Pedro" className="w-full h-full object-cover" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold">Pedro</p>
                <p className="text-[10px] text-white/40">Empire Operator</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <nav className="flex gap-1 mb-8 bg-white/5 rounded-xl p-1 overflow-x-auto w-fit">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${tab === t.id ? "bg-white/10 text-white" : "text-white/50 hover:text-white/70"}`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </nav>

        {tab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map(s => <StatCard key={s.label} {...s} />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold flex items-center gap-2"><Layers className="w-5 h-5 text-blue-400" />Content Pipeline</h2>
                  <button onClick={() => setTab("pipeline")} className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">View All <ChevronRight className="w-4 h-4" /></button>
                </div>
                <div className="space-y-2">
                  {pipeline.slice(0,5).map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer" onClick={() => setEditItem(item)}>
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${item.status==="LIVE" ? "bg-red-500 animate-pulse" : item.status==="SCHEDULED" ? "bg-orange-500" : "bg-white/30"}`} />
                        <div><p className="text-sm font-medium">{item.title}</p><p className="text-xs text-white/40">{item.channel}</p></div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-white/40 hidden sm:inline">{item.date}</span>
                        <span className={`text-xs px-2 py-1 rounded-full border ${SC[item.status]}`}>{item.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4"><Zap className="w-5 h-5 text-yellow-400" />Quick Actions</h2>
                <div className="space-y-2">
                  {AUTOMATIONS.slice(0,5).map(a => (
                    <button key={a.id} onClick={() => { setTab("automation"); }} className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-left">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${a.color} flex items-center justify-center flex-shrink-0`}><a.icon className="w-4 h-4" /></div>
                      <div><p className="text-sm font-medium">{a.name}</p><p className="text-xs text-white/40">{a.step}</p></div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4"><Youtube className="w-5 h-5 text-red-400" />Channels</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {channels.map(c => (
                  <div key={c.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all">
                    <div className={`w-full h-1.5 rounded-full bg-gradient-to-r ${c.color} mb-4`} />
                    <h3 className="font-semibold mb-3">{c.name}</h3>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div><span className="text-white/40">Subs</span><p className="font-medium">{c.subs}</p></div>
                      <div><span className="text-white/40">Revenue</span><p className="font-medium text-green-400">{c.revenue}</p></div>
                      <div><span className="text-white/40">Frequency</span><p className="font-medium">{c.freq}</p></div>
                      <div><span className="text-white/40">Next video</span><p className="font-medium">{c.nextVideo}</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "pipeline" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-xl font-bold">Content Pipeline</h2>
              <button onClick={() => setShowNewModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"><Plus className="w-4 h-4" />New Video</button>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setFilterStatus("ALL")} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filterStatus==="ALL" ? "bg-white/20 text-white border-white/30" : "border-white/10 text-white/50"}`}>ALL</button>
              {STATUSES.map(s => (<button key={s} onClick={() => setFilterStatus(s)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filterStatus===s ? SC[s] : "border-white/10 text-white/40"}`}>{s}</button>))}
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/10 text-xs text-white/40 font-medium uppercase tracking-wider">
                <div className="col-span-4">Title</div><div className="col-span-2">Channel</div><div className="col-span-2">Status</div><div className="col-span-1">Date</div><div className="col-span-1">Views</div><div className="col-span-2 text-right">Actions</div>
              </div>
              {filteredPipeline.length === 0 && <div className="px-6 py-12 text-center text-white/30">No items match this filter.</div>}
              {filteredPipeline.map(item => (
                <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-4 sm:px-6 py-4 border-b border-white/5 hover:bg-white/5 transition-all items-center">
                  <div className="sm:col-span-4 flex items-center gap-3"><div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.status==="LIVE" ? "bg-red-500 animate-pulse" : "bg-white/20"}`} /><span className="text-sm font-medium">{item.title}</span></div>
                  <div className="sm:col-span-2 text-sm text-white/60 pl-5 sm:pl-0">{item.channel}</div>
                  <div className="sm:col-span-2 pl-5 sm:pl-0"><select value={item.status} onChange={e => handleStatusChange(item.id, e.target.value as Status)} className="text-xs px-2 py-1 rounded-full border bg-transparent cursor-pointer focus:outline-none border-white/20">{STATUSES.map(s => <option key={s} value={s} className="bg-[#141414]">{s}</option>)}</select></div>
                  <div className="sm:col-span-1 text-sm text-white/40 pl-5 sm:pl-0">{item.date}</div>
                  <div className="sm:col-span-1 text-sm text-white/40 pl-5 sm:pl-0">{item.views}</div>
                  <div className="sm:col-span-2 flex items-center gap-2 justify-end pl-5 sm:pl-0">
                    <button onClick={() => setEditItem(item)} className="p-1.5 rounded-lg hover:bg-white/10"><Edit3 className="w-4 h-4 text-white/50 hover:text-blue-400" /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-500/10"><Trash2 className="w-4 h-4 text-white/50 hover:text-red-400" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "channels" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Channel Management</h2>
            <div className="grid grid-cols-1 gap-6">
              {channels.map(c => (
                <div key={c.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center`}><Youtube className="w-6 h-6" /></div>
                      <div><h3 className="text-lg font-semibold">{c.name}</h3><p className="text-sm text-white/40">Publishing {c.freq}</p></div>
                    </div>
                    <span className="text-green-400 text-sm font-medium flex items-center gap-1"><ArrowUpRight className="w-4 h-4" />{c.growth}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[["Subscribers",c.subs],["Total Views",c.views],["Videos",c.vids],["Avg CTR",c.ctr],["Est. Revenue",c.revenue],["Next Upload",c.nextVideo]].map(([l,v]) => (
                      <div key={l} className="bg-white/5 rounded-lg p-4"><p className="text-xs text-white/40 mb-1">{l}</p><p className="text-xl font-bold">{v}</p></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "skills" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">AI Skill Files</h2>
              <a href="https://github.com/pvillarreal23/youtube-agency/tree/main/skills" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                <ExternalLink className="w-4 h-4" />View on GitHub
              </a>
            </div>
            <p className="text-sm text-white/50">These skill files live in your GitHub repo and power Claude Code. Click any skill to preview it.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SKILLS.map(skill => (
                <div key={skill.name} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center"><skill.icon className="w-5 h-5 text-white/60" /></div>
                      <div><p className="text-sm font-medium font-mono">{skill.name}</p><p className="text-xs text-white/40">{skill.desc}</p></div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">ready</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setSkillModal(skill)} className="flex-1 text-xs py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">Preview</button>
                    <a href={`https://github.com/pvillarreal23/youtube-agency/edit/main/${skill.file}`} target="_blank" rel="noopener noreferrer" className="flex-1 text-center text-xs py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 transition-colors">Edit on GitHub</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "automation" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-1">Automation Pipeline</h2>
              <p className="text-sm text-white/50">Trigger each stage of your video production workflow. Connect your API keys to activate.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AUTOMATIONS.map(a => {
                const state = autoStates[a.id];
                return (
                  <div key={a.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center`}><a.icon className="w-6 h-6" /></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2"><span className="text-xs text-white/40">{a.step}</span></div>
                        <p className="text-sm font-semibold">{a.name}</p>
                        <p className="text-xs text-white/50">{a.desc}</p>
                      </div>
                      {state === "done" && <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />}
                      {state === "running" && <RefreshCw className="w-5 h-5 text-blue-400 flex-shrink-0 animate-spin" />}
                      {state === "idle" && <AlertCircle className="w-5 h-5 text-white/20 flex-shrink-0" />}
                    </div>
                    <button
                      onClick={() => triggerAutomation(a.id)}
                      disabled={state === "running"}
                      className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${state==="running" ? "bg-white/5 text-white/30 cursor-not-allowed" : state==="done" ? "bg-green-600/20 text-green-400 border border-green-500/30 hover:bg-green-600/30" : "bg-white/10 hover:bg-white/20 text-white border border-white/10"}`}
                    >
                      {state==="running" ? "Running..." : state==="done" ? "Completed ✓" : `Run ${a.name}`}
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <p className="text-sm text-yellow-400 font-medium mb-1">API Keys Required</p>
              <p className="text-xs text-yellow-400/70">To activate real automation, add your Claude API key, ElevenLabs API key, and InVideo AI account to your Make.com pipeline. All buttons above will then trigger live workflows.</p>
            </div>
          </div>
        )}

        {tab === "analytics" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Analytics Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-sm font-medium text-white/60 mb-4">Projected Revenue (12 months)</h3>
                <div className="h-48 flex items-end gap-1.5">
                  {[0,0,0,0,100,300,800,1500,2500,4000,6000,9000].map((h,i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-sm opacity-70 hover:opacity-100 transition-all" style={{height: `${Math.max((h/9000)*100, 2)}%`}} />
                  ))}
                </div>
                <div className="flex justify-between mt-3 text-xs text-white/30">
                  <span>Apr</span><span>Jun</span><span>Aug</span><span>Oct</span><span>Dec</span><span>Feb</span>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-sm font-medium text-white/60 mb-4">Subscriber Growth Target</h3>
                <div className="h-48 flex items-end gap-1.5">
                  {[0,0,100,300,700,1200,2000,3500,6000,10000,18000,30000].map((h,i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-green-600 to-emerald-400 rounded-t-sm opacity-70 hover:opacity-100 transition-all" style={{height:`${Math.max((h/30000)*100, 2)}%`}} />
                  ))}
                </div>
                <div className="flex justify-between mt-3 text-xs text-white/30">
                  <span>Apr</span><span>Jun</span><span>Aug</span><span>Oct</span><span>Dec</span><span>Feb</span>
                </div>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-sm font-medium text-white/60 mb-4">Revenue Milestones</h3>
              <div className="space-y-3">
                {[
                  { label:"Month 3 — First affiliate conversion", target:"$50–$200", status:"upcoming" },
                  { label:"Month 6 — YouTube monetized (YPP)", target:"$300–$800/mo", status:"upcoming" },
                  { label:"Month 12 — First sponsorship", target:"$500–$2,500/video", status:"upcoming" },
                  { label:"Month 18 — Agency at scale", target:"$5,000–$15,000/mo", status:"upcoming" },
                ].map((m,i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                      <span className="text-white/30 text-sm w-6 font-mono">#{i+1}</span>
                      <span className="text-sm font-medium">{m.label}</span>
                    </div>
                    <span className="text-sm text-green-400 font-medium">{m.target}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== AGENTS TAB ===== */}
        {tab === "agents" && (
          <div className="space-y-6">
            {/* Sub-nav */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {(["chat","directory","departments","org"] as const).map(v => (
                  <button key={v} onClick={() => setAgentView(v)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${agentView === v ? "bg-white/10 text-white" : "text-white/50 hover:text-white/70"}`}>
                    {{ chat: "Command Center", directory: "By Tier", departments: "By Department", org: "Org Chart" }[v]}
                  </button>
                ))}
              </div>
              <span className="text-xs text-white/30">{agents.length} agents online</span>
            </div>

            {/* COMMAND CENTER — Single prompt → CEO delegates */}
            {agentView === "chat" && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Thread list */}
                <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  <div className="p-3 border-b border-white/10">
                    <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Threads</h3>
                  </div>
                  <div className="max-h-[500px] overflow-y-auto">
                    <button onClick={() => setActiveThread(null)} className={`w-full text-left px-3 py-3 border-b border-white/5 hover:bg-white/5 transition-all ${!activeThread ? "bg-white/10" : ""}`}>
                      <div className="flex items-center gap-2">
                        <Plus className="w-3 h-3 text-blue-400" />
                        <span className="text-sm text-blue-400 font-medium">New Task</span>
                      </div>
                    </button>
                    {threads.map(t => (
                      <button key={t.id} onClick={() => {
                        fetch(`${API_URL}/api/threads/${t.id}`).then(r => r.json()).then(setActiveThread).catch(() => {});
                      }} className={`w-full text-left px-3 py-3 border-b border-white/5 hover:bg-white/5 transition-all ${activeThread?.id === t.id ? "bg-white/10" : ""}`}>
                        <p className="text-sm text-white truncate">{t.subject}</p>
                        <p className="text-[10px] text-white/30 mt-0.5">{t.participants?.length || 0} agents</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main chat area */}
                <div className="lg:col-span-3 bg-white/5 border border-white/10 rounded-xl flex flex-col" style={{ minHeight: 520 }}>
                  {!activeThread ? (
                    /* New task prompt + recommended prompts + tools */
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                      {/* Header */}
                      <div className="text-center">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mx-auto mb-3">
                          <Bot className="w-7 h-7" />
                        </div>
                        <h3 className="text-lg font-semibold">Command Your Empire</h3>
                        <p className="text-xs text-white/40 mt-1">Send a task and the CEO delegates to the right team automatically</p>
                      </div>

                      {/* Prompt input */}
                      <div className="max-w-lg mx-auto">
                        <textarea
                          value={agentPrompt}
                          onChange={e => setAgentPrompt(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendToAgents(); } }}
                          placeholder="What do you need your team to do?"
                          rows={2}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 resize-none"
                        />
                        <button onClick={sendToAgents} disabled={agentSending || !agentPrompt.trim()} className="mt-2 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 px-4 py-2.5 rounded-lg text-sm font-medium transition-all">
                          <Send className="w-4 h-4" />{agentSending ? "Sending..." : "Send to CEO"}
                        </button>
                      </div>

                      {/* Recommended Prompts */}
                      <div>
                        <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Recommended Prompts</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {[
                            { cat: "Content", color: "blue", icon: "📝", prompts: [
                              "Create a content calendar for next week across all 3 channels",
                              "Write a script for a viral AI tools video targeting beginners",
                              "Analyze our top 5 performing videos and identify the winning formula",
                            ]},
                            { cat: "Growth", color: "green", icon: "📈", prompts: [
                              "Research trending topics in AI, finance, and psychology for this month",
                              "Develop a strategy to hit 10K subscribers on The AI Edge in 90 days",
                              "Audit our SEO across all channels and recommend improvements",
                            ]},
                            { cat: "Revenue", color: "amber", icon: "💰", prompts: [
                              "Identify the top 5 affiliate programs we should join for each channel",
                              "Create a digital product roadmap — courses, templates, community",
                              "Draft a sponsorship outreach pitch for AI tool companies",
                            ]},
                            { cat: "Operations", color: "purple", icon: "⚙️", prompts: [
                              "Review our production pipeline and find bottlenecks",
                              "Set up a QA checklist for all videos before publishing",
                              "Build a thumbnail A/B testing strategy for this quarter",
                            ]},
                            { cat: "Newsletter", color: "cyan", icon: "✉️", prompts: [
                              "Design a weekly newsletter strategy to convert YouTube viewers to email subscribers",
                              "Write this week's newsletter — top insights from our latest 3 videos",
                              "Create a 5-email welcome sequence for new newsletter subscribers",
                            ]},
                            { cat: "Web & Design", color: "pink", icon: "🎨", prompts: [
                              "Redesign the landing page to improve email signup conversion",
                              "Build a sales page for our upcoming AI productivity course",
                              "Audit the dashboard UI and suggest improvements",
                            ]},
                          ].map(group => (
                            <div key={group.cat} className="bg-white/[0.03] border border-white/5 rounded-lg p-3">
                              <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-2">{group.icon} {group.cat}</p>
                              <div className="space-y-1.5">
                                {group.prompts.map((p, i) => (
                                  <button key={i} onClick={() => setAgentPrompt(p)} className="w-full text-left text-xs text-white/60 hover:text-white hover:bg-white/5 px-2.5 py-1.5 rounded-md transition-all leading-relaxed">
                                    {p}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* AI Search Tools */}
                      <div>
                        <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">AI Research Tools</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { name: "Trend Scanner", desc: "Find trending topics across YouTube, Google, Reddit", icon: "🔍", prompt: "Research the top 10 trending topics across AI, finance, and psychology right now. Include search volume, competition level, and content angle for each." },
                            { name: "Competitor Spy", desc: "Analyze top competitor channels", icon: "🕵️", prompt: "Analyze our top 3 competitors for each channel. What topics are they covering? What's working? Where are the gaps we can exploit?" },
                            { name: "Title Generator", desc: "Generate CTR-optimized titles", icon: "✨", prompt: "Generate 10 high-CTR title options for each channel based on current trending topics. Score each title for curiosity, clarity, and SEO." },
                            { name: "Content Audit", desc: "Review all channels performance", icon: "📊", prompt: "Run a full content audit across all 3 channels. Analyze what's working, what's not, and provide specific recommendations for each channel." },
                            { name: "Newsletter Brief", desc: "Draft this week's newsletter", icon: "✉️", prompt: "Write a complete newsletter for this week. Include: top 3 insights from our latest videos, 1 exclusive tip not in the videos, a content teaser for next week, and a product recommendation with affiliate potential." },
                            { name: "Monetization Scan", desc: "Find new revenue opportunities", icon: "💎", prompt: "Scan all our channels and content for untapped monetization opportunities. Include affiliate programs, sponsorship fits, digital product ideas, and community offerings." },
                            { name: "Script Doctor", desc: "Improve a video script", icon: "🩺", prompt: "Review our latest video script. Check the hook strength, retention structure, storytelling arc, CTA effectiveness, and SEO integration. Provide a score and specific fixes." },
                            { name: "Growth Plan", desc: "Build a 90-day growth strategy", icon: "🚀", prompt: "Create a detailed 90-day growth plan for the entire empire. Include subscriber targets, content volume, collaboration opportunities, and key milestones for each channel." },
                          ].map(tool => (
                            <button key={tool.name} onClick={() => setAgentPrompt(tool.prompt)} className="bg-white/[0.03] border border-white/5 hover:border-white/20 rounded-lg p-3 text-left transition-all group">
                              <span className="text-lg">{tool.icon}</span>
                              <p className="text-xs font-semibold mt-1.5 group-hover:text-white transition-colors">{tool.name}</p>
                              <p className="text-[10px] text-white/30 mt-0.5 leading-relaxed">{tool.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Newsletter Quick Actions */}
                      <div className="bg-gradient-to-r from-cyan-500/5 to-blue-500/5 border border-cyan-500/20 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-base">✉️</span>
                            <h4 className="text-sm font-semibold">Newsletter Hub</h4>
                          </div>
                          <span className="text-[9px] text-cyan-400/60 px-2 py-0.5 rounded-full border border-cyan-500/20">Powered by Newsletter Strategist</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {[
                            { label: "Write Weekly Issue", prompt: "Write this week's newsletter issue. Pull the best insights from our recent videos, add an exclusive tip, tease upcoming content, and include one curated resource recommendation. Format it ready to send." },
                            { label: "Grow Subscriber List", prompt: "Create a plan to grow our email list by 1,000 subscribers in 30 days. Include lead magnet ideas for each channel, CTA scripts for videos, and a landing page strategy." },
                            { label: "Welcome Sequence", prompt: "Design a 5-email automated welcome sequence for new subscribers. Each email should deliver value, build trust, and gradually introduce our products and community." },
                          ].map(action => (
                            <button key={action.label} onClick={() => setAgentPrompt(action.prompt)} className="flex items-center gap-2 px-3 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-xs font-medium text-cyan-300 hover:text-cyan-200 transition-all">
                              <ChevronRight className="w-3 h-3 shrink-0" />{action.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Active thread */
                    <>
                      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold">{activeThread.subject}</h3>
                          <div className="flex gap-1 mt-1">
                            {activeThread.participants?.map(pid => {
                              const a = getAgentById(pid);
                              return a ? (
                                <span key={pid} className="inline-flex items-center gap-1 text-[10px] text-white/40 bg-white/5 px-1.5 py-0.5 rounded">
                                  <img src={getAgentAvatar(pid)} className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: a.avatar_color }} />
                                  {getHumanName(pid)?.split(" ")[0] || a.name.split(" ")[0]}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                        <button onClick={() => setActiveThread(null)} className="text-xs text-white/30 hover:text-white/60">Back</button>
                      </div>
                      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                        {activeThread.messages?.map(msg => {
                          const isUser = msg.sender_type === "user";
                          const agent = msg.sender_agent_id ? getAgentById(msg.sender_agent_id) : null;
                          return (
                            <div key={msg.id} className={`flex gap-3 ${isUser ? "justify-end" : ""}`}>
                              {!isUser && (
                                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-white/10" style={{ backgroundColor: agent?.avatar_color || "#6366f1" }}>
                                  <img src={getAgentAvatar(msg.sender_agent_id || "")} alt="" className="w-full h-full object-cover" />
                                </div>
                              )}
                              <div className={`max-w-[75%]`}>
                                {!isUser && (
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[11px] font-semibold text-white/60">{(msg.sender_agent_id && getHumanName(msg.sender_agent_id)) || agent?.name || msg.sender_name}</span>
                                    {agent && <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: agent.avatar_color + "20", color: agent.avatar_color }}>{agent.name}</span>}
                                  </div>
                                )}
                                <div className={`rounded-xl px-3 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${isUser ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white" : "bg-white/5 border border-white/10 text-white/80"}`}>
                                  {msg.content}
                                </div>
                              </div>
                              {isUser && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                                  <User className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                        <div ref={msgEndRef} />
                      </div>
                      <div className="px-4 py-3 border-t border-white/10">
                        <div className="flex gap-2">
                          <input type="text" value={agentPrompt} onChange={e => setAgentPrompt(e.target.value)} onKeyDown={e => { if (e.key === "Enter") sendReply(); }} placeholder="Reply..." className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50" />
                          <button onClick={sendReply} disabled={agentSending || !agentPrompt.trim()} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-lg text-sm font-medium transition-all">
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* AGENT DIRECTORY */}
            {agentView === "directory" && (
              <div className="space-y-8">
                {(["C-Suite","VP","Manager","Specialist","Support"] as Tier[]).map(tier => {
                  const tierAgents = agents.filter(a => getAgentTier(a.id) === tier);
                  if (tierAgents.length === 0) return null;
                  const ts = TIER_STYLES[tier];
                  return (
                    <div key={tier}>
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`text-xs font-bold uppercase tracking-wider ${ts.text}`}>{tier}</span>
                        <div className="flex-1 h-px bg-white/5" />
                        <span className="text-[10px] text-white/20">{tierAgents.length} agents</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {tierAgents.map(a => {
                          const tierStyle = TIER_STYLES[getAgentTier(a.id)];
                          const dept = DEPT_COLORS[a.department] || DEPT_COLORS.general;
                          return (
                            <div key={a.id} className={`${tierStyle.bg} border ${tierStyle.border} rounded-xl p-4 hover:brightness-125 transition-all`}>
                              <div className="flex items-center gap-3 mb-3">
                                <div className={`w-11 h-11 rounded-full overflow-hidden ring-2 ${tierStyle.ring} shrink-0`}>
                                  <img src={getAgentAvatar(a.id)} alt={a.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold truncate">{getHumanName(a.id) || a.name}</p>
                                  <p className="text-[10px] text-white/40 truncate">{a.name}</p>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1.5 mb-2.5">
                                <span className={`text-[9px] px-2 py-0.5 rounded-full border font-medium ${tierStyle.badge}`}>{tier}</span>
                                <span className="text-[9px] px-2 py-0.5 rounded-full border border-white/10 text-white/50 flex items-center gap-1">
                                  <span className={`w-1.5 h-1.5 rounded-full ${dept.dot}`} />{dept.label}
                                </span>
                              </div>
                              <p className="text-[10px] text-white/30 truncate">{a.role}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ORG CHART */}
            {/* DEPARTMENTS VIEW */}
            {agentView === "departments" && (
              <div className="space-y-6">
                {(["executive","content","operations","analytics","monetization","admin"] as const).map(deptKey => {
                  const dept = DEPT_COLORS[deptKey];
                  const deptAgents = agents.filter(a => a.department === deptKey);
                  if (deptAgents.length === 0) return null;
                  // Sort by tier within department
                  const tierOrder: Record<Tier, number> = { "C-Suite": 0, "VP": 1, "Manager": 2, "Specialist": 3, "Support": 4 };
                  const sorted = [...deptAgents].sort((a, b) => tierOrder[getAgentTier(a.id)] - tierOrder[getAgentTier(b.id)]);
                  // Find the department head (highest tier)
                  const head = sorted[0];
                  const rest = sorted.slice(1);

                  return (
                    <div key={deptKey} className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
                      {/* Department header */}
                      <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between" style={{ borderLeftWidth: 3, borderLeftColor: dept.dot.replace("bg-", "").includes("yellow") ? "#facc15" : dept.dot.replace("bg-", "").includes("blue") ? "#60a5fa" : dept.dot.replace("bg-", "").includes("amber") ? "#fbbf24" : dept.dot.replace("bg-", "").includes("emerald") ? "#34d399" : dept.dot.replace("bg-", "").includes("red") ? "#f87171" : "#94a3b8" }}>
                        <div className="flex items-center gap-3">
                          <span className={`w-2.5 h-2.5 rounded-full ${dept.dot}`} />
                          <h3 className="text-sm font-bold uppercase tracking-wider">{dept.label} Department</h3>
                        </div>
                        <span className="text-[10px] text-white/30">{deptAgents.length} members</span>
                      </div>

                      {/* Department head */}
                      <div className="px-5 py-3 border-b border-white/5 bg-white/[0.02]">
                        <p className="text-[9px] text-white/30 uppercase tracking-wider mb-2">Department Head</p>
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-full overflow-hidden ring-2 ${TIER_STYLES[getAgentTier(head.id)].ring}`}>
                            <img src={getAgentAvatar(head.id)} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{getHumanName(head.id) || head.name}</p>
                            <p className="text-[10px] text-white/40">{head.role}</p>
                            <div className="flex gap-1 mt-1">
                              <span className={`text-[8px] px-1.5 py-0 rounded-full border font-medium ${TIER_STYLES[getAgentTier(head.id)].badge}`}>{getAgentTier(head.id)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Team members */}
                      {rest.length > 0 && (
                        <div className="px-5 py-3">
                          <p className="text-[9px] text-white/30 uppercase tracking-wider mb-2">Team ({rest.length})</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {rest.map(a => {
                              const ts = TIER_STYLES[getAgentTier(a.id)];
                              return (
                                <div key={a.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all">
                                  <div className={`w-8 h-8 rounded-full overflow-hidden ring-2 ${ts.ring} shrink-0`}>
                                    <img src={getAgentAvatar(a.id)} alt="" className="w-full h-full object-cover" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium truncate">{getHumanName(a.id) || a.name}</p>
                                    <p className="text-[9px] text-white/30 truncate">{a.role}</p>
                                  </div>
                                  <span className={`text-[7px] px-1.5 py-0 rounded-full border font-medium shrink-0 ${ts.badge}`}>{getAgentTier(a.id)}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {agentView === "org" && (
              <div className="overflow-x-auto pb-8">
                <div className="min-w-[900px] space-y-10">
                  {agents.filter(a => !a.reports_to).map(root => {
                    const directReports = agents.filter(a => a.reports_to === root.id);
                    return (
                      <div key={root.id}>
                        {/* CEO at top center */}
                        <div className="flex justify-center mb-2">
                          <div style={{ width: 220 }}><BracketCard agent={root} /></div>
                        </div>
                        {/* Connector line down from CEO */}
                        {directReports.length > 0 && (
                          <div className="flex justify-center mb-2"><div className="w-px h-6 bg-white/15" /></div>
                        )}
                        {/* Horizontal rail connecting all VPs */}
                        {directReports.length > 1 && (
                          <div className="flex justify-center mb-0">
                            <div className="h-px bg-white/15" style={{ width: `${Math.min(directReports.length * 220, 900)}px` }} />
                          </div>
                        )}
                        {/* VP branches */}
                        <div className="flex justify-center gap-4 flex-wrap">
                          {directReports.map(vp => {
                            const vpReports = agents.filter(a => a.reports_to === vp.id);
                            return (
                              <div key={vp.id} className="flex flex-col items-center">
                                {/* Connector down to VP */}
                                <div className="w-px h-4 bg-white/15" />
                                <div style={{ width: 210 }}><BracketCard agent={vp} /></div>
                                {/* VP's reports */}
                                {vpReports.length > 0 && (
                                  <>
                                    <div className="w-px h-3 bg-white/15" />
                                    <div className="flex flex-col gap-1.5 items-center">
                                      {vpReports.map((rep, ri) => (
                                        <div key={rep.id} className="flex items-center gap-0">
                                          {/* Horizontal connector */}
                                          <div className="w-3 h-px bg-white/15" />
                                          <div style={{ width: 195 }}><BracketCard agent={rep} /></div>
                                        </div>
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Content">
        {editItem && (
          <div className="space-y-4">
            <div><label className="block text-sm text-white/60 mb-1.5">Title</label><input type="text" value={editItem.title} onChange={e => setEditItem({...editItem, title:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-white/30" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm text-white/60 mb-1.5">Channel</label><select value={editItem.channel} onChange={e => setEditItem({...editItem, channel:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none">{channels.map(c => <option key={c.id} value={c.name} className="bg-[#141414]">{c.name}</option>)}</select></div>
              <div><label className="block text-sm text-white/60 mb-1.5">Status</label><select value={editItem.status} onChange={e => setEditItem({...editItem, status:e.target.value as Status})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none">{STATUSES.map(s => <option key={s} value={s} className="bg-[#141414]">{s}</option>)}</select></div>
            </div>
            <div><label className="block text-sm text-white/60 mb-1.5">Target Date</label><input type="text" value={editItem.date} onChange={e => setEditItem({...editItem, date:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none" placeholder="e.g. Apr 15" /></div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSaveEdit} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2.5 rounded-lg text-sm font-medium"><Save className="w-4 h-4" />Save</button>
              <button onClick={() => setEditItem(null)} className="px-4 py-2.5 rounded-lg text-sm border border-white/10 hover:bg-white/5">Cancel</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={showNewModal} onClose={() => setShowNewModal(false)} title="Add New Video">
        <div className="space-y-4">
          <div><label className="block text-sm text-white/60 mb-1.5">Title</label><input type="text" value={newItem.title||""} onChange={e => setNewItem({...newItem, title:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none" placeholder="Enter video title..." /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm text-white/60 mb-1.5">Channel</label><select value={newItem.channel||""} onChange={e => setNewItem({...newItem, channel:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none">{channels.map(c => <option key={c.id} value={c.name} className="bg-[#141414]">{c.name}</option>)}</select></div>
            <div><label className="block text-sm text-white/60 mb-1.5">Status</label><select value={newItem.status||"RESEARCHED"} onChange={e => setNewItem({...newItem, status:e.target.value as Status})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none">{STATUSES.map(s => <option key={s} value={s} className="bg-[#141414]">{s}</option>)}</select></div>
          </div>
          <div><label className="block text-sm text-white/60 mb-1.5">Target Date</label><input type="text" value={newItem.date||""} onChange={e => setNewItem({...newItem, date:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none" placeholder="e.g. Apr 20" /></div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleAddNew} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2.5 rounded-lg text-sm font-medium"><Plus className="w-4 h-4" />Add Video</button>
            <button onClick={() => setShowNewModal(false)} className="px-4 py-2.5 rounded-lg text-sm border border-white/10 hover:bg-white/5">Cancel</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!skillModal} onClose={() => setSkillModal(null)} title={skillModal?.name||""}>
        {skillModal && (
          <div className="space-y-4">
            <p className="text-sm text-white/60">{skillModal.desc}</p>
            <div className="bg-black/40 rounded-lg p-4 font-mono text-xs text-green-400 space-y-1">
              <p># {skillModal.name}</p>
              <p className="text-white/40">## Purpose</p>
              <p className="text-white/60">{skillModal.desc}</p>
              <p className="text-white/40 mt-2">## Location</p>
              <p className="text-white/60">github.com/pvillarreal23/youtube-agency/{skillModal.file}</p>
            </div>
            <a href={`https://github.com/pvillarreal23/youtube-agency/blob/main/${skillModal.file}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-500 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
              <ExternalLink className="w-4 h-4" />Open Full File on GitHub
            </a>
          </div>
        )}
      </Modal>

      <footer className="border-t border-white/10 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between text-sm text-white/30">
          <span>Creator AI Dashboard v1.0.0</span>
          <span>YouTube Agency Command Center — 3 Channels</span>
        </div>
      </footer>
    </div>
  );
}
