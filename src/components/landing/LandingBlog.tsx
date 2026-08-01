import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Calendar, Clock, ArrowRight, BookOpen } from "lucide-react";

export function LandingBlog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "AI & ML", "Learning Science", "Future of Work"];

  const articles = [
    {
      id: 1,
      title: "The Rise of Agentic AI in Enterprise Workflows",
      category: "AI & ML",
      readTime: "6 min read",
      date: "Oct 24, 2026",
      desc: "How autonomous AI agents are transitioning from simple chat assistants into proactive operational coordinators that execute complex, multi-step actions.",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: 2,
      title: "Context Engineering: The Real Secret to Accurate LLMs",
      category: "AI & ML",
      readTime: "8 min read",
      date: "Oct 18, 2026",
      desc: "Why fine-tuning is often overkill. Explore how semantic RAG indexing and clean metadata boundaries eliminate corporate context drift.",
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: 3,
      title: "Micro-learning: Applying Cognitive Load Theory to Frontlines",
      category: "Learning Science",
      readTime: "5 min read",
      date: "Sep 29, 2026",
      desc: "How structured 1-minute visual bytes improve operational memory retention compared to traditional 30-slide employee training courses.",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: 4,
      title: "Prompt Engineering Mastery for Non-Technical Operators",
      category: "AI & ML",
      readTime: "4 min read",
      date: "Sep 12, 2026",
      desc: "A beginner-friendly guide to chain-of-thought prompting. Learn how system prompts and few-shot formatting generate reliable SOP summaries.",
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: 5,
      title: "Tribal Knowledge: The Hidden Enterprise Risk",
      category: "Future of Work",
      readTime: "7 min read",
      date: "Aug 22, 2026",
      desc: "What happens when key technicians retire? Read how collaborative Q&A exchanges capture and verify field procedures before it is too late.",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: 6,
      title: "Designing Gamified Frameworks for Industrial Learning",
      category: "Learning Science",
      readTime: "6 min read",
      date: "Jul 15, 2026",
      desc: "Streaks, badges, and skill passports. Inspect howTata and enterprise manufacturers incentivize safety SOP compliance through gamified mechanics.",
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80"
    }
  ];

  const filteredArticles = articles.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          art.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || art.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-6 lg:px-10 xl:px-16 pt-32 pb-24 text-foreground relative z-10"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto mb-16">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6">
          <BookOpen size={12} /> Resource Center
        </span>
        <h1 className="text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
          Mentora <span className="text-primary">Insights</span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Deep dives into learning science, generative AI application, and tribal knowledge capture.
        </p>
      </motion.div>

      {/* Filters & Search Row */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12"
      >
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 p-1 bg-secondary/10 border border-border/10 rounded-2xl max-w-max">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === cat ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md w-full">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search insights..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-secondary/10 border border-border/10 focus:border-primary/50 focus:bg-secondary/20 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-foreground outline-none transition-all placeholder:text-muted-foreground"
          />
        </div>
      </motion.div>

      {/* Grid of Articles */}
      <motion.div 
        layout
        variants={containerVariants}
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredArticles.map(art => (
            <motion.div
              layout
              key={art.id}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{ y: -5 }}
              className="lp-glass-card group flex flex-col justify-between overflow-hidden cursor-pointer"
            >
              <div>
                {/* Cover Image */}
                <div className="h-48 w-full overflow-hidden relative border-b border-border/5 bg-muted">
                  <img
                    src={art.image}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-4 left-4 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider">
                    {art.category}
                  </span>
                </div>

                <div className="p-6">
                  {/* Date & Read time */}
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-mono mb-4">
                    <span className="flex items-center gap-1"><Calendar size={11} /> {art.date}</span>
                    <span className="flex items-center gap-1"><Clock size={11} /> {art.readTime}</span>
                  </div>

                  <h3 className="text-base font-bold text-foreground mb-3 leading-snug group-hover:text-primary transition-colors">
                    {art.title}
                  </h3>

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-6">
                    {art.desc}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-border/5 mt-auto flex items-center gap-1 text-[11px] font-bold text-primary group-hover:gap-2 transition-all">
                Read Article <ArrowRight size={13} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {filteredArticles.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 text-muted-foreground text-sm"
        >
          No articles found matching "{searchQuery}" under {activeCategory}.
        </motion.div>
      )}
    </motion.div>
  );
}
