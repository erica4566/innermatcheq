/**
 * Supabase API Client for InnerMatchEQ
 *
 * Platform-agnostic Supabase client that works on both web and mobile.
 * This is the foundation for all database operations across platforms.
 *
 * IMPORTANT: This module is designed to be the single source of truth
 * for all client-server communication. Both iOS/Android and Web apps
 * will use identical API contracts defined here.
 */

import type {
  AuthUser,
  AuthResponse,
  ApiResponse,
  UserProfile,
  Match,
  Message,
  SwipeResponse,
  Referral,
  VideoDate,
  QuizSubmission,
  QuizResult,
  SubscriptionStatus,
  EntitlementCheck,
  AttachmentStyle,
  MBTIType,
  LoveLanguage,
  BigFiveScores,
  RedFlagProfile,
} from './types';

// ================== CONFIGURATION ==================

// Environment variables - React Native uses process.env with EXPO_PUBLIC_ prefix
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// ================== SESSION MANAGEMENT ==================

interface Session {
  access_token: string;
  user: { id: string; email: string };
}

// Platform-agnostic storage interface
interface Storage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

// Default to localStorage for web, can be overridden for React Native
let storage: Storage = {
  getItem: async (key) => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: async (key, value) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  removeItem: async (key) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
};

// Allow setting custom storage (e.g., AsyncStorage for React Native)
export const setStorage = (customStorage: Storage): void => {
  storage = customStorage;
};

let currentSession: Session | null = null;

// Auth state change callbacks
type AuthStateCallback = (user: AuthUser | null) => void;
const authStateCallbacks = new Set<AuthStateCallback>();
let lastNotifiedUserId: string | null | undefined = undefined;

// ================== HELPER FUNCTIONS ==================

export const isSupabaseConfigured = (): boolean => {
  return !!(
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    SUPABASE_URL.length > 10 &&
    SUPABASE_ANON_KEY.length > 10
  );
};

async function supabaseRequest<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    body?: Record<string, unknown>;
    headers?: Record<string, string>;
    params?: Record<string, string>;
  } = {}
): Promise<ApiResponse<T>> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: 'Supabase not configured' };
  }

  const { method = 'GET', body, headers = {}, params } = options;

  let url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const requestHeaders: Record<string, string> = {
    'apikey': SUPABASE_ANON_KEY!,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
    ...headers,
  };

  if (currentSession?.access_token) {
    requestHeaders['Authorization'] = `Bearer ${currentSession.access_token}`;
  }

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { data: null, error: errorData.message || `HTTP ${response.status}` };
    }

    const data = await response.json().catch(() => null);
    return { data, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
}

async function supabaseAuth<T>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<ApiResponse<T>> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: 'Supabase not configured' };
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/${endpoint}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg =
        data.error_description ||
        data.msg ||
        data.error?.message ||
        data.message ||
        'Auth error';
      return { data: null, error: errorMsg };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
}

// ================== AUTH STATE MANAGEMENT ==================

const notifyAuthStateChange = (user: AuthUser | null, forceNotify = false): void => {
  const newUserId = user?.id ?? null;
  if (!forceNotify && newUserId === lastNotifiedUserId) return;

  lastNotifiedUserId = newUserId;
  console.log('[API] Auth state changed:', user ? user.id : 'signed out');

  authStateCallbacks.forEach((callback) => {
    try {
      callback(user);
    } catch (e) {
      console.error('[API] Auth callback error:', e);
    }
  });
};

const triggerAuthStateChange = async (): Promise<void> => {
  const user = await getCurrentUser();
  notifyAuthStateChange(user);
};

// ================== AUTH FUNCTIONS ==================

export const signUp = async (
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> => {
  console.log('[API] signUp called for:', email);

  const { data, error } = await supabaseAuth<{
    user: { id: string; email: string };
    access_token?: string;
    session?: { access_token: string };
  }>('signup', { email, password });

  if (error) {
    return { user: null, error };
  }

  if (!data?.user) {
    return { user: null, error: 'Sign up failed' };
  }

  const accessToken = data.access_token || data.session?.access_token;

  if (!accessToken) {
    // Try sign in fallback
    const signInResult = await signIn(email, password);
    if (signInResult.user) {
      // Create profile
      const profileData: Partial<UserProfile> = {
        id: signInResult.user.id,
        name,
        age: 0,
        bio: '',
        photos: [],
        attachmentStyle: null,
        mbtiType: null,
        loveLanguages: [],
        emotionalIntelligence: 0,
        values: [],
        interests: [],
        isVerified: false,
        verificationLevel: 'none',
        isPremium: false,
        premiumTier: 'free',
        hasVideoIntro: false,
      };

      await supabaseRequest('profiles', {
        method: 'POST',
        body: { id: signInResult.user.id, email: email.toLowerCase(), data: profileData },
      });

      return signInResult;
    }
    return { user: null, error: 'Account created. Please check your email to confirm.' };
  }

  // Store session
  currentSession = { access_token: accessToken, user: data.user };
  await storage.setItem('supabase_session', JSON.stringify(currentSession));

  // Create user profile
  const profileData: Partial<UserProfile> = {
    id: data.user.id,
    name,
    age: 0,
    bio: '',
    photos: [],
    attachmentStyle: null,
    mbtiType: null,
    loveLanguages: [],
    emotionalIntelligence: 0,
    values: [],
    interests: [],
    isVerified: false,
    verificationLevel: 'none',
    isPremium: false,
    premiumTier: 'free',
    hasVideoIntro: false,
  };

  await supabaseRequest('profiles', {
    method: 'POST',
    body: { id: data.user.id, email: email.toLowerCase(), data: profileData },
  });

  triggerAuthStateChange();

  return { user: { id: data.user.id, email: data.user.email }, error: null };
};

export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  console.log('[API] signIn called for:', email);

  const { data, error } = await supabaseAuth<{
    user: { id: string; email: string };
    access_token: string;
  }>('token?grant_type=password', { email, password });

  if (error || !data?.user) {
    return { user: null, error: error || 'Sign in failed' };
  }

  currentSession = { access_token: data.access_token, user: data.user };
  await storage.setItem('supabase_session', JSON.stringify(currentSession));

  triggerAuthStateChange();

  return { user: { id: data.user.id, email: data.user.email }, error: null };
};

export const signOut = async (): Promise<{ error: string | null }> => {
  console.log('[API] signOut called');

  currentSession = null;
  lastNotifiedUserId = undefined;

  await storage.removeItem('supabase_session');

  notifyAuthStateChange(null, true);

  return { error: null };
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  if (currentSession) {
    return { id: currentSession.user.id, email: currentSession.user.email };
  }

  try {
    const stored = await storage.getItem('supabase_session');
    if (stored) {
      currentSession = JSON.parse(stored);
      return currentSession
        ? { id: currentSession.user.id, email: currentSession.user.email }
        : null;
    }
  } catch (e) {
    console.log('[API] Error reading session:', e);
  }
  return null;
};

export const onAuthStateChange = (callback: AuthStateCallback): (() => void) => {
  authStateCallbacks.add(callback);

  Promise.resolve().then(async () => {
    const user = await getCurrentUser();
    callback(user);
  });

  return () => {
    authStateCallbacks.delete(callback);
  };
};

// ================== PROFILE FUNCTIONS ==================

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabaseRequest<Array<{ data: UserProfile }>>('profiles', {
    params: { id: `eq.${userId}`, select: 'data' },
  });

  if (error || !data?.[0]) return null;
  return data[0].data;
};

export const updateUserProfile = async (
  userId: string,
  profileData: Partial<UserProfile>
): Promise<boolean> => {
  const existing = await getUserProfile(userId);
  if (!existing) {
    const { error } = await supabaseRequest('profiles', {
      method: 'POST',
      body: { id: userId, data: profileData },
    });
    return !error;
  }

  const updated = { ...existing, ...profileData };
  const { error } = await supabaseRequest('profiles', {
    method: 'PATCH',
    params: { id: `eq.${userId}` },
    body: { data: updated, updated_at: new Date().toISOString() },
  });

  return !error;
};

// ================== DISCOVERY FUNCTIONS ==================

export const getDiscoverProfiles = async (
  userId: string,
  currentUser: UserProfile
): Promise<Match[]> => {
  // Get swiped profiles
  const { data: swipes } = await supabaseRequest<Array<{ target_user_id: string }>>('swipes', {
    params: { user_id: `eq.${userId}`, select: 'target_user_id' },
  });

  const swipedIds = new Set(swipes?.map((s) => s.target_user_id) || []);
  swipedIds.add(userId);

  // Get all profiles
  const { data: profiles } = await supabaseRequest<Array<{ id: string; data: UserProfile }>>(
    'profiles',
    {
      params: { select: 'id,data' },
    }
  );

  if (!profiles) return [];

  const matches: Match[] = [];

  for (const profile of profiles) {
    if (swipedIds.has(profile.id)) continue;

    const userData = profile.data;
    if (!userData.name || userData.age === 0) continue;

    // Filter based on seeking preference
    const userGender = userData.gender;
    const currentUserLookingFor = currentUser.lookingFor;

    if (currentUserLookingFor && currentUserLookingFor !== 'everyone' && userGender) {
      const seekingGender = currentUserLookingFor === 'men' ? 'man' : 'woman';
      if (userGender !== seekingGender) continue;
    }

    const compatibilityScore = calculateCompatibility(currentUser, userData);

    matches.push({
      id: profile.id,
      name: userData.name,
      age: userData.age,
      photo: userData.photos?.[0] || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      photos: userData.photos,
      bio: userData.bio,
      occupation: userData.occupation,
      location: userData.location,
      gender: userData.gender,
      compatibilityScore,
      compatibilityBreakdown: calculateCompatibilityBreakdown(currentUser, userData),
      attachmentStyle: userData.attachmentStyle || 'secure',
      mbtiType: userData.mbtiType ?? undefined,
      loveLanguages: userData.loveLanguages,
      sharedValues: getSharedValues(currentUser.values || [], userData.values || []),
      sharedInterests: getSharedValues(currentUser.interests || [], userData.interests || []),
      isVerified: userData.isVerified,
      verificationLevel: userData.verificationLevel,
      hasVideoIntro: userData.hasVideoIntro,
    });
  }

  return matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
};

export const recordSwipe = async (
  userId: string,
  targetUserId: string,
  action: 'like' | 'pass' | 'superlike'
): Promise<SwipeResponse> => {
  await supabaseRequest('swipes', {
    method: 'POST',
    body: {
      user_id: userId,
      target_user_id: targetUserId,
      action,
      created_at: new Date().toISOString(),
    },
  });

  if (action === 'like' || action === 'superlike') {
    const { data } = await supabaseRequest<Array<{ action: string }>>('swipes', {
      params: {
        user_id: `eq.${targetUserId}`,
        target_user_id: `eq.${userId}`,
        select: 'action',
      },
    });

    if (data?.[0] && (data[0].action === 'like' || data[0].action === 'superlike')) {
      const connectionId = [userId, targetUserId].sort().join('_');
      await supabaseRequest('connections', {
        method: 'POST',
        body: {
          id: connectionId,
          user1_id: userId,
          user2_id: targetUserId,
          created_at: new Date().toISOString(),
        },
      });
      return { isMatch: true };
    }
  }

  return { isMatch: false };
};

// ================== CONNECTIONS FUNCTIONS ==================

export const getConnections = async (userId: string): Promise<Match[]> => {
  const { data: connections } = await supabaseRequest<
    Array<{
      id: string;
      user1_id: string;
      user2_id: string;
      last_message: string | null;
      last_message_at: string | null;
      created_at: string;
    }>
  >('connections', {
    params: { or: `(user1_id.eq.${userId},user2_id.eq.${userId})` },
  });

  if (!connections) return [];

  const matches: Match[] = [];

  for (const conn of connections) {
    const connectedUserId = conn.user1_id === userId ? conn.user2_id : conn.user1_id;
    const profile = await getUserProfile(connectedUserId);

    if (profile) {
      matches.push({
        id: connectedUserId,
        name: profile.name,
        age: profile.age,
        photo: profile.photos?.[0] || '',
        photos: profile.photos,
        bio: profile.bio,
        compatibilityScore: 0,
        attachmentStyle: profile.attachmentStyle || 'secure',
        mbtiType: profile.mbtiType ?? undefined,
        loveLanguages: profile.loveLanguages,
        sharedValues: profile.values || [],
        isNew: Date.now() - new Date(conn.created_at).getTime() < 24 * 60 * 60 * 1000,
        lastMessage: conn.last_message ?? undefined,
        lastMessageTime: conn.last_message_at
          ? formatTimestamp(new Date(conn.last_message_at).getTime())
          : undefined,
      });
    }
  }

  return matches;
};

// ================== MESSAGING FUNCTIONS ==================

export const sendMessage = async (
  userId: string,
  targetUserId: string,
  text: string
): Promise<Message | null> => {
  const sanitizedText = sanitizeMessage(text);
  if (!sanitizedText) return null;

  const connectionId = [userId, targetUserId].sort().join('_');
  const now = new Date().toISOString();

  const { data, error } = await supabaseRequest<Array<{ id: string }>>('messages', {
    method: 'POST',
    body: {
      connection_id: connectionId,
      sender_id: userId,
      text: sanitizedText,
      created_at: now,
    },
  });

  if (error || !data?.[0]) return null;

  await supabaseRequest('connections', {
    method: 'PATCH',
    params: { id: `eq.${connectionId}` },
    body: { last_message: sanitizedText, last_message_at: now },
  });

  return {
    id: data[0].id,
    text: sanitizedText,
    sender: 'me',
    timestamp: now,
  };
};

export const getMessages = async (userId: string, targetUserId: string): Promise<Message[]> => {
  const connectionId = [userId, targetUserId].sort().join('_');

  const { data } = await supabaseRequest<
    Array<{
      id: string;
      sender_id: string;
      text: string;
      created_at: string;
    }>
  >('messages', {
    params: {
      connection_id: `eq.${connectionId}`,
      order: 'created_at.asc',
    },
  });

  if (!data) return [];

  return data.map((msg) => ({
    id: msg.id,
    text: msg.text,
    sender: msg.sender_id === userId ? 'me' : 'them',
    timestamp: msg.created_at,
  }));
};

export const subscribeToMessages = (
  userId: string,
  targetUserId: string,
  callback: (messages: Message[]) => void
): (() => void) => {
  let active = true;

  const poll = async () => {
    if (!active) return;
    const messages = await getMessages(userId, targetUserId);
    if (active) callback(messages);
  };

  poll();
  const interval = setInterval(poll, 2000);

  return () => {
    active = false;
    clearInterval(interval);
  };
};

// ================== QUIZ & ASSESSMENT API ==================

export const submitQuiz = async (submission: QuizSubmission): Promise<QuizResult | null> => {
  const { userId, quizType, answers } = submission;

  let result: QuizResult['result'];
  let scores: Record<string, number> | undefined;

  switch (quizType) {
    case 'attachment':
      result = calculateAttachmentStyle(answers as Record<string, string>);
      await updateUserProfile(userId, { attachmentStyle: result as AttachmentStyle });
      break;

    case 'mbti':
      const mbtiResult = calculateMBTI(answers as Record<string, string>);
      result = mbtiResult.type;
      scores = mbtiResult.scores as Record<string, number>;
      await updateUserProfile(userId, {
        mbtiType: mbtiResult.type,
        mbtiScores: mbtiResult.scores,
      });
      break;

    case 'loveLanguage':
      result = calculateLoveLanguages(answers as Record<string, number>);
      await updateUserProfile(userId, { loveLanguages: result as LoveLanguage[] });
      break;

    case 'bigFive':
      result = calculateBigFive(answers as Record<string, number>);
      await updateUserProfile(userId, { bigFiveScores: result });
      break;

    case 'redFlag':
      result = analyzeRedFlags(answers as Record<string, number>);
      break;

    default:
      return null;
  }

  return {
    quizType,
    result,
    scores,
    completedAt: new Date().toISOString(),
  };
};

export const getQuizResults = async (userId: string): Promise<UserProfile | null> => {
  return getUserProfile(userId);
};

// ================== ENTITLEMENT & SUBSCRIPTION API ==================

export const checkEntitlement = async (
  userId: string,
  entitlementId: string
): Promise<EntitlementCheck> => {
  const profile = await getUserProfile(userId);

  if (!profile) {
    return { userId, entitlementId, hasAccess: false };
  }

  // Check premium tier access
  const premiumEntitlements: Record<string, string[]> = {
    free: [],
    plus: ['unlimited_swipes', 'see_who_likes'],
    premium: ['unlimited_swipes', 'see_who_likes', 'advanced_filters', 'read_receipts'],
    elite: [
      'unlimited_swipes',
      'see_who_likes',
      'advanced_filters',
      'read_receipts',
      'priority_matches',
      'unlimited_superlikes',
    ],
  };

  const hasAccess =
    premiumEntitlements[profile.premiumTier]?.includes(entitlementId) ||
    (profile.purchasedReports as Record<string, boolean>)?.[entitlementId] === true;

  return { userId, entitlementId, hasAccess };
};

export const getSubscriptionStatus = async (userId: string): Promise<SubscriptionStatus | null> => {
  const profile = await getUserProfile(userId);

  if (!profile) return null;

  return {
    tier: profile.premiumTier,
    isActive: profile.isPremium,
    purchasedReports: profile.purchasedReports || {},
  };
};

// ================== CALCULATION HELPERS ==================

const calculateCompatibility = (user1: UserProfile, user2: UserProfile): number => {
  let score = 70;

  if (user1.attachmentStyle && user2.attachmentStyle) {
    const matrix: Record<string, Record<string, number>> = {
      secure: { secure: 15, anxious: 10, avoidant: 5, disorganized: 0 },
      anxious: { secure: 12, anxious: 5, avoidant: -5, disorganized: 0 },
      avoidant: { secure: 10, anxious: -5, avoidant: 5, disorganized: 0 },
      disorganized: { secure: 8, anxious: 0, avoidant: 0, disorganized: -5 },
    };
    score += matrix[user1.attachmentStyle]?.[user2.attachmentStyle] || 0;
  }

  const sharedValues = getSharedValues(user1.values || [], user2.values || []);
  score += Math.min(sharedValues.length * 2, 10);

  if (user1.loveLanguages?.length && user2.loveLanguages?.length) {
    const shared = user1.loveLanguages.filter((l) => user2.loveLanguages?.includes(l));
    score += shared.length * 3;
  }

  return Math.min(Math.max(score, 0), 100);
};

const calculateCompatibilityBreakdown = (
  user1: UserProfile,
  user2: UserProfile
): Match['compatibilityBreakdown'] => {
  return {
    attachment: calculateAttachmentScore(user1.attachmentStyle, user2.attachmentStyle),
    mbti: calculateMBTIScore(user1.mbtiType, user2.mbtiType),
    loveLanguage: calculateLoveLanguageScore(user1.loveLanguages, user2.loveLanguages),
    values: calculateValuesScore(user1.values, user2.values),
    lifestyle: calculateLifestyleScore(user1, user2),
  };
};

const calculateAttachmentScore = (s1?: string | null, s2?: string | null): number => {
  if (!s1 || !s2) return 70;
  const matrix: Record<string, Record<string, number>> = {
    secure: { secure: 95, anxious: 80, avoidant: 70, disorganized: 60 },
    anxious: { secure: 85, anxious: 60, avoidant: 40, disorganized: 50 },
    avoidant: { secure: 75, anxious: 40, avoidant: 65, disorganized: 50 },
    disorganized: { secure: 65, anxious: 50, avoidant: 50, disorganized: 45 },
  };
  return matrix[s1]?.[s2] || 70;
};

const calculateMBTIScore = (t1?: string | null, t2?: string | null): number => {
  if (!t1 || !t2) return 70;
  let score = 70;
  if (t1 === t2) score += 10;
  if (t1[1] !== t2[1]) score += 5;
  if (t1[2] !== t2[2]) score += 5;
  return Math.min(score, 95);
};

const calculateLoveLanguageScore = (l1?: string[], l2?: string[]): number => {
  if (!l1?.length || !l2?.length) return 70;
  const shared = l1.filter((l) => l2.includes(l)).length;
  return 60 + shared * 17;
};

const calculateValuesScore = (v1?: string[], v2?: string[]): number => {
  if (!v1?.length || !v2?.length) return 70;
  const shared = v1.filter((v) => v2.includes(v)).length;
  const total = Math.max(v1.length, v2.length);
  return Math.round(60 + (shared / total) * 35);
};

const calculateLifestyleScore = (u1: UserProfile, u2: UserProfile): number => {
  let score = 70;
  if (u1.smoking === u2.smoking) score += 10;
  if (u1.drinking === u2.drinking) score += 10;
  if (u1.exercise === u2.exercise) score += 10;
  return Math.min(score, 95);
};

const getSharedValues = (arr1: string[], arr2: string[]): string[] => {
  return arr1.filter((item) => arr2.includes(item));
};

// ================== QUIZ CALCULATION HELPERS ==================

const calculateMBTI = (
  answers: Record<string, string>
): { type: MBTIType; scores: { E: number; I: number; S: number; N: number; T: number; F: number; J: number; P: number } } => {
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
};

const calculateAttachmentStyle = (answers: Record<string, string>): AttachmentStyle => {
  const counts: Record<string, number> = {};
  Object.values(answers).forEach((style) => {
    counts[style] = (counts[style] || 0) + 1;
  });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return (sorted[0]?.[0] || 'secure') as AttachmentStyle;
};

const calculateLoveLanguages = (answers: Record<string, number>): LoveLanguage[] => {
  const sorted = Object.entries(answers)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([lang]) => lang as LoveLanguage);
  return sorted;
};

const calculateBigFive = (answers: Record<string, number>): BigFiveScores => {
  // Calculate Big Five scores from answers
  const scores: BigFiveScores = {
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    neuroticism: 0,
  };

  // Simple averaging based on question categories
  const categories = Object.keys(scores) as Array<keyof BigFiveScores>;
  categories.forEach((category) => {
    const categoryAnswers = Object.entries(answers)
      .filter(([key]) => key.startsWith(category))
      .map(([, value]) => value);

    if (categoryAnswers.length > 0) {
      scores[category] = Math.round(
        (categoryAnswers.reduce((a, b) => a + b, 0) / categoryAnswers.length) * 20
      );
    } else {
      scores[category] = 50; // Default middle score
    }
  });

  return scores;
};

const analyzeRedFlags = (answers: Record<string, number>): RedFlagProfile => {
  let narcissismScore = 0;
  let manipulationRisk = 0;
  const emotionalAvailability = 80;
  const consistencyScore = 85;
  const flags: string[] = [];

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
};

// ================== UTILITY HELPERS ==================

const formatTimestamp = (timestamp: number): string => {
  const diffMs = Date.now() - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(timestamp).toLocaleDateString();
};

const sanitizeMessage = (text: string): string => {
  return text
    .trim()
    .slice(0, 5000)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

// ================== EXPORT API OBJECT ==================

export const api = {
  // Auth
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  onAuthStateChange,
  isSupabaseConfigured,

  // Profile
  getUserProfile,
  updateUserProfile,

  // Discovery
  getDiscoverProfiles,
  recordSwipe,

  // Connections
  getConnections,

  // Messages
  sendMessage,
  getMessages,
  subscribeToMessages,

  // Quiz
  submitQuiz,
  getQuizResults,

  // Entitlements
  checkEntitlement,
  getSubscriptionStatus,

  // Storage
  setStorage,
};

export default api;
