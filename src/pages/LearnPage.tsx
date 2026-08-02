import React from 'react';
import { BookOpen, Award, Sparkles, Clock, Zap, Play, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { PageHeader } from '../components/reusable';
import { useApp } from '../../App';

export default function LearnPage({
  onNavigateCourse,
  onNavigateCertificates
}: {
  courses: any[];
  enrollments: any[];
  profile: any;
  onNavigateCourse: (id: number) => void;
  onNavigateCertificates: () => void;
}) {
  const { enrollments } = useApp();

  // Find progress for journeys dynamically
  const getProgress = (id: number) => {
    const e = enrollments.find(env => Number(env.course_id) === Number(id));
    return e ? e.progress : 0;
  };

  const journeys = [
    {
      id: 1,
      title: "Agentic AI",
      description: "Master the design of autonomous agents, multi-agent frameworks, tool usage, planning loops, and robust error recovery.",
      thumbnail: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&h=340&fit=crop&auto=format",
      difficulty: "Advanced",
      duration: "12 Hours",
      xpReward: "2,500 XP",
      progress: getProgress(1),
      isAccessible: true,
      isPreview: false
    },
    {
      id: 2,
      title: "Generative AI",
      description: "Explore large language models, image generation diffusion models, fine-tuning techniques, and deployment strategies.",
      thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&h=340&fit=crop&auto=format",
      difficulty: "Intermediate",
      duration: "8 Hours",
      xpReward: "1,800 XP",
      progress: getProgress(2),
      isAccessible: true,
      isPreview: true
    },
    {
      id: 3,
      title: "Prompt Engineering",
      description: "Learn zero-shot, few-shot, chain-of-thought, self-consistency prompts, and automated prompt optimization.",
      thumbnail: "https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=600&h=340&fit=crop&auto=format",
      difficulty: "Beginner",
      duration: "4 Hours",
      xpReward: "1,000 XP",
      progress: getProgress(3),
      isAccessible: true,
      isPreview: true
    },
    {
      id: 4,
      title: "Context Engineering",
      description: "Optimize LLM contexts with semantic retrieval, RAG architectures, long-context window management, and vector DB setups.",
      thumbnail: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&h=340&fit=crop&auto=format",
      difficulty: "Advanced",
      duration: "6 Hours",
      xpReward: "1,500 XP",
      progress: getProgress(4),
      isAccessible: true,
      isPreview: true
    }
  ];

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "Beginner": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "Intermediate": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      default: return "text-purple-400 bg-purple-500/10 border-purple-500/20";
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 20 } }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 space-y-8 max-w-7xl mx-auto"
    >
      {/* Page Header */}
      <PageHeader
        title="Learning Journeys"
        description="Accelerate your operational intelligence with guided tracks, structured modules, and interactive assessments."
        breadcrumbs={[{ label: "Mentora" }, { label: "Learn" }]}
        primaryAction={{
          label: "View Skill Passport",
          onClick: onNavigateCertificates,
          icon: <Award size={14} />
        }}
      />

      {/* Journeys Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {journeys.map((j) => (
          <motion.div
            key={j.id}
            variants={cardVariants}
            className={`premium-glass-card overflow-hidden group flex flex-col justify-between border hover:border-white/10 transition-all duration-300 ${
              j.isAccessible ? "hover:scale-[1.015]" : "opacity-90"
            }`}
          >
            <div className="space-y-4">
              {/* Cover Image */}
              <div className="relative h-48 overflow-hidden bg-muted">
                <img
                  src={j.thumbnail}
                  alt={j.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06060F] to-transparent opacity-80" />
                
                {/* Accessibility Badge Overlay */}
                {j.isPreview ? (
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md text-[10px] font-black uppercase text-pink-400 tracking-wider flex items-center gap-1.5 shadow-lg">
                    <Lock size={10} /> Coming in Phase 2
                  </div>
                ) : (
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-md text-[10px] font-black uppercase text-primary tracking-wider flex items-center gap-1.5 shadow-lg">
                    <Sparkles size={10} className="animate-pulse" /> Accessible Track
                  </div>
                )}
              </div>

              {/* Title & Info */}
              <div className="px-6 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getDifficultyColor(j.difficulty)}`}>
                    {j.difficulty}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-semibold">
                    <Clock size={12} /> {j.duration}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-[#FF2B8A] font-bold">
                    <Zap size={12} fill="#FF2B8A" /> {j.xpReward}
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-foreground tracking-tight group-hover:text-primary transition-colors" style={{ fontFamily: "'Raleway', sans-serif" }}>
                  {j.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {j.description}
                </p>
              </div>
            </div>

            {/* Bottom Actions & Progress */}
            <div className="p-6 pt-4 mt-4 border-t border-white/5 space-y-4">
              {/* Progress Tracker */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                  <span>Current Progress</span>
                  <span className="font-mono text-foreground">{j.progress}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF2B8A] to-[#7C3AED] rounded-full transition-all duration-500 shadow-[0_0_8px_#FF2B8A]"
                    style={{ width: `${j.progress}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              {j.isAccessible ? (
                <button
                  onClick={() => onNavigateCourse(j.id)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF2B8A] to-[#7C3AED] hover:from-[#FF4CA0] hover:to-[#8C4AFF] text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-pink-500/20 active:scale-[0.98] transition-all"
                  style={{ fontFamily: "'Raleway', sans-serif" }}
                >
                  Continue Journey <Play size={12} fill="white" />
                </button>
              ) : (
                <div
                  className="w-full py-3 rounded-xl bg-white/[0.02] border border-white/5 text-muted-foreground text-center font-bold text-xs flex items-center justify-center gap-2"
                  style={{ fontFamily: "'Raleway', sans-serif" }}
                >
                  <Lock size={12} /> Coming in Phase 2
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
