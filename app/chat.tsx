import { View, Text, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeInRight, SlideInDown } from 'react-native-reanimated';
import { ArrowLeft, Send, Heart, Sparkles, Lightbulb, Lock, X, Wand2, MoreVertical, Ghost, Star, MessageSquare } from 'lucide-react-native';
import * as Haptics from '@/lib/haptics';
import { useState, useRef, useEffect, useCallback } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMessages, sendMessage, getCurrentUser, subscribeToMessages, getUserProfile, getConnections } from '@/lib/db';
import { useAppStore, LoveLanguage, LOVE_LANGUAGE_DESCRIPTIONS, Match } from '@/lib/store';
import { getMockMatchesForPreference, mockConnections } from '@/lib/mockData';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them' | 'ai';
  timestamp: string;
  isAiSuggestion?: boolean;
}

const sampleMessages: Message[] = [];

// AI conversation starters (replacing mockData import)
const aiConversationStarters = {
  highCompatibility: [
    "I noticed we both value {value}. What does that mean to you in your daily life?",
    "It's rare to find someone who also appreciates {value}. How did that become important to you?",
  ],
  loveLanguageTips: {
    'Words of Affirmation': "I'd love to hear about something you're proud of accomplishing recently.",
    'Quality Time': "What's your favorite way to spend a relaxed weekend?",
    'Acts of Service': "What small gestures make you feel most appreciated?",
    'Physical Touch': "Do you prefer cozy nights in or adventurous dates?",
    'Receiving Gifts': "What's the most thoughtful gift you've ever received?",
  } as Record<string, string>,
};

function MessageBubble({ message, isFirst, onUseSuggestion }: { message: Message; isFirst: boolean; onUseSuggestion?: (text: string) => void }) {
  const isMe = message.sender === 'me';
  const isAi = message.sender === 'ai';

  if (isAi) {
    return (
      <Animated.View
        entering={FadeInRight.delay(100).duration(400)}
        className="mb-3 items-center"
      >
        <View className="bg-purple-50 border border-purple-200 rounded-2xl px-4 py-3 max-w-[90%]">
          <View className="flex-row items-center mb-2">
            <Wand2 size={14} color="#9333EA" />
            <Text
              className="text-xs text-purple-600 ml-1.5"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              AI Suggestion
            </Text>
          </View>
          <Text
            className="text-sm text-[#2D3436] leading-5"
            style={{ fontFamily: 'Outfit_400Regular' }}
          >
            {message.text}
          </Text>
          {onUseSuggestion && (
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                onUseSuggestion(message.text);
              }}
              className="mt-3 bg-purple-600 rounded-lg py-2 items-center"
            >
              <Text
                className="text-white text-sm"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                Use This Message
              </Text>
            </Pressable>
          )}
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeInUp.delay(isFirst ? 0 : 100).duration(400)}
      className={`mb-3 ${isMe ? 'items-end' : 'items-start'}`}
    >
      <View
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isMe
            ? 'bg-[#E07A5F] rounded-br-sm'
            : 'bg-white rounded-bl-sm shadow-sm shadow-black/5'
        }`}
      >
        <Text
          className={`text-base ${isMe ? 'text-white' : 'text-[#2D3436]'}`}
          style={{ fontFamily: 'Outfit_400Regular' }}
        >
          {message.text}
        </Text>
      </View>
      <Text
        className="text-xs text-[#A0A8AB] mt-1 mx-1"
        style={{ fontFamily: 'Outfit_400Regular' }}
      >
        {message.timestamp}
      </Text>
    </Animated.View>
  );
}

export default function ChatScreen() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [selectedTip, setSelectedTip] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const queryClient = useQueryClient();

  const currentUser = useAppStore((s) => s.currentUser);
  const connections = useAppStore((s) => s.connections);
  const isPremium = currentUser?.isPremium ?? false;

  // Fetch match data from database if not in local store
  const { data: fetchedMatch } = useQuery({
    queryKey: ['match', id],
    queryFn: async () => {
      // First check database connections
      const user = await getCurrentUser();
      if (user) {
        const dbConnections = await getConnections(user.uid);
        const dbMatch = dbConnections.find((c) => c.id === id);
        if (dbMatch) return dbMatch;
      }

      // Then try to get user profile directly
      if (id) {
        const profile = await getUserProfile(id);
        if (profile) {
          const match: Match = {
            id: profile.id || id,
            name: profile.name,
            age: profile.age,
            photo: profile.photos?.[0] || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
            photos: profile.photos,
            bio: profile.bio,
            occupation: profile.occupation,
            location: profile.location,
            compatibilityScore: 85,
            attachmentStyle: profile.attachmentStyle || 'secure',
            mbtiType: profile.mbtiType ?? undefined,
            loveLanguages: profile.loveLanguages,
            sharedValues: profile.values || [],
            sharedInterests: profile.interests || [],
          };
          return match;
        }
      }
      return null;
    },
    enabled: !!id,
  });

  // Find the match from local store connections first, then fallback to fetched data or mock data
  const storeMatch = connections.find((c) => c.id === id);
  const allMockProfiles = [...getMockMatchesForPreference('everyone'), ...mockConnections];
  const mockMatch = allMockProfiles.find((m) => m.id === id);
  const match = storeMatch || fetchedMatch || mockMatch;

  // Fetch messages from database
  const { data: dbMessages, isLoading } = useQuery({
    queryKey: ['messages', id],
    queryFn: async () => {
      const user = await getCurrentUser();
      if (!user || !id) return [];
      return getMessages(user.uid, id);
    },
    enabled: !!id,
    refetchInterval: 3000, // Poll every 3 seconds for new messages
  });

  // Update local messages when database messages change
  useEffect(() => {
    if (dbMessages) {
      const formattedMessages: Message[] = dbMessages.map((msg) => ({
        id: msg.id,
        text: msg.text,
        sender: msg.sender as 'me' | 'them',
        timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));
      setMessages(formattedMessages);
    }
  }, [dbMessages]);

  // Send message mutation
  const { mutate: sendMessageMutate } = useMutation({
    mutationFn: async (text: string) => {
      const user = await getCurrentUser();
      if (!user || !id) throw new Error('Not authenticated');
      return sendMessage(user.uid, id, text);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', id] });
    },
  });

  const handleSend = () => {
    if (!inputText.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Optimistically add message to UI
    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMessage]);

    // Send to database
    sendMessageMutate(inputText.trim());
    setInputText('');

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleUseSuggestion = (text: string) => {
    setInputText(text);
    setShowAiPanel(false);

    // Remove AI suggestion from messages
    setMessages((prev) => prev.filter((m) => m.sender !== 'ai'));
  };

  const generateAiSuggestion = () => {
    if (!isPremium) {
      router.push('/paywall');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Generate contextual suggestion based on match profile
    let suggestion = '';

    if (match?.sharedValues && match.sharedValues.length > 0) {
      const value = match.sharedValues[0];
      suggestion = aiConversationStarters.highCompatibility[0].replace('{value}', value);
    } else if (match?.loveLanguages && match.loveLanguages.length > 0) {
      const lang = match.loveLanguages[0] as LoveLanguage;
      const langInfo = LOVE_LANGUAGE_DESCRIPTIONS[lang];
      suggestion = langInfo?.receiveLove || aiConversationStarters.loveLanguageTips['Quality Time'];
    } else {
      suggestion = "I'd love to know more about what brings you joy in life. What's something you're passionate about that most people don't know?";
    }

    // Add AI message
    const aiMessage: Message = {
      id: `ai-${Date.now()}`,
      text: suggestion,
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAiSuggestion: true,
    };

    setMessages((prev) => [...prev.filter((m) => m.sender !== 'ai'), aiMessage]);
    setShowAiPanel(false);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const aiSuggestions = [
    {
      id: 'values',
      title: 'Explore Values',
      description: 'Ask about shared interests',
      icon: Heart,
    },
    {
      id: 'deeper',
      title: 'Go Deeper',
      description: 'Meaningful conversation starter',
      icon: Lightbulb,
    },
    {
      id: 'playful',
      title: 'Be Playful',
      description: 'Fun and light question',
      icon: Sparkles,
    },
  ];

  // Get conversation tip based on match
  const getConversationTip = () => {
    if (match?.loveLanguages && match.loveLanguages.length > 0) {
      const lang = match.loveLanguages[0] as LoveLanguage;
      return LOVE_LANGUAGE_DESCRIPTIONS[lang]?.receiveLove || 'Ask about their interests and values!';
    }
    if (match?.attachmentStyle) {
      const tips: Record<string, string> = {
        Secure: 'They appreciate direct, honest communication.',
        Anxious: 'Respond promptly and be clear about your intentions.',
        Avoidant: 'Give them space and let things develop naturally.',
      };
      return tips[match.attachmentStyle] || 'Be authentic and show genuine interest!';
    }
    return 'You both value growth - ask about their personal journey!';
  };

  return (
    <View className="flex-1 bg-[#FDF8F5]">
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <Animated.View
          entering={FadeIn.duration(400)}
          className="flex-row items-center px-4 py-3 bg-white border-b border-[#F0E6E0]"
        >
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              router.back();
            }}
            className="w-10 h-10 items-center justify-center"
          >
            <ArrowLeft size={24} color="#2D3436" />
          </Pressable>

          <Pressable
            onPress={() => {
              if (match) {
                router.push({ pathname: '/profile-detail', params: { id: match.id } });
              }
            }}
            className="flex-1 items-center"
          >
            <Text
              className="text-lg text-[#2D3436]"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              {name || 'Chat'}
            </Text>
            <View className="flex-row items-center">
              <Sparkles size={12} color="#81B29A" />
              <Text
                className="text-xs text-[#81B29A] ml-1"
                style={{ fontFamily: 'Outfit_500Medium' }}
              >
                {match?.compatibilityScore ? `${match.compatibilityScore}% compatible` : 'High compatibility'}
              </Text>
            </View>
          </Pressable>

          <View className="w-10 h-10 rounded-full bg-[#E07A5F]/10 items-center justify-center">
            <Heart size={18} color="#E07A5F" />
          </View>

          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              setShowChatMenu(true);
            }}
            className="w-10 h-10 items-center justify-center ml-2"
          >
            <MoreVertical size={20} color="#636E72" />
          </Pressable>
        </Animated.View>

        {/* Compatibility tip */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          className="mx-4 mt-4 mb-2"
        >
          <View className="bg-[#81B29A]/10 rounded-xl p-3 flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-[#81B29A]/20 items-center justify-center mr-3">
              <Sparkles size={14} color="#81B29A" />
            </View>
            <View className="flex-1">
              <Text
                className="text-xs text-[#81B29A]"
                style={{ fontFamily: 'Outfit_500Medium' }}
              >
                Conversation tip
              </Text>
              <Text
                className="text-xs text-[#636E72]"
                style={{ fontFamily: 'Outfit_400Regular' }}
                numberOfLines={2}
              >
                {getConversationTip()}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 16, flexGrow: 1 }}
        >
          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="small" color="#E07A5F" />
              <Text
                className="text-[#636E72] mt-2 text-sm"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                Loading messages...
              </Text>
            </View>
          ) : messages.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <View className="w-16 h-16 rounded-full bg-[#E07A5F]/10 items-center justify-center mb-4">
                <Heart size={28} color="#E07A5F" />
              </View>
              <Text
                className="text-[#2D3436] text-base mb-1"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                Start the conversation!
              </Text>
              <Text
                className="text-[#636E72] text-sm text-center px-8"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                Say hello and get to know each other
              </Text>
            </View>
          ) : (
            messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isFirst={index === 0}
                onUseSuggestion={message.sender === 'ai' ? handleUseSuggestion : undefined}
              />
            ))
          )}
        </ScrollView>

        {/* AI Panel Overlay */}
        {showAiPanel && (
          <Animated.View
            entering={SlideInDown.duration(300)}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-xl shadow-black/20 z-10"
          >
            <SafeAreaView edges={['bottom']}>
              <View className="p-6">
                <View className="flex-row justify-between items-center mb-6">
                  <View className="flex-row items-center">
                    <Wand2 size={20} color="#9333EA" />
                    <Text
                      className="text-lg text-[#2D3436] ml-2"
                      style={{ fontFamily: 'Outfit_600SemiBold' }}
                    >
                      AI Conversation Coach
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => setShowAiPanel(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                  >
                    <X size={18} color="#636E72" />
                  </Pressable>
                </View>

                {!isPremium && (
                  <View className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
                    <View className="flex-row items-center mb-2">
                      <Lock size={16} color="#9333EA" />
                      <Text
                        className="text-purple-800 ml-2"
                        style={{ fontFamily: 'Outfit_600SemiBold' }}
                      >
                        Premium Feature
                      </Text>
                    </View>
                    <Text
                      className="text-sm text-purple-700"
                      style={{ fontFamily: 'Outfit_400Regular' }}
                    >
                      Unlock AI-powered conversation suggestions tailored to your match's personality.
                    </Text>
                  </View>
                )}

                <View className="gap-3 mb-6">
                  {aiSuggestions.map((suggestion) => (
                    <Pressable
                      key={suggestion.id}
                      onPress={() => {
                        setSelectedTip(suggestion.id);
                        generateAiSuggestion();
                      }}
                      className={`flex-row items-center p-4 rounded-xl border ${
                        selectedTip === suggestion.id
                          ? 'bg-purple-50 border-purple-300'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <View className={`w-10 h-10 rounded-full items-center justify-center ${
                        selectedTip === suggestion.id ? 'bg-purple-100' : 'bg-white'
                      }`}>
                        <suggestion.icon size={20} color={selectedTip === suggestion.id ? '#9333EA' : '#636E72'} />
                      </View>
                      <View className="ml-3 flex-1">
                        <Text
                          className="text-[#2D3436]"
                          style={{ fontFamily: 'Outfit_600SemiBold' }}
                        >
                          {suggestion.title}
                        </Text>
                        <Text
                          className="text-sm text-[#636E72]"
                          style={{ fontFamily: 'Outfit_400Regular' }}
                        >
                          {suggestion.description}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>

                <Pressable
                  onPress={generateAiSuggestion}
                  className="active:scale-[0.98]"
                >
                  <LinearGradient
                    colors={['#9333EA', '#7C3AED']}
                    style={{
                      paddingVertical: 16,
                      borderRadius: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Wand2 size={20} color="#FFF" />
                    <Text
                      className="text-white text-base ml-2"
                      style={{ fontFamily: 'Outfit_600SemiBold' }}
                    >
                      {isPremium ? 'Generate Suggestion' : 'Upgrade to Unlock'}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </SafeAreaView>
          </Animated.View>
        )}

        {/* Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <View className="px-4 py-3 bg-white border-t border-[#F0E6E0]">
            <View className="flex-row items-end gap-2">
              {/* AI Button */}
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync();
                  setShowAiPanel(true);
                }}
                className="w-12 h-12 rounded-full bg-purple-100 items-center justify-center active:scale-95"
              >
                <Wand2 size={20} color="#9333EA" />
              </Pressable>

              <View className="flex-1 bg-[#F5F0ED] rounded-2xl px-4 py-3">
                <TextInput
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Type a message..."
                  placeholderTextColor="#A0A8AB"
                  className="text-base text-[#2D3436] max-h-24"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                  multiline
                />
              </View>

              <Pressable
                onPress={handleSend}
                disabled={!inputText.trim()}
                className="active:scale-95"
              >
                <LinearGradient
                  colors={inputText.trim() ? ['#E07A5F', '#D56A4F'] : ['#D0D5D8', '#C0C5C8']}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Send size={20} color="#FFF" />
                </LinearGradient>
              </Pressable>
            </View>
          </View>
          <SafeAreaView edges={['bottom']}>
            <View />
          </SafeAreaView>
        </KeyboardAvoidingView>

        {/* Chat Menu Modal */}
        <Modal
          visible={showChatMenu}
          transparent
          animationType="fade"
          onRequestClose={() => setShowChatMenu(false)}
        >
          <Pressable
            className="flex-1 bg-black/40"
            onPress={() => setShowChatMenu(false)}
          >
            <View className="flex-1 justify-end">
              <Pressable onPress={(e) => e.stopPropagation()}>
                <Animated.View
                  entering={SlideInDown.duration(300)}
                  className="bg-white rounded-t-3xl"
                >
                  <SafeAreaView edges={['bottom']}>
                    <View className="p-6">
                      <View className="w-10 h-1 bg-[#E0D5CC] rounded-full self-center mb-6" />

                      <Text
                        className="text-lg text-[#2D3436] mb-4"
                        style={{ fontFamily: 'Outfit_600SemiBold' }}
                      >
                        Chat Options
                      </Text>

                      {/* Leave a Review */}
                      <Pressable
                        onPress={() => {
                          setShowChatMenu(false);
                          Haptics.selectionAsync();
                          router.push({
                            pathname: '/user-review',
                            params: { matchId: id, matchName: name },
                          });
                        }}
                        className="flex-row items-center py-4 border-b border-[#F0E6E0]"
                      >
                        <View className="w-10 h-10 rounded-xl bg-[#F2CC8F]/15 items-center justify-center">
                          <Star size={20} color="#D4A574" />
                        </View>
                        <View className="flex-1 ml-4">
                          <Text
                            className="text-base text-[#2D3436]"
                            style={{ fontFamily: 'Outfit_500Medium' }}
                          >
                            Leave Feedback
                          </Text>
                          <Text
                            className="text-xs text-[#636E72]"
                            style={{ fontFamily: 'Outfit_400Regular' }}
                          >
                            Rate your experience (private)
                          </Text>
                        </View>
                      </Pressable>

                      {/* End Gracefully */}
                      <Pressable
                        onPress={() => {
                          setShowChatMenu(false);
                          Haptics.selectionAsync();
                          router.push({
                            pathname: '/graceful-exit',
                            params: { matchId: id, matchName: name },
                          });
                        }}
                        className="flex-row items-center py-4"
                      >
                        <View className="w-10 h-10 rounded-xl bg-[#81B29A]/15 items-center justify-center">
                          <Ghost size={20} color="#81B29A" />
                        </View>
                        <View className="flex-1 ml-4">
                          <Text
                            className="text-base text-[#2D3436]"
                            style={{ fontFamily: 'Outfit_500Medium' }}
                          >
                            End Gracefully
                          </Text>
                          <Text
                            className="text-xs text-[#636E72]"
                            style={{ fontFamily: 'Outfit_400Regular' }}
                          >
                            Send a kind message instead of ghosting
                          </Text>
                        </View>
                      </Pressable>

                      {/* Cancel Button */}
                      <Pressable
                        onPress={() => setShowChatMenu(false)}
                        className="mt-4 py-4 bg-[#F5F0ED] rounded-2xl items-center"
                      >
                        <Text
                          className="text-[#636E72] text-base"
                          style={{ fontFamily: 'Outfit_600SemiBold' }}
                        >
                          Cancel
                        </Text>
                      </Pressable>
                    </View>
                  </SafeAreaView>
                </Animated.View>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </View>
  );
}
