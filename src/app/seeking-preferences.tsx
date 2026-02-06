import { View, Text, Pressable, ScrollView, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  ArrowLeft,
  Users,
  Check,
  MapPin,
  Navigation,
} from 'lucide-react-native';
import * as Haptics from '@/lib/haptics';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '@/lib/store';
import { getCurrentUser, updateUserProfile } from '@/lib/db';

const DISTANCE_OPTIONS = [5, 10, 25, 50, 100, 250];

export default function SeekingPreferencesScreen() {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);

  const [gender, setGender] = useState<string>(currentUser?.gender || '');
  const [lookingFor, setLookingFor] = useState<string>(currentUser?.lookingFor || '');
  const [zipCode, setZipCode] = useState<string>(currentUser?.zipCode || '');
  const [maxDistance, setMaxDistance] = useState<number>(currentUser?.maxDistance || 50);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setGender(currentUser.gender || '');
      setLookingFor(currentUser.lookingFor || '');
      setZipCode(currentUser.zipCode || '');
      setMaxDistance(currentUser.maxDistance || 50);
    }
  }, [currentUser]);

  const handleSave = async () => {
    if (!gender || !lookingFor) {
      Alert.alert('Missing Information', 'Please select both your gender and who you\'re looking for.');
      return;
    }

    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const authUser = await getCurrentUser();
      if (authUser && currentUser) {
        const success = await updateUserProfile(authUser.uid, {
          gender: gender as 'man' | 'woman' | 'nonbinary',
          lookingFor: lookingFor as 'men' | 'women' | 'everyone',
          zipCode: zipCode || undefined,
          maxDistance: maxDistance,
        });

        if (success) {
          setCurrentUser({
            ...currentUser,
            gender: gender as 'man' | 'woman' | 'nonbinary',
            lookingFor: lookingFor as 'men' | 'women' | 'everyone',
            zipCode: zipCode || undefined,
            maxDistance: maxDistance,
          });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert('Saved', 'Your preferences have been updated. New matches will reflect your preferences.', [
            { text: 'OK', onPress: () => router.back() },
          ]);
        } else {
          throw new Error('Failed to save');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-[#FDF8F5]">
      <Stack.Screen
        options={{
          title: 'Seeking Preferences',
          headerShown: true,
          headerStyle: { backgroundColor: '#FDF8F5' },
          headerShadowVisible: false,
          headerTitleStyle: { fontFamily: 'Outfit_600SemiBold', color: '#2D3436' },
          headerLeft: () => (
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                router.back();
              }}
              className="w-10 h-10 items-center justify-center"
            >
              <ArrowLeft size={24} color="#636E72" />
            </Pressable>
          ),
        }}
      />

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100).duration(600)} className="mb-8 mt-4">
          <View className="items-center mb-6">
            <View className="w-20 h-20 rounded-full bg-[#E07A5F]/10 items-center justify-center mb-4">
              <Users size={36} color="#E07A5F" />
            </View>
            <Text
              className="text-2xl text-[#2D3436] text-center mb-2"
              style={{ fontFamily: 'Cormorant_600SemiBold' }}
            >
              Update Your Preferences
            </Text>
            <Text
              className="text-sm text-[#636E72] text-center"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              Changes will affect who you see in Discover
            </Text>
          </View>
        </Animated.View>

        {/* I am */}
        <Animated.View entering={FadeInDown.delay(150).duration(600)} className="mb-6">
          <Text
            className="text-sm text-[#2D3436] mb-3"
            style={{ fontFamily: 'Outfit_600SemiBold' }}
          >
            I am a...
          </Text>
          <View className="gap-3">
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
                  className={`flex-row items-center p-4 rounded-2xl border-2 ${
                    isSelected ? 'bg-[#E07A5F]/10 border-[#E07A5F]' : 'bg-white border-[#F0E6E0]'
                  }`}
                >
                  <View
                    className={`w-6 h-6 rounded-full mr-4 items-center justify-center ${
                      isSelected ? 'bg-[#E07A5F]' : 'border-2 border-[#D0D5D8]'
                    }`}
                  >
                    {isSelected && <Check size={14} color="#FFF" strokeWidth={3} />}
                  </View>
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
        </Animated.View>

        {/* Looking for */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)} className="mb-8">
          <Text
            className="text-sm text-[#2D3436] mb-3"
            style={{ fontFamily: 'Outfit_600SemiBold' }}
          >
            Looking for...
          </Text>
          <View className="gap-3">
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
                  className={`flex-row items-center p-4 rounded-2xl border-2 ${
                    isSelected ? 'bg-[#81B29A]/10 border-[#81B29A]' : 'bg-white border-[#F0E6E0]'
                  }`}
                >
                  <View
                    className={`w-6 h-6 rounded-full mr-4 items-center justify-center ${
                      isSelected ? 'bg-[#81B29A]' : 'border-2 border-[#D0D5D8]'
                    }`}
                  >
                    {isSelected && <Check size={14} color="#FFF" strokeWidth={3} />}
                  </View>
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
        </Animated.View>

        {/* Location - Zip Code */}
        <Animated.View entering={FadeInDown.delay(250).duration(600)} className="mb-6">
          <Text
            className="text-sm text-[#2D3436] mb-3"
            style={{ fontFamily: 'Outfit_600SemiBold' }}
          >
            Your Location (Zip Code)
          </Text>
          <View className="flex-row items-center bg-white rounded-2xl border-2 border-[#F0E6E0] p-4">
            <MapPin size={20} color="#636E72" />
            <TextInput
              value={zipCode}
              onChangeText={(text) => setZipCode(text.replace(/[^0-9]/g, '').slice(0, 5))}
              placeholder="Enter zip code"
              placeholderTextColor="#A0A8AB"
              keyboardType="numeric"
              maxLength={5}
              className="flex-1 ml-3 text-base text-[#2D3436]"
              style={{ fontFamily: 'Outfit_500Medium' }}
            />
          </View>
          <Text
            className="text-xs text-[#A0A8AB] mt-2 ml-1"
            style={{ fontFamily: 'Outfit_400Regular' }}
          >
            Used to find matches near you
          </Text>
        </Animated.View>

        {/* Max Distance */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)} className="mb-8">
          <Text
            className="text-sm text-[#2D3436] mb-3"
            style={{ fontFamily: 'Outfit_600SemiBold' }}
          >
            Maximum Distance
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {DISTANCE_OPTIONS.map((dist) => {
              const isSelected = maxDistance === dist;
              return (
                <Pressable
                  key={dist}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setMaxDistance(dist);
                  }}
                  className={`px-4 py-3 rounded-xl border-2 ${
                    isSelected ? 'bg-[#D4A574]/10 border-[#D4A574]' : 'bg-white border-[#F0E6E0]'
                  }`}
                >
                  <Text
                    className={`text-sm ${isSelected ? 'text-[#D4A574]' : 'text-[#636E72]'}`}
                    style={{ fontFamily: isSelected ? 'Outfit_600SemiBold' : 'Outfit_500Medium' }}
                  >
                    {dist === 250 ? '250+ mi' : `${dist} mi`}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View className="flex-row items-center mt-3">
            <Navigation size={14} color="#A0A8AB" />
            <Text
              className="text-xs text-[#A0A8AB] ml-2"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              Show matches within {maxDistance === 250 ? '250+' : maxDistance} miles
            </Text>
          </View>
        </Animated.View>

        {/* Save Button */}
        <Animated.View entering={FadeInDown.delay(350).duration(600)} className="mb-10">
          <Pressable
            onPress={handleSave}
            disabled={isSaving || !gender || !lookingFor}
            className="active:scale-[0.98]"
          >
            <LinearGradient
              colors={gender && lookingFor ? ['#E07A5F', '#D56A4F'] : ['#D0D5D8', '#C0C5C8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                paddingVertical: 18,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                className="text-white text-lg"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                {isSaving ? 'Saving...' : 'Save Preferences'}
              </Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
