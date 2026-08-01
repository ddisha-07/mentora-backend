import React, { useState, useEffect } from 'react';
import {
  Video, Calendar, PlusCircle, Search, Clock, Users, ArrowLeft, Play, FileText,
  CheckCircle, ArrowRight, MessageSquare, Award, ThumbsUp, Send, Check, AlertCircle, Sparkles, HelpCircle, X, Bookmark, Bot, Rss, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../App';
import { Card, PageHeader, EmptyState } from '../components/reusable';
import { UserRole } from '../types';

interface TrainingSession {
  id: number;
  title: string;
  trainer: string;
  date: string;
  time: string;
  duration: string;
  department: string;
  status: 'live' | 'upcoming' | 'completed';
  participants: number;
  description: string;
  objectives: string[];
  resources: { name: string; type: string }[];
  recordingAvailable?: boolean;
}

export default function TrainingPage() {
  const { profile, savedItems, toggleBookmark, onNavigate } = useApp();

  const handleToggleBookmark = async (session: TrainingSession) => {
    await toggleBookmark({
      id: String(session.id),
      type: 'recording',
      title: session.title,
      desc: `Training recording by ${session.trainer || 'L&D Trainer'}.`,
      category: 'Recordings',
      page: 'training'
    });
  };

  const isBookmarked = (session: TrainingSession) => {
    return (savedItems || []).some(x => String(x.id) === String(session.id) && x.type === 'recording');
  };

  const activeProfile = profile || {
    name: 'Learner',
    role: 'JUNIOR_EMPLOYEE' as UserRole,
    department: 'Software Engineering'
  };

  // State Management
  const [activeTab, setActiveTab] = useState<'live_now' | 'upcoming' | 'my_training' | 'completed' | 'recordings'>('upcoming');
  const [search, setSearch] = useState('');
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);
  
  // View states: 'list' | 'details' | 'live_session' | 'post_training'
  const [viewMode, setViewMode] = useState<'list' | 'details' | 'live_session' | 'post_training'>('list');

  // Live session states
  const [chatMessages, setChatMessages] = useState([
    { id: 1, author: 'Sarah Chen', role: 'Trainer', text: 'Welcome everyone! We will begin the safety calibration demo in 2 minutes.' },
    { id: 2, author: 'Ramesh Patel', role: 'Operator', text: 'Ready. Checking gauges from Plant 2.' }
  ]);
  const [newMessageText, setNewMessageText] = useState('');
  const [pollVoted, setPollVoted] = useState(false);
  const [pollResults, setPollResults] = useState({ yes: 70, no: 30 });
  const [taskSubmitted, setTaskSubmitted] = useState(false);
  const [taskResponse, setTaskResponse] = useState('');
  const [taskSubmitOpen, setTaskSubmitOpen] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<'Present' | 'Absent' | 'Partial Attendance'>('Present');

  // AI-generated quiz states
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});

  // Mock database records
  const [sessions, setSessions] = useState<TrainingSession[]>([
    {
      id: 1,
      title: 'Emergency Boiler Safety Calibration Masterclass',
      trainer: 'Sarah Chen',
      date: 'Today',
      time: '10:00 AM (Ongoing)',
      duration: '1h 30m',
      department: 'Safety & EHS',
      status: 'live',
      participants: 42,
      description: 'Critical procedures for calibrating emergency safety release valves and testing overpressure sensors under load.',
      objectives: [
        'Understand overpressure thresholds and SCADA sensor diagnostics.',
        'Calibrate mechanical safety release pins on boiler units.',
        'Properly isolate and tag high pressure lines before relief valves removal.'
      ],
      resources: [
        { name: 'SOP-202 Valve Calibration Guide.pdf', type: 'PDF' },
        { name: 'Boiler Room Evacuation Map.pdf', type: 'PDF' }
      ]
    },
    {
      id: 2,
      title: 'Supabase JWT Auth Security Review',
      trainer: 'Arjun Mehta',
      date: 'Tomorrow',
      time: '2:30 PM',
      duration: '1h 00m',
      department: 'Software Engineering',
      status: 'upcoming',
      participants: 15,
      description: 'Reviewing JWT expiration policies, secure client side token storage, Row-Level Security (RLS) tables, and custom triggers.',
      objectives: [
        'Configure database role-based authorization filters.',
        'Audit client authentication tokens and verify JWT structures.',
        'Write secure RLS policies for profile tables.'
      ],
      resources: [
        { name: 'Supabase Security Hardening Checklist.pdf', type: 'PDF' }
      ]
    },
    {
      id: 3,
      title: 'Legacy Steam Turbine Cooldown Procedures',
      trainer: 'Devendra Prasad',
      date: 'Yesterday',
      time: '3:00 PM',
      duration: '2h 00m',
      department: 'Engineering Maintenance',
      status: 'completed',
      participants: 58,
      description: 'Thermal cooling curves of legacy 1994 steam turbines, preventing rotor shaft bowing, and auxiliary barring gear setups.',
      objectives: [
        'Identify rotor shaft cooling curve threshold levels.',
        'Operate manual hydraulic auxiliary gearing.',
        'Draft turbine safety inspection logs.'
      ],
      resources: [
        { name: 'Rotor Thermal Expansion Specs.pdf', type: 'PDF' }
      ],
      recordingAvailable: true
    }
  ]);

  // Filtering logic
  const filteredSessions = sessions.filter(s => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
                        s.trainer.toLowerCase().includes(search.toLowerCase()) ||
                        s.department.toLowerCase().includes(search.toLowerCase());

    if (activeTab === 'live_now') return matchSearch && s.status === 'live';
    if (activeTab === 'upcoming') return matchSearch && (s.status === 'upcoming' || s.status === 'live');
    if (activeTab === 'my_training') return matchSearch && (s.status === 'live' || s.status === 'upcoming');
    if (activeTab === 'completed') return matchSearch && s.status === 'completed';
    if (activeTab === 'recordings') return matchSearch && s.status === 'completed' && s.recordingAvailable;

    return matchSearch;
  });

  const handleSelectSession = (s: TrainingSession) => {
    setSelectedSession(s);
    setViewMode('details');
  };

  const handleJoinSession = () => {
    setViewMode('live_session');
    setAttendanceStatus('Present');
  };

  const handleLeaveLiveSession = () => {
    setViewMode('post_training');
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    setChatMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        author: activeProfile.name || 'Learner',
        role: activeProfile.role === 'SENIOR_EMPLOYEE' ? 'Senior' : 'Employee',
        text: newMessageText
      }
    ]);
    setNewMessageText('');
  };

  const handleVotePoll = (option: 'yes' | 'no') => {
    setPollVoted(true);
    setPollResults(prev => {
      const total = prev.yes + prev.no + 1;
      const yesVotes = option === 'yes' ? prev.yes + 1 : prev.yes;
      return {
        yes: Math.round((yesVotes / total) * 100),
        no: Math.round(((total - yesVotes) / total) * 100)
      };
    });
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskResponse.trim()) return;
    setTaskSubmitted(true);
    setTaskSubmitOpen(false);
  };

  const handleGradeQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    let score = 0;
    if (quizAnswers[1] === 'c') score += 33;
    if (quizAnswers[2] === 'b') score += 33;
    if (quizAnswers[3] === 'a') score += 34;
    setQuizScore(score);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      <AnimatePresence mode="wait">
        
        {/* VIEW 1: TRAINING LIST VIEW */}
        {viewMode === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Page Header */}
            <PageHeader
              title="Training Hub"
              description="Attend live virtual masterclasses, interact in plant safety webinars, and access previous recording archives."
              breadcrumbs={[{ label: "Mentora" }, { label: "Training" }]}
              primaryAction={{
                label: "Schedule Masterclass",
                onClick: () => alert("Initiating calendar event schedule builder..."),
                icon: <PlusCircle size={14} />
              }}
            />

            {/* Filters panel */}
            <div className="premium-glass-card p-4 flex flex-wrap gap-4 items-center justify-between">
              <div className="relative w-full md:w-72">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  placeholder="Search masterclasses, trainers..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-secondary/35 border border-border/10 focus:border-primary/30 rounded-xl pl-9 pr-4 py-2.5 text-xs text-foreground placeholder-muted-foreground w-full outline-none transition-all"
                />
              </div>

              {/* Tabs list */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                {[
                  { id: 'live_now', label: 'Live Now 🔴' },
                  { id: 'upcoming', label: 'Upcoming sessions' },
                  { id: 'my_training', label: 'My Calendar' },
                  { id: 'completed', label: 'Completed' },
                  { id: 'recordings', label: 'Recordings' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary/10 text-primary border-primary/20'
                        : 'bg-secondary/10 border-border/10 text-muted-foreground hover:text-foreground hover:border-border/30'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sessions Cards Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {filteredSessions.map(session => (
                <motion.div
                  key={session.id}
                  variants={itemVariants}
                  onClick={() => handleSelectSession(session)}
                  className="premium-glass-card p-5 cursor-pointer hover:scale-[1.01] transition-all flex flex-col justify-between h-56 relative overflow-hidden border border-border/10"
                >
                  {session.status === 'live' && (
                    <div className="absolute top-0 right-0 bg-rose-500 text-white px-3 py-1 rounded-bl-xl text-[9px] font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
                      <span className="w-1 h-1 bg-white rounded-full animate-ping" /> Live Session
                    </div>
                  )}
                  {session.recordingAvailable && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleBookmark(session);
                      }}
                      className="absolute top-4 right-4 p-1.5 rounded-xl bg-secondary/35 border border-border/10 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all z-10"
                      title="Bookmark Recording"
                    >
                      <Bookmark size={13} className={isBookmarked(session) ? "fill-primary text-primary" : ""} />
                    </button>
                  )}

                  <div className="space-y-3">
                    <span className="text-[9px] px-2 py-0.5 rounded bg-secondary/35 border border-border/10 text-muted-foreground font-bold uppercase tracking-wider w-fit">
                      {session.department}
                    </span>
                    <h3 className="text-base font-extrabold text-foreground line-clamp-1 leading-snug" style={{ fontFamily: "'Raleway', sans-serif" }}>
                      {session.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {session.description}
                    </p>
                  </div>

                  <div className="border-t border-border/10 pt-3 mt-3 flex items-center justify-between text-xs text-muted-foreground flex-wrap gap-2">
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1"><Clock size={12} className="text-primary" /> {session.duration}</span>
                      <span className="flex items-center gap-1"><Users size={12} className="text-primary" /> {session.participants} joined</span>
                    </div>
                    <div className="text-[11px] font-bold text-primary flex items-center gap-0.5">
                      {session.status === 'live' ? 'Join Now' : session.status === 'completed' ? 'View Recap' : 'Register'} <ChevronRight size={12} />
                    </div>
                  </div>
                </motion.div>
              ))}

              {filteredSessions.length === 0 && (
                <div className="col-span-2">
                  <EmptyState
                    title="No sessions found"
                    message="There are no virtual training sessions scheduled matching your search queries."
                    icon={<Video size={24} />}
                    actionText="Reset Filters"
                    onAction={() => {
                      setSearch('');
                      setActiveTab('upcoming');
                    }}
                  />
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* VIEW 2: TRAINING DETAILS VIEW */}
        {viewMode === 'details' && selectedSession && (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6 max-w-4xl mx-auto"
          >
            <button
              onClick={() => setViewMode('list')}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to Hub
            </button>

            <div className="premium-glass-card p-6 md:p-8 space-y-6 border border-border/10">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] px-2 py-0.5 rounded bg-secondary/35 border border-border/10 text-muted-foreground font-bold uppercase tracking-wider">
                      {selectedSession.department}
                    </span>
                    {selectedSession.status === 'live' && (
                      <span className="text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse flex items-center gap-0.5">
                        <span className="w-1 h-1 bg-rose-400 rounded-full" /> Live Now
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl md:text-2xl font-extrabold text-foreground leading-tight" style={{ fontFamily: "'Raleway', sans-serif" }}>
                    {selectedSession.title}
                  </h2>
                  <p className="text-xs text-muted-foreground">Led by Lead Trainer: <strong className="text-foreground">{selectedSession.trainer}</strong></p>
                </div>

                {selectedSession.status === 'live' ? (
                  <button
                    onClick={handleJoinSession}
                    className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-rose-500/20 cursor-pointer active:scale-95"
                  >
                    <Play size={12} className="fill-white" /> Join Session Now
                  </button>
                ) : selectedSession.status === 'completed' ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('post_training')}
                      className="bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-primary/95 transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-md shadow-primary/10"
                    >
                      <Sparkles size={12} /> AI Recap &amp; Quiz
                    </button>
                    <button
                      onClick={() => alert('Starting recording playback...')}
                      className="bg-secondary/30 border border-border/10 hover:bg-secondary/50 text-foreground text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Play size={12} className="fill-foreground" /> Watch Recording
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => alert('Registered! Check your calendar for details.')}
                    className="bg-primary text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-primary/95 transition-all cursor-pointer active:scale-95 shadow-md shadow-primary/20"
                  >
                    Register for Class
                  </button>
                )}
              </div>

              <div className="border-t border-border/10 pt-5 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Session Overview</h4>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{selectedSession.description}</p>
              </div>

              <div className="border-t border-border/10 pt-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Learning Objectives</h4>
                <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed pl-1">
                  {selectedSession.objectives.map((obj, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-primary flex-shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-border/10 pt-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Handout Resources</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {selectedSession.resources.map((res, index) => (
                    <div key={index} className="p-3 bg-secondary/10 border border-border/10 rounded-xl flex items-center justify-between text-xs hover:border-primary/20 transition-all cursor-pointer">
                      <span className="flex items-center gap-2 text-foreground font-semibold"><FileText size={15} className="text-primary" /> {res.name}</span>
                      <span className="bg-secondary/40 px-2 py-0.5 rounded text-[8px] font-bold border border-border/10 text-muted-foreground">{res.type}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedSession.status === 'completed' && (
                <div className="bg-primary/5 border border-primary/25 p-5 rounded-2xl mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-1">
                      <AlertCircle size={15} className="text-primary" /> I Missed This Training
                    </h4>
                    <p className="text-xs text-muted-foreground">Catch up instantly using our AI Recap, key concepts summaries, and custom diagnostic quiz.</p>
                  </div>
                  <button
                    onClick={() => setViewMode('post_training')}
                    className="bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl flex-shrink-0 hover:bg-primary/95 transition-all cursor-pointer active:scale-95 shadow-md shadow-primary/25"
                  >
                    Start Catch-up Path
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* VIEW 3: LIVE SESSION WORKSPACE */}
        {viewMode === 'live_session' && selectedSession && (
          <motion.div
            key="live_session"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[80vh]"
          >
            {/* Left Col: Main Player Frame */}
            <div className="lg:col-span-2 bg-[#080812] border border-border/10 rounded-2xl flex flex-col justify-between relative overflow-hidden h-full">
              <div className="flex-1 flex flex-col items-center justify-center relative bg-[#04040a]">
                <div className="absolute top-4 left-4 bg-rose-500 text-white px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
                  <Rss size={9} /> Live Web Stream
                </div>
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm border border-border/15 px-3 py-1 rounded-lg text-[10px] text-muted-foreground">
                  Presenter: <strong className="text-white">{selectedSession.trainer}</strong>
                </div>

                <div className="text-center space-y-4 p-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary animate-pulse shadow-lg shadow-primary/15">
                    <Video size={30} />
                  </div>
                  <h4 className="text-base font-bold text-white" style={{ fontFamily: "'Raleway', sans-serif" }}>{selectedSession.title}</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    Stream connected. Sarah is demonstrating safety valve lockout/tagout procedures under load at boiler station.
                  </p>
                </div>
              </div>

              {/* Player footer controls */}
              <div className="premium-glass-card border-t border-border/10 p-4 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <button className="bg-secondary/35 border border-border/10 text-foreground hover:bg-secondary/50 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer">
                    🎙️ Mute
                  </button>
                  <button className="bg-secondary/35 border border-border/10 text-foreground hover:bg-secondary/50 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer">
                    📹 Stop Cam
                  </button>
                  <button
                    onClick={() => {
                      alert('Assigned Task Alert triggered by Trainer!');
                      setTaskSubmitOpen(true);
                    }}
                    className="bg-primary/15 text-primary border border-primary/20 text-xs font-bold px-3.5 py-1.5 rounded-xl hover:bg-primary/25 transition-all flex items-center gap-1.5 animate-pulse cursor-pointer"
                  >
                    ⭐ Submit Task
                  </button>
                </div>
                <button
                  onClick={handleLeaveLiveSession}
                  className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer active:scale-95"
                >
                  Leave Session
                </button>
              </div>
            </div>

            {/* Right Col: Workspace panels */}
            <div className="premium-glass-card flex flex-col justify-between overflow-hidden h-full border border-border/10">
              <div className="border-b border-border/10 p-3.5 flex justify-between items-center bg-secondary/15">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare size={13} className="text-primary" /> Interactive Workspace
                </span>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                  Active
                </span>
              </div>

              {/* Roster lists */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                
                {/* Active Session Poll */}
                <div className="bg-secondary/20 border border-border/10 rounded-2xl p-4 space-y-3">
                  <h5 className="text-[10px] uppercase font-bold text-primary flex items-center gap-1.5"><Sparkles size={10} className="fill-primary" /> Active Session Poll</h5>
                  <p className="text-xs text-foreground font-semibold leading-relaxed">Is isolation of breaker panel 4B required before override manual calibrations?</p>
                  {!pollVoted ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleVotePoll('yes')}
                        className="bg-secondary/35 border border-border/10 hover:bg-secondary/50 text-xs font-bold py-1.5 rounded-xl transition-all cursor-pointer"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => handleVotePoll('no')}
                        className="bg-secondary/35 border border-border/10 hover:bg-secondary/50 text-xs font-bold py-1.5 rounded-xl transition-all cursor-pointer"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5 text-xs">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span>Yes (isolation needed)</span>
                          <strong className="text-primary">{pollResults.yes}%</strong>
                        </div>
                        <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${pollResults.yes}%` }} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span>No (live override)</span>
                          <strong>{pollResults.no}%</strong>
                        </div>
                        <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                          <div className="h-full bg-border" style={{ width: `${pollResults.no}%` }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Assigned Tasks */}
                <div className="bg-secondary/20 border border-border/10 rounded-2xl p-4 space-y-2.5">
                  <h5 className="text-[10px] uppercase font-bold text-primary flex items-center gap-1.5"><CheckCircle size={10} /> Assigned Tasks</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">Task: Pressure Readings SOP Check</span>
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${taskSubmitted ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
                        {taskSubmitted ? 'Submitted' : 'Assigned'}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">List three safety precautions before override calibration operations.</p>
                    {!taskSubmitted ? (
                      <button
                        onClick={() => setTaskSubmitOpen(true)}
                        className="w-full bg-primary hover:bg-primary/95 text-white text-xs font-bold py-2 rounded-xl transition-all cursor-pointer"
                      >
                        Submit Response
                      </button>
                    ) : (
                      <p className="text-[10px] text-emerald-400 font-bold bg-emerald-500/5 p-2 rounded border border-emerald-500/10">
                        Response recorded. Trainer Sarah is grading.
                      </p>
                    )}
                  </div>
                </div>

                {/* Live chat */}
                <div className="space-y-3.5 pt-2">
                  <h5 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Live Session Chat</h5>
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {chatMessages.map(m => (
                      <div key={m.id} className="text-xs space-y-1">
                        <div className="flex items-center gap-1.5">
                          <strong className="text-foreground">{m.author}</strong>
                          <span className="text-[9px] text-muted-foreground">({m.role})</span>
                        </div>
                        <p className="text-muted-foreground bg-secondary/15 p-2 rounded-lg border border-border/5 leading-normal">{m.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendChat} className="border-t border-border/10 p-3 flex gap-2 bg-secondary/5">
                <input
                  placeholder="Type messages to class..."
                  value={newMessageText}
                  onChange={e => setNewMessageText(e.target.value)}
                  className="flex-1 bg-secondary/35 border border-border/10 rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary/40"
                />
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/95 text-white p-2 rounded-xl transition-all cursor-pointer"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>

            {/* Task submit modal */}
            <AnimatePresence>
              {taskSubmitOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="premium-glass-card border border-border/15 w-full max-w-md p-5 space-y-4 shadow-2xl relative"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-border/10">
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Submit Task Response</h4>
                      <button onClick={() => setTaskSubmitOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                        <X size={16} />
                      </button>
                    </div>
                    <form onSubmit={handleTaskSubmit} className="space-y-4 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold text-foreground">Response Details</label>
                        <textarea
                          required
                          rows={4}
                          placeholder="Write your safety override precautions or dial readings here..."
                          value={taskResponse}
                          onChange={e => setTaskResponse(e.target.value)}
                          className="w-full bg-secondary/35 border border-border/10 rounded-xl p-3 text-foreground outline-none focus:border-primary/45 transition-colors resize-none"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-2 rounded-xl transition-all shadow-lg cursor-pointer"
                      >
                        Submit Response
                      </button>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* VIEW 4: POST-TRAINING RECAP & AI SUMMARY */}
        {viewMode === 'post_training' && selectedSession && (
          <motion.div
            key="post_training"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8 max-w-5xl mx-auto"
          >
            <button
              onClick={() => setViewMode('list')}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to Hub
            </button>

            {/* Performance Summary Banner */}
            <div className="premium-glass-card p-6 grid grid-cols-2 lg:grid-cols-5 gap-6 text-center items-center border border-border/10">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Attendance</span>
                <p className="text-sm font-bold text-foreground">Present (100% time)</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Completion</span>
                <p className="text-sm font-bold text-emerald-400">Verified Session</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Task Submission</span>
                <p className="text-sm font-bold text-foreground">{taskSubmitted ? 'Completed' : 'Skipped'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Assessment Score</span>
                <p className="text-sm font-bold text-primary">{quizScore !== null ? `${quizScore}%` : 'Pending quiz'}</p>
              </div>
              <div className="space-y-1 col-span-2 lg:col-span-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">XP Earned</span>
                <p className="text-sm font-bold text-yellow-400">🚀 +200 XP</p>
              </div>
            </div>

            {/* AI summaries */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2" style={{ fontFamily: "'Raleway', sans-serif" }}>
                    <Bot size={18} className="text-primary" /> AI Training Recap
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Automated key summary generated by Mentora LLM engines.</p>
                </div>

                <div className="premium-glass-card p-5 space-y-3.5 border border-border/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Key Takeaways</h4>
                  <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed pl-1 list-disc list-inside">
                    <li>Breaker 4B isolation is **mandatory** before manually override release valves handles operations.</li>
                    <li>Overpressure overrides are color-coded in yellow, located directly below pressure gauge units.</li>
                    <li>Rotate override release valves 90 degrees clockwise to lock mechanical pins.</li>
                  </ul>
                </div>

                <div className="premium-glass-card p-5 space-y-3 border border-border/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Important Concepts</h4>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {['LOTO Lockout', 'Breaker Isolation', 'Auxiliary Barring Gear', 'Rotor Contraction', 'Overpressure Calibration'].map(c => (
                      <span key={c} className="text-[9px] bg-secondary/35 border border-border/10 text-foreground px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="premium-glass-card p-5 space-y-3.5 border border-border/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recommended SOP references</h4>
                  <div className="space-y-2 text-xs">
                    <button
                      onClick={() => onNavigate('knowledge')}
                      className="w-full p-3.5 bg-secondary/10 border border-border/10 hover:border-primary/20 rounded-xl flex items-center justify-between cursor-pointer"
                    >
                      <span className="font-bold text-foreground text-left">SOP-202: Boiler Room evacuations & override LOTO protocols</span>
                      <ArrowRight size={13} className="text-primary flex-shrink-0" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Assessment quiz */}
              <div className="space-y-6">
                <div className="premium-glass-card p-5 space-y-4 border border-border/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <HelpCircle size={14} className="text-primary" /> AI-Generated Assessment
                  </h4>

                  <form onSubmit={handleGradeQuiz} className="space-y-4.5 text-xs text-muted-foreground">
                    <div className="space-y-2 border-b border-border/10 pb-3.5">
                      <p className="font-bold text-foreground">1. What breaker panel must be shut off first before override operations?</p>
                      {['a) Breaker 12', 'b) Breaker 2C', 'c) Breaker 4B'].map(opt => (
                        <label key={opt} className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="radio"
                            name="q1"
                            checked={quizAnswers[1] === opt[0]}
                            onChange={() => setQuizAnswers(prev => ({ ...prev, 1: opt[0] }))}
                            className="bg-secondary border-border/15 text-primary focus:ring-0 cursor-pointer"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>

                    <div className="space-y-2 border-b border-border/10 pb-3.5">
                      <p className="font-bold text-foreground">2. What color is the override release lever in Plant 2?</p>
                      {['a) Red', 'b) Yellow', 'c) Blue'].map(opt => (
                        <label key={opt} className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="radio"
                            name="q2"
                            checked={quizAnswers[2] === opt[0]}
                            onChange={() => setQuizAnswers(prev => ({ ...prev, 2: opt[0] }))}
                            className="bg-secondary border-border/15 text-primary focus:ring-0 cursor-pointer"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>

                    <div className="space-y-2 pb-2">
                      <p className="font-bold text-foreground">3. What is the barring gear rotational rate?</p>
                      {['a) 2 RPM', 'b) 12 RPM', 'c) 120 RPM'].map(opt => (
                        <label key={opt} className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="radio"
                            name="q3"
                            checked={quizAnswers[3] === opt[0]}
                            onChange={() => setQuizAnswers(prev => ({ ...prev, 3: opt[0] }))}
                            className="bg-secondary border-border/15 text-primary focus:ring-0 cursor-pointer"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-md shadow-primary/20"
                    >
                      <Award size={12} /> Grade Assessment
                    </button>

                    {quizScore !== null && (
                      <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 p-3 rounded-xl text-center font-bold">
                        Your Score: {quizScore}% {quizScore >= 66 ? 'Passed! 🎉' : 'Try Again'}
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
}
