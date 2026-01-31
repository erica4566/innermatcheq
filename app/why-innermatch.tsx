import React from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Brain,
  Shield,
  Heart,
  Target,
  AlertTriangle,
  Users,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  MessageCircle,
  Lock,
  Eye,
  Zap,
} from 'lucide-react-native';
import * as Haptics from '@/lib/haptics';

const { width } = Dimensions.get('window');

const DIFFERENTIATORS = [
  {
    icon: Brain,
    color: '#81B29A',
    title: 'Psychology-Based Matching',
    description: 'We go beyond photos and bios. Our matching algorithm uses validated psychological frameworks including attachment theory, MBTI, and love languages to find truly compatible partners.',
    comparison: 'Other apps match on looks. We match on how you love.',
  },
  {
    icon: Shield,
    color: '#E07A5F',
    title: 'Red Flag Detection',
    description: 'Our system analyzes behavioral patterns to help you identify potential warning signs before you get emotionally invested. Learn to recognize love bombing, manipulation tactics, and inconsistent behavior.',
    comparison: 'Other apps leave you guessing. We help you stay safe.',
  },
  {
    icon: Heart,
    color: '#D4A574',
    title: 'Emotional Intelligence Focus',
    description: 'Your EQ Score measures self-awareness, empathy, and emotional regulation. Higher EQ users form more lasting connections and navigate relationship challenges better.',
    comparison: 'Other apps measure popularity. We measure relationship readiness.',
  },
  {
    icon: Target,
    color: '#9333EA',
    title: 'Compatibility, Not Chemistry',
    description: 'Chemistry fades. Compatibility endures. We match you with people who share your values, communication style, and relationship goals—the foundations of lasting love.',
    comparison: 'Other apps chase sparks. We build foundations.',
  },
];

const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Take the Assessment',
    description: 'A 5-minute assessment reveals your attachment style, personality type, and love languages.',
    icon: Sparkles,
  },
  {
    step: 2,
    title: 'Get Matched Intelligently',
    description: 'Our algorithm finds people whose psychological profiles complement yours.',
    icon: Users,
  },
  {
    step: 3,
    title: 'Connect with Confidence',
    description: 'See compatibility scores and shared values before you even message.',
    icon: MessageCircle,
  },
  {
    step: 4,
    title: 'Grow Together',
    description: 'Access relationship insights, red flag guides, and communication tools.',
    icon: TrendingUp,
  },
];

const WHAT_YOU_GET = [
  'Personalized compatibility scores for every match',
  'Detailed personality insights (MBTI, attachment style)',
  'Love language analysis for better communication',
  'Red flag detection and relationship safety guides',
  'AI-powered conversation starters based on shared interests',
  'Video dating with scheduled calls',
  'Premium reports on ideal partner profiles',
  'Community reviews for accountability',
];

export default function WhyInnerMatchScreen() {
  const router = useRouter();

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
            Why InnerMatchEQ?
          </Text>
          <View className="w-12" />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <Animated.View entering={FadeIn.duration(500)} className="mb-8">
            <LinearGradient
              colors={['#E07A5F', '#D56A4F']}
              style={{ borderRadius: 24, padding: 24 }}
            >
              <View className="items-center">
                <View className="w-20 h-20 rounded-full bg-white/20 items-center justify-center mb-4">
                  <Heart size={40} color="#FFF" fill="#FFF" />
                </View>
                <Text
                  className="text-2xl text-white text-center mb-2"
                  style={{ fontFamily: 'Cormorant_700Bold' }}
                >
                  Dating Shouldn't Be a Guessing Game
                </Text>
                <Text
                  className="text-white/90 text-center text-base leading-6"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  Most apps show you faces. We show you{' '}
                  <Text style={{ fontFamily: 'Outfit_600SemiBold' }}>compatibility</Text>.
                  InnerMatchEQ uses psychological science to help you find someone who truly fits—not just attracts.
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* The Problem Section */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)} className="mb-8">
            <View className="bg-[#FEF2F2] rounded-2xl p-5 border border-[#FECACA]">
              <View className="flex-row items-center mb-3">
                <AlertTriangle size={20} color="#EF4444" />
                <Text
                  className="text-base text-[#991B1B] ml-2"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  The Problem with Other Apps
                </Text>
              </View>
              <View className="gap-2">
                {[
                  'Endless swiping with no real connection',
                  'Matches based on photos, not compatibility',
                  'No way to spot red flags before meeting',
                  'Ghosting and miscommunication',
                  "Surface-level connections that don't last",
                ].map((problem, index) => (
                  <View key={index} className="flex-row items-center">
                    <View className="w-1.5 h-1.5 rounded-full bg-[#EF4444] mr-3" />
                    <Text
                      className="text-sm text-[#7F1D1D] flex-1"
                      style={{ fontFamily: 'Outfit_400Regular' }}
                    >
                      {problem}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* What Makes Us Different */}
          <Text
            className="text-sm text-[#A0A8AB] mb-4"
            style={{ fontFamily: 'Outfit_600SemiBold' }}
          >
            WHAT MAKES US DIFFERENT
          </Text>

          {DIFFERENTIATORS.map((item, index) => {
            const Icon = item.icon;
            return (
              <Animated.View
                key={item.title}
                entering={FadeInDown.delay((index + 2) * 100).duration(500)}
                className="mb-4"
              >
                <View className="bg-white rounded-2xl p-5 shadow-sm shadow-black/5">
                  <View className="flex-row items-start mb-3">
                    <View
                      className="w-12 h-12 rounded-xl items-center justify-center"
                      style={{ backgroundColor: `${item.color}15` }}
                    >
                      <Icon size={24} color={item.color} />
                    </View>
                    <View className="flex-1 ml-4">
                      <Text
                        className="text-lg text-[#2D3436]"
                        style={{ fontFamily: 'Outfit_600SemiBold' }}
                      >
                        {item.title}
                      </Text>
                    </View>
                  </View>
                  <Text
                    className="text-sm text-[#636E72] mb-3 leading-5"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    {item.description}
                  </Text>
                  <View className="bg-[#F5F0ED] rounded-xl px-4 py-3">
                    <Text
                      className="text-sm text-[#E07A5F] italic"
                      style={{ fontFamily: 'Outfit_500Medium' }}
                    >
                      "{item.comparison}"
                    </Text>
                  </View>
                </View>
              </Animated.View>
            );
          })}

          {/* How It Works */}
          <Animated.View entering={FadeInDown.delay(600).duration(500)} className="mb-8">
            <Text
              className="text-sm text-[#A0A8AB] mb-4"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              HOW IT WORKS
            </Text>

            <View className="bg-white rounded-2xl p-5 shadow-sm shadow-black/5">
              {HOW_IT_WORKS.map((step, index) => {
                const Icon = step.icon;
                const isLast = index === HOW_IT_WORKS.length - 1;
                return (
                  <View key={step.step} className="flex-row">
                    {/* Timeline */}
                    <View className="items-center mr-4">
                      <View className="w-10 h-10 rounded-full bg-[#E07A5F] items-center justify-center">
                        <Text
                          className="text-white text-base"
                          style={{ fontFamily: 'Outfit_700Bold' }}
                        >
                          {step.step}
                        </Text>
                      </View>
                      {!isLast && (
                        <View className="w-0.5 flex-1 bg-[#E07A5F]/20 my-2" />
                      )}
                    </View>

                    {/* Content */}
                    <View className={`flex-1 ${!isLast ? 'pb-6' : ''}`}>
                      <View className="flex-row items-center mb-1">
                        <Icon size={16} color="#81B29A" />
                        <Text
                          className="text-base text-[#2D3436] ml-2"
                          style={{ fontFamily: 'Outfit_600SemiBold' }}
                        >
                          {step.title}
                        </Text>
                      </View>
                      <Text
                        className="text-sm text-[#636E72]"
                        style={{ fontFamily: 'Outfit_400Regular' }}
                      >
                        {step.description}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </Animated.View>

          {/* What You Get */}
          <Animated.View entering={FadeInDown.delay(700).duration(500)} className="mb-8">
            <Text
              className="text-sm text-[#A0A8AB] mb-4"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              WHAT YOU GET
            </Text>

            <View className="bg-[#81B29A]/10 rounded-2xl p-5 border border-[#81B29A]/30">
              <View className="gap-3">
                {WHAT_YOU_GET.map((item, index) => (
                  <View key={index} className="flex-row items-start">
                    <CheckCircle2 size={18} color="#81B29A" className="mt-0.5" />
                    <Text
                      className="text-sm text-[#2D3436] flex-1 ml-3"
                      style={{ fontFamily: 'Outfit_400Regular' }}
                    >
                      {item}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Privacy Note */}
          <Animated.View entering={FadeInDown.delay(800).duration(500)} className="mb-8">
            <View className="bg-white rounded-2xl p-5 shadow-sm shadow-black/5">
              <View className="flex-row items-center mb-3">
                <Lock size={20} color="#636E72" />
                <Text
                  className="text-base text-[#2D3436] ml-3"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Your Privacy Matters
                </Text>
              </View>
              <Text
                className="text-sm text-[#636E72] leading-5"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                Your psychological assessment is private. We use it to find compatible matches, but never share the raw data. You control what potential matches see about you.
              </Text>
            </View>
          </Animated.View>

          {/* CTA */}
          <Animated.View entering={FadeInUp.delay(900).duration(500)}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push('/auth');
              }}
              className="active:scale-[0.98]"
            >
              <LinearGradient
                colors={['#E07A5F', '#D56A4F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 16,
                  paddingVertical: 18,
                  alignItems: 'center',
                }}
              >
                <Text
                  className="text-white text-lg"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Get Started Free
                </Text>
              </LinearGradient>
            </Pressable>

            <Text
              className="text-xs text-[#A0A8AB] text-center mt-4"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              No credit card required. Start your assessment today.
            </Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
