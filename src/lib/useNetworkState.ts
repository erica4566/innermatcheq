/**
 * Network State Hook
 *
 * Simple network connectivity detection using fetch to a reliable endpoint.
 * This works without requiring native modules.
 */

import { useState, useEffect, useCallback } from 'react';

interface NetworkState {
  isConnected: boolean | null;
  isChecking: boolean;
  lastChecked: Date | null;
}

// Check connectivity by attempting to fetch a small resource
const checkConnectivity = async (): Promise<boolean> => {
  try {
    // Use a small, fast endpoint - Google's generate_204 returns no content
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('https://www.google.com/generate_204', {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok || response.status === 204;
  } catch {
    return false;
  }
};

export function useNetworkState(pollInterval = 30000): NetworkState & { refresh: () => Promise<void> } {
  const [state, setState] = useState<NetworkState>({
    isConnected: null,
    isChecking: true,
    lastChecked: null,
  });

  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, isChecking: true }));
    const isConnected = await checkConnectivity();
    setState({
      isConnected,
      isChecking: false,
      lastChecked: new Date(),
    });
  }, []);

  useEffect(() => {
    // Initial check
    refresh();

    // Set up polling
    const interval = setInterval(refresh, pollInterval);

    return () => clearInterval(interval);
  }, [pollInterval, refresh]);

  return { ...state, refresh };
}

// Simple hook that just returns boolean
export function useIsOnline(): boolean {
  const { isConnected } = useNetworkState();
  return isConnected ?? true; // Assume online if not yet checked
}
