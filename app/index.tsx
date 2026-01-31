import { View, Text, Pressable, Dimensions } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { Brain, Shield, Heart } from 'lucide-react-native';
import * as Haptics from '@/lib/haptics';
import { useAppStore } from '@/lib/store';
import Logo from '@/components/Logo';
import { BRAND_COLORS, BRAND_GRADIENTS, SHADOWS } from '@/lib/brand';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const isOnboarded = useAppStore((s) => s.isOnboarded);
  const currentUserId = useAppStore((s) => s.currentUser?.id);

  // Track if we've started rendering the screen (to prevent redirect on re-renders)
  const [isReady, setIsReady] = useState(false);

  const orbRotation = useSharedValue(0);

  // Mark as ready after mount
  useEffect(() => {
    setIsReady(true);
  }, []);

  // Animation setup
  useEffect(() => {
    // Slow orb rotation for background
    orbRotation.value = withRepeat(
      withTiming(360, { duration: 45000, easing: Easing.linear }),
      -1,
      false
    );

    // Cleanup: cancel animation on unmount to prevent native crashes
    return () => {
      cancelAnimation(orbRotation);
    };
  }, [orbRotation]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${orbRotation.value}deg` }],
  }));

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Get Started should always go to auth/login first
    // After login, _layout.tsx will route to onboarding or home based on profile state
    if (__DEV__) {
      console.log('[WelcomeScreen] Get Started clicked - going to auth');
    }
    router.push('/auth');
  };

  // CRITICAL: This screen is ONLY for non-logged-in users to see the landing page
  // When a user is logged in (has currentUserId), they should NEVER see this welcome screen
  // Instead, redirect them based on their onboarding status:
  // - isOnboarded = true → go to main app tabs
  // - isOnboarded = false → go to onboarding flow

  // If user is logged in and onboarded, go to tabs
  if (currentUserId && isOnboarded && isReady) {
    if (__DEV__) {
      console.log('[WelcomeScreen] User logged in & onboarded - redirecting to (tabs)');
    }
    return <Redirect href="/(tabs)" />;
  }

  // If user is logged in but NOT onboarded, go to onboarding
  if (currentUserId && !isOnboarded && isReady) {
    if (__DEV__) {
      console.log('[WelcomeScreen] User logged in but not onboarded - redirecting to onboarding');
    }
    return <Redirect href="/onboarding" />;
  }

  return (
    <View className="flex-1">
      <LinearGradient
        colors={BRAND_GRADIENTS.background}
        locations={[0, 0.5, 1]}
        style={{ flex: 1 }}
      >
        <SafeAreaView className="flex-1">
          {/* Floating orbs background */}
          <Animated.View
            style={[orbStyle, { position: 'absolute', width: '100%', height: '100%' }]}
          >
            <View
              className="absolute w-80 h-80 rounded-full"
              style={{
                top: -80,
                right: -100,
                backgroundColor: BRAND_COLORS.primary,
                opacity: 0.06,
              }}
            />
            <View
              className="absolute w-56 h-56 rounded-full"
              style={{
                top: height * 0.35,
                left: -80,
                backgroundColor: BRAND_COLORS.secondary,
                opacity: 0.05,
              }}
            />
            <View
              className="absolute w-40 h-40 rounded-full"
              style={{
                bottom: height * 0.2,
                right: -30,
                backgroundColor: BRAND_COLORS.accent,
                opacity: 0.07,
              }}
            />
            <View
              className="absolute w-24 h-24 rounded-full"
              style={{
                top: height * 0.15,
                left: width * 0.6,
                backgroundColor: BRAND_COLORS.success,
                opacity: 0.04,
              }}
            />
          </Animated.View>

          {/* Main content */}
          <View className="flex-1 justify-center items-center px-8">
            {/* Logo */}
            <Animated.View entering={FadeInDown.delay(100).duration(900).springify()}>
              <Logo size="xl" showText showTagline animated />
            </Animated.View>

            {/* Tagline */}
            <Animated.View
              entering={FadeInDown.delay(300).duration(900).springify()}
              className="mt-6"
            >
              <Text
                className="text-2xl text-center"
                style={{ fontFamily: 'Outfit_700Bold', color: BRAND_COLORS.ink }}
              >
                Discover Yourself. Find Your Match.
              </Text>
            </Animated.View>

            {/* Description */}
            <Animated.View
              entering={FadeInDown.delay(400).duration(900).springify()}
              className="mt-4"
            >
              <Text
                className="text-base text-center px-4 leading-7"
                style={{ fontFamily: 'Outfit_400Regular', color: BRAND_COLORS.slate }}
              >
                Science-backed{' '}
                <Text style={{ fontFamily: 'Outfit_600SemiBold', color: BRAND_COLORS.secondary }}>
                  emotional intelligence
                </Text>{' '}
                matching{'\n'}that spots{' '}
                <Text style={{ fontFamily: 'Outfit_600SemiBold', color: BRAND_COLORS.primary }}>
                  red flags before you do
                </Text>
              </Text>
            </Animated.View>
          </View>

          {/* Bottom section */}
          <View className="px-6 pb-8">
            {/* Features - Red Flag Detection FIRST (primary differentiator) */}
            <Animated.View
              entering={FadeInUp.delay(500).duration(900).springify()}
              className="flex-row justify-between mb-10 px-2"
            >
              <FeatureItem
                icon={Shield}
                color={BRAND_COLORS.primary}
                label="Red Flag"
                sublabel="Detection"
              />
              <FeatureItem
                icon={Brain}
                color={BRAND_COLORS.secondary}
                label="EQ Analysis"
                sublabel="Science-backed"
              />
              <FeatureItem
                icon={Heart}
                color={BRAND_COLORS.accent}
                label="Deep"
                sublabel="Compatibility"
              />
            </Animated.View>

            {/* CTA Button */}
            <Animated.View entering={FadeInUp.delay(600).duration(900).springify()}>
              <Pressable
                onPress={handleGetStarted}
                className="active:scale-[0.98]"
              >
                <LinearGradient
                  colors={BRAND_GRADIENTS.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    paddingVertical: 18,
                    borderRadius: 16,
                    ...SHADOWS.primary,
                  }}
                >
                  <Text
                    className="text-white text-center text-lg"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    Get Started
                  </Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>

            {/* Trust indicators */}
            <Animated.View
              entering={FadeInUp.delay(700).duration(900).springify()}
              className="flex-row justify-center items-center mt-6 gap-6"
            >
              <TrustBadge label="Psychology-based" color={BRAND_COLORS.success} />
              <View
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: BRAND_COLORS.mist,
                }}
              />
              <TrustBadge label="100% Private" color={BRAND_COLORS.secondary} />
            </Animated.View>

            {/* Why InnerMatchEQ Link */}
            <Animated.View
              entering={FadeInUp.delay(800).duration(900).springify()}
              className="mt-4"
            >
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/why-innermatch');
                }}
                className="py-2"
              >
                <Text
                  className="text-center text-sm underline"
                  style={{ fontFamily: 'Outfit_500Medium', color: BRAND_COLORS.slate }}
                >
                  Why InnerMatchEQ?
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

function FeatureItem({
  icon: Icon,
  color,
  label,
  sublabel,
}: {
  icon: typeof Brain;
  color: string;
  label: string;
  sublabel: string;
}) {
  return (
    <View className="items-center flex-1">
      <View
        className="w-16 h-16 rounded-2xl items-center justify-center mb-2"
        style={{ backgroundColor: `${color}10` }}
      >
        <Icon size={26} color={color} strokeWidth={1.5} />
      </View>
      <Text
        className="text-xs text-center"
        style={{ fontFamily: 'Outfit_600SemiBold', color: BRAND_COLORS.ink }}
      >
        {label}
      </Text>
      <Text
        className="text-xs text-center"
        style={{ fontFamily: 'Outfit_400Regular', color: BRAND_COLORS.mist }}
      >
        {sublabel}
      </Text>
    </View>
  );
}

function TrustBadge({ label, color }: { label: string; color: string }) {
  return (
    <View className="flex-row items-center">
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: color,
          marginRight: 6,
        }}
      />
      <Text
        className="text-xs"
        style={{ fontFamily: 'Outfit_400Regular', color: BRAND_COLORS.mist }}
      >
        {label}
      </Text>
    </View>
  );
}
