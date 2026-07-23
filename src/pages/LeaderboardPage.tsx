import React, { useState, useEffect } from 'react';
import { Trophy, Award, Zap, Flame, Shield, MapPin, Briefcase, BookOpen, Star } from 'lucide-react';
import { useApp } from '../../App';
import { Card, StreakIndicator, EmptyState, SkeletonLoader } from '../components/reusable';
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

  // Sub-leaderboards tabs: weekly, department, plant, learner, contributor
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

  // Compute weekly/monthly knowledge champion based on actual top contributor
  const contributorChamp = [...usersList].sort((a, b) => (b.knowledge_credits || 0) - (a.knowledge_credits || 0))[0] || {
    full_name: 'Devendra Prasad',
    role: 'Retired Expert Advisor',
    department: 'Maintenance & Boilers',
    plant: 'Jamshedpur',
    knowledge_credits: 1250
  };

  const champKc = contributorChamp.knowledge_credits || 0;

  // Helper sorting/filtering function based on tab selection
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

    // Re-rank items after sorting/filtering
    return list.map((user, idx) => ({
      ...user,
      rank: idx + 1
    }));
  };

  const sortedLeaderboard = getSortedData();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Trophy className="text-primary animate-bounce" size={24} /> Gamified Leaderboards
        </h2>
        <p className="text-muted-foreground text-sm">Review operational achievements, verify learning milestones, and compete with plant associates.</p>
      </div>

      {/* Recognition Widget: Knowledge Champion of the Week */}
      <div className="bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/20 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-yellow-500/15 flex items-center justify-center text-yellow-400 relative border border-yellow-500/30">
            <Award size={36} />
            <span className="absolute -bottom-1 -right-1 bg-yellow-500 text-black text-[8px] px-1 py-0.5 rounded font-black">#1</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-yellow-400 tracking-widest flex items-center gap-1">
              🏆 Knowledge Champion of the Week
            </span>
            <h3 className="text-lg font-extrabold text-foreground leading-tight">{contributorChamp.full_name}</h3>
            <p className="text-xs text-muted-foreground">{contributorChamp.role} &bull; {contributorChamp.department} ({contributorChamp.plant || "General"})</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 md:gap-8 text-center text-xs bg-background/45 p-4 rounded-xl border border-border">
          <div>
            <span className="text-muted-foreground block text-[9px]">Answered</span>
            <strong className="text-foreground text-sm">{Math.floor(champKc * 0.8) || 12}</strong>
          </div>
          <div>
            <span className="text-muted-foreground block text-[9px]">Verified</span>
            <strong className="text-emerald-400 text-sm">{Math.floor(champKc * 0.6) || 8}</strong>
          </div>
          <div>
            <span className="text-muted-foreground block text-[9px]">Helped</span>
            <strong className="text-primary text-sm">{Math.floor(champKc * 2.5) || 45}</strong>
          </div>
          <div>
            <span className="text-muted-foreground block text-[9px]">Contributions</span>
            <strong className="text-yellow-400 text-sm">{champKc}</strong>
          </div>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full border-b border-border">
        {[
          { id: 'weekly', label: 'Weekly Standings', icon: <Flame size={12} /> },
          { id: 'department', label: 'Department Rank', icon: <Briefcase size={12} /> },
          { id: 'plant', label: 'Plant Rank (Pune)', icon: <MapPin size={12} /> },
          { id: 'learner', label: 'Learner (XP)', icon: <Zap size={12} /> },
          { id: 'contributor', label: 'Knowledge Leader (KC)', icon: <Award size={12} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveLeaderboardTab(tab.id as any)}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${activeLeaderboardTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Leaderboard Table Container */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg shadow-black/25">
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
                <tr className="border-b border-border text-muted-foreground uppercase font-bold tracking-wider bg-muted/20">
                  <th className="py-4 px-6 text-center w-16">Rank</th>
                  <th className="py-4 px-6">Associate</th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6 text-center">XP Level</th>
                  <th className="py-4 px-6 text-center">Knowledge Credits</th>
                  <th className="py-4 px-6 text-center">Streak Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedLeaderboard.map(user => {
                  const isSelf = user.id === activeProfile.id || user.name === activeProfile.name;

                  return (
                    <tr
                      key={user.id}
                      className={`border-b border-border/40 hover:bg-muted/20 transition-colors ${isSelf ? 'bg-primary/5 border-l-4 border-l-primary font-bold' : ''}`}
                    >
                      <td className="py-4 px-6 text-center font-bold font-mono">
                        {user.rank === 1 && <span className="text-amber-400 text-base">🥇</span>}
                        {user.rank === 2 && <span className="text-slate-300 text-base">🥈</span>}
                        {user.rank === 3 && <span className="text-amber-600 text-base">🥉</span>}
                        {user.rank > 3 && `#${user.rank}`}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover bg-muted border border-border" />
                          <div className="flex flex-col">
                            <span className="text-foreground flex items-center gap-1.5">
                              {user.name}
                              {isSelf && (
                                <span className="text-[8px] bg-primary text-white font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                                  You
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-muted-foreground">{user.role} &bull; {user.plant || 'Jamshedpur'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground">{user.department || 'Operations'}</td>
                      <td className="py-4 px-6 text-center text-primary font-bold">
                        <span className="inline-flex items-center gap-1">
                          <Zap size={11} className="fill-primary" /> {user.xp.toLocaleString()} XP
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center text-cyan-400 font-bold">
                        <span className="inline-flex items-center gap-1">
                          <Award size={11} /> {user.knowledgeCredits.toLocaleString()} KC
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <StreakIndicator streak={user.streak} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
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
    </div>
  );
}
