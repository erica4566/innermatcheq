import { View, Text, Pressable, TextInput, ScrollView, Dimensions, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  SlideOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
  ZoomIn,
} from 'react-native-reanimated';
import { useState, useEffect } from 'react';
import { updateUserProfile, getCurrentUser } from '@/lib/db';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Heart,
  Brain,
  Shield,
  MessageCircle,
  Sparkles,
  User,
  Lock,
  Crown,
  Gift,
  AlertTriangle,
  ShieldAlert,
  Target,
  ChevronRight,
  Zap,
  Star,
  X,
  Users,
  Ruler,
} from 'lucide-react-native';
import * as Haptics from '@/lib/haptics';
import {
  useAppStore,
  UserProfile,
  calculateAttachmentStyle,
  calculateMBTI,
  calculateLoveLanguages,
  analyzeRedFlags,
  AttachmentStyle,
  MBTIType,
  LoveLanguage,
} from '@/lib/store';
import {
  attachmentQuestions,
  valueOptions,
  criticalQuestionSuggestions,
  mbtiQuestions,
  loveLanguageQuestions,
  dealBreakerOptions,
  MBTIQuestion,
  LoveLanguageQuestion,
  DealBreakerOption,
  deepQuestionBank,
  questionCategories,
} from '@/lib/mockData';
import {
  AssessmentTier,
  assessmentSections,
  reportTiers,
  assessmentCheckpoints,
  getSectionsForTier,
  getNextCheckpoint,
  isSectionUnlocked,
  redFlagAssessmentQuestions,
} from '@/lib/assessmentData';

const { width, height } = Dimensions.get('window');

// Map section IDs to step indices
const SECTION_TO_STEPS: Record<string, number[]> = {
  basics: [0, 1, 2, 3], // name, age, gender/looking for, height
  attachment: [4],
  mbti: [5],
  love_languages: [6],
  values: [7],
  dealbreakers: [8],
  red_flags: [9],
  deep_questions: [10],
};

const TOTAL_STEPS = 11;

// Height options in feet/inches format
const HEIGHT_OPTIONS = [
  { label: "4'10\" (147 cm)", value: 147 },
  { label: "4'11\" (150 cm)", value: 150 },
  { label: "5'0\" (152 cm)", value: 152 },
  { label: "5'1\" (155 cm)", value: 155 },
  { label: "5'2\" (157 cm)", value: 157 },
  { label: "5'3\" (160 cm)", value: 160 },
  { label: "5'4\" (163 cm)", value: 163 },
  { label: "5'5\" (165 cm)", value: 165 },
  { label: "5'6\" (168 cm)", value: 168 },
  { label: "5'7\" (170 cm)", value: 170 },
  { label: "5'8\" (173 cm)", value: 173 },
  { label: "5'9\" (175 cm)", value: 175 },
  { label: "5'10\" (178 cm)", value: 178 },
  { label: "5'11\" (180 cm)", value: 180 },
  { label: "6'0\" (183 cm)", value: 183 },
  { label: "6'1\" (185 cm)", value: 185 },
  { label: "6'2\" (188 cm)", value: 188 },
  { label: "6'3\" (191 cm)", value: 191 },
  { label: "6'4\" (193 cm)", value: 193 },
  { label: "6'5\" (196 cm)", value: 196 },
  { label: "6'6\"+ (198+ cm)", value: 198 },
];

export default function TieredAssessmentScreen() {
  const router = useRouter();
  const setOnboardedAsync = useAppStore((s) => s.setOnboardedAsync);
  const setCurrentUserAsync = useAppStore((s) => s.setCurrentUserAsync);
  const currentUser = useAppStore((s) => s.currentUser);
  const [currentStep, setCurrentStep] = useState(0);
  const [showCheckpoint, setShowCheckpoint] = useState(false);
  const [currentCheckpoint, setCurrentCheckpoint] = useState<typeof assessmentCheckpoints[0] | null>(null);
  const [purchasedTier, setPurchasedTier] = useState<AssessmentTier | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [targetTier, setTargetTier] = useState<AssessmentTier>('full');

  // Basic info - pre-populate from existing user data if returning
  const [name, setName] = useState(currentUser?.name || '');
  const [age, setAge] = useState(currentUser?.age ? String(currentUser.age) : '');
  const [gender, setGender] = useState<'man' | 'woman' | 'nonbinary' | null>(currentUser?.gender || null);
  const [lookingFor, setLookingFor] = useState<'men' | 'women' | 'everyone' | null>(currentUser?.lookingFor || null);
  const [heightCm, setHeightCm] = useState<number | null>(currentUser?.height || null);

  // Check if user is returning (has existing data) and set premium tier accordingly
  useEffect(() => {
    if (currentUser?.isPremium) {
      setPurchasedTier(currentUser.premiumTier === 'premium' || currentUser.premiumTier === 'elite' ? 'premium' : 'full');
    }
  }, [currentUser]);

  // Assessments
  const [attachmentAnswers, setAttachmentAnswers] = useState<Record<string, string>>({});
  const [mbtiAnswers, setMbtiAnswers] = useState<Record<string, string>>({});
  const [loveLanguageScores, setLoveLanguageScores] = useState<Record<string, number>>({
    words: 0,
    acts: 0,
    gifts: 0,
    time: 0,
    touch: 0,
  });
  const [redFlagAnswers, setRedFlagAnswers] = useState<Record<string, number>>({});

  // Preferences
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [criticalQuestions, setCriticalQuestions] = useState<string[]>([]);
  const [dealbreakers, setDealbreakers] = useState<Record<string, string>>({});

  const progress = useSharedValue(1);
  const checkpointScale = useSharedValue(0);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${(progress.value / TOTAL_STEPS) * 100}%`,
  }));

  // Check for checkpoints after step completion
  const checkForCheckpoint = (step: number) => {
    // Map steps to section IDs
    const stepToSection: Record<number, string> = {
      4: 'attachment', // After attachment questions
      6: 'love_languages', // After love languages
      10: 'deep_questions', // After deep questions
    };

    const sectionId = stepToSection[step];
    if (sectionId) {
      const checkpoint = getNextCheckpoint(sectionId);
      if (checkpoint) {
        // Check if this is a paid tier checkpoint and user hasn't purchased
        if (checkpoint.tier !== 'basic' && purchasedTier !== checkpoint.tier && purchasedTier !== 'premium') {
          // Show upgrade option, but don't force it
          setCurrentCheckpoint(checkpoint);
          setShowCheckpoint(true);
          return true;
        }
      }
    }
    return false;
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Check if moving to a locked section
    const nextStep = currentStep + 1;
    if (nextStep === 5 && !purchasedTier) {
      // Moving to MBTI (full tier)
      setTargetTier('full');
      setShowUpgradeModal(true);
      return;
    }
    if (nextStep === 7 && purchasedTier !== 'premium') {
      // Moving to Values (premium tier)
      setTargetTier('premium');
      setShowUpgradeModal(true);
      return;
    }

    if (currentStep < TOTAL_STEPS - 1) {
      // Check for checkpoint before advancing
      if (!checkForCheckpoint(currentStep)) {
        progress.value = withSpring(currentStep + 2);
        setCurrentStep(currentStep + 1);
      }
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep > 0) {
      progress.value = withSpring(currentStep);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleContinueFromCheckpoint = () => {
    setShowCheckpoint(false);
    setCurrentCheckpoint(null);
    progress.value = withSpring(currentStep + 2);
    setCurrentStep(currentStep + 1);
  };

  const handleGetReport = (tier: AssessmentTier) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // In real app, this would trigger purchase flow
    // For now, simulate getting the report
    completeOnboarding(tier);
  };

  const handleUpgrade = (tier: AssessmentTier) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Simulate purchase
    setPurchasedTier(tier);
    setShowUpgradeModal(false);
    // Continue to next step
    progress.value = withSpring(currentStep + 2);
    setCurrentStep(currentStep + 1);
  };

  const handleSkipUpgrade = () => {
    // Allow skipping but finish with current tier
    setShowUpgradeModal(false);
    const currentTier = currentStep < 5 ? 'basic' : currentStep < 7 ? 'full' : 'premium';
    completeOnboarding(currentTier);
  };

  const completeOnboarding = async (tier: AssessmentTier = 'premium') => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Calculate psychological profile
    const attachmentStyle = calculateAttachmentStyle(attachmentAnswers);
    const { type: mbtiType, scores: mbtiScores } = calculateMBTI(mbtiAnswers);
    const loveLanguages = calculateLoveLanguages(loveLanguageScores);
    const redFlagProfile = analyzeRedFlags(redFlagAnswers);

    const user: UserProfile = {
      id: '1',
      name,
      age: parseInt(age) || 25,
      bio: '',
      photos: [],
      gender: gender,
      lookingFor: lookingFor,
      height: heightCm || undefined,
      attachmentStyle,
      mbtiType: tier === 'basic' ? null : mbtiType,
      loveLanguages: tier === 'basic' ? [] : loveLanguages,
      emotionalIntelligence: 75,
      mbtiScores: tier === 'basic' ? null : mbtiScores,
      bigFiveScores: null,
      conflictStyle: null,
      relationshipGoal: null,
      communicationFrequency: null,
      affectionLevel: null,
      financialAttitude: null,
      splitBillPreference: null,
      emotionalRegulationStyle: null,
      values: tier === 'premium' ? selectedValues : [],
      interests: [],
      dealbreakers: tier === 'premium' ? {
        smoking: (dealbreakers.smoking as 'never' | 'sometimes' | 'any') || 'any',
        drinking: (dealbreakers.drinking as 'never' | 'social' | 'any') || 'any',
        cannabis: (dealbreakers.cannabis as 'never' | 'occasional' | 'any') || 'any',
        drugs: dealbreakers.drugs === 'no',
        hasKids: (dealbreakers.hasKids as 'yes' | 'no' | 'any') || 'any',
        wantsKids: (dealbreakers.wantsKids as 'yes' | 'no' | 'any') || 'any',
        religion: null,
        ageRange: { min: 18, max: 65 },
        distance: 50,
      } : null,
      criticalQuestions: tier === 'premium' ? criticalQuestions : [],
      smoking: 'never',
      drinking: 'social',
      cannabis: 'never',
      exercise: 'sometimes',
      education: '',
      religion: '',
      isVerified: false,
      verificationLevel: 'none',
      isPremium: tier !== 'basic',
      premiumTier: tier === 'basic' ? 'free' : tier === 'full' ? 'plus' : 'premium',
      hasVideoIntro: false,
      purchasedReports: {},
    };

    // CRITICAL: Persist state BEFORE navigation to prevent loops
    await setCurrentUserAsync(user);
    await setOnboardedAsync(true);

    // Also save to database if user is authenticated
    const authUser = await getCurrentUser();
    if (authUser) {
      try {
        const saved = await updateUserProfile(authUser.uid, {
          name: user.name,
          age: user.age,
          gender: user.gender,
          lookingFor: user.lookingFor,
          height: user.height,
          attachmentStyle: user.attachmentStyle,
          mbtiType: user.mbtiType,
          loveLanguages: user.loveLanguages,
          emotionalIntelligence: user.emotionalIntelligence,
          mbtiScores: user.mbtiScores,
          values: user.values,
          dealbreakers: user.dealbreakers,
          criticalQuestions: user.criticalQuestions,
          isPremium: user.isPremium,
          premiumTier: user.premiumTier,
        });
        if (saved) {
          console.log('[Assessment] Profile saved to database');
        } else {
          console.warn('[Assessment] Profile not found in database - data saved locally only');
        }
      } catch (error) {
        console.error('[Assessment] Failed to save profile to database:', error);
      }
    }

    router.replace('/(tabs)');
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return name.trim().length >= 2;
      case 1:
        return parseInt(age) >= 18 && parseInt(age) <= 100;
      case 2:
        return gender !== null && lookingFor !== null;
      case 3:
        return heightCm !== null;
      case 4:
        return Object.keys(attachmentAnswers).length >= 4;
      case 5:
        return Object.keys(mbtiAnswers).length >= 4;
      case 6:
        return Object.values(loveLanguageScores).some((s) => s > 0);
      case 7:
        return selectedValues.length >= 3;
      case 8:
        return Object.keys(dealbreakers).length >= 2;
      case 9:
        return Object.keys(redFlagAnswers).length >= 4;
      case 10:
        return true;
      default:
        return false;
    }
  };

  const getCurrentSection = () => {
    if (currentStep <= 3) return assessmentSections[0]; // basics (name, age, gender, height)
    if (currentStep === 4) return assessmentSections[1]; // attachment
    if (currentStep === 5) return assessmentSections[2]; // mbti
    if (currentStep === 6) return assessmentSections[3]; // love languages
    if (currentStep === 7) return assessmentSections[4]; // values
    if (currentStep === 8) return assessmentSections[5]; // dealbreakers
    if (currentStep === 9) return assessmentSections[6]; // red flags
    return assessmentSections[7]; // deep questions
  };

  const currentSection = getCurrentSection();

  const toggleValue = (value: string) => {
    Haptics.selectionAsync();
    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter((v) => v !== value));
    } else if (selectedValues.length < 5) {
      setSelectedValues([...selectedValues, value]);
    }
  };

  const toggleQuestion = (question: string) => {
    Haptics.selectionAsync();
    if (criticalQuestions.includes(question)) {
      setCriticalQuestions(criticalQuestions.filter((q) => q !== question));
    } else if (criticalQuestions.length < 3) {
      setCriticalQuestions([...criticalQuestions, question]);
    }
  };

  const selectAttachmentAnswer = (questionId: string, style: string) => {
    Haptics.selectionAsync();
    setAttachmentAnswers({ ...attachmentAnswers, [questionId]: style });
  };

  const selectMbtiAnswer = (questionId: string, value: string) => {
    Haptics.selectionAsync();
    setMbtiAnswers({ ...mbtiAnswers, [questionId]: value });
  };

  const updateLoveLanguage = (language: string, add: boolean) => {
    Haptics.selectionAsync();
    setLoveLanguageScores({
      ...loveLanguageScores,
      [language]: loveLanguageScores[language] + (add ? 1 : -1),
    });
  };

  const selectDealbreaker = (key: string, value: string) => {
    Haptics.selectionAsync();
    setDealbreakers({ ...dealbreakers, [key]: value });
  };

  const selectRedFlagAnswer = (questionId: string, score: number) => {
    Haptics.selectionAsync();
    setRedFlagAnswers({ ...redFlagAnswers, [questionId]: score });
  };

  const getTierBadgeColor = (tier: AssessmentTier) => {
    switch (tier) {
      case 'basic': return '#81B29A';
      case 'full': return '#E07A5F';
      case 'premium': return '#D4A574';
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Animated.View
            key="step0"
            entering={SlideInRight.duration(400)}
            exiting={SlideOutLeft.duration(400)}
            className="flex-1 px-6"
          >
            <View className="items-center mb-10">
              <View className="w-20 h-20 rounded-full bg-[#E07A5F]/10 items-center justify-center mb-6">
                <Heart size={36} color="#E07A5F" />
              </View>
              <Text
                className="text-3xl text-[#2D3436] text-center mb-3"
                style={{ fontFamily: 'Cormorant_600SemiBold' }}
              >
                What should we call you?
              </Text>
              <Text
                className="text-base text-[#636E72] text-center"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                Your first name is all we need
              </Text>
            </View>

            <View className="bg-white rounded-2xl p-4 shadow-sm shadow-black/5">
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your first name"
                placeholderTextColor="#A0A8AB"
                className="text-xl text-[#2D3436] text-center py-4"
                style={{ fontFamily: 'Outfit_500Medium' }}
                autoFocus
                autoCapitalize="words"
              />
            </View>
          </Animated.View>
        );

      case 1:
        return (
          <Animated.View
            key="step1"
            entering={SlideInRight.duration(400)}
            exiting={SlideOutLeft.duration(400)}
            className="flex-1 px-6"
          >
            <View className="items-center mb-10">
              <View className="w-20 h-20 rounded-full bg-[#81B29A]/10 items-center justify-center mb-6">
                <Text className="text-3xl">🎂</Text>
              </View>
              <Text
                className="text-3xl text-[#2D3436] text-center mb-3"
                style={{ fontFamily: 'Cormorant_600SemiBold' }}
              >
                How young are you?
              </Text>
              <Text
                className="text-base text-[#636E72] text-center"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                You must be 18 or older
              </Text>
            </View>

            <Pressable onPress={Keyboard.dismiss} className="bg-white rounded-2xl p-4 shadow-sm shadow-black/5">
              <TextInput
                value={age}
                onChangeText={setAge}
                placeholder="Your age"
                placeholderTextColor="#A0A8AB"
                className="text-xl text-[#2D3436] text-center py-4"
                style={{ fontFamily: 'Outfit_500Medium' }}
                keyboardType="number-pad"
                maxLength={2}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
            </Pressable>

            {/* Done button for keyboard */}
            <Pressable
              onPress={Keyboard.dismiss}
              className="mt-4 py-3"
            >
              <Text
                className="text-center text-[#636E72] text-sm"
                style={{ fontFamily: 'Outfit_500Medium' }}
              >
                Tap here to dismiss keyboard
              </Text>
            </Pressable>
          </Animated.View>
        );

      case 2:
        return (
          <Animated.View
            key="step2"
            entering={SlideInRight.duration(400)}
            exiting={SlideOutLeft.duration(400)}
            className="flex-1 px-6"
          >
            <View className="items-center mb-8">
              <View className="w-20 h-20 rounded-full bg-[#E07A5F]/10 items-center justify-center mb-6">
                <Users size={36} color="#E07A5F" />
              </View>
              <Text
                className="text-3xl text-[#2D3436] text-center mb-3"
                style={{ fontFamily: 'Cormorant_600SemiBold' }}
              >
                About You
              </Text>
              <Text
                className="text-base text-[#636E72] text-center"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                Help us find your best matches
              </Text>
            </View>

            {/* Gender Selection */}
            <View className="mb-6">
              <Text
                className="text-sm text-[#636E72] mb-3"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                I am a...
              </Text>
              <View className="flex-row gap-3">
                {([
                  { value: 'woman', label: 'Woman', emoji: '👩' },
                  { value: 'man', label: 'Man', emoji: '👨' },
                  { value: 'nonbinary', label: 'Non-binary', emoji: '🧑' },
                ] as const).map((option) => {
                  const isSelected = gender === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setGender(option.value);
                      }}
                      className={`flex-1 p-4 rounded-2xl border-2 items-center ${
                        isSelected ? 'bg-[#E07A5F]/10 border-[#E07A5F]' : 'bg-white border-[#F0E6E0]'
                      }`}
                    >
                      <Text className="text-2xl mb-2">{option.emoji}</Text>
                      <Text
                        className={`text-sm ${isSelected ? 'text-[#E07A5F]' : 'text-[#636E72]'}`}
                        style={{ fontFamily: isSelected ? 'Outfit_600SemiBold' : 'Outfit_500Medium' }}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Looking For Selection */}
            <View>
              <Text
                className="text-sm text-[#636E72] mb-3"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                I'm interested in...
              </Text>
              <View className="flex-row gap-3">
                {([
                  { value: 'women', label: 'Women', emoji: '👩' },
                  { value: 'men', label: 'Men', emoji: '👨' },
                  { value: 'everyone', label: 'Everyone', emoji: '💜' },
                ] as const).map((option) => {
                  const isSelected = lookingFor === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setLookingFor(option.value);
                      }}
                      className={`flex-1 p-4 rounded-2xl border-2 items-center ${
                        isSelected ? 'bg-[#81B29A]/10 border-[#81B29A]' : 'bg-white border-[#F0E6E0]'
                      }`}
                    >
                      <Text className="text-2xl mb-2">{option.emoji}</Text>
                      <Text
                        className={`text-sm ${isSelected ? 'text-[#81B29A]' : 'text-[#636E72]'}`}
                        style={{ fontFamily: isSelected ? 'Outfit_600SemiBold' : 'Outfit_500Medium' }}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </Animated.View>
        );

      case 3:
        return (
          <Animated.View
            key="step3"
            entering={SlideInRight.duration(400)}
            exiting={SlideOutLeft.duration(400)}
            className="flex-1 px-6"
          >
            <View className="items-center mb-6">
              <View className="w-20 h-20 rounded-full bg-[#D4A574]/10 items-center justify-center mb-6">
                <Ruler size={36} color="#D4A574" />
              </View>
              <Text
                className="text-3xl text-[#2D3436] text-center mb-3"
                style={{ fontFamily: 'Cormorant_600SemiBold' }}
              >
                How tall are you?
              </Text>
              <Text
                className="text-base text-[#636E72] text-center"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                This helps with compatibility matching
              </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
              <View className="gap-2">
                {HEIGHT_OPTIONS.map((option) => {
                  const isSelected = heightCm === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setHeightCm(option.value);
                      }}
                      className={`p-4 rounded-xl border-2 ${
                        isSelected ? 'bg-[#D4A574]/10 border-[#D4A574]' : 'bg-white border-[#F0E6E0]'
                      }`}
                    >
                      <Text
                        className={`text-base text-center ${isSelected ? 'text-[#D4A574]' : 'text-[#2D3436]'}`}
                        style={{ fontFamily: isSelected ? 'Outfit_600SemiBold' : 'Outfit_500Medium' }}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <View className="h-20" />
            </ScrollView>
          </Animated.View>
        );

      case 4:
        return (
          <Animated.View
            key="step2"
            entering={SlideInRight.duration(400)}
            exiting={SlideOutLeft.duration(400)}
            className="flex-1 px-6"
          >
            <View className="items-center mb-4">
              <View className="w-16 h-16 rounded-full bg-[#E07A5F]/10 items-center justify-center mb-4">
                <Shield size={28} color="#E07A5F" />
              </View>
              <Text
                className="text-2xl text-[#2D3436] text-center mb-2"
                style={{ fontFamily: 'Cormorant_600SemiBold' }}
              >
                Attachment Style
              </Text>
              <Text
                className="text-sm text-[#636E72] text-center"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                How you connect in relationships
              </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
              {attachmentQuestions.map((question, index) => (
                <Animated.View
                  key={question.id}
                  entering={FadeInDown.delay(index * 100).duration(400)}
                  className="mb-5"
                >
                  <Text
                    className="text-sm text-[#2D3436] mb-2"
                    style={{ fontFamily: 'Outfit_500Medium' }}
                  >
                    {question.question}
                  </Text>
                  <View className="gap-2">
                    {question.options.map((option) => {
                      const isSelected = attachmentAnswers[question.id] === option.style;
                      return (
                        <Pressable
                          key={option.style}
                          onPress={() => selectAttachmentAnswer(question.id, option.style)}
                          className={`p-3 rounded-xl border-2 ${
                            isSelected ? 'bg-[#E07A5F]/10 border-[#E07A5F]' : 'bg-white border-[#F0E6E0]'
                          }`}
                        >
                          <Text
                            className={`text-xs ${isSelected ? 'text-[#E07A5F]' : 'text-[#636E72]'}`}
                            style={{ fontFamily: isSelected ? 'Outfit_500Medium' : 'Outfit_400Regular' }}
                          >
                            {option.text}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </Animated.View>
              ))}
              <View className="h-20" />
            </ScrollView>
          </Animated.View>
        );

      case 5:
        return (
          <Animated.View
            key="step5-mbti"
            entering={SlideInRight.duration(400)}
            exiting={SlideOutLeft.duration(400)}
            className="flex-1 px-6"
          >
            <View className="items-center mb-4">
              <View className="w-16 h-16 rounded-full bg-[#81B29A]/10 items-center justify-center mb-4">
                <Brain size={28} color="#81B29A" />
              </View>
              <View className="flex-row items-center mb-2">
                <Text
                  className="text-2xl text-[#2D3436] text-center"
                  style={{ fontFamily: 'Cormorant_600SemiBold' }}
                >
                  Personality Type
                </Text>
                <View className="ml-2 bg-[#E07A5F]/15 rounded-full px-2 py-0.5">
                  <Text className="text-[10px] text-[#E07A5F]" style={{ fontFamily: 'Outfit_600SemiBold' }}>
                    FULL
                  </Text>
                </View>
              </View>
              <Text
                className="text-sm text-[#636E72] text-center"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                Myers-Briggs based matching
              </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
              {mbtiQuestions.map((question: MBTIQuestion, index: number) => (
                <Animated.View
                  key={question.id}
                  entering={FadeInDown.delay(index * 100).duration(400)}
                  className="mb-5"
                >
                  <Text
                    className="text-sm text-[#2D3436] mb-2"
                    style={{ fontFamily: 'Outfit_500Medium' }}
                  >
                    {question.question}
                  </Text>
                  <View className="flex-row gap-2">
                    {question.options.map((option: { text: string; value: string }) => {
                      const isSelected = mbtiAnswers[question.id] === option.value;
                      return (
                        <Pressable
                          key={option.value}
                          onPress={() => selectMbtiAnswer(question.id, option.value)}
                          className={`flex-1 p-3 rounded-xl border-2 ${
                            isSelected ? 'bg-[#81B29A]/10 border-[#81B29A]' : 'bg-white border-[#F0E6E0]'
                          }`}
                        >
                          <Text
                            className={`text-xs text-center ${isSelected ? 'text-[#81B29A]' : 'text-[#636E72]'}`}
                            style={{ fontFamily: isSelected ? 'Outfit_500Medium' : 'Outfit_400Regular' }}
                          >
                            {option.text}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </Animated.View>
              ))}
              <View className="h-20" />
            </ScrollView>
          </Animated.View>
        );

      case 6:
        return (
          <Animated.View
            key="step4"
            entering={SlideInRight.duration(400)}
            exiting={SlideOutLeft.duration(400)}
            className="flex-1 px-6"
          >
            <View className="items-center mb-4">
              <View className="w-16 h-16 rounded-full bg-[#D4A574]/10 items-center justify-center mb-4">
                <Heart size={28} color="#D4A574" />
              </View>
              <View className="flex-row items-center mb-2">
                <Text
                  className="text-2xl text-[#2D3436] text-center"
                  style={{ fontFamily: 'Cormorant_600SemiBold' }}
                >
                  Love Languages
                </Text>
                <View className="ml-2 bg-[#E07A5F]/15 rounded-full px-2 py-0.5">
                  <Text className="text-[10px] text-[#E07A5F]" style={{ fontFamily: 'Outfit_600SemiBold' }}>
                    FULL
                  </Text>
                </View>
              </View>
              <Text
                className="text-sm text-[#636E72] text-center"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                How you give and receive love
              </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
              {loveLanguageQuestions.map((question: LoveLanguageQuestion, index: number) => (
                <Animated.View
                  key={question.id}
                  entering={FadeInDown.delay(index * 100).duration(400)}
                  className="mb-4"
                >
                  <Text
                    className="text-sm text-[#2D3436] mb-2"
                    style={{ fontFamily: 'Outfit_500Medium' }}
                  >
                    {question.question}
                  </Text>
                  <View className="flex-row gap-2">
                    {question.options.map((option: { text: string; language: string }) => {
                      const isSelected = loveLanguageScores[option.language] > 0;
                      return (
                        <Pressable
                          key={option.language}
                          onPress={() => updateLoveLanguage(option.language, !isSelected)}
                          className={`flex-1 p-3 rounded-xl border-2 ${
                            isSelected ? 'bg-[#D4A574]/10 border-[#D4A574]' : 'bg-white border-[#F0E6E0]'
                          }`}
                        >
                          <Text
                            className={`text-xs text-center ${isSelected ? 'text-[#D4A574]' : 'text-[#636E72]'}`}
                            style={{ fontFamily: isSelected ? 'Outfit_500Medium' : 'Outfit_400Regular' }}
                          >
                            {option.text}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </Animated.View>
              ))}
              <View className="h-20" />
            </ScrollView>
          </Animated.View>
        );

      case 7:
        return (
          <Animated.View
            key="step7"
            entering={SlideInRight.duration(400)}
            exiting={SlideOutLeft.duration(400)}
            className="flex-1 px-6"
          >
            <View className="items-center mb-6">
              <View className="w-16 h-16 rounded-full bg-[#9333EA]/10 items-center justify-center mb-4">
                <Sparkles size={28} color="#9333EA" />
              </View>
              <View className="flex-row items-center mb-2">
                <Text
                  className="text-2xl text-[#2D3436] text-center"
                  style={{ fontFamily: 'Cormorant_600SemiBold' }}
                >
                  Core Values
                </Text>
                <View className="ml-2 bg-[#D4A574]/15 rounded-full px-2 py-0.5">
                  <Text className="text-[10px] text-[#D4A574]" style={{ fontFamily: 'Outfit_600SemiBold' }}>
                    PREMIUM
                  </Text>
                </View>
              </View>
              <Text
                className="text-sm text-[#636E72] text-center"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                Choose 3-5 values that guide your life
              </Text>
            </View>

            <View className="flex-row flex-wrap justify-center gap-3">
              {valueOptions.map((value, index) => {
                const isSelected = selectedValues.includes(value);
                return (
                  <Animated.View key={value} entering={FadeIn.delay(index * 30).duration(300)}>
                    <Pressable
                      onPress={() => toggleValue(value)}
                      className={`px-4 py-3 rounded-full border-2 ${
                        isSelected ? 'bg-[#9333EA] border-[#9333EA]' : 'bg-white border-[#E8E0DA]'
                      }`}
                    >
                      <Text
                        className={`text-sm ${isSelected ? 'text-white' : 'text-[#636E72]'}`}
                        style={{ fontFamily: isSelected ? 'Outfit_600SemiBold' : 'Outfit_400Regular' }}
                      >
                        {value}
                      </Text>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>

            <Text
              className="text-center text-[#A0A8AB] mt-6"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              {selectedValues.length}/5 selected
            </Text>
          </Animated.View>
        );

      case 8:
        return (
          <Animated.View
            key="step8"
            entering={SlideInRight.duration(400)}
            exiting={SlideOutLeft.duration(400)}
            className="flex-1 px-6"
          >
            <View className="items-center mb-4">
              <View className="w-16 h-16 rounded-full bg-[#EF4444]/10 items-center justify-center mb-4">
                <ShieldAlert size={28} color="#EF4444" />
              </View>
              <View className="flex-row items-center mb-2">
                <Text
                  className="text-2xl text-[#2D3436] text-center"
                  style={{ fontFamily: 'Cormorant_600SemiBold' }}
                >
                  Deal Breakers
                </Text>
                <View className="ml-2 bg-[#D4A574]/15 rounded-full px-2 py-0.5">
                  <Text className="text-[10px] text-[#D4A574]" style={{ fontFamily: 'Outfit_600SemiBold' }}>
                    PREMIUM
                  </Text>
                </View>
              </View>
              <Text
                className="text-sm text-[#636E72] text-center"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                Filter out incompatible matches
              </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
              {dealBreakerOptions.map((item: DealBreakerOption, index: number) => (
                <Animated.View
                  key={item.id}
                  entering={FadeInDown.delay(index * 80).duration(400)}
                  className="mb-4"
                >
                  <Text
                    className="text-sm text-[#2D3436] mb-2"
                    style={{ fontFamily: 'Outfit_500Medium' }}
                  >
                    {item.label}
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {item.options.map((option: { value: string; label: string }) => {
                      const isSelected = dealbreakers[item.id] === option.value;
                      return (
                        <Pressable
                          key={option.value}
                          onPress={() => selectDealbreaker(item.id, option.value)}
                          className={`px-4 py-2 rounded-full border-2 ${
                            isSelected ? 'bg-[#EF4444]/10 border-[#EF4444]' : 'bg-white border-[#F0E6E0]'
                          }`}
                        >
                          <Text
                            className={`text-xs ${isSelected ? 'text-[#EF4444]' : 'text-[#636E72]'}`}
                            style={{ fontFamily: isSelected ? 'Outfit_500Medium' : 'Outfit_400Regular' }}
                          >
                            {option.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </Animated.View>
              ))}
              <View className="h-20" />
            </ScrollView>
          </Animated.View>
        );

      case 9:
        return (
          <Animated.View
            key="step9"
            entering={SlideInRight.duration(400)}
            exiting={SlideOutLeft.duration(400)}
            className="flex-1 px-6"
          >
            <View className="items-center mb-4">
              <View className="w-16 h-16 rounded-full bg-[#F97316]/10 items-center justify-center mb-4">
                <AlertTriangle size={28} color="#F97316" />
              </View>
              <View className="flex-row items-center mb-2">
                <Text
                  className="text-2xl text-[#2D3436] text-center"
                  style={{ fontFamily: 'Cormorant_600SemiBold' }}
                >
                  Red Flag Detection
                </Text>
                <View className="ml-2 bg-[#D4A574]/15 rounded-full px-2 py-0.5">
                  <Text className="text-[10px] text-[#D4A574]" style={{ fontFamily: 'Outfit_600SemiBold' }}>
                    PREMIUM
                  </Text>
                </View>
              </View>
              <Text
                className="text-sm text-[#636E72] text-center px-4"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                Answer honestly - this helps us protect you
              </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
              {redFlagAssessmentQuestions.map((question, index) => (
                <Animated.View
                  key={question.id}
                  entering={FadeInDown.delay(index * 100).duration(400)}
                  className="mb-5"
                >
                  <Text
                    className="text-sm text-[#2D3436] mb-1"
                    style={{ fontFamily: 'Outfit_500Medium' }}
                  >
                    {question.question}
                  </Text>
                  <Text
                    className="text-xs text-[#A0A8AB] mb-2"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    {question.description}
                  </Text>
                  <View className="gap-2">
                    {question.options.map((option) => {
                      const isSelected = redFlagAnswers[question.id] === option.score;
                      return (
                        <Pressable
                          key={option.score}
                          onPress={() => selectRedFlagAnswer(question.id, option.score)}
                          className={`p-3 rounded-xl border-2 ${
                            isSelected ? 'bg-[#F97316]/10 border-[#F97316]' : 'bg-white border-[#F0E6E0]'
                          }`}
                        >
                          <Text
                            className={`text-xs ${isSelected ? 'text-[#F97316]' : 'text-[#636E72]'}`}
                            style={{ fontFamily: isSelected ? 'Outfit_500Medium' : 'Outfit_400Regular' }}
                          >
                            {option.text}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </Animated.View>
              ))}
              <View className="h-20" />
            </ScrollView>
          </Animated.View>
        );

      case 10:
        return (
          <Animated.View
            key="step10"
            entering={SlideInRight.duration(400)}
            exiting={SlideOutLeft.duration(400)}
            className="flex-1 px-6"
          >
            <View className="items-center mb-4">
              <View className="w-16 h-16 rounded-full bg-[#3B82F6]/10 items-center justify-center mb-4">
                <MessageCircle size={28} color="#3B82F6" />
              </View>
              <View className="flex-row items-center mb-2">
                <Text
                  className="text-2xl text-[#2D3436] text-center"
                  style={{ fontFamily: 'Cormorant_600SemiBold' }}
                >
                  Your Questions
                </Text>
                <View className="ml-2 bg-[#D4A574]/15 rounded-full px-2 py-0.5">
                  <Text className="text-[10px] text-[#D4A574]" style={{ fontFamily: 'Outfit_600SemiBold' }}>
                    PREMIUM
                  </Text>
                </View>
              </View>
              <Text
                className="text-sm text-[#636E72] text-center px-4"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                Choose up to 3 questions matches must answer
              </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
              <View className="flex-row justify-center mb-4">
                <View className="bg-[#3B82F6]/15 rounded-full px-4 py-1.5">
                  <Text
                    className="text-sm text-[#3B82F6]"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    {criticalQuestions.length}/3 selected
                  </Text>
                </View>
              </View>

              <Text
                className="text-xs text-[#A0A8AB] mb-2"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                QUICK QUESTIONS
              </Text>
              <View className="gap-2 mb-5">
                {criticalQuestionSuggestions.slice(0, 3).map((question, index) => {
                  const isSelected = criticalQuestions.includes(question);
                  return (
                    <Animated.View key={question} entering={FadeInDown.delay(index * 40).duration(400)}>
                      <Pressable
                        onPress={() => toggleQuestion(question)}
                        className={`p-3.5 rounded-xl border-2 flex-row items-center ${
                          isSelected ? 'bg-[#3B82F6]/10 border-[#3B82F6]' : 'bg-white border-[#F0E6E0]'
                        }`}
                      >
                        <View
                          className={`w-5 h-5 rounded-full mr-3 items-center justify-center ${
                            isSelected ? 'bg-[#3B82F6]' : 'border-2 border-[#D0D5D8]'
                          }`}
                        >
                          {isSelected && <Check size={12} color="#FFF" strokeWidth={3} />}
                        </View>
                        <Text
                          className={`flex-1 text-sm ${isSelected ? 'text-[#2D3436]' : 'text-[#636E72]'}`}
                          style={{ fontFamily: isSelected ? 'Outfit_500Medium' : 'Outfit_400Regular' }}
                        >
                          {question}
                        </Text>
                      </Pressable>
                    </Animated.View>
                  );
                })}
              </View>

              <Text
                className="text-xs text-[#A0A8AB] mb-2"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                DEEPER QUESTIONS
              </Text>
              <View className="gap-2">
                {deepQuestionBank.slice(0, 6).map((q, index) => {
                  const isSelected = criticalQuestions.includes(q.question);
                  const categoryColor = questionCategories.find((c) => c.id === q.category)?.color || '#636E72';
                  return (
                    <Animated.View key={q.id} entering={FadeInDown.delay((index + 3) * 40).duration(400)}>
                      <Pressable
                        onPress={() => toggleQuestion(q.question)}
                        className={`p-3.5 rounded-xl border-2 ${
                          isSelected ? 'bg-[#3B82F6]/10 border-[#3B82F6]' : 'bg-white border-[#F0E6E0]'
                        }`}
                        style={{ borderLeftWidth: 4, borderLeftColor: categoryColor }}
                      >
                        <View className="flex-row items-start">
                          <View
                            className={`w-5 h-5 rounded-full mr-3 items-center justify-center mt-0.5 ${
                              isSelected ? 'bg-[#3B82F6]' : 'border-2 border-[#D0D5D8]'
                            }`}
                          >
                            {isSelected && <Check size={12} color="#FFF" strokeWidth={3} />}
                          </View>
                          <View className="flex-1">
                            <Text
                              className={`text-sm ${isSelected ? 'text-[#2D3436]' : 'text-[#636E72]'}`}
                              style={{ fontFamily: isSelected ? 'Outfit_500Medium' : 'Outfit_400Regular' }}
                            >
                              {q.question}
                            </Text>
                            <Text
                              className="text-xs text-[#A0A8AB] mt-1"
                              style={{ fontFamily: 'Outfit_400Regular' }}
                            >
                              {q.whyItMatters}
                            </Text>
                          </View>
                        </View>
                      </Pressable>
                    </Animated.View>
                  );
                })}
              </View>
              <View className="h-24" />
            </ScrollView>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  // Upgrade Modal
  const renderUpgradeModal = () => {
    if (!showUpgradeModal) return null;

    const tierInfo = reportTiers.find((t) => t.id === targetTier);
    if (!tierInfo) return null;

    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        className="absolute inset-0 bg-black/60 justify-end"
      >
        <Animated.View
          entering={FadeInUp.duration(400)}
          className="bg-white rounded-t-3xl p-6"
        >
          <View className="items-center mb-6">
            <View
              className="w-16 h-16 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: `${tierInfo.color}15` }}
            >
              <Crown size={32} color={tierInfo.color} />
            </View>
            <Text
              className="text-2xl text-[#2D3436] text-center mb-2"
              style={{ fontFamily: 'Cormorant_600SemiBold' }}
            >
              Unlock {tierInfo.name}
            </Text>
            <Text
              className="text-sm text-[#636E72] text-center"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              Continue your assessment for deeper insights
            </Text>
          </View>

          <View className="bg-[#F5F0ED] rounded-2xl p-4 mb-6">
            {tierInfo.includes.map((item, index) => (
              <View key={index} className="flex-row items-center mb-2 last:mb-0">
                <View
                  className="w-5 h-5 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: `${tierInfo.color}20` }}
                >
                  <Check size={12} color={tierInfo.color} strokeWidth={3} />
                </View>
                <Text
                  className="text-sm text-[#2D3436] flex-1"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  {item}
                </Text>
              </View>
            ))}
          </View>

          <Pressable
            onPress={() => handleUpgrade(targetTier)}
            className="mb-3 active:scale-[0.98]"
          >
            <LinearGradient
              colors={[tierInfo.color, tierInfo.color]}
              style={{
                paddingVertical: 18,
                borderRadius: 16,
                alignItems: 'center',
              }}
            >
              <Text
                className="text-white text-lg"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                Unlock for {tierInfo.price}
              </Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            onPress={handleSkipUpgrade}
            className="py-4"
          >
            <Text
              className="text-center text-[#636E72] text-sm"
              style={{ fontFamily: 'Outfit_500Medium' }}
            >
              Start matching now with Basic profile
            </Text>
            <Text
              className="text-center text-[#A0A8AB] text-xs mt-1"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              You can complete your profile later for better matches
            </Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    );
  };

  // Checkpoint Modal
  const renderCheckpointModal = () => {
    if (!showCheckpoint || !currentCheckpoint) return null;

    const tierInfo = reportTiers.find((t) => t.id === currentCheckpoint.tier);

    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        className="absolute inset-0 bg-black/60 justify-center px-6"
      >
        <Animated.View
          entering={ZoomIn.duration(400)}
          className="bg-white rounded-3xl p-6"
        >
          <View className="items-center mb-6">
            <View className="w-20 h-20 rounded-full bg-[#81B29A]/10 items-center justify-center mb-4">
              <Check size={40} color="#81B29A" />
            </View>
            <Text
              className="text-2xl text-[#2D3436] text-center mb-2"
              style={{ fontFamily: 'Cormorant_600SemiBold' }}
            >
              {currentCheckpoint.title}
            </Text>
            <Text
              className="text-sm text-[#636E72] text-center"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              {currentCheckpoint.subtitle}
            </Text>
          </View>

          <View className="bg-[#F5F0ED] rounded-2xl p-4 mb-6">
            <Text
              className="text-xs text-[#A0A8AB] mb-2"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              YOUR REPORT IS READY
            </Text>
            <Text
              className="text-lg text-[#2D3436] mb-1"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              {currentCheckpoint.reportName}
            </Text>
            <Text
              className="text-sm text-[#636E72]"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              {currentCheckpoint.reportDescription}
            </Text>
          </View>

          <Pressable
            onPress={() => handleGetReport(currentCheckpoint.tier)}
            className="mb-3 active:scale-[0.98]"
          >
            <LinearGradient
              colors={['#81B29A', '#6A9B86']}
              style={{
                paddingVertical: 18,
                borderRadius: 16,
                alignItems: 'center',
              }}
            >
              <Text
                className="text-white text-lg"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                Get {currentCheckpoint.tier === 'basic' ? 'Free' : tierInfo?.price} Report
              </Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            onPress={handleContinueFromCheckpoint}
            className="flex-row items-center justify-center py-4"
          >
            <Text
              className="text-[#E07A5F] text-sm mr-1"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              Continue for Deeper Insights
            </Text>
            <ArrowRight size={16} color="#E07A5F" />
          </Pressable>
        </Animated.View>
      </Animated.View>
    );
  };

  return (
    <View className="flex-1 bg-[#FDF8F5]">
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (currentStep > 0) {
                handleBack();
              } else {
                router.replace('/');
              }
            }}
            className="w-10 h-10 items-center justify-center"
          >
            {currentStep > 0 ? (
              <ArrowLeft size={24} color="#636E72" />
            ) : (
              <X size={24} color="#636E72" />
            )}
          </Pressable>

          <View className="flex-row items-center">
            <Text className="text-sm text-[#A0A8AB]" style={{ fontFamily: 'Outfit_500Medium' }}>
              {currentStep + 1} of {TOTAL_STEPS}
            </Text>
            {currentSection && (
              <View
                className="ml-2 rounded-full px-2 py-0.5"
                style={{ backgroundColor: `${getTierBadgeColor(currentSection.tier)}15` }}
              >
                <Text
                  className="text-[10px]"
                  style={{
                    fontFamily: 'Outfit_600SemiBold',
                    color: getTierBadgeColor(currentSection.tier),
                  }}
                >
                  {currentSection.tier.toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <View className="w-10" />
        </View>

        {/* Progress bar */}
        <View className="mx-6 h-1.5 bg-[#F0E6E0] rounded-full overflow-hidden mb-6">
          <Animated.View
            style={[progressStyle, { backgroundColor: '#E07A5F', height: '100%', borderRadius: 999 }]}
          />
        </View>

        {/* Step content */}
        {renderStep()}

        {/* Bottom button */}
        <View className="px-6 pb-4">
          <Pressable onPress={handleNext} disabled={!canProceed()} className="active:scale-[0.98]">
            <LinearGradient
              colors={canProceed() ? ['#E07A5F', '#D56A4F'] : ['#D0D5D8', '#C0C5C8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                paddingVertical: 18,
                borderRadius: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text className="text-white text-lg mr-2" style={{ fontFamily: 'Outfit_600SemiBold' }}>
                {currentStep === TOTAL_STEPS - 1 ? 'Get My Report' : 'Continue'}
              </Text>
              {currentStep < TOTAL_STEPS - 1 ? (
                <ArrowRight size={20} color="#FFF" />
              ) : (
                <Sparkles size={20} color="#FFF" />
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Modals */}
      {renderUpgradeModal()}
      {renderCheckpointModal()}
    </View>
  );
}
