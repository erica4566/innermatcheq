import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ArrowLeft,
  Bell,
  Lock,
  HelpCircle,
  FileText,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Users,
  Heart,
  Crown,
} from 'lucide-react-native';
import * as Haptics from '@/lib/haptics';
import { useAppStore } from '@/lib/store';
import { signOut as firebaseSignOut } from '@/lib/db';
import { useQueryClient } from '@tanstack/react-query';
import { secureClearAll } from '@/lib/secureStorage';

function SettingsItem({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  onPress,
  showChevron = true,
}: {
  icon: typeof Bell;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
}) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress?.();
      }}
      className="flex-row items-center bg-white rounded-2xl p-4 mb-3 active:scale-[0.98]"
    >
      <View
        className="w-11 h-11 rounded-xl items-center justify-center"
        style={{ backgroundColor: iconBg }}
      >
        <Icon size={20} color={iconColor} />
      </View>
      <View className="flex-1 ml-4">
        <Text
          className="text-base text-[#2D3436]"
          style={{ fontFamily: 'Outfit_500Medium' }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            className="text-xs text-[#A0A8AB] mt-0.5"
            style={{ fontFamily: 'Outfit_400Regular' }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {showChevron && <ChevronRight size={20} color="#D0D5D8" />}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);
  const setOnboarded = useAppStore((s) => s.setOnboarded);
  const queryClient = useQueryClient();
  const isPremium = currentUser?.isPremium ?? false;

  const handleLogout = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              if (__DEV__) {
                console.log('[Settings] Starting sign out...');
              }

              // 1. Clear React Query cache first
              queryClient.clear();

              // 2. Clear SecureStore auth data
              await secureClearAll();

              // 3. Sign out from backend - this triggers the auth subscription
              // which will clear all state properly
              await firebaseSignOut();

              // 4. Clear local Zustand state AFTER backend sign out
              setCurrentUser(null);
              setOnboarded(false);

              // 5. Clear ALL AsyncStorage keys related to auth/user state
              await AsyncStorage.multiRemove([
                'isOnboarded',
                'currentUser',
                'app-storage',
                'remembered_email',
              ]);

              // 6. Navigate to auth screen immediately (no delay needed since state is cleared)
              router.replace('/auth');
            } catch (error) {
              if (__DEV__) {
                console.error('[Settings] Sign out error:', error);
              }
              // Still try to clear state and navigate even on error
              setCurrentUser(null);
              setOnboarded(false);
              try {
                await secureClearAll();
                await AsyncStorage.multiRemove(['isOnboarded', 'currentUser', 'app-storage', 'remembered_email']);
              } catch (e) {
                if (__DEV__) {
                  console.error('[Settings] Storage clear error:', e);
                }
              }
              router.replace('/auth');
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-[#FDF8F5]">
      <Stack.Screen
        options={{
          title: 'Settings',
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
        {/* Account Section */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)} className="mb-6 mt-4">
          <Text
            className="text-sm text-[#A0A8AB] mb-3"
            style={{ fontFamily: 'Outfit_600SemiBold' }}
          >
            ACCOUNT
          </Text>

          {!isPremium && (
            <SettingsItem
              icon={Crown}
              iconColor="#F2CC8F"
              iconBg="#F2CC8F15"
              title="Upgrade to Premium"
              subtitle="Unlock all features"
              onPress={() => router.push('/paywall')}
            />
          )}

          <SettingsItem
            icon={Users}
            iconColor="#E07A5F"
            iconBg="#E07A5F15"
            title="Seeking Preferences"
            subtitle="Change who you're looking for"
            onPress={() => router.push('/seeking-preferences')}
          />

          <SettingsItem
            icon={Heart}
            iconColor="#81B29A"
            iconBg="#81B29A15"
            title="Edit Profile"
            subtitle="Update your photos and bio"
            onPress={() => router.push('/edit-profile')}
          />
        </Animated.View>

        {/* Preferences Section */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)} className="mb-6">
          <Text
            className="text-sm text-[#A0A8AB] mb-3"
            style={{ fontFamily: 'Outfit_600SemiBold' }}
          >
            PREFERENCES
          </Text>

          <SettingsItem
            icon={Bell}
            iconColor="#636E72"
            iconBg="#63707215"
            title="Notifications"
            subtitle="Manage your notification preferences"
            onPress={() => router.push('/notifications-settings')}
          />

          <SettingsItem
            icon={Lock}
            iconColor="#636E72"
            iconBg="#63707215"
            title="Privacy & Safety"
            subtitle="Control your privacy settings"
            onPress={() => router.push('/privacy-safety')}
          />
        </Animated.View>

        {/* Support Section */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)} className="mb-6">
          <Text
            className="text-sm text-[#A0A8AB] mb-3"
            style={{ fontFamily: 'Outfit_600SemiBold' }}
          >
            SUPPORT
          </Text>

          <SettingsItem
            icon={HelpCircle}
            iconColor="#636E72"
            iconBg="#63707215"
            title="Help & Support"
            subtitle="Get help and FAQs"
            onPress={() => router.push('/help-support')}
          />
        </Animated.View>

        {/* Legal Section */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)} className="mb-6">
          <Text
            className="text-sm text-[#A0A8AB] mb-3"
            style={{ fontFamily: 'Outfit_600SemiBold' }}
          >
            LEGAL
          </Text>

          <SettingsItem
            icon={FileText}
            iconColor="#636E72"
            iconBg="#63707215"
            title="Privacy Policy"
            subtitle="How we handle your data"
            onPress={() => router.push('/privacy-policy')}
          />

          <SettingsItem
            icon={ShieldCheck}
            iconColor="#636E72"
            iconBg="#63707215"
            title="Terms of Service"
            subtitle="Our service agreement"
            onPress={() => router.push('/terms')}
          />
        </Animated.View>

        {/* Sign Out */}
        <Animated.View entering={FadeInDown.delay(500).duration(600)} className="mb-10">
          <Pressable
            onPress={handleLogout}
            className="flex-row items-center justify-center bg-white rounded-2xl p-4 active:scale-[0.98]"
          >
            <LogOut size={20} color="#E07A5F" />
            <Text
              className="text-base text-[#E07A5F] ml-2"
              style={{ fontFamily: 'Outfit_500Medium' }}
            >
              Sign Out
            </Text>
          </Pressable>
        </Animated.View>

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
