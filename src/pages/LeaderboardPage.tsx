import React, { useState, useEffect } from 'react';
import { Trophy, Award, Zap, Flame } from 'lucide-react';
import { mockService, LeaderboardEntry } from '../services/mockData';
import { StreakIndicator } from '../components/reusable';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockService
      .fetchLeaderboard()
      .then(data => {
        setLeaderboard(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Trophy className="text-primary animate-bounce" size={24} /> Skill Leaderboard
        </h2>
        <p className="text-muted-foreground text-sm">Compete with global teams, verify knowledge to gain credits, and build learning streaks.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border border-t-primary border-r-transparent animate-spin" />
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground uppercase font-bold tracking-wider bg-muted/30">
                  <th className="py-4 px-6 text-center w-16">Rank</th>
                  <th className="py-4 px-6">Learner</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6 text-center">XP</th>
                  <th className="py-4 px-6 text-center">Credits (KC)</th>
                  <th className="py-4 px-6 text-center">Streak</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map(user => (
                  <tr key={user.rank} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-6 text-center font-bold font-mono">
                      {user.rank === 1 && <span className="text-amber-400 text-lg">🥇</span>}
                      {user.rank === 2 && <span className="text-slate-300 text-lg">🥈</span>}
                      {user.rank === 3 && <span className="text-amber-600 text-lg">🥉</span>}
                      {user.rank > 3 && `#${user.rank}`}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover bg-muted" />
                        <span className="font-bold text-foreground">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-muted-foreground">{user.role}</td>
                    <td className="py-4 px-6 text-center font-bold text-primary">
                      <span className="inline-flex items-center gap-1">
                        <Zap size={11} className="fill-primary text-primary" /> {user.xp.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-cyan-400">
                      <span className="inline-flex items-center gap-1">
                        <Award size={11} /> {user.credits.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <StreakIndicator streak={user.streak} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
