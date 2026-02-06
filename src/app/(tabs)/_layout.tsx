import React from 'react';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Heart, MessageCircle, User, BookOpen } from 'lucide-react-native';
import * as Haptics from '@/lib/haptics';

// Brand colors
const BRAND = {
  primary: '#D4626A',
  secondary: '#2D7D7B',
  mist: '#94A3B8',
};

function TabBarIcon({ Icon, color, focused }: { Icon: typeof Heart; color: string; focused: boolean }) {
  return (
    <View className="items-center justify-center">
      <View
        className={`p-2 rounded-xl ${focused ? 'bg-primary-muted' : ''}`}
      >
        <Icon
          size={22}
          color={focused ? BRAND.primary : BRAND.mist}
          fill={focused ? BRAND.primary : 'transparent'}
          strokeWidth={focused ? 2 : 1.5}
        />
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: BRAND.primary,
        tabBarInactiveTintColor: BRAND.mist,
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          height: 88,
          paddingTop: 8,
          shadowColor: '#1A1D1F',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.04,
          shadowRadius: 16,
          elevation: 12,
        },
      }}
      screenListeners={{
        tabPress: () => {
          Haptics.selectionAsync();
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon Icon={Heart} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="connections"
        options={{
          title: 'Connections',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon Icon={MessageCircle} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon Icon={BookOpen} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon Icon={User} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
