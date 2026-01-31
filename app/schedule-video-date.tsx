import { View, Text, Pressable, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import {
  ChevronLeft,
  Calendar,
  Clock,
  Video,
  Sparkles,
  Check,
  Crown,
  Heart,
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from '@/lib/haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore, VideoDate } from '@/lib/store';

const TIME_SLOTS = [
  '10:00 AM',
  '12:00 PM',
  '2:00 PM',
  '4:00 PM',
  '6:00 PM',
  '8:00 PM',
  '10:00 PM',
];

const DURATION_OPTIONS = [
  { minutes: 15, label: '15 min', description: 'Quick intro' },
  { minutes: 30, label: '30 min', description: 'Get to know each other', premium: false },
  { minutes: 60, label: '60 min', description: 'Deep connection', premium: true },
];

export default function ScheduleVideoDateScreen() {
  const { matchId, matchName, matchPhoto, compatibilityScore } = useLocalSearchParams<{
    matchId: string;
    matchName: string;
    matchPhoto: string;
    compatibilityScore: string;
  }>();

  const currentUser = useAppStore((s) => s.currentUser);
  const isPremium = currentUser?.isPremium ?? false;
  const scheduleVideoDate = useAppStore((s) => s.scheduleVideoDate);
  const setShowPaywall = useAppStore((s) => s.setShowPaywall);

  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(30);

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  const formatDay = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  const formatDate = (date: Date) => {
    return date.getDate().toString();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const handleSchedule = () => {
    if (selectedDate === null || !selectedTime) {
      Alert.alert('Select Date & Time', 'Please select a date and time for your video date');
      return;
    }

    const duration = DURATION_OPTIONS.find((d) => d.minutes === selectedDuration);
    if (duration?.premium && !isPremium) {
      setShowPaywall(true);
      router.push('/paywall');
      return;
    }

    const scheduledAt = new Date(dates[selectedDate]);
    const [time, period] = selectedTime.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    const hour24 = period === 'PM' && hours !== 12 ? hours + 12 : hours === 12 && period === 'AM' ? 0 : hours;
    scheduledAt.setHours(hour24, minutes, 0, 0);

    const videoDate: VideoDate = {
      id: `vd_${Date.now()}`,
      matchId: matchId ?? '',
      matchName: matchName ?? '',
      matchPhoto: matchPhoto ?? '',
      scheduledAt: scheduledAt.toISOString(),
      duration: selectedDuration,
      status: 'scheduled',
    };

    scheduleVideoDate(videoDate);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Alert.alert(
      'Video Date Scheduled!',
      `Your video date with ${matchName} is set for ${formatDay(dates[selectedDate])}, ${formatDate(dates[selectedDate])} at ${selectedTime}`,
      [
        {
          text: 'Great!',
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-[#FDF8F5]">
      <SafeAreaView edges={['top']} className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-5 py-4">
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            className="w-10 h-10 items-center justify-center rounded-full bg-white"
          >
            <ChevronLeft size={24} color="#2D3436" />
          </Pressable>
          <Text
            className="flex-1 text-center text-xl text-[#2D3436] mr-10"
            style={{ fontFamily: 'Outfit_600SemiBold' }}
          >
            Schedule Video Date
          </Text>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Match Preview */}
          <Animated.View entering={FadeInDown.delay(100)} className="mx-5 mb-6">
            <View
              className="bg-white rounded-2xl p-4 flex-row items-center"
              style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 }}
            >
              <View className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#E07A5F]">
                <Image
                  source={{ uri: matchPhoto || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330' }}
                  className="w-full h-full"
                />
              </View>
              <View className="flex-1 ml-4">
                <Text
                  className="text-[#2D3436] text-lg"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  {matchName || 'Your Match'}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Heart size={14} color="#E07A5F" fill="#E07A5F" />
                  <Text
                    className="text-[#6B7280] text-sm ml-1"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    {compatibilityScore || '92'}% Compatible
                  </Text>
                </View>
              </View>
              <View className="w-12 h-12 rounded-full bg-[#E07A5F]/10 items-center justify-center">
                <Video size={24} color="#E07A5F" />
              </View>
            </View>
          </Animated.View>

          {/* Date Selection */}
          <Animated.View entering={FadeInDown.delay(200)} className="mb-6">
            <View className="px-5 mb-3 flex-row items-center">
              <Calendar size={18} color="#2D3436" />
              <Text
                className="text-[#2D3436] text-base ml-2"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                Select Date
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="pl-5"
              contentContainerStyle={{ paddingRight: 20 }}
              style={{ flexGrow: 0 }}
            >
              {dates.map((date, index) => {
                const isSelected = selectedDate === index;
                return (
                  <Pressable
                    key={index}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedDate(index);
                    }}
                    className={`w-16 h-20 rounded-2xl mr-3 items-center justify-center ${
                      isSelected ? 'bg-[#E07A5F]' : 'bg-white'
                    }`}
                    style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 }}
                  >
                    <Text
                      className={`text-xs ${isSelected ? 'text-white/80' : 'text-[#6B7280]'}`}
                      style={{ fontFamily: 'Outfit_500Medium' }}
                    >
                      {isToday(date) ? 'Today' : formatDay(date)}
                    </Text>
                    <Text
                      className={`text-2xl mt-1 ${isSelected ? 'text-white' : 'text-[#2D3436]'}`}
                      style={{ fontFamily: 'Outfit_700Bold' }}
                    >
                      {formatDate(date)}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>

          {/* Time Selection */}
          <Animated.View entering={FadeInDown.delay(300)} className="mx-5 mb-6">
            <View className="mb-3 flex-row items-center">
              <Clock size={18} color="#2D3436" />
              <Text
                className="text-[#2D3436] text-base ml-2"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                Select Time
              </Text>
            </View>
            <View className="flex-row flex-wrap">
              {TIME_SLOTS.map((time) => {
                const isSelected = selectedTime === time;
                return (
                  <Pressable
                    key={time}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedTime(time);
                    }}
                    className={`px-4 py-3 rounded-xl mr-2 mb-2 ${
                      isSelected ? 'bg-[#E07A5F]' : 'bg-white'
                    }`}
                    style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 }}
                  >
                    <Text
                      className={`text-sm ${isSelected ? 'text-white' : 'text-[#2D3436]'}`}
                      style={{ fontFamily: 'Outfit_500Medium' }}
                    >
                      {time}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>

          {/* Duration Selection */}
          <Animated.View entering={FadeInDown.delay(400)} className="mx-5 mb-6">
            <View className="mb-3 flex-row items-center">
              <Video size={18} color="#2D3436" />
              <Text
                className="text-[#2D3436] text-base ml-2"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                Call Duration
              </Text>
            </View>
            {DURATION_OPTIONS.map((option) => {
              const isSelected = selectedDuration === option.minutes;
              const isLocked = option.premium && !isPremium;
              return (
                <Pressable
                  key={option.minutes}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    if (isLocked) {
                      setShowPaywall(true);
                      router.push('/paywall');
                    } else {
                      setSelectedDuration(option.minutes);
                    }
                  }}
                  className={`flex-row items-center p-4 rounded-2xl mb-3 ${
                    isSelected ? 'bg-[#E07A5F]' : 'bg-white'
                  }`}
                  style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 }}
                >
                  <View
                    className={`w-10 h-10 rounded-full items-center justify-center ${
                      isSelected ? 'bg-white/20' : 'bg-[#F0E6E0]'
                    }`}
                  >
                    {isLocked ? (
                      <Crown size={20} color={isSelected ? '#fff' : '#F2CC8F'} />
                    ) : (
                      <Clock size={20} color={isSelected ? '#fff' : '#E07A5F'} />
                    )}
                  </View>
                  <View className="flex-1 ml-3">
                    <Text
                      className={`text-base ${isSelected ? 'text-white' : 'text-[#2D3436]'}`}
                      style={{ fontFamily: 'Outfit_600SemiBold' }}
                    >
                      {option.label}
                    </Text>
                    <Text
                      className={`text-xs ${isSelected ? 'text-white/80' : 'text-[#6B7280]'}`}
                      style={{ fontFamily: 'Outfit_400Regular' }}
                    >
                      {option.description}
                    </Text>
                  </View>
                  {isSelected && (
                    <View className="w-6 h-6 rounded-full bg-white items-center justify-center">
                      <Check size={16} color="#E07A5F" />
                    </View>
                  )}
                  {isLocked && !isSelected && (
                    <View className="bg-[#F2CC8F]/20 px-3 py-1 rounded-full">
                      <Text
                        className="text-[#F2CC8F] text-xs"
                        style={{ fontFamily: 'Outfit_500Medium' }}
                      >
                        Premium
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </Animated.View>

          {/* Tips */}
          <Animated.View entering={FadeInUp.delay(500)} className="mx-5 mb-8">
            <View className="bg-[#81B29A]/10 rounded-2xl p-4">
              <View className="flex-row items-center mb-2">
                <Sparkles size={16} color="#81B29A" />
                <Text
                  className="text-[#81B29A] text-sm ml-2"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Video Date Tips
                </Text>
              </View>
              <Text
                className="text-[#2D3436] text-sm leading-5"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                • Find a quiet, well-lit space{'\n'}
                • Test your camera before the call{'\n'}
                • Be yourself and have fun!
              </Text>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Schedule Button */}
        <View className="px-5 pb-4">
          <SafeAreaView edges={['bottom']}>
            <Pressable
              onPress={handleSchedule}
              disabled={selectedDate === null || !selectedTime}
              className="overflow-hidden rounded-full"
            >
              <LinearGradient
                colors={
                  selectedDate !== null && selectedTime
                    ? ['#E07A5F', '#F2CC8F']
                    : ['#D1D5DB', '#D1D5DB']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingVertical: 18,
                  alignItems: 'center',
                  borderRadius: 9999,
                }}
              >
                <View className="flex-row items-center">
                  <Video size={20} color="#fff" />
                  <Text
                    className="text-white text-base ml-2"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    Schedule Video Date
                  </Text>
                </View>
              </LinearGradient>
            </Pressable>
          </SafeAreaView>
        </View>
      </SafeAreaView>
    </View>
  );
}
