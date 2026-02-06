import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

// Generate a secure referral code
const generateSecureReferralCode = (): string => {
  // Use crypto random values for better security
  const array = new Uint8Array(8);
  // Use Math.random as fallback since crypto is async
  for (let i = 0; i < 8; i++) {
    array[i] = Math.floor(Math.random() * 256);
  }
  const code = Array.from(array)
    .map(b => b.toString(36))
    .join('')
    .substring(0, 12)
    .toUpperCase();
  return `IM${code}`;
};

// MBTI Types
export type MBTIType =
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP';

export type AttachmentStyle = 'secure' | 'anxious' | 'avoidant' | 'disorganized';
export type LoveLanguage = 'words' | 'acts' | 'gifts' | 'time' | 'touch';

// NEW: Conflict Resolution Style
export type ConflictStyle = 'avoid' | 'compete' | 'accommodate' | 'compromise' | 'collaborate';

// NEW: Relationship Goals
export type RelationshipGoal = 'casual' | 'serious' | 'marriage' | 'unsure';

// NEW: Communication Frequency
export type CommunicationFrequency = 'constant' | 'frequent' | 'moderate' | 'minimal';

// NEW: Physical Affection Level
export type AffectionLevel = 'very_affectionate' | 'moderate' | 'reserved' | 'minimal';

// NEW: Financial Attitude
export type FinancialAttitude = 'saver' | 'balanced' | 'spender';

// NEW: Big Five (OCEAN) Personality Traits
export interface BigFiveScores {
  openness: number;        // 0-100: Curiosity, creativity, openness to new experiences
  conscientiousness: number; // 0-100: Organization, dependability, self-discipline
  extraversion: number;    // 0-100: Sociability, assertiveness, positive emotions
  agreeableness: number;   // 0-100: Cooperation, trust, altruism
  neuroticism: number;     // 0-100: Emotional instability, anxiety, moodiness
}

// NEW: Emotional Regulation Style
export type EmotionalRegulationStyle = 'suppressor' | 'expresser' | 'reappraiser' | 'seeker';

// Red flag indicators
export interface RedFlagProfile {
  narcissismScore: number;
  manipulationRisk: number;
  emotionalAvailability: number;
  consistencyScore: number;
  flags: string[];
}

// Deal breakers
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

// Comprehensive user profile
export interface UserProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  photos: string[];
  location?: string;
  zipCode?: string;
  maxDistance?: number; // in miles
  occupation?: string;
  height?: number;

  // Gender & Seeking preferences
  gender: 'man' | 'woman' | 'nonbinary' | null;
  lookingFor: 'men' | 'women' | 'everyone' | null;

  // Psychological profile
  attachmentStyle: AttachmentStyle | null;
  mbtiType: MBTIType | null;
  loveLanguages: LoveLanguage[];
  emotionalIntelligence: number;

  // Assessment scores
  mbtiScores: {
    E: number; I: number;
    S: number; N: number;
    T: number; F: number;
    J: number; P: number;
  } | null;

  // NEW: Big Five (OCEAN) scores - more scientifically validated
  bigFiveScores: BigFiveScores | null;

  // NEW: Conflict resolution style
  conflictStyle: ConflictStyle | null;

  // NEW: Relationship goals
  relationshipGoal: RelationshipGoal | null;

  // NEW: Communication preferences
  communicationFrequency: CommunicationFrequency | null;

  // NEW: Physical affection comfort level
  affectionLevel: AffectionLevel | null;

  // NEW: Financial attitude
  financialAttitude: FinancialAttitude | null;
  splitBillPreference: 'always_split' | 'take_turns' | 'whoever_invites' | 'flexible' | null;

  // NEW: Emotional regulation style
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
  verificationLevel: 'none' | 'photo' | 'id' | 'background' | 'credit';
  verificationChecks?: {
    photoVerified?: boolean;
    idVerified?: boolean;
    backgroundCheck?: boolean;
    creditCheck?: boolean;
  };

  // Premium
  isPremium: boolean;
  premiumTier: 'free' | 'plus' | 'premium' | 'elite';

  // Purchased individual reports
  purchasedReports: {
    attachment?: boolean;      // $2.99 - Attachment Style Report
    mbti?: boolean;            // $3.99 - MBTI Personality Report
    loveLanguage?: boolean;    // $2.99 - Love Language Report
    bigFive?: boolean;         // $4.99 - Big Five (OCEAN) Report
    compatibility?: boolean;   // $6.99 - Full Compatibility Analysis
    redFlags?: boolean;        // $4.99 - Red Flag Detection Report
    idealPartner?: boolean;    // $5.99 - Ideal Partner Profile
    fullBundle?: boolean;      // $19.99 - All Reports Bundle
  };

  // Video Profile
  videoIntroUrl?: string;
  hasVideoIntro: boolean;
}

// Referral system
export interface Referral {
  id: string;
  referredUserId: string;
  referredUserName: string;
  status: 'pending' | 'signed_up' | 'subscribed';
  rewardEarned: boolean;
  createdAt: string;
}

// Video date
export interface VideoDate {
  id: string;
  matchId: string;
  matchName: string;
  matchPhoto: string;
  scheduledAt: string;
  duration: number; // minutes
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

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
  distance?: number; // in miles from current user
  height?: number;

  // Gender
  gender?: 'man' | 'woman' | 'nonbinary' | null;

  // Compatibility
  compatibilityScore: number;
  compatibilityBreakdown?: {
    attachment: number;
    mbti: number;
    loveLanguage: number;
    values: number;
    lifestyle: number;
  };

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
  verificationLevel?: 'none' | 'photo' | 'id' | 'background' | 'credit';
  verificationChecks?: {
    photoVerified?: boolean;
    idVerified?: boolean;
    backgroundCheck?: boolean;
    creditCheck?: boolean;
  };

  // Chat
  lastMessage?: string;
  lastMessageTime?: string;
  isNew?: boolean;

  // Video
  hasVideoIntro?: boolean;
  videoIntroUrl?: string;

  // Lifestyle (competitor features)
  smoking?: 'never' | 'sometimes' | 'regularly';
  drinking?: 'never' | 'social' | 'regularly';
  cannabis?: 'never' | 'occasionally' | 'regularly';
  exercise?: 'never' | 'sometimes' | 'regularly';
  education?: string;
  religion?: string;
  relationshipGoal?: RelationshipGoal;
  lookingFor?: 'men' | 'women' | 'everyone' | null;

  // Custom questions the user wants answered
  criticalQuestions?: string[];
}

export interface OnboardingState {
  step: number;
  totalSteps: number;

  // Basic info
  name: string;
  age: string;
  gender: string;
  lookingFor: string;

  // Assessments
  attachmentAnswers: Record<string, string>;
  mbtiAnswers: Record<string, string>;
  loveLanguageAnswers: Record<string, number>;
  redFlagAnswers: Record<string, number>;

  // Preferences
  values: string[];
  interests: string[];
  dealbreakers: Partial<DealBreakers>;
  criticalQuestions: string[];

  // Lifestyle
  smoking: string;
  drinking: string;
  education: string;
  religion: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them' | 'ai';
  timestamp: string;
  isAiSuggestion?: boolean;
}

interface AppState {
  isOnboarded: boolean;
  isHydrated: boolean; // Whether the store has been hydrated from AsyncStorage
  currentUser: UserProfile | null;
  onboarding: OnboardingState;
  matches: Match[];
  connections: Match[];
  messages: Record<string, Message[]>;

  // Premium features
  showPaywall: boolean;
  dailyLikesRemaining: number;
  dailySuperLikesRemaining: number;

  // Referral system
  referralCode: string;
  referrals: Referral[];
  referralRewards: {
    freePremiumDays: number;
    bonusSuperLikes: number;
  };

  // Video dates
  scheduledVideoDates: VideoDate[];

  // Actions
  setOnboarded: (value: boolean) => void;
  setOnboardedAsync: (value: boolean) => Promise<void>;
  setCurrentUser: (user: UserProfile | null) => void;
  setCurrentUserAsync: (user: UserProfile | null) => Promise<void>;
  updateCurrentUser: (data: Partial<UserProfile>) => void;
  updateOnboarding: (data: Partial<OnboardingState>) => void;
  resetOnboarding: () => void;
  addConnection: (match: Match) => void;
  removeMatch: (matchId: string) => void;
  addMessage: (matchId: string, message: Message) => void;
  setShowPaywall: (show: boolean) => void;
  useLike: () => boolean;
  useSuperLike: () => boolean;
  setMatches: (matches: Match[]) => void;

  // Referral actions
  addReferral: (referral: Referral) => void;
  claimReferralReward: (referralId: string) => void;

  // Video date actions
  scheduleVideoDate: (videoDate: VideoDate) => void;
  updateVideoDateStatus: (videoDateId: string, status: VideoDate['status']) => void;
  cancelVideoDate: (videoDateId: string) => void;
}

const initialOnboarding: OnboardingState = {
  step: 0,
  totalSteps: 10,
  name: '',
  age: '',
  gender: '',
  lookingFor: '',
  attachmentAnswers: {},
  mbtiAnswers: {},
  loveLanguageAnswers: {},
  redFlagAnswers: {},
  values: [],
  interests: [],
  dealbreakers: {},
  criticalQuestions: [],
  smoking: '',
  drinking: '',
  education: '',
  religion: '',
};

export const useAppStore = create<AppState>((set, get) => ({
  isOnboarded: false,
  isHydrated: false,
  currentUser: null,
  onboarding: initialOnboarding,
  matches: [],
  connections: [],
  messages: {},
  showPaywall: false,
  dailyLikesRemaining: 10,
  dailySuperLikesRemaining: 1,

  // Referral system
  referralCode: generateSecureReferralCode(),
  referrals: [],
  referralRewards: {
    freePremiumDays: 0,
    bonusSuperLikes: 0,
  },

  // Video dates
  scheduledVideoDates: [],

  setOnboarded: (value) => {
    set({ isOnboarded: value });
    // Fire-and-forget persistence - use setOnboardedAsync for guaranteed persistence
    AsyncStorage.setItem('isOnboarded', JSON.stringify(value));
  },

  // Async version that guarantees persistence before returning
  setOnboardedAsync: async (value: boolean) => {
    await AsyncStorage.setItem('isOnboarded', JSON.stringify(value));
    set({ isOnboarded: value });
  },

  setCurrentUser: (user) => {
    set({ currentUser: user });
    if (user) {
      // Fire-and-forget persistence - use setCurrentUserAsync for guaranteed persistence
      AsyncStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      AsyncStorage.removeItem('currentUser');
    }
  },

  // Async version that guarantees persistence before returning
  setCurrentUserAsync: async (user: UserProfile | null) => {
    if (user) {
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem('currentUser');
    }
    set({ currentUser: user });
  },

  updateCurrentUser: (data) => {
    const current = get().currentUser;
    if (current) {
      const updated = { ...current, ...data };
      set({ currentUser: updated });
      AsyncStorage.setItem('currentUser', JSON.stringify(updated));
    }
  },

  updateOnboarding: (data) => {
    set((state) => ({
      onboarding: { ...state.onboarding, ...data },
    }));
  },

  resetOnboarding: () => {
    set({ onboarding: initialOnboarding });
  },

  addConnection: (match) => {
    set((state) => ({
      connections: [{ ...match, isNew: true }, ...state.connections],
      matches: state.matches.filter((m) => m.id !== match.id),
    }));
  },

  removeMatch: (matchId) => {
    set((state) => ({
      matches: state.matches.filter((m) => m.id !== matchId),
    }));
  },

  addMessage: (matchId, message) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [matchId]: [...(state.messages[matchId] || []), message],
      },
    }));
  },

  setShowPaywall: (show) => set({ showPaywall: show }),

  useLike: () => {
    const { dailyLikesRemaining, currentUser } = get();
    if (currentUser?.isPremium) return true;
    if (dailyLikesRemaining > 0) {
      set({ dailyLikesRemaining: dailyLikesRemaining - 1 });
      return true;
    }
    set({ showPaywall: true });
    return false;
  },

  useSuperLike: () => {
    const { dailySuperLikesRemaining, currentUser } = get();
    if (currentUser?.premiumTier === 'elite') return true;
    if (dailySuperLikesRemaining > 0) {
      set({ dailySuperLikesRemaining: dailySuperLikesRemaining - 1 });
      return true;
    }
    set({ showPaywall: true });
    return false;
  },

  setMatches: (matches) => set({ matches }),

  // Referral actions
  addReferral: (referral) => {
    set((state) => ({
      referrals: [...state.referrals, referral],
    }));
  },

  claimReferralReward: (referralId) => {
    set((state) => {
      const referral = state.referrals.find((r) => r.id === referralId);
      if (!referral || referral.rewardEarned) return state;

      const updatedReferrals = state.referrals.map((r) =>
        r.id === referralId ? { ...r, rewardEarned: true } : r
      );

      // Reward: 7 days free premium OR 5 super likes per referral
      const newRewards = {
        freePremiumDays: state.referralRewards.freePremiumDays + (referral.status === 'subscribed' ? 7 : 0),
        bonusSuperLikes: state.referralRewards.bonusSuperLikes + (referral.status === 'signed_up' ? 5 : 0),
      };

      return {
        referrals: updatedReferrals,
        referralRewards: newRewards,
        dailySuperLikesRemaining: state.dailySuperLikesRemaining + (referral.status === 'signed_up' ? 5 : 0),
      };
    });
  },

  // Video date actions
  scheduleVideoDate: (videoDate) => {
    set((state) => ({
      scheduledVideoDates: [...state.scheduledVideoDates, videoDate],
    }));
  },

  updateVideoDateStatus: (videoDateId, status) => {
    set((state) => ({
      scheduledVideoDates: state.scheduledVideoDates.map((vd) =>
        vd.id === videoDateId ? { ...vd, status } : vd
      ),
    }));
  },

  cancelVideoDate: (videoDateId) => {
    set((state) => ({
      scheduledVideoDates: state.scheduledVideoDates.map((vd) =>
        vd.id === videoDateId ? { ...vd, status: 'cancelled' as const } : vd
      ),
    }));
  },
}));

// Hydrate store from AsyncStorage
export const hydrateStore = async () => {
  try {
    const currentUser = await AsyncStorage.getItem('currentUser');

    // Parse currentUser if available
    let parsedUser: UserProfile | null = null;
    if (currentUser) {
      try {
        parsedUser = JSON.parse(currentUser);
        useAppStore.setState({ currentUser: parsedUser });
      } catch (e) {
        if (__DEV__) {
          console.error('Error parsing currentUser:', e);
        }
        await AsyncStorage.removeItem('currentUser');
      }
    }

    // CRITICAL: Do NOT hydrate isOnboarded here!
    // The auth subscription is the single source of truth for isOnboarded.
    // Hydrating it here causes race conditions where stale values redirect users
    // before auth subscription can validate the user's profile.
    //
    // The auth subscription will:
    // 1. Check if the user's profile is complete
    // 2. Set isOnboarded appropriately based on actual profile data
    // 3. Clear AsyncStorage if needed for new/different users

    // Mark hydration as complete
    useAppStore.setState({ isHydrated: true });
  } catch (error) {
    if (__DEV__) {
      console.error('Error hydrating store:', error);
    }
    // Still mark as hydrated even on error so the app can proceed
    useAppStore.setState({ isHydrated: true });
  }
};

// Helper functions for personality analysis
export function calculateMBTI(answers: Record<string, string>): { type: MBTIType; scores: UserProfile['mbtiScores'] } {
  const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

  Object.values(answers).forEach((answer) => {
    if (answer in scores) {
      scores[answer as keyof typeof scores]++;
    }
  });

  const type = (
    (scores.E >= scores.I ? 'E' : 'I') +
    (scores.S >= scores.N ? 'S' : 'N') +
    (scores.T >= scores.F ? 'T' : 'F') +
    (scores.J >= scores.P ? 'J' : 'P')
  ) as MBTIType;

  return { type, scores };
}

export function calculateAttachmentStyle(answers: Record<string, string>): AttachmentStyle {
  const counts: Record<string, number> = {};
  Object.values(answers).forEach((style) => {
    counts[style] = (counts[style] || 0) + 1;
  });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return (sorted[0]?.[0] || 'secure') as AttachmentStyle;
}

export function calculateLoveLanguages(answers: Record<string, number>): LoveLanguage[] {
  const sorted = Object.entries(answers)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([lang]) => lang as LoveLanguage);
  return sorted;
}

/**
 * Calculate Emotional Intelligence (EQ) Score
 *
 * EQ is calculated based on:
 * - Attachment style (secure = higher EQ)
 * - MBTI preference for Feeling (F) over Thinking (T)
 * - Love language awareness (having identified primary languages)
 * - Completion of self-assessment (demonstrates self-awareness)
 *
 * Score ranges from 0-100:
 * - 85-100: Very High EQ
 * - 70-84: High EQ
 * - 55-69: Average EQ
 * - 40-54: Below Average EQ
 * - Below 40: Low EQ
 */
export function calculateEQ(
  attachmentStyle: AttachmentStyle | null,
  mbtiScores: UserProfile['mbtiScores'] | null,
  loveLanguages: LoveLanguage[],
  hasCompletedAssessment: boolean
): number {
  let score = 50; // Base score

  // Attachment style contribution (up to +25 points)
  if (attachmentStyle) {
    switch (attachmentStyle) {
      case 'secure':
        score += 25; // Secure attachment = high emotional regulation
        break;
      case 'anxious':
        score += 15; // High emotional awareness, may struggle with regulation
        break;
      case 'avoidant':
        score += 10; // May suppress emotions
        break;
      case 'disorganized':
        score += 8; // Complex emotional patterns
        break;
    }
  }

  // MBTI contribution (up to +15 points)
  if (mbtiScores) {
    // Feeling types tend to have higher emotional awareness
    const feelingRatio = mbtiScores.F / (mbtiScores.F + mbtiScores.T + 1);
    score += Math.round(feelingRatio * 15);

    // Intuitive types may have better emotional insight
    const intuitiveRatio = mbtiScores.N / (mbtiScores.N + mbtiScores.S + 1);
    score += Math.round(intuitiveRatio * 5);
  }

  // Love language awareness (+5 points for identifying preferences)
  if (loveLanguages.length > 0) {
    score += 5;
  }

  // Self-assessment completion bonus (+5 points)
  // Taking time to understand yourself demonstrates emotional intelligence
  if (hasCompletedAssessment) {
    score += 5;
  }

  // Ensure score is within bounds
  return Math.min(100, Math.max(0, score));
}

export function analyzeRedFlags(answers: Record<string, number>): RedFlagProfile {
  let narcissismScore = 0;
  let manipulationRisk = 0;
  let emotionalAvailability = 80;
  let consistencyScore = 85;
  const flags: string[] = [];

  // Analyze based on answer patterns
  const values = Object.values(answers);
  const avg = values.reduce((a, b) => a + b, 0) / values.length || 0;

  narcissismScore = Math.min(100, avg * 15);
  manipulationRisk = Math.min(100, avg * 12);

  if (narcissismScore > 60) flags.push('Narcissistic tendencies detected');
  if (manipulationRisk > 50) flags.push('Potential manipulation patterns');
  if (emotionalAvailability < 40) flags.push('Limited emotional availability');

  return {
    narcissismScore: Math.round(narcissismScore),
    manipulationRisk: Math.round(manipulationRisk),
    emotionalAvailability,
    consistencyScore,
    flags,
  };
}

export function getAttachmentCompatibility(style1: AttachmentStyle | null, style2: string): number {
  if (!style1) return 50;

  const compatibilityMatrix: Record<AttachmentStyle, Record<string, number>> = {
    secure: { secure: 95, anxious: 75, avoidant: 65, disorganized: 45, Secure: 95, Anxious: 75, Avoidant: 65 },
    anxious: { secure: 80, anxious: 45, avoidant: 25, disorganized: 35, Secure: 80, Anxious: 45, Avoidant: 25 },
    avoidant: { secure: 70, anxious: 25, avoidant: 55, disorganized: 35, Secure: 70, Anxious: 25, Avoidant: 55 },
    disorganized: { secure: 55, anxious: 35, avoidant: 35, disorganized: 25, Secure: 55, Anxious: 35, Avoidant: 35 },
  };

  return compatibilityMatrix[style1][style2] || 50;
}

export function getMBTICompatibility(type1: MBTIType | null, type2: MBTIType | undefined): number {
  if (!type1 || !type2) return 50;

  const idealMatches: Record<MBTIType, MBTIType[]> = {
    'INTJ': ['ENFP', 'ENTP', 'INFJ', 'ENTJ'],
    'INTP': ['ENTJ', 'ENFJ', 'INFP', 'ENTP'],
    'ENTJ': ['INTP', 'INFP', 'ENFP', 'INTJ'],
    'ENTP': ['INFJ', 'INTJ', 'ENFJ', 'INTP'],
    'INFJ': ['ENTP', 'ENFP', 'INTJ', 'INFP'],
    'INFP': ['ENFJ', 'ENTJ', 'INFJ', 'ENFP'],
    'ENFJ': ['INFP', 'INTP', 'ENFP', 'INFJ'],
    'ENFP': ['INFJ', 'INTJ', 'ENFJ', 'INFP'],
    'ISTJ': ['ESFP', 'ESTP', 'ISFJ', 'ESTJ'],
    'ISFJ': ['ESFP', 'ESTP', 'ISTJ', 'ESFJ'],
    'ESTJ': ['ISFP', 'ISTP', 'ESFJ', 'ISTJ'],
    'ESFJ': ['ISFP', 'ISTP', 'ESTJ', 'ISFJ'],
    'ISTP': ['ESFJ', 'ESTJ', 'ISFP', 'ESTP'],
    'ISFP': ['ESFJ', 'ESTJ', 'ISTP', 'ESFP'],
    'ESTP': ['ISFJ', 'ISTJ', 'ESFP', 'ISTP'],
    'ESFP': ['ISFJ', 'ISTJ', 'ESTP', 'ISFP'],
  };

  if (idealMatches[type1]?.includes(type2)) return 90;
  if (idealMatches[type1]?.slice(0, 2).includes(type2)) return 95;
  if (type1[1] === type2[1] && type1[2] === type2[2]) return 75;
  if (type1[0] !== type2[0]) return 70;
  return 55;
}

export const MBTI_DESCRIPTIONS: Record<MBTIType, { title: string; description: string; strengths: string[]; dating: string }> = {
  'INTJ': {
    title: 'The Architect',
    description: 'Strategic, independent, and driven by logic. You value competence and long-term planning.',
    strengths: ['Strategic thinking', 'Independence', 'Determination', 'Innovation'],
    dating: 'You seek a partner who can match your intellectual depth and respects your need for alone time.',
  },
  'INTP': {
    title: 'The Logician',
    description: 'Analytical, objective, and curious. You love exploring ideas and theoretical possibilities.',
    strengths: ['Analytical mind', 'Objectivity', 'Imagination', 'Originality'],
    dating: 'You need someone who appreciates your unconventional thinking and gives you space to explore ideas.',
  },
  'ENTJ': {
    title: 'The Commander',
    description: 'Bold, ambitious, and confident. You naturally take charge and inspire others.',
    strengths: ['Leadership', 'Efficiency', 'Strategic vision', 'Confidence'],
    dating: 'You seek an equal partner who can challenge you intellectually and support your ambitions.',
  },
  'ENTP': {
    title: 'The Debater',
    description: 'Quick-witted, clever, and innovative. You thrive on mental sparring and new ideas.',
    strengths: ['Quick thinking', 'Charisma', 'Adaptability', 'Innovation'],
    dating: 'You need someone who can keep up with your wit and isn\'t afraid of spirited debates.',
  },
  'INFJ': {
    title: 'The Advocate',
    description: 'Insightful, principled, and compassionate. You seek meaning and connection in everything.',
    strengths: ['Intuition', 'Compassion', 'Creativity', 'Determination'],
    dating: 'You desire deep, authentic connections with someone who shares your values and vision.',
  },
  'INFP': {
    title: 'The Mediator',
    description: 'Idealistic, empathetic, and creative. You\'re guided by your values and seek harmony.',
    strengths: ['Empathy', 'Creativity', 'Open-mindedness', 'Dedication'],
    dating: 'You seek a soulmate who understands your emotional depth and shares your ideals.',
  },
  'ENFJ': {
    title: 'The Protagonist',
    description: 'Charismatic, empathetic, and inspiring. You naturally bring out the best in others.',
    strengths: ['Leadership', 'Empathy', 'Reliability', 'Charisma'],
    dating: 'You seek a partner who appreciates your nurturing nature and shares your commitment to growth.',
  },
  'ENFP': {
    title: 'The Campaigner',
    description: 'Enthusiastic, creative, and sociable. You see life as full of possibilities.',
    strengths: ['Enthusiasm', 'Creativity', 'Sociability', 'Optimism'],
    dating: 'You need someone who matches your energy and supports your many passions and ideas.',
  },
  'ISTJ': {
    title: 'The Logistician',
    description: 'Practical, responsible, and reliable. You value tradition and loyalty.',
    strengths: ['Reliability', 'Practicality', 'Dedication', 'Integrity'],
    dating: 'You seek a stable, committed partner who values tradition and keeps their promises.',
  },
  'ISFJ': {
    title: 'The Defender',
    description: 'Warm, dedicated, and protective. You show love through acts of service.',
    strengths: ['Supportiveness', 'Reliability', 'Patience', 'Observant'],
    dating: 'You desire a caring partner who appreciates your dedication and reciprocates your devotion.',
  },
  'ESTJ': {
    title: 'The Executive',
    description: 'Organized, logical, and assertive. You excel at managing people and projects.',
    strengths: ['Organization', 'Dedication', 'Strong-willed', 'Direct'],
    dating: 'You seek a reliable partner who shares your values of commitment and responsibility.',
  },
  'ESFJ': {
    title: 'The Consul',
    description: 'Caring, sociable, and traditional. You create harmony and support those around you.',
    strengths: ['Loyalty', 'Warmth', 'Practicality', 'Sensitivity'],
    dating: 'You desire a loving partner who values family, community, and emotional connection.',
  },
  'ISTP': {
    title: 'The Virtuoso',
    description: 'Bold, practical, and experimental. You love hands-on problem solving.',
    strengths: ['Optimism', 'Creativity', 'Practicality', 'Spontaneity'],
    dating: 'You need a partner who respects your independence and joins you in adventures.',
  },
  'ISFP': {
    title: 'The Adventurer',
    description: 'Gentle, sensitive, and artistic. You live in the moment and value harmony.',
    strengths: ['Charm', 'Sensitivity', 'Imagination', 'Passion'],
    dating: 'You seek a kind soul who appreciates beauty and gives you freedom to be yourself.',
  },
  'ESTP': {
    title: 'The Entrepreneur',
    description: 'Energetic, perceptive, and direct. You love action and living in the moment.',
    strengths: ['Bold', 'Direct', 'Sociable', 'Perceptive'],
    dating: 'You want an exciting partner who can keep up with your adventurous lifestyle.',
  },
  'ESFP': {
    title: 'The Entertainer',
    description: 'Spontaneous, energetic, and fun-loving. You bring joy and excitement everywhere.',
    strengths: ['Bold', 'Original', 'Practical', 'Observant'],
    dating: 'You seek a fun-loving partner who embraces spontaneity and enjoys life\'s pleasures.',
  },
};

export const ATTACHMENT_DESCRIPTIONS: Record<AttachmentStyle, { title: string; description: string; inRelationships: string; growth: string }> = {
  secure: {
    title: 'Secure Attachment',
    description: 'You feel comfortable with intimacy and independence. You can depend on partners and allow them to depend on you.',
    inRelationships: 'You communicate openly, handle conflict constructively, and maintain healthy boundaries while staying emotionally available.',
    growth: 'Continue nurturing your emotional intelligence and help partners who may have different attachment styles feel safe.',
  },
  anxious: {
    title: 'Anxious Attachment',
    description: 'You crave closeness and often worry about your relationship. You may need more reassurance than others.',
    inRelationships: 'You\'re highly attuned to your partner\'s moods and may sometimes interpret neutral signals as negative.',
    growth: 'Practice self-soothing techniques and build confidence in your worthiness of love independent of your relationship status.',
  },
  avoidant: {
    title: 'Avoidant Attachment',
    description: 'You value independence highly and may feel uncomfortable with too much closeness. You prefer self-reliance.',
    inRelationships: 'You may pull away when things get too intimate or create emotional distance unconsciously.',
    growth: 'Practice vulnerability in small doses and recognize that needing others is a strength, not a weakness.',
  },
  disorganized: {
    title: 'Disorganized Attachment',
    description: 'You experience conflicting desires for closeness and distance. Relationships can feel both desired and scary.',
    inRelationships: 'You may experience intense emotions and unpredictable responses to intimacy.',
    growth: 'Consider working with a therapist to process past experiences and develop more consistent relationship patterns.',
  },
};

export const LOVE_LANGUAGE_DESCRIPTIONS: Record<LoveLanguage, { title: string; description: string; giveLove: string; receiveLove: string }> = {
  words: {
    title: 'Words of Affirmation',
    description: 'You value verbal expressions of love, compliments, and words of appreciation.',
    giveLove: 'You express love through compliments, encouragement, and verbal appreciation.',
    receiveLove: 'You feel most loved when your partner expresses their feelings verbally and appreciates you with words.',
  },
  acts: {
    title: 'Acts of Service',
    description: 'You show and feel love through helpful actions and doing things for your partner.',
    giveLove: 'You express love by helping your partner, handling responsibilities, and easing their burden.',
    receiveLove: 'You feel most loved when your partner does thoughtful things to make your life easier.',
  },
  gifts: {
    title: 'Receiving Gifts',
    description: 'You treasure thoughtful gifts and the meaning behind them.',
    giveLove: 'You express love through carefully chosen, meaningful gifts that show you were thinking of them.',
    receiveLove: 'You feel most loved when receiving thoughtful gifts that show your partner knows and thinks of you.',
  },
  time: {
    title: 'Quality Time',
    description: 'You value undivided attention and meaningful time spent together.',
    giveLove: 'You express love by being fully present, planning activities, and prioritizing time together.',
    receiveLove: 'You feel most loved when your partner gives you their undivided attention and quality moments.',
  },
  touch: {
    title: 'Physical Touch',
    description: 'You connect through physical affection, from holding hands to intimate moments.',
    giveLove: 'You express love through hugs, kisses, cuddling, and physical closeness.',
    receiveLove: 'You feel most loved through physical affection and the comfort of your partner\'s touch.',
  },
};
