import { View, Text, Pressable, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
  Settings,
  Shield,
  Heart,
  Brain,
  ChevronRight,
  Bell,
  Lock,
  HelpCircle,
  LogOut,
  Sparkles,
  Edit3,
  Crown,
  CheckCircle,
  MessageCircle,
  Video,
  Gift,
  Calendar,
  Play,
  Trophy,
  FileText,
  Share2,
  BadgeCheck,
  ShieldCheck,
  Target,
  Zap,
} from 'lucide-react-native';
import * as Haptics from '@/lib/haptics';
import { useAppStore, MBTI_DESCRIPTIONS, MBTIType } from '@/lib/store';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signOut as firebaseSignOut, updateUserProfile, getCurrentUser } from '@/lib/db';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InfoTooltip from '@/components/InfoTooltip';

function SettingsItem({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  onPress,
  showChevron = true,
  badge,
}: {
  icon: typeof Settings;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
  badge?: string;
}) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress?.();
      }}
      className="flex-row items-center bg-white rounded-2xl p-4 mb-3 active:scale-[0.98]"
    >
      <View
        className="w-11 h-11 rounded-xl items-center justify-center"
        style={{ backgroundColor: iconBg }}
      >
        <Icon size={20} color={iconColor} />
      </View>
      <View className="flex-1 ml-4">
        <Text
          className="text-base text-[#2D3436]"
          style={{ fontFamily: 'Outfit_500Medium' }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            className="text-xs text-[#A0A8AB] mt-0.5"
            style={{ fontFamily: 'Outfit_400Regular' }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {badge && (
        <View className="bg-[#E07A5F] rounded-full px-2 py-0.5 mr-2">
          <Text
            className="text-white text-xs"
            style={{ fontFamily: 'Outfit_600SemiBold' }}
          >
            {badge}
          </Text>
        </View>
      )}
      {showChevron && <ChevronRight size={20} color="#D0D5D8" />}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const setOnboarded = useAppStore((s) => s.setOnboarded);
  const isPremium = currentUser?.isPremium ?? false;
  const hasVideoIntro = currentUser?.hasVideoIntro ?? false;
  const referralCode = useAppStore((s) => s.referralCode);
  const referrals = useAppStore((s) => s.referrals);
  const scheduledVideoDates = useAppStore((s) => s.scheduledVideoDates);

  const setCurrentUser = useAppStore((s) => s.setCurrentUser);
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('[Profile] Starting sign out...');

              // Clear cached queries first
              queryClient.clear();

              // Clear local Zustand state IMMEDIATELY (synchronous)
              setCurrentUser(null);
              setOnboarded(false);

              // Sign out from backend - this clears AsyncStorage and module-level state
              // IMPORTANT: This must complete BEFORE navigation to prevent stale state reads
              await firebaseSignOut();
              console.log('[Profile] Sign out complete');

              // Small delay to ensure all async operations complete
              await new Promise(resolve => setTimeout(resolve, 100));

              // Navigate to auth screen (login/signup page)
              router.replace('/auth');
              console.log('[Profile] Navigation to auth complete');
            } catch (error) {
              console.error('[Profile] Sign out error:', error);
              // Still try to clear state and navigate even on error
              setCurrentUser(null);
              setOnboarded(false);
              await AsyncStorage.multiRemove(['isOnboarded', 'currentUser', 'supabase_session', 'app-storage']);
              router.replace('/auth');
            }
          },
        },
      ]
    );
  };

  const getAttachmentColor = (style: string | null) => {
    switch (style) {
      case 'secure':
        return { bg: '#81B29A', text: 'Secure' };
      case 'anxious':
        return { bg: '#F2CC8F', text: 'Anxious' };
      case 'avoidant':
        return { bg: '#E07A5F', text: 'Avoidant' };
      default:
        return { bg: '#A0A8AB', text: 'Unknown' };
    }
  };

  const attachmentInfo = getAttachmentColor(currentUser?.attachmentStyle ?? null);
  const mbtiInfo = currentUser?.mbtiType ? MBTI_DESCRIPTIONS[currentUser.mbtiType as MBTIType] : null;

  return (
    <View className="flex-1 bg-[#FDF8F5]">
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-6 py-4 flex-row items-center justify-between">
            <Animated.View entering={FadeIn.duration(600)}>
              <Text
                className="text-2xl text-[#2D3436]"
                style={{ fontFamily: 'Cormorant_600SemiBold' }}
              >
                Profile
              </Text>
            </Animated.View>
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                router.push('/settings');
              }}
              className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm shadow-black/5"
            >
              <Settings size={20} color="#636E72" />
            </Pressable>
          </View>

          {/* Complete Profile Banner - Show assessment progress */}
          {(() => {
            // Calculate assessment completion
            const hasBasics = !!(currentUser?.name && currentUser?.age && currentUser?.gender && currentUser?.lookingFor);
            const hasAttachment = !!currentUser?.attachmentStyle;
            const hasMBTI = !!currentUser?.mbtiType;
            const hasLoveLanguage = (currentUser?.loveLanguages?.length ?? 0) > 0;
            const hasValues = (currentUser?.values?.length ?? 0) > 0;
            const hasDealbreakers = !!currentUser?.dealbreakers;

            const completedSections = [hasBasics, hasAttachment, hasMBTI, hasLoveLanguage, hasValues, hasDealbreakers].filter(Boolean).length;
            const totalSections = 6;
            const isComplete = completedSections === totalSections;
            const progressPercent = Math.round((completedSections / totalSections) * 100);

            // Don't show if fully complete
            if (isComplete) return null;

            // Determine status message
            const statusMessage = completedSections === 0
              ? 'Start your personality assessment'
              : `${completedSections}/${totalSections} complete • Pick up where you left off`;

            return (
              <Animated.View entering={FadeInDown.delay(50).duration(600)} className="px-6 mb-4">
                <Pressable
                  onPress={() => router.push('/assessment')}
                  className="active:scale-[0.98]"
                >
                  <LinearGradient
                    colors={['#E07A5F', '#D56A4F']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ borderRadius: 16, padding: 16 }}
                  >
                    <View className="flex-row items-center">
                      <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center">
                        <Sparkles size={24} color="#FFF" />
                      </View>
                      <View className="flex-1 ml-4">
                        <Text
                          className="text-white text-base"
                          style={{ fontFamily: 'Outfit_600SemiBold' }}
                        >
                          Discover Your Personality
                        </Text>
                        <Text
                          className="text-white/70 text-xs"
                          style={{ fontFamily: 'Outfit_400Regular' }}
                        >
                          {statusMessage}
                        </Text>
                      </View>
                      <ChevronRight size={20} color="#FFF" />
                    </View>
                    {/* Progress bar */}
                    {completedSections > 0 && (
                      <View className="mt-3">
                        <View className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                          <View
                            className="h-full bg-white rounded-full"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </View>
                      </View>
                    )}
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            );
          })()}

          {/* Premium Banner - Only show if user has completed profile */}
          {!isPremium && currentUser?.mbtiType && (
            <Animated.View entering={FadeInDown.delay(50).duration(600)} className="px-6 mb-4">
              <Pressable
                onPress={() => router.push('/paywall')}
                className="active:scale-[0.98]"
              >
                <LinearGradient
                  colors={['#1a1a2e', '#2d2d44']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center' }}
                >
                  <View className="w-12 h-12 rounded-full bg-[#F2CC8F]/20 items-center justify-center">
                    <Crown size={24} color="#F2CC8F" />
                  </View>
                  <View className="flex-1 ml-4">
                    <Text
                      className="text-white text-base"
                      style={{ fontFamily: 'Outfit_600SemiBold' }}
                    >
                      Unlock Deep Insights
                    </Text>
                    <Text
                      className="text-white/70 text-xs"
                      style={{ fontFamily: 'Outfit_400Regular' }}
                    >
                      Understand yourself & see who likes you
                    </Text>
                  </View>
                  <ChevronRight size={20} color="#F2CC8F" />
                </LinearGradient>
              </Pressable>
            </Animated.View>
          )}

          {/* Profile Card */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(600)}
            className="mx-6 mb-6"
          >
            <LinearGradient
              colors={['#FFFFFF', '#FDF8F5']}
              style={{
                borderRadius: 24,
                padding: 24,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 4,
              }}
            >
              {/* Avatar & Edit */}
              <View className="flex-row items-start justify-between mb-6">
                <View className="relative">
                  <View className="w-24 h-24 rounded-full bg-[#F0E6E0] items-center justify-center overflow-hidden">
                    {currentUser?.photos?.[0] ? (
                      <Image
                        source={{ uri: currentUser.photos[0] }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <Text className="text-4xl">
                        {currentUser?.name?.[0]?.toUpperCase() || '?'}
                      </Text>
                    )}
                  </View>
                  <Pressable
                    onPress={() => router.push('/edit-profile')}
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#E07A5F] items-center justify-center border-2 border-white active:scale-95"
                  >
                    <Edit3 size={14} color="#FFF" />
                  </Pressable>
                  {isPremium && (
                    <View className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[#F2CC8F] items-center justify-center border-2 border-white">
                      <Crown size={12} color="#FFF" />
                    </View>
                  )}
                </View>

                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push('/insights');
                    }}
                    className="items-center bg-[#F0E6E0] rounded-xl px-4 py-2 active:scale-95"
                  >
                    <Text
                      className="text-2xl text-[#E07A5F]"
                      style={{ fontFamily: 'Outfit_700Bold' }}
                    >
                      {currentUser?.emotionalIntelligence || 75}
                    </Text>
                    <View className="flex-row items-center">
                      <Text
                        className="text-xs text-[#636E72]"
                        style={{ fontFamily: 'Outfit_400Regular' }}
                      >
                        EQ Score
                      </Text>
                      <InfoTooltip
                        title="What is EQ Score?"
                        content="Your Emotional Intelligence Score measures your ability to understand, use, and manage emotions in positive ways."
                        bulletPoints={[
                          'Self-awareness: Recognizing your own emotions',
                          'Empathy: Understanding how others feel',
                          'Emotional regulation: Managing reactions',
                          'Tap to see detailed insights',
                        ]}
                        iconSize={12}
                        iconColor="#A0A8AB"
                      />
                    </View>
                  </Pressable>
                </View>
              </View>

              {/* Name & Info */}
              <View className="flex-row items-center">
                <Text
                  className="text-2xl text-[#2D3436]"
                  style={{ fontFamily: 'Cormorant_600SemiBold' }}
                >
                  {currentUser?.name || 'User'}, {currentUser?.age || 25}
                </Text>
                {currentUser?.isVerified && (
                  <CheckCircle size={18} color="#81B29A" className="ml-2" />
                )}
              </View>

              {/* MBTI & Attachment Style */}
              <View className="flex-row items-center mt-3 mb-4 gap-2">
                {currentUser?.mbtiType && (
                  <View className="flex-row items-center bg-[#81B29A]/15 rounded-full px-3 py-1.5">
                    <Brain size={14} color="#81B29A" />
                    <Text
                      className="ml-1.5 text-sm text-[#81B29A]"
                      style={{ fontFamily: 'Outfit_500Medium' }}
                    >
                      {currentUser.mbtiType}
                    </Text>
                  </View>
                )}
                <View
                  className="flex-row items-center rounded-full px-3 py-1.5"
                  style={{ backgroundColor: `${attachmentInfo.bg}20` }}
                >
                  <Shield size={14} color={attachmentInfo.bg} />
                  <Text
                    className="ml-1.5 text-sm"
                    style={{ fontFamily: 'Outfit_500Medium', color: attachmentInfo.bg }}
                  >
                    {attachmentInfo.text}
                  </Text>
                </View>
              </View>

              {/* Values */}
              {currentUser?.values && currentUser.values.length > 0 && (
                <View className="flex-row flex-wrap gap-2">
                  {currentUser.values.map((value) => (
                    <View
                      key={value}
                      className="bg-[#E07A5F]/10 rounded-full px-3 py-1.5"
                    >
                      <Text
                        className="text-xs text-[#E07A5F]"
                        style={{ fontFamily: 'Outfit_500Medium' }}
                      >
                        {value}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </LinearGradient>
          </Animated.View>

          {/* Insights Section - Moved to top for better visibility */}
          <Animated.View
            entering={FadeInDown.delay(150).duration(600)}
            className="px-6 mb-6"
          >
            <Text
              className="text-sm text-[#A0A8AB] mb-3"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              YOUR INSIGHTS
            </Text>

            <SettingsItem
              icon={Sparkles}
              iconColor="#E07A5F"
              iconBg="#E07A5F15"
              title="My Personality"
              subtitle={mbtiInfo
                ? `${currentUser?.mbtiType} • ${attachmentInfo.text}`
                : currentUser?.attachmentStyle
                  ? `${attachmentInfo.text} • Continue assessment`
                  : 'Take the assessment to discover'}
              onPress={() => router.push('/insights')}
            />

            <SettingsItem
              icon={FileText}
              iconColor="#9333EA"
              iconBg="#9333EA15"
              title="Full Analysis & Reports"
              subtitle="In-depth reports • Purchasable insights"
              onPress={() => router.push('/report')}
            />

            <SettingsItem
              icon={MessageCircle}
              iconColor="#81B29A"
              iconBg="#81B29A15"
              title="Your Questions"
              subtitle={`${currentUser?.criticalQuestions?.length || 0} questions for matches`}
              onPress={() => router.push('/custom-questions')}
              badge={currentUser?.criticalQuestions?.length === 0 ? 'Add' : undefined}
            />

            <SettingsItem
              icon={Zap}
              iconColor="#10B981"
              iconBg="#10B98115"
              title="Deep Compatibility Assessment"
              subtitle={currentUser?.conflictStyle ? 'Update your profile' : 'Unlock advanced matching'}
              onPress={() => router.push('/deep-assessment')}
              badge={!currentUser?.conflictStyle ? 'NEW' : undefined}
            />
          </Animated.View>

          {/* Video Intro Section */}
          <Animated.View
            entering={FadeInDown.delay(150).duration(600)}
            className="mx-6 mb-6"
          >
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push('/video-intro');
              }}
              className="active:scale-[0.98]"
            >
              <LinearGradient
                colors={hasVideoIntro ? ['#81B29A', '#4A9B7F'] : ['#E07A5F', '#D4694F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center' }}
              >
                <View className="w-14 h-14 rounded-full bg-white/20 items-center justify-center">
                  {hasVideoIntro ? (
                    <Play size={28} color="#FFF" fill="#FFF" />
                  ) : (
                    <Video size={28} color="#FFF" />
                  )}
                </View>
                <View className="flex-1 ml-4">
                  <Text
                    className="text-white text-lg"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    {hasVideoIntro ? 'Your Video Intro' : 'Add Video Intro'}
                  </Text>
                  <Text
                    className="text-white/80 text-sm mt-0.5"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    {hasVideoIntro
                      ? 'Matches love it! 3x more connections'
                      : 'Get 3x more matches with a video'}
                  </Text>
                </View>
                {hasVideoIntro ? (
                  <View className="bg-white/20 px-3 py-1.5 rounded-full">
                    <Text
                      className="text-white text-xs"
                      style={{ fontFamily: 'Outfit_500Medium' }}
                    >
                      Active
                    </Text>
                  </View>
                ) : (
                  <ChevronRight size={24} color="#FFF" />
                )}
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {/* Referral & Challenges Section */}
          <Animated.View
            entering={FadeInDown.delay(180).duration(600)}
            className="px-6 mb-6"
          >
            <Text
              className="text-sm text-[#A0A8AB] mb-3"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              GROW & CONNECT
            </Text>

            <SettingsItem
              icon={Trophy}
              iconColor="#F97316"
              iconBg="#F9731615"
              title="Challenges"
              subtitle="Compete & earn rewards"
              onPress={() => router.push('/challenges')}
              badge="NEW"
            />

            <SettingsItem
              icon={Gift}
              iconColor="#E07A5F"
              iconBg="#E07A5F15"
              title="Invite Friends"
              subtitle={`Code: ${referralCode} • ${referrals.length} invited`}
              onPress={() => router.push('/referrals')}
              badge={referrals.length === 0 ? 'Earn' : undefined}
            />

            <SettingsItem
              icon={Calendar}
              iconColor="#81B29A"
              iconBg="#81B29A15"
              title="Scheduled Video Dates"
              subtitle={
                scheduledVideoDates.filter((vd) => vd.status === 'scheduled').length > 0
                  ? `${scheduledVideoDates.filter((vd) => vd.status === 'scheduled').length} upcoming`
                  : 'No dates scheduled'
              }
              onPress={() => {
                const upcoming = scheduledVideoDates.filter((vd) => vd.status === 'scheduled');
                if (upcoming.length > 0) {
                  Alert.alert(
                    'Your Video Dates',
                    upcoming.map((vd) => `${vd.matchName} - ${new Date(vd.scheduledAt).toLocaleDateString()}`).join('\n'),
                    [{ text: 'OK' }]
                  );
                } else {
                  Alert.alert('No Video Dates', 'Match with someone and schedule a video date to connect face-to-face!');
                }
              }}
            />
          </Animated.View>

          {/* Settings Section */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(600)}
            className="px-6 mb-6"
          >
            <Text
              className="text-sm text-[#A0A8AB] mb-3"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              TRUST & SAFETY
            </Text>

            <SettingsItem
              icon={BadgeCheck}
              iconColor="#10B981"
              iconBg="#10B98115"
              title="Verification Center"
              subtitle={currentUser?.isVerified ? 'Verified' : 'Build trust with matches'}
              onPress={() => router.push('/verification')}
              badge={!currentUser?.isVerified ? 'NEW' : undefined}
            />

            <SettingsItem
              icon={Bell}
              iconColor="#636E72"
              iconBg="#63707215"
              title="Notifications"
              subtitle="Manage your notification preferences"
              onPress={() => router.push('/notifications-settings')}
            />

            <SettingsItem
              icon={Lock}
              iconColor="#636E72"
              iconBg="#63707215"
              title="Privacy & Safety"
              subtitle="Control your privacy settings"
              onPress={() => router.push('/privacy-safety')}
            />

            <SettingsItem
              icon={HelpCircle}
              iconColor="#636E72"
              iconBg="#63707215"
              title="Help & Support"
              subtitle="Get help and FAQs"
              onPress={() => router.push('/help-support')}
            />
          </Animated.View>

          {/* Legal Section */}
          <Animated.View
            entering={FadeInDown.delay(350).duration(600)}
            className="px-6 mb-6"
          >
            <Text
              className="text-sm text-[#A0A8AB] mb-3"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              LEGAL
            </Text>

            <SettingsItem
              icon={ShieldCheck}
              iconColor="#636E72"
              iconBg="#63707215"
              title="Terms of Service"
              subtitle="Our service agreement"
              onPress={() => router.push('/terms')}
            />
          </Animated.View>

          {/* Logout */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(600)}
            className="px-6 mb-10"
          >
            <Pressable
              onPress={handleLogout}
              className="flex-row items-center justify-center bg-white rounded-2xl p-4 active:scale-[0.98]"
            >
              <LogOut size={20} color="#E07A5F" />
              <Text
                className="text-base text-[#E07A5F] ml-2"
                style={{ fontFamily: 'Outfit_500Medium' }}
              >
                Sign Out
              </Text>
            </Pressable>
          </Animated.View>

          <View className="h-10" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
