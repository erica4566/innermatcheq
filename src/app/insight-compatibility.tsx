import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  TrendingUp,
  Heart,
  Shield,
  Sparkles,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from 'lucide-react-native';
import * as Haptics from '@/lib/haptics';
import { useAppStore, ATTACHMENT_DESCRIPTIONS } from '@/lib/store';

// Attachment compatibility data
const ATTACHMENT_COMPATIBILITY = {
  secure: {
    title: 'Secure Attachment',
    color: '#81B29A',
    compatibilityScores: {
      secure: { score: 95, label: 'Excellent', description: 'Two secure partners create the healthiest dynamic with mutual trust and independence.' },
      anxious: { score: 75, label: 'Good', description: 'You can help anxious partners feel safe while maintaining healthy boundaries.' },
      avoidant: { score: 70, label: 'Good', description: 'Your stability can help avoidant partners open up over time.' },
      'fearful-avoidant': { score: 65, label: 'Moderate', description: 'Your consistency can help, but requires patience with their push-pull patterns.' },
    },
  },
  anxious: {
    title: 'Anxious Attachment',
    color: '#E07A5F',
    compatibilityScores: {
      secure: { score: 85, label: 'Excellent', description: 'Secure partners provide the reassurance you need while modeling healthy attachment.' },
      anxious: { score: 55, label: 'Challenging', description: 'Two anxious partners may amplify each other\'s fears and need extra communication.' },
      avoidant: { score: 40, label: 'Difficult', description: 'Classic "pursuer-distancer" dynamic can be painful without active work.' },
      'fearful-avoidant': { score: 45, label: 'Challenging', description: 'Unpredictable responses can trigger anxiety. Requires clear communication.' },
    },
  },
  avoidant: {
    title: 'Avoidant Attachment',
    color: '#6366F1',
    compatibilityScores: {
      secure: { score: 80, label: 'Good', description: 'Secure partners respect your need for space while staying emotionally available.' },
      anxious: { score: 40, label: 'Difficult', description: 'Their need for closeness may feel overwhelming without intentional effort.' },
      avoidant: { score: 60, label: 'Moderate', description: 'Both value independence but may struggle with emotional intimacy.' },
      'fearful-avoidant': { score: 50, label: 'Challenging', description: 'Their hot-cold behavior may be confusing even for you.' },
    },
  },
  'fearful-avoidant': {
    title: 'Fearful-Avoidant Attachment',
    color: '#F97316',
    compatibilityScores: {
      secure: { score: 75, label: 'Good', description: 'Secure partners offer stability that can help heal attachment wounds.' },
      anxious: { score: 45, label: 'Challenging', description: 'Both styles can trigger each other. Success requires self-awareness.' },
      avoidant: { score: 50, label: 'Challenging', description: 'May feel safe initially but emotional connection can be difficult.' },
      'fearful-avoidant': { score: 40, label: 'Difficult', description: 'Both partners may struggle with consistency. Therapy often helps.' },
    },
  },
};

const RELATIONSHIP_TIPS = {
  secure: [
    'Continue being a stable presence for partners who may have attachment wounds',
    'Model healthy communication and emotional expression',
    'Be patient with partners who need more reassurance',
  ],
  anxious: [
    'Practice self-soothing techniques when feeling insecure',
    'Communicate needs directly rather than testing your partner',
    'Build confidence through self-care and personal interests',
  ],
  avoidant: [
    'Practice staying present during emotional conversations',
    'Share your feelings even when uncomfortable',
    'Recognize that closeness doesn\'t mean losing yourself',
  ],
  'fearful-avoidant': [
    'Notice your push-pull patterns and communicate about them',
    'Work on building trust gradually with consistent partners',
    'Consider therapy to heal past attachment wounds',
  ],
};

function CompatibilityMeter({ score, color }: { score: number; color: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <View className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
        <Animated.View
          entering={FadeIn.delay(300).duration(800)}
          style={{
            width: `${score}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: 999,
          }}
        />
      </View>
      <Text
        className="text-sm w-10 text-right"
        style={{ fontFamily: 'Outfit_600SemiBold', color }}
      >
        {score}%
      </Text>
    </View>
  );
}

export default function InsightCompatibilityScreen() {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);

  // Normalize attachment style to lowercase to match keys
  const rawAttachment = currentUser?.attachmentStyle || 'secure';
  const userAttachment = typeof rawAttachment === 'string' ? rawAttachment.toLowerCase() : 'secure';

  // Safely get attachment data with fallback to secure
  const attachmentData = ATTACHMENT_COMPATIBILITY[userAttachment as keyof typeof ATTACHMENT_COMPATIBILITY]
    || ATTACHMENT_COMPATIBILITY.secure;
  const tips = RELATIONSHIP_TIPS[userAttachment as keyof typeof RELATIONSHIP_TIPS]
    || RELATIONSHIP_TIPS.secure;
  const attachmentInfo = ATTACHMENT_DESCRIPTIONS[userAttachment as keyof typeof ATTACHMENT_DESCRIPTIONS];

  return (
    <View className="flex-1">
      <LinearGradient
        colors={['#FDF8F5', '#F5F0ED', '#FDF8F5']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <Animated.View
          entering={FadeIn.duration(400)}
          className="flex-row items-center px-6 py-4"
        >
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/');
              }
            }}
            className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm"
          >
            <ArrowLeft size={20} color="#2D3436" />
          </Pressable>
          <Text
            className="flex-1 text-xl text-[#2D3436] text-center mr-10"
            style={{ fontFamily: 'Cormorant_600SemiBold' }}
          >
            Compatibility Analysis
          </Text>
        </Animated.View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Hero Section */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(500)}
            className="mx-6 mb-6"
          >
            <LinearGradient
              colors={[attachmentData.color, `${attachmentData.color}CC`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 24, padding: 24 }}
            >
              <View className="flex-row items-center mb-4">
                <View className="w-14 h-14 rounded-full bg-white/20 items-center justify-center">
                  <TrendingUp size={28} color="#FFF" />
                </View>
                <View className="ml-4">
                  <Text
                    className="text-white/70 text-xs"
                    style={{ fontFamily: 'Outfit_500Medium' }}
                  >
                    YOUR ATTACHMENT STYLE
                  </Text>
                  <Text
                    className="text-white text-xl"
                    style={{ fontFamily: 'Outfit_700Bold' }}
                  >
                    {attachmentData.title}
                  </Text>
                </View>
              </View>
              <Text
                className="text-white/90 text-sm"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                {attachmentInfo?.description || 'Your attachment style influences how you connect with romantic partners.'}
              </Text>
            </LinearGradient>
          </Animated.View>

          {/* Compatibility Scores Section */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(500)}
            className="mx-6 mb-6"
          >
            <Text
              className="text-xs text-[#A0A8AB] mb-3"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              COMPATIBILITY WITH OTHER STYLES
            </Text>

            <View className="bg-white rounded-2xl p-5 shadow-sm shadow-black/5">
              {Object.entries(attachmentData.compatibilityScores).map(([style, data], index) => (
                <View
                  key={style}
                  className={`${index > 0 ? 'mt-5 pt-5 border-t border-[#F0E6E0]' : ''}`}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                      <View
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: ATTACHMENT_COMPATIBILITY[style as keyof typeof ATTACHMENT_COMPATIBILITY]?.color || '#636E72' }}
                      />
                      <Text
                        className="text-base text-[#2D3436]"
                        style={{ fontFamily: 'Outfit_600SemiBold' }}
                      >
                        {ATTACHMENT_COMPATIBILITY[style as keyof typeof ATTACHMENT_COMPATIBILITY]?.title || style}
                      </Text>
                    </View>
                    <View
                      className="px-2 py-1 rounded-full"
                      style={{
                        backgroundColor:
                          data.score >= 75 ? '#81B29A20' :
                          data.score >= 55 ? '#F2CC8F20' :
                          '#F9731620',
                      }}
                    >
                      <Text
                        className="text-xs"
                        style={{
                          fontFamily: 'Outfit_600SemiBold',
                          color:
                            data.score >= 75 ? '#81B29A' :
                            data.score >= 55 ? '#D4A574' :
                            '#F97316',
                        }}
                      >
                        {data.label}
                      </Text>
                    </View>
                  </View>
                  <CompatibilityMeter
                    score={data.score}
                    color={
                      data.score >= 75 ? '#81B29A' :
                      data.score >= 55 ? '#F2CC8F' :
                      '#F97316'
                    }
                  />
                  <Text
                    className="text-xs text-[#636E72] mt-2"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    {data.description}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Best Match Section */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(500)}
            className="mx-6 mb-6"
          >
            <Text
              className="text-xs text-[#A0A8AB] mb-3"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              YOUR BEST MATCH
            </Text>

            <View className="bg-[#81B29A]/10 rounded-2xl p-5 border border-[#81B29A]/20">
              <View className="flex-row items-center mb-3">
                <CheckCircle2 size={24} color="#81B29A" />
                <Text
                  className="text-lg text-[#81B29A] ml-3"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Secure Attachment
                </Text>
              </View>
              <Text
                className="text-sm text-[#2D3436]"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                Partners with secure attachment provide the stability, trust, and emotional availability that creates the foundation for a healthy, lasting relationship. They can help you feel safe while respecting your individual needs.
              </Text>
            </View>
          </Animated.View>

          {/* Relationship Tips */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(500)}
            className="mx-6 mb-6"
          >
            <Text
              className="text-xs text-[#A0A8AB] mb-3"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              TIPS FOR YOUR ATTACHMENT STYLE
            </Text>

            <View className="bg-white rounded-2xl p-5 shadow-sm shadow-black/5">
              {tips.map((tip, index) => (
                <View
                  key={index}
                  className={`flex-row items-start ${index > 0 ? 'mt-4 pt-4 border-t border-[#F0E6E0]' : ''}`}
                >
                  <View className="w-6 h-6 rounded-full bg-[#9333EA]/10 items-center justify-center mr-3 mt-0.5">
                    <Text
                      className="text-xs text-[#9333EA]"
                      style={{ fontFamily: 'Outfit_600SemiBold' }}
                    >
                      {index + 1}
                    </Text>
                  </View>
                  <Text
                    className="flex-1 text-sm text-[#2D3436]"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    {tip}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Learn More Link */}
          <Animated.View
            entering={FadeInDown.delay(500).duration(500)}
            className="mx-6"
          >
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/insight-attachment');
              }}
              className="active:scale-[0.98]"
            >
              <View className="bg-white rounded-2xl p-5 shadow-sm shadow-black/5 flex-row items-center">
                <View className="w-12 h-12 rounded-full bg-[#E07A5F]/10 items-center justify-center">
                  <Shield size={24} color="#E07A5F" />
                </View>
                <View className="flex-1 ml-4">
                  <Text
                    className="text-base text-[#2D3436]"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    Deep Dive: Your Attachment Style
                  </Text>
                  <Text
                    className="text-xs text-[#636E72]"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    Learn more about what shapes your patterns
                  </Text>
                </View>
                <ChevronRight size={20} color="#A0A8AB" />
              </View>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
