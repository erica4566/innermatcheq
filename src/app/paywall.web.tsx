/**
 * InnerMatchEQ Web - Paywall Component
 *
 * Web-specific paywall for subscription and individual report purchases.
 * Note: Web payments require a different payment provider (Stripe, etc.)
 * This component handles entitlement checks and displays upgrade options.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Crown,
  Check,
  Star,
  Zap,
  Shield,
  Heart,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react-native';
import { api, type SubscriptionStatus, type PremiumTier } from '@/lib/api';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: PremiumTier;
  name: string;
  price: string;
  pricePerMonth: string;
  description: string;
  features: PlanFeature[];
  popular?: boolean;
  color: string;
}

const PLANS: Plan[] = [
  {
    id: 'plus',
    name: 'Plus',
    price: '$9.99/mo',
    pricePerMonth: '$9.99',
    description: 'Perfect for active daters',
    color: '#3b82f6',
    features: [
      { text: 'Unlimited likes', included: true },
      { text: 'See who likes you', included: true },
      { text: '5 Super Likes per day', included: true },
      { text: 'Rewind last swipe', included: true },
      { text: 'Advanced filters', included: false },
      { text: 'Read receipts', included: false },
      { text: 'Priority matches', included: false },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$19.99/mo',
    pricePerMonth: '$19.99',
    description: 'Most popular choice',
    color: '#a855f7',
    popular: true,
    features: [
      { text: 'Unlimited likes', included: true },
      { text: 'See who likes you', included: true },
      { text: '10 Super Likes per day', included: true },
      { text: 'Rewind last swipe', included: true },
      { text: 'Advanced filters', included: true },
      { text: 'Read receipts', included: true },
      { text: 'Priority matches', included: false },
    ],
  },
  {
    id: 'elite',
    name: 'Elite',
    price: '$29.99/mo',
    pricePerMonth: '$29.99',
    description: 'Ultimate dating experience',
    color: '#f59e0b',
    features: [
      { text: 'Unlimited likes', included: true },
      { text: 'See who likes you', included: true },
      { text: 'Unlimited Super Likes', included: true },
      { text: 'Rewind last swipe', included: true },
      { text: 'Advanced filters', included: true },
      { text: 'Read receipts', included: true },
      { text: 'Priority matches', included: true },
    ],
  },
];

const INDIVIDUAL_REPORTS = [
  { id: 'attachment', name: 'Attachment Style Report', price: '$2.99' },
  { id: 'mbti', name: 'MBTI Personality Report', price: '$3.99' },
  { id: 'loveLanguage', name: 'Love Language Report', price: '$2.99' },
  { id: 'bigFive', name: 'Big Five (OCEAN) Report', price: '$4.99' },
  { id: 'compatibility', name: 'Compatibility Analysis', price: '$6.99' },
  { id: 'redFlags', name: 'Red Flag Detection', price: '$4.99' },
  { id: 'idealPartner', name: 'Ideal Partner Profile', price: '$5.99' },
  { id: 'fullBundle', name: 'All Reports Bundle', price: '$19.99', savings: 'Save $8' },
];

export default function WebPaywall() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<PremiumTier>('premium');

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const user = await api.getCurrentUser();
      if (!user) {
        router.replace('/auth');
        return;
      }
      const sub = await api.getSubscriptionStatus(user.id);
      setSubscription(sub);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (planId: PremiumTier) => {
    setSelectedPlan(planId);
  };

  const handleSubscribe = () => {
    // In a real implementation, this would redirect to Stripe checkout
    // or open a payment modal
    alert(
      `Web payments coming soon!\n\nTo subscribe to ${selectedPlan}, please use the iOS or Android app.`
    );
  };

  const handlePurchaseReport = (reportId: string) => {
    alert(
      `Web payments coming soon!\n\nTo purchase this report, please use the iOS or Android app.`
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center">
        <ActivityIndicator size="large" color="#f472b6" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-950">
      {/* Header */}
      <LinearGradient
        colors={['#1e1b4b', '#312e81', '#1e1b4b']}
        style={{ padding: 24, paddingTop: 48 }}
      >
        <View className="max-w-5xl mx-auto w-full">
          <Pressable onPress={() => router.back()} className="mb-6">
            <ArrowLeft size={24} color="white" />
          </Pressable>

          <View className="items-center">
            <View className="w-20 h-20 bg-amber-500/20 rounded-full items-center justify-center mb-4">
              <Crown size={40} color="#f59e0b" />
            </View>
            <Text className="text-3xl font-bold text-white text-center mb-2">
              Upgrade Your Experience
            </Text>
            <Text className="text-slate-300 text-center max-w-md">
              Unlock premium features and find your perfect match faster
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Current Status */}
      {subscription && subscription.tier !== 'free' && (
        <View className="max-w-5xl mx-auto w-full px-6 py-4">
          <View className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <Text className="text-green-400 font-semibold">
              Current Plan: {subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)}
            </Text>
          </View>
        </View>
      )}

      {/* Subscription Plans */}
      <View className="max-w-5xl mx-auto w-full px-6 py-8">
        <Text className="text-2xl font-bold text-white mb-6">Choose Your Plan</Text>

        <View className="flex-row flex-wrap gap-4 justify-center">
          {PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            const isCurrent = subscription?.tier === plan.id;

            return (
              <Pressable
                key={plan.id}
                onPress={() => handleSelectPlan(plan.id)}
                className={`w-80 rounded-2xl border-2 overflow-hidden ${
                  isSelected ? 'border-pink-500' : 'border-slate-700'
                }`}
                style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
              >
                {plan.popular && (
                  <View className="bg-pink-500 py-1">
                    <Text className="text-white text-center text-sm font-semibold">
                      MOST POPULAR
                    </Text>
                  </View>
                )}

                <View className="bg-slate-800/50 p-6">
                  <View className="flex-row items-center mb-2">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: `${plan.color}20` }}
                    >
                      {plan.id === 'plus' && <Zap size={20} color={plan.color} />}
                      {plan.id === 'premium' && <Star size={20} color={plan.color} />}
                      {plan.id === 'elite' && <Crown size={20} color={plan.color} />}
                    </View>
                    <View>
                      <Text className="text-xl font-bold text-white">{plan.name}</Text>
                      <Text className="text-slate-400 text-sm">{plan.description}</Text>
                    </View>
                  </View>

                  <Text className="text-3xl font-bold text-white mt-4">{plan.price}</Text>

                  <View className="mt-6 gap-3">
                    {plan.features.map((feature, idx) => (
                      <View key={idx} className="flex-row items-center">
                        <View
                          className={`w-5 h-5 rounded-full items-center justify-center mr-3 ${
                            feature.included ? 'bg-green-500/20' : 'bg-slate-700'
                          }`}
                        >
                          <Check
                            size={12}
                            color={feature.included ? '#4ade80' : '#64748b'}
                          />
                        </View>
                        <Text
                          className={feature.included ? 'text-slate-300' : 'text-slate-500'}
                        >
                          {feature.text}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {isCurrent ? (
                    <View className="mt-6 bg-green-500/20 py-3 rounded-xl">
                      <Text className="text-green-400 text-center font-semibold">
                        Current Plan
                      </Text>
                    </View>
                  ) : (
                    <Pressable
                      onPress={handleSubscribe}
                      className={`mt-6 py-3 rounded-xl ${
                        isSelected ? 'bg-pink-500' : 'bg-slate-700'
                      }`}
                    >
                      <Text className="text-white text-center font-semibold">
                        {isSelected ? 'Subscribe Now' : 'Select Plan'}
                      </Text>
                    </Pressable>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Individual Reports */}
      <View className="max-w-5xl mx-auto w-full px-6 py-8 border-t border-slate-800">
        <Text className="text-2xl font-bold text-white mb-2">Individual Reports</Text>
        <Text className="text-slate-400 mb-6">
          Purchase specific reports without a subscription
        </Text>

        <View className="flex-row flex-wrap gap-4">
          {INDIVIDUAL_REPORTS.map((report) => {
            const isUnlocked = subscription?.purchasedReports?.[report.id as keyof typeof subscription.purchasedReports];

            return (
              <Pressable
                key={report.id}
                onPress={() => !isUnlocked && handlePurchaseReport(report.id)}
                className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 w-72"
                style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="text-white font-semibold">{report.name}</Text>
                    {report.savings && (
                      <Text className="text-green-400 text-sm">{report.savings}</Text>
                    )}
                  </View>
                  {isUnlocked ? (
                    <View className="bg-green-500/20 px-2 py-1 rounded">
                      <Text className="text-green-400 text-sm">Owned</Text>
                    </View>
                  ) : (
                    <Text className="text-pink-400 font-semibold">{report.price}</Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Footer Note */}
      <View className="max-w-5xl mx-auto w-full px-6 py-8">
        <View className="bg-slate-800/30 rounded-xl p-4 border border-slate-700">
          <View className="flex-row items-center mb-2">
            <Shield size={16} color="#64748b" />
            <Text className="text-slate-400 ml-2 text-sm font-medium">Secure Payments</Text>
          </View>
          <Text className="text-slate-500 text-sm">
            All payments are processed securely. Cancel anytime from your account settings.
            Subscriptions auto-renew unless cancelled.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
