import { View, Text, Pressable, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { MessageCircle, Heart, Sparkles, Video, Calendar, RefreshCw, Users, Gift } from 'lucide-react-native';
import * as Haptics from '@/lib/haptics';
import { useQuery } from '@tanstack/react-query';
import { useAppStore, Match } from '@/lib/store';
import { getConnections, getCurrentUser } from '@/lib/db';

function ConnectionCard({ connection, index }: { connection: Match; index: number }) {
  const router = useRouter();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/chat', params: { id: connection.id, name: connection.name } });
  };

  const handleVideoCall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/video-call',
      params: {
        matchId: connection.id,
        matchName: connection.name,
        matchPhoto: connection.photo,
        compatibilityScore: (connection.compatibilityScore ?? 0).toString(),
      },
    });
  };

  const handleScheduleDate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/schedule-video-date',
      params: {
        matchId: connection.id,
        matchName: connection.name,
        matchPhoto: connection.photo,
        compatibilityScore: (connection.compatibilityScore ?? 0).toString(),
      },
    });
  };

  return (
    <Animated.View entering={FadeInRight.delay(index * 100).duration(400)}>
      <Pressable
        onPress={handlePress}
        className="flex-row items-center bg-white rounded-2xl p-4 mb-3 shadow-sm shadow-black/5 active:scale-[0.98]"
      >
        {/* Avatar */}
        <View className="relative">
          <Image
            source={{ uri: connection.photo }}
            className="w-16 h-16 rounded-full"
          />
          {connection.isNew && (
            <View className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#E07A5F] items-center justify-center border-2 border-white">
              <Heart size={10} color="#FFF" fill="#FFF" />
            </View>
          )}
          {connection.hasVideoIntro && (
            <View className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#81B29A] items-center justify-center border-2 border-white">
              <Video size={10} color="#FFF" />
            </View>
          )}
        </View>

        {/* Info */}
        <View className="flex-1 ml-4">
          <View className="flex-row items-center">
            <Text
              className="text-lg text-[#2D3436]"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              {connection.name}
            </Text>
            {connection.compatibilityScore > 0 && (
              <View className="ml-2 flex-row items-center bg-[#E07A5F]/10 rounded-full px-2 py-0.5">
                <Sparkles size={10} color="#E07A5F" />
                <Text
                  className="text-xs text-[#E07A5F] ml-1"
                  style={{ fontFamily: 'Outfit_500Medium' }}
                >
                  {connection.compatibilityScore}%
                </Text>
              </View>
            )}
          </View>

          {connection.lastMessage ? (
            <Text
              className="text-sm text-[#636E72] mt-1"
              style={{ fontFamily: 'Outfit_400Regular' }}
              numberOfLines={1}
            >
              {connection.lastMessage}
            </Text>
          ) : (
            <Text
              className="text-sm text-[#81B29A] mt-1"
              style={{ fontFamily: 'Outfit_500Medium' }}
            >
              Say hello! Start the conversation
            </Text>
          )}
        </View>

        {/* Video Actions */}
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={handleScheduleDate}
            className="w-9 h-9 rounded-full bg-[#F2CC8F]/20 items-center justify-center"
          >
            <Calendar size={16} color="#F2CC8F" />
          </Pressable>
          <Pressable
            onPress={handleVideoCall}
            className="w-9 h-9 rounded-full bg-[#81B29A]/20 items-center justify-center"
          >
            <Video size={16} color="#81B29A" />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function ConnectionsScreen() {
  const router = useRouter();
  const storeConnections = useAppStore((s) => s.connections);
  const currentUser = useAppStore((s) => s.currentUser);

  // Fetch connections from database
  const { data: dbConnections, isLoading, refetch } = useQuery({
    queryKey: ['connections', currentUser?.id],
    queryFn: async () => {
      const user = await getCurrentUser();
      if (!user) return [];
      return getConnections(user.uid);
    },
    enabled: !!currentUser,
  });

  // Combine database connections with store connections (from new matches)
  const allConnections = [...(dbConnections || []), ...storeConnections].filter(
    (conn, index, self) => index === self.findIndex((c) => c.id === conn.id)
  );

  const newMatches = allConnections.filter((c) => c.isNew || !c.lastMessage);
  const conversations = allConnections.filter((c) => c.lastMessage && !c.isNew);

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#FDF8F5] items-center justify-center">
        <ActivityIndicator size="large" color="#E07A5F" />
        <Text
          className="text-[#636E72] mt-4"
          style={{ fontFamily: 'Outfit_400Regular' }}
        >
          Loading connections...
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
            <Text
              className="text-2xl text-[#2D3436]"
              style={{ fontFamily: 'Cormorant_600SemiBold' }}
            >
              Connections
            </Text>
            <Text
              className="text-sm text-[#636E72] mt-1"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              {allConnections.length} meaningful matches
            </Text>
          </Animated.View>

          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              refetch();
            }}
            className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm active:scale-95"
          >
            <RefreshCw size={18} color="#636E72" />
          </Pressable>
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {/* New Matches Section */}
          {newMatches.length > 0 && (
            <Animated.View entering={FadeInDown.delay(100).duration(500)} className="mb-6">
              <Text
                className="text-sm text-[#A0A8AB] mb-3"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                NEW MATCHES
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="-mx-6 px-6"
                style={{ flexGrow: 0 }}
              >
                <View className="flex-row gap-4">
                  {newMatches.map((match, index) => (
                    <Animated.View
                      key={match.id}
                      entering={FadeInRight.delay(index * 100).duration(400)}
                    >
                      <Pressable
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          router.push({ pathname: '/chat', params: { id: match.id, name: match.name } });
                        }}
                        className="items-center active:scale-95"
                      >
                        <View className="relative">
                          <View className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E07A5F] to-[#81B29A] p-0.5">
                            <Image
                              source={{ uri: match.photo }}
                              className="w-full h-full rounded-full"
                            />
                          </View>
                          {match.compatibilityScore > 0 && (
                            <View className="absolute -bottom-1 right-0 bg-[#81B29A] rounded-full px-2 py-0.5">
                              <Text
                                className="text-white text-xs"
                                style={{ fontFamily: 'Outfit_600SemiBold' }}
                              >
                                {match.compatibilityScore}%
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text
                          className="text-sm text-[#2D3436] mt-2"
                          style={{ fontFamily: 'Outfit_500Medium' }}
                        >
                          {match.name}
                        </Text>
                      </Pressable>
                    </Animated.View>
                  ))}
                </View>
              </ScrollView>
            </Animated.View>
          )}

          {/* Conversations Section */}
          {conversations.length > 0 && (
            <Animated.View entering={FadeInDown.delay(200).duration(500)}>
              <Text
                className="text-sm text-[#A0A8AB] mb-3"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                CONVERSATIONS
              </Text>

              {conversations.map((connection, index) => (
                <ConnectionCard
                  key={connection.id}
                  connection={connection}
                  index={index}
                />
              ))}
            </Animated.View>
          )}

          {/* Empty state */}
          {allConnections.length === 0 && (
            <Animated.View
              entering={FadeInDown.duration(600)}
              className="flex-1 py-6"
            >
              {/* Main Empty State Card */}
              <View className="bg-white rounded-3xl p-6 shadow-sm shadow-black/5 mb-6">
                <View className="items-center mb-6">
                  <View className="w-24 h-24 rounded-full bg-gradient-to-br from-[#E07A5F]/20 to-[#81B29A]/20 items-center justify-center mb-4">
                    <Heart size={40} color="#E07A5F" />
                  </View>
                  <Text
                    className="text-2xl text-[#2D3436] text-center mb-2"
                    style={{ fontFamily: 'Cormorant_600SemiBold' }}
                  >
                    Your Connections Start Here
                  </Text>
                  <Text
                    className="text-sm text-[#636E72] text-center px-4 leading-5"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    When you and someone mutually like each other, they'll appear here. This is where meaningful conversations begin.
                  </Text>
                </View>

                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    router.push('/(tabs)');
                  }}
                  className="bg-[#E07A5F] py-4 rounded-2xl active:scale-[0.98] mb-4"
                >
                  <Text
                    className="text-white text-center text-base"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    Start Discovering Matches
                  </Text>
                </Pressable>
              </View>

              {/* What Connections Are */}
              <View className="bg-[#F5F0ED] rounded-2xl p-5 mb-4">
                <Text
                  className="text-sm text-[#A0A8AB] mb-3"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  WHAT ARE CONNECTIONS?
                </Text>
                <View className="gap-4">
                  <View className="flex-row items-start">
                    <View className="w-8 h-8 rounded-full bg-[#E07A5F]/15 items-center justify-center mt-0.5">
                      <Users size={16} color="#E07A5F" />
                    </View>
                    <View className="flex-1 ml-3">
                      <Text
                        className="text-sm text-[#2D3436]"
                        style={{ fontFamily: 'Outfit_600SemiBold' }}
                      >
                        Mutual Interest
                      </Text>
                      <Text
                        className="text-xs text-[#636E72]"
                        style={{ fontFamily: 'Outfit_400Regular' }}
                      >
                        Both of you liked each other—a sign of initial compatibility
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-start">
                    <View className="w-8 h-8 rounded-full bg-[#81B29A]/15 items-center justify-center mt-0.5">
                      <MessageCircle size={16} color="#81B29A" />
                    </View>
                    <View className="flex-1 ml-3">
                      <Text
                        className="text-sm text-[#2D3436]"
                        style={{ fontFamily: 'Outfit_600SemiBold' }}
                      >
                        Start Conversations
                      </Text>
                      <Text
                        className="text-xs text-[#636E72]"
                        style={{ fontFamily: 'Outfit_400Regular' }}
                      >
                        Send messages with AI-powered conversation starters
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-start">
                    <View className="w-8 h-8 rounded-full bg-[#D4A574]/15 items-center justify-center mt-0.5">
                      <Video size={16} color="#D4A574" />
                    </View>
                    <View className="flex-1 ml-3">
                      <Text
                        className="text-sm text-[#2D3436]"
                        style={{ fontFamily: 'Outfit_600SemiBold' }}
                      >
                        Video Dates
                      </Text>
                      <Text
                        className="text-xs text-[#636E72]"
                        style={{ fontFamily: 'Outfit_400Regular' }}
                      >
                        Schedule video calls to connect face-to-face safely
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Sample Connection Preview */}
              <View className="bg-white rounded-2xl p-5 mb-4 border-2 border-dashed border-[#E0D5CC]">
                <View className="flex-row items-center mb-3">
                  <Sparkles size={16} color="#D4A574" />
                  <Text
                    className="text-sm text-[#D4A574] ml-2"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    EXAMPLE CONNECTION
                  </Text>
                </View>
                <View className="flex-row items-center bg-[#FDF8F5] rounded-xl p-4 opacity-70">
                  <View className="w-14 h-14 rounded-full bg-[#E07A5F]/20 items-center justify-center">
                    <Text className="text-xl">👤</Text>
                  </View>
                  <View className="flex-1 ml-4">
                    <View className="flex-row items-center">
                      <Text
                        className="text-base text-[#2D3436]"
                        style={{ fontFamily: 'Outfit_600SemiBold' }}
                      >
                        Alex, 28
                      </Text>
                      <View className="ml-2 flex-row items-center bg-[#81B29A]/15 rounded-full px-2 py-0.5">
                        <Sparkles size={10} color="#81B29A" />
                        <Text
                          className="text-xs text-[#81B29A] ml-1"
                          style={{ fontFamily: 'Outfit_500Medium' }}
                        >
                          92% Match
                        </Text>
                      </View>
                    </View>
                    <Text
                      className="text-sm text-[#81B29A] mt-1"
                      style={{ fontFamily: 'Outfit_500Medium' }}
                    >
                      Say hello! Start the conversation
                    </Text>
                  </View>
                </View>
                <Text
                  className="text-xs text-[#A0A8AB] text-center mt-3"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  This is what your connections will look like
                </Text>
              </View>

              {/* Quality Matching Info */}
              <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm shadow-black/5">
                <View className="flex-row items-center mb-3">
                  <Sparkles size={18} color="#D4A574" />
                  <Text
                    className="text-sm text-[#2D3436] ml-2"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    Quality Over Quantity
                  </Text>
                </View>
                <Text
                  className="text-xs text-[#636E72] leading-5"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  We use deep psychological profiling to find truly compatible matches—not just surface-level swiping. Your matches are based on:
                </Text>
                <View className="flex-row flex-wrap gap-2 mt-3">
                  {['Attachment Styles', 'Personality Types', 'Values', 'Love Languages'].map((item) => (
                    <View key={item} className="bg-[#E07A5F]/10 rounded-full px-3 py-1.5">
                      <Text
                        className="text-xs text-[#E07A5F]"
                        style={{ fontFamily: 'Outfit_500Medium' }}
                      >
                        {item}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Invite Friends */}
              <View className="bg-white rounded-2xl p-5 shadow-sm shadow-black/5">
                <View className="flex-row items-center mb-3">
                  <Gift size={18} color="#E07A5F" />
                  <Text
                    className="text-sm text-[#2D3436] ml-2"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                  Help Grow the Community
                  </Text>
                </View>
                <Text
                  className="text-xs text-[#636E72] mb-3 leading-5"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  The more quality people who join, the better your matches become. Know someone who'd be a great fit?
                </Text>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push('/referrals');
                  }}
                  className="bg-[#E07A5F]/10 rounded-xl py-3 active:scale-[0.98]"
                >
                  <Text
                    className="text-[#E07A5F] text-center text-sm"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    Invite Friends
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          )}

          <View className="h-20" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
