"use client";
import { useState } from "react";
import { BarChart3, PlayCircle, TrendingUp, Calendar, FileText, CheckCircle2, Clock, AlertCircle, Youtube, Users, Eye, ThumbsUp, ArrowUpRight, ArrowDownRight, Flame, Target, Layers, Settings, Bell, Search, ChevronDown, Plus, LayoutDashboard, Video, Mic, Image, Type, Upload, LineChart, BookOpen } from "lucide-react";

type Tab = "overview" | "pipeline" | "channels" | "analytics";
type Status = "RESEARCHED" | "TITLED" | "SCRIPTED" | "PRODUCTION" | "READY" | "SCHEDULED" | "LIVE";

const SC: Record<Status, string> = {
  RESEARCHED: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  TITLED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  SCRIPTED: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  PRODUCTION: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  READY: "bg-green-500/20 text-green-400 border-green-500/30",
  SCHEDULED: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  LIVE: "bg-red-500/20 text-red-400 border-red-500/30",
};

const CH = [
  { name: "AI & Tech Explainers", subs: "124K", views: "2.1M", freq: "3x/week", color: "from-blue-600 to-cyan-500", growth: "+12.3%", vids: "156", ctr: "8.2%" },
  { name: "AI Money & Careers", subs: "89K", views: "1.4M", freq: "2x/week", color: "from-green-600 to-emerald-500", growth: "+8.7%", vids: "98", ctr: "7.5%" },
  { name: "Future Tech Stories", subs: "67K", views: "890K", freq: "1x/week", color: "from-purple-600 to-pink-500", growth: "+15.2%", vids: "52", ctr: "9.1%" },
];

const PI = [
  { t: "GPT-5 Launch Analysis", ch: "AI & Tech Explainers", s: "LIVE" as Status, d: "Mar 25", v: "45.2K" },
  { t: "AI Jobs That Pay $200K+", ch: "AI Money & Careers", s: "SCHEDULED" as Status, d: "Mar 30", v: "-" },
  { t: "How to Build AI Agents", ch: "AI & Tech Explainers", s: "READY" as Status, d: "Apr 1", v: "-" },
  { t: "The AI Startup Playbook", ch: "AI Money & Careers", s: "PRODUCTION" as Status, d: "Apr 3", v: "-" },
  { t: "When Robots Dream", ch: "Future Tech Stories", s: "SCRIPTED" as Status, d: "Apr 5", v: "-" },
  { t: "Neuralink 2026 Update", ch: "Future Tech Stories", s: "TITLED" as Status, d: "Apr 8", v: "-" },
  { t: "Open Source vs Closed AI", ch: "AI & Tech Explainers", s: "RESEARCHED" as Status, d: "Apr 10", v: "-" },
  { t: "Prompt Engineering Salary Guide", ch: "AI Money & Careers", s: "RESEARCHED" as Status, d: "Apr 12", v: "-" },
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

const WS = [
  { label: "Total Views", value: "284.5K", change: "+18.2%", up: true, icon: Eye },
  { label: "New Subscribers", value: "3,847", change: "+22.1%", up: true, icon: Users },
  { label: "Watch Hours", value: "12,450", change: "+9.4%", up: true, icon: Clock },
  { label: "Engagement Rate", value: "6.8%", change: "-0.3%", up: false, icon: ThumbsUp },
];

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "pipeline", label: "Pipeline", icon: Layers },
    { id: "channels", label: "Channels", icon: Youtube },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center"><PlayCircle className="w-5 h-5" /></div>
            <span className="text-lg font-semibold">Creator AI</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" /><input type="text" placeholder="Search content..." className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm w-64 focus:outline-none focus:border-white/20" /></div>
            <button className="relative p-2 rounded-lg hover:bg-white/5"><Bell className="w-5 h-5 text-white/60" /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" /></button>
            <button className="p-2 rounded-lg hover:bg-white/5"><Settings className="w-5 h-5 text-white/60" /></button>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-6 py-6">
        <nav className="flex gap-1 mb-8 bg-white/5 rounded-xl p-1 w-fit">
          {tabs.map((t) => (<button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? "bg-white/10 text-white" : "text-white/50 hover:text-white/70"}`}><t.icon className="w-4 h-4" />{t.label}</button>))}
        </nav>
        {tab === "overview" && (<div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{WS.map((s) => (<div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all"><div className="flex items-center justify-between mb-3"><s.icon className="w-5 h-5 text-white/40" /><span className={`flex items-center gap-1 text-xs font-medium ${s.up ? "text-green-400" : "text-red-400"}`}>{s.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{s.change}</span></div><p className="text-2xl font-bold">{s.value}</p><p className="text-sm text-white/50 mt-1">{s.label}</p></div>))}</div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6"><h2 className="text-lg font-semibold flex items-center gap-2"><Layers className="w-5 h-5 text-blue-400" />Content Pipeline</h2><button onClick={() => setTab("pipeline")} className="text-sm text-blue-400 hover:text-blue-300">View All</button></div>
              <div className="space-y-3">{PI.slice(0, 5).map((item, i) => (<div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all"><div className="flex items-center gap-3"><div className={`w-2 h-2 rounded-full ${item.s === "LIVE" ? "bg-red-500 animate-pulse" : item.s === "SCHEDULED" ? "bg-orange-500" : "bg-white/30"}`} /><div><p className="text-sm font-medium">{item.t}</p><p className="text-xs text-white/40">{item.ch}</p></div></div><div className="flex items-center gap-3"><span className="text-xs text-white/40">{item.d}</span><span className={`text-xs px-2 py-1 rounded-full border ${SC[item.s]}`}>{item.s}</span></div></div>))}</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-6"><Target className="w-5 h-5 text-orange-400" />AI Skills</h2>
              <div className="space-y-3">{SK.map((skill) => (<div key={skill.n} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer"><div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><skill.icon className="w-4 h-4 text-white/60" /></div><div><p className="text-sm font-medium">{skill.n}</p><p className="text-xs text-white/40">{skill.d}</p></div></div>))}</div>
            </div>
          </div>
          <div><h2 className="text-lg font-semibold flex items-center gap-2 mb-4"><Youtube className="w-5 h-5 text-red-400" />Channels</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{CH.map((c) => (<div key={c.name} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all"><div className={`w-full h-2 rounded-full bg-gradient-to-r ${c.color} mb-4`} /><h3 className="font-semibold mb-3">{c.name}</h3><div className="grid grid-cols-2 gap-y-2 text-sm"><div><span className="text-white/40">Subs</span><p className="font-medium">{c.subs}</p></div><div><span className="text-white/40">Views</span><p className="font-medium">{c.views}</p></div><div><span className="text-white/40">Frequency</span><p className="font-medium">{c.freq}</p></div><div><span className="text-white/40">Growth</span><p className="font-medium text-green-400">{c.growth}</p></div></div></div>))}</div>
          </div>
        </div>)}
        {tab === "pipeline" && (<div className="space-y-6">
          <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Content Pipeline</h2><button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium"><Plus className="w-4 h-4" />New Content</button></div>
          <div className="flex gap-2 flex-wrap">{(Object.keys(SC) as Status[]).map((s) => (<span key={s} className={`text-xs px-3 py-1.5 rounded-full border cursor-pointer hover:opacity-80 ${SC[s]}`}>{s}</span>))}</div>
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/10 text-xs text-white/40 font-medium uppercase tracking-wider"><div className="col-span-5">Title</div><div className="col-span-3">Channel</div><div className="col-span-2">Status</div><div className="col-span-1">Date</div><div className="col-span-1">Views</div></div>
            {PI.map((item, i) => (<div key={i} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 hover:bg-white/5 transition-all items-center"><div className="col-span-5 flex items-center gap-3"><div className={`w-2 h-2 rounded-full ${item.s === "LIVE" ? "bg-red-500 animate-pulse" : "bg-white/20"}`} /><span className="text-sm font-medium">{item.t}</span></div><div className="col-span-3 text-sm text-white/60">{item.ch}</div><div className="col-span-2"><span className={`text-xs px-2 py-1 rounded-full border ${SC[item.s]}`}>{item.s}</span></div><div className="col-span-1 text-sm text-white/40">{item.d}</div><div className="col-span-1 text-sm text-white/40">{item.v}</div></div>))}
          </div>
        </div>)}
        {tab === "channels" && (<div className="space-y-6"><h2 className="text-xl font-bold">Channel Management</h2>
          <div className="grid grid-cols-1 gap-6">{CH.map((c) => (<div key={c.name} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all"><div className="flex items-center justify-between mb-6"><div className="flex items-center gap-4"><div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center`}><Youtube className="w-6 h-6" /></div><div><h3 className="text-lg font-semibold">{c.name}</h3><p className="text-sm text-white/40">Publishing {c.freq}</p></div></div><span className="text-green-400 text-sm font-medium flex items-center gap-1"><ArrowUpRight className="w-4 h-4" />{c.growth}</span></div><div className="grid grid-cols-4 gap-4"><div className="bg-white/5 rounded-lg p-4"><p className="text-xs text-white/40 mb-1">Subscribers</p><p className="text-xl font-bold">{c.subs}</p></div><div className="bg-white/5 rounded-lg p-4"><p className="text-xs text-white/40 mb-1">Total Views</p><p className="text-xl font-bold">{c.views}</p></div><div className="bg-white/5 rounded-lg p-4"><p className="text-xs text-white/40 mb-1">Videos</p><p className="text-xl font-bold">{c.vids}</p></div><div className="bg-white/5 rounded-lg p-4"><p className="text-xs text-white/40 mb-1">Avg CTR</p><p className="text-xl font-bold">{c.ctr}</p></div></div></div>))}</div>
        </div>)}
        {tab === "analytics" && (<div className="space-y-6"><h2 className="text-xl font-bold">Analytics Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6"><h3 className="text-sm font-medium text-white/60 mb-4">Views Over Time</h3><div className="h-48 flex items-end gap-2">{[40,55,35,65,80,60,90,75,95,70,85,100].map((h,i) => (<div key={i} className="flex-1 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-sm opacity-80 hover:opacity-100 transition-all" style={{height:`${h}%`}} />))}</div><div className="flex justify-between mt-2 text-xs text-white/30"><span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span></div></div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6"><h3 className="text-sm font-medium text-white/60 mb-4">Subscriber Growth</h3><div className="h-48 flex items-end gap-2">{[20,25,30,35,42,50,55,62,70,78,85,95].map((h,i) => (<div key={i} className="flex-1 bg-gradient-to-t from-green-600 to-emerald-400 rounded-t-sm opacity-80 hover:opacity-100 transition-all" style={{height:`${h}%`}} />))}</div><div className="flex justify-between mt-2 text-xs text-white/30"><span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span></div></div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6"><h3 className="text-sm font-medium text-white/60 mb-4">Top Performing Videos</h3><div className="space-y-3">{[{t:"GPT-5 Launch Analysis",v:"45.2K",c:"12.4%",r:"62%"},{t:"AI Side Hustles 2026",v:"38.7K",c:"10.8%",r:"58%"},{t:"The Singularity Timeline",v:"32.1K",c:"14.2%",r:"71%"},{t:"How I Automated My Business",v:"28.9K",c:"9.6%",r:"55%"}].map((x,i) => (<div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5"><div className="flex items-center gap-3"><span className="text-white/30 text-sm w-6">#{i+1}</span><span className="text-sm font-medium">{x.t}</span></div><div className="flex items-center gap-6 text-sm"><span className="text-white/40">{x.v} views</span><span className="text-white/40">{x.c} CTR</span><span className="text-white/40">{x.r} retention</span></div></div>))}</div></div>
        </div>)}
      </div>
      <footer className="border-t border-white/10 mt-12 py-6"><div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm text-white/30"><span>Creator AI Dashboard v0.1.0</span><span>YouTube Agency Command Center</span></div></footer>
    </div>
  );
}
