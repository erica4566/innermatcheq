import { MBTIType, AttachmentStyle, LoveLanguage } from './store';

// Assessment Tiers
export type AssessmentTier = 'basic' | 'full' | 'premium';

export interface AssessmentSection {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  tier: AssessmentTier;
  questionCount: number;
  estimatedTime: string;
  description: string;
  unlocksReport: string;
}

export const assessmentSections: AssessmentSection[] = [
  // TIER 1: BASIC (FREE)
  {
    id: 'basics',
    title: 'The Basics',
    subtitle: 'Name & Age',
    icon: 'user',
    iconColor: '#81B29A',
    iconBg: '#81B29A15',
    tier: 'basic',
    questionCount: 2,
    estimatedTime: '30 sec',
    description: 'Let us know who you are',
    unlocksReport: 'Basic Profile',
  },
  {
    id: 'attachment',
    title: 'Attachment Style',
    subtitle: 'How you connect',
    icon: 'shield',
    iconColor: '#E07A5F',
    iconBg: '#E07A5F15',
    tier: 'basic',
    questionCount: 4,
    estimatedTime: '2 min',
    description: 'Discover your relationship patterns',
    unlocksReport: 'Attachment Report',
  },

  // TIER 2: FULL ($4.99)
  {
    id: 'mbti',
    title: 'Personality Type',
    subtitle: 'MBTI Assessment',
    icon: 'brain',
    iconColor: '#81B29A',
    iconBg: '#81B29A15',
    tier: 'full',
    questionCount: 8,
    estimatedTime: '4 min',
    description: 'Uncover your Myers-Briggs type',
    unlocksReport: 'Personality Report',
  },
  {
    id: 'love_languages',
    title: 'Love Languages',
    subtitle: 'How you give & receive love',
    icon: 'heart',
    iconColor: '#D4A574',
    iconBg: '#F2CC8F20',
    tier: 'full',
    questionCount: 5,
    estimatedTime: '2 min',
    description: 'Learn how you express affection',
    unlocksReport: 'Love Languages Report',
  },

  // TIER 3: PREMIUM ($9.99)
  {
    id: 'values',
    title: 'Core Values',
    subtitle: 'What matters most',
    icon: 'sparkles',
    iconColor: '#9333EA',
    iconBg: '#9333EA15',
    tier: 'premium',
    questionCount: 1,
    estimatedTime: '1 min',
    description: 'Identify your guiding principles',
    unlocksReport: 'Values Alignment Report',
  },
  {
    id: 'dealbreakers',
    title: 'Deal Breakers',
    subtitle: 'Your boundaries',
    icon: 'shield-alert',
    iconColor: '#EF4444',
    iconBg: '#EF444415',
    tier: 'premium',
    questionCount: 5,
    estimatedTime: '2 min',
    description: 'Define your must-haves',
    unlocksReport: 'Compatibility Filters',
  },
  {
    id: 'red_flags',
    title: 'Red Flag Detection',
    subtitle: 'Stay safe',
    icon: 'alert-triangle',
    iconColor: '#F97316',
    iconBg: '#F9731615',
    tier: 'premium',
    questionCount: 4,
    estimatedTime: '2 min',
    description: 'Help us protect you from harmful patterns',
    unlocksReport: 'Safety Report',
  },
  {
    id: 'deep_questions',
    title: 'Your Screening Questions',
    subtitle: 'Filter your matches',
    icon: 'message-circle',
    iconColor: '#3B82F6',
    iconBg: '#3B82F615',
    tier: 'premium',
    questionCount: 3,
    estimatedTime: '2 min',
    description: 'Questions matches must answer',
    unlocksReport: 'Deep Match Screening',
  },
];

// Report tiers
export interface ReportTier {
  id: AssessmentTier;
  name: string;
  price: string;
  priceValue: number;
  color: string;
  includes: string[];
  recommended?: boolean;
}

export const reportTiers: ReportTier[] = [
  {
    id: 'basic',
    name: 'Basic Report',
    price: 'FREE',
    priceValue: 0,
    color: '#81B29A',
    includes: [
      'Your Attachment Style',
      'Basic relationship patterns',
      'Connection tips',
    ],
  },
  {
    id: 'full',
    name: 'Full Report',
    price: '$4.99',
    priceValue: 4.99,
    color: '#E07A5F',
    includes: [
      'Everything in Basic',
      'MBTI Personality Type',
      'Love Languages analysis',
      'Ideal partner matches',
      'Communication style guide',
    ],
    recommended: true,
  },
  {
    id: 'premium',
    name: 'Premium Report',
    price: '$9.99',
    priceValue: 9.99,
    color: '#D4A574',
    includes: [
      'Everything in Full',
      'Complete psychological profile',
      'Red flag detection training',
      'Personalized dating strategy',
      'Compatibility predictions',
      'AI-powered match insights',
      'Custom screening questions',
    ],
  },
];

// Checkpoint definitions - where users can stop and purchase
export interface AssessmentCheckpoint {
  afterSection: string;
  tier: AssessmentTier;
  title: string;
  subtitle: string;
  reportName: string;
  reportDescription: string;
}

export const assessmentCheckpoints: AssessmentCheckpoint[] = [
  {
    afterSection: 'attachment',
    tier: 'basic',
    title: 'Basic Assessment Complete!',
    subtitle: 'You\'ve discovered your attachment style',
    reportName: 'Basic Attachment Report',
    reportDescription: 'Your core relationship patterns and connection style',
  },
  {
    afterSection: 'love_languages',
    tier: 'full',
    title: 'Full Assessment Complete!',
    subtitle: 'You now know your personality & love style',
    reportName: 'Full Personality Report',
    reportDescription: 'Complete MBTI type, love languages, and partner compatibility',
  },
  {
    afterSection: 'deep_questions',
    tier: 'premium',
    title: 'Premium Assessment Complete!',
    subtitle: 'You have the full psychological profile',
    reportName: 'Premium Psychological Report',
    reportDescription: 'Everything including red flags, values, and AI insights',
  },
];

// Get sections for a specific tier (includes all lower tiers)
export function getSectionsForTier(tier: AssessmentTier): AssessmentSection[] {
  const tierOrder: AssessmentTier[] = ['basic', 'full', 'premium'];
  const maxIndex = tierOrder.indexOf(tier);
  return assessmentSections.filter((s) => tierOrder.indexOf(s.tier) <= maxIndex);
}

// Get the next checkpoint after completing a section
export function getNextCheckpoint(completedSectionId: string): AssessmentCheckpoint | null {
  return assessmentCheckpoints.find((c) => c.afterSection === completedSectionId) ?? null;
}

// Check if a section is available for a given purchased tier
export function isSectionUnlocked(section: AssessmentSection, purchasedTier: AssessmentTier | null): boolean {
  if (section.tier === 'basic') return true;
  if (!purchasedTier) return false;

  const tierOrder: AssessmentTier[] = ['basic', 'full', 'premium'];
  return tierOrder.indexOf(section.tier) <= tierOrder.indexOf(purchasedTier);
}

// Red Flag Questions for premium tier
export interface RedFlagAssessmentQuestion {
  id: string;
  question: string;
  description: string;
  options: {
    text: string;
    score: number; // 0-4, higher = more concerning
    indicator: 'narcissism' | 'manipulation' | 'control' | 'avoidance';
  }[];
}

export const redFlagAssessmentQuestions: RedFlagAssessmentQuestion[] = [
  {
    id: 'rf1',
    question: 'When someone criticizes you, how do you typically respond?',
    description: 'Helps identify emotional regulation patterns',
    options: [
      { text: 'I reflect on it and thank them if valid', score: 0, indicator: 'narcissism' },
      { text: 'I feel hurt but try to understand their perspective', score: 1, indicator: 'narcissism' },
      { text: 'I get defensive but calm down later', score: 2, indicator: 'narcissism' },
      { text: 'I dismiss it - they don\'t understand me', score: 3, indicator: 'narcissism' },
      { text: 'I turn it around - they\'re the problem', score: 4, indicator: 'narcissism' },
    ],
  },
  {
    id: 'rf2',
    question: 'How often were conflicts in past relationships your fault?',
    description: 'Assesses accountability patterns',
    options: [
      { text: 'About half the time - takes two', score: 0, indicator: 'avoidance' },
      { text: 'Sometimes me, sometimes them', score: 1, indicator: 'avoidance' },
      { text: 'Mostly them, I tried my best', score: 2, indicator: 'avoidance' },
      { text: 'Rarely me - I\'m easy to get along with', score: 3, indicator: 'avoidance' },
      { text: 'Never me - I always had difficult partners', score: 4, indicator: 'avoidance' },
    ],
  },
  {
    id: 'rf3',
    question: 'How do you feel about your partner having close friends of the opposite sex?',
    description: 'Measures trust and control tendencies',
    options: [
      { text: 'Great - healthy friendships matter', score: 0, indicator: 'control' },
      { text: 'Fine, as long as I know about them', score: 1, indicator: 'control' },
      { text: 'A bit uncomfortable but I deal with it', score: 2, indicator: 'control' },
      { text: 'I\'d want to meet them and monitor', score: 3, indicator: 'control' },
      { text: 'I\'d prefer they didn\'t have those friendships', score: 4, indicator: 'control' },
    ],
  },
  {
    id: 'rf4',
    question: 'When you want something from your partner, how do you typically get it?',
    description: 'Identifies communication vs manipulation patterns',
    options: [
      { text: 'I ask directly and respect their answer', score: 0, indicator: 'manipulation' },
      { text: 'I explain why it matters to me', score: 1, indicator: 'manipulation' },
      { text: 'I might bring it up multiple times', score: 2, indicator: 'manipulation' },
      { text: 'I know how to frame things to get a yes', score: 3, indicator: 'manipulation' },
      { text: 'I have ways to make them see my side', score: 4, indicator: 'manipulation' },
    ],
  },
];

// Report content types
export interface ReportSection {
  id: string;
  title: string;
  tier: AssessmentTier;
  icon: string;
  color: string;
}

export const reportSections: ReportSection[] = [
  // Basic
  { id: 'attachment_summary', title: 'Attachment Style Summary', tier: 'basic', icon: 'shield', color: '#E07A5F' },
  { id: 'relationship_patterns', title: 'Your Relationship Patterns', tier: 'basic', icon: 'repeat', color: '#81B29A' },

  // Full
  { id: 'mbti_profile', title: 'MBTI Personality Profile', tier: 'full', icon: 'brain', color: '#81B29A' },
  { id: 'love_languages', title: 'Love Languages Analysis', tier: 'full', icon: 'heart', color: '#D4A574' },
  { id: 'ideal_partners', title: 'Ideal Partner Types', tier: 'full', icon: 'users', color: '#E07A5F' },

  // Premium
  { id: 'full_eq_analysis', title: 'Emotional Intelligence Score', tier: 'premium', icon: 'sparkles', color: '#9333EA' },
  { id: 'red_flag_training', title: 'Red Flag Detection Guide', tier: 'premium', icon: 'alert-triangle', color: '#F97316' },
  { id: 'dating_strategy', title: 'Personalized Dating Strategy', tier: 'premium', icon: 'target', color: '#3B82F6' },
  { id: 'compatibility_matrix', title: 'Compatibility Predictions', tier: 'premium', icon: 'grid', color: '#10B981' },
];
