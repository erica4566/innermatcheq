/**
 * Web Database Layer for InnerMatchEQ
 *
 * This module re-exports Supabase functions for web compatibility.
 * On web, SQLite is not available, so we use Supabase directly.
 */

// Re-export everything from Supabase for web
export {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  getUserProfile,
  updateUserProfile,
  getDiscoverProfiles,
  recordSwipe,
  getConnections,
  sendMessage,
  getMessages,
  subscribeToMessages,
  isSupabaseConfigured as isFirebaseConfigured,
  onAuthStateChange as subscribeToAuthState,
} from './supabase';

export type { SupabaseUser as AuthUser } from './supabase';

// Web-safe initialization - just returns true since Supabase doesn't need SQLite
export const initializeFirebase = async (): Promise<boolean> => {
  console.log('[DB Web] Using Supabase backend (no SQLite on web)');
  return true;
};

// Web-safe password reset using Supabase Auth
export const resetPassword = async (email: string): Promise<{ error: string | null }> => {
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
      // Don't reveal if email exists or not for security
      console.log('[Password Reset] Response status:', response.status);
    }

    // Always return success to prevent email enumeration attacks
    // Supabase will send email only if account exists
    return { error: null };
  } catch (error) {
    console.error('[Password Reset] Error:', error);
    // Return generic error, don't expose details
    return { error: 'Unable to process request. Please try again.' };
  }
};

// Web-safe onboarding completion
export const completeOnboarding = async (
  userId: string,
  profileData: Record<string, unknown>
): Promise<boolean> => {
  const { updateUserProfile } = await import('./supabase');
  return updateUserProfile(userId, profileData);
};

// Web-safe daily limits (using localStorage instead of AsyncStorage on web)
export const checkAndResetDailyLimits = async (
  userId: string
): Promise<{ dailyLikesRemaining: number; dailySuperLikesRemaining: number }> => {
  const defaults = { dailyLikesRemaining: 10, dailySuperLikesRemaining: 1 };

  try {
    const lastResetKey = `last_reset_${userId}`;
    const likesKey = `daily_likes_${userId}`;
    const superLikesKey = `daily_superlikes_${userId}`;

    const lastReset = localStorage.getItem(lastResetKey);
    const today = new Date().toDateString();

    if (lastReset !== today) {
      localStorage.setItem(lastResetKey, today);
      localStorage.setItem(likesKey, '10');
      localStorage.setItem(superLikesKey, '1');
      return defaults;
    }

    const likes = localStorage.getItem(likesKey);
    const superLikes = localStorage.getItem(superLikesKey);

    return {
      dailyLikesRemaining: likes ? parseInt(likes, 10) : 10,
      dailySuperLikesRemaining: superLikes ? parseInt(superLikes, 10) : 1,
    };
  } catch (error) {
    console.error('Error checking daily limits:', error);
    return defaults;
  }
};

export const decrementDailyLike = async (userId: string, isSuperLike: boolean): Promise<void> => {
  try {
    const key = isSuperLike ? `daily_superlikes_${userId}` : `daily_likes_${userId}`;
    const current = localStorage.getItem(key);
    const value = current ? parseInt(current, 10) : isSuperLike ? 1 : 10;
    localStorage.setItem(key, Math.max(0, value - 1).toString());
  } catch (error) {
    console.error('Error decrementing daily like:', error);
  }
};

// Stub for referrals (not critical for web)
export const getReferrals = async (): Promise<unknown[]> => [];
export const applyReferralCode = async (): Promise<{ success: boolean; error?: string }> => ({
  success: false,
  error: 'Referrals not available on web',
});

// Stub for video dates (not critical for web)
export const scheduleVideoDate = async (): Promise<null> => null;
export const getScheduledVideoDates = async (): Promise<unknown[]> => [];
export const updateVideoDateStatus = async (): Promise<boolean> => false;
