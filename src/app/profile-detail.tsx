import { View, Text, Pressable, ScrollView, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  X,
  Heart,
  Shield,
  Sparkles,
  MessageCircle,
  Brain,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Briefcase,
  Lock,
  CreditCard,
  FileSearch,
  BadgeCheck,
  Ruler,
  Info,
  Wine,
  Cigarette,
  Dumbbell,
  GraduationCap,
  Church,
  Target,
  ChevronRight,
  Star,
  Users,
  HelpCircle,
} from 'lucide-react-native';
import * as Haptics from '@/lib/haptics';
import { getMockMatchesForPreference, mockConnections } from '@/lib/mockData';
import { MBTI_DESCRIPTIONS, LOVE_LANGUAGE_DESCRIPTIONS, useAppStore, LoveLanguage, Match, MBTIType } from '@/lib/store';
import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '@/lib/db';

const { width, height } = Dimensions.get('window');

// Mock community reviews data - in production this would come from the backend
interface CommunityReview {
  id: string;
  reviewerName: string;
  reviewerInitial: string;
  date: string;
  accuracy: number;
  communication: number;
  respect: number;
  comment?: string;
  wouldRecommend: boolean;
}

const getMockReviews = (matchId: string): CommunityReview[] => {
  // Generate deterministic reviews based on matchId hash
  const hash = matchId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);

  const reviewCount = Math.abs(hash % 4) + 1; // 1-4 reviews
  const reviews: CommunityReview[] = [];
  const names = ['Sarah', 'Michael', 'Emma', 'James', 'Olivia', 'David'];
  const comments = [
    'Very genuine person, photos matched perfectly.',
    'Great conversation and respectful throughout.',
    'Honest and upfront about intentions.',
    'Really enjoyed our time together.',
    null,
    null,
  ];

  for (let i = 0; i < reviewCount; i++) {
    const nameIdx = (Math.abs(hash) + i) % names.length;
    const daysAgo = ((Math.abs(hash) + i * 7) % 60) + 1;
    reviews.push({
      id: `review_${matchId}_${i}`,
      reviewerName: names[nameIdx],
      reviewerInitial: names[nameIdx][0],
      date: `${daysAgo}d ago`,
      accuracy: Math.min(5, Math.max(3, 4 + ((hash + i) % 3) - 1)),
      communication: Math.min(5, Math.max(3, 4 + ((hash + i * 2) % 3) - 1)),
      respect: Math.min(5, Math.max(4, 5 - ((hash + i) % 2))),
      comment: i < 2 ? comments[(Math.abs(hash) + i) % comments.length] ?? undefined : undefined,
      wouldRecommend: ((hash + i) % 5) !== 0,
    });
  }
  return reviews;
};

// Helper to format height from cm to feet/inches
const formatHeight = (cm: number | undefined): string | null => {
  if (!cm) return null;
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}'${inches}"`;
};

export default function ProfileDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const currentUser = useAppStore((s) => s.currentUser);
  const isPremium = currentUser?.isPremium ?? false;

  // Fetch profile from database if it's a database ID (e.g., sample_1)
  const { data: dbProfile } = useQuery({
    queryKey: ['profile', id],
    queryFn: async () => {
      if (!id) return null;
      const profile = await getUserProfile(id);
      if (!profile) return null;

      // Convert UserProfile to Match format
      const match: Match = {
        id: profile.id || id,
        name: profile.name,
        age: profile.age,
        photo: profile.photos?.[0] || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        photos: profile.photos,
        bio: profile.bio,
        occupation: profile.occupation,
        location: profile.location,
        height: profile.height,
        gender: profile.gender,
        compatibilityScore: 85,
        attachmentStyle: profile.attachmentStyle || 'secure',
        mbtiType: profile.mbtiType ?? undefined,
        loveLanguages: profile.loveLanguages,
        sharedValues: profile.values || [],
        sharedInterests: profile.interests || [],
        isVerified: profile.isVerified,
        verificationLevel: profile.verificationLevel,
        verificationChecks: profile.verificationChecks,
        hasVideoIntro: profile.hasVideoIntro,
        videoIntroUrl: profile.videoIntroUrl,
        // Lifestyle info
        smoking: profile.smoking,
        drinking: profile.drinking,
        exercise: profile.exercise,
        education: profile.education,
        religion: profile.religion,
        relationshipGoal: profile.relationshipGoal ?? undefined,
        lookingFor: profile.lookingFor,
        // Custom questions
        criticalQuestions: profile.criticalQuestions,
      };
      return match;
    },
    enabled: !!id,
  });

  // First try database profile, then mock data
  const allMockProfiles = [...getMockMatchesForPreference('everyone'), ...mockConnections];
  const mockMatch = allMockProfiles.find((m) => m.id === id);
  const match = dbProfile || mockMatch;

  // Show loading or not found state
  if (!match) {
    return (
      <View className="flex-1 bg-[#FDF8F5] items-center justify-center">
        <Text
          className="text-lg text-[#636E72]"
          style={{ fontFamily: 'Outfit_500Medium' }}
        >
          Profile not found
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-4 bg-[#E07A5F] rounded-full px-6 py-3"
        >
          <Text
            className="text-white"
            style={{ fontFamily: 'Outfit_600SemiBold' }}
          >
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  const handleConnect = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const handleUpgrade = () => {
    Haptics.selectionAsync();
    router.push('/paywall');
  };

  const mbtiInfo = match.mbtiType ? MBTI_DESCRIPTIONS[match.mbtiType as MBTIType] : null;

  return (
    <View className="flex-1 bg-[#FDF8F5]">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Photo */}
        <Animated.View entering={FadeIn.duration(600)}>
          <Image
            source={{ uri: match.photo }}
            style={{ width, height: height * 0.5 }}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 180,
            }}
          />

          {/* Close button */}
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              router.back();
            }}
            className="absolute top-14 left-4 w-10 h-10 rounded-full bg-black/30 items-center justify-center"
          >
            <X size={24} color="#FFF" />
          </Pressable>

          {/* Compatibility badge */}
          <View className="absolute top-14 right-4 bg-white/90 rounded-full px-4 py-2 flex-row items-center">
            <Sparkles size={16} color="#E07A5F" />
            <Text
              className="text-[#E07A5F] ml-2 text-lg"
              style={{ fontFamily: 'Outfit_700Bold' }}
            >
              {match.compatibilityScore}% Match
            </Text>
          </View>

          {/* Name overlay */}
          <View className="absolute bottom-6 left-6 right-6">
            <View className="flex-row items-center mb-2">
              <Text
                className="text-white text-4xl mr-3"
                style={{ fontFamily: 'Cormorant_600SemiBold' }}
              >
                {match.name}, {match.age}
              </Text>
              {match.attachmentStyle?.toLowerCase() === 'secure' && (
                <View className="bg-[#81B29A] rounded-full p-1.5">
                  <Shield size={16} color="#FFF" />
                </View>
              )}
              {match.isVerified && (
                <View className="flex-row items-center ml-2 gap-1">
                  {match.verificationChecks?.photoVerified && (
                    <View className="bg-blue-500 rounded-full p-1.5">
                      <CheckCircle size={14} color="#FFF" />
                    </View>
                  )}
                  {match.verificationChecks?.idVerified && (
                    <View className="bg-purple-500 rounded-full p-1.5">
                      <FileSearch size={14} color="#FFF" />
                    </View>
                  )}
                  {match.verificationChecks?.backgroundCheck && (
                    <View className="bg-emerald-500 rounded-full p-1.5">
                      <Shield size={14} color="#FFF" />
                    </View>
                  )}
                  {match.verificationChecks?.creditCheck && (
                    <View className="bg-amber-500 rounded-full p-1.5">
                      <CreditCard size={14} color="#FFF" />
                    </View>
                  )}
                  {!match.verificationChecks && (
                    <View className="bg-blue-500 rounded-full p-1.5">
                      <BadgeCheck size={14} color="#FFF" />
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Location, occupation, and height */}
            <View className="flex-row items-center flex-wrap gap-x-4 gap-y-1">
              {match.occupation && (
                <View className="flex-row items-center">
                  <Briefcase size={14} color="#FFF" />
                  <Text
                    className="text-white/90 ml-1.5 text-sm"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    {match.occupation}
                  </Text>
                </View>
              )}
              {match.location && (
                <View className="flex-row items-center">
                  <MapPin size={14} color="#FFF" />
                  <Text
                    className="text-white/90 ml-1.5 text-sm"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    {match.location}
                    {match.distance !== undefined && ` · ${match.distance} mi away`}
                  </Text>
                </View>
              )}
              {formatHeight(match.height) && (
                <View className="flex-row items-center">
                  <Ruler size={14} color="#FFF" />
                  <Text
                    className="text-white/90 ml-1.5 text-sm"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    {formatHeight(match.height)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Content */}
        <View className="px-6 py-6">
          {/* Upgrade Banner for Basic Users */}
          {!isPremium && (
            <Animated.View
              entering={FadeInUp.delay(30).duration(500)}
              className="mb-4"
            >
              <Pressable onPress={handleUpgrade} className="active:scale-[0.98]">
                <LinearGradient
                  colors={['#9333EA', '#7C3AED']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center' }}
                >
                  <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
                    <Sparkles size={20} color="#FFF" />
                  </View>
                  <View className="flex-1 ml-3">
                    <Text
                      className="text-white text-sm"
                      style={{ fontFamily: 'Outfit_600SemiBold' }}
                    >
                      Discover More About This Match
                    </Text>
                    <Text
                      className="text-white/70 text-xs mt-0.5"
                      style={{ fontFamily: 'Outfit_400Regular' }}
                    >
                      Unlock red flags, compatibility details & relationship insights
                    </Text>
                  </View>
                  <ChevronRight size={18} color="#FFF" />
                </LinearGradient>
              </Pressable>
            </Animated.View>
          )}

          {/* Bio */}
          {match.bio && (
            <Animated.View
              entering={FadeInUp.delay(50).duration(500)}
              className="bg-white rounded-2xl p-5 mb-4 shadow-sm shadow-black/5"
            >
              <Text
                className="text-[#2D3436] text-base leading-6"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                {match.bio}
              </Text>
            </Animated.View>
          )}

          {/* Incomplete Assessment Warning */}
          {(!match.mbtiType || !match.attachmentStyle || !match.loveLanguages || match.loveLanguages.length === 0) && (
            <Animated.View
              entering={FadeInUp.delay(51).duration(500)}
              className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-amber-100 items-center justify-center">
                  <AlertTriangle size={20} color="#F59E0B" />
                </View>
                <View className="ml-3 flex-1">
                  <Text
                    className="text-sm text-amber-800"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    Incomplete Profile
                  </Text>
                  <Text
                    className="text-xs text-amber-600 mt-0.5"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    {match.name} hasn't completed all assessments yet
                    {!match.mbtiType && ' • Missing personality type'}
                    {!match.attachmentStyle && ' • Missing attachment style'}
                    {(!match.loveLanguages || match.loveLanguages.length === 0) && ' • Missing love languages'}
                  </Text>
                </View>
              </View>
            </Animated.View>
          )}

          {/* Critical Questions - What They Want to Know */}
          {match.criticalQuestions && match.criticalQuestions.length > 0 && (
            <Animated.View
              entering={FadeInUp.delay(52).duration(500)}
              className="bg-white rounded-2xl p-5 mb-4 shadow-sm shadow-black/5 border border-purple-100"
            >
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center">
                  <HelpCircle size={20} color="#8B5CF6" />
                </View>
                <View className="ml-3 flex-1">
                  <Text
                    className="text-lg text-[#2D3436]"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    Questions They Care About
                  </Text>
                  <Text
                    className="text-xs text-[#636E72]"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    {match.name} wants to know these things about you
                  </Text>
                </View>
              </View>

              <View className="gap-3">
                {match.criticalQuestions.map((question, index) => (
                  <View
                    key={index}
                    className="bg-purple-50 rounded-xl p-3.5 flex-row items-start"
                  >
                    <View className="w-6 h-6 rounded-full bg-purple-200 items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <Text
                        className="text-purple-700 text-xs"
                        style={{ fontFamily: 'Outfit_600SemiBold' }}
                      >
                        {index + 1}
                      </Text>
                    </View>
                    <Text
                      className="text-[#2D3436] text-sm flex-1"
                      style={{ fontFamily: 'Outfit_500Medium' }}
                    >
                      {question}
                    </Text>
                  </View>
                ))}
              </View>

              <View className="mt-4 pt-3 border-t border-purple-100">
                <Text
                  className="text-xs text-purple-600 text-center"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  Answering these in your first message shows genuine interest
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Quick Facts Section - Competitor Feature */}
          {(match.education || match.religion || match.smoking || match.drinking || match.exercise || match.relationshipGoal) && (
            <Animated.View
              entering={FadeInUp.delay(55).duration(500)}
              className="bg-white rounded-2xl p-5 mb-4 shadow-sm shadow-black/5"
            >
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-full bg-indigo-100 items-center justify-center">
                  <Info size={20} color="#6366F1" />
                </View>
                <Text
                  className="text-lg text-[#2D3436] ml-3"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Quick Facts
                </Text>
              </View>

              <View className="flex-row flex-wrap gap-3">
                {match.relationshipGoal && (
                  <View className="flex-row items-center bg-rose-50 rounded-xl px-3 py-2">
                    <Target size={16} color="#E11D48" />
                    <Text
                      className="text-rose-700 ml-2 text-sm"
                      style={{ fontFamily: 'Outfit_500Medium' }}
                    >
                      {match.relationshipGoal === 'casual' ? 'Casual dating' :
                       match.relationshipGoal === 'serious' ? 'Looking for serious' :
                       match.relationshipGoal === 'marriage' ? 'Marriage-minded' : 'Figuring it out'}
                    </Text>
                  </View>
                )}
                {match.education && (
                  <View className="flex-row items-center bg-blue-50 rounded-xl px-3 py-2">
                    <GraduationCap size={16} color="#3B82F6" />
                    <Text
                      className="text-blue-700 ml-2 text-sm"
                      style={{ fontFamily: 'Outfit_500Medium' }}
                    >
                      {match.education}
                    </Text>
                  </View>
                )}
                {match.religion && (
                  <View className="flex-row items-center bg-purple-50 rounded-xl px-3 py-2">
                    <Church size={16} color="#8B5CF6" />
                    <Text
                      className="text-purple-700 ml-2 text-sm"
                      style={{ fontFamily: 'Outfit_500Medium' }}
                    >
                      {match.religion}
                    </Text>
                  </View>
                )}
                {match.drinking && (
                  <View className="flex-row items-center bg-amber-50 rounded-xl px-3 py-2">
                    <Wine size={16} color="#D97706" />
                    <Text
                      className="text-amber-700 ml-2 text-sm"
                      style={{ fontFamily: 'Outfit_500Medium' }}
                    >
                      {match.drinking === 'never' ? 'Non-drinker' :
                       match.drinking === 'social' ? 'Social drinker' : 'Regular drinker'}
                    </Text>
                  </View>
                )}
                {match.smoking && (
                  <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2">
                    <Cigarette size={16} color="#6B7280" />
                    <Text
                      className="text-gray-700 ml-2 text-sm"
                      style={{ fontFamily: 'Outfit_500Medium' }}
                    >
                      {match.smoking === 'never' ? 'Non-smoker' :
                       match.smoking === 'sometimes' ? 'Sometimes smokes' : 'Smoker'}
                    </Text>
                  </View>
                )}
                {match.exercise && (
                  <View className="flex-row items-center bg-emerald-50 rounded-xl px-3 py-2">
                    <Dumbbell size={16} color="#10B981" />
                    <Text
                      className="text-emerald-700 ml-2 text-sm"
                      style={{ fontFamily: 'Outfit_500Medium' }}
                    >
                      {match.exercise === 'never' ? 'No exercise' :
                       match.exercise === 'sometimes' ? 'Sometimes works out' : 'Active lifestyle'}
                    </Text>
                  </View>
                )}
              </View>
            </Animated.View>
          )}

          {/* Trust & Verification Section */}
          {match.isVerified && (
            <Animated.View
              entering={FadeInUp.delay(60).duration(500)}
              className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-4"
            >
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 rounded-full bg-emerald-100 items-center justify-center">
                  <BadgeCheck size={20} color="#10B981" />
                </View>
                <View className="ml-3 flex-1">
                  <Text
                    className="text-lg text-emerald-800"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    Trust & Verification
                  </Text>
                  <Text
                    className="text-xs text-emerald-600"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    Verified badges help you date with confidence
                  </Text>
                </View>
              </View>

              {/* Verification badges with explanations */}
              <View className="gap-3">
                {match.verificationChecks?.photoVerified && (
                  <View className="bg-white rounded-xl p-3">
                    <View className="flex-row items-center mb-1">
                      <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center">
                        <CheckCircle size={16} color="#3B82F6" />
                      </View>
                      <Text
                        className="text-blue-700 ml-2 text-sm"
                        style={{ fontFamily: 'Outfit_600SemiBold' }}
                      >
                        Photo Verified
                      </Text>
                    </View>
                    <Text
                      className="text-xs text-gray-600 ml-10"
                      style={{ fontFamily: 'Outfit_400Regular' }}
                    >
                      Real-time selfie matches their profile photos. This person is who they say they are.
                    </Text>
                  </View>
                )}
                {match.verificationChecks?.idVerified && (
                  <View className="bg-white rounded-xl p-3">
                    <View className="flex-row items-center mb-1">
                      <View className="w-8 h-8 rounded-full bg-purple-100 items-center justify-center">
                        <FileSearch size={16} color="#8B5CF6" />
                      </View>
                      <Text
                        className="text-purple-700 ml-2 text-sm"
                        style={{ fontFamily: 'Outfit_600SemiBold' }}
                      >
                        ID Verified
                      </Text>
                    </View>
                    <Text
                      className="text-xs text-gray-600 ml-10"
                      style={{ fontFamily: 'Outfit_400Regular' }}
                    >
                      Government ID verified their identity and age. Extra layer of trust and safety.
                    </Text>
                  </View>
                )}
                {match.verificationChecks?.backgroundCheck && (
                  <View className="bg-white rounded-xl p-3">
                    <View className="flex-row items-center mb-1">
                      <View className="w-8 h-8 rounded-full bg-emerald-100 items-center justify-center">
                        <Shield size={16} color="#10B981" />
                      </View>
                      <Text
                        className="text-emerald-700 ml-2 text-sm"
                        style={{ fontFamily: 'Outfit_600SemiBold' }}
                      >
                        Background Checked
                      </Text>
                    </View>
                    <Text
                      className="text-xs text-gray-600 ml-10"
                      style={{ fontFamily: 'Outfit_400Regular' }}
                    >
                      Passed a comprehensive background check. No criminal history or red flags found.
                    </Text>
                  </View>
                )}
                {match.verificationChecks?.creditCheck && (
                  <View className="bg-white rounded-xl p-3">
                    <View className="flex-row items-center mb-1">
                      <View className="w-8 h-8 rounded-full bg-amber-100 items-center justify-center">
                        <CreditCard size={16} color="#F59E0B" />
                      </View>
                      <Text
                        className="text-amber-700 ml-2 text-sm"
                        style={{ fontFamily: 'Outfit_600SemiBold' }}
                      >
                        Financial Verified
                      </Text>
                    </View>
                    <Text
                      className="text-xs text-gray-600 ml-10"
                      style={{ fontFamily: 'Outfit_400Regular' }}
                    >
                      Verified financial responsibility. Indicates stability and commitment.
                    </Text>
                  </View>
                )}
                {!match.verificationChecks && (
                  <View className="bg-white rounded-xl p-3">
                    <View className="flex-row items-center mb-1">
                      <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center">
                        <BadgeCheck size={16} color="#3B82F6" />
                      </View>
                      <Text
                        className="text-blue-700 ml-2 text-sm"
                        style={{ fontFamily: 'Outfit_600SemiBold' }}
                      >
                        Basic Verification
                      </Text>
                    </View>
                    <Text
                      className="text-xs text-gray-600 ml-10"
                      style={{ fontFamily: 'Outfit_400Regular' }}
                    >
                      Email and phone number verified. This profile is authenticated.
                    </Text>
                  </View>
                )}
              </View>
            </Animated.View>
          )}

          {/* Community Reviews Section - PUBLIC */}
          {match.id && (
            <Animated.View
              entering={FadeInUp.delay(65).duration(500)}
              className="bg-white rounded-2xl p-5 mb-4 shadow-sm shadow-black/5"
            >
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-full bg-amber-100 items-center justify-center">
                  <Users size={20} color="#F59E0B" />
                </View>
                <View className="ml-3 flex-1">
                  <Text
                    className="text-lg text-[#2D3436]"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    Community Reviews
                  </Text>
                  <Text
                    className="text-xs text-[#636E72]"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    Anonymous feedback from past dates
                  </Text>
                </View>
              </View>

              {(() => {
                const reviews = getMockReviews(match.id);
                const avgAccuracy = reviews.reduce((sum, r) => sum + r.accuracy, 0) / reviews.length;
                const avgCommunication = reviews.reduce((sum, r) => sum + r.communication, 0) / reviews.length;
                const avgRespect = reviews.reduce((sum, r) => sum + r.respect, 0) / reviews.length;
                const recommendRate = Math.round((reviews.filter(r => r.wouldRecommend).length / reviews.length) * 100);
                const overallRating = ((avgAccuracy + avgCommunication + avgRespect) / 3).toFixed(1);

                return (
                  <>
                    {/* Overall Rating Summary */}
                    <View className="bg-amber-50 rounded-xl p-4 mb-4">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <Text
                            className="text-3xl text-amber-600 mr-2"
                            style={{ fontFamily: 'Outfit_700Bold' }}
                          >
                            {overallRating}
                          </Text>
                          <View>
                            <View className="flex-row">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={14}
                                  color={star <= Math.round(Number(overallRating)) ? '#F59E0B' : '#E5E7EB'}
                                  fill={star <= Math.round(Number(overallRating)) ? '#F59E0B' : 'transparent'}
                                />
                              ))}
                            </View>
                            <Text
                              className="text-xs text-gray-500 mt-0.5"
                              style={{ fontFamily: 'Outfit_400Regular' }}
                            >
                              {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                            </Text>
                          </View>
                        </View>
                        <View className="items-end">
                          <Text
                            className="text-lg text-emerald-600"
                            style={{ fontFamily: 'Outfit_700Bold' }}
                          >
                            {recommendRate}%
                          </Text>
                          <Text
                            className="text-xs text-gray-500"
                            style={{ fontFamily: 'Outfit_400Regular' }}
                          >
                            would recommend
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Rating Breakdown */}
                    <View className="gap-2 mb-4">
                      {[
                        { label: 'Profile Accuracy', score: avgAccuracy },
                        { label: 'Communication', score: avgCommunication },
                        { label: 'Respect & Boundaries', score: avgRespect },
                      ].map((item) => (
                        <View key={item.label} className="flex-row items-center">
                          <Text
                            className="text-xs text-gray-600 w-32"
                            style={{ fontFamily: 'Outfit_400Regular' }}
                          >
                            {item.label}
                          </Text>
                          <View className="flex-1 flex-row items-center ml-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={12}
                                color={star <= Math.round(item.score) ? '#F59E0B' : '#E5E7EB'}
                                fill={star <= Math.round(item.score) ? '#F59E0B' : 'transparent'}
                              />
                            ))}
                            <Text
                              className="text-xs text-gray-500 ml-2"
                              style={{ fontFamily: 'Outfit_500Medium' }}
                            >
                              {item.score.toFixed(1)}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>

                    {/* Individual Reviews */}
                    <View className="gap-3">
                      {reviews.slice(0, 2).map((review) => (
                        <View key={review.id} className="bg-gray-50 rounded-xl p-3">
                          <View className="flex-row items-center justify-between mb-2">
                            <View className="flex-row items-center">
                              <View className="w-8 h-8 rounded-full bg-amber-200 items-center justify-center">
                                <Text
                                  className="text-amber-800 text-sm"
                                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                                >
                                  {review.reviewerInitial}
                                </Text>
                              </View>
                              <Text
                                className="text-sm text-gray-700 ml-2"
                                style={{ fontFamily: 'Outfit_500Medium' }}
                              >
                                {review.reviewerName}
                              </Text>
                            </View>
                            <Text
                              className="text-xs text-gray-400"
                              style={{ fontFamily: 'Outfit_400Regular' }}
                            >
                              {review.date}
                            </Text>
                          </View>
                          {review.comment && (
                            <Text
                              className="text-sm text-gray-600"
                              style={{ fontFamily: 'Outfit_400Regular' }}
                            >
                              "{review.comment}"
                            </Text>
                          )}
                          {!review.comment && (
                            <View className="flex-row items-center">
                              {review.wouldRecommend ? (
                                <>
                                  <CheckCircle size={14} color="#10B981" />
                                  <Text
                                    className="text-xs text-emerald-600 ml-1"
                                    style={{ fontFamily: 'Outfit_500Medium' }}
                                  >
                                    Would recommend
                                  </Text>
                                </>
                              ) : (
                                <Text
                                  className="text-xs text-gray-500"
                                  style={{ fontFamily: 'Outfit_400Regular' }}
                                >
                                  Rating only
                                </Text>
                              )}
                            </View>
                          )}
                        </View>
                      ))}
                    </View>

                    {/* Privacy Note */}
                    <Text
                      className="text-xs text-gray-400 text-center mt-3"
                      style={{ fontFamily: 'Outfit_400Regular' }}
                    >
                      Reviews are anonymous and verified from real dates
                    </Text>
                  </>
                );
              })()}
            </Animated.View>
          )}

          {/* Red Flag Analysis Section */}
          {match.redFlagProfile && (
            <Animated.View
              entering={FadeInUp.delay(80).duration(500)}
              className="bg-white rounded-2xl p-5 mb-4 shadow-sm shadow-black/5 border border-gray-100"
            >
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-full bg-rose-100 items-center justify-center">
                  <AlertTriangle size={20} color="#E11D48" />
                </View>
                <View className="ml-3 flex-1">
                  <Text
                    className="text-lg text-[#2D3436]"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    Red Flag Analysis
                  </Text>
                  <Text
                    className="text-xs text-[#636E72]"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    AI-powered behavioral insights
                  </Text>
                </View>
                {/* Overall Safety Indicator */}
                <View
                  className={`px-3 py-1.5 rounded-full ${
                    match.redFlagProfile.emotionalAvailability >= 80 &&
                    match.redFlagProfile.narcissismScore <= 25
                      ? 'bg-emerald-100'
                      : match.redFlagProfile.emotionalAvailability >= 60 &&
                        match.redFlagProfile.narcissismScore <= 40
                      ? 'bg-amber-100'
                      : 'bg-rose-100'
                  }`}
                >
                  <Text
                    className={`text-xs ${
                      match.redFlagProfile.emotionalAvailability >= 80 &&
                      match.redFlagProfile.narcissismScore <= 25
                        ? 'text-emerald-700'
                        : match.redFlagProfile.emotionalAvailability >= 60 &&
                          match.redFlagProfile.narcissismScore <= 40
                        ? 'text-amber-700'
                        : 'text-rose-700'
                    }`}
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    {match.redFlagProfile.emotionalAvailability >= 80 &&
                    match.redFlagProfile.narcissismScore <= 25
                      ? 'Low Risk'
                      : match.redFlagProfile.emotionalAvailability >= 60 &&
                        match.redFlagProfile.narcissismScore <= 40
                      ? 'Moderate'
                      : 'Review'}
                  </Text>
                </View>
              </View>

              {isPremium ? (
                <>
                  {/* Score Breakdown */}
                  <View className="gap-3 mb-4">
                    {/* Emotional Availability */}
                    <View>
                      <View className="flex-row justify-between mb-1">
                        <Text
                          className="text-sm text-[#636E72]"
                          style={{ fontFamily: 'Outfit_400Regular' }}
                        >
                          Emotional Availability
                        </Text>
                        <Text
                          className={`text-sm ${
                            match.redFlagProfile.emotionalAvailability >= 80
                              ? 'text-emerald-600'
                              : match.redFlagProfile.emotionalAvailability >= 60
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                          style={{ fontFamily: 'Outfit_600SemiBold' }}
                        >
                          {match.redFlagProfile.emotionalAvailability}%
                        </Text>
                      </View>
                      <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <View
                          className={`h-full rounded-full ${
                            match.redFlagProfile.emotionalAvailability >= 80
                              ? 'bg-emerald-500'
                              : match.redFlagProfile.emotionalAvailability >= 60
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${match.redFlagProfile.emotionalAvailability}%` }}
                        />
                      </View>
                    </View>

                    {/* Consistency Score */}
                    <View>
                      <View className="flex-row justify-between mb-1">
                        <Text
                          className="text-sm text-[#636E72]"
                          style={{ fontFamily: 'Outfit_400Regular' }}
                        >
                          Behavioral Consistency
                        </Text>
                        <Text
                          className={`text-sm ${
                            match.redFlagProfile.consistencyScore >= 80
                              ? 'text-emerald-600'
                              : match.redFlagProfile.consistencyScore >= 60
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                          style={{ fontFamily: 'Outfit_600SemiBold' }}
                        >
                          {match.redFlagProfile.consistencyScore}%
                        </Text>
                      </View>
                      <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <View
                          className={`h-full rounded-full ${
                            match.redFlagProfile.consistencyScore >= 80
                              ? 'bg-emerald-500'
                              : match.redFlagProfile.consistencyScore >= 60
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${match.redFlagProfile.consistencyScore}%` }}
                        />
                      </View>
                    </View>

                    {/* Narcissism Indicator (inverted - lower is better) */}
                    <View>
                      <View className="flex-row justify-between mb-1">
                        <Text
                          className="text-sm text-[#636E72]"
                          style={{ fontFamily: 'Outfit_400Regular' }}
                        >
                          Self-Focus Level
                        </Text>
                        <Text
                          className={`text-sm ${
                            match.redFlagProfile.narcissismScore <= 25
                              ? 'text-emerald-600'
                              : match.redFlagProfile.narcissismScore <= 50
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                          style={{ fontFamily: 'Outfit_600SemiBold' }}
                        >
                          {match.redFlagProfile.narcissismScore <= 25
                            ? 'Healthy'
                            : match.redFlagProfile.narcissismScore <= 50
                            ? 'Elevated'
                            : 'High'}
                        </Text>
                      </View>
                      <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <View
                          className={`h-full rounded-full ${
                            match.redFlagProfile.narcissismScore <= 25
                              ? 'bg-emerald-500'
                              : match.redFlagProfile.narcissismScore <= 50
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(match.redFlagProfile.narcissismScore, 100)}%` }}
                        />
                      </View>
                    </View>

                    {/* Manipulation Risk */}
                    <View>
                      <View className="flex-row justify-between mb-1">
                        <Text
                          className="text-sm text-[#636E72]"
                          style={{ fontFamily: 'Outfit_400Regular' }}
                        >
                          Manipulation Risk
                        </Text>
                        <Text
                          className={`text-sm ${
                            match.redFlagProfile.manipulationRisk <= 20
                              ? 'text-emerald-600'
                              : match.redFlagProfile.manipulationRisk <= 40
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                          style={{ fontFamily: 'Outfit_600SemiBold' }}
                        >
                          {match.redFlagProfile.manipulationRisk <= 20
                            ? 'Low'
                            : match.redFlagProfile.manipulationRisk <= 40
                            ? 'Moderate'
                            : 'Elevated'}
                        </Text>
                      </View>
                      <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <View
                          className={`h-full rounded-full ${
                            match.redFlagProfile.manipulationRisk <= 20
                              ? 'bg-emerald-500'
                              : match.redFlagProfile.manipulationRisk <= 40
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(match.redFlagProfile.manipulationRisk, 100)}%` }}
                        />
                      </View>
                    </View>
                  </View>

                  {/* Contextual Insights */}
                  {(match.redFlagProfile.flags.length > 0 ||
                    match.redFlagProfile.narcissismScore > 40 ||
                    match.redFlagProfile.emotionalAvailability < 70) && (
                    <View className="bg-rose-50 rounded-xl p-4 mb-3">
                      <Text
                        className="text-sm text-rose-800 mb-2"
                        style={{ fontFamily: 'Outfit_600SemiBold' }}
                      >
                        Things to Watch For
                      </Text>
                      <View className="gap-1.5">
                        {match.redFlagProfile.flags.map((flag: string, index: number) => (
                          <View key={index} className="flex-row items-start">
                            <View className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5" />
                            <Text
                              className="flex-1 text-sm text-rose-700 ml-2"
                              style={{ fontFamily: 'Outfit_400Regular' }}
                            >
                              {flag}
                            </Text>
                          </View>
                        ))}
                        {match.redFlagProfile.narcissismScore > 40 &&
                          !match.redFlagProfile.flags.includes('Elevated narcissism indicators') && (
                            <View className="flex-row items-start">
                              <View className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5" />
                              <Text
                                className="flex-1 text-sm text-rose-700 ml-2"
                                style={{ fontFamily: 'Outfit_400Regular' }}
                              >
                                May prioritize their needs over partnership balance
                              </Text>
                            </View>
                          )}
                        {match.redFlagProfile.emotionalAvailability < 70 && (
                          <View className="flex-row items-start">
                            <View className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5" />
                            <Text
                              className="flex-1 text-sm text-rose-700 ml-2"
                              style={{ fontFamily: 'Outfit_400Regular' }}
                            >
                              May have difficulty with emotional intimacy
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}

                  {/* Positive Indicators */}
                  {match.redFlagProfile.emotionalAvailability >= 80 &&
                    match.redFlagProfile.consistencyScore >= 80 && (
                      <View className="bg-emerald-50 rounded-xl p-4">
                        <Text
                          className="text-sm text-emerald-800 mb-2"
                          style={{ fontFamily: 'Outfit_600SemiBold' }}
                        >
                          Green Flags
                        </Text>
                        <View className="gap-1.5">
                          <View className="flex-row items-start">
                            <CheckCircle size={14} color="#10B981" />
                            <Text
                              className="flex-1 text-sm text-emerald-700 ml-2"
                              style={{ fontFamily: 'Outfit_400Regular' }}
                            >
                              High emotional availability suggests openness
                            </Text>
                          </View>
                          <View className="flex-row items-start">
                            <CheckCircle size={14} color="#10B981" />
                            <Text
                              className="flex-1 text-sm text-emerald-700 ml-2"
                              style={{ fontFamily: 'Outfit_400Regular' }}
                            >
                              Consistent behavior patterns indicate reliability
                            </Text>
                          </View>
                          {match.redFlagProfile.narcissismScore <= 15 && (
                            <View className="flex-row items-start">
                              <CheckCircle size={14} color="#10B981" />
                              <Text
                                className="flex-1 text-sm text-emerald-700 ml-2"
                                style={{ fontFamily: 'Outfit_400Regular' }}
                              >
                                Healthy self-focus balance for partnership
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    )}
                </>
              ) : (
                /* Locked State for Non-Premium */
                <View>
                  <View className="bg-gray-50 rounded-xl p-4 mb-3">
                    <View className="flex-row items-center justify-between mb-3">
                      <Text
                        className="text-sm text-[#636E72]"
                        style={{ fontFamily: 'Outfit_400Regular' }}
                      >
                        Overall Assessment
                      </Text>
                      <View className="flex-row items-center">
                        <Lock size={12} color="#9CA3AF" />
                        <Text
                          className="text-xs text-gray-400 ml-1"
                          style={{ fontFamily: 'Outfit_400Regular' }}
                        >
                          Premium
                        </Text>
                      </View>
                    </View>
                    {/* Blurred preview */}
                    <View className="gap-2">
                      {['Emotional Availability', 'Consistency', 'Self-Focus', 'Manipulation Risk'].map(
                        (label) => (
                          <View key={label}>
                            <View className="flex-row justify-between mb-1">
                              <Text
                                className="text-xs text-gray-400"
                                style={{ fontFamily: 'Outfit_400Regular' }}
                              >
                                {label}
                              </Text>
                              <Text
                                className="text-xs text-gray-300"
                                style={{ fontFamily: 'Outfit_400Regular' }}
                              >
                                ••••
                              </Text>
                            </View>
                            <View className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <View
                                className="h-full bg-gray-300 rounded-full"
                                style={{ width: '60%' }}
                              />
                            </View>
                          </View>
                        )
                      )}
                    </View>
                  </View>

                  <Pressable
                    onPress={handleUpgrade}
                    className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl py-3.5 flex-row items-center justify-center active:scale-[0.98]"
                  >
                    <LinearGradient
                      colors={['#E11D48', '#DB2777']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                        borderRadius: 12,
                      }}
                    />
                    <Lock size={16} color="#FFF" />
                    <Text
                      className="text-white ml-2"
                      style={{ fontFamily: 'Outfit_600SemiBold' }}
                    >
                      Unlock Full Red Flag Analysis
                    </Text>
                  </Pressable>
                </View>
              )}
            </Animated.View>
          )}

          {/* Legacy Warnings Section (for additional context) */}
          {match.hasWarnings && match.warnings && match.warnings.length > 0 && isPremium && (
            <Animated.View
              entering={FadeInUp.delay(90).duration(500)}
              className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-4"
            >
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 rounded-full bg-amber-100 items-center justify-center">
                  <AlertTriangle size={20} color="#F59E0B" />
                </View>
                <Text
                  className="text-lg text-amber-800 ml-3"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Additional Insights
                </Text>
              </View>

              <View className="gap-2">
                {match.warnings.map((warning: string, index: number) => (
                  <View key={index} className="flex-row items-start">
                    <View className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2" />
                    <Text
                      className="flex-1 text-sm text-amber-700 ml-3"
                      style={{ fontFamily: 'Outfit_400Regular' }}
                    >
                      {warning}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* MBTI Type */}
          {match.mbtiType && mbtiInfo && (
            <Animated.View
              entering={FadeInUp.delay(100).duration(500)}
              className="bg-white rounded-2xl p-5 mb-4 shadow-sm shadow-black/5"
            >
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center">
                  <Brain size={20} color="#9333EA" />
                </View>
                <View className="ml-3 flex-1">
                  <Text
                    className="text-lg text-[#2D3436]"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    {match.mbtiType}
                  </Text>
                  <Text
                    className="text-sm text-purple-600"
                    style={{ fontFamily: 'Outfit_500Medium' }}
                  >
                    {mbtiInfo.title}
                  </Text>
                </View>
              </View>
              <Text
                className="text-sm text-[#636E72] leading-5"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                {mbtiInfo.description}
              </Text>
            </Animated.View>
          )}

          {/* Attachment Style */}
          <Animated.View
            entering={FadeInUp.delay(150).duration(500)}
            className="bg-white rounded-2xl p-5 mb-4 shadow-sm shadow-black/5"
          >
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 rounded-full bg-[#81B29A]/15 items-center justify-center">
                <Shield size={20} color="#81B29A" />
              </View>
              <Text
                className="text-lg text-[#2D3436] ml-3"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                Attachment Style
              </Text>
            </View>
            <View className="flex-row items-center">
              <View
                className={`rounded-full px-4 py-2 ${
                  match.attachmentStyle?.toLowerCase() === 'secure'
                    ? 'bg-[#81B29A]/15'
                    : match.attachmentStyle?.toLowerCase() === 'anxious'
                    ? 'bg-amber-100'
                    : 'bg-orange-100'
                }`}
              >
                <Text
                  className={`capitalize ${
                    match.attachmentStyle?.toLowerCase() === 'secure'
                      ? 'text-[#81B29A]'
                      : match.attachmentStyle?.toLowerCase() === 'anxious'
                      ? 'text-amber-700'
                      : 'text-orange-700'
                  }`}
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  {match.attachmentStyle}
                </Text>
              </View>
              <Text
                className="flex-1 text-sm text-[#636E72] ml-3"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                {match.attachmentStyle?.toLowerCase() === 'secure'
                  ? 'Comfortable with intimacy and independence'
                  : match.attachmentStyle?.toLowerCase() === 'anxious'
                  ? 'Seeks closeness and reassurance'
                  : 'Values independence and self-reliance'}
              </Text>
            </View>
          </Animated.View>

          {/* Love Languages */}
          {match.loveLanguages && match.loveLanguages.length > 0 && (
            <Animated.View
              entering={FadeInUp.delay(200).duration(500)}
              className="bg-white rounded-2xl p-5 mb-4 shadow-sm shadow-black/5"
            >
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-full bg-pink-100 items-center justify-center">
                  <Heart size={20} color="#EC4899" />
                </View>
                <Text
                  className="text-lg text-[#2D3436] ml-3"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Love Languages
                </Text>
              </View>

              <View className="gap-3">
                {match.loveLanguages.map((lang: LoveLanguage) => {
                  const langInfo = LOVE_LANGUAGE_DESCRIPTIONS[lang];
                  if (!langInfo) return null;
                  return (
                    <View key={lang} className="flex-row items-center">
                      <View className="w-2 h-2 rounded-full bg-pink-400" />
                      <View className="ml-3 flex-1">
                        <Text
                          className="text-sm text-[#2D3436]"
                          style={{ fontFamily: 'Outfit_600SemiBold' }}
                        >
                          {langInfo.title}
                        </Text>
                        <Text
                          className="text-xs text-[#636E72] mt-0.5"
                          style={{ fontFamily: 'Outfit_400Regular' }}
                        >
                          {langInfo.receiveLove}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </Animated.View>
          )}

          {/* Compatibility Breakdown */}
          {match.compatibilityBreakdown && (
            <Animated.View
              entering={FadeInUp.delay(250).duration(500)}
              className="bg-white rounded-2xl p-5 mb-4 shadow-sm shadow-black/5"
            >
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-full bg-[#E07A5F]/15 items-center justify-center">
                  <Sparkles size={20} color="#E07A5F" />
                </View>
                <Text
                  className="text-lg text-[#2D3436] ml-3"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Compatibility Breakdown
                </Text>
              </View>

              {isPremium ? (
                <View className="gap-3">
                  {[
                    { label: 'Attachment', score: match.compatibilityBreakdown.attachment },
                    { label: 'Personality', score: match.compatibilityBreakdown.mbti },
                    { label: 'Love Language', score: match.compatibilityBreakdown.loveLanguage },
                    { label: 'Values', score: match.compatibilityBreakdown.values },
                    { label: 'Lifestyle', score: match.compatibilityBreakdown.lifestyle },
                  ].map((item) => (
                    <View key={item.label}>
                      <View className="flex-row justify-between mb-1">
                        <Text
                          className="text-sm text-[#636E72]"
                          style={{ fontFamily: 'Outfit_400Regular' }}
                        >
                          {item.label}
                        </Text>
                        <Text
                          className="text-sm text-[#2D3436]"
                          style={{ fontFamily: 'Outfit_600SemiBold' }}
                        >
                          {item.score}%
                        </Text>
                      </View>
                      <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <View
                          className={`h-full rounded-full ${
                            item.score >= 85
                              ? 'bg-[#81B29A]'
                              : item.score >= 70
                              ? 'bg-[#F2CC8F]'
                              : 'bg-orange-400'
                          }`}
                          style={{ width: `${item.score}%` }}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                /* Locked Preview for Basic Users */
                <View>
                  <View className="gap-2 mb-4">
                    {['Attachment', 'Personality', 'Love Language', 'Values', 'Lifestyle'].map((label) => (
                      <View key={label}>
                        <View className="flex-row justify-between mb-1">
                          <Text
                            className="text-xs text-gray-400"
                            style={{ fontFamily: 'Outfit_400Regular' }}
                          >
                            {label}
                          </Text>
                          <View className="flex-row items-center">
                            <Lock size={10} color="#9CA3AF" />
                            <Text
                              className="text-xs text-gray-300 ml-1"
                              style={{ fontFamily: 'Outfit_400Regular' }}
                            >
                              ••••
                            </Text>
                          </View>
                        </View>
                        <View className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <View className="h-full bg-gray-200 rounded-full" style={{ width: '60%' }} />
                        </View>
                      </View>
                    ))}
                  </View>
                  <Pressable onPress={handleUpgrade} className="active:scale-[0.98]">
                    <View className="bg-[#E07A5F]/10 rounded-xl py-3 flex-row items-center justify-center">
                      <Lock size={14} color="#E07A5F" />
                      <Text
                        className="text-[#E07A5F] ml-2 text-sm"
                        style={{ fontFamily: 'Outfit_600SemiBold' }}
                      >
                        Unlock Detailed Compatibility
                      </Text>
                    </View>
                  </Pressable>
                </View>
              )}
            </Animated.View>
          )}

          {/* Shared Values */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(500)}
            className="bg-white rounded-2xl p-5 mb-4 shadow-sm shadow-black/5"
          >
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-full bg-[#F2CC8F]/20 items-center justify-center">
                <Heart size={20} color="#D4A574" />
              </View>
              <Text
                className="text-lg text-[#2D3436] ml-3"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                Shared Values
              </Text>
            </View>

            <View className="flex-row flex-wrap gap-2">
              {match.sharedValues.map((value: string) => (
                <View key={value} className="bg-[#E07A5F]/10 rounded-full px-4 py-2">
                  <Text
                    className="text-[#E07A5F]"
                    style={{ fontFamily: 'Outfit_500Medium' }}
                  >
                    {value}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Shared Interests */}
          {match.sharedInterests && match.sharedInterests.length > 0 && (
            <Animated.View
              entering={FadeInUp.delay(350).duration(500)}
              className="bg-white rounded-2xl p-5 mb-4 shadow-sm shadow-black/5"
            >
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center">
                  <Sparkles size={20} color="#3B82F6" />
                </View>
                <Text
                  className="text-lg text-[#2D3436] ml-3"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Shared Interests
                </Text>
              </View>

              <View className="flex-row flex-wrap gap-2">
                {match.sharedInterests.map((interest: string) => (
                  <View key={interest} className="bg-blue-50 rounded-full px-4 py-2">
                    <Text
                      className="text-blue-600"
                      style={{ fontFamily: 'Outfit_500Medium' }}
                    >
                      {interest}
                    </Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}

          <View className="h-28" />
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <SafeAreaView
        edges={['bottom']}
        className="absolute bottom-0 left-0 right-0 bg-white/95 border-t border-[#F0E6E0]"
      >
        <Animated.View
          entering={FadeInDown.delay(400).duration(500)}
          className="px-6 py-4 flex-row gap-4"
        >
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              router.back();
            }}
            className="flex-1 bg-[#F5F0ED] rounded-2xl py-4 items-center active:scale-[0.98]"
          >
            <Text
              className="text-[#636E72] text-base"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              Maybe Later
            </Text>
          </Pressable>

          <Pressable onPress={handleConnect} className="flex-1 active:scale-[0.98]">
            <LinearGradient
              colors={['#81B29A', '#6A9A82']}
              style={{
                paddingVertical: 16,
                borderRadius: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MessageCircle size={20} color="#FFF" />
              <Text
                className="text-white text-base ml-2"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                Connect
              </Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
