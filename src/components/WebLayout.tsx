/**
 * Professional Web Layout Component
 *
 * Wraps the app content with a professional navigation header and footer on web.
 * On mobile, it renders children directly without the wrapper.
 */

import React from 'react';
import { View, Text, Pressable, Platform, ScrollView, Linking } from 'react-native';
import { Heart, Menu, X, Download, Sparkles, Shield, Users } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { BRAND_COLORS } from '@/lib/brand';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

interface WebLayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
}

// Navigation header for web
function WebHeader() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'About', href: '#about' },
  ];

  return (
    <View className="bg-white/95 border-b border-[#F0E6E0]" style={{ backdropFilter: 'blur(10px)' }}>
      <View className="max-w-[1200px] mx-auto px-6 py-4 flex-row items-center justify-between">
        {/* Logo */}
        <Pressable
          onPress={() => router.push('/')}
          className="flex-row items-center"
        >
          <View className="w-10 h-10 rounded-full bg-[#D4626A]/10 items-center justify-center mr-3">
            <Heart size={22} color={BRAND_COLORS.primary} fill={BRAND_COLORS.primary} />
          </View>
          <Text
            className="text-xl text-[#2D3436]"
            style={{ fontFamily: 'Cormorant_600SemiBold' }}
          >
            InnerMatchEQ
          </Text>
        </Pressable>

        {/* Desktop Navigation */}
        <View className="hidden md:flex flex-row items-center gap-8">
          {navItems.map((item) => (
            <Pressable key={item.label} onPress={() => {}}>
              <Text
                className="text-[#636E72] text-sm hover:text-[#D4626A]"
                style={{ fontFamily: 'Outfit_500Medium' }}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}

          <Pressable
            onPress={() => router.push('/auth')}
            className="bg-[#D4626A] px-5 py-2.5 rounded-full"
          >
            <Text
              className="text-white text-sm"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              Get Started
            </Text>
          </Pressable>
        </View>

        {/* Mobile Menu Button */}
        <Pressable
          onPress={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2"
        >
          {menuOpen ? (
            <X size={24} color="#2D3436" />
          ) : (
            <Menu size={24} color="#2D3436" />
          )}
        </Pressable>
      </View>

      {/* Mobile Menu */}
      {menuOpen && (
        <View className="md:hidden bg-white border-t border-[#F0E6E0] px-6 py-4">
          {navItems.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => setMenuOpen(false)}
              className="py-3"
            >
              <Text
                className="text-[#636E72] text-base"
                style={{ fontFamily: 'Outfit_500Medium' }}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
          <Pressable
            onPress={() => {
              setMenuOpen(false);
              router.push('/auth');
            }}
            className="bg-[#D4626A] px-5 py-3 rounded-full mt-4 items-center"
          >
            <Text
              className="text-white text-base"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              Get Started
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// Hero section for web landing
function WebHero() {
  const router = useRouter();

  return (
    <View className="bg-gradient-to-b from-[#FDF8F5] to-white py-16 md:py-24 px-6">
      <View className="max-w-[1000px] mx-auto items-center">
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Text
            className="text-4xl md:text-5xl lg:text-6xl text-[#2D3436] text-center mb-6"
            style={{ fontFamily: 'Cormorant_600SemiBold', lineHeight: 1.2 }}
          >
            Discover Yourself.{'\n'}Find Your Match.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Text
            className="text-lg md:text-xl text-[#636E72] text-center mb-8 max-w-[600px]"
            style={{ fontFamily: 'Outfit_400Regular' }}
          >
            A relationship app that goes deeper than looks. Understand your attachment style,
            love languages, and emotional intelligence to find truly compatible connections.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(300).springify()}
          className="flex-row items-center gap-4 flex-wrap justify-center"
        >
          <Pressable
            onPress={() => router.push('/auth')}
            className="bg-[#D4626A] px-8 py-4 rounded-full"
            style={{
              shadowColor: BRAND_COLORS.primary,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
            }}
          >
            <Text
              className="text-white text-lg"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              Start Free Assessment
            </Text>
          </Pressable>

          <View className="flex-row items-center">
            <Download size={20} color="#636E72" />
            <Text
              className="text-[#636E72] text-sm ml-2"
              style={{ fontFamily: 'Outfit_500Medium' }}
            >
              Download iOS App
            </Text>
          </View>
        </Animated.View>

        {/* Trust indicators */}
        <Animated.View
          entering={FadeIn.delay(500)}
          className="flex-row items-center justify-center gap-6 mt-12 flex-wrap"
        >
          <View className="flex-row items-center">
            <Shield size={16} color={BRAND_COLORS.secondary} />
            <Text
              className="text-[#636E72] text-sm ml-2"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              Privacy First
            </Text>
          </View>
          <View className="flex-row items-center">
            <Sparkles size={16} color={BRAND_COLORS.accent} />
            <Text
              className="text-[#636E72] text-sm ml-2"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              AI-Powered Insights
            </Text>
          </View>
          <View className="flex-row items-center">
            <Users size={16} color={BRAND_COLORS.primary} />
            <Text
              className="text-[#636E72] text-sm ml-2"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              Meaningful Matches
            </Text>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

// Features section
function WebFeatures() {
  const features = [
    {
      icon: <Heart size={28} color={BRAND_COLORS.primary} />,
      title: 'Attachment Style',
      description: 'Discover your attachment pattern and understand how you connect in relationships.',
    },
    {
      icon: <Sparkles size={28} color={BRAND_COLORS.accent} />,
      title: 'MBTI Compatibility',
      description: 'Find partners whose personality types complement yours for deeper understanding.',
    },
    {
      icon: <Users size={28} color={BRAND_COLORS.secondary} />,
      title: 'Love Languages',
      description: 'Learn how you give and receive love to build stronger emotional bonds.',
    },
  ];

  return (
    <View className="bg-white py-16 md:py-24 px-6" id="features">
      <View className="max-w-[1000px] mx-auto">
        <Text
          className="text-3xl md:text-4xl text-[#2D3436] text-center mb-4"
          style={{ fontFamily: 'Cormorant_600SemiBold' }}
        >
          Science-Backed Matching
        </Text>
        <Text
          className="text-lg text-[#636E72] text-center mb-12 max-w-[500px] mx-auto"
          style={{ fontFamily: 'Outfit_400Regular' }}
        >
          Our assessments are based on decades of relationship psychology research.
        </Text>

        <View className="flex-row flex-wrap justify-center gap-8">
          {features.map((feature, index) => (
            <Animated.View
              key={feature.title}
              entering={FadeInUp.delay(index * 100 + 200).springify()}
              className="bg-[#FDF8F5] rounded-2xl p-6 w-full md:w-[280px]"
            >
              <View className="w-14 h-14 rounded-full bg-white items-center justify-center mb-4">
                {feature.icon}
              </View>
              <Text
                className="text-xl text-[#2D3436] mb-2"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                {feature.title}
              </Text>
              <Text
                className="text-[#636E72]"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                {feature.description}
              </Text>
            </Animated.View>
          ))}
        </View>
      </View>
    </View>
  );
}

// Footer
function WebFooter() {
  const router = useRouter();

  return (
    <View className="bg-[#1A1D1F] py-12 px-6">
      <View className="max-w-[1000px] mx-auto">
        <View className="flex-row flex-wrap justify-between mb-8">
          {/* Logo & tagline */}
          <View className="mb-8 md:mb-0">
            <View className="flex-row items-center mb-3">
              <Heart size={20} color={BRAND_COLORS.primary} fill={BRAND_COLORS.primary} />
              <Text
                className="text-white text-lg ml-2"
                style={{ fontFamily: 'Cormorant_600SemiBold' }}
              >
                InnerMatchEQ
              </Text>
            </View>
            <Text
              className="text-[#94A3B8] text-sm max-w-[250px]"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              Discover yourself. Find meaningful connections based on who you truly are.
            </Text>
          </View>

          {/* Links */}
          <View className="flex-row gap-12">
            <View>
              <Text
                className="text-white text-sm mb-4"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                Legal
              </Text>
              <Pressable onPress={() => router.push('/privacy-policy')} className="mb-2">
                <Text
                  className="text-[#94A3B8] text-sm"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  Privacy Policy
                </Text>
              </Pressable>
              <Pressable onPress={() => router.push('/terms')} className="mb-2">
                <Text
                  className="text-[#94A3B8] text-sm"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  Terms of Service
                </Text>
              </Pressable>
            </View>
            <View>
              <Text
                className="text-white text-sm mb-4"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                Support
              </Text>
              <Pressable onPress={() => router.push('/help-support')} className="mb-2">
                <Text
                  className="text-[#94A3B8] text-sm"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  Help Center
                </Text>
              </Pressable>
              <Pressable onPress={() => Linking.openURL('mailto:support@innermatcheq.com')} className="mb-2">
                <Text
                  className="text-[#94A3B8] text-sm"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  Contact Us
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View className="border-t border-[#2D3436] pt-6">
          <Text
            className="text-[#636E72] text-sm text-center"
            style={{ fontFamily: 'Outfit_400Regular' }}
          >
            © {new Date().getFullYear()} InnerMatchEQ. All rights reserved.
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function WebLayout({ children, showNavigation = true }: WebLayoutProps) {
  // On mobile, render children directly
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  // On web, wrap with professional layout
  return (
    <View className="flex-1 bg-[#FDF8F5]">
      {showNavigation && <WebHeader />}
      <View className="flex-1">
        {children}
      </View>
      {showNavigation && <WebFooter />}
    </View>
  );
}

// Export individual components for flexible use
export { WebHeader, WebHero, WebFeatures, WebFooter };
