import { Stack, useRouter, Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { Platform } from 'react-native';
import { useEffect, useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hydrateStore, useAppStore, UserProfile } from '@/lib/store';
import {
  initializeDatabase,
  getCurrentUser,
  getUserProfile,
  subscribeToAuthState,
  AuthUser,
} from '@/lib/db';
import {
  registerForPushNotificationsAsync,
  addNotificationReceivedListener,
  addNotificationResponseListener,
  getLastNotificationResponse,
} from '@/lib/notifications';
import {
  isRevenueCatEnabled,
  getCustomerInfo,
  setUserId,
} from '@/lib/revenuecatClient';
import type { EventSubscription } from 'expo-notifications';
import AuthScreen from './auth';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  useFonts,
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import {
  Cormorant_400Regular,
  Cormorant_500Medium,
  Cormorant_600SemiBold,
} from '@expo-google-fonts/cormorant';

export const unstable_settings = {
  initialRouteName: 'index',
};

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// Module-level flags to prevent multiple syncs (persists across React re-renders within same bundle)
let hasSyncedSubscriptionGlobal = false;
let hasProcessedAuthGlobal = false;
// Module-level tracking for auth subscription to prevent race conditions with handleAuthSuccess
let lastProcessedUserId: string | null = null;
let isProcessingAuth = false;

// KeyboardProvider wrapper that only renders on native (not web)
function KeyboardProviderWrapper({ children }: { children: React.ReactNode }) {
  // KeyboardProvider from react-native-keyboard-controller doesn't work on web
  if (Platform.OS === 'web') {
    return <>{children}</>;
  }
  return <KeyboardProvider>{children}</KeyboardProvider>;
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);
  const setOnboarded = useAppStore((s) => s.setOnboarded);
  const notificationListener = useRef<EventSubscription | null>(null);
  const responseListener = useRef<EventSubscription | null>(null);

  // Safety timeout: If auth check takes too long, proceed anyway
  // This prevents infinite blank screen on web if auth subscription fails
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isCheckingAuth) {
        console.log('[Auth] Safety timeout triggered - proceeding without auth');
        setIsCheckingAuth(false);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeout);
  }, [isCheckingAuth]);

  // Sync subscription status from RevenueCat (only once per app session using module-level flag)
  const syncSubscriptionStatus = useCallback(async () => {
    if (!isRevenueCatEnabled()) return;
    if (hasSyncedSubscriptionGlobal) return; // Prevent re-syncing using module-level flag

    hasSyncedSubscriptionGlobal = true;

    try {
      const result = await getCustomerInfo();
      if (result.ok) {
        const entitlements = result.data.entitlements.active;

        // Determine tier based on active entitlements
        let tier: 'free' | 'plus' | 'premium' | 'elite' = 'free';
        let isPremium = false;

        if (entitlements['elite']) {
          tier = 'elite';
          isPremium = true;
        } else if (entitlements['premium']) {
          tier = 'premium';
          isPremium = true;
        } else if (entitlements['plus']) {
          tier = 'plus';
          isPremium = true;
        }

        // Update user's premium status directly from store
        useAppStore.getState().updateCurrentUser({
          isPremium,
          premiumTier: tier,
        });

        if (__DEV__) {
          console.log('[RevenueCat] Subscription synced');
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[RevenueCat] Failed to sync subscription:', error);
      }
    }
  }, []);

  const [fontsLoaded] = useFonts({
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Cormorant_400Regular,
    Cormorant_500Medium,
    Cormorant_600SemiBold,
  });

  useEffect(() => {
    async function prepare() {
      // Initialize database
      await initializeDatabase();

      // Hydrate store from AsyncStorage (only hydrates currentUser, not isOnboarded)
      await hydrateStore();

      // IMPORTANT: Don't set isCheckingAuth=false here!
      // The auth subscription will set it after processing the user's profile.
      // This ensures we don't render RootLayoutNav with stale isOnboarded state.
      setIsReady(true);
    }
    prepare();
  }, []);

  // Subscribe to auth state changes (handles sign in/out)
  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (user) => {
      if (user) {
        // Use module-level tracking to prevent race conditions with handleAuthSuccess
        // Skip if we're currently processing or already processed this exact user ID
        if (isProcessingAuth || lastProcessedUserId === user.uid) {
          if (__DEV__) {
            console.log('[Auth Subscription] Skipping - already processed user');
          }
          return;
        }

        // Mark as being processed at module level
        isProcessingAuth = true;
        lastProcessedUserId = user.uid;
        if (__DEV__) {
          console.log('[Auth Subscription] Processing user');
        }

        // Get the current hydrated user from store (from AsyncStorage)
        const hydratedUser = useAppStore.getState().currentUser;

        // CRITICAL: Only merge hydrated data if it belongs to the SAME user
        // This prevents stale data from a previous user bleeding into a new account
        const isSameUser = hydratedUser?.id === user.uid;

        // If this is a DIFFERENT user, immediately clear stale onboarding state
        // This MUST happen BEFORE setting authUser to prevent stale state from redirecting
        if (!isSameUser) {
          if (__DEV__) {
            console.log('[Auth Subscription] New/different user detected - clearing stale state');
          }
          await AsyncStorage.removeItem('isOnboarded');
          await AsyncStorage.removeItem('currentUser');
          setOnboarded(false);
          setCurrentUser(null);
        }

        // Load user profile from database
        const dbProfile = await getUserProfile(user.uid);
        if (__DEV__) {
          console.log('[Auth Subscription] Profile loaded:', dbProfile ? 'found' : 'not found');
        }

        // Re-fetch hydrated user after potential clear
        const currentHydratedUser = isSameUser ? hydratedUser : null;

        // Merge database profile with hydrated store data ONLY if same user
        // Database is source of truth, but fill in missing values from hydrated data
        if (dbProfile) {
          const mergedProfile = isSameUser && currentHydratedUser
            ? {
                ...currentHydratedUser, // Start with hydrated data (only if same user)
                ...dbProfile, // Override with database data where it exists
                // Ensure personality data is preserved if database doesn't have it
                mbtiType: dbProfile.mbtiType || currentHydratedUser?.mbtiType || null,
                attachmentStyle: dbProfile.attachmentStyle || currentHydratedUser?.attachmentStyle || null,
                loveLanguages: (dbProfile.loveLanguages?.length ? dbProfile.loveLanguages : currentHydratedUser?.loveLanguages) || [],
                mbtiScores: dbProfile.mbtiScores || currentHydratedUser?.mbtiScores || null,
                emotionalIntelligence: dbProfile.emotionalIntelligence || currentHydratedUser?.emotionalIntelligence || 75,
              }
            : dbProfile; // Different user - use only database profile, no merge

          setCurrentUser(mergedProfile as typeof hydratedUser);

          // NOTE: Demo account auto-unlock removed for production
          // Premium access should only be granted through RevenueCat purchases

          // Check if user has completed FULL onboarding (has personality results)
          // Use ONLY database profile for this check to avoid stale data issues
          const hasCompletedAssessment = !!(
            dbProfile.name &&
            dbProfile.age &&
            dbProfile.age > 0 &&
            (dbProfile.mbtiType || dbProfile.attachmentStyle || (dbProfile.loveLanguages && dbProfile.loveLanguages.length > 0))
          );

          if (hasCompletedAssessment) {
            // Use async version to ensure persistence
            await AsyncStorage.setItem('isOnboarded', 'true');
            setOnboarded(true);
          } else {
            // User has NOT completed assessment - ensure they go to onboarding
            await AsyncStorage.removeItem('isOnboarded');
            setOnboarded(false);
          }
        } else {
          // No database profile exists - user has auth session but no saved data
          // This could be:
          // 1. Brand new signup that hasn't completed onboarding
          // 2. Stale session from a user who never completed profile
          // 3. User whose profile was deleted
          //
          // In ALL cases: sign them out so they see Welcome screen and can start fresh
          // The Welcome screen will direct them to auth, and auth.tsx handles navigation to onboarding
          if (__DEV__) {
            console.log('[Auth Subscription] No profile in database - signing out to show Welcome screen');
          }

          // Reset module-level flags first to prevent re-processing
          lastProcessedUserId = null;
          isProcessingAuth = false;

          // Sign out the session so user starts fresh
          const { signOut } = await import('@/lib/db');
          await signOut();

          // Note: signOut will trigger another auth state change with user=null
          // which will be handled by the else branch below
          return; // Exit early, let the signOut callback handle cleanup
        }

        // CRITICAL: Set authUser AFTER onboarding state is properly configured
        // This triggers the render of RootLayoutNav, so state must be correct first
        setAuthUser(user);

        // Now that auth and onboarding state are properly set, allow rendering
        setIsCheckingAuth(false);

        // Mark processing as complete
        isProcessingAuth = false;

        // Link RevenueCat user ID and sync subscription (only if not already synced this session)
        if (isRevenueCatEnabled() && !hasSyncedSubscriptionGlobal) {
          await setUserId(user.uid);
          await syncSubscriptionStatus();
        }

        // Register for push notifications after auth (only once per app session)
        if (!hasProcessedAuthGlobal) {
          hasProcessedAuthGlobal = true;
          registerForPushNotificationsAsync().then((token) => {
            if (__DEV__ && token) {
              console.log('Push token registered');
            }
          });
        }
      } else {
        // User signed out or not logged in - reset module-level flags and clear persisted data
        if (__DEV__) {
          console.log('[Auth Subscription] User signed out - resetting state');
        }
        lastProcessedUserId = null;
        isProcessingAuth = false;
        setAuthUser(null);
        setCurrentUser(null);
        setOnboarded(false);
        // Clear persisted data so new users start fresh
        await AsyncStorage.removeItem('isOnboarded');
        await AsyncStorage.removeItem('currentUser');
        await AsyncStorage.removeItem('app-storage');
        // Reset global flags on sign out so they work again on next sign in
        hasSyncedSubscriptionGlobal = false;
        hasProcessedAuthGlobal = false;
        // Allow rendering - will show AuthScreen since authUser is null
        setIsCheckingAuth(false);
      }
    });

    return () => unsubscribe();
  }, [setCurrentUser, setOnboarded, syncSubscriptionStatus]);

  // Set up notification listeners
  useEffect(() => {
    // Handle notifications received while app is in foreground
    notificationListener.current = addNotificationReceivedListener((notification) => {
      if (__DEV__) {
        console.log('Notification received');
      }
    });

    // Handle notification taps
    responseListener.current = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      if (__DEV__) {
        console.log('Notification tapped');
      }

      // Navigate based on notification type
      if (data?.type === 'new_match' && data?.matchId) {
        // Navigate to profile detail
      } else if (data?.type === 'new_message' && data?.connectionId) {
        // Navigate to chat
      }
    });

    // Check if app was opened from a notification
    getLastNotificationResponse().then((response) => {
      if (__DEV__ && response) {
        console.log('App opened from notification');
      }
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (fontsLoaded && isReady && !isCheckingAuth) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isReady, isCheckingAuth]);

  const handleAuthSuccess = useCallback(
    async (user: AuthUser) => {
      if (__DEV__) {
        console.log('[handleAuthSuccess] Called');
      }

      // Mark at module level that we're processing this user
      // This prevents the auth subscription from also processing
      isProcessingAuth = true;
      lastProcessedUserId = user.uid;

      // CRITICAL: Get the current hydrated user to check if this is a different user
      const hydratedUser = useAppStore.getState().currentUser;
      const isSameUser = hydratedUser?.id === user.uid;

      // If this is a DIFFERENT user than what's hydrated, immediately clear stale state
      // This MUST happen BEFORE setAuthUser to prevent stale onboarded state from redirecting
      if (!isSameUser) {
        if (__DEV__) {
          console.log('[Auth] New user detected - clearing stale onboarding state');
        }
        await AsyncStorage.removeItem('isOnboarded');
        await AsyncStorage.removeItem('currentUser');
        setOnboarded(false);
        setCurrentUser(null);
      }

      // Load or create user profile
      const profile = await getUserProfile(user.uid);

      if (profile) {
        setCurrentUser(profile);
        // Check if user has completed FULL onboarding (has personality results)
        const hasCompletedAssessment = !!(
          profile.name &&
          profile.age > 0 &&
          (profile.mbtiType || profile.attachmentStyle || (profile.loveLanguages && profile.loveLanguages.length > 0))
        );

        if (hasCompletedAssessment) {
          await AsyncStorage.setItem('isOnboarded', 'true');
          setOnboarded(true);
        } else {
          // New user or incomplete profile - ensure they start fresh
          await AsyncStorage.removeItem('isOnboarded');
          setOnboarded(false);
        }
      } else {
        // No profile found - create minimal user object so index.tsx knows user is logged in
        const minimalUser: Partial<UserProfile> & { id: string } = {
          id: user.uid,
          name: '',
          age: 0,
          bio: '',
          photos: [],
          gender: null,
          lookingFor: null,
          attachmentStyle: null,
          mbtiType: null,
          loveLanguages: [],
          emotionalIntelligence: 0,
          isPremium: false,
          premiumTier: 'free',
        };
        setCurrentUser(minimalUser as UserProfile);
        await AsyncStorage.removeItem('isOnboarded');
        setOnboarded(false);
      }

      // Mark processing complete at module level
      isProcessingAuth = false;

      // CRITICAL: Set authUser AFTER all state has been properly configured
      // This triggers the render of RootLayoutNav, so onboarding state must be correct first
      setAuthUser(user);
    },
    [setCurrentUser, setOnboarded]
  );

  // Always return the Stack - use conditional rendering inside screens if needed
  // Returning null breaks Expo Router's navigation context
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <KeyboardProviderWrapper>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }}>
          {/* Main app tabs - shown when onboarded */}
          <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
          {/* Welcome/landing page - handles redirect based on onboarding state */}
          <Stack.Screen name="index" options={{ animation: 'none' }} />
          {/* Onboarding flows */}
          <Stack.Screen name="onboarding" options={{ animation: 'none' }} />
          <Stack.Screen
            name="profile-detail"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="chat"
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="insights"
            options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="paywall"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="custom-questions"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="referrals"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="video-call"
          options={{
            animation: 'fade',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="schedule-video-date"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="auth"
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="challenges"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="report"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="deep-assessment"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="verification"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="app-store-assets"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="privacy-policy"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="terms"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="notifications-settings"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="privacy-safety"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="help-support"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="seeking-preferences"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="insight-attachment"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="insight-mbti"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="insight-love-language"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="insight-compatibility"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="insight-red-flags"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="insight-ideal-partner"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="assessment"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="edit-profile"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="why-innermatch"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="user-review"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="graceful-exit"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
          </KeyboardProviderWrapper>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
