/**
 * Web-safe haptics wrapper
 *
 * Provides haptic feedback on native platforms and gracefully no-ops on web.
 */

import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const isWeb = Platform.OS === 'web';

/**
 * Trigger impact feedback (light, medium, heavy)
 */
export const impactAsync = async (
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium
): Promise<void> => {
  if (isWeb) return;
  try {
    await Haptics.impactAsync(style);
  } catch {
    // Silently fail on unsupported devices
  }
};

/**
 * Trigger notification feedback (success, warning, error)
 */
export const notificationAsync = async (
  type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success
): Promise<void> => {
  if (isWeb) return;
  try {
    await Haptics.notificationAsync(type);
  } catch {
    // Silently fail on unsupported devices
  }
};

/**
 * Trigger selection feedback (light tap)
 */
export const selectionAsync = async (): Promise<void> => {
  if (isWeb) return;
  try {
    await Haptics.selectionAsync();
  } catch {
    // Silently fail on unsupported devices
  }
};

// Re-export types for convenience
export { ImpactFeedbackStyle, NotificationFeedbackType } from 'expo-haptics';
