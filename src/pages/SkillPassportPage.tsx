import React, { useState, useEffect } from 'react';
import { Award, Shield, FileText, CheckCircle, Zap } from 'lucide-react';
import { mockService } from '../services/mockData';
import { Skill, User } from '../types';
import { SkillProgress, RoleBadge, StreakIndicator, XPBadge, CreditBadge } from '../components/reusable';

export default function SkillPassportPage({ userProfile }: { userProfile: User }) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockService
      .fetchSkills(userProfile.id)
      .then(data => {
        setSkills(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [userProfile.id]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Award className="text-primary" size={24} /> Skill Passport
        </h2>
        <p className="text-muted-foreground text-sm">Your digital profile demonstrating verified industrial skills, training, and achievements.</p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-card border border-border rounded-2xl p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
        {/* Avatar & Basic Info */}
        <div className="md:col-span-2 flex items-center gap-4">
          <img src={userProfile.avatar} alt={userProfile.name} className="w-16 h-16 rounded-full object-cover border border-border" />
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-foreground leading-tight">{userProfile.name}</h3>
              <RoleBadge role={userProfile.role} />
            </div>
            <p className="text-xs text-muted-foreground">
              {userProfile.designation} &bull; {userProfile.department}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Plant: {userProfile.plant} &bull; Exp: {userProfile.yearsOfExperience} yrs
            </p>
          </div>
        </div>

        {/* Stats Column */}
        <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-3 bg-background border border-border rounded-xl text-center space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Level</span>
            <p className="text-sm font-bold text-foreground">{userProfile.skillLevel.split(' ')[1] || 'L1'}</p>
          </div>
          <div className="p-3 bg-background border border-border rounded-xl text-center space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Rank</span>
            <p className="text-sm font-bold text-foreground">#{userProfile.leaderboardRank}</p>
          </div>
          <div className="p-3 bg-background border border-border rounded-xl text-center space-y-1 col-span-2 md:col-span-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Streak</span>
            <div className="flex justify-center mt-0.5">
              <StreakIndicator streak={userProfile.currentStreak} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Skills List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Verified Competencies</h3>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 rounded-full border border-t-primary border-r-transparent animate-spin" />
            </div>
          ) : skills.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No verified skills listed yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skills.map(skill => (
                <SkillProgress
                  key={skill.id}
                  name={skill.name}
                  category={skill.category}
                  progress={skill.progress}
                  proficiency={skill.proficiency}
                />
              ))}
            </div>
          )}
        </div>

        {/* Credentials / Certificates */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Recent Credentials</h3>
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div className="p-3 rounded-xl border border-border bg-background flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <CheckCircle size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground leading-tight">ISO-9001 Safety Protocol</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Issued: June 2026 &bull; Verified</p>
              </div>
            </div>
            <div className="p-3 rounded-xl border border-border bg-background flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <Award size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground leading-tight">Advanced Machine Operator</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Issued: Jan 2026 &bull; Verified</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
