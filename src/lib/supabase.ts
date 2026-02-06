/**
 * Supabase Client for InnerMatchEQ
 *
 * This module provides the Supabase client for cloud database operations.
 * Works via REST API - no native code required.
 *
 * Setup:
 * 1. Create project at supabase.com
 * 2. Run the SQL schema (see SUPABASE_SCHEMA.sql)
 * 3. Add to ENV tab in Vibecode:
 *    - EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
 *    - EXPO_PUBLIC_SUPABASE_ANON_KEY=xxx
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, Match, Message, Referral, VideoDate } from './store';
import { sanitizeMessage, sanitizeBio, sanitizeName, sanitizeEmail, sanitizeStringArray } from './sanitize';
import {
  secureSet,
  secureGet,
  secureRemove,
  SECURE_KEYS,
  getAuthLockoutState,
  recordFailedAuthAttempt,
  clearAuthLockout,
  isAccountLocked,
  getLockoutRemainingTime,
} from './secureStorage';

// Supabase configuration
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return !!(
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    SUPABASE_URL !== '' &&
    SUPABASE_ANON_KEY !== ''
  );
};

// Session storage
let currentSession: { access_token: string; user: { id: string; email: string } } | null = null;

// Helper for Supabase REST API calls
async function supabaseRequest<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    body?: Record<string, unknown>;
    headers?: Record<string, string>;
    params?: Record<string, string>;
  } = {}
): Promise<{ data: T | null; error: string | null }> {
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

  // Add auth header if we have a session
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

// Supabase Auth API calls
async function supabaseAuth<T>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<{ data: T | null; error: string | null }> {
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
      // Handle various Supabase error formats
      const errorMsg = data.error_description || data.msg || data.error?.message || data.message || 'Auth error';
      if (__DEV__) {
        console.log('[Supabase Auth Error]', errorMsg);
      }
      return { data: null, error: errorMsg };
    }

    return { data, error: null };
  } catch (error) {
    if (__DEV__) {
      console.log('[Supabase Auth Exception]', error);
    }
    return { data: null, error: (error as Error).message };
  }
}

// ================== AUTH FUNCTIONS ==================

export interface SupabaseUser {
  id: string;
  email: string;
}

export const signUp = async (
  email: string,
  password: string,
  name: string
): Promise<{ user: SupabaseUser | null; error: string | null }> => {
  if (__DEV__) {
    console.log('[Supabase] signUp called');
  }
  const { data, error } = await supabaseAuth<{
    user: { id: string; email: string };
    access_token?: string;
    session?: { access_token: string };
  }>('signup', { email, password });

  if (__DEV__) {
    console.log('[Supabase SignUp Response]', { hasData: !!data, hasError: !!error });
  }

  if (error) {
    if (__DEV__) {
      console.log('[Supabase] signUp error');
    }
    return { user: null, error };
  }

  // Supabase may return user without session if email confirmation is enabled
  if (!data?.user) {
    if (__DEV__) {
      console.log('[Supabase] signUp failed - no user in response');
    }
    return { user: null, error: 'Sign up failed' };
  }

  // Get access token from either location
  const accessToken = data.access_token || data.session?.access_token;

  // If no access token, email confirmation might be required
  if (!accessToken) {
    if (__DEV__) {
      console.log('[Supabase] signUp - no access token, trying signIn fallback...');
    }
    // User created but needs email confirmation - try to sign in directly
    // This works if email confirmation is disabled in Supabase settings
    const signInResult = await signIn(email, password);
    if (signInResult.user) {
      if (__DEV__) {
        console.log('[Supabase] signUp - signIn fallback succeeded');
      }
      // Create profile after successful sign in
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
    if (__DEV__) {
      console.log('[Supabase] signUp - signIn fallback failed');
    }
    return { user: null, error: 'Account created. Please check your email to confirm, then sign in.' };
  }

  if (__DEV__) {
    console.log('[Supabase] signUp - has access token, storing session securely');
  }
  // Store session in SecureStore instead of AsyncStorage
  currentSession = { access_token: accessToken, user: data.user };
  await secureSet(SECURE_KEYS.SUPABASE_SESSION, JSON.stringify(currentSession));

  // Create user profile in database
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

  // Trigger auth state change notification
  triggerAuthStateChange();

  return { user: { id: data.user.id, email: data.user.email }, error: null };
};

export const signIn = async (
  email: string,
  password: string
): Promise<{ user: SupabaseUser | null; error: string | null }> => {
  // Check for lockout BEFORE attempting sign in
  const lockoutState = await getAuthLockoutState();
  if (isAccountLocked(lockoutState)) {
    const remainingMs = getLockoutRemainingTime(lockoutState);
    const remainingMins = Math.ceil(remainingMs / 60000);
    return {
      user: null,
      error: `Account temporarily locked. Try again in ${remainingMins} minute${remainingMins !== 1 ? 's' : ''}.`,
    };
  }

  if (__DEV__) {
    console.log('[Supabase] signIn called');
  }
  const { data, error } = await supabaseAuth<{
    user: { id: string; email: string };
    access_token: string;
  }>('token?grant_type=password', { email, password });

  if (error || !data?.user) {
    // Record failed attempt
    const newState = await recordFailedAuthAttempt();
    const attemptsLeft = 5 - newState.failedAttempts;

    if (__DEV__) {
      console.log('[Supabase] signIn failed, attempts left:', attemptsLeft);
    }

    let errorMsg = error || 'Sign in failed';
    if (attemptsLeft > 0 && attemptsLeft <= 3) {
      errorMsg += ` (${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining)`;
    } else if (isAccountLocked(newState)) {
      errorMsg = 'Too many failed attempts. Account locked for 15 minutes.';
    }

    return { user: null, error: errorMsg };
  }

  // Clear lockout on successful login
  await clearAuthLockout();

  if (__DEV__) {
    console.log('[Supabase] signIn succeeded, storing session securely');
  }
  // Store session in SecureStore instead of AsyncStorage
  currentSession = { access_token: data.access_token, user: data.user };
  await secureSet(SECURE_KEYS.SUPABASE_SESSION, JSON.stringify(currentSession));

  // Trigger auth state change notification
  triggerAuthStateChange();

  return { user: { id: data.user.id, email: data.user.email }, error: null };
};

export const signOut = async (): Promise<{ error: string | null }> => {
  if (__DEV__) {
    console.log('[Supabase] signOut called');
  }

  // CRITICAL: Clear module-level session FIRST to prevent any reads during logout
  currentSession = null;

  // Also reset the lastNotifiedUserId to ensure fresh state detection
  lastNotifiedUserId = undefined;

  // Clear SecureStore session - await to ensure it completes before continuing
  try {
    await secureRemove(SECURE_KEYS.SUPABASE_SESSION);

    // Also clear any other auth-related storage that might persist
    await AsyncStorage.multiRemove([
      'currentUser',
      'isOnboarded',
      'app-storage',
      'remembered_email'
    ]);
  } catch (e) {
    if (__DEV__) {
      console.error('[Supabase] Error clearing storage:', e);
    }
  }

  // Force notify auth state change with null user
  // This ensures callbacks are triggered even if lastNotifiedUserId was already null
  notifyAuthStateChange(null, true);

  if (__DEV__) {
    console.log('[Supabase] signOut complete - all auth data cleared');
  }
  return { error: null };
};

export const getCurrentUser = async (): Promise<SupabaseUser | null> => {
  // First check module-level session (most recent)
  if (currentSession) {
    if (__DEV__) {
      console.log('[Supabase] getCurrentUser: returning from module cache');
    }
    return { id: currentSession.user.id, email: currentSession.user.email };
  }

  // Then check SecureStore for persisted session
  try {
    const stored = await secureGet(SECURE_KEYS.SUPABASE_SESSION);
    if (stored) {
      if (__DEV__) {
        console.log('[Supabase] getCurrentUser: found stored session, restoring...');
      }
      currentSession = JSON.parse(stored);
      return currentSession ? { id: currentSession.user.id, email: currentSession.user.email } : null;
    }
    if (__DEV__) {
      console.log('[Supabase] getCurrentUser: no session found');
    }
  } catch (e) {
    if (__DEV__) {
      console.log('[Supabase] getCurrentUser: error reading session', e);
    }
  }
  return null;
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
  if (__DEV__) {
    console.log('[Supabase] updateUserProfile called');
  }
  const existing = await getUserProfile(userId);
  if (!existing) {
    if (__DEV__) {
      console.log('[Supabase] No existing profile, creating new one...');
    }
    // If no profile exists, create one
    const { error: createError } = await supabaseRequest('profiles', {
      method: 'POST',
      body: { id: userId, data: profileData },
    });
    if (createError) {
      if (__DEV__) {
        console.error('[Supabase] Failed to create profile:', createError);
      }
      return false;
    }
    if (__DEV__) {
      console.log('[Supabase] Profile created successfully');
    }
    return true;
  }

  const updated = { ...existing, ...profileData };

  const { error } = await supabaseRequest('profiles', {
    method: 'PATCH',
    params: { id: `eq.${userId}` },
    body: { data: updated, updated_at: new Date().toISOString() },
  });

  if (error) {
    if (__DEV__) {
      console.error('[Supabase] Update failed:', error);
    }
    return false;
  }
  if (__DEV__) {
    console.log('[Supabase] Profile updated successfully');
  }
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
  const { data: profiles } = await supabaseRequest<Array<{ id: string; data: UserProfile }>>('profiles', {
    params: { select: 'id,data' },
  });

  if (!profiles) return [];

  const matches: Match[] = [];

  for (const profile of profiles) {
    if (swipedIds.has(profile.id)) continue;

    const userData = profile.data;
    if (!userData.name || userData.age === 0) continue;

    // Filter based on seeking preference (gender filtering)
    const userGender = userData.gender;
    const currentUserLookingFor = currentUser.lookingFor;

    // Skip if we have a seeking preference and this user doesn't match
    if (currentUserLookingFor && currentUserLookingFor !== 'everyone' && userGender) {
      // Convert preference to expected gender
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
): Promise<{ isMatch: boolean }> => {
  // Record swipe
  await supabaseRequest('swipes', {
    method: 'POST',
    body: {
      user_id: userId,
      target_user_id: targetUserId,
      action,
      created_at: new Date().toISOString(),
    },
  });

  // Check for mutual like
  if (action === 'like' || action === 'superlike') {
    const { data } = await supabaseRequest<Array<{ action: string }>>('swipes', {
      params: {
        user_id: `eq.${targetUserId}`,
        target_user_id: `eq.${userId}`,
        select: 'action',
      },
    });

    if (data?.[0] && (data[0].action === 'like' || data[0].action === 'superlike')) {
      // Create connection
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
  // Sanitize message content
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

  // Update connection last message
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

// ================== HELPER FUNCTIONS ==================

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

// ================== AUTH STATE LISTENER ==================

// Callbacks registered for auth state changes
type AuthStateCallback = (user: SupabaseUser | null) => void;
const authStateCallbacks: Set<AuthStateCallback> = new Set();
// Use a sentinel value to track "never notified" state vs "notified with null"
let lastNotifiedUserId: string | null | undefined = undefined;

// Notify all registered callbacks of auth state change
const notifyAuthStateChange = (user: SupabaseUser | null, forceNotify = false) => {
  // Only notify if user actually changed (or force notify on sign out)
  const newUserId = user?.id ?? null;
  if (!forceNotify && newUserId === lastNotifiedUserId) return;

  lastNotifiedUserId = newUserId;
  if (__DEV__) {
    console.log('[Supabase] Auth state changed:', user ? 'signed in' : 'signed out');
  }

  authStateCallbacks.forEach(callback => {
    try {
      callback(user);
    } catch (e) {
      if (__DEV__) {
        console.error('[Supabase] Auth callback error:', e);
      }
    }
  });
};

// Subscribe to auth state changes - returns unsubscribe function
export const onAuthStateChange = (callback: AuthStateCallback): (() => void) => {
  authStateCallbacks.add(callback);

  // Immediately call with current state
  if (__DEV__) {
    console.log('[Supabase] onAuthStateChange: new subscription, checking current user...');
  }

  // Use a microtask to allow any pending signOut to complete first
  Promise.resolve().then(async () => {
    // Double-check the module-level session before reading from storage
    // If currentSession is explicitly null (from signOut), don't try to restore from storage
    const user = await getCurrentUser();
    if (__DEV__) {
      console.log('[Supabase] onAuthStateChange: initial user check result:', user ? 'found' : 'null');
    }
    callback(user);
  });

  return () => {
    authStateCallbacks.delete(callback);
  };
};

// Call this after sign in/sign up/sign out to notify listeners immediately
const triggerAuthStateChange = async () => {
  const user = await getCurrentUser();
  notifyAuthStateChange(user);
};
