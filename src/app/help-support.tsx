import { View, Text, Pressable, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  ArrowLeft,
  HelpCircle,
  MessageCircle,
  Mail,
  FileText,
  Shield,
  ChevronRight,
  ExternalLink,
  Heart,
  BookOpen,
} from 'lucide-react-native';
import * as Haptics from '@/lib/haptics';

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
      <ChevronRight size={20} color="#D0D5D8" />
    </Pressable>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <View className="bg-white rounded-2xl p-4 mb-3">
      <Text
        className="text-base text-[#2D3436] mb-2"
        style={{ fontFamily: 'Outfit_500Medium' }}
      >
        {question}
      </Text>
      <Text
        className="text-sm text-[#636E72]"
        style={{ fontFamily: 'Outfit_400Regular' }}
      >
        {answer}
      </Text>
    </View>
  );
}

export default function HelpSupportScreen() {
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
    <View className="flex-1 bg-[#FDF8F5]">
      <Stack.Screen
        options={{
          title: 'Help & Support',
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
        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)} className="mb-6 mt-4">
          <Text
            className="text-sm text-[#A0A8AB] mb-3"
            style={{ fontFamily: 'Outfit_600SemiBold' }}
          >
            GET HELP
          </Text>

          <HelpItem
            icon={Mail}
            iconColor="#E07A5F"
            iconBg="#E07A5F15"
            title="Contact Support"
            description="Email our support team directly"
            onPress={handleContactSupport}
          />

          <HelpItem
            icon={Shield}
            iconColor="#81B29A"
            iconBg="#81B29A15"
            title="Safety Tips"
            description="Learn how to stay safe while dating"
            onPress={handleSafetyTips}
          />

          <HelpItem
            icon={BookOpen}
            iconColor="#9333EA"
            iconBg="#9333EA15"
            title="Community Guidelines"
            description="Read our community standards"
            onPress={handleCommunityGuidelines}
          />
        </Animated.View>

        {/* FAQs */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)} className="mb-6">
          <Text
            className="text-sm text-[#A0A8AB] mb-3"
            style={{ fontFamily: 'Outfit_600SemiBold' }}
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
        </Animated.View>

        {/* App Info */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)} className="mb-10">
          <View className="items-center py-6">
            <View className="w-16 h-16 rounded-full bg-[#E07A5F]/10 items-center justify-center mb-3">
              <Heart size={28} color="#E07A5F" />
            </View>
            <Text
              className="text-lg text-[#2D3436]"
              style={{ fontFamily: 'Cormorant_600SemiBold' }}
            >
              InnerMatchEQ
            </Text>
            <Text
              className="text-sm text-[#A0A8AB] mt-1"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              Version 1.0.0
            </Text>
          </View>
        </Animated.View>

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
