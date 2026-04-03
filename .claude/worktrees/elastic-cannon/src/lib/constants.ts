// Agent personas mapped by ID — supports both formats (with and without -agent suffix)
const _PERSONAS: Record<string, { humanName: string; gender: "male" | "female" }> = {
  "ceo-agent": { humanName: "Marcus Chen", gender: "male" },
  "content-vp": { humanName: "Sofia Rivera", gender: "female" },
  "operations-vp": { humanName: "James Okafor", gender: "male" },
  "analytics-vp": { humanName: "Priya Sharma", gender: "female" },
  "monetization-vp": { humanName: "Daniel Kim", gender: "male" },
  "ai-and-tech-channel-manager": { humanName: "Aisha Patel", gender: "female" },
  "finance-and-business-channel-manager": { humanName: "Ryan Mitchell", gender: "male" },
  "psychology-and-behavior-channel-manager": { humanName: "Elena Vasquez", gender: "female" },
  "scriptwriter": { humanName: "Noah Thompson", gender: "male" },
  "hook-specialist": { humanName: "Mia Jackson", gender: "female" },
  "storyteller": { humanName: "Liam O'Connor", gender: "male" },
  "shorts-and-clips-agent": { humanName: "Zara Ahmed", gender: "female" },
  "thumbnail-designer": { humanName: "Kai Nakamura", gender: "male" },
  "video-editor": { humanName: "Isabella Torres", gender: "female" },
  "seo-specialist": { humanName: "Ethan Park", gender: "male" },
  "voice-director": { humanName: "Carmen Reyes", gender: "female" },
  "project-manager": { humanName: "Olivia Bennett", gender: "female" },
  "workflow-orchestrator": { humanName: "Amir Hassan", gender: "male" },
  "quality-assurance-lead": { humanName: "Hannah Lee", gender: "female" },
  "reflection-council": { humanName: "Victor Andrei", gender: "male" },
  "automation-engineer": { humanName: "Alex Petrov", gender: "male" },
  "senior-researcher": { humanName: "Grace Nguyen", gender: "female" },
  "trend-researcher": { humanName: "Leo Martinez", gender: "male" },
  "data-analyst": { humanName: "Chloe Williams", gender: "female" },
  "partnership-manager": { humanName: "Omar Farouk", gender: "male" },
  "affiliate-coordinator": { humanName: "Natalie Brooks", gender: "female" },
  "digital-product-manager": { humanName: "Raj Kapoor", gender: "male" },
  "newsletter-strategist": { humanName: "Sarah Lindgren", gender: "female" },
  "community-manager": { humanName: "Tyler Robinson", gender: "male" },
  "social-media-manager": { humanName: "Jade Moreau", gender: "female" },
  "secretary-agent": { humanName: "Emma Fischer", gender: "female" },
  "compliance-officer": { humanName: "David Reeves", gender: "male" },
};

// Build lookup that supports both "content-vp" and "content-vp-agent" format
export const AGENT_PERSONAS: Record<string, { humanName: string; gender: "male" | "female" }> = {};
for (const [id, persona] of Object.entries(_PERSONAS)) {
  AGENT_PERSONAS[id] = persona;
  // Also register with -agent suffix if not already present
  if (!id.endsWith("-agent")) {
    AGENT_PERSONAS[`${id}-agent`] = persona;
  }
}

export function getAgentAvatar(agentId: string): string {
  return `/avatars/${agentId}.jpg`;
}

export function getHumanName(agentId: string): string {
  return AGENT_PERSONAS[agentId]?.humanName || "";
}

export type Tier = "C-Suite" | "VP" | "Manager" | "Specialist" | "Support";

export const TIER_STYLES: Record<Tier, { bg: string; border: string; text: string; badge: string; ring: string }> = {
  "C-Suite": { bg: "bg-yellow-500/5", border: "border-yellow-500/30", text: "text-yellow-400", badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", ring: "ring-yellow-500/60" },
  VP: { bg: "bg-purple-500/5", border: "border-purple-500/30", text: "text-purple-400", badge: "bg-purple-500/20 text-purple-300 border-purple-500/30", ring: "ring-purple-500/60" },
  Manager: { bg: "bg-blue-500/5", border: "border-blue-500/30", text: "text-blue-400", badge: "bg-blue-500/20 text-blue-300 border-blue-500/30", ring: "ring-blue-500/60" },
  Specialist: { bg: "bg-cyan-500/5", border: "border-cyan-500/30", text: "text-cyan-400", badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30", ring: "ring-cyan-500/60" },
  Support: { bg: "bg-emerald-500/5", border: "border-emerald-500/30", text: "text-emerald-400", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", ring: "ring-emerald-500/60" },
};

export function getAgentTier(agentId: string): Tier {
  if (agentId === "ceo-agent") return "C-Suite";
  if (agentId.includes("-vp")) return "VP";
  if (agentId.includes("channel-manager")) return "Manager";
  if (["project-manager", "project-manager-agent", "workflow-orchestrator", "workflow-orchestrator-agent", "secretary-agent"].includes(agentId)) return "Support";
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
