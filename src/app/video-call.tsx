import { View, Text, Pressable, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  RotateCcw,
  MessageCircle,
  Heart,
  Sparkles,
  Clock,
} from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from '@/lib/haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '@/lib/store';

export default function VideoCallScreen() {
  const { matchId, matchName, matchPhoto, compatibilityScore } = useLocalSearchParams<{
    matchId: string;
    matchName: string;
    matchPhoto: string;
    compatibilityScore: string;
  }>();

  const currentUser = useAppStore((s) => s.currentUser);
  const isPremium = currentUser?.isPremium ?? false;
  const setShowPaywall = useAppStore((s) => s.setShowPaywall);

  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(true);
  const [showTips, setShowTips] = useState(true);

  // Animated pulse for connecting state
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  // Simulate connection
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConnecting(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Call timer
  useEffect(() => {
    if (!isConnecting) {
      const interval = setInterval(() => {
        setCallDuration((d) => d + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isConnecting]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'End Video Date?',
      `You've been chatting for ${formatDuration(callDuration)}`,
      [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'End Call',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const handleToggleVideo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsVideoOn(!isVideoOn);
  };

  const handleToggleMute = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsMuted(!isMuted);
  };

  const handleSwitchCamera = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSendMessage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/chat',
      params: { id: matchId, name: matchName },
    });
  };

  const CONVERSATION_TIPS = [
    "Ask about their favorite travel memory",
    "Share something that made you laugh today",
    "Ask what they're passionate about",
    "Discuss a book or show you both might enjoy",
  ];

  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((t) => (t + 1) % CONVERSATION_TIPS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  if (isConnecting) {
    return (
      <View className="flex-1 bg-[#1a1a2e]">
        <SafeAreaView className="flex-1 items-center justify-center">
          <Animated.View style={pulseStyle} className="mb-8">
            <View className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#E07A5F]">
              <Image
                source={{ uri: matchPhoto || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330' }}
                className="w-full h-full"
              />
            </View>
          </Animated.View>

          <Text
            className="text-white text-2xl mb-2"
            style={{ fontFamily: 'Cormorant_600SemiBold' }}
          >
            Connecting to {matchName}...
          </Text>
          <Text
            className="text-white/60 text-sm"
            style={{ fontFamily: 'Outfit_400Regular' }}
          >
            Setting up your video date
          </Text>

          <View className="flex-row items-center mt-8 bg-white/10 px-4 py-2 rounded-full">
            <Heart size={16} color="#E07A5F" fill="#E07A5F" />
            <Text
              className="text-white/80 text-sm ml-2"
              style={{ fontFamily: 'Outfit_500Medium' }}
            >
              {compatibilityScore || '92'}% Compatible
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#1a1a2e]">
      {/* Match's Video (Full Screen Background) */}
      <View className="absolute inset-0">
        <Image
          source={{ uri: matchPhoto || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330' }}
          className="w-full h-full"
          style={{ opacity: 0.9 }}
        />
        <LinearGradient
          colors={['transparent', 'rgba(26,26,46,0.8)']}
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 300 }}
        />
        <LinearGradient
          colors={['rgba(26,26,46,0.6)', 'transparent']}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 150 }}
        />
      </View>

      <SafeAreaView className="flex-1">
        {/* Top Bar */}
        <Animated.View entering={FadeIn} className="px-5 pt-2">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center bg-black/30 px-4 py-2 rounded-full">
              <View className="w-2 h-2 rounded-full bg-[#81B29A] mr-2" />
              <Text
                className="text-white text-sm"
                style={{ fontFamily: 'Outfit_500Medium' }}
              >
                {formatDuration(callDuration)}
              </Text>
            </View>

            <View className="flex-row items-center bg-black/30 px-4 py-2 rounded-full">
              <Heart size={14} color="#E07A5F" fill="#E07A5F" />
              <Text
                className="text-white text-sm ml-1.5"
                style={{ fontFamily: 'Outfit_500Medium' }}
              >
                {compatibilityScore || '92'}%
              </Text>
            </View>
          </View>

          {/* Match Name */}
          <View className="items-center mt-4">
            <Text
              className="text-white text-xl"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              {matchName}
            </Text>
          </View>
        </Animated.View>

        {/* Self Video (PIP) */}
        <Animated.View
          entering={FadeInUp.delay(300)}
          className="absolute top-32 right-5"
        >
          <View className="w-28 h-40 rounded-2xl overflow-hidden bg-[#2D3436] border-2 border-white/20">
            {isVideoOn ? (
              <View className="flex-1 bg-[#3D4436] items-center justify-center">
                <Text
                  className="text-white/60 text-xs"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  Your camera
                </Text>
              </View>
            ) : (
              <View className="flex-1 items-center justify-center">
                <VideoOff size={24} color="#6B7280" />
                <Text
                  className="text-white/40 text-xs mt-1"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  Camera off
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Conversation Tips (Premium Feature) */}
        {showTips && isPremium && (
          <Animated.View
            entering={FadeInUp.delay(500)}
            className="absolute bottom-48 left-5 right-5"
          >
            <Pressable
              onPress={() => setShowTips(false)}
              className="bg-[#E07A5F]/90 rounded-2xl p-4"
            >
              <View className="flex-row items-center mb-2">
                <Sparkles size={16} color="#fff" />
                <Text
                  className="text-white/80 text-xs ml-2"
                  style={{ fontFamily: 'Outfit_500Medium' }}
                >
                  AI CONVERSATION TIP
                </Text>
              </View>
              <Text
                className="text-white text-base"
                style={{ fontFamily: 'Outfit_500Medium' }}
              >
                {CONVERSATION_TIPS[currentTip]}
              </Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Upsell for non-premium */}
        {showTips && !isPremium && (
          <Animated.View
            entering={FadeInUp.delay(500)}
            className="absolute bottom-48 left-5 right-5"
          >
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setShowPaywall(true);
                router.push('/paywall');
              }}
              className="bg-gradient-to-r from-[#E07A5F]/80 to-[#F2CC8F]/80 rounded-2xl p-4 border border-white/20"
            >
              <LinearGradient
                colors={['rgba(224,122,95,0.9)', 'rgba(242,204,143,0.9)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ position: 'absolute', inset: 0, borderRadius: 16 }}
              />
              <View className="flex-row items-center">
                <Sparkles size={20} color="#fff" />
                <View className="flex-1 ml-3">
                  <Text
                    className="text-white text-sm"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    Unlock AI Conversation Tips
                  </Text>
                  <Text
                    className="text-white/80 text-xs"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    Never run out of things to say
                  </Text>
                </View>
                <View className="bg-white px-3 py-1.5 rounded-full">
                  <Text
                    className="text-[#E07A5F] text-xs"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    Upgrade
                  </Text>
                </View>
              </View>
            </Pressable>
          </Animated.View>
        )}

        {/* Bottom Controls */}
        <View className="absolute bottom-0 left-0 right-0">
          <SafeAreaView edges={['bottom']}>
            <View className="px-5 pb-4">
              {/* Control Buttons */}
              <View className="flex-row items-center justify-center space-x-4 mb-6">
                {/* Mute */}
                <Pressable
                  onPress={handleToggleMute}
                  className={`w-14 h-14 rounded-full items-center justify-center ${
                    isMuted ? 'bg-white' : 'bg-white/20'
                  }`}
                >
                  {isMuted ? (
                    <MicOff size={24} color="#2D3436" />
                  ) : (
                    <Mic size={24} color="#fff" />
                  )}
                </Pressable>

                {/* Video Toggle */}
                <Pressable
                  onPress={handleToggleVideo}
                  className={`w-14 h-14 rounded-full items-center justify-center ${
                    !isVideoOn ? 'bg-white' : 'bg-white/20'
                  }`}
                >
                  {isVideoOn ? (
                    <Video size={24} color="#fff" />
                  ) : (
                    <VideoOff size={24} color="#2D3436" />
                  )}
                </Pressable>

                {/* End Call */}
                <Pressable
                  onPress={handleEndCall}
                  className="w-16 h-16 rounded-full bg-red-500 items-center justify-center"
                >
                  <Phone size={28} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
                </Pressable>

                {/* Switch Camera */}
                <Pressable
                  onPress={handleSwitchCamera}
                  className="w-14 h-14 rounded-full bg-white/20 items-center justify-center"
                >
                  <RotateCcw size={24} color="#fff" />
                </Pressable>

                {/* Message */}
                <Pressable
                  onPress={handleSendMessage}
                  className="w-14 h-14 rounded-full bg-white/20 items-center justify-center"
                >
                  <MessageCircle size={24} color="#fff" />
                </Pressable>
              </View>

              {/* Call Quality Indicator */}
              <View className="flex-row items-center justify-center">
                <View className="flex-row items-center bg-black/30 px-3 py-1.5 rounded-full">
                  <View className="flex-row space-x-0.5">
                    <View className="w-1 h-2 bg-[#81B29A] rounded-full" />
                    <View className="w-1 h-3 bg-[#81B29A] rounded-full" />
                    <View className="w-1 h-4 bg-[#81B29A] rounded-full" />
                    <View className="w-1 h-3 bg-white/30 rounded-full" />
                  </View>
                  <Text
                    className="text-white/60 text-xs ml-2"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    Good connection
                  </Text>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </SafeAreaView>
    </View>
  );
}
