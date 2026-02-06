/**
 * RevenueCat Client Module
 *
 * This module provides a centralized RevenueCat SDK wrapper that gracefully handles
 * missing configuration. The app will work fine whether or not RevenueCat is configured.
 *
 * Environment Variables:
 * - EXPO_PUBLIC_VIBECODE_REVENUECAT_TEST_KEY: Used in development/test builds (both platforms)
 * - EXPO_PUBLIC_VIBECODE_REVENUECAT_APPLE_KEY: Used in production builds (iOS)
 * - EXPO_PUBLIC_VIBECODE_REVENUECAT_GOOGLE_KEY: Used in production builds (Android)
 * - EXPO_PUBLIC_REVENUECAT_WEB_KEY: Used for web billing (Stripe)
 * These are automatically injected into the workspace by the Vibecode service once the user sets up RevenueCat in the Payments tab.
 *
 * Platform Support:
 * - iOS/Android: Fully supported via app stores (react-native-purchases)
 * - Web: Supported via Stripe (@revenuecat/purchases-js)
 *
 * The module automatically selects the correct key based on __DEV__ mode and platform.
 *
 * This module is used to get the current customer info, offerings, and purchase packages.
 * These exported functions are found at the bottom of the file.
 */

import { Platform } from "react-native";

// Check if running on web
const isWeb = Platform.OS === "web";

// Import native SDK for mobile
let Purchases: typeof import("react-native-purchases").default | null = null;
let PurchasesWeb: typeof import("@revenuecat/purchases-js") | null = null;

// Dynamically import the correct SDK
if (!isWeb) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Purchases = require("react-native-purchases").default;
}

// Types from native SDK (shared interface)
import type {
  PurchasesOfferings,
  CustomerInfo,
  PurchasesPackage,
} from "react-native-purchases";

// Check for environment keys
const testKey = process.env.EXPO_PUBLIC_VIBECODE_REVENUECAT_TEST_KEY;
const appleKey = process.env.EXPO_PUBLIC_VIBECODE_REVENUECAT_APPLE_KEY;
const googleKey = process.env.EXPO_PUBLIC_VIBECODE_REVENUECAT_GOOGLE_KEY;
const webKey = process.env.EXPO_PUBLIC_REVENUECAT_WEB_KEY;

// Use __DEV__ and Platform to determine which key to use
const getApiKey = (): string | undefined => {
  if (isWeb) return webKey;
  if (__DEV__) return testKey;

  // Production: use platform-specific key
  return Platform.OS === "ios" ? appleKey : googleKey;
};

const apiKey = getApiKey();

// Track if RevenueCat is enabled
const isEnabled = !!apiKey;
const isWebEnabled = isWeb && !!webKey;

const LOG_PREFIX = "[RevenueCat]";

// Web SDK instance
let webPurchases: Awaited<ReturnType<typeof import("@revenuecat/purchases-js").Purchases.configure>> | null = null;

// Initialize Web SDK
const initWebSDK = async () => {
  if (!isWeb || !webKey || webPurchases) return;

  try {
    const { Purchases: PurchasesJS } = await import("@revenuecat/purchases-js");
    PurchasesWeb = { Purchases: PurchasesJS } as typeof import("@revenuecat/purchases-js");
    webPurchases = PurchasesJS.configure(webKey, "anonymous");
    console.log(`${LOG_PREFIX} Web SDK initialized successfully`);
  } catch (error) {
    console.error(`${LOG_PREFIX} Failed to initialize Web SDK:`, error);
  }
};

// Initialize on load for web
if (isWeb && webKey) {
  initWebSDK();
}

export type RevenueCatGuardReason =
  | "web_not_supported"
  | "not_configured"
  | "sdk_error";

export type RevenueCatResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: RevenueCatGuardReason; error?: unknown };

// Internal guard to get consistent success/failure results from RevenueCat.
const guardRevenueCatUsage = async <T>(
  action: string,
  nativeOperation: () => Promise<T>,
  webOperation?: () => Promise<T>,
): Promise<RevenueCatResult<T>> => {
  if (isWeb) {
    if (!webKey) {
      console.log(`${LOG_PREFIX} ${action} skipped: Web SDK not configured`);
      return { ok: false, reason: "not_configured" };
    }

    if (!webOperation) {
      console.log(`${LOG_PREFIX} ${action} not supported on web`);
      return { ok: false, reason: "web_not_supported" };
    }

    try {
      await initWebSDK();
      const data = await webOperation();
      return { ok: true, data };
    } catch (error) {
      console.log(`${LOG_PREFIX} ${action} failed:`, error);
      return { ok: false, reason: "sdk_error", error };
    }
  }

  if (!isEnabled) {
    console.log(`${LOG_PREFIX} ${action} skipped: RevenueCat not configured`);
    return { ok: false, reason: "not_configured" };
  }

  try {
    const data = await nativeOperation();
    return { ok: true, data };
  } catch (error) {
    console.log(`${LOG_PREFIX} ${action} failed:`, error);
    return { ok: false, reason: "sdk_error", error };
  }
};

// Initialize native RevenueCat if key exists
if (isEnabled && !isWeb && Purchases) {
  try {
    // Set up custom log handler to suppress Test Store and expected errors
    Purchases.setLogHandler((logLevel, message) => {
      if (logLevel === Purchases.LOG_LEVEL.ERROR) {
        console.log(LOG_PREFIX, message);
      }
    });

    Purchases.configure({ apiKey: apiKey! });
    console.log(`${LOG_PREFIX} Native SDK initialized successfully`);
  } catch (error) {
    console.error(`${LOG_PREFIX} Failed to initialize:`, error);
  }
}

/**
 * Check if RevenueCat is configured and enabled
 */
export const isRevenueCatEnabled = (): boolean => {
  return isEnabled;
};

/**
 * Check if running on web with web payments enabled
 */
export const isWebPaymentsEnabled = (): boolean => {
  return isWebEnabled;
};

/**
 * Get available offerings from RevenueCat
 */
export const getOfferings = (): Promise<
  RevenueCatResult<PurchasesOfferings>
> => {
  return guardRevenueCatUsage(
    "getOfferings",
    () => Purchases!.getOfferings(),
    async () => {
      if (!webPurchases) throw new Error("Web SDK not initialized");
      const offerings = await webPurchases.getOfferings();
      // Map web offerings to native format
      return offerings as unknown as PurchasesOfferings;
    }
  );
};

/**
 * Purchase a package
 */
export const purchasePackage = (
  packageToPurchase: PurchasesPackage,
): Promise<RevenueCatResult<CustomerInfo>> => {
  return guardRevenueCatUsage(
    "purchasePackage",
    async () => {
      const { customerInfo } = await Purchases!.purchasePackage(packageToPurchase);
      return customerInfo;
    },
    async () => {
      if (!webPurchases) throw new Error("Web SDK not initialized");
      // Web SDK uses purchase() method
      const webPkg = packageToPurchase as unknown as import("@revenuecat/purchases-js").Package;
      const { customerInfo } = await webPurchases.purchase({ rcPackage: webPkg });
      return customerInfo as unknown as CustomerInfo;
    }
  );
};

/**
 * Get current customer info including active entitlements
 */
export const getCustomerInfo = (): Promise<RevenueCatResult<CustomerInfo>> => {
  return guardRevenueCatUsage(
    "getCustomerInfo",
    () => Purchases!.getCustomerInfo(),
    async () => {
      if (!webPurchases) throw new Error("Web SDK not initialized");
      const customerInfo = await webPurchases.getCustomerInfo();
      return customerInfo as unknown as CustomerInfo;
    }
  );
};

/**
 * Restore previous purchases
 */
export const restorePurchases = (): Promise<
  RevenueCatResult<CustomerInfo>
> => {
  return guardRevenueCatUsage(
    "restorePurchases",
    () => Purchases!.restorePurchases(),
    async () => {
      // Web doesn't have restore - customer info is always synced
      if (!webPurchases) throw new Error("Web SDK not initialized");
      return webPurchases.getCustomerInfo() as unknown as CustomerInfo;
    }
  );
};

/**
 * Set user ID for RevenueCat (useful for cross-platform user tracking)
 */
export const setUserId = (userId: string): Promise<RevenueCatResult<void>> => {
  return guardRevenueCatUsage(
    "setUserId",
    async () => {
      await Purchases!.logIn(userId);
    },
    async () => {
      if (!webPurchases) throw new Error("Web SDK not initialized");
      await webPurchases.changeUser(userId);
    }
  );
};

/**
 * Log out the current user
 */
export const logoutUser = (): Promise<RevenueCatResult<void>> => {
  return guardRevenueCatUsage(
    "logoutUser",
    async () => {
      await Purchases!.logOut();
    },
    async () => {
      // Web SDK - just re-initialize with anonymous user
      if (webKey && PurchasesWeb) {
        webPurchases = PurchasesWeb.Purchases.configure(webKey, "anonymous");
      }
    }
  );
};

/**
 * Check if user has a specific entitlement active
 */
export const hasEntitlement = async (
  entitlementId: string,
): Promise<RevenueCatResult<boolean>> => {
  const customerInfoResult = await getCustomerInfo();

  if (!customerInfoResult.ok) {
    return {
      ok: false,
      reason: customerInfoResult.reason,
      error: customerInfoResult.error,
    };
  }

  const isActive = Boolean(
    customerInfoResult.data.entitlements.active?.[entitlementId],
  );
  return { ok: true, data: isActive };
};

/**
 * Check if user has any active subscription
 */
export const hasActiveSubscription = async (): Promise<
  RevenueCatResult<boolean>
> => {
  const customerInfoResult = await getCustomerInfo();

  if (!customerInfoResult.ok) {
    return {
      ok: false,
      reason: customerInfoResult.reason,
      error: customerInfoResult.error,
    };
  }

  const hasSubscription =
    Object.keys(customerInfoResult.data.entitlements.active || {}).length > 0;
  return { ok: true, data: hasSubscription };
};

/**
 * Get a specific package from the current offering
 */
export const getPackage = async (
  packageIdentifier: string,
): Promise<RevenueCatResult<PurchasesPackage | null>> => {
  const offeringsResult = await getOfferings();

  if (!offeringsResult.ok) {
    return {
      ok: false,
      reason: offeringsResult.reason,
      error: offeringsResult.error,
    };
  }

  const pkg =
    offeringsResult.data.current?.availablePackages.find(
      (availablePackage) => availablePackage.identifier === packageIdentifier,
    ) ?? null;

  return { ok: true, data: pkg };
};
