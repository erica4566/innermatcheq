/**
 * InnerMatchEQ Shared API Module
 *
 * This module provides a platform-agnostic API layer for connecting to the
 * Supabase backend. It can be used by both web and mobile clients.
 *
 * Usage:
 * ```typescript
 * import { api } from '@/lib/api';
 *
 * // Authentication
 * const { user, error } = await api.signIn(email, password);
 *
 * // Get profile
 * const profile = await api.getUserProfile(userId);
 *
 * // Submit quiz
 * const result = await api.submitQuiz({ userId, quizType: 'mbti', answers });
 *
 * // Check entitlement
 * const { hasAccess } = await api.checkEntitlement(userId, 'premium_reports');
 * ```
 */

export * from './types';
export {
  api,
  isSupabaseConfigured,
  setStorage,
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  onAuthStateChange,
  getUserProfile,
  updateUserProfile,
  getDiscoverProfiles,
  recordSwipe,
  getConnections,
  sendMessage,
  getMessages,
  subscribeToMessages,
  submitQuiz,
  getQuizResults,
  checkEntitlement,
  getSubscriptionStatus,
} from './client';
export { api as default } from './client';
