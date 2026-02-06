/**
 * Secure Storage Utility for InnerMatchEQ
 *
 * Uses expo-secure-store for sensitive data (auth tokens, sessions)
 * Falls back to AsyncStorage for non-sensitive data
 *
 * expo-secure-store uses:
 * - iOS: Keychain Services
 * - Android: SharedPreferences encrypted with Android Keystore
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Keys for secure storage
export const SECURE_KEYS = {
  SUPABASE_SESSION: 'supabase_session',
  AUTH_LOCKOUT: 'auth_lockout_state',
  AUTH_ATTEMPTS: 'auth_failed_attempts',
} as const;

// Check if SecureStore is available (not available on web)
const isSecureStoreAvailable = Platform.OS !== 'web';

/**
 * Securely store sensitive data
 * Uses SecureStore on native, falls back to AsyncStorage on web
 */
export async function secureSet(key: string, value: string): Promise<void> {
  try {
    if (isSecureStoreAvailable) {
      await SecureStore.setItemAsync(key, value);
    } else {
      // Web fallback - not ideal but necessary for web preview
      await AsyncStorage.setItem(`secure_${key}`, value);
    }
  } catch (error) {
    if (__DEV__) {
      console.error(`[SecureStorage] Error setting ${key}:`, error);
    }
    throw error;
  }
}

/**
 * Retrieve sensitive data from secure storage
 */
export async function secureGet(key: string): Promise<string | null> {
  try {
    if (isSecureStoreAvailable) {
      return await SecureStore.getItemAsync(key);
    } else {
      return await AsyncStorage.getItem(`secure_${key}`);
    }
  } catch (error) {
    if (__DEV__) {
      console.error(`[SecureStorage] Error getting ${key}:`, error);
    }
    return null;
  }
}

/**
 * Remove sensitive data from secure storage
 */
export async function secureRemove(key: string): Promise<void> {
  try {
    if (isSecureStoreAvailable) {
      await SecureStore.deleteItemAsync(key);
    } else {
      await AsyncStorage.removeItem(`secure_${key}`);
    }
  } catch (error) {
    if (__DEV__) {
      console.error(`[SecureStorage] Error removing ${key}:`, error);
    }
  }
}

/**
 * Clear all secure storage items
 */
export async function secureClearAll(): Promise<void> {
  const keysToRemove = Object.values(SECURE_KEYS);

  for (const key of keysToRemove) {
    await secureRemove(key);
  }
}

/**
 * Auth lockout management
 * Persists lockout state across app restarts
 */
export interface AuthLockoutState {
  failedAttempts: number;
  lockedUntil: number | null; // Unix timestamp
  lastAttemptAt: number;
}

const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILED_ATTEMPTS = 5;

export async function getAuthLockoutState(): Promise<AuthLockoutState> {
  try {
    const stored = await secureGet(SECURE_KEYS.AUTH_LOCKOUT);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    if (__DEV__) {
      console.error('[SecureStorage] Error parsing lockout state:', error);
    }
  }

  return {
    failedAttempts: 0,
    lockedUntil: null,
    lastAttemptAt: 0,
  };
}

export async function recordFailedAuthAttempt(): Promise<AuthLockoutState> {
  const state = await getAuthLockoutState();
  const now = Date.now();

  // Reset if last attempt was more than 15 minutes ago
  if (now - state.lastAttemptAt > LOCKOUT_DURATION_MS) {
    state.failedAttempts = 0;
    state.lockedUntil = null;
  }

  state.failedAttempts += 1;
  state.lastAttemptAt = now;

  // Lock account after max attempts
  if (state.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    state.lockedUntil = now + LOCKOUT_DURATION_MS;
  }

  await secureSet(SECURE_KEYS.AUTH_LOCKOUT, JSON.stringify(state));
  return state;
}

export async function clearAuthLockout(): Promise<void> {
  const state: AuthLockoutState = {
    failedAttempts: 0,
    lockedUntil: null,
    lastAttemptAt: 0,
  };
  await secureSet(SECURE_KEYS.AUTH_LOCKOUT, JSON.stringify(state));
}

export function isAccountLocked(state: AuthLockoutState): boolean {
  if (!state.lockedUntil) return false;
  return Date.now() < state.lockedUntil;
}

export function getLockoutRemainingTime(state: AuthLockoutState): number {
  if (!state.lockedUntil) return 0;
  const remaining = state.lockedUntil - Date.now();
  return Math.max(0, remaining);
}

/**
 * Memory cleanup utility
 * Clears sensitive variables from memory after use
 */
export function clearSensitiveString(str: string): string {
  // In JavaScript, we can't truly clear memory, but we can:
  // 1. Overwrite the reference
  // 2. Hint to GC by nullifying references
  // This is a best-effort approach for JavaScript
  return '';
}

export default {
  set: secureSet,
  get: secureGet,
  remove: secureRemove,
  clearAll: secureClearAll,
  KEYS: SECURE_KEYS,
};
