import { View, Text, Pressable, ScrollView, Share, Alert, Linking, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, Gift, Users, Copy, Share2, Crown, Star, Check, Clock, MessageCircle, Instagram, Twitter, TicketCheck } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from '@/lib/haptics';
import * as Clipboard from 'expo-clipboard';
import { useAppStore, Referral } from '@/lib/store';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';

const REWARD_TIERS = [
  { count: 1, reward: '5 Super Likes', icon: Star },
  { count: 3, reward: '1 Week Premium', icon: Crown },
  { count: 5, reward: '1 Month Premium', icon: Crown },
  { count: 10, reward: 'Lifetime Elite', icon: Gift },
];

export default function ReferralsScreen() {
  const referralCode = useAppStore((s) => s.referralCode);
  const referrals = useAppStore((s) => s.referrals);
  const referralRewards = useAppStore((s) => s.referralRewards);
  const claimReferralReward = useAppStore((s) => s.claimReferralReward);
  const [friendCode, setFriendCode] = useState('');
  const [isRedeemingCode, setIsRedeemingCode] = useState(false);

  // Only show real referrals - no mock data in production
  const displayReferrals = referrals;
  const totalReferrals = displayReferrals.filter((r) => r.status !== 'pending').length;

  const handleRedeemCode = () => {
    if (!friendCode.trim()) {
      Alert.alert('Enter a Code', 'Please enter a referral code from a friend');
      return;
    }

    if (friendCode.trim().toUpperCase() === referralCode.toUpperCase()) {
      Alert.alert('Invalid Code', "You can't use your own referral code");
      return;
    }

    setIsRedeemingCode(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Simulate code redemption
    setTimeout(() => {
      setIsRedeemingCode(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Code Redeemed!',
        'You\'ve unlocked 5 Super Likes! Your friend will also receive a reward.',
        [{ text: 'Awesome!', onPress: () => setFriendCode('') }]
      );
    }, 1000);
  };

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(referralCode);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Copied!', 'Your referral code has been copied to clipboard');
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message: `Join me on InnerMatchEQ - the dating app that helps you find real connections! Use my code ${referralCode} and we both get free premium features. Download now: https://innermatcheq.app/invite/${referralCode}`,
        title: 'Invite to InnerMatchEQ',
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleShareToSMS = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const message = encodeURIComponent(`Join me on InnerMatchEQ! Use my code ${referralCode} to get free premium features. Download: https://innermatcheq.app/invite/${referralCode}`);
    Linking.openURL(`sms:?body=${message}`);
  };

  const handleShareToWhatsApp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const message = encodeURIComponent(`Join me on InnerMatchEQ - the dating app that helps you find real connections! 💕\n\nUse my code: ${referralCode}\n\nDownload: https://innermatcheq.app/invite/${referralCode}`);
    Linking.openURL(`whatsapp://send?text=${message}`);
  };

  const handleShareToInstagram = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Copy link to clipboard and open Instagram
    await Clipboard.setStringAsync(`Use code ${referralCode} on InnerMatchEQ! https://innermatcheq.app/invite/${referralCode}`);
    Alert.alert('Link Copied!', 'Share it in your Instagram story or DMs', [
      { text: 'Open Instagram', onPress: () => Linking.openURL('instagram://') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleShareToTwitter = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const text = encodeURIComponent(`I'm on InnerMatchEQ - psychology-first dating that actually works! 💕 Use my code ${referralCode} for free premium features.`);
    const url = encodeURIComponent(`https://innermatcheq.app/invite/${referralCode}`);
    Linking.openURL(`twitter://post?message=${text}&url=${url}`).catch(() => {
      Linking.openURL(`https://twitter.com/intent/tweet?text=${text}&url=${url}`);
    });
  };

  const handleClaimReward = (referralId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    claimReferralReward(referralId);
    Alert.alert('Reward Claimed!', 'Your bonus has been added to your account');
  };

  const getStatusColor = (status: Referral['status']) => {
    switch (status) {
      case 'subscribed':
        return '#81B29A';
      case 'signed_up':
        return '#E07A5F';
      case 'pending':
        return '#9CA3AF';
    }
  };

  const getStatusText = (status: Referral['status']) => {
    switch (status) {
      case 'subscribed':
        return 'Subscribed';
      case 'signed_up':
        return 'Signed Up';
      case 'pending':
        return 'Pending';
    }
  };

  const currentTier = REWARD_TIERS.findIndex((t) => totalReferrals < t.count);
  const nextTier = currentTier >= 0 ? REWARD_TIERS[currentTier] : null;
  const progress = nextTier ? (totalReferrals / nextTier.count) * 100 : 100;

  return (
    <View className="flex-1 bg-[#FDF8F5]">
      <SafeAreaView edges={['top']} className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-5 py-4">
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            className="w-10 h-10 items-center justify-center rounded-full bg-white"
          >
            <ChevronLeft size={24} color="#2D3436" />
          </Pressable>
          <Text
            className="flex-1 text-center text-xl text-[#2D3436] mr-10"
            style={{ fontFamily: 'Outfit_600SemiBold' }}
          >
            Invite Friends
          </Text>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Hero Card */}
          <Animated.View entering={FadeInDown.delay(100)} className="mx-5 mb-6">
            <LinearGradient
              colors={['#E07A5F', '#F2CC8F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 24, padding: 24 }}
            >
              <View className="items-center">
                <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center mb-4">
                  <Gift size={32} color="#fff" />
                </View>
                <Text
                  className="text-white text-2xl text-center mb-2"
                  style={{ fontFamily: 'Cormorant_600SemiBold' }}
                >
                  Give Love, Get Rewards
                </Text>
                <Text
                  className="text-white/90 text-center text-sm mb-6"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  Share InnerMatchEQ with friends and earn{'\n'}premium features for free
                </Text>

                {/* Referral Code */}
                <View className="w-full bg-white/20 rounded-2xl p-4 mb-4">
                  <Text
                    className="text-white/80 text-xs text-center mb-2"
                    style={{ fontFamily: 'Outfit_500Medium' }}
                  >
                    YOUR REFERRAL CODE
                  </Text>
                  <View className="flex-row items-center justify-center">
                    <Text
                      className="text-white text-2xl tracking-widest"
                      style={{ fontFamily: 'Outfit_700Bold' }}
                    >
                      {referralCode}
                    </Text>
                    <Pressable
                      onPress={handleCopyCode}
                      className="ml-3 w-8 h-8 rounded-full bg-white/20 items-center justify-center"
                    >
                      <Copy size={16} color="#fff" />
                    </Pressable>
                  </View>
                </View>

                {/* Share Button */}
                <Pressable
                  onPress={handleShare}
                  className="w-full bg-white rounded-full py-4 flex-row items-center justify-center mb-4"
                  style={{ shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 }}
                >
                  <Share2 size={20} color="#E07A5F" />
                  <Text
                    className="text-[#E07A5F] text-base ml-2"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    Share with Friends
                  </Text>
                </Pressable>

                {/* Social Media Buttons */}
                <View className="flex-row justify-center gap-3">
                  <Pressable
                    onPress={handleShareToSMS}
                    className="w-12 h-12 rounded-full bg-white/20 items-center justify-center"
                  >
                    <MessageCircle size={22} color="#FFF" />
                  </Pressable>
                  <Pressable
                    onPress={handleShareToWhatsApp}
                    className="w-12 h-12 rounded-full bg-[#25D366]/80 items-center justify-center"
                  >
                    <MessageCircle size={22} color="#FFF" fill="#FFF" />
                  </Pressable>
                  <Pressable
                    onPress={handleShareToInstagram}
                    className="w-12 h-12 rounded-full bg-gradient-to-r items-center justify-center"
                    style={{ backgroundColor: '#E1306C' }}
                  >
                    <Instagram size={22} color="#FFF" />
                  </Pressable>
                  <Pressable
                    onPress={handleShareToTwitter}
                    className="w-12 h-12 rounded-full bg-[#1DA1F2] items-center justify-center"
                  >
                    <Twitter size={22} color="#FFF" />
                  </Pressable>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Enter Friend's Code Section */}
          <Animated.View entering={FadeInDown.delay(150)} className="mx-5 mb-6">
            <View className="bg-white rounded-2xl p-5" style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 }}>
              <View className="flex-row items-center mb-3">
                <TicketCheck size={20} color="#81B29A" />
                <Text className="text-[#2D3436] text-base ml-2" style={{ fontFamily: 'Outfit_600SemiBold' }}>
                  Have a Friend's Code?
                </Text>
              </View>
              <Text className="text-[#6B7280] text-sm mb-4" style={{ fontFamily: 'Outfit_400Regular' }}>
                Enter a referral code from a friend to get free Super Likes
              </Text>
              <View className="flex-row gap-3">
                <View className="flex-1 bg-[#F5F0ED] rounded-xl px-4 py-3">
                  <TextInput
                    className="text-base text-[#2D3436]"
                    style={{ fontFamily: 'Outfit_500Medium' }}
                    placeholder="Enter code..."
                    placeholderTextColor="#9CA3AF"
                    value={friendCode}
                    onChangeText={(text) => setFriendCode(text.toUpperCase())}
                    autoCapitalize="characters"
                    maxLength={10}
                  />
                </View>
                <Pressable
                  onPress={handleRedeemCode}
                  disabled={isRedeemingCode}
                  className="bg-[#81B29A] rounded-xl px-5 items-center justify-center active:scale-95"
                  style={{ opacity: isRedeemingCode ? 0.7 : 1 }}
                >
                  <Text className="text-white text-sm" style={{ fontFamily: 'Outfit_600SemiBold' }}>
                    {isRedeemingCode ? '...' : 'Redeem'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>

          {/* Progress to Next Reward */}
          <Animated.View entering={FadeInDown.delay(200)} className="mx-5 mb-6">
            <View className="bg-white rounded-2xl p-5" style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 }}>
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-[#2D3436] text-base" style={{ fontFamily: 'Outfit_600SemiBold' }}>
                  Progress to Next Reward
                </Text>
                <View className="flex-row items-center">
                  <Users size={16} color="#81B29A" />
                  <Text className="text-[#81B29A] text-sm ml-1" style={{ fontFamily: 'Outfit_600SemiBold' }}>
                    {totalReferrals} friends
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View className="h-3 bg-[#F0E6E0] rounded-full mb-3 overflow-hidden">
                <Animated.View
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(progress, 100)}%`,
                    backgroundColor: '#81B29A',
                  }}
                />
              </View>

              {nextTier && (
                <View className="flex-row items-center justify-between">
                  <Text className="text-[#6B7280] text-sm" style={{ fontFamily: 'Outfit_400Regular' }}>
                    {nextTier.count - totalReferrals} more to unlock
                  </Text>
                  <View className="flex-row items-center bg-[#FDF8F5] px-3 py-1.5 rounded-full">
                    <nextTier.icon size={14} color="#F2CC8F" />
                    <Text className="text-[#2D3436] text-sm ml-1.5" style={{ fontFamily: 'Outfit_500Medium' }}>
                      {nextTier.reward}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </Animated.View>

          {/* Reward Tiers */}
          <Animated.View entering={FadeInDown.delay(300)} className="mx-5 mb-6">
            <Text className="text-[#2D3436] text-base mb-3" style={{ fontFamily: 'Outfit_600SemiBold' }}>
              Reward Milestones
            </Text>
            <View className="bg-white rounded-2xl overflow-hidden" style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 }}>
              {REWARD_TIERS.map((tier, index) => {
                const isUnlocked = totalReferrals >= tier.count;
                const IconComponent = tier.icon;
                return (
                  <View
                    key={tier.count}
                    className={`flex-row items-center p-4 ${index < REWARD_TIERS.length - 1 ? 'border-b border-[#F0E6E0]' : ''}`}
                  >
                    <View
                      className={`w-10 h-10 rounded-full items-center justify-center ${isUnlocked ? 'bg-[#81B29A]' : 'bg-[#F0E6E0]'}`}
                    >
                      {isUnlocked ? (
                        <Check size={20} color="#fff" />
                      ) : (
                        <IconComponent size={20} color="#9CA3AF" />
                      )}
                    </View>
                    <View className="flex-1 ml-3">
                      <Text
                        className={`text-sm ${isUnlocked ? 'text-[#2D3436]' : 'text-[#6B7280]'}`}
                        style={{ fontFamily: 'Outfit_500Medium' }}
                      >
                        {tier.count} {tier.count === 1 ? 'Friend' : 'Friends'}
                      </Text>
                      <Text
                        className={`text-xs ${isUnlocked ? 'text-[#81B29A]' : 'text-[#9CA3AF]'}`}
                        style={{ fontFamily: 'Outfit_400Regular' }}
                      >
                        {tier.reward}
                      </Text>
                    </View>
                    {isUnlocked && (
                      <View className="bg-[#81B29A]/10 px-3 py-1 rounded-full">
                        <Text className="text-[#81B29A] text-xs" style={{ fontFamily: 'Outfit_500Medium' }}>
                          Unlocked
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </Animated.View>

          {/* Referral List */}
          <Animated.View entering={FadeInDown.delay(400)} className="mx-5 mb-8">
            <Text className="text-[#2D3436] text-base mb-3" style={{ fontFamily: 'Outfit_600SemiBold' }}>
              Your Referrals
            </Text>
            {displayReferrals.length === 0 ? (
              <View className="bg-white rounded-2xl p-8 items-center" style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 }}>
                <Users size={40} color="#D1D5DB" />
                <Text className="text-[#6B7280] text-sm text-center mt-3" style={{ fontFamily: 'Outfit_400Regular' }}>
                  No referrals yet.{'\n'}Share your code to get started!
                </Text>
              </View>
            ) : (
              <View className="bg-white rounded-2xl overflow-hidden" style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 }}>
                {displayReferrals.map((referral, index) => (
                  <View
                    key={referral.id}
                    className={`flex-row items-center p-4 ${index < displayReferrals.length - 1 ? 'border-b border-[#F0E6E0]' : ''}`}
                  >
                    <View className="w-10 h-10 rounded-full bg-[#F0E6E0] items-center justify-center">
                      <Text className="text-[#2D3436] text-base" style={{ fontFamily: 'Outfit_600SemiBold' }}>
                        {referral.referredUserName.charAt(0)}
                      </Text>
                    </View>
                    <View className="flex-1 ml-3">
                      <Text className="text-[#2D3436] text-sm" style={{ fontFamily: 'Outfit_500Medium' }}>
                        {referral.referredUserName}
                      </Text>
                      <View className="flex-row items-center mt-0.5">
                        {referral.status === 'pending' ? (
                          <Clock size={12} color="#9CA3AF" />
                        ) : (
                          <Check size={12} color={getStatusColor(referral.status)} />
                        )}
                        <Text
                          className="text-xs ml-1"
                          style={{ fontFamily: 'Outfit_400Regular', color: getStatusColor(referral.status) }}
                        >
                          {getStatusText(referral.status)}
                        </Text>
                      </View>
                    </View>
                    {referral.status !== 'pending' && !referral.rewardEarned && (
                      <Pressable
                        onPress={() => handleClaimReward(referral.id)}
                        className="bg-[#E07A5F] px-4 py-2 rounded-full"
                      >
                        <Text className="text-white text-xs" style={{ fontFamily: 'Outfit_600SemiBold' }}>
                          Claim
                        </Text>
                      </Pressable>
                    )}
                    {referral.rewardEarned && (
                      <View className="bg-[#81B29A]/10 px-3 py-1.5 rounded-full">
                        <Text className="text-[#81B29A] text-xs" style={{ fontFamily: 'Outfit_500Medium' }}>
                          Claimed
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </Animated.View>

          {/* How it Works */}
          <Animated.View entering={FadeInUp.delay(500)} className="mx-5 mb-10">
            <Text className="text-[#2D3436] text-base mb-3" style={{ fontFamily: 'Outfit_600SemiBold' }}>
              How it Works
            </Text>
            <View className="bg-[#F8F4F1] rounded-2xl p-5">
              {[
                { step: '1', text: 'Share your unique code with friends' },
                { step: '2', text: 'They sign up using your code' },
                { step: '3', text: 'Both of you get rewarded!' },
              ].map((item, index) => (
                <View key={item.step} className={`flex-row items-center ${index < 2 ? 'mb-4' : ''}`}>
                  <View className="w-8 h-8 rounded-full bg-[#E07A5F] items-center justify-center">
                    <Text className="text-white text-sm" style={{ fontFamily: 'Outfit_600SemiBold' }}>
                      {item.step}
                    </Text>
                  </View>
                  <Text className="text-[#2D3436] text-sm ml-3" style={{ fontFamily: 'Outfit_400Regular' }}>
                    {item.text}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
