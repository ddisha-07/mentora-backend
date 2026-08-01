import { motion } from "motion/react";
import { Sparkles, Brain, Code, Target, Award, Rocket, CheckCircle, ShieldAlert } from "lucide-react";

export function LandingAbout() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 20 }
    }
  };

  const timelineItems = [
    { year: "2024", title: "Idea Conception", desc: "Recognized massive skill silos and operational documentation gaps across manufacturing plants." },
    { year: "2025", title: "Kai AI Alpha Release", desc: "Launched contextual LLM indexing pipelines connecting legacy PDF manuals directly to frontline chats." },
    { year: "2026", title: "Mentora Launch", desc: "Partnered with enterprise companies to deliver structured learning journeys and mini-projects." }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-6 lg:px-10 xl:px-16 pt-32 pb-24 text-foreground relative z-10"
    >
      {/* About Hero */}
      <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto mb-20">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6">
          <Brain size={12} /> Designing the Future of Workforce Knowledge
        </span>
        <h1 className="text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
          Aligning operational <span className="text-primary">intelligence</span> at scale.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Mentora is a collaborative learning and knowledge exchange engine built specifically to solve information fragmentation and skill gaps in modern enterprises.
        </p>
      </motion.div>

      {/* Mission & Vision */}
      <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-8 mb-24">
        <div className="lp-glass-card p-8 relative overflow-hidden flex flex-col justify-between" style={{ minHeight: 280 }}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full filter blur-xl" />
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
            <Target size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-3">Our Mission</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              To empower workers and operators with instant access to exact procedural knowledge, converting legacy static manuals into personalized learning bites and interactive simulations.
            </p>
          </div>
        </div>

        <div className="lp-glass-card p-8 relative overflow-hidden flex flex-col justify-between" style={{ minHeight: 280 }}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/5 rounded-full filter blur-xl" />
          <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 flex items-center justify-center text-[#22D3EE] mb-6">
            <Rocket size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-3">Our Vision</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              A zero-friction workplace environment where tribal knowledge is captured instantly, and learning is context-driven, game-ified, and integrated directly into the flow of daily work.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Problems We Solve */}
      <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-16 items-center mb-28">
        <div>
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">Why Mentora Exists</h2>
          <p className="text-muted-foreground leading-relaxed mb-8 text-sm">
            Operational settings are plagued by fragmented databases, unrecorded tribal walkthroughs, and static LMS configurations that fail to support real-time procedural questions. Mentora connects the dots.
          </p>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400 mt-1">
                <CheckCircle size={12} />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Shatter Skill Silos</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Capture operational knowledge from veterans and verify it dynamically with AI.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400 mt-1">
                <CheckCircle size={12} />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Real-time SOP Verification</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Let technicians verify steps, tag safety parameters, and take situational quizzes.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="lp-glass-card p-6 border border-white/5 relative">
          <div className="absolute inset-0 bg-primary/2 rounded-3xl pointer-events-none" />
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <ShieldAlert size={18} className="text-primary" /> Key Structural Problems Solved
          </h3>
          <div className="space-y-4">
            {[
              { title: "Static SOP PDF Overload", desc: "Manuals sit unread on local shared drives. Mentora breaks them down into 1-minute digestible Learning Bites." },
              { title: "Loss of Tribal Knowledge", desc: "Retiring staff leaves documentation gaps. Mentora allows quick, verified Q&A entries in a shared hub." },
              { title: "Generic LMS Fatigue", desc: "Traditional courses feel irrelevant. Mentora customizes paths based on exact local plant layout profiles." }
            ].map((p, i) => (
              <div key={i} className="p-4 rounded-xl bg-secondary/5 border border-border/5">
                <h5 className="font-bold text-xs text-foreground mb-1">{p.title}</h5>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Meet Kai Section */}
      <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-16 items-center mb-28">
        <div className="order-2 lg:order-1 lp-glass-card p-6 border border-white/5 relative max-w-lg mx-auto w-full">
          <div className="flex items-center gap-3 border-b border-border/10 pb-4 mb-4">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Kai AI</h4>
              <span className="text-[10px] text-emerald-400 font-medium">Online · Operational Brain</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-secondary/10 border border-border/5 text-xs text-muted-foreground max-w-[85%]">
              Hey! I've loaded the maintenance manuals for Boiler Room 4. Ask me anything about valve calibrations or tagout bypass rules.
            </div>
            <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-foreground max-w-[85%] ml-auto">
              How do I bypass the secondary solenoid control switch on the Plant 2 Modbus registers?
            </div>
            <div className="p-3.5 rounded-2xl bg-secondary/10 border border-border/5 text-xs text-muted-foreground max-w-[90%]">
              Under <span className="font-semibold text-primary">SOP-14.2 (LOTO overrides)</span>, you must verify the main manifold pressure matches 0 psi first, apply the tag, and then change the register <span className="font-mono bg-background px-1 py-0.5 rounded text-cyan-400">0x00F2</span> to 0.
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <span className="text-xs text-primary font-bold tracking-wider uppercase mb-2 block">AI Assistant</span>
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">Meet Kai</h2>
          <p className="text-muted-foreground leading-relaxed text-sm">
            Kai is Mentora's context-aware cognitive layer. Unlike generic conversational search tools, Kai reads, indexes, and structures your organization's internal files, SOPs, and guidelines—giving employees direct, context-specific learning bites.
          </p>
        </div>
      </motion.div>

      {/* Timeline Section */}
      <motion.div variants={itemVariants} className="mb-24">
        <h2 className="text-3xl lg:text-4xl font-bold text-center mb-16">Our Journey</h2>
        <div className="relative border-l border-border/10 max-w-2xl mx-auto pl-8 space-y-12">
          {timelineItems.map((item, index) => (
            <div key={index} className="relative">
              <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-background border border-primary flex items-center justify-center z-10">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
              <span className="text-xs text-primary font-mono font-bold">{item.year}</span>
              <h4 className="text-lg font-bold text-foreground mt-1 mb-2">{item.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
