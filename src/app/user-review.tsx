import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Star,
  MessageCircle,
  Shield,
  Heart,
  Clock,
  Camera,
  Check,
  AlertTriangle,
} from 'lucide-react-native';
import * as Haptics from '@/lib/haptics';
import { useAppStore } from '@/lib/store';

type ReviewCategory = 'accuracy' | 'communication' | 'respect' | 'safety';

interface ReviewRating {
  category: ReviewCategory;
  rating: number;
  label: string;
  description: string;
  icon: typeof Star;
}

const REVIEW_CATEGORIES: ReviewRating[] = [
  {
    category: 'accuracy',
    rating: 0,
    label: 'Profile Accuracy',
    description: 'Did their profile match reality?',
    icon: Camera,
  },
  {
    category: 'communication',
    rating: 0,
    label: 'Communication',
    description: 'Were they responsive and clear?',
    icon: MessageCircle,
  },
  {
    category: 'respect',
    rating: 0,
    label: 'Respect & Boundaries',
    description: 'Did they respect your boundaries?',
    icon: Heart,
  },
  {
    category: 'safety',
    rating: 0,
    label: 'Safety & Comfort',
    description: 'Did you feel safe and comfortable?',
    icon: Shield,
  },
];

function StarRating({
  rating,
  onRate,
  size = 28,
}: {
  rating: number;
  onRate: (rating: number) => void;
  size?: number;
}) {
  return (
    <View className="flex-row gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          key={star}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onRate(star);
          }}
          className="active:scale-90"
        >
          <Star
            size={size}
            color={star <= rating ? '#F2CC8F' : '#E0D5CC'}
            fill={star <= rating ? '#F2CC8F' : 'transparent'}
          />
        </Pressable>
      ))}
    </View>
  );
}

export default function UserReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ matchId?: string; matchName?: string }>();
  const matchName = params.matchName ?? 'Your Match';

  const [ratings, setRatings] = useState<Record<ReviewCategory, number>>({
    accuracy: 0,
    communication: 0,
    respect: 0,
    safety: 0,
  });
  const [feedback, setFeedback] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [reportConcern, setReportConcern] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRate = (category: ReviewCategory, rating: number) => {
    setRatings((prev) => ({ ...prev, [category]: rating }));
  };

  const canSubmit = Object.values(ratings).every((r) => r > 0) && wouldRecommend !== null;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In production, send to backend
    console.log('[UserReview] Submitted:', {
      matchId: params.matchId,
      ratings,
      feedback,
      wouldRecommend,
      reportConcern,
    });

    setIsSubmitting(false);

    Alert.alert(
      'Thank You!',
      'Your feedback helps create a safer, more respectful community for everyone.',
      [{ text: 'Done', onPress: () => router.back() }]
    );
  };

  const averageRating = Object.values(ratings).reduce((a, b) => a + b, 0) / 4;

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
          <View className="flex-1 items-center">
            <Text
              className="text-xl text-[#2D3436]"
              style={{ fontFamily: 'Cormorant_600SemiBold' }}
            >
              Share Feedback
            </Text>
            <Text
              className="text-xs text-[#636E72]"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              Private & Anonymous
            </Text>
          </View>
          <View className="w-10" />
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {/* Intro */}
          <Animated.View entering={FadeIn.duration(400)} className="mb-6">
            <View className="bg-[#81B29A]/10 rounded-2xl p-4 flex-row items-center">
              <Shield size={24} color="#81B29A" />
              <View className="flex-1 ml-3">
                <Text
                  className="text-sm text-[#2D3436]"
                  style={{ fontFamily: 'Outfit_500Medium' }}
                >
                  Your feedback is confidential
                </Text>
                <Text
                  className="text-xs text-[#636E72]"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  {matchName} won't see your review. It helps improve everyone's experience.
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Rating Categories */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)} className="mb-6">
            <Text
              className="text-sm text-[#A0A8AB] mb-4"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              RATE YOUR EXPERIENCE
            </Text>

            {REVIEW_CATEGORIES.map((category, index) => {
              const Icon = category.icon;
              return (
                <Animated.View
                  key={category.category}
                  entering={FadeInDown.delay(150 + index * 50).duration(400)}
                  className="bg-white rounded-2xl p-4 mb-3 shadow-sm shadow-black/5"
                >
                  <View className="flex-row items-center mb-3">
                    <View className="w-10 h-10 rounded-xl bg-[#E07A5F]/10 items-center justify-center">
                      <Icon size={20} color="#E07A5F" />
                    </View>
                    <View className="flex-1 ml-3">
                      <Text
                        className="text-base text-[#2D3436]"
                        style={{ fontFamily: 'Outfit_600SemiBold' }}
                      >
                        {category.label}
                      </Text>
                      <Text
                        className="text-xs text-[#636E72]"
                        style={{ fontFamily: 'Outfit_400Regular' }}
                      >
                        {category.description}
                      </Text>
                    </View>
                  </View>
                  <StarRating
                    rating={ratings[category.category]}
                    onRate={(r) => handleRate(category.category, r)}
                  />
                </Animated.View>
              );
            })}
          </Animated.View>

          {/* Would Recommend */}
          <Animated.View entering={FadeInDown.delay(400).duration(500)} className="mb-6">
            <Text
              className="text-sm text-[#A0A8AB] mb-3"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              OVERALL IMPRESSION
            </Text>
            <View className="bg-white rounded-2xl p-4 shadow-sm shadow-black/5">
              <Text
                className="text-base text-[#2D3436] mb-3"
                style={{ fontFamily: 'Outfit_500Medium' }}
              >
                Would you recommend {matchName} to others?
              </Text>
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => {
                    Haptics.selectionAsync();
                    setWouldRecommend(true);
                  }}
                  className={`flex-1 rounded-xl py-3 flex-row items-center justify-center ${
                    wouldRecommend === true ? 'bg-[#81B29A]' : 'bg-[#F5F0ED]'
                  }`}
                >
                  <Heart
                    size={18}
                    color={wouldRecommend === true ? '#FFF' : '#636E72'}
                    fill={wouldRecommend === true ? '#FFF' : 'transparent'}
                  />
                  <Text
                    className={`ml-2 ${wouldRecommend === true ? 'text-white' : 'text-[#636E72]'}`}
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    Yes
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    Haptics.selectionAsync();
                    setWouldRecommend(false);
                  }}
                  className={`flex-1 rounded-xl py-3 flex-row items-center justify-center ${
                    wouldRecommend === false ? 'bg-[#E07A5F]' : 'bg-[#F5F0ED]'
                  }`}
                >
                  <Text
                    className={`${wouldRecommend === false ? 'text-white' : 'text-[#636E72]'}`}
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    Not Really
                  </Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>

          {/* Optional Feedback */}
          <Animated.View entering={FadeInDown.delay(500).duration(500)} className="mb-6">
            <Text
              className="text-sm text-[#A0A8AB] mb-3"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              ADDITIONAL COMMENTS (OPTIONAL)
            </Text>
            <View className="bg-white rounded-2xl p-4 shadow-sm shadow-black/5">
              <TextInput
                value={feedback}
                onChangeText={setFeedback}
                placeholder="Any additional thoughts? This helps us improve..."
                placeholderTextColor="#A0A8AB"
                multiline
                numberOfLines={4}
                className="text-[#2D3436] min-h-[100px]"
                style={{ fontFamily: 'Outfit_400Regular', textAlignVertical: 'top' }}
              />
            </View>
          </Animated.View>

          {/* Report Concern */}
          <Animated.View entering={FadeInDown.delay(600).duration(500)} className="mb-8">
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                setReportConcern(!reportConcern);
              }}
              className={`flex-row items-center p-4 rounded-2xl ${
                reportConcern ? 'bg-[#F97316]/10' : 'bg-white'
              } shadow-sm shadow-black/5`}
            >
              <View
                className={`w-6 h-6 rounded-md border-2 items-center justify-center mr-3 ${
                  reportConcern ? 'bg-[#F97316] border-[#F97316]' : 'border-[#D0D5D8]'
                }`}
              >
                {reportConcern && <Check size={14} color="#FFF" strokeWidth={3} />}
              </View>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <AlertTriangle size={16} color="#F97316" />
                  <Text
                    className="text-[#2D3436] ml-2"
                    style={{ fontFamily: 'Outfit_500Medium' }}
                  >
                    Report a safety concern
                  </Text>
                </View>
                <Text
                  className="text-xs text-[#636E72] mt-0.5"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  Our team will review this privately
                </Text>
              </View>
            </Pressable>
          </Animated.View>

          {/* Submit Button */}
          <Animated.View entering={FadeInDown.delay(700).duration(500)} className="mb-8">
            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className={`active:scale-[0.98] ${(!canSubmit || isSubmitting) ? 'opacity-50' : ''}`}
            >
              <LinearGradient
                colors={['#81B29A', '#6A9A82']}
                style={{ paddingVertical: 18, borderRadius: 16, alignItems: 'center' }}
              >
                <Text
                  className="text-white text-lg"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </Text>
              </LinearGradient>
            </Pressable>

            {!canSubmit && (
              <Text
                className="text-xs text-[#A0A8AB] text-center mt-3"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                Please rate all categories and answer the recommendation question
              </Text>
            )}
          </Animated.View>

          <View className="h-8" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
