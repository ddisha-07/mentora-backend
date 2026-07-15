import { User, UserRole, Mission, Skill, Training, KnowledgeQuestion, KnowledgeAnswer, Reward, Notification } from '../types';

// ==========================================
// 1. MOCK USERS FOR EVERY ROLE
// ==========================================
export const MOCK_USERS: Record<UserRole, User> = {
  SHOP_FLOOR_WORKER: {
    id: 'usr_sf_1',
    employeeId: 'EMP-9081',
    name: 'Ramesh Patel',
    email: 'ramesh.patel@company.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&auto=format',
    role: 'SHOP_FLOOR_WORKER',
    department: 'Assembly Line A',
    plant: 'Pune Plant 1',
    designation: 'Senior Machine Operator',
    yearsOfExperience: 8,
    expertise: ['HVAC Operations', 'Hydraulic Systems', 'Safety Compliance'],
    skillLevel: 'Level 3 - Skilled Operator',
    xp: 2450,
    knowledgeCredits: 120,
    mentoraCredits: 450,
    currentStreak: 5,
    longestStreak: 21,
    leaderboardRank: 18
  },
  JUNIOR_EMPLOYEE: {
    id: 'usr_jr_1',
    employeeId: 'EMP-1120',
    name: 'Disha Shree',
    email: 'disha.shree@company.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&auto=format',
    role: 'JUNIOR_EMPLOYEE',
    department: 'Software Engineering',
    plant: 'Bangalore HQ',
    designation: 'Associate Software Engineer',
    yearsOfExperience: 2,
    expertise: ['React', 'TypeScript', 'Node.js'],
    skillLevel: 'Level 1 - Junior Developer',
    xp: 1890,
    knowledgeCredits: 40,
    mentoraCredits: 180,
    currentStreak: 12,
    longestStreak: 12,
    leaderboardRank: 42
  },
  SENIOR_EMPLOYEE: {
    id: 'usr_sr_1',
    employeeId: 'EMP-0453',
    name: 'Arjun Mehta',
    email: 'arjun.mehta@company.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&auto=format',
    role: 'SENIOR_EMPLOYEE',
    department: 'Robotics R&D',
    plant: 'Pune Plant 2',
    designation: 'Principal Automation Architect',
    yearsOfExperience: 12,
    expertise: ['PLCs', 'SCADA', 'Industrial IoT', 'Mentorship'],
    skillLevel: 'Level 4 - Lead Specialist',
    xp: 5820,
    knowledgeCredits: 680,
    mentoraCredits: 1250,
    currentStreak: 24,
    longestStreak: 45,
    leaderboardRank: 3
  },
  OFFICER_MANAGER: {
    id: 'usr_om_1',
    employeeId: 'EMP-0128',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@company.com',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&auto=format',
    role: 'OFFICER_MANAGER',
    department: 'Human Resources & Training',
    plant: 'Mumbai Corporate Office',
    designation: 'Director of Talent Development',
    yearsOfExperience: 15,
    expertise: ['Strategic HR', 'Curriculum Design', 'Team Management'],
    skillLevel: 'Level 5 - Director',
    xp: 4120,
    knowledgeCredits: 340,
    mentoraCredits: 890,
    currentStreak: 3,
    longestStreak: 14,
    leaderboardRank: 12
  },
  RETIRED_EMPLOYEE: {
    id: 'usr_ret_1',
    employeeId: 'EMP-0012',
    name: 'Devendra Prasad',
    email: 'd.prasad@alumni.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&auto=format',
    role: 'RETIRED_EMPLOYEE',
    department: 'Mechanical Maintenance',
    plant: 'Jamshedpur Factory (Retired)',
    designation: 'Distinguished Advisor & Expert',
    yearsOfExperience: 38,
    expertise: ['Steam Turbines', 'Legacy Boiler Systems', 'Root Cause Analysis'],
    skillLevel: 'Level 6 - Emeritus Expert',
    xp: 8920,
    knowledgeCredits: 2450,
    mentoraCredits: 3400,
    currentStreak: 0,
    longestStreak: 180,
    leaderboardRank: 1
  },
  ADMIN: {
    id: 'usr_ad_1',
    employeeId: 'EMP-0001',
    name: 'Super Admin',
    email: 'admin.support@company.com',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&auto=format',
    role: 'ADMIN',
    department: 'Information Technology',
    plant: 'Bangalore HQ',
    designation: 'Global Platform Administrator',
    yearsOfExperience: 10,
    expertise: ['Infrastructure', 'Security Audit', 'System Administration'],
    skillLevel: 'Administrator',
    xp: 1000,
    knowledgeCredits: 0,
    mentoraCredits: 0,
    currentStreak: 1,
    longestStreak: 5,
    leaderboardRank: 100
  }
};

// ==========================================
// 2. DAILY & WEEKLY MISSIONS
// ==========================================
export const MOCK_MISSIONS: Mission[] = [
  {
    id: 101,
    title: 'Daily Safety Drill Quiz',
    description: 'Complete the 5-question quick quiz on Boiler Room safety regulations and evacuation procedures.',
    type: 'QUIZ',
    assignedRole: 'SHOP_FLOOR_WORKER',
    rewardType: 'xp',
    rewardAmount: 150,
    estimatedTime: '5 mins',
    status: 'assigned',
    dueDate: 'Today, 11:59 PM'
  },
  {
    id: 102,
    title: 'Identify 1 Machine Anomaly',
    description: 'Check the HVAC unit status panel, log operational readings, and report any visual discrepancy to Senior staff.',
    type: 'SOP_READING',
    assignedRole: 'SHOP_FLOOR_WORKER',
    rewardType: 'both',
    rewardAmount: 200,
    estimatedTime: '15 mins',
    status: 'in_progress',
    dueDate: 'Tomorrow, 5:00 PM'
  },
  {
    id: 103,
    title: 'Complete TypeScript Refactoring Module',
    description: 'Finish the hands-on coding challenges for Advanced Types and Generics in the React Skill Path.',
    type: 'LEARNING',
    assignedRole: 'JUNIOR_EMPLOYEE',
    rewardType: 'both',
    rewardAmount: 250,
    estimatedTime: '45 mins',
    status: 'assigned',
    dueDate: 'Today, 11:59 PM'
  },
  {
    id: 104,
    title: 'Help 1 Peer on Knowledge Exchange',
    description: 'Answer any open question tagged with Node.js, SQL, or React in the Q&A board.',
    type: 'KNOWLEDGE_SHARING',
    assignedRole: 'JUNIOR_EMPLOYEE',
    rewardType: 'credits',
    rewardAmount: 50,
    estimatedTime: '15 mins',
    status: 'completed',
    dueDate: 'Completed today'
  },
  {
    id: 105,
    title: 'Conduct Q&A Review Session',
    description: 'Verify and review answers submitted by Junior staff for industrial robotics PLC configuration.',
    type: 'MENTORING',
    assignedRole: 'SENIOR_EMPLOYEE',
    rewardType: 'both',
    rewardAmount: 300,
    estimatedTime: '30 mins',
    status: 'assigned',
    dueDate: 'In 2 days'
  },
  {
    id: 106,
    title: 'Create Weekly Safety Policy Article',
    description: 'Draft and publish a brief 300-word advisory article on SCADA sensor calibration updates.',
    type: 'EXPERIENCE_SHARING',
    assignedRole: 'SENIOR_EMPLOYEE',
    rewardType: 'credits',
    rewardAmount: 100,
    estimatedTime: '60 mins',
    status: 'in_progress',
    dueDate: 'This Friday'
  },
  {
    id: 107,
    title: 'Review Department Learning Analytics',
    description: 'Open the L&D dashboards, check skill-gap analysis profiles, and approve course extensions for Q3.',
    type: 'AI_EXPLORATION',
    assignedRole: 'OFFICER_MANAGER',
    rewardType: 'xp',
    rewardAmount: 150,
    estimatedTime: '20 mins',
    status: 'assigned',
    dueDate: 'Today'
  },
  {
    id: 108,
    title: 'Answer Legacy Steam Turbine Ticket',
    description: 'Provide an expert response to the high-priority question regarding the 1994 Jamshedpur Factory Turbines.',
    type: 'EXPERIENCE_SHARING',
    assignedRole: 'RETIRED_EMPLOYEE',
    rewardType: 'both',
    rewardAmount: 500,
    estimatedTime: '40 mins',
    status: 'assigned',
    dueDate: 'Immediate'
  }
];

// ==========================================
// 3. SKILLS & PROFICIENCIES
// ==========================================
export const MOCK_SKILLS: Skill[] = [
  { id: 201, name: 'Machine Operations', category: 'Operations', proficiency: 'Advanced', progress: 85 },
  { id: 202, name: 'Safety Compliance', category: 'Operations', proficiency: 'Expert', progress: 100 },
  { id: 203, name: 'Hydraulic Systems', category: 'Mechanical', proficiency: 'Intermediate', progress: 60 },
  { id: 204, name: 'React Development', category: 'Software', proficiency: 'Intermediate', progress: 75 },
  { id: 205, name: 'TypeScript & ES6+', category: 'Software', proficiency: 'Intermediate', progress: 70 },
  { id: 206, name: 'PLCs & Automation', category: 'Robotics', proficiency: 'Expert', progress: 95 },
  { id: 207, name: 'Industrial IoT', category: 'Hardware', proficiency: 'Advanced', progress: 80 },
  { id: 208, name: 'Curriculum Planning', category: 'Management', proficiency: 'Expert', progress: 98 },
  { id: 209, name: 'Steam Boiler Advising', category: 'Legacy Systems', proficiency: 'Expert', progress: 100 }
];

// ==========================================
// 4. TRAINING SESSIONS
// ==========================================
export const MOCK_TRAINING: Training[] = [
  {
    id: 301,
    title: 'IIoT Sensors and Gateway Setup',
    trainer: 'Arjun Mehta',
    description: 'Hands-on session on configuring Modbus gateways to stream telemetry data directly to the AWS cloud.',
    department: 'R&D',
    date: 'July 18, 2026',
    time: '2:00 PM - 3:30 PM',
    duration: '1.5 hours',
    status: 'upcoming',
    participants: 28,
    recordingAvailable: false
  },
  {
    id: 302,
    title: 'Basic Workshop Safety & Machine Lockout',
    trainer: 'Dr. Sarah Chen',
    description: 'Mandatory refresher course on Lockout/Tagout (LOTO) procedures for shop floor personnel.',
    department: 'Safety & EHS',
    date: 'July 14, 2026',
    time: '10:00 AM - 11:00 AM',
    duration: '1 hour',
    status: 'completed',
    participants: 120,
    recordingAvailable: true
  },
  {
    id: 303,
    title: 'Advanced PLC Ladder Logic Design',
    trainer: 'Carlos Mendoza',
    description: 'Deep dive into nesting sub-routines and handling asynchronous alarm interrupts on Siemens controllers.',
    department: 'Automation Engineering',
    date: 'July 21, 2026',
    time: '11:00 AM - 12:30 PM',
    duration: '1.5 hours',
    status: 'upcoming',
    participants: 45,
    recordingAvailable: false
  },
  {
    id: 304,
    title: 'Emergencies: Boiler Valve Steam Overpressure',
    trainer: 'Devendra Prasad',
    description: 'Advisory case study review discussing legacy mechanical release overrides when automated safety relays fail.',
    department: 'Maintenance',
    date: 'July 10, 2026',
    time: '3:00 PM - 4:30 PM',
    duration: '1.5 hours',
    status: 'completed',
    participants: 80,
    recordingAvailable: true
  }
];

// ==========================================
// 5. KNOWLEDGE EXCHANGE (Q&A)
// ==========================================
export const MOCK_QUESTIONS: KnowledgeQuestion[] = [
  {
    id: 401,
    title: 'How do you bypass an automatic LOTO relay in Plant 2 if the PLC console is unresponsive?',
    description: 'We are conducting mechanical boiler checks, but the controller panel is frozen in active loop. Need instructions for manual mechanical lock overrides.',
    author: 'Ramesh Patel',
    department: 'Assembly Line A',
    topic: 'Safety Procedures',
    status: 'resolved',
    createdAt: 'July 12, 2026'
  },
  {
    id: 402,
    title: 'Best practices for mapping TypeScript interfaces with dynamic Supabase JSONB tables?',
    description: 'I am creating a nested curriculum editor and want to type-cast Supabase JSONB modules arrays. Do we use generics or validate schemas at run-time with Zod?',
    author: 'Disha Shree',
    department: 'Software Engineering',
    topic: 'Database Schema & Coding',
    status: 'open',
    createdAt: 'Today, 9:00 AM'
  },
  {
    id: 403,
    title: 'Mechanical feedback vibrations on 1994 Steam Turbine model 4-A',
    description: 'During peak load rotation, we are noticing a 0.8mm shaft runout oscillation. Standard procedures say check seal rings, but it persists. Any retired experts seen this?',
    author: 'Arjun Mehta',
    department: 'Robotics R&D',
    topic: 'Turbine Diagnostics',
    status: 'open',
    createdAt: 'Yesterday, 4:15 PM'
  }
];

export const MOCK_ANSWERS: Record<number, KnowledgeAnswer[]> = {
  401: [
    {
      id: 501,
      questionId: 401,
      author: 'Arjun Mehta',
      authorRole: 'Senior Employee (R&D)',
      content: 'Never attempt to manually override with active lines. First verify that breaker panel 4B is physically shut off. Once isolated, use the physical release lever at the base of Valve 12.',
      answerType: 'standard',
      verified: false,
      helpfulCount: 8
    },
    {
      id: 502,
      questionId: 401,
      author: 'Devendra Prasad',
      authorRole: 'Retired Expert Advisor',
      content: 'Arjun is correct. The legacy override lever in Plant 2 is yellow-coded and located directly beneath the pressure gauge housing. Pull it downwards and rotate 90 degrees clockwise to lock mechanical pins.',
      answerType: 'verified',
      verified: true,
      helpfulCount: 22,
      source: 'Plant 2 Standard Operations Manual, Section 14.2'
    }
  ],
  402: [
    {
      id: 503,
      questionId: 402,
      author: 'Sarah Jenkins',
      authorRole: 'L&D Director',
      content: 'I highly suggest using Zod schema verification on mount. It gives us run-time guarantees since JSONB data changes frequently. I can share our standard training module schema example.',
      answerType: 'standard',
      verified: false,
      helpfulCount: 2
    }
  ],
  403: [
    {
      id: 504,
      questionId: 403,
      author: 'Devendra Prasad',
      authorRole: 'Retired Expert Advisor',
      content: 'This was a common bug in the 1994 turbines. The runout is caused by uneven cooling contraction of the rotor shaft during brief stops. Turn on the auxiliary barring gear to rotate the shaft slowly at 2 RPM for 4 hours; this will thermal-normalize the shaft and resolve the runout.',
      answerType: 'expert',
      verified: true,
      helpfulCount: 14,
      source: 'Legacy Operating Bulletins - Jamshedpur, 1996'
    }
  ]
};

// ==========================================
// 6. NOTIFICATIONS
// ==========================================
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 601,
    type: 'success',
    title: 'Daily Mission Completed!',
    message: 'You have earned 150 XP for completing the Daily Safety Drill Quiz.',
    read: false,
    timestamp: '5 mins ago'
  },
  {
    id: 602,
    type: 'info',
    title: 'New Live Training Scheduled',
    message: 'Arjun Mehta scheduled "IIoT Sensors and Gateway Setup" for July 18.',
    read: false,
    timestamp: '2 hours ago'
  },
  {
    id: 603,
    type: 'warning',
    title: 'Upcoming Mission Due',
    message: 'Your assignment "Identify 1 Machine Anomaly" is due tomorrow at 5:00 PM.',
    read: true,
    timestamp: '4 hours ago'
  },
  {
    id: 604,
    type: 'alert',
    title: 'Expert Verified Answer',
    message: 'Devendra Prasad verified your safety override question with historical operating sources.',
    read: false,
    timestamp: 'Yesterday'
  }
];

// ==========================================
// 7. LEADERBOARDS
// ==========================================
export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  role: string;
  xp: number;
  credits: number;
  streak: number;
}

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Devendra Prasad', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&auto=format', role: 'Retired Expert', xp: 8920, credits: 2450, streak: 180 },
  { rank: 2, name: 'Priya Sharma', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&auto=format', role: 'Cloud Architect', xp: 6100, credits: 1400, streak: 18 },
  { rank: 3, name: 'Arjun Mehta', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&auto=format', role: 'Automation Specialist', xp: 5820, credits: 1250, streak: 24 },
  { rank: 4, name: 'Marcus Rivera', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&auto=format', role: 'Security Engineer', xp: 4890, credits: 980, streak: 8 },
  { rank: 5, name: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=60&h=60&fit=crop&auto=format', role: 'Talent Director', xp: 4120, credits: 890, streak: 3 },
  { rank: 6, name: 'Ramesh Patel', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&auto=format', role: 'Machine Operator', xp: 2450, credits: 450, streak: 5 },
  { rank: 7, name: 'Disha Shree', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&auto=format', role: 'Associate Developer', xp: 1890, credits: 180, streak: 12 }
];

// ==========================================
// 8. REWARDS REDEMPTION STORE
// ==========================================
export const MOCK_REWARDS: Reward[] = [
  {
    id: 701,
    title: 'Company Jacket & Thermos',
    description: 'Get branded high-quality winter gear. Includes shipping to your home plant.',
    cost: 500,
    category: 'Merchandise',
    availability: true
  },
  {
    id: 702,
    title: 'Advanced React Native Course Pass',
    description: 'Unlocks a premium certified online mobile development course. Fully funded by L&D.',
    cost: 300,
    category: 'Education',
    availability: true
  },
  {
    id: 703,
    title: '1-on-1 Advisory Session with Devendra Prasad',
    description: 'Spend 45 minutes discussing legacy systems or custom mechanical diagnostics with our emeritus expert.',
    cost: 1000,
    category: 'Mentorship',
    availability: true
  },
  {
    id: 704,
    title: 'Amazon Gift Card (₹1,000)',
    description: 'Redeem points directly for an online e-gift voucher.',
    cost: 800,
    category: 'Voucher',
    availability: true
  }
];

// ==========================================
// CENTRALIZED SERVICE LAYER (API COMPATIBLE)
// ==========================================
export const mockService = {
  fetchCurrentUser: async (role: UserRole): Promise<User> => {
    await new Promise(r => setTimeout(r, 200));
    return MOCK_USERS[role];
  },
  fetchMissions: async (role: UserRole): Promise<Mission[]> => {
    await new Promise(r => setTimeout(r, 150));
    return MOCK_MISSIONS.filter(m => m.assignedRole === role || m.assignedRole === 'SHOP_FLOOR_WORKER');
  },
  fetchSkills: async (userId: string): Promise<Skill[]> => {
    await new Promise(r => setTimeout(r, 150));
    // Provide appropriate subset based on user id
    if (userId.includes('sf')) return MOCK_SKILLS.slice(0, 3);
    if (userId.includes('jr')) return MOCK_SKILLS.slice(3, 5);
    if (userId.includes('sr')) return MOCK_SKILLS.slice(5, 7);
    if (userId.includes('om')) return MOCK_SKILLS.slice(7, 8);
    if (userId.includes('ret')) return MOCK_SKILLS.slice(8, 9);
    return MOCK_SKILLS;
  },
  fetchTraining: async (): Promise<Training[]> => {
    await new Promise(r => setTimeout(r, 200));
    return MOCK_TRAINING;
  },
  fetchQuestions: async (): Promise<KnowledgeQuestion[]> => {
    await new Promise(r => setTimeout(r, 150));
    return MOCK_QUESTIONS;
  },
  fetchAnswers: async (questionId: number): Promise<KnowledgeAnswer[]> => {
    await new Promise(r => setTimeout(r, 100));
    return MOCK_ANSWERS[questionId] || [];
  },
  fetchNotifications: async (): Promise<Notification[]> => {
    await new Promise(r => setTimeout(r, 100));
    return MOCK_NOTIFICATIONS;
  },
  fetchLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    await new Promise(r => setTimeout(r, 150));
    return MOCK_LEADERBOARD;
  },
  fetchRewards: async (): Promise<Reward[]> => {
    await new Promise(r => setTimeout(r, 150));
    return MOCK_REWARDS;
  }
};
