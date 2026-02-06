/**
 * InnerMatchEQ Web - Dashboard
 *
 * Main dashboard for authenticated web users showing their profile,
 * quiz results, and access to premium features.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User,
  Heart,
  Brain,
  FileText,
  Lock,
  CheckCircle,
  ChevronRight,
  LogOut,
  Settings,
  Star,
  Zap,
} from 'lucide-react-native';
import { api, type UserProfile, type SubscriptionStatus } from '@/lib/api';

interface QuizCard {
  id: string;
  title: string;
  description: string;
  icon: typeof Brain;
  completed: boolean;
  result?: string;
  route: string;
  premium?: boolean;
}

export default function WebDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const authUser = await api.getCurrentUser();
      if (!authUser) {
        router.replace('/auth');
        return;
      }

      const [profile, sub] = await Promise.all([
        api.getUserProfile(authUser.id),
        api.getSubscriptionStatus(authUser.id),
      ]);

      setUser(profile);
      setSubscription(sub);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await api.signOut();
    router.replace('/auth');
  };

  const quizCards: QuizCard[] = [
    {
      id: 'attachment',
      title: 'Attachment Style',
      description: 'Understand how you connect in relationships',
      icon: Heart,
      completed: !!user?.attachmentStyle,
      result: user?.attachmentStyle
        ? user.attachmentStyle.charAt(0).toUpperCase() + user.attachmentStyle.slice(1)
        : undefined,
      route: '/quiz/attachment',
    },
    {
      id: 'mbti',
      title: 'MBTI Personality',
      description: 'Discover your personality type',
      icon: Brain,
      completed: !!user?.mbtiType,
      result: user?.mbtiType ?? undefined,
      route: '/quiz/mbti',
    },
    {
      id: 'loveLanguage',
      title: 'Love Languages',
      description: 'Learn how you give and receive love',
      icon: Heart,
      completed: (user?.loveLanguages?.length ?? 0) > 0,
      result: user?.loveLanguages?.join(', '),
      route: '/quiz/love-language',
    },
    {
      id: 'bigFive',
      title: 'Big Five (OCEAN)',
      description: 'Comprehensive personality analysis',
      icon: Star,
      completed: !!user?.bigFiveScores,
      result: user?.bigFiveScores ? 'Completed' : undefined,
      route: '/quiz/big-five',
      premium: true,
    },
  ];

  const reportCards = [
    {
      id: 'compatibility',
      title: 'Compatibility Report',
      description: 'Detailed analysis of your ideal partner',
      price: '$6.99',
      unlocked: user?.purchasedReports?.compatibility || subscription?.tier === 'elite',
    },
    {
      id: 'redFlags',
      title: 'Red Flag Detection',
      description: 'AI-powered relationship risk analysis',
      price: '$4.99',
      unlocked: user?.purchasedReports?.redFlags || subscription?.tier === 'elite',
    },
    {
      id: 'idealPartner',
      title: 'Ideal Partner Profile',
      description: 'Who you should be looking for',
      price: '$5.99',
      unlocked: user?.purchasedReports?.idealPartner || subscription?.tier === 'elite',
    },
  ];

  if (loading) {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center">
        <ActivityIndicator size="large" color="#f472b6" />
        <Text className="text-slate-400 mt-4">Loading your profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-950">
      {/* Header */}
      <LinearGradient
        colors={['#1e1b4b', '#312e81', '#1e1b4b']}
        style={{ padding: 24, paddingTop: 48 }}
      >
        <View className="flex-row justify-between items-center max-w-5xl mx-auto w-full">
          <View className="flex-row items-center">
            <Heart size={32} color="#f472b6" fill="#f472b6" />
            <Text className="text-2xl font-bold text-white ml-2">InnerMatch</Text>
            <Text className="text-2xl font-light text-pink-400">EQ</Text>
          </View>
          <View className="flex-row gap-4">
            <Pressable
              onPress={() => router.push('/settings')}
              className="p-2 bg-white/10 rounded-lg"
            >
              <Settings size={20} color="white" />
            </Pressable>
            <Pressable onPress={handleSignOut} className="p-2 bg-white/10 rounded-lg">
              <LogOut size={20} color="white" />
            </Pressable>
          </View>
        </View>

        {/* User Card */}
        <View className="max-w-5xl mx-auto w-full mt-8">
          <View className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
            <View className="flex-row items-center">
              <View className="w-20 h-20 bg-pink-500/30 rounded-full items-center justify-center">
                {user?.photos?.[0] ? (
                  <View className="w-full h-full rounded-full overflow-hidden">
                    <Text className="text-3xl text-pink-400">
                      {user.name?.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                ) : (
                  <User size={40} color="#f472b6" />
                )}
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-2xl font-bold text-white">{user?.name || 'User'}</Text>
                <View className="flex-row items-center mt-1">
                  <Zap size={16} color="#fbbf24" />
                  <Text className="text-amber-400 ml-1 font-semibold">
                    EQ Score: {user?.emotionalIntelligence || 0}
                  </Text>
                </View>
                <Text className="text-slate-400 mt-1">
                  {subscription?.tier === 'free'
                    ? 'Free Member'
                    : `${subscription?.tier?.charAt(0).toUpperCase()}${subscription?.tier?.slice(1)} Member`}
                </Text>
              </View>
              {subscription?.tier === 'free' && (
                <Pressable
                  onPress={() => router.push('/paywall')}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-3 rounded-full"
                >
                  <Text className="text-white font-semibold">Upgrade</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <View className="max-w-5xl mx-auto w-full px-6 py-8">
        {/* Assessments Section */}
        <Text className="text-2xl font-bold text-white mb-6">Your Assessments</Text>
        <View className="flex-row flex-wrap gap-4 mb-12">
          {quizCards.map((quiz) => (
            <Pressable
              key={quiz.id}
              onPress={() => router.push(quiz.route as never)}
              className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700 w-72"
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="w-12 h-12 bg-pink-500/20 rounded-xl items-center justify-center">
                  <quiz.icon size={24} color="#f472b6" />
                </View>
                {quiz.completed ? (
                  <View className="bg-green-500/20 px-3 py-1 rounded-full">
                    <Text className="text-green-400 text-sm">Completed</Text>
                  </View>
                ) : quiz.premium && subscription?.tier === 'free' ? (
                  <View className="bg-amber-500/20 px-3 py-1 rounded-full flex-row items-center">
                    <Lock size={12} color="#fbbf24" />
                    <Text className="text-amber-400 text-sm ml-1">Premium</Text>
                  </View>
                ) : (
                  <View className="bg-blue-500/20 px-3 py-1 rounded-full">
                    <Text className="text-blue-400 text-sm">Take Quiz</Text>
                  </View>
                )}
              </View>
              <Text className="text-lg font-semibold text-white mb-1">{quiz.title}</Text>
              <Text className="text-slate-400 text-sm mb-3">{quiz.description}</Text>
              {quiz.result && (
                <View className="bg-pink-500/10 px-3 py-2 rounded-lg">
                  <Text className="text-pink-400 font-medium">{quiz.result}</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>

        {/* Reports Section */}
        <Text className="text-2xl font-bold text-white mb-6">Premium Reports</Text>
        <View className="flex-row flex-wrap gap-4 mb-12">
          {reportCards.map((report) => (
            <Pressable
              key={report.id}
              onPress={() =>
                report.unlocked
                  ? router.push(`/report/${report.id}` as never)
                  : router.push('/paywall' as never)
              }
              className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700 w-72"
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="w-12 h-12 bg-purple-500/20 rounded-xl items-center justify-center">
                  <FileText size={24} color="#a855f7" />
                </View>
                {report.unlocked ? (
                  <View className="bg-green-500/20 px-3 py-1 rounded-full flex-row items-center">
                    <CheckCircle size={12} color="#4ade80" />
                    <Text className="text-green-400 text-sm ml-1">Unlocked</Text>
                  </View>
                ) : (
                  <View className="bg-slate-600/50 px-3 py-1 rounded-full">
                    <Text className="text-slate-300 text-sm">{report.price}</Text>
                  </View>
                )}
              </View>
              <Text className="text-lg font-semibold text-white mb-1">{report.title}</Text>
              <Text className="text-slate-400 text-sm">{report.description}</Text>
              <View className="flex-row items-center mt-3">
                <Text className="text-pink-400 text-sm font-medium">
                  {report.unlocked ? 'View Report' : 'Unlock'}
                </Text>
                <ChevronRight size={16} color="#f472b6" />
              </View>
            </Pressable>
          ))}
        </View>

        {/* Quick Actions */}
        <Text className="text-2xl font-bold text-white mb-6">Quick Actions</Text>
        <View className="flex-row gap-4 flex-wrap">
          <Pressable
            onPress={() => router.push('/insights')}
            className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 p-4 rounded-xl border border-pink-500/30 flex-row items-center"
          >
            <Brain size={20} color="#f472b6" />
            <Text className="text-white font-medium ml-2">View Full Profile Insights</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/report')}
            className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-4 rounded-xl border border-blue-500/30 flex-row items-center"
          >
            <FileText size={20} color="#3b82f6" />
            <Text className="text-white font-medium ml-2">Download Full Report</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
