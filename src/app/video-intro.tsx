import { View, Text, Pressable, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useRef } from 'react';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Video, X, RefreshCw, Check, Play, Pause, Clock, Sparkles, ChevronLeft } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from '@/lib/haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '@/lib/store';

const { width, height } = Dimensions.get('window');
const MAX_DURATION = 30; // 30 seconds max

export default function VideoIntroScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [facing, setFacing] = useState<CameraType>('front');
  const cameraRef = useRef<CameraView>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const updateCurrentUser = useAppStore((s) => s.updateCurrentUser);

  const handleStartRecording = async () => {
    if (!cameraRef.current) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRecording(true);
    setRecordingDuration(0);

    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingDuration((prev) => {
        if (prev >= MAX_DURATION - 1) {
          handleStopRecording();
          return MAX_DURATION;
        }
        return prev + 1;
      });
    }, 1000);

    try {
      const video = await cameraRef.current.recordAsync({
        maxDuration: MAX_DURATION,
      });
      if (video?.uri) {
        setRecordedVideo(video.uri);
      }
    } catch (error) {
      console.log('Recording error:', error);
    }
  };

  const handleStopRecording = async () => {
    if (!cameraRef.current || !isRecording) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);

    try {
      cameraRef.current.stopRecording();
    } catch (error) {
      console.log('Stop recording error:', error);
    }
  };

  const handleRetake = () => {
    Haptics.selectionAsync();
    setRecordedVideo(null);
    setRecordingDuration(0);
  };

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // In production, this would upload the video
    updateCurrentUser({ hasVideoIntro: true });
    Alert.alert(
      'Video Intro Saved!',
      'Your video intro is now visible to potential matches. You\'ll get 3x more connections!',
      [{ text: 'Great!', onPress: () => router.back() }]
    );
  };

  const toggleCameraFacing = () => {
    Haptics.selectionAsync();
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  if (!permission) {
    return (
      <View className="flex-1 bg-[#FDF8F5] items-center justify-center">
        <Text className="text-[#636E72]" style={{ fontFamily: 'Outfit_400Regular' }}>
          Loading camera...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-[#FDF8F5]">
        <SafeAreaView className="flex-1" edges={['top']}>
          <View className="flex-row items-center px-6 py-4">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center rounded-full bg-white"
            >
              <ChevronLeft size={24} color="#2D3436" />
            </Pressable>
            <Text
              className="flex-1 text-xl text-[#2D3436] text-center mr-10"
              style={{ fontFamily: 'Cormorant_600SemiBold' }}
            >
              Video Intro
            </Text>
          </View>

          <View className="flex-1 items-center justify-center px-8">
            <View className="w-20 h-20 rounded-full bg-[#E07A5F]/10 items-center justify-center mb-6">
              <Video size={40} color="#E07A5F" />
            </View>
            <Text
              className="text-2xl text-[#2D3436] text-center mb-3"
              style={{ fontFamily: 'Cormorant_600SemiBold' }}
            >
              Camera Access Needed
            </Text>
            <Text
              className="text-base text-[#636E72] text-center mb-8"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              To record your video intro, we need access to your camera. Your video helps matches see the real you!
            </Text>
            <Pressable
              onPress={requestPermission}
              className="active:scale-95"
            >
              <LinearGradient
                colors={['#E07A5F', '#D4654D']}
                style={{ paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16 }}
              >
                <Text className="text-white text-base" style={{ fontFamily: 'Outfit_600SemiBold' }}>
                  Grant Camera Access
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Preview recorded video state
  if (recordedVideo) {
    return (
      <View className="flex-1 bg-black">
        <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4">
            <Pressable
              onPress={handleRetake}
              className="flex-row items-center bg-white/20 rounded-full px-4 py-2"
            >
              <RefreshCw size={18} color="#FFF" />
              <Text className="text-white text-sm ml-2" style={{ fontFamily: 'Outfit_500Medium' }}>
                Retake
              </Text>
            </Pressable>
            <Text className="text-white text-lg" style={{ fontFamily: 'Outfit_600SemiBold' }}>
              Preview
            </Text>
            <View className="w-20" />
          </View>

          {/* Video Preview Placeholder */}
          <View className="flex-1 items-center justify-center">
            <View className="w-48 h-48 rounded-full bg-white/10 items-center justify-center">
              <Play size={64} color="#FFF" fill="#FFF" />
            </View>
            <Text
              className="text-white/80 text-base mt-6 text-center px-8"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              Your {recordingDuration} second video intro is ready!
            </Text>
          </View>

          {/* Save Button */}
          <View className="px-6 pb-4">
            <Pressable onPress={handleSave} className="active:scale-95">
              <LinearGradient
                colors={['#81B29A', '#6A9B84']}
                style={{ paddingVertical: 18, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
              >
                <Check size={20} color="#FFF" />
                <Text className="text-white text-lg ml-2" style={{ fontFamily: 'Outfit_600SemiBold' }}>
                  Save Video Intro
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing={facing}
        mode="video"
      >
        <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
          {/* Header */}
          <Animated.View entering={FadeIn.duration(400)} className="flex-row items-center justify-between px-6 py-4">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center rounded-full bg-black/30"
            >
              <X size={24} color="#FFF" />
            </Pressable>

            {/* Recording indicator */}
            {isRecording && (
              <View className="flex-row items-center bg-red-500/90 rounded-full px-4 py-2">
                <View className="w-2 h-2 rounded-full bg-white mr-2" />
                <Text className="text-white text-sm" style={{ fontFamily: 'Outfit_600SemiBold' }}>
                  {recordingDuration}s / {MAX_DURATION}s
                </Text>
              </View>
            )}

            <Pressable
              onPress={toggleCameraFacing}
              className="w-10 h-10 items-center justify-center rounded-full bg-black/30"
            >
              <RefreshCw size={20} color="#FFF" />
            </Pressable>
          </Animated.View>

          {/* Tips */}
          {!isRecording && (
            <Animated.View entering={FadeInDown.delay(200).duration(500)} className="px-6 mt-4">
              <View className="bg-black/40 rounded-2xl p-4">
                <View className="flex-row items-center mb-2">
                  <Sparkles size={16} color="#F2CC8F" />
                  <Text className="text-white text-sm ml-2" style={{ fontFamily: 'Outfit_600SemiBold' }}>
                    Tips for a Great Intro
                  </Text>
                </View>
                <Text className="text-white/80 text-xs" style={{ fontFamily: 'Outfit_400Regular' }}>
                  • Good lighting (face a window){'\n'}
                  • Share your interests & personality{'\n'}
                  • Smile and be yourself!
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Spacer */}
          <View className="flex-1" />

          {/* Recording Controls */}
          <Animated.View entering={FadeInUp.delay(300).duration(500)} className="items-center pb-8">
            {/* Duration indicator */}
            <View className="flex-row items-center mb-4">
              <Clock size={14} color="#FFF" />
              <Text className="text-white/80 text-sm ml-1" style={{ fontFamily: 'Outfit_400Regular' }}>
                Up to {MAX_DURATION} seconds
              </Text>
            </View>

            {/* Record button */}
            <Pressable
              onPress={isRecording ? handleStopRecording : handleStartRecording}
              className="active:scale-95"
            >
              <View
                className="w-20 h-20 rounded-full items-center justify-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
              >
                {isRecording ? (
                  <View className="w-8 h-8 rounded-md bg-red-500" />
                ) : (
                  <View className="w-16 h-16 rounded-full bg-red-500" />
                )}
              </View>
            </Pressable>

            <Text className="text-white/60 text-sm mt-4" style={{ fontFamily: 'Outfit_400Regular' }}>
              {isRecording ? 'Tap to stop' : 'Tap to start recording'}
            </Text>
          </Animated.View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}
