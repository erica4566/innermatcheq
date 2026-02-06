import { View, Text, Pressable, Share, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useEffect, useRef } from 'react';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import {
  Heart,
  Brain,
  Shield,
  Sparkles,
  Share2,
  Download,
  Instagram,
  Twitter,
  MessageCircle,
  Star,
} from 'lucide-react-native';
import * as Haptics from '@/lib/haptics';
import {
  MBTIType,
  AttachmentStyle,
  LoveLanguage,
  MBTI_DESCRIPTIONS,
  ATTACHMENT_DESCRIPTIONS,
} from '@/lib/store';

const { width } = Dimensions.get('window');

interface ShareableResultCardProps {
  name: string;
  mbtiType?: MBTIType | null;
  attachmentStyle?: AttachmentStyle | null;
  loveLanguages?: LoveLanguage[];
  eqScore?: number;
  onShare?: () => void;
}

const mbtiEmojis: Record<MBTIType, string> = {
  INTJ: '🧠', INTP: '🔬', ENTJ: '👑', ENTP: '💡',
  INFJ: '🌟', INFP: '🦋', ENFJ: '🌈', ENFP: '✨',
  ISTJ: '📋', ISFJ: '🤗', ESTJ: '📊', ESFJ: '💝',
  ISTP: '🛠️', ISFP: '🎨', ESTP: '🏄', ESFP: '🎉',
};

const attachmentEmojis: Record<AttachmentStyle, string> = {
  secure: '🏡',
  anxious: '💫',
  avoidant: '🦅',
  disorganized: '🌊',
};

const loveLanguageEmojis: Record<LoveLanguage, string> = {
  words: '💬',
  acts: '🛠️',
  gifts: '🎁',
  time: '⏰',
  touch: '🤗',
};

export default function ShareableResultCard({
  name,
  mbtiType,
  attachmentStyle,
  loveLanguages = [],
  eqScore = 75,
  onShare,
}: ShareableResultCardProps) {
  const cardRef = useRef<View>(null);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const mbtiInfo = mbtiType ? MBTI_DESCRIPTIONS[mbtiType] : null;
  const attachmentInfo = attachmentStyle ? ATTACHMENT_DESCRIPTIONS[attachmentStyle] : null;

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const shareMessage = `🔮 My InnerMatchEQ Results:

${mbtiType ? `${mbtiEmojis[mbtiType]} ${mbtiType} - ${mbtiInfo?.title}` : ''}
${attachmentStyle ? `${attachmentEmojis[attachmentStyle]} ${attachmentInfo?.title}` : ''}
${loveLanguages.length > 0 ? `${loveLanguageEmojis[loveLanguages[0]]} Love Language: ${loveLanguages[0]}` : ''}
✨ EQ Score: ${eqScore}/100

Find your perfect match at InnerMatchEQ!
#InnerMatchEQ #Dating #PersonalityTest`;

    try {
      await Share.share({
        message: shareMessage,
        title: 'My InnerMatchEQ Results',
      });
      onShare?.();
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleCopyLink = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // In real app, this would generate a referral link
    await Share.share({
      message: 'Discover your relationship personality! Take the InnerMatchEQ assessment: www.innermatcheq.com/quiz',
      title: 'Take the Quiz',
    });
  };

  return (
    <Animated.View entering={FadeIn.duration(500)} className="px-4">
      {/* Shareable Card */}
      <View
        ref={cardRef}
        className="bg-white rounded-3xl overflow-hidden shadow-lg shadow-black/10"
      >
        <LinearGradient
          colors={['#E07A5F', '#D56A4F']}
          style={{ padding: 24 }}
        >
          <View className="items-center">
            <Text
              className="text-white/80 text-sm mb-1"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              {name}'s Relationship Profile
            </Text>
            <View className="flex-row items-center">
              <Star size={16} color="#F2CC8F" fill="#F2CC8F" />
              <Text
                className="text-white text-sm ml-1"
                style={{ fontFamily: 'Outfit_500Medium' }}
              >
                EQ Score: {eqScore}/100
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View className="p-6">
          {/* MBTI */}
          {mbtiType && mbtiInfo && (
            <View className="flex-row items-center mb-4 pb-4 border-b border-[#F0E6E0]">
              <View className="w-14 h-14 rounded-2xl bg-[#81B29A]/10 items-center justify-center">
                <Text className="text-2xl">{mbtiEmojis[mbtiType]}</Text>
              </View>
              <View className="flex-1 ml-4">
                <View className="flex-row items-center">
                  <Text
                    className="text-lg text-[#2D3436]"
                    style={{ fontFamily: 'Outfit_700Bold' }}
                  >
                    {mbtiType}
                  </Text>
                  <View className="ml-2 bg-[#81B29A]/15 rounded-full px-2 py-0.5">
                    <Text
                      className="text-[10px] text-[#81B29A]"
                      style={{ fontFamily: 'Outfit_600SemiBold' }}
                    >
                      PERSONALITY
                    </Text>
                  </View>
                </View>
                <Text
                  className="text-sm text-[#636E72]"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  {mbtiInfo.title}
                </Text>
              </View>
            </View>
          )}

          {/* Attachment */}
          {attachmentStyle && attachmentInfo && (
            <View className="flex-row items-center mb-4 pb-4 border-b border-[#F0E6E0]">
              <View className="w-14 h-14 rounded-2xl bg-[#E07A5F]/10 items-center justify-center">
                <Text className="text-2xl">{attachmentEmojis[attachmentStyle]}</Text>
              </View>
              <View className="flex-1 ml-4">
                <View className="flex-row items-center">
                  <Text
                    className="text-base text-[#2D3436]"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    {attachmentInfo.title.split(' ')[0]}
                  </Text>
                  <View className="ml-2 bg-[#E07A5F]/15 rounded-full px-2 py-0.5">
                    <Text
                      className="text-[10px] text-[#E07A5F]"
                      style={{ fontFamily: 'Outfit_600SemiBold' }}
                    >
                      ATTACHMENT
                    </Text>
                  </View>
                </View>
                <Text
                  className="text-sm text-[#636E72]"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                  numberOfLines={1}
                >
                  {attachmentInfo.title}
                </Text>
              </View>
            </View>
          )}

          {/* Love Languages */}
          {loveLanguages.length > 0 && (
            <View className="flex-row items-center">
              <View className="w-14 h-14 rounded-2xl bg-[#D4A574]/10 items-center justify-center">
                <Text className="text-2xl">{loveLanguageEmojis[loveLanguages[0]]}</Text>
              </View>
              <View className="flex-1 ml-4">
                <View className="flex-row items-center">
                  <Text
                    className="text-base text-[#2D3436] capitalize"
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                  >
                    {loveLanguages[0]}
                  </Text>
                  <View className="ml-2 bg-[#D4A574]/15 rounded-full px-2 py-0.5">
                    <Text
                      className="text-[10px] text-[#D4A574]"
                      style={{ fontFamily: 'Outfit_600SemiBold' }}
                    >
                      LOVE LANGUAGE
                    </Text>
                  </View>
                </View>
                <Text
                  className="text-sm text-[#636E72]"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  How you express & receive love
                </Text>
              </View>
            </View>
          )}

          {/* Branding */}
          <View className="mt-6 pt-4 border-t border-[#F0E6E0] flex-row items-center justify-center">
            <Heart size={16} color="#E07A5F" fill="#E07A5F" />
            <Text
              className="text-sm text-[#A0A8AB] ml-2"
              style={{ fontFamily: 'Cormorant_600SemiBold' }}
            >
              InnerMatchEQ
            </Text>
          </View>
        </View>
      </View>

      {/* Share Actions */}
      <View className="mt-6 gap-3">
        <Animated.View style={pulseStyle}>
          <Pressable
            onPress={handleShare}
            className="active:scale-[0.98]"
          >
            <LinearGradient
              colors={['#E07A5F', '#D56A4F']}
              style={{
                paddingVertical: 16,
                borderRadius: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Share2 size={20} color="#FFF" />
              <Text
                className="text-white text-base ml-2"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                Share My Results
              </Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        <Pressable
          onPress={handleCopyLink}
          className="bg-white rounded-2xl py-4 flex-row items-center justify-center border-2 border-[#F0E6E0] active:scale-[0.98]"
        >
          <MessageCircle size={20} color="#636E72" />
          <Text
            className="text-[#636E72] text-base ml-2"
            style={{ fontFamily: 'Outfit_500Medium' }}
          >
            Invite Friends to Take the Quiz
          </Text>
        </Pressable>
      </View>

      {/* Social proof */}
      <View className="mt-6 items-center">
        <Text
          className="text-xs text-[#A0A8AB]"
          style={{ fontFamily: 'Outfit_400Regular' }}
        >
          Join 50,000+ people who found their match
        </Text>
      </View>
    </Animated.View>
  );
}
