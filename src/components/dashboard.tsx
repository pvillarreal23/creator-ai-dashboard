"use client";
import { useState } from "react";
import { BarChart3, PlayCircle, Youtube, Users, Eye, ThumbsUp, ArrowUpRight, ArrowDownRight, Target, Layers, Settings, Bell, Search, Plus, LayoutDashboard, Mic, Image, Type, Upload, LineChart, BookOpen, X, Edit3, Trash2, Save, ChevronRight, FileText, Clock, Zap, CheckCircle2, AlertCircle, RefreshCw, ExternalLink } from "lucide-react";

type Tab = "overview" | "pipeline" | "channels" | "skills" | "automation" | "analytics";
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
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg hover:bg-white/5"><Bell className="w-5 h-5 text-white/60" /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" /></button>
            <button className="p-2 rounded-lg hover:bg-white/5"><Settings className="w-5 h-5 text-white/60" /></button>
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
