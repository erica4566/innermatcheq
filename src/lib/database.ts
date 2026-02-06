/**
 * Firebase Service Layer for InnerMatchEQ
 *
 * This module provides a Firebase-like API using local SQLite storage.
 * When Firebase is properly configured via the ENV tab, it will sync with the cloud.
 *
 * To enable Firebase:
 * 1. Go to the ENV tab in Vibecode
 * 2. Add these environment variables from your Firebase Console:
 *    - EXPO_PUBLIC_FIREBASE_API_KEY
 *    - EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
 *    - EXPO_PUBLIC_FIREBASE_PROJECT_ID
 *    - EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
 *    - EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
 *    - EXPO_PUBLIC_FIREBASE_APP_ID
 */

import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sanitizeMessage, sanitizeName, sanitizeEmail, sanitizeBio } from './sanitize';
import { UserProfile, Match, Message, Referral, VideoDate } from './store';

// Database instance
let db: SQLite.SQLiteDatabase | null = null;

// Rate limiting for auth attempts
const authAttempts: Map<string, { count: number; lastAttempt: number; lockedUntil?: number }> = new Map();
const MAX_AUTH_ATTEMPTS = 5;
const AUTH_LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const AUTH_ATTEMPT_WINDOW = 5 * 60 * 1000; // 5 minutes

const checkRateLimit = (email: string): { allowed: boolean; retryAfter?: number } => {
  const key = email.toLowerCase();
  const now = Date.now();
  const record = authAttempts.get(key);

  if (!record) {
    return { allowed: true };
  }

  // Check if locked out
  if (record.lockedUntil && now < record.lockedUntil) {
    return {
      allowed: false,
      retryAfter: Math.ceil((record.lockedUntil - now) / 1000)
    };
  }

  // Reset if outside the attempt window
  if (now - record.lastAttempt > AUTH_ATTEMPT_WINDOW) {
    authAttempts.delete(key);
    return { allowed: true };
  }

  // Check if too many attempts
  if (record.count >= MAX_AUTH_ATTEMPTS) {
    const lockedUntil = now + AUTH_LOCKOUT_DURATION;
    authAttempts.set(key, { ...record, lockedUntil });
    return {
      allowed: false,
      retryAfter: Math.ceil(AUTH_LOCKOUT_DURATION / 1000)
    };
  }

  return { allowed: true };
};

const recordAuthAttempt = (email: string, success: boolean): void => {
  const key = email.toLowerCase();
  const now = Date.now();

  if (success) {
    // Clear attempts on successful auth
    authAttempts.delete(key);
    return;
  }

  const record = authAttempts.get(key);
  if (record) {
    authAttempts.set(key, {
      count: record.count + 1,
      lastAttempt: now,
      lockedUntil: record.lockedUntil,
    });
  } else {
    authAttempts.set(key, { count: 1, lastAttempt: now });
  }
};

// Check if Firebase is configured (for future cloud sync)
export const isFirebaseConfigured = (): boolean => {
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  return !!(apiKey && projectId && apiKey !== '' && projectId !== '');
};

// Initialize local database
export const initializeFirebase = async (): Promise<boolean> => {
  try {
    db = await SQLite.openDatabaseAsync('innermatch.db');

    // Create tables
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        password_hash TEXT,
        password_salt TEXT,
        data TEXT,
        created_at INTEGER,
        updated_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS matches (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        data TEXT,
        created_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS swipes (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        target_user_id TEXT,
        action TEXT,
        created_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS connections (
        id TEXT PRIMARY KEY,
        user1_id TEXT,
        user2_id TEXT,
        last_message TEXT,
        last_message_at INTEGER,
        created_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        connection_id TEXT,
        sender_id TEXT,
        text TEXT,
        created_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS referrals (
        id TEXT PRIMARY KEY,
        referrer_id TEXT,
        referred_user_id TEXT,
        referred_user_name TEXT,
        status TEXT,
        reward_earned INTEGER,
        created_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS video_dates (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        match_id TEXT,
        match_name TEXT,
        match_photo TEXT,
        scheduled_at TEXT,
        duration INTEGER,
        status TEXT,
        created_at INTEGER
      );

      CREATE INDEX IF NOT EXISTS idx_swipes_user ON swipes(user_id);
      CREATE INDEX IF NOT EXISTS idx_connections_users ON connections(user1_id, user2_id);
      CREATE INDEX IF NOT EXISTS idx_messages_connection ON messages(connection_id);
    `);

    // Migration: Add password_salt column if it doesn't exist (for existing databases)
    try {
      await db.execAsync(`ALTER TABLE users ADD COLUMN password_salt TEXT`);
    } catch {
      // Column already exists, ignore error
    }

    // Seed sample profiles for discovery if empty (development only)
    if (__DEV__) {
      await seedSampleProfiles();
    }

    if (__DEV__) {
      console.log('Database initialized successfully');
    }
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
};

// Generate UUID
const generateId = async (): Promise<string> => {
  const bytes = await Crypto.getRandomBytesAsync(16);
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

// Hash password with unique per-user salt using PBKDF2-like approach
// Note: For production, use a backend service with proper bcrypt/argon2
const hashPassword = async (password: string, existingSalt?: string): Promise<{ hash: string; salt: string }> => {
  // Generate a unique salt for each user if not provided
  const saltBytes = existingSalt
    ? Uint8Array.from(existingSalt.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) ?? [])
    : await Crypto.getRandomBytesAsync(32);

  const salt = existingSalt ?? Array.from(saltBytes).map(b => b.toString(16).padStart(2, '0')).join('');

  // Use multiple iterations to slow down brute force attacks
  let hash = password + salt;
  for (let i = 0; i < 10000; i++) {
    hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      hash
    );
  }

  return { hash, salt };
};

// Verify password against stored hash and salt
const verifyPassword = async (password: string, storedHash: string, salt: string): Promise<boolean> => {
  const { hash } = await hashPassword(password, salt);
  return hash === storedHash;
};

// ================== AUTH FUNCTIONS ==================

export interface AuthUser {
  uid: string;
  email: string;
}

let currentAuthUser: AuthUser | null = null;
const authListeners: ((user: AuthUser | null) => void)[] = [];

export const signUp = async (
  email: string,
  password: string,
  name: string
): Promise<{ user: AuthUser | null; error: string | null }> => {
  if (!db) return { user: null, error: 'Database not initialized' };

  try {
    // Check if email exists
    const existing = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (existing) {
      return { user: null, error: 'Email already registered' };
    }

    const userId = await generateId();
    const { hash: passwordHash, salt: passwordSalt } = await hashPassword(password);
    const now = Date.now();

    const userData: Partial<UserProfile> = {
      id: userId,
      name,
      age: 0,
      bio: '',
      photos: [],
      gender: null,
      lookingFor: null,
      attachmentStyle: null,
      mbtiType: null,
      loveLanguages: [],
      emotionalIntelligence: 0,
      mbtiScores: null,
      bigFiveScores: null,
      conflictStyle: null,
      relationshipGoal: null,
      communicationFrequency: null,
      affectionLevel: null,
      financialAttitude: null,
      splitBillPreference: null,
      emotionalRegulationStyle: null,
      values: [],
      interests: [],
      dealbreakers: null,
      criticalQuestions: [],
      smoking: 'never',
      drinking: 'never',
      exercise: 'never',
      education: '',
      religion: '',
      isVerified: false,
      verificationLevel: 'none',
      isPremium: false,
      premiumTier: 'free',
      hasVideoIntro: false,
    };

    await db.runAsync(
      'INSERT INTO users (id, email, password_hash, password_salt, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, email.toLowerCase(), passwordHash, passwordSalt, JSON.stringify(userData), now, now]
    );

    const user: AuthUser = { uid: userId, email: email.toLowerCase() };
    currentAuthUser = user;
    await SecureStore.setItemAsync('auth_user', JSON.stringify(user));

    // Notify listeners
    authListeners.forEach(listener => listener(user));

    return { user, error: null };
  } catch (error) {
    console.error('Sign up error:', error);
    return { user: null, error: 'Sign up failed. Please try again.' };
  }
};

export const signIn = async (
  email: string,
  password: string
): Promise<{ user: AuthUser | null; error: string | null }> => {
  if (!db) return { user: null, error: 'Database not initialized' };

  // Input validation
  const sanitizedEmail = sanitizeEmail(email);
  if (!sanitizedEmail || !sanitizedEmail.includes('@')) {
    return { user: null, error: 'Invalid email address' };
  }
  if (!password || password.length < 6) {
    return { user: null, error: 'Invalid password' };
  }

  // Rate limiting check
  const rateLimit = checkRateLimit(sanitizedEmail);
  if (!rateLimit.allowed) {
    return {
      user: null,
      error: `Too many login attempts. Try again in ${Math.ceil((rateLimit.retryAfter || 900) / 60)} minutes.`
    };
  }

  try {
    // First get the user with their salt
    const userRecord = await db.getFirstAsync<{ id: string; email: string; password_hash: string; password_salt: string | null }>(
      'SELECT id, email, password_hash, password_salt FROM users WHERE email = ?',
      [sanitizedEmail]
    );

    if (!userRecord) {
      recordAuthAttempt(sanitizedEmail, false);
      return { user: null, error: 'Invalid email or password' };
    }

    let isValid = false;

    if (userRecord.password_salt) {
      // New secure password verification with salt
      isValid = await verifyPassword(password, userRecord.password_hash, userRecord.password_salt);
    } else {
      // Legacy password check for users created before salt was added
      // Uses the old static salt method for backward compatibility
      const legacyHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password + 'innermatch_salt_2024'
      );
      isValid = legacyHash === userRecord.password_hash;

      // If valid, upgrade their password to the new secure format
      if (isValid) {
        const { hash: newHash, salt: newSalt } = await hashPassword(password);
        await db.runAsync(
          'UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?',
          [newHash, newSalt, userRecord.id]
        );
      }
    }

    if (!isValid) {
      recordAuthAttempt(sanitizedEmail, false);
      return { user: null, error: 'Invalid email or password' };
    }

    // Success - clear rate limit
    recordAuthAttempt(sanitizedEmail, true);

    const authUser: AuthUser = { uid: userRecord.id, email: userRecord.email };
    currentAuthUser = authUser;
    await SecureStore.setItemAsync('auth_user', JSON.stringify(authUser));

    // Notify listeners
    authListeners.forEach(listener => listener(authUser));

    return { user: authUser, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    recordAuthAttempt(sanitizedEmail, false);
    return { user: null, error: 'Sign in failed. Please try again.' };
  }
};

export const signOut = async (): Promise<{ error: string | null }> => {
  try {
    currentAuthUser = null;
    await SecureStore.deleteItemAsync('auth_user');

    // Notify listeners
    authListeners.forEach(listener => listener(null));

    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error: 'Sign out failed' };
  }
};

export const resetPassword = async (email: string): Promise<{ error: string | null }> => {
  // In local mode, we can't send emails
  // This would work with Firebase configured
  if (isFirebaseConfigured()) {
    return { error: 'Password reset email would be sent (Firebase not fully configured)' };
  }
  return { error: 'Password reset requires Firebase configuration. Please contact support.' };
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  if (currentAuthUser) return currentAuthUser;

  try {
    const stored = await SecureStore.getItemAsync('auth_user');
    if (stored) {
      currentAuthUser = JSON.parse(stored);
      return currentAuthUser;
    }
  } catch (error) {
    console.error('Error getting current user:', error);
  }
  return null;
};

export const subscribeToAuthState = (
  callback: (user: AuthUser | null) => void
): (() => void) => {
  authListeners.push(callback);

  // Call immediately with current state
  getCurrentUser().then(user => callback(user));

  return () => {
    const index = authListeners.indexOf(callback);
    if (index > -1) authListeners.splice(index, 1);
  };
};

// ================== USER PROFILE FUNCTIONS ==================

export const getUserProfile = async (
  userId: string
): Promise<UserProfile | null> => {
  if (!db) return null;

  try {
    const row = await db.getFirstAsync<{ data: string }>(
      'SELECT data FROM users WHERE id = ?',
      [userId]
    );

    if (row) {
      return JSON.parse(row.data) as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (
  userId: string,
  data: Partial<UserProfile>
): Promise<boolean> => {
  if (!db) return false;

  try {
    const existing = await getUserProfile(userId);
    if (!existing) return false;

    const updated = { ...existing, ...data };

    await db.runAsync(
      'UPDATE users SET data = ?, updated_at = ? WHERE id = ?',
      [JSON.stringify(updated), Date.now(), userId]
    );

    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
};

export const completeOnboarding = async (
  userId: string,
  profileData: Partial<UserProfile>
): Promise<boolean> => {
  return updateUserProfile(userId, { ...profileData });
};

// ================== MATCHES & DISCOVERY FUNCTIONS ==================

export const getDiscoverProfiles = async (
  userId: string,
  currentUser: UserProfile
): Promise<Match[]> => {
  if (!db) return [];

  try {
    // Get already swiped profiles
    const swipes = await db.getAllAsync<{ target_user_id: string }>(
      'SELECT target_user_id FROM swipes WHERE user_id = ?',
      [userId]
    );
    const swipedIds = new Set(swipes.map(s => s.target_user_id));
    swipedIds.add(userId); // Exclude self

    // Get all other profiles
    const users = await db.getAllAsync<{ id: string; data: string }>(
      'SELECT id, data FROM users WHERE id != ?',
      [userId]
    );

    const matches: Match[] = [];

    for (const row of users) {
      if (swipedIds.has(row.id)) continue;

      const userData = JSON.parse(row.data) as UserProfile;

      // Only show onboarded users with basic info
      if (!userData.name || userData.age === 0) continue;

      // Filter based on seeking preference
      const userGender = userData.gender;
      const currentUserLookingFor = currentUser.lookingFor;

      // Skip if we have a seeking preference and this user doesn't match
      if (currentUserLookingFor && currentUserLookingFor !== 'everyone' && userGender) {
        // Convert preference to expected gender
        const seekingGender = currentUserLookingFor === 'men' ? 'man' : 'woman';
        if (userGender !== seekingGender) continue;
      }

      const compatibilityScore = calculateCompatibility(currentUser, userData);
      const compatibilityBreakdown = calculateCompatibilityBreakdown(currentUser, userData);

      const match: Match = {
        id: row.id,
        name: userData.name,
        age: userData.age,
        photo: userData.photos?.[0] || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        photos: userData.photos,
        bio: userData.bio,
        occupation: userData.occupation,
        location: userData.location,
        gender: userData.gender,
        compatibilityScore,
        compatibilityBreakdown,
        attachmentStyle: userData.attachmentStyle || 'secure',
        mbtiType: userData.mbtiType ?? undefined,
        loveLanguages: userData.loveLanguages,
        sharedValues: getSharedValues(currentUser.values || [], userData.values || []),
        sharedInterests: getSharedValues(currentUser.interests || [], userData.interests || []),
        isVerified: userData.isVerified,
        verificationLevel: userData.verificationLevel,
        hasVideoIntro: userData.hasVideoIntro,
        videoIntroUrl: userData.videoIntroUrl,
      };

      matches.push(match);
    }

    // Sort by compatibility score
    return matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  } catch (error) {
    console.error('Error fetching discover profiles:', error);
    return [];
  }
};

export const recordSwipe = async (
  userId: string,
  targetUserId: string,
  action: 'like' | 'pass' | 'superlike'
): Promise<{ isMatch: boolean }> => {
  if (!db) return { isMatch: false };

  try {
    const swipeId = await generateId();
    const now = Date.now();

    await db.runAsync(
      'INSERT OR REPLACE INTO swipes (id, user_id, target_user_id, action, created_at) VALUES (?, ?, ?, ?, ?)',
      [swipeId, userId, targetUserId, action, now]
    );

    // Check for mutual like (match)
    if (action === 'like' || action === 'superlike') {
      const theirSwipe = await db.getFirstAsync<{ action: string }>(
        'SELECT action FROM swipes WHERE user_id = ? AND target_user_id = ?',
        [targetUserId, userId]
      );

      if (theirSwipe && (theirSwipe.action === 'like' || theirSwipe.action === 'superlike')) {
        // It's a match! Create connection
        await createConnection(userId, targetUserId);
        return { isMatch: true };
      }
    }

    return { isMatch: false };
  } catch (error) {
    console.error('Error recording swipe:', error);
    return { isMatch: false };
  }
};

const createConnection = async (
  userId1: string,
  userId2: string
): Promise<void> => {
  if (!db) return;

  try {
    const connectionId = [userId1, userId2].sort().join('_');
    const now = Date.now();

    await db.runAsync(
      'INSERT OR IGNORE INTO connections (id, user1_id, user2_id, created_at) VALUES (?, ?, ?, ?)',
      [connectionId, userId1, userId2, now]
    );
  } catch (error) {
    console.error('Error creating connection:', error);
  }
};

// ================== CONNECTIONS FUNCTIONS ==================

export const getConnections = async (
  userId: string
): Promise<Match[]> => {
  if (!db) return [];

  try {
    // Use JOIN to fetch connections with user profiles in a single query
    // This eliminates the N+1 query problem
    const results = await db.getAllAsync<{
      connection_id: string;
      user1_id: string;
      user2_id: string;
      last_message: string | null;
      last_message_at: number | null;
      connection_created_at: number;
      connected_user_id: string;
      user_data: string;
    }>(`
      SELECT
        c.id as connection_id,
        c.user1_id,
        c.user2_id,
        c.last_message,
        c.last_message_at,
        c.created_at as connection_created_at,
        CASE WHEN c.user1_id = ? THEN c.user2_id ELSE c.user1_id END as connected_user_id,
        u.data as user_data
      FROM connections c
      JOIN users u ON u.id = CASE WHEN c.user1_id = ? THEN c.user2_id ELSE c.user1_id END
      WHERE c.user1_id = ? OR c.user2_id = ?
    `, [userId, userId, userId, userId]);

    const matches: Match[] = [];

    for (const row of results) {
      try {
        const userProfile = JSON.parse(row.user_data) as UserProfile;

        matches.push({
          id: row.connected_user_id,
          name: userProfile.name,
          age: userProfile.age,
          photo: userProfile.photos?.[0] || '',
          photos: userProfile.photos,
          bio: userProfile.bio,
          occupation: userProfile.occupation,
          location: userProfile.location,
          compatibilityScore: 0,
          attachmentStyle: userProfile.attachmentStyle || 'secure',
          mbtiType: userProfile.mbtiType ?? undefined,
          loveLanguages: userProfile.loveLanguages,
          sharedValues: userProfile.values || [],
          isNew: Date.now() - row.connection_created_at < 24 * 60 * 60 * 1000,
          lastMessage: row.last_message ?? undefined,
          lastMessageTime: row.last_message_at
            ? formatTimestamp(row.last_message_at)
            : undefined,
          hasVideoIntro: userProfile.hasVideoIntro,
          videoIntroUrl: userProfile.videoIntroUrl,
        });
      } catch (parseError) {
        console.error('Error parsing user profile:', parseError);
      }
    }

    return matches;
  } catch (error) {
    console.error('Error fetching connections:', error);
    return [];
  }
};

// ================== MESSAGING FUNCTIONS ==================

export const sendMessage = async (
  userId: string,
  targetUserId: string,
  text: string
): Promise<Message | null> => {
  if (!db) return null;

  // Sanitize message content
  const sanitizedText = sanitizeMessage(text);
  if (!sanitizedText) return null;

  try {
    const connectionId = [userId, targetUserId].sort().join('_');
    const messageId = await generateId();
    const now = Date.now();

    await db.runAsync(
      'INSERT INTO messages (id, connection_id, sender_id, text, created_at) VALUES (?, ?, ?, ?, ?)',
      [messageId, connectionId, userId, sanitizedText, now]
    );

    // Update connection with last message
    await db.runAsync(
      'UPDATE connections SET last_message = ?, last_message_at = ? WHERE id = ?',
      [sanitizedText, now, connectionId]
    );

    return {
      id: messageId,
      text: sanitizedText,
      sender: 'me',
      timestamp: new Date(now).toISOString(),
    };
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
};

export const getMessages = async (
  userId: string,
  targetUserId: string
): Promise<Message[]> => {
  if (!db) return [];

  try {
    const connectionId = [userId, targetUserId].sort().join('_');

    const messages = await db.getAllAsync<{
      id: string;
      sender_id: string;
      text: string;
      created_at: number;
    }>(
      'SELECT * FROM messages WHERE connection_id = ? ORDER BY created_at ASC',
      [connectionId]
    );

    return messages.map(msg => ({
      id: msg.id,
      text: msg.text,
      sender: msg.sender_id === userId ? 'me' : 'them',
      timestamp: new Date(msg.created_at).toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

// For real-time updates, poll or use this with a refresh
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

  // Initial fetch
  poll();

  // Poll every 2 seconds for new messages
  const interval = setInterval(poll, 2000);

  return () => {
    active = false;
    clearInterval(interval);
  };
};

// ================== REFERRAL FUNCTIONS ==================

export const getReferrals = async (userId: string): Promise<Referral[]> => {
  if (!db) return [];

  try {
    const referrals = await db.getAllAsync<{
      id: string;
      referred_user_id: string;
      referred_user_name: string;
      status: string;
      reward_earned: number;
      created_at: number;
    }>(
      'SELECT * FROM referrals WHERE referrer_id = ?',
      [userId]
    );

    return referrals.map(r => ({
      id: r.id,
      referredUserId: r.referred_user_id,
      referredUserName: r.referred_user_name,
      status: r.status as Referral['status'],
      rewardEarned: r.reward_earned === 1,
      createdAt: new Date(r.created_at).toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return [];
  }
};

export const applyReferralCode = async (
  userId: string,
  userName: string,
  referralCode: string
): Promise<{ success: boolean; error?: string }> => {
  if (!db) return { success: false, error: 'Database not available' };

  try {
    // Find user with this referral code in their profile data
    const users = await db.getAllAsync<{ id: string; data: string }>(
      'SELECT id, data FROM users'
    );

    let referrerId: string | null = null;

    for (const user of users) {
      const userData = JSON.parse(user.data);
      if (userData.referralCode === referralCode) {
        referrerId = user.id;
        break;
      }
    }

    if (!referrerId) {
      return { success: false, error: 'Invalid referral code' };
    }

    if (referrerId === userId) {
      return { success: false, error: 'Cannot use your own referral code' };
    }

    // Add referral record
    const referralId = await generateId();
    await db.runAsync(
      'INSERT INTO referrals (id, referrer_id, referred_user_id, referred_user_name, status, reward_earned, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [referralId, referrerId, userId, userName, 'signed_up', 0, Date.now()]
    );

    return { success: true };
  } catch (error) {
    console.error('Error applying referral code:', error);
    return { success: false, error: 'Failed to apply referral code' };
  }
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
  if (!db) return null;

  try {
    const videoDateId = await generateId();
    const now = Date.now();

    await db.runAsync(
      'INSERT INTO video_dates (id, user_id, match_id, match_name, match_photo, scheduled_at, duration, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [videoDateId, userId, matchId, matchName, matchPhoto, scheduledAt, duration, 'scheduled', now]
    );

    return {
      id: videoDateId,
      matchId,
      matchName,
      matchPhoto,
      scheduledAt,
      duration,
      status: 'scheduled',
    };
  } catch (error) {
    console.error('Error scheduling video date:', error);
    return null;
  }
};

export const getScheduledVideoDates = async (
  userId: string
): Promise<VideoDate[]> => {
  if (!db) return [];

  try {
    const dates = await db.getAllAsync<{
      id: string;
      match_id: string;
      match_name: string;
      match_photo: string;
      scheduled_at: string;
      duration: number;
      status: string;
    }>(
      'SELECT * FROM video_dates WHERE user_id = ? AND status = ?',
      [userId, 'scheduled']
    );

    return dates.map(d => ({
      id: d.id,
      matchId: d.match_id,
      matchName: d.match_name,
      matchPhoto: d.match_photo,
      scheduledAt: d.scheduled_at,
      duration: d.duration,
      status: d.status as VideoDate['status'],
    }));
  } catch (error) {
    console.error('Error fetching video dates:', error);
    return [];
  }
};

export const updateVideoDateStatus = async (
  userId: string,
  videoDateId: string,
  status: VideoDate['status']
): Promise<boolean> => {
  if (!db) return false;

  try {
    await db.runAsync(
      'UPDATE video_dates SET status = ? WHERE id = ? AND user_id = ?',
      [status, videoDateId, userId]
    );
    return true;
  } catch (error) {
    console.error('Error updating video date status:', error);
    return false;
  }
};

// ================== DAILY RESET FUNCTION ==================

export const checkAndResetDailyLimits = async (
  userId: string
): Promise<{ dailyLikesRemaining: number; dailySuperLikesRemaining: number }> => {
  const defaults = { dailyLikesRemaining: 10, dailySuperLikesRemaining: 1 };

  try {
    const lastResetKey = `last_reset_${userId}`;
    const likesKey = `daily_likes_${userId}`;
    const superLikesKey = `daily_superlikes_${userId}`;

    const lastReset = await AsyncStorage.getItem(lastResetKey);
    const today = new Date().toDateString();

    if (lastReset !== today) {
      // Reset daily limits
      await AsyncStorage.setItem(lastResetKey, today);
      await AsyncStorage.setItem(likesKey, '10');
      await AsyncStorage.setItem(superLikesKey, '1');
      return defaults;
    }

    const likes = await AsyncStorage.getItem(likesKey);
    const superLikes = await AsyncStorage.getItem(superLikesKey);

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
    const current = await AsyncStorage.getItem(key);
    const value = current ? parseInt(current, 10) : (isSuperLike ? 1 : 10);
    await AsyncStorage.setItem(key, Math.max(0, value - 1).toString());
  } catch (error) {
    console.error('Error decrementing daily like:', error);
  }
};

// ================== HELPER FUNCTIONS ==================

const calculateCompatibility = (
  user1: UserProfile,
  user2: UserProfile
): number => {
  let score = 50; // Start at 50 for more dynamic range
  let factors = 0;

  // Attachment style compatibility (weight: 15)
  if (user1.attachmentStyle && user2.attachmentStyle) {
    const attachmentMatrix: Record<string, Record<string, number>> = {
      secure: { secure: 15, anxious: 12, avoidant: 8, disorganized: 5 },
      anxious: { secure: 14, anxious: 6, avoidant: 2, disorganized: 4 },
      avoidant: { secure: 12, anxious: 2, avoidant: 7, disorganized: 4 },
      disorganized: { secure: 10, anxious: 4, avoidant: 4, disorganized: 3 },
    };
    score += attachmentMatrix[user1.attachmentStyle]?.[user2.attachmentStyle] || 0;
    factors++;
  }

  // Shared values bonus (weight: 10)
  const sharedValues = getSharedValues(user1.values || [], user2.values || []);
  score += Math.min(sharedValues.length * 2, 10);
  if (user1.values?.length && user2.values?.length) factors++;

  // Love language compatibility (weight: 8)
  if (user1.loveLanguages?.length && user2.loveLanguages?.length) {
    const sharedLanguages = user1.loveLanguages.filter((l) =>
      user2.loveLanguages?.includes(l)
    );
    score += sharedLanguages.length * 4;
    factors++;
  }

  // NEW: Relationship goal compatibility (weight: 10)
  if (user1.relationshipGoal && user2.relationshipGoal) {
    const goalMatrix: Record<string, Record<string, number>> = {
      casual: { casual: 10, serious: 3, marriage: 0, unsure: 6 },
      serious: { casual: 3, serious: 10, marriage: 8, unsure: 5 },
      marriage: { casual: 0, serious: 8, marriage: 10, unsure: 4 },
      unsure: { casual: 6, serious: 5, marriage: 4, unsure: 7 },
    };
    score += goalMatrix[user1.relationshipGoal]?.[user2.relationshipGoal] || 0;
    factors++;
  }

  // NEW: Conflict style compatibility (weight: 8)
  if (user1.conflictStyle && user2.conflictStyle) {
    const conflictMatrix: Record<string, Record<string, number>> = {
      avoid: { avoid: 5, compete: 2, accommodate: 6, compromise: 6, collaborate: 7 },
      compete: { avoid: 2, compete: 3, accommodate: 4, compromise: 5, collaborate: 6 },
      accommodate: { avoid: 6, compete: 4, accommodate: 5, compromise: 7, collaborate: 8 },
      compromise: { avoid: 6, compete: 5, accommodate: 7, compromise: 8, collaborate: 8 },
      collaborate: { avoid: 7, compete: 6, accommodate: 8, compromise: 8, collaborate: 8 },
    };
    score += conflictMatrix[user1.conflictStyle]?.[user2.conflictStyle] || 0;
    factors++;
  }

  // NEW: Communication frequency compatibility (weight: 6)
  if (user1.communicationFrequency && user2.communicationFrequency) {
    const commMatrix: Record<string, Record<string, number>> = {
      constant: { constant: 6, frequent: 5, moderate: 3, minimal: 1 },
      frequent: { constant: 5, frequent: 6, moderate: 5, minimal: 3 },
      moderate: { constant: 3, frequent: 5, moderate: 6, minimal: 4 },
      minimal: { constant: 1, frequent: 3, moderate: 4, minimal: 6 },
    };
    score += commMatrix[user1.communicationFrequency]?.[user2.communicationFrequency] || 0;
    factors++;
  }

  // NEW: Affection level compatibility (weight: 6)
  if (user1.affectionLevel && user2.affectionLevel) {
    const affectionMatrix: Record<string, Record<string, number>> = {
      very_affectionate: { very_affectionate: 6, moderate: 5, reserved: 2, minimal: 1 },
      moderate: { very_affectionate: 5, moderate: 6, reserved: 4, minimal: 3 },
      reserved: { very_affectionate: 2, moderate: 4, reserved: 6, minimal: 5 },
      minimal: { very_affectionate: 1, moderate: 3, reserved: 5, minimal: 6 },
    };
    score += affectionMatrix[user1.affectionLevel]?.[user2.affectionLevel] || 0;
    factors++;
  }

  // NEW: Financial attitude compatibility (weight: 6)
  if (user1.financialAttitude && user2.financialAttitude) {
    const financeMatrix: Record<string, Record<string, number>> = {
      saver: { saver: 6, balanced: 5, spender: 2 },
      balanced: { saver: 5, balanced: 6, spender: 5 },
      spender: { saver: 2, balanced: 5, spender: 6 },
    };
    score += financeMatrix[user1.financialAttitude]?.[user2.financialAttitude] || 0;
    factors++;
  }

  // NEW: Big Five personality compatibility (weight: 8)
  if (user1.bigFiveScores && user2.bigFiveScores) {
    const b1 = user1.bigFiveScores;
    const b2 = user2.bigFiveScores;

    // Calculate similarity across traits (some complement, some match)
    let bigFiveScore = 0;

    // Openness - similar is better
    bigFiveScore += 2 - Math.abs(b1.openness - b2.openness) / 50;

    // Conscientiousness - similar is better
    bigFiveScore += 2 - Math.abs(b1.conscientiousness - b2.conscientiousness) / 50;

    // Extraversion - complementary can work (introverts with extroverts)
    bigFiveScore += 2 - Math.abs(b1.extraversion - b2.extraversion) / 100;

    // Agreeableness - higher is better for both
    bigFiveScore += (b1.agreeableness + b2.agreeableness) / 100;

    // Neuroticism - lower is better for both (stability)
    bigFiveScore += 2 - (b1.neuroticism + b2.neuroticism) / 100;

    score += Math.max(0, Math.min(8, bigFiveScore));
    factors++;
  }

  // NEW: Emotional regulation compatibility (weight: 5)
  if (user1.emotionalRegulationStyle && user2.emotionalRegulationStyle) {
    const emotionalMatrix: Record<string, Record<string, number>> = {
      suppressor: { suppressor: 3, expresser: 4, reappraiser: 5, seeker: 4 },
      expresser: { suppressor: 4, expresser: 4, reappraiser: 5, seeker: 5 },
      reappraiser: { suppressor: 5, expresser: 5, reappraiser: 5, seeker: 5 },
      seeker: { suppressor: 4, expresser: 5, reappraiser: 5, seeker: 5 },
    };
    score += emotionalMatrix[user1.emotionalRegulationStyle]?.[user2.emotionalRegulationStyle] || 0;
    factors++;
  }

  // Normalize and return
  return Math.min(Math.max(Math.round(score), 0), 100);
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

const calculateAttachmentScore = (
  style1: string | null | undefined,
  style2: string | null | undefined
): number => {
  if (!style1 || !style2) return 70;
  const matrix: Record<string, Record<string, number>> = {
    secure: { secure: 95, anxious: 80, avoidant: 70, disorganized: 60 },
    anxious: { secure: 85, anxious: 60, avoidant: 40, disorganized: 50 },
    avoidant: { secure: 75, anxious: 40, avoidant: 65, disorganized: 50 },
    disorganized: { secure: 65, anxious: 50, avoidant: 50, disorganized: 45 },
  };
  return matrix[style1]?.[style2] || 70;
};

const calculateMBTIScore = (
  type1: string | null | undefined,
  type2: string | null | undefined
): number => {
  if (!type1 || !type2) return 70;
  let score = 70;
  if (type1 === type2) score += 10;
  if (type1[1] !== type2[1]) score += 5;
  if (type1[2] !== type2[2]) score += 5;
  return Math.min(score, 95);
};

const calculateLoveLanguageScore = (
  langs1: string[] | undefined,
  langs2: string[] | undefined
): number => {
  if (!langs1?.length || !langs2?.length) return 70;
  const shared = langs1.filter((l) => langs2.includes(l)).length;
  return 60 + shared * 17;
};

const calculateValuesScore = (
  values1: string[] | undefined,
  values2: string[] | undefined
): number => {
  if (!values1?.length || !values2?.length) return 70;
  const shared = values1.filter((v) => values2.includes(v)).length;
  const total = Math.max(values1.length, values2.length);
  return Math.round(60 + (shared / total) * 35);
};

const calculateLifestyleScore = (
  user1: UserProfile,
  user2: UserProfile
): number => {
  let score = 70;
  if (user1.smoking === user2.smoking) score += 10;
  if (user1.drinking === user2.drinking) score += 10;
  if (user1.exercise === user2.exercise) score += 10;
  return Math.min(score, 95);
};

const getSharedValues = (arr1: string[], arr2: string[]): string[] => {
  return arr1.filter((item) => arr2.includes(item));
};

const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

// ================== SEED SAMPLE PROFILES ==================

const SAMPLE_PROFILES_VERSION = 2; // Increment this when sample profiles change

const seedSampleProfiles = async (): Promise<void> => {
  if (!db) return;

  try {
    // Check if we've already seeded this version of profiles
    const versionKey = 'sample_profiles_version';
    const storedVersion = await AsyncStorage.getItem(versionKey);

    if (storedVersion === String(SAMPLE_PROFILES_VERSION)) {
      // Check if sample profiles exist
      const existingCount = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM users WHERE id LIKE ?',
        ['sample_%']
      );

      if (existingCount && existingCount.count > 0) {
        // Profiles already seeded with current version
        return;
      }
    }

    // Delete old sample profiles and re-seed
    await db.runAsync('DELETE FROM users WHERE id LIKE ?', ['sample_%']);

    const sampleProfiles = [
      // Women profiles
      {
        id: 'sample_1',
        name: 'Sarah',
        age: 28,
        gender: 'woman',
        lookingFor: 'men',
        bio: 'Psychology enthusiast who loves deep conversations over coffee. Yoga instructor by day, bookworm by night.',
        photos: [
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
          'https://images.unsplash.com/photo-1524638431109-93d95c968f03?w=400',
        ],
        occupation: 'Yoga Instructor',
        location: 'San Francisco, CA',
        attachmentStyle: 'secure',
        mbtiType: 'ENFJ',
        loveLanguages: ['time', 'words'],
        values: ['Growth', 'Authenticity', 'Family'],
        interests: ['Reading', 'Yoga', 'Travel'],
        isVerified: true,
        verificationLevel: 'photo',
        smoking: 'never',
        drinking: 'social',
        exercise: 'regularly',
        isPremium: false,
        premiumTier: 'free',
        hasVideoIntro: false,
      },
      {
        id: 'sample_2',
        name: 'Emma',
        age: 31,
        gender: 'woman',
        lookingFor: 'men',
        bio: 'Adventure seeker and aspiring novelist. Looking for someone to explore hidden cafes and share stories with.',
        photos: [
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
          'https://images.unsplash.com/photo-1502323777036-f29e3972f5e5?w=400',
        ],
        occupation: 'Marketing Director',
        location: 'New York, NY',
        attachmentStyle: 'secure',
        mbtiType: 'ENFP',
        loveLanguages: ['time', 'acts'],
        values: ['Adventure', 'Creativity', 'Independence'],
        interests: ['Writing', 'Hiking', 'Photography'],
        isVerified: true,
        verificationLevel: 'id',
        smoking: 'never',
        drinking: 'social',
        exercise: 'sometimes',
        isPremium: false,
        premiumTier: 'free',
        hasVideoIntro: false,
      },
      {
        id: 'sample_3',
        name: 'Olivia',
        age: 26,
        gender: 'woman',
        lookingFor: 'everyone',
        bio: 'Therapist in training. I believe in the power of vulnerability and honest communication.',
        photos: [
          'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400',
        ],
        occupation: 'Graduate Student',
        location: 'Boston, MA',
        attachmentStyle: 'anxious',
        mbtiType: 'INFJ',
        loveLanguages: ['words', 'touch'],
        values: ['Communication', 'Loyalty', 'Stability'],
        interests: ['Psychology', 'Art', 'Music'],
        isVerified: false,
        verificationLevel: 'none',
        smoking: 'never',
        drinking: 'never',
        exercise: 'sometimes',
        isPremium: false,
        premiumTier: 'free',
        hasVideoIntro: false,
      },
      // Men profiles
      {
        id: 'sample_7',
        name: 'James',
        age: 29,
        gender: 'man',
        lookingFor: 'women',
        bio: 'Software engineer who loves hiking on weekends. Looking for someone to share adventures and quiet evenings with.',
        photos: [
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        ],
        occupation: 'Software Engineer',
        location: 'San Francisco, CA',
        attachmentStyle: 'secure',
        mbtiType: 'INTJ',
        loveLanguages: ['time', 'acts'],
        values: ['Growth', 'Authenticity', 'Career'],
        interests: ['Hiking', 'Coding', 'Travel'],
        isVerified: true,
        verificationLevel: 'photo',
        smoking: 'never',
        drinking: 'social',
        exercise: 'regularly',
        isPremium: false,
        premiumTier: 'free',
        hasVideoIntro: false,
      },
      {
        id: 'sample_8',
        name: 'Michael',
        age: 32,
        gender: 'man',
        lookingFor: 'women',
        bio: 'Chef and food lover. I believe the way to the heart is through the stomach. Let me cook for you.',
        photos: [
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
        ],
        occupation: 'Executive Chef',
        location: 'New York, NY',
        attachmentStyle: 'secure',
        mbtiType: 'ENFP',
        loveLanguages: ['acts', 'time'],
        values: ['Creativity', 'Family', 'Adventure'],
        interests: ['Cooking', 'Travel', 'Music'],
        isVerified: true,
        verificationLevel: 'id',
        smoking: 'never',
        drinking: 'social',
        exercise: 'sometimes',
        isPremium: false,
        premiumTier: 'free',
        hasVideoIntro: false,
      },
      {
        id: 'sample_9',
        name: 'David',
        age: 27,
        gender: 'man',
        lookingFor: 'women',
        bio: 'Architect with a passion for sustainable design. Looking for someone who appreciates both the big picture and the details.',
        photos: [
          'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
          'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400',
        ],
        occupation: 'Architect',
        location: 'Los Angeles, CA',
        attachmentStyle: 'anxious',
        mbtiType: 'INFJ',
        loveLanguages: ['words', 'time'],
        values: ['Creativity', 'Stability', 'Growth'],
        interests: ['Architecture', 'Art', 'Photography'],
        isVerified: false,
        verificationLevel: 'none',
        smoking: 'never',
        drinking: 'social',
        exercise: 'sometimes',
        isPremium: false,
        premiumTier: 'free',
        hasVideoIntro: false,
      },
      {
        id: 'sample_10',
        name: 'Ryan',
        age: 30,
        gender: 'man',
        lookingFor: 'everyone',
        bio: 'Doctor by day, musician by night. Looking for someone to share life\'s beautiful moments.',
        photos: [
          'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400',
          'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400',
        ],
        occupation: 'Physician',
        location: 'Boston, MA',
        attachmentStyle: 'secure',
        mbtiType: 'ENFJ',
        loveLanguages: ['time', 'touch'],
        values: ['Family', 'Health', 'Communication'],
        interests: ['Music', 'Travel', 'Reading'],
        isVerified: true,
        verificationLevel: 'id',
        smoking: 'never',
        drinking: 'social',
        exercise: 'regularly',
        isPremium: false,
        premiumTier: 'free',
        hasVideoIntro: false,
      },
      {
        id: 'sample_11',
        name: 'Alex',
        age: 28,
        gender: 'man',
        lookingFor: 'women',
        bio: 'Fitness trainer and wellness coach. I help people become the best version of themselves.',
        photos: [
          'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400',
          'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
        ],
        occupation: 'Fitness Trainer',
        location: 'Miami, FL',
        attachmentStyle: 'secure',
        mbtiType: 'ESTP',
        loveLanguages: ['acts', 'touch'],
        values: ['Health', 'Growth', 'Adventure'],
        interests: ['Fitness', 'Nutrition', 'Sports'],
        isVerified: true,
        verificationLevel: 'photo',
        smoking: 'never',
        drinking: 'sometimes',
        exercise: 'regularly',
        isPremium: false,
        premiumTier: 'free',
        hasVideoIntro: false,
      },
      {
        id: 'sample_12',
        name: 'Chris',
        age: 33,
        gender: 'man',
        lookingFor: 'women',
        bio: 'Entrepreneur and coffee enthusiast. Building the future one idea at a time.',
        photos: [
          'https://images.unsplash.com/photo-1480455624313-e29b44bbfde1?w=400',
          'https://images.unsplash.com/photo-1502767089025-6572583495f7?w=400',
        ],
        occupation: 'Startup Founder',
        location: 'Austin, TX',
        attachmentStyle: 'avoidant',
        mbtiType: 'ENTJ',
        loveLanguages: ['acts', 'gifts'],
        values: ['Career', 'Independence', 'Growth'],
        interests: ['Business', 'Technology', 'Travel'],
        isVerified: false,
        verificationLevel: 'none',
        smoking: 'never',
        drinking: 'social',
        exercise: 'sometimes',
        isPremium: false,
        premiumTier: 'free',
        hasVideoIntro: false,
      },
    ];

    const now = Date.now();
    for (const profile of sampleProfiles) {
      await db.runAsync(
        'INSERT OR IGNORE INTO users (id, email, password_hash, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [profile.id, `${profile.id}@sample.com`, 'sample', JSON.stringify(profile), now, now]
      );
    }

    // Store the version so we don't re-seed unnecessarily
    await AsyncStorage.setItem('sample_profiles_version', String(SAMPLE_PROFILES_VERSION));

    console.log('Sample profiles seeded successfully');
  } catch (error) {
    console.error('Error seeding sample profiles:', error);
  }
};
