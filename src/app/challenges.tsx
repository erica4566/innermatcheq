import { View, Text, Pressable, ScrollView, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  Easing,
  ZoomIn,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Trophy,
  Users,
  Heart,
  MessageCircle,
  Sparkles,
  ArrowLeft,
  Share2,
  Crown,
  Target,
  Flame,
  Zap,
  Star,
  Gift,
  ChevronRight,
} from 'lucide-react-native';
import * as Haptics from '@/lib/haptics';
import { useAppStore } from '@/lib/store';

// Challenge types for viral engagement
interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'quiz' | 'comparison' | 'prediction' | 'weekly';
  reward: string;
  participants: number;
  endDate?: string;
  icon: typeof Trophy;
  color: string;
  featured?: boolean;
}

const CHALLENGES: Challenge[] = [
  {
    id: '1',
    title: 'Compatibility Challenge',
    description: 'Invite 3 friends to compare your compatibility scores',
    type: 'comparison',
    reward: '1 Week Premium',
    participants: 12847,
    icon: Heart,
    color: '#E07A5F',
    featured: true,
  },
  {
    id: '2',
    title: 'EQ Battle',
    description: 'Challenge friends to beat your EQ score',
    type: 'quiz',
    reward: '10 Super Likes',
    participants: 8932,
    icon: Zap,
    color: '#81B29A',
  },
  {
    id: '3',
    title: 'Attachment Style Quiz',
    description: 'Share & see if friends can guess your style',
    type: 'prediction',
    reward: '5 Super Likes',
    participants: 15621,
    icon: Target,
    color: '#9333EA',
  },
  {
    id: '4',
    title: 'Weekly Leaderboard',
    description: 'Top referrers get Elite status',
    type: 'weekly',
    reward: 'Elite Status',
    participants: 3421,
    endDate: 'Ends in 3 days',
    icon: Crown,
    color: '#D4A574',
  },
];

// Quick shareable quiz questions for viral loops
const QUICK_QUIZ_QUESTIONS = [
  {
    question: 'What do you think my love language is?',
    options: ['Words of Affirmation', 'Quality Time', 'Physical Touch', 'Acts of Service', 'Gifts'],
  },
  {
    question: 'Guess my attachment style!',
    options: ['Secure', 'Anxious', 'Avoidant', 'Fearful-Avoidant'],
  },
  {
    question: 'What MBTI type do you think I am?',
    options: ['Analyst (NT)', 'Diplomat (NF)', 'Sentinel (SJ)', 'Explorer (SP)'],
  },
];

// Mock leaderboard data
const LEADERBOARD_DATA = [
  { rank: 1, name: 'Sarah M.', referrals: 47, avatar: 'S', isCurrentUser: false },
  { rank: 2, name: 'James K.', referrals: 38, avatar: 'J', isCurrentUser: false },
  { rank: 3, name: 'Emma L.', referrals: 31, avatar: 'E', isCurrentUser: false },
  { rank: 4, name: 'Mike T.', referrals: 24, avatar: 'M', isCurrentUser: false },
  { rank: 5, name: 'You', referrals: 12, avatar: 'Y', isCurrentUser: true },
];

function ChallengeCard({ challenge, onPress }: { challenge: Challenge; onPress: () => void }) {
  const IconComponent = challenge.icon;

  return (
    <Animated.View entering={FadeInDown.duration(400)}>
      <Pressable
        onPress={onPress}
        className={`rounded-2xl overflow-hidden mb-4 active:scale-[0.98] ${
          challenge.featured ? '' : 'bg-white'
        }`}
        style={!challenge.featured ? { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 } : {}}
      >
        {challenge.featured ? (
          <LinearGradient
            colors={[challenge.color, `${challenge.color}CC`]}
            style={{ padding: 20, borderRadius: 16, minHeight: 140 }}
          >
            <View className="flex-row items-start">
              <View className="w-12 h-12 rounded-2xl bg-white/20 items-center justify-center flex-shrink-0">
                <IconComponent size={24} color="#FFF" />
              </View>
              <View className="flex-1 ml-3">
                <View className="flex-row items-center flex-wrap mb-1">
                  <Text
                    className="text-white text-base mr-2"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    {challenge.title}
                  </Text>
                  <View className="bg-white/20 rounded-full px-2 py-0.5">
                    <Text className="text-white text-[10px]" style={{ fontFamily: 'Outfit_600SemiBold' }}>
                      HOT
                    </Text>
                  </View>
                </View>
                <Text
                  className="text-white/80 text-sm mb-3"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                  numberOfLines={2}
                >
                  {challenge.description}
                </Text>
                <View className="flex-row items-center flex-wrap gap-2">
                  <View className="flex-row items-center">
                    <Users size={14} color="#FFF" />
                    <Text
                      className="text-white/90 text-xs ml-1"
                      style={{ fontFamily: 'Outfit_500Medium' }}
                    >
                      {challenge.participants.toLocaleString()} playing
                    </Text>
                  </View>
                  <View className="bg-white/20 rounded-full px-3 py-1.5 flex-row items-center">
                    <Gift size={12} color="#FFF" />
                    <Text
                      className="text-white text-xs ml-1"
                      style={{ fontFamily: 'Outfit_600SemiBold' }}
                    >
                      {challenge.reward}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        ) : (
          <View className="p-4 flex-row items-center">
            <View
              className="w-12 h-12 rounded-xl items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${challenge.color}15` }}
            >
              <IconComponent size={24} color={challenge.color} />
            </View>
            <View className="flex-1 ml-3 mr-2">
              <Text
                className="text-[#2D3436] text-base"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
                numberOfLines={1}
              >
                {challenge.title}
              </Text>
              <Text
                className="text-[#636E72] text-sm"
                style={{ fontFamily: 'Outfit_400Regular' }}
                numberOfLines={1}
              >
                {challenge.participants.toLocaleString()} playing • {challenge.reward}
              </Text>
            </View>
            <ChevronRight size={20} color="#A0A8AB" />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function ChallengesScreen() {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const [selectedQuiz, setSelectedQuiz] = useState<number | null>(null);

  const handleShareQuiz = async (quizIndex: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const quiz = QUICK_QUIZ_QUESTIONS[quizIndex];

    try {
      await Share.share({
        message: `🔮 ${quiz.question}

Options:
${quiz.options.map((o, i) => `${i + 1}. ${o}`).join('\n')}

Reply with your guess! Then take your own quiz at InnerMatchEQ 💕

#InnerMatchEQ #PersonalityQuiz`,
        title: 'Quiz Challenge',
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleChallenge = async (challenge: Challenge) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const messages: Record<string, string> = {
      comparison: `🔥 I challenge you to a Compatibility Battle on InnerMatchEQ!

Let's see how compatible we really are... Take the quiz and compare our results!

Download: www.innermatcheq.com/challenge/${currentUser?.id || 'join'}`,
      quiz: `⚡ Think you can beat my EQ Score of ${currentUser?.emotionalIntelligence || 75}?

Take the InnerMatchEQ quiz and prove it!

www.innermatcheq.com/quiz`,
      prediction: `🎯 Can you guess my attachment style?

A) Secure
B) Anxious
C) Avoidant
D) Fearful-Avoidant

Reply with your guess! Find out yours at www.innermatcheq.com`,
      weekly: `🏆 I'm competing in the InnerMatchEQ Weekly Leaderboard!

Help me win Elite status by joining with my code: ${currentUser?.id || 'INNER123'}

www.innermatcheq.com`,
    };

    try {
      await Share.share({
        message: messages[challenge.type],
        title: challenge.title,
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
              router.back();
            }}
            className="w-10 h-10 items-center justify-center"
          >
            <ArrowLeft size={24} color="#2D3436" />
          </Pressable>
          <Text
            className="flex-1 text-xl text-[#2D3436] text-center"
            style={{ fontFamily: 'Cormorant_600SemiBold' }}
          >
            Challenges
          </Text>
          <View className="w-10" />
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {/* Stats Banner */}
          <Animated.View entering={FadeIn.duration(500)} className="mb-6">
            <LinearGradient
              colors={['#2D3436', '#4A5568']}
              style={{ borderRadius: 20, padding: 20 }}
            >
              <View className="flex-row items-center justify-around">
                <View className="items-center">
                  <View className="flex-row items-center">
                    <Flame size={18} color="#F97316" />
                    <Text
                      className="text-white text-2xl ml-1"
                      style={{ fontFamily: 'Outfit_700Bold' }}
                    >
                      3
                    </Text>
                  </View>
                  <Text
                    className="text-white/60 text-xs"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    Day Streak
                  </Text>
                </View>
                <View className="w-px h-10 bg-white/20" />
                <View className="items-center">
                  <View className="flex-row items-center">
                    <Star size={18} color="#F2CC8F" />
                    <Text
                      className="text-white text-2xl ml-1"
                      style={{ fontFamily: 'Outfit_700Bold' }}
                    >
                      {currentUser?.emotionalIntelligence || 75}
                    </Text>
                  </View>
                  <Text
                    className="text-white/60 text-xs"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    EQ Score
                  </Text>
                </View>
                <View className="w-px h-10 bg-white/20" />
                <View className="items-center">
                  <View className="flex-row items-center">
                    <Trophy size={18} color="#81B29A" />
                    <Text
                      className="text-white text-2xl ml-1"
                      style={{ fontFamily: 'Outfit_700Bold' }}
                    >
                      2
                    </Text>
                  </View>
                  <Text
                    className="text-white/60 text-xs"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    Wins
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Quick Share Quizzes */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)} className="mb-6">
            <Text
              className="text-[#2D3436] text-lg mb-3"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              Quick Share Quizzes
            </Text>
            <Text
              className="text-[#636E72] text-sm mb-4"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              Let friends guess about you - goes viral!
            </Text>

            <View className="flex-row gap-3">
              {QUICK_QUIZ_QUESTIONS.map((quiz, index) => (
                <Pressable
                  key={index}
                  onPress={() => handleShareQuiz(index)}
                  className="flex-1 bg-white rounded-2xl p-4 items-center active:scale-[0.95]"
                  style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 }}
                >
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mb-2"
                    style={{
                      backgroundColor:
                        index === 0 ? '#E07A5F15' : index === 1 ? '#81B29A15' : '#9333EA15',
                    }}
                  >
                    {index === 0 ? (
                      <Heart size={22} color="#E07A5F" />
                    ) : index === 1 ? (
                      <Target size={22} color="#81B29A" />
                    ) : (
                      <Sparkles size={22} color="#9333EA" />
                    )}
                  </View>
                  <Text
                    className="text-[#2D3436] text-xs text-center"
                    style={{ fontFamily: 'Outfit_500Medium' }}
                    numberOfLines={2}
                  >
                    {index === 0 ? 'Love Language' : index === 1 ? 'Attachment' : 'MBTI'}
                  </Text>
                  <View className="mt-2 bg-[#F5F0ED] rounded-full px-2 py-0.5">
                    <Text
                      className="text-[#636E72] text-[10px]"
                      style={{ fontFamily: 'Outfit_500Medium' }}
                    >
                      TAP TO SHARE
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {/* Active Challenges */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)} className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text
                className="text-[#2D3436] text-lg"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                Active Challenges
              </Text>
              <View className="bg-[#E07A5F]/10 rounded-full px-2 py-0.5">
                <Text
                  className="text-[#E07A5F] text-xs"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  {CHALLENGES.length} LIVE
                </Text>
              </View>
            </View>

            {CHALLENGES.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onPress={() => handleChallenge(challenge)}
              />
            ))}
          </Animated.View>

          {/* Weekly Leaderboard */}
          <Animated.View entering={FadeInDown.delay(250).duration(500)} className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Crown size={20} color="#D4A574" />
                <Text
                  className="text-[#2D3436] text-lg ml-2"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Weekly Leaderboard
                </Text>
              </View>
              <View className="bg-[#D4A574]/10 rounded-full px-3 py-1">
                <Text
                  className="text-[#D4A574] text-xs"
                  style={{ fontFamily: 'Outfit_500Medium' }}
                >
                  Ends in 3 days
                </Text>
              </View>
            </View>

            <View className="bg-white rounded-2xl overflow-hidden" style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 }}>
              {/* Prize Banner */}
              <LinearGradient
                colors={['#D4A574', '#B8956A']}
                style={{ padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
              >
                <Trophy size={18} color="#FFF" />
                <Text className="text-white text-sm ml-2" style={{ fontFamily: 'Outfit_600SemiBold' }}>
                  Top 3 win Elite Status for 1 month!
                </Text>
              </LinearGradient>

              {/* Leaderboard List */}
              {LEADERBOARD_DATA.map((entry, index) => (
                <View
                  key={entry.rank}
                  className={`flex-row items-center p-4 ${index < LEADERBOARD_DATA.length - 1 ? 'border-b border-[#F0E6E0]' : ''} ${entry.isCurrentUser ? 'bg-[#E07A5F]/5' : ''}`}
                >
                  {/* Rank */}
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center ${
                      entry.rank === 1 ? 'bg-[#FFD700]' :
                      entry.rank === 2 ? 'bg-[#C0C0C0]' :
                      entry.rank === 3 ? 'bg-[#CD7F32]' :
                      'bg-[#F0E6E0]'
                    }`}
                  >
                    <Text
                      className={`text-xs ${entry.rank <= 3 ? 'text-white' : 'text-[#636E72]'}`}
                      style={{ fontFamily: 'Outfit_700Bold' }}
                    >
                      {entry.rank}
                    </Text>
                  </View>

                  {/* Avatar */}
                  <View
                    className={`w-10 h-10 rounded-full ml-3 items-center justify-center ${entry.isCurrentUser ? 'bg-[#E07A5F]' : 'bg-[#F0E6E0]'}`}
                  >
                    <Text
                      className={`text-base ${entry.isCurrentUser ? 'text-white' : 'text-[#2D3436]'}`}
                      style={{ fontFamily: 'Outfit_600SemiBold' }}
                    >
                      {entry.avatar}
                    </Text>
                  </View>

                  {/* Name */}
                  <View className="flex-1 ml-3">
                    <Text
                      className={`text-sm ${entry.isCurrentUser ? 'text-[#E07A5F]' : 'text-[#2D3436]'}`}
                      style={{ fontFamily: entry.isCurrentUser ? 'Outfit_600SemiBold' : 'Outfit_500Medium' }}
                    >
                      {entry.name}
                    </Text>
                  </View>

                  {/* Referrals */}
                  <View className="flex-row items-center">
                    <Users size={14} color={entry.isCurrentUser ? '#E07A5F' : '#81B29A'} />
                    <Text
                      className={`text-sm ml-1 ${entry.isCurrentUser ? 'text-[#E07A5F]' : 'text-[#81B29A]'}`}
                      style={{ fontFamily: 'Outfit_600SemiBold' }}
                    >
                      {entry.referrals}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* How Leaderboard Works */}
            <Text
              className="text-[#9CA3AF] text-xs text-center mt-3 px-4"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              Invite friends to climb the leaderboard. Rankings reset every Monday.
            </Text>
          </Animated.View>

          {/* How Challenges Work */}
          <Animated.View entering={FadeInUp.delay(300).duration(500)} className="mb-8">
            <View className="bg-[#F5F0ED] rounded-2xl p-5">
              <Text
                className="text-[#2D3436] text-base mb-4"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                How Challenges Work
              </Text>
              {[
                { step: '1', text: 'Pick a challenge to share with friends', icon: '🎯' },
                { step: '2', text: 'They take the quiz and compare with you', icon: '📊' },
                { step: '3', text: 'Both earn rewards when they join', icon: '🎁' },
              ].map((item, index) => (
                <View key={item.step} className={`flex-row items-center ${index < 2 ? 'mb-3' : ''}`}>
                  <Text className="text-2xl mr-3">{item.icon}</Text>
                  <Text
                    className="text-[#636E72] text-sm flex-1"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    {item.text}
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
