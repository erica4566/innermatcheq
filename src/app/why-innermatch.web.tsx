/**
 * Web-specific Why InnerMatchEQ Page
 * Professional landing page explaining our value proposition
 */

import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import {
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
  ArrowRight,
} from 'lucide-react-native';
import WebNavigation from '@/components/WebNavigation';
import { BRAND_COLORS } from '@/lib/brand';

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
    color: '#D4626A',
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

export default function WhyInnerMatchWebScreen() {
  const router = useRouter();

  return (
    <WebNavigation>
      <ScrollView className="flex-1 bg-[#FDF8F5]" showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View className="bg-[#2D3436] py-20 px-6">
          <View style={{ maxWidth: 900, marginHorizontal: 'auto', width: '100%' }}>
            <Animated.View entering={FadeIn.duration(500)} className="items-center">
              <View className="w-24 h-24 rounded-full bg-[#D4626A]/20 items-center justify-center mb-6">
                <Heart size={48} color={BRAND_COLORS.primary} fill={BRAND_COLORS.primary} />
              </View>
              <Text
                className="text-4xl md:text-5xl text-white text-center mb-4"
                style={{ fontFamily: 'Cormorant_700Bold' }}
              >
                Dating Shouldn't Be a Guessing Game
              </Text>
              <Text
                className="text-lg text-[#94A3B8] text-center mb-8"
                style={{ fontFamily: 'Outfit_400Regular', maxWidth: 600 }}
              >
                Most apps show you faces. We show you{' '}
                <Text style={{ fontFamily: 'Outfit_600SemiBold', color: '#D4626A' }}>compatibility</Text>.
                InnerMatchEQ uses psychological science to help you find someone who truly fits—not just attracts.
              </Text>
              <Pressable
                onPress={() => router.push('/auth')}
                className="bg-[#D4626A] px-10 py-4 rounded-full flex-row items-center"
                style={{
                  shadowColor: BRAND_COLORS.primary,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.4,
                  shadowRadius: 16,
                }}
              >
                <Text className="text-white text-lg mr-2" style={{ fontFamily: 'Outfit_600SemiBold' }}>
                  Start Free Assessment
                </Text>
                <ArrowRight size={20} color="white" />
              </Pressable>
            </Animated.View>
          </View>
        </View>

        {/* The Problem Section */}
        <View className="py-16 px-6 bg-[#FEF2F2]">
          <View style={{ maxWidth: 800, marginHorizontal: 'auto', width: '100%' }}>
            <Animated.View entering={FadeInDown.delay(100).duration(500)}>
              <View className="flex-row items-center justify-center mb-6">
                <AlertTriangle size={28} color="#EF4444" />
                <Text
                  className="text-2xl text-[#991B1B] ml-3"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  The Problem with Other Apps
                </Text>
              </View>
              <View className="flex-row flex-wrap justify-center gap-4">
                {[
                  'Endless swiping with no real connection',
                  'Matches based on photos, not compatibility',
                  'No way to spot red flags before meeting',
                  'Ghosting and miscommunication',
                  "Surface-level connections that don't last",
                ].map((problem, index) => (
                  <View key={index} className="flex-row items-center bg-white rounded-full px-5 py-3">
                    <View className="w-2 h-2 rounded-full bg-[#EF4444] mr-3" />
                    <Text
                      className="text-sm text-[#7F1D1D]"
                      style={{ fontFamily: 'Outfit_500Medium' }}
                    >
                      {problem}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          </View>
        </View>

        {/* What Makes Us Different */}
        <View className="py-20 px-6 bg-white">
          <View style={{ maxWidth: 1100, marginHorizontal: 'auto', width: '100%' }}>
            <Text
              className="text-3xl text-[#2D3436] text-center mb-4"
              style={{ fontFamily: 'Cormorant_700Bold' }}
            >
              What Makes Us Different
            </Text>
            <Text
              className="text-lg text-[#636E72] text-center mb-12"
              style={{ fontFamily: 'Outfit_400Regular', maxWidth: 500, marginHorizontal: 'auto' }}
            >
              Science-backed features designed for meaningful connections
            </Text>

            <View className="flex-row flex-wrap justify-center gap-6">
              {DIFFERENTIATORS.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Animated.View
                    key={item.title}
                    entering={FadeInDown.delay((index + 2) * 100).duration(500)}
                    className="bg-[#FDF8F5] rounded-2xl p-6"
                    style={{ width: 280 }}
                  >
                    <View
                      className="w-14 h-14 rounded-xl items-center justify-center mb-4"
                      style={{ backgroundColor: `${item.color}15` }}
                    >
                      <Icon size={28} color={item.color} />
                    </View>
                    <Text
                      className="text-xl text-[#2D3436] mb-3"
                      style={{ fontFamily: 'Outfit_600SemiBold' }}
                    >
                      {item.title}
                    </Text>
                    <Text
                      className="text-sm text-[#636E72] mb-4 leading-6"
                      style={{ fontFamily: 'Outfit_400Regular' }}
                    >
                      {item.description}
                    </Text>
                    <View className="bg-white rounded-xl px-4 py-3">
                      <Text
                        className="text-sm italic"
                        style={{ fontFamily: 'Outfit_500Medium', color: item.color }}
                      >
                        "{item.comparison}"
                      </Text>
                    </View>
                  </Animated.View>
                );
              })}
            </View>
          </View>
        </View>

        {/* How It Works */}
        <View className="py-20 px-6 bg-[#FDF8F5]">
          <View style={{ maxWidth: 800, marginHorizontal: 'auto', width: '100%' }}>
            <Text
              className="text-3xl text-[#2D3436] text-center mb-4"
              style={{ fontFamily: 'Cormorant_700Bold' }}
            >
              How It Works
            </Text>
            <Text
              className="text-lg text-[#636E72] text-center mb-12"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              Four simple steps to meaningful connections
            </Text>

            <Animated.View entering={FadeInDown.delay(600).duration(500)}>
              <View
                className="bg-white rounded-2xl p-8"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.05,
                  shadowRadius: 16,
                }}
              >
                {HOW_IT_WORKS.map((step, index) => {
                  const Icon = step.icon;
                  const isLast = index === HOW_IT_WORKS.length - 1;
                  return (
                    <View key={step.step} className="flex-row">
                      <View className="items-center mr-6">
                        <View className="w-12 h-12 rounded-full bg-[#D4626A] items-center justify-center">
                          <Text
                            className="text-white text-lg"
                            style={{ fontFamily: 'Outfit_700Bold' }}
                          >
                            {step.step}
                          </Text>
                        </View>
                        {!isLast && (
                          <View className="w-0.5 flex-1 bg-[#D4626A]/20 my-3" />
                        )}
                      </View>
                      <View className={`flex-1 ${!isLast ? 'pb-8' : ''}`}>
                        <View className="flex-row items-center mb-2">
                          <Icon size={18} color="#81B29A" />
                          <Text
                            className="text-lg text-[#2D3436] ml-2"
                            style={{ fontFamily: 'Outfit_600SemiBold' }}
                          >
                            {step.title}
                          </Text>
                        </View>
                        <Text
                          className="text-base text-[#636E72] leading-6"
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
          </View>
        </View>

        {/* What You Get */}
        <View className="py-20 px-6 bg-white">
          <View style={{ maxWidth: 800, marginHorizontal: 'auto', width: '100%' }}>
            <Text
              className="text-3xl text-[#2D3436] text-center mb-4"
              style={{ fontFamily: 'Cormorant_700Bold' }}
            >
              What You Get
            </Text>
            <Text
              className="text-lg text-[#636E72] text-center mb-12"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              Everything you need for smarter dating
            </Text>

            <Animated.View entering={FadeInDown.delay(700).duration(500)}>
              <View
                className="bg-[#81B29A]/10 rounded-2xl p-8 border border-[#81B29A]/30"
              >
                <View className="flex-row flex-wrap gap-4">
                  {WHAT_YOU_GET.map((item, index) => (
                    <View key={index} className="flex-row items-start" style={{ width: '48%', minWidth: 280 }}>
                      <CheckCircle2 size={20} color="#81B29A" style={{ marginTop: 2 }} />
                      <Text
                        className="text-base text-[#2D3436] flex-1 ml-3"
                        style={{ fontFamily: 'Outfit_400Regular' }}
                      >
                        {item}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </Animated.View>
          </View>
        </View>

        {/* Privacy Note */}
        <View className="py-16 px-6 bg-[#FDF8F5]">
          <View style={{ maxWidth: 700, marginHorizontal: 'auto', width: '100%' }}>
            <Animated.View entering={FadeInDown.delay(800).duration(500)}>
              <View
                className="bg-white rounded-2xl p-8 flex-row items-start"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.05,
                  shadowRadius: 16,
                }}
              >
                <View className="w-14 h-14 rounded-full bg-[#636E72]/10 items-center justify-center mr-6">
                  <Lock size={24} color="#636E72" />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-xl text-[#2D3436] mb-2"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    Your Privacy Matters
                  </Text>
                  <Text
                    className="text-base text-[#636E72] leading-6"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    Your psychological assessment is private. We use it to find compatible matches, but never share the raw data. You control what potential matches see about you.
                  </Text>
                </View>
              </View>
            </Animated.View>
          </View>
        </View>

        {/* CTA Section */}
        <View className="py-20 px-6 bg-[#2D3436]">
          <View style={{ maxWidth: 700, marginHorizontal: 'auto', width: '100%' }} className="items-center">
            <Text
              className="text-3xl text-white text-center mb-4"
              style={{ fontFamily: 'Cormorant_700Bold' }}
            >
              Ready to Find Real Connection?
            </Text>
            <Text
              className="text-lg text-[#94A3B8] text-center mb-8"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              Join thousands discovering meaningful relationships through emotional intelligence.
            </Text>
            <Pressable
              onPress={() => router.push('/auth')}
              className="bg-[#D4626A] px-10 py-4 rounded-full flex-row items-center mb-4"
              style={{
                shadowColor: BRAND_COLORS.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
              }}
            >
              <Text className="text-white text-lg mr-2" style={{ fontFamily: 'Outfit_600SemiBold' }}>
                Get Started Free
              </Text>
              <ArrowRight size={20} color="white" />
            </Pressable>
            <Text
              className="text-sm text-[#636E72]"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              No credit card required. Start your assessment today.
            </Text>
          </View>
        </View>
      </ScrollView>
    </WebNavigation>
  );
}
