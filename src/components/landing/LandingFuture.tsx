import { motion } from "motion/react";
import { Lock, Sparkles, Compass, Search, MessageSquare, ShieldAlert, FileText, Smartphone, Network } from "lucide-react";

export function LandingFuture() {
  const futureFeatures = [
    {
      icon: <Compass size={18} />,
      title: "AI Career Coach",
      desc: "Receive automated guidance mapping current skill level credits to future executive plant paths."
    },
    {
      icon: <Search size={18} />,
      title: "Skill Gap Analysis",
      desc: "Scan operator progress profiles dynamically to find and highlight local LOTO safety blind spots."
    },
    {
      icon: <FileText size={18} />,
      title: "AI Resume Review",
      desc: "Submit credentials directly to Kai for plant job recommendations and resume feedback."
    },
    {
      icon: <MessageSquare size={18} />,
      title: "AI Mock Interviews",
      desc: "Simulate emergency response panel evaluations with situational interview checkpoints."
    },
    {
      icon: <Sparkles size={18} />,
      title: "Voice with Kai",
      desc: "Review valve layouts hands-free on the plant floor using vocal queries and voice bites."
    },
    {
      icon: <Network size={18} />,
      title: "Learning Communities",
      desc: "Collaborate in local peer guilds, sharing verified SOP bookmarks and Q&A collections."
    },
    {
      icon: <ShieldAlert size={18} />,
      title: "AI Team Analytics",
      desc: "Provide team leaders with dashboards detailing safety compliance risks and speed scores."
    },
    {
      icon: <Smartphone size={18} />,
      title: "Mentora Mobile App",
      desc: "Access bite players, quick quizzes, and notifications directly on native iOS/Android devices."
    }
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
      transition: { type: "spring", stiffness: 100, damping: 20 }
    }
  };

  return (
    <motion.section 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="py-28 px-6 lg:px-10 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6">
            Product Roadmap
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-foreground">
            Future of <span className="text-primary">Mentora</span>
          </h2>
          <p className="text-sm text-[#94A3B8] max-w-xl mx-auto leading-relaxed">
            A sneak peek at the upcoming AI workforce modules currently in development.
          </p>
        </motion.div>

        {/* Locked Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {futureFeatures.map((feat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -4, scale: 1.01 }}
              className="lp-glass-card p-6 border border-white/5 relative group cursor-not-allowed flex flex-col justify-between overflow-hidden"
              style={{ minHeight: 200 }}
            >
              {/* Overlay glow */}
              <div className="absolute inset-0 bg-primary/1 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div>
                {/* Icon & Lock row */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-9 h-9 rounded-xl bg-secondary/15 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                    {feat.icon}
                  </div>
                  <div className="w-7 h-7 rounded-full bg-background border border-border/10 flex items-center justify-center text-muted-foreground/45 group-hover:text-primary group-hover:border-primary/20 transition-all">
                    <Lock size={12} />
                  </div>
                </div>

                <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                  {feat.title}
                </h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {feat.desc}
                </p>
              </div>

              {/* Tag indicator */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase tracking-wider">
                  Coming Soon
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
