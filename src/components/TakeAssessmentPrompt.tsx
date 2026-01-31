import React, { useEffect } from 'react';
import { View, Text, Pressable, Share, Dimensions, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
  interpolate,
  cancelAnimation,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import {
  Sparkles,
  Heart,
  Brain,
  Users,
  Share2,
  ChevronRight,
  Zap,
  Star,
  Gift,
  Trophy,
  ArrowRight,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react-native';
import * as Haptics from '@/lib/haptics';
import { useAppStore } from '@/lib/store';

const { width, height } = Dimensions.get('window');

interface TakeAssessmentPromptProps {
  title: string;
  subtitle: string;
  icon: typeof Brain;
  color: string;
  bgColor: string;
  /** If true, this is a retake (user already has some results) - show different UI */
  isRetake?: boolean;
  /** Show back button - defaults to true */
  showBackButton?: boolean;
}

export default function TakeAssessmentPrompt({
  title,
  subtitle,
  icon: Icon,
  color,
  bgColor,
  isRetake = false,
  showBackButton = true,
}: TakeAssessmentPromptProps) {
  const router = useRouter();
  const referralCode = useAppStore((s) => s.referralCode);
  const currentUser = useAppStore((s) => s.currentUser);

  // Check if user has ANY quiz results (has completed quiz at least once)
  const hasCompletedQuiz = !!(
    currentUser?.mbtiType ||
    currentUser?.attachmentStyle ||
    (currentUser?.loveLanguages && currentUser.loveLanguages.length > 0)
  );

  // If user has completed quiz but this specific result is missing,
  // they should retake - not start fresh
  const effectiveIsRetake = isRetake || hasCompletedQuiz;

  // Animations
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);
  const floatY = useSharedValue(0);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 2000 }),
        withTiming(0.4, { duration: 2000 })
      ),
      -1,
      true
    );

    floatY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Cleanup: cancel animations on unmount to prevent native crashes
    return () => {
      cancelAnimation(pulseScale);
      cancelAnimation(glowOpacity);
      cancelAnimation(floatY);
    };
  }, [pulseScale, glowOpacity, floatY]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const [showRetakeWarning, setShowRetakeWarning] = React.useState(false);

  const handleStartAssessment = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (effectiveIsRetake) {
      // Show warning before retake
      setShowRetakeWarning(true);
    } else {
      // First time - go directly
      router.push('/assessment');
    }
  };

  const confirmRetake = () => {
    setShowRetakeWarning(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/assessment');
  };

  const handleInviteFriends = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const shareMessage = `I just discovered my relationship personality on InnerMatchEQ! 🔮

Find out your:
✨ Attachment Style
🧠 Personality Type (MBTI)
💕 Love Language
📊 Compatibility Score

It's like a deep dive into how you love!

Join me: www.innermatcheq.com/quiz?ref=${referralCode}

#InnerMatchEQ #RelationshipGoals`;

    try {
      await Share.share({
        message: shareMessage,
        title: 'Discover Your Relationship Personality!',
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleGoBack = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <View className="flex-1 bg-[#FDF8F5]">
      {/* Back Button */}
      {showBackButton && (
        <View className="absolute top-12 left-6 z-10">
          <Pressable
            onPress={handleGoBack}
            className="w-12 h-12 items-center justify-center rounded-full bg-white/90 active:scale-95 shadow-sm"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={24} color="#2D3436" />
          </Pressable>
        </View>
      )}

      {/* Background decoration - positioned behind content */}
      <Animated.View
        style={[glowStyle, { position: 'absolute', top: -100, right: -100, width: 300, height: 300, zIndex: 0 }]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={[`${color}20`, 'transparent']}
          style={{ width: '100%', height: '100%', borderRadius: 150 }}
        />
      </Animated.View>

      <View className="flex-1 px-6 justify-center" style={{ zIndex: 1 }}>
        {/* Icon with floating animation */}
        <Animated.View
          entering={FadeIn.duration(600)}
          style={floatStyle}
          className="items-center mb-6"
        >
          <Animated.View style={pulseStyle}>
            <LinearGradient
              colors={[color, `${color}CC`]}
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: color,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
              }}
            >
              <Icon size={48} color="#FFF" />
            </LinearGradient>
          </Animated.View>
        </Animated.View>

        {/* Title */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} className="items-center">
          <Text
            className="text-3xl text-[#2D3436] text-center mb-2"
            style={{ fontFamily: 'Cormorant_700Bold' }}
          >
            Discover Your {title}
          </Text>
          <Text
            className="text-base text-[#636E72] text-center px-4"
            style={{ fontFamily: 'Outfit_400Regular' }}
          >
            {effectiveIsRetake
              ? 'Retake the assessment to update your results.'
              : subtitle}
          </Text>
        </Animated.View>

        {/* Social Proof */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(500)}
          className="mt-8 mb-8"
        >
          <View className="bg-white rounded-2xl p-4 shadow-sm shadow-black/5">
            <View className="flex-row items-center justify-center mb-4">
              <View className="flex-row -space-x-3">
                {['👩', '👨', '👩‍🦱', '👨‍🦳', '👩‍🦰'].map((emoji, i) => (
                  <View
                    key={i}
                    className="w-8 h-8 rounded-full bg-[#F0E6E0] items-center justify-center border-2 border-white"
                  >
                    <Text className="text-sm">{emoji}</Text>
                  </View>
                ))}
              </View>
              <View className="ml-4">
                <Text
                  className="text-xs text-[#2D3436]"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  52,847 people
                </Text>
                <Text
                  className="text-xs text-[#636E72]"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  took the quiz this week
                </Text>
              </View>
            </View>

            {/* Features */}
            <View className="gap-3">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-[#E07A5F]/10 items-center justify-center">
                  <Zap size={16} color="#E07A5F" />
                </View>
                <Text
                  className="text-sm text-[#2D3436] ml-3 flex-1"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  Only takes <Text style={{ fontFamily: 'Outfit_600SemiBold' }}>5 minutes</Text>
                </Text>
              </View>

              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-[#81B29A]/10 items-center justify-center">
                  <Brain size={16} color="#81B29A" />
                </View>
                <Text
                  className="text-sm text-[#2D3436] ml-3 flex-1"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  Based on <Text style={{ fontFamily: 'Outfit_600SemiBold' }}>real psychology</Text>
                </Text>
              </View>

              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-[#D4A574]/10 items-center justify-center">
                  <Users size={16} color="#D4A574" />
                </View>
                <Text
                  className="text-sm text-[#2D3436] ml-3 flex-1"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  Match with <Text style={{ fontFamily: 'Outfit_600SemiBold' }}>compatible people</Text>
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* CTA Buttons */}
        <Animated.View entering={FadeInUp.delay(600).duration(500)} className="gap-4">
          <Pressable
            onPress={handleStartAssessment}
            className="active:scale-[0.98]"
          >
            <LinearGradient
              colors={[color, `${color}DD`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                paddingVertical: 18,
                borderRadius: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: color,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.35,
                shadowRadius: 12,
              }}
            >
              <Sparkles size={20} color="#FFF" />
              <Text
                className="text-white text-lg ml-2"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                {effectiveIsRetake ? 'Retake Assessment' : 'Start My Assessment'}
              </Text>
              <ArrowRight size={20} color="#FFF" className="ml-2" />
            </LinearGradient>
          </Pressable>

          {/* Viral Share CTA */}
          <View className="bg-[#FFF7ED] rounded-2xl p-4 border-2 border-[#F2CC8F]/30">
            <View className="flex-row items-center mb-3">
              <Gift size={20} color="#D4A574" />
              <Text
                className="text-sm text-[#D4A574] ml-2 flex-1"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                Invite Friends & Get Rewards!
              </Text>
              <View className="bg-[#D4A574] rounded-full px-2 py-0.5">
                <Text
                  className="text-[10px] text-white"
                  style={{ fontFamily: 'Outfit_700Bold' }}
                >
                  FREE
                </Text>
              </View>
            </View>

            <Text
              className="text-xs text-[#636E72] mb-3"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              When friends take the quiz, you unlock better matches. More people = better compatibility!
            </Text>

            <Pressable
              onPress={handleInviteFriends}
              className="bg-white rounded-xl py-3 flex-row items-center justify-center border border-[#F2CC8F]/50 active:scale-[0.98]"
            >
              <Share2 size={18} color="#D4A574" />
              <Text
                className="text-[#D4A574] text-sm ml-2"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                Invite Friends to Take the Quiz
              </Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* Bottom trust badge */}
        <Animated.View
          entering={FadeIn.delay(800).duration(500)}
          className="mt-6 items-center"
        >
          <View className="flex-row items-center">
            <Star size={14} color="#F2CC8F" fill="#F2CC8F" />
            <Star size={14} color="#F2CC8F" fill="#F2CC8F" />
            <Star size={14} color="#F2CC8F" fill="#F2CC8F" />
            <Star size={14} color="#F2CC8F" fill="#F2CC8F" />
            <Star size={14} color="#F2CC8F" fill="#F2CC8F" />
            <Text
              className="text-xs text-[#A0A8AB] ml-2"
              style={{ fontFamily: 'Outfit_500Medium' }}
            >
              4.9 rating from 10,000+ users
            </Text>
          </View>
        </Animated.View>
      </View>

      {/* Retake Warning Modal */}
      <Modal
        visible={showRetakeWarning}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRetakeWarning(false)}
      >
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <View className="items-center mb-4">
              <View className="w-16 h-16 rounded-full bg-[#F97316]/10 items-center justify-center mb-4">
                <AlertTriangle size={32} color="#F97316" />
              </View>
              <Text
                className="text-xl text-[#2D3436] text-center mb-2"
                style={{ fontFamily: 'Cormorant_600SemiBold' }}
              >
                Retake Assessment?
              </Text>
              <Text
                className="text-sm text-[#636E72] text-center"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                Your current results will be replaced with new ones. This may change your compatibility matches.
              </Text>
            </View>

            <View className="bg-[#FEF3C7] rounded-xl p-3 mb-6">
              <View className="flex-row items-start">
                <AlertTriangle size={16} color="#F97316" style={{ marginTop: 2 }} />
                <Text
                  className="text-xs text-[#92400E] ml-2 flex-1"
                  style={{ fontFamily: 'Outfit_500Medium' }}
                >
                  Your existing matches may change based on your new assessment results.
                </Text>
              </View>
            </View>

            <Pressable
              onPress={confirmRetake}
              className="bg-[#E07A5F] rounded-xl py-4 mb-3 active:scale-[0.98]"
            >
              <Text
                className="text-white text-center text-base"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                Yes, Retake Assessment
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                setShowRetakeWarning(false);
              }}
              className="py-3"
            >
              <Text
                className="text-[#636E72] text-center text-sm"
                style={{ fontFamily: 'Outfit_500Medium' }}
              >
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
