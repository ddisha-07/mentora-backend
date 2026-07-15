import React, { useState, useEffect } from 'react';
import {
  HelpCircle, MessageSquare, ArrowUp, Check, Award, PlusCircle, X, Search,
  Filter, Bookmark, AlertCircle, ShieldCheck, Share2, Compass, Heart, Archive, Send
} from 'lucide-react';
import { useApp } from '../../App';
import { KnowledgeQuestion, KnowledgeAnswer, UserRole } from '../types';
import { StatusBadge, AnswerTypeBadge, Card } from '../components/reusable';

export default function KnowledgeExchangePage() {
  const {
    profile,
    knowledgeQuestions,
    setKnowledgeQuestions,
    knowledgeAnswers,
    setKnowledgeAnswers,
    preservedKnowledge,
    setPreservedKnowledge
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
  const [savedQuestionIds, setSavedQuestionIds] = useState<number[]>([402]); // Initial mock bookmark

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

  // 1. MOCK EXPERTS DIRECTORY
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

  // Sync answers when selectedQuestion changes or global knowledgeAnswers updates
  useEffect(() => {
    if (selectedQuestion) {
      const list = knowledgeAnswers[selectedQuestion.id] || [];
      setAnswers(list);
    }
  }, [selectedQuestion, knowledgeAnswers]);

  // Handle Q&A selection
  const handleSelectQuestion = (q: KnowledgeQuestion) => {
    setSelectedQuestion(q);
  };

  // Toggle bookmark / saved state
  const toggleBookmark = (id: number) => {
    setSavedQuestionIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Ask Question Submission
  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newQ: KnowledgeQuestion = {
      id: Date.now(),
      title: newTitle,
      description: newDesc,
      author: activeProfile.name || 'Anonymous',
      department: activeProfile.department || 'Operations',
      topic: newTopic,
      status: 'open',
      createdAt: 'Just now'
    };

    // If they selected AI topic, we immediately mock generate an AI answer as well!
    const qAnswers: KnowledgeAnswer[] = [];
    if (newDesc.toLowerCase().includes('ai') || newTitle.toLowerCase().includes('ai') || newTopic === 'AI Exploration') {
      qAnswers.push({
        id: Date.now() + 1,
        questionId: newQ.id,
        author: 'Mentora AI Assistant 🤖',
        authorRole: 'Core Platform AI Model',
        content: `Based on internal manuals and document databases:
1. Verify LOTO override pins are cleared.
2. Confirm the Modbus registry is configured for RS-485 at 9600 Baud.
3. If this requires expert inspection, click the 'Escalate to Expert' button.`,
        answerType: 'ai_generated',
        verified: false,
        helpfulCount: 0
      });
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
  };

  // Submit Answer / Follow-up
  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestion || !newAnswerText.trim()) return;

    let ansType: any = 'standard';
    if (userRole === 'SENIOR_EMPLOYEE') ansType = 'senior_employee';
    if (userRole === 'RETIRED_EMPLOYEE') ansType = 'retired_expert';
    if (isSopSource) ansType = 'based_on_sop';

    const newAns: KnowledgeAnswer = {
      id: Date.now(),
      questionId: selectedQuestion.id,
      author: activeProfile.name || 'Expert Contributor',
      authorRole: `${activeProfile.designation || 'Specialist'} (${activeProfile.department})`,
      content: newAnswerText,
      answerType: ansType,
      verified: isExpert, // Automatically verified if submitted by Senior/Retired Expert
      helpfulCount: 0,
      source: isSopSource ? (sopSourceText || 'Standard SOP Reference') : undefined
    };

    setKnowledgeAnswers(prev => ({
      ...prev,
      [selectedQuestion.id]: [...(prev[selectedQuestion.id] || []), newAns]
    }));

    // If it is the first answer, update the question status
    setKnowledgeQuestions(prev =>
      prev.map(q => q.id === selectedQuestion.id ? { ...q, status: 'resolved' } : q)
    );

    setNewAnswerText('');
    setIsSopSource(false);
    setSopSourceText('');
  };

  // Mark answer helpful
  const handleMarkHelpful = (answerId: number) => {
    if (!selectedQuestion) return;
    setKnowledgeAnswers(prev => {
      const qAnswers = prev[selectedQuestion.id] || [];
      return {
        ...prev,
        [selectedQuestion.id]: qAnswers.map(ans =>
          ans.id === answerId ? { ...ans, helpfulCount: ans.helpfulCount + 1 } : ans
        )
      };
    });
  };

  // Verify Answer Flow
  const handleVerifyAnswer = (answerId: number) => {
    if (!selectedQuestion) return;
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
  };

  // Escalate to Expert Flow
  const handleEscalateQuestion = () => {
    if (!selectedQuestion) return;
    setKnowledgeQuestions(prev =>
      prev.map(q => q.id === selectedQuestion.id ? { ...q, status: 'open' } : q)
    );
    alert('Question has been escalated to Expert! It is now listed under Unanswered questions.');
  };

  // Preserve in Knowledge Base Flow
  const handlePreserveKnowledge = (ans: KnowledgeAnswer) => {
    if (!selectedQuestion) return;
    const newPreserved = {
      id: ans.id,
      title: selectedQuestion.title,
      dept: selectedQuestion.department,
      views: 12,
      author: ans.author,
      content: ans.content
    };
    setPreservedKnowledge((prev: any[]) => [...(prev || []), newPreserved]);
    alert('Valuable answer successfully preserved in Knowledge Hub Base! Sync complete.');
  };

  // Filter Q&A questions list
  const filteredQuestions = (knowledgeQuestions || []).filter(q => {
    // 1. Search Query
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          q.description.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Department filter
    const matchesDept = deptFilter === 'All' || q.department === deptFilter;

    // 3. Topic filter
    const matchesTopic = topicFilter === 'All' || q.topic === topicFilter;

    // 4. Sub-Tab filters
    const answersList = knowledgeAnswers[q.id] || [];
    let matchesTab = true;
    if (qaSubTab === 'unanswered') {
      matchesTab = answersList.length === 0 || q.status === 'open';
    } else if (qaSubTab === 'verified') {
      matchesTab = answersList.some(ans => ans.verified);
    } else if (qaSubTab === 'my_questions') {
      matchesTab = q.author === activeProfile.name;
    } else if (qaSubTab === 'saved') {
      matchesTab = savedQuestionIds.includes(q.id);
    }

    return matchesSearch && matchesDept && matchesTopic && matchesTab;
  });

  // Filter legacy directory experts
  const filteredExperts = MOCK_EXPERTS.filter(exp =>
    exp.name.toLowerCase().includes(legacySearch.toLowerCase()) ||
    exp.expertise.some(e => e.toLowerCase().includes(legacySearch.toLowerCase()))
  );

  // Expert Console values
  const matchingExpertiseQuestions = (knowledgeQuestions || []).filter(q =>
    q.status === 'open' &&
    activeProfile.expertise &&
    activeProfile.expertise.some((e: string) => q.title.toLowerCase().includes(e.toLowerCase()) || q.topic.toLowerCase().includes(e.toLowerCase()))
  );

  const waitingForYouQuestions = (knowledgeQuestions || []).filter(q =>
    q.status === 'open' && q.department === activeProfile.department
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <HelpCircle className="text-primary" size={24} /> Knowledge Exchange
          </h2>
          <p className="text-muted-foreground text-sm flex items-center gap-1.5">
            Two-way collaborative forum: learn from experts, preserve legacy operations, and verify answers.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setAskModalOpen(true)}
            className="bg-primary text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/95 transition-all flex items-center gap-1.5 active:scale-95 shadow-lg shadow-primary/20"
          >
            <PlusCircle size={15} /> Ask a Question
          </button>
        </div>
      </div>

      {/* Main navigation tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveMainTab('exchange')}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 ${activeMainTab === 'exchange' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Q&amp;A Board
        </button>
        <button
          onClick={() => setActiveMainTab('legacy')}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 ${activeMainTab === 'legacy' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Legacy Experts Directory
        </button>
        {isExpert && (
          <button
            onClick={() => setActiveMainTab('expert_console')}
            className={`px-5 py-3 text-xs font-bold transition-all border-b-2 ${activeMainTab === 'expert_console' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            🛠️ Expert Console
          </button>
        )}
      </div>

      {/* VIEW 1: Q&A BOARD */}
      {activeMainTab === 'exchange' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-wrap gap-4 items-center justify-between bg-card/45 border border-border p-4 rounded-2xl">
            <div className="relative w-full md:w-64">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search questions..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-foreground placeholder-muted-foreground w-full outline-none focus:border-primary/50 transition-all"
              />
            </div>

            <div className="flex items-center gap-3 overflow-x-auto max-w-full pb-1">
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-semibold">
                <Filter size={12} /> Filter:
              </div>
              <select
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
                className="bg-background border border-border rounded-lg px-2.5 py-1 text-[10px] text-foreground outline-none"
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
                className="bg-background border border-border rounded-lg px-2.5 py-1 text-[10px] text-foreground outline-none"
              >
                <option value="All">All Topics</option>
                <option value="Safety Procedures">Safety</option>
                <option value="Database Schema & Coding">Database &amp; Coding</option>
                <option value="Turbine Diagnostics">Turbines</option>
                <option value="General Ops">General Ops</option>
              </select>
            </div>
          </div>

          {/* Sub-navigation categories */}
          <div className="flex gap-2 items-center overflow-x-auto pb-1 max-w-full">
            {[
              { id: 'all', label: 'All Questions' },
              { id: 'unanswered', label: 'Unanswered' },
              { id: 'verified', label: 'Expert Verified' },
              { id: 'my_questions', label: 'My Questions' },
              { id: 'saved', label: 'Saved Discussions' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setQaSubTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all ${qaSubTab === tab.id ? 'bg-primary text-white' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Questions list */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Q&amp;A Threads ({filteredQuestions.length})
              </h3>
              <div className="space-y-3">
                {filteredQuestions.map(q => {
                  const answersList = knowledgeAnswers[q.id] || [];
                  const isSaved = savedQuestionIds.includes(q.id);

                  return (
                    <div
                      key={q.id}
                      onClick={() => handleSelectQuestion(q)}
                      className={`bg-card border rounded-2xl p-5 hover:border-primary/20 transition-all cursor-pointer relative ${selectedQuestion?.id === q.id ? 'border-primary/50' : 'border-border'}`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(q.id);
                        }}
                        className={`absolute top-4 right-4 text-xs ${isSaved ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        <Bookmark size={15} className={isSaved ? 'fill-primary' : ''} />
                      </button>

                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[9px] px-2 py-0.5 rounded bg-background border border-border text-muted-foreground font-semibold">
                          {q.topic}
                        </span>
                        <StatusBadge status={q.status} />
                      </div>

                      <h4 className="text-sm font-bold text-foreground hover:text-primary transition-colors leading-snug mb-2 pr-6">
                        {q.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                        {q.description}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/50 pt-3">
                        <span>Asked by <strong className="text-foreground">{q.author}</strong> ({q.department})</span>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-0.5">💬 {answersList.length} Answers</span>
                          <span>{q.createdAt}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredQuestions.length === 0 && (
                  <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-card/20">
                    <HelpCircle size={40} className="text-border mx-auto mb-3" />
                    <h4 className="text-sm font-bold mb-1 text-foreground">No questions found</h4>
                    <p className="text-muted-foreground text-xs">Try launching a different filter or posting your question!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Selected question detail */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Thread Workspace</h3>
              {selectedQuestion ? (
                <div className="bg-card border border-border rounded-2xl p-5 space-y-5 relative">
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[9px] px-2 py-0.5 rounded bg-background border border-border text-muted-foreground font-semibold">{selectedQuestion.topic}</span>
                      <button
                        onClick={() => toggleBookmark(selectedQuestion.id)}
                        className={`text-xs ${savedQuestionIds.includes(selectedQuestion.id) ? 'text-primary' : 'text-muted-foreground'}`}
                      >
                        <Bookmark size={15} className={savedQuestionIds.includes(selectedQuestion.id) ? 'fill-primary' : ''} />
                      </button>
                    </div>
                    <h4 className="text-base font-bold text-foreground mt-3 leading-snug">{selectedQuestion.title}</h4>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed whitespace-pre-wrap">{selectedQuestion.description}</p>
                    <div className="text-[10px] text-muted-foreground mt-4 flex justify-between border-b border-border/50 pb-3">
                      <span>Author: {selectedQuestion.author} ({selectedQuestion.department})</span>
                      <span>{selectedQuestion.createdAt}</span>
                    </div>
                  </div>

                  {/* Answers Section */}
                  <div className="space-y-4">
                    <h5 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1">
                      <MessageSquare size={13} /> Responses ({answers.length})
                    </h5>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {answers.map(ans => (
                        <div key={ans.id} className="p-3.5 rounded-xl border border-border bg-background space-y-2.5 relative overflow-hidden">
                          {ans.verified && (
                            <div className="absolute top-0 right-0 bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-bl text-[8px] font-bold border-l border-b border-emerald-500/20 flex items-center gap-0.5">
                              <Check size={8} strokeWidth={3} /> Verified
                            </div>
                          )}

                          <div className="flex justify-between items-center gap-3">
                            <div>
                              <span className="text-[10px] font-bold text-foreground">{ans.author}</span>
                              <span className="text-[9px] text-muted-foreground block">{ans.authorRole}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {/* Verify Answer CTA visible to experts */}
                              {isExpert && !ans.verified && (
                                <button
                                  onClick={() => handleVerifyAnswer(ans.id)}
                                  className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/25 transition-all"
                                >
                                  Verify
                                </button>
                              )}
                              {/* Preserve in knowledge base CTA visible to experts */}
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

                          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{ans.content}</p>

                          {ans.source && (
                            <p className="text-[9px] text-primary/70 font-mono bg-primary/5 p-1 px-2 rounded border border-primary/10">
                              📋 Source: {ans.source}
                            </p>
                          )}

                          <div className="flex items-center justify-between border-t border-border/40 pt-2 text-[10px] text-muted-foreground">
                            <button
                              onClick={() => handleMarkHelpful(ans.id)}
                              className="flex items-center gap-1 text-primary bg-primary/5 hover:bg-primary/10 px-2.5 py-0.5 rounded transition-all"
                            >
                              <ArrowUp size={10} /> Helpful ({ans.helpfulCount})
                            </button>
                            <AnswerTypeBadge type={ans.answerType} />
                          </div>

                          {/* Escalate button next to AI answers */}
                          {ans.answerType === 'ai_generated' && selectedQuestion.status !== 'open' && (
                            <button
                              onClick={handleEscalateQuestion}
                              className="w-full text-center text-[9px] text-rose-400 hover:text-rose-300 font-bold bg-rose-500/10 border border-rose-500/20 py-1.5 rounded-lg transition-all"
                            >
                              Unsatisfied with AI? Escalate to Expert
                            </button>
                          )}
                        </div>
                      ))}

                      {answers.length === 0 && (
                        <p className="text-xs text-muted-foreground italic text-center py-4">No answers yet. Share your knowledge below!</p>
                      )}
                    </div>
                  </div>

                  {/* Submission form */}
                  <form onSubmit={handleSubmitAnswer} className="border-t border-border/50 pt-4 space-y-3">
                    <h5 className="text-[10px] uppercase font-bold text-foreground">Post Your Answer / Insight</h5>
                    <textarea
                      rows={3}
                      placeholder="Type your explanation, override steps, or legacy logs here..."
                      value={newAnswerText}
                      onChange={e => setNewAnswerText(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl p-3 text-xs text-foreground outline-none focus:border-primary/50 transition-colors resize-none"
                    />

                    {/* SOP Toggle checkbox */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSopSource}
                          onChange={e => setIsSopSource(e.target.checked)}
                          className="rounded bg-background border-border text-primary focus:ring-0"
                        />
                        <span>Check if citing an official SOP / Manual</span>
                      </label>
                      {isSopSource && (
                        <input
                          placeholder="e.g. Standard Operations Boiler Manual, Section 14"
                          value={sopSourceText}
                          onChange={e => setSopSourceText(e.target.value)}
                          className="w-full bg-background border border-border rounded-lg p-2 text-[10px] text-foreground outline-none"
                        />
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 transition-all active:scale-95"
                    >
                      <Send size={11} /> Submit Answer
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-card border border-border border-dashed rounded-2xl p-8 text-center text-muted-foreground">
                  <MessageSquare size={32} className="mx-auto mb-3 opacity-50" />
                  <p className="text-xs">Select a question thread from the list to view expert answers, verify solutions, or submit insights.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: LEGACY DIRECTORY */}
      {activeMainTab === 'legacy' && (
        <div className="space-y-6">
          <div className="bg-card/45 border border-border p-4 rounded-2xl max-w-md">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search experts by name, department, or expertise..."
                value={legacySearch}
                onChange={e => setLegacySearch(e.target.value)}
                className="bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-foreground placeholder-muted-foreground w-full outline-none focus:border-primary/50 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExperts.map(exp => (
              <Card key={exp.id} className="p-5 flex flex-col justify-between space-y-4 hover:border-primary/20 transition-all">
                <div className="space-y-3">
                  <div className="flex gap-3 items-center">
                    <img src={exp.avatar} alt={exp.name} className="w-12 h-12 rounded-full object-cover border border-border" />
                    <div>
                      <h4 className="text-sm font-bold text-foreground leading-tight">{exp.name}</h4>
                      <p className="text-[10px] text-primary font-semibold mt-0.5">{exp.formerDesignation}</p>
                      <p className="text-[9px] text-muted-foreground">{exp.department}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] text-muted-foreground uppercase font-semibold">Expertise Domains</span>
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {exp.expertise.map(t => (
                        <span key={t} className="text-[9px] px-2 py-0.5 rounded bg-background border border-border text-foreground font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Recognition Badges */}
                  <div className="space-y-1">
                    <span className="text-[9px] text-muted-foreground uppercase font-semibold">Honorable Badges</span>
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {exp.badges.map(b => (
                        <span key={b} className="text-[9px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded-full font-bold">
                          🏅 {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[10px] border-t border-border/50 pt-3 mt-1">
                  <div>
                    <span className="text-muted-foreground block text-[8px]">Answers</span>
                    <strong className="text-foreground text-xs">{exp.questionsAnswered}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[8px]">Verified</span>
                    <strong className="text-emerald-400 text-xs">{exp.verifiedAnswers}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[8px]">Helped</span>
                    <strong className="text-primary text-xs">{exp.employeesHelped}</strong>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: EXPERT CONSOLE */}
      {activeMainTab === 'expert_console' && isExpert && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main workspace widgets */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Knowledge Mission */}
            <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 p-5 rounded-2xl space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl" />
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-primary uppercase tracking-wider">
                💡 Expert Daily Challenge
              </div>
              <h4 className="text-sm font-bold text-foreground">Today's Knowledge Mission</h4>
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
                    className="bg-card border border-border hover:border-primary/20 p-4 rounded-2xl cursor-pointer transition-all flex justify-between items-center gap-4"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-foreground line-clamp-1">{q.title}</h4>
                      <p className="text-[10px] text-muted-foreground mt-1">Asked in: {q.topic} &bull; Date: {q.createdAt}</p>
                    </div>
                    <span className="text-[9px] font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded-lg flex-shrink-0">
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
            <div className="space-y-4 border-t border-border/50 pt-6">
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
                    className="bg-card border border-border hover:border-primary/20 p-4 rounded-2xl cursor-pointer transition-all flex justify-between items-center gap-4"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-foreground line-clamp-1">{q.title}</h4>
                      <p className="text-[10px] text-muted-foreground mt-1">Tags match your skill profile</p>
                    </div>
                    <span className="text-[9px] font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded-lg flex-shrink-0">
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

          {/* Right column: Recent contributions */}
          <div className="space-y-6">
            <Card className="p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2">
                Your Recent Contributions
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-background border border-border rounded-xl space-y-1">
                  <h4 className="text-[10px] font-bold text-emerald-400">✓ Expert Verified</h4>
                  <p className="text-[11px] text-foreground leading-tight line-clamp-2">"Uneven thermal rotor shafts will resolve when slowly turned at 2 RPM using barring gears..."</p>
                  <span className="text-[9px] text-muted-foreground block mt-1">Topic: Turbine oscillations</span>
                </div>
                <div className="p-3 bg-background border border-border rounded-xl space-y-1">
                  <h4 className="text-[10px] font-bold text-primary">Peer Approved</h4>
                  <p className="text-[11px] text-foreground leading-tight line-clamp-2">"Verify isolated breakers first before manually rotating override valve handles..."</p>
                  <span className="text-[9px] text-muted-foreground block mt-1">Topic: LOTOoverride overrides</span>
                </div>
              </div>
            </Card>

            {/* Impact stats */}
            <Card className="p-5 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Expert Impact summary</h3>
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
            </Card>
          </div>
        </div>
      )}

      {/* Ask Question Modal */}
      {askModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-foreground">Ask a New Question</h3>
              <button onClick={() => setAskModalOpen(false)} className="text-muted-foreground hover:text-foreground">
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
                  className="w-full bg-background border border-border rounded-xl p-3 text-foreground outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-foreground">Topic Category</label>
                <select
                  value={newTopic}
                  onChange={e => setNewTopic(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl p-3 text-foreground outline-none focus:border-primary/50"
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
                  className="w-full bg-background border border-border rounded-xl p-3 text-foreground outline-none focus:border-primary/50 transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/95 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-primary/20"
              >
                Post Question
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
