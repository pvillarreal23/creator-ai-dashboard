"use client";

import { useState } from "react";
import {
  BarChart3, PlayCircle, TrendingUp, Calendar, FileText, CheckCircle2,
  Clock, AlertCircle, Youtube, Users, Eye, ThumbsUp, ArrowUpRight,
  ArrowDownRight, Flame, Target, Layers, Settings, Bell, Search,
  ChevronDown, Plus, LayoutDashboard, Video, Mic, Image, Type, Upload,
  LineChart, BookOpen, X, Edit3, Trash2, Save, ChevronRight
} from "lucide-react";

type Tab = "overview" | "pipeline" | "channels" | "analytics";
type Status = "RESEARCHED" | "TITLED" | "SCRIPTED" | "PRODUCTION" | "READY" | "SCHEDULED" | "LIVE";

interface PipelineItem {
  id: string;
  title: string;
  channel: string;
  status: Status;
  date: string;
  views: string;
}

interface Channel {
  id: string;
  name: string;
  subs: string;
  views: string;
  freq: string;
  color: string;
  growth: string;
  vids: string;
  ctr: string;
}

const SC: Record<Status, string> = {
  RESEARCHED: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  TITLED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  SCRIPTED: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  PRODUCTION: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  READY: "bg-green-500/20 text-green-400 border-green-500/30",
  SCHEDULED: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  LIVE: "bg-red-500/20 text-red-400 border-red-500/30",
};

const STATUSES: Status[] = ["RESEARCHED", "TITLED", "SCRIPTED", "PRODUCTION", "READY", "SCHEDULED", "LIVE"];

const initialChannels: Channel[] = [
  { id: "1", name: "AI & Tech Explainers", subs: "124K", views: "2.1M", freq: "3x/week", color: "from-blue-600 to-cyan-500", growth: "+12.3%", vids: "156", ctr: "8.2%" },
  { id: "2", name: "AI Money & Careers", subs: "89K", views: "1.4M", freq: "2x/week", color: "from-green-600 to-emerald-500", growth: "+8.7%", vids: "98", ctr: "7.5%" },
  { id: "3", name: "Future Tech Stories", subs: "67K", views: "890K", freq: "1x/week", color: "from-purple-600 to-pink-500", growth: "+15.2%", vids: "52", ctr: "9.1%" },
];

const initialPipeline: PipelineItem[] = [
  { id: "1", title: "GPT-5 Launch Analysis", channel: "AI & Tech Explainers", status: "LIVE", date: "Mar 25", views: "45.2K" },
  { id: "2", title: "AI Jobs That Pay $200K+", channel: "AI Money & Careers", status: "SCHEDULED", date: "Mar 30", views: "-" },
  { id: "3", title: "How to Build AI Agents", channel: "AI & Tech Explainers", status: "READY", date: "Apr 1", views: "-" },
  { id: "4", title: "The AI Startup Playbook", channel: "AI Money & Careers", status: "PRODUCTION", date: "Apr 3", views: "-" },
  { id: "5", title: "When Robots Dream", channel: "Future Tech Stories", status: "SCRIPTED", date: "Apr 5", views: "-" },
  { id: "6", title: "Neuralink 2026 Update", channel: "Future Tech Stories", status: "TITLED", date: "Apr 8", views: "-" },
  { id: "7", title: "Open Source vs Closed AI", channel: "AI & Tech Explainers", status: "RESEARCHED", date: "Apr 10", views: "-" },
  { id: "8", title: "Prompt Engineering Salary Guide", channel: "AI Money & Careers", status: "RESEARCHED", date: "Apr 12", views: "-" },
];

const SK = [
  { n: "Research", icon: BookOpen, d: "Deep-dive topic analysis" },
  { n: "Script Writer", icon: FileText, d: "Engaging video scripts" },
  { n: "Title Optimizer", icon: Type, d: "CTR-optimized titles" },
  { n: "Thumbnail Designer", icon: Image, d: "Visual hook creation" },
  { n: "Voiceover Director", icon: Mic, d: "Voice style & pacing" },
  { n: "Description Writer", icon: FileText, d: "SEO descriptions" },
  { n: "Upload Scheduler", icon: Upload, d: "Optimal timing" },
  { n: "Analytics Reviewer", icon: LineChart, d: "Performance insights" },
];

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#141414] border border-white/10 rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors"><X className="w-5 h-5 text-white/60" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function StatCard({ label, value, change, up, icon: Icon }: { label: string; value: string; change: string; up: boolean; icon: any }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all group">
      <div className="flex items-center justify-between mb-3">
        <Icon className="w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
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
  const [newItem, setNewItem] = useState<Partial<PipelineItem>>({ title: "", channel: initialChannels[0].name, status: "RESEARCHED", date: "", views: "-" });

  const handleSaveEdit = () => { if (!editItem) return; setPipeline(prev => prev.map(p => p.id === editItem.id ? editItem : p)); setEditItem(null); };
  const handleDelete = (id: string) => { setPipeline(prev => prev.filter(p => p.id !== id)); };
  const handleAddNew = () => { if (!newItem.title) return; const item: PipelineItem = { id: Date.now().toString(), title: newItem.title || "", channel: newItem.channel || initialChannels[0].name, status: (newItem.status as Status) || "RESEARCHED", date: newItem.date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }), views: "-" }; setPipeline(prev => [item, ...prev]); setNewItem({ title: "", channel: initialChannels[0].name, status: "RESEARCHED", date: "", views: "-" }); setShowNewModal(false); };
  const handleStatusChange = (id: string, newStatus: Status) => { setPipeline(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p)); };
  const filteredPipeline = filterStatus === "ALL" ? pipeline : pipeline.filter(p => p.status === filterStatus);
  const stats = [{ label: "Total Views", value: "284.5K", change: "+18.2%", up: true, icon: Eye },{ label: "New Subscribers", value: "3,847", change: "+22.1%", up: true, icon: Users },{ label: "Watch Hours", value: "12,450", change: "+9.4%", up: true, icon: Clock },{ label: "Engagement Rate", value: "6.8%", change: "-0.3%", up: false, icon: ThumbsUp }];
  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [{ id: "overview", label: "Overview", icon: LayoutDashboard },{ id: "pipeline", label: "Pipeline", icon: Layers },{ id: "channels", label: "Channels", icon: Youtube },{ id: "analytics", label: "Analytics", icon: BarChart3 }];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center"><PlayCircle className="w-5 h-5" /></div><span className="text-lg font-semibold">Creator AI</span><span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60 hidden sm:inline">Dashboard</span></div>
          <div className="flex items-center gap-2 sm:gap-4"><div className="relative hidden sm:block"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" /><input type="text" placeholder="Search content..." className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm w-48 lg:w-64 focus:outline-none focus:border-white/30 transition-colors" /></div><button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"><Bell className="w-5 h-5 text-white/60" /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" /></button><button className="p-2 rounded-lg hover:bg-white/5 transition-colors"><Settings className="w-5 h-5 text-white/60" /></button></div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <nav className="flex gap-1 mb-8 bg-white/5 rounded-xl p-1 w-fit overflow-x-auto">{tabs.map((t) => (<button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${tab === t.id ? "bg-white/10 text-white shadow-sm" : "text-white/50 hover:text-white/70 hover:bg-white/5"}`}><t.icon className="w-4 h-4" />{t.label}</button>))}</nav>
        {tab === "overview" && (<div className="space-y-8"><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{stats.map((s) => <StatCard key={s.label} {...s} />)}</div><div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl p-6"><div className="flex items-center justify-between mb-6"><h2 className="text-lg font-semibold flex items-center gap-2"><Layers className="w-5 h-5 text-blue-400" />Content Pipeline</h2><button onClick={() => setTab("pipeline")} className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">View All <ChevronRight className="w-4 h-4" /></button></div><div className="space-y-2">{pipeline.slice(0, 5).map((item) => (<div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer" onClick={() => setEditItem(item)}><div className="flex items-center gap-3"><div className={`w-2 h-2 rounded-full ${item.status === "LIVE" ? "bg-red-500 animate-pulse" : item.status === "SCHEDULED" ? "bg-orange-500" : "bg-white/30"}`} /><div><p className="text-sm font-medium">{item.title}</p><p className="text-xs text-white/40">{item.channel}</p></div></div><div className="flex items-center gap-3"><span className="text-xs text-white/40 hidden sm:inline">{item.date}</span><span className={`text-xs px-2 py-1 rounded-full border ${SC[item.status]}`}>{item.status}</span></div></div>))}</div></div><div className="bg-white/5 border border-white/10 rounded-xl p-6"><h2 className="text-lg font-semibold flex items-center gap-2 mb-6"><Target className="w-5 h-5 text-orange-400" />AI Skills</h2><div className="space-y-2">{SK.map((skill) => (<div key={skill.n} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer group"><div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors"><skill.icon className="w-4 h-4 text-white/60" /></div><div><p className="text-sm font-medium">{skill.n}</p><p className="text-xs text-white/40">{skill.d}</p></div></div>))}</div></div></div><div><h2 className="text-lg font-semibold flex items-center gap-2 mb-4"><Youtube className="w-5 h-5 text-red-400" />Channels</h2><div className="grid grid-cols-1 md:grid-cols-3 gap-4">{channels.map((c) => (<div key={c.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all"><div className={`w-full h-1.5 rounded-full bg-gradient-to-r ${c.color} mb-4`} /><h3 className="font-semibold mb-3">{c.name}</h3><div className="grid grid-cols-2 gap-y-2 text-sm"><div><span className="text-white/40">Subs</span><p className="font-medium">{c.subs}</p></div><div><span className="text-white/40">Views</span><p className="font-medium">{c.views}</p></div><div><span className="text-white/40">Frequency</span><p className="font-medium">{c.freq}</p></div><div><span className="text-white/40">Growth</span><p className="font-medium text-green-400">{c.growth}</p></div></div></div>))}</div></div></div>)}
        {tab === "pipeline" && (<div className="space-y-6"><div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"><h2 className="text-xl font-bold">Content Pipeline</h2><button onClick={() => setShowNewModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"><Plus className="w-4 h-4" />New Content</button></div><div className="flex gap-2 flex-wrap"><button onClick={() => setFilterStatus("ALL")} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filterStatus === "ALL" ? "bg-white/20 text-white border-white/30" : "border-white/10 text-white/50 hover:text-white/70"}`}>ALL</button>{STATUSES.map((s) => (<button key={s} onClick={() => setFilterStatus(s)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${filterStatus === s ? SC[s] : "border-white/10 text-white/40 hover:text-white/60"}`}>{s}</button>))}</div><div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"><div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/10 text-xs text-white/40 font-medium uppercase tracking-wider"><div className="col-span-4">Title</div><div className="col-span-2">Channel</div><div className="col-span-2">Status</div><div className="col-span-1">Date</div><div className="col-span-1">Views</div><div className="col-span-2 text-right">Actions</div></div>{filteredPipeline.length === 0 && (<div className="px-6 py-12 text-center text-white/30">No content items match this filter.</div>)}{filteredPipeline.map((item) => (<div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-4 sm:px-6 py-4 border-b border-white/5 hover:bg-white/5 transition-all items-center"><div className="sm:col-span-4 flex items-center gap-3"><div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.status === "LIVE" ? "bg-red-500 animate-pulse" : "bg-white/20"}`} /><span className="text-sm font-medium">{item.title}</span></div><div className="sm:col-span-2 text-sm text-white/60 pl-5 sm:pl-0">{item.channel}</div><div className="sm:col-span-2 pl-5 sm:pl-0"><select value={item.status} onChange={(e) => handleStatusChange(item.id, e.target.value as Status)} className="text-xs px-2 py-1 rounded-full border bg-transparent cursor-pointer focus:outline-none">{STATUSES.map(s => <option key={s} value={s} className="bg-[#141414]">{s}</option>)}</select></div><div className="sm:col-span-1 text-sm text-white/40 pl-5 sm:pl-0">{item.date}</div><div className="sm:col-span-1 text-sm text-white/40 pl-5 sm:pl-0">{item.views}</div><div className="sm:col-span-2 flex items-center gap-2 justify-end pl-5 sm:pl-0"><button onClick={() => setEditItem(item)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="Edit"><Edit3 className="w-4 h-4 text-white/50 hover:text-blue-400" /></button><button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" title="Delete"><Trash2 className="w-4 h-4 text-white/50 hover:text-red-400" /></button></div></div>))}</div></div>)}
        {tab === "channels" && (<div className="space-y-6"><h2 className="text-xl font-bold">Channel Management</h2><div className="grid grid-cols-1 gap-6">{channels.map((c) => (<div key={c.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all"><div className="flex items-center justify-between mb-6"><div className="flex items-center gap-4"><div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center`}><Youtube className="w-6 h-6" /></div><div><h3 className="text-lg font-semibold">{c.name}</h3><p className="text-sm text-white/40">Publishing {c.freq}</p></div></div><span className="text-green-400 text-sm font-medium flex items-center gap-1"><ArrowUpRight className="w-4 h-4" />{c.growth}</span></div><div className="grid grid-cols-2 sm:grid-cols-4 gap-4"><div className="bg-white/5 rounded-lg p-4"><p className="text-xs text-white/40 mb-1">Subscribers</p><p className="text-xl font-bold">{c.subs}</p></div><div className="bg-white/5 rounded-lg p-4"><p className="text-xs text-white/40 mb-1">Total Views</p><p className="text-xl font-bold">{c.views}</p></div><div className="bg-white/5 rounded-lg p-4"><p className="text-xs text-white/40 mb-1">Videos</p><p className="text-xl font-bold">{c.vids}</p></div><div className="bg-white/5 rounded-lg p-4"><p className="text-xs text-white/40 mb-1">Avg CTR</p><p className="text-xl font-bold">{c.ctr}</p></div></div></div>))}</div></div>)}
        {tab === "analytics" && (<div className="space-y-6"><h2 className="text-xl font-bold">Analytics Overview</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-white/5 border border-white/10 rounded-xl p-6"><h3 className="text-sm font-medium text-white/60 mb-4">Views Over Time</h3><div className="h-48 flex items-end gap-1.5">{[40,55,35,65,80,60,90,75,95,70,85,100].map((h,i) => (<div key={i} className="flex-1 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-sm opacity-70 hover:opacity-100 transition-all cursor-pointer" style={{height:h+"%"}} />))}</div><div className="flex justify-between mt-3 text-xs text-white/30"><span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span></div></div><div className="bg-white/5 border border-white/10 rounded-xl p-6"><h3 className="text-sm font-medium text-white/60 mb-4">Subscriber Growth</h3><div className="h-48 flex items-end gap-1.5">{[20,25,30,35,42,50,55,62,70,78,85,95].map((h,i) => (<div key={i} className="flex-1 bg-gradient-to-t from-green-600 to-emerald-400 rounded-t-sm opacity-70 hover:opacity-100 transition-all cursor-pointer" style={{height:h+"%"}} />))}</div><div className="flex justify-between mt-3 text-xs text-white/30"><span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span></div></div></div><div className="bg-white/5 border border-white/10 rounded-xl p-6"><h3 className="text-sm font-medium text-white/60 mb-4">Top Performing Videos</h3><div className="space-y-2">{[{t:"GPT-5 Launch Analysis",v:"45.2K",c:"12.4%",r:"62%"},{t:"AI Side Hustles 2026",v:"38.7K",c:"10.8%",r:"58%"},{t:"The Singularity Timeline",v:"32.1K",c:"14.2%",r:"71%"},{t:"How I Automated My Business",v:"28.9K",c:"9.6%",r:"55%"}].map((x,i) => (<div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all"><div className="flex items-center gap-3"><span className="text-white/30 text-sm w-6 font-mono">#{i+1}</span><span className="text-sm font-medium">{x.t}</span></div><div className="flex items-center gap-4 sm:gap-6 text-sm"><span className="text-white/40">{x.v} views</span><span className="text-white/40 hidden sm:inline">{x.c} CTR</span><span className="text-white/40 hidden sm:inline">{x.r} ret.</span></div></div>))}</div></div></div>)}
      </div>
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Content">{editItem && (<div className="space-y-4"><div><label className="block text-sm text-white/60 mb-1.5">Title</label><input type="text" value={editItem.title} onChange={(e) => setEditItem({ ...editItem, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-white/30 transition-colors" /></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm text-white/60 mb-1.5">Channel</label><select value={editItem.channel} onChange={(e) => setEditItem({ ...editItem, channel: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-white/30 transition-colors">{channels.map(c => <option key={c.id} value={c.name} className="bg-[#141414]">{c.name}</option>)}</select></div><div><label className="block text-sm text-white/60 mb-1.5">Status</label><select value={editItem.status} onChange={(e) => setEditItem({ ...editItem, status: e.target.value as Status })} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-white/30 transition-colors">{STATUSES.map(s => <option key={s} value={s} className="bg-[#141414]">{s}</option>)}</select></div></div><div><label className="block text-sm text-white/60 mb-1.5">Target Date</label><input type="text" value={editItem.date} onChange={(e) => setEditItem({ ...editItem, date: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-white/30 transition-colors" placeholder="e.g. Apr 15" /></div><div className="flex gap-3 pt-2"><button onClick={handleSaveEdit} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"><Save className="w-4 h-4" />Save Changes</button><button onClick={() => setEditItem(null)} className="px-4 py-2.5 rounded-lg text-sm font-medium border border-white/10 hover:bg-white/5 transition-colors">Cancel</button></div></div>)}</Modal>
      <Modal open={showNewModal} onClose={() => setShowNewModal(false)} title="Add New Content"><div className="space-y-4"><div><label className="block text-sm text-white/60 mb-1.5">Title</label><input type="text" value={newItem.title || ""} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-white/30 transition-colors" placeholder="Enter video title..." /></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm text-white/60 mb-1.5">Channel</label><select value={newItem.channel || ""} onChange={(e) => setNewItem({ ...newItem, channel: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-white/30 transition-colors">{channels.map(c => <option key={c.id} value={c.name} className="bg-[#141414]">{c.name}</option>)}</select></div><div><label className="block text-sm text-white/60 mb-1.5">Status</label><select value={newItem.status || "RESEARCHED"} onChange={(e) => setNewItem({ ...newItem, status: e.target.value as Status })} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-white/30 transition-colors">{STATUSES.map(s => <option key={s} value={s} className="bg-[#141414]">{s}</option>)}</select></div></div><div><label className="block text-sm text-white/60 mb-1.5">Target Date</label><input type="text" value={newItem.date || ""} onChange={(e) => setNewItem({ ...newItem, date: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-white/30 transition-colors" placeholder="e.g. Apr 20" /></div><div className="flex gap-3 pt-2"><button onClick={handleAddNew} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"><Plus className="w-4 h-4" />Add Content</button><button onClick={() => setShowNewModal(false)} className="px-4 py-2.5 rounded-lg text-sm font-medium border border-white/10 hover:bg-white/5 transition-colors">Cancel</button></div></div></Modal>
      <footer className="border-t border-white/10 mt-12 py-6"><div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between text-sm text-white/30"><span>Creator AI Dashboard v0.2.0</span><span>YouTube Agency Command Center</span></div></footer>
    </div>
  );
}
