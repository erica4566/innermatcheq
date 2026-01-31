import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import * as Haptics from '@/lib/haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Brain,
  Heart,
  MessageCircle,
  DollarSign,
  Sparkles,
  Target,
  Shield,
  Zap,
  CheckCircle,
} from 'lucide-react-native';
import { useAppStore, type ConflictStyle, type RelationshipGoal, type CommunicationFrequency, type AffectionLevel, type FinancialAttitude, type EmotionalRegulationStyle, type BigFiveScores } from '@/lib/store';
import { BRAND_COLORS } from '@/lib/brand';

// Assessment sections
const SECTIONS = [
  { id: 'goals', title: 'Relationship Goals', icon: Target, color: '#E07A5F' },
  { id: 'conflict', title: 'Conflict Style', icon: Shield, color: '#81B29A' },
  { id: 'communication', title: 'Communication', icon: MessageCircle, color: '#3D5A80' },
  { id: 'affection', title: 'Physical Affection', icon: Heart, color: '#D4626A' },
  { id: 'financial', title: 'Financial Attitudes', icon: DollarSign, color: '#F2CC8F' },
  { id: 'bigfive', title: 'Personality Traits', icon: Brain, color: '#9333EA' },
  { id: 'emotional', title: 'Emotional Style', icon: Zap, color: '#10B981' },
];

// Question data
const RELATIONSHIP_GOALS: { value: RelationshipGoal; label: string; description: string }[] = [
  { value: 'casual', label: 'Casual Dating', description: 'Getting to know people, no pressure' },
  { value: 'serious', label: 'Serious Relationship', description: 'Looking for a committed partner' },
  { value: 'marriage', label: 'Marriage-Minded', description: 'Looking for my life partner' },
  { value: 'unsure', label: 'Open to Possibilities', description: 'See where things go naturally' },
];

const CONFLICT_STYLES: { value: ConflictStyle; label: string; description: string }[] = [
  { value: 'avoid', label: 'Avoider', description: 'I prefer to avoid conflict and let things cool down' },
  { value: 'compete', label: 'Competitor', description: 'I stand firm on my position and defend my views' },
  { value: 'accommodate', label: 'Accommodator', description: 'I prioritize harmony and often yield to others' },
  { value: 'compromise', label: 'Compromiser', description: 'I look for middle ground where both can give a little' },
  { value: 'collaborate', label: 'Collaborator', description: 'I work together to find a win-win solution' },
];

const COMMUNICATION_FREQUENCIES: { value: CommunicationFrequency; label: string; description: string }[] = [
  { value: 'constant', label: 'Constant Connection', description: 'I love texting throughout the day' },
  { value: 'frequent', label: 'Frequent Check-ins', description: 'A few messages throughout the day is ideal' },
  { value: 'moderate', label: 'Moderate Contact', description: 'Morning and evening texts are enough' },
  { value: 'minimal', label: 'Quality Over Quantity', description: 'I prefer meaningful conversations over constant texting' },
];

const AFFECTION_LEVELS: { value: AffectionLevel; label: string; description: string }[] = [
  { value: 'very_affectionate', label: 'Very Affectionate', description: 'I love PDA and constant physical closeness' },
  { value: 'moderate', label: 'Moderately Affectionate', description: 'I enjoy affection but also value personal space' },
  { value: 'reserved', label: 'Reserved', description: 'I prefer keeping affection private' },
  { value: 'minimal', label: 'Less Physical', description: 'I show love in other ways besides physical touch' },
];

const FINANCIAL_ATTITUDES: { value: FinancialAttitude; label: string; description: string }[] = [
  { value: 'saver', label: 'Saver', description: 'I prioritize saving and financial security' },
  { value: 'balanced', label: 'Balanced', description: 'I balance saving with enjoying life' },
  { value: 'spender', label: 'Spender', description: 'I believe in enjoying money and experiences' },
];

const SPLIT_PREFERENCES = [
  { value: 'always_split', label: 'Always Split 50/50' },
  { value: 'take_turns', label: 'Take Turns Paying' },
  { value: 'whoever_invites', label: 'Whoever Invites Pays' },
  { value: 'flexible', label: 'Flexible / Situational' },
];

const EMOTIONAL_STYLES: { value: EmotionalRegulationStyle; label: string; description: string }[] = [
  { value: 'suppressor', label: 'Internal Processor', description: 'I tend to process emotions privately before sharing' },
  { value: 'expresser', label: 'Open Expresser', description: 'I share my feelings openly and immediately' },
  { value: 'reappraiser', label: 'Reframer', description: 'I try to see situations from different angles to manage emotions' },
  { value: 'seeker', label: 'Support Seeker', description: 'I reach out to others when dealing with emotions' },
];

// Big Five questions (simplified - 2 questions per trait)
const BIG_FIVE_QUESTIONS = [
  // Openness
  { trait: 'openness', question: 'I enjoy trying new experiences and exploring unfamiliar ideas', positive: true },
  { trait: 'openness', question: 'I prefer routine and familiar activities over unpredictable adventures', positive: false },
  // Conscientiousness
  { trait: 'conscientiousness', question: 'I always keep my commitments and follow through on plans', positive: true },
  { trait: 'conscientiousness', question: 'I often leave tasks unfinished or procrastinate', positive: false },
  // Extraversion
  { trait: 'extraversion', question: 'I feel energized after spending time with groups of people', positive: true },
  { trait: 'extraversion', question: 'I prefer quiet evenings at home over social gatherings', positive: false },
  // Agreeableness
  { trait: 'agreeableness', question: 'I go out of my way to help others, even if it inconveniences me', positive: true },
  { trait: 'agreeableness', question: 'I tend to be skeptical of others\' intentions', positive: false },
  // Neuroticism
  { trait: 'neuroticism', question: 'I often feel anxious or worried about things', positive: true },
  { trait: 'neuroticism', question: 'I stay calm and composed even in stressful situations', positive: false },
];

const STORAGE_KEY = 'deep_assessment_progress';

interface AssessmentProgress {
  currentSection: number;
  relationshipGoal: RelationshipGoal | null;
  conflictStyle: ConflictStyle | null;
  communicationFrequency: CommunicationFrequency | null;
  affectionLevel: AffectionLevel | null;
  financialAttitude: FinancialAttitude | null;
  splitBillPreference: string | null;
  emotionalStyle: EmotionalRegulationStyle | null;
  bigFiveAnswers: Record<number, number>;
}

export default function DeepAssessmentScreen() {
  const router = useRouter();
  const updateCurrentUser = useAppStore((s) => s.updateCurrentUser);
  const currentUser = useAppStore((s) => s.currentUser);

  const [isLoading, setIsLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Form state - initialized from persisted progress or currentUser
  const [relationshipGoal, setRelationshipGoal] = useState<RelationshipGoal | null>(null);
  const [conflictStyle, setConflictStyle] = useState<ConflictStyle | null>(null);
  const [communicationFrequency, setCommunicationFrequency] = useState<CommunicationFrequency | null>(null);
  const [affectionLevel, setAffectionLevel] = useState<AffectionLevel | null>(null);
  const [financialAttitude, setFinancialAttitude] = useState<FinancialAttitude | null>(null);
  const [splitBillPreference, setSplitBillPreference] = useState<string | null>(null);
  const [emotionalStyle, setEmotionalStyle] = useState<EmotionalRegulationStyle | null>(null);
  const [bigFiveAnswers, setBigFiveAnswers] = useState<Record<number, number>>({});

  // Load persisted progress on mount
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const progress: AssessmentProgress = JSON.parse(saved);
          setCurrentSection(progress.currentSection);
          setRelationshipGoal(progress.relationshipGoal);
          setConflictStyle(progress.conflictStyle);
          setCommunicationFrequency(progress.communicationFrequency);
          setAffectionLevel(progress.affectionLevel);
          setFinancialAttitude(progress.financialAttitude);
          setSplitBillPreference(progress.splitBillPreference);
          setEmotionalStyle(progress.emotionalStyle);
          setBigFiveAnswers(progress.bigFiveAnswers);
        } else {
          // No saved progress - use currentUser values if available
          setRelationshipGoal(currentUser?.relationshipGoal ?? null);
          setConflictStyle(currentUser?.conflictStyle ?? null);
          setCommunicationFrequency(currentUser?.communicationFrequency ?? null);
          setAffectionLevel(currentUser?.affectionLevel ?? null);
          setFinancialAttitude(currentUser?.financialAttitude ?? null);
          setSplitBillPreference(currentUser?.splitBillPreference ?? null);
          setEmotionalStyle(currentUser?.emotionalRegulationStyle ?? null);
        }
      } catch (error) {
        console.log('Failed to load assessment progress:', error);
        // Fallback to currentUser values
        setRelationshipGoal(currentUser?.relationshipGoal ?? null);
        setConflictStyle(currentUser?.conflictStyle ?? null);
        setCommunicationFrequency(currentUser?.communicationFrequency ?? null);
        setAffectionLevel(currentUser?.affectionLevel ?? null);
        setFinancialAttitude(currentUser?.financialAttitude ?? null);
        setSplitBillPreference(currentUser?.splitBillPreference ?? null);
        setEmotionalStyle(currentUser?.emotionalRegulationStyle ?? null);
      }
      setIsLoading(false);
    };
    loadProgress();
  }, []);

  // Save progress whenever state changes
  useEffect(() => {
    if (isLoading) return; // Don't save during initial load

    const saveProgress = async () => {
      const progress: AssessmentProgress = {
        currentSection,
        relationshipGoal,
        conflictStyle,
        communicationFrequency,
        affectionLevel,
        financialAttitude,
        splitBillPreference,
        emotionalStyle,
        bigFiveAnswers,
      };
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      } catch (error) {
        console.log('Failed to save assessment progress:', error);
      }
    };
    saveProgress();
  }, [isLoading, currentSection, relationshipGoal, conflictStyle, communicationFrequency, affectionLevel, financialAttitude, splitBillPreference, emotionalStyle, bigFiveAnswers]);

  const section = SECTIONS[currentSection];
  const progress = (currentSection + 1) / SECTIONS.length;

  const handleBack = () => {
    Haptics.selectionAsync();
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    } else {
      router.back();
    }
  };

  const canProceed = () => {
    switch (section.id) {
      case 'goals': return !!relationshipGoal;
      case 'conflict': return !!conflictStyle;
      case 'communication': return !!communicationFrequency;
      case 'affection': return !!affectionLevel;
      case 'financial': return !!financialAttitude && !!splitBillPreference;
      case 'bigfive': return Object.keys(bigFiveAnswers).length >= 10;
      case 'emotional': return !!emotionalStyle;
      default: return false;
    }
  };

  const calculateBigFive = (): BigFiveScores => {
    const scores: BigFiveScores = {
      openness: 50,
      conscientiousness: 50,
      extraversion: 50,
      agreeableness: 50,
      neuroticism: 50,
    };

    BIG_FIVE_QUESTIONS.forEach((q, index) => {
      const answer = bigFiveAnswers[index] ?? 3; // Default to neutral
      const trait = q.trait as keyof BigFiveScores;
      const adjustment = q.positive ? (answer - 3) * 12.5 : (3 - answer) * 12.5;
      scores[trait] = Math.min(100, Math.max(0, scores[trait] + adjustment));
    });

    return scores;
  };

  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (currentSection < SECTIONS.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      // Complete assessment
      const bigFiveScores = calculateBigFive();

      updateCurrentUser({
        relationshipGoal,
        conflictStyle,
        communicationFrequency,
        affectionLevel,
        financialAttitude,
        splitBillPreference: splitBillPreference as UserProfile['splitBillPreference'],
        emotionalRegulationStyle: emotionalStyle,
        bigFiveScores,
      });

      // Clear saved progress after completion
      try {
        await AsyncStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.log('Failed to clear assessment progress:', error);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowSuccessModal(true);
    }
  };

  const handleCloseSuccess = async () => {
    setShowSuccessModal(false);
    // Also clear progress on close
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.log('Failed to clear assessment progress:', error);
    }
    router.back();
  };

  const renderOption = <T extends string>(
    value: T,
    label: string,
    description: string,
    selected: T | null,
    onSelect: (v: T) => void
  ) => (
    <Pressable
      key={value}
      onPress={() => {
        Haptics.selectionAsync();
        onSelect(value);
      }}
      className={`mb-3 rounded-2xl border-2 p-4 ${
        selected === value ? 'border-[#E07A5F] bg-[#E07A5F]/5' : 'border-[#E8E4E1] bg-white'
      }`}
    >
      <View className="flex-row items-center">
        <View
          className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${
            selected === value ? 'border-[#E07A5F] bg-[#E07A5F]' : 'border-[#D0D5D8]'
          }`}
        >
          {selected === value && <Check size={14} color="#FFF" />}
        </View>
        <View className="flex-1">
          <Text
            className="text-base text-[#2D3436]"
            style={{ fontFamily: 'Outfit_600SemiBold' }}
          >
            {label}
          </Text>
          <Text
            className="text-sm text-[#636E72] mt-0.5"
            style={{ fontFamily: 'Outfit_400Regular' }}
          >
            {description}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  const renderBigFiveQuestion = (question: typeof BIG_FIVE_QUESTIONS[0], index: number) => {
    const answer = bigFiveAnswers[index];
    const labels = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];

    return (
      <View key={index} className="mb-6">
        <Text
          className="text-base text-[#2D3436] mb-3"
          style={{ fontFamily: 'Outfit_500Medium' }}
        >
          {question.question}
        </Text>
        <View className="flex-row justify-between">
          {[1, 2, 3, 4, 5].map((value) => (
            <Pressable
              key={value}
              onPress={() => {
                Haptics.selectionAsync();
                setBigFiveAnswers({ ...bigFiveAnswers, [index]: value });
              }}
              className={`w-14 h-14 rounded-xl items-center justify-center ${
                answer === value ? 'bg-[#9333EA]' : 'bg-[#F0E6E0]'
              }`}
            >
              <Text
                className={`text-sm ${answer === value ? 'text-white' : 'text-[#636E72]'}`}
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                {value}
              </Text>
            </Pressable>
          ))}
        </View>
        <View className="flex-row justify-between mt-1 px-1">
          <Text className="text-xs text-[#A0A8AB]" style={{ fontFamily: 'Outfit_400Regular' }}>
            Disagree
          </Text>
          <Text className="text-xs text-[#A0A8AB]" style={{ fontFamily: 'Outfit_400Regular' }}>
            Agree
          </Text>
        </View>
      </View>
    );
  };

  const renderContent = () => {
    switch (section.id) {
      case 'goals':
        return (
          <View>
            <Text
              className="text-lg text-[#2D3436] mb-4"
              style={{ fontFamily: 'Outfit_500Medium' }}
            >
              What are you looking for right now?
            </Text>
            {RELATIONSHIP_GOALS.map((opt) =>
              renderOption(opt.value, opt.label, opt.description, relationshipGoal, setRelationshipGoal)
            )}
          </View>
        );

      case 'conflict':
        return (
          <View>
            <Text
              className="text-lg text-[#2D3436] mb-4"
              style={{ fontFamily: 'Outfit_500Medium' }}
            >
              How do you typically handle disagreements?
            </Text>
            {CONFLICT_STYLES.map((opt) =>
              renderOption(opt.value, opt.label, opt.description, conflictStyle, setConflictStyle)
            )}
          </View>
        );

      case 'communication':
        return (
          <View>
            <Text
              className="text-lg text-[#2D3436] mb-4"
              style={{ fontFamily: 'Outfit_500Medium' }}
            >
              How often do you like to communicate with a partner?
            </Text>
            {COMMUNICATION_FREQUENCIES.map((opt) =>
              renderOption(opt.value, opt.label, opt.description, communicationFrequency, setCommunicationFrequency)
            )}
          </View>
        );

      case 'affection':
        return (
          <View>
            <Text
              className="text-lg text-[#2D3436] mb-4"
              style={{ fontFamily: 'Outfit_500Medium' }}
            >
              What's your comfort level with physical affection?
            </Text>
            {AFFECTION_LEVELS.map((opt) =>
              renderOption(opt.value, opt.label, opt.description, affectionLevel, setAffectionLevel)
            )}
          </View>
        );

      case 'financial':
        return (
          <View>
            <Text
              className="text-lg text-[#2D3436] mb-4"
              style={{ fontFamily: 'Outfit_500Medium' }}
            >
              How would you describe your financial style?
            </Text>
            {FINANCIAL_ATTITUDES.map((opt) =>
              renderOption(opt.value, opt.label, opt.description, financialAttitude, setFinancialAttitude)
            )}

            <Text
              className="text-lg text-[#2D3436] mt-6 mb-4"
              style={{ fontFamily: 'Outfit_500Medium' }}
            >
              How do you prefer to handle paying on dates?
            </Text>
            {SPLIT_PREFERENCES.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSplitBillPreference(opt.value);
                }}
                className={`mb-2 rounded-xl border-2 px-4 py-3 flex-row items-center ${
                  splitBillPreference === opt.value
                    ? 'border-[#F2CC8F] bg-[#F2CC8F]/10'
                    : 'border-[#E8E4E1] bg-white'
                }`}
              >
                <View
                  className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${
                    splitBillPreference === opt.value ? 'border-[#F2CC8F] bg-[#F2CC8F]' : 'border-[#D0D5D8]'
                  }`}
                >
                  {splitBillPreference === opt.value && <Check size={12} color="#FFF" />}
                </View>
                <Text
                  className="text-base text-[#2D3436]"
                  style={{ fontFamily: 'Outfit_500Medium' }}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        );

      case 'bigfive':
        return (
          <View>
            <Text
              className="text-lg text-[#2D3436] mb-2"
              style={{ fontFamily: 'Outfit_500Medium' }}
            >
              Rate how much you agree with each statement
            </Text>
            <Text
              className="text-sm text-[#636E72] mb-6"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              This helps us understand your personality on 5 key dimensions
            </Text>
            {BIG_FIVE_QUESTIONS.map((q, i) => renderBigFiveQuestion(q, i))}
          </View>
        );

      case 'emotional':
        return (
          <View>
            <Text
              className="text-lg text-[#2D3436] mb-4"
              style={{ fontFamily: 'Outfit_500Medium' }}
            >
              How do you typically handle strong emotions?
            </Text>
            {EMOTIONAL_STYLES.map((opt) =>
              renderOption(opt.value, opt.label, opt.description, emotionalStyle, setEmotionalStyle)
            )}
          </View>
        );

      default:
        return null;
    }
  };

  const Icon = section.icon;

  // Show loading while restoring progress
  if (isLoading) {
    return (
      <View className="flex-1 bg-[#FAF7F5] items-center justify-center">
        <Brain size={48} color="#E07A5F" />
        <Text
          className="text-base text-[#636E72] mt-4"
          style={{ fontFamily: 'Outfit_500Medium' }}
        >
          Loading your progress...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FAF7F5]">
      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseSuccess}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <Animated.View
            entering={ZoomIn.duration(300)}
            className="bg-white rounded-3xl p-8 w-full max-w-sm items-center"
          >
            <View className="w-20 h-20 rounded-full bg-[#81B29A]/15 items-center justify-center mb-6">
              <CheckCircle size={48} color="#81B29A" />
            </View>

            <Text
              className="text-2xl text-[#2D3436] text-center mb-2"
              style={{ fontFamily: 'Cormorant_600SemiBold' }}
            >
              Assessment Complete!
            </Text>

            <Text
              className="text-base text-[#636E72] text-center mb-6"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              Your deep compatibility profile has been updated. You'll now get better matches based on your preferences!
            </Text>

            <View className="w-full gap-3">
              <Pressable
                onPress={() => {
                  handleCloseSuccess();
                  setTimeout(() => router.push('/insights'), 300);
                }}
                className="active:scale-[0.98]"
              >
                <LinearGradient
                  colors={['#E07A5F', '#D4626A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    borderRadius: 14,
                    paddingVertical: 14,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    className="text-white text-base"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    View My Insights
                  </Text>
                </LinearGradient>
              </Pressable>

              <Pressable
                onPress={handleCloseSuccess}
                className="py-3 items-center"
              >
                <Text
                  className="text-[#636E72] text-base"
                  style={{ fontFamily: 'Outfit_500Medium' }}
                >
                  Back to Profile
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>

      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <Animated.View
          entering={FadeIn.duration(400)}
          className="px-6 py-4"
        >
          <View className="flex-row items-center justify-between mb-4">
            <Pressable
              onPress={handleBack}
              className="w-10 h-10 rounded-full bg-white items-center justify-center"
            >
              <ArrowLeft size={20} color="#2D3436" />
            </Pressable>
            <Text
              className="text-sm text-[#636E72]"
              style={{ fontFamily: 'Outfit_500Medium' }}
            >
              {currentSection + 1} of {SECTIONS.length}
            </Text>
          </View>

          {/* Progress bar */}
          <View className="h-2 bg-[#E8E4E1] rounded-full overflow-hidden">
            <Animated.View
              className="h-full rounded-full"
              style={{
                width: `${progress * 100}%`,
                backgroundColor: section.color,
              }}
            />
          </View>
        </Animated.View>

        {/* Section header */}
        <Animated.View
          key={section.id}
          entering={FadeInDown.duration(400)}
          className="px-6 py-4"
        >
          <View className="flex-row items-center mb-2">
            <View
              className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
              style={{ backgroundColor: `${section.color}15` }}
            >
              <Icon size={24} color={section.color} />
            </View>
            <Text
              className="text-2xl text-[#2D3436]"
              style={{ fontFamily: 'Cormorant_600SemiBold' }}
            >
              {section.title}
            </Text>
          </View>
        </Animated.View>

        {/* Content */}
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <Animated.View
            key={`content-${section.id}`}
            entering={FadeInUp.delay(100).duration(400)}
          >
            {renderContent()}
          </Animated.View>
        </ScrollView>

        {/* Bottom button */}
        <View className="absolute bottom-0 left-0 right-0 px-6 pb-10 pt-4 bg-[#FAF7F5]">
          <Pressable
            onPress={handleNext}
            disabled={!canProceed()}
            className="active:scale-[0.98]"
          >
            <LinearGradient
              colors={canProceed() ? ['#E07A5F', '#D4626A'] : ['#D0D5D8', '#C0C5C8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 16,
                paddingVertical: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                className="text-white text-lg mr-2"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                {currentSection < SECTIONS.length - 1 ? 'Continue' : 'Complete'}
              </Text>
              {currentSection < SECTIONS.length - 1 ? (
                <ArrowRight size={20} color="#FFF" />
              ) : (
                <Sparkles size={20} color="#FFF" />
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

// Need to import UserProfile type
import type { UserProfile } from '@/lib/store';
