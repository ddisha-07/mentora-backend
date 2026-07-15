import React, { useState, useEffect } from 'react';
import { Trophy, Award, Zap, Flame, Shield, MapPin, Briefcase, BookOpen, Star } from 'lucide-react';
import { useApp } from '../../App';
import { Card, StreakIndicator } from '../components/reusable';

interface LeaderboardUser {
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
    name: "Learner",
    role: "JUNIOR_EMPLOYEE",
    department: "Software Engineering",
    xp: 1240,
    knowledgeCredits: 150
  };

  // Sub-leaderboards tabs: weekly, department, plant, learner, contributor
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<'weekly' | 'department' | 'plant' | 'learner' | 'contributor'>('weekly');

  const MOCK_LEADERBOARD: LeaderboardUser[] = [
    { rank: 1, name: 'Devendra Prasad', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&auto=format', role: 'Retired Expert Advisor', department: 'Maintenance & Boilers', xp: 9800, knowledgeCredits: 1250, streak: 12, plant: 'Jamshedpur' },
    { rank: 2, name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=50&h=50&fit=crop&auto=format', role: 'Safety Director', department: 'Safety & EHS', xp: 7200, knowledgeCredits: 950, streak: 8, plant: 'Pune Plant' },
    { rank: 3, name: 'Arjun Mehta', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&auto=format', role: 'Senior Automation Eng', department: 'Robotics R&D', xp: 5400, knowledgeCredits: 680, streak: 15, plant: 'Pune Plant' },
    { rank: 4, name: 'Priya Sharma', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop&auto=format', role: 'Quality Specialist', department: 'Quality Control', xp: 3200, knowledgeCredits: 420, streak: 5, plant: 'Kalinganagar' },
    { rank: 5, name: 'Amit Patel', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&auto=format', role: 'Shop-floor Worker', department: 'Assembly Line A', xp: 2800, knowledgeCredits: 180, streak: 20, plant: 'Pune Plant' },
    { rank: 6, name: activeProfile.name || 'Learner', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&auto=format', role: activeProfile.role || 'Junior Employee', department: activeProfile.department || 'Software Engineering', xp: activeProfile.xp || 1240, knowledgeCredits: activeProfile.knowledgeCredits || activeProfile.knowledge_credits || 150, streak: 6, plant: 'Pune Plant' },
    { rank: 7, name: 'Vikram Singh', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&auto=format', role: 'Junior Employee', department: 'Supply Chain', xp: 1100, knowledgeCredits: 80, streak: 2, plant: 'Jamshedpur' }
  ];

  // Helper sorting function based on tab selection
  const getSortedData = () => {
    let list = [...MOCK_LEADERBOARD];

    if (activeLeaderboardTab === 'department') {
      // Filter list to only show same department as active user
      list = list.filter(u => u.department === activeProfile.department || u.name === activeProfile.name);
    } else if (activeLeaderboardTab === 'plant') {
      // Filter list to show same plant as active user (Pune Plant)
      list = list.filter(u => u.plant === 'Pune Plant');
    } else if (activeLeaderboardTab === 'learner') {
      // Sort purely by XP
      list.sort((a, b) => b.xp - a.xp);
    } else if (activeLeaderboardTab === 'contributor') {
      // Sort purely by Knowledge Credits
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
            <h3 className="text-lg font-extrabold text-foreground leading-tight">Devendra Prasad</h3>
            <p className="text-xs text-muted-foreground">Retired Expert Advisor &bull; Maintenance department (Jamshedpur)</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 md:gap-8 text-center text-xs bg-background/45 p-4 rounded-xl border border-border">
          <div>
            <span className="text-muted-foreground block text-[9px]">Answered</span>
            <strong className="text-foreground text-sm">110</strong>
          </div>
          <div>
            <span className="text-muted-foreground block text-[9px]">Verified</span>
            <strong className="text-emerald-400 text-sm">86</strong>
          </div>
          <div>
            <span className="text-muted-foreground block text-[9px]">Helped</span>
            <strong className="text-primary text-sm">320</strong>
          </div>
          <div>
            <span className="text-muted-foreground block text-[9px]">Contributions</span>
            <strong className="text-yellow-400 text-sm">142</strong>
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
                const isSelf = user.name === activeProfile.name;

                return (
                  <tr
                    key={user.name}
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
                          <span className="text-[10px] text-muted-foreground">{user.role} &bull; {user.plant}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-muted-foreground">{user.department}</td>
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
        </div>
      </div>
    </div>
  );
}
