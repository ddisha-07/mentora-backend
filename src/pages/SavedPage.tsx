import React, { useState, useEffect } from 'react';
import { Bookmark, Search, Trash2, ArrowRight, BookOpen, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { useApp } from '../../App';
import { Card, EmptyState, SkeletonLoader } from '../components/reusable';
import { supabase } from '../lib/supabaseClient';

export default function SavedPage({ onNavigate }: { onNavigate: (p: any) => void }) {
  const { profile, savedItems, setSavedItems, toggleBookmark, setSelectedSopId, courses, knowledgeQuestions, user } = useApp();

  const activeProfile = profile || {
    name: 'Learner',
    role: 'JUNIOR_EMPLOYEE',
    department: 'Software Engineering'
  };

  // State management
  const [subTab, setSubTab] = useState<'all' | 'course' | 'sop' | 'question' | 'recording' | 'ai_usecase'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamic resolution state for database resolution of bookmarks
  const [sopsList, setSopsList] = useState<any[]>([]);
  const [resolving, setResolving] = useState(true);

  // Fetch SOPs on mount and when savedItems changes
  useEffect(() => {
    const fetchSops = async () => {
      setResolving(true);
      try {
        const { data, error } = await supabase
          .from("knowledge_articles")
          .select("*");
        if (!error && data) {
          setSopsList(data);
        }
      } catch (err) {
        console.error("Error fetching SOPs for resolution:", err);
      } finally {
        setResolving(false);
      }
    };
    fetchSops();
  }, [savedItems]);

  // Resolve savedItems against database/global context lists
  const resolvedItems = (savedItems || []).map((bookmark: any) => {
    if (bookmark.type === 'sop') {
      const matchedSop = sopsList.find(a => String(a.id) === String(bookmark.id));
      if (matchedSop) {
        return {
          id: bookmark.id,
          type: 'sop',
          title: matchedSop.title,
          sopCode: matchedSop.sop_code,
          department: matchedSop.department,
          category: matchedSop.category,
          isOfficial: matchedSop.is_official,
          isPreserved: matchedSop.is_preserved,
          desc: matchedSop.description || (matchedSop.is_preserved ? "Preserved Expert Knowledge" : "Official SOP Document"),
          page: 'knowledge'
        };
      }
    } else if (bookmark.type === 'course') {
      const matchedCourse = (courses || []).find(c => String(c.id) === String(bookmark.id));
      if (matchedCourse) {
        return {
          id: bookmark.id,
          type: 'course',
          title: matchedCourse.title,
          desc: matchedCourse.description,
          category: matchedCourse.category || 'Courses',
          page: 'courses'
        };
      }
    } else if (bookmark.type === 'question') {
      const matchedQuestion = (knowledgeQuestions || []).find(q => String(q.id) === String(bookmark.id));
      if (matchedQuestion) {
        return {
          id: bookmark.id,
          type: 'question',
          title: matchedQuestion.title,
          desc: matchedQuestion.description,
          category: matchedQuestion.topic || 'Knowledge Exchange',
          page: 'knowledge-exchange'
        };
      }
    }
    // Fallback to bookmark fields if not resolved yet
    return {
      id: bookmark.id,
      type: bookmark.type,
      title: bookmark.title,
      desc: bookmark.desc,
      category: bookmark.category,
      page: bookmark.page
    };
  });

  const handleRemove = async (item: any) => {
    await toggleBookmark({
      id: item.id,
      type: item.type,
      title: item.title,
      desc: item.desc,
      category: item.category,
      page: item.page
    });
  };

  // Filter resolved items
  const filteredItems = resolvedItems.filter(item => {
    const matchesSearch = (item.title || "").toLowerCase().includes(search.toLowerCase()) ||
                          (item.desc || "").toLowerCase().includes(search.toLowerCase());
    const matchesTab = subTab === 'all' || item.type === subTab;
    return matchesSearch && matchesTab;
  });

  const handleRefresh = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data: savedData, error: savedErr } = await supabase
        .from("saved_items")
        .select("*")
        .eq("user_id", user.id);

      if (savedErr) throw savedErr;

      if (savedData) {
        const mappedSaved = savedData.map((item: any) => ({
          id: item.item_id,
          type: item.item_type,
          title: item.title,
          desc: item.desc_content,
          category: item.category,
          page: item.page_route
        }));
        setSavedItems(mappedSaved);
      }
    } catch (err: any) {
      console.error("Error refreshing saved items:", err);
      setError(err.message || 'Failed to sync bookmarks from cloud server.');
    } finally {
      setLoading(false);
    }
  };

  // Personalized recommendations database
  const getRecommendations = () => {
    const role = activeProfile.role;
    const dept = activeProfile.department || 'Safety & EHS';

    return [
      {
        id: 'rec_1',
        title: 'Basics of Machine Learning Fundamentals',
        reason: `Because you are a ${role.replace('_', ' ')}: accelerate your core ML literacy skills.`,
        action: 'Enroll',
        page: 'learn'
      },
      {
        id: 'rec_2',
        title: 'SOP-202: Boiler room evacuation limits',
        reason: `Because you work in ${dept}: verify critical high-pressure EHS evacuation gates.`,
        action: 'Read SOP',
        page: 'knowledge'
      },
      {
        id: 'rec_3',
        title: 'Emergency Boiler Safety Calibration',
        reason: 'Bridge Knowledge Gap: training session covers mechanical overrides missing from your log.',
        action: 'View Session',
        page: 'training'
      }
    ];
  };

  const recs = getRecommendations();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bookmark className="text-primary" size={24} /> Bookmarks &amp; Saved
          </h2>
          <p className="text-muted-foreground text-sm">Access your saved courses, SOP manuals, expert Q&amp;As, and AI use cases.</p>
        </div>
        <button
          onClick={handleRefresh}
          className="bg-card border border-border hover:bg-muted text-foreground text-xs font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Sync Cloud Items
        </button>
      </div>

      {/* Error state display */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-start gap-3 text-xs text-rose-400">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold">Sync Synchronization Error</h4>
            <p className="mt-1 opacity-90">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 font-bold underline hover:opacity-100 opacity-80"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Left Bookmarks list, Right Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left pane: Bookmarks list */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search and filters bar */}
          <div className="flex flex-wrap gap-4 items-center justify-between bg-card/45 border border-border p-4 rounded-2xl">
            <div className="relative w-full md:w-64">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search saved items..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-foreground placeholder-muted-foreground w-full outline-none focus:border-primary/50 transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {[
                { id: 'all', label: 'All Saved' },
                { id: 'course', label: 'Courses' },
                { id: 'sop', label: 'SOPs' },
                { id: 'question', label: 'Q&A' },
                { id: 'recording', label: 'Recordings' },
                { id: 'ai_usecase', label: 'AI Models' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSubTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${subTab === tab.id ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* List display */}
          <div className="space-y-3">
            {loading || resolving ? (
              // Skeleton Loader State
              <div className="space-y-4">
                <SkeletonLoader />
                <SkeletonLoader />
              </div>
            ) : filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <div
                  key={item.id}
                  className="bg-card border border-border hover:border-primary/10 rounded-2xl p-4 flex items-center justify-between gap-4 transition-all"
                >
                  <div
                    onClick={() => {
                      if (item.type === 'sop') {
                        setSelectedSopId(item.id);
                        onNavigate('sop-detail');
                      } else {
                        onNavigate(item.page || 'learn');
                      }
                    }}
                    className="flex-1 cursor-pointer space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] bg-background border border-border px-2 py-0.5 rounded font-black text-primary uppercase tracking-wider">
                        {item.category || item.type}
                      </span>
                      {item.type === 'sop' && (
                        <>
                          {item.sopCode && (
                            <span className="text-[8px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                              {item.sopCode}
                            </span>
                          )}
                          {item.isOfficial ? (
                            <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                              Official SOP
                            </span>
                          ) : (
                            <span className="text-[8px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                              Preserved Expert Knowledge
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    <h4 className="text-xs md:text-sm font-bold text-foreground hover:text-primary transition-colors leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-normal line-clamp-1">
                      {item.desc}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRemove(item)}
                    className="p-2 bg-background border border-border hover:border-rose-500/20 text-muted-foreground hover:text-rose-400 rounded-xl transition-all"
                    title="Remove Bookmark"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            ) : (
              // Empty State
              <EmptyState
                title="No saved items found"
                message="Your bookmark list in this category is currently empty. Star items in the library or SOP manuals to track them here."
                actionText="Explore Learning catalog"
                onAction={() => onNavigate('learn')}
              />
            )}
          </div>
        </div>

        {/* Right pane: Personalized Recommendations */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-5">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Sparkles size={14} className="text-primary fill-primary" /> Personalized for You
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Recommendations mapped to your skill passport gaps.</p>
            </div>

            <div className="space-y-4">
              {recs.map(rec => (
                <div key={rec.id} className="p-3 bg-background border border-border rounded-xl space-y-2 text-xs">
                  <span className="text-[8px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Target Suggestion
                  </span>
                  <h4 className="font-bold text-foreground leading-tight">{rec.title}</h4>
                  <p className="text-[10px] text-muted-foreground leading-normal">{rec.reason}</p>
                  <button
                    onClick={() => onNavigate(rec.page as any)}
                    className="w-full bg-card border border-border hover:bg-muted text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 text-foreground transition-all"
                  >
                    {rec.action} <ArrowRight size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
