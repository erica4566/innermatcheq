import { View, Text, Pressable, Dimensions, Image, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useState, useEffect, useCallback } from 'react';
import { X, Heart, Star, Sparkles, Shield, RefreshCw, MessageCircle, HelpCircle } from 'lucide-react-native';
import * as Haptics from '@/lib/haptics';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore, Match } from '@/lib/store';
import { getMockMatchesForPreference } from '@/lib/mockData';
import {
  getDiscoverProfiles,
  recordSwipe,
  getCurrentUser,
  checkAndResetDailyLimits,
  decrementDailyLike,
} from '@/lib/db';
import InfoTooltip from '@/components/InfoTooltip';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width - 40;
const CARD_HEIGHT = height * 0.62;
const SWIPE_THRESHOLD = width * 0.25;

function MatchCard({
  match,
  index,
  totalCards,
  onSwipe,
}: {
  match: Match;
  index: number;
  totalCards: number;
  onSwipe: (direction: 'left' | 'right') => void;
}) {
  const router = useRouter();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  const isTopCard = index === 0;

  const gesture = Gesture.Pan()
    .enabled(isTopCard)
    .onStart(() => {
      scale.value = withSpring(1.02);
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.5;
      rotation.value = interpolate(event.translationX, [-width / 2, width / 2], [-15, 15]);
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        const direction = event.translationX > 0 ? 'right' : 'left';
        translateX.value = withTiming(event.translationX > 0 ? width * 1.5 : -width * 1.5, { duration: 300 });
        rotation.value = withTiming(event.translationX > 0 ? 30 : -30, { duration: 300 });
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
        runOnJS(onSwipe)(direction);
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotation.value = withSpring(0);
      }
      scale.value = withSpring(1);
    });

  const cardStyle = useAnimatedStyle(() => {
    const stackOffset = index * 8;
    const stackScale = 1 - index * 0.05;

    return {
      transform: [
        { translateX: isTopCard ? translateX.value : 0 },
        { translateY: isTopCard ? translateY.value : stackOffset },
        { rotate: isTopCard ? `${rotation.value}deg` : '0deg' },
        { scale: isTopCard ? scale.value : stackScale },
      ],
      zIndex: totalCards - index,
    };
  });

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
  }));

  const nopeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0], Extrapolation.CLAMP),
  }));

  const handleCardPress = () => {
    if (isTopCard) {
      router.push({ pathname: '/profile-detail', params: { id: match.id } });
    }
  };

  const attachmentStyle = typeof match.attachmentStyle === 'string'
    ? match.attachmentStyle.toLowerCase()
    : 'secure';

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          cardStyle,
          {
            position: 'absolute',
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
          },
        ]}
      >
        <Pressable onPress={handleCardPress} className="flex-1">
          <View className="flex-1 rounded-3xl overflow-hidden bg-white shadow-xl shadow-black/15">
            {/* Photo */}
            <Image
              source={{ uri: match.photo }}
              className="flex-1"
              resizeMode="cover"
            />

            {/* Gradient overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '50%',
              }}
            />

            {/* Like stamp */}
            <Animated.View
              style={[likeOpacity, { position: 'absolute', top: 40, left: 20 }]}
            >
              <View className="border-4 border-[#81B29A] rounded-lg px-4 py-2 rotate-[-20deg]">
                <Text
                  className="text-[#81B29A] text-3xl"
                  style={{ fontFamily: 'Outfit_700Bold' }}
                >
                  LIKE
                </Text>
              </View>
            </Animated.View>

            {/* Nope stamp */}
            <Animated.View
              style={[nopeOpacity, { position: 'absolute', top: 40, right: 20 }]}
            >
              <View className="border-4 border-[#E07A5F] rounded-lg px-4 py-2 rotate-[20deg]">
                <Text
                  className="text-[#E07A5F] text-3xl"
                  style={{ fontFamily: 'Outfit_700Bold' }}
                >
                  NOPE
                </Text>
              </View>
            </Animated.View>

            {/* Compatibility badge */}
            <View className="absolute top-4 right-4 bg-white/90 rounded-full px-3 py-1.5 flex-row items-center">
              <Sparkles size={14} color="#E07A5F" />
              <Text
                className="text-[#E07A5F] ml-1"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                {match.compatibilityScore}% Match
              </Text>
              <InfoTooltip
                title="Compatibility Score"
                content="This percentage shows how well you match based on your psychological profiles and preferences."
                bulletPoints={[
                  'Attachment styles: How you connect emotionally',
                  'Personality type: Your MBTI compatibility',
                  'Love languages: How you give and receive love',
                  'Shared values: What matters most to both of you',
                ]}
                iconSize={12}
                iconColor="#E07A5F"
              />
            </View>

            {/* Info */}
            <View className="absolute bottom-0 left-0 right-0 p-6">
              <View className="flex-row items-center mb-2">
                <Text
                  className="text-white text-3xl mr-2"
                  style={{ fontFamily: 'Cormorant_600SemiBold' }}
                >
                  {match.name}, {match.age}
                </Text>
                {attachmentStyle === 'secure' && (
                  <View className="bg-[#81B29A] rounded-full p-1">
                    <Shield size={14} color="#FFF" />
                  </View>
                )}
              </View>

              {/* Attachment style */}
              <View className="flex-row items-center mb-3">
                <View className="bg-white/20 rounded-full px-3 py-1">
                  <Text
                    className="text-white text-xs capitalize"
                    style={{ fontFamily: 'Outfit_500Medium' }}
                  >
                    {attachmentStyle} Attachment
                  </Text>
                </View>
              </View>

              {/* Shared values */}
              <View className="flex-row flex-wrap gap-2">
                {(match.sharedValues || []).slice(0, 3).map((value) => (
                  <View
                    key={value}
                    className="bg-[#E07A5F]/80 rounded-full px-3 py-1"
                  >
                    <Text
                      className="text-white text-xs"
                      style={{ fontFamily: 'Outfit_400Regular' }}
                    >
                      {value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

export default function DiscoverScreen() {
  const router = useRouter();
  const [displayMatches, setDisplayMatches] = useState<Match[]>([]);
  const [dailyLikes, setDailyLikes] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isShowingSamples, setIsShowingSamples] = useState(false);
  const [matchModal, setMatchModal] = useState<{ visible: boolean; match: Match | null }>({ visible: false, match: null });
  const addConnection = useAppStore((s) => s.addConnection);
  const currentUser = useAppStore((s) => s.currentUser);
  const setShowPaywall = useAppStore((s) => s.setShowPaywall);
  const queryClient = useQueryClient();

  // Fetch matches from database
  const { data: matches, isLoading, refetch } = useQuery({
    queryKey: ['discover-profiles', currentUser],
    queryFn: async () => {
      const user = await getCurrentUser();
      if (!user || !currentUser) return [];
      return getDiscoverProfiles(user.uid, currentUser);
    },
    enabled: !!currentUser,
  });

  // Refresh handler with loading state
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'discover-profiles'
      });
      const result = await refetch();
      if (result.data) {
        setDisplayMatches(result.data);
      }
    } catch (error) {
      console.error('Failed to refresh matches:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient, refetch]);

  // Check daily limits
  useEffect(() => {
    const checkLimits = async () => {
      const user = await getCurrentUser();
      if (user) {
        const limits = await checkAndResetDailyLimits(user.uid);
        setDailyLikes(limits.dailyLikesRemaining);
      }
    };
    checkLimits();
  }, []);

  // Update display matches when data changes
  // Show sample matches ONLY when real matches are empty
  useEffect(() => {
    if (matches && matches.length > 0) {
      // Real matches available - use them
      setDisplayMatches(matches);
      setIsShowingSamples(false);
    } else if (matches && matches.length === 0) {
      // No real matches - show samples filtered by user preference as fallback
      const filteredSamples = getMockMatchesForPreference(currentUser?.lookingFor);
      setDisplayMatches(filteredSamples);
      setIsShowingSamples(true);
    }
  }, [matches, currentUser?.lookingFor]);

  // Swipe mutation
  const { mutate: swipeMutate, isPending: isSwipePending } = useMutation({
    mutationFn: async ({ matchId, action }: { matchId: string; action: 'like' | 'pass' | 'superlike' }) => {
      // Don't record swipes on sample matches - just simulate for preview
      if (isShowingSamples) {
        return { isMatch: false };
      }

      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      // Check daily limits for likes
      if ((action === 'like' || action === 'superlike') && !currentUser?.isPremium) {
        if (dailyLikes <= 0) {
          setShowPaywall(true);
          throw new Error('No likes remaining');
        }
        await decrementDailyLike(user.uid, action === 'superlike');
        setDailyLikes(prev => Math.max(0, prev - 1));
      }

      return recordSwipe(user.uid, matchId, action);
    },
    onSuccess: (result) => {
      if (result.isMatch && displayMatches.length > 0 && displayMatches[0]) {
        // It's a match! Add to connections and show modal
        const matchedUser = displayMatches[0];
        addConnection(matchedUser);
        setMatchModal({ visible: true, match: matchedUser });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    },
  });

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    if (displayMatches.length === 0 || isSwipePending) return;

    const currentMatch = displayMatches[0];
    if (!currentMatch) return;

    const action = direction === 'right' ? 'like' : 'pass';

    swipeMutate({ matchId: currentMatch.id, action });

    // Remove card from display immediately
    setTimeout(() => {
      setDisplayMatches((prev) => prev.slice(1));
    }, 300);
  }, [displayMatches, swipeMutate, isSwipePending]);

  const handleButtonSwipe = (direction: 'left' | 'right') => {
    if (isSwipePending) return; // Debounce - prevent rapid taps
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleSwipe(direction);
  };

  const handleSuperLike = () => {
    if (displayMatches.length === 0 || isSwipePending) return; // Debounce

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const currentMatch = displayMatches[0];
    if (!currentMatch) return;

    swipeMutate({ matchId: currentMatch.id, action: 'superlike' });

    setTimeout(() => {
      setDisplayMatches((prev) => prev.slice(1));
    }, 300);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#FDF8F5] items-center justify-center">
        <ActivityIndicator size="large" color="#E07A5F" />
        <Text
          className="text-[#636E72] mt-4"
          style={{ fontFamily: 'Outfit_400Regular' }}
        >
          Finding your matches...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FDF8F5]">
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="px-6 py-4 flex-row justify-between items-center">
          <Animated.View entering={FadeIn.duration(600)}>
            <View className="flex-row items-center">
              <Text
                className="text-2xl text-[#2D3436]"
                style={{ fontFamily: 'Cormorant_600SemiBold' }}
              >
                Discover
              </Text>
              {isShowingSamples && (
                <View className="ml-2 bg-[#F97316]/15 rounded-full px-2 py-0.5">
                  <Text
                    className="text-[10px] text-[#F97316]"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    SAMPLE
                  </Text>
                </View>
              )}
            </View>
            <Text
              className="text-sm text-[#636E72] mt-1"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              {isShowingSamples
                ? 'Preview profiles while we find your matches'
                : `${displayMatches.length} people match your values`}
            </Text>
          </Animated.View>

          {/* Daily likes counter or refresh for premium */}
          {currentUser?.isPremium ? (
            <Pressable
              onPress={handleRefresh}
              disabled={isRefreshing}
              className={`w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm active:scale-95 ${isRefreshing ? 'opacity-50' : ''}`}
            >
              {isRefreshing ? (
                <ActivityIndicator size="small" color="#636E72" />
              ) : (
                <RefreshCw size={18} color="#636E72" />
              )}
            </Pressable>
          ) : (
            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={handleRefresh}
                disabled={isRefreshing}
                className={`w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm active:scale-95 ${isRefreshing ? 'opacity-50' : ''}`}
              >
                {isRefreshing ? (
                  <ActivityIndicator size="small" color="#636E72" />
                ) : (
                  <RefreshCw size={18} color="#636E72" />
                )}
              </Pressable>
              <View className="bg-white rounded-full px-3 py-1.5 flex-row items-center shadow-sm">
                <Heart size={14} color="#E07A5F" fill="#E07A5F" />
                <Text
                  className="text-[#2D3436] ml-1.5"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  {dailyLikes}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Cards */}
        <View className="flex-1 items-center justify-center">
          {displayMatches.length > 0 ? (
            <View style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
              {displayMatches
                .slice(0, 3)
                .reverse()
                .map((match, index) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    index={displayMatches.slice(0, 3).length - 1 - index}
                    totalCards={Math.min(displayMatches.length, 3)}
                    onSwipe={handleSwipe}
                  />
                ))}
            </View>
          ) : (
            <Animated.View entering={FadeInDown.duration(600)} className="items-center px-8">
              <View className="w-24 h-24 rounded-full bg-[#F0E6E0] items-center justify-center mb-6">
                <Heart size={40} color="#E07A5F" />
              </View>
              <Text
                className="text-xl text-[#2D3436] text-center mb-2"
                style={{ fontFamily: 'Cormorant_600SemiBold' }}
              >
                You've seen everyone!
              </Text>
              <Text
                className="text-sm text-[#636E72] text-center mb-6"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                Check back later for new matches that align with your values
              </Text>
              <Pressable
                onPress={handleRefresh}
                disabled={isRefreshing}
                className={`flex-row items-center bg-[#E07A5F] rounded-full px-6 py-3 ${isRefreshing ? 'opacity-70' : ''}`}
              >
                {isRefreshing ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <RefreshCw size={18} color="#FFF" />
                )}
                <Text
                  className="text-white ml-2"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </Text>
              </Pressable>
            </Animated.View>
          )}
        </View>

        {/* Action buttons */}
        {displayMatches.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(300).duration(600)}
            className="flex-row justify-center items-center gap-6 pb-6"
          >
            <Pressable
              onPress={() => handleButtonSwipe('left')}
              disabled={isSwipePending}
              className={`w-16 h-16 rounded-full bg-white shadow-lg shadow-black/10 items-center justify-center active:scale-95 ${isSwipePending ? 'opacity-50' : ''}`}
            >
              <X size={28} color="#E07A5F" strokeWidth={2.5} />
            </Pressable>

            <Pressable
              onPress={() => handleButtonSwipe('right')}
              disabled={isSwipePending}
              className={`w-20 h-20 rounded-full items-center justify-center active:scale-95 ${isSwipePending ? 'opacity-50' : ''}`}
            >
              <LinearGradient
                colors={['#81B29A', '#6A9A82']}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#81B29A',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.4,
                  shadowRadius: 12,
                }}
              >
                <Heart size={32} color="#FFF" fill="#FFF" />
              </LinearGradient>
            </Pressable>

            <Pressable
              onPress={handleSuperLike}
              disabled={isSwipePending}
              className={`w-16 h-16 rounded-full bg-white shadow-lg shadow-black/10 items-center justify-center active:scale-95 ${isSwipePending ? 'opacity-50' : ''}`}
            >
              <Star size={28} color="#F2CC8F" fill="#F2CC8F" />
            </Pressable>
          </Animated.View>
        )}
      </SafeAreaView>

      {/* Match Modal */}
      <Modal
        visible={matchModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setMatchModal({ visible: false, match: null })}
      >
        <Pressable
          className="flex-1 bg-black/60 items-center justify-center"
          onPress={() => setMatchModal({ visible: false, match: null })}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Animated.View
              entering={ZoomIn.duration(400).springify()}
              className="bg-white rounded-3xl mx-6 overflow-hidden"
              style={{ width: width - 48, maxWidth: 360 }}
            >
              {/* Header with confetti-like gradient */}
              <LinearGradient
                colors={['#E07A5F', '#F2CC8F', '#81B29A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingVertical: 32, alignItems: 'center' }}
              >
                <Animated.View entering={ZoomIn.delay(200).duration(500)}>
                  <View className="w-20 h-20 rounded-full bg-white/30 items-center justify-center mb-4">
                    <Heart size={40} color="#FFF" fill="#FFF" />
                  </View>
                </Animated.View>
                <Animated.Text
                  entering={FadeInUp.delay(300).duration(500)}
                  className="text-3xl text-white text-center"
                  style={{ fontFamily: 'Cormorant_700Bold' }}
                >
                  It's a Match!
                </Animated.Text>
                <Animated.Text
                  entering={FadeInUp.delay(400).duration(500)}
                  className="text-white/90 text-center mt-2"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  You and {matchModal.match?.name} liked each other
                </Animated.Text>
              </LinearGradient>

              {/* Match Photos */}
              <Animated.View
                entering={FadeInUp.delay(500).duration(500)}
                className="flex-row justify-center -mt-8 mb-6"
              >
                <View className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden">
                  <Image
                    source={{ uri: currentUser?.photos?.[0] || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                </View>
                <View className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden -ml-6">
                  <Image
                    source={{ uri: matchModal.match?.photos?.[0] || matchModal.match?.photo }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                </View>
              </Animated.View>

              {/* Compatibility Score */}
              {matchModal.match?.compatibilityScore && (
                <Animated.View
                  entering={FadeInUp.delay(600).duration(500)}
                  className="items-center mb-6"
                >
                  <View className="bg-[#81B29A]/15 rounded-full px-4 py-2">
                    <Text
                      className="text-[#81B29A] text-sm"
                      style={{ fontFamily: 'Outfit_600SemiBold' }}
                    >
                      {matchModal.match.compatibilityScore}% Compatible
                    </Text>
                  </View>
                </Animated.View>
              )}

              {/* Action Buttons */}
              <Animated.View
                entering={FadeInUp.delay(700).duration(500)}
                className="px-6 pb-6"
              >
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setMatchModal({ visible: false, match: null });
                    // Navigate to chat with this match
                    router.push({
                      pathname: '/chat',
                      params: { matchId: matchModal.match?.id },
                    });
                  }}
                  className="active:scale-[0.98]"
                >
                  <LinearGradient
                    colors={['#E07A5F', '#D56A4F']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ borderRadius: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <MessageCircle size={20} color="#FFF" />
                    <Text
                      className="text-white text-lg ml-2"
                      style={{ fontFamily: 'Outfit_600SemiBold' }}
                    >
                      Send Message
                    </Text>
                  </LinearGradient>
                </Pressable>

                <Pressable
                  onPress={() => {
                    Haptics.selectionAsync();
                    setMatchModal({ visible: false, match: null });
                  }}
                  className="mt-3 py-3"
                >
                  <Text
                    className="text-[#636E72] text-center"
                    style={{ fontFamily: 'Outfit_500Medium' }}
                  >
                    Keep Swiping
                  </Text>
                </Pressable>
              </Animated.View>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
