import { View, Text, Pressable, ScrollView, TextInput, Image, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  ChevronLeft,
  Camera,
  Plus,
  X,
  Check,
  User,
  MapPin,
  Briefcase,
  GraduationCap,
  Brain,
  Shield,
  Heart,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react-native';
import * as Haptics from '@/lib/haptics';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { useAppStore, MBTI_DESCRIPTIONS, ATTACHMENT_DESCRIPTIONS, LOVE_LANGUAGE_DESCRIPTIONS, MBTIType, AttachmentStyle, LoveLanguage } from '@/lib/store';
import { updateUserProfile, getCurrentUser } from '@/lib/db';

export default function EditProfileScreen() {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const updateCurrentUser = useAppStore((s) => s.updateCurrentUser);

  const [name, setName] = useState(currentUser?.name || '');
  const [age, setAge] = useState(currentUser?.age?.toString() || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [occupation, setOccupation] = useState(currentUser?.occupation || '');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [education, setEducation] = useState(currentUser?.education || '');
  const [photos, setPhotos] = useState<string[]>(currentUser?.photos || []);
  const [isSaving, setIsSaving] = useState(false);
  const [showRetakeWarning, setShowRetakeWarning] = useState(false);

  // Check if user has existing quiz results
  const hasExistingResults = !!(currentUser?.mbtiType || currentUser?.attachmentStyle || (currentUser?.loveLanguages?.length ?? 0) > 0);

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
        // Replace existing photo
        const newPhotos = [...photos];
        newPhotos[index] = newUri;
        setPhotos(newPhotos);
      } else {
        // Add new photo
        setPhotos([...photos, newUri]);
      }
    }
  };

  const removePhoto = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }

    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 120) {
      Alert.alert('Invalid age', 'Please enter a valid age (18-120).');
      return;
    }

    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const user = await getCurrentUser();
      if (!user) {
        Alert.alert('Error', 'Please sign in again.');
        return;
      }

      const updates = {
        name: name.trim(),
        age: ageNum,
        bio: bio.trim(),
        occupation: occupation.trim(),
        location: location.trim(),
        education: education.trim(),
        photos,
      };

      await updateUserProfile(user.uid, updates);
      updateCurrentUser(updates);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-[#FDF8F5]">
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <Animated.View
          entering={FadeIn.duration(400)}
          className="flex-row items-center justify-between px-6 py-4"
        >
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              router.back();
            }}
            className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm"
          >
            <ChevronLeft size={24} color="#2D3436" />
          </Pressable>
          <Text
            className="text-xl text-[#2D3436]"
            style={{ fontFamily: 'Cormorant_600SemiBold' }}
          >
            Edit Profile
          </Text>
          <Pressable
            onPress={handleSave}
            disabled={isSaving}
            className="w-10 h-10 rounded-full bg-[#81B29A] items-center justify-center shadow-sm active:scale-95"
            style={{ opacity: isSaving ? 0.5 : 1 }}
          >
            <Check size={20} color="#FFF" />
          </Pressable>
        </Animated.View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Photos Section */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)} className="px-6 mb-6">
            <Text
              className="text-sm text-[#A0A8AB] mb-3"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              PHOTOS
            </Text>
            <Text
              className="text-xs text-[#636E72] mb-4"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              Add up to 6 photos. First photo is your main profile picture.
            </Text>

            <View className="flex-row flex-wrap gap-3">
              {/* Existing photos */}
              {photos.map((photo, index) => (
                <View key={index} className="relative">
                  <Pressable
                    onPress={() => pickImage(index)}
                    className="w-[30%] aspect-[3/4] rounded-2xl overflow-hidden bg-[#F0E6E0]"
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

              {/* Add photo button */}
              {photos.length < 6 && (
                <Pressable
                  onPress={() => pickImage()}
                  className="w-[30%] aspect-[3/4] rounded-2xl bg-white border-2 border-dashed border-[#D0D5D8] items-center justify-center active:scale-95"
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
          </Animated.View>

          {/* Basic Info */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)} className="px-6 mb-6">
            <Text
              className="text-sm text-[#A0A8AB] mb-3"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              BASIC INFO
            </Text>

            {/* Name */}
            <View className="bg-white rounded-2xl p-4 mb-3">
              <View className="flex-row items-center mb-2">
                <User size={16} color="#636E72" />
                <Text
                  className="text-xs text-[#636E72] ml-2"
                  style={{ fontFamily: 'Outfit_500Medium' }}
                >
                  Name
                </Text>
              </View>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor="#A0A8AB"
                className="text-base text-[#2D3436]"
                style={{ fontFamily: 'Outfit_500Medium' }}
              />
            </View>

            {/* Age */}
            <View className="bg-white rounded-2xl p-4 mb-3">
              <View className="flex-row items-center mb-2">
                <Text className="text-sm">🎂</Text>
                <Text
                  className="text-xs text-[#636E72] ml-2"
                  style={{ fontFamily: 'Outfit_500Medium' }}
                >
                  Age
                </Text>
              </View>
              <TextInput
                value={age}
                onChangeText={setAge}
                placeholder="Your age"
                placeholderTextColor="#A0A8AB"
                keyboardType="number-pad"
                maxLength={3}
                className="text-base text-[#2D3436]"
                style={{ fontFamily: 'Outfit_500Medium' }}
              />
            </View>

            {/* Bio */}
            <View className="bg-white rounded-2xl p-4 mb-3">
              <Text
                className="text-xs text-[#636E72] mb-2"
                style={{ fontFamily: 'Outfit_500Medium' }}
              >
                About Me
              </Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="Tell others about yourself..."
                placeholderTextColor="#A0A8AB"
                multiline
                numberOfLines={4}
                maxLength={500}
                className="text-base text-[#2D3436]"
                style={{ fontFamily: 'Outfit_400Regular', minHeight: 80, textAlignVertical: 'top' }}
              />
              <Text
                className="text-xs text-[#A0A8AB] text-right mt-1"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                {bio.length}/500
              </Text>
            </View>
          </Animated.View>

          {/* Work & Education */}
          <Animated.View entering={FadeInDown.delay(300).duration(500)} className="px-6 mb-6">
            <Text
              className="text-sm text-[#A0A8AB] mb-3"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              WORK & EDUCATION
            </Text>

            {/* Occupation */}
            <View className="bg-white rounded-2xl p-4 mb-3">
              <View className="flex-row items-center mb-2">
                <Briefcase size={16} color="#636E72" />
                <Text
                  className="text-xs text-[#636E72] ml-2"
                  style={{ fontFamily: 'Outfit_500Medium' }}
                >
                  Occupation
                </Text>
              </View>
              <TextInput
                value={occupation}
                onChangeText={setOccupation}
                placeholder="What do you do?"
                placeholderTextColor="#A0A8AB"
                className="text-base text-[#2D3436]"
                style={{ fontFamily: 'Outfit_500Medium' }}
              />
            </View>

            {/* Education */}
            <View className="bg-white rounded-2xl p-4 mb-3">
              <View className="flex-row items-center mb-2">
                <GraduationCap size={16} color="#636E72" />
                <Text
                  className="text-xs text-[#636E72] ml-2"
                  style={{ fontFamily: 'Outfit_500Medium' }}
                >
                  Education
                </Text>
              </View>
              <TextInput
                value={education}
                onChangeText={setEducation}
                placeholder="Where did you study?"
                placeholderTextColor="#A0A8AB"
                className="text-base text-[#2D3436]"
                style={{ fontFamily: 'Outfit_500Medium' }}
              />
            </View>

            {/* Location */}
            <View className="bg-white rounded-2xl p-4 mb-3">
              <View className="flex-row items-center mb-2">
                <MapPin size={16} color="#636E72" />
                <Text
                  className="text-xs text-[#636E72] ml-2"
                  style={{ fontFamily: 'Outfit_500Medium' }}
                >
                  Location
                </Text>
              </View>
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="Where are you based?"
                placeholderTextColor="#A0A8AB"
                className="text-base text-[#2D3436]"
                style={{ fontFamily: 'Outfit_500Medium' }}
              />
            </View>
          </Animated.View>

          {/* Retake Assessments */}
          <Animated.View entering={FadeInDown.delay(400).duration(500)} className="px-6 mb-10">
            <Text
              className="text-sm text-[#A0A8AB] mb-3"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              PSYCHOLOGY PROFILE
            </Text>

            {/* Current Results Display */}
            {(currentUser?.mbtiType || currentUser?.attachmentStyle || (currentUser?.loveLanguages?.length ?? 0) > 0) ? (
              <View className="bg-white rounded-2xl p-4 mb-3">
                <Text
                  className="text-xs text-[#636E72] mb-3"
                  style={{ fontFamily: 'Outfit_500Medium' }}
                >
                  Your Current Results
                </Text>

                {currentUser?.mbtiType && (
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push('/insight-mbti');
                    }}
                    className="flex-row items-center mb-3 pb-3 border-b border-[#F0E6E0] active:opacity-70"
                  >
                    <View className="w-10 h-10 rounded-xl bg-[#81B29A]/15 items-center justify-center">
                      <Brain size={18} color="#81B29A" />
                    </View>
                    <View className="flex-1 ml-3">
                      <Text
                        className="text-sm text-[#2D3436]"
                        style={{ fontFamily: 'Outfit_600SemiBold' }}
                      >
                        {currentUser.mbtiType}
                      </Text>
                      <Text
                        className="text-xs text-[#636E72]"
                        style={{ fontFamily: 'Outfit_400Regular' }}
                      >
                        {MBTI_DESCRIPTIONS[currentUser.mbtiType as MBTIType]?.title || 'Personality Type'}
                      </Text>
                    </View>
                  </Pressable>
                )}

                {currentUser?.attachmentStyle && (
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push('/insight-attachment');
                    }}
                    className="flex-row items-center mb-3 pb-3 border-b border-[#F0E6E0] active:opacity-70"
                  >
                    <View className="w-10 h-10 rounded-xl bg-[#E07A5F]/15 items-center justify-center">
                      <Shield size={18} color="#E07A5F" />
                    </View>
                    <View className="flex-1 ml-3">
                      <Text
                        className="text-sm text-[#2D3436]"
                        style={{ fontFamily: 'Outfit_600SemiBold' }}
                      >
                        {ATTACHMENT_DESCRIPTIONS[currentUser.attachmentStyle as AttachmentStyle]?.title || currentUser.attachmentStyle}
                      </Text>
                      <Text
                        className="text-xs text-[#636E72]"
                        style={{ fontFamily: 'Outfit_400Regular' }}
                      >
                        Attachment Style
                      </Text>
                    </View>
                  </Pressable>
                )}

                {currentUser?.loveLanguages && currentUser.loveLanguages.length > 0 && (
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push('/insight-love-language');
                    }}
                    className="flex-row items-center active:opacity-70"
                  >
                    <View className="w-10 h-10 rounded-xl bg-[#D4A574]/15 items-center justify-center">
                      <Heart size={18} color="#D4A574" />
                    </View>
                    <View className="flex-1 ml-3">
                      <Text
                        className="text-sm text-[#2D3436]"
                        style={{ fontFamily: 'Outfit_600SemiBold' }}
                      >
                        {LOVE_LANGUAGE_DESCRIPTIONS[currentUser.loveLanguages[0] as LoveLanguage]?.title || currentUser.loveLanguages[0]}
                      </Text>
                      <Text
                        className="text-xs text-[#636E72]"
                        style={{ fontFamily: 'Outfit_400Regular' }}
                      >
                        Primary Love Language
                      </Text>
                    </View>
                  </Pressable>
                )}
              </View>
            ) : null}

            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                if (hasExistingResults) {
                  // Show warning modal for retake
                  setShowRetakeWarning(true);
                } else {
                  // First time - go directly to assessment
                  router.push('/assessment');
                }
              }}
              className="bg-white rounded-2xl p-4 flex-row items-center active:scale-[0.98]"
            >
              <View className="w-12 h-12 rounded-xl bg-[#E07A5F]/10 items-center justify-center">
                <RefreshCw size={22} color="#E07A5F" />
              </View>
              <View className="flex-1 ml-4">
                <Text
                  className="text-base text-[#2D3436]"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  {hasExistingResults ? 'Retake Assessments' : 'Take Assessments'}
                </Text>
                <Text
                  className="text-xs text-[#636E72] mt-0.5"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  {hasExistingResults ? 'Update your results' : 'Discover your MBTI, attachment style & more'}
                </Text>
              </View>
              <ChevronLeft size={20} color="#D0D5D8" style={{ transform: [{ rotate: '180deg' }] }} />
            </Pressable>
          </Animated.View>

          <View className="h-10" />
        </ScrollView>

        {/* Retake Warning Modal */}
        <Modal
          visible={showRetakeWarning}
          transparent
          animationType="fade"
          onRequestClose={() => setShowRetakeWarning(false)}
        >
          <View className="flex-1 bg-black/60 justify-center items-center px-6">
            <View className="bg-white rounded-3xl p-6 w-full max-w-sm">
              <View className="items-center mb-4">
                <View className="w-16 h-16 rounded-full bg-[#F97316]/10 items-center justify-center mb-4">
                  <AlertTriangle size={32} color="#F97316" />
                </View>
                <Text
                  className="text-xl text-[#2D3436] text-center mb-2"
                  style={{ fontFamily: 'Cormorant_600SemiBold' }}
                >
                  Retake Assessment?
                </Text>
                <Text
                  className="text-sm text-[#636E72] text-center"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  Your current results will be replaced with new ones. This may change your compatibility matches.
                </Text>
              </View>

              <View className="bg-[#FEF3C7] rounded-xl p-3 mb-6">
                <View className="flex-row items-start">
                  <AlertTriangle size={16} color="#F97316" style={{ marginTop: 2 }} />
                  <Text
                    className="text-xs text-[#92400E] ml-2 flex-1"
                    style={{ fontFamily: 'Outfit_500Medium' }}
                  >
                    Your existing matches may change based on your new assessment results.
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setShowRetakeWarning(false);
                  router.push('/assessment');
                }}
                className="bg-[#E07A5F] rounded-xl py-4 mb-3 active:scale-[0.98]"
              >
                <Text
                  className="text-white text-center text-base"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Yes, Retake Assessment
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  Haptics.selectionAsync();
                  setShowRetakeWarning(false);
                }}
                className="py-3"
              >
                <Text
                  className="text-[#636E72] text-center text-sm"
                  style={{ fontFamily: 'Outfit_500Medium' }}
                >
                  Cancel
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}
