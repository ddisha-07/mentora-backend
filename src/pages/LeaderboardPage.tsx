import React, { useState, useEffect } from 'react';
import { Trophy, Award, Zap, Flame, Shield, MapPin, Briefcase, BookOpen, Star, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../App';
import { Card, StreakIndicator, EmptyState, SkeletonLoader, PageHeader } from '../components/reusable';
import { supabase } from '../lib/supabaseClient';

interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  role: string;
  department: string;
  xp: number;
  knowledgeCredits: number;
  streak: number;
  plant: string;
}

export default function LeaderboardPage() {
  const { profile } = useApp();
  const activeProfile = profile || {
    id: "",
    name: "Learner",
    role: "JUNIOR_EMPLOYEE",
    department: "Software Engineering",
    xp: 1240,
    knowledgeCredits: 150,
    plant: "Pune Plant"
  };

  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<'weekly' | 'department' | 'plant' | 'learner' | 'contributor'>('weekly');
  
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchErr } = await supabase
          .from("profiles")
          .select("*")
          .order("xp", { ascending: false });

        if (fetchErr) throw fetchErr;

        if (data) {
          setUsersList(data);
        }
      } catch (err: any) {
        console.error("Error loading leaderboard:", err);
        setError(err.message || "Failed to load leaderboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const contributorChamp = [...usersList].sort((a, b) => (b.knowledge_credits || 0) - (a.knowledge_credits || 0))[0] || {
    full_name: 'Devendra Prasad',
    role: 'Retired Expert Advisor',
    department: 'Maintenance & Boilers',
    plant: 'Jamshedpur',
    knowledge_credits: 1250
  };

  const champKc = contributorChamp.knowledge_credits || 0;

  const getSortedData = (): LeaderboardUser[] => {
    let list = usersList.map((u: any) => ({
      id: u.id,
      rank: 0,
      name: u.full_name || "Unknown Associate",
      avatar: u.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop&auto=format",
      role: u.role || "Junior Employee",
      department: u.department || "",
      xp: u.xp || 0,
      knowledgeCredits: u.knowledge_credits || 0,
      streak: u.current_streak || 0,
      plant: u.plant || ""
    }));

    if (activeLeaderboardTab === 'department') {
      const activeDept = activeProfile.department || "";
      list = list.filter(u => (u.department && activeDept && u.department.toLowerCase() === activeDept.toLowerCase()) || u.id === activeProfile.id);
    } else if (activeLeaderboardTab === 'plant') {
      const activePlant = activeProfile.plant || "Pune Plant";
      list = list.filter(u => (u.plant && activePlant && u.plant.toLowerCase() === activePlant.toLowerCase()) || u.id === activeProfile.id);
    } else if (activeLeaderboardTab === 'learner') {
      list.sort((a, b) => b.xp - a.xp);
    } else if (activeLeaderboardTab === 'contributor') {
      list.sort((a, b) => b.knowledgeCredits - a.knowledgeCredits);
    }

    return list.map((user, idx) => ({
      ...user,
      rank: idx + 1
    }));
  };

  const sortedLeaderboard = getSortedData();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 26 } }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      {/* Page Header */}
      <PageHeader
        title="Gamified Leaderboards"
        description="Review plant milestones, verify operational achievements, and participate in friendly peer competition."
        breadcrumbs={[{ label: "Mentora" }, { label: "Leaderboard" }]}
      />

      {/* Recognition Widget: Knowledge Champion of the Week */}
      <div className="premium-glass-card p-6 relative overflow-hidden flex flex-col lg:flex-row justify-between items-center gap-6 border border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-transparent">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-400 relative border border-yellow-500/25 flex-shrink-0">
            <Award size={32} />
            <span className="absolute -bottom-1 -right-1 bg-yellow-500 text-black text-[9px] px-1.5 py-0.5 rounded-md font-extrabold shadow-md">#1</span>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-bold uppercase text-yellow-500 tracking-wider flex items-center gap-1">
              🏆 Weekly Knowledge Champion
            </span>
            <h3 className="text-lg font-extrabold text-foreground leading-tight" style={{ fontFamily: "'Raleway', sans-serif" }}>
              {contributorChamp.full_name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {contributorChamp.role} &bull; {contributorChamp.department} ({contributorChamp.plant || "Jamshedpur"})
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 md:gap-8 text-center text-xs bg-secondary/15 p-4 rounded-2xl border border-border/10">
          <div>
            <span className="text-muted-foreground block text-[9px] uppercase tracking-wider">Answered</span>
            <strong className="text-foreground text-sm">{Math.floor(champKc * 0.8) || 12}</strong>
          </div>
          <div>
            <span className="text-muted-foreground block text-[9px] uppercase tracking-wider">Verified</span>
            <strong className="text-emerald-400 text-sm">{Math.floor(champKc * 0.6) || 8}</strong>
          </div>
          <div>
            <span className="text-muted-foreground block text-[9px] uppercase tracking-wider">Helped</span>
            <strong className="text-primary text-sm">{Math.floor(champKc * 2.5) || 45}</strong>
          </div>
          <div>
            <span className="text-muted-foreground block text-[9px] uppercase tracking-wider">Total KC</span>
            <strong className="text-yellow-400 text-sm">{champKc}</strong>
          </div>
        </div>
      </div>

      {/* Tabs selectors */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full border-b border-border/15">
        {[
          { id: 'weekly', label: 'Weekly Standings', icon: <Flame size={13} /> },
          { id: 'department', label: 'Department Rank', icon: <Briefcase size={13} /> },
          { id: 'plant', label: 'Plant Rank (Pune)', icon: <MapPin size={13} /> },
          { id: 'learner', label: 'Learner (XP)', icon: <Zap size={13} /> },
          { id: 'contributor', label: 'Knowledge Leader (KC)', icon: <Award size={13} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveLeaderboardTab(tab.id as any)}
            className={`px-4 py-3 text-xs font-bold transition-all border-b-2 -mb-px flex items-center gap-1.5 whitespace-nowrap ${
              activeLeaderboardTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="premium-glass-card overflow-hidden border border-border/10">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 space-y-4">
              <SkeletonLoader />
              <SkeletonLoader />
              <SkeletonLoader />
            </div>
          ) : error ? (
            <div className="p-8 text-center text-rose-400">
              <p className="font-bold">Failed to load leaderboard data</p>
              <p className="text-xs opacity-80 mt-1">{error}</p>
            </div>
          ) : sortedLeaderboard.length > 0 ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/10 text-muted-foreground uppercase font-bold tracking-wider bg-secondary/15">
                  <th className="py-4 px-6 text-center w-20">Rank</th>
                  <th className="py-4 px-6">Associate</th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6 text-center">XP Level</th>
                  <th className="py-4 px-6 text-center">Knowledge Credits</th>
                  <th className="py-4 px-6 text-center">Streak Status</th>
                </tr>
              </thead>
              <motion.tbody
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {sortedLeaderboard.map(user => {
                  const isSelf = user.id === activeProfile.id || user.name === activeProfile.name;

                  return (
                    <motion.tr
                      key={user.id}
                      variants={rowVariants}
                      className={`border-b border-border/5 hover:bg-secondary/10 transition-colors ${
                        isSelf ? 'bg-primary/5 border-l-4 border-l-primary font-bold' : ''
                      }`}
                    >
                      <td className="py-4 px-6 text-center font-extrabold font-mono">
                        {user.rank === 1 && <span className="text-lg">🥇</span>}
                        {user.rank === 2 && <span className="text-lg">🥈</span>}
                        {user.rank === 3 && <span className="text-lg">🥉</span>}
                        {user.rank > 3 && `#${user.rank}`}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img src={user.avatar} alt={user.name} className="w-8.5 h-8.5 rounded-full object-cover bg-muted border border-border/15" />
                          <div className="flex flex-col">
                            <span className="text-foreground flex items-center gap-1.5">
                              {user.name}
                              {isSelf && (
                                <span className="text-[8px] bg-primary text-white font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                                  You
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                              {user.role} &bull; {user.plant || 'Jamshedpur'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground">{user.department || 'Operations'}</td>
                      <td className="py-4 px-6 text-center text-primary font-bold">
                        <span className="inline-flex items-center gap-1.5">
                          <Zap size={11} className="fill-primary text-primary" /> {user.xp.toLocaleString()} XP
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center text-cyan-400 font-bold">
                        <span className="inline-flex items-center gap-1.5">
                          <Award size={11} /> {user.knowledgeCredits.toLocaleString()} KC
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <StreakIndicator streak={user.streak} />
                      </td>
                    </motion.tr>
                  );
                })}
              </motion.tbody>
            </table>
          ) : (
            <div className="p-8">
              <EmptyState
                title="No associates found"
                message="No associates match the filters of the selected leaderboard view."
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
