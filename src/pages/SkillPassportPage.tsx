import React, { useState, useEffect } from 'react';
import { Award, Shield, FileText, CheckCircle, Zap, BookOpen, Clock, Play } from 'lucide-react';
import { mockService } from '../services/mockData';
import { Skill, User, UserRole } from '../types';
import { SkillProgress, RoleBadge, StreakIndicator } from '../components/reusable';

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

  const getNextSkillRecommendation = (role: UserRole) => {
    switch (role) {
      case 'SHOP_FLOOR_WORKER':
        return {
          name: 'Emergency Boiler Valve Shutdown',
          reason: 'Required for active shifts in Boiler Room Plant 2.',
          relevance: 'Ensures operational compliance with 2026 EHS standards.',
          time: '2 hours',
          difficulty: 'Intermediate'
        };
      case 'JUNIOR_EMPLOYEE':
        return {
          name: 'Zod Run-time Verification',
          reason: 'Recommended for mapping dynamic Supabase JSONB tables.',
          relevance: 'Guarantees typescript boundaries are validated on mount.',
          time: '4 hours',
          difficulty: 'Beginner'
        };
      case 'SENIOR_EMPLOYEE':
        return {
          name: 'Industrial SCADA Telemetry Systems',
          reason: 'Needed for configuring the upcoming Pune Plant IIoT gateways.',
          relevance: 'Core competency for automation team leadership.',
          time: '8 hours',
          difficulty: 'Advanced'
        };
      case 'OFFICER_MANAGER':
        return {
          name: 'Strategic L&D Skill-Gap Analytics',
          reason: 'To optimize course allocation and talent mapping across departments.',
          relevance: 'Essential for tracking training progression.',
          time: '3 hours',
          difficulty: 'Intermediate'
        };
      case 'RETIRED_EMPLOYEE':
        return {
          name: 'Boiler Operation Archives preservation',
          reason: 'To record undocumented steam valve procedures.',
          relevance: 'Secures critical legacy turbine knowledge.',
          time: '5 hours',
          difficulty: 'Expert'
        };
      default:
        return {
          name: 'Basic Platform Administration',
          reason: 'System operations check.',
          relevance: 'Provides full visibility over role audits.',
          time: '2 hours',
          difficulty: 'Advanced'
        };
    }
  };

  const nextSkill = getNextSkillRecommendation(userProfile.role);

  const handleStartLearning = () => {
    alert(`Enrolled in "${nextSkill.name}" Skill Track! Added to in-progress passport.`);
    // Simulate adding skill to list
    const newSkill: Skill = {
      id: Date.now(),
      name: nextSkill.name,
      category: 'Recommended',
      proficiency: nextSkill.difficulty as any,
      progress: 5
    };
    setSkills(prev => [...prev, newSkill]);
  };

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
        <div className="lg:col-span-2 space-y-6">
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

          {/* Core counts overview */}
          <div className="border-t border-border/50 pt-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Passport Achievements Summary</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl border border-border bg-card">
                <span className="text-xl font-bold text-foreground">6</span>
                <p className="text-[10px] text-muted-foreground mt-1">Courses Completed</p>
              </div>
              <div className="p-4 rounded-xl border border-border bg-card">
                <span className="text-xl font-bold text-foreground">4</span>
                <p className="text-[10px] text-muted-foreground mt-1">Live Training Sessions</p>
              </div>
              <div className="p-4 rounded-xl border border-border bg-card">
                <span className="text-xl font-bold text-foreground">2</span>
                <p className="text-[10px] text-muted-foreground mt-1">Certifications Held</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side: Recommendation & Credentials */}
        <div className="space-y-6">
          {/* Your Next Skill Card */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4 hover:border-primary/20 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary/10 text-primary px-3 py-1 rounded-bl text-[9px] font-bold uppercase">
              Recommendation
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Your Next Skill</h3>
            <div>
              <h4 className="text-base font-bold text-foreground leading-snug">{nextSkill.name}</h4>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{nextSkill.reason}</p>
            </div>
            <div className="text-xs text-muted-foreground space-y-2 border-t border-border/50 pt-4">
              <p>
                <strong className="text-foreground">Relevance to Role:</strong> {nextSkill.relevance}
              </p>
              <div className="flex items-center gap-4 text-[11px] font-medium pt-2">
                <span className="flex items-center gap-1"><Clock size={12} /> {nextSkill.time}</span>
                <span className="flex items-center gap-1"><Zap size={12} className="text-primary fill-primary" /> {nextSkill.difficulty}</span>
              </div>
            </div>
            <button
              onClick={handleStartLearning}
              className="w-full bg-primary hover:bg-primary/95 text-white font-semibold py-2.5 rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-lg shadow-primary/10"
            >
              <Play size={12} className="fill-white" /> Start Learning Skill
            </button>
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
    </div>
  );
}
