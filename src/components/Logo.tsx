/**
 * InnerMatchEQ Logo Component
 *
 * The logo represents emotional connection through overlapping hearts,
 * symbolizing the app's focus on deep compatibility and meaningful relationships.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { Heart, Sparkles } from 'lucide-react-native';
import { BRAND_COLORS, BRAND_GRADIENTS, SHADOWS } from '@/lib/brand';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
  animated?: boolean;
  variant?: 'default' | 'minimal' | 'full';
}

const SIZES = {
  sm: { icon: 40, container: 56, text: 20, tagline: 10 },
  md: { icon: 52, container: 80, text: 28, tagline: 12 },
  lg: { icon: 64, container: 100, text: 36, tagline: 14 },
  xl: { icon: 80, container: 128, text: 42, tagline: 16 },
};

export default function Logo({
  size = 'lg',
  showText = true,
  showTagline = false,
  animated = true,
  variant = 'default',
}: LogoProps) {
  const dims = SIZES[size];

  // Animation values - always initialize to prevent native crashes
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.4);
  const floatY = useSharedValue(0);

  React.useEffect(() => {
    if (!animated) {
      // Reset values when not animated to prevent stale animations
      pulseScale.value = 1;
      glowOpacity.value = 0.4;
      floatY.value = 0;
      return;
    }

    // Gentle pulse
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Glow pulse
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1800 }),
        withTiming(0.35, { duration: 1800 })
      ),
      -1,
      true
    );

    // Float
    floatY.value = withRepeat(
      withSequence(
        withDelay(
          300,
          withTiming(-8, { duration: 2500, easing: Easing.inOut(Easing.ease) })
        ),
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Cleanup: cancel animations on unmount to prevent native crashes
    return () => {
      cancelAnimation(pulseScale);
      cancelAnimation(glowOpacity);
      cancelAnimation(floatY);
    };
  }, [animated, pulseScale, glowOpacity, floatY]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  // Minimal variant - just the icon
  if (variant === 'minimal') {
    return (
      <View className="items-center">
        <LinearGradient
          colors={BRAND_GRADIENTS.primary}
          style={{
            width: dims.container * 0.85,
            height: dims.container * 0.85,
            borderRadius: dims.container * 0.5,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Heart
            size={dims.icon * 0.75}
            color="#FFF"
            fill="#FFF"
            strokeWidth={1}
          />
        </LinearGradient>
      </View>
    );
  }

  return (
    <View className="items-center">
      {/* Logo Icon */}
      <Animated.View style={animated ? floatStyle : undefined}>
        {/* Outer glow */}
        {animated && (
          <Animated.View
            style={[
              glowStyle,
              {
                position: 'absolute',
                width: dims.container + 16,
                height: dims.container + 16,
                borderRadius: (dims.container + 16) / 2,
                backgroundColor: BRAND_COLORS.primary,
                left: -8,
                top: -8,
              },
            ]}
          />
        )}

        {/* Main container */}
        <Animated.View style={animated ? pulseStyle : undefined}>
          <View
            style={{
              width: dims.container,
              height: dims.container,
              borderRadius: dims.container / 2,
              backgroundColor: '#FFF',
              alignItems: 'center',
              justifyContent: 'center',
              ...SHADOWS.xl,
              shadowColor: BRAND_COLORS.primary,
            }}
          >
            {/* Gradient background */}
            <LinearGradient
              colors={BRAND_GRADIENTS.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: dims.container - 12,
                height: dims.container - 12,
                borderRadius: (dims.container - 12) / 2,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Inner design - overlapping hearts concept */}
              <View className="relative">
                {/* Back heart (slightly offset) */}
                <Heart
                  size={dims.icon * 0.6}
                  color="rgba(255,255,255,0.4)"
                  fill="rgba(255,255,255,0.4)"
                  strokeWidth={0}
                  style={{
                    position: 'absolute',
                    left: -dims.icon * 0.08,
                    top: -dims.icon * 0.05,
                  }}
                />
                {/* Front heart */}
                <Heart
                  size={dims.icon}
                  color="#FFF"
                  fill="#FFF"
                  strokeWidth={1}
                />
                {/* Sparkle accent */}
                <View
                  style={{
                    position: 'absolute',
                    top: -dims.icon * 0.15,
                    right: -dims.icon * 0.1,
                  }}
                >
                  <Sparkles
                    size={dims.icon * 0.35}
                    color="rgba(255,255,255,0.8)"
                    strokeWidth={2}
                  />
                </View>
              </View>
            </LinearGradient>
          </View>
        </Animated.View>
      </Animated.View>

      {/* Text */}
      {showText && (
        <View className="mt-4 items-center">
          <View className="flex-row items-baseline">
            <Text
              style={{
                fontFamily: 'Cormorant_600SemiBold',
                fontSize: dims.text,
                color: BRAND_COLORS.ink,
                letterSpacing: -0.5,
              }}
            >
              InnerMatch
            </Text>
            <Text
              style={{
                fontFamily: 'Cormorant_600SemiBold',
                fontSize: dims.text,
                color: BRAND_COLORS.primary,
                letterSpacing: -0.5,
              }}
            >
              EQ
            </Text>
          </View>

          {showTagline && (
            <View className="flex-row items-center mt-1">
              <View
                style={{
                  width: 20,
                  height: 1,
                  backgroundColor: BRAND_COLORS.primary,
                  opacity: 0.3,
                }}
              />
              <Text
                style={{
                  fontFamily: 'Outfit_500Medium',
                  fontSize: dims.tagline,
                  color: BRAND_COLORS.slate,
                  marginHorizontal: 8,
                }}
              >
                Dating with Depth
              </Text>
              <View
                style={{
                  width: 20,
                  height: 1,
                  backgroundColor: BRAND_COLORS.primary,
                  opacity: 0.3,
                }}
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
}

/**
 * App Icon variant - for use in app icon design
 * This is a static, centered version optimized for icons
 */
export function AppIconLogo({ size = 256 }: { size?: number }) {
  const iconSize = size * 0.45;

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <LinearGradient
        colors={['#D4626A', '#C4535B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Subtle radial highlight */}
        <View
          style={{
            position: 'absolute',
            width: size * 0.8,
            height: size * 0.8,
            borderRadius: size * 0.4,
            backgroundColor: 'rgba(255,255,255,0.08)',
            top: size * 0.05,
            left: size * 0.1,
          }}
        />

        {/* Heart icon */}
        <View className="relative">
          {/* Shadow heart */}
          <Heart
            size={iconSize * 0.9}
            color="rgba(0,0,0,0.15)"
            fill="rgba(0,0,0,0.15)"
            strokeWidth={0}
            style={{
              position: 'absolute',
              left: iconSize * 0.05,
              top: iconSize * 0.08,
            }}
          />
          {/* Main heart */}
          <Heart size={iconSize} color="#FFF" fill="#FFF" strokeWidth={0} />
          {/* Highlight */}
          <View
            style={{
              position: 'absolute',
              width: iconSize * 0.15,
              height: iconSize * 0.15,
              borderRadius: iconSize * 0.075,
              backgroundColor: 'rgba(255,255,255,0.4)',
              top: iconSize * 0.2,
              left: iconSize * 0.25,
            }}
          />
        </View>
      </LinearGradient>
    </View>
  );
}
