import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Shield,
  Heart,
  MessageCircle,
  AlertTriangle,
  Sparkles,
  Users,
  Brain,
  CheckCircle,
  XCircle,
} from 'lucide-react-native';
import * as Haptics from '@/lib/haptics';
import { useAppStore, ATTACHMENT_DESCRIPTIONS, AttachmentStyle } from '@/lib/store';
import TakeAssessmentPrompt from '@/components/TakeAssessmentPrompt';

// Extended attachment data with deeper insights
const ATTACHMENT_DEEP_INSIGHTS: Record<AttachmentStyle, {
  origin: string;
  coreBeliefs: string[];
  triggers: string[];
  behaviors: string[];
  communicationPatterns: string;
  conflictStyle: string;
  intimacyNeeds: string;
  healingPath: string[];
  relationshipTips: string[];
  redFlagsToWatch: string[];
  bestMatches: AttachmentStyle[];
  challengingMatches: AttachmentStyle[];
}> = {
  secure: {
    origin: 'Typically develops from consistent, responsive caregiving in childhood. Parents were emotionally available, validating, and provided a safe base for exploration.',
    coreBeliefs: [
      'I am worthy of love and care',
      'Others can be trusted and relied upon',
      'I can handle difficulties in relationships',
      'Closeness is safe and desirable',
    ],
    triggers: [
      'Major betrayals or repeated disappointments',
      'Extreme stress or trauma',
      'Partners with very insecure attachment',
    ],
    behaviors: [
      'Comfortable with intimacy and independence',
      'Can regulate emotions effectively',
      'Communicates needs clearly',
      'Supportive during partner\'s distress',
      'Maintains healthy boundaries',
    ],
    communicationPatterns: 'Direct and honest communication. You express needs without fear of rejection and listen empathetically. You can discuss difficult topics without becoming defensive or withdrawing.',
    conflictStyle: 'You approach conflicts as problems to solve together rather than threats to the relationship. You can stay calm, hear your partner\'s perspective, and work toward resolution.',
    intimacyNeeds: 'You enjoy closeness without feeling smothered and value independence without feeling distant. You can balance togetherness and autonomy naturally.',
    healingPath: [
      'Continue nurturing emotional awareness',
      'Model healthy attachment for others',
      'Maintain self-care practices',
      'Be patient with less secure partners',
    ],
    relationshipTips: [
      'Your stability helps anxious partners feel safe',
      'Help avoidant partners open up gradually',
      'Don\'t take on responsibility for partner\'s healing',
      'Maintain your boundaries even when partner pushes',
    ],
    redFlagsToWatch: [
      'Partners who consistently violate boundaries',
      'Relationships that pull you toward insecure patterns',
      'Codependent dynamics developing',
    ],
    bestMatches: ['secure', 'anxious', 'avoidant'],
    challengingMatches: ['disorganized'],
  },
  anxious: {
    origin: 'Often develops from inconsistent caregiving—sometimes responsive, sometimes unavailable. This creates hypervigilance to relationship cues and fear of abandonment.',
    coreBeliefs: [
      'I need others\' approval to feel okay',
      'If I\'m not vigilant, I\'ll be abandoned',
      'My needs are too much for others',
      'I must earn love through effort',
    ],
    triggers: [
      'Delayed responses to messages',
      'Partner needing space or alone time',
      'Ambiguous situations or mixed signals',
      'Partner being busy or distracted',
      'Anniversary of past abandonments',
    ],
    behaviors: [
      'Seeking frequent reassurance',
      'Hypervigilant to partner\'s moods',
      'Difficulty self-soothing when distressed',
      'May become clingy when threatened',
      'Strong emotional reactions to perceived distance',
    ],
    communicationPatterns: 'You may over-communicate when anxious, seeking reassurance. Can become emotional in discussions, making it hard to express needs clearly. May apologize excessively or interpret neutral messages negatively.',
    conflictStyle: 'Conflicts can feel like the relationship is ending. You may escalate to get a response, then feel guilty. The fear of abandonment can make you avoid addressing real issues or accept poor treatment.',
    intimacyNeeds: 'You crave closeness and reassurance. Physical presence and verbal affirmation are very important. May struggle when partner needs space, interpreting it as rejection.',
    healingPath: [
      'Develop self-soothing techniques',
      'Build self-worth independent of relationships',
      'Learn to tolerate uncertainty',
      'Practice pausing before reacting',
      'Work with a therapist on childhood patterns',
    ],
    relationshipTips: [
      'Communicate needs without demanding',
      'Trust actions over anxious thoughts',
      'Build a support network beyond your partner',
      'Practice self-care during anxious moments',
      'Choose partners who provide consistent reassurance',
    ],
    redFlagsToWatch: [
      'Partners who use your anxiety against you',
      'Hot-cold or inconsistent partners',
      'Anyone who calls you "too much"',
      'Partners who dismiss your need for reassurance',
    ],
    bestMatches: ['secure'],
    challengingMatches: ['avoidant', 'disorganized'],
  },
  avoidant: {
    origin: 'Typically develops when caregivers were emotionally unavailable, dismissive, or rejecting. Child learned to suppress needs and become self-reliant to avoid rejection.',
    coreBeliefs: [
      'I can only rely on myself',
      'Needing others is weakness',
      'Closeness leads to loss of freedom',
      'Emotions are overwhelming and should be suppressed',
    ],
    triggers: [
      'Partner wanting more closeness',
      'Pressure to commit or define relationship',
      'Emotional conversations or demands',
      'Feeling trapped or suffocated',
      'Partner expressing strong emotions',
    ],
    behaviors: [
      'Valuing independence highly',
      'Difficulty expressing emotions or needs',
      'Withdrawing when partners get close',
      'Keeping relationships at arm\'s length',
      'Focusing on partner\'s flaws when feeling close',
    ],
    communicationPatterns: 'You tend to minimize emotional discussions and may shut down when conversations get intense. Prefer practical problem-solving over emotional processing. May seem dismissive or cold when partner needs emotional support.',
    conflictStyle: 'You often withdraw or stonewall during conflicts. May leave conversations or minimize issues to avoid emotional intensity. Can come across as uncaring even when you do care.',
    intimacyNeeds: 'You need significant personal space and autonomy. Physical intimacy may be easier than emotional intimacy. May feel uncomfortable with too much closeness or dependence.',
    healingPath: [
      'Practice identifying and naming emotions',
      'Challenge beliefs about needing others',
      'Take small risks in sharing feelings',
      'Notice withdrawal patterns and try staying present',
      'Explore childhood experiences with a therapist',
    ],
    relationshipTips: [
      'Communicate your need for space kindly',
      'Push yourself to share feelings occasionally',
      'Choose partners who respect independence',
      'Recognize withdrawal as a pattern, not a solution',
      'Practice staying present during emotional moments',
    ],
    redFlagsToWatch: [
      'Partners who push too hard too fast',
      'Anyone who disrespects your boundaries',
      'Relationships where you feel suffocated',
      'Partners who take your distance personally',
    ],
    bestMatches: ['secure', 'avoidant'],
    challengingMatches: ['anxious', 'disorganized'],
  },
  disorganized: {
    origin: 'Usually develops from frightening or confusing caregiving experiences. The caregiver was both the source of comfort and fear, creating an impossible bind.',
    coreBeliefs: [
      'I want closeness but it\'s dangerous',
      'People I love will hurt me',
      'I don\'t know how to do relationships',
      'Something is fundamentally wrong with me',
    ],
    triggers: [
      'Moments of genuine intimacy',
      'Partner being nurturing or loving',
      'Conflict or raised voices',
      'Feeling vulnerable or exposed',
      'Past trauma anniversaries',
    ],
    behaviors: [
      'Push-pull dynamics in relationships',
      'Difficulty trusting despite wanting connection',
      'Unpredictable emotional responses',
      'May sabotage relationships when going well',
      'Difficulty with consistent emotional regulation',
    ],
    communicationPatterns: 'Communication can be unpredictable—sometimes open, sometimes withdrawn. May send mixed signals without meaning to. Can struggle to express needs clearly due to confusion about what you actually want.',
    conflictStyle: 'Conflicts can trigger strong reactions including both anxious pursuit and avoidant withdrawal. May feel frozen or overwhelmed. Past trauma can be triggered by current relationship difficulties.',
    intimacyNeeds: 'You deeply crave connection but may panic when it\'s offered. Intimacy can feel both wonderful and terrifying. May alternate between seeking closeness and pushing away.',
    healingPath: [
      'Work with a trauma-informed therapist',
      'Learn about your triggers and patterns',
      'Practice grounding techniques',
      'Build safety slowly in relationships',
      'Be patient and compassionate with yourself',
      'Consider EMDR or other trauma therapies',
    ],
    relationshipTips: [
      'Be honest with partners about your patterns',
      'Choose patient, secure partners',
      'Take relationships slowly',
      'Have a safety plan for when you\'re triggered',
      'Celebrate small victories in connection',
    ],
    redFlagsToWatch: [
      'Partners who trigger your trauma',
      'Chaotic or unpredictable relationships',
      'Anyone who pressures you before you\'re ready',
      'Relationships that feel too familiar (in a bad way)',
    ],
    bestMatches: ['secure'],
    challengingMatches: ['anxious', 'avoidant', 'disorganized'],
  },
};

export default function InsightAttachmentScreen() {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const isHydrated = useAppStore((s) => s.isHydrated);
  const attachmentStyle = currentUser?.attachmentStyle as AttachmentStyle | undefined;
  const attachmentInfo = attachmentStyle ? ATTACHMENT_DESCRIPTIONS[attachmentStyle] : null;
  const deepInsights = attachmentStyle ? ATTACHMENT_DEEP_INSIGHTS[attachmentStyle] : null;

  // Show loading while hydration is in progress
  if (!isHydrated) {
    return (
      <View className="flex-1 bg-[#FDF8F5] items-center justify-center">
        <Shield size={48} color="#E07A5F" />
      </View>
    );
  }

  if (!attachmentStyle || !attachmentInfo || !deepInsights) {
    return (
      <View className="flex-1 bg-[#FDF8F5]">
        <SafeAreaView className="flex-1" edges={['top']}>
          <TakeAssessmentPrompt
            title="Attachment Style"
            subtitle="Understand how you bond in relationships, your triggers, and what you need to feel secure with a partner."
            icon={Shield}
            color="#E07A5F"
            bgColor="#E07A5F15"
            showBackButton={true}
          />
        </SafeAreaView>
      </View>
    );
  }

  const styleColors: Record<AttachmentStyle, string> = {
    secure: '#81B29A',
    anxious: '#E07A5F',
    avoidant: '#3B82F6',
    disorganized: '#9333EA',
  };

  const color = styleColors[attachmentStyle];

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
            className="w-11 h-11 rounded-full bg-white/80 items-center justify-center"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ArrowLeft size={24} color="#2D3436" />
          </Pressable>
          <Text
            className="flex-1 text-xl text-[#2D3436] text-center"
            style={{ fontFamily: 'Cormorant_600SemiBold' }}
          >
            Attachment Style
          </Text>
          <View className="w-11" />
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Hero Card - Stacked layout for responsive design */}
          <Animated.View entering={FadeIn.duration(500)} className="px-6 mb-6">
            <LinearGradient
              colors={[color, color + 'DD']}
              style={{ borderRadius: 24, padding: 24 }}
            >
              {/* Icon at top-right, absolute positioned */}
              <View
                className="absolute top-4 right-4 w-14 h-14 rounded-full bg-white/20 items-center justify-center"
              >
                <Shield size={28} color="#FFF" />
              </View>
              {/* Text content with max-width to prevent overlap */}
              <View style={{ paddingRight: 60 }}>
                <Text
                  className="text-white/80 text-sm"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  Your Attachment Style
                </Text>
                <Text
                  className="text-2xl text-white mt-1"
                  style={{ fontFamily: 'Outfit_700Bold' }}
                >
                  {attachmentInfo.title}
                </Text>
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
                Understanding Your Style
              </Text>
              <Text
                className="text-sm text-[#636E72] leading-6"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                {attachmentInfo.description}
              </Text>
            </View>
          </Animated.View>

          {/* Origin */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)} className="px-6 mb-6">
            <View className="bg-white rounded-2xl p-5">
              <View className="flex-row items-center mb-3">
                <Brain size={20} color={color} />
                <Text
                  className="text-lg text-[#2D3436] ml-2"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  How It Develops
                </Text>
              </View>
              <Text
                className="text-sm text-[#636E72] leading-6"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                {deepInsights.origin}
              </Text>
            </View>
          </Animated.View>

          {/* Core Beliefs */}
          <Animated.View entering={FadeInDown.delay(300).duration(500)} className="px-6 mb-6">
            <View className="bg-white rounded-2xl p-5">
              <Text
                className="text-lg text-[#2D3436] mb-3"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                Core Beliefs
              </Text>
              <Text
                className="text-xs text-[#A0A8AB] mb-3"
                style={{ fontFamily: 'Outfit_500Medium' }}
              >
                THOUGHTS THAT MAY DRIVE YOUR BEHAVIOR
              </Text>
              {deepInsights.coreBeliefs.map((belief) => (
                <View key={belief} className="flex-row items-start mb-2">
                  <Text className="text-sm mr-2" style={{ color }}>•</Text>
                  <Text
                    className="text-sm text-[#636E72] flex-1 italic"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    "{belief}"
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Triggers */}
          <Animated.View entering={FadeInDown.delay(400).duration(500)} className="px-6 mb-6">
            <View className="bg-white rounded-2xl p-5">
              <View className="flex-row items-center mb-3">
                <AlertTriangle size={20} color="#F97316" />
                <Text
                  className="text-lg text-[#2D3436] ml-2"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Your Triggers
                </Text>
              </View>
              {deepInsights.triggers.map((trigger) => (
                <View key={trigger} className="flex-row items-start mb-2">
                  <View className="w-2 h-2 rounded-full bg-[#F97316] mt-2 mr-3" />
                  <Text
                    className="text-sm text-[#636E72] flex-1"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    {trigger}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Communication */}
          <Animated.View entering={FadeInDown.delay(500).duration(500)} className="px-6 mb-6">
            <View className="bg-white rounded-2xl p-5">
              <View className="flex-row items-center mb-3">
                <MessageCircle size={20} color={color} />
                <Text
                  className="text-lg text-[#2D3436] ml-2"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Communication Patterns
                </Text>
              </View>
              <Text
                className="text-sm text-[#636E72] leading-6"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                {deepInsights.communicationPatterns}
              </Text>
            </View>
          </Animated.View>

          {/* Conflict Style */}
          <Animated.View entering={FadeInDown.delay(600).duration(500)} className="px-6 mb-6">
            <View className="bg-white rounded-2xl p-5">
              <Text
                className="text-lg text-[#2D3436] mb-3"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                In Conflict
              </Text>
              <Text
                className="text-sm text-[#636E72] leading-6"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                {deepInsights.conflictStyle}
              </Text>
            </View>
          </Animated.View>

          {/* Intimacy */}
          <Animated.View entering={FadeInDown.delay(700).duration(500)} className="px-6 mb-6">
            <View className="bg-white rounded-2xl p-5">
              <View className="flex-row items-center mb-3">
                <Heart size={20} color="#D4A574" />
                <Text
                  className="text-lg text-[#2D3436] ml-2"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Intimacy & Closeness
                </Text>
              </View>
              <Text
                className="text-sm text-[#636E72] leading-6"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                {deepInsights.intimacyNeeds}
              </Text>
            </View>
          </Animated.View>

          {/* Healing Path */}
          <Animated.View entering={FadeInDown.delay(800).duration(500)} className="px-6 mb-6">
            <View className="bg-white rounded-2xl p-5">
              <View className="flex-row items-center mb-3">
                <Sparkles size={20} color="#81B29A" />
                <Text
                  className="text-lg text-[#2D3436] ml-2"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Path to Growth
                </Text>
              </View>
              {deepInsights.healingPath.map((step, index) => (
                <View key={step} className="flex-row items-start mb-3">
                  <View className="w-6 h-6 rounded-full bg-[#81B29A]/20 items-center justify-center mr-3">
                    <Text className="text-xs text-[#81B29A]" style={{ fontFamily: 'Outfit_600SemiBold' }}>
                      {index + 1}
                    </Text>
                  </View>
                  <Text
                    className="text-sm text-[#636E72] flex-1"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    {step}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Relationship Tips */}
          <Animated.View entering={FadeInDown.delay(900).duration(500)} className="px-6 mb-6">
            <View className="bg-white rounded-2xl p-5">
              <View className="flex-row items-center mb-3">
                <CheckCircle size={20} color={color} />
                <Text
                  className="text-lg text-[#2D3436] ml-2"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Relationship Tips
                </Text>
              </View>
              {deepInsights.relationshipTips.map((tip) => (
                <View key={tip} className="flex-row items-start mb-2">
                  <View className="w-2 h-2 rounded-full mt-2 mr-3" style={{ backgroundColor: color }} />
                  <Text
                    className="text-sm text-[#636E72] flex-1"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    {tip}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Red Flags */}
          <Animated.View entering={FadeInDown.delay(1000).duration(500)} className="px-6 mb-6">
            <View className="bg-white rounded-2xl p-5">
              <View className="flex-row items-center mb-3">
                <XCircle size={20} color="#E07A5F" />
                <Text
                  className="text-lg text-[#2D3436] ml-2"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Red Flags to Watch
                </Text>
              </View>
              {deepInsights.redFlagsToWatch.map((flag) => (
                <View key={flag} className="flex-row items-start mb-2">
                  <View className="w-2 h-2 rounded-full bg-[#E07A5F] mt-2 mr-3" />
                  <Text
                    className="text-sm text-[#636E72] flex-1"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    {flag}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Compatibility */}
          <Animated.View entering={FadeInDown.delay(1100).duration(500)} className="px-6 mb-8">
            <View className="bg-white rounded-2xl p-5">
              <View className="flex-row items-center mb-3">
                <Users size={20} color="#81B29A" />
                <Text
                  className="text-lg text-[#2D3436] ml-2"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Compatibility
                </Text>
              </View>

              <Text
                className="text-xs text-[#A0A8AB] mb-2"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                BEST MATCHES
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {deepInsights.bestMatches.map((style) => (
                  <View key={style} className="bg-[#81B29A]/15 rounded-full px-4 py-2">
                    <Text
                      className="text-sm text-[#81B29A] capitalize"
                      style={{ fontFamily: 'Outfit_600SemiBold' }}
                    >
                      {style}
                    </Text>
                  </View>
                ))}
              </View>

              <Text
                className="text-xs text-[#A0A8AB] mb-2"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                MAY BE CHALLENGING
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {deepInsights.challengingMatches.map((style) => (
                  <View key={style} className="bg-[#F97316]/10 rounded-full px-4 py-2">
                    <Text
                      className="text-sm text-[#F97316] capitalize"
                      style={{ fontFamily: 'Outfit_600SemiBold' }}
                    >
                      {style}
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
