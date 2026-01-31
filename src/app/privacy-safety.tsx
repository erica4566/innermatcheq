import { View, Text, Pressable, Switch, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  UserX,
  Shield,
  ChevronRight,
  AlertTriangle,
  Users,
} from 'lucide-react-native';
import * as Haptics from '@/lib/haptics';
import { useState } from 'react';

interface PrivacySettingProps {
  icon: typeof Lock;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

function PrivacySetting({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  description,
  value,
  onValueChange,
}: PrivacySettingProps) {
  return (
    <View className="flex-row items-center bg-white rounded-2xl p-4 mb-3">
      <View
        className="w-11 h-11 rounded-xl items-center justify-center"
        style={{ backgroundColor: iconBg }}
      >
        <Icon size={20} color={iconColor} />
      </View>
      <View className="flex-1 ml-4 mr-3">
        <Text
          className="text-base text-[#2D3436]"
          style={{ fontFamily: 'Outfit_500Medium' }}
        >
          {title}
        </Text>
        <Text
          className="text-xs text-[#A0A8AB] mt-0.5"
          style={{ fontFamily: 'Outfit_400Regular' }}
        >
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={(val) => {
          Haptics.selectionAsync();
          onValueChange(val);
        }}
        trackColor={{ false: '#D0D5D8', true: '#81B29A' }}
        thumbColor="#FFF"
      />
    </View>
  );
}

function ActionItem({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  description,
  onPress,
  danger = false,
}: {
  icon: typeof Lock;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
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
          className={`text-base ${danger ? 'text-red-500' : 'text-[#2D3436]'}`}
          style={{ fontFamily: 'Outfit_500Medium' }}
        >
          {title}
        </Text>
        <Text
          className="text-xs text-[#A0A8AB] mt-0.5"
          style={{ fontFamily: 'Outfit_400Regular' }}
        >
          {description}
        </Text>
      </View>
      <ChevronRight size={20} color="#D0D5D8" />
    </Pressable>
  );
}

export default function PrivacySafetyScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    showOnlineStatus: true,
    showDistance: true,
    showReadReceipts: true,
    hideFromDiscovery: false,
  });

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleBlockedUsers = () => {
    Alert.alert('Blocked Users', 'You have no blocked users.', [{ text: 'OK' }]);
  };

  const handleReportProblem = () => {
    Alert.alert(
      'Report a Problem',
      'If you encounter any safety concerns or inappropriate behavior, please contact our support team.',
      [{ text: 'OK' }]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deletion', 'Please contact support to complete account deletion.');
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-[#FDF8F5]">
      <Stack.Screen
        options={{
          title: 'Privacy & Safety',
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
        {/* Profile Settings */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)} className="mb-6 mt-4">
          <Text
            className="text-sm text-[#A0A8AB] mb-3"
            style={{ fontFamily: 'Outfit_600SemiBold' }}
          >
            PROFILE SETTINGS
          </Text>

          <ActionItem
            icon={Users}
            iconColor="#E07A5F"
            iconBg="#E07A5F15"
            title="Seeking Preferences"
            description="Change who you're looking for"
            onPress={() => router.push('/seeking-preferences')}
          />
        </Animated.View>

        {/* Privacy Settings */}
        <Animated.View entering={FadeInDown.delay(150).duration(600)} className="mb-6">
          <Text
            className="text-sm text-[#A0A8AB] mb-3"
            style={{ fontFamily: 'Outfit_600SemiBold' }}
          >
            PRIVACY
          </Text>

          <PrivacySetting
            icon={Eye}
            iconColor="#81B29A"
            iconBg="#81B29A15"
            title="Show Online Status"
            description="Let others see when you're online"
            value={settings.showOnlineStatus}
            onValueChange={(val) => updateSetting('showOnlineStatus', val)}
          />

          <PrivacySetting
            icon={MapPin}
            iconColor="#E07A5F"
            iconBg="#E07A5F15"
            title="Show Distance"
            description="Display your distance to other users"
            value={settings.showDistance}
            onValueChange={(val) => updateSetting('showDistance', val)}
          />

          <PrivacySetting
            icon={Eye}
            iconColor="#9333EA"
            iconBg="#9333EA15"
            title="Read Receipts"
            description="Let others know when you've read their messages"
            value={settings.showReadReceipts}
            onValueChange={(val) => updateSetting('showReadReceipts', val)}
          />

          <PrivacySetting
            icon={EyeOff}
            iconColor="#636E72"
            iconBg="#63707215"
            title="Hide from Discovery"
            description="Pause your profile from being shown to others"
            value={settings.hideFromDiscovery}
            onValueChange={(val) => updateSetting('hideFromDiscovery', val)}
          />
        </Animated.View>

        {/* Safety */}
        <Animated.View entering={FadeInDown.delay(250).duration(600)} className="mb-6">
          <Text
            className="text-sm text-[#A0A8AB] mb-3"
            style={{ fontFamily: 'Outfit_600SemiBold' }}
          >
            SAFETY
          </Text>

          <ActionItem
            icon={UserX}
            iconColor="#636E72"
            iconBg="#63707215"
            title="Blocked Users"
            description="Manage users you've blocked"
            onPress={handleBlockedUsers}
          />

          <ActionItem
            icon={Shield}
            iconColor="#E07A5F"
            iconBg="#E07A5F15"
            title="Report a Problem"
            description="Report safety concerns or issues"
            onPress={handleReportProblem}
          />
        </Animated.View>

        {/* Danger Zone */}
        <Animated.View entering={FadeInDown.delay(350).duration(600)} className="mb-10">
          <Text
            className="text-sm text-[#A0A8AB] mb-3"
            style={{ fontFamily: 'Outfit_600SemiBold' }}
          >
            ACCOUNT
          </Text>

          <ActionItem
            icon={AlertTriangle}
            iconColor="#EF4444"
            iconBg="#EF444415"
            title="Delete Account"
            description="Permanently delete your account and data"
            onPress={handleDeleteAccount}
            danger
          />
        </Animated.View>

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
