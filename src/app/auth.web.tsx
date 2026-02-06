/**
 * Web-specific Auth Page
 * Professional login/signup page with consistent website navigation
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useMutation } from '@tanstack/react-query';
import { Heart, Mail, Lock, User, Eye, EyeOff, ArrowLeft, CheckSquare, Square } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { signIn, signUp, resetPassword, AuthUser, getUserProfile } from '@/lib/db';
import { useAppStore, UserProfile } from '@/lib/store';
import { validateEmail, validateSignUp, validateSignIn } from '@/lib/validation';
import WebNavigation from '@/components/WebNavigation';
import { BRAND_COLORS } from '@/lib/brand';

export default function AuthWebScreen() {
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
    await AsyncStorage.removeItem('isOnboarded');
    await AsyncStorage.removeItem('currentUser');
    setOnboarded(false);
    setCurrentUser(null);

    const profile = await getUserProfile(user.uid);

    if (profile) {
      setCurrentUser(profile);
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
        // Ignore
      }
    };
    loadRememberedEmail();
  }, []);

  const loginMutation = useMutation({
    mutationFn: async () => {
      const validation = validateSignIn({ email: email.trim(), password });
      if (!validation.success) {
        throw new Error(validation.error);
      }
      const result = await signIn(validation.data!.email, validation.data!.password);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.user;
    },
    onSuccess: async (user) => {
      if (user) {
        if (rememberMe) {
          await AsyncStorage.setItem('remembered_email', email.trim());
        } else {
          await AsyncStorage.removeItem('remembered_email');
        }
        await processAuthAndNavigate(user);
      }
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const signupMutation = useMutation({
    mutationFn: async () => {
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
        await processAuthAndNavigate(user);
      }
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      const validation = validateEmail(email.trim());
      if (!validation.success) {
        throw new Error(validation.error);
      }
      const result = await resetPassword(validation.data!);
      if (result.error) throw new Error(result.error);
    },
    onSuccess: () => {
      setResetSent(true);
    },
    onError: (err: Error) => {
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
    <WebNavigation>
      <ScrollView
        className="flex-1 bg-[#FDF8F5]"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 items-center justify-center py-16 px-6">
          <View style={{ maxWidth: 420, width: '100%' }}>
            {/* Logo */}
            <Animated.View
              entering={FadeInDown.delay(100).springify()}
              className="items-center mb-10"
            >
              <View className="w-20 h-20 rounded-full bg-[#D4626A]/10 items-center justify-center mb-4">
                <Heart size={40} color={BRAND_COLORS.primary} fill={BRAND_COLORS.primary} />
              </View>
              <Text
                className="text-3xl text-[#2D3436] text-center"
                style={{ fontFamily: 'Cormorant_700Bold' }}
              >
                {isForgotPassword ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Create Account'}
              </Text>
              <Text
                className="text-base text-[#636E72] mt-2 text-center"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                {isForgotPassword
                  ? "Enter your email and we'll send reset instructions"
                  : isLogin
                  ? 'Sign in to continue your journey'
                  : 'Start discovering yourself today'}
              </Text>
            </Animated.View>

            {/* Form Card */}
            <Animated.View
              entering={FadeInUp.delay(200).springify()}
              className="bg-white rounded-3xl p-8"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.08,
                shadowRadius: 24,
              }}
            >
              {/* Back button for forgot password */}
              {isForgotPassword && (
                <Pressable
                  onPress={() => {
                    setIsForgotPassword(false);
                    setResetSent(false);
                    setError(null);
                  }}
                  className="flex-row items-center mb-6"
                >
                  <ArrowLeft size={18} color="#636E72" />
                  <Text
                    className="text-[#636E72] text-sm ml-2"
                    style={{ fontFamily: 'Outfit_500Medium' }}
                  >
                    Back to Sign In
                  </Text>
                </Pressable>
              )}

              {/* Tab Selector for Sign In / Sign Up */}
              {!isForgotPassword && (
                <View className="flex-row mb-6 bg-[#F5F0ED] rounded-xl p-1">
                  <Pressable
                    onPress={() => {
                      setIsLogin(true);
                      setError(null);
                    }}
                    disabled={isLoading}
                    className={`flex-1 py-3 rounded-lg ${isLogin ? 'bg-white' : ''}`}
                    style={isLogin ? { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } } : {}}
                  >
                    <Text
                      className={`text-center text-sm ${isLogin ? 'text-[#D4626A]' : 'text-[#636E72]'}`}
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
                    className={`flex-1 py-3 rounded-lg ${!isLogin ? 'bg-white' : ''}`}
                    style={!isLogin ? { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } } : {}}
                  >
                    <Text
                      className={`text-center text-sm ${!isLogin ? 'text-[#D4626A]' : 'text-[#636E72]'}`}
                      style={{ fontFamily: !isLogin ? 'Outfit_600SemiBold' : 'Outfit_500Medium' }}
                    >
                      Sign Up
                    </Text>
                  </Pressable>
                </View>
              )}

              {/* Reset Sent Success */}
              {resetSent && (
                <View className="mb-4 bg-[#81B29A]/10 rounded-xl px-4 py-4">
                  <Text
                    className="text-[#81B29A] text-center text-sm"
                    style={{ fontFamily: 'Outfit_500Medium' }}
                  >
                    Check your email for password reset instructions.
                  </Text>
                </View>
              )}

              {/* Name field (signup only) */}
              {!isLogin && !isForgotPassword && (
                <View className="mb-4">
                  <Text className="text-sm text-[#636E72] mb-2" style={{ fontFamily: 'Outfit_500Medium' }}>
                    Your Name
                  </Text>
                  <View className="flex-row items-center bg-[#F9F7F5] rounded-xl px-4 py-3 border border-[#E8E4E0]">
                    <User size={18} color="#9CA3AF" />
                    <TextInput
                      className="flex-1 ml-3 text-base text-[#2D3436]"
                      style={{ fontFamily: 'Outfit_400Regular', outlineStyle: 'none' } as any}
                      placeholder="Enter your name"
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
                <Text className="text-sm text-[#636E72] mb-2" style={{ fontFamily: 'Outfit_500Medium' }}>
                  Email Address
                </Text>
                <View className="flex-row items-center bg-[#F9F7F5] rounded-xl px-4 py-3 border border-[#E8E4E0]">
                  <Mail size={18} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-[#2D3436]"
                    style={{ fontFamily: 'Outfit_400Regular', outlineStyle: 'none' } as any}
                    placeholder="you@example.com"
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

              {/* Password field */}
              {!isForgotPassword && (
                <View className="mb-4">
                  <Text className="text-sm text-[#636E72] mb-2" style={{ fontFamily: 'Outfit_500Medium' }}>
                    Password
                  </Text>
                  <View className="flex-row items-center bg-[#F9F7F5] rounded-xl px-4 py-3 border border-[#E8E4E0]">
                    <Lock size={18} color="#9CA3AF" />
                    <TextInput
                      className="flex-1 ml-3 text-base text-[#2D3436]"
                      style={{ fontFamily: 'Outfit_400Regular', outlineStyle: 'none' } as any}
                      placeholder="••••••••"
                      placeholderTextColor="#9CA3AF"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      editable={!isLoading}
                    />
                    <Pressable onPress={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <EyeOff size={18} color="#9CA3AF" />
                      ) : (
                        <Eye size={18} color="#9CA3AF" />
                      )}
                    </Pressable>
                  </View>
                  {!isLogin && (
                    <Text
                      className="text-xs text-[#9CA3AF] mt-2"
                      style={{ fontFamily: 'Outfit_400Regular' }}
                    >
                      8+ characters with uppercase, lowercase & number
                    </Text>
                  )}
                </View>
              )}

              {/* Remember me & Forgot Password */}
              {isLogin && !isForgotPassword && (
                <View className="flex-row items-center justify-between mb-6">
                  <Pressable
                    onPress={() => setRememberMe(!rememberMe)}
                    className="flex-row items-center"
                  >
                    {rememberMe ? (
                      <CheckSquare size={18} color={BRAND_COLORS.primary} />
                    ) : (
                      <Square size={18} color="#9CA3AF" />
                    )}
                    <Text
                      className="ml-2 text-sm text-[#636E72]"
                      style={{ fontFamily: 'Outfit_400Regular' }}
                    >
                      Remember me
                    </Text>
                  </Pressable>
                  <Pressable onPress={() => setIsForgotPassword(true)}>
                    <Text
                      className="text-sm text-[#D4626A]"
                      style={{ fontFamily: 'Outfit_500Medium' }}
                    >
                      Forgot Password?
                    </Text>
                  </Pressable>
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
                className="mt-2"
              >
                <LinearGradient
                  colors={isFormValid ? [BRAND_COLORS.primary, '#C45850'] : ['#E0E0E0', '#D0D0D0']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    borderRadius: 12,
                    paddingVertical: 16,
                    alignItems: 'center',
                    opacity: isLoading ? 0.7 : 1,
                  }}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text
                      className="text-white text-base"
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
                className="text-xs text-[#9CA3AF] text-center"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                By continuing, you agree to our{' '}
                <Text
                  className="text-[#D4626A]"
                  onPress={() => router.push('/terms')}
                  style={{ fontFamily: 'Outfit_500Medium' }}
                >
                  Terms of Service
                </Text>
                {' '}and{' '}
                <Text
                  className="text-[#D4626A]"
                  onPress={() => router.push('/privacy-policy')}
                  style={{ fontFamily: 'Outfit_500Medium' }}
                >
                  Privacy Policy
                </Text>
              </Text>
            </Animated.View>
          </View>
        </View>
      </ScrollView>
    </WebNavigation>
  );
}
