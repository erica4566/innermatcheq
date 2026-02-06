/**
 * Push Notifications for InnerMatchEQ
 *
 * This module handles push notification setup, permissions, and handling.
 * Uses Expo's push notification service.
 *
 * Notification types:
 * - New match alerts
 * - New message notifications
 * - Video date reminders
 * - Promotional/engagement notifications
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure how notifications are displayed when app is in foreground
// Only configure on native platforms - notifications don't work on web
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

// Storage key for push token
const PUSH_TOKEN_KEY = 'expo_push_token';

/**
 * Register for push notifications and get the Expo push token
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Push notifications only work on physical devices
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permission if not already granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission not granted');
    return null;
  }

  try {
    // Get project ID from app config
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;

    if (!projectId) {
      console.log('No project ID found - push notifications will work after EAS build');
      return null;
    }

    // Get Expo push token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    const token = tokenData.data;

    // Store token locally
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);

    console.log('Push token registered:', token);

    // Set up Android notification channel
    if (Platform.OS === 'android') {
      await setupAndroidChannels();
    }

    return token;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

/**
 * Get stored push token
 */
export async function getStoredPushToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(PUSH_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Set up Android notification channels
 */
async function setupAndroidChannels(): Promise<void> {
  // Matches channel - high priority
  await Notifications.setNotificationChannelAsync('matches', {
    name: 'New Matches',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#E07A5F',
    sound: 'default',
    description: 'Notifications for new matches',
  });

  // Messages channel - high priority
  await Notifications.setNotificationChannelAsync('messages', {
    name: 'Messages',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#81B29A',
    sound: 'default',
    description: 'Notifications for new messages',
  });

  // Video dates channel - high priority
  await Notifications.setNotificationChannelAsync('video-dates', {
    name: 'Video Date Reminders',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 500, 250, 500],
    lightColor: '#F2CC8F',
    sound: 'default',
    description: 'Reminders for scheduled video dates',
  });

  // General channel - default priority
  await Notifications.setNotificationChannelAsync('general', {
    name: 'General',
    importance: Notifications.AndroidImportance.DEFAULT,
    lightColor: '#E07A5F',
    description: 'General app notifications',
  });
}

/**
 * Schedule a local notification (e.g., for video date reminders)
 */
export async function scheduleVideoDateReminder(
  matchName: string,
  scheduledAt: Date,
  minutesBefore: number = 15
): Promise<string | null> {
  try {
    const triggerDate = new Date(scheduledAt.getTime() - minutesBefore * 60 * 1000);

    // Don't schedule if the reminder time has passed
    if (triggerDate <= new Date()) {
      return null;
    }

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Video Date Starting Soon! 💕',
        body: `Your video date with ${matchName} starts in ${minutesBefore} minutes`,
        data: { type: 'video_date_reminder', matchName },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
        channelId: Platform.OS === 'android' ? 'video-dates' : undefined,
      },
    });

    return identifier;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
}

/**
 * Cancel a scheduled notification
 */
export async function cancelScheduledNotification(identifier: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllScheduledNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
}

/**
 * Dismiss all delivered notifications
 */
export async function dismissAllNotifications(): Promise<void> {
  try {
    await Notifications.dismissAllNotificationsAsync();
  } catch (error) {
    console.error('Error dismissing notifications:', error);
  }
}

/**
 * Get the badge count
 */
export async function getBadgeCount(): Promise<number> {
  try {
    return await Notifications.getBadgeCountAsync();
  } catch {
    return 0;
  }
}

/**
 * Set the badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error('Error setting badge count:', error);
  }
}

/**
 * Add listener for received notifications (when app is in foreground)
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.EventSubscription | { remove: () => void } {
  // Notifications not supported on web - return dummy subscription
  if (Platform.OS === 'web') {
    return { remove: () => {} };
  }
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add listener for notification responses (when user taps notification)
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.EventSubscription | { remove: () => void } {
  // Notifications not supported on web - return dummy subscription
  if (Platform.OS === 'web') {
    return { remove: () => {} };
  }
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Get the last notification response (for handling app launch from notification)
 */
export async function getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
  // This API is not available on web
  if (Platform.OS === 'web') {
    return null;
  }
  return await Notifications.getLastNotificationResponseAsync();
}

// Notification payload types for backend reference
export interface NotificationPayload {
  type: 'new_match' | 'new_message' | 'video_date_reminder' | 'like_received' | 'promo';
  title: string;
  body: string;
  data?: {
    matchId?: string;
    matchName?: string;
    connectionId?: string;
    videoDateId?: string;
    [key: string]: string | undefined;
  };
}

/**
 * Example: Send push notification via Expo's push service
 * This would be called from your backend server
 *
 * POST https://exp.host/--/api/v2/push/send
 * Headers: { "Content-Type": "application/json" }
 * Body: {
 *   "to": "ExponentPushToken[xxx]",
 *   "title": "New Match! 💕",
 *   "body": "Sarah liked you back!",
 *   "data": { "type": "new_match", "matchId": "123" },
 *   "sound": "default",
 *   "channelId": "matches"
 * }
 */
