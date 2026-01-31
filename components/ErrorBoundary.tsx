import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component for graceful error handling
 * Catches JavaScript errors anywhere in child component tree
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }

    // In production, you would send this to an error reporting service
    // e.g., Sentry, Bugsnag, etc.
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 bg-[#FDF8F5] items-center justify-center px-8">
          <View className="w-20 h-20 rounded-full bg-[#E07A5F]/10 items-center justify-center mb-6">
            <AlertTriangle size={36} color="#E07A5F" />
          </View>

          <Text
            className="text-2xl text-[#2D3436] text-center mb-2"
            style={{ fontFamily: 'Cormorant_600SemiBold' }}
          >
            Something went wrong
          </Text>

          <Text
            className="text-sm text-[#636E72] text-center mb-6"
            style={{ fontFamily: 'Outfit_400Regular' }}
          >
            We encountered an unexpected error. Please try again.
          </Text>

          {__DEV__ && this.state.error && (
            <View className="bg-[#FEE2E2] rounded-xl p-4 mb-6 w-full">
              <Text
                className="text-xs text-[#991B1B] font-mono"
                numberOfLines={5}
              >
                {this.state.error.message}
              </Text>
            </View>
          )}

          <Pressable
            onPress={this.handleRetry}
            className="flex-row items-center bg-[#E07A5F] rounded-full px-6 py-3 active:scale-95"
          >
            <RefreshCw size={18} color="#FFF" />
            <Text
              className="text-white ml-2"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              Try Again
            </Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

/**
 * Screen-level error boundary with custom styling
 */
export function ScreenErrorBoundary({ children }: { children: ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}

export default ErrorBoundary;
