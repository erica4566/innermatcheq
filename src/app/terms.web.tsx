/**
 * Web-specific Terms of Service Page
 * Professional layout with consistent website navigation
 */

import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { FileText } from 'lucide-react-native';
import { BRAND_COLORS } from '@/lib/brand';
import WebNavigation from '@/components/WebNavigation';

const LAST_UPDATED = 'December 26, 2025';
const COMPANY_NAME = 'InnerMatchEQ';
const CONTACT_EMAIL = 'innermatcheq@gmail.com';

export default function TermsWebScreen() {
  const router = useRouter();

  return (
    <WebNavigation>
      <ScrollView className="flex-1 bg-[#FDF8F5]" showsVerticalScrollIndicator={false}>
        {/* Hero Header */}
        <View className="bg-white py-16 px-6 border-b border-[#E8E4E0]">
          <View style={{ maxWidth: 800, marginHorizontal: 'auto', width: '100%' }} className="items-center">
            <Animated.View entering={FadeIn.duration(400)} className="items-center">
              <View className="w-16 h-16 rounded-full bg-[#D4A574]/10 items-center justify-center mb-4">
                <FileText size={32} color={BRAND_COLORS.accent} />
              </View>
              <Text
                className="text-4xl text-[#1A1D1F] mb-2 text-center"
                style={{ fontFamily: 'Cormorant_700Bold' }}
              >
                Terms of Service
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
              Welcome to {COMPANY_NAME}. By using our application, you agree to these
              Terms of Service. Please read them carefully.
            </Text>

            <Section title="1. Acceptance of Terms">
              <Paragraph>
                By accessing or using {COMPANY_NAME}, you agree to be bound by these Terms
                and our Privacy Policy. If you do not agree, please do not use the app.
              </Paragraph>
            </Section>

            <Section title="2. Eligibility">
              <Paragraph>
                You must be at least 18 years old to use {COMPANY_NAME}. By using the app,
                you represent that you are 18 or older and have the legal capacity to enter
                into this agreement.
              </Paragraph>
              <Paragraph>
                You must not be prohibited from using the app under applicable laws or have
                been previously removed from our services.
              </Paragraph>
            </Section>

            <Section title="3. Account Registration">
              <Paragraph>
                You agree to:{'\n'}
                • Provide accurate, current, and complete information{'\n'}
                • Maintain the security of your account credentials{'\n'}
                • Promptly update any changes to your information{'\n'}
                • Accept responsibility for all activities under your account
              </Paragraph>
            </Section>

            <Section title="4. User Conduct">
              <Paragraph>
                You agree NOT to:{'\n'}
                • Provide false or misleading information{'\n'}
                • Impersonate another person{'\n'}
                • Harass, abuse, or harm other users{'\n'}
                • Send spam or unsolicited messages{'\n'}
                • Post illegal, offensive, or inappropriate content{'\n'}
                • Use the app for commercial purposes without authorization{'\n'}
                • Attempt to circumvent security features{'\n'}
                • Scrape data or use automated systems
              </Paragraph>
            </Section>

            <Section title="5. Community Guidelines">
              <Paragraph>
                {COMPANY_NAME} is designed to foster meaningful connections based on
                psychological compatibility. Users must:{'\n\n'}
                • Treat all users with respect and dignity{'\n'}
                • Be honest in profile information and assessments{'\n'}
                • Report any suspicious or harmful behavior{'\n'}
                • Respect boundaries and consent
              </Paragraph>
            </Section>

            <Section title="6. Premium Subscriptions">
              <Paragraph>
                <Bold>Billing:</Bold> Premium subscriptions are billed through your app store
                account (Apple App Store or Google Play Store). By purchasing a subscription,
                you authorize us to charge your payment method.
              </Paragraph>
              <Paragraph>
                <Bold>Auto-Renewal:</Bold> Subscriptions automatically renew unless cancelled
                at least 24 hours before the end of the current period.
              </Paragraph>
              <Paragraph>
                <Bold>Refunds:</Bold> Refund requests must be made through your app store.
                We cannot process refunds directly.
              </Paragraph>
              <Paragraph>
                <Bold>Price Changes:</Bold> We may change subscription prices with reasonable
                notice. Existing subscribers will be notified before any price increase.
              </Paragraph>
            </Section>

            <Section title="7. Psychological Assessments">
              <Paragraph>
                Our assessments are designed for entertainment and relationship guidance
                purposes. They are NOT:{'\n'}
                • A substitute for professional psychological evaluation{'\n'}
                • Clinical diagnoses{'\n'}
                • Professional therapy or counseling
              </Paragraph>
              <Paragraph>
                If you are experiencing mental health concerns, please consult a licensed
                professional.
              </Paragraph>
            </Section>

            <Section title="8. Red Flag Detection">
              <Paragraph>
                Our red flag detection system is designed to help identify potential
                concerning patterns. However:{'\n'}
                • It is not infallible and should not be solely relied upon{'\n'}
                • Users should exercise their own judgment{'\n'}
                • We are not liable for any harm resulting from user interactions{'\n'}
                • Always meet in public places for initial dates
              </Paragraph>
            </Section>

            <Section title="9. Intellectual Property">
              <Paragraph>
                All content, features, and functionality of {COMPANY_NAME}—including
                algorithms, assessments, text, graphics, and software—are owned by us and
                protected by intellectual property laws.
              </Paragraph>
              <Paragraph>
                You retain ownership of content you submit but grant us a license to use,
                display, and distribute such content within the app.
              </Paragraph>
            </Section>

            <Section title="10. Limitation of Liability">
              <Paragraph>
                {COMPANY_NAME} is provided "as is" without warranties of any kind. We are
                not liable for:{'\n'}
                • Interactions between users{'\n'}
                • Accuracy of user-provided information{'\n'}
                • Any indirect, incidental, or consequential damages{'\n'}
                • Data loss or security breaches beyond our reasonable control
              </Paragraph>
            </Section>

            <Section title="11. Indemnification">
              <Paragraph>
                You agree to indemnify and hold harmless {COMPANY_NAME}, its officers,
                directors, employees, and agents from any claims, damages, or expenses
                arising from your use of the app or violation of these Terms.
              </Paragraph>
            </Section>

            <Section title="12. Termination">
              <Paragraph>
                We may suspend or terminate your account at any time for violations of
                these Terms or for any other reason at our discretion. You may delete
                your account at any time through the app settings.
              </Paragraph>
            </Section>

            <Section title="13. Dispute Resolution">
              <Paragraph>
                Any disputes arising from these Terms or your use of {COMPANY_NAME} shall
                be resolved through binding arbitration, except where prohibited by law.
              </Paragraph>
            </Section>

            <Section title="14. Changes to Terms">
              <Paragraph>
                We reserve the right to modify these Terms at any time. We will notify
                users of material changes. Continued use after changes constitutes
                acceptance of the new Terms.
              </Paragraph>
            </Section>

            <Section title="15. Contact Information">
              <Paragraph>
                For questions about these Terms, please contact us at:
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
