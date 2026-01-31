import { View, Text, Pressable, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, Bell, Heart, MessageCircle, Star, Shield, Calendar } from 'lucide-react-native';
import * as Haptics from '@/lib/haptics';
import { useState } from 'react';

interface NotificationSettingProps {
  icon: typeof Bell;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

function NotificationSetting({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  description,
  value,
  onValueChange,
}: NotificationSettingProps) {
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

export default function NotificationsSettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    newMatches: true,
    messages: true,
    likes: true,
    superLikes: true,
    profileViews: false,
    videoDates: true,
    promotions: false,
  });

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <View className="flex-1 bg-[#FDF8F5]">
      <Stack.Screen
        options={{
          title: 'Notifications',
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
        {/* Push Notifications */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)} className="mb-6 mt-4">
          <Text
            className="text-sm text-[#A0A8AB] mb-3"
            style={{ fontFamily: 'Outfit_600SemiBold' }}
          >
            PUSH NOTIFICATIONS
          </Text>

          <NotificationSetting
            icon={Heart}
            iconColor="#E07A5F"
            iconBg="#E07A5F15"
            title="New Matches"
            description="Get notified when someone likes you back"
            value={settings.newMatches}
            onValueChange={(val) => updateSetting('newMatches', val)}
          />

          <NotificationSetting
            icon={MessageCircle}
            iconColor="#81B29A"
            iconBg="#81B29A15"
            title="Messages"
            description="Get notified when you receive new messages"
            value={settings.messages}
            onValueChange={(val) => updateSetting('messages', val)}
          />

          <NotificationSetting
            icon={Heart}
            iconColor="#F2CC8F"
            iconBg="#F2CC8F20"
            title="Likes"
            description="Get notified when someone likes your profile"
            value={settings.likes}
            onValueChange={(val) => updateSetting('likes', val)}
          />

          <NotificationSetting
            icon={Star}
            iconColor="#9333EA"
            iconBg="#9333EA15"
            title="Super Likes"
            description="Get notified when someone super likes you"
            value={settings.superLikes}
            onValueChange={(val) => updateSetting('superLikes', val)}
          />
        </Animated.View>

        {/* Activity Notifications */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)} className="mb-6">
          <Text
            className="text-sm text-[#A0A8AB] mb-3"
            style={{ fontFamily: 'Outfit_600SemiBold' }}
          >
            ACTIVITY
          </Text>

          <NotificationSetting
            icon={Shield}
            iconColor="#636E72"
            iconBg="#63707215"
            title="Profile Views"
            description="Get notified when someone views your profile"
            value={settings.profileViews}
            onValueChange={(val) => updateSetting('profileViews', val)}
          />

          <NotificationSetting
            icon={Calendar}
            iconColor="#10B981"
            iconBg="#10B98115"
            title="Video Dates"
            description="Reminders for upcoming video dates"
            value={settings.videoDates}
            onValueChange={(val) => updateSetting('videoDates', val)}
          />
        </Animated.View>

        {/* Marketing */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)} className="mb-10">
          <Text
            className="text-sm text-[#A0A8AB] mb-3"
            style={{ fontFamily: 'Outfit_600SemiBold' }}
          >
            MARKETING
          </Text>

          <NotificationSetting
            icon={Bell}
            iconColor="#636E72"
            iconBg="#63707215"
            title="Promotions & Tips"
            description="Receive special offers and dating tips"
            value={settings.promotions}
            onValueChange={(val) => updateSetting('promotions', val)}
          />
        </Animated.View>

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
