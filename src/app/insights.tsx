import React from 'react';
import { View, Text, Pressable, ScrollView, Dimensions, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Brain,
  Heart,
  Shield,
  Sparkles,
  Lock,
  Crown,
  TrendingUp,
  Users,
  AlertTriangle,
  ChevronRight,
  Share2,
  Gift,
  Trophy,
  MessageCircle,
} from 'lucide-react-native';
import * as Haptics from '@/lib/haptics';
import {
  useAppStore,
  MBTI_DESCRIPTIONS,
  ATTACHMENT_DESCRIPTIONS,
  LOVE_LANGUAGE_DESCRIPTIONS,
  MBTIType,
  AttachmentStyle,
  LoveLanguage,
} from '@/lib/store';

const { width } = Dimensions.get('window');

function InsightCard({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  iconBg,
  children,
  locked,
  index,
  onUnlock,
  onPress,
}: {
  title: string;
  subtitle?: string;
  icon: typeof Brain;
  iconColor: string;
  iconBg: string;
  children?: React.ReactNode;
  locked?: boolean;
  index: number;
  onUnlock?: () => void;
  onPress?: () => void;
}) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (locked && onUnlock) {
      onUnlock();
    } else if (onPress) {
      onPress();
    }
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(500)}>
      <Pressable
        onPress={handlePress}
        className="bg-white rounded-2xl p-5 mb-4 shadow-sm shadow-black/5 active:scale-[0.98]"
      >
        <View className="flex-row items-center mb-4">
          <View
            className="w-12 h-12 rounded-xl items-center justify-center"
            style={{ backgroundColor: iconBg }}
          >
            <Icon size={24} color={iconColor} />
          </View>
          <View className="flex-1 ml-4">
            <Text
              className="text-lg text-[#2D3436]"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                className="text-sm text-[#636E72]"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                {subtitle}
              </Text>
            )}
          </View>
          {locked ? (
            <View className="bg-[#F2CC8F]/20 rounded-full p-2">
              <Lock size={16} color="#D4A574" />
            </View>
          ) : (
            <View className="bg-[#F5F0ED] rounded-full p-2">
              <ChevronRight size={16} color="#636E72" />
            </View>
          )}
        </View>

        {locked ? (
          <View className="bg-[#F5F0ED] rounded-xl p-4 items-center">
            <Crown size={24} color="#D4A574" />
            <Text
              className="text-sm text-[#636E72] text-center mt-2"
              style={{ fontFamily: 'Outfit_500Medium' }}
            >
              Upgrade to Premium to unlock
            </Text>
          </View>
        ) : (
          children
        )}
      </Pressable>
    </Animated.View>
  );
}

function CompatibilityBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View className="mb-3">
      <View className="flex-row justify-between mb-1">
        <Text
          className="text-sm text-[#636E72]"
          style={{ fontFamily: 'Outfit_400Regular' }}
        >
          {label}
        </Text>
        <Text
          className="text-sm"
          style={{ fontFamily: 'Outfit_600SemiBold', color }}
        >
          {value}%
        </Text>
      </View>
      <View className="h-2 bg-[#F0E6E0] rounded-full overflow-hidden">
        <View
          className="h-full rounded-full"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </View>
    </View>
  );
}

export default function InsightsScreen() {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const isHydrated = useAppStore((s) => s.isHydrated);
  const updateCurrentUser = useAppStore((s) => s.updateCurrentUser);
  const referralCode = useAppStore((s) => s.referralCode);
  const isPremium = currentUser?.isPremium ?? false;

  const handleUnlock = () => {
    router.push('/paywall');
  };

  // Show loading while hydration is in progress
  if (!isHydrated) {
    return (
      <View className="flex-1 bg-[#FDF8F5] items-center justify-center">
        <Sparkles size={48} color="#E07A5F" />
      </View>
    );
  }

  const mbtiInfo = currentUser?.mbtiType
    ? MBTI_DESCRIPTIONS[currentUser.mbtiType as MBTIType]
    : null;

  const attachmentInfo = currentUser?.attachmentStyle
    ? ATTACHMENT_DESCRIPTIONS[currentUser.attachmentStyle as AttachmentStyle]
    : null;

  const loveLanguageInfo = currentUser?.loveLanguages?.[0]
    ? LOVE_LANGUAGE_DESCRIPTIONS[currentUser.loveLanguages[0] as LoveLanguage]
    : null;

  const handleShareResults = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const mbtiText = currentUser?.mbtiType ? `${currentUser.mbtiType} - ${mbtiInfo?.title}` : '';
    const attachmentText = attachmentInfo?.title || '';
    const loveLanguageText = loveLanguageInfo?.title || '';

    const shareMessage = `My InnerMatchEQ Relationship Profile:

${mbtiText ? `🧠 ${mbtiText}` : ''}
${attachmentText ? `🛡️ ${attachmentText}` : ''}
${loveLanguageText ? `💕 ${loveLanguageText}` : ''}
✨ EQ Score: ${currentUser?.emotionalIntelligence || 75}/100

Discover YOUR relationship personality!
www.innermatcheq.com/quiz?ref=${referralCode}

#InnerMatchEQ #RelationshipGoals #PersonalityTest`;

    try {
      await Share.share({
        message: shareMessage,
        title: 'My InnerMatchEQ Results',
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleInviteFriends = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const shareMessage = `I just discovered my relationship personality on InnerMatchEQ! 🔮

Find out your:
✨ Attachment Style - how you bond
🧠 Personality Type (MBTI) - how you think
💕 Love Language - how you express love
📊 Compatibility Score - who matches you

The more friends who join, the better our matches get!

Take the quiz: www.innermatcheq.com/quiz?ref=${referralCode}`;

    try {
      await Share.share({
        message: shareMessage,
        title: 'Join Me on InnerMatchEQ!',
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  return (
    <View className="flex-1 bg-[#FDF8F5]">
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="flex-row items-center px-6 py-4">
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/');
              }
            }}
            className="w-12 h-12 items-center justify-center rounded-full bg-white/80 active:scale-95"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={24} color="#2D3436" />
          </Pressable>
          <Text
            className="flex-1 text-xl text-[#2D3436] text-center"
            style={{ fontFamily: 'Cormorant_600SemiBold' }}
          >
            My Personality
          </Text>
          <View className="w-12" />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Quick Intro */}
          <Animated.View entering={FadeIn.duration(400)} className="mb-4">
            <Text
              className="text-sm text-[#636E72] text-center"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              Quick overview of your relationship personality. Tap any card to explore deeper insights.
            </Text>
          </Animated.View>
          {/* EQ Score */}
          <Animated.View entering={FadeIn.duration(500)} className="mb-6">
            <LinearGradient
              colors={['#E07A5F', '#D56A4F']}
              style={{ borderRadius: 24, padding: 24 }}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text
                    className="text-white/80 text-sm"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    Your Emotional Intelligence
                  </Text>
                  <View className="flex-row items-baseline mt-1">
                    <Text
                      className="text-5xl text-white"
                      style={{ fontFamily: 'Outfit_700Bold' }}
                    >
                      {currentUser?.emotionalIntelligence || 75}
                    </Text>
                    <Text
                      className="text-white/60 text-lg ml-1"
                      style={{ fontFamily: 'Outfit_400Regular' }}
                    >
                      /100
                    </Text>
                  </View>
                </View>
                <View className="w-20 h-20 rounded-full bg-white/20 items-center justify-center">
                  <Sparkles size={32} color="#FFF" />
                </View>
              </View>

              {/* EQ Score Explanation */}
              <View className="mt-4 pt-4 border-t border-white/20">
                <Text
                  className="text-white text-sm mb-2"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  What This Means
                </Text>
                <Text
                  className="text-white/90 text-sm mb-3"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  {(currentUser?.emotionalIntelligence || 75) >= 80
                    ? "Exceptional EQ! You naturally understand emotions, navigate conflict well, and create deep connections. Partners will value your emotional depth."
                    : (currentUser?.emotionalIntelligence || 75) >= 60
                    ? "Strong EQ foundation. You're self-aware and empathetic. With practice, you can become even better at reading subtle emotional cues."
                    : "Growing your EQ. You're building awareness of emotions in relationships. Focus on active listening and expressing feelings openly."}
                </Text>

                {/* EQ Breakdown */}
                <View className="flex-row gap-2">
                  <View className="flex-1 bg-white/15 rounded-lg p-2">
                    <Text className="text-white/60 text-[10px]" style={{ fontFamily: 'Outfit_500Medium' }}>
                      SELF-AWARENESS
                    </Text>
                    <Text className="text-white text-sm" style={{ fontFamily: 'Outfit_600SemiBold' }}>
                      {Math.min(100, (currentUser?.emotionalIntelligence || 75) + 5)}%
                    </Text>
                  </View>
                  <View className="flex-1 bg-white/15 rounded-lg p-2">
                    <Text className="text-white/60 text-[10px]" style={{ fontFamily: 'Outfit_500Medium' }}>
                      EMPATHY
                    </Text>
                    <Text className="text-white text-sm" style={{ fontFamily: 'Outfit_600SemiBold' }}>
                      {Math.min(100, (currentUser?.emotionalIntelligence || 75) - 3)}%
                    </Text>
                  </View>
                  <View className="flex-1 bg-white/15 rounded-lg p-2">
                    <Text className="text-white/60 text-[10px]" style={{ fontFamily: 'Outfit_500Medium' }}>
                      REGULATION
                    </Text>
                    <Text className="text-white text-sm" style={{ fontFamily: 'Outfit_600SemiBold' }}>
                      {Math.min(100, (currentUser?.emotionalIntelligence || 75) + 2)}%
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* MBTI */}
          <InsightCard
            title={mbtiInfo?.title || 'Personality Type'}
            subtitle={currentUser?.mbtiType || 'Complete assessment'}
            icon={Brain}
            iconColor="#81B29A"
            iconBg="#81B29A15"
            index={0}
            onPress={() => router.push('/insight-mbti')}
          >
            {mbtiInfo && (
              <View>
                <Text
                  className="text-sm text-[#636E72] mb-4"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                  numberOfLines={2}
                >
                  {mbtiInfo.description}
                </Text>
                <Text
                  className="text-xs text-[#81B29A]"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Tap to explore in depth →
                </Text>
              </View>
            )}
          </InsightCard>

          {/* Attachment Style */}
          <InsightCard
            title={attachmentInfo?.title || 'Attachment Style'}
            subtitle="How you connect"
            icon={Shield}
            iconColor="#E07A5F"
            iconBg="#E07A5F15"
            index={1}
            onPress={() => router.push('/insight-attachment')}
          >
            {attachmentInfo && (
              <View>
                <Text
                  className="text-sm text-[#636E72] mb-4"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                  numberOfLines={2}
                >
                  {attachmentInfo.description}
                </Text>
                <Text
                  className="text-xs text-[#E07A5F]"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Tap to explore in depth →
                </Text>
              </View>
            )}
          </InsightCard>

          {/* Love Language */}
          <InsightCard
            title={loveLanguageInfo?.title || 'Love Language'}
            subtitle="How you express love"
            icon={Heart}
            iconColor="#D4A574"
            iconBg="#F2CC8F20"
            index={2}
            onPress={() => router.push('/insight-love-language')}
          >
            {loveLanguageInfo && (
              <View>
                <Text
                  className="text-sm text-[#636E72] mb-4"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                  numberOfLines={2}
                >
                  {loveLanguageInfo.description}
                </Text>
                <Text
                  className="text-xs text-[#D4A574]"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Tap to explore in depth →
                </Text>
              </View>
            )}
          </InsightCard>

          {/* Compatibility Analysis - Premium */}
          <InsightCard
            title="Compatibility Analysis"
            subtitle="See who matches best"
            icon={TrendingUp}
            iconColor="#81B29A"
            iconBg="#81B29A15"
            locked={!isPremium}
            index={3}
            onUnlock={handleUnlock}
            onPress={isPremium ? () => router.push('/insight-compatibility') : undefined}
          >
            <View>
              <CompatibilityBar label="Attachment Match" value={85} color="#E07A5F" />
              <CompatibilityBar label="MBTI Compatibility" value={78} color="#81B29A" />
              <CompatibilityBar label="Love Language Sync" value={92} color="#D4A574" />
              <CompatibilityBar label="Value Alignment" value={88} color="#636E72" />
            </View>
          </InsightCard>

          {/* Red Flag Analysis - Premium */}
          <InsightCard
            title="Red Flag Detection"
            subtitle="Stay safe while dating"
            icon={AlertTriangle}
            iconColor="#E07A5F"
            iconBg="#E07A5F15"
            locked={!isPremium}
            index={4}
            onUnlock={handleUnlock}
            onPress={isPremium ? () => router.push('/insight-red-flags') : undefined}
          >
            <View className="bg-[#81B29A]/10 rounded-xl p-4">
              <View className="flex-row items-center">
                <Shield size={20} color="#81B29A" />
                <Text
                  className="text-sm text-[#81B29A] ml-2"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  No red flags detected
                </Text>
              </View>
              <Text
                className="text-xs text-[#636E72] mt-2"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                We analyze behavior patterns to help you identify potential concerns early.
              </Text>
            </View>
          </InsightCard>

          {/* Ideal Partner - Premium */}
          <InsightCard
            title="Your Ideal Partner"
            subtitle="Based on psychological analysis"
            icon={Users}
            iconColor="#D4A574"
            iconBg="#F2CC8F20"
            locked={!isPremium}
            index={5}
            onUnlock={handleUnlock}
            onPress={isPremium ? () => router.push('/insight-ideal-partner') : undefined}
          >
            <View>
              <Text
                className="text-sm text-[#636E72] mb-3"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                Based on your personality profile, you're most compatible with:
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {['ENFP', 'INFJ', 'ENFJ'].map((type) => (
                  <Pressable
                    key={type}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push(`/insight-mbti?type=${type}`);
                    }}
                    className="bg-[#E07A5F]/10 rounded-full px-4 py-2 active:scale-95"
                  >
                    <Text
                      className="text-sm text-[#E07A5F]"
                      style={{ fontFamily: 'Outfit_600SemiBold' }}
                    >
                      {type}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </InsightCard>

          {/* Viral Share Section */}
          <Animated.View entering={FadeInDown.delay(600).duration(500)} className="px-4 mb-4">
            <View className="bg-gradient-to-br from-[#FFF7ED] to-[#FFFBF7] rounded-2xl p-5 border-2 border-[#F2CC8F]/40">
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 rounded-full bg-[#F2CC8F]/20 items-center justify-center">
                  <Trophy size={20} color="#D4A574" />
                </View>
                <View className="ml-3 flex-1">
                  <Text
                    className="text-base text-[#2D3436]"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    Grow Your Match Pool!
                  </Text>
                  <Text
                    className="text-xs text-[#636E72]"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    More users = better compatibility matches
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center bg-white/60 rounded-xl p-3 mb-4">
                <View className="flex-row -space-x-2 mr-3">
                  {['👩', '👨', '👩‍🦱', '👨‍🦳'].map((emoji, i) => (
                    <View
                      key={i}
                      className="w-7 h-7 rounded-full bg-[#F0E6E0] items-center justify-center border-2 border-white"
                    >
                      <Text className="text-xs">{emoji}</Text>
                    </View>
                  ))}
                </View>
                <Text
                  className="text-xs text-[#636E72] flex-1"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  <Text style={{ fontFamily: 'Outfit_600SemiBold', color: '#2D3436' }}>52,847 people</Text> took the quiz this week
                </Text>
              </View>

              <View className="flex-row gap-3">
                {(mbtiInfo || attachmentInfo) && (
                  <Pressable
                    onPress={handleShareResults}
                    className="flex-1 bg-[#E07A5F] rounded-xl py-3 flex-row items-center justify-center active:scale-[0.98]"
                  >
                    <Share2 size={16} color="#FFF" />
                    <Text
                      className="text-white text-sm ml-2"
                      style={{ fontFamily: 'Outfit_600SemiBold' }}
                    >
                      Share Results
                    </Text>
                  </Pressable>
                )}

                <Pressable
                  onPress={handleInviteFriends}
                  className="flex-1 bg-white rounded-xl py-3 flex-row items-center justify-center border border-[#E0D5CC] active:scale-[0.98]"
                >
                  <Gift size={16} color="#D4A574" />
                  <Text
                    className="text-[#D4A574] text-sm ml-2"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    Invite Friends
                  </Text>
                </Pressable>
              </View>

              <Text
                className="text-[10px] text-center text-[#A0A8AB] mt-3"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                When friends join, your matching algorithm gets smarter!
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
