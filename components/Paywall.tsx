import { View, Text, Pressable, ScrollView, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { X, Check, Crown, Shield, Zap, Heart, ChevronRight } from 'lucide-react-native';
import * as Haptics from '@/lib/haptics';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getOfferings, purchasePackage, isRevenueCatEnabled, restorePurchases } from '@/lib/revenuecatClient';
import type { PurchasesPackage } from 'react-native-purchases';
import { useState } from 'react';

const { width } = Dimensions.get('window');

interface PaywallProps {
  onClose: () => void;
  onSubscribe: (tier: 'plus' | 'premium' | 'elite') => void;
}

// Map RevenueCat package identifiers to our tier names
const packageToTier: Record<string, 'plus' | 'premium' | 'elite'> = {
  '$rc_monthly': 'plus',
  '$rc_custom_premium_monthly': 'premium',
  '$rc_custom_elite_monthly': 'elite',
};

const tierNames: Record<string, string> = {
  plus: 'Explorer',
  premium: 'Connector',
  elite: 'Guardian',
};

// Outcome-focused tier subtitles
const tierSubtitles: Record<string, string> = {
  plus: 'Find More Matches',
  premium: 'Deeper Connections',
  elite: 'Maximum Safety',
};

const tierColors: Record<string, string> = {
  plus: '#81B29A',
  premium: '#E07A5F',
  elite: '#D4A574',
};

const tierFeatures: Record<string, string[]> = {
  plus: [
    'Unlimited likes',
    '5 Super Likes daily',
    'See who liked you',
    'Advanced filters',
  ],
  premium: [
    'Everything in Explorer',
    'Unlimited Super Likes',
    'Priority matching',
    'Read receipts',
    'Deep personality insights',
    'Learn your attachment style',
    'Compatibility reports',
  ],
  elite: [
    'Everything in Connector',
    'Red Flag Detection alerts',
    'Background check access',
    'Personalized safety tips',
    'Priority VIP support',
    'Weekly profile boost',
    'Exclusive match queue',
  ],
};

interface PlanData {
  id: 'plus' | 'premium' | 'elite';
  name: string;
  subtitle: string;
  price: string;
  period: string;
  color: string;
  features: string[];
  popular: boolean;
  package?: PurchasesPackage;
}

// Fallback plans when RevenueCat is not configured
const fallbackPlans: PlanData[] = [
  {
    id: 'plus',
    name: 'Explorer',
    subtitle: 'Find More Matches',
    price: '$14.99',
    period: '/month',
    color: '#81B29A',
    features: tierFeatures.plus,
    popular: false,
  },
  {
    id: 'premium',
    name: 'Connector',
    subtitle: 'Deeper Connections',
    price: '$29.99',
    period: '/month',
    color: '#E07A5F',
    features: tierFeatures.premium,
    popular: true,
  },
  {
    id: 'elite',
    name: 'Guardian',
    subtitle: 'Maximum Safety',
    price: '$49.99',
    period: '/month',
    color: '#D4A574',
    features: tierFeatures.elite,
    popular: false,
  },
];

export default function Paywall({ onClose, onSubscribe }: PaywallProps) {
  const rcEnabled = isRevenueCatEnabled();
  const [selectedPlan, setSelectedPlan] = useState<'plus' | 'premium' | 'elite'>('premium');

  // Fetch offerings from RevenueCat
  const { data: offeringsResult, isLoading } = useQuery({
    queryKey: ['offerings'],
    queryFn: getOfferings,
    enabled: rcEnabled,
  });

  // Purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: (pkg: PurchasesPackage) => purchasePackage(pkg),
    onSuccess: (result, pkg) => {
      if (result.ok) {
        const tier = packageToTier[pkg.identifier] ?? 'premium';
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSubscribe(tier);
      }
    },
  });

  // Restore purchases mutation
  const restoreMutation = useMutation({
    mutationFn: () => restorePurchases(),
    onSuccess: (result) => {
      if (result.ok) {
        const entitlements = result.data.entitlements.active;
        if (Object.keys(entitlements).length > 0) {
          // User has active entitlements - determine tier
          let tier: 'plus' | 'premium' | 'elite' = 'plus';
          if (entitlements['elite']) tier = 'elite';
          else if (entitlements['premium']) tier = 'premium';

          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert('Purchases Restored', 'Your subscription has been restored successfully.');
          onSubscribe(tier);
        } else {
          Alert.alert('No Purchases Found', 'No previous purchases were found for this account.');
        }
      } else {
        Alert.alert('Restore Failed', 'Unable to restore purchases. Please try again later.');
      }
    },
    onError: () => {
      Alert.alert('Restore Failed', 'Unable to restore purchases. Please try again later.');
    },
  });

  const handleRestore = () => {
    Haptics.selectionAsync();
    if (rcEnabled) {
      restoreMutation.mutate();
    } else {
      Alert.alert('Not Available', 'Restore purchases is not available in this build.');
    }
  };

  // Build plans from RevenueCat packages or use fallback
  const plans: PlanData[] = (() => {
    if (!rcEnabled || !offeringsResult?.ok || !offeringsResult.data.current) {
      return fallbackPlans;
    }

    const packages = offeringsResult.data.current.availablePackages;
    const sortedPackages = [...packages].sort((a, b) => {
      const order = ['$rc_monthly', '$rc_custom_premium_monthly', '$rc_custom_elite_monthly'];
      return order.indexOf(a.identifier) - order.indexOf(b.identifier);
    });

    return sortedPackages.map((pkg): PlanData => {
      const tier = packageToTier[pkg.identifier] ?? 'premium';
      return {
        id: tier,
        name: tierNames[tier] ?? pkg.product.title,
        subtitle: tierSubtitles[tier] ?? '',
        price: pkg.product.priceString,
        period: '/month',
        color: tierColors[tier] ?? '#E07A5F',
        features: tierFeatures[tier] ?? [],
        popular: tier === 'premium',
        package: pkg,
      };
    });
  })();

  const handleSelectPlan = (planId: 'plus' | 'premium' | 'elite') => {
    Haptics.selectionAsync();
    setSelectedPlan(planId);
  };

  const handleSubscribe = () => {
    const plan = plans.find((p) => p.id === selectedPlan);
    if (!plan) return;

    if (plan.package && rcEnabled) {
      // Use RevenueCat purchase flow
      purchaseMutation.mutate(plan.package);
    } else {
      // RevenueCat not configured - show alert instead of granting premium
      Alert.alert(
        'Payments Unavailable',
        'In-app purchases are not configured. Please try again later or contact support.',
        [{ text: 'OK', onPress: onClose }]
      );
    }
  };

  const selectedPlanData = plans.find((p) => p.id === selectedPlan);

  if (isLoading && rcEnabled) {
    return (
      <View className="flex-1 bg-[#FDF8F5] items-center justify-center">
        <ActivityIndicator size="large" color="#E07A5F" />
        <Text className="text-[#636E72] mt-4" style={{ fontFamily: 'Outfit_400Regular' }}>
          Loading plans...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FDF8F5]">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
      {/* Header */}
      <Animated.View
        entering={FadeIn.duration(400)}
        className="flex-row items-center justify-between px-6 pt-4 pb-4"
      >
        <View className="w-10" />
        <View className="flex-row items-center">
          <Crown size={24} color="#D4A574" />
          <Text
            className="text-xl text-[#2D3436] ml-2"
            style={{ fontFamily: 'Cormorant_600SemiBold' }}
          >
            Unlock Premium
          </Text>
        </View>
        <Pressable
          onPress={onClose}
          className="w-10 h-10 rounded-full bg-[#2D3436]/10 items-center justify-center"
        >
          <X size={20} color="#2D3436" />
        </Pressable>
      </Animated.View>

      {/* Value prop */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(500)}
        className="px-6 mb-6"
      >
        <Text
          className="text-3xl text-[#2D3436] text-center mb-2"
          style={{ fontFamily: 'Cormorant_600SemiBold' }}
        >
          Discover Your True Self
        </Text>
        <Text
          className="text-base text-[#636E72] text-center"
          style={{ fontFamily: 'Outfit_400Regular' }}
        >
          Unlock deep personality insights that help you understand yourself and find truly compatible partners
        </Text>
      </Animated.View>

      {/* Plans - Vertical selectable list */}
      <View className="px-6 gap-3 mb-6">
        {plans.map((plan, index) => {
          const isSelected = selectedPlan === plan.id;
          return (
            <Animated.View
              key={plan.id}
              entering={FadeInUp.delay(200 + index * 100).duration(500)}
            >
              <Pressable
                onPress={() => handleSelectPlan(plan.id)}
                className="active:scale-[0.98]"
              >
                <View
                  className="rounded-2xl overflow-hidden bg-white"
                  style={{
                    borderWidth: 2,
                    borderColor: isSelected ? plan.color : '#F0E6E0',
                    backgroundColor: isSelected ? `${plan.color}08` : '#FFFFFF',
                  }}
                >
                  {/* Popular badge */}
                  {plan.popular && (
                    <View
                      className="py-1.5 items-center"
                      style={{ backgroundColor: plan.color }}
                    >
                      <Text
                        className="text-white text-xs"
                        style={{ fontFamily: 'Outfit_600SemiBold' }}
                      >
                        MOST POPULAR
                      </Text>
                    </View>
                  )}

                  <View className="p-4 flex-row items-center">
                    {/* Selection indicator */}
                    <View
                      className="w-6 h-6 rounded-full border-2 items-center justify-center mr-4"
                      style={{
                        borderColor: isSelected ? plan.color : '#D0D5D8',
                        backgroundColor: isSelected ? plan.color : 'transparent',
                      }}
                    >
                      {isSelected && <Check size={14} color="#FFF" strokeWidth={3} />}
                    </View>

                    {/* Plan info */}
                    <View className="flex-1">
                      <Text
                        className="text-lg text-[#2D3436]"
                        style={{ fontFamily: 'Outfit_600SemiBold' }}
                      >
                        {plan.name}
                      </Text>
                      <Text
                        className="text-sm"
                        style={{ fontFamily: 'Outfit_500Medium', color: plan.color }}
                      >
                        {plan.subtitle}
                      </Text>
                    </View>

                    {/* Price */}
                    <View className="items-end">
                      <Text
                        className="text-xl text-[#2D3436]"
                        style={{ fontFamily: 'Outfit_700Bold' }}
                      >
                        {plan.price}
                      </Text>
                      <Text
                        className="text-xs text-[#A0A8AB]"
                        style={{ fontFamily: 'Outfit_400Regular' }}
                      >
                        {plan.period}
                      </Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>

      {/* Selected plan features */}
      {selectedPlanData && (
        <Animated.View
          entering={FadeIn.duration(300)}
          className="px-6 mb-6"
        >
          <View className="bg-white rounded-2xl p-4 border border-[#F0E6E0]">
            <Text
              className="text-sm text-[#636E72] mb-3"
              style={{ fontFamily: 'Outfit_600SemiBold' }}
            >
              {selectedPlanData.name} includes:
            </Text>
            <View className="gap-2">
              {selectedPlanData.features.map((feature, i) => (
                <View key={i} className="flex-row items-center">
                  <View
                    className="w-5 h-5 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: `${selectedPlanData.color}20` }}
                  >
                    <Check size={12} color={selectedPlanData.color} strokeWidth={3} />
                  </View>
                  <Text
                    className="text-[#636E72] text-sm flex-1"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    {feature}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      )}

      {/* Subscribe button */}
      <View className="px-6 mb-4">
        <Pressable
          onPress={handleSubscribe}
          disabled={purchaseMutation.isPending}
          className="active:scale-[0.98]"
        >
          <LinearGradient
            colors={[selectedPlanData?.color ?? '#E07A5F', selectedPlanData?.color ?? '#E07A5F']}
            style={{
              paddingVertical: 18,
              borderRadius: 16,
              alignItems: 'center',
              opacity: purchaseMutation.isPending ? 0.6 : 1,
            }}
          >
            {purchaseMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <View className="flex-row items-center">
                <Text
                  className="text-white text-lg mr-2"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Subscribe to {selectedPlanData?.name}
                </Text>
                <ChevronRight size={20} color="#FFF" />
              </View>
            )}
          </LinearGradient>
        </Pressable>
      </View>

      {/* Bottom features */}
      <Animated.View
        entering={FadeInUp.delay(500).duration(500)}
        className="px-6 py-4 mt-auto"
      >
        <View className="flex-row justify-around">
          <View className="items-center">
            <Shield size={24} color="#81B29A" />
            <Text
              className="text-[#636E72] text-xs mt-1"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              Safe & Secure
            </Text>
          </View>
          <View className="items-center">
            <Zap size={24} color="#D4A574" />
            <Text
              className="text-[#636E72] text-xs mt-1"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              Cancel Anytime
            </Text>
          </View>
          <View className="items-center">
            <Heart size={24} color="#E07A5F" />
            <Text
              className="text-[#636E72] text-xs mt-1"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              7-Day Trial
            </Text>
          </View>
        </View>

        <Text
          className="text-[#A0A8AB] text-xs text-center mt-4"
          style={{ fontFamily: 'Outfit_400Regular' }}
        >
          Subscription auto-renews. Cancel in Settings.
        </Text>

        {/* Restore Purchases - Required by App Store */}
        <Pressable
          onPress={handleRestore}
          disabled={restoreMutation.isPending}
          className="mt-3 py-2"
        >
          <Text
            className="text-[#636E72] text-xs text-center underline"
            style={{ fontFamily: 'Outfit_400Regular' }}
          >
            {restoreMutation.isPending ? 'Restoring...' : 'Restore Purchases'}
          </Text>
        </Pressable>
      </Animated.View>
      </ScrollView>
      </SafeAreaView>
    </View>
  );
}
