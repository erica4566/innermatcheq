/**
 * Web-specific Tab Layout
 * Wraps tab content with WebNavigation for consistent header/footer on web
 */

import React from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { Heart, MessageCircle, User, BookOpen } from 'lucide-react-native';
import WebNavigation from '@/components/WebNavigation';
import { BRAND_COLORS } from '@/lib/brand';

// Brand colors
const BRAND = {
  primary: '#D4626A',
  secondary: '#2D7D7B',
  mist: '#94A3B8',
};

const TAB_ITEMS = [
  { name: 'index', label: 'Discover', Icon: Heart, href: '/(tabs)' },
  { name: 'connections', label: 'Connections', Icon: MessageCircle, href: '/(tabs)/connections' },
  { name: 'learn', label: 'Learn', Icon: BookOpen, href: '/(tabs)/learn' },
  { name: 'profile', label: 'Profile', Icon: User, href: '/(tabs)/profile' },
];

function WebTabBar() {
  const pathname = usePathname();
  const router = useRouter();

  const getIsActive = (name: string) => {
    if (name === 'index') {
      return pathname === '/(tabs)' || pathname === '/' || pathname === '';
    }
    return pathname.includes(name);
  };

  return (
    <View className="bg-white border-t border-[#E8E4E0] py-3">
      <View
        style={{ maxWidth: 600, marginHorizontal: 'auto', width: '100%' }}
        className="flex-row justify-around px-6"
      >
        {TAB_ITEMS.map((tab) => {
          const isActive = getIsActive(tab.name);
          return (
            <Pressable
              key={tab.name}
              onPress={() => router.push(tab.href as any)}
              className="items-center px-4 py-2"
            >
              <View
                className={`p-2 rounded-xl mb-1 ${isActive ? 'bg-[#D4626A]/10' : ''}`}
              >
                <tab.Icon
                  size={22}
                  color={isActive ? BRAND.primary : BRAND.mist}
                  fill={isActive ? BRAND.primary : 'transparent'}
                  strokeWidth={isActive ? 2 : 1.5}
                />
              </View>
              <Text
                className={`text-xs ${isActive ? 'text-[#D4626A]' : 'text-[#94A3B8]'}`}
                style={{ fontFamily: isActive ? 'Outfit_600SemiBold' : 'Outfit_400Regular' }}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function WebTabLayout() {
  return (
    <WebNavigation showFooter={false}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: BRAND.primary,
          tabBarInactiveTintColor: BRAND.mist,
          tabBarShowLabel: true,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E8E4E0',
            height: 70,
            paddingTop: 8,
            paddingBottom: 12,
          },
          tabBarLabelStyle: {
            fontFamily: 'Outfit_500Medium',
            fontSize: 11,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Discover',
            tabBarIcon: ({ color, focused }) => (
              <Heart
                size={22}
                color={color}
                fill={focused ? color : 'transparent'}
                strokeWidth={focused ? 2 : 1.5}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="connections"
          options={{
            title: 'Connections',
            tabBarIcon: ({ color, focused }) => (
              <MessageCircle
                size={22}
                color={color}
                fill={focused ? color : 'transparent'}
                strokeWidth={focused ? 2 : 1.5}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="learn"
          options={{
            title: 'Learn',
            tabBarIcon: ({ color, focused }) => (
              <BookOpen
                size={22}
                color={color}
                fill={focused ? color : 'transparent'}
                strokeWidth={focused ? 2 : 1.5}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <User
                size={22}
                color={color}
                fill={focused ? color : 'transparent'}
                strokeWidth={focused ? 2 : 1.5}
              />
            ),
          }}
        />
      </Tabs>
    </WebNavigation>
  );
}
