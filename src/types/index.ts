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
  id: string | number;
  title: string;
  description: string;
  author: string;
  department: string;
  topic: string;
  status: 'open' | 'resolved';
  createdAt: string;
}

export interface KnowledgeAnswer {
  id: string | number;
  questionId: string | number;
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

export interface JourneyStage {
  id: number;
  courseId: number;
  title: string;
  description?: string;
  stageLevel: string;
  orderIndex: number;
  xpRequired: number;
}

export type ActivityType =
  | 'concept'
  | 'interactive'
  | 'kai_chat'
  | 'challenge'
  | 'scenario'
  | 'quiz'
  | 'reflection'
  | 'mini_project'
  | 'skill_unlock';

export interface LearningActivity {
  id: number;
  stageId: number;
  courseId: number;
  title: string;
  description?: string;
  activityType: ActivityType;
  content: any;
  orderIndex: number;
  xpReward: number;
  estimatedMinutes: number;
  isRequired: boolean;
}

export interface UserActivityProgress {
  id: string;
  userId: string;
  courseId: number;
  activityId: number;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  xpEarned: number;
  attempts: number;
  startedAt: string;
  completedAt?: string;
  lastAccessedAt: string;
}

export interface LearningBite {
  id: number;
  activityId: number;
  courseId: number;
  stageId: number;
  title: string;
  subtitle?: string;
  biteType: string;
  content: {
    concept?: {
      title: string;
      description: string;
    };
    simpleExplanation?: {
      text: string;
    };
    visual?: {
      type: 'flow' | 'comparison' | 'timeline' | 'process' | 'cards';
      data: {
        steps?: string[];
        leftTitle?: string;
        rightTitle?: string;
        comparisonItems?: Array<{ label: string; left: string; right: string }>;
        timelineItems?: Array<{ title: string; desc: string }>;
        cardItems?: Array<{ title: string; desc: string }>;
      };
    };
    realWorldExample?: {
      title: string;
      description: string;
    };
    quickActivity?: {
      type: 'multiple_choice' | 'true_false' | 'select_best_answer';
      question: string;
      options: string[];
      correctAnswer: number;
    };
    kaiFeedback?: {
      correct: string;
      incorrect: string;
    };
    [key: string]: any;
  };
  orderIndex: number;
  estimatedMinutes: number;
  xpReward: number;
  isRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserBiteProgress {
  id: string;
  userId: string;
  biteId: number;
  activityId: number;
  courseId: number;
  status: 'not_started' | 'in_progress' | 'completed';
  attempts: number;
  isCorrect: boolean;
  xpEarned: number;
  startedAt: string;
  completedAt?: string;
  lastAccessedAt: string;
}

