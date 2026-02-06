import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Image, Share, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import {
  BookOpen,
  AlertTriangle,
  Shield,
  Heart,
  Brain,
  Users,
  MessageCircle,
  ChevronRight,
  Share2,
  Sparkles,
  Eye,
  Lock,
  Flame,
  TrendingUp,
  Target,
  Clock,
} from 'lucide-react-native';
import * as Haptics from '@/lib/haptics';

interface ArticleCardProps {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof BookOpen;
  iconColor: string;
  iconBg: string;
  readTime: string;
  category: string;
  featured?: boolean;
  isQuiz?: boolean;
  onPress: () => void;
  onShare: () => void;
}

function ArticleCard({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  iconBg,
  readTime,
  category,
  featured,
  isQuiz,
  onPress,
  onShare,
}: ArticleCardProps) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      className={`bg-white rounded-2xl p-4 mb-4 active:scale-[0.98] ${featured ? 'border-2 border-[#E07A5F]' : ''}`}
    >
      <View className="flex-row items-start">
        <View
          className="w-11 h-11 rounded-xl items-center justify-center flex-shrink-0"
          style={{ backgroundColor: iconBg }}
        >
          <Icon size={22} color={iconColor} />
        </View>
        <View className="flex-1 ml-3" style={{ minWidth: 0 }}>
          <View className="flex-row items-center mb-1">
            <Text
              className="text-xs text-[#E07A5F]"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
              numberOfLines={1}
            >
              {category}
            </Text>
            <View className="flex-row items-center ml-2">
              <Clock size={10} color="#A0A8AB" />
              <Text
                className="text-xs text-[#A0A8AB] ml-1"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                {readTime}
              </Text>
            </View>
          </View>
          <Text
            className="text-[15px] text-[#2D3436] mb-1"
            style={{ fontFamily: 'Outfit_600SemiBold', lineHeight: 20 }}
            numberOfLines={2}
          >
            {title}
          </Text>
          <Text
            className="text-[13px] text-[#636E72]"
            style={{ fontFamily: 'Outfit_400Regular', lineHeight: 18 }}
            numberOfLines={2}
          >
            {subtitle}
          </Text>
        </View>
      </View>
      <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-[#F0E6E0]">
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onShare();
          }}
          className="flex-row items-center"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Share2 size={16} color="#A0A8AB" />
          <Text
            className="text-xs text-[#A0A8AB] ml-1"
            style={{ fontFamily: 'Outfit_500Medium' }}
          >
            Share
          </Text>
        </Pressable>
        <View className="flex-row items-center">
          <Text
            className="text-sm text-[#E07A5F] mr-1"
            style={{ fontFamily: 'Outfit_500Medium' }}
          >
            {isQuiz ? 'Take Quiz' : 'Read'}
          </Text>
          <ChevronRight size={16} color="#E07A5F" />
        </View>
      </View>
    </Pressable>
  );
}

// Article content data
const ARTICLES = [
  {
    id: 'discover-attachment',
    title: 'What\'s Your Attachment Style?',
    subtitle: 'Take our quiz to discover how you connect in relationships.',
    icon: Shield,
    iconColor: '#81B29A',
    iconBg: '#81B29A15',
    readTime: '3 min',
    category: 'DISCOVER YOU',
    featured: true,
    isQuiz: true,
  },
  {
    id: 'discover-mbti',
    title: 'Discover Your Personality Type',
    subtitle: 'Find out your MBTI type and compatibility.',
    icon: Brain,
    iconColor: '#8B5CF6',
    iconBg: '#8B5CF615',
    readTime: '4 min',
    category: 'DISCOVER YOU',
    isQuiz: true,
  },
  {
    id: 'discover-love-language',
    title: 'What\'s Your Love Language?',
    subtitle: 'Learn how you give and receive love.',
    icon: Heart,
    iconColor: '#E07A5F',
    iconBg: '#E07A5F15',
    readTime: '3 min',
    category: 'DISCOVER YOU',
    isQuiz: true,
  },
  {
    id: 'discover-eq',
    title: 'What\'s Your Emotional Intelligence?',
    subtitle: 'Measure your EQ and relationship skills.',
    icon: Sparkles,
    iconColor: '#F59E0B',
    iconBg: '#F59E0B15',
    readTime: '4 min',
    category: 'DISCOVER YOU',
    isQuiz: true,
  },
  {
    id: 'discover-values',
    title: 'Discover Your Core Values',
    subtitle: 'What matters most to you in relationships?',
    icon: Target,
    iconColor: '#10B981',
    iconBg: '#10B98115',
    readTime: '3 min',
    category: 'DISCOVER YOU',
    isQuiz: true,
  },
  {
    id: 'narcissist-signs',
    title: '10 Warning Signs You\'re Dating a Narcissist',
    subtitle: 'Learn to recognize the subtle signs of narcissistic behavior before you get too invested.',
    icon: AlertTriangle,
    iconColor: '#F97316',
    iconBg: '#F9731615',
    readTime: '5 min',
    category: 'RED FLAGS',
  },
  {
    id: 'attachment-styles',
    title: 'Understanding Your Attachment Style',
    subtitle: 'How your childhood shapes your adult relationships—and what you can do about it.',
    icon: Shield,
    iconColor: '#81B29A',
    iconBg: '#81B29A15',
    readTime: '7 min',
    category: 'PSYCHOLOGY',
  },
  {
    id: 'love-bombing',
    title: 'Love Bombing: When "Too Good" Is Bad',
    subtitle: 'Why excessive attention early on might be a manipulation tactic, not true love.',
    icon: Flame,
    iconColor: '#EF4444',
    iconBg: '#EF444415',
    readTime: '4 min',
    category: 'RED FLAGS',
  },
  {
    id: 'healthy-boundaries',
    title: 'Setting Healthy Boundaries in Dating',
    subtitle: 'How to communicate your needs without pushing people away.',
    icon: Lock,
    iconColor: '#3B82F6',
    iconBg: '#3B82F615',
    readTime: '6 min',
    category: 'SELF-GROWTH',
  },
  {
    id: 'emotional-availability',
    title: 'Is Your Partner Emotionally Available?',
    subtitle: '7 signs they can actually be present in a relationship.',
    icon: Heart,
    iconColor: '#E07A5F',
    iconBg: '#E07A5F15',
    readTime: '5 min',
    category: 'RELATIONSHIPS',
  },
  {
    id: 'gaslighting',
    title: 'How to Recognize Gaslighting',
    subtitle: 'When your reality is being manipulated and how to trust yourself again.',
    icon: Eye,
    iconColor: '#9333EA',
    iconBg: '#9333EA15',
    readTime: '6 min',
    category: 'RED FLAGS',
  },
  {
    id: 'secure-attachment',
    title: 'Becoming More Securely Attached',
    subtitle: 'Practical steps to develop a healthier attachment style over time.',
    icon: TrendingUp,
    iconColor: '#10B981',
    iconBg: '#10B98115',
    readTime: '8 min',
    category: 'SELF-GROWTH',
  },
  {
    id: 'communication-styles',
    title: 'The 4 Communication Styles in Relationships',
    subtitle: 'Identify your style and learn to communicate more effectively.',
    icon: MessageCircle,
    iconColor: '#06B6D4',
    iconBg: '#06B6D415',
    readTime: '5 min',
    category: 'COMMUNICATION',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All', icon: BookOpen },
  { id: 'DISCOVER YOU', label: 'Discover You', icon: Sparkles },
  { id: 'RED FLAGS', label: 'Red Flags', icon: AlertTriangle },
  { id: 'PSYCHOLOGY', label: 'Psychology', icon: Brain },
  { id: 'SELF-GROWTH', label: 'Self-Growth', icon: TrendingUp },
  { id: 'RELATIONSHIPS', label: 'Relationships', icon: Heart },
];

export default function LearnScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredArticles = selectedCategory === 'all'
    ? ARTICLES
    : ARTICLES.filter((a) => a.category === selectedCategory);

  const handleShare = async (article: typeof ARTICLES[0]) => {
    try {
      await Share.share({
        message: `Check out this article: "${article.title}" - Learn more about healthy relationships with InnerMatchEQ! Download: https://innermatcheq.com/download`,
        title: article.title,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleArticlePress = (articleId: string, isQuiz?: boolean) => {
    if (isQuiz) {
      router.push('/assessment');
    } else {
      router.push(`/article/${articleId}`);
    }
  };

  return (
    <View className="flex-1 bg-[#FDF8F5]">
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-6 pt-4 pb-2">
            <Animated.View entering={FadeIn.duration(600)}>
              <Text
                className="text-2xl text-[#2D3436]"
                style={{ fontFamily: 'Cormorant_600SemiBold' }}
              >
                Learn
              </Text>
              <Text
                className="text-sm text-[#636E72] mt-1"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                Relationship wisdom & red flag detection
              </Text>
            </Animated.View>
          </View>

          {/* Featured Banner - Self Discovery */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(600)}
            className="px-6 mb-4"
          >
            <Pressable
              onPress={() => router.push('/assessment')}
              className="active:scale-[0.98]"
            >
              <LinearGradient
                colors={['#81B29A', '#5A9A7D']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 20, padding: 16 }}
              >
                <View className="flex-row items-center mb-2">
                  <View className="bg-white/20 rounded-full px-3 py-1">
                    <Text
                      className="text-white text-xs"
                      style={{ fontFamily: 'Outfit_600SemiBold' }}
                    >
                      DISCOVER YOURSELF
                    </Text>
                  </View>
                  <View className="flex-row items-center ml-2">
                    <Sparkles size={12} color="#FFF" />
                    <Text
                      className="text-white/80 text-xs ml-1"
                      style={{ fontFamily: 'Outfit_400Regular' }}
                    >
                      5 min
                    </Text>
                  </View>
                </View>
                <Text
                  className="text-white text-lg mb-1"
                  style={{ fontFamily: 'Outfit_700Bold', lineHeight: 24 }}
                  numberOfLines={1}
                >
                  What's Your Attachment Style?
                </Text>
                <Text
                  className="text-white/80 text-sm mb-3"
                  style={{ fontFamily: 'Outfit_400Regular', lineHeight: 20 }}
                  numberOfLines={2}
                >
                  Discover how you connect in relationships and find compatible partners.
                </Text>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1 mr-2">
                    <Target size={14} color="#FFF" />
                    <Text
                      className="text-white text-sm ml-1"
                      style={{ fontFamily: 'Outfit_500Medium' }}
                      numberOfLines={1}
                    >
                      Better matches await
                    </Text>
                  </View>
                  <View className="bg-white rounded-full px-4 py-2">
                    <Text
                      className="text-[#81B29A]"
                      style={{ fontFamily: 'Outfit_600SemiBold' }}
                    >
                      Take Quiz
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {/* Category Filters */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(600)}
            className="mb-4"
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24 }}
            >
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedCategory(cat.id);
                  }}
                  className={`flex-row items-center mr-3 px-4 py-2 rounded-full ${
                    selectedCategory === cat.id
                      ? 'bg-[#E07A5F]'
                      : 'bg-white border border-[#E0D5CF]'
                  }`}
                >
                  <cat.icon
                    size={14}
                    color={selectedCategory === cat.id ? '#FFF' : '#636E72'}
                  />
                  <Text
                    className={`ml-2 text-sm ${
                      selectedCategory === cat.id ? 'text-white' : 'text-[#636E72]'
                    }`}
                    style={{ fontFamily: 'Outfit_500Medium' }}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Articles List */}
          <View className="px-6 pb-6">
            {filteredArticles.map((article, index) => (
              <Animated.View
                key={article.id}
                entering={FadeInDown.delay(300 + index * 50).duration(500)}
              >
                <ArticleCard
                  {...article}
                  isQuiz={article.isQuiz}
                  onPress={() => handleArticlePress(article.id, article.isQuiz)}
                  onShare={() => handleShare(article)}
                />
              </Animated.View>
            ))}
          </View>

          {/* Bottom CTA */}
          <View className="px-6 pb-8">
            <View className="bg-[#F0E6E0] rounded-2xl p-5">
              <View className="flex-row items-center mb-3">
                <Sparkles size={20} color="#E07A5F" />
                <Text
                  className="text-base text-[#2D3436] ml-2"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Share Knowledge, Help Others
                </Text>
              </View>
              <Text
                className="text-sm text-[#636E72] mb-4"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                Know someone who could benefit from these articles? Share them and help protect your friends from toxic relationships.
              </Text>
              <Pressable
                onPress={async () => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  await Share.share({
                    message: 'Check out InnerMatchEQ - a dating app that uses psychology to help you find better matches and avoid toxic relationships! Download: https://innermatcheq.com/download',
                  });
                }}
                className="bg-[#E07A5F] rounded-xl py-3 items-center"
              >
                <Text
                  className="text-white"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Share InnerMatchEQ
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
