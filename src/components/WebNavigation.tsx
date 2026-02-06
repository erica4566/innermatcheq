/**
 * WebNavigation - Professional website navigation component
 *
 * Full-featured navigation with:
 * - Responsive header with mobile menu
 * - Active page highlighting
 * - Comprehensive footer with all links
 */

import React, { useState } from 'react';
import { View, Text, Pressable, Linking, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import {
  Heart,
  Menu,
  X,
  ArrowRight,
  Mail,
  ChevronRight,
} from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown, SlideInRight } from 'react-native-reanimated';
import { BRAND_COLORS } from '@/lib/brand';

// Navigation links configuration
const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Why InnerMatch', href: '/why-innermatch' },
  { label: 'Help', href: '/help-support' },
];

const FOOTER_LINKS = {
  product: [
    { label: 'Home', href: '/' },
    { label: 'Why InnerMatchEQ', href: '/why-innermatch' },
    { label: 'Get Started', href: '/auth' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
  support: [
    { label: 'Help Center', href: '/help-support' },
    { label: 'Contact Us', href: 'mailto:innermatcheq@gmail.com' },
  ],
};

interface WebNavigationProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

// Header Component
function WebHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/' || pathname === '';
    return pathname.startsWith(href);
  };

  return (
    <View
      className="bg-white border-b border-[#E8E4E0]"
      style={{
        position: 'sticky' as any,
        top: 0,
        zIndex: 100,
      }}
    >
      <View
        style={{ maxWidth: 1200, marginHorizontal: 'auto', width: '100%' }}
        className="px-6 py-4 flex-row items-center justify-between"
      >
        {/* Logo */}
        <Pressable
          onPress={() => router.push('/')}
          className="flex-row items-center"
        >
          <View className="w-11 h-11 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${BRAND_COLORS.primary}15` }}>
            <Heart size={24} color={BRAND_COLORS.primary} fill={BRAND_COLORS.primary} />
          </View>
          <View>
            <Text
              className="text-xl text-[#2D3436]"
              style={{ fontFamily: 'Cormorant_700Bold' }}
            >
              InnerMatchEQ
            </Text>
            <Text
              className="text-xs text-[#94A3B8]"
              style={{ fontFamily: 'Outfit_400Regular', marginTop: -2 }}
            >
              Discover Yourself
            </Text>
          </View>
        </Pressable>

        {/* Desktop Navigation */}
        <View className="hidden md:flex flex-row items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Pressable
              key={link.href}
              onPress={() => router.push(link.href as any)}
              className="px-4 py-2 rounded-lg"
              style={isActive(link.href) ? { backgroundColor: `${BRAND_COLORS.primary}10` } : {}}
            >
              <Text
                className="text-sm"
                style={{
                  fontFamily: isActive(link.href) ? 'Outfit_600SemiBold' : 'Outfit_500Medium',
                  color: isActive(link.href) ? BRAND_COLORS.primary : '#636E72',
                }}
              >
                {link.label}
              </Text>
            </Pressable>
          ))}

          <View className="w-px h-6 bg-[#E8E4E0] mx-4" />

          <Pressable
            onPress={() => router.push('/auth')}
            className="px-6 py-2.5 rounded-full flex-row items-center"
            style={{ backgroundColor: BRAND_COLORS.primary }}
          >
            <Text
              className="text-white text-sm mr-1"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              Get Started
            </Text>
            <ArrowRight size={16} color="white" />
          </Pressable>
        </View>

        {/* Mobile Menu Button */}
        <Pressable
          onPress={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg"
          style={{ backgroundColor: menuOpen ? `${BRAND_COLORS.primary}10` : 'transparent' }}
        >
          {menuOpen ? (
            <X size={24} color={BRAND_COLORS.primary} />
          ) : (
            <Menu size={24} color="#2D3436" />
          )}
        </Pressable>
      </View>

      {/* Mobile Menu */}
      {menuOpen && (
        <Animated.View
          entering={FadeIn.duration(200)}
          className="md:hidden bg-white border-t border-[#E8E4E0] px-6 py-4"
        >
          {NAV_LINKS.map((link, index) => (
            <Animated.View key={link.href} entering={FadeInDown.delay(index * 50).duration(200)}>
              <Pressable
                onPress={() => {
                  setMenuOpen(false);
                  router.push(link.href as any);
                }}
                className="flex-row items-center justify-between py-4 border-b border-[#F5F0ED]"
              >
                <Text
                  className="text-base"
                  style={{
                    fontFamily: isActive(link.href) ? 'Outfit_600SemiBold' : 'Outfit_500Medium',
                    color: isActive(link.href) ? BRAND_COLORS.primary : '#2D3436',
                  }}
                >
                  {link.label}
                </Text>
                <ChevronRight size={18} color={isActive(link.href) ? BRAND_COLORS.primary : '#94A3B8'} />
              </Pressable>
            </Animated.View>
          ))}

          <Animated.View entering={FadeInDown.delay(NAV_LINKS.length * 50).duration(200)}>
            <Pressable
              onPress={() => {
                setMenuOpen(false);
                router.push('/auth');
              }}
              className="mt-6 py-4 rounded-xl items-center flex-row justify-center"
              style={{ backgroundColor: BRAND_COLORS.primary }}
            >
              <Text
                className="text-white text-base mr-2"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                Get Started Free
              </Text>
              <ArrowRight size={18} color="white" />
            </Pressable>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

// Footer Component
function WebFooter() {
  const router = useRouter();

  const handleLinkPress = (href: string) => {
    if (href.startsWith('mailto:')) {
      Linking.openURL(href);
    } else {
      router.push(href as any);
    }
  };

  return (
    <View className="bg-[#1A1D1F]">
      {/* Main Footer */}
      <View
        style={{ maxWidth: 1200, marginHorizontal: 'auto', width: '100%' }}
        className="px-6 py-16"
      >
        <View className="flex-row flex-wrap justify-between">
          {/* Brand Section */}
          <View className="mb-10 md:mb-0" style={{ maxWidth: 300 }}>
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${BRAND_COLORS.primary}20` }}>
                <Heart size={20} color={BRAND_COLORS.primary} fill={BRAND_COLORS.primary} />
              </View>
              <Text
                className="text-xl text-white"
                style={{ fontFamily: 'Cormorant_700Bold' }}
              >
                InnerMatchEQ
              </Text>
            </View>
            <Text
              className="text-base text-[#94A3B8] leading-6 mb-6"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              Discover yourself. Find meaningful connections based on who you truly are, not just how you look.
            </Text>

            {/* CTA Button */}
            <Pressable
              onPress={() => router.push('/auth')}
              className="flex-row items-center"
            >
              <View className="px-5 py-2.5 rounded-full flex-row items-center" style={{ backgroundColor: BRAND_COLORS.primary }}>
                <Text
                  className="text-white text-sm mr-2"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Start Free
                </Text>
                <ArrowRight size={14} color="white" />
              </View>
            </Pressable>
          </View>

          {/* Links Sections */}
          <View className="flex-row gap-16 flex-wrap">
            {/* Product Links */}
            <View>
              <Text
                className="text-white text-sm mb-5"
                style={{ fontFamily: 'Outfit_700Bold', letterSpacing: 0.5 }}
              >
                PRODUCT
              </Text>
              {FOOTER_LINKS.product.map((link) => (
                <Pressable
                  key={link.href}
                  onPress={() => handleLinkPress(link.href)}
                  className="mb-3"
                >
                  <Text
                    className="text-[#94A3B8] text-sm"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    {link.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Legal Links */}
            <View>
              <Text
                className="text-white text-sm mb-5"
                style={{ fontFamily: 'Outfit_700Bold', letterSpacing: 0.5 }}
              >
                LEGAL
              </Text>
              {FOOTER_LINKS.legal.map((link) => (
                <Pressable
                  key={link.href}
                  onPress={() => handleLinkPress(link.href)}
                  className="mb-3"
                >
                  <Text
                    className="text-[#94A3B8] text-sm"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    {link.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Support Links */}
            <View>
              <Text
                className="text-white text-sm mb-5"
                style={{ fontFamily: 'Outfit_700Bold', letterSpacing: 0.5 }}
              >
                SUPPORT
              </Text>
              {FOOTER_LINKS.support.map((link) => (
                <Pressable
                  key={link.href}
                  onPress={() => handleLinkPress(link.href)}
                  className="mb-3 flex-row items-center"
                >
                  {link.href.startsWith('mailto:') && (
                    <Mail size={14} color="#94A3B8" style={{ marginRight: 6 }} />
                  )}
                  <Text
                    className="text-[#94A3B8] text-sm"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    {link.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Bar */}
      <View className="border-t border-[#2D3436]">
        <View
          style={{ maxWidth: 1200, marginHorizontal: 'auto', width: '100%' }}
          className="px-6 py-6 flex-row flex-wrap items-center justify-between"
        >
          <Text
            className="text-[#636E72] text-sm"
            style={{ fontFamily: 'Outfit_400Regular' }}
          >
            © {new Date().getFullYear()} InnerMatchEQ. All rights reserved.
          </Text>
          <Text
            className="text-[#636E72] text-sm"
            style={{ fontFamily: 'Outfit_400Regular' }}
          >
            Made with ❤️ for meaningful connections
          </Text>
        </View>
      </View>
    </View>
  );
}

// Main WebNavigation wrapper
export default function WebNavigation({ children, showFooter = true }: WebNavigationProps) {
  // Only render navigation wrapper on web
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View className="flex-1 bg-[#FDF8F5]">
      <WebHeader />
      <View className="flex-1">
        {children}
      </View>
      {showFooter && <WebFooter />}
    </View>
  );
}

export { WebHeader, WebFooter };

