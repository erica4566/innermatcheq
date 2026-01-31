import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Users,
  Heart,
  Brain,
  Shield,
  Sparkles,
  Star,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react-native';
import * as Haptics from '@/lib/haptics';
import { useAppStore, MBTI_DESCRIPTIONS, MBTIType } from '@/lib/store';

// MBTI Compatibility data
const MBTI_COMPATIBILITY: Record<MBTIType, {
  bestMatches: { type: MBTIType; reason: string }[];
  goodMatches: MBTIType[];
  challengingMatches: { type: MBTIType; challenge: string }[];
}> = {
  INTJ: {
    bestMatches: [
      { type: 'ENFP', reason: 'Brings warmth and spontaneity to balance your strategic mind' },
      { type: 'ENTP', reason: 'Matches your intellectual depth with creative debate' },
    ],
    goodMatches: ['ENTJ', 'INFJ', 'INTP'],
    challengingMatches: [
      { type: 'ESFP', challenge: 'Different priorities: logic vs experience' },
      { type: 'ESFJ', challenge: 'Communication styles may clash' },
    ],
  },
  INTP: {
    bestMatches: [
      { type: 'ENTJ', reason: 'Appreciates your ideas and helps bring them to reality' },
      { type: 'ENFJ', reason: 'Provides emotional warmth while respecting your space' },
    ],
    goodMatches: ['INTJ', 'INFJ', 'ENTP'],
    challengingMatches: [
      { type: 'ESFJ', challenge: 'Different values: logic vs harmony' },
      { type: 'ESTJ', challenge: 'May feel rushed or controlled' },
    ],
  },
  ENTJ: {
    bestMatches: [
      { type: 'INTP', reason: 'Brings creative ideas to your ambitious vision' },
      { type: 'INFP', reason: 'Adds depth and meaning to your goals' },
    ],
    goodMatches: ['INTJ', 'ENTP', 'ENFP'],
    challengingMatches: [
      { type: 'ISFP', challenge: 'Different paces and decision-making styles' },
      { type: 'INFP', challenge: 'May feel overwhelmed by your directness' },
    ],
  },
  ENTP: {
    bestMatches: [
      { type: 'INFJ', reason: 'Matches your depth with emotional intelligence' },
      { type: 'INTJ', reason: 'Engages your love of intellectual debate' },
    ],
    goodMatches: ['ENFJ', 'ENTJ', 'INTP'],
    challengingMatches: [
      { type: 'ISFJ', challenge: 'Different needs for stability vs novelty' },
      { type: 'ISTJ', challenge: 'May find your spontaneity unsettling' },
    ],
  },
  INFJ: {
    bestMatches: [
      { type: 'ENFP', reason: 'Brings joy and adventure to your meaningful world' },
      { type: 'ENTP', reason: 'Stimulates your mind while respecting your values' },
    ],
    goodMatches: ['INFP', 'INTJ', 'ENFJ'],
    challengingMatches: [
      { type: 'ESTP', challenge: 'Different priorities: meaning vs action' },
      { type: 'ESTJ', challenge: 'May feel misunderstood or rushed' },
    ],
  },
  INFP: {
    bestMatches: [
      { type: 'ENFJ', reason: 'Understands your depth and helps you take action' },
      { type: 'ENTJ', reason: 'Appreciates your authenticity and vision' },
    ],
    goodMatches: ['INFJ', 'ENFP', 'INTJ'],
    challengingMatches: [
      { type: 'ESTJ', challenge: 'Different approaches to life and decisions' },
      { type: 'ESTP', challenge: 'May feel your values are dismissed' },
    ],
  },
  ENFJ: {
    bestMatches: [
      { type: 'INFP', reason: 'Shares your depth with complementary introspection' },
      { type: 'INTP', reason: 'Brings unique perspectives to your warm nature' },
    ],
    goodMatches: ['INFJ', 'ENFP', 'ENTJ'],
    challengingMatches: [
      { type: 'ISTP', challenge: 'Different emotional expression styles' },
      { type: 'ESTP', challenge: 'May feel your caring is smothering' },
    ],
  },
  ENFP: {
    bestMatches: [
      { type: 'INFJ', reason: 'Matches your enthusiasm with meaningful depth' },
      { type: 'INTJ', reason: 'Grounds your ideas with strategic thinking' },
    ],
    goodMatches: ['ENFJ', 'ENTP', 'INFP'],
    challengingMatches: [
      { type: 'ISTJ', challenge: 'Different needs for structure vs freedom' },
      { type: 'ESTJ', challenge: 'May feel constrained by routine' },
    ],
  },
  ISTJ: {
    bestMatches: [
      { type: 'ESFP', reason: 'Brings spontaneity and fun to your structured life' },
      { type: 'ESTP', reason: 'Shares your practical nature with added energy' },
    ],
    goodMatches: ['ISFJ', 'ESTJ', 'INTJ'],
    challengingMatches: [
      { type: 'ENFP', challenge: 'Different needs for structure vs flexibility' },
      { type: 'ENTP', challenge: 'May find unpredictability stressful' },
    ],
  },
  ISFJ: {
    bestMatches: [
      { type: 'ESFP', reason: 'Brings energy and adventure to your caring nature' },
      { type: 'ESTP', reason: 'Adds excitement while appreciating your stability' },
    ],
    goodMatches: ['ISTJ', 'ESFJ', 'INFJ'],
    challengingMatches: [
      { type: 'ENTP', challenge: 'Different values around tradition vs novelty' },
      { type: 'ENTJ', challenge: 'May feel rushed or undervalued' },
    ],
  },
  ESTJ: {
    bestMatches: [
      { type: 'ISFP', reason: 'Brings creativity and flexibility to your structure' },
      { type: 'ISTP', reason: 'Shares your practical nature with fresh perspectives' },
    ],
    goodMatches: ['ISTJ', 'ESFJ', 'ENTJ'],
    challengingMatches: [
      { type: 'INFP', challenge: 'Different decision-making approaches' },
      { type: 'ENFP', challenge: 'May clash over flexibility vs rules' },
    ],
  },
  ESFJ: {
    bestMatches: [
      { type: 'ISFP', reason: 'Shares your caring nature with artistic depth' },
      { type: 'ISTP', reason: 'Brings calm independence to balance your social energy' },
    ],
    goodMatches: ['ISFJ', 'ESTJ', 'ENFJ'],
    challengingMatches: [
      { type: 'INTP', challenge: 'Different emotional expression needs' },
      { type: 'INTJ', challenge: 'May feel dismissed or undervalued' },
    ],
  },
  ISTP: {
    bestMatches: [
      { type: 'ESFJ', reason: 'Brings warmth to balance your independence' },
      { type: 'ESTJ', reason: 'Shares practical focus with complementary energy' },
    ],
    goodMatches: ['ESTP', 'ISFP', 'INTP'],
    challengingMatches: [
      { type: 'ENFJ', challenge: 'Different needs for connection vs space' },
      { type: 'INFJ', challenge: 'May feel overwhelmed by emotional depth' },
    ],
  },
  ISFP: {
    bestMatches: [
      { type: 'ESFJ', reason: 'Appreciates your authenticity and artistic nature' },
      { type: 'ESTJ', reason: 'Brings structure while valuing your creativity' },
    ],
    goodMatches: ['ISTP', 'INFP', 'ENFP'],
    challengingMatches: [
      { type: 'ENTJ', challenge: 'Different paces and priorities' },
      { type: 'ENTP', challenge: 'May feel your values are debated too much' },
    ],
  },
  ESTP: {
    bestMatches: [
      { type: 'ISFJ', reason: 'Brings stability and care to your adventurous spirit' },
      { type: 'ISTJ', reason: 'Shares your practical nature with grounded energy' },
    ],
    goodMatches: ['ISTP', 'ESFP', 'ESTJ'],
    challengingMatches: [
      { type: 'INFJ', challenge: 'Different approaches to life and meaning' },
      { type: 'INFP', challenge: 'May feel your energy is overwhelming' },
    ],
  },
  ESFP: {
    bestMatches: [
      { type: 'ISFJ', reason: 'Provides stability while appreciating your energy' },
      { type: 'ISTJ', reason: 'Brings structure to complement your spontaneity' },
    ],
    goodMatches: ['ESTP', 'ESFJ', 'ISFP'],
    challengingMatches: [
      { type: 'INTJ', challenge: 'Different priorities: fun vs strategy' },
      { type: 'INTP', challenge: 'May feel dismissed as not intellectual' },
    ],
  },
};

export default function IdealPartnerScreen() {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const isPremium = currentUser?.isPremium ?? false;
  const hasIdealPartnerReport = isPremium || currentUser?.purchasedReports?.idealPartner || currentUser?.purchasedReports?.fullBundle;

  const userMbti = currentUser?.mbtiType as MBTIType | null;
  const compatibility = userMbti ? MBTI_COMPATIBILITY[userMbti] : null;
  const mbtiInfo = userMbti ? MBTI_DESCRIPTIONS[userMbti] : null;

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
            Your Ideal Partner
          </Text>
          <View className="w-10" />
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <Animated.View entering={FadeIn.duration(500)} className="mb-6">
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              style={{ borderRadius: 24, padding: 24 }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text
                    className="text-white/80 text-sm"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    Based on Your Personality
                  </Text>
                  <Text
                    className="text-2xl text-white mt-1"
                    style={{ fontFamily: 'Cormorant_600SemiBold' }}
                  >
                    Find Your Perfect Match
                  </Text>
                  {userMbti && (
                    <View className="flex-row items-center mt-2">
                      <Brain size={16} color="#FFF" />
                      <Text
                        className="text-white/90 text-sm ml-2"
                        style={{ fontFamily: 'Outfit_500Medium' }}
                      >
                        {userMbti} - {mbtiInfo?.title}
                      </Text>
                    </View>
                  )}
                </View>
                <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center">
                  <Users size={32} color="#FFF" />
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {!userMbti && (
            <Animated.View entering={FadeInDown.delay(100).duration(500)} className="mb-6">
              <View className="bg-[#F5F0ED] rounded-2xl p-5">
                <View className="flex-row items-center mb-3">
                  <Brain size={20} color="#E07A5F" />
                  <Text
                    className="text-base text-[#2D3436] ml-3"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    Complete Your Profile
                  </Text>
                </View>
                <Text
                  className="text-sm text-[#636E72] mb-4"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  Take the personality assessment to discover your ideal partner types based on psychological compatibility.
                </Text>
                <Pressable
                  onPress={() => router.push('/assessment')}
                  className="bg-[#E07A5F] rounded-xl py-3 active:scale-[0.98]"
                >
                  <Text
                    className="text-white text-center"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    Take Assessment
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          )}

          {/* Best Matches */}
          {compatibility && hasIdealPartnerReport && (
            <>
              <Text
                className="text-sm text-[#A0A8AB] mb-3"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                YOUR BEST MATCHES
              </Text>

              {compatibility.bestMatches.map((match, index) => {
                const matchInfo = MBTI_DESCRIPTIONS[match.type];
                return (
                  <Animated.View
                    key={match.type}
                    entering={FadeInDown.delay((index + 1) * 100).duration(500)}
                    className="mb-4"
                  >
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.push(`/insight-mbti?type=${match.type}`);
                      }}
                      className="bg-white rounded-2xl p-5 shadow-sm shadow-black/5 active:scale-[0.98]"
                    >
                      <View className="flex-row items-center mb-3">
                        <View className="bg-[#81B29A]/15 rounded-full px-3 py-1.5">
                          <Text
                            className="text-sm text-[#81B29A]"
                            style={{ fontFamily: 'Outfit_700Bold' }}
                          >
                            {match.type}
                          </Text>
                        </View>
                        <Text
                          className="text-base text-[#2D3436] ml-3 flex-1"
                          style={{ fontFamily: 'Outfit_600SemiBold' }}
                        >
                          {matchInfo?.title}
                        </Text>
                        <View className="flex-row items-center">
                          <Star size={14} color="#F2CC8F" fill="#F2CC8F" />
                          <Star size={14} color="#F2CC8F" fill="#F2CC8F" />
                          <Star size={14} color="#F2CC8F" fill="#F2CC8F" />
                        </View>
                      </View>

                      <Text
                        className="text-sm text-[#636E72] mb-3"
                        style={{ fontFamily: 'Outfit_400Regular' }}
                      >
                        {match.reason}
                      </Text>

                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <Heart size={14} color="#E07A5F" />
                          <Text
                            className="text-xs text-[#E07A5F] ml-1"
                            style={{ fontFamily: 'Outfit_500Medium' }}
                          >
                            Highly Compatible
                          </Text>
                        </View>
                        <ChevronRight size={16} color="#D0D5D8" />
                      </View>
                    </Pressable>
                  </Animated.View>
                );
              })}

              {/* Good Matches */}
              <Animated.View entering={FadeInDown.delay(300).duration(500)} className="mb-4">
                <Text
                  className="text-sm text-[#A0A8AB] mb-3"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  ALSO COMPATIBLE
                </Text>
                <View className="bg-white rounded-2xl p-5 shadow-sm shadow-black/5">
                  <View className="flex-row flex-wrap gap-2">
                    {compatibility.goodMatches.map((type) => (
                      <Pressable
                        key={type}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          router.push(`/insight-mbti?type=${type}`);
                        }}
                        className="bg-[#3B82F6]/10 rounded-full px-4 py-2 active:scale-95"
                      >
                        <Text
                          className="text-sm text-[#3B82F6]"
                          style={{ fontFamily: 'Outfit_600SemiBold' }}
                        >
                          {type}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </Animated.View>

              {/* Challenging Matches */}
              <Animated.View entering={FadeInDown.delay(400).duration(500)} className="mb-6">
                <Text
                  className="text-sm text-[#A0A8AB] mb-3"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  CHALLENGING BUT POSSIBLE
                </Text>
                <View className="bg-white rounded-2xl p-5 shadow-sm shadow-black/5">
                  <Text
                    className="text-xs text-[#636E72] mb-3"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    These types may require extra effort but can lead to growth
                  </Text>
                  {compatibility.challengingMatches.map((match, index) => (
                    <View
                      key={match.type}
                      className={`flex-row items-center ${index < compatibility.challengingMatches.length - 1 ? 'mb-3 pb-3 border-b border-[#F0E6E0]' : ''}`}
                    >
                      <View className="bg-[#F97316]/10 rounded-full px-3 py-1">
                        <Text
                          className="text-xs text-[#F97316]"
                          style={{ fontFamily: 'Outfit_600SemiBold' }}
                        >
                          {match.type}
                        </Text>
                      </View>
                      <Text
                        className="text-xs text-[#636E72] ml-3 flex-1"
                        style={{ fontFamily: 'Outfit_400Regular' }}
                      >
                        {match.challenge}
                      </Text>
                    </View>
                  ))}
                </View>
              </Animated.View>
            </>
          )}

          {/* Locked State */}
          {compatibility && !hasIdealPartnerReport && (
            <Animated.View entering={FadeInDown.delay(100).duration(500)} className="mb-6">
              <Pressable
                onPress={() => router.push('/paywall')}
                className="bg-white rounded-2xl p-5 shadow-sm shadow-black/5 active:scale-[0.98]"
              >
                <View className="items-center py-4">
                  <View className="w-16 h-16 rounded-full bg-[#3B82F6]/10 items-center justify-center mb-4">
                    <Shield size={28} color="#3B82F6" />
                  </View>
                  <Text
                    className="text-lg text-[#2D3436] text-center mb-2"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    Unlock Your Ideal Partner Report
                  </Text>
                  <Text
                    className="text-sm text-[#636E72] text-center mb-4"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    Discover which personality types are most compatible with you and why
                  </Text>
                  <View className="bg-[#E07A5F] rounded-xl px-6 py-3">
                    <Text
                      className="text-white"
                      style={{ fontFamily: 'Outfit_600SemiBold' }}
                    >
                      Unlock for $5.99
                    </Text>
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          )}

          {/* General Compatibility Tips */}
          <Animated.View entering={FadeInDown.delay(500).duration(500)} className="mb-8">
            <Text
              className="text-sm text-[#A0A8AB] mb-3"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              COMPATIBILITY TIPS
            </Text>
            <View className="bg-[#F5F0ED] rounded-2xl p-5">
              <View className="flex-row items-center mb-3">
                <Sparkles size={20} color="#D4A574" />
                <Text
                  className="text-base text-[#2D3436] ml-3"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Beyond Personality Types
                </Text>
              </View>
              <Text
                className="text-sm text-[#636E72] mb-3"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                While personality compatibility matters, successful relationships also depend on:
              </Text>
              {[
                'Shared values and life goals',
                'Emotional maturity and communication skills',
                'Mutual respect and willingness to grow',
                'Compatible attachment styles',
                'Similar views on important topics',
              ].map((tip, index) => (
                <View key={index} className="flex-row items-center mb-2">
                  <CheckCircle2 size={14} color="#81B29A" />
                  <Text
                    className="text-sm text-[#636E72] ml-2"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    {tip}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          <View className="h-8" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
