/**
 * Web-specific Help & Support Page
 * Professional layout with consistent website navigation
 */

import { View, Text, Pressable, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  HelpCircle,
  Mail,
  Shield,
  ChevronRight,
  Heart,
  BookOpen,
  MessageCircle,
} from 'lucide-react-native';
import WebNavigation from '@/components/WebNavigation';
import { BRAND_COLORS } from '@/lib/brand';

function HelpItem({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  description,
  onPress,
}: {
  icon: typeof HelpCircle;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center bg-white rounded-2xl p-5 mb-4 active:scale-[0.98]"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
      }}
    >
      <View
        className="w-14 h-14 rounded-xl items-center justify-center"
        style={{ backgroundColor: iconBg }}
      >
        <Icon size={24} color={iconColor} />
      </View>
      <View className="flex-1 ml-5">
        <Text
          className="text-lg text-[#2D3436]"
          style={{ fontFamily: 'Outfit_500Medium' }}
        >
          {title}
        </Text>
        <Text
          className="text-sm text-[#636E72] mt-1"
          style={{ fontFamily: 'Outfit_400Regular' }}
        >
          {description}
        </Text>
      </View>
      <ChevronRight size={20} color="#D0D5D8" />
    </Pressable>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <View
      className="bg-white rounded-2xl p-5 mb-4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
      }}
    >
      <Text
        className="text-lg text-[#2D3436] mb-2"
        style={{ fontFamily: 'Outfit_600SemiBold' }}
      >
        {question}
      </Text>
      <Text
        className="text-base text-[#636E72] leading-6"
        style={{ fontFamily: 'Outfit_400Regular' }}
      >
        {answer}
      </Text>
    </View>
  );
}

export default function HelpSupportWebScreen() {
  const router = useRouter();

  const handleContactSupport = () => {
    Linking.openURL('mailto:innermatcheq@gmail.com?subject=Help%20Request');
  };

  const handleCommunityGuidelines = () => {
    router.push('/terms');
  };

  const handleSafetyTips = () => {
    router.push('/privacy-policy');
  };

  return (
    <WebNavigation>
      <ScrollView className="flex-1 bg-[#FDF8F5]" showsVerticalScrollIndicator={false}>
        {/* Hero Header */}
        <View className="bg-white py-16 px-6 border-b border-[#E8E4E0]">
          <View style={{ maxWidth: 800, marginHorizontal: 'auto', width: '100%' }} className="items-center">
            <Animated.View entering={FadeInDown.delay(50).duration(500)} className="items-center">
              <View className="w-20 h-20 rounded-full bg-[#D4626A]/10 items-center justify-center mb-4">
                <MessageCircle size={36} color={BRAND_COLORS.primary} />
              </View>
              <Text
                className="text-4xl text-[#1A1D1F] mb-3 text-center"
                style={{ fontFamily: 'Cormorant_700Bold' }}
              >
                Help & Support
              </Text>
              <Text
                className="text-lg text-[#636E72] text-center"
                style={{ fontFamily: 'Outfit_400Regular', maxWidth: 500 }}
              >
                We're here to help you navigate your journey to meaningful connections.
              </Text>
            </Animated.View>
          </View>
        </View>

        {/* Content */}
        <View style={{ maxWidth: 800, marginHorizontal: 'auto', width: '100%' }} className="px-6 py-12">
          {/* Quick Actions */}
          <Animated.View entering={FadeInDown.delay(100).duration(600)} className="mb-10">
            <Text
              className="text-sm text-[#A0A8AB] mb-4"
              style={{ fontFamily: 'Outfit_600SemiBold', letterSpacing: 1 }}
            >
              GET HELP
            </Text>

            <HelpItem
              icon={Mail}
              iconColor="#D4626A"
              iconBg="#D4626A15"
              title="Contact Support"
              description="Email our support team directly for personalized assistance"
              onPress={handleContactSupport}
            />

            <HelpItem
              icon={Shield}
              iconColor="#81B29A"
              iconBg="#81B29A15"
              title="Safety Tips"
              description="Learn how to stay safe while dating online"
              onPress={handleSafetyTips}
            />

            <HelpItem
              icon={BookOpen}
              iconColor="#9333EA"
              iconBg="#9333EA15"
              title="Community Guidelines"
              description="Read our community standards and expectations"
              onPress={handleCommunityGuidelines}
            />
          </Animated.View>

          {/* FAQs */}
          <Animated.View entering={FadeInDown.delay(200).duration(600)} className="mb-10">
            <Text
              className="text-sm text-[#A0A8AB] mb-4"
              style={{ fontFamily: 'Outfit_600SemiBold', letterSpacing: 1 }}
            >
              FREQUENTLY ASKED QUESTIONS
            </Text>

            <FAQItem
              question="How does the compatibility score work?"
              answer="Our compatibility score is based on psychological assessments including attachment style, MBTI personality, love languages, and shared values. The higher the score, the better your potential compatibility."
            />

            <FAQItem
              question="What is the verification process?"
              answer="You can verify your profile through photo verification (selfie match), ID verification, background check, or credit check. Each level adds more trust badges to your profile."
            />

            <FAQItem
              question="How do I cancel my subscription?"
              answer="You can manage your subscription through your device's app store settings. Go to Settings > [Your Name] > Subscriptions on iOS, or Google Play Store > Menu > Subscriptions on Android."
            />

            <FAQItem
              question="How do I report inappropriate behavior?"
              answer="You can report users by tapping the three dots on their profile and selecting 'Report'. Our team reviews all reports within 24 hours."
            />

            <FAQItem
              question="Can I change my seeking preferences?"
              answer="Yes! Go to Settings on your profile and you can update your gender and who you're looking for at any time."
            />

            <FAQItem
              question="Is my data secure?"
              answer="Yes, we take security seriously. All data is encrypted in transit and at rest. Your psychological assessment data is stored separately from your personal information for additional privacy."
            />
          </Animated.View>

          {/* App Info */}
          <Animated.View entering={FadeInDown.delay(300).duration(600)} className="mb-10">
            <View
              className="items-center py-10 bg-white rounded-2xl"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 16,
              }}
            >
              <View className="w-20 h-20 rounded-full bg-[#D4626A]/10 items-center justify-center mb-4">
                <Heart size={36} color={BRAND_COLORS.primary} fill={BRAND_COLORS.primary} />
              </View>
              <Text
                className="text-2xl text-[#2D3436]"
                style={{ fontFamily: 'Cormorant_700Bold' }}
              >
                InnerMatchEQ
              </Text>
              <Text
                className="text-sm text-[#A0A8AB] mt-2"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                Version 1.0.0
              </Text>
              <Text
                className="text-base text-[#636E72] mt-4 text-center px-6"
                style={{ fontFamily: 'Outfit_400Regular', maxWidth: 400 }}
              >
                Discover yourself. Find meaningful connections based on who you truly are.
              </Text>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </WebNavigation>
  );
}
