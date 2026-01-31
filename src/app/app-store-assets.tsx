/**
 * App Store Assets Generator
 *
 * This screen renders preview mockups that can be used for App Store screenshots.
 * Access via: /app-store-assets in development
 *
 * Screenshot dimensions:
 * - 6.5" iPhone: 1284 x 2778
 * - 6.7" iPhone: 1290 x 2796
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Heart,
  Brain,
  Shield,
  Sparkles,
  MessageCircle,
  Video,
  CheckCircle,
  Crown,
  ChevronRight,
  Star,
  Users,
  Eye,
} from 'lucide-react-native';
import Logo, { AppIconLogo } from '@/components/Logo';
import { BRAND_COLORS, BRAND_GRADIENTS, SHADOWS } from '@/lib/brand';

const { width } = Dimensions.get('window');

type ScreenshotType =
  | 'welcome'
  | 'compatibility'
  | 'redflag'
  | 'chat'
  | 'verification'
  | 'icon';

export default function AppStoreAssets() {
  const [activeScreen, setActiveScreen] = useState<ScreenshotType>('welcome');

  return (
    <View className="flex-1 bg-[#1A1A2E]">
      <SafeAreaView className="flex-1">
        {/* Tab selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="max-h-14"
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {[
            { id: 'welcome', label: '1. Welcome' },
            { id: 'compatibility', label: '2. Compatibility' },
            { id: 'redflag', label: '3. Red Flags' },
            { id: 'chat', label: '4. AI Chat' },
            { id: 'verification', label: '5. Verification' },
            { id: 'icon', label: 'App Icon' },
          ].map((tab) => (
            <Pressable
              key={tab.id}
              onPress={() => setActiveScreen(tab.id as ScreenshotType)}
              className={`px-4 py-2 rounded-full ${
                activeScreen === tab.id ? 'bg-white' : 'bg-white/10'
              }`}
            >
              <Text
                style={{
                  fontFamily: 'Outfit_500Medium',
                  fontSize: 12,
                  color: activeScreen === tab.id ? BRAND_COLORS.ink : '#FFF',
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Screenshot preview */}
        <View className="flex-1 items-center justify-center p-4">
          {activeScreen === 'welcome' && <WelcomeScreenshot />}
          {activeScreen === 'compatibility' && <CompatibilityScreenshot />}
          {activeScreen === 'redflag' && <RedFlagScreenshot />}
          {activeScreen === 'chat' && <ChatScreenshot />}
          {activeScreen === 'verification' && <VerificationScreenshot />}
          {activeScreen === 'icon' && <IconPreview />}
        </View>

        {/* Instructions */}
        <View className="px-6 pb-4">
          <Text
            className="text-white/50 text-xs text-center"
            style={{ fontFamily: 'Outfit_400Regular' }}
          >
            These are mockup previews. Take screenshots in simulator at 1284x2778 for App Store.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

// Screenshot 1: Welcome / Hero
function WelcomeScreenshot() {
  return (
    <View
      className="flex-1 w-full rounded-3xl overflow-hidden"
      style={{ maxWidth: width - 32 }}
    >
      <LinearGradient
        colors={BRAND_GRADIENTS.background}
        style={{ flex: 1, padding: 24 }}
      >
        {/* Headline */}
        <View className="items-center mt-8">
          <Text
            style={{
              fontFamily: 'Outfit_700Bold',
              fontSize: 14,
              color: BRAND_COLORS.primary,
              letterSpacing: 2,
              marginBottom: 8,
            }}
          >
            PSYCHOLOGY-FIRST DATING
          </Text>
          <Text
            style={{
              fontFamily: 'Cormorant_600SemiBold',
              fontSize: 32,
              color: BRAND_COLORS.ink,
              textAlign: 'center',
              lineHeight: 38,
            }}
          >
            Find Your Person,{'\n'}Not Just a Profile
          </Text>
        </View>

        {/* Logo */}
        <View className="flex-1 items-center justify-center">
          <Logo size="xl" showText={false} animated={false} />
        </View>

        {/* Features grid */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          <FeaturePill icon={Brain} label="MBTI Matching" color={BRAND_COLORS.primary} />
          <FeaturePill icon={Sparkles} label="EQ Analysis" color={BRAND_COLORS.secondary} />
          <FeaturePill icon={Shield} label="Red Flag Detection" color={BRAND_COLORS.accent} />
          <FeaturePill icon={Heart} label="Love Languages" color={BRAND_COLORS.primary} />
        </View>

        {/* Stats */}
        <View className="flex-row justify-around py-4 bg-white/60 rounded-2xl">
          <StatItem value="5" label="Assessments" />
          <StatItem value="85%" label="Avg Match Score" />
          <StatItem value="4.8" label="App Rating" />
        </View>
      </LinearGradient>
    </View>
  );
}

// Screenshot 2: Compatibility Analysis
function CompatibilityScreenshot() {
  return (
    <View
      className="flex-1 w-full rounded-3xl overflow-hidden"
      style={{ maxWidth: width - 32 }}
    >
      <LinearGradient
        colors={BRAND_GRADIENTS.background}
        style={{ flex: 1, padding: 24 }}
      >
        <Text
          style={{
            fontFamily: 'Outfit_700Bold',
            fontSize: 14,
            color: BRAND_COLORS.primary,
            letterSpacing: 2,
            textAlign: 'center',
            marginTop: 8,
          }}
        >
          DEEP COMPATIBILITY
        </Text>
        <Text
          style={{
            fontFamily: 'Cormorant_600SemiBold',
            fontSize: 28,
            color: BRAND_COLORS.ink,
            textAlign: 'center',
            marginTop: 8,
          }}
        >
          Know Why You're Compatible
        </Text>

        {/* Match card preview */}
        <View className="flex-1 justify-center">
          <View
            className="bg-white rounded-3xl p-5"
            style={SHADOWS.lg}
          >
            {/* Profile header */}
            <View className="flex-row items-center mb-4">
              <View className="w-16 h-16 rounded-full bg-[#F0E6E0] items-center justify-center">
                <Text style={{ fontSize: 28 }}>S</Text>
              </View>
              <View className="ml-4 flex-1">
                <View className="flex-row items-center">
                  <Text
                    style={{
                      fontFamily: 'Outfit_600SemiBold',
                      fontSize: 20,
                      color: BRAND_COLORS.ink,
                    }}
                  >
                    Sarah, 28
                  </Text>
                  <CheckCircle size={16} color={BRAND_COLORS.success} className="ml-2" />
                </View>
                <Text
                  style={{
                    fontFamily: 'Outfit_400Regular',
                    fontSize: 13,
                    color: BRAND_COLORS.slate,
                  }}
                >
                  ENFJ • Secure Attachment
                </Text>
              </View>
              <View className="items-center">
                <Text
                  style={{
                    fontFamily: 'Outfit_700Bold',
                    fontSize: 28,
                    color: BRAND_COLORS.primary,
                  }}
                >
                  92%
                </Text>
                <Text
                  style={{
                    fontFamily: 'Outfit_400Regular',
                    fontSize: 10,
                    color: BRAND_COLORS.mist,
                  }}
                >
                  Match
                </Text>
              </View>
            </View>

            {/* Compatibility bars */}
            <View className="gap-3">
              <CompatBar label="Attachment" value={95} color={BRAND_COLORS.primary} />
              <CompatBar label="Personality" value={88} color={BRAND_COLORS.secondary} />
              <CompatBar label="Love Language" value={91} color={BRAND_COLORS.accent} />
              <CompatBar label="Values" value={85} color={BRAND_COLORS.success} />
              <CompatBar label="Lifestyle" value={92} color={BRAND_COLORS.primary} />
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

// Screenshot 3: Red Flag Detection
function RedFlagScreenshot() {
  return (
    <View
      className="flex-1 w-full rounded-3xl overflow-hidden"
      style={{ maxWidth: width - 32 }}
    >
      <LinearGradient
        colors={['#1A1A2E', '#2D2D44']}
        style={{ flex: 1, padding: 24 }}
      >
        <Text
          style={{
            fontFamily: 'Outfit_700Bold',
            fontSize: 14,
            color: BRAND_COLORS.accent,
            letterSpacing: 2,
            textAlign: 'center',
            marginTop: 8,
          }}
        >
          STAY SAFE
        </Text>
        <Text
          style={{
            fontFamily: 'Cormorant_600SemiBold',
            fontSize: 28,
            color: '#FFF',
            textAlign: 'center',
            marginTop: 8,
          }}
        >
          AI Red Flag Detection
        </Text>

        <View className="flex-1 justify-center">
          {/* Red flag card */}
          <View className="bg-white/10 rounded-3xl p-5 border border-white/10">
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 rounded-full bg-[#34A77F]/20 items-center justify-center">
                <Shield size={24} color="#34A77F" />
              </View>
              <View className="ml-3">
                <Text
                  style={{
                    fontFamily: 'Outfit_600SemiBold',
                    fontSize: 16,
                    color: '#FFF',
                  }}
                >
                  Low Risk Profile
                </Text>
                <Text
                  style={{
                    fontFamily: 'Outfit_400Regular',
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.6)',
                  }}
                >
                  Based on psychological analysis
                </Text>
              </View>
            </View>

            <View className="gap-3">
              <RiskBar label="Emotional Availability" value={85} good />
              <RiskBar label="Behavioral Consistency" value={90} good />
              <RiskBar label="Self-Focus Level" value={25} good />
              <RiskBar label="Manipulation Risk" value={10} good />
            </View>

            {/* Green flags */}
            <View className="mt-4 p-3 bg-[#34A77F]/10 rounded-xl">
              <Text
                style={{
                  fontFamily: 'Outfit_500Medium',
                  fontSize: 12,
                  color: '#34A77F',
                  marginBottom: 6,
                }}
              >
                Green Flags Detected:
              </Text>
              <Text
                style={{
                  fontFamily: 'Outfit_400Regular',
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.7)',
                  lineHeight: 16,
                }}
              >
                • High emotional availability{'\n'}
                • Consistent communication patterns{'\n'}
                • Healthy self-awareness
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

// Screenshot 4: AI Chat Coach
function ChatScreenshot() {
  return (
    <View
      className="flex-1 w-full rounded-3xl overflow-hidden"
      style={{ maxWidth: width - 32 }}
    >
      <LinearGradient
        colors={BRAND_GRADIENTS.background}
        style={{ flex: 1, padding: 24 }}
      >
        <Text
          style={{
            fontFamily: 'Outfit_700Bold',
            fontSize: 14,
            color: BRAND_COLORS.secondary,
            letterSpacing: 2,
            textAlign: 'center',
            marginTop: 8,
          }}
        >
          AI-POWERED
        </Text>
        <Text
          style={{
            fontFamily: 'Cormorant_600SemiBold',
            fontSize: 28,
            color: BRAND_COLORS.ink,
            textAlign: 'center',
            marginTop: 8,
          }}
        >
          Smart Conversation Tips
        </Text>

        <View className="flex-1 justify-center">
          {/* Chat preview */}
          <View className="bg-white rounded-3xl p-4" style={SHADOWS.lg}>
            {/* Chat header */}
            <View className="flex-row items-center pb-3 border-b border-gray-100 mb-3">
              <View className="w-10 h-10 rounded-full bg-[#F0E6E0] items-center justify-center">
                <Text>E</Text>
              </View>
              <View className="ml-3">
                <Text style={{ fontFamily: 'Outfit_600SemiBold', fontSize: 14 }}>
                  Emma
                </Text>
                <Text
                  style={{
                    fontFamily: 'Outfit_400Regular',
                    fontSize: 11,
                    color: BRAND_COLORS.mist,
                  }}
                >
                  ENFP • Words of Affirmation
                </Text>
              </View>
            </View>

            {/* Messages */}
            <View className="gap-2 mb-3">
              <View className="self-start bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-2 max-w-[75%]">
                <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 13 }}>
                  I love exploring new coffee shops on weekends!
                </Text>
              </View>
            </View>

            {/* AI suggestions */}
            <View className="bg-[#2D7D7B]/10 rounded-2xl p-3">
              <View className="flex-row items-center mb-2">
                <Sparkles size={14} color={BRAND_COLORS.secondary} />
                <Text
                  style={{
                    fontFamily: 'Outfit_500Medium',
                    fontSize: 11,
                    color: BRAND_COLORS.secondary,
                    marginLeft: 6,
                  }}
                >
                  AI Suggestion (based on her love language)
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: 'Outfit_400Regular',
                  fontSize: 13,
                  color: BRAND_COLORS.ink,
                  lineHeight: 18,
                }}
              >
                "I'd love to hear more about your favorite spots! Your enthusiasm for
                discovering new places is really refreshing."
              </Text>
              <Pressable className="mt-2 bg-[#2D7D7B] rounded-lg py-2 px-3 self-start">
                <Text
                  style={{
                    fontFamily: 'Outfit_500Medium',
                    fontSize: 11,
                    color: '#FFF',
                  }}
                >
                  Use This Message
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

// Screenshot 5: Verification
function VerificationScreenshot() {
  return (
    <View
      className="flex-1 w-full rounded-3xl overflow-hidden"
      style={{ maxWidth: width - 32 }}
    >
      <LinearGradient
        colors={BRAND_GRADIENTS.background}
        style={{ flex: 1, padding: 24 }}
      >
        <Text
          style={{
            fontFamily: 'Outfit_700Bold',
            fontSize: 14,
            color: BRAND_COLORS.success,
            letterSpacing: 2,
            textAlign: 'center',
            marginTop: 8,
          }}
        >
          TRUST & SAFETY
        </Text>
        <Text
          style={{
            fontFamily: 'Cormorant_600SemiBold',
            fontSize: 28,
            color: BRAND_COLORS.ink,
            textAlign: 'center',
            marginTop: 8,
          }}
        >
          4-Tier Verification
        </Text>

        <View className="flex-1 justify-center gap-3">
          <VerificationCard
            icon={Eye}
            title="Photo Verification"
            subtitle="Selfie matching"
            badge="Blue"
            badgeColor="#3B82F6"
            done
          />
          <VerificationCard
            icon={CheckCircle}
            title="ID Verification"
            subtitle="Government ID check"
            badge="Purple"
            badgeColor="#8B5CF6"
            done
          />
          <VerificationCard
            icon={Shield}
            title="Background Check"
            subtitle="Criminal records search"
            badge="Green"
            badgeColor="#10B981"
          />
          <VerificationCard
            icon={Crown}
            title="Credit Check"
            subtitle="Financial responsibility"
            badge="Gold"
            badgeColor="#F59E0B"
          />
        </View>

        {/* Trust score */}
        <View className="bg-white rounded-2xl p-4 flex-row items-center" style={SHADOWS.md}>
          <View className="w-14 h-14 rounded-full bg-[#10B981]/10 items-center justify-center">
            <Text
              style={{
                fontFamily: 'Outfit_700Bold',
                fontSize: 18,
                color: '#10B981',
              }}
            >
              75%
            </Text>
          </View>
          <View className="ml-4">
            <Text style={{ fontFamily: 'Outfit_600SemiBold', fontSize: 14 }}>
              Trust Score
            </Text>
            <Text
              style={{
                fontFamily: 'Outfit_400Regular',
                fontSize: 11,
                color: BRAND_COLORS.mist,
              }}
            >
              Verified users get 3x more matches
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

// App Icon Preview
function IconPreview() {
  return (
    <View className="items-center justify-center">
      <Text
        style={{
          fontFamily: 'Outfit_600SemiBold',
          fontSize: 14,
          color: '#FFF',
          marginBottom: 16,
        }}
      >
        App Icon Design (1024x1024)
      </Text>
      <View
        style={{
          width: 200,
          height: 200,
          borderRadius: 40,
          overflow: 'hidden',
          ...SHADOWS.xl,
        }}
      >
        <AppIconLogo size={200} />
      </View>
      <Text
        style={{
          fontFamily: 'Outfit_400Regular',
          fontSize: 12,
          color: 'rgba(255,255,255,0.5)',
          marginTop: 16,
          textAlign: 'center',
        }}
      >
        Export at 1024x1024 PNG{'\n'}No transparency, no rounded corners
      </Text>
    </View>
  );
}

// Helper components
function FeaturePill({
  icon: Icon,
  label,
  color,
}: {
  icon: typeof Brain;
  label: string;
  color: string;
}) {
  return (
    <View
      className="flex-row items-center px-3 py-2 rounded-full"
      style={{ backgroundColor: `${color}15` }}
    >
      <Icon size={14} color={color} />
      <Text
        style={{
          fontFamily: 'Outfit_500Medium',
          fontSize: 11,
          color,
          marginLeft: 6,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <View className="items-center">
      <Text
        style={{
          fontFamily: 'Outfit_700Bold',
          fontSize: 22,
          color: BRAND_COLORS.ink,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontFamily: 'Outfit_400Regular',
          fontSize: 10,
          color: BRAND_COLORS.mist,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function CompatBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View>
      <View className="flex-row justify-between mb-1">
        <Text
          style={{
            fontFamily: 'Outfit_500Medium',
            fontSize: 12,
            color: BRAND_COLORS.slate,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            fontFamily: 'Outfit_600SemiBold',
            fontSize: 12,
            color,
          }}
        >
          {value}%
        </Text>
      </View>
      <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <View
          style={{
            width: `${value}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: 4,
          }}
        />
      </View>
    </View>
  );
}

function RiskBar({
  label,
  value,
  good,
}: {
  label: string;
  value: number;
  good: boolean;
}) {
  const color = good ? '#34A77F' : '#DC4A5A';
  return (
    <View>
      <View className="flex-row justify-between mb-1">
        <Text
          style={{
            fontFamily: 'Outfit_500Medium',
            fontSize: 11,
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            fontFamily: 'Outfit_600SemiBold',
            fontSize: 11,
            color,
          }}
        >
          {value}%
        </Text>
      </View>
      <View className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <View
          style={{
            width: `${value}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: 4,
          }}
        />
      </View>
    </View>
  );
}

function VerificationCard({
  icon: Icon,
  title,
  subtitle,
  badge,
  badgeColor,
  done,
}: {
  icon: typeof Shield;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  done?: boolean;
}) {
  return (
    <View
      className="bg-white rounded-2xl p-4 flex-row items-center"
      style={SHADOWS.sm}
    >
      <View
        className="w-12 h-12 rounded-xl items-center justify-center"
        style={{ backgroundColor: `${badgeColor}15` }}
      >
        <Icon size={22} color={badgeColor} />
      </View>
      <View className="flex-1 ml-3">
        <Text style={{ fontFamily: 'Outfit_600SemiBold', fontSize: 14 }}>{title}</Text>
        <Text
          style={{
            fontFamily: 'Outfit_400Regular',
            fontSize: 11,
            color: BRAND_COLORS.mist,
          }}
        >
          {subtitle}
        </Text>
      </View>
      {done ? (
        <View
          className="w-6 h-6 rounded-full items-center justify-center"
          style={{ backgroundColor: badgeColor }}
        >
          <CheckCircle size={14} color="#FFF" />
        </View>
      ) : (
        <ChevronRight size={18} color={BRAND_COLORS.mist} />
      )}
    </View>
  );
}
