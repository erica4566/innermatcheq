import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withSpring, withSequence, withTiming } from 'react-native-reanimated';
import {
  ChevronLeft,
  Shield,
  CheckCircle,
  Camera,
  CreditCard,
  FileSearch,
  Lock,
  Star,
  BadgeCheck,
  Clock,
  AlertCircle,
  Sparkles,
} from 'lucide-react-native';
import * as Haptics from '@/lib/haptics';
import { useAppStore, UserProfile } from '@/lib/store';
import { updateUserProfile, getCurrentUser } from '@/lib/db';
import { useState } from 'react';

type VerificationType = 'photo' | 'id' | 'background' | 'credit';

interface VerificationOption {
  type: VerificationType;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof Shield;
  iconColor: string;
  iconBg: string;
  benefits: string[];
  isPremium: boolean;
  price?: string;
}

const verificationOptions: VerificationOption[] = [
  {
    type: 'photo',
    title: 'Photo Verification',
    subtitle: 'Prove you are who you say you are',
    description: 'Take a selfie matching a specific pose to verify your identity matches your profile photos.',
    icon: Camera,
    iconColor: '#3B82F6',
    iconBg: '#3B82F615',
    benefits: ['Blue verified badge', 'Higher visibility in search', 'More trust from matches'],
    isPremium: false,
  },
  {
    type: 'id',
    title: 'ID Verification',
    subtitle: 'Government ID check',
    description: 'Securely verify your identity with a government-issued ID. Your data is encrypted and never shared.',
    icon: FileSearch,
    iconColor: '#8B5CF6',
    iconBg: '#8B5CF615',
    benefits: ['Purple verified badge', 'Priority in recommendations', 'Access to verified-only matches'],
    isPremium: false,
  },
  {
    type: 'background',
    title: 'Background Check',
    subtitle: 'Criminal & public records search',
    description: 'Comprehensive background check including criminal records, sex offender registry, and public records.',
    icon: Shield,
    iconColor: '#10B981',
    iconBg: '#10B98115',
    benefits: ['Green trust badge', 'Featured in "Trusted" section', 'Higher match quality', 'Peace of mind for matches'],
    isPremium: true,
    price: '$24.99',
  },
  {
    type: 'credit',
    title: 'Credit Check',
    subtitle: 'Financial responsibility',
    description: 'Verify your financial standing with a soft credit check. Shows responsibility without sharing exact scores.',
    icon: CreditCard,
    iconColor: '#F59E0B',
    iconBg: '#F59E0B15',
    benefits: ['Gold trust badge', 'Attract serious partners', 'Shows financial responsibility', 'Premium profile placement'],
    isPremium: true,
    price: '$19.99',
  },
];

function VerificationCard({
  option,
  isCompleted,
  isPending,
  onPress,
  delay,
}: {
  option: VerificationOption;
  isCompleted: boolean;
  isPending: boolean;
  onPress: () => void;
  delay: number;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.97, { duration: 100 }),
      withSpring(1, { damping: 15 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const Icon = option.icon;

  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(500)} style={animatedStyle}>
      <Pressable onPress={handlePress} className="mb-4">
        <View className={`bg-white rounded-2xl overflow-hidden shadow-sm shadow-black/5 ${isCompleted ? 'border-2 border-green-400' : ''}`}>
          {/* Header */}
          <View className="p-5">
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-row items-center flex-1">
                <View
                  className="w-12 h-12 rounded-xl items-center justify-center"
                  style={{ backgroundColor: option.iconBg }}
                >
                  <Icon size={24} color={option.iconColor} />
                </View>
                <View className="flex-1 ml-4">
                  <View className="flex-row items-center">
                    <Text
                      className="text-lg text-[#2D3436]"
                      style={{ fontFamily: 'Outfit_600SemiBold' }}
                    >
                      {option.title}
                    </Text>
                    {option.isPremium && (
                      <View className="ml-2 bg-amber-100 px-2 py-0.5 rounded-full">
                        <Text
                          className="text-amber-700 text-xs"
                          style={{ fontFamily: 'Outfit_600SemiBold' }}
                        >
                          Premium
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text
                    className="text-sm text-[#636E72] mt-0.5"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    {option.subtitle}
                  </Text>
                </View>
              </View>

              {/* Status badge */}
              {isCompleted ? (
                <View className="bg-green-100 px-3 py-1.5 rounded-full flex-row items-center">
                  <CheckCircle size={14} color="#10B981" />
                  <Text
                    className="text-green-700 ml-1 text-xs"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    Verified
                  </Text>
                </View>
              ) : isPending ? (
                <View className="bg-amber-100 px-3 py-1.5 rounded-full flex-row items-center">
                  <Clock size={14} color="#F59E0B" />
                  <Text
                    className="text-amber-700 ml-1 text-xs"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    Pending
                  </Text>
                </View>
              ) : option.price ? (
                <View className="bg-[#E07A5F]/10 px-3 py-1.5 rounded-full">
                  <Text
                    className="text-[#E07A5F] text-sm"
                    style={{ fontFamily: 'Outfit_700Bold' }}
                  >
                    {option.price}
                  </Text>
                </View>
              ) : null}
            </View>

            <Text
              className="text-sm text-[#636E72] mb-4"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              {option.description}
            </Text>

            {/* Benefits */}
            <View className="gap-2">
              {option.benefits.map((benefit, index) => (
                <View key={index} className="flex-row items-center">
                  <View className="w-5 h-5 rounded-full bg-[#81B29A]/15 items-center justify-center">
                    <CheckCircle size={12} color="#81B29A" />
                  </View>
                  <Text
                    className="text-sm text-[#2D3436] ml-2"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    {benefit}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Action button */}
          {!isCompleted && (
            <View className="px-5 pb-5">
              <LinearGradient
                colors={isCompleted ? ['#81B29A', '#6A9A82'] : [option.iconColor, option.iconColor + 'CC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 12, paddingVertical: 12 }}
              >
                <Text
                  className="text-white text-center"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  {isPending ? 'Check Status' : 'Start Verification'}
                </Text>
              </LinearGradient>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function VerificationScreen() {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const updateCurrentUser = useAppStore((s) => s.updateCurrentUser);
  const [pendingVerifications, setPendingVerifications] = useState<Set<VerificationType>>(new Set());

  const verificationChecks = currentUser?.verificationChecks || {};

  const isVerificationComplete = (type: VerificationType): boolean => {
    switch (type) {
      case 'photo':
        return verificationChecks.photoVerified === true;
      case 'id':
        return verificationChecks.idVerified === true;
      case 'background':
        return verificationChecks.backgroundCheck === true;
      case 'credit':
        return verificationChecks.creditCheck === true;
      default:
        return false;
    }
  };

  const getCompletedCount = (): number => {
    return verificationOptions.filter((opt) => isVerificationComplete(opt.type)).length;
  };

  const handleVerification = async (option: VerificationOption) => {
    if (isVerificationComplete(option.type)) {
      Alert.alert(
        'Already Verified',
        `Your ${option.title.toLowerCase()} has been completed. Thank you for building trust in our community!`
      );
      return;
    }

    if (pendingVerifications.has(option.type)) {
      Alert.alert(
        'Verification Pending',
        `Your ${option.title.toLowerCase()} is being processed. This usually takes 1-3 business days.`,
        [{ text: 'OK' }]
      );
      return;
    }

    // Show confirmation dialog
    Alert.alert(
      option.title,
      option.isPremium
        ? `This verification costs ${option.price}. Would you like to proceed?`
        : 'Would you like to start this verification process?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: option.isPremium ? `Pay ${option.price}` : 'Start',
          onPress: () => processVerification(option),
        },
      ]
    );
  };

  const processVerification = async (option: VerificationOption) => {
    // IMPORTANT: This is a simulated verification for demonstration purposes only.
    // In a production app, this must integrate with real verification services:
    // - Photo verification: Onfido, Jumio, AWS Rekognition
    // - ID verification: Onfido, Jumio, Veriff
    // - Background check: Checkr, GoodHire, Sterling
    // - Credit check: Experian, TransUnion, Equifax APIs
    //
    // WARNING: Never allow client-side code to directly set verification status
    // in production. All verification must be server-side validated.

    if (!__DEV__) {
      Alert.alert(
        'Verification Service',
        'Verification services are being set up. Please check back soon.',
        [{ text: 'OK' }]
      );
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Simulate verification process (DEV ONLY)
    setPendingVerifications((prev) => new Set(prev).add(option.type));

    // In a real app, this would call an API to initiate the verification
    // For demo, we'll simulate completion after a short delay
    setTimeout(async () => {
      const user = await getCurrentUser();
      if (!user) return;

      const newChecks = {
        ...verificationChecks,
        [option.type === 'photo' ? 'photoVerified' :
         option.type === 'id' ? 'idVerified' :
         option.type === 'background' ? 'backgroundCheck' : 'creditCheck']: true,
      };

      // Determine the highest verification level achieved
      let highestLevel: UserProfile['verificationLevel'] = 'none';
      if (newChecks.photoVerified) highestLevel = 'photo';
      if (newChecks.idVerified) highestLevel = 'id';
      if (newChecks.backgroundCheck) highestLevel = 'background';
      if (newChecks.creditCheck) highestLevel = 'credit';

      await updateUserProfile(user.uid, {
        verificationChecks: newChecks,
        verificationLevel: highestLevel,
        isVerified: true,
      });

      updateCurrentUser({
        verificationChecks: newChecks,
        verificationLevel: highestLevel,
        isVerified: true,
      });

      setPendingVerifications((prev) => {
        const newSet = new Set(prev);
        newSet.delete(option.type);
        return newSet;
      });

      Alert.alert(
        'Demo Verification Complete',
        `[DEV MODE] Your ${option.title.toLowerCase()} has been simulated. In production, this would require real verification.`,
        [{ text: 'OK' }]
      );
    }, 2000);
  };

  const completedCount = getCompletedCount();
  const trustScore = Math.round((completedCount / verificationOptions.length) * 100);

  return (
    <View className="flex-1 bg-[#FDF8F5]">
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <Animated.View
          entering={FadeIn.duration(400)}
          className="flex-row items-center justify-between px-6 py-4"
        >
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              router.back();
            }}
            className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm shadow-black/5"
          >
            <ChevronLeft size={24} color="#2D3436" />
          </Pressable>
          <Text
            className="text-xl text-[#2D3436]"
            style={{ fontFamily: 'Cormorant_600SemiBold' }}
          >
            Verification Center
          </Text>
          <View className="w-10" />
        </Animated.View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Trust Score Card */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(500)}
            className="mx-6 mb-6"
          >
            <LinearGradient
              colors={['#1a1a2e', '#2d2d44']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 20, padding: 20 }}
            >
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <View className="w-14 h-14 rounded-full bg-white/10 items-center justify-center">
                    <BadgeCheck size={28} color="#F2CC8F" />
                  </View>
                  <View className="ml-4">
                    <Text
                      className="text-white text-lg"
                      style={{ fontFamily: 'Outfit_600SemiBold' }}
                    >
                      Trust Score
                    </Text>
                    <Text
                      className="text-white/70 text-sm"
                      style={{ fontFamily: 'Outfit_400Regular' }}
                    >
                      {completedCount} of {verificationOptions.length} verified
                    </Text>
                  </View>
                </View>
                <View className="items-center">
                  <Text
                    className="text-4xl text-[#F2CC8F]"
                    style={{ fontFamily: 'Outfit_700Bold' }}
                  >
                    {trustScore}%
                  </Text>
                </View>
              </View>

              {/* Progress bar */}
              <View className="h-2 bg-white/10 rounded-full overflow-hidden">
                <View
                  className="h-full bg-[#F2CC8F] rounded-full"
                  style={{ width: `${trustScore}%` }}
                />
              </View>

              <View className="flex-row items-center mt-4">
                <Sparkles size={16} color="#F2CC8F" />
                <Text
                  className="text-white/80 text-sm ml-2"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  Higher trust = more quality matches
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Info Banner */}
          <Animated.View
            entering={FadeInDown.delay(150).duration(500)}
            className="mx-6 mb-6 bg-blue-50 rounded-2xl p-4 flex-row"
          >
            <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center">
              <Lock size={20} color="#3B82F6" />
            </View>
            <View className="flex-1 ml-3">
              <Text
                className="text-blue-900 text-sm"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                Your data is secure
              </Text>
              <Text
                className="text-blue-700 text-xs mt-0.5"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                All verification data is encrypted and never shared with other users or third parties.
              </Text>
            </View>
          </Animated.View>

          {/* Verification Options */}
          <View className="px-6">
            <Animated.View entering={FadeInDown.delay(200).duration(500)}>
              <Text
                className="text-sm text-[#A0A8AB] mb-4"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                VERIFICATION OPTIONS
              </Text>
            </Animated.View>

            {verificationOptions.map((option, index) => (
              <VerificationCard
                key={option.type}
                option={option}
                isCompleted={isVerificationComplete(option.type)}
                isPending={pendingVerifications.has(option.type)}
                onPress={() => handleVerification(option)}
                delay={250 + index * 100}
              />
            ))}
          </View>

          {/* Bottom Info */}
          <Animated.View
            entering={FadeInDown.delay(650).duration(500)}
            className="mx-6 mb-10 mt-2"
          >
            <View className="bg-amber-50 rounded-2xl p-4 flex-row">
              <AlertCircle size={20} color="#F59E0B" />
              <View className="flex-1 ml-3">
                <Text
                  className="text-amber-900 text-sm"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Why verify?
                </Text>
                <Text
                  className="text-amber-700 text-xs mt-1"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  Verified users receive 3x more matches and are 5x more likely to make meaningful connections. Show potential partners you're serious about dating.
                </Text>
              </View>
            </View>
          </Animated.View>

          <View className="h-10" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
