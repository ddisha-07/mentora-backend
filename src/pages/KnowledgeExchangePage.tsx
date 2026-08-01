import React, { useState, useEffect } from 'react';
import {
  HelpCircle, MessageSquare, ArrowUp, Check, Award, PlusCircle, X, Search,
  Filter, Bookmark, AlertCircle, ShieldCheck, Share2, Compass, Heart, Archive, Send, Sparkles, Bot, Clock, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../App';
import { KnowledgeQuestion, KnowledgeAnswer, UserRole } from '../types';
import { StatusBadge, AnswerTypeBadge, Card, PageHeader, EmptyState } from '../components/reusable';
import { supabase } from '../lib/supabaseClient';

export default function KnowledgeExchangePage() {
  const {
    profile,
    knowledgeQuestions,
    setKnowledgeQuestions,
    knowledgeAnswers,
    setKnowledgeAnswers,
    preservedKnowledge,
    setPreservedKnowledge,
    savedItems,
    setSavedItems,
    activeMissions,
    completeMission,
    toggleBookmark: toggleBookmarkCtx
  } = useApp();

  const activeProfile = profile || {
    name: "Learner",
    role: "JUNIOR_EMPLOYEE" as UserRole,
    department: "Software Engineering",
    expertise: ["React", "TypeScript"]
  };

  const userRole = activeProfile.role as UserRole;
  const isExpert = userRole === 'SENIOR_EMPLOYEE' || userRole === 'RETIRED_EMPLOYEE' || userRole === 'ADMIN';

  // Navigation tabs: exchange, legacy, expert_console
  const [activeMainTab, setActiveMainTab] = useState<'exchange' | 'legacy' | 'expert_console'>('exchange');

  // Q&A sub-tabs: all, unanswered, verified, my_questions, saved
  const [qaSubTab, setQaSubTab] = useState<'all' | 'unanswered' | 'verified' | 'my_questions' | 'saved'>('all');

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [topicFilter, setTopicFilter] = useState('All');

  // Q&A list & thread selection
  const [selectedQuestion, setSelectedQuestion] = useState<KnowledgeQuestion | null>(null);
  const [answers, setAnswers] = useState<KnowledgeAnswer[]>([]);
  
  const savedQuestionIds = (savedItems || [])
    .filter(x => x.type === 'question')
    .map(x => String(x.id));

  // Legacy directory state
  const [legacySearch, setLegacySearch] = useState('');

  // Ask question modal
  const [askModalOpen, setAskModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTopic, setNewTopic] = useState('Safety Procedures');

  // New answer text input
  const [newAnswerText, setNewAnswerText] = useState('');
  const [isSopSource, setIsSopSource] = useState(false);
  const [sopSourceText, setSopSourceText] = useState('');

  const MOCK_EXPERTS = [
    {
      id: 'exp_1',
      name: 'Devendra Prasad',
      formerDesignation: 'Emeritus Expert Advisor',
      department: 'Maintenance & Boilers',
      yearsOfExperience: 38,
      expertise: ['Steam Turbines', 'Boiler Systems', 'Valve Override', 'Thermal expansion'],
      contributions: 142,
      questionsAnswered: 110,
      verifiedAnswers: 86,
      employeesHelped: 320,
      badges: ['Emeritus Leader', 'Turbine Oracle', 'Boiler Guru'],
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&auto=format'
    },
    {
      id: 'exp_2',
      name: 'Arjun Mehta',
      formerDesignation: 'Senior Automation Engineer',
      department: 'Robotics R&D',
      yearsOfExperience: 14,
      expertise: ['PLC Modbus', 'SCADA calibration', 'IIoT Sensors', 'TypeScript'],
      contributions: 84,
      questionsAnswered: 72,
      verifiedAnswers: 45,
      employeesHelped: 180,
      badges: ['SCADA Sage', 'Modbus Wizard'],
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&auto=format'
    },
    {
      id: 'exp_3',
      name: 'Sarah Chen',
      formerDesignation: 'EHS Safety Director',
      department: 'Safety & EHS',
      yearsOfExperience: 18,
      expertise: ['LOTO override', 'Emergency evacuations', 'Industrial hazards'],
      contributions: 95,
      questionsAnswered: 82,
      verifiedAnswers: 60,
      employeesHelped: 240,
      badges: ['Safety Guardian', 'Zero Incident Legend'],
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&auto=format'
    }
  ];

  useEffect(() => {
    if (selectedQuestion) {
      const list = knowledgeAnswers[selectedQuestion.id] || [];
      setAnswers(list);
    }
  }, [selectedQuestion, knowledgeAnswers]);

  const handleSelectQuestion = (q: KnowledgeQuestion) => {
    setSelectedQuestion(q);
  };

  const toggleBookmark = async (q: KnowledgeQuestion) => {
    await toggleBookmarkCtx({
      id: String(q.id),
      type: 'question',
      title: q.title,
      desc: q.description || `Question posted by ${q.author}.`,
      category: 'Knowledge Exchange',
      page: 'knowledge-exchange'
    });
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("You must be logged in to ask questions.");
        return;
      }

      const newQuestionRecord = {
        title: newTitle,
        description: newDesc,
        user_id: user.id,
        author_name: activeProfile.name || 'Anonymous',
        department: activeProfile.department || 'Operations',
        topic: newTopic,
        status: 'open'
      };

      const { data: insertedQ, error: qErr } = await supabase
        .from("questions")
        .insert(newQuestionRecord)
        .select()
        .single();

      if (qErr) throw qErr;

      if (insertedQ) {
        const newQ: KnowledgeQuestion = {
          id: insertedQ.id,
          title: insertedQ.title,
          description: insertedQ.description,
          author: insertedQ.author_name,
          department: insertedQ.department || 'Operations',
          topic: insertedQ.topic || 'Safety Procedures',
          status: insertedQ.status || 'open',
          createdAt: 'Just now'
        };

        const qAnswers: KnowledgeAnswer[] = [];
        
        if (newDesc.toLowerCase().includes('ai') || newTitle.toLowerCase().includes('ai') || newTopic === 'AI Exploration') {
          const aiAnsRecord = {
            question_id: insertedQ.id,
            author_id: null,
            author_name: 'Mentora AI Assistant 🤖',
            author_role: 'Core Platform AI Model',
            content: `Based on internal manuals and document databases:
1. Verify LOTO override pins are cleared.
2. Confirm the Modbus registry is configured for RS-485 at 9600 Baud.
3. If this requires expert inspection, click the 'Escalate to Expert' button.`,
            answer_type: 'ai_generated',
            verified: false,
            helpful_count: 0
          };

          const { data: insertedAI, error: aiErr } = await supabase
            .from("answers")
            .insert(aiAnsRecord)
            .select()
            .single();

          if (aiErr) throw aiErr;

          if (insertedAI) {
            qAnswers.push({
              id: insertedAI.id,
              questionId: newQ.id,
              author: insertedAI.author_name,
              authorRole: insertedAI.author_role,
              content: insertedAI.content,
              answerType: insertedAI.answer_type,
              verified: insertedAI.verified,
              helpfulCount: insertedAI.helpful_count || 0
            });
          }
        }

        setKnowledgeQuestions(prev => [newQ, ...prev]);
        if (qAnswers.length > 0) {
          setKnowledgeAnswers(prev => ({
            ...prev,
            [newQ.id]: qAnswers
          }));
        }

        setNewTitle('');
        setNewDesc('');
        setNewTopic('Safety Procedures');
        setAskModalOpen(false);
        setSelectedQuestion(newQ);
      }
    } catch (err) {
      console.error("Error creating question:", err);
      alert("Failed to submit question. Please try again.");
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestion || !newAnswerText.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("You must be logged in to submit answers.");
        return;
      }

      let ansType: any = 'standard';
      if (userRole === 'SENIOR_EMPLOYEE') ansType = 'senior_employee';
      if (userRole === 'RETIRED_EMPLOYEE') ansType = 'retired_expert';
      if (isSopSource) ansType = 'based_on_sop';

      const newAnswerRecord = {
        question_id: selectedQuestion.id,
        user_id: user.id,
        author_name: activeProfile.name || 'Expert Contributor',
        author_role: `${activeProfile.designation || 'Specialist'} (${activeProfile.department})`,
        content: newAnswerText,
        answer_type: ansType,
        verified: isExpert,
        helpful_count: 0,
        source: isSopSource ? (sopSourceText || 'Standard SOP Reference') : null
      };

      const { data: insertedAns, error: ansErr } = await supabase
        .from("answers")
        .insert(newAnswerRecord)
        .select()
        .single();

      if (ansErr) throw ansErr;

      if (insertedAns) {
        const newAns: KnowledgeAnswer = {
          id: insertedAns.id,
          questionId: selectedQuestion.id,
          author: insertedAns.author_name,
          authorRole: insertedAns.author_role,
          content: insertedAns.content,
          answerType: insertedAns.answer_type,
          verified: insertedAns.verified,
          helpfulCount: insertedAns.helpful_count || 0,
          source: insertedAns.source
        };

        setKnowledgeAnswers(prev => ({
          ...prev,
          [selectedQuestion.id]: [...(prev[selectedQuestion.id] || []), newAns]
        }));

        if (selectedQuestion.status !== 'resolved') {
          const { error: qErr } = await supabase
            .from("questions")
            .update({ status: 'resolved' })
            .eq("id", selectedQuestion.id);

          if (!qErr) {
            setKnowledgeQuestions(prev =>
              prev.map(q => q.id === selectedQuestion.id ? { ...q, status: 'resolved' } : q)
            );
            setSelectedQuestion(prev => prev ? { ...prev, status: 'resolved' } : null);
          }
        }

        const activeKMission = (activeMissions || []).find(
          (m: any) => m.status === 'in_progress' && m.type === 'KNOWLEDGE_SHARING'
        );
        if (activeKMission) {
          await completeMission(activeKMission.id);
        }

        setNewAnswerText('');
        setIsSopSource(false);
        setSopSourceText('');
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
      alert("Failed to submit answer. Please try again.");
    }
  };

  const handleMarkHelpful = async (answerId: number) => {
    if (!selectedQuestion) return;
    try {
      const qAnswers = knowledgeAnswers[selectedQuestion.id] || [];
      const targetAns = qAnswers.find(ans => ans.id === answerId);
      if (!targetAns) return;

      const nextHelpfulCount = (targetAns.helpfulCount || 0) + 1;

      const { error } = await supabase
        .from("answers")
        .update({ helpful_count: nextHelpfulCount })
        .eq("id", answerId);

      if (error) throw error;

      setKnowledgeAnswers(prev => {
        const currentAnswers = prev[selectedQuestion.id] || [];
        return {
          ...prev,
          [selectedQuestion.id]: currentAnswers.map(ans =>
            ans.id === answerId ? { ...ans, helpfulCount: nextHelpfulCount } : ans
          )
        };
      });
    } catch (err) {
      console.error("Error marking answer helpful:", err);
    }
  };

  const handleVerifyAnswer = async (answerId: number) => {
    if (!selectedQuestion) return;
    try {
      const { error } = await supabase
        .from("answers")
        .update({ verified: true, answer_type: 'expert_verified' })
        .eq("id", answerId);

      if (error) throw error;

      setKnowledgeAnswers(prev => {
        const qAnswers = prev[selectedQuestion.id] || [];
        return {
          ...prev,
          [selectedQuestion.id]: qAnswers.map(ans =>
            ans.id === answerId ? { ...ans, verified: true, answerType: 'expert_verified' } : ans
          )
        };
      });
      alert('Answer marked as Expert Verified! Toggled verification badge.');
    } catch (err) {
      console.error("Error verifying answer:", err);
    }
  };

  const handleEscalateQuestion = async () => {
    if (!selectedQuestion) return;
    try {
      const { error } = await supabase
        .from("questions")
        .update({ status: 'open' })
        .eq("id", selectedQuestion.id);

      if (error) throw error;

      setKnowledgeQuestions(prev =>
        prev.map(q => q.id === selectedQuestion.id ? { ...q, status: 'open' } : q)
      );
      setSelectedQuestion(prev => prev ? { ...prev, status: 'open' } : null);
      alert('Question has been escalated to Expert! It is now listed under Unanswered questions.');
    } catch (err) {
      console.error("Error escalating question:", err);
    }
  };

  const handlePreserveKnowledge = async (ans: KnowledgeAnswer) => {
    if (!selectedQuestion) return;
    try {
      const newArticleRecord = {
        id: `sop_${Date.now()}`,
        title: selectedQuestion.title,
        department: selectedQuestion.department || 'Operations',
        author: ans.author,
        content: ans.content,
        is_preserved: true,
        is_official: false
      };

      const { error } = await supabase
        .from("knowledge_articles")
        .insert(newArticleRecord);

      if (error) throw error;

      const newPreserved = {
        id: newArticleRecord.id,
        title: newArticleRecord.title,
        dept: newArticleRecord.department,
        views: 0,
        author: newArticleRecord.author,
        content: newArticleRecord.content
      };
      
      setPreservedKnowledge((prev: any[]) => [...(prev || []), newPreserved]);
      alert('Valuable answer successfully preserved in Knowledge Hub Base! Sync complete.');
    } catch (err) {
      console.error("Error preserving knowledge:", err);
    }
  };

  const filteredQuestions = (knowledgeQuestions || []).filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          q.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'All' || q.department === deptFilter;
    const matchesTopic = topicFilter === 'All' || q.topic === topicFilter;

    const answersList = knowledgeAnswers[q.id] || [];
    let matchesTab = true;
    if (qaSubTab === 'unanswered') {
      matchesTab = answersList.length === 0 || q.status === 'open';
    } else if (qaSubTab === 'verified') {
      matchesTab = answersList.some(ans => ans.verified);
    } else if (qaSubTab === 'my_questions') {
      matchesTab = q.author === activeProfile.name;
    } else if (qaSubTab === 'saved') {
      matchesTab = savedQuestionIds.includes(String(q.id));
    }

    return matchesSearch && matchesDept && matchesTopic && matchesTab;
  });

  const filteredExperts = MOCK_EXPERTS.filter(exp =>
    exp.name.toLowerCase().includes(legacySearch.toLowerCase()) ||
    exp.expertise.some(e => e.toLowerCase().includes(legacySearch.toLowerCase()))
  );

  const matchingExpertiseQuestions = (knowledgeQuestions || []).filter(q =>
    q.status === 'open' &&
    activeProfile.expertise &&
    activeProfile.expertise.some((e: string) => q.title.toLowerCase().includes(e.toLowerCase()) || q.topic.toLowerCase().includes(e.toLowerCase()))
  );

  const waitingForYouQuestions = (knowledgeQuestions || []).filter(q =>
    q.status === 'open' && q.department === activeProfile.department
  );

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
        title="Knowledge Exchange"
        description="Collaborative forum where plant workers post operational issues, AI proposes drafts, and senior experts verify decisions."
        breadcrumbs={[{ label: "Mentora" }, { label: "Exchange" }]}
        primaryAction={{
          label: "Ask a Question",
          onClick: () => setAskModalOpen(true),
          icon: <PlusCircle size={14} />
        }}
      />

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-border/15">
        {[
          { id: 'exchange', label: 'Q&A Discussion Board' },
          { id: 'legacy', label: 'Legacy Experts Directory' },
          { id: 'expert_console', label: 'Expert Workspace Console', hide: !isExpert }
        ].map(tab => {
          if (tab.hide) return null;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveMainTab(tab.id as any)}
              className={`px-5 py-3 text-xs font-bold transition-all border-b-2 -mb-px ${
                activeMainTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* VIEW 1: Q&A DISCUSSION BOARD */}
        {activeMainTab === 'exchange' && (
          <motion.div
            key="exchange"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Active Mission Banner */}
            {(() => {
              const activeKMission = (activeMissions || []).find(
                (m: any) => m.status === 'in_progress' && (m.type === 'KNOWLEDGE_SHARING' || m.type === 'MENTORING')
              );
              if (!activeKMission) return null;
              return (
                <div className="premium-glass-card p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden border border-primary/20">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" />
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-bold text-primary uppercase tracking-wider">
                      🎯 Active Daily Mission
                    </span>
                    <h4 className="text-sm font-bold text-foreground mt-1.5">{activeKMission.title}</h4>
                    <p className="text-xs text-muted-foreground">{activeKMission.description}</p>
                  </div>
                  <button
                    onClick={async () => {
                      await completeMission(activeKMission.id);
                    }}
                    className="px-4 py-2 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl text-xs whitespace-nowrap active:scale-95 transition-all cursor-pointer shadow-md shadow-primary/20"
                  >
                    Confirm Completion
                  </button>
                </div>
              );
            })()}

            {/* Filter and search bar */}
            <div className="premium-glass-card p-4 flex flex-wrap gap-4 items-center justify-between">
              <div className="relative w-full md:w-72">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  placeholder="Search discussion threads..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-secondary/35 border border-border/10 focus:border-primary/30 rounded-xl pl-9 pr-4 py-2.5 text-xs text-foreground placeholder-muted-foreground w-full outline-none transition-all"
                />
              </div>

              <div className="flex items-center gap-3 overflow-x-auto max-w-full pb-1">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                  <Filter size={11} /> Filter:
                </div>
                <select
                  value={deptFilter}
                  onChange={e => setDeptFilter(e.target.value)}
                  className="bg-secondary/25 border border-border/10 rounded-lg px-2.5 py-1 text-xs text-foreground outline-none cursor-pointer"
                >
                  <option value="All">All Departments</option>
                  <option value="Software Engineering">Software Eng</option>
                  <option value="Assembly Line A">Assembly Line A</option>
                  <option value="Robotics R&D">Robotics R&D</option>
                  <option value="Maintenance & Boilers">Maintenance</option>
                </select>
                <select
                  value={topicFilter}
                  onChange={e => setTopicFilter(e.target.value)}
                  className="bg-secondary/25 border border-border/10 rounded-lg px-2.5 py-1 text-xs text-foreground outline-none cursor-pointer"
                >
                  <option value="All">All Topics</option>
                  <option value="Safety Procedures">Safety</option>
                  <option value="Database Schema & Coding">Database &amp; Coding</option>
                  <option value="Turbine Diagnostics">Turbines</option>
                  <option value="General Ops">General Ops</option>
                </select>
              </div>
            </div>

            {/* Sub Tabs */}
            <div className="flex gap-2 items-center overflow-x-auto pb-1 max-w-full">
              {[
                { id: 'all', label: 'All Discussion Threads' },
                { id: 'unanswered', label: 'Unanswered Gaps' },
                { id: 'verified', label: 'Verified Solutions' },
                { id: 'my_questions', label: 'My Threads' },
                { id: 'saved', label: 'Bookmarks' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setQaSubTab(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all border ${
                    qaSubTab === tab.id
                      ? 'bg-primary/10 text-primary border-primary/20 font-extrabold'
                      : 'bg-secondary/10 border-border/10 text-muted-foreground hover:text-foreground hover:border-border/30'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Discussion feed layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Questions Feed list */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Active Q&amp;A Threads ({filteredQuestions.length})
                </h3>
                
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="space-y-3.5"
                >
                  {filteredQuestions.map(q => {
                    const answersList = knowledgeAnswers[q.id] || [];
                    const isSaved = savedQuestionIds.includes(String(q.id));
                    const isVerified = answersList.some(ans => ans.verified);

                    return (
                      <motion.div
                        key={q.id}
                        variants={itemVariants}
                        onClick={() => handleSelectQuestion(q)}
                        className={`premium-glass-card p-5 cursor-pointer hover:scale-[1.01] transition-all relative ${
                          selectedQuestion?.id === q.id ? 'border-primary/45 shadow-lg shadow-primary/5' : 'border-border/10'
                        }`}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(q);
                          }}
                          className={`absolute top-4 right-4 text-xs ${isSaved ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                          <Bookmark size={15} className={isSaved ? 'fill-primary' : ''} />
                        </button>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] px-2 py-0.5 rounded-md bg-secondary/35 border border-border/10 text-muted-foreground font-bold uppercase tracking-wider">
                              {q.topic}
                            </span>
                            {isVerified ? (
                              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                                <Check size={8} strokeWidth={3} /> Verified Answer
                              </span>
                            ) : (
                              <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                                <Clock size={8} /> Open Gap
                              </span>
                            )}
                          </div>
                          
                          <h4 className="text-sm font-bold text-foreground leading-snug hover:text-primary transition-colors pr-6">
                            {q.title}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {q.description}
                          </p>

                          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium border-t border-border/10 pt-3 mt-2">
                            <span>Asked by {q.author} ({q.department})</span>
                            <span className="flex items-center gap-1">
                              💬 {answersList.length} response{answersList.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {filteredQuestions.length === 0 && (
                    <EmptyState
                      title="No discussions found"
                      message="Try searching for a different phrase or create a new question thread."
                      icon={<HelpCircle size={24} />}
                      actionText="Ask a Question"
                      onAction={() => setAskModalOpen(true)}
                    />
                  )}
                </motion.div>
              </div>

              {/* Right Side: Selected thread preview */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Thread Workspace</h3>
                {selectedQuestion ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="premium-glass-card p-5 space-y-5 border border-border/15 relative"
                  >
                    {/* Selected thread header */}
                    <div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[9px] px-2 py-0.5 rounded bg-secondary/35 border border-border/10 text-muted-foreground font-bold uppercase tracking-wider">
                          {selectedQuestion.topic}
                        </span>
                        <button
                          onClick={() => toggleBookmark(selectedQuestion)}
                          className={`text-xs ${savedQuestionIds.includes(String(selectedQuestion.id)) ? 'text-primary' : 'text-muted-foreground'}`}
                        >
                          <Bookmark size={15} className={savedQuestionIds.includes(String(selectedQuestion.id)) ? 'fill-primary' : ''} />
                        </button>
                      </div>
                      
                      <h4 className="text-base font-bold text-foreground mt-3 leading-snug" style={{ fontFamily: "'Raleway', sans-serif" }}>
                        {selectedQuestion.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed whitespace-pre-wrap">
                        {selectedQuestion.description}
                      </p>
                      
                      <div className="text-[10px] text-muted-foreground mt-4 flex justify-between border-b border-border/10 pb-3.5">
                        <span>By {selectedQuestion.author} ({selectedQuestion.department})</span>
                        <span>{selectedQuestion.createdAt}</span>
                      </div>
                    </div>

                    {/* Answers feed */}
                    <div className="space-y-4">
                      <h5 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <MessageSquare size={13} className="text-primary" /> Responses ({answers.length})
                      </h5>

                      <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                        {answers.map(ans => {
                          const isAI = ans.answerType === 'ai_generated';
                          return (
                            <div
                              key={ans.id}
                              className={`p-4 rounded-xl border relative overflow-hidden transition-all ${
                                isAI
                                  ? 'border-primary/25 bg-gradient-to-br from-primary/5 to-secondary/5 shadow-inner'
                                  : 'border-border/10 bg-secondary/5'
                              }`}
                            >
                              {ans.verified && (
                                <div className="absolute top-0 right-0 bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-bl text-[8px] font-bold border-l border-b border-emerald-500/20 flex items-center gap-0.5">
                                  <Check size={8} strokeWidth={3} /> Verified
                                </div>
                              )}

                              <div className="flex justify-between items-center gap-3">
                                <div className="flex items-center gap-2">
                                  {isAI && <Bot size={14} className="text-primary animate-pulse" />}
                                  <div>
                                    <span className="text-[10px] font-bold text-foreground block">{ans.author}</span>
                                    <span className="text-[9px] text-muted-foreground block leading-tight">{ans.authorRole}</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  {isExpert && !ans.verified && (
                                    <button
                                      onClick={() => handleVerifyAnswer(ans.id)}
                                      className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/25 transition-all"
                                    >
                                      Verify
                                    </button>
                                  )}
                                  {isExpert && ans.verified && (
                                    <button
                                      onClick={() => handlePreserveKnowledge(ans)}
                                      className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20 hover:bg-primary/25 transition-all flex items-center gap-0.5"
                                      title="Archive as SOP"
                                    >
                                      <Archive size={9} /> Preserve
                                    </button>
                                  )}
                                </div>
                              </div>

                              <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap mt-2.5">
                                {ans.content}
                              </p>

                              {ans.source && (
                                <p className="text-[9px] text-primary/70 font-mono bg-primary/5 p-1 px-2 rounded border border-primary/10 mt-2">
                                  📋 Source: {ans.source}
                                </p>
                              )}

                              <div className="flex items-center justify-between border-t border-border/10 pt-2.5 mt-3 text-[10px] text-muted-foreground">
                                <button
                                  onClick={() => handleMarkHelpful(ans.id)}
                                  className="flex items-center gap-1 text-primary bg-primary/5 hover:bg-primary/10 px-2.5 py-0.5 rounded transition-all"
                                >
                                  <ArrowUp size={10} /> Helpful ({ans.helpfulCount})
                                </button>
                                <AnswerTypeBadge type={ans.answerType} />
                              </div>

                              {isAI && selectedQuestion.status !== 'resolved' && (
                                <button
                                  onClick={handleEscalateQuestion}
                                  className="w-full text-center text-[9px] text-rose-400 hover:text-rose-300 font-bold bg-rose-500/10 border border-rose-500/20 py-1.5 rounded-lg transition-all mt-3"
                                >
                                  Unsatisfied with AI? Escalate to Expert
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Answer reply input form */}
                    <form onSubmit={handleSubmitAnswer} className="space-y-3.5 border-t border-border/10 pt-4 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold text-foreground">Post a Response</label>
                        <textarea
                          rows={3}
                          required
                          placeholder="Provide troubleshooting steps, share legacy manual knowledge, or post observations..."
                          value={newAnswerText}
                          onChange={e => setNewAnswerText(e.target.value)}
                          className="w-full bg-secondary/35 border border-border/10 rounded-xl p-3 text-foreground outline-none focus:border-primary/40 transition-colors resize-none text-xs"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="inline-flex items-center gap-2 text-[10px] font-semibold text-muted-foreground cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSopSource}
                            onChange={e => setIsSopSource(e.target.checked)}
                            className="rounded border-border bg-background text-primary focus:ring-primary focus:ring-offset-background"
                          />
                          Reference official SOP or manual source
                        </label>

                        {isSopSource && (
                          <input
                            type="text"
                            required
                            placeholder="e.g. SOP-14.2 Boiler Overrides"
                            value={sopSourceText}
                            onChange={e => setSopSourceText(e.target.value)}
                            className="w-full bg-secondary/35 border border-border/10 rounded-xl p-2.5 text-foreground outline-none text-xs focus:border-primary/40"
                          />
                        )}
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-primary/20"
                      >
                        <Send size={12} /> Submit Response
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  <div className="premium-glass-card p-8 text-center text-muted-foreground border border-border/10">
                    <MessageSquare size={32} className="mx-auto mb-3 opacity-55 text-primary" />
                    <p className="text-xs">Select an active question thread from the left board to view detailed overrides, verify solutions, or submit operations observations.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 2: LEGACY EXPERTS DIRECTORY */}
        {activeMainTab === 'legacy' && (
          <motion.div
            key="legacy"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="premium-glass-card p-4 max-w-md">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  placeholder="Search experts by name, department, or expertise..."
                  value={legacySearch}
                  onChange={e => setLegacySearch(e.target.value)}
                  className="bg-secondary/35 border border-border/10 focus:border-primary/30 rounded-xl pl-9 pr-4 py-2 text-xs text-foreground placeholder-muted-foreground w-full outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExperts.map(exp => (
                <div key={exp.id} className="premium-glass-card p-5 flex flex-col justify-between space-y-4 hover:scale-[1.01] transition-all border border-border/10">
                  <div className="space-y-3.5">
                    <div className="flex gap-3.5 items-center">
                      <img src={exp.avatar} alt={exp.name} className="w-12 h-12 rounded-2xl object-cover border border-border/15" />
                      <div>
                        <h4 className="text-sm font-bold text-foreground leading-tight">{exp.name}</h4>
                        <p className="text-[10px] text-primary font-bold mt-0.5">{exp.formerDesignation}</p>
                        <p className="text-[9px] text-muted-foreground">{exp.department}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Expertise Domains</span>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {exp.expertise.map(t => (
                          <span key={t} className="text-[9px] px-2 py-0.5 rounded-md bg-secondary/35 border border-border/5 text-foreground font-semibold">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Honorable Badges</span>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {exp.badges.map(b => (
                          <span key={b} className="text-[9px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                            🏅 {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] border-t border-border/10 pt-3.5 mt-1 font-medium">
                    <div>
                      <span className="text-muted-foreground block text-[8px] uppercase tracking-wider">Answers</span>
                      <strong className="text-foreground text-xs">{exp.questionsAnswered}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[8px] uppercase tracking-wider">Verified</span>
                      <strong className="text-emerald-400 text-xs">{exp.verifiedAnswers}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[8px] uppercase tracking-wider">Helped</span>
                      <strong className="text-primary text-xs">{exp.employeesHelped}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* VIEW 3: EXPERT CONSOLE */}
        {activeMainTab === 'expert_console' && isExpert && (
          <motion.div
            key="expert_console"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Left Main items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Daily Challenge card */}
              <div className="premium-glass-card p-5 space-y-3 relative overflow-hidden border border-primary/20">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl" />
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-primary uppercase tracking-wider">
                  💡 Expert Daily Challenge
                </div>
                <h4 className="text-sm font-bold text-foreground">Verify Open Gaps</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Review at least 1 open question thread from your department, submit your legacy operations overrides, and mark it verified to earn +20 Knowledge Credits!
                </p>
              </div>

              {/* Questions Waiting for You */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Questions waiting for you ({waitingForYouQuestions.length})
                </h3>
                <div className="space-y-3">
                  {waitingForYouQuestions.map(q => (
                    <div
                      key={q.id}
                      onClick={() => {
                        setSelectedQuestion(q);
                        setActiveMainTab('exchange');
                      }}
                      className="premium-glass-card hover:scale-[1.01] p-4.5 cursor-pointer transition-all flex justify-between items-center gap-4 border border-border/10"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-foreground line-clamp-1">{q.title}</h4>
                        <p className="text-[10px] text-muted-foreground mt-1">Asked in: {q.topic} &bull; Date: {q.createdAt}</p>
                      </div>
                      <span className="text-[9px] font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg flex-shrink-0">
                        Answer Thread
                      </span>
                    </div>
                  ))}
                  {waitingForYouQuestions.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">No open threads waiting in your department.</p>
                  )}
                </div>
              </div>

              {/* Questions matching expertise */}
              <div className="space-y-4 border-t border-border/10 pt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Questions matching your expertise ({matchingExpertiseQuestions.length})
                </h3>
                <div className="space-y-3">
                  {matchingExpertiseQuestions.map(q => (
                    <div
                      key={q.id}
                      onClick={() => {
                        setSelectedQuestion(q);
                        setActiveMainTab('exchange');
                      }}
                      className="premium-glass-card hover:scale-[1.01] p-4.5 cursor-pointer transition-all flex justify-between items-center gap-4 border border-border/10"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-foreground line-clamp-1">{q.title}</h4>
                        <p className="text-[10px] text-muted-foreground mt-1">Tags match your skill profile</p>
                      </div>
                      <span className="text-[9px] font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg flex-shrink-0">
                        Submit Insight
                      </span>
                    </div>
                  ))}
                  {matchingExpertiseQuestions.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">No questions currently match your listed expertise domains.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-6">
              <div className="premium-glass-card p-5 space-y-4 border border-border/10">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/10 pb-2.5">
                  Your Recent Contributions
                </h3>
                <div className="space-y-3.5">
                  <div className="p-3 bg-secondary/15 border border-border/10 rounded-xl space-y-1">
                    <h4 className="text-[9px] font-bold text-emerald-400 flex items-center gap-0.5">✓ Expert Verified</h4>
                    <p className="text-[11px] text-foreground leading-tight line-clamp-2">"Uneven thermal rotor shafts will resolve when slowly turned at 2 RPM using barring gears..."</p>
                    <span className="text-[9px] text-muted-foreground block mt-1">Topic: Turbine oscillations</span>
                  </div>
                  <div className="p-3 bg-secondary/15 border border-border/10 rounded-xl space-y-1">
                    <h4 className="text-[9px] font-bold text-primary flex items-center gap-0.5">Peer Approved</h4>
                    <p className="text-[11px] text-foreground leading-tight line-clamp-2">"Verify isolated breakers first before manually rotating override valve handles..."</p>
                    <span className="text-[9px] text-muted-foreground block mt-1">Topic: LOTO overrides</span>
                  </div>
                </div>
              </div>

              <div className="premium-glass-card p-5 space-y-3.5 border border-border/10">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Expert Impact Summary</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Knowledge Credits</span>
                    <span className="font-bold text-foreground">+{activeProfile.knowledgeCredits || 0} KC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Peer helpful votes</span>
                    <span className="font-bold text-foreground">42 Helpful</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ask Question Dialog Modal */}
      <AnimatePresence>
        {askModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="premium-glass-card border border-border/15 w-full max-w-lg p-6 space-y-4 shadow-2xl overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between pb-3 border-b border-border/10">
                <h3 className="text-base font-extrabold text-foreground" style={{ fontFamily: "'Raleway', sans-serif" }}>Ask a New Question</h3>
                <button onClick={() => setAskModalOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Question Title</label>
                  <input
                    required
                    placeholder="e.g. How to calibrate SCADA sensors in Assembly Line B?"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full bg-secondary/35 border border-border/10 rounded-xl p-3 text-foreground outline-none focus:border-primary/40 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Topic Category</label>
                  <select
                    value={newTopic}
                    onChange={e => setNewTopic(e.target.value)}
                    className="w-full bg-secondary/35 border border-border/10 rounded-xl p-3 text-foreground outline-none cursor-pointer"
                  >
                    <option value="Safety Procedures">Safety Procedures</option>
                    <option value="Mechanical Maintenance">Mechanical Maintenance</option>
                    <option value="Database Schema & Coding">Database &amp; Coding</option>
                    <option value="Turbine Diagnostics">Turbine Diagnostics</option>
                    <option value="AI Exploration">AI Exploration</option>
                    <option value="General Ops">General Ops</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Details &amp; Context</label>
                  <textarea
                    rows={4}
                    placeholder="Describe your issue or question. Provide machine models, error codes, or environment logs."
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    className="w-full bg-secondary/35 border border-border/10 rounded-xl p-3 text-foreground outline-none focus:border-primary/40 transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/20 cursor-pointer active:scale-95"
                >
                  Post Question
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
