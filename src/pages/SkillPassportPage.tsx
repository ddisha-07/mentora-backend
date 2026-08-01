import React, { useState, useEffect } from 'react';
import { Award, Shield, FileText, CheckCircle, Zap, BookOpen, Clock, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Skill, User, UserRole } from '../types';
import { SkillProgress, RoleBadge, StreakIndicator, PageHeader, EmptyState, SkeletonLoader } from '../components/reusable';
import { supabase } from '../lib/supabaseClient';

export default function SkillPassportPage({ userProfile }: { userProfile: User }) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSkills = async () => {
      try {
        const { data, error } = await supabase
          .from("user_skills_progress")
          .select(`
            progress,
            skill_id,
            skills (
              id,
              name,
              category,
              proficiency
            )
          `)
          .eq("user_id", userProfile.id);

        if (!error && data) {
          const mappedSkills: Skill[] = data.map((row: any) => ({
            id: row.skills?.id || row.skill_id,
            name: row.skills?.name || 'Unknown Skill',
            category: row.skills?.category || 'General',
            proficiency: row.skills?.proficiency || 'Beginner',
            progress: row.progress || 0
          }));
          setSkills(mappedSkills);
        }
      } catch (err) {
        console.error("Error fetching skills progress:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSkills();
  }, [userProfile.id]);

  const getNextSkillRecommendation = (role: UserRole) => {
    switch (role) {
      case 'SHOP_FLOOR_WORKER':
        return {
          id: 202,
          name: 'Safety Compliance',
          reason: 'Required for active shifts in Boiler Room Plant 2.',
          relevance: 'Ensures operational compliance with 2026 EHS standards.',
          time: '2 hours',
          difficulty: 'Expert'
        };
      case 'JUNIOR_EMPLOYEE':
        return {
          id: 205,
          name: 'TypeScript & ES6+',
          reason: 'Recommended for mapping dynamic Supabase JSONB tables.',
          relevance: 'Guarantees typescript boundaries are validated on mount.',
          time: '4 hours',
          difficulty: 'Intermediate'
        };
      case 'SENIOR_EMPLOYEE':
        return {
          id: 207,
          name: 'Industrial IoT',
          reason: 'Needed for configuring the upcoming Pune Plant IIoT gateways.',
          relevance: 'Core competency for automation team leadership.',
          time: '8 hours',
          difficulty: 'Advanced'
        };
      case 'OFFICER_MANAGER':
        return {
          id: 208,
          name: 'Curriculum Planning',
          reason: 'To optimize course allocation and talent mapping across departments.',
          relevance: 'Essential for tracking training progression.',
          time: '3 hours',
          difficulty: 'Expert'
        };
      case 'RETIRED_EMPLOYEE':
        return {
          id: 209,
          name: 'Steam Boiler Advising',
          reason: 'To record undocumented steam valve procedures.',
          relevance: 'Secures critical legacy turbine knowledge.',
          time: '5 hours',
          difficulty: 'Expert'
        };
      default:
        return {
          id: 201,
          name: 'Machine Operations',
          reason: 'System operations check.',
          relevance: 'Provides full visibility over role audits.',
          time: '2 hours',
          difficulty: 'Advanced'
        };
    }
  };

  const nextSkill = getNextSkillRecommendation(userProfile.role);

  const handleStartLearning = async () => {
    const alreadyEnrolled = skills.some(s => s.id === nextSkill.id);
    if (alreadyEnrolled) {
      alert(`You are already learning or completed "${nextSkill.name}".`);
      return;
    }

    try {
      const { error } = await supabase
        .from("user_skills_progress")
        .insert({
          user_id: userProfile.id,
          skill_id: nextSkill.id,
          progress: 5
        });

      if (error) throw error;

      alert(`Enrolled in "${nextSkill.name}" Skill Track! Added to in-progress passport.`);
      
      const newSkill: Skill = {
        id: nextSkill.id,
        name: nextSkill.name,
        category: 'Recommended',
        proficiency: nextSkill.difficulty as any,
        progress: 5
      };
      setSkills(prev => [...prev, newSkill]);
    } catch (err: any) {
      console.error("Error enrolling in skill:", err);
      alert("Failed to start skill: " + (err.message || err));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      {/* Page Header */}
      <PageHeader
        title="Skill Passport"
        description="Verify your operational badges, track industrial competencies, and browse learning track recommendations."
        breadcrumbs={[{ label: "Mentora" }, { label: "Skill Passport" }]}
      />

      {/* Profile Overview Card */}
      <div className="premium-glass-card p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-center border border-border/10">
        {/* Avatar details */}
        <div className="md:col-span-2 flex items-center gap-4">
          <img src={userProfile.avatar} alt={userProfile.name} className="w-16 h-16 rounded-2xl object-cover border border-border/15" />
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-foreground leading-tight" style={{ fontFamily: "'Raleway', sans-serif" }}>{userProfile.name}</h3>
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

        {/* Stats metrics */}
        <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-3 bg-secondary/15 border border-border/5 rounded-xl text-center space-y-1">
            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Level</span>
            <p className="text-sm font-bold text-foreground">{userProfile.skillLevel.split(' ')[1] || 'L1'}</p>
          </div>
          <div className="p-3 bg-secondary/15 border border-border/5 rounded-xl text-center space-y-1">
            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Rank</span>
            <p className="text-sm font-bold text-foreground">#{userProfile.leaderboardRank}</p>
          </div>
          <div className="p-3 bg-secondary/15 border border-border/5 rounded-xl text-center space-y-1 col-span-2 md:col-span-1 flex flex-col items-center justify-center">
            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Streak</span>
            <StreakIndicator streak={userProfile.currentStreak} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Verified competencies */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Verified Competencies</h3>
          
          {loading ? (
            <div className="space-y-4">
              <SkeletonLoader />
              <SkeletonLoader />
            </div>
          ) : skills.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No verified skills listed yet.</p>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {skills.map(skill => (
                <motion.div key={skill.id} variants={itemVariants}>
                  <SkillProgress
                    name={skill.name}
                    category={skill.category}
                    progress={skill.progress}
                    proficiency={skill.proficiency}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Core counts overview */}
          <div className="border-t border-border/10 pt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Passport Achievements Summary</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-2xl border border-border/10 bg-secondary/10 hover:bg-secondary/15 transition-all">
                <span className="text-xl font-bold text-foreground">6</span>
                <p className="text-[10px] text-muted-foreground mt-1 font-semibold uppercase tracking-wider">Courses Completed</p>
              </div>
              <div className="p-4 rounded-2xl border border-border/10 bg-secondary/10 hover:bg-secondary/15 transition-all">
                <span className="text-xl font-bold text-foreground">4</span>
                <p className="text-[10px] text-muted-foreground mt-1 font-semibold uppercase tracking-wider">Live Classes</p>
              </div>
              <div className="p-4 rounded-2xl border border-border/10 bg-secondary/10 hover:bg-secondary/15 transition-all">
                <span className="text-xl font-bold text-foreground">2</span>
                <p className="text-[10px] text-muted-foreground mt-1 font-semibold uppercase tracking-wider">Certificates Held</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Recommendation & Credentials */}
        <div className="space-y-6">
          {/* Your Next Skill Card */}
          <div className="premium-glass-card p-5 space-y-4 hover:scale-[1.01] transition-all relative overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="absolute top-0 right-0 bg-primary/10 text-primary px-3 py-1 rounded-bl-xl text-[9px] font-bold uppercase tracking-wider border-l border-b border-primary/10">
              Recommendation
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Next Skill</h3>
            <div>
              <h4 className="text-base font-bold text-foreground leading-snug" style={{ fontFamily: "'Raleway', sans-serif" }}>{nextSkill.name}</h4>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{nextSkill.reason}</p>
            </div>
            <div className="text-xs text-muted-foreground space-y-2 border-t border-border/10 pt-4">
              <p>
                <strong className="text-foreground">Relevance to Role:</strong> {nextSkill.relevance}
              </p>
              <div className="flex items-center gap-4 text-[10px] font-bold pt-2 uppercase tracking-wider">
                <span className="flex items-center gap-1"><Clock size={12} className="text-primary" /> {nextSkill.time}</span>
                <span className="flex items-center gap-1"><Zap size={12} className="text-primary fill-primary" /> {nextSkill.difficulty}</span>
              </div>
            </div>
            <button
              onClick={handleStartLearning}
              className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-2.5 rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20 cursor-pointer"
            >
              <Play size={12} className="fill-white" /> Start Learning Skill
            </button>
          </div>

          {/* Credentials / Certificates */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recent Credentials</h3>
            <div className="premium-glass-card p-5 space-y-4 border border-border/10">
              <div className="p-3 rounded-xl border border-border/10 bg-secondary/10 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground leading-tight">ISO-9001 Safety Protocol</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Issued: June 2026 &bull; Verified</p>
                </div>
              </div>
              <div className="p-3 rounded-xl border border-border/10 bg-secondary/10 flex items-center gap-3">
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
    </motion.div>
  );
}
