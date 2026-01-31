import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Brain,
  Heart,
  Users,
  Briefcase,
  MessageCircle,
  AlertTriangle,
  Lightbulb,
  Target,
  Sparkles,
} from 'lucide-react-native';
import * as Haptics from '@/lib/haptics';
import { useAppStore, MBTI_DESCRIPTIONS, MBTIType } from '@/lib/store';
import TakeAssessmentPrompt from '@/components/TakeAssessmentPrompt';

// Extended MBTI data with deeper insights
const MBTI_DEEP_INSIGHTS: Record<MBTIType, {
  cognitiveStack: string[];
  communicationStyle: string;
  conflictApproach: string;
  idealDate: string;
  relationshipNeeds: string[];
  potentialChallenges: string[];
  growthAreas: string[];
  famousExamples: string[];
  compatibleTypes: MBTIType[];
  challengingTypes: MBTIType[];
}> = {
  INTJ: {
    cognitiveStack: ['Introverted Intuition (Ni)', 'Extraverted Thinking (Te)', 'Introverted Feeling (Fi)', 'Extraverted Sensing (Se)'],
    communicationStyle: 'Direct, logical, and focused on efficiency. You prefer deep conversations over small talk and appreciate partners who can engage intellectually.',
    conflictApproach: 'You tend to analyze conflicts objectively and seek logical resolutions. May need to remember that emotions are valid even when they seem illogical.',
    idealDate: 'A thought-provoking museum exhibit, strategic board game night, or deep conversation at a quiet coffee shop.',
    relationshipNeeds: ['Intellectual stimulation', 'Personal space', 'Long-term commitment', 'Mutual growth', 'Honesty'],
    potentialChallenges: ['May appear emotionally distant', 'Can be overly critical', 'Difficulty with spontaneity', 'High standards'],
    growthAreas: ['Express emotions more openly', 'Practice patience with less analytical partners', 'Embrace spontaneous moments'],
    famousExamples: ['Elon Musk', 'Michelle Obama', 'Christopher Nolan'],
    compatibleTypes: ['ENFP', 'ENTP', 'INTJ', 'ENTJ'],
    challengingTypes: ['ESFP', 'ISFP', 'ESFJ'],
  },
  INTP: {
    cognitiveStack: ['Introverted Thinking (Ti)', 'Extraverted Intuition (Ne)', 'Introverted Sensing (Si)', 'Extraverted Feeling (Fe)'],
    communicationStyle: 'Precise and analytical. You enjoy exploring ideas and theories, often playing devil\'s advocate to understand all angles.',
    conflictApproach: 'You prefer to analyze conflicts logically and may withdraw to process. Can struggle with emotional confrontations.',
    idealDate: 'Science museum, escape room, or a documentary followed by discussion.',
    relationshipNeeds: ['Freedom to explore ideas', 'Intellectual connection', 'Patience with emotions', 'Space for independence'],
    potentialChallenges: ['May seem detached', 'Overthinking relationships', 'Difficulty expressing feelings', 'Procrastination'],
    growthAreas: ['Practice emotional expression', 'Follow through on plans', 'Stay present in conversations'],
    famousExamples: ['Albert Einstein', 'Bill Gates', 'Tina Fey'],
    compatibleTypes: ['ENTJ', 'ENFJ', 'INFJ', 'INTJ'],
    challengingTypes: ['ESFJ', 'ISFJ', 'ESTJ'],
  },
  ENTJ: {
    cognitiveStack: ['Extraverted Thinking (Te)', 'Introverted Intuition (Ni)', 'Extraverted Sensing (Se)', 'Introverted Feeling (Fi)'],
    communicationStyle: 'Confident, decisive, and goal-oriented. You naturally take charge in conversations and appreciate efficiency.',
    conflictApproach: 'You address conflicts head-on and seek quick resolution. May need to soften approach for sensitive partners.',
    idealDate: 'Networking event, competitive activity, or planning an adventure together.',
    relationshipNeeds: ['Mutual ambition', 'Intellectual equal', 'Loyalty', 'Direct communication', 'Shared goals'],
    potentialChallenges: ['Can be domineering', 'Impatient with indecision', 'Work-life balance struggles', 'May overlook emotions'],
    growthAreas: ['Practice active listening', 'Show vulnerability', 'Appreciate different paces'],
    famousExamples: ['Steve Jobs', 'Margaret Thatcher', 'Gordon Ramsay'],
    compatibleTypes: ['INTP', 'INFP', 'ENFP', 'ISTP'],
    challengingTypes: ['ISFP', 'INFP', 'ISFJ'],
  },
  ENTP: {
    cognitiveStack: ['Extraverted Intuition (Ne)', 'Introverted Thinking (Ti)', 'Extraverted Feeling (Fe)', 'Introverted Sensing (Si)'],
    communicationStyle: 'Witty, enthusiastic, and debate-loving. You enjoy intellectual sparring and exploring possibilities.',
    conflictApproach: 'You may turn conflicts into debates. Can enjoy the intellectual challenge but should remember partner\'s feelings.',
    idealDate: 'Comedy show, trivia night, or exploring a new neighborhood with spontaneous stops.',
    relationshipNeeds: ['Mental stimulation', 'Freedom to explore', 'Playful banter', 'Growth opportunities', 'Acceptance of ideas'],
    potentialChallenges: ['Commitment hesitancy', 'Argumentative tendencies', 'Easily bored', 'Follow-through issues'],
    growthAreas: ['Practice follow-through', 'Develop emotional sensitivity', 'Value routine occasionally'],
    famousExamples: ['Mark Twain', 'Thomas Edison', 'Sacha Baron Cohen'],
    compatibleTypes: ['INFJ', 'INTJ', 'ENFJ', 'ENTJ'],
    challengingTypes: ['ISFJ', 'ISTJ', 'ESFJ'],
  },
  INFJ: {
    cognitiveStack: ['Introverted Intuition (Ni)', 'Extraverted Feeling (Fe)', 'Introverted Thinking (Ti)', 'Extraverted Sensing (Se)'],
    communicationStyle: 'Empathetic, insightful, and meaningful. You prefer deep, one-on-one conversations and can read between the lines.',
    conflictApproach: 'You may avoid conflict initially but address it when values are at stake. Seek harmony but stand firm on principles.',
    idealDate: 'Art gallery, meaningful volunteer activity, or intimate dinner with deep conversation.',
    relationshipNeeds: ['Emotional depth', 'Authenticity', 'Shared values', 'Quality time', 'Understanding'],
    potentialChallenges: ['Perfectionism in relationships', 'Burnout from giving too much', 'Difficulty setting boundaries', 'Idealization'],
    growthAreas: ['Set healthy boundaries', 'Accept imperfection', 'Express needs directly'],
    famousExamples: ['Martin Luther King Jr.', 'Mother Teresa', 'Lady Gaga'],
    compatibleTypes: ['ENTP', 'ENFP', 'INFP', 'INTJ'],
    challengingTypes: ['ESTP', 'ISTP', 'ESTJ'],
  },
  INFP: {
    cognitiveStack: ['Introverted Feeling (Fi)', 'Extraverted Intuition (Ne)', 'Introverted Sensing (Si)', 'Extraverted Thinking (Te)'],
    communicationStyle: 'Authentic, creative, and values-driven. You express yourself through metaphor and appreciate emotional honesty.',
    conflictApproach: 'You tend to avoid conflict but feel deeply when values are violated. Need time to process emotions.',
    idealDate: 'Poetry reading, nature walk, or creative workshop together.',
    relationshipNeeds: ['Emotional authenticity', 'Creative expression', 'Acceptance', 'Deep connection', 'Shared ideals'],
    potentialChallenges: ['Idealistic expectations', 'Difficulty with criticism', 'May withdraw when hurt', 'Indecisiveness'],
    growthAreas: ['Ground ideals in reality', 'Communicate needs clearly', 'Develop practical skills'],
    famousExamples: ['William Shakespeare', 'J.R.R. Tolkien', 'Johnny Depp'],
    compatibleTypes: ['ENFJ', 'ENTJ', 'INFJ', 'ISFJ'],
    challengingTypes: ['ESTJ', 'ISTJ', 'ENTJ'],
  },
  ENFJ: {
    cognitiveStack: ['Extraverted Feeling (Fe)', 'Introverted Intuition (Ni)', 'Extraverted Sensing (Se)', 'Introverted Thinking (Ti)'],
    communicationStyle: 'Warm, inspiring, and attentive. You naturally tune into others\' needs and communicate with enthusiasm.',
    conflictApproach: 'You seek harmony and may mediate conflicts. Can struggle when your values clash with keeping peace.',
    idealDate: 'Cooking class together, community event, or meaningful cultural experience.',
    relationshipNeeds: ['Appreciation', 'Emotional reciprocity', 'Shared vision', 'Quality time', 'Growth together'],
    potentialChallenges: ['People-pleasing', 'Neglecting own needs', 'Over-involvement in partner\'s life', 'Sensitivity to criticism'],
    growthAreas: ['Prioritize self-care', 'Accept that you can\'t fix everything', 'Set boundaries'],
    famousExamples: ['Oprah Winfrey', 'Barack Obama', 'Jennifer Lawrence'],
    compatibleTypes: ['INFP', 'ISFP', 'INTP', 'ISTP'],
    challengingTypes: ['ISTP', 'ESTP', 'INTP'],
  },
  ENFP: {
    cognitiveStack: ['Extraverted Intuition (Ne)', 'Introverted Feeling (Fi)', 'Extraverted Thinking (Te)', 'Introverted Sensing (Si)'],
    communicationStyle: 'Enthusiastic, imaginative, and affirming. You bring energy to conversations and love exploring possibilities.',
    conflictApproach: 'You prefer to address conflicts with empathy but may avoid them if too intense. Values-based conflicts hit hard.',
    idealDate: 'Festival, improv comedy, or spontaneous road trip to somewhere new.',
    relationshipNeeds: ['Emotional connection', 'Freedom to explore', 'Affirmation', 'Shared adventures', 'Authenticity'],
    potentialChallenges: ['Difficulty with routine', 'May overcommit', 'Scattered focus', 'Idealistic expectations'],
    growthAreas: ['Follow through on commitments', 'Develop consistency', 'Ground dreams in action'],
    famousExamples: ['Robin Williams', 'Robert Downey Jr.', 'Ellen DeGeneres'],
    compatibleTypes: ['INTJ', 'INFJ', 'ENTJ', 'ENFJ'],
    challengingTypes: ['ISTJ', 'ESTJ', 'ISFJ'],
  },
  ISTJ: {
    cognitiveStack: ['Introverted Sensing (Si)', 'Extraverted Thinking (Te)', 'Introverted Feeling (Fi)', 'Extraverted Intuition (Ne)'],
    communicationStyle: 'Clear, factual, and reliable. You value precision and follow through on what you say.',
    conflictApproach: 'You address conflicts practically and prefer clear resolution. May struggle with emotional aspects.',
    idealDate: 'Historical tour, traditional dinner, or well-planned activity with clear expectations.',
    relationshipNeeds: ['Reliability', 'Clear expectations', 'Loyalty', 'Respect for traditions', 'Practical support'],
    potentialChallenges: ['Rigidity', 'Difficulty with change', 'May seem emotionally reserved', 'Judgmental tendencies'],
    growthAreas: ['Embrace flexibility', 'Express emotions more', 'Try new experiences'],
    famousExamples: ['George Washington', 'Warren Buffett', 'Angela Merkel'],
    compatibleTypes: ['ESFP', 'ESTP', 'ISFJ', 'ESTJ'],
    challengingTypes: ['ENFP', 'ENTP', 'INFP'],
  },
  ISFJ: {
    cognitiveStack: ['Introverted Sensing (Si)', 'Extraverted Feeling (Fe)', 'Introverted Thinking (Ti)', 'Extraverted Intuition (Ne)'],
    communicationStyle: 'Warm, supportive, and attentive to details. You remember important things about people and show care through actions.',
    conflictApproach: 'You avoid conflict but will address issues affecting loved ones. May internalize stress.',
    idealDate: 'Cozy home-cooked dinner, family gathering, or nostalgic activity.',
    relationshipNeeds: ['Security', 'Appreciation', 'Consistency', 'Emotional support', 'Shared responsibilities'],
    potentialChallenges: ['Difficulty saying no', 'May suppress own needs', 'Resistance to change', 'Over-worrying'],
    growthAreas: ['Prioritize own needs', 'Embrace change', 'Communicate boundaries'],
    famousExamples: ['Queen Elizabeth II', 'Mother Teresa', 'Beyonce'],
    compatibleTypes: ['ESFP', 'ESTP', 'ISTJ', 'ESTJ'],
    challengingTypes: ['ENTP', 'INTP', 'ENTJ'],
  },
  ESTJ: {
    cognitiveStack: ['Extraverted Thinking (Te)', 'Introverted Sensing (Si)', 'Extraverted Intuition (Ne)', 'Introverted Feeling (Fi)'],
    communicationStyle: 'Direct, organized, and practical. You value efficiency and clear communication.',
    conflictApproach: 'You address conflicts directly and seek practical solutions. May need to soften approach.',
    idealDate: 'Organized group activity, sports event, or traditional dinner out.',
    relationshipNeeds: ['Respect', 'Reliability', 'Shared values', 'Clear roles', 'Practical partnership'],
    potentialChallenges: ['Can be controlling', 'Impatient with inefficiency', 'May overlook emotions', 'Rigid expectations'],
    growthAreas: ['Practice emotional attunement', 'Allow flexibility', 'Value different approaches'],
    famousExamples: ['Judge Judy', 'Michelle Obama', 'Frank Sinatra'],
    compatibleTypes: ['ISFP', 'ISTP', 'ISTJ', 'ESFJ'],
    challengingTypes: ['INFP', 'ENFP', 'INTP'],
  },
  ESFJ: {
    cognitiveStack: ['Extraverted Feeling (Fe)', 'Introverted Sensing (Si)', 'Extraverted Intuition (Ne)', 'Introverted Thinking (Ti)'],
    communicationStyle: 'Warm, sociable, and attentive. You create harmony and remember personal details about others.',
    conflictApproach: 'You seek harmony and may struggle with direct confrontation. Work to maintain relationships.',
    idealDate: 'Social gathering, community event, or thoughtful planned surprise.',
    relationshipNeeds: ['Appreciation', 'Social connection', 'Security', 'Emotional expression', 'Shared activities'],
    potentialChallenges: ['People-pleasing', 'Sensitivity to criticism', 'May gossip when stressed', 'Need for approval'],
    growthAreas: ['Develop independence', 'Accept criticism constructively', 'Set boundaries'],
    famousExamples: ['Taylor Swift', 'Jennifer Garner', 'Ed Sheeran'],
    compatibleTypes: ['ISFP', 'ISTP', 'ISFJ', 'ISTJ'],
    challengingTypes: ['INTP', 'INTJ', 'ENTP'],
  },
  ISTP: {
    cognitiveStack: ['Introverted Thinking (Ti)', 'Extraverted Sensing (Se)', 'Introverted Intuition (Ni)', 'Extraverted Feeling (Fe)'],
    communicationStyle: 'Reserved, practical, and action-oriented. You prefer showing over telling and value efficiency.',
    conflictApproach: 'You tend to withdraw from emotional conflicts. Prefer practical problem-solving over discussion.',
    idealDate: 'Hands-on activity, motorsport event, or trying a new skill together.',
    relationshipNeeds: ['Freedom', 'Practical support', 'Space', 'Shared activities', 'Low drama'],
    potentialChallenges: ['Emotional detachment', 'Commitment hesitancy', 'Risk-taking', 'Difficulty with feelings'],
    growthAreas: ['Practice emotional expression', 'Plan for the future', 'Communicate needs'],
    famousExamples: ['Clint Eastwood', 'Bruce Lee', 'Tom Cruise'],
    compatibleTypes: ['ESTJ', 'ENTJ', 'ESFJ', 'ENFJ'],
    challengingTypes: ['ENFJ', 'INFJ', 'ESFJ'],
  },
  ISFP: {
    cognitiveStack: ['Introverted Feeling (Fi)', 'Extraverted Sensing (Se)', 'Introverted Intuition (Ni)', 'Extraverted Thinking (Te)'],
    communicationStyle: 'Gentle, artistic, and authentic. You express yourself through actions and creative outlets.',
    conflictApproach: 'You avoid conflict and may withdraw when upset. Need space to process emotions.',
    idealDate: 'Art class, nature hike, or intimate concert experience.',
    relationshipNeeds: ['Acceptance', 'Aesthetic experiences', 'Freedom', 'Emotional attunement', 'Authenticity'],
    potentialChallenges: ['Difficulty with confrontation', 'May seem passive', 'Sensitivity to criticism', 'Unpredictability'],
    growthAreas: ['Voice needs directly', 'Plan ahead occasionally', 'Accept constructive feedback'],
    famousExamples: ['Prince', 'Michael Jackson', 'Lana Del Rey'],
    compatibleTypes: ['ESTJ', 'ESFJ', 'ENTJ', 'ENFJ'],
    challengingTypes: ['ENTJ', 'ESTJ', 'ENTP'],
  },
  ESTP: {
    cognitiveStack: ['Extraverted Sensing (Se)', 'Introverted Thinking (Ti)', 'Extraverted Feeling (Fe)', 'Introverted Intuition (Ni)'],
    communicationStyle: 'Direct, energetic, and pragmatic. You keep things fun and focus on the present moment.',
    conflictApproach: 'You may enjoy the challenge of conflict. Can be blunt and action-oriented in resolution.',
    idealDate: 'Adventure activity, sports event, or spontaneous night out.',
    relationshipNeeds: ['Excitement', 'Freedom', 'Physical affection', 'Spontaneity', 'Fun'],
    potentialChallenges: ['Commitment issues', 'Impulsivity', 'May seem insensitive', 'Boredom with routine'],
    growthAreas: ['Consider long-term consequences', 'Develop emotional depth', 'Practice patience'],
    famousExamples: ['Ernest Hemingway', 'Madonna', 'Eddie Murphy'],
    compatibleTypes: ['ISTJ', 'ISFJ', 'INTJ', 'INFJ'],
    challengingTypes: ['INFJ', 'INTJ', 'INFP'],
  },
  ESFP: {
    cognitiveStack: ['Extraverted Sensing (Se)', 'Introverted Feeling (Fi)', 'Extraverted Thinking (Te)', 'Introverted Intuition (Ni)'],
    communicationStyle: 'Enthusiastic, playful, and expressive. You bring joy to interactions and live in the moment.',
    conflictApproach: 'You prefer to avoid conflict and may use humor to deflect. Address issues affecting your values.',
    idealDate: 'Party, concert, or any fun social activity with good energy.',
    relationshipNeeds: ['Fun', 'Affection', 'Appreciation', 'Spontaneity', 'Social connection'],
    potentialChallenges: ['Difficulty with planning', 'May avoid serious discussions', 'Easily bored', 'Impulsive decisions'],
    growthAreas: ['Develop long-term thinking', 'Embrace deeper conversations', 'Follow through on plans'],
    famousExamples: ['Marilyn Monroe', 'Elvis Presley', 'Jamie Oliver'],
    compatibleTypes: ['ISTJ', 'ISFJ', 'INTJ', 'ESTJ'],
    challengingTypes: ['INTJ', 'INTP', 'INFJ'],
  },
};

export default function InsightMBTIScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string }>();
  const currentUser = useAppStore((s) => s.currentUser);
  const isHydrated = useAppStore((s) => s.isHydrated);

  // Allow viewing any MBTI type via param, or default to current user's type
  const viewingType = (params.type || currentUser?.mbtiType) as MBTIType | undefined;
  const isOwnType = !params.type || params.type === currentUser?.mbtiType;

  const mbtiInfo = viewingType ? MBTI_DESCRIPTIONS[viewingType] : null;
  const deepInsights = viewingType ? MBTI_DEEP_INSIGHTS[viewingType] : null;

  // Show loading while hydration is in progress
  if (!isHydrated) {
    return (
      <View className="flex-1 bg-[#FDF8F5] items-center justify-center">
        <Brain size={48} color="#81B29A" />
      </View>
    );
  }

  if (!viewingType || !mbtiInfo || !deepInsights) {
    return (
      <View className="flex-1 bg-[#FDF8F5]">
        <SafeAreaView className="flex-1" edges={['top']}>
          <TakeAssessmentPrompt
            title="Personality Type"
            subtitle="Discover your MBTI type, how you communicate, handle conflict, and what you need in a relationship."
            icon={Brain}
            color="#81B29A"
            bgColor="#81B29A15"
            showBackButton={true}
          />
        </SafeAreaView>
      </View>
    );
  }

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
            Your Personality
          </Text>
          <View className="w-12" />
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Hero Card */}
          <Animated.View entering={FadeIn.duration(500)} className="px-6 mb-6">
            <LinearGradient
              colors={['#81B29A', '#6A9A82']}
              style={{ borderRadius: 24, padding: 24 }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text
                    className="text-white/80 text-sm"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    Your Personality Type
                  </Text>
                  <Text
                    className="text-4xl text-white mt-1"
                    style={{ fontFamily: 'Outfit_700Bold' }}
                  >
                    {viewingType}
                  </Text>
                  <Text
                    className="text-xl text-white/90 mt-1"
                    style={{ fontFamily: 'Cormorant_600SemiBold' }}
                  >
                    {mbtiInfo.title}
                  </Text>
                </View>
                <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center">
                  <Brain size={32} color="#FFF" />
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Overview */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)} className="px-6 mb-6">
            <View className="bg-white rounded-2xl p-5">
              <Text
                className="text-lg text-[#2D3436] mb-3"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                Overview
              </Text>
              <Text
                className="text-sm text-[#636E72] leading-6"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                {mbtiInfo.description}
              </Text>

              <View className="flex-row flex-wrap gap-2 mt-4">
                {mbtiInfo.strengths.map((strength) => (
                  <View key={strength} className="bg-[#81B29A]/10 rounded-full px-3 py-1">
                    <Text
                      className="text-xs text-[#81B29A]"
                      style={{ fontFamily: 'Outfit_500Medium' }}
                    >
                      {strength}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Cognitive Functions */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)} className="px-6 mb-6">
            <View className="bg-white rounded-2xl p-5">
              <View className="flex-row items-center mb-3">
                <Lightbulb size={20} color="#81B29A" />
                <Text
                  className="text-lg text-[#2D3436] ml-2"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  How Your Mind Works
                </Text>
              </View>
              <Text
                className="text-xs text-[#A0A8AB] mb-3"
                style={{ fontFamily: 'Outfit_500Medium' }}
              >
                YOUR COGNITIVE STACK
              </Text>
              {deepInsights.cognitiveStack.map((func, index) => (
                <View key={func} className="flex-row items-center mb-2">
                  <View className="w-6 h-6 rounded-full bg-[#81B29A]/20 items-center justify-center mr-3">
                    <Text className="text-xs text-[#81B29A]" style={{ fontFamily: 'Outfit_600SemiBold' }}>
                      {index + 1}
                    </Text>
                  </View>
                  <Text
                    className="text-sm text-[#2D3436]"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    {func}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Communication Style */}
          <Animated.View entering={FadeInDown.delay(300).duration(500)} className="px-6 mb-6">
            <View className="bg-white rounded-2xl p-5">
              <View className="flex-row items-center mb-3">
                <MessageCircle size={20} color="#E07A5F" />
                <Text
                  className="text-lg text-[#2D3436] ml-2"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Communication Style
                </Text>
              </View>
              <Text
                className="text-sm text-[#636E72] leading-6"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                {deepInsights.communicationStyle}
              </Text>
            </View>
          </Animated.View>

          {/* In Dating */}
          <Animated.View entering={FadeInDown.delay(400).duration(500)} className="px-6 mb-6">
            <View className="bg-white rounded-2xl p-5">
              <View className="flex-row items-center mb-3">
                <Heart size={20} color="#D4A574" />
                <Text
                  className="text-lg text-[#2D3436] ml-2"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  In Dating & Relationships
                </Text>
              </View>
              <Text
                className="text-sm text-[#636E72] leading-6 mb-4"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                {mbtiInfo.dating}
              </Text>

              <View className="bg-[#F2CC8F]/10 rounded-xl p-4 mb-4">
                <Text
                  className="text-xs text-[#D4A574] mb-2"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  IDEAL DATE
                </Text>
                <Text
                  className="text-sm text-[#2D3436]"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  {deepInsights.idealDate}
                </Text>
              </View>

              <Text
                className="text-xs text-[#A0A8AB] mb-2"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                YOUR RELATIONSHIP NEEDS
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {deepInsights.relationshipNeeds.map((need) => (
                  <View key={need} className="bg-[#E07A5F]/10 rounded-full px-3 py-1">
                    <Text
                      className="text-xs text-[#E07A5F]"
                      style={{ fontFamily: 'Outfit_500Medium' }}
                    >
                      {need}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Conflict Approach */}
          <Animated.View entering={FadeInDown.delay(500).duration(500)} className="px-6 mb-6">
            <View className="bg-white rounded-2xl p-5">
              <View className="flex-row items-center mb-3">
                <AlertTriangle size={20} color="#F97316" />
                <Text
                  className="text-lg text-[#2D3436] ml-2"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  How You Handle Conflict
                </Text>
              </View>
              <Text
                className="text-sm text-[#636E72] leading-6"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                {deepInsights.conflictApproach}
              </Text>
            </View>
          </Animated.View>

          {/* Potential Challenges */}
          <Animated.View entering={FadeInDown.delay(600).duration(500)} className="px-6 mb-6">
            <View className="bg-white rounded-2xl p-5">
              <View className="flex-row items-center mb-3">
                <Target size={20} color="#636E72" />
                <Text
                  className="text-lg text-[#2D3436] ml-2"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Potential Challenges
                </Text>
              </View>
              {deepInsights.potentialChallenges.map((challenge) => (
                <View key={challenge} className="flex-row items-start mb-2">
                  <View className="w-2 h-2 rounded-full bg-[#E07A5F] mt-2 mr-3" />
                  <Text
                    className="text-sm text-[#636E72] flex-1"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    {challenge}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Growth Areas */}
          <Animated.View entering={FadeInDown.delay(700).duration(500)} className="px-6 mb-6">
            <View className="bg-white rounded-2xl p-5">
              <View className="flex-row items-center mb-3">
                <Sparkles size={20} color="#81B29A" />
                <Text
                  className="text-lg text-[#2D3436] ml-2"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Growth Opportunities
                </Text>
              </View>
              {deepInsights.growthAreas.map((area) => (
                <View key={area} className="flex-row items-start mb-2">
                  <View className="w-2 h-2 rounded-full bg-[#81B29A] mt-2 mr-3" />
                  <Text
                    className="text-sm text-[#636E72] flex-1"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    {area}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Compatible Types */}
          <Animated.View entering={FadeInDown.delay(800).duration(500)} className="px-6 mb-6">
            <View className="bg-white rounded-2xl p-5">
              <View className="flex-row items-center mb-3">
                <Users size={20} color="#81B29A" />
                <Text
                  className="text-lg text-[#2D3436] ml-2"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Best Compatibility
                </Text>
              </View>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {deepInsights.compatibleTypes.map((type) => (
                  <View key={type} className="bg-[#81B29A]/15 rounded-full px-4 py-2">
                    <Text
                      className="text-sm text-[#81B29A]"
                      style={{ fontFamily: 'Outfit_600SemiBold' }}
                    >
                      {type}
                    </Text>
                  </View>
                ))}
              </View>

              <Text
                className="text-xs text-[#A0A8AB] mb-2"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                MAY REQUIRE MORE EFFORT
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {deepInsights.challengingTypes.map((type) => (
                  <View key={type} className="bg-[#F97316]/10 rounded-full px-4 py-2">
                    <Text
                      className="text-sm text-[#F97316]"
                      style={{ fontFamily: 'Outfit_600SemiBold' }}
                    >
                      {type}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Famous Examples */}
          <Animated.View entering={FadeInDown.delay(900).duration(500)} className="px-6 mb-8">
            <View className="bg-white rounded-2xl p-5">
              <View className="flex-row items-center mb-3">
                <Briefcase size={20} color="#636E72" />
                <Text
                  className="text-lg text-[#2D3436] ml-2"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Famous {viewingType}s
                </Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {deepInsights.famousExamples.map((person) => (
                  <View key={person} className="bg-[#F5F0ED] rounded-full px-3 py-1">
                    <Text
                      className="text-xs text-[#636E72]"
                      style={{ fontFamily: 'Outfit_500Medium' }}
                    >
                      {person}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>

          <View className="h-8" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
