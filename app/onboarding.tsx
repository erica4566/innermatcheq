import { View, Text, Pressable, TextInput, ScrollView, Dimensions, Modal, Keyboard, KeyboardAvoidingView, Platform, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { completeOnboarding as saveOnboardingToDb, getCurrentUser, signOut } from '@/lib/db';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  SlideOutLeft,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, Heart, Brain, Shield, MessageCircle, Sparkles, Users, CheckCircle, Share2, X, Star, Zap, Target, ChevronDown, Camera, Plus, AlertTriangle } from 'lucide-react-native';
import * as Haptics from '@/lib/haptics';
import * as ImagePicker from 'expo-image-picker';
import {
  useAppStore,
  UserProfile,
  calculateAttachmentStyle,
  calculateMBTI,
  calculateLoveLanguages,
  calculateEQ,
  AttachmentStyle,
  MBTIType,
  LoveLanguage,
  type RelationshipGoal,
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

const { width } = Dimensions.get('window');

const TOTAL_STEPS = 16; // Added location, bio, occupation/education/religion steps

// Milestone steps that trigger celebration
const MILESTONE_STEPS = [6, 10, 14]; // After basic info, After psychological assessments, After preferences

// Relationship goals for onboarding
const RELATIONSHIP_GOALS: { value: RelationshipGoal; label: string; description: string }[] = [
  { value: 'casual', label: 'Casual Dating', description: 'Getting to know people, no pressure' },
  { value: 'serious', label: 'Serious Relationship', description: 'Looking for a committed partner' },
  { value: 'marriage', label: 'Marriage-Minded', description: 'Looking for my life partner' },
  { value: 'unsure', label: 'Open to Possibilities', description: 'See where things go naturally' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const setOnboardedAsync = useAppStore((s) => s.setOnboardedAsync);
  const setCurrentUserAsync = useAppStore((s) => s.setCurrentUserAsync);
  const currentUserId = useAppStore((s) => s.currentUser?.id);
  const currentUserName = useAppStore((s) => s.currentUser?.name);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [milestoneMessage, setMilestoneMessage] = useState({ title: '', subtitle: '', icon: 'star' });
  const [calculatedProfile, setCalculatedProfile] = useState<{
    attachmentStyle: string;
    mbtiType: string;
    loveLanguages: string[];
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [milestoneModalDismissing, setMilestoneModalDismissing] = useState(false);

  // Basic info - pre-fill name from profile if available
  const [name, setName] = useState(currentUserName || '');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState(''); // Height in feet and inches (e.g., "5'10")
  const [location, setLocation] = useState(''); // City/Location
  const [bio, setBio] = useState(''); // About me
  const [occupation, setOccupation] = useState(''); // Job/Occupation
  const [education, setEducation] = useState(''); // Education level
  const [religionValue, setReligionValue] = useState(''); // Religion/Spirituality

  // Assessments
  const [attachmentAnswers, setAttachmentAnswers] = useState<Record<string, string>>({});
  const [mbtiAnswers, setMbtiAnswers] = useState<Record<string, string>>({});
  const [loveLanguageAnswers, setLoveLanguageAnswers] = useState<Record<string, string>>({});
  const [loveLanguageScores, setLoveLanguageScores] = useState<Record<string, number>>({
    words: 0,
    acts: 0,
    gifts: 0,
    time: 0,
    touch: 0,
  });

  // Gender preference
  const [gender, setGender] = useState<string>('');
  const [lookingFor, setLookingFor] = useState<string>('');
  const [relationshipGoal, setRelationshipGoal] = useState<RelationshipGoal | null>(null);
  // Preferences
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [criticalQuestions, setCriticalQuestions] = useState<string[]>([]);
  const [dealbreakers, setDealbreakers] = useState<Record<string, string>>({});

  // Photos
  const [photos, setPhotos] = useState<string[]>([]);

  const progress = useSharedValue(1);

  // Pre-fill name from profile if it loads async
  useEffect(() => {
    if (currentUserName && !name) {
      setName(currentUserName);
    }
  }, [currentUserName]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${(progress.value / TOTAL_STEPS) * 100}%`,
  }));

  const handleNext = () => {
    // Prevent rapid tapping while milestone modal is animating
    if (milestoneModalDismissing) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Check if we're hitting a milestone
    const nextStep = currentStep + 1;
    if (MILESTONE_STEPS.includes(currentStep)) {
      // Trigger celebration
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      let message = { title: '', subtitle: '', icon: 'star' };
      if (currentStep === 4) {
        message = {
          title: 'Attachment Style Discovered!',
          subtitle: 'You\'re learning how you connect in relationships',
          icon: 'shield',
        };
      } else if (currentStep === 6) {
        message = {
          title: 'Personality Mapped!',
          subtitle: 'Your MBTI type helps find compatible matches',
          icon: 'brain',
        };
      } else if (currentStep === 9) {
        message = {
          title: 'Almost There!',
          subtitle: 'Just a few more steps to start matching',
          icon: 'zap',
        };
      }

      setMilestoneMessage(message);
      setShowMilestoneModal(true);
      setMilestoneModalDismissing(true);

      // Auto-dismiss after 1.5 seconds
      setTimeout(() => {
        setShowMilestoneModal(false);
        progress.value = withSpring(nextStep + 1);
        setCurrentStep(nextStep);
        // Allow next tap after animation completes
        setTimeout(() => setMilestoneModalDismissing(false), 300);
      }, 1500);
      return;
    }

    if (currentStep < TOTAL_STEPS - 1) {
      progress.value = withSpring(currentStep + 2);
      setCurrentStep(currentStep + 1);
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

  const completeOnboarding = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Calculate psychological profile
    const attachmentStyle = calculateAttachmentStyle(attachmentAnswers);
    const { type: mbtiType, scores: mbtiScores } = calculateMBTI(mbtiAnswers);
    const loveLanguages = calculateLoveLanguages(loveLanguageScores);

    // Calculate EQ score based on assessment results
    const eqScore = calculateEQ(attachmentStyle, mbtiScores, loveLanguages, true);

    // Save calculated profile for display
    setCalculatedProfile({
      attachmentStyle: attachmentStyle || 'Secure',
      mbtiType: mbtiType || 'ENFP',
      loveLanguages: loveLanguages || ['Quality Time'],
    });

    // Get the authenticated user ID from Supabase
    const authUser = await getCurrentUser();
    const userId = authUser?.uid || currentUserId || '1';

    // Parse height from string like "5'10" to inches (optional)
    let heightInInches: number | undefined;
    if (height) {
      const match = height.match(/(\d+)'?\s*(\d*)/);
      if (match) {
        const feet = parseInt(match[1], 10) || 0;
        const inches = parseInt(match[2], 10) || 0;
        heightInInches = feet * 12 + inches;
      }
    }

    const user: UserProfile = {
      id: userId,
      name,
      age: parseInt(age, 10) || 25,
      bio: bio, // Bio from onboarding
      photos: photos, // Save photos from onboarding
      location: location, // Location/City
      height: heightInInches, // Height in inches
      occupation: occupation, // Job/Occupation
      gender: gender as 'man' | 'woman' | 'nonbinary' | null,
      lookingFor: lookingFor as 'men' | 'women' | 'everyone' | null,
      attachmentStyle,
      mbtiType,
      loveLanguages,
      emotionalIntelligence: eqScore, // Use calculated EQ score
      mbtiScores,
      bigFiveScores: null,
      conflictStyle: null,
      relationshipGoal: relationshipGoal,
      communicationFrequency: null,
      affectionLevel: null,
      financialAttitude: null,
      splitBillPreference: null,
      emotionalRegulationStyle: null,
      values: selectedValues,
      interests: [],
      dealbreakers: {
        smoking: (dealbreakers.smoking as 'never' | 'sometimes' | 'any') || 'any',
        drinking: (dealbreakers.drinking as 'never' | 'social' | 'any') || 'any',
        cannabis: (dealbreakers.cannabis as 'never' | 'occasional' | 'any') || 'any',
        drugs: dealbreakers.drugs === 'no',
        hasKids: (dealbreakers.hasKids as 'yes' | 'no' | 'any') || 'any',
        wantsKids: (dealbreakers.wantsKids as 'yes' | 'no' | 'any') || 'any',
        religion: null,
        ageRange: { min: 18, max: 65 },
        distance: 50,
      },
      criticalQuestions,
      smoking: 'never',
      drinking: 'social',
      cannabis: 'never',
      exercise: 'sometimes',
      education: education, // Education level from onboarding
      religion: religionValue, // Religion from onboarding
      isVerified: false,
      verificationLevel: 'none',
      isPremium: false,
      premiumTier: 'free',
      hasVideoIntro: false,
      purchasedReports: {},
    };

    // CRITICAL: Save to database FIRST, then local state
    // This ensures the auth subscription sees the completed profile when checking
    setIsSaving(true);
    let dbSaveSuccessful = false;

    try {
      if (__DEV__) {
        console.log('[Onboarding] Saving profile to database...');
      }
      const dbResult = await saveOnboardingToDb(userId, user);

      if (!dbResult) {
        if (__DEV__) {
          console.error('[Onboarding] Database save returned false');
        }
        // Show error but allow user to continue
        Alert.alert(
          'Save Warning',
          'Your profile was saved locally but may not sync to our servers. You can continue, but some features may be limited until the sync completes.',
          [{ text: 'OK' }]
        );
      } else {
        dbSaveSuccessful = true;
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[Onboarding] Failed to save to database:', error);
      }
      // Show error to user
      Alert.alert(
        'Connection Issue',
        'We couldn\'t save your profile to our servers. Your data is saved locally and will sync when connection is restored.',
        [{ text: 'OK' }]
      );
    }

    // Now save to local state
    await setCurrentUserAsync(user);
    await setOnboardedAsync(true);

    setIsSaving(false);
    setShowSuccessModal(true);
  };

  const handleStartMatching = () => {
    setShowSuccessModal(false);
    router.replace('/(tabs)');
  };

  const handleViewInsights = () => {
    setShowSuccessModal(false);
    router.replace('/(tabs)');
    setTimeout(() => router.push('/insights'), 100);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true; // Welcome preview - always can proceed
      case 1:
        return name.trim().length >= 2;
      case 2: {
        const ageNum = parseInt(age, 10);
        return !isNaN(ageNum) && ageNum >= 18 && ageNum <= 99;
      }
      case 3:
        return true; // Height is optional
      case 4:
        return location.trim().length >= 2; // Location - required
      case 5:
        return gender !== '' && lookingFor !== '';
      case 6:
        return relationshipGoal !== null; // Relationship goal - required
      case 7:
        return true; // Bio is optional but encouraged
      case 8:
        return true; // Occupation/Education/Religion - optional
      case 9:
        return Object.keys(attachmentAnswers).length >= 4;
      case 10:
        return Object.keys(mbtiAnswers).length >= 4;
      case 11:
        return Object.keys(loveLanguageAnswers).length >= 5;
      case 12:
        return selectedValues.length >= 3;
      case 13:
        return Object.keys(dealbreakers).length >= 2;
      case 14:
        return true; // Critical questions - optional
      case 15:
        return true; // Photos - optional (can skip)
      default:
        return false;
    }
  };

  // Photo picker function
  const pickImage = async (index?: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library to add photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newUri = result.assets[0].uri;
      if (index !== undefined) {
        const newPhotos = [...photos];
        newPhotos[index] = newUri;
        setPhotos(newPhotos);
      } else {
        setPhotos([...photos, newUri]);
      }
    }
  };

  const removePhoto = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
  };

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

  const updateLoveLanguage = (questionId: string, language: string) => {
    Haptics.selectionAsync();
    // Get the previous answer for this question
    const previousAnswer = loveLanguageAnswers[questionId];

    // Update the answer for this specific question
    setLoveLanguageAnswers({ ...loveLanguageAnswers, [questionId]: language });

    // Update scores: decrement previous language if it existed, increment new one
    setLoveLanguageScores((prev) => {
      const newScores = { ...prev };
      if (previousAnswer && previousAnswer !== language) {
        newScores[previousAnswer] = Math.max(0, (newScores[previousAnswer] || 0) - 1);
      }
      if (!previousAnswer || previousAnswer !== language) {
        newScores[language] = (newScores[language] || 0) + 1;
      }
      return newScores;
    });
  };

  const selectDealbreaker = (key: string, value: string) => {
    Haptics.selectionAsync();
    setDealbreakers({ ...dealbreakers, [key]: value });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        // Welcome Preview - What You'll Discover
        return (
          <Animated.View
            key="step0-welcome"
            entering={FadeIn.duration(500)}
            className="flex-1 px-6"
          >
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              {/* Hero */}
              <Animated.View entering={FadeInDown.delay(100).duration(500)} className="items-center mb-8">
                <View className="w-24 h-24 rounded-full bg-[#E07A5F]/10 items-center justify-center mb-5">
                  <Sparkles size={44} color="#E07A5F" />
                </View>
                <Text
                  className="text-3xl text-[#2D3436] text-center mb-3"
                  style={{ fontFamily: 'Cormorant_700Bold' }}
                >
                  Discover Yourself
                </Text>
                <Text
                  className="text-base text-[#636E72] text-center px-4 leading-6"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  In the next few minutes, you'll learn more about yourself than most dating apps ever show you.
                </Text>
              </Animated.View>

              {/* Safety First Banner */}
              <Animated.View entering={FadeInDown.delay(150).duration(500)} className="mb-6">
                <View className="bg-[#E07A5F]/10 rounded-2xl p-4 border border-[#E07A5F]/20">
                  <View className="flex-row items-center mb-2">
                    <View className="w-10 h-10 rounded-full bg-[#E07A5F]/20 items-center justify-center">
                      <Shield size={20} color="#E07A5F" />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text
                        className="text-base text-[#E07A5F]"
                        style={{ fontFamily: 'Outfit_600SemiBold' }}
                      >
                        Your Safety Comes First
                      </Text>
                    </View>
                  </View>
                  <Text
                    className="text-sm text-[#636E72]"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    Our Red Flag Detection system analyzes behavior patterns to help you identify potential concerns before they become problems.
                  </Text>
                </View>
              </Animated.View>

              {/* What You'll Learn */}
              <Animated.View entering={FadeInDown.delay(250).duration(500)} className="mb-6">
                <Text
                  className="text-xs text-[#A0A8AB] mb-4"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  WHAT YOU'LL DISCOVER
                </Text>

                {[
                  {
                    icon: Shield,
                    color: '#E07A5F',
                    title: 'Red Flag Detection',
                    description: 'Identify warning signs early to stay safe',
                  },
                  {
                    icon: Brain,
                    color: '#81B29A',
                    title: 'Your Personality Type',
                    description: 'Your MBTI type and compatible matches',
                  },
                  {
                    icon: Heart,
                    color: '#D4A574',
                    title: 'Your Love Languages',
                    description: 'How you give and receive love',
                  },
                  {
                    icon: Target,
                    color: '#9333EA',
                    title: 'Your Values & Deal Breakers',
                    description: 'What matters most to you in a partner',
                  },
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Animated.View
                      key={item.title}
                      entering={FadeInDown.delay(350 + index * 100).duration(400)}
                      className="flex-row items-center bg-white rounded-2xl p-4 mb-3 shadow-sm shadow-black/5"
                    >
                      <View
                        className="w-12 h-12 rounded-xl items-center justify-center"
                        style={{ backgroundColor: `${item.color}15` }}
                      >
                        <Icon size={24} color={item.color} />
                      </View>
                      <View className="flex-1 ml-4">
                        <Text
                          className="text-base text-[#2D3436]"
                          style={{ fontFamily: 'Outfit_600SemiBold' }}
                        >
                          {item.title}
                        </Text>
                        <Text
                          className="text-sm text-[#636E72]"
                          style={{ fontFamily: 'Outfit_400Regular' }}
                        >
                          {item.description}
                        </Text>
                      </View>
                    </Animated.View>
                  );
                })}
              </Animated.View>

              {/* Time Estimate */}
              <Animated.View entering={FadeInDown.delay(800).duration(500)}>
                <View className="bg-[#F5F0ED] rounded-2xl p-4 items-center">
                  <View className="flex-row items-center mb-2">
                    <Zap size={18} color="#D4A574" />
                    <Text
                      className="text-sm text-[#2D3436] ml-2"
                      style={{ fontFamily: 'Outfit_600SemiBold' }}
                    >
                      Takes about 5 minutes
                    </Text>
                  </View>
                  <Text
                    className="text-xs text-[#636E72] text-center"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    Your answers help us find truly compatible matches—not just attractive faces.
                  </Text>
                </View>
              </Animated.View>
            </ScrollView>
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
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>

            {/* Dismiss keyboard hint */}
            <Pressable
              onPress={Keyboard.dismiss}
              className="flex-row items-center justify-center mt-6 py-2"
            >
              <ChevronDown size={18} color="#A0A8AB" />
              <Text
                className="text-sm text-[#A0A8AB] ml-1"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                Tap to dismiss keyboard
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

            <View className="bg-white rounded-2xl p-4 shadow-sm shadow-black/5">
              <TextInput
                value={age}
                onChangeText={(text) => {
                  setAge(text);
                  // Auto-dismiss keyboard when 2 digits entered
                  if (text.length === 2) {
                    Keyboard.dismiss();
                  }
                }}
                placeholder="Your age"
                placeholderTextColor="#A0A8AB"
                className="text-xl text-[#2D3436] text-center py-4"
                style={{ fontFamily: 'Outfit_500Medium' }}
                keyboardType="number-pad"
                maxLength={2}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>

            {/* Dismiss keyboard button - larger tap target */}
            <Pressable
              onPress={Keyboard.dismiss}
              className="items-center justify-center mt-8 py-4 px-6 bg-[#F5F0ED] rounded-2xl self-center"
            >
              <View className="flex-row items-center">
                <ChevronDown size={20} color="#636E72" />
                <Text
                  className="text-base text-[#636E72] ml-2"
                  style={{ fontFamily: 'Outfit_500Medium' }}
                >
                  Done entering age
                </Text>
              </View>
            </Pressable>
          </Animated.View>
        );

      case 3:
        // Height step
        return (
          <Animated.View
            key="step3-height"
            entering={SlideInRight.duration(400)}
            exiting={SlideOutLeft.duration(400)}
            className="flex-1 px-6"
          >
            <View className="items-center mb-10">
              <View className="w-20 h-20 rounded-full bg-[#81B29A]/10 items-center justify-center mb-6">
                <Text className="text-3xl">📏</Text>
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
                This helps matches get a sense of you
              </Text>
            </View>

            <View className="bg-white rounded-2xl p-4 shadow-sm shadow-black/5">
              <TextInput
                value={height}
                onChangeText={setHeight}
                placeholder="e.g., 5'10 or 178cm"
                placeholderTextColor="#A0A8AB"
                className="text-xl text-[#2D3436] text-center py-4"
                style={{ fontFamily: 'Outfit_500Medium' }}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>

            {/* Height presets for quick selection */}
            <View className="mt-6">
              <Text
                className="text-xs text-[#A0A8AB] text-center mb-3"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                QUICK SELECT
              </Text>
              <View className="flex-row flex-wrap justify-center gap-2">
                {["5'4\"", "5'6\"", "5'8\"", "5'10\"", "6'0\"", "6'2\""].map((h) => (
                  <Pressable
                    key={h}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setHeight(h);
                      Keyboard.dismiss();
                    }}
                    className={`px-4 py-2 rounded-full border-2 ${
                      height === h ? 'bg-[#81B29A]/10 border-[#81B29A]' : 'bg-white border-[#F0E6E0]'
                    }`}
                  >
                    <Text
                      className={`text-sm ${height === h ? 'text-[#81B29A]' : 'text-[#636E72]'}`}
                      style={{ fontFamily: height === h ? 'Outfit_600SemiBold' : 'Outfit_400Regular' }}
                    >
                      {h}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Skip hint */}
            <Text
              className="text-center text-xs text-[#A0A8AB] mt-6"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              This is optional — you can skip if you prefer
            </Text>
          </Animated.View>
        );

      case 4:
        // Location step
        return (
          <Animated.View
            key="step4-location"
            entering={SlideInRight.duration(400)}
            exiting={SlideOutLeft.duration(400)}
            className="flex-1 px-6"
          >
            <View className="items-center mb-10">
              <View className="w-20 h-20 rounded-full bg-[#E07A5F]/10 items-center justify-center mb-6">
                <Text className="text-3xl">📍</Text>
              </View>
              <Text
                className="text-3xl text-[#2D3436] text-center mb-3"
                style={{ fontFamily: 'Cormorant_600SemiBold' }}
              >
                Where are you located?
              </Text>
              <Text
                className="text-base text-[#636E72] text-center"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                This helps us find matches near you
              </Text>
            </View>

            <View className="bg-white rounded-2xl p-4 shadow-sm shadow-black/5">
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="City, State (e.g., San Francisco, CA)"
                placeholderTextColor="#A0A8AB"
                className="text-xl text-[#2D3436] text-center py-4"
                style={{ fontFamily: 'Outfit_500Medium' }}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>

            {/* Popular cities for quick selection */}
            <View className="mt-6">
              <Text
                className="text-xs text-[#A0A8AB] text-center mb-3"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                POPULAR CITIES
              </Text>
              <View className="flex-row flex-wrap justify-center gap-2">
                {['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Miami, FL', 'Austin, TX', 'Seattle, WA'].map((city) => (
                  <Pressable
                    key={city}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setLocation(city);
                      Keyboard.dismiss();
                    }}
                    className={`px-4 py-2 rounded-full border-2 ${
                      location === city ? 'bg-[#E07A5F]/10 border-[#E07A5F]' : 'bg-white border-[#F0E6E0]'
                    }`}
                  >
                    <Text
                      className={`text-sm ${location === city ? 'text-[#E07A5F]' : 'text-[#636E72]'}`}
                      style={{ fontFamily: location === city ? 'Outfit_600SemiBold' : 'Outfit_400Regular' }}
                    >
                      {city}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Dismiss keyboard hint */}
            <Pressable
              onPress={Keyboard.dismiss}
              className="flex-row items-center justify-center mt-6 py-2"
            >
              <ChevronDown size={18} color="#A0A8AB" />
              <Text
                className="text-sm text-[#A0A8AB] ml-1"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                Tap to dismiss keyboard
              </Text>
            </Pressable>
          </Animated.View>
        );

      case 5:
        return (
          <Animated.View
            key="step3"
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
                Tell us about you
              </Text>
              <Text
                className="text-base text-[#636E72] text-center"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                Help us find your perfect match
              </Text>
            </View>

            {/* I am */}
            <View className="mb-6">
              <Text
                className="text-sm text-[#2D3436] mb-3"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                I am a...
              </Text>
              <View className="flex-row gap-3">
                {[
                  { value: 'man', label: 'Man' },
                  { value: 'woman', label: 'Woman' },
                  { value: 'nonbinary', label: 'Non-binary' },
                ].map((option) => {
                  const isSelected = gender === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setGender(option.value);
                      }}
                      className={`flex-1 py-4 rounded-2xl border-2 items-center ${
                        isSelected ? 'bg-[#E07A5F]/10 border-[#E07A5F]' : 'bg-white border-[#F0E6E0]'
                      }`}
                    >
                      <Text
                        className={`text-base ${isSelected ? 'text-[#E07A5F]' : 'text-[#636E72]'}`}
                        style={{ fontFamily: isSelected ? 'Outfit_600SemiBold' : 'Outfit_500Medium' }}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Looking for */}
            <View>
              <Text
                className="text-sm text-[#2D3436] mb-3"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                Looking for...
              </Text>
              <View className="flex-row gap-3">
                {[
                  { value: 'men', label: 'Men' },
                  { value: 'women', label: 'Women' },
                  { value: 'everyone', label: 'Everyone' },
                ].map((option) => {
                  const isSelected = lookingFor === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setLookingFor(option.value);
                      }}
                      className={`flex-1 py-4 rounded-2xl border-2 items-center ${
                        isSelected ? 'bg-[#81B29A]/10 border-[#81B29A]' : 'bg-white border-[#F0E6E0]'
                      }`}
                    >
                      <Text
                        className={`text-base ${isSelected ? 'text-[#81B29A]' : 'text-[#636E72]'}`}
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

      case 6:
        // Relationship Goals Step
        return (
          <Animated.View
            key="step5-goals"
            entering={SlideInRight.duration(400)}
            exiting={SlideOutLeft.duration(400)}
            className="flex-1 px-6"
          >
            <View className="items-center mb-8">
              <View className="w-20 h-20 rounded-full bg-[#E07A5F]/10 items-center justify-center mb-5">
                <Target size={36} color="#E07A5F" />
              </View>
              <Text
                className="text-3xl text-[#2D3436] text-center mb-3"
                style={{ fontFamily: 'Cormorant_600SemiBold' }}
              >
                What are you looking for?
              </Text>
              <Text
                className="text-base text-[#636E72] text-center"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                This helps us find compatible matches
              </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
              {RELATIONSHIP_GOALS.map((goal, index) => {
                const isSelected = relationshipGoal === goal.value;
                return (
                  <Animated.View
                    key={goal.value}
                    entering={FadeInDown.delay(index * 100).duration(400)}
                  >
                    <Pressable
                      onPress={() => {
                        Haptics.selectionAsync();
                        setRelationshipGoal(goal.value);
                      }}
                      className={`p-5 rounded-2xl mb-3 border-2 ${
                        isSelected ? 'bg-[#E07A5F]/10 border-[#E07A5F]' : 'bg-white border-[#F0E6E0]'
                      }`}
                    >
                      <View className="flex-row items-center">
                        <View className="flex-1">
                          <Text
                            className={`text-lg ${isSelected ? 'text-[#E07A5F]' : 'text-[#2D3436]'}`}
                            style={{ fontFamily: 'Outfit_600SemiBold' }}
                          >
                            {goal.label}
                          </Text>
                          <Text
                            className="text-sm text-[#636E72] mt-1"
                            style={{ fontFamily: 'Outfit_400Regular' }}
                          >
                            {goal.description}
                          </Text>
                        </View>
                        {isSelected && (
                          <View className="w-8 h-8 rounded-full bg-[#E07A5F] items-center justify-center">
                            <Check size={18} color="#FFF" strokeWidth={3} />
                          </View>
                        )}
                      </View>
                    </Pressable>
                  </Animated.View>
                );
              })}
              <View className="h-20" />
            </ScrollView>
          </Animated.View>
        );

      case 7:
        // Bio/About Me Step
        return (
          <Animated.View
            key="step7-bio"
            entering={SlideInRight.duration(400)}
            exiting={SlideOutLeft.duration(400)}
            className="flex-1 px-6"
          >
            <View className="items-center mb-8">
              <View className="w-20 h-20 rounded-full bg-[#81B29A]/10 items-center justify-center mb-6">
                <MessageCircle size={36} color="#81B29A" />
              </View>
              <Text
                className="text-3xl text-[#2D3436] text-center mb-3"
                style={{ fontFamily: 'Cormorant_600SemiBold' }}
              >
                Tell your story
              </Text>
              <Text
                className="text-base text-[#636E72] text-center px-4"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                Share a bit about yourself — what makes you, you?
              </Text>
            </View>

            <View className="bg-white rounded-2xl p-4 shadow-sm shadow-black/5 flex-1 max-h-48">
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="I'm passionate about... My ideal weekend includes... I'm looking for someone who..."
                placeholderTextColor="#A0A8AB"
                className="text-base text-[#2D3436] flex-1"
                style={{ fontFamily: 'Outfit_400Regular', textAlignVertical: 'top' }}
                multiline
                maxLength={500}
                returnKeyType="done"
                blurOnSubmit
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>

            <Text
              className="text-right text-xs text-[#A0A8AB] mt-2 mr-2"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              {bio.length}/500
            </Text>

            {/* Bio tips */}
            <View className="bg-[#F5F0ED] rounded-2xl p-4 mt-4">
              <Text
                className="text-xs text-[#A0A8AB] mb-2"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                TIPS FOR A GREAT BIO
              </Text>
              <View className="gap-2">
                {[
                  'Be authentic — show your real personality',
                  'Mention your passions and interests',
                  'Keep it positive and inviting',
                ].map((tip, i) => (
                  <View key={i} className="flex-row items-center">
                    <Check size={14} color="#81B29A" />
                    <Text
                      className="text-sm text-[#636E72] ml-2"
                      style={{ fontFamily: 'Outfit_400Regular' }}
                    >
                      {tip}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Skip hint */}
            <Text
              className="text-center text-xs text-[#A0A8AB] mt-4"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              You can always update this later
            </Text>
          </Animated.View>
        );

      case 8:
        // Occupation, Education, Religion Step
        return (
          <Animated.View
            key="step8-details"
            entering={SlideInRight.duration(400)}
            exiting={SlideOutLeft.duration(400)}
            className="flex-1 px-6"
          >
            <View className="items-center mb-6">
              <View className="w-20 h-20 rounded-full bg-[#D4A574]/10 items-center justify-center mb-6">
                <Text className="text-3xl">💼</Text>
              </View>
              <Text
                className="text-3xl text-[#2D3436] text-center mb-3"
                style={{ fontFamily: 'Cormorant_600SemiBold' }}
              >
                A few more details
              </Text>
              <Text
                className="text-base text-[#636E72] text-center"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                Help matches learn more about you
              </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
              {/* Occupation */}
              <View className="mb-5">
                <Text
                  className="text-sm text-[#2D3436] mb-2"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  What do you do?
                </Text>
                <View className="bg-white rounded-2xl p-4 shadow-sm shadow-black/5">
                  <TextInput
                    value={occupation}
                    onChangeText={setOccupation}
                    placeholder="e.g., Software Engineer, Teacher, Nurse"
                    placeholderTextColor="#A0A8AB"
                    className="text-base text-[#2D3436]"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                  />
                </View>
              </View>

              {/* Education */}
              <View className="mb-5">
                <Text
                  className="text-sm text-[#2D3436] mb-2"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Education
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {['High School', 'Some College', 'Bachelor\'s', 'Master\'s', 'PhD', 'Trade School'].map((edu) => {
                    const isSelected = education === edu;
                    return (
                      <Pressable
                        key={edu}
                        onPress={() => {
                          Haptics.selectionAsync();
                          setEducation(edu);
                        }}
                        className={`px-4 py-2 rounded-full border-2 ${
                          isSelected ? 'bg-[#81B29A]/10 border-[#81B29A]' : 'bg-white border-[#F0E6E0]'
                        }`}
                      >
                        <Text
                          className={`text-sm ${isSelected ? 'text-[#81B29A]' : 'text-[#636E72]'}`}
                          style={{ fontFamily: isSelected ? 'Outfit_600SemiBold' : 'Outfit_400Regular' }}
                        >
                          {edu}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Religion */}
              <View className="mb-5">
                <Text
                  className="text-sm text-[#2D3436] mb-2"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Religion / Spirituality
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {['Christian', 'Catholic', 'Jewish', 'Muslim', 'Hindu', 'Buddhist', 'Spiritual', 'Agnostic', 'Atheist', 'Other'].map((rel) => {
                    const isSelected = religionValue === rel;
                    return (
                      <Pressable
                        key={rel}
                        onPress={() => {
                          Haptics.selectionAsync();
                          setReligionValue(rel);
                        }}
                        className={`px-4 py-2 rounded-full border-2 ${
                          isSelected ? 'bg-[#D4A574]/10 border-[#D4A574]' : 'bg-white border-[#F0E6E0]'
                        }`}
                      >
                        <Text
                          className={`text-sm ${isSelected ? 'text-[#D4A574]' : 'text-[#636E72]'}`}
                          style={{ fontFamily: isSelected ? 'Outfit_600SemiBold' : 'Outfit_400Regular' }}
                        >
                          {rel}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Skip hint */}
              <Text
                className="text-center text-xs text-[#A0A8AB] mt-2 mb-6"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                All fields are optional
              </Text>

              <View className="h-20" />
            </ScrollView>
          </Animated.View>
        );

      case 9:
        return (
          <Animated.View
            key="step5-attachment"
            entering={SlideInRight.duration(400)}
            exiting={SlideOutLeft.duration(400)}
            className="flex-1 px-6"
          >
            <View className="items-center mb-4">
              <View className="w-16 h-16 rounded-full bg-[#F2CC8F]/10 items-center justify-center mb-4">
                <Shield size={28} color="#D4A574" />
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

      case 10:
        return (
          <Animated.View
            key="step5"
            entering={SlideInRight.duration(400)}
            exiting={SlideOutLeft.duration(400)}
            className="flex-1 px-6"
          >
            <View className="items-center mb-4">
              <View className="w-16 h-16 rounded-full bg-[#81B29A]/10 items-center justify-center mb-4">
                <Brain size={28} color="#81B29A" />
              </View>
              <Text
                className="text-2xl text-[#2D3436] text-center mb-2"
                style={{ fontFamily: 'Cormorant_600SemiBold' }}
              >
                Personality Type
              </Text>
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

      case 11:
        return (
          <Animated.View
            key="step7-love"
            entering={SlideInRight.duration(400)}
            exiting={SlideOutLeft.duration(400)}
            className="flex-1 px-6"
          >
            <View className="items-center mb-4">
              <View className="w-16 h-16 rounded-full bg-[#E07A5F]/10 items-center justify-center mb-4">
                <Heart size={28} color="#E07A5F" />
              </View>
              <Text
                className="text-2xl text-[#2D3436] text-center mb-2"
                style={{ fontFamily: 'Cormorant_600SemiBold' }}
              >
                Love Languages
              </Text>
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
                      const isSelected = loveLanguageAnswers[question.id] === option.language;
                      return (
                        <Pressable
                          key={option.language}
                          onPress={() => updateLoveLanguage(question.id, option.language)}
                          className={`flex-1 p-3 rounded-xl border-2 ${
                            isSelected ? 'bg-[#E07A5F]/10 border-[#E07A5F]' : 'bg-white border-[#F0E6E0]'
                          }`}
                        >
                          <Text
                            className={`text-xs text-center ${isSelected ? 'text-[#E07A5F]' : 'text-[#636E72]'}`}
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

      case 12:
        return (
          <Animated.View
            key="step8-values"
            entering={SlideInRight.duration(400)}
            exiting={SlideOutLeft.duration(400)}
            className="flex-1 px-6"
          >
            <View className="items-center mb-6">
              <View className="w-16 h-16 rounded-full bg-[#81B29A]/10 items-center justify-center mb-4">
                <Sparkles size={28} color="#81B29A" />
              </View>
              <Text
                className="text-2xl text-[#2D3436] text-center mb-2"
                style={{ fontFamily: 'Cormorant_600SemiBold' }}
              >
                Your Core Values
              </Text>
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
                        isSelected ? 'bg-[#81B29A] border-[#81B29A]' : 'bg-white border-[#E8E0DA]'
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

      case 13:
        return (
          <Animated.View
            key="step9-dealbreakers"
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
                Deal Breakers
              </Text>
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
                            isSelected ? 'bg-[#E07A5F]/10 border-[#E07A5F]' : 'bg-white border-[#F0E6E0]'
                          }`}
                        >
                          <Text
                            className={`text-xs ${isSelected ? 'text-[#E07A5F]' : 'text-[#636E72]'}`}
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

      case 14:
        return (
          <Animated.View
            key="step11-questions"
            entering={SlideInRight.duration(400)}
            exiting={SlideOutLeft.duration(400)}
            className="flex-1 px-6"
          >
            <View className="items-center mb-4">
              <View className="w-16 h-16 rounded-full bg-[#F2CC8F]/10 items-center justify-center mb-4">
                <MessageCircle size={28} color="#D4A574" />
              </View>
              <Text
                className="text-2xl text-[#2D3436] text-center mb-2"
                style={{ fontFamily: 'Cormorant_600SemiBold' }}
              >
                Your Questions
              </Text>
              <Text
                className="text-sm text-[#636E72] text-center px-4"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                Choose up to 3 questions matches must answer to connect with you
              </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
              {/* Selected count */}
              <View className="flex-row justify-center mb-4">
                <View className="bg-[#D4A574]/15 rounded-full px-4 py-1.5">
                  <Text
                    className="text-sm text-[#D4A574]"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    {criticalQuestions.length}/3 selected
                  </Text>
                </View>
              </View>

              {/* Quick suggestions */}
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
                          isSelected ? 'bg-[#F2CC8F]/10 border-[#D4A574]' : 'bg-white border-[#F0E6E0]'
                        }`}
                      >
                        <View
                          className={`w-5 h-5 rounded-full mr-3 items-center justify-center ${
                            isSelected ? 'bg-[#D4A574]' : 'border-2 border-[#D0D5D8]'
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

              {/* Deep questions */}
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
                          isSelected ? 'bg-[#F2CC8F]/10 border-[#D4A574]' : 'bg-white border-[#F0E6E0]'
                        }`}
                        style={{ borderLeftWidth: 4, borderLeftColor: categoryColor }}
                      >
                        <View className="flex-row items-start">
                          <View
                            className={`w-5 h-5 rounded-full mr-3 items-center justify-center mt-0.5 ${
                              isSelected ? 'bg-[#D4A574]' : 'border-2 border-[#D0D5D8]'
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

      case 15:
        // Photo Upload Step
        return (
          <Animated.View
            key="step12-photos"
            entering={SlideInRight.duration(400)}
            exiting={SlideOutLeft.duration(400)}
            className="flex-1 px-6"
          >
            <View className="items-center mb-6">
              <View className="w-20 h-20 rounded-full bg-[#E07A5F]/10 items-center justify-center mb-6">
                <Camera size={36} color="#E07A5F" />
              </View>
              <Text
                className="text-3xl text-[#2D3436] text-center mb-3"
                style={{ fontFamily: 'Cormorant_600SemiBold' }}
              >
                Add Your Photos
              </Text>
              <Text
                className="text-base text-[#636E72] text-center px-4"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                Show your best self! Photos help matches connect with you.
              </Text>
            </View>

            <View className="flex-row flex-wrap gap-3 justify-center mb-4">
              {/* Existing photos */}
              {photos.map((photo, index) => (
                <View key={index} className="relative">
                  <Pressable
                    onPress={() => pickImage(index)}
                    className="w-[28%] aspect-[3/4] rounded-2xl overflow-hidden bg-[#F0E6E0]"
                  >
                    <Image source={{ uri: photo }} className="w-full h-full" resizeMode="cover" />
                    {index === 0 && (
                      <View className="absolute top-2 left-2 bg-[#E07A5F] px-2 py-0.5 rounded-full">
                        <Text
                          className="text-white text-xs"
                          style={{ fontFamily: 'Outfit_600SemiBold' }}
                        >
                          Main
                        </Text>
                      </View>
                    )}
                  </Pressable>
                  <Pressable
                    onPress={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#E07A5F] items-center justify-center shadow-sm"
                  >
                    <X size={14} color="#FFF" />
                  </Pressable>
                </View>
              ))}

              {/* Add photo buttons */}
              {photos.length < 6 && (
                <Pressable
                  onPress={() => pickImage()}
                  className="w-[28%] aspect-[3/4] rounded-2xl bg-white border-2 border-dashed border-[#D0D5D8] items-center justify-center active:scale-95"
                >
                  <View className="w-12 h-12 rounded-full bg-[#F0E6E0] items-center justify-center mb-2">
                    <Plus size={24} color="#E07A5F" />
                  </View>
                  <Text
                    className="text-xs text-[#636E72]"
                    style={{ fontFamily: 'Outfit_500Medium' }}
                  >
                    Add Photo
                  </Text>
                </Pressable>
              )}
            </View>

            {/* Photo tips */}
            <View className="bg-[#F5F0ED] rounded-2xl p-4 mt-4">
              <Text
                className="text-xs text-[#A0A8AB] mb-2"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                PHOTO TIPS
              </Text>
              <View className="gap-2">
                {[
                  'Use clear, recent photos of yourself',
                  'Smile! It makes you more approachable',
                  'Show your interests and hobbies',
                  'Avoid group photos as your main pic',
                ].map((tip, i) => (
                  <View key={i} className="flex-row items-center">
                    <Check size={14} color="#81B29A" />
                    <Text
                      className="text-sm text-[#636E72] ml-2"
                      style={{ fontFamily: 'Outfit_400Regular' }}
                    >
                      {tip}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Photo persistence warning */}
            {photos.length > 0 && (
              <View className="bg-[#F2CC8F]/15 rounded-xl p-3 mt-3 flex-row items-center">
                <AlertTriangle size={16} color="#D4A574" />
                <Text
                  className="text-xs text-[#D4A574] ml-2 flex-1"
                  style={{ fontFamily: 'Outfit_500Medium' }}
                >
                  Complete onboarding to save your photos. Exiting now will lose them.
                </Text>
              </View>
            )}

            {/* Skip hint */}
            <Text
              className="text-center text-xs text-[#A0A8AB] mt-6"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              You can add photos later from your profile
            </Text>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    const titles = ['Welcome', 'Name', 'Age', 'Height', 'Location', 'About You', 'Goals', 'Bio', 'Details', 'Attachment', 'MBTI', 'Love', 'Values', 'Filters', 'Questions', 'Photos'];
    return titles[currentStep] || '';
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#FDF8F5]"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4">
          {currentStep > 0 ? (
            <Pressable onPress={handleBack} className="w-10 h-10 items-center justify-center">
              <ArrowLeft size={24} color="#636E72" />
            </Pressable>
          ) : (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // Show confirmation to sign out since going back from onboarding step 0
                // would just redirect right back here
                Alert.alert(
                  'Exit Setup?',
                  'You can always finish setting up your profile later.',
                  [
                    { text: 'Continue Setup', style: 'cancel' },
                    {
                      text: 'Sign Out',
                      style: 'destructive',
                      onPress: async () => {
                        if (__DEV__) {
                          console.log('[Onboarding] Sign out requested');
                        }
                        try {
                          // Sign out and go to welcome screen
                          await AsyncStorage.removeItem('isOnboarded');
                          await AsyncStorage.removeItem('currentUser');
                          await AsyncStorage.removeItem('supabase_session');
                          await AsyncStorage.removeItem('app-storage');
                          const result = await signOut();
                          if (__DEV__) {
                            console.log('[Onboarding] Sign out result:', result);
                          }
                          router.replace('/auth');
                        } catch (error) {
                          if (__DEV__) {
                            console.error('[Onboarding] Sign out error:', error);
                          }
                          // Still try to navigate
                          router.replace('/auth');
                        }
                      },
                    },
                  ]
                );
              }}
              className="w-10 h-10 items-center justify-center"
            >
              <X size={24} color="#636E72" />
            </Pressable>
          )}

          <Text className="text-sm text-[#A0A8AB]" style={{ fontFamily: 'Outfit_500Medium' }}>
            {currentStep + 1} of {TOTAL_STEPS}
          </Text>

          <View className="w-10" />
        </View>

        {/* Progress bar */}
        <View className="mx-6 h-1 bg-[#F0E6E0] rounded-full overflow-hidden mb-6">
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
                {currentStep === TOTAL_STEPS - 1 ? 'Start Matching' : 'Continue'}
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

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleStartMatching}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <Animated.View
            entering={ZoomIn.duration(300)}
            className="bg-white rounded-3xl p-8 w-full max-w-sm items-center"
          >
            <View className="w-24 h-24 rounded-full bg-[#81B29A]/15 items-center justify-center mb-6">
              <CheckCircle size={56} color="#81B29A" />
            </View>

            <Text
              className="text-3xl text-[#2D3436] text-center mb-2"
              style={{ fontFamily: 'Cormorant_600SemiBold' }}
            >
              You're All Set!
            </Text>

            <Text
              className="text-base text-[#636E72] text-center mb-6"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              Your match profile is ready. Let's find your person!
            </Text>

            {/* Profile Summary */}
            {calculatedProfile && (
              <View className="w-full bg-[#F5F0ED] rounded-2xl p-4 mb-6">
                <Text
                  className="text-xs text-[#A0A8AB] mb-3"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  YOUR PROFILE
                </Text>

                <View className="flex-row items-center mb-2">
                  <Shield size={16} color="#E07A5F" />
                  <Text
                    className="text-sm text-[#2D3436] ml-2"
                    style={{ fontFamily: 'Outfit_500Medium' }}
                  >
                    {calculatedProfile.attachmentStyle} Attachment
                  </Text>
                </View>

                <View className="flex-row items-center mb-2">
                  <Brain size={16} color="#81B29A" />
                  <Text
                    className="text-sm text-[#2D3436] ml-2"
                    style={{ fontFamily: 'Outfit_500Medium' }}
                  >
                    {calculatedProfile.mbtiType}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <Heart size={16} color="#D4A574" />
                  <Text
                    className="text-sm text-[#2D3436] ml-2"
                    style={{ fontFamily: 'Outfit_500Medium' }}
                  >
                    {calculatedProfile.loveLanguages[0]}
                  </Text>
                </View>
              </View>
            )}

            {/* Invite Friends Banner */}
            <Pressable
              onPress={() => {
                handleStartMatching();
                setTimeout(() => router.push('/referrals'), 100);
              }}
              className="w-full bg-[#E07A5F]/10 rounded-xl p-3 flex-row items-center mb-6"
            >
              <View className="w-10 h-10 rounded-full bg-[#E07A5F]/20 items-center justify-center mr-3">
                <Share2 size={18} color="#E07A5F" />
              </View>
              <View className="flex-1">
                <Text
                  className="text-sm text-[#E07A5F]"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Invite friends to grow matches
                </Text>
                <Text
                  className="text-xs text-[#636E72]"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  More users = better compatibility!
                </Text>
              </View>
            </Pressable>

            <View className="w-full gap-3">
              <Pressable
                onPress={handleStartMatching}
                className="active:scale-[0.98]"
              >
                <LinearGradient
                  colors={['#E07A5F', '#D4626A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    borderRadius: 14,
                    paddingVertical: 16,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    className="text-white text-lg"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    Start Matching
                  </Text>
                </LinearGradient>
              </Pressable>

              <Pressable
                onPress={handleViewInsights}
                className="py-3 items-center"
              >
                <Text
                  className="text-[#636E72] text-base"
                  style={{ fontFamily: 'Outfit_500Medium' }}
                >
                  View Full Report
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Milestone Celebration Modal */}
      <Modal
        visible={showMilestoneModal}
        transparent
        animationType="fade"
      >
        <View className="flex-1 bg-black/30 items-center justify-center px-6">
          <Animated.View
            entering={ZoomIn.duration(300)}
            className="bg-white rounded-3xl p-6 w-full max-w-xs items-center"
          >
            <View
              className="w-16 h-16 rounded-full items-center justify-center mb-4"
              style={{
                backgroundColor:
                  milestoneMessage.icon === 'shield' ? '#D4A574' + '20' :
                  milestoneMessage.icon === 'brain' ? '#81B29A' + '20' :
                  '#E07A5F' + '20'
              }}
            >
              {milestoneMessage.icon === 'shield' && <Shield size={32} color="#D4A574" />}
              {milestoneMessage.icon === 'brain' && <Brain size={32} color="#81B29A" />}
              {milestoneMessage.icon === 'zap' && <Zap size={32} color="#E07A5F" />}
              {milestoneMessage.icon === 'star' && <Star size={32} color="#E07A5F" />}
            </View>

            <Text
              className="text-xl text-[#2D3436] text-center mb-2"
              style={{ fontFamily: 'Cormorant_600SemiBold' }}
            >
              {milestoneMessage.title}
            </Text>

            <Text
              className="text-sm text-[#636E72] text-center"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              {milestoneMessage.subtitle}
            </Text>
          </Animated.View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
