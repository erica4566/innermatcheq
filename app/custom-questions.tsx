import { View, Text, Pressable, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  ArrowLeft,
  Plus,
  Trash2,
  HelpCircle,
  Lightbulb,
  Heart,
  Shield,
  Compass,
  MessageCircle,
  Repeat,
  Sparkles,
  Lock,
} from 'lucide-react-native';
import * as Haptics from '@/lib/haptics';
import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { deepQuestionBank, questionCategories, DeepQuestion } from '@/lib/mockData';

const categoryIcons: Record<string, typeof Heart> = {
  emotional_depth: Heart,
  conflict_style: Shield,
  vulnerability: Lock,
  life_vision: Compass,
  relationship_patterns: Repeat,
};

export default function CustomQuestionsScreen() {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const updateCurrentUser = useAppStore((s) => s.updateCurrentUser);

  const [customQuestions, setCustomQuestions] = useState<string[]>(
    currentUser?.criticalQuestions || []
  );
  const [newQuestion, setNewQuestion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const MAX_QUESTIONS = 5;
  const canAddMore = customQuestions.length < MAX_QUESTIONS;

  const handleAddQuestion = (question: string) => {
    if (!canAddMore || !question.trim()) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const updated = [...customQuestions, question.trim()];
    setCustomQuestions(updated);
    updateCurrentUser({ criticalQuestions: updated });
    setNewQuestion('');
  };

  const handleRemoveQuestion = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const updated = customQuestions.filter((_, i) => i !== index);
    setCustomQuestions(updated);
    updateCurrentUser({ criticalQuestions: updated });
  };

  const filteredSuggestions = selectedCategory
    ? deepQuestionBank.filter((q) => q.category === selectedCategory)
    : deepQuestionBank;

  const getCategoryColor = (categoryId: string) => {
    return questionCategories.find((c) => c.id === categoryId)?.color || '#636E72';
  };

  return (
    <View className="flex-1 bg-[#FDF8F5]">
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <Animated.View
          entering={FadeIn.duration(400)}
          className="flex-row items-center px-4 py-3 border-b border-[#F0E6E0]"
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

          <View className="flex-1 items-center">
            <Text
              className="text-lg text-[#2D3436]"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              Your Questions
            </Text>
            <Text
              className="text-xs text-[#636E72]"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              Matches must answer to connect
            </Text>
          </View>

          <View className="w-10" />
        </Animated.View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Info Banner */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(500)}
            className="mx-4 mt-4 mb-4"
          >
            <View className="bg-[#81B29A]/10 rounded-2xl p-4 flex-row items-start">
              <View className="w-10 h-10 rounded-full bg-[#81B29A]/20 items-center justify-center">
                <Lightbulb size={20} color="#81B29A" />
              </View>
              <View className="flex-1 ml-3">
                <Text
                  className="text-sm text-[#2D3436]"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Unlock Deeper Connections
                </Text>
                <Text
                  className="text-xs text-[#636E72] mt-1 leading-4"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  These questions help you find someone who truly understands you.
                  Matches will see these on your profile and must respond to connect.
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Current Questions */}
          <Animated.View
            entering={FadeInDown.delay(150).duration(500)}
            className="px-4 mb-6"
          >
            <Text
              className="text-sm text-[#A0A8AB] mb-3"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              YOUR QUESTIONS ({customQuestions.length}/{MAX_QUESTIONS})
            </Text>

            {customQuestions.length === 0 ? (
              <View className="bg-white rounded-2xl p-6 items-center border-2 border-dashed border-[#E8E0DA]">
                <MessageCircle size={32} color="#D0D5D8" />
                <Text
                  className="text-sm text-[#A0A8AB] mt-3 text-center"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  Add questions that matter to you.{'\n'}These filter for the right people.
                </Text>
              </View>
            ) : (
              <View className="gap-3">
                {customQuestions.map((question, index) => (
                  <Animated.View
                    key={index}
                    entering={FadeInUp.delay(index * 50).duration(400)}
                    className="bg-white rounded-2xl p-4 flex-row items-start shadow-sm shadow-black/5"
                  >
                    <View className="w-8 h-8 rounded-full bg-[#E07A5F]/10 items-center justify-center mr-3">
                      <Text
                        className="text-[#E07A5F]"
                        style={{ fontFamily: 'Outfit_700Bold' }}
                      >
                        {index + 1}
                      </Text>
                    </View>
                    <Text
                      className="flex-1 text-sm text-[#2D3436] leading-5"
                      style={{ fontFamily: 'Outfit_400Regular' }}
                    >
                      {question}
                    </Text>
                    <Pressable
                      onPress={() => handleRemoveQuestion(index)}
                      className="w-8 h-8 rounded-full bg-red-50 items-center justify-center ml-2"
                    >
                      <Trash2 size={16} color="#EF4444" />
                    </Pressable>
                  </Animated.View>
                ))}
              </View>
            )}
          </Animated.View>

          {/* Add Custom Question */}
          {canAddMore && (
            <Animated.View
              entering={FadeInDown.delay(200).duration(500)}
              className="px-4 mb-6"
            >
              <Text
                className="text-sm text-[#A0A8AB] mb-3"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                WRITE YOUR OWN
              </Text>

              <View className="bg-white rounded-2xl p-4 shadow-sm shadow-black/5">
                <TextInput
                  value={newQuestion}
                  onChangeText={setNewQuestion}
                  placeholder="Type your question..."
                  placeholderTextColor="#A0A8AB"
                  className="text-sm text-[#2D3436] min-h-[60px]"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                  multiline
                  maxLength={200}
                />
                <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-[#F0E6E0]">
                  <Text
                    className="text-xs text-[#A0A8AB]"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    {newQuestion.length}/200
                  </Text>
                  <Pressable
                    onPress={() => handleAddQuestion(newQuestion)}
                    disabled={!newQuestion.trim()}
                    className="flex-row items-center active:scale-95"
                  >
                    <LinearGradient
                      colors={newQuestion.trim() ? ['#E07A5F', '#D56A4F'] : ['#D0D5D8', '#C0C5C8']}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 20,
                        flexDirection: 'row',
                        alignItems: 'center',
                        opacity: newQuestion.trim() ? 1 : 0.5,
                      }}
                    >
                      <Plus size={16} color="#FFF" />
                      <Text
                        className="text-white text-sm ml-1"
                        style={{ fontFamily: 'Outfit_600SemiBold' }}
                      >
                        Add
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              </View>
            </Animated.View>
          )}

          {/* Category Filter */}
          {showSuggestions && canAddMore && (
            <Animated.View
              entering={FadeInDown.delay(250).duration(500)}
              className="px-4 mb-4"
            >
              <Text
                className="text-sm text-[#A0A8AB] mb-3"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                OR CHOOSE FROM SUGGESTIONS
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="-mx-4 px-4"
                style={{ flexGrow: 0 }}
              >
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedCategory(null);
                    }}
                    className={`px-4 py-2 rounded-full border ${
                      selectedCategory === null
                        ? 'bg-[#2D3436] border-[#2D3436]'
                        : 'bg-white border-[#E8E0DA]'
                    }`}
                  >
                    <Text
                      className={`text-sm ${selectedCategory === null ? 'text-white' : 'text-[#636E72]'}`}
                      style={{ fontFamily: 'Outfit_500Medium' }}
                    >
                      All
                    </Text>
                  </Pressable>
                  {questionCategories.map((category) => {
                    const Icon = categoryIcons[category.id] || HelpCircle;
                    const isSelected = selectedCategory === category.id;
                    return (
                      <Pressable
                        key={category.id}
                        onPress={() => {
                          Haptics.selectionAsync();
                          setSelectedCategory(category.id);
                        }}
                        className={`px-4 py-2 rounded-full border flex-row items-center ${
                          isSelected
                            ? 'border-transparent'
                            : 'bg-white border-[#E8E0DA]'
                        }`}
                        style={isSelected ? { backgroundColor: category.color } : {}}
                      >
                        <Icon size={14} color={isSelected ? '#FFF' : category.color} />
                        <Text
                          className={`text-sm ml-1.5 ${isSelected ? 'text-white' : 'text-[#636E72]'}`}
                          style={{ fontFamily: 'Outfit_500Medium' }}
                        >
                          {category.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </Animated.View>
          )}

          {/* Suggested Questions */}
          {showSuggestions && canAddMore && (
            <Animated.View
              entering={FadeInDown.delay(300).duration(500)}
              className="px-4 pb-8"
            >
              <View className="gap-3">
                {filteredSuggestions.map((question: DeepQuestion, index: number) => {
                  const isAlreadyAdded = customQuestions.includes(question.question);
                  const categoryColor = getCategoryColor(question.category);

                  return (
                    <Pressable
                      key={question.id}
                      onPress={() => {
                        if (!isAlreadyAdded) {
                          handleAddQuestion(question.question);
                        }
                      }}
                      disabled={isAlreadyAdded}
                      className={`bg-white rounded-2xl p-4 shadow-sm shadow-black/5 border-l-4 ${
                        isAlreadyAdded ? 'opacity-50' : 'active:scale-[0.98]'
                      }`}
                      style={{ borderLeftColor: categoryColor }}
                    >
                      <Text
                        className="text-sm text-[#2D3436] leading-5 mb-2"
                        style={{ fontFamily: 'Outfit_500Medium' }}
                      >
                        {question.question}
                      </Text>
                      <View className="flex-row items-center">
                        <Sparkles size={12} color={categoryColor} />
                        <Text
                          className="text-xs text-[#636E72] ml-1.5 flex-1"
                          style={{ fontFamily: 'Outfit_400Regular' }}
                        >
                          {question.whyItMatters}
                        </Text>
                        {isAlreadyAdded ? (
                          <View className="bg-[#81B29A]/15 rounded-full px-3 py-1">
                            <Text
                              className="text-xs text-[#81B29A]"
                              style={{ fontFamily: 'Outfit_500Medium' }}
                            >
                              Added
                            </Text>
                          </View>
                        ) : (
                          <View className="bg-[#E07A5F]/10 rounded-full px-3 py-1">
                            <Text
                              className="text-xs text-[#E07A5F]"
                              style={{ fontFamily: 'Outfit_500Medium' }}
                            >
                              + Add
                            </Text>
                          </View>
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </Animated.View>
          )}

          <View className="h-20" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
