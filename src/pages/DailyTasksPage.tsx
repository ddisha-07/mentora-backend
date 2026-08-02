import React, { useState } from 'react';
import { CheckCircle2, Award, Zap, Flame, BookOpen, MessageSquare, Award as Trophy, RefreshCw, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PageHeader, Card } from '../components/reusable';

interface Task {
  id: number;
  title: string;
  desc: string;
  xp: number;
  current: number;
  target: number;
  completed: boolean;
  category: string;
  icon: React.ReactNode;
}

export default function DailyTasksPage({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: "Complete one Learning Bite",
      desc: "Go to your learning journey and finish a short 5-minute bite-sized lesson.",
      xp: 100,
      current: 0,
      target: 1,
      completed: false,
      category: "Learning",
      icon: <BookOpen size={16} className="text-[#FF2B8A]" />
    },
    {
      id: 2,
      title: "Ask Kai one question",
      desc: "Consult Kai AI Mentor on any engineering, tool, or concept query to verify operational context.",
      xp: 50,
      current: 0,
      target: 1,
      completed: false,
      category: "AI Chat",
      icon: <MessageSquare size={16} className="text-cyan-400" />
    },
    {
      id: 3,
      title: "Maintain your streak",
      desc: "Log in and engage with Mentora daily. You've reached a 12-day streak!",
      xp: 150,
      current: 12,
      target: 12,
      completed: true,
      category: "Streak",
      icon: <Flame size={16} className="text-orange-400" />
    },
    {
      id: 4,
      title: "Finish today's quiz",
      desc: "Complete the daily upskilling quiz on your track to lock in the knowledge criteria.",
      xp: 200,
      current: 0,
      target: 1,
      completed: false,
      category: "Quiz",
      icon: <Trophy size={16} className="text-purple-400" />
    }
  ]);

  const [floatingXps, setFloatingXps] = useState<{ id: number; x: number; y: number; amount: number }[]>([]);

  const handleToggle = (id: number, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextState = !t.completed;
        const nextCurrent = nextState ? t.target : 0;
        
        if (nextState) {
          // Trigger floating XP effect
          const floatId = Date.now() + Math.random();
          setFloatingXps(f => [...f, { id: floatId, x, y, amount: t.xp }]);
          setTimeout(() => {
            setFloatingXps(f => f.filter(item => item.id !== floatId));
          }, 1000);
        }

        return { ...t, completed: nextState, current: nextCurrent };
      }
      return t;
    }));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalXp = tasks.reduce((sum, t) => sum + (t.completed ? t.xp : 0), 0);
  const maxPossibleXp = tasks.reduce((sum, t) => sum + t.xp, 0);
  const completionPercentage = Math.round((completedCount / tasks.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 space-y-6 max-w-[1000px] mx-auto relative"
    >
      {/* Page Header */}
      <PageHeader
        title="Daily Tasks"
        description="Earn XP, maintain your streak, and level up by completing your daily upskilling targets."
        breadcrumbs={[{ label: "Mentora" }, { label: "Daily Tasks" }]}
      />

      {/* Progress Dashboard Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Completion Ring/Bar */}
        <Card className="p-5 flex items-center justify-between col-span-1 md:col-span-2 relative overflow-hidden group">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Today's Progress</span>
            <h3 className="text-2xl font-black text-foreground" style={{ fontFamily: "'Raleway', sans-serif" }}>
              {completedCount} of {tasks.length} Completed
            </h3>
            <p className="text-xs text-muted-foreground">
              {completedCount === tasks.length 
                ? "Perfect day! All tasks completed. Keep up the momentum!" 
                : "Complete all tasks to maximize your daily XP rewards."}
            </p>
            <div className="pt-2 w-72">
              <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-[#FF2B8A] to-[#7C3AED] rounded-full transition-all duration-500 shadow-[0_0_8px_#FF2B8A]"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
          <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-95" viewBox="0 0 36 36">
              <path
                className="text-white/5"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-primary transition-all duration-500"
                strokeDasharray={`${completionPercentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                style={{ stroke: 'var(--primary)', filter: 'drop-shadow(0 0 4px var(--primary))' }}
              />
            </svg>
            <span className="absolute text-xs font-mono font-black text-foreground">{completionPercentage}%</span>
          </div>
        </Card>

        {/* XP Gained Widget */}
        <Card className="p-5 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">XP Accumulated</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-foreground font-mono">{totalXp}</span>
              <span className="text-xs text-muted-foreground">/ {maxPossibleXp} XP</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-primary font-bold pt-2">
            <Zap size={14} fill="currentColor" /> Earn more XP to rank higher on the leaderboard!
          </div>
        </Card>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Today's Missions</h4>
        
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`premium-glass-card p-5 border flex items-center justify-between gap-4 transition-all duration-300 relative ${
              task.completed 
                ? "border-emerald-500/10 bg-emerald-500/[0.01] opacity-75" 
                : "border-white/5 hover:border-white/10 hover:bg-white/[0.01]"
            }`}
          >
            {/* Left Section: Checkbox & Info */}
            <div className="flex items-start gap-4 flex-1">
              <button
                onClick={(e) => handleToggle(task.id, e)}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 relative cursor-pointer mt-1 ${
                  task.completed
                    ? "bg-emerald-500 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    : "border-white/20 hover:border-white/40 bg-white/[0.02]"
                }`}
              >
                {task.completed && (
                  <motion.svg
                    className="w-3.5 h-3.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={4}
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <motion.path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    />
                  </motion.svg>
                )}
              </button>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    task.completed ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-muted-foreground"
                  }`}>
                    {task.category}
                  </span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    Progress: <span className="font-mono font-bold text-foreground">{task.current} / {task.target}</span>
                  </span>
                </div>
                <h4 className={`text-base font-extrabold text-foreground tracking-tight transition-all ${
                  task.completed ? "line-through text-muted-foreground/75" : ""
                }`} style={{ fontFamily: "'Raleway', sans-serif" }}>
                  {task.title}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{task.desc}</p>
              </div>
            </div>

            {/* Right Section: XP Reward */}
            <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary shadow-sm shadow-primary/5">
              <Zap size={12} fill="currentColor" />
              <span>+{task.xp} XP</span>
            </div>

            {/* Floating +XP Elements */}
            <AnimatePresence>
              {floatingXps.map(fxp => (
                <motion.div
                  key={fxp.id}
                  initial={{ opacity: 1, y: 0, scale: 0.8 }}
                  animate={{ opacity: 0, y: -60, scale: 1.2 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute pointer-events-none font-mono font-black text-[#FF2B8A] text-lg drop-shadow-[0_0_6px_#FF2B8A]"
                  style={{ left: fxp.x, top: fxp.y }}
                >
                  +{fxp.amount} XP!
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
