/**
 * InnerMatchEQ Web - Quiz Page
 *
 * Unified quiz page that handles all quiz types (attachment, mbti, loveLanguage, bigFive).
 * Uses the shared API for quiz submission and scoring.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ArrowRight, CheckCircle, Heart, Brain, Star } from 'lucide-react-native';
import { api, type QuizSubmission, type QuizResult } from '@/lib/api';
import { attachmentQuestions, mbtiQuestions, loveLanguageQuestions } from '@/lib/mockData';

interface QuestionOption {
  value: string | number;
  label: string;
}

interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
}

const QUIZ_CONFIG: Record<
  string,
  {
    title: string;
    description: string;
    icon: typeof Heart;
    questions: Question[];
  }
> = {
  attachment: {
    title: 'Attachment Style Assessment',
    description: 'Discover how you connect and bond in relationships',
    icon: Heart,
    questions: attachmentQuestions.map((q) => ({
      id: q.id,
      text: q.question,
      options: q.options.map((opt) => ({ value: opt.style, label: opt.text })),
    })),
  },
  mbti: {
    title: 'MBTI Personality Assessment',
    description: 'Understand your personality type and how you interact with the world',
    icon: Brain,
    questions: mbtiQuestions.map((q) => ({
      id: q.id,
      text: q.question,
      options: q.options.map((opt) => ({ value: opt.value, label: opt.text })),
    })),
  },
  loveLanguage: {
    title: 'Love Languages Assessment',
    description: 'Learn how you prefer to give and receive love',
    icon: Heart,
    questions: loveLanguageQuestions.map((q) => ({
      id: q.id,
      text: q.question,
      options: q.options.map((opt) => ({ value: opt.language, label: opt.text })),
    })),
  },
  bigFive: {
    title: 'Big Five Personality Assessment',
    description: 'Comprehensive analysis of your core personality traits (OCEAN)',
    icon: Star,
    questions: generateBigFiveQuestions(),
  },
};

function generateBigFiveQuestions(): Question[] {
  const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
  const questions: Question[] = [];

  const traitQuestions: Record<string, string[]> = {
    openness: [
      'I enjoy trying new and different activities',
      'I am curious about many different things',
      'I enjoy artistic and creative experiences',
    ],
    conscientiousness: [
      'I am always prepared and organized',
      'I pay attention to details',
      'I follow through on my commitments',
    ],
    extraversion: [
      'I feel comfortable around people',
      'I enjoy being the center of attention',
      'I start conversations easily',
    ],
    agreeableness: [
      'I am interested in other peoples feelings',
      'I make people feel at ease',
      'I sympathize with others emotions',
    ],
    neuroticism: [
      'I get stressed out easily',
      'I worry about things',
      'I experience mood swings',
    ],
  };

  traits.forEach((trait) => {
    traitQuestions[trait].forEach((question, idx) => {
      questions.push({
        id: `${trait}_${idx}`,
        text: question,
        options: [
          { value: 1, label: 'Strongly Disagree' },
          { value: 2, label: 'Disagree' },
          { value: 3, label: 'Neutral' },
          { value: 4, label: 'Agree' },
          { value: 5, label: 'Strongly Agree' },
        ],
      });
    });
  });

  return questions;
}

export default function WebQuizPage() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: string }>();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const quizType = type || 'attachment';
  const config = QUIZ_CONFIG[quizType];

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const user = await api.getCurrentUser();
    if (!user) {
      router.replace('/auth');
      return;
    }
    setUserId(user.id);
  };

  if (!config) {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center">
        <Text className="text-white text-xl">Quiz not found</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-pink-400">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const questions = config.questions;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value: string | number) => {
    const question = questions[currentQuestion];
    setAnswers((prev) => ({ ...prev, [question.id]: value }));

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion((prev) => prev + 1), 300);
    }
  };

  const handleSubmit = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const submission: QuizSubmission = {
        userId,
        quizType: quizType as QuizSubmission['quizType'],
        answers,
      };

      const quizResult = await api.submitQuiz(submission);
      setResult(quizResult);
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const isComplete = Object.keys(answers).length === questions.length;

  // Show results
  if (result) {
    return (
      <ScrollView className="flex-1 bg-slate-950">
        <LinearGradient
          colors={['#1e1b4b', '#312e81', '#1e1b4b']}
          style={{ padding: 24, paddingTop: 64, alignItems: 'center' }}
        >
          <View className="w-24 h-24 bg-green-500/20 rounded-full items-center justify-center mb-6">
            <CheckCircle size={48} color="#4ade80" />
          </View>
          <Text className="text-3xl font-bold text-white text-center mb-2">
            Assessment Complete!
          </Text>
          <Text className="text-slate-300 text-center max-w-md">
            Your {config.title.toLowerCase()} has been analyzed.
          </Text>
        </LinearGradient>

        <View className="px-6 py-8 max-w-2xl mx-auto w-full">
          <View className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 mb-6">
            <Text className="text-lg text-slate-400 mb-2">Your Result</Text>
            <Text className="text-3xl font-bold text-pink-400">
              {typeof result.result === 'string'
                ? result.result
                : Array.isArray(result.result)
                  ? result.result.join(', ')
                  : 'Complete'}
            </Text>
          </View>

          {result.scores && (
            <View className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 mb-6">
              <Text className="text-lg font-semibold text-white mb-4">Score Breakdown</Text>
              {Object.entries(result.scores).map(([key, value]) => (
                <View key={key} className="flex-row justify-between mb-2">
                  <Text className="text-slate-300">{key.toUpperCase()}</Text>
                  <Text className="text-pink-400 font-semibold">{value}</Text>
                </View>
              ))}
            </View>
          )}

          <View className="flex-row gap-4">
            <Pressable
              onPress={() => router.push('/dashboard')}
              className="flex-1 bg-pink-500 py-4 rounded-xl items-center"
            >
              <Text className="text-white font-semibold">View Dashboard</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/insights')}
              className="flex-1 bg-slate-700 py-4 rounded-xl items-center"
            >
              <Text className="text-white font-semibold">Full Insights</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    );
  }

  const question = questions[currentQuestion];

  return (
    <View className="flex-1 bg-slate-950">
      {/* Header */}
      <LinearGradient colors={['#1e1b4b', '#0f172a']} style={{ padding: 24, paddingTop: 48 }}>
        <View className="flex-row items-center justify-between max-w-3xl mx-auto w-full">
          <Pressable onPress={() => router.back()} className="p-2">
            <ArrowLeft size={24} color="white" />
          </Pressable>
          <View className="flex-1 mx-4">
            <View className="bg-slate-700 h-2 rounded-full overflow-hidden">
              <View
                className="bg-pink-500 h-full rounded-full"
                style={{ width: `${progress}%` }}
              />
            </View>
            <Text className="text-slate-400 text-center mt-2">
              Question {currentQuestion + 1} of {questions.length}
            </Text>
          </View>
          <config.icon size={24} color="#f472b6" />
        </View>
      </LinearGradient>

      {/* Question */}
      <ScrollView className="flex-1 px-6 py-8">
        <View className="max-w-2xl mx-auto w-full">
          <Text className="text-2xl font-bold text-white text-center mb-8">{question.text}</Text>

          <View className="gap-3">
            {question.options.map((option, index) => {
              const isSelected = answers[question.id] === option.value;
              return (
                <Pressable
                  key={index}
                  onPress={() => handleAnswer(option.value)}
                  className={`p-5 rounded-xl border ${
                    isSelected
                      ? 'bg-pink-500/20 border-pink-500'
                      : 'bg-slate-800/50 border-slate-700'
                  }`}
                  style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                >
                  <Text className={`text-lg ${isSelected ? 'text-pink-400' : 'text-white'}`}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Navigation */}
      <View className="p-6 border-t border-slate-800">
        <View className="max-w-2xl mx-auto w-full flex-row gap-4">
          <Pressable
            onPress={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className={`flex-1 py-4 rounded-xl items-center border ${
              currentQuestion === 0 ? 'border-slate-700 opacity-50' : 'border-slate-600'
            }`}
          >
            <Text className="text-slate-300">Previous</Text>
          </Pressable>

          {isComplete ? (
            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              className="flex-1 bg-pink-500 py-4 rounded-xl items-center flex-row justify-center"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-white font-semibold mr-2">Submit</Text>
                  <CheckCircle size={20} color="white" />
                </>
              )}
            </Pressable>
          ) : (
            <Pressable
              onPress={() => setCurrentQuestion((prev) => Math.min(questions.length - 1, prev + 1))}
              disabled={!answers[question.id]}
              className={`flex-1 py-4 rounded-xl items-center flex-row justify-center ${
                answers[question.id] ? 'bg-pink-500' : 'bg-slate-700 opacity-50'
              }`}
            >
              <Text className="text-white font-semibold mr-2">Next</Text>
              <ArrowRight size={20} color="white" />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}
