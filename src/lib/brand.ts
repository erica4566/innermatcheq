/**
 * InnerMatchEQ Brand Assets
 *
 * Centralized brand colors, typography, and design tokens
 */

// Primary brand colors
export const BRAND_COLORS = {
  // Primary - Warm Rose (emotional connection, warmth, love)
  primary: '#D4626A',
  primaryDark: '#B84D55',
  primaryLight: '#E88B92',
  primaryMuted: '#F5D5D7',

  // Secondary - Deep Teal (trust, wisdom, depth, stability)
  secondary: '#2D7D7B',
  secondaryDark: '#1F5856',
  secondaryLight: '#3D9997',
  secondaryMuted: '#C5E0DF',

  // Accent - Warm Amber (energy, confidence, premium, action)
  accent: '#E09F4F',
  accentDark: '#C4863A',
  accentLight: '#F4C078',
  accentMuted: '#F9E6CF',

  // Success - Sage Green (positive, growth, healthy)
  success: '#34A77F',
  successLight: '#6BC9A8',
  successMuted: '#D0F0E3',

  // Warning - Coral (attention, caution)
  warning: '#F0825D',
  warningLight: '#FABB9F',

  // Error - Deep Rose (alert, danger)
  error: '#DC4A5A',
  errorLight: '#F0A0A8',

  // Neutrals
  ivory: '#FFFBF8',
  cream: '#FAF7F5',
  sand: '#F5EFEB',
  stone: '#E8E4E1',
  mist: '#94A3B8',
  slate: '#4A5568',
  charcoal: '#2D3436',
  ink: '#1A1D1F',

  // Overlays
  overlayLight: 'rgba(255, 251, 248, 0.95)',
  overlayDark: 'rgba(26, 29, 31, 0.85)',
};

// Gradient presets
export const BRAND_GRADIENTS = {
  primary: ['#D4626A', '#B84D55'] as const,
  primarySoft: ['#E88B92', '#D4626A'] as const,
  secondary: ['#3D9997', '#2D7D7B'] as const,
  accent: ['#F4C078', '#E09F4F'] as const,
  warm: ['#D4626A', '#E09F4F'] as const,
  cool: ['#2D7D7B', '#3D9997'] as const,
  premium: ['#1A1A2E', '#2D2D44'] as const,
  background: ['#FFFBF8', '#FAF7F5', '#F5EFEB'] as const,
  card: ['#FFFFFF', '#FDF8F5'] as const,
};

// Typography scale (using Outfit + Cormorant)
export const TYPOGRAPHY = {
  // Display - Cormorant (elegant serif)
  displayLarge: {
    fontFamily: 'Cormorant_600SemiBold',
    fontSize: 42,
    lineHeight: 48,
  },
  displayMedium: {
    fontFamily: 'Cormorant_600SemiBold',
    fontSize: 36,
    lineHeight: 42,
  },
  displaySmall: {
    fontFamily: 'Cormorant_600SemiBold',
    fontSize: 28,
    lineHeight: 34,
  },

  // Headings - Outfit
  headlineLarge: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 24,
    lineHeight: 30,
  },
  headlineMedium: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 20,
    lineHeight: 26,
  },
  headlineSmall: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 18,
    lineHeight: 24,
  },

  // Body - Outfit
  bodyLarge: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    lineHeight: 16,
  },

  // Labels - Outfit
  labelLarge: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 14,
    lineHeight: 20,
  },
  labelMedium: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 12,
    lineHeight: 16,
  },
  labelSmall: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 10,
    lineHeight: 14,
  },
};

// Spacing scale
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

// Border radius scale
export const RADIUS = {
  none: 0,
  sm: 6,
  md: 10,
  base: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

// Shadow presets
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 12,
  },
  primary: {
    shadowColor: BRAND_COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  secondary: {
    shadowColor: BRAND_COLORS.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Animation timing presets
export const TIMING = {
  fast: 150,
  normal: 250,
  slow: 400,
  verySlow: 600,
};
