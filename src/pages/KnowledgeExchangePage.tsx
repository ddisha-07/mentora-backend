import React, { useState, useEffect } from 'react';
import { HelpCircle, MessageSquare, ArrowUp, Check, Award, PlusCircle, X } from 'lucide-react';
import { mockService } from '../services/mockData';
import { KnowledgeQuestion, KnowledgeAnswer } from '../types';
import { StatusBadge, AnswerTypeBadge } from '../components/reusable';

export default function KnowledgeExchangePage() {
  const [questions, setQuestions] = useState<KnowledgeQuestion[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<KnowledgeQuestion | null>(null);
  const [answers, setAnswers] = useState<KnowledgeAnswer[]>([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [askModalOpen, setAskModalOpen] = useState(false);

  // New question form states
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTopic, setNewTopic] = useState('General');

  useEffect(() => {
    mockService.fetchQuestions().then(data => setQuestions(data));
  }, []);

  const handleSelectQuestion = async (q: KnowledgeQuestion) => {
    setSelectedQuestion(q);
    setLoadingAnswers(true);
    try {
      const data = await mockService.fetchAnswers(q.id);
      setAnswers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAnswers(false);
    }
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newQ: KnowledgeQuestion = {
      id: Date.now(),
      title: newTitle,
      description: newDesc,
      author: 'Disha Shree', // Current Mock User
      department: 'Software Engineering',
      topic: newTopic,
      status: 'open',
      createdAt: 'Just now'
    };

    setQuestions(prev => [newQ, ...prev]);
    setNewTitle('');
    setNewDesc('');
    setNewTopic('General');
    setAskModalOpen(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <HelpCircle className="text-primary" size={24} /> Knowledge Exchange
          </h2>
          <p className="text-muted-foreground text-sm">Ask operational questions, receive expert answers, and verify solutions.</p>
        </div>
        <button
          onClick={() => setAskModalOpen(true)}
          className="bg-primary text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/95 transition-all flex items-center gap-1.5 active:scale-95 shadow-lg shadow-primary/20"
        >
          <PlusCircle size={15} /> Ask a Question
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Questions List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Recent Q&A Threads</h3>
          <div className="space-y-3">
            {questions.map(q => (
              <div
                key={q.id}
                onClick={() => handleSelectQuestion(q)}
                className={`bg-card border rounded-2xl p-5 hover:border-primary/30 transition-all cursor-pointer ${selectedQuestion?.id === q.id ? 'border-primary/50 bg-primary/2' : 'border-border'}`}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground font-semibold">
                    {q.topic}
                  </span>
                  <StatusBadge status={q.status} />
                </div>
                <h4 className="text-sm font-bold text-foreground hover:text-primary transition-colors leading-snug mb-2">
                  {q.title}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                  {q.description}
                </p>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/40 pt-3">
                  <span>Asked by <strong className="text-foreground">{q.author}</strong> ({q.department})</span>
                  <span>{q.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Thread Details & Answers */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Question Thread Details</h3>
          {selectedQuestion ? (
            <div className="bg-card border border-border rounded-2xl p-5 space-y-5">
              <div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-semibold">{selectedQuestion.topic}</span>
                <h4 className="text-base font-bold text-foreground mt-2 leading-snug">{selectedQuestion.title}</h4>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed whitespace-pre-wrap">{selectedQuestion.description}</p>
                <div className="text-[10px] text-muted-foreground mt-4 flex justify-between">
                  <span>Author: {selectedQuestion.author}</span>
                  <span>{selectedQuestion.createdAt}</span>
                </div>
              </div>

              <div className="border-t border-border/50 pt-4 space-y-4">
                <h5 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare size={13} /> Answers ({answers.length})
                </h5>

                {loadingAnswers ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-5 h-5 rounded-full border border-t-primary border-r-transparent animate-spin" />
                  </div>
                ) : answers.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic text-center py-4">No answers yet. Share your knowledge!</p>
                ) : (
                  <div className="space-y-3">
                    {answers.map(ans => (
                      <div key={ans.id} className="p-3 rounded-xl border border-border bg-background space-y-2 relative overflow-hidden">
                        {ans.verified && (
                          <div className="absolute top-0 right-0 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-bl text-[8px] font-bold border-l border-b border-emerald-500/20 flex items-center gap-0.5">
                            <Check size={8} /> Verified
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold text-foreground">{ans.author}</span>
                          <span className="text-[9px] text-muted-foreground">{ans.authorRole}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{ans.content}</p>
                        {ans.source && (
                          <p className="text-[9px] text-primary/70 font-mono">Source: {ans.source}</p>
                        )}
                        <div className="flex items-center justify-between border-t border-border/40 pt-2 text-[10px] text-muted-foreground">
                          <button className="flex items-center gap-1 text-primary bg-primary/5 hover:bg-primary/10 px-2 py-0.5 rounded transition-all">
                            <ArrowUp size={10} /> Helpful ({ans.helpfulCount})
                          </button>
                          <AnswerTypeBadge type={ans.answerType} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border border-dashed rounded-2xl p-8 text-center text-muted-foreground">
              <MessageSquare size={32} className="mx-auto mb-3 opacity-50" />
              <p className="text-xs">Select a question thread from the list to view expert answers and participate.</p>
            </div>
          )}
        </div>
      </div>

      {/* Ask Question Modal Placeholder */}
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
                  <option value="Database Schema & Coding">Database & Coding</option>
                  <option value="General Ops">General Ops</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-foreground">Details & Context</label>
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
