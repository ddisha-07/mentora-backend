import { UserRole } from '../types';

export interface RoleMetadata {
  displayName: string;
  description: string;
  permissions: string[];
  availableFeatures: string[];
  missionTypes: string[];
  learningAccess: string[];
  knowledgeContributionAccess: boolean;
}

export const ROLES_CONFIG: Record<UserRole, RoleMetadata> = {
  SHOP_FLOOR_WORKER: {
    displayName: 'Shop Floor Worker',
    description: 'Focuses on operational tasks, safety guidelines, and quick knowledge sharing.',
    permissions: ['read_courses', 'read_missions', 'view_safety_training', 'ask_questions'],
    availableFeatures: ['Home', 'Learn', 'Training', 'Skill Passport', 'AI in My Work'],
    missionTypes: ['Safety Compliance', 'Machine Operations', 'Quick Assessment'],
    learningAccess: ['Basic Safety', 'Operational Excellence'],
    knowledgeContributionAccess: false,
  },
  JUNIOR_EMPLOYEE: {
    displayName: 'Junior Employee',
    description: 'Focuses on structured learning paths, earning credits, and gaining certifications.',
    permissions: ['read_courses', 'read_missions', 'view_all_training', 'ask_questions', 'answer_questions'],
    availableFeatures: ['Home', 'Learn', 'Training', 'Knowledge Exchange', 'Skill Passport', 'Leaderboard', 'Rewards', 'AI in My Work'],
    missionTypes: ['Structured Course', 'Skill Challenge', 'Peer Help'],
    learningAccess: ['Full Catalog'],
    knowledgeContributionAccess: true,
  },
  SENIOR_EMPLOYEE: {
    displayName: 'Senior Employee',
    description: 'Focuses on mentoring others, verifying knowledge answers, and contributing to the repository.',
    permissions: [
      'read_courses',
      'read_missions',
      'view_all_training',
      'ask_questions',
      'answer_questions',
      'verify_answers',
      'create_training',
    ],
    availableFeatures: ['Home', 'Learn', 'Knowledge Hub', 'Knowledge Exchange', 'Training', 'Leaderboard', 'Rewards', 'Skill Passport', 'AI in My Work'],
    missionTypes: ['Mentorship', 'Content Review', 'Advanced Training'],
    learningAccess: ['Full Catalog', 'Advanced Leadership'],
    knowledgeContributionAccess: true,
  },
  OFFICER_MANAGER: {
    displayName: 'Officer / Manager',
    description: 'Tracks team analytics, schedules training sessions, and manages department knowledge repository.',
    permissions: [
      'read_courses',
      'read_missions',
      'view_all_training',
      'create_training',
      'moderate_questions',
      'view_analytics',
    ],
    availableFeatures: ['Home', 'Learn', 'Knowledge Hub', 'Knowledge Exchange', 'Training', 'Leaderboard', 'Rewards', 'Skill Passport', 'AI in My Work', 'Admin Console'],
    missionTypes: ['Team Leadership', 'Policy Update'],
    learningAccess: ['Management & Strategy', 'Full Catalog'],
    knowledgeContributionAccess: true,
  },
  RETIRED_EMPLOYEE: {
    displayName: 'Retired Employee / Expert',
    description: 'Contributes advisory knowledge, answers complex operational questions, and reviews expert solutions.',
    permissions: ['read_courses', 'ask_questions', 'answer_questions', 'verify_answers', 'write_articles'],
    availableFeatures: ['Home', 'Knowledge Hub', 'Knowledge Exchange', 'Leaderboard', 'Skill Passport', 'AI in My Work'],
    missionTypes: ['Expert Advice', 'Archive Review'],
    learningAccess: ['Selective Advisory'],
    knowledgeContributionAccess: true,
  },
  ADMIN: {
    displayName: 'Administrator',
    description: 'Full system control, role assignments, platform management, and system auditing.',
    permissions: ['*'],
    availableFeatures: ['*'],
    missionTypes: ['*'],
    learningAccess: ['*'],
    knowledgeContributionAccess: true,
  },
};

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(role: UserRole, permission: string): boolean {
  const config = ROLES_CONFIG[role];
  if (!config) return false;
  if (config.permissions.includes('*')) return true;
  return config.permissions.includes(permission);
}

/**
 * Check if a role can access a specific feature.
 */
export function canAccessFeature(role: UserRole, feature: string): boolean {
  const config = ROLES_CONFIG[role];
  if (!config) return false;
  if (config.availableFeatures.includes('*')) return true;
  return config.availableFeatures.includes(feature);
}
