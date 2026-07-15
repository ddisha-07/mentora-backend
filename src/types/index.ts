export type UserRole =
  | 'SHOP_FLOOR_WORKER'
  | 'JUNIOR_EMPLOYEE'
  | 'SENIOR_EMPLOYEE'
  | 'OFFICER_MANAGER'
  | 'RETIRED_EMPLOYEE'
  | 'ADMIN';

export interface User {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  department: string;
  plant: string;
  designation: string;
  yearsOfExperience: number;
  expertise: string[];
  skillLevel: string;
  xp: number;
  knowledgeCredits: number;
  mentoraCredits: number;
  currentStreak: number;
  longestStreak: number;
  leaderboardRank: number;
}

export interface Mission {
  id: number;
  title: string;
  description: string;
  type: string; // e.g. 'Daily', 'Weekly', 'Safety', 'Mentorship'
  assignedRole: UserRole;
  rewardType: 'xp' | 'credits' | 'both';
  rewardAmount: number;
  estimatedTime: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'failed';
  dueDate: string;
}

export interface Skill {
  id: number;
  name: string;
  category: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  progress: number; // 0 to 100
}

export interface Training {
  id: number;
  title: string;
  trainer: string;
  description: string;
  department: string;
  date: string;
  time: string;
  duration: string;
  status: 'upcoming' | 'live' | 'completed';
  participants: number;
  recordingAvailable: boolean;
}

export interface KnowledgeQuestion {
  id: number;
  title: string;
  description: string;
  author: string;
  department: string;
  topic: string;
  status: 'open' | 'resolved';
  createdAt: string;
}

export interface KnowledgeAnswer {
  id: number;
  questionId: number;
  author: string;
  authorRole: string;
  content: string;
  answerType: 'standard' | 'expert' | 'verified';
  verified: boolean;
  helpfulCount: number;
  source?: string;
}

export interface Reward {
  id: number;
  title: string;
  description: string;
  cost: number;
  category: string;
  availability: boolean;
}

export interface Notification {
  id: number;
  type: 'info' | 'success' | 'warning' | 'alert';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
}
