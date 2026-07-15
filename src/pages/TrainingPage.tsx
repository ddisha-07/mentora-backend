import React, { useState, useEffect } from 'react';
import {
  Video, Calendar, PlusCircle, Search, Clock, Users, ArrowLeft, Play, FileText,
  CheckCircle, ArrowRight, MessageSquare, Award, ThumbsUp, Send, Check, AlertCircle, Sparkles, HelpCircle, X
} from 'lucide-react';
import { useApp } from '../../App';
import { Card } from '../components/reusable';
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
  const { profile } = useApp();
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

  // Submit chat message
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

  // Vote on Poll
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

  // Submit Assigned Task
  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskResponse.trim()) return;
    setTaskSubmitted(true);
    setTaskSubmitOpen(false);
  };

  // Grade Quiz
  const handleGradeQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    let score = 0;
    if (quizAnswers[1] === 'c') score += 33;
    if (quizAnswers[2] === 'b') score += 33;
    if (quizAnswers[3] === 'a') score += 34;
    setQuizScore(score);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* VIEW 1: TRAINING LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Video className="text-primary" size={24} /> Training Hub
              </h2>
              <p className="text-muted-foreground text-sm">Attend live virtual masterclasses, webinars, and browse previous recording archives.</p>
            </div>
            <button className="bg-primary text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/95 transition-all flex items-center gap-1.5 active:scale-95 shadow-lg shadow-primary/20">
              <PlusCircle size={15} /> Schedule Masterclass
            </button>
          </div>

          {/* Search & Tabs */}
          <div className="flex flex-wrap gap-4 items-center justify-between bg-card/45 border border-border p-4 rounded-2xl">
            <div className="relative w-full md:w-72">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search masterclasses, trainers..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-foreground placeholder-muted-foreground w-full outline-none focus:border-primary/50 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
              {[
                { id: 'live_now', label: 'Live Now 🔴' },
                { id: 'upcoming', label: 'Upcoming' },
                { id: 'my_training', label: 'My Calendar' },
                { id: 'completed', label: 'Completed' },
                { id: 'recordings', label: 'Recordings' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSessions.map(session => (
              <div
                key={session.id}
                onClick={() => handleSelectSession(session)}
                className={`bg-card border border-border hover:border-primary/20 rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between h-56 relative overflow-hidden`}
              >
                {session.status === 'live' && (
                  <div className="absolute top-0 right-0 bg-rose-500 text-white px-3 py-1 rounded-bl text-[9px] font-bold uppercase tracking-widest animate-pulse">
                    🔴 Live Session
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] px-2 py-0.5 rounded bg-background border border-border text-muted-foreground font-semibold">
                      {session.department}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground line-clamp-1 leading-tight group-hover:text-primary transition-colors">
                    {session.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {session.description}
                  </p>
                </div>

                <div className="border-t border-border/50 pt-3 mt-3 flex items-center justify-between text-xs text-muted-foreground flex-wrap gap-2">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1"><Clock size={12} /> {session.duration}</span>
                    <span className="flex items-center gap-1"><Users size={12} /> {session.participants} attended</span>
                  </div>
                  <div className="text-[11px] font-bold text-primary">
                    {session.status === 'live' ? 'Join Now &rarr;' : session.status === 'completed' ? 'View Recap' : 'Register'}
                  </div>
                </div>
              </div>
            ))}

            {filteredSessions.length === 0 && (
              <div className="col-span-2 text-center py-20 border border-dashed border-border rounded-2xl">
                <Video size={40} className="text-border mx-auto mb-3" />
                <h4 className="text-sm font-bold text-foreground">No sessions found</h4>
                <p className="text-muted-foreground text-xs">Try selecting another tab or adjusting search queries.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: TRAINING DETAILS VIEW */}
      {viewMode === 'details' && selectedSession && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => setViewMode('list')}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-all"
          >
            <ArrowLeft size={14} /> Back to Hub
          </button>

          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6">
            {/* Title / Header info */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] px-2 py-0.5 rounded bg-background border border-border text-muted-foreground font-bold uppercase tracking-wider">
                    {selectedSession.department}
                  </span>
                  {selectedSession.status === 'live' && (
                    <span className="text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                      🔴 Live Now
                    </span>
                  )}
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-foreground leading-tight">{selectedSession.title}</h2>
                <p className="text-xs text-muted-foreground">Masterclass led by: <strong className="text-foreground">{selectedSession.trainer}</strong></p>
              </div>

              {/* Action Button */}
              {selectedSession.status === 'live' ? (
                <button
                  onClick={handleJoinSession}
                  className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-rose-500/15"
                >
                  <Play size={12} className="fill-white" /> Join Session Now
                </button>
              ) : selectedSession.status === 'completed' ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('post_training')}
                    className="bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-primary/95 transition-all flex items-center gap-1"
                  >
                    <Sparkles size={12} /> AI Recap &amp; Quiz
                  </button>
                  <button
                    onClick={() => alert('Starting recording playback...')}
                    className="bg-card border border-border hover:bg-muted text-foreground text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1"
                  >
                    <Play size={12} className="fill-foreground" /> Watch Recording
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => alert('Registered! Check your calendar for details.')}
                  className="bg-primary text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-primary/95 transition-all"
                >
                  Register for Class
                </button>
              )}
            </div>

            {/* Description */}
            <div className="border-t border-border/50 pt-5 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Session Overview</h4>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{selectedSession.description}</p>
            </div>

            {/* Learning Objectives */}
            <div className="border-t border-border/50 pt-5 space-y-3">
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

            {/* Resources list */}
            <div className="border-t border-border/50 pt-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Handout Resources</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {selectedSession.resources.map((res, index) => (
                  <div key={index} className="p-3 bg-background border border-border rounded-xl flex items-center justify-between text-xs hover:border-primary/20 transition-all cursor-pointer">
                    <span className="flex items-center gap-2 text-foreground font-semibold"><FileText size={15} className="text-primary" /> {res.name}</span>
                    <span className="bg-card px-2 py-0.5 rounded text-[8px] font-bold border border-border text-muted-foreground">{res.type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Missed training catching up */}
            {selectedSession.status === 'completed' && (
              <div className="bg-primary/5 border border-primary/20 p-5 rounded-2xl mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-1">
                    <AlertCircle size={15} className="text-primary" /> I Missed This Training
                  </h4>
                  <p className="text-xs text-muted-foreground">Catch up instantly using our AI Recap, key concepts summaries, and custom diagnostic quiz.</p>
                </div>
                <button
                  onClick={() => setViewMode('post_training')}
                  className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl flex-shrink-0 hover:bg-primary/95 transition-all"
                >
                  Start Catch-up Path
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: LIVE SESSION WORKSPACE */}
      {viewMode === 'live_session' && selectedSession && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[80vh]">
          {/* Main player box */}
          <div className="lg:col-span-2 bg-black border border-border rounded-2xl flex flex-col justify-between relative overflow-hidden h-full">
            {/* Video mockup frame */}
            <div className="flex-1 flex flex-col items-center justify-center relative bg-[#06060c]">
              <div className="absolute top-4 left-4 bg-rose-500 text-white px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" /> Live stream
              </div>
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm border border-border px-3 py-1 rounded-lg text-[10px] text-muted-foreground">
                Speaker: <strong className="text-white">{selectedSession.trainer}</strong>
              </div>

              {/* Simulated camera stream */}
              <div className="text-center space-y-3 p-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary animate-pulse">
                  <Video size={30} />
                </div>
                <h4 className="text-sm font-bold text-foreground">{selectedSession.title}</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  Stream connected. Sarah is currently demonstrating safety calibration overrides on Gauge Unit #4.
                </p>
              </div>
            </div>

            {/* Quick actions controls panel */}
            <div className="bg-card border-t border-border p-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <button className="bg-background border border-border text-foreground hover:bg-muted text-xs font-semibold px-3 py-1.5 rounded-xl transition-all">
                  🎙️ Mute
                </button>
                <button className="bg-background border border-border text-foreground hover:bg-muted text-xs font-semibold px-3 py-1.5 rounded-xl transition-all">
                  📹 Stop Video
                </button>
                <button
                  onClick={() => {
                    alert('Assigned Task Alert triggered by Trainer!');
                    setTaskSubmitOpen(true);
                  }}
                  className="bg-primary/10 text-primary border border-primary/20 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-primary/20 transition-all flex items-center gap-1 animate-pulse"
                >
                  ⭐ Mock Task Alert
                </button>
              </div>
              <button
                onClick={handleLeaveLiveSession}
                className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
              >
                Leave Session
              </button>
            </div>
          </div>

          {/* Right Sidebar panels: Chat / Polls / Tasks */}
          <div className="bg-card border border-border rounded-2xl flex flex-col justify-between overflow-hidden h-full">
            {/* Sidebar header tabs */}
            <div className="border-b border-border p-3 flex justify-between items-center bg-background/50">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1">
                💬 Interactive workspace
              </span>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                Present
              </span>
            </div>

            {/* Content pane: combines Chat, Polls & Tasks in one scrollable area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Mock Poll widget */}
              <div className="bg-background border border-border rounded-xl p-3.5 space-y-3">
                <h5 className="text-[10px] uppercase font-bold text-primary flex items-center gap-1"><Sparkles size={10} /> Active Session Poll</h5>
                <p className="text-xs text-foreground font-semibold">Is isolation of breaker panel 4B required before override manual calibrations?</p>
                {!pollVoted ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleVotePoll('yes')}
                      className="bg-card border border-border hover:bg-muted text-xs font-bold py-1.5 rounded-lg transition-all"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleVotePoll('no')}
                      className="bg-card border border-border hover:bg-muted text-xs font-bold py-1.5 rounded-lg transition-all"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 text-xs">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span>Yes (isolation needed)</span>
                        <strong>{pollResults.yes}%</strong>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${pollResults.yes}%` }} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span>No (live override)</span>
                        <strong>{pollResults.no}%</strong>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-border" style={{ width: `${pollResults.no}%` }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tasks widget */}
              <div className="bg-background border border-border rounded-xl p-3.5 space-y-2">
                <h5 className="text-[10px] uppercase font-bold text-primary flex items-center gap-1"><CheckCircle size={10} /> Assigned Tasks</h5>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">Task: Pressure Readings SOP Check</span>
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${taskSubmitted ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
                      {taskSubmitted ? 'Submitted' : 'Assigned'}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">List three safety precautions before override calibration operations.</p>
                  {!taskSubmitted ? (
                    <button
                      onClick={() => setTaskSubmitOpen(true)}
                      className="w-full bg-primary hover:bg-primary/95 text-white text-xs font-semibold py-2 rounded-xl transition-all"
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

              {/* Attendance roster summary */}
              <div className="bg-background border border-border rounded-xl p-3.5 space-y-2 text-xs">
                <h5 className="text-[10px] uppercase font-bold text-muted-foreground">Attendance check</h5>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Active Roster Status</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">Present</span>
                    <span className="text-[9px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded-full font-bold">Partial</span>
                    <span className="text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-bold">Absent</span>
                  </div>
                </div>
              </div>

              {/* Chat thread list */}
              <div className="space-y-3 pt-2">
                <h5 className="text-[10px] uppercase font-bold text-muted-foreground">Live Session Chat</h5>
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {chatMessages.map(m => (
                    <div key={m.id} className="text-xs space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <strong className="text-foreground">{m.author}</strong>
                        <span className="text-[9px] text-muted-foreground">({m.role})</span>
                      </div>
                      <p className="text-muted-foreground bg-background p-2 rounded-lg border border-border/50">{m.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Input message form */}
            <form onSubmit={handleSendChat} className="border-t border-border p-3 flex gap-2 bg-background/50">
              <input
                placeholder="Type messages to class..."
                value={newMessageText}
                onChange={e => setNewMessageText(e.target.value)}
                className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary/50"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary/95 text-white p-2 rounded-xl transition-all"
              >
                <Send size={14} />
              </button>
            </form>
          </div>

          {/* Interactive Task Submission popup */}
          {taskSubmitOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-card border border-border rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Submit Task Response</h4>
                  <button onClick={() => setTaskSubmitOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <X size={16} />
                  </button>
                </div>
                <form onSubmit={handleTaskSubmit} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Response Details</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Write your precautions or readings here..."
                      value={taskResponse}
                      onChange={e => setTaskResponse(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl p-3 text-foreground outline-none focus:border-primary/50 transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/95 text-white font-semibold py-2 rounded-xl transition-all shadow-lg"
                  >
                    Submit Response
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 4: POST-TRAINING VIEW & AI RECAP */}
      {viewMode === 'post_training' && selectedSession && (
        <div className="space-y-8 max-w-5xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => setViewMode('list')}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-all"
          >
            <ArrowLeft size={14} /> Leave catch-up workspace
          </button>

          {/* Performance Summary Banner */}
          <div className="bg-card border border-border rounded-2xl p-6 grid grid-cols-2 lg:grid-cols-5 gap-6 text-center items-center">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Attendance</span>
              <p className="text-sm font-bold text-foreground">Present (100% time)</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Completion</span>
              <p className="text-sm font-bold text-emerald-400">Verified Solution</p>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* AI Training Recap */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles size={18} className="text-primary fill-primary" /> AI Training Recap
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Custom summarized catching up compiled by Mentora LLM engines.</p>
              </div>

              {/* Key Takeaways */}
              <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Key Takeaways</h4>
                <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed pl-1 list-disc list-inside">
                  <li>Breaker 4B isolation is **mandatory** before manually override release valves handles operations.</li>
                  <li>Overpressure overrides are color-coded in yellow, located directly below pressure gauge units.</li>
                  <li>Rotate override release valves 90 degrees clockwise to lock mechanical pins.</li>
                </ul>
              </div>

              {/* Important Concepts */}
              <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Important Concepts</h4>
                <div className="flex flex-wrap gap-1.5">
                  {['LOTO lockout', 'Breaker isolation', 'Auxiliary barring gear', 'Rotor shaft contraction', 'Overpressure calibration'].map(c => (
                    <span key={c} className="text-[10px] bg-background border border-border text-foreground px-2.5 py-1 rounded-lg font-semibold">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommended SOPs */}
              <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recommended SOP references</h4>
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-background border border-border hover:border-primary/20 rounded-xl flex items-center justify-between cursor-pointer">
                    <span className="font-semibold text-foreground">SOP-202: Boiler Room evacuations & override LOTO protocols</span>
                    <ArrowRight size={13} className="text-primary" />
                  </div>
                </div>
              </div>

              {/* 5-minute revision */}
              <div className="bg-card border border-border rounded-2xl p-5 space-y-2 text-xs text-muted-foreground leading-relaxed">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">5-Minute Revision summary</h4>
                <p>
                  Override safety calibration ensures mechanical valves operate correctly under high pressure without telemetry delay. Isolating breakers secures electric solenoids from misfiring, protecting maintenance staff from steam bursts. Barring gears must remain active during turbine cool-down shifts to rotate rotors slowly, ensuring thermal normalizations are achieved uniformly.
                </p>
              </div>
            </div>

            {/* AI Generated Quiz & Actions */}
            <div className="space-y-6">
              {/* Quiz card */}
              <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <HelpCircle size={14} /> AI-Generated Assessment
                </h4>

                <form onSubmit={handleGradeQuiz} className="space-y-4 text-xs text-muted-foreground">
                  <div className="space-y-2 border-b border-border/50 pb-3">
                    <p className="font-bold text-foreground">1. What breaker panel must be shut off first before override operations?</p>
                    {['a) Breaker 12', 'b) Breaker 2C', 'c) Breaker 4B'].map(opt => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="q1"
                          checked={quizAnswers[1] === opt[0]}
                          onChange={() => setQuizAnswers(prev => ({ ...prev, 1: opt[0] }))}
                          className="bg-background border-border text-primary focus:ring-0"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>

                  <div className="space-y-2 border-b border-border/50 pb-3">
                    <p className="font-bold text-foreground">2. What color is the override release lever in Plant 2?</p>
                    {['a) Red', 'b) Yellow', 'c) Blue'].map(opt => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="q2"
                          checked={quizAnswers[2] === opt[0]}
                          onChange={() => setQuizAnswers(prev => ({ ...prev, 2: opt[0] }))}
                          className="bg-background border-border text-primary focus:ring-0"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <p className="font-bold text-foreground">3. What is the barring gear rotational rate?</p>
                    {['a) 2 RPM', 'b) 12 RPM', 'c) 120 RPM'].map(opt => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="q3"
                          checked={quizAnswers[3] === opt[0]}
                          onChange={() => setQuizAnswers(prev => ({ ...prev, 3: opt[0] }))}
                          className="bg-background border-border text-primary focus:ring-0"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
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

              {/* Actions list */}
              <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">General Actions</h4>
                <div className="space-y-2 text-xs">
                  <button
                    onClick={() => alert('Launching video playback...')}
                    className="w-full p-2.5 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground text-left font-semibold flex items-center gap-1.5"
                  >
                    <Play size={12} className="fill-muted-foreground" /> Watch Recording Playback
                  </button>
                  <button
                    onClick={() => onNavigate('ai-chat')}
                    className="w-full p-2.5 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground text-left font-semibold flex items-center gap-1.5"
                  >
                    💬 Ask Kai Chatbot
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
