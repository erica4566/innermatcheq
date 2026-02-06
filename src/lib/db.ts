/**
 * Unified Database Service for InnerMatchEQ
 *
 * This module automatically chooses between Supabase (cloud) and SQLite (local).
 * When Supabase credentials are configured, it uses Supabase for real cloud sync.
 * Otherwise, it falls back to local SQLite for offline/development use.
 */

import * as Supabase from './supabase';
import * as SQLite from './database';
import { UserProfile, Match, Message, Referral, VideoDate } from './store';

// Check if Supabase is properly configured
const checkSupabaseConfig = (): boolean => {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  return !!(url && key && url.length > 10 && key.length > 10);
};

// Determine which backend to use - Supabase if configured, SQLite as fallback
export const useSupabase = checkSupabaseConfig();

// Log which backend is being used (only in dev)
if (__DEV__) {
  console.log(`[DB] Using ${useSupabase ? 'Supabase (Cloud)' : 'SQLite (Local fallback)'} backend`);
}

// ================== INITIALIZATION ==================

export const initializeDatabase = async (): Promise<boolean> => {
  if (useSupabase) {
    // Supabase doesn't need local initialization, just verify config
    return Supabase.isSupabaseConfigured();
  }
  return SQLite.initializeFirebase();
};

// ================== AUTH TYPES ==================

export interface AuthUser {
  uid: string;
  email: string;
}

// Convert Supabase user to unified format
const convertSupabaseUser = (user: Supabase.SupabaseUser | null): AuthUser | null => {
  if (!user) return null;
  return { uid: user.id, email: user.email };
};

// ================== AUTH FUNCTIONS ==================

export const signUp = async (
  email: string,
  password: string,
  name: string
): Promise<{ user: AuthUser | null; error: string | null }> => {
  if (useSupabase) {
    const result = await Supabase.signUp(email, password, name);
    return { user: convertSupabaseUser(result.user), error: result.error };
  }
  return SQLite.signUp(email, password, name);
};

export const signIn = async (
  email: string,
  password: string
): Promise<{ user: AuthUser | null; error: string | null }> => {
  if (useSupabase) {
    const result = await Supabase.signIn(email, password);
    return { user: convertSupabaseUser(result.user), error: result.error };
  }
  return SQLite.signIn(email, password);
};

export const signOut = async (): Promise<{ error: string | null }> => {
  if (useSupabase) {
    return Supabase.signOut();
  }
  return SQLite.signOut();
};

export const resetPassword = async (email: string): Promise<{ error: string | null }> => {
  if (useSupabase) {
    // Use Supabase password reset via email
    try {
      const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        return { error: 'Backend not configured. Please contact support.' };
      }

      const response = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (__DEV__) {
          console.log('[Password Reset] Response status:', response.status);
        }
      }

      // Always return success to prevent email enumeration attacks
      // Supabase will send email only if account exists
      return { error: null };
    } catch (error) {
      if (__DEV__) {
        console.error('[Password Reset] Error:', error);
      }
      return { error: 'Unable to process request. Please try again.' };
    }
  }
  return SQLite.resetPassword(email);
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  if (useSupabase) {
    const user = await Supabase.getCurrentUser();
    return convertSupabaseUser(user);
  }
  return SQLite.getCurrentUser();
};

export const subscribeToAuthState = (
  callback: (user: AuthUser | null) => void
): (() => void) => {
  if (useSupabase) {
    // Use Supabase real-time auth listener (no polling!)
    return Supabase.onAuthStateChange((user) => {
      callback(convertSupabaseUser(user));
    });
  }
  return SQLite.subscribeToAuthState(callback);
};

// ================== USER PROFILE FUNCTIONS ==================

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (useSupabase) {
    return Supabase.getUserProfile(userId);
  }
  return SQLite.getUserProfile(userId);
};

export const updateUserProfile = async (
  userId: string,
  data: Partial<UserProfile>
): Promise<boolean> => {
  if (useSupabase) {
    return Supabase.updateUserProfile(userId, data);
  }
  return SQLite.updateUserProfile(userId, data);
};

export const completeOnboarding = async (
  userId: string,
  profileData: Partial<UserProfile>
): Promise<boolean> => {
  if (useSupabase) {
    return Supabase.updateUserProfile(userId, profileData);
  }
  return SQLite.completeOnboarding(userId, profileData);
};

// ================== MATCHES & DISCOVERY FUNCTIONS ==================

export const getDiscoverProfiles = async (
  userId: string,
  currentUser: UserProfile
): Promise<Match[]> => {
  if (useSupabase) {
    return Supabase.getDiscoverProfiles(userId, currentUser);
  }
  return SQLite.getDiscoverProfiles(userId, currentUser);
};

export const recordSwipe = async (
  userId: string,
  targetUserId: string,
  action: 'like' | 'pass' | 'superlike'
): Promise<{ isMatch: boolean }> => {
  if (useSupabase) {
    return Supabase.recordSwipe(userId, targetUserId, action);
  }
  return SQLite.recordSwipe(userId, targetUserId, action);
};

// ================== CONNECTIONS FUNCTIONS ==================

export const getConnections = async (userId: string): Promise<Match[]> => {
  if (useSupabase) {
    return Supabase.getConnections(userId);
  }
  return SQLite.getConnections(userId);
};

// ================== MESSAGING FUNCTIONS ==================

export const sendMessage = async (
  userId: string,
  targetUserId: string,
  text: string
): Promise<Message | null> => {
  if (useSupabase) {
    return Supabase.sendMessage(userId, targetUserId, text);
  }
  return SQLite.sendMessage(userId, targetUserId, text);
};

export const getMessages = async (
  userId: string,
  targetUserId: string
): Promise<Message[]> => {
  if (useSupabase) {
    return Supabase.getMessages(userId, targetUserId);
  }
  return SQLite.getMessages(userId, targetUserId);
};

export const subscribeToMessages = (
  userId: string,
  targetUserId: string,
  callback: (messages: Message[]) => void
): (() => void) => {
  if (useSupabase) {
    return Supabase.subscribeToMessages(userId, targetUserId, callback);
  }
  return SQLite.subscribeToMessages(userId, targetUserId, callback);
};

// ================== REFERRAL FUNCTIONS ==================

export const getReferrals = async (userId: string): Promise<Referral[]> => {
  if (useSupabase) {
    // Supabase referrals not implemented yet, return empty
    return [];
  }
  return SQLite.getReferrals(userId);
};

export const applyReferralCode = async (
  userId: string,
  userName: string,
  referralCode: string
): Promise<{ success: boolean; error?: string }> => {
  if (useSupabase) {
    // Supabase referrals not implemented yet
    return { success: false, error: 'Referrals not available yet' };
  }
  return SQLite.applyReferralCode(userId, userName, referralCode);
};

// ================== VIDEO DATE FUNCTIONS ==================

export const scheduleVideoDate = async (
  userId: string,
  matchId: string,
  matchName: string,
  matchPhoto: string,
  scheduledAt: string,
  duration: number
): Promise<VideoDate | null> => {
  if (useSupabase) {
    // Supabase video dates not implemented yet
    return null;
  }
  return SQLite.scheduleVideoDate(userId, matchId, matchName, matchPhoto, scheduledAt, duration);
};

export const getScheduledVideoDates = async (userId: string): Promise<VideoDate[]> => {
  if (useSupabase) {
    // Supabase video dates not implemented yet
    return [];
  }
  return SQLite.getScheduledVideoDates(userId);
};

export const updateVideoDateStatus = async (
  userId: string,
  videoDateId: string,
  status: VideoDate['status']
): Promise<boolean> => {
  if (useSupabase) {
    // Supabase video dates not implemented yet
    return false;
  }
  return SQLite.updateVideoDateStatus(userId, videoDateId, status);
};

// ================== DAILY LIMITS ==================

export const checkAndResetDailyLimits = async (
  userId: string
): Promise<{ dailyLikesRemaining: number; dailySuperLikesRemaining: number }> => {
  // Daily limits are stored locally regardless of backend
  return SQLite.checkAndResetDailyLimits(userId);
};

export const decrementDailyLike = async (userId: string, isSuperLike: boolean): Promise<void> => {
  // Daily limits are stored locally regardless of backend
  return SQLite.decrementDailyLike(userId, isSuperLike);
};

// ================== UTILITY FUNCTIONS ==================

// Check which backend is configured
export const isSupabaseConfigured = (): boolean => useSupabase;
export const isFirebaseConfigured = SQLite.isFirebaseConfigured;

// Re-export for backward compatibility
export type { AuthUser as FirebaseAuthUser };
