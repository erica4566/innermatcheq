/**
 * Shared TypeScript Types for InnerMatchEQ
 *
 * This module contains all shared types used across web and mobile clients.
 * These types are platform-agnostic and define the data contracts with the Supabase backend.
 */

// ================== PERSONALITY & PSYCHOLOGY TYPES ==================

export type MBTIType =
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP';

export type AttachmentStyle = 'secure' | 'anxious' | 'avoidant' | 'disorganized';
export type LoveLanguage = 'words' | 'acts' | 'gifts' | 'time' | 'touch';
export type ConflictStyle = 'avoid' | 'compete' | 'accommodate' | 'compromise' | 'collaborate';
export type RelationshipGoal = 'casual' | 'serious' | 'marriage' | 'unsure';
export type CommunicationFrequency = 'constant' | 'frequent' | 'moderate' | 'minimal';
export type AffectionLevel = 'very_affectionate' | 'moderate' | 'reserved' | 'minimal';
export type FinancialAttitude = 'saver' | 'balanced' | 'spender';
export type EmotionalRegulationStyle = 'suppressor' | 'expresser' | 'reappraiser' | 'seeker';
export type VerificationLevel = 'none' | 'photo' | 'id' | 'background' | 'credit';
export type PremiumTier = 'free' | 'plus' | 'premium' | 'elite';
export type Gender = 'man' | 'woman' | 'nonbinary' | null;
export type LookingFor = 'men' | 'women' | 'everyone' | null;

// ================== BIG FIVE PERSONALITY ==================

export interface BigFiveScores {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

// ================== RED FLAG PROFILE ==================

export interface RedFlagProfile {
  narcissismScore: number;
  manipulationRisk: number;
  emotionalAvailability: number;
  consistencyScore: number;
  flags: string[];
}

// ================== DEAL BREAKERS ==================

export interface DealBreakers {
  smoking: 'never' | 'sometimes' | 'any';
  drinking: 'never' | 'social' | 'any';
  cannabis: 'never' | 'occasional' | 'any';
  drugs: boolean;
  hasKids: 'yes' | 'no' | 'any';
  wantsKids: 'yes' | 'no' | 'any';
  religion: string | null;
  ageRange: { min: number; max: number };
  distance: number;
}

// ================== MBTI SCORES ==================

export interface MBTIScores {
  E: number;
  I: number;
  S: number;
  N: number;
  T: number;
  F: number;
  J: number;
  P: number;
}

// ================== PURCHASED REPORTS ==================

export interface PurchasedReports {
  attachment?: boolean;
  mbti?: boolean;
  loveLanguage?: boolean;
  bigFive?: boolean;
  compatibility?: boolean;
  redFlags?: boolean;
  idealPartner?: boolean;
  fullBundle?: boolean;
}

// ================== VERIFICATION CHECKS ==================

export interface VerificationChecks {
  photoVerified?: boolean;
  idVerified?: boolean;
  backgroundCheck?: boolean;
  creditCheck?: boolean;
}

// ================== USER PROFILE ==================

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  photos: string[];
  location?: string;
  zipCode?: string;
  maxDistance?: number;
  occupation?: string;
  height?: number;

  // Gender & Seeking
  gender: Gender;
  lookingFor: LookingFor;

  // Psychological profile
  attachmentStyle: AttachmentStyle | null;
  mbtiType: MBTIType | null;
  loveLanguages: LoveLanguage[];
  emotionalIntelligence: number;

  // Assessment scores
  mbtiScores: MBTIScores | null;
  bigFiveScores: BigFiveScores | null;

  // Relationship preferences
  conflictStyle: ConflictStyle | null;
  relationshipGoal: RelationshipGoal | null;
  communicationFrequency: CommunicationFrequency | null;
  affectionLevel: AffectionLevel | null;
  financialAttitude: FinancialAttitude | null;
  splitBillPreference: 'always_split' | 'take_turns' | 'whoever_invites' | 'flexible' | null;
  emotionalRegulationStyle: EmotionalRegulationStyle | null;

  // Values and preferences
  values: string[];
  interests: string[];
  dealbreakers: DealBreakers | null;
  criticalQuestions: string[];

  // Lifestyle
  smoking: 'never' | 'sometimes' | 'regularly';
  drinking: 'never' | 'social' | 'regularly';
  cannabis: 'never' | 'occasionally' | 'regularly';
  exercise: 'never' | 'sometimes' | 'regularly';
  education: string;
  religion: string;

  // Verification
  isVerified: boolean;
  verificationLevel: VerificationLevel;
  verificationChecks?: VerificationChecks;

  // Premium
  isPremium: boolean;
  premiumTier: PremiumTier;
  purchasedReports: PurchasedReports;

  // Video Profile
  videoIntroUrl?: string;
  hasVideoIntro: boolean;
}

// ================== COMPATIBILITY BREAKDOWN ==================

export interface CompatibilityBreakdown {
  attachment: number;
  mbti: number;
  loveLanguage: number;
  values: number;
  lifestyle: number;
}

// ================== MATCH ==================

export interface Match {
  id: string;
  name: string;
  age: number;
  photo: string;
  photos?: string[];
  bio?: string;
  occupation?: string;
  location?: string;
  zipCode?: string;
  distance?: number;
  height?: number;
  gender?: Gender;

  // Compatibility
  compatibilityScore: number;
  compatibilityBreakdown?: CompatibilityBreakdown;

  // Psychological
  attachmentStyle: string;
  mbtiType?: MBTIType;
  loveLanguages?: LoveLanguage[];

  // Red flags
  redFlagProfile?: RedFlagProfile;
  hasWarnings?: boolean;
  warnings?: string[];

  // Shared
  sharedValues: string[];
  sharedInterests?: string[];

  // Verification
  isVerified?: boolean;
  verificationLevel?: VerificationLevel;
  verificationChecks?: VerificationChecks;

  // Chat
  lastMessage?: string;
  lastMessageTime?: string;
  isNew?: boolean;

  // Video
  hasVideoIntro?: boolean;
  videoIntroUrl?: string;

  // Lifestyle
  smoking?: 'never' | 'sometimes' | 'regularly';
  drinking?: 'never' | 'social' | 'regularly';
  cannabis?: 'never' | 'occasionally' | 'regularly';
  exercise?: 'never' | 'sometimes' | 'regularly';
  education?: string;
  religion?: string;
  relationshipGoal?: RelationshipGoal;
  lookingFor?: LookingFor;

  criticalQuestions?: string[];
}

// ================== MESSAGE ==================

export interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them' | 'ai';
  timestamp: string;
  isAiSuggestion?: boolean;
}

// ================== REFERRAL ==================

export interface Referral {
  id: string;
  referredUserId: string;
  referredUserName: string;
  status: 'pending' | 'signed_up' | 'subscribed';
  rewardEarned: boolean;
  createdAt: string;
}

// ================== VIDEO DATE ==================

export interface VideoDate {
  id: string;
  matchId: string;
  matchName: string;
  matchPhoto: string;
  scheduledAt: string;
  duration: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

// ================== AUTH USER ==================

export interface AuthUser {
  id: string;
  email: string;
}

// ================== API RESPONSE TYPES ==================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface AuthResponse {
  user: AuthUser | null;
  error: string | null;
}

export interface SwipeResponse {
  isMatch: boolean;
}

// ================== QUIZ TYPES ==================

export interface QuizSubmission {
  userId: string;
  quizType: 'attachment' | 'mbti' | 'loveLanguage' | 'bigFive' | 'redFlag';
  answers: Record<string, string | number>;
}

export interface QuizResult {
  quizType: QuizSubmission['quizType'];
  result: AttachmentStyle | MBTIType | LoveLanguage[] | BigFiveScores | RedFlagProfile;
  scores?: Record<string, number>;
  completedAt: string;
}

// ================== ENTITLEMENT TYPES ==================

export interface EntitlementCheck {
  userId: string;
  entitlementId: string;
  hasAccess: boolean;
  expiresAt?: string;
}

export interface SubscriptionStatus {
  tier: PremiumTier;
  isActive: boolean;
  expiresAt?: string;
  purchasedReports: PurchasedReports;
}

// ================== ONBOARDING STATE ==================

export interface OnboardingState {
  step: number;
  totalSteps: number;
  name: string;
  age: string;
  gender: string;
  lookingFor: string;
  attachmentAnswers: Record<string, string>;
  mbtiAnswers: Record<string, string>;
  loveLanguageAnswers: Record<string, number>;
  redFlagAnswers: Record<string, number>;
  values: string[];
  interests: string[];
  dealbreakers: Partial<DealBreakers>;
  criticalQuestions: string[];
  smoking: string;
  drinking: string;
  education: string;
  religion: string;
}
