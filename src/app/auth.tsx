import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import { Heart, Mail, Lock, User, Eye, EyeOff, ArrowLeft, CheckSquare, Square } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from '@/lib/haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { signIn, signUp, resetPassword, AuthUser, getUserProfile } from '@/lib/db';
import { useAppStore, UserProfile } from '@/lib/store';
import { validateEmail, validatePassword, validateSignUp, validateSignIn } from '@/lib/validation';
import {
  getAuthLockoutState,
  isAccountLocked,
  getLockoutRemainingTime,
} from '@/lib/secureStorage';

interface AuthScreenProps {
  onAuthSuccess?: (user: AuthUser) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps = {}) {
  const router = useRouter();
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);
  const setOnboarded = useAppStore((s) => s.setOnboarded);
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  // Helper to process user after auth and determine where to navigate
  const processAuthAndNavigate = async (user: AuthUser) => {
    if (__DEV__) {
      console.log('[Auth] Processing user after auth');
    }

    // Clear any stale state first
    await AsyncStorage.removeItem('isOnboarded');
    await AsyncStorage.removeItem('currentUser');
    setOnboarded(false);
    setCurrentUser(null);

    // Load user profile from database
    const profile = await getUserProfile(user.uid);

    if (profile) {
      setCurrentUser(profile);

      // Check if user has completed onboarding
      const hasCompletedAssessment = !!(
        profile.name &&
        profile.age &&
        profile.age > 0 &&
        (profile.mbtiType || profile.attachmentStyle || (profile.loveLanguages && profile.loveLanguages.length > 0))
      );

      if (hasCompletedAssessment) {
        await AsyncStorage.setItem('isOnboarded', 'true');
        setOnboarded(true);
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    } else {
      // New user - create minimal profile and go to onboarding
      const minimalUser: Partial<UserProfile> & { id: string } = {
        id: user.uid,
        name: name.trim() || '',
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
      router.replace('/onboarding');
    }
  };

  // Load remembered email on mount
  useEffect(() => {
    const loadRememberedEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('remembered_email');
        if (savedEmail) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch (e) {
        if (__DEV__) {
          console.log('Error loading remembered email:', e);
        }
      }
    };
    loadRememberedEmail();
  }, []);

  // Check for existing lockout on mount
  useEffect(() => {
    const checkLockout = async () => {
      const lockoutState = await getAuthLockoutState();
      if (isAccountLocked(lockoutState)) {
        const remainingMs = getLockoutRemainingTime(lockoutState);
        const remainingMins = Math.ceil(remainingMs / 60000);
        setError(`Account temporarily locked. Try again in ${remainingMins} minute${remainingMins !== 1 ? 's' : ''}.`);
      }
    };
    checkLockout();
  }, []);

  const loginMutation = useMutation({
    mutationFn: async () => {
      // Validate input using Zod
      const validation = validateSignIn({ email: email.trim(), password });
      if (!validation.success) {
        throw new Error(validation.error);
      }

      // signIn now handles lockout internally
      const result = await signIn(validation.data!.email, validation.data!.password);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.user;
    },
    onSuccess: async (user) => {
      if (user) {
        // Save or clear remembered email based on checkbox
        if (rememberMe) {
          await AsyncStorage.setItem('remembered_email', email.trim());
        } else {
          await AsyncStorage.removeItem('remembered_email');
        }
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // If used as a component with callback, call it
        if (onAuthSuccess) {
          onAuthSuccess(user);
        } else {
          // Process user and navigate to correct screen
          await processAuthAndNavigate(user);
        }
      }
    },
    onError: (err: Error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(err.message);
    },
  });

  const signupMutation = useMutation({
    mutationFn: async () => {
      // Validate input using Zod
      const validation = validateSignUp({ email: email.trim(), password, name: name.trim() });
      if (!validation.success) {
        throw new Error(validation.error);
      }

      const result = await signUp(validation.data!.email, validation.data!.password, validation.data!.name);
      if (result.error) throw new Error(result.error);
      return result.user;
    },
    onSuccess: async (user) => {
      if (user) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // If used as a component with callback, call it
        if (onAuthSuccess) {
          onAuthSuccess(user);
        } else {
          // Process user and navigate to correct screen (onboarding for new users)
          await processAuthAndNavigate(user);
        }
      }
    },
    onError: (err: Error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(err.message);
    },
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      // Validate email
      const validation = validateEmail(email.trim());
      if (!validation.success) {
        throw new Error(validation.error);
      }

      const result = await resetPassword(validation.data!);
      if (result.error) throw new Error(result.error);
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setResetSent(true);
    },
    onError: (err: Error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(err.message);
    },
  });

  const handleSubmit = () => {
    setError(null);
    if (isForgotPassword) {
      resetMutation.mutate();
    } else if (isLogin) {
      loginMutation.mutate();
    } else {
      signupMutation.mutate();
    }
  };

  const isLoading = loginMutation.isPending || signupMutation.isPending || resetMutation.isPending;
  const isFormValid = isForgotPassword
    ? email.trim()
    : email.trim() && password && (isLogin || name.trim());

  return (
    <View className="flex-1">
      <LinearGradient
        colors={['#FDF8F5', '#F9E8E2', '#FDF8F5']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="px-8">
              {/* Logo */}
              <Animated.View
                entering={FadeInDown.delay(100).springify()}
                className="items-center mb-8"
              >
                <View className="w-20 h-20 rounded-full bg-[#E07A5F]/10 items-center justify-center mb-4">
                  <Heart size={40} color="#E07A5F" fill="#E07A5F" />
                </View>
                <Text
                  className="text-3xl text-[#2D3436] text-center"
                  style={{ fontFamily: 'Cormorant_600SemiBold' }}
                >
                  InnerMatchEQ
                </Text>
                <Text
                  className="text-base text-[#636E72] mt-2 text-center"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  Discover yourself. Find your match.
                </Text>
              </Animated.View>

              {/* Form */}
              <Animated.View entering={FadeInUp.delay(200).springify()}>
                {/* Tab Selector for Sign In / Sign Up */}
                {!isForgotPassword && (
                  <View className="flex-row mb-6 bg-[#F0E6E0] rounded-2xl p-1">
                    <Pressable
                      onPress={() => {
                        setIsLogin(true);
                        setError(null);
                      }}
                      disabled={isLoading}
                      className={`flex-1 py-3 rounded-xl ${isLogin ? 'bg-white' : ''}`}
                      style={isLogin ? { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } } : {}}
                    >
                      <Text
                        className={`text-center text-base ${isLogin ? 'text-[#E07A5F]' : 'text-[#636E72]'}`}
                        style={{ fontFamily: isLogin ? 'Outfit_600SemiBold' : 'Outfit_500Medium' }}
                      >
                        Sign In
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setIsLogin(false);
                        setError(null);
                      }}
                      disabled={isLoading}
                      className={`flex-1 py-3 rounded-xl ${!isLogin ? 'bg-white' : ''}`}
                      style={!isLogin ? { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } } : {}}
                    >
                      <Text
                        className={`text-center text-base ${!isLogin ? 'text-[#E07A5F]' : 'text-[#636E72]'}`}
                        style={{ fontFamily: !isLogin ? 'Outfit_600SemiBold' : 'Outfit_500Medium' }}
                      >
                        Sign Up
                      </Text>
                    </Pressable>
                  </View>
                )}

                {/* Back button for forgot password */}
                {isForgotPassword && (
                  <Pressable
                    onPress={() => {
                      setIsForgotPassword(false);
                      setResetSent(false);
                      setError(null);
                    }}
                    className="flex-row items-center mb-4"
                  >
                    <ArrowLeft size={20} color="#636E72" />
                    <Text
                      className="text-[#636E72] text-base ml-2"
                      style={{ fontFamily: 'Outfit_500Medium' }}
                    >
                      Back to Sign In
                    </Text>
                  </Pressable>
                )}

                {/* Forgot Password Title */}
                {isForgotPassword && (
                  <View className="mb-6">
                    <Text
                      className="text-2xl text-[#2D3436] text-center mb-2"
                      style={{ fontFamily: 'Cormorant_600SemiBold' }}
                    >
                      Reset Password
                    </Text>
                    <Text
                      className="text-sm text-[#636E72] text-center"
                      style={{ fontFamily: 'Outfit_400Regular' }}
                    >
                      Enter your email and we'll send you instructions to reset your password
                    </Text>
                  </View>
                )}

                {/* Reset Sent Success */}
                {resetSent && (
                  <View className="mb-4 bg-[#81B29A]/10 rounded-xl px-4 py-4">
                    <Text
                      className="text-[#81B29A] text-center text-sm"
                      style={{ fontFamily: 'Outfit_500Medium' }}
                    >
                      If an account exists with this email, you'll receive password reset instructions shortly.
                    </Text>
                  </View>
                )}

                {/* Name field (signup only) */}
                {!isLogin && !isForgotPassword && (
                  <View className="mb-4">
                    <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 border border-[#E0E0E0]">
                      <User size={20} color="#636E72" />
                      <TextInput
                        className="flex-1 ml-3 text-base text-[#2D3436]"
                        style={{ fontFamily: 'Outfit_400Regular' }}
                        placeholder="Your name"
                        placeholderTextColor="#9CA3AF"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                        editable={!isLoading}
                      />
                    </View>
                  </View>
                )}

                {/* Email field */}
                <View className="mb-4">
                  <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 border border-[#E0E0E0]">
                    <Mail size={20} color="#636E72" />
                    <TextInput
                      className="flex-1 ml-3 text-base text-[#2D3436]"
                      style={{ fontFamily: 'Outfit_400Regular' }}
                      placeholder="Email address"
                      placeholderTextColor="#9CA3AF"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      editable={!isLoading}
                    />
                  </View>
                </View>

                {/* Password field (not in forgot password mode) */}
                {!isForgotPassword && (
                  <View className="mb-2">
                    <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 border border-[#E0E0E0]">
                      <Lock size={20} color="#636E72" />
                      <TextInput
                        className="flex-1 ml-3 text-base text-[#2D3436]"
                        style={{ fontFamily: 'Outfit_400Regular' }}
                        placeholder="Password"
                        placeholderTextColor="#9CA3AF"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        editable={!isLoading}
                      />
                      <Pressable onPress={() => setShowPassword(!showPassword)}>
                        {showPassword ? (
                          <EyeOff size={20} color="#636E72" />
                        ) : (
                          <Eye size={20} color="#636E72" />
                        )}
                      </Pressable>
                    </View>
                  </View>
                )}

                {/* Forgot Password Link and Remember Me */}
                {isLogin && !isForgotPassword && (
                  <View className="flex-row items-center justify-between mb-4">
                    <Pressable
                      onPress={() => {
                        Haptics.selectionAsync();
                        setRememberMe(!rememberMe);
                      }}
                      className="flex-row items-center"
                    >
                      {rememberMe ? (
                        <CheckSquare size={20} color="#E07A5F" />
                      ) : (
                        <Square size={20} color="#636E72" />
                      )}
                      <Text
                        className={`ml-2 text-sm ${rememberMe ? 'text-[#2D3436]' : 'text-[#636E72]'}`}
                        style={{ fontFamily: 'Outfit_500Medium' }}
                      >
                        Remember me
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setIsForgotPassword(true);
                        setError(null);
                      }}
                    >
                      <Text
                        className="text-[#E07A5F] text-sm"
                        style={{ fontFamily: 'Outfit_500Medium' }}
                      >
                        Forgot Password?
                      </Text>
                    </Pressable>
                  </View>
                )}

                {/* Password requirements hint for signup */}
                {!isLogin && !isForgotPassword && (
                  <View className="mb-4 px-1">
                    <Text
                      className="text-xs text-[#9CA3AF]"
                      style={{ fontFamily: 'Outfit_400Regular' }}
                    >
                      Password: 8+ characters with uppercase, lowercase & number
                    </Text>
                  </View>
                )}

                {/* Error message */}
                {error && (
                  <View className="mb-4 bg-red-50 rounded-xl px-4 py-3">
                    <Text
                      className="text-red-600 text-center text-sm"
                      style={{ fontFamily: 'Outfit_500Medium' }}
                    >
                      {error}
                    </Text>
                  </View>
                )}

                {/* Submit button */}
                <Pressable
                  onPress={handleSubmit}
                  disabled={isLoading || !isFormValid}
                  className="mb-6"
                >
                  <LinearGradient
                    colors={
                      isFormValid
                        ? ['#E07A5F', '#D4654D']
                        : ['#E0E0E0', '#D0D0D0']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      borderRadius: 16,
                      paddingVertical: 16,
                      alignItems: 'center',
                      opacity: isLoading ? 0.7 : 1,
                    }}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text
                        className="text-white text-lg"
                        style={{ fontFamily: 'Outfit_600SemiBold' }}
                      >
                        {isForgotPassword ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Create Account'}
                      </Text>
                    )}
                  </LinearGradient>
                </Pressable>
              </Animated.View>

              {/* Terms */}
              <Animated.View
                entering={FadeInUp.delay(300).springify()}
                className="mt-8"
              >
                <Text
                  className="text-xs text-[#9CA3AF] text-center px-4"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  By continuing, you agree to our Terms of Service and Privacy
                  Policy
                </Text>
              </Animated.View>


              {/* Why InnerMatchEQ Link */}
              <Animated.View
                entering={FadeInUp.delay(400).springify()}
                className="mt-4"
              >
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push('/why-innermatch');
                  }}
                  className="py-2"
                >
                  <Text
                    className="text-center text-sm underline text-[#636E72]"
                    style={{ fontFamily: 'Outfit_500Medium' }}
                  >
                    Why InnerMatchEQ?
                  </Text>
                </Pressable>
              </Animated.View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
