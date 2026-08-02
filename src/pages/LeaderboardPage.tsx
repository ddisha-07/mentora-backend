import React from 'react';
import { Trophy, Award, Zap, Flame } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../App';
import { PageHeader } from '../components/reusable';

interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  xp: number;
  streak: number;
  isSelf: boolean;
}

export default function LeaderboardPage() {
  const { profile, user } = useApp();

  const activeProfile = profile || {
    name: user?.email?.split('@')[0] || "Disha Test",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop&auto=format",
    xp: 1240,
    currentStreak: 12
  };

  const initialUsers = [
    {
      id: "1",
      name: "Devendra Prasad",
      xp: 3200,
      streak: 18,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&auto=format",
      isSelf: false
    },
    {
      id: "2",
      name: "Amrita Sen",
      xp: 2850,
      streak: 14,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&auto=format",
      isSelf: false
    },
    {
      id: "3",
      name: "Rohan Das",
      xp: 2400,
      streak: 9,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&auto=format",
      isSelf: false
    },
    {
      id: "4",
      name: "Puneet Malhotra",
      xp: 1980,
      streak: 11,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop&auto=format",
      isSelf: false
    },
    {
      id: "self",
      name: activeProfile.name || activeProfile.full_name || "Disha Test",
      xp: activeProfile.xp || 1240,
      streak: activeProfile.currentStreak || activeProfile.streak || 12,
      avatar: activeProfile.avatar || activeProfile.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop&auto=format",
      isSelf: true
    },
    {
      id: "6",
      name: "Kriti Sharma",
      xp: 1120,
      streak: 5,
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=60&h=60&fit=crop&auto=format",
      isSelf: false
    },
    {
      id: "7",
      name: "Suresh Prabhu",
      xp: 950,
      streak: 7,
      avatar: "https://images.unsplash.com/photo-152202176988-66273c2fd55f?w=60&h=60&fit=crop&auto=format",
      isSelf: false
    }
  ];

  // Dynamically sort the list by XP, adding the rank
  const sortedUsers = [...initialUsers]
    .sort((a, b) => b.xp - a.xp)
    .map((u, idx) => ({ ...u, rank: idx + 1 }));

  const topThree = sortedUsers.slice(0, 3);
  const remainingUsers = sortedUsers.slice(3);

  // Order top three for podium display: [2nd, 1st, 3rd]
  const podiumOrder = [];
  if (topThree[1]) podiumOrder.push(topThree[1]);
  if (topThree[0]) podiumOrder.push(topThree[0]);
  if (topThree[2]) podiumOrder.push(topThree[2]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-7xl mx-auto space-y-8"
    >
      {/* Page Header */}
      <PageHeader
        title="Leaderboards"
        description="Verify plant rankings, check operational streaks, and see how you stack up against top learners."
        breadcrumbs={[{ label: "Mentora" }, { label: "Leaderboard" }]}
      />

      {/* Podium Layout */}
      <div className="flex flex-col md:flex-row items-end justify-center gap-6 py-8 px-4 max-w-3xl mx-auto">
        {podiumOrder.map((user) => {
          const isFirst = user.rank === 1;
          const isSecond = user.rank === 2;
          
          let podiumHeight = "h-36 md:h-40";
          let borderStyle = "border-amber-700/20";
          let glowStyle = "shadow-amber-500/5";
          let medalColor = "text-amber-500";

          if (isFirst) {
            podiumHeight = "h-48 md:h-56";
            borderStyle = "border-yellow-400/30 bg-gradient-to-t from-yellow-500/5 to-transparent";
            glowStyle = "shadow-yellow-500/15";
            medalColor = "text-yellow-400";
          } else if (isSecond) {
            podiumHeight = "h-40 md:h-48";
            borderStyle = "border-slate-300/20 bg-gradient-to-t from-slate-400/5 to-transparent";
            glowStyle = "shadow-slate-400/10";
            medalColor = "text-slate-300";
          }

          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: user.rank * 0.1 }}
              className="flex-1 w-full max-w-[200px] flex flex-col items-center group relative mt-8 md:mt-0"
            >
              {/* User Avatar */}
              <div className="relative mb-3 flex flex-col items-center">
                {isFirst && (
                  <motion.div 
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="absolute -top-6 text-xl text-yellow-400 font-extrabold"
                  >
                    👑
                  </motion.div>
                )}
                <img
                  src={user.avatar}
                  alt={user.name}
                  className={`w-16 h-16 rounded-full object-cover border-2 shadow-lg ${
                    isFirst ? "border-yellow-400" : isSecond ? "border-slate-300" : "border-amber-600"
                  }`}
                />
                <div className={`absolute -bottom-2 px-2.5 py-0.5 rounded-full bg-[#06060F] border text-[9px] font-black uppercase tracking-wider ${
                  isFirst ? "border-yellow-400 text-yellow-400" : isSecond ? "border-slate-300 text-slate-300" : "border-amber-600 text-amber-500"
                }`}>
                  Rank {user.rank}
                </div>
              </div>

              {/* User Details */}
              <div className="text-center mb-4 space-y-1">
                <p className="text-sm font-extrabold truncate max-w-[150px] text-foreground">{user.name}</p>
                <p className="text-xs font-mono font-bold text-primary flex items-center justify-center gap-1">
                  <Zap size={11} fill="currentColor" /> {user.xp} XP
                </p>
                <p className="text-[10px] text-orange-400 font-bold flex items-center justify-center gap-0.5">
                  <Flame size={10} fill="currentColor" /> {user.streak} days
                </p>
              </div>

              {/* Platform */}
              <div className={`w-full ${podiumHeight} rounded-t-2xl border border-b-0 flex flex-col items-center justify-center p-4 relative shadow-2xl ${borderStyle} ${glowStyle} backdrop-blur-md`}>
                <span className={`text-4xl font-black ${medalColor} font-mono`}>{user.rank}</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-2">
                  {isFirst ? "Champion" : isSecond ? "Runner Up" : "3rd Place"}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Leaderboard Table List */}
      <div className="premium-glass-card border border-white/5 overflow-hidden max-w-4xl mx-auto shadow-2xl">
        <div className="p-4 bg-white/[0.01] border-b border-white/5 flex items-center justify-between text-xs font-black uppercase tracking-widest text-muted-foreground">
          <span>Rank & Associate</span>
          <div className="flex gap-16 pr-6">
            <span>Streak</span>
            <span className="w-20 text-right">XP</span>
          </div>
        </div>

        <motion.div layout className="divide-y divide-white/5">
          {remainingUsers.map((user) => (
            <motion.div
              key={user.id}
              layout
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className={`flex items-center justify-between p-4 transition-colors hover:bg-white/[0.02] ${
                user.isSelf ? "bg-primary/5 border-l-2 border-primary" : ""
              }`}
            >
              {/* User Identity */}
              <div className="flex items-center gap-4">
                <span className="w-6 text-center font-mono font-black text-sm text-muted-foreground">
                  #{user.rank}
                </span>
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover bg-muted border border-white/5"
                />
                <div className="space-y-0.5">
                  <span className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
                    {user.name}
                    {user.isSelf && (
                      <span className="text-[8px] bg-primary text-white font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                        You
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Stats details */}
              <div className="flex items-center gap-16 pr-6">
                <div className="flex items-center gap-1 text-xs text-orange-400 font-bold">
                  <Flame size={14} fill="currentColor" />
                  <span>{user.streak} days</span>
                </div>
                <div className="w-20 text-right text-sm font-mono font-black text-primary flex items-center justify-end gap-1">
                  <Zap size={13} fill="currentColor" />
                  <span>{user.xp}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
