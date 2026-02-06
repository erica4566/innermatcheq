import React from 'react';
import { View, Text, Pressable, ScrollView, Share, Dimensions, Linking, Alert, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import {
  ArrowLeft,
  Brain,
  Heart,
  Shield,
  Sparkles,
  Lock,
  Crown,
  Share2,
  Download,
  CheckCircle2,
  AlertTriangle,
  Users,
  TrendingUp,
  Target,
  Zap,
  Star,
  MessageCircle,
  ChevronRight,
  Mail,
} from 'lucide-react-native';
import * as Haptics from '@/lib/haptics';
import {
  useAppStore,
  MBTI_DESCRIPTIONS,
  ATTACHMENT_DESCRIPTIONS,
  LOVE_LANGUAGE_DESCRIPTIONS,
  MBTIType,
  AttachmentStyle,
  LoveLanguage,
} from '@/lib/store';
import { AssessmentTier, reportTiers, reportSections } from '@/lib/assessmentData';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getOfferings, purchasePackage, isRevenueCatEnabled, hasEntitlement } from '@/lib/revenuecatClient';
import type { PurchasesPackage } from 'react-native-purchases';

const { width } = Dimensions.get('window');

interface ReportCardProps {
  title: string;
  subtitle?: string;
  icon: typeof Brain;
  iconColor: string;
  iconBg: string;
  children: React.ReactNode;
  locked?: boolean;
  index: number;
  onUnlock?: () => void;
  onPress?: () => void;
  price?: string;
  reportKey?: string;
}

function ReportCard({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  iconBg,
  children,
  locked,
  index,
  onUnlock,
  onPress,
  price,
}: ReportCardProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (locked && onUnlock) {
      onUnlock();
    } else if (onPress) {
      onPress();
    }
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(500)}>
      <Pressable
        onPress={handlePress}
        className="bg-white rounded-2xl p-5 mb-4 shadow-sm shadow-black/5 active:scale-[0.98]"
      >
        <View className="flex-row items-center mb-4">
          <View
            className="w-12 h-12 rounded-xl items-center justify-center"
            style={{ backgroundColor: iconBg }}
          >
            <Icon size={24} color={iconColor} />
          </View>
          <View className="flex-1 ml-4">
            <Text
              className="text-lg text-[#2D3436]"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                className="text-sm text-[#636E72]"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                {subtitle}
              </Text>
            )}
          </View>
          {locked ? (
            <View className="flex-col">
              {price && (
                <View className="bg-[#E07A5F]/10 rounded-full px-3 py-1 mb-2 self-end">
                  <Text
                    className="text-sm text-[#E07A5F]"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    {price}
                  </Text>
                </View>
              )}
              <Lock size={18} color="#D4A574" />
            </View>
          ) : onPress ? (
            <View className="bg-[#F5F0ED] rounded-full p-2">
              <ChevronRight size={16} color="#636E72" />
            </View>
          ) : null}
        </View>

        {locked ? (
          <View className="bg-[#F5F0ED] rounded-xl p-4 items-center">
            <Lock size={20} color="#D4A574" />
            <Text
              className="text-sm text-[#636E72] text-center mt-2"
              style={{ fontFamily: 'Outfit_500Medium' }}
            >
              Tap to unlock this report
            </Text>
            {price && (
              <Text
                className="text-xs text-[#E07A5F] mt-1"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                One-time purchase: {price}
              </Text>
            )}
          </View>
        ) : (
          children
        )}
      </Pressable>
    </Animated.View>
  );
}

function CompatibilityBar({ label, value, color }: { label: string; value: number; color: string }) {
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withSpring(value, { damping: 15 });
  }, [value]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }));

  return (
    <View className="mb-3">
      <View className="flex-row justify-between mb-1">
        <Text
          className="text-sm text-[#636E72]"
          style={{ fontFamily: 'Outfit_400Regular' }}
        >
          {label}
        </Text>
        <Text
          className="text-sm"
          style={{ fontFamily: 'Outfit_600SemiBold', color }}
        >
          {value}%
        </Text>
      </View>
      <View className="h-2 bg-[#F0E6E0] rounded-full overflow-hidden">
        <Animated.View
          className="h-full rounded-full"
          style={[barStyle, { backgroundColor: color }]}
        />
      </View>
    </View>
  );
}

export default function ReportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tier?: string }>();
  const currentUser = useAppStore((s) => s.currentUser);
  const updateCurrentUser = useAppStore((s) => s.updateCurrentUser);

  // Purchase modal state
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<keyof typeof REPORT_PRICES | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Check if RevenueCat is enabled
  const rcEnabled = isRevenueCatEnabled();

  // Fetch offerings from RevenueCat for reports
  const { data: offeringsResult, isLoading: loadingOfferings } = useQuery({
    queryKey: ['report-offerings'],
    queryFn: getOfferings,
    enabled: rcEnabled,
  });

  // Get report packages from the "reports" offering
  const reportPackages = offeringsResult?.ok
    ? offeringsResult.data.all?.['reports']?.availablePackages ?? []
    : [];

  // Use premium status from user profile, fallback to tier param
  const isPremium = currentUser?.isPremium ?? false;
  const purchasedReports = currentUser?.purchasedReports ?? {};
  const reportTier = isPremium ? 'premium' : ((params.tier as AssessmentTier) || 'basic');

  // Check for full_report entitlement from RevenueCat
  const { data: fullReportEntitlement } = useQuery({
    queryKey: ['entitlement-full_report'],
    queryFn: () => hasEntitlement('full_report'),
    enabled: rcEnabled,
  });

  const { data: premiumReportEntitlement } = useQuery({
    queryKey: ['entitlement-premium_report'],
    queryFn: () => hasEntitlement('premium_report'),
    enabled: rcEnabled,
  });

  // Check access for each report type - now includes RevenueCat entitlements
  const hasFullReportAccess = fullReportEntitlement?.ok && fullReportEntitlement.data;
  const hasPremiumReportAccess = premiumReportEntitlement?.ok && premiumReportEntitlement.data;

  const hasAttachment = true; // Always free
  const hasMBTI = isPremium || hasFullReportAccess || hasPremiumReportAccess || purchasedReports.mbti || purchasedReports.fullBundle;
  const hasLoveLanguage = isPremium || hasFullReportAccess || hasPremiumReportAccess || purchasedReports.loveLanguage || purchasedReports.fullBundle;
  const hasCompatibility = isPremium || hasFullReportAccess || hasPremiumReportAccess || purchasedReports.compatibility || purchasedReports.fullBundle;
  const hasIdealPartner = isPremium || hasPremiumReportAccess || purchasedReports.idealPartner || purchasedReports.fullBundle;
  const hasRedFlags = isPremium || hasPremiumReportAccess || purchasedReports.redFlags || purchasedReports.fullBundle;

  // Individual report prices (fallback)
  const REPORT_PRICES = {
    mbti: '$3.99',
    loveLanguage: '$2.99',
    compatibility: '$6.99',
    idealPartner: '$5.99',
    redFlags: '$4.99',
    fullBundle: '$19.99',
  };

  // Map report keys to RevenueCat package identifiers
  const reportToPackage: Record<string, string> = {
    fullBundle: '$rc_custom_full_report',
    mbti: '$rc_custom_premium_report',
    loveLanguage: '$rc_custom_full_report',
    compatibility: '$rc_custom_full_report',
    idealPartner: '$rc_custom_premium_report',
    redFlags: '$rc_custom_premium_report',
  };

  // Report info for purchase modal
  const REPORT_INFO: Record<string, { title: string; description: string; icon: typeof Brain; color: string }> = {
    mbti: { title: 'MBTI Personality Type', description: 'Discover your personality type and how it affects your relationships', icon: Brain, color: '#81B29A' },
    loveLanguage: { title: 'Love Language Analysis', description: 'Learn how you give and receive love', icon: Heart, color: '#D4A574' },
    compatibility: { title: 'Compatibility Analysis', description: 'See which attachment styles you\'re most compatible with', icon: TrendingUp, color: '#9333EA' },
    idealPartner: { title: 'Ideal Partner Types', description: 'Discover MBTI types that complement your personality', icon: Users, color: '#3B82F6' },
    redFlags: { title: 'Red Flag Detection', description: 'Learn to identify warning signs and stay safe while dating', icon: AlertTriangle, color: '#F97316' },
    fullBundle: { title: 'All Reports Bundle', description: 'Get all 6 psychology reports and save $8', icon: Sparkles, color: '#E07A5F' },
  };

  // Purchase individual report - shows modal with pricing
  const handlePurchaseReport = (reportKey: keyof typeof REPORT_PRICES) => {
    setSelectedReport(reportKey);
    setShowPurchaseModal(true);
  };

  // Confirm purchase using RevenueCat
  const handleConfirmPurchase = async () => {
    if (!selectedReport) return;

    // If RevenueCat is not configured, redirect to paywall
    if (!rcEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setShowPurchaseModal(false);
      router.push('/paywall');
      return;
    }

    // Find the appropriate package
    const packageId = reportToPackage[selectedReport] || '$rc_custom_full_report';
    const pkg = reportPackages.find((p: PurchasesPackage) => p.identifier === packageId);

    if (!pkg) {
      // No package found - redirect to paywall for subscription
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Alert.alert(
        'Report Bundle',
        'Get all reports included with a Premium subscription!',
        [
          { text: 'Not Now', style: 'cancel', onPress: () => setShowPurchaseModal(false) },
          { text: 'View Plans', onPress: () => { setShowPurchaseModal(false); router.push('/paywall'); } },
        ]
      );
      return;
    }

    // Attempt purchase via RevenueCat
    setIsPurchasing(true);
    try {
      const result = await purchasePackage(pkg);
      if (result.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Update local state to reflect purchase
        const updatedReports = { ...purchasedReports };
        if (selectedReport === 'fullBundle') {
          updatedReports.fullBundle = true;
        } else {
          updatedReports[selectedReport] = true;
        }
        updateCurrentUser({ purchasedReports: updatedReports });

        setShowPurchaseModal(false);
        Alert.alert('Purchase Complete!', 'Your report is now unlocked.');
      } else {
        // Purchase failed or cancelled
        if (__DEV__ && result.reason !== 'sdk_error') {
          // User likely cancelled, no error message needed
          console.log('[Report] Purchase cancelled or failed');
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[Report] Purchase error:', error);
      }
      Alert.alert('Purchase Failed', 'Unable to complete purchase. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const mbtiInfo = currentUser?.mbtiType
    ? MBTI_DESCRIPTIONS[currentUser.mbtiType as MBTIType]
    : null;

  const attachmentInfo = currentUser?.attachmentStyle
    ? ATTACHMENT_DESCRIPTIONS[currentUser.attachmentStyle as AttachmentStyle]
    : null;

  const loveLanguageInfo = currentUser?.loveLanguages?.[0]
    ? LOVE_LANGUAGE_DESCRIPTIONS[currentUser.loveLanguages[0] as LoveLanguage]
    : null;

  // Build full report text for sharing
  const buildReportText = () => {
    const lines = [
      '🧠 InnerMatchEQ - Your Relationship Report',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '',
      `📊 Emotional Intelligence Score: ${currentUser?.emotionalIntelligence || 75}/100`,
      '',
    ];

    if (attachmentInfo) {
      lines.push(
        `🛡️ Attachment Style: ${attachmentInfo.title}`,
        attachmentInfo.description,
        '',
        'In Relationships:',
        attachmentInfo.inRelationships,
        '',
      );
    }

    if (mbtiInfo && hasMBTI) {
      lines.push(
        `🧩 Personality Type: ${currentUser?.mbtiType} - ${mbtiInfo.title}`,
        mbtiInfo.description,
        '',
        'Strengths: ' + mbtiInfo.strengths.join(', '),
        '',
      );
    }

    if (loveLanguageInfo && hasLoveLanguage) {
      lines.push(
        `❤️ Love Language: ${loveLanguageInfo.title}`,
        loveLanguageInfo.description,
        '',
      );
    }

    lines.push(
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      'Discover your match at www.innermatcheq.com',
    );

    return lines.join('\n');
  };

  const handleEmailReport = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const reportText = buildReportText();
    const compareText = `\n\n💫 Want to compare? Take the free quiz at www.innermatcheq.com and send me your results!`;
    const subject = encodeURIComponent('My InnerMatchEQ Results - Let\'s Compare!');
    const body = encodeURIComponent(reportText + compareText);
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;

    try {
      const supported = await Linking.canOpenURL(mailtoUrl);
      if (supported) {
        await Linking.openURL(mailtoUrl);
      } else {
        // Fallback to regular share
        await Share.share({
          message: reportText + compareText,
          title: 'My InnerMatchEQ Report',
        });
      }
    } catch (error) {
      if (__DEV__) {
        console.log('Email error:', error);
      }
    }
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: buildReportText(),
        title: 'My InnerMatchEQ Report',
      });
    } catch (error) {
      if (__DEV__) {
        console.log('Share error:', error);
      }
    }
  };

  const handleUpgrade = () => {
    router.push('/paywall');
  };

  // Floating animation for the score
  const floatY = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Cleanup: cancel animations on unmount to prevent native crashes
    return () => {
      cancelAnimation(floatY);
      cancelAnimation(pulseScale);
    };
  }, [floatY, pulseScale]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <View className="flex-1 bg-[#FDF8F5]">
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              router.back();
            }}
            className="w-10 h-10 items-center justify-center"
          >
            <ArrowLeft size={24} color="#2D3436" />
          </Pressable>
          <View className="flex-row items-center">
            <Text
              className="text-xl text-[#2D3436]"
              style={{ fontFamily: 'Cormorant_600SemiBold' }}
            >
              Full Analysis
            </Text>
            <View
              className="ml-2 rounded-full px-2 py-0.5"
              style={{
                backgroundColor:
                  reportTier === 'premium' ? '#D4A57415' : reportTier === 'full' ? '#E07A5F15' : '#81B29A15',
              }}
            >
              <Text
                className="text-[10px]"
                style={{
                  fontFamily: 'Outfit_600SemiBold',
                  color: reportTier === 'premium' ? '#D4A574' : reportTier === 'full' ? '#E07A5F' : '#81B29A',
                }}
              >
                {reportTier.toUpperCase()}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={handleEmailReport}
              className="w-10 h-10 items-center justify-center"
            >
              <Mail size={22} color="#636E72" />
            </Pressable>
            <Pressable
              onPress={handleShare}
              className="w-10 h-10 items-center justify-center"
            >
              <Share2 size={22} color="#636E72" />
            </Pressable>
          </View>
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {/* EQ Score Hero */}
          <Animated.View entering={FadeIn.duration(500)} style={pulseStyle} className="mb-6">
            <LinearGradient
              colors={['#E07A5F', '#D56A4F']}
              style={{ borderRadius: 24, padding: 24 }}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text
                    className="text-white/80 text-sm"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    Your Emotional Intelligence
                  </Text>
                  <Animated.View style={floatStyle} className="flex-row items-baseline mt-1">
                    <Text
                      className="text-5xl text-white"
                      style={{ fontFamily: 'Outfit_700Bold' }}
                    >
                      {currentUser?.emotionalIntelligence || 75}
                    </Text>
                    <Text
                      className="text-white/60 text-lg ml-1"
                      style={{ fontFamily: 'Outfit_400Regular' }}
                    >
                      /100
                    </Text>
                  </Animated.View>
                </View>
                <View className="w-20 h-20 rounded-full bg-white/20 items-center justify-center">
                  <Sparkles size={32} color="#FFF" />
                </View>
              </View>

              {/* EQ Score Explanation */}
              <View className="mt-4 pt-4 border-t border-white/20">
                <View className="flex-row items-center mb-2">
                  <Star size={16} color="#F2CC8F" fill="#F2CC8F" />
                  <Text
                    className="text-white text-sm ml-2"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    {(currentUser?.emotionalIntelligence || 75) >= 80
                      ? "Top 10% - Exceptional EQ"
                      : (currentUser?.emotionalIntelligence || 75) >= 70
                      ? "Top 25% - Strong EQ"
                      : (currentUser?.emotionalIntelligence || 75) >= 50
                      ? "Above Average EQ"
                      : "Building Your EQ"}
                  </Text>
                </View>
                <Text
                  className="text-white/80 text-xs mb-3"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  {(currentUser?.emotionalIntelligence || 75) >= 80
                    ? "You excel at understanding emotions, handling conflict, and building deep connections."
                    : (currentUser?.emotionalIntelligence || 75) >= 60
                    ? "You have strong emotional awareness. Partners appreciate your ability to communicate feelings."
                    : "You're developing emotional skills. Focus on active listening and expressing feelings openly."}
                </Text>

                {/* EQ Breakdown */}
                <View className="flex-row gap-2">
                  <View className="flex-1 bg-white/15 rounded-lg p-2">
                    <Text className="text-white/60 text-[10px]" style={{ fontFamily: 'Outfit_500Medium' }}>
                      SELF-AWARENESS
                    </Text>
                    <Text className="text-white text-sm" style={{ fontFamily: 'Outfit_600SemiBold' }}>
                      {Math.min(100, (currentUser?.emotionalIntelligence || 75) + 5)}%
                    </Text>
                  </View>
                  <View className="flex-1 bg-white/15 rounded-lg p-2">
                    <Text className="text-white/60 text-[10px]" style={{ fontFamily: 'Outfit_500Medium' }}>
                      EMPATHY
                    </Text>
                    <Text className="text-white text-sm" style={{ fontFamily: 'Outfit_600SemiBold' }}>
                      {Math.min(100, (currentUser?.emotionalIntelligence || 75) - 3)}%
                    </Text>
                  </View>
                  <View className="flex-1 bg-white/15 rounded-lg p-2">
                    <Text className="text-white/60 text-[10px]" style={{ fontFamily: 'Outfit_500Medium' }}>
                      REGULATION
                    </Text>
                    <Text className="text-white text-sm" style={{ fontFamily: 'Outfit_600SemiBold' }}>
                      {Math.min(100, (currentUser?.emotionalIntelligence || 75) + 2)}%
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Basic Tier: Attachment Style */}
          <ReportCard
            title={attachmentInfo?.title || 'Attachment Style'}
            subtitle="Your connection patterns"
            icon={Shield}
            iconColor="#E07A5F"
            iconBg="#E07A5F15"
            index={0}
            onPress={() => router.push('/insight-attachment')}
          >
            {attachmentInfo && (
              <View>
                <Text
                  className="text-sm text-[#636E72] mb-4"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  {attachmentInfo.description}
                </Text>

                <View className="bg-[#F5F0ED] rounded-xl p-4 mb-3">
                  <Text
                    className="text-xs text-[#A0A8AB] mb-1"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    IN RELATIONSHIPS
                  </Text>
                  <Text
                    className="text-sm text-[#2D3436]"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    {attachmentInfo.inRelationships}
                  </Text>
                </View>

                <View className="bg-[#81B29A]/10 rounded-xl p-4">
                  <Text
                    className="text-xs text-[#81B29A] mb-1"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    GROWTH OPPORTUNITY
                  </Text>
                  <Text
                    className="text-sm text-[#2D3436]"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    {attachmentInfo.growth}
                  </Text>
                </View>
              </View>
            )}
          </ReportCard>

          {/* Full Tier: MBTI */}
          <ReportCard
            title={mbtiInfo?.title || 'Personality Type'}
            subtitle={currentUser?.mbtiType || 'Unlock to discover'}
            icon={Brain}
            iconColor="#81B29A"
            iconBg="#81B29A15"
            locked={!hasMBTI}
            index={1}
            onUnlock={() => handlePurchaseReport('mbti')}
            onPress={() => router.push('/insight-mbti')}
            price={REPORT_PRICES.mbti}
          >
            {mbtiInfo && (
              <View>
                <Text
                  className="text-sm text-[#636E72] mb-4"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  {mbtiInfo.description}
                </Text>

                <View className="flex-row flex-wrap gap-2 mb-4">
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

                <View className="bg-[#F5F0ED] rounded-xl p-4">
                  <Text
                    className="text-xs text-[#A0A8AB] mb-1"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    IN DATING
                  </Text>
                  <Text
                    className="text-sm text-[#2D3436]"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    {mbtiInfo.dating}
                  </Text>
                </View>
              </View>
            )}
          </ReportCard>

          {/* Full Tier: Love Languages */}
          <ReportCard
            title={loveLanguageInfo?.title || 'Love Language'}
            subtitle="How you express love"
            icon={Heart}
            iconColor="#D4A574"
            iconBg="#F2CC8F20"
            locked={!hasLoveLanguage}
            index={2}
            onUnlock={() => handlePurchaseReport('loveLanguage')}
            onPress={() => router.push('/insight-love-language')}
            price={REPORT_PRICES.loveLanguage}
          >
            {loveLanguageInfo && (
              <View>
                <Text
                  className="text-sm text-[#636E72] mb-4"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  {loveLanguageInfo.description}
                </Text>

                <View className="flex-row gap-3">
                  <View className="flex-1 bg-[#E07A5F]/10 rounded-xl p-4">
                    <Text
                      className="text-xs text-[#E07A5F] mb-1"
                      style={{ fontFamily: 'Outfit_600SemiBold' }}
                    >
                      GIVING
                    </Text>
                    <Text
                      className="text-xs text-[#2D3436]"
                      style={{ fontFamily: 'Outfit_400Regular' }}
                    >
                      {loveLanguageInfo.giveLove}
                    </Text>
                  </View>
                  <View className="flex-1 bg-[#81B29A]/10 rounded-xl p-4">
                    <Text
                      className="text-xs text-[#81B29A] mb-1"
                      style={{ fontFamily: 'Outfit_600SemiBold' }}
                    >
                      RECEIVING
                    </Text>
                    <Text
                      className="text-xs text-[#2D3436]"
                      style={{ fontFamily: 'Outfit_400Regular' }}
                    >
                      {loveLanguageInfo.receiveLove}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </ReportCard>

          {/* Premium Tier: Compatibility Analysis */}
          <ReportCard
            title="Compatibility Analysis"
            subtitle="Who matches you best"
            icon={TrendingUp}
            iconColor="#9333EA"
            iconBg="#9333EA15"
            locked={!hasCompatibility}
            index={3}
            onUnlock={() => handlePurchaseReport('compatibility')}
            onPress={() => router.push('/insight-compatibility')}
            price={REPORT_PRICES.compatibility}
          >
            <View>
              <CompatibilityBar label="Secure Attachment" value={95} color="#81B29A" />
              <CompatibilityBar label="Anxious Attachment" value={72} color="#E07A5F" />
              <CompatibilityBar label="Avoidant Attachment" value={58} color="#F97316" />

              <View className="bg-[#9333EA]/10 rounded-xl p-4 mt-2">
                <Text
                  className="text-xs text-[#9333EA] mb-1"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  BEST MATCH
                </Text>
                <Text
                  className="text-sm text-[#2D3436]"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  You're most compatible with secure attachment styles who can provide stability while respecting your need for depth.
                </Text>
              </View>
            </View>
          </ReportCard>

          {/* Premium Tier: Ideal Partner Types */}
          <ReportCard
            title="Ideal Partner Types"
            subtitle="Based on your MBTI"
            icon={Users}
            iconColor="#3B82F6"
            iconBg="#3B82F615"
            locked={!hasIdealPartner}
            index={4}
            onUnlock={() => handlePurchaseReport('idealPartner')}
            onPress={() => router.push('/insight-ideal-partner')}
            price={REPORT_PRICES.idealPartner}
          >
            <View>
              <Text
                className="text-sm text-[#636E72] mb-3"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                Based on your personality, you're most compatible with:
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {['ENFP', 'INFJ', 'ENFJ', 'ENTP'].map((type) => (
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
              <Text
                className="text-xs text-[#A0A8AB]"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                These types complement your strengths and balance your growth areas.
              </Text>
            </View>
          </ReportCard>

          {/* Premium Tier: Red Flag Training */}
          <ReportCard
            title="Red Flag Detection"
            subtitle="Stay safe while dating"
            icon={AlertTriangle}
            iconColor="#F97316"
            iconBg="#F9731615"
            locked={!hasRedFlags}
            index={5}
            onUnlock={() => handlePurchaseReport('redFlags')}
            onPress={() => router.push('/insight-red-flags')}
            price={REPORT_PRICES.redFlags}
          >
            <View>
              <View className="bg-[#81B29A]/10 rounded-xl p-4 mb-3">
                <View className="flex-row items-center">
                  <CheckCircle2 size={20} color="#81B29A" />
                  <Text
                    className="text-sm text-[#81B29A] ml-2"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    Your profile shows healthy patterns
                  </Text>
                </View>
              </View>

              <Text
                className="text-xs text-[#A0A8AB] mb-2"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                WATCH FOR THESE IN OTHERS
              </Text>

              {['Love bombing', 'Inconsistent communication', 'Boundary violations'].map((flag) => (
                <View key={flag} className="flex-row items-center mb-2">
                  <View className="w-2 h-2 rounded-full bg-[#F97316] mr-3" />
                  <Text
                    className="text-sm text-[#636E72]"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    {flag}
                  </Text>
                </View>
              ))}
            </View>
          </ReportCard>

          {/* Premium Tier: Dating Strategy */}
          <ReportCard
            title="Your Dating Strategy"
            subtitle="Personalized tips"
            icon={Target}
            iconColor="#10B981"
            iconBg="#10B98115"
            locked={!isPremium}
            index={6}
            onUnlock={() => router.push('/paywall')}
            price="Premium"
          >
            <View>
              {[
                { title: 'Lead with questions', desc: 'Your curiosity is attractive—use it!' },
                { title: 'Set clear boundaries early', desc: 'Prevents mismatched expectations' },
                { title: 'Schedule regular check-ins', desc: 'Helps maintain emotional connection' },
              ].map((tip, index) => (
                <View
                  key={tip.title}
                  className={`flex-row items-start ${index < 2 ? 'mb-3 pb-3 border-b border-[#F0E6E0]' : ''}`}
                >
                  <View className="w-6 h-6 rounded-full bg-[#10B981]/20 items-center justify-center mr-3 mt-0.5">
                    <Text
                      className="text-xs text-[#10B981]"
                      style={{ fontFamily: 'Outfit_600SemiBold' }}
                    >
                      {index + 1}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-sm text-[#2D3436]"
                      style={{ fontFamily: 'Outfit_600SemiBold' }}
                    >
                      {tip.title}
                    </Text>
                    <Text
                      className="text-xs text-[#636E72]"
                      style={{ fontFamily: 'Outfit_400Regular' }}
                    >
                      {tip.desc}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </ReportCard>

          {/* Bundle Purchase Option */}
          {!isPremium && !purchasedReports.fullBundle && (
            <Animated.View entering={FadeInUp.delay(700).duration(500)} className="mb-4">
              <Pressable
                onPress={() => handlePurchaseReport('fullBundle')}
                className="active:scale-[0.98]"
              >
                <LinearGradient
                  colors={['#E07A5F', '#D56A4F']}
                  style={{
                    borderRadius: 20,
                    padding: 20,
                  }}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <Sparkles size={18} color="#FFF" />
                        <Text
                          className="text-white text-lg ml-2"
                          style={{ fontFamily: 'Outfit_600SemiBold' }}
                        >
                          All Reports Bundle
                        </Text>
                      </View>
                      <Text
                        className="text-white/80 text-sm"
                        style={{ fontFamily: 'Outfit_400Regular' }}
                      >
                        Get all 6 psychology reports • Save $8
                      </Text>
                    </View>
                    <View className="bg-white/20 rounded-full px-4 py-2">
                      <Text
                        className="text-white text-base"
                        style={{ fontFamily: 'Outfit_700Bold' }}
                      >
                        {REPORT_PRICES.fullBundle}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          )}

          {/* Premium Subscription CTA */}
          {!isPremium && (
            <Animated.View entering={FadeInUp.delay(750).duration(500)} className="mb-6">
              <Pressable onPress={handleUpgrade} className="active:scale-[0.98]">
                <LinearGradient
                  colors={['#D4A574', '#C69563']}
                  style={{
                    borderRadius: 20,
                    padding: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <Crown size={18} color="#FFF" />
                      <Text
                        className="text-white text-lg ml-2"
                        style={{ fontFamily: 'Outfit_600SemiBold' }}
                      >
                        Go Premium
                      </Text>
                    </View>
                    <Text
                      className="text-white/80 text-sm"
                      style={{ fontFamily: 'Outfit_400Regular' }}
                    >
                      Unlimited access + dating features
                    </Text>
                  </View>
                  <View className="bg-white/20 rounded-full p-3">
                    <ChevronRight size={20} color="#FFF" />
                  </View>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          )}

          {/* Share & Compare Section */}
          <Animated.View entering={FadeInUp.delay(800).duration(500)} className="mb-6">
            <View className="bg-white rounded-2xl p-5 shadow-sm shadow-black/5">
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-full bg-[#D4A574]/10 items-center justify-center">
                  <Users size={20} color="#D4A574" />
                </View>
                <View className="ml-3">
                  <Text
                    className="text-lg text-[#2D3436]"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    Share & Compare
                  </Text>
                  <Text
                    className="text-sm text-[#636E72]"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    See how you match with friends
                  </Text>
                </View>
              </View>

              <Text
                className="text-sm text-[#636E72] mb-4"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                Share your results with friends or a potential match to see your compatibility. Compare attachment styles, love languages, and more!
              </Text>

              <View className="flex-row gap-3">
                <Pressable
                  onPress={handleShare}
                  className="flex-1 bg-[#E07A5F]/10 rounded-xl py-3 flex-row items-center justify-center active:scale-[0.98]"
                >
                  <Share2 size={18} color="#E07A5F" />
                  <Text
                    className="text-[#E07A5F] ml-2"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    Share Results
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleEmailReport}
                  className="flex-1 bg-[#81B29A]/10 rounded-xl py-3 flex-row items-center justify-center active:scale-[0.98]"
                >
                  <Mail size={18} color="#81B29A" />
                  <Text
                    className="text-[#81B29A] ml-2"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    Send to Compare
                  </Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>

          {/* Start Matching CTA */}
          <Animated.View entering={FadeInUp.delay(850).duration(500)} className="mb-8">
            <Pressable
              onPress={() => router.replace('/(tabs)')}
              className="active:scale-[0.98]"
            >
              <LinearGradient
                colors={['#81B29A', '#6A9A82']}
                style={{
                  paddingVertical: 18,
                  borderRadius: 16,
                  alignItems: 'center',
                }}
              >
                <Text
                  className="text-white text-lg"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Start Finding Matches
                </Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          <View className="h-8" />
        </ScrollView>

        {/* Purchase Modal */}
        <Modal
          visible={showPurchaseModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowPurchaseModal(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-[#FDF8F5] rounded-t-3xl p-6">
              {selectedReport && REPORT_INFO[selectedReport] && (
                <>
                  {/* Report Icon & Title */}
                  <View className="items-center mb-6">
                    <View
                      className="w-16 h-16 rounded-2xl items-center justify-center mb-4"
                      style={{ backgroundColor: `${REPORT_INFO[selectedReport].color}15` }}
                    >
                      {React.createElement(REPORT_INFO[selectedReport].icon, {
                        size: 32,
                        color: REPORT_INFO[selectedReport].color,
                      })}
                    </View>
                    <Text
                      className="text-xl text-[#2D3436] text-center"
                      style={{ fontFamily: 'Outfit_600SemiBold' }}
                    >
                      {REPORT_INFO[selectedReport].title}
                    </Text>
                    <Text
                      className="text-sm text-[#636E72] text-center mt-2"
                      style={{ fontFamily: 'Outfit_400Regular' }}
                    >
                      {REPORT_INFO[selectedReport].description}
                    </Text>
                  </View>

                  {/* Price Display */}
                  <View className="bg-white rounded-2xl p-5 mb-4 items-center border border-[#F0E6E0]">
                    <Text
                      className="text-xs text-[#A0A8AB] mb-1"
                      style={{ fontFamily: 'Outfit_500Medium' }}
                    >
                      ONE-TIME PURCHASE
                    </Text>
                    <Text
                      className="text-4xl text-[#2D3436]"
                      style={{ fontFamily: 'Outfit_700Bold' }}
                    >
                      {REPORT_PRICES[selectedReport]}
                    </Text>
                    <Text
                      className="text-sm text-[#636E72] mt-1"
                      style={{ fontFamily: 'Outfit_400Regular' }}
                    >
                      Lifetime access to this report
                    </Text>
                  </View>

                  {/* What's Included */}
                  <View className="mb-6">
                    <Text
                      className="text-xs text-[#A0A8AB] mb-3"
                      style={{ fontFamily: 'Outfit_600SemiBold' }}
                    >
                      WHAT YOU'LL GET
                    </Text>
                    {[
                      'Detailed personality analysis',
                      'Actionable relationship insights',
                      'Tips for better connections',
                    ].map((item, index) => (
                      <View key={index} className="flex-row items-center mb-2">
                        <View className="w-5 h-5 rounded-full bg-[#81B29A]/20 items-center justify-center mr-3">
                          <CheckCircle2 size={12} color="#81B29A" />
                        </View>
                        <Text
                          className="text-sm text-[#636E72]"
                          style={{ fontFamily: 'Outfit_400Regular' }}
                        >
                          {item}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Purchase Button */}
                  <Pressable
                    onPress={handleConfirmPurchase}
                    className="active:scale-[0.98]"
                    disabled={isPurchasing}
                  >
                    <LinearGradient
                      colors={[REPORT_INFO[selectedReport].color, REPORT_INFO[selectedReport].color]}
                      style={{ paddingVertical: 18, borderRadius: 16, alignItems: 'center', opacity: isPurchasing ? 0.7 : 1 }}
                    >
                      {isPurchasing ? (
                        <ActivityIndicator color="#FFF" />
                      ) : (
                        <Text
                          className="text-white text-lg"
                          style={{ fontFamily: 'Outfit_600SemiBold' }}
                        >
                          Purchase for {REPORT_PRICES[selectedReport]}
                        </Text>
                      )}
                    </LinearGradient>
                  </Pressable>

                  {/* Alternative: Go Premium */}
                  <View className="mt-4 pt-4 border-t border-[#F0E6E0]">
                    <Text
                      className="text-center text-xs text-[#A0A8AB] mb-3"
                      style={{ fontFamily: 'Outfit_400Regular' }}
                    >
                      Or unlock ALL reports with Premium
                    </Text>
                    <Pressable
                      onPress={() => {
                        setShowPurchaseModal(false);
                        router.push('/paywall');
                      }}
                      className="flex-row items-center justify-center py-3 active:opacity-70"
                    >
                      <Crown size={16} color="#D4A574" />
                      <Text
                        className="text-[#D4A574] ml-2"
                        style={{ fontFamily: 'Outfit_600SemiBold' }}
                      >
                        Go Premium - $29.99/month
                      </Text>
                    </Pressable>
                  </View>

                  {/* Close Button */}
                  <Pressable
                    onPress={() => setShowPurchaseModal(false)}
                    className="mt-4 py-3 items-center"
                  >
                    <Text
                      className="text-[#A0A8AB]"
                      style={{ fontFamily: 'Outfit_500Medium' }}
                    >
                      Maybe Later
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}
