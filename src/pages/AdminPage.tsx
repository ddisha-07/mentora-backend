import React, { useState } from 'react';
import { Shield, Users, Award, BookOpen, Clock, AlertTriangle, Play, FileText, Check, Activity, BarChart2, CheckCircle2, MessageSquare, Send } from 'lucide-react';
import { Card, EmptyState, SkeletonLoader } from '../components/reusable';
import { useApp } from '../../App';

export default function AdminPage() {
  const { setNotifsState } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'gaps' | 'training' | 'knowledge'>('overview');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Mock Data
  const stats = [
    { title: 'Total Employees', value: '3,240', change: '+4.2% MoM', icon: <Users size={16} className="text-blue-400" /> },
    { title: 'Active Learners', value: '2,890', change: '89.2% rate', icon: <Award size={16} className="text-emerald-400" /> },
    { title: 'Daily Active Users', value: '1,120', change: '+12% weekly', icon: <Activity size={16} className="text-purple-400" /> },
    { title: 'Avg Streak', value: '8.4 Days', change: 'EHS record', icon: <Clock size={16} className="text-amber-400" /> }
  ];

  // Knowledge Gaps List
  const [gaps, setGaps] = useState([
    {
      id: 'gap_1',
      topic: 'Blast Furnace Temperature Optimization',
      count: 127,
      description: 'Frequently asked by junior employees in the Maintenance and Manufacturing teams in Pune Plant.',
      recommended: 'Create Training Session',
      status: 'detected'
    },
    {
      id: 'gap_2',
      topic: 'Modbus Gateway Parity Configuration',
      count: 84,
      description: 'Recurring telemetry questions on PLC register mapping.',
      recommended: 'Publish SOP Reference Document',
      status: 'detected'
    },
    {
      id: 'gap_3',
      topic: 'LOTO Overrides Safety Isolation',
      count: 62,
      description: 'Urgent requests regarding bypass procedures for high-voltage isolation panels.',
      recommended: 'Request Retired Expert Contribution',
      status: 'detected'
    }
  ]);

  const handleAdminAction = (gapId: string, actionType: string, topic: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setGaps(prev => prev.map(g => g.id === gapId ? { ...g, status: 'resolved' } : g));
      
      const successText = `Admin Action Successful: Triggered "${actionType}" for "${topic}"!`;
      setSuccessMsg(successText);

      // Seed a notification to the notification center
      setNotifsState(prev => [
        {
          id: Date.now(),
          title: `🛠️ Admin Task Triggered`,
          message: `Admin scheduled "${actionType}" to resolve knowledge gap regarding "${topic}".`,
          timestamp: 'Just now',
          type: 'success',
          read: false
        },
        ...prev
      ]);

      setTimeout(() => setSuccessMsg(null), 4000);
    }, 8000); // Simulated delay to show skeleton loaders / loading states
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="text-primary" size={24} /> L&amp;D Admin Console
          </h2>
          <p className="text-muted-foreground text-sm">Monitor plant-wide training metrics, identify knowledge gaps, and request expert contributions.</p>
        </div>
      </div>

      {/* Action Success Toast */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3 text-xs text-emerald-400 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={18} className="flex-shrink-0" />
          <p className="font-bold">{successMsg}</p>
        </div>
      )}

      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((s, idx) => (
          <Card key={idx} className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium">{s.title}</span>
              <p className="text-2xl font-black text-foreground">{s.value}</p>
              <span className="text-[10px] text-emerald-400 font-bold block">{s.change}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center">
              {s.icon}
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-2 pb-px overflow-x-auto">
        {[
          { id: 'overview', label: 'L&D Overview' },
          { id: 'gaps', label: 'Knowledge Gap Detection' },
          { id: 'training', label: 'Training Analytics' },
          { id: 'knowledge', label: 'Knowledge Base Analytics' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap -mb-px ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {loading ? (
        <div className="space-y-6">
          <SkeletonLoader />
          <SkeletonLoader />
        </div>
      ) : activeTab === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left panel: Department Progress */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-5 space-y-5">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Department Learning Completion</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Average certification and course completions across Tata Steel plants.</p>
              </div>

              <div className="space-y-4">
                {[
                  { name: 'Manufacturing Operations', rate: 89, color: 'bg-blue-500' },
                  { name: 'Maintenance & Utility Services', rate: 82, color: 'bg-emerald-500' },
                  { name: 'Environment, Health & Safety (EHS)', rate: 94, color: 'bg-amber-500' },
                  { name: 'Quality Control Laboratory', rate: 88, color: 'bg-purple-500' },
                  { name: 'Supply Chain & Logistics', rate: 74, color: 'bg-cyan-500' }
                ].map((dept, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-foreground">
                      <span>{dept.name}</span>
                      <span>{dept.rate}%</span>
                    </div>
                    <div className="h-2 w-full bg-background rounded-full overflow-hidden border border-border">
                      <div className={`h-full ${dept.color}`} style={{ width: `${dept.rate}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* AI Chat Query Categories */}
            <Card className="p-5 space-y-5">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Kai AI Chat Assistant Query Distribution</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Common topics employees inquire about through conversational chats.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {[
                  { label: 'SOP Lookup', pct: 40, color: 'text-blue-400' },
                  { label: 'Safety Guidelines', pct: 30, color: 'text-amber-400' },
                  { label: 'Technical Operations', pct: 20, color: 'text-emerald-400' },
                  { label: 'Gamification & Rewards', pct: 10, color: 'text-purple-400' }
                ].map((item, i) => (
                  <div key={i} className="p-4 bg-background border border-border rounded-xl space-y-1">
                    <p className="text-lg font-black text-foreground">{item.pct}%</p>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">{item.label}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right panel: Top Contributors & Most Asked */}
          <div className="space-y-6">
            <Card className="p-5 space-y-5">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Top Knowledge Contributors</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Employees driving peer-to-peer answering rates.</p>
              </div>

              <div className="space-y-4">
                {[
                  { name: 'Arjun Mehta', role: 'Senior Employee (R&D)', xp: '3,240 XP', help: 42 },
                  { name: 'Devendra Prasad', role: 'Retired Expert Advisor', xp: 'Retired', help: 39 },
                  { name: 'Sarah Chen', role: 'Safety Executive', xp: '2,890 XP', help: 28 }
                ].map((cont, i) => (
                  <div key={i} className="flex items-center justify-between text-xs border-b border-border/40 pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-bold text-foreground">{cont.name}</p>
                      <span className="text-[10px] text-muted-foreground">{cont.role}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-primary font-bold">{cont.xp}</p>
                      <span className="text-[10px] text-muted-foreground">{cont.help} helpful answers</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5 space-y-5">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Most Searched Keywords</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Top search terms compiled from the global query indexes.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Lockout overrides', 'Turbine Cooldown', 'SOP-202 PDF', 'Credits Transfer', 'PLC alignment', 'Modbus parity'].map((tag, i) => (
                  <span key={i} className="bg-background border border-border text-muted-foreground text-[10px] font-bold px-2.5 py-1.5 rounded-lg">
                    {tag}
                  </span>
                ))}
              </div>
            </Card>
          </div>
        </div>
      ) : activeTab === 'gaps' ? (
        // Knowledge Gap Panel
        <div className="space-y-6">
          <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl flex items-start gap-4">
            <AlertTriangle className="text-amber-500 mt-0.5 flex-shrink-0" size={20} />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-500">Autonomous Knowledge Gap Detection</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Mentora's LLM processes unanswered questions, Kai chat inputs, and search mismatch records to identify where formal training resources are lacking.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {gaps.map(gap => (
              <Card key={gap.id} className="p-5 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 font-black px-2 py-0.5 rounded uppercase tracking-wider">
                        Gap Detected
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">{gap.count} employee queries</span>
                    </div>
                    <h4 className="text-sm font-black text-foreground">{gap.topic}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{gap.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {gap.status === 'resolved' ? (
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-xl flex items-center gap-1.5">
                        <Check size={14} /> Resolved
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleAdminAction(gap.id, 'Create Training Session', gap.topic)}
                          className="bg-primary hover:bg-primary/95 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95 flex items-center gap-1"
                        >
                          <Play size={12} fill="white" /> Create Training
                        </button>
                        <button
                          onClick={() => handleAdminAction(gap.id, 'Assign SOP Course', gap.topic)}
                          className="bg-card border border-border hover:bg-muted text-foreground text-xs font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95"
                        >
                          Assign Course
                        </button>
                        <button
                          onClick={() => handleAdminAction(gap.id, 'Publish SOP PDF', gap.topic)}
                          className="bg-card border border-border hover:bg-muted text-foreground text-xs font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95"
                        >
                          Publish SOP
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : activeTab === 'training' ? (
        // Training Analytics Panel
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-5 space-y-5">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Training Attendance Rate</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Average live attendance vs. recording plays.</p>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Present / Attendance Rate', value: '92%' },
                { label: 'Completion Rate', value: '88%' },
                { label: 'Post-Training Assessment Avg', value: '84%' },
                { label: 'Training Effectiveness Score', value: '91%' }
              ].map((stat, i) => (
                <div key={i} className="flex justify-between items-center text-xs border-b border-border/40 pb-3 last:border-0 last:pb-0">
                  <span className="text-muted-foreground font-medium">{stat.label}</span>
                  <span className="font-mono font-bold text-foreground">{stat.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 space-y-5">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Training Hours by Plant</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Monthly summary of learning hours across plant nodes.</p>
            </div>
            <div className="space-y-3.5">
              {[
                { plant: 'Pune Automation Node', hours: '420 hrs', pct: 90 },
                { plant: 'Jamshedpur Metallurgy Node', hours: '380 hrs', pct: 82 },
                { plant: 'Kalinganagar Blast Node', hours: '240 hrs', pct: 60 }
              ].map((item, i) => (
                <div key={i} className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold text-foreground">
                    <span>{item.plant}</span>
                    <span>{item.hours}</span>
                  </div>
                  <div className="h-1.5 w-full bg-background rounded-full overflow-hidden border border-border">
                    <div className="h-full bg-primary" style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : (
        // Knowledge Analytics Panel
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-5 space-y-5">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Knowledge Exchange Health</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Forum and question resolution counters.</p>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Total Questions Asked', value: '740' },
                { label: 'Overall Answer Rate', value: '96%' },
                { label: 'Average Response Time', value: '42 Minutes' },
                { label: 'Expert Verified Answers', value: '310' }
              ].map((stat, i) => (
                <div key={i} className="flex justify-between items-center text-xs border-b border-border/40 pb-3 last:border-0 last:pb-0">
                  <span className="text-muted-foreground font-medium">{stat.label}</span>
                  <span className="font-mono font-bold text-foreground">{stat.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 space-y-5">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Knowledge Legacy Summary</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Preservation contributions from senior and retired personnel.</p>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Active Retired Experts', value: '18 Advisors' },
                { label: 'Retired Employee Contributions', value: '182 Entries' },
                { label: 'Preserved Knowledge Archives', value: '114 Lessons' },
                { label: 'Community Helpful Hearts', value: '1,420 Votes' }
              ].map((stat, i) => (
                <div key={i} className="flex justify-between items-center text-xs border-b border-border/40 pb-3 last:border-0 last:pb-0">
                  <span className="text-muted-foreground font-medium">{stat.label}</span>
                  <span className="font-mono font-bold text-foreground">{stat.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 space-y-5 col-span-1 md:col-span-2">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Kai AI assistant conversation log</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Recent system prompts and queries processed by department.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border/50 text-muted-foreground uppercase font-black tracking-wider text-[10px]">
                    <th className="py-2.5">Query</th>
                    <th className="py-2.5">Department</th>
                    <th className="py-2.5">Category</th>
                    <th className="py-2.5">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {[
                    { query: 'How to bypass secondary coolant pump during override?', dept: 'Maintenance', cat: 'SOP Lookup', time: '5 mins ago' },
                    { query: 'Blast Furnace 3 temp sensor alarm guidelines', dept: 'Manufacturing', cat: 'Technical Operations', time: '14 mins ago' },
                    { query: 'Lockout tagout key management protocols', dept: 'Safety', cat: 'Safety Guidelines', time: '40 mins ago' },
                    { query: 'Verify weld quality tolerance limits on steel coils', dept: 'Quality Control', cat: 'Technical Operations', time: '1 hr ago' },
                    { query: 'Check current Jamshedpur warehouse inventory level', dept: 'Supply Chain', cat: 'SOP Lookup', time: '2 hrs ago' },
                    { query: 'Retired employee pension transfer verification process', dept: 'Human Resources', cat: 'Gamification & Rewards', time: '4 hrs ago' },
                    { query: 'L&D budget allocations for FY2026 course seedings', dept: 'Finance', cat: 'Technical Operations', time: '1 day ago' }
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 font-medium text-foreground">{row.query}</td>
                      <td className="py-2.5"><span className="px-2 py-0.5 rounded bg-background border border-border text-muted-foreground text-[10px] font-semibold">{row.dept}</span></td>
                      <td className="py-2.5 text-muted-foreground">{row.cat}</td>
                      <td className="py-2.5 font-mono text-muted-foreground">{row.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
