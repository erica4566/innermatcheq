import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Clock,
  Coffee,
  UserX,
  Sparkles,
  Check,
  Ghost,
} from 'lucide-react-native';
import * as Haptics from '@/lib/haptics';
import { useAppStore } from '@/lib/store';

interface ExitOption {
  id: string;
  title: string;
  message: string;
  icon: typeof Heart;
  color: string;
  kind: 'kind' | 'honest' | 'pause';
}

const EXIT_OPTIONS: ExitOption[] = [
  {
    id: 'busy',
    title: 'Taking a Break',
    message: "Hey! I wanted to let you know I'm taking a little break from dating apps right now. It's been nice chatting with you, and I wish you all the best!",
    icon: Coffee,
    color: '#81B29A',
    kind: 'kind',
  },
  {
    id: 'not_feeling',
    title: 'Not Feeling It',
    message: "I've really enjoyed our conversations, but I'm not feeling the romantic connection I'm looking for. I think you're great though, and I hope you find what you're looking for!",
    icon: Heart,
    color: '#E07A5F',
    kind: 'honest',
  },
  {
    id: 'someone_else',
    title: 'Met Someone',
    message: "I wanted to be upfront with you - I've started seeing someone and want to focus on that. Thanks for the great conversations, and I wish you all the best!",
    icon: Sparkles,
    color: '#D4A574',
    kind: 'honest',
  },
  {
    id: 'need_time',
    title: 'Need More Time',
    message: "I'm enjoying getting to know you, but I need to slow things down a bit. Would you be okay if we took things at a more gradual pace?",
    icon: Clock,
    color: '#636E72',
    kind: 'pause',
  },
];

export default function GracefulExitScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ matchId?: string; matchName?: string }>();
  const matchName = params.matchName ?? 'your match';

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const selectedOptionData = EXIT_OPTIONS.find((o) => o.id === selectedOption);

  const handleSelect = (optionId: string) => {
    Haptics.selectionAsync();
    setSelectedOption(optionId);
    const option = EXIT_OPTIONS.find((o) => o.id === optionId);
    if (option) {
      setCustomMessage(option.message);
    }
  };

  const handleSend = async () => {
    if (!selectedOption || !customMessage.trim()) return;

    setIsSending(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In production, this would send the message and update match status
    console.log('[GracefulExit] Sent:', {
      matchId: params.matchId,
      option: selectedOption,
      message: customMessage,
    });

    setIsSending(false);

    Alert.alert(
      'Message Sent',
      "You've handled this with grace. This is what healthy dating looks like!",
      [{ text: 'Done', onPress: () => router.back() }]
    );
  };

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
              End Gracefully
            </Text>
            <Text
              className="text-xs text-[#636E72]"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              No ghosting, just honesty
            </Text>
          </View>
          <View className="w-10" />
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {/* Intro Card */}
          <Animated.View entering={FadeIn.duration(400)} className="mb-6">
            <View className="bg-[#81B29A]/10 rounded-2xl p-4">
              <View className="flex-row items-center mb-2">
                <View className="w-10 h-10 rounded-full bg-[#81B29A]/20 items-center justify-center">
                  <Ghost size={20} color="#81B29A" />
                </View>
                <View className="ml-3 flex-1">
                  <Text
                    className="text-base text-[#2D3436]"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    Ghosting hurts everyone
                  </Text>
                  <Text
                    className="text-xs text-[#636E72]"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    A kind message takes seconds but means so much
                  </Text>
                </View>
              </View>
              <Text
                className="text-sm text-[#636E72]"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                Choose a template below to send {matchName} a respectful message. You can customize it to feel more personal.
              </Text>
            </View>
          </Animated.View>

          {/* Exit Options */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)} className="mb-6">
            <Text
              className="text-sm text-[#A0A8AB] mb-3"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              CHOOSE YOUR MESSAGE
            </Text>

            {EXIT_OPTIONS.map((option, index) => {
              const Icon = option.icon;
              const isSelected = selectedOption === option.id;

              return (
                <Animated.View
                  key={option.id}
                  entering={FadeInDown.delay(150 + index * 50).duration(400)}
                >
                  <Pressable
                    onPress={() => handleSelect(option.id)}
                    className={`mb-3 rounded-2xl p-4 border-2 ${
                      isSelected
                        ? 'bg-white border-[#81B29A]'
                        : 'bg-white border-transparent'
                    } shadow-sm shadow-black/5`}
                  >
                    <View className="flex-row items-center">
                      <View
                        className="w-12 h-12 rounded-xl items-center justify-center"
                        style={{ backgroundColor: `${option.color}15` }}
                      >
                        <Icon size={24} color={option.color} />
                      </View>
                      <View className="flex-1 ml-4">
                        <Text
                          className="text-base text-[#2D3436]"
                          style={{ fontFamily: 'Outfit_600SemiBold' }}
                        >
                          {option.title}
                        </Text>
                        <Text
                          className="text-xs text-[#636E72] mt-0.5"
                          style={{ fontFamily: 'Outfit_400Regular' }}
                        >
                          {option.kind === 'kind' ? 'Kind & Gentle' : option.kind === 'honest' ? 'Honest & Direct' : 'Takes a Pause'}
                        </Text>
                      </View>
                      <View
                        className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                          isSelected ? 'bg-[#81B29A] border-[#81B29A]' : 'border-[#D0D5D8]'
                        }`}
                      >
                        {isSelected && <Check size={14} color="#FFF" strokeWidth={3} />}
                      </View>
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })}
          </Animated.View>

          {/* Message Preview */}
          {selectedOptionData && (
            <Animated.View entering={FadeInDown.duration(400)} className="mb-6">
              <Text
                className="text-sm text-[#A0A8AB] mb-3"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                MESSAGE PREVIEW
              </Text>
              <View className="bg-white rounded-2xl p-4 shadow-sm shadow-black/5">
                <View className="flex-row items-center mb-3">
                  <MessageCircle size={16} color="#E07A5F" />
                  <Text
                    className="text-xs text-[#636E72] ml-2"
                    style={{ fontFamily: 'Outfit_500Medium' }}
                  >
                    This message will be sent to {matchName}
                  </Text>
                </View>
                <View className="bg-[#E07A5F] rounded-2xl rounded-br-sm p-4">
                  <Text
                    className="text-white text-sm leading-5"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    {customMessage}
                  </Text>
                </View>
              </View>
            </Animated.View>
          )}

          {/* Send Button */}
          {selectedOption && (
            <Animated.View entering={FadeInDown.delay(200).duration(400)} className="mb-8">
              <Pressable
                onPress={handleSend}
                disabled={isSending}
                className={`active:scale-[0.98] ${isSending ? 'opacity-50' : ''}`}
              >
                <LinearGradient
                  colors={['#81B29A', '#6A9A82']}
                  style={{ paddingVertical: 18, borderRadius: 16, alignItems: 'center' }}
                >
                  <Text
                    className="text-white text-lg"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    {isSending ? 'Sending...' : 'Send Message'}
                  </Text>
                </LinearGradient>
              </Pressable>

              <Text
                className="text-xs text-[#A0A8AB] text-center mt-3"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                The conversation will be archived after sending
              </Text>
            </Animated.View>
          )}

          {/* Stats/Info */}
          <Animated.View entering={FadeInDown.delay(300).duration(500)} className="mb-8">
            <View className="bg-[#F5F0ED] rounded-2xl p-4">
              <Text
                className="text-sm text-[#2D3436] text-center"
                style={{ fontFamily: 'Outfit_500Medium' }}
              >
                Users who send graceful exits are rated{' '}
                <Text style={{ color: '#81B29A', fontFamily: 'Outfit_700Bold' }}>42% higher</Text>{' '}
                in respect and get better matches
              </Text>
            </View>
          </Animated.View>

          <View className="h-8" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
