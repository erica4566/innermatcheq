import { View, Text, Pressable, ScrollView, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
  ArrowLeft,
  Share2,
  AlertTriangle,
  Shield,
  Heart,
  Brain,
  Eye,
  Lock,
  Flame,
  TrendingUp,
  MessageCircle,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
} from 'lucide-react-native';
import * as Haptics from '@/lib/haptics';

// Article content database
const ARTICLE_CONTENT: Record<string, {
  title: string;
  category: string;
  readTime: string;
  icon: typeof AlertTriangle;
  iconColor: string;
  sections: { heading?: string; content: string; type?: 'text' | 'list' | 'warning' | 'tip' }[];
}> = {
  'narcissist-signs': {
    title: '10 Warning Signs You\'re Dating a Narcissist',
    category: 'RED FLAGS',
    readTime: '5 min',
    icon: AlertTriangle,
    iconColor: '#F97316',
    sections: [
      { content: 'Narcissistic Personality Disorder (NPD) affects about 1% of the population, but narcissistic traits are much more common in the dating pool. Here\'s how to spot them early.' },
      { heading: '1. Love Bombing', content: 'They shower you with excessive attention, gifts, and declarations of love very early. It feels amazing, but it\'s a manipulation tactic to make you dependent on their validation.' },
      { heading: '2. Everything Is About Them', content: 'Conversations always circle back to them. Your achievements are minimized, your problems are dismissed, and your needs come second.' },
      { heading: '3. Lack of Empathy', content: 'They struggle to understand or care about your feelings. When you\'re upset, they may say "you\'re being too sensitive" instead of offering comfort.' },
      { heading: '4. Gaslighting', content: 'They make you question your reality. "That never happened" or "You\'re imagining things" become common phrases.' },
      { heading: '5. Hot and Cold Behavior', content: 'One day they\'re incredibly loving, the next they\'re distant or cruel. This keeps you off-balance and working to win back their affection.' },
      { heading: '6. No Accountability', content: 'Nothing is ever their fault. They blame others, make excuses, or turn it around to make you the problem.' },
      { heading: '7. Excessive Need for Admiration', content: 'They constantly fish for compliments and need to be seen as special or superior.' },
      { heading: '8. Boundary Violations', content: 'They push past your boundaries repeatedly, then act hurt or angry when you enforce them.' },
      { heading: '9. Isolation Tactics', content: 'They subtly or overtly try to separate you from friends and family who might see through their behavior.' },
      { heading: '10. The Discard', content: 'When you no longer serve their needs or start seeing through them, they may abruptly end things—often cruelly.' },
      { type: 'warning', content: 'If you recognize several of these signs, trust your instincts. Narcissistic abuse can cause lasting psychological harm. Consider speaking with a therapist.' },
      { type: 'tip', content: 'InnerMatchEQ\'s Red Flag Detection analyzes behavioral patterns to help identify these warning signs before you get too invested.' },
    ],
  },
  'attachment-styles': {
    title: 'Understanding Your Attachment Style',
    category: 'PSYCHOLOGY',
    readTime: '7 min',
    icon: Shield,
    iconColor: '#81B29A',
    sections: [
      { content: 'Your attachment style—formed in childhood—profoundly shapes how you connect with romantic partners. Understanding yours is the first step to healthier relationships.' },
      { heading: 'Secure Attachment (56% of people)', content: 'You\'re comfortable with intimacy and independence. You communicate openly, handle conflict well, and don\'t fear abandonment or engulfment.' },
      { heading: 'Anxious Attachment (20% of people)', content: 'You crave closeness but worry about your partner\'s feelings. You may be preoccupied with the relationship, need frequent reassurance, and fear abandonment.' },
      { heading: 'Avoidant Attachment (24% of people)', content: 'You value independence highly and may feel uncomfortable with too much closeness. You might dismiss emotional needs or withdraw during conflict.' },
      { heading: 'Disorganized Attachment (rare)', content: 'A combination of anxious and avoidant patterns, often resulting from childhood trauma. Relationships feel chaotic and confusing.' },
      { heading: 'Can You Change Your Style?', content: 'Yes! While attachment styles are established early, they\'re not fixed. Through self-awareness, therapy, and healthy relationships, you can develop "earned security."' },
      { type: 'tip', content: 'Take InnerMatchEQ\'s attachment assessment to discover your style and get matched with compatible partners.' },
    ],
  },
  'love-bombing': {
    title: 'Love Bombing: When "Too Good" Is Bad',
    category: 'RED FLAGS',
    readTime: '4 min',
    icon: Flame,
    iconColor: '#EF4444',
    sections: [
      { content: 'It feels like a fairy tale: constant texts, extravagant gestures, "I\'ve never felt this way" declarations—all within weeks of meeting. But love bombing is often the first phase of an abusive relationship.' },
      { heading: 'What Is Love Bombing?', content: 'Love bombing is an attempt to overwhelm you with affection to gain control. It creates intense emotional dependency before you can objectively evaluate the person.' },
      { heading: 'Signs of Love Bombing', type: 'list', content: '• "I love you" within days or weeks\n• Excessive gifts early on\n• Constant contact (calls, texts, social media)\n• Pushing for commitment immediately\n• Getting upset when you\'re not available\n• Making you feel like the center of their universe' },
      { heading: 'Why It Works', content: 'Love bombing hijacks your brain chemistry. The dopamine rush of new love combined with constant reinforcement creates addiction-like patterns.' },
      { heading: 'How to Protect Yourself', content: 'Pace the relationship. A healthy partner respects your need for space and time. Watch for consistency over 3-6 months before making big commitments.' },
      { type: 'warning', content: 'If the intensity disappears suddenly and they become cold or critical, this is often when the abuse cycle begins.' },
    ],
  },
  'healthy-boundaries': {
    title: 'Setting Healthy Boundaries in Dating',
    category: 'SELF-GROWTH',
    readTime: '6 min',
    icon: Lock,
    iconColor: '#3B82F6',
    sections: [
      { content: 'Boundaries aren\'t walls—they\'re bridges that help healthy relationships thrive. Here\'s how to set them without pushing people away.' },
      { heading: 'Types of Boundaries', type: 'list', content: '• Physical: Personal space, touch, privacy\n• Emotional: How much you share, being heard\n• Time: How you spend your time\n• Digital: Social media, phone access\n• Sexual: Consent, comfort levels, pace' },
      { heading: 'How to Communicate Boundaries', content: 'Use "I" statements: "I feel uncomfortable when..." rather than "You always..." Be clear, calm, and specific about what you need.' },
      { heading: 'When They Push Back', content: 'A healthy partner will respect your boundaries even if they\'re disappointed. Someone who guilts, argues, or ignores your limits is showing you who they are.' },
      { heading: 'Start Small', content: 'Practice with minor boundaries first. The more you exercise this muscle, the easier it becomes.' },
      { type: 'tip', content: 'Someone who respects your boundaries from day one is demonstrating the emotional intelligence needed for a healthy relationship.' },
    ],
  },
  'emotional-availability': {
    title: 'Is Your Partner Emotionally Available?',
    category: 'RELATIONSHIPS',
    readTime: '5 min',
    icon: Heart,
    iconColor: '#E07A5F',
    sections: [
      { content: 'Emotional availability is the capacity to be present, responsive, and engaged in a relationship. Here\'s how to tell if someone can truly show up for you.' },
      { heading: '7 Signs of Emotional Availability', type: 'list', content: '1. They make time for you consistently\n2. They\'re interested in your inner world\n3. They share their own feelings and vulnerabilities\n4. They remember things that matter to you\n5. They\'re consistent—not hot and cold\n6. They take responsibility for their actions\n7. They work through conflict instead of avoiding it' },
      { heading: 'Red Flags of Unavailability', type: 'list', content: '• They\'re "too busy" but not for things they want\n• They avoid defining the relationship\n• They disappear during stressful times\n• They change the subject when things get deep\n• They\'re still hung up on an ex' },
      { heading: 'Can Unavailable People Change?', content: 'Sometimes, but only if THEY want to change. You can\'t love someone into availability. Don\'t become a project manager for their emotional growth.' },
      { type: 'tip', content: 'InnerMatchEQ\'s Emotional Availability metric helps identify this before you get attached.' },
    ],
  },
  'gaslighting': {
    title: 'How to Recognize Gaslighting',
    category: 'RED FLAGS',
    readTime: '6 min',
    icon: Eye,
    iconColor: '#9333EA',
    sections: [
      { content: 'Gaslighting is a form of psychological manipulation that makes you question your own perception of reality. It\'s subtle, progressive, and deeply damaging.' },
      { heading: 'Common Gaslighting Phrases', type: 'list', content: '• "That never happened"\n• "You\'re being crazy/paranoid"\n• "You\'re too sensitive"\n• "I never said that"\n• "You\'re imagining things"\n• "Everyone agrees with me"\n• "If you really loved me, you wouldn\'t question me"' },
      { heading: 'The Gaslighting Effect', content: 'Over time, you start doubting your memory, your perception, and your sanity. You may apologize constantly, feel confused, and lose confidence in your own judgment.' },
      { heading: 'How to Protect Yourself', type: 'list', content: '• Keep a journal of events and conversations\n• Talk to trusted friends and family\n• Trust your gut—if something feels wrong, it probably is\n• Set clear boundaries and observe reactions\n• Consider professional support' },
      { type: 'warning', content: 'Gaslighting is abuse. If you\'re experiencing this, please reach out to a therapist or the National Domestic Violence Hotline: 1-800-799-7233' },
    ],
  },
  'secure-attachment': {
    title: 'Becoming More Securely Attached',
    category: 'SELF-GROWTH',
    readTime: '8 min',
    icon: TrendingUp,
    iconColor: '#10B981',
    sections: [
      { content: 'You\'re not stuck with your attachment style. "Earned security" is achievable through intentional work and healthy relationships.' },
      { heading: 'For Anxious Attachment', type: 'list', content: '• Practice self-soothing when triggered\n• Communicate needs directly, not through hints\n• Build a life outside your relationship\n• Challenge catastrophic thinking\n• Work on self-worth independent of others' },
      { heading: 'For Avoidant Attachment', type: 'list', content: '• Practice staying present during emotional conversations\n• Share something vulnerable each week\n• Notice when you\'re withdrawing and why\n• Challenge the belief that independence = safety\n• Let yourself need others sometimes' },
      { heading: 'General Growth Strategies', type: 'list', content: '• Therapy (especially attachment-focused)\n• Date securely attached people\n• Develop secure friendships\n• Practice mindfulness and emotional regulation\n• Be patient—this takes time' },
      { type: 'tip', content: 'InnerMatchEQ can help you find partners whose attachment style complements your growth journey.' },
    ],
  },
  'communication-styles': {
    title: 'The 4 Communication Styles in Relationships',
    category: 'COMMUNICATION',
    readTime: '5 min',
    icon: MessageCircle,
    iconColor: '#06B6D4',
    sections: [
      { content: 'How you communicate affects every aspect of your relationships. Understanding these four styles can transform how you connect.' },
      { heading: 'Passive', content: 'You avoid conflict, don\'t express needs, and prioritize others\' feelings over your own. This leads to resentment and unfulfilled needs.' },
      { heading: 'Aggressive', content: 'You express needs at others\' expense—blaming, criticizing, or dominating conversations. This damages trust and intimacy.' },
      { heading: 'Passive-Aggressive', content: 'You express dissatisfaction indirectly—through sarcasm, silent treatment, or subtle sabotage. This creates confusion and erodes trust.' },
      { heading: 'Assertive (The Goal)', content: 'You express needs clearly and respectfully while considering others\' feelings. You use "I" statements, listen actively, and seek solutions.' },
      { heading: 'Moving Toward Assertive Communication', type: 'list', content: '• Use "I feel... when... because..."\n• Make requests, not demands\n• Listen to understand, not to respond\n• Stay calm during disagreements\n• Acknowledge others\' perspectives' },
      { type: 'tip', content: 'Practice assertive communication in low-stakes situations first. The skill transfers to romantic relationships.' },
    ],
  },
};

export default function ArticleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const article = id ? ARTICLE_CONTENT[id] : null;

  if (!article) {
    return (
      <View className="flex-1 bg-[#FDF8F5] items-center justify-center">
        <Text className="text-lg text-[#636E72]" style={{ fontFamily: 'Outfit_500Medium' }}>
          Article not found
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-4 bg-[#E07A5F] rounded-full px-6 py-3"
        >
          <Text className="text-white" style={{ fontFamily: 'Outfit_600SemiBold' }}>
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  const Icon = article.icon;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Read this: "${article.title}" - Essential dating wisdom from InnerMatchEQ! Download: https://innermatcheq.com/download`,
        title: article.title,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <View className="flex-1 bg-[#FDF8F5]">
      <Stack.Screen
        options={{
          headerShown: true,
          title: '',
          headerStyle: { backgroundColor: '#FDF8F5' },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                router.back();
              }}
              className="w-10 h-10 items-center justify-center"
            >
              <ArrowLeft size={24} color="#636E72" />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handleShare();
              }}
              className="w-10 h-10 items-center justify-center"
            >
              <Share2 size={22} color="#636E72" />
            </Pressable>
          ),
        }}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pb-8">
          {/* Header */}
          <Animated.View entering={FadeIn.duration(600)}>
            <View className="flex-row items-center mb-3">
              <View
                className="px-3 py-1 rounded-full mr-3"
                style={{ backgroundColor: `${article.iconColor}15` }}
              >
                <Text
                  className="text-xs"
                  style={{ fontFamily: 'Outfit_600SemiBold', color: article.iconColor }}
                >
                  {article.category}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Clock size={12} color="#A0A8AB" />
                <Text
                  className="text-xs text-[#A0A8AB] ml-1"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  {article.readTime} read
                </Text>
              </View>
            </View>

            <Text
              className="text-2xl text-[#2D3436] mb-6"
              style={{ fontFamily: 'Cormorant_700Bold' }}
            >
              {article.title}
            </Text>
          </Animated.View>

          {/* Content */}
          {article.sections.map((section, index) => (
            <Animated.View
              key={index}
              entering={FadeInDown.delay(100 + index * 50).duration(500)}
              className="mb-4"
            >
              {section.heading && (
                <Text
                  className="text-lg text-[#2D3436] mb-2"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  {section.heading}
                </Text>
              )}

              {section.type === 'warning' ? (
                <View className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-4 flex-row">
                  <AlertTriangle size={20} color="#DC2626" />
                  <Text
                    className="flex-1 text-sm text-[#991B1B] ml-3"
                    style={{ fontFamily: 'Outfit_500Medium' }}
                  >
                    {section.content}
                  </Text>
                </View>
              ) : section.type === 'tip' ? (
                <View className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4 flex-row">
                  <CheckCircle size={20} color="#16A34A" />
                  <Text
                    className="flex-1 text-sm text-[#166534] ml-3"
                    style={{ fontFamily: 'Outfit_500Medium' }}
                  >
                    {section.content}
                  </Text>
                </View>
              ) : section.type === 'list' ? (
                <Text
                  className="text-base text-[#636E72] leading-7"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  {section.content}
                </Text>
              ) : (
                <Text
                  className="text-base text-[#636E72] leading-7"
                  style={{ fontFamily: 'Outfit_400Regular' }}
                >
                  {section.content}
                </Text>
              )}
            </Animated.View>
          ))}

          {/* Share CTA */}
          <View className="mt-6 pt-6 border-t border-[#E0D5CF]">
            <Text
              className="text-center text-sm text-[#636E72] mb-4"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              Found this helpful? Share it with someone who needs to read this.
            </Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                handleShare();
              }}
              className="bg-[#E07A5F] rounded-xl py-4 flex-row items-center justify-center"
            >
              <Share2 size={18} color="#FFF" />
              <Text
                className="text-white ml-2"
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                Share This Article
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
