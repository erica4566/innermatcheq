import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  AlertTriangle,
  Shield,
  CheckCircle2,
  XCircle,
  Eye,
  MessageCircle,
  Heart,
  Lock,
  TrendingUp,
  HelpCircle,
  Lightbulb,
} from 'lucide-react-native';
import * as Haptics from '@/lib/haptics';
import { useAppStore } from '@/lib/store';

// Red flag categories and warning signs - clearer, more actionable
const RED_FLAG_CATEGORIES = [
  {
    id: 'loveBombing',
    title: 'Love Bombing',
    icon: Heart,
    color: '#E07A5F',
    description: 'Intense affection too fast, often used to create emotional dependency',
    signs: [
      'Constantly says "I\'ve never felt this way" within days of meeting',
      'Wants to be exclusive after just 1-2 dates',
      'Texts/calls excessively and gets upset if you don\'t respond immediately',
      'Gives expensive gifts or grand gestures very early',
      'Talks about the future (moving in, marriage) within weeks',
    ],
    whatToDo: 'Slow things down. A healthy connection can wait. If they respect your pace, that\'s a good sign. If they push back, that tells you something.',
    healthyAlternative: 'Genuine interest builds gradually—they\'re curious about your life, remember details, and show up consistently over time without rushing.',
  },
  {
    id: 'manipulation',
    title: 'Manipulation Patterns',
    icon: MessageCircle,
    color: '#9333EA',
    description: 'Tactics that make you question yourself or feel responsible for their emotions',
    signs: [
      '"That never happened" or "You\'re remembering it wrong" (gaslighting)',
      'Every problem somehow becomes your fault',
      '"If you loved me, you would..." (guilt-tripping)',
      'Punishes you with silence when upset instead of communicating',
      'Twists your words to mean something you didn\'t intend',
    ],
    whatToDo: 'Trust your memory and feelings. Keep a journal if you\'re starting to doubt yourself. Talk to trusted friends about what\'s happening.',
    healthyAlternative: 'Healthy partners say "I was wrong" when they mess up, ask clarifying questions instead of assuming, and talk through problems directly.',
  },
  {
    id: 'control',
    title: 'Controlling Behavior',
    icon: Lock,
    color: '#EF4444',
    description: 'Actions that limit your freedom or isolate you from your support system',
    signs: [
      'Wants access to your phone, email, or social media accounts',
      'Criticizes your friends or makes it hard for you to see them',
      'Comments negatively on what you wear, eat, or how you spend money',
      'Makes you feel like you need permission to make decisions',
      'Gets jealous about normal interactions (talking to coworkers, etc.)',
    ],
    whatToDo: 'Maintain your friendships and independence. A partner who truly cares wants you to have a full life, not just a life with them.',
    healthyAlternative: 'Healthy partners encourage your friendships, respect your privacy, and trust you—even when you\'re apart.',
  },
  {
    id: 'inconsistency',
    title: 'Hot and Cold Patterns',
    icon: TrendingUp,
    color: '#F97316',
    description: 'Unpredictable behavior that keeps you off-balance and anxious',
    signs: [
      'Very attentive one week, then distant the next without explanation',
      'Makes plans enthusiastically, then cancels or doesn\'t show up',
      'Different person around friends vs. when you\'re alone',
      'Keeps you guessing about where you stand',
      'Apologizes and promises change but behavior repeats',
    ],
    whatToDo: 'Pay attention to patterns, not just promises. Words mean little without consistent actions backing them up over time.',
    healthyAlternative: 'You should feel secure, not anxious. A good partner is reliably themselves and follows through on what they say.',
  },
];

// Self-reflection questions for those in potentially dysfunctional relationships
const SELF_REFLECTION_QUESTIONS = [
  {
    question: 'Do I often feel like I\'m "walking on eggshells" around them?',
    insight: 'A healthy relationship should feel safe. If you\'re constantly worried about their reaction, that\'s worth examining.',
  },
  {
    question: 'Have my friends or family expressed concern about this relationship?',
    insight: 'People who love you can sometimes see patterns you\'re too close to notice. Their concern is worth considering.',
  },
  {
    question: 'Do I make excuses for their behavior to others or myself?',
    insight: 'If you find yourself explaining away concerning behavior ("they\'re just stressed," "they didn\'t mean it"), pause and reflect.',
  },
  {
    question: 'Has my confidence or self-esteem decreased since this relationship started?',
    insight: 'A good relationship should lift you up. If you feel smaller, less capable, or more anxious, something may be wrong.',
  },
  {
    question: 'Do I feel free to express my opinions, even if they disagree?',
    insight: 'You should be able to be yourself. If you\'re hiding your thoughts or changing who you are to avoid conflict, take note.',
  },
  {
    question: 'Am I staying because I want to, or because I\'m afraid of what happens if I leave?',
    insight: 'Fear is not a reason to stay. If you\'re afraid of their reaction to leaving, that itself is a red flag.',
  },
];

const GREEN_FLAGS = [
  'Respects your "no" without pushback or guilt-tripping',
  'Introduces you to important people in their life',
  'Takes responsibility and apologizes genuinely when wrong',
  'Supports your goals even when inconvenient for them',
  'Communicates directly instead of expecting you to read their mind',
  'Behaves the same in public as in private',
  'Handles disagreements without yelling, name-calling, or stonewalling',
  'Makes you feel more like yourself, not less',
];

export default function RedFlagsInsightScreen() {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const isPremium = currentUser?.isPremium ?? false;
  const hasRedFlagsReport = isPremium || currentUser?.purchasedReports?.redFlags || currentUser?.purchasedReports?.fullBundle;

  return (
    <View className="flex-1 bg-[#FDF8F5]">
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/');
              }
            }}
            className="w-10 h-10 items-center justify-center"
          >
            <ArrowLeft size={24} color="#2D3436" />
          </Pressable>
          <Text
            className="text-xl text-[#2D3436]"
            style={{ fontFamily: 'Cormorant_600SemiBold' }}
          >
            Red Flag Detection
          </Text>
          <View className="w-10" />
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <Animated.View entering={FadeIn.duration(500)} className="mb-6">
            <LinearGradient
              colors={['#F97316', '#EA580C']}
              style={{ borderRadius: 24, padding: 24 }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text
                    className="text-white/80 text-sm"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    Protect Your Heart
                  </Text>
                  <Text
                    className="text-2xl text-white mt-1"
                    style={{ fontFamily: 'Cormorant_600SemiBold' }}
                  >
                    Learn to Spot Warning Signs
                  </Text>
                </View>
                <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center">
                  <AlertTriangle size={32} color="#FFF" />
                </View>
              </View>

              <View className="mt-4 pt-4 border-t border-white/20">
                <View className="flex-row items-center">
                  <Shield size={16} color="#FFF" />
                  <Text
                    className="text-white/90 text-sm ml-2"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    Knowledge is your best protection in dating
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Your Profile Status */}
          {hasRedFlagsReport && (
            <Animated.View entering={FadeInDown.delay(100).duration(500)} className="mb-6">
              <View className="bg-[#81B29A]/10 rounded-2xl p-5">
                <View className="flex-row items-center mb-3">
                  <CheckCircle2 size={24} color="#81B29A" />
                  <Text
                    className="text-lg text-[#81B29A] ml-3"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    Your Profile Analysis
                  </Text>
                </View>
                <Text
                  className="text-sm text-[#636E72]"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  Based on your assessment, your profile shows healthy relationship patterns. You demonstrate emotional awareness and respect for boundaries.
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Red Flag Categories */}
          <Text
            className="text-sm text-[#A0A8AB] mb-3"
            style={{ fontFamily: 'Outfit_600SemiBold' }}
          >
            WARNING SIGNS TO WATCH FOR
          </Text>

          {RED_FLAG_CATEGORIES.map((category, index) => {
            const Icon = category.icon;
            return (
              <Animated.View
                key={category.id}
                entering={FadeInDown.delay((index + 2) * 100).duration(500)}
                className="mb-4"
              >
                <View className="bg-white rounded-2xl p-5 shadow-sm shadow-black/5">
                  <View className="flex-row items-center mb-3">
                    <View
                      className="w-10 h-10 rounded-xl items-center justify-center"
                      style={{ backgroundColor: `${category.color}15` }}
                    >
                      <Icon size={20} color={category.color} />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text
                        className="text-base text-[#2D3436]"
                        style={{ fontFamily: 'Outfit_600SemiBold' }}
                      >
                        {category.title}
                      </Text>
                      <Text
                        className="text-xs text-[#636E72]"
                        style={{ fontFamily: 'Outfit_400Regular' }}
                      >
                        {category.description}
                      </Text>
                    </View>
                  </View>

                  <View className="bg-[#FEF2F2] rounded-xl p-3 mb-3">
                    {category.signs.map((sign, signIndex) => (
                      <View key={signIndex} className="flex-row items-start mb-1.5 last:mb-0">
                        <XCircle size={14} color="#EF4444" className="mt-0.5" />
                        <Text
                          className="text-xs text-[#636E72] ml-2 flex-1"
                          style={{ fontFamily: 'Outfit_400Regular' }}
                        >
                          {sign}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* What to do section */}
                  <View className="bg-[#FFF7ED] rounded-xl p-3 mb-3 border border-[#FDBA74]/30">
                    <View className="flex-row items-start">
                      <Lightbulb size={14} color="#F97316" className="mt-0.5" />
                      <Text
                        className="text-xs text-[#2D3436] ml-2 flex-1"
                        style={{ fontFamily: 'Outfit_400Regular' }}
                      >
                        <Text style={{ fontFamily: 'Outfit_600SemiBold' }}>What to do: </Text>
                        {category.whatToDo}
                      </Text>
                    </View>
                  </View>

                  <View className="bg-[#81B29A]/10 rounded-xl p-3">
                    <View className="flex-row items-start">
                      <CheckCircle2 size={14} color="#81B29A" className="mt-0.5" />
                      <Text
                        className="text-xs text-[#2D3436] ml-2 flex-1"
                        style={{ fontFamily: 'Outfit_400Regular' }}
                      >
                        <Text style={{ fontFamily: 'Outfit_600SemiBold' }}>Healthy alternative: </Text>
                        {category.healthyAlternative}
                      </Text>
                    </View>
                  </View>
                </View>
              </Animated.View>
            );
          })}

          {/* Self-Reflection Questions */}
          <Animated.View entering={FadeInDown.delay(600).duration(500)} className="mb-6">
            <Text
              className="text-sm text-[#A0A8AB] mb-3"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              QUESTIONS TO ASK YOURSELF
            </Text>

            <View className="bg-white rounded-2xl p-5 shadow-sm shadow-black/5">
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-xl bg-[#9333EA]/15 items-center justify-center">
                  <HelpCircle size={20} color="#9333EA" />
                </View>
                <View className="ml-3 flex-1">
                  <Text
                    className="text-base text-[#2D3436]"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    Relationship Self-Check
                  </Text>
                  <Text
                    className="text-xs text-[#636E72]"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    Honest answers can reveal important truths
                  </Text>
                </View>
              </View>

              <View className="gap-4">
                {SELF_REFLECTION_QUESTIONS.map((item, index) => (
                  <View key={index} className="bg-[#F5F0ED] rounded-xl p-4">
                    <Text
                      className="text-sm text-[#2D3436] mb-2"
                      style={{ fontFamily: 'Outfit_600SemiBold' }}
                    >
                      {item.question}
                    </Text>
                    <Text
                      className="text-xs text-[#636E72] leading-5"
                      style={{ fontFamily: 'Outfit_400Regular' }}
                    >
                      {item.insight}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Green Flags Section */}
          <Animated.View entering={FadeInDown.delay(700).duration(500)} className="mb-6">
            <Text
              className="text-sm text-[#A0A8AB] mb-3"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              GREEN FLAGS TO LOOK FOR
            </Text>

            <View className="bg-white rounded-2xl p-5 shadow-sm shadow-black/5">
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-xl bg-[#81B29A]/15 items-center justify-center">
                  <CheckCircle2 size={20} color="#81B29A" />
                </View>
                <Text
                  className="text-base text-[#2D3436] ml-3"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Signs of a Healthy Partner
                </Text>
              </View>

              <View className="gap-2">
                {GREEN_FLAGS.map((flag, index) => (
                  <View key={index} className="flex-row items-center">
                    <View className="w-2 h-2 rounded-full bg-[#81B29A] mr-3" />
                    <Text
                      className="text-sm text-[#636E72] flex-1"
                      style={{ fontFamily: 'Outfit_400Regular' }}
                    >
                      {flag}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Trust Your Instincts */}
          <Animated.View entering={FadeInDown.delay(800).duration(500)} className="mb-8">
            <View className="bg-[#F5F0ED] rounded-2xl p-5">
              <View className="flex-row items-center mb-3">
                <Eye size={20} color="#D4A574" />
                <Text
                  className="text-base text-[#2D3436] ml-3"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Trust Your Instincts
                </Text>
              </View>
              <Text
                className="text-sm text-[#636E72] leading-5"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                If something feels off, it probably is. Pay attention to how you feel around someone, not just what they say. A healthy relationship should make you feel safe, respected, and free to be yourself.
              </Text>
            </View>
          </Animated.View>

          {/* Resources Note */}
          <Animated.View entering={FadeInDown.delay(900).duration(500)} className="mb-8">
            <View className="bg-white rounded-2xl p-5 shadow-sm shadow-black/5 border border-[#E0D5CC]">
              <Text
                className="text-sm text-[#636E72] text-center leading-5"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                If you're experiencing abuse or need support, please reach out to the{' '}
                <Text style={{ fontFamily: 'Outfit_600SemiBold', color: '#E07A5F' }}>
                  National Domestic Violence Hotline: 1-800-799-7233
                </Text>
              </Text>
            </View>
          </Animated.View>

          <View className="h-8" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
