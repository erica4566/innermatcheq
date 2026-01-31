/**
 * Web Landing Page - InnerMatchEQ
 *
 * Complete website homepage with:
 * - Hero section with CTA
 * - Features overview
 * - How it works section
 * - Testimonials
 * - Final CTA
 */

import React from 'react';
import { View, Text, Pressable, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
} from 'react-native-reanimated';
import {
  Heart,
  Brain,
  Shield,
  Sparkles,
  Users,
  ArrowRight,
  MessageCircle,
  Zap,
  Eye,
  Quote,
  Target,
} from 'lucide-react-native';
import { BRAND_COLORS } from '@/lib/brand';
import WebNavigation from '@/components/WebNavigation';

// Feature data
const FEATURES = [
  {
    icon: Heart,
    color: BRAND_COLORS.primary,
    title: 'Attachment Style Analysis',
    description: 'Understand your attachment pattern and how it affects your relationships. Find partners with compatible attachment styles.',
  },
  {
    icon: Brain,
    color: BRAND_COLORS.secondary,
    title: 'MBTI Compatibility',
    description: 'Discover your personality type and connect with people whose traits complement yours for deeper understanding.',
  },
  {
    icon: MessageCircle,
    color: BRAND_COLORS.accent,
    title: 'Love Languages',
    description: 'Learn how you give and receive love. Match with people who speak your love language.',
  },
  {
    icon: Shield,
    color: '#DC4A5A',
    title: 'Red Flag Detection',
    description: 'AI-powered analysis helps identify potential compatibility issues and warning signs early.',
  },
  {
    icon: Zap,
    color: '#10B981',
    title: 'EQ Assessment',
    description: 'Measure emotional intelligence for more fulfilling, empathetic relationships.',
  },
  {
    icon: Eye,
    color: '#8B5CF6',
    title: 'Deep Insights',
    description: 'Get personalized growth recommendations based on your unique psychological profile.',
  },
];

const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Take the Assessment',
    description: 'Complete our research-backed assessments covering attachment style, MBTI, love languages, and emotional intelligence.',
    icon: Target,
  },
  {
    step: 2,
    title: 'Discover Your Profile',
    description: 'Get detailed insights about yourself—understand why you connect the way you do.',
    icon: Sparkles,
  },
  {
    step: 3,
    title: 'Find Compatible Matches',
    description: 'Connect with people whose psychological profiles complement yours for lasting compatibility.',
    icon: Users,
  },
];

const TESTIMONIALS = [
  {
    quote: "Finally, a dating app that gets it right. The compatibility scores actually mean something!",
    name: "Sarah M.",
    detail: "Found her partner in 3 weeks",
  },
  {
    quote: "Understanding my attachment style changed everything. I'm now in the healthiest relationship of my life.",
    name: "Michael R.",
    detail: "Secure attachment journey",
  },
  {
    quote: "The red flag detection saved me from making the same mistakes. This app truly cares about your wellbeing.",
    name: "Jessica K.",
    detail: "Dating with confidence",
  },
];

export default function WebLandingPage() {
  const router = useRouter();

  // NOTE: For the website landing page, we intentionally do NOT redirect users.
  // The website homepage should always be accessible as a marketing/landing page.
  // Users can click "Get Started" or "Sign In" to proceed to auth.
  // This prevents issues with stale AsyncStorage state causing unwanted redirects.

  return (
    <WebNavigation>
      <ScrollView className="flex-1 bg-[#FDF8F5]" showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View className="py-20 md:py-28 px-6">
          <View style={{ maxWidth: 1000, marginHorizontal: 'auto', width: '100%' }} className="items-center">
            <Animated.View entering={FadeInDown.delay(100).springify()}>
              <View className="bg-[#D4626A]/10 px-4 py-2 rounded-full mb-6">
                <Text
                  className="text-sm text-[#D4626A]"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Psychology-Based Dating
                </Text>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(150).springify()}>
              <Text
                className="text-4xl md:text-5xl lg:text-6xl text-[#2D3436] text-center mb-6"
                style={{ fontFamily: 'Cormorant_700Bold', lineHeight: 64 }}
              >
                Discover Yourself.{'\n'}Find Your Match.
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200).springify()}>
              <Text
                className="text-lg md:text-xl text-[#636E72] text-center mb-10"
                style={{ fontFamily: 'Outfit_400Regular', maxWidth: 600 }}
              >
                A relationship app that goes deeper than looks. Understand your attachment style,
                love languages, and emotional intelligence to find truly compatible connections.
              </Text>
            </Animated.View>

            <Animated.View
              entering={FadeInUp.delay(300).springify()}
              className="flex-row items-center gap-4 flex-wrap justify-center"
            >
              <Pressable
                onPress={() => router.push('/auth')}
                className="flex-row items-center px-8 py-4 rounded-full"
                style={{
                  backgroundColor: BRAND_COLORS.primary,
                  shadowColor: BRAND_COLORS.primary,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                }}
              >
                <Text className="text-white text-lg mr-2" style={{ fontFamily: 'Outfit_600SemiBold' }}>
                  Start Free Assessment
                </Text>
                <ArrowRight size={20} color="white" />
              </Pressable>

              <Pressable
                onPress={() => router.push('/why-innermatch')}
                className="px-8 py-4 rounded-full border-2 border-[#E8E4E0]"
              >
                <Text className="text-[#2D3436] text-lg" style={{ fontFamily: 'Outfit_500Medium' }}>
                  Learn More
                </Text>
              </Pressable>
            </Animated.View>

            {/* Trust Indicators */}
            <Animated.View
              entering={FadeIn.delay(500)}
              className="flex-row items-center justify-center gap-8 mt-14 flex-wrap"
            >
              <TrustBadge icon={Shield} label="Privacy First" color={BRAND_COLORS.secondary} />
              <TrustBadge icon={Sparkles} label="AI-Powered Insights" color={BRAND_COLORS.accent} />
              <TrustBadge icon={Users} label="10,000+ Matches" color={BRAND_COLORS.primary} />
            </Animated.View>
          </View>
        </View>

        {/* Features Section */}
        <View className="bg-white py-20 md:py-28 px-6">
          <View style={{ maxWidth: 1200, marginHorizontal: 'auto', width: '100%' }}>
            <Animated.View entering={FadeInDown.delay(100)} className="items-center mb-14">
              <Text
                className="text-3xl md:text-4xl text-[#2D3436] text-center mb-4"
                style={{ fontFamily: 'Cormorant_700Bold' }}
              >
                Science-Backed Matching
              </Text>
              <Text
                className="text-lg text-[#636E72] text-center"
                style={{ fontFamily: 'Outfit_400Regular', maxWidth: 500 }}
              >
                Our assessments are based on decades of relationship psychology research.
              </Text>
            </Animated.View>

            <View className="flex-row flex-wrap justify-center gap-6">
              {FEATURES.map((feature, index) => (
                <FeatureCard key={feature.title} feature={feature} index={index} />
              ))}
            </View>
          </View>
        </View>

        {/* How It Works */}
        <View className="py-20 md:py-28 px-6 bg-[#FDF8F5]">
          <View style={{ maxWidth: 900, marginHorizontal: 'auto', width: '100%' }}>
            <Animated.View entering={FadeInDown.delay(100)} className="items-center mb-14">
              <Text
                className="text-3xl md:text-4xl text-[#2D3436] text-center mb-4"
                style={{ fontFamily: 'Cormorant_700Bold' }}
              >
                How It Works
              </Text>
              <Text
                className="text-lg text-[#636E72] text-center"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                Three simple steps to meaningful connections
              </Text>
            </Animated.View>

            <View className="gap-6">
              {HOW_IT_WORKS.map((step, index) => (
                <StepCard key={step.step} step={step} index={index} />
              ))}
            </View>
          </View>
        </View>

        {/* Testimonials */}
        <View className="py-20 md:py-28 px-6 bg-white">
          <View style={{ maxWidth: 1100, marginHorizontal: 'auto', width: '100%' }}>
            <Animated.View entering={FadeInDown.delay(100)} className="items-center mb-14">
              <Text
                className="text-3xl md:text-4xl text-[#2D3436] text-center mb-4"
                style={{ fontFamily: 'Cormorant_700Bold' }}
              >
                Real Stories, Real Connections
              </Text>
              <Text
                className="text-lg text-[#636E72] text-center"
                style={{ fontFamily: 'Outfit_400Regular', maxWidth: 500 }}
              >
                Hear from people who found their match through emotional intelligence.
              </Text>
            </Animated.View>

            <View className="flex-row flex-wrap justify-center gap-6">
              {TESTIMONIALS.map((testimonial, index) => (
                <TestimonialCard key={testimonial.name} testimonial={testimonial} index={index} />
              ))}
            </View>
          </View>
        </View>

        {/* Final CTA */}
        <View className="py-20 md:py-28 px-6">
          <LinearGradient
            colors={['#2D3436', '#1A1D1F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              maxWidth: 1000,
              marginHorizontal: 'auto',
              width: '100%',
              borderRadius: 32,
              padding: 48,
              paddingVertical: 64,
            }}
          >
            <View className="items-center">
              <Animated.View entering={FadeInDown.delay(100)} className="items-center">
                <View className="w-20 h-20 rounded-full bg-[#D4626A]/20 items-center justify-center mb-6">
                  <Heart size={40} color={BRAND_COLORS.primary} fill={BRAND_COLORS.primary} />
                </View>
                <Text
                  className="text-3xl md:text-4xl text-white text-center mb-4"
                  style={{ fontFamily: 'Cormorant_700Bold' }}
                >
                  Ready to Find Your Match?
                </Text>
                <Text
                  className="text-lg text-[#94A3B8] text-center mb-8"
                  style={{ fontFamily: 'Outfit_400Regular', maxWidth: 500 }}
                >
                  Join thousands discovering meaningful relationships through emotional intelligence.
                </Text>
                <Pressable
                  onPress={() => router.push('/auth')}
                  className="flex-row items-center px-10 py-4 rounded-full"
                  style={{
                    backgroundColor: BRAND_COLORS.primary,
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
                  className="text-sm text-[#636E72] mt-6"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  No credit card required. Free assessment included.
                </Text>
              </Animated.View>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </WebNavigation>
  );
}

// Components
function TrustBadge({ icon: Icon, label, color }: { icon: typeof Shield; label: string; color: string }) {
  return (
    <View className="flex-row items-center bg-white px-4 py-2 rounded-full border border-[#E8E4E0]">
      <Icon size={18} color={color} />
      <Text className="text-[#636E72] text-sm ml-2" style={{ fontFamily: 'Outfit_500Medium' }}>
        {label}
      </Text>
    </View>
  );
}

function FeatureCard({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  const Icon = feature.icon;
  return (
    <Animated.View
      entering={FadeInUp.delay(index * 80 + 200).springify()}
      className="bg-[#FDF8F5] rounded-2xl p-6"
      style={{ width: 350 }}
    >
      <View
        className="w-14 h-14 rounded-xl items-center justify-center mb-4"
        style={{ backgroundColor: `${feature.color}15` }}
      >
        <Icon size={28} color={feature.color} />
      </View>
      <Text className="text-xl text-[#2D3436] mb-3" style={{ fontFamily: 'Outfit_600SemiBold' }}>
        {feature.title}
      </Text>
      <Text className="text-[#636E72] leading-6" style={{ fontFamily: 'Outfit_400Regular' }}>
        {feature.description}
      </Text>
    </Animated.View>
  );
}

function StepCard({ step, index }: { step: typeof HOW_IT_WORKS[0]; index: number }) {
  const Icon = step.icon;
  return (
    <Animated.View
      entering={FadeInUp.delay(index * 100 + 200).springify()}
      className="bg-white rounded-2xl p-6 flex-row items-start"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 16,
      }}
    >
      <View
        className="w-14 h-14 rounded-full items-center justify-center mr-5"
        style={{ backgroundColor: BRAND_COLORS.primary }}
      >
        <Text className="text-white text-xl" style={{ fontFamily: 'Outfit_700Bold' }}>
          {step.step}
        </Text>
      </View>
      <View className="flex-1">
        <View className="flex-row items-center mb-2">
          <Icon size={18} color={BRAND_COLORS.secondary} />
          <Text className="text-xl text-[#2D3436] ml-2" style={{ fontFamily: 'Outfit_600SemiBold' }}>
            {step.title}
          </Text>
        </View>
        <Text className="text-[#636E72] leading-6" style={{ fontFamily: 'Outfit_400Regular' }}>
          {step.description}
        </Text>
      </View>
    </Animated.View>
  );
}

function TestimonialCard({ testimonial, index }: { testimonial: typeof TESTIMONIALS[0]; index: number }) {
  return (
    <Animated.View
      entering={FadeInUp.delay(index * 100 + 200).springify()}
      className="bg-[#FDF8F5] rounded-2xl p-6"
      style={{ width: 340 }}
    >
      <Quote size={24} color={BRAND_COLORS.primary} style={{ opacity: 0.3, marginBottom: 12 }} />
      <Text
        className="text-[#2D3436] text-base leading-7 mb-6"
        style={{ fontFamily: 'Outfit_400Regular' }}
      >
        "{testimonial.quote}"
      </Text>
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-full bg-[#D4626A]/20 items-center justify-center mr-3">
          <Text className="text-[#D4626A] text-sm" style={{ fontFamily: 'Outfit_600SemiBold' }}>
            {testimonial.name.charAt(0)}
          </Text>
        </View>
        <View>
          <Text className="text-[#2D3436] text-sm" style={{ fontFamily: 'Outfit_600SemiBold' }}>
            {testimonial.name}
          </Text>
          <Text className="text-[#94A3B8] text-xs" style={{ fontFamily: 'Outfit_400Regular' }}>
            {testimonial.detail}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}
