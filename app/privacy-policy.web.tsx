/**
 * Web-specific Privacy Policy Page
 * Professional layout with consistent website navigation
 */

import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Shield } from 'lucide-react-native';
import { BRAND_COLORS } from '@/lib/brand';
import WebNavigation from '@/components/WebNavigation';

const LAST_UPDATED = 'January 4, 2026';
const COMPANY_NAME = 'InnerMatchEQ';
const CONTACT_EMAIL = 'innermatcheq@gmail.com';

export default function PrivacyPolicyWebScreen() {
  const router = useRouter();

  return (
    <WebNavigation>
      <ScrollView className="flex-1 bg-[#FDF8F5]" showsVerticalScrollIndicator={false}>
        {/* Hero Header */}
        <View className="bg-white py-16 px-6 border-b border-[#E8E4E0]">
          <View style={{ maxWidth: 800, marginHorizontal: 'auto', width: '100%' }} className="items-center">
            <Animated.View entering={FadeIn.duration(400)} className="items-center">
              <View className="w-16 h-16 rounded-full bg-[#81B29A]/10 items-center justify-center mb-4">
                <Shield size={32} color={BRAND_COLORS.secondary} />
              </View>
              <Text
                className="text-4xl text-[#1A1D1F] mb-2 text-center"
                style={{ fontFamily: 'Cormorant_700Bold' }}
              >
                Privacy Policy
              </Text>
              <Text
                className="text-sm text-[#636E72]"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                Last Updated: {LAST_UPDATED}
              </Text>
            </Animated.View>
          </View>
        </View>

        {/* Content */}
        <View style={{ maxWidth: 800, marginHorizontal: 'auto', width: '100%' }} className="px-6 py-12">
          <Animated.View
            entering={FadeInDown.delay(100).duration(600)}
            className="bg-white rounded-2xl p-8"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.05,
              shadowRadius: 16,
            }}
          >
            <Text
              className="text-base text-[#2D3436] leading-7 mb-8"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              {COMPANY_NAME} ("we," "our," or "us") is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your
              information when you use our mobile application.
            </Text>

            <Section title="1. Information We Collect">
              <Paragraph>
                <Bold>Personal Information:</Bold> When you create an account, we collect
                information such as your name, email address, date of birth, gender, and
                profile photos. We also collect optional information you provide such as
                occupation, education, and location (text-based, not GPS).
              </Paragraph>
              <Paragraph>
                <Bold>Assessment Data:</Bold> We collect your responses to our psychological
                assessments, including MBTI type, attachment style, love languages, emotional
                intelligence scores, values, and relationship preferences.
              </Paragraph>
              <Paragraph>
                <Bold>Sensitive Information:</Bold> Your gender and "looking for" preferences
                may indicate sexual orientation. This information is used solely for matching
                purposes and is never shared with third parties for advertising.
              </Paragraph>
              <Paragraph>
                <Bold>Usage Data:</Bold> We automatically collect information about your
                interactions with the app, including matches viewed, swipe activity, messages
                sent, and features used.
              </Paragraph>
              <Paragraph>
                <Bold>Device Information:</Bold> We collect device identifiers, operating
                system, app version, and push notification tokens for delivering notifications
                and troubleshooting.
              </Paragraph>
              <Paragraph>
                <Bold>Purchase Information:</Bold> When you subscribe to premium features,
                our payment processor (RevenueCat) collects purchase history and subscription
                status. Payment details (credit card numbers) are processed directly by Apple
                and are never stored by us.
              </Paragraph>
            </Section>

            <Section title="2. How We Use Your Information">
              <Paragraph>
                • To create and manage your account{'\n'}
                • To provide personalized match recommendations based on psychological compatibility{'\n'}
                • To facilitate communication between matched users{'\n'}
                • To detect and prevent red flags and ensure user safety{'\n'}
                • To improve our matching algorithms and app features{'\n'}
                • To send notifications about matches, messages, and app updates{'\n'}
                • To process payments and subscriptions
              </Paragraph>
            </Section>

            <Section title="3. Sharing Your Information">
              <Paragraph>
                <Bold>With Other Users:</Bold> Your profile information (excluding assessment
                raw data) is visible to potential matches. Compatibility scores are calculated
                but detailed psychological data remains private.
              </Paragraph>
              <Paragraph>
                <Bold>Service Providers:</Bold> We share data with trusted third parties who
                assist in operating our app:{'\n'}
                • <Bold>Supabase</Bold> - Authentication and database hosting{'\n'}
                • <Bold>RevenueCat</Bold> - Subscription and purchase management{'\n'}
                • <Bold>Apple App Store</Bold> - Payment processing{'\n'}
                • <Bold>Expo</Bold> - Push notification delivery
              </Paragraph>
              <Paragraph>
                <Bold>Legal Requirements:</Bold> We may disclose information if required by law
                or to protect the safety of our users.
              </Paragraph>
              <Paragraph>
                We <Bold>never</Bold> sell your personal information to third parties or share
                it with data brokers. We do not use your data for cross-app advertising tracking.
              </Paragraph>
            </Section>

            <Section title="4. Data Security">
              <Paragraph>
                We implement industry-standard security measures including encryption, secure
                servers, and regular security audits. Your psychological assessment data is
                stored separately from your personal identification to enhance privacy.
              </Paragraph>
            </Section>

            <Section title="5. Your Rights">
              <Paragraph>
                You have the right to:{'\n'}
                • Access your personal data{'\n'}
                • Correct inaccurate information{'\n'}
                • Delete your account and associated data{'\n'}
                • Export your data{'\n'}
                • Opt-out of marketing communications
              </Paragraph>
            </Section>

            <Section title="6. Data Retention">
              <Paragraph>
                We retain your data for as long as your account is active. Upon account
                deletion, we remove your personal data within 30 days, except where required
                for legal or safety purposes. Note: Purchase transaction records may be retained
                longer by Apple and RevenueCat for financial compliance requirements.
              </Paragraph>
            </Section>

            <Section title="7. Children's Privacy">
              <Paragraph>
                {COMPANY_NAME} is intended for users 18 years and older. We do not knowingly
                collect information from anyone under 18. If we discover such data has been
                collected, we will delete it immediately.
              </Paragraph>
            </Section>

            <Section title="8. Third-Party Services">
              <Paragraph>
                Our app may contain links to third-party services. We are not responsible
                for the privacy practices of these external sites. We encourage you to review
                their privacy policies.
              </Paragraph>
            </Section>

            <Section title="9. Changes to This Policy">
              <Paragraph>
                We may update this Privacy Policy periodically. We will notify you of any
                material changes through the app or via email. Your continued use of the
                app after changes constitutes acceptance of the updated policy.
              </Paragraph>
            </Section>

            <Section title="10. Contact Us">
              <Paragraph>
                If you have questions about this Privacy Policy or our data practices,
                please contact us at:
              </Paragraph>
              <Pressable
                onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}
                className="mt-2"
              >
                <Text
                  className="text-base underline"
                  style={{ fontFamily: 'Outfit_500Medium', color: BRAND_COLORS.primary }}
                >
                  {CONTACT_EMAIL}
                </Text>
              </Pressable>
            </Section>
          </Animated.View>
        </View>
      </ScrollView>
    </WebNavigation>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-8">
      <Text
        className="text-xl text-[#1A1D1F] mb-4"
        style={{ fontFamily: 'Outfit_600SemiBold' }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return (
    <Text
      className="text-base text-[#2D3436] leading-7 mb-4"
      style={{ fontFamily: 'Outfit_400Regular' }}
    >
      {children}
    </Text>
  );
}

function Bold({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ fontFamily: 'Outfit_600SemiBold' }}>{children}</Text>
  );
}
