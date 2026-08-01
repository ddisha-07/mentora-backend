import { motion } from "motion/react";
import { UserPlus, Compass, BookOpen, Layers, Award, ShieldAlert, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";

export function LandingProcess() {
  const steps = [
    { id: 1, icon: <UserPlus size={18} />, title: "Create Account", desc: "Sign up and set your designation, department, and plant coordinates." },
    { id: 2, icon: <Compass size={18} />, title: "Choose Journey", desc: "Select a custom tailored curriculum aligned with your workspace needs." },
    { id: 3, icon: <BookOpen size={18} />, title: "Learning Bites", desc: "Consume structured 1-minute digestible cards containing visual processes." },
    { id: 4, icon: <Layers size={18} />, title: "Practice", desc: "Apply learnings via interactive text simulations or quick scenario reviews." },
    { id: 5, icon: <Sparkles size={18} />, title: "Take AI Quiz", desc: "Test your procedural recall in a scenario check moderated by Kai." },
    { id: 6, icon: <CheckCircle2 size={18} />, title: "Earn XP", desc: "Collect performance points, unlock badges, and track your metrics." },
    { id: 7, icon: <Award size={18} />, title: "Complete Journey", desc: "Master all required modules, resolving active skill gaps along the way." },
    { id: 8, icon: <Award size={18} />, title: "Get Certificate", desc: "Generate a cryptographically signed skill badge for your file." },
    { id: 9, icon: <Layers size={18} />, title: "Leaderboard", desc: "Compare your rank, streak levels, and credits with colleagues." }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 120, damping: 22 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-6 lg:px-10 xl:px-16 pt-32 pb-24 text-foreground relative z-10"
    >
      {/* Process Header */}
      <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto mb-20">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6">
          System Architecture
        </span>
        <h1 className="text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
          How Mentora <span className="text-primary">drives</span> learning.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Walk through the structural pipelines that connect legacy manuals directly to team success.
        </p>
      </motion.div>

      {/* Grid of Steps with connector lines */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          return (
            <div key={step.id} className="relative group">
              <div className="lp-glass-card p-6 h-full flex flex-col justify-between hover:border-primary/30 transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                      {step.icon}
                    </div>
                    <span className="text-2xl font-black text-muted-foreground/10 group-hover:text-primary/10 transition-colors">
                      0{step.id}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {!isLast && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-muted-foreground/20 group-hover:text-primary/30 transition-colors">
                    <ChevronRight size={16} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Summary Banner */}
      <motion.div 
        variants={itemVariants} 
        className="mt-20 lp-glass-card p-8 text-center max-w-4xl mx-auto border border-white/5 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-primary/2 pointer-events-none" />
        <h3 className="text-2xl font-bold mb-3">Structured, Contextual learning</h3>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-6">
          This loop ensures that frontline questions are answered with verified corporate source files, while reinforcing skills through continuous gamified practice bites.
        </p>
      </motion.div>
    </motion.div>
  );
}
