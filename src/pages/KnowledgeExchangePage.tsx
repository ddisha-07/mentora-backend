import React, { useState } from 'react';
import { 
  MessageSquare, Heart, Plus, Send, Zap, Award, Flame, 
  HelpCircle, Sparkles, Trophy, BookOpen, Clock, UserCheck, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../App';
import { PageHeader, Card } from '../components/reusable';

interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  time: string;
}

interface Post {
  id: string;
  author: string;
  avatar: string;
  role: string;
  time: string;
  title: string;
  content: string;
  tags: string[];
  likes: number;
  liked: boolean;
  comments: Comment[];
}

export default function KnowledgeExchangePage() {
  const { profile, user } = useApp();

  const activeProfile = profile || {
    name: user?.email?.split('@')[0] || "Disha Test",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop&auto=format",
    role: "junior_employee"
  };

  const [posts, setPosts] = useState<Post[]>([
    {
      id: "post-1",
      author: "Rohan Das",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&auto=format",
      role: "Learner",
      time: "2 hours ago",
      title: "Autogen vs LangGraph for Multi-Agent Systems?",
      content: "Just completed the Agentic AI track! Multi-agent coordination with planning loops is a game changer. Has anyone run LangGraph in production? Curious about how you handle state sync across asynchronous agent runs.",
      tags: ["AgenticAI", "LangGraph", "Architecture"],
      likes: 24,
      liked: false,
      comments: [
        {
          id: "c-1",
          author: "Sarah Chen",
          avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=60&h=60&fit=crop&auto=format",
          content: "LangGraph is great because of its cycle support. In production, we persist state using a Redis database to handle long-running agent threads.",
          time: "1 hour ago"
        },
        {
          id: "c-2",
          author: "Arjun Mehta",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&auto=format",
          content: "Agree with Sarah. LangGraph gives you much finer control over execution paths than AutoGen's conversational model.",
          time: "45 mins ago"
        }
      ]
    },
    {
      id: "post-2",
      author: "Dr. Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=60&h=60&fit=crop&auto=format",
      role: "EHS Director / Expert",
      time: "5 hours ago",
      title: "Defending Against System Instruction Overrides",
      content: "Always validate LLM instructions at the application/routing layer. System prompts alone are vulnerable to sophisticated jailbreaking. Using a lighter guardrail model to screen inputs first works wonders.",
      tags: ["Security", "PromptEngineering", "BestPractices"],
      likes: 42,
      liked: true,
      comments: [
        {
          id: "c-3",
          author: "Puneet Malhotra",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop&auto=format",
          content: "This is super useful! Do you have a recommended guardrail framework you use for Python pipelines?",
          time: "3 hours ago"
        }
      ]
    },
    {
      id: "post-3",
      author: "Amrita Sen",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&auto=format",
      role: "Runner Up",
      time: "1 day ago",
      title: "Few-Shot Output Formatting reliability",
      content: "Check out this quick tip: enclosing your expected JSON outputs in XML tags (e.g., <output_json>...</output_json>) inside the prompt makes structural parsing 10x more reliable for open-source Llama-3 models.",
      tags: ["PromptEngineering", "LLM", "Formatting"],
      likes: 18,
      liked: false,
      comments: []
    }
  ]);

  const [recentQuestions] = useState([
    { id: "q-1", title: "How to handle rate limiting in OpenRouter API calls?", replies: 4 },
    { id: "q-2", title: "Configuring LOTO override sequences safely in PLC scripts?", replies: 2 },
    { id: "q-3", title: "Prompt caching optimization strategies for Anthropic?", replies: 7 }
  ]);

  const [learningTips] = useState([
    "Review daily SOPs inside the Knowledge Hub to earn additional XP weekly.",
    "Use XML delimiter structures in LLM prompts to isolate user inputs safely.",
    "Enable prompt caching in API calls to reduce inference latency by 50%."
  ]);

  const [topContributors] = useState([
    { name: "Devendra Prasad", role: "Emeritus Advisor", contributions: 142, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&auto=format" },
    { name: "Dr. Sarah Chen", role: "EHS Safety Director", contributions: 95, avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=40&h=40&fit=crop&auto=format" }
  ]);

  const [recentAchievements] = useState([
    { name: "Pune Board Rank #7", icon: "🏆", date: "Today" },
    { name: "12-Day Streak Champion", icon: "🔥", date: "Yesterday" },
    { name: "LOTO Expert Verified", icon: "🛡️", date: "2 days ago" }
  ]);

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTagsString, setNewTagsString] = useState("");

  // Comment state maps
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          likes: p.liked ? p.likes - 1 : p.likes + 1,
          liked: !p.liked
        };
      }
      return p;
    }));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const parsedTags = newTagsString
      .split(",")
      .map(t => t.trim())
      .filter(t => t !== "");

    const newPost: Post = {
      id: "post-" + Date.now(),
      author: activeProfile.name || activeProfile.full_name || "Disha Test",
      avatar: activeProfile.avatar || activeProfile.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop&auto=format",
      role: activeProfile.role?.replace('_', ' ') || "Learner",
      time: "Just now",
      title: newTitle,
      content: newContent,
      tags: parsedTags.length > 0 ? parsedTags : ["Discussion"],
      likes: 0,
      liked: false,
      comments: []
    };

    setPosts([newPost, ...posts]);
    setNewTitle("");
    setNewContent("");
    setNewTagsString("");
    setModalOpen(false);
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId] || "";
    if (!text.trim()) return;

    const newComment: Comment = {
      id: "c-" + Date.now(),
      author: activeProfile.name || activeProfile.full_name || "Disha Test",
      avatar: activeProfile.avatar || activeProfile.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop&auto=format",
      content: text,
      time: "Just now"
    };

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [...p.comments, newComment]
        };
      }
      return p;
    }));

    setCommentInputs(prev => ({ ...prev, [postId]: "" }));
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto relative min-h-[calc(100vh-80px)] pb-24">
      {/* Page Header */}
      <PageHeader
        title="Community Hub"
        description="Share prompts, discuss agent workflows, resolve operational hurdles, and learn with peers."
        breadcrumbs={[{ label: "Mentora" }, { label: "Community" }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Discussion Feed */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-base font-extrabold text-foreground flex items-center gap-2" style={{ fontFamily: "'Raleway', sans-serif" }}>
            <MessageSquare size={16} className="text-primary" /> Active Discussions
          </h3>

          <div className="space-y-6">
            <AnimatePresence>
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="premium-glass-card p-6 border border-white/5 space-y-4 hover:border-white/10 transition-all duration-300"
                >
                  {/* Header info */}
                  <div className="flex items-center gap-3">
                    <img src={post.avatar} alt="Author" className="w-10 h-10 rounded-full object-cover bg-muted border border-white/5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-foreground">{post.author}</span>
                        <span className="text-[8px] bg-white/5 border border-white/10 text-muted-foreground px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          {post.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5 font-semibold">
                        <Clock size={11} /> {post.time}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h4 className="text-lg font-extrabold text-foreground tracking-tight" style={{ fontFamily: "'Raleway', sans-serif" }}>
                      {post.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {post.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-bold text-primary bg-primary/5 border border-primary/15 px-2 py-0.5 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions (Like/Comment buttons) */}
                  <div className="flex items-center gap-4 pt-3 border-t border-white/5 text-xs text-muted-foreground font-bold">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1.5 hover:text-red-400 transition-colors cursor-pointer ${
                        post.liked ? "text-red-500" : ""
                      }`}
                    >
                      <Heart size={14} fill={post.liked ? "currentColor" : "none"} />
                      <span>{post.likes} Likes</span>
                    </button>
                    
                    <button
                      onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                      className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer"
                    >
                      <MessageSquare size={14} />
                      <span>{post.comments.length} Comments</span>
                    </button>
                  </div>

                  {/* Comments expanded section */}
                  {activeCommentPostId === post.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="pt-4 border-t border-white/5 space-y-4"
                    >
                      {/* Comments list */}
                      {post.comments.length > 0 && (
                        <div className="space-y-3 pl-3 border-l-2 border-white/5">
                          {post.comments.map(c => (
                            <div key={c.id} className="flex gap-2.5 items-start text-xs">
                              <img src={c.avatar} alt="Commenter" className="w-6 h-6 rounded-full object-cover bg-muted border border-white/5" />
                              <div className="flex-1 space-y-1 bg-white/[0.01] border border-white/5 rounded-xl p-2.5">
                                <div className="flex justify-between items-center">
                                  <span className="font-extrabold text-foreground">{c.author}</span>
                                  <span className="text-[9px] text-muted-foreground font-mono">{c.time}</span>
                                </div>
                                <p className="text-muted-foreground leading-relaxed">{c.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Comment Input */}
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={commentInputs[post.id] || ""}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                          className="flex-1 bg-secondary/35 border border-border/10 focus:border-primary/25 rounded-xl px-4 py-2 text-xs text-foreground placeholder-muted-foreground transition-all"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="w-8 h-8 rounded-xl bg-primary hover:bg-primary/95 flex items-center justify-center text-white cursor-pointer active:scale-95 transition-all"
                        >
                          <Send size={13} fill="currentColor" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Widgets */}
        <div className="space-y-6">
          
          {/* Weekly Challenge */}
          <Card className="p-5 relative overflow-hidden border border-yellow-500/10 bg-gradient-to-br from-yellow-500/[0.02] to-transparent">
            <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/[0.03] rounded-full blur-2xl pointer-events-none" />
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[9px] font-black uppercase text-yellow-500 tracking-wider">
                ⚡ Weekly Challenge
              </span>
              <h4 className="text-base font-extrabold text-foreground leading-tight" style={{ fontFamily: "'Raleway', sans-serif" }}>
                Build an Agent for Rate Limits
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Design an autonomous agent routing loop that automatically recovers from `RESOURCE_EXHAUSTED` (429) API calls. Share your prompt/config post!
              </p>
              <div className="flex justify-between items-center pt-2 text-[10px] text-yellow-500 font-bold">
                <span>Reward: +500 XP</span>
                <span>Closes in 3 days</span>
              </div>
            </div>
          </Card>

          {/* Recent Questions */}
          <Card className="p-5 space-y-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <HelpCircle size={14} className="text-[#FF2B8A]" /> Recent Questions
            </h4>
            <div className="space-y-3">
              {recentQuestions.map((q) => (
                <div key={q.id} className="group cursor-pointer hover:bg-white/[0.02] p-2 -mx-2 rounded-xl transition-all">
                  <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {q.title}
                  </p>
                  <span className="text-[9px] text-muted-foreground font-semibold mt-1 block">
                    {q.replies} replies
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Learning Tips */}
          <Card className="p-5 space-y-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles size={14} className="text-cyan-400 animate-pulse" /> Learning Tips
            </h4>
            <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
              {learningTips.map((tip, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <p>{tip}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Contributors */}
          <Card className="p-5 space-y-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Award size={14} className="text-purple-400" /> Top Contributors
            </h4>
            <div className="space-y-3.5">
              {topContributors.map((c) => (
                <div key={c.name} className="flex items-center gap-3">
                  <img src={c.avatar} alt={c.name} className="w-8 h-8 rounded-full object-cover bg-muted border border-white/5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold text-foreground truncate">{c.name}</p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold truncate">{c.role}</p>
                  </div>
                  <div className="text-[10px] text-purple-400 font-bold">
                    {c.contributions} helping acts
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Achievements */}
          <Card className="p-5 space-y-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Trophy size={14} className="text-orange-400" /> Recent Achievements
            </h4>
            <div className="space-y-3">
              {recentAchievements.map((a) => (
                <div key={a.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{a.icon}</span>
                    <span className="text-muted-foreground">{a.name}</span>
                  </div>
                  <span className="text-[9px] text-muted-foreground/55 font-mono">{a.date}</span>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>

      {/* Floating Start Discussion Action Button */}
      <div className="fixed bottom-6 right-6 z-[999]">
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-gradient-to-r from-[#FF2B8A] to-[#7C3AED] text-white text-xs font-extrabold shadow-lg shadow-pink-500/25 cursor-pointer"
          style={{ fontFamily: "'Raleway', sans-serif" }}
        >
          <Plus size={16} strokeWidth={3} /> Start a Discussion
        </motion.button>
      </div>

      {/* Start Discussion Dialogue Dialog Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="premium-glass-card w-full max-w-lg p-6 border border-white/10 relative overflow-hidden shadow-2xl"
            >
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles size={11} /> New Discussion
                </span>
                <h3 className="text-xl font-extrabold text-foreground mt-2 tracking-tight" style={{ fontFamily: "'Raleway', sans-serif" }}>
                  Start a Conversation
                </h3>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1 font-bold">Discussion Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prompt caching latency savings"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-secondary/35 border border-border/10 focus:border-primary/25 rounded-xl px-4 py-2.5 text-xs text-foreground placeholder-muted-foreground transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground block mb-1 font-bold">Description / Question Details</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide details about your query or learning tips..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full bg-secondary/35 border border-border/10 focus:border-primary/25 rounded-xl px-4 py-2.5 text-xs text-foreground placeholder-muted-foreground transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground block mb-1 font-bold">Category Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Prompting, Safety, SCADA"
                    value={newTagsString}
                    onChange={(e) => setNewTagsString(e.target.value)}
                    className="w-full bg-secondary/35 border border-border/10 focus:border-primary/25 rounded-xl px-4 py-2.5 text-xs text-foreground placeholder-muted-foreground transition-all"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/95 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-primary/10"
                  >
                    Post Discussion
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
