import React from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Gift,
  Clock,
  Hand,
  Wrench,
  Lightbulb,
  AlertCircle,
  Users,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react-native';
import * as Haptics from '@/lib/haptics';
import {
  useAppStore,
  LOVE_LANGUAGE_DESCRIPTIONS,
  LoveLanguage,
} from '@/lib/store';
import TakeAssessmentPrompt from '@/components/TakeAssessmentPrompt';

const { width } = Dimensions.get('window');

// Deep insights for each Love Language
const LOVE_LANGUAGE_DEEP_INSIGHTS: Record<
  LoveLanguage,
  {
    icon: typeof Heart;
    color: string;
    bgColor: string;
    tagline: string;
    psychology: string;
    origin: string;
    inRelationships: string;
    communicationTips: string[];
    showLove: string[];
    feelNeglected: string[];
    conflictBehavior: string;
    intimacyStyle: string;
    idealActivities: string[];
    warningSignsPartner: string[];
    growthOpportunities: string[];
    compatibleWith: LoveLanguage[];
    mayStruggleWith: LoveLanguage[];
    dailyPractices: string[];
    famousQuote: string;
  }
> = {
  words: {
    icon: MessageCircle,
    color: '#E07A5F',
    bgColor: '#E07A5F15',
    tagline: 'Language of the Heart',
    psychology:
      "People with Words of Affirmation as their primary love language have a deep need for verbal validation. This often stems from childhood experiences where spoken praise, encouragement, or verbal appreciation played a significant role in feeling loved and valued.",
    origin:
      "This love language often develops when verbal expression was prominent in your upbringing—either as something you received abundantly and came to associate with love, or something you lacked and now seek to fill that emotional need.",
    inRelationships:
      "You thrive on hearing 'I love you,' compliments, and verbal encouragement. Written notes, texts saying you're thought of, and verbal appreciation for your efforts make you feel deeply connected. Criticism or harsh words can be particularly wounding.",
    communicationTips: [
      "Express your needs clearly—your partner can't read your mind",
      'Ask for specific affirmations when you need them',
      'Write love notes or texts to your partner regularly',
      "Don't assume silence means displeasure",
      'Practice self-affirmation to avoid over-dependence on external validation',
    ],
    showLove: [
      'Verbal compliments and praise',
      'Love letters and thoughtful texts',
      'Public acknowledgment of your partner',
      'Encouraging words during difficult times',
      'Expressing gratitude for specific actions',
      'Saying "I love you" frequently and meaningfully',
    ],
    feelNeglected: [
      'Extended silence or minimal conversation',
      'Criticism or harsh words',
      'Lack of verbal appreciation',
      'Being ignored or dismissed verbally',
      'Partners who communicate primarily through actions',
    ],
    conflictBehavior:
      "During conflicts, you may seek verbal resolution and reassurance. You need to hear that the relationship is okay and that you're still loved, even during disagreements. Silence or the silent treatment can feel devastating.",
    intimacyStyle:
      "Verbal intimacy is crucial for you. Hearing expressions of desire, whispered affirmations, and verbal connection during intimate moments deepens your bond significantly.",
    idealActivities: [
      'Deep, meaningful conversations',
      'Reading love letters or poems together',
      'Verbal games and playful banter',
      'Phone calls just to hear their voice',
      'Sharing dreams and aspirations verbally',
    ],
    warningSignsPartner: [
      'Uses words to manipulate or control',
      'Withholds verbal affection as punishment',
      'Frequently criticizes or belittles',
      "Makes promises they don't keep",
      'Uses silence as a weapon',
    ],
    growthOpportunities: [
      'Learn to receive love in non-verbal forms',
      'Build self-esteem independent of external validation',
      "Practice understanding your partner's different love language",
      'Use words to build others up, not just seek validation',
      'Journal positive affirmations for yourself',
    ],
    compatibleWith: ['words', 'time'],
    mayStruggleWith: ['acts', 'gifts'],
    dailyPractices: [
      'Send a morning text expressing love',
      'Give three specific compliments daily',
      'Express gratitude before bed',
      'Leave surprise notes in unexpected places',
      'Verbally acknowledge one thing you appreciate',
    ],
    famousQuote:
      '"The tongue has the power of life and death." — Proverbs 18:21',
  },
  acts: {
    icon: Wrench,
    color: '#81B29A',
    bgColor: '#81B29A15',
    tagline: 'Actions Speak Louder',
    psychology:
      "Those who value Acts of Service believe that actions speak louder than words. For you, love is demonstrated through helpful deeds and thoughtful actions. When someone takes time to do something for you, it communicates deep care and commitment.",
    origin:
      "This love language often develops when love was demonstrated through actions in your childhood—parents who showed care by doing things for you, or situations where you had to be self-reliant and now deeply appreciate when others lighten your load.",
    inRelationships:
      "You feel most loved when your partner makes your life easier through thoughtful actions. Taking out the trash, making dinner, handling errands, or completing tasks you've been putting off are profound expressions of love to you.",
    communicationTips: [
      'Be specific about what actions would help you most',
      "Don't assume your partner knows what you need done",
      "Appreciate the effort, even if it's not perfect",
      'Reciprocate with actions that matter to them',
      "Avoid keeping score—love isn't transactional",
    ],
    showLove: [
      'Helping with daily tasks and chores',
      'Running errands without being asked',
      'Taking care of responsibilities',
      'Preparing meals or making coffee',
      'Fixing things around the house',
      'Planning and organizing logistics',
    ],
    feelNeglected: [
      'Broken promises to help',
      'Partner creating more work or messes',
      'Being left to handle everything alone',
      'Laziness or lack of initiative',
      'Help offered reluctantly or with complaints',
    ],
    conflictBehavior:
      "During conflicts, you may withdraw and observe whether your partner takes action to repair things. Words of apology may feel empty without accompanying actions that demonstrate change.",
    intimacyStyle:
      "For you, the most intimate moments often come after your partner has done something thoughtful—the emotional connection from feeling cared for translates into deeper physical intimacy.",
    idealActivities: [
      'Working on projects together',
      'Partner handling a task you dislike',
      'Collaborative cooking or home improvement',
      'Helping each other with work challenges',
      'Taking turns giving each other breaks',
    ],
    warningSignsPartner: [
      'Makes promises but never follows through',
      'Creates more problems than they solve',
      'Expects service but never reciprocates',
      'Uses help as leverage or manipulation',
      'Constantly criticizes your way of doing things',
    ],
    growthOpportunities: [
      'Learn to accept verbal and physical expressions of love',
      'Communicate specific needs rather than expecting mind-reading',
      'Appreciate effort even when outcomes differ from expectations',
      'Avoid using acts of service to avoid emotional conversations',
      'Balance doing for others with self-care',
    ],
    compatibleWith: ['acts', 'gifts'],
    mayStruggleWith: ['words', 'touch'],
    dailyPractices: [
      'Do one unexpected helpful task daily',
      'Complete a chore your partner dislikes',
      'Offer help before being asked',
      'Take something off their to-do list',
      'Prepare something that makes their morning easier',
    ],
    famousQuote:
      '"Love is not affectionate feeling, but a steady wish for the loved person\'s ultimate good." — C.S. Lewis',
  },
  gifts: {
    icon: Gift,
    color: '#D4A574',
    bgColor: '#F2CC8F20',
    tagline: 'Symbols of Thoughtfulness',
    psychology:
      "For those with Receiving Gifts as their primary love language, gifts are visual symbols of love. It's not about materialism—it's about the thought, effort, and meaning behind the gift. A small, thoughtful gift can speak volumes.",
    origin:
      "This love language often develops when gifts were meaningful expressions of love in your upbringing—birthday celebrations, holiday traditions, or parents who expressed care through thoughtful presents that showed they truly knew you.",
    inRelationships:
      "You treasure gifts not for their monetary value, but for what they represent—that someone was thinking of you, knows what you like, and took time to find something meaningful. Forgetting important occasions can be deeply hurtful.",
    communicationTips: [
      "Explain that it's the thought, not the price tag",
      'Share what kinds of gifts are meaningful to you',
      'Express genuine appreciation for gifts received',
      'Keep a list of things your partner mentions wanting',
      'Remember that presence is the ultimate gift',
    ],
    showLove: [
      'Thoughtfully chosen presents',
      'Surprise gifts "just because"',
      'Remembering important dates',
      'Bringing back souvenirs from trips',
      'Handmade or personalized items',
      'Gifts that show you truly know them',
    ],
    feelNeglected: [
      'Forgotten birthdays or anniversaries',
      'Generic, thoughtless gifts',
      'No gifts on special occasions',
      'Partner dismissing gift-giving as materialistic',
      'Receiving gifts that show no knowledge of you',
    ],
    conflictBehavior:
      "During conflicts, you may find reconciliation easier when accompanied by a meaningful gesture—not an expensive apology gift, but something that shows thoughtfulness and effort to repair the connection.",
    intimacyStyle:
      "Romantic gestures and symbolic gifts enhance intimacy for you. Flowers, special lingerie, or meaningful items can set the tone for deeper connection.",
    idealActivities: [
      'Shopping together for meaningful items',
      'Creating gifts for each other',
      'Collecting items from shared experiences',
      'Surprise gift exchanges',
      'Building traditions around gift-giving occasions',
    ],
    warningSignsPartner: [
      'Uses expensive gifts to buy forgiveness',
      'Gives gifts with strings attached',
      'Never puts thought into gift selection',
      'Criticizes your appreciation for gifts',
      'Uses gift-withholding as punishment',
    ],
    growthOpportunities: [
      'Understand that non-gift-givers express love differently',
      'Appreciate presence and time as gifts',
      "Don't equate gift value with love's worth",
      'Practice giving without expectation of return',
      'Find meaning in experiences, not just objects',
    ],
    compatibleWith: ['gifts', 'acts'],
    mayStruggleWith: ['time', 'words'],
    dailyPractices: [
      'Bring home small surprises regularly',
      'Keep notes of things they mention wanting',
      'Create a gift idea list for your partner',
      'Give "experience gifts" like planned dates',
      'Leave small tokens of appreciation',
    ],
    famousQuote:
      '"The manner of giving is worth more than the gift." — Pierre Corneille',
  },
  time: {
    icon: Clock,
    color: '#6B5B95',
    bgColor: '#6B5B9515',
    tagline: 'Presence Over Presents',
    psychology:
      "Those with Quality Time as their love language value undivided attention above all else. In a world full of distractions, giving someone your full presence is the most valuable gift. It's not about time spent, but about the quality of that time.",
    origin:
      "This love language often develops when quality attention was either abundant (creating positive associations) or scarce (creating a deep longing) in childhood. You may have experienced distracted parents or cherished special one-on-one moments.",
    inRelationships:
      "You feel most loved when your partner is fully present—phone down, eye contact, actively engaged in what you're sharing or doing together. Being physically present but mentally elsewhere feels like rejection.",
    communicationTips: [
      'Be specific about what quality time looks like to you',
      "Understand that some people show love differently",
      "Schedule dedicated couple time if needed",
      'Practice being present with your partner too',
      'Express how distraction makes you feel',
    ],
    showLove: [
      'Undivided attention during conversations',
      'Planned date nights without distractions',
      'Eye contact and active listening',
      'Shared activities and hobbies',
      'Device-free time together',
      'Being fully present in the moment',
    ],
    feelNeglected: [
      'Partner constantly on their phone',
      'Postponed or cancelled plans',
      'Distracted conversations',
      'Work always taking priority',
      'Feeling like an afterthought in scheduling',
    ],
    conflictBehavior:
      "During conflicts, you need time to discuss and resolve issues together. Walking away or stonewalling feels particularly painful. You value processing conflicts together rather than in isolation.",
    intimacyStyle:
      "For you, the best intimacy follows meaningful time together—a great conversation, a special date, or simply being fully present with each other creates the emotional connection that enhances physical intimacy.",
    idealActivities: [
      'Long walks together',
      'Device-free dinners',
      'Shared hobbies and interests',
      'Road trips and adventures',
      'Quiet evenings just being together',
    ],
    warningSignsPartner: [
      'Always too busy for you',
      'Constantly distracted during time together',
      'Prioritizes everything else over couple time',
      'Makes you feel like an obligation',
      'Present physically but absent emotionally',
    ],
    growthOpportunities: [
      'Learn to appreciate solo time and independence',
      "Understand your partner's need for personal space",
      "Don't interpret busy schedules as lack of love",
      'Practice being fully present yourself',
      'Find quality in shorter moments together',
    ],
    compatibleWith: ['time', 'words'],
    mayStruggleWith: ['acts', 'gifts'],
    dailyPractices: [
      'Schedule device-free time each day',
      'Practice active listening without planning responses',
      'Plan a weekly dedicated date time',
      'Put away distractions during conversations',
      'Create rituals of connection (morning coffee, evening walks)',
    ],
    famousQuote:
      '"The greatest gift you can give someone is your time. Because when you give your time, you are giving a portion of your life that you will never get back." — Anonymous',
  },
  touch: {
    icon: Hand,
    color: '#E8A87C',
    bgColor: '#E8A87C15',
    tagline: 'The Language of Connection',
    psychology:
      "Physical Touch as a love language goes far beyond intimacy. It encompasses all forms of physical connection—holding hands, hugs, a hand on the shoulder, sitting close together. Touch communicates presence, care, and emotional availability.",
    origin:
      "This love language often develops from childhood experiences with physical affection—either growing up in a physically affectionate family or lacking physical touch and now seeking that connection in relationships.",
    inRelationships:
      "You feel most connected and loved through physical presence—sitting close, holding hands, hugging, and other forms of touch. Physical distance or lack of affection can make you feel disconnected and unloved.",
    communicationTips: [
      'Communicate your touch preferences clearly',
      'Respect boundaries while expressing your needs',
      "Understand that some people aren't naturally touchy",
      'Find non-sexual ways to stay connected physically',
      'Initiate touch to show you care',
    ],
    showLove: [
      'Holding hands while walking',
      'Hugs and embraces',
      'Sitting close or touching while together',
      'Gentle touches during conversation',
      'Physical presence during difficult times',
      'Cuddling and physical closeness',
    ],
    feelNeglected: [
      'Physical distance or coldness',
      'Rejection of physical advances',
      'Partner avoiding touch',
      'Long periods without physical connection',
      'Touch only during intimate moments',
    ],
    conflictBehavior:
      "During conflicts, you may seek physical reassurance—a hug that says 'we're okay' even if you're disagreeing. Physical withdrawal during arguments can feel particularly painful and rejecting.",
    intimacyStyle:
      "Physical intimacy is deeply important to you, but it's part of a larger picture of physical connection. Non-sexual touch throughout the day creates a foundation that makes intimate moments more meaningful.",
    idealActivities: [
      'Dancing together',
      'Massage and physical relaxation',
      'Sports or physical activities as a couple',
      'Cuddling while watching movies',
      'Walking arm in arm',
    ],
    warningSignsPartner: [
      'Uses physical affection as manipulation',
      'Withholds touch as punishment',
      'Only touches when wanting intimacy',
      'Rough or aggressive physical behavior',
      'Criticizes your need for touch',
    ],
    growthOpportunities: [
      'Learn to express and receive love in non-physical ways',
      "Respect that others may have different touch comfort levels",
      "Don't interpret lack of touch as rejection",
      'Find appropriate touch in non-romantic relationships',
      'Practice self-soothing through self-care',
    ],
    compatibleWith: ['touch', 'time'],
    mayStruggleWith: ['words', 'gifts'],
    dailyPractices: [
      'Hold hands or touch when together',
      'Give a 6-second hug daily (releases oxytocin)',
      'Sit close during conversations',
      'Offer back rubs or massages',
      'Greet and say goodbye with physical affection',
    ],
    famousQuote:
      '"Touch comes before sight, before speech. It is the first language and the last, and it always tells the truth." — Margaret Atwood',
  },
};

function SectionCard({
  title,
  icon: Icon,
  iconColor,
  children,
  index,
}: {
  title: string;
  icon: typeof Heart;
  iconColor: string;
  children: React.ReactNode;
  index: number;
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).duration(500)}
      className="bg-white rounded-2xl p-5 mb-4 shadow-sm shadow-black/5"
    >
      <View className="flex-row items-center mb-3">
        <View
          className="w-10 h-10 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <Icon size={20} color={iconColor} />
        </View>
        <Text
          className="text-lg text-[#2D3436]"
          style={{ fontFamily: 'Outfit_600SemiBold' }}
        >
          {title}
        </Text>
      </View>
      {children}
    </Animated.View>
  );
}

function BulletList({ items, color }: { items: string[]; color: string }) {
  return (
    <View className="gap-2">
      {items.map((item, i) => (
        <View key={i} className="flex-row">
          <View
            className="w-2 h-2 rounded-full mt-2 mr-3"
            style={{ backgroundColor: color }}
          />
          <Text
            className="flex-1 text-sm text-[#636E72] leading-5"
            style={{ fontFamily: 'Outfit_400Regular' }}
          >
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

function LanguageChip({
  language,
  isCompatible,
}: {
  language: LoveLanguage;
  isCompatible: boolean;
}) {
  const titles: Record<LoveLanguage, string> = {
    words: 'Words',
    acts: 'Acts',
    gifts: 'Gifts',
    time: 'Time',
    touch: 'Touch',
  };

  return (
    <View
      className="rounded-full px-4 py-2 mr-2 mb-2"
      style={{
        backgroundColor: isCompatible ? '#81B29A20' : '#E07A5F20',
      }}
    >
      <Text
        className="text-sm"
        style={{
          fontFamily: 'Outfit_500Medium',
          color: isCompatible ? '#81B29A' : '#E07A5F',
        }}
      >
        {titles[language]}
      </Text>
    </View>
  );
}

export default function InsightLoveLanguageScreen() {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const isHydrated = useAppStore((s) => s.isHydrated);

  const primaryLanguage = currentUser?.loveLanguages?.[0] as LoveLanguage | undefined;
  const secondaryLanguage = currentUser?.loveLanguages?.[1] as LoveLanguage | undefined;
  const insights = primaryLanguage ? LOVE_LANGUAGE_DEEP_INSIGHTS[primaryLanguage] : null;
  const baseInfo = primaryLanguage ? LOVE_LANGUAGE_DESCRIPTIONS[primaryLanguage] : null;

  // Show loading while hydration is in progress
  if (!isHydrated) {
    return (
      <View className="flex-1 bg-[#FDF8F5] items-center justify-center">
        <Heart size={48} color="#D4A574" />
      </View>
    );
  }

  if (!primaryLanguage || !insights || !baseInfo) {
    return (
      <View className="flex-1 bg-[#FDF8F5]">
        <SafeAreaView className="flex-1" edges={['top']}>
          <TakeAssessmentPrompt
            title="Love Language"
            subtitle="Discover how you give and receive love, and find partners who speak the same language."
            icon={Heart}
            color="#D4A574"
            bgColor="#F2CC8F20"
            showBackButton={true}
          />
        </SafeAreaView>
      </View>
    );
  }

  const IconComponent = insights.icon;

  return (
    <View className="flex-1 bg-[#FDF8F5]">
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="flex-row items-center px-6 py-4">
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/');
              }
            }}
            className="w-12 h-12 items-center justify-center rounded-full bg-white/80 active:scale-95"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={24} color="#2D3436" />
          </Pressable>
          <Text
            className="flex-1 text-xl text-[#2D3436] text-center"
            style={{ fontFamily: 'Cormorant_600SemiBold' }}
          >
            Love Language
          </Text>
          <View className="w-12" />
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* Hero Card */}
          <Animated.View entering={FadeIn.duration(500)} className="mb-6">
            <LinearGradient
              colors={[insights.color, `${insights.color}CC`]}
              style={{ borderRadius: 24, padding: 24 }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text
                    className="text-white/80 text-sm"
                    style={{ fontFamily: 'Outfit_400Regular' }}
                  >
                    Your Primary Love Language
                  </Text>
                  <Text
                    className="text-3xl text-white mt-1"
                    style={{ fontFamily: 'Outfit_700Bold' }}
                  >
                    {baseInfo.title}
                  </Text>
                  <Text
                    className="text-white/90 text-base mt-2"
                    style={{ fontFamily: 'Outfit_400Regular', fontStyle: 'italic' }}
                  >
                    "{insights.tagline}"
                  </Text>
                </View>
                <Animated.View entering={ZoomIn.delay(300).duration(500)}>
                  <View className="w-20 h-20 rounded-full bg-white/20 items-center justify-center">
                    <IconComponent size={40} color="#FFF" />
                  </View>
                </Animated.View>
              </View>

              {secondaryLanguage && (
                <View className="mt-4 pt-4 border-t border-white/20">
                  <Text
                    className="text-white/70 text-xs"
                    style={{ fontFamily: 'Outfit_500Medium' }}
                  >
                    Secondary: {LOVE_LANGUAGE_DESCRIPTIONS[secondaryLanguage].title}
                  </Text>
                </View>
              )}
            </LinearGradient>
          </Animated.View>

          {/* Psychology */}
          <SectionCard
            title="The Psychology"
            icon={Lightbulb}
            iconColor={insights.color}
            index={0}
          >
            <Text
              className="text-sm text-[#636E72] leading-6"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              {insights.psychology}
            </Text>
          </SectionCard>

          {/* Origin */}
          <SectionCard
            title="Where It Comes From"
            icon={Sparkles}
            iconColor={insights.color}
            index={1}
          >
            <Text
              className="text-sm text-[#636E72] leading-6"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              {insights.origin}
            </Text>
          </SectionCard>

          {/* In Relationships */}
          <SectionCard
            title="In Relationships"
            icon={Heart}
            iconColor={insights.color}
            index={2}
          >
            <Text
              className="text-sm text-[#636E72] leading-6"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              {insights.inRelationships}
            </Text>
          </SectionCard>

          {/* How You Show Love */}
          <SectionCard
            title="How You Show Love"
            icon={Target}
            iconColor="#81B29A"
            index={3}
          >
            <BulletList items={insights.showLove} color="#81B29A" />
          </SectionCard>

          {/* When You Feel Neglected */}
          <SectionCard
            title="When You Feel Neglected"
            icon={AlertCircle}
            iconColor="#E07A5F"
            index={4}
          >
            <BulletList items={insights.feelNeglected} color="#E07A5F" />
          </SectionCard>

          {/* During Conflict */}
          <SectionCard
            title="During Conflict"
            icon={Users}
            iconColor={insights.color}
            index={5}
          >
            <Text
              className="text-sm text-[#636E72] leading-6"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              {insights.conflictBehavior}
            </Text>
          </SectionCard>

          {/* Intimacy Style */}
          <SectionCard
            title="Your Intimacy Style"
            icon={Heart}
            iconColor="#D4A574"
            index={6}
          >
            <Text
              className="text-sm text-[#636E72] leading-6"
              style={{ fontFamily: 'Outfit_400Regular' }}
            >
              {insights.intimacyStyle}
            </Text>
          </SectionCard>

          {/* Communication Tips */}
          <SectionCard
            title="Communication Tips"
            icon={MessageCircle}
            iconColor={insights.color}
            index={7}
          >
            <BulletList items={insights.communicationTips} color={insights.color} />
          </SectionCard>

          {/* Ideal Activities */}
          <SectionCard
            title="Ideal Activities Together"
            icon={Clock}
            iconColor="#6B5B95"
            index={8}
          >
            <BulletList items={insights.idealActivities} color="#6B5B95" />
          </SectionCard>

          {/* Compatibility */}
          <SectionCard
            title="Language Compatibility"
            icon={Users}
            iconColor="#81B29A"
            index={9}
          >
            <Text
              className="text-sm text-[#636E72] mb-3"
              style={{ fontFamily: 'Outfit_500Medium' }}
            >
              Natural compatibility:
            </Text>
            <View className="flex-row flex-wrap mb-4">
              {insights.compatibleWith.map((lang) => (
                <LanguageChip key={lang} language={lang} isCompatible={true} />
              ))}
            </View>
            <Text
              className="text-sm text-[#636E72] mb-3"
              style={{ fontFamily: 'Outfit_500Medium' }}
            >
              May require more effort:
            </Text>
            <View className="flex-row flex-wrap">
              {insights.mayStruggleWith.map((lang) => (
                <LanguageChip key={lang} language={lang} isCompatible={false} />
              ))}
            </View>
          </SectionCard>

          {/* Warning Signs */}
          <SectionCard
            title="Red Flags to Watch"
            icon={AlertCircle}
            iconColor="#E07A5F"
            index={10}
          >
            <BulletList items={insights.warningSignsPartner} color="#E07A5F" />
          </SectionCard>

          {/* Growth Opportunities */}
          <SectionCard
            title="Growth Opportunities"
            icon={TrendingUp}
            iconColor="#81B29A"
            index={11}
          >
            <BulletList items={insights.growthOpportunities} color="#81B29A" />
          </SectionCard>

          {/* Daily Practices */}
          <SectionCard
            title="Daily Practices"
            icon={Sparkles}
            iconColor={insights.color}
            index={12}
          >
            <BulletList items={insights.dailyPractices} color={insights.color} />
          </SectionCard>

          {/* Famous Quote */}
          <Animated.View entering={FadeInDown.delay(1000).duration(500)} className="mb-8">
            <LinearGradient
              colors={['#F5F0ED', '#FDF8F5']}
              style={{ borderRadius: 16, padding: 20 }}
            >
              <Text
                className="text-base text-[#636E72] text-center leading-6"
                style={{ fontFamily: 'Outfit_400Regular', fontStyle: 'italic' }}
              >
                {insights.famousQuote}
              </Text>
            </LinearGradient>
          </Animated.View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
