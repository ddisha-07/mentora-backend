import React, { useState, useEffect } from 'react';
import { Database, Search, FileText, ExternalLink, ShieldCheck, Bookmark, ArrowRight, Star, TrendingUp, FolderOpen, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../App';
import { Card, PageHeader, EmptyState } from '../components/reusable';
import { supabase } from '../lib/supabaseClient';

export default function KnowledgePage({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [search, setSearch] = useState('');
  const { preservedKnowledge, savedItems, activeMissions, completeMission, toggleBookmark, setSelectedSopId } = useApp();
  
  const [articles, setArticles] = useState<any[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'All' | 'SOP' | 'Preserved' | 'Bookmarks'>('All');

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const { data, error } = await supabase
          .from("knowledge_articles")
          .select("*")
          .eq("is_preserved", false)
          .order("id", { ascending: true });
        
        if (!error && data) {
          setArticles(data);
        }
      } catch (err) {
        console.error("Error loading knowledge articles:", err);
      } finally {
        setLoadingArticles(false);
      }
    };
    loadArticles();
  }, []);

  const activeHubMission = (activeMissions || []).find(
    (m: any) => m.status === 'in_progress' && (m.type === 'SOP_READING' || m.type === 'EXPERIENCE_SHARING')
  );

  const handleToggleBookmark = async (article: any) => {
    await toggleBookmark({
      id: String(article.id),
      type: 'sop',
      title: article.title,
      desc: article.isPreserved ? `Preserved by expert ${article.author}.` : `Official document by ${article.author}.`,
      category: 'SOPs',
      page: 'knowledge'
    });
  };

  const isBookmarked = (article: any) => {
    return (savedItems || []).some(x => String(x.id) === String(article.id) && x.type === 'sop');
  };

  const allArticles = [
    ...articles,
    ...(preservedKnowledge || []).map((pk: any) => ({
      id: 'preserved_' + pk.id,
      title: pk.title,
      dept: pk.dept || 'Expert Archive',
      views: pk.views || 45,
      author: pk.author || 'Retired Expert',
      content: pk.content,
      isPreserved: true
    }))
  ];

  const bookmarkedArticles = allArticles.filter(a => isBookmarked(a));

  const filteredArticles = allArticles.filter(a => {
    const matchesSearch = (a.title || "").toLowerCase().includes(search.toLowerCase()) ||
                          (a.content || "").toLowerCase().includes(search.toLowerCase()) ||
                          (a.author || "").toLowerCase().includes(search.toLowerCase());
    
    if (activeCategory === 'SOP') return matchesSearch && !a.isPreserved;
    if (activeCategory === 'Preserved') return matchesSearch && a.isPreserved;
    if (activeCategory === 'Bookmarks') return matchesSearch && isBookmarked(a);
    return matchesSearch;
  });

  const popularArticles = [...allArticles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3);
  const pinnedArticles = allArticles.filter(a => a.isPreserved || isBookmarked(a)).slice(0, 2);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
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
        title="Knowledge Hub"
        description="Search verified Standard Operating Procedures (SOPs), manuals, and preserved legacy knowledge archives."
        breadcrumbs={[{ label: "Mentora" }, { label: "Knowledge" }]}
        primaryAction={{
          label: "Knowledge Exchange Forums",
          onClick: () => onNavigate('knowledge-exchange'),
          icon: <ArrowRight size={14} />
        }}
      />

      {/* Active SOP Daily Mission */}
      {activeHubMission && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="premium-glass-card p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden border border-primary/20"
        >
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" />
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-bold text-primary uppercase tracking-wider">
              🎯 Active Daily Mission
            </span>
            <h4 className="text-sm font-bold text-foreground mt-1.5">{activeHubMission.title}</h4>
            <p className="text-xs text-muted-foreground">{activeHubMission.description}</p>
          </div>
          <button
            onClick={async () => {
              await completeMission(activeHubMission.id);
            }}
            className="px-4 py-2 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl text-xs whitespace-nowrap active:scale-95 transition-all cursor-pointer shadow-md shadow-primary/20"
          >
            Confirm SOP Read / Complete Mission
          </button>
        </motion.div>
      )}

      {/* Search Header Banner */}
      <div className="premium-glass-card p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-2xl mx-auto z-10 text-center py-4 space-y-4">
          <h3 className="text-base font-extrabold text-foreground" style={{ fontFamily: "'Raleway', sans-serif" }}>
            Search Factory SOPs &amp; Technical Manuals
          </h3>
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search by keywords, author names, boiler codes, valve numbers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-secondary/35 border border-border/10 focus:border-primary/30 rounded-2xl pl-12 pr-4 py-3.5 text-xs text-foreground placeholder-muted-foreground w-full outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Categories / Tabs selectors */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
        {([
          { id: 'All', label: 'All Documents' },
          { id: 'SOP', label: 'Official SOPs' },
          { id: 'Preserved', label: 'Preserved Expert Logs' },
          { id: 'Bookmarks', label: 'My Bookmarks' }
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
              activeCategory === tab.id
                ? 'bg-primary text-white shadow-md shadow-primary/25 border-transparent'
                : 'bg-secondary/10 border-border/10 text-muted-foreground hover:text-foreground hover:border-border/30'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main content grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Document feed */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Preserved Archives ({filteredArticles.length})
          </h3>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-3.5"
          >
            {filteredArticles.map(article => (
              <motion.div
                key={article.id}
                variants={itemVariants}
                onClick={() => {
                  const realId = article.id.startsWith('preserved_') ? article.id.replace('preserved_', '') : article.id;
                  setSelectedSopId(realId);
                  onNavigate('sop-detail');
                }}
                className="premium-glass-card p-4.5 flex flex-col justify-between hover:scale-[1.01] transition-all cursor-pointer border border-border/10"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${article.isPreserved ? 'bg-primary/10 text-primary' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      <FileText size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground leading-snug hover:text-primary transition-colors flex items-center gap-2 flex-wrap">
                        {article.title}
                        {article.isPreserved ? (
                          <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 border border-primary/20 rounded-full font-bold flex items-center gap-0.5">
                            <Star size={8} className="fill-primary" /> Preserved Expert Log
                          </span>
                        ) : (
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 border border-emerald-500/20 rounded-full font-bold flex items-center gap-0.5">
                            <ShieldCheck size={8} /> Official SOP
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Dept: {article.department || article.dept} &bull; Contributor: {article.author}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-muted-foreground flex-shrink-0">
                    <span>{article.views} views</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleBookmark(article);
                      }}
                      className="p-1.5 rounded-xl bg-secondary/20 border border-border/10 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                      title="Bookmark Article"
                    >
                      <Bookmark size={12} className={isBookmarked(article) ? "fill-primary text-primary" : ""} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredArticles.length === 0 && (
              <EmptyState
                title="No documents matched"
                message="Try adjusting your filters, clearing your search fields, or explore other directories."
                icon={<Search size={24} />}
                actionText="Reset Search"
                onAction={() => {
                  setSearch('');
                  setActiveCategory('All');
                }}
              />
            )}
          </motion.div>
        </div>

        {/* Right Col: Directories & Preservation details */}
        <div className="space-y-6">
          {/* Standard Directories */}
          <div className="premium-glass-card p-5 space-y-4">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2" style={{ fontFamily: "'Raleway', sans-serif" }}>
              <FolderOpen size={16} className="text-primary" /> Standard Directories
            </h4>
            <div className="space-y-2">
              {[
                { name: 'Safety & EHS SOPs', count: 14 },
                { name: 'Mechanical Maintenance', count: 22 },
                { name: 'Electrical & PLC Manuals', count: 18 },
                { name: 'Software Architecture Guides', count: 8 },
                { name: 'Preserved Legacy Logs', count: articles.length + (preservedKnowledge?.length || 0) }
              ].map(dir => (
                <button
                  key={dir.name}
                  onClick={() => setSearch(dir.name === 'Preserved Legacy Logs' ? 'Preserved Q&A' : dir.name)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-border/10 bg-secondary/5 hover:bg-secondary/15 text-xs text-muted-foreground hover:text-foreground transition-all text-left cursor-pointer"
                >
                  <span>{dir.name}</span>
                  <span className="bg-secondary/30 px-2 py-0.5 rounded border border-border/10 text-[9px] font-mono font-bold text-foreground">{dir.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Popular Documents */}
          <div className="premium-glass-card p-5 space-y-4">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2" style={{ fontFamily: "'Raleway', sans-serif" }}>
              <TrendingUp size={16} className="text-primary" /> Popular SOPs
            </h4>
            <div className="space-y-3.5">
              {popularArticles.map(article => (
                <div
                  key={article.id}
                  onClick={() => {
                    const realId = article.id.startsWith('preserved_') ? article.id.replace('preserved_', '') : article.id;
                    setSelectedSopId(realId);
                    onNavigate('sop-detail');
                  }}
                  className="group cursor-pointer space-y-1"
                >
                  <h5 className="text-xs font-bold text-foreground leading-snug group-hover:text-primary transition-all line-clamp-1">
                    {article.title}
                  </h5>
                  <div className="flex justify-between items-center text-[10px] text-muted-foreground font-mono">
                    <span>By {article.author}</span>
                    <span className="font-bold">{article.views} views</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legacy Preservation Info */}
          <div className="premium-glass-card p-5 space-y-3.5 border border-primary/10">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2" style={{ fontFamily: "'Raleway', sans-serif" }}>
              <Star size={16} className="text-primary" /> Expert Preservation
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Retired experts and senior managers verify troubleshooting logs in the community forum. Once verified, answers are archived as community SOP updates.
            </p>
            <div className="bg-primary/5 border border-primary/10 p-3.5 rounded-xl text-[10px] text-muted-foreground leading-relaxed">
              <strong>Knowledge Loop Engine:</strong> Automatic pipeline indexes verified questions into our AI model, scaling operational wisdom across plant networks.
            </div>
          </div>
        </div>

      </div>

    </motion.div>
  );
}
