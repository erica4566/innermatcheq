import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import * as Haptics from '@/lib/haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { BRAND_COLORS } from '@/lib/brand';

const LAST_UPDATED = 'December 26, 2025';
const COMPANY_NAME = 'InnerMatchEQ';
const CONTACT_EMAIL = 'innermatcheq@gmail.com';

export default function TermsOfServiceScreen() {
  const router = useRouter();

  const handleBack = () => {
    Haptics.selectionAsync();
    router.back();
  };

  return (
    <View className="flex-1 bg-[#FAF7F5]">
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <Animated.View
          entering={FadeIn.duration(400)}
          className="flex-row items-center px-6 py-4 border-b border-[#E8E4E1]"
        >
          <Pressable
            onPress={handleBack}
            className="w-10 h-10 rounded-full bg-white items-center justify-center mr-4"
          >
            <ArrowLeft size={20} color={BRAND_COLORS.ink} />
          </Pressable>
          <Text
            className="text-xl text-[#1A1D1F]"
            style={{ fontFamily: 'Cormorant_600SemiBold' }}
          >
            Terms of Service
          </Text>
        </Animated.View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.delay(100).duration(600)}>
            <Text
              className="text-sm text-[#636E72] mt-6 mb-2"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              Last Updated: {LAST_UPDATED}
            </Text>

            <Text
              className="text-base text-[#2D3436] leading-6 mb-6"
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

            <View className="h-16" />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-6">
      <Text
        className="text-lg text-[#1A1D1F] mb-3"
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
      className="text-base text-[#2D3436] leading-6 mb-3"
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
