import { Match, RedFlagProfile, LoveLanguage, MBTIType } from './store';

// Female mock profiles
const femaleMockMatches: Match[] = [
  {
    id: '1',
    name: 'Sarah',
    age: 28,
    gender: 'woman',
    height: 165, // 5'5"
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    photos: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      'https://images.unsplash.com/photo-1524638431109-93d95c968f03?w=400',
    ],
    bio: 'Psychology enthusiast who loves deep conversations over coffee. Yoga instructor by day, bookworm by night.',
    occupation: 'Yoga Instructor',
    location: 'San Francisco, CA',
    distance: 12,
    compatibilityScore: 94,
    compatibilityBreakdown: {
      attachment: 95,
      mbti: 92,
      loveLanguage: 88,
      values: 96,
      lifestyle: 92,
    },
    attachmentStyle: 'Secure',
    mbtiType: 'ENFJ',
    loveLanguages: ['time', 'words'] as LoveLanguage[],
    sharedValues: ['Growth', 'Authenticity', 'Family'],
    sharedInterests: ['Reading', 'Yoga', 'Travel'],
    isVerified: true,
    verificationLevel: 'photo',
    verificationChecks: {
      photoVerified: true,
    },
    redFlagProfile: {
      narcissismScore: 8,
      manipulationRisk: 5,
      emotionalAvailability: 92,
      consistencyScore: 95,
      flags: [],
    },
    hasWarnings: false,
    isNew: true,
    education: 'Master\'s Degree',
    religion: 'Spiritual',
    drinking: 'social',
    smoking: 'never',
    exercise: 'regularly',
    relationshipGoal: 'serious',
  },
  {
    id: '2',
    name: 'Emma',
    age: 31,
    gender: 'woman',
    height: 170, // 5'7"
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    photos: [
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      'https://images.unsplash.com/photo-1502323777036-f29e3972f5e5?w=400',
    ],
    bio: 'Adventure seeker and aspiring novelist. Looking for someone to explore hidden cafes and share stories with.',
    occupation: 'Marketing Director',
    location: 'New York, NY',
    distance: 8,
    compatibilityScore: 89,
    compatibilityBreakdown: {
      attachment: 90,
      mbti: 85,
      loveLanguage: 92,
      values: 88,
      lifestyle: 90,
    },
    attachmentStyle: 'Secure',
    mbtiType: 'ENFP',
    loveLanguages: ['time', 'acts'] as LoveLanguage[],
    sharedValues: ['Adventure', 'Creativity', 'Independence'],
    sharedInterests: ['Writing', 'Hiking', 'Photography'],
    isVerified: true,
    verificationLevel: 'id',
    verificationChecks: {
      photoVerified: true,
      idVerified: true,
    },
    redFlagProfile: {
      narcissismScore: 12,
      manipulationRisk: 8,
      emotionalAvailability: 88,
      consistencyScore: 90,
      flags: [],
    },
    hasWarnings: false,
    education: 'Bachelor\'s Degree',
    drinking: 'social',
    smoking: 'never',
    exercise: 'sometimes',
    relationshipGoal: 'serious',
  },
  {
    id: '3',
    name: 'Olivia',
    age: 26,
    gender: 'woman',
    height: 160, // 5'3"
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
    photos: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400',
    ],
    bio: 'Therapist in training. I believe in the power of vulnerability and honest communication.',
    occupation: 'Graduate Student',
    location: 'Boston, MA',
    distance: 15,
    compatibilityScore: 87,
    compatibilityBreakdown: {
      attachment: 72,
      mbti: 88,
      loveLanguage: 95,
      values: 90,
      lifestyle: 85,
    },
    attachmentStyle: 'Anxious',
    mbtiType: 'INFJ',
    loveLanguages: ['words', 'touch'] as LoveLanguage[],
    sharedValues: ['Communication', 'Loyalty', 'Stability'],
    sharedInterests: ['Psychology', 'Art', 'Music'],
    isVerified: false,
    verificationLevel: 'none',
    redFlagProfile: {
      narcissismScore: 15,
      manipulationRisk: 10,
      emotionalAvailability: 85,
      consistencyScore: 78,
      flags: [],
    },
    hasWarnings: false,
    warnings: ['Anxious attachment may need extra reassurance'],
    education: 'PhD Student',
    religion: 'Christian',
    drinking: 'never',
    smoking: 'never',
    exercise: 'sometimes',
    relationshipGoal: 'marriage',
  },
];

// Male mock profiles
const maleMockMatches: Match[] = [
  {
    id: 'm1',
    name: 'James',
    age: 32,
    gender: 'man',
    height: 183, // 6'0"
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    photos: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    ],
    bio: 'Software engineer by day, amateur chef by night. Looking for someone to taste-test my creations and join me on weekend hikes.',
    occupation: 'Software Engineer',
    location: 'San Francisco, CA',
    distance: 5,
    compatibilityScore: 92,
    compatibilityBreakdown: {
      attachment: 94,
      mbti: 90,
      loveLanguage: 88,
      values: 95,
      lifestyle: 93,
    },
    attachmentStyle: 'Secure',
    mbtiType: 'INTJ',
    loveLanguages: ['acts', 'time'] as LoveLanguage[],
    sharedValues: ['Growth', 'Stability', 'Adventure'],
    sharedInterests: ['Cooking', 'Hiking', 'Technology'],
    isVerified: true,
    verificationLevel: 'id',
    verificationChecks: {
      photoVerified: true,
      idVerified: true,
      backgroundCheck: true,
    },
    redFlagProfile: {
      narcissismScore: 10,
      manipulationRisk: 5,
      emotionalAvailability: 90,
      consistencyScore: 95,
      flags: [],
    },
    hasWarnings: false,
    isNew: true,
    education: 'Master\'s Degree',
    drinking: 'social',
    smoking: 'never',
    exercise: 'regularly',
    relationshipGoal: 'serious',
  },
  {
    id: 'm2',
    name: 'Michael',
    age: 29,
    gender: 'man',
    height: 178, // 5'10"
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
    ],
    bio: 'Doctor with a passion for music. When I\'m not at the hospital, you\'ll find me playing guitar or exploring new coffee shops.',
    occupation: 'Physician',
    location: 'Boston, MA',
    distance: 10,
    compatibilityScore: 88,
    compatibilityBreakdown: {
      attachment: 88,
      mbti: 85,
      loveLanguage: 90,
      values: 92,
      lifestyle: 85,
    },
    attachmentStyle: 'Secure',
    mbtiType: 'ENFJ',
    loveLanguages: ['time', 'words'] as LoveLanguage[],
    sharedValues: ['Family', 'Career', 'Health'],
    sharedInterests: ['Music', 'Coffee', 'Travel'],
    isVerified: true,
    verificationLevel: 'background',
    redFlagProfile: {
      narcissismScore: 8,
      manipulationRisk: 6,
      emotionalAvailability: 88,
      consistencyScore: 92,
      flags: [],
    },
    hasWarnings: false,
    education: 'MD',
    religion: 'Agnostic',
    drinking: 'social',
    smoking: 'never',
    exercise: 'regularly',
    relationshipGoal: 'serious',
    verificationChecks: {
      photoVerified: true,
      idVerified: true,
      backgroundCheck: true,
      creditCheck: false,
    },
  },
  {
    id: 'm3',
    name: 'David',
    age: 30,
    gender: 'man',
    height: 175, // 5'9"
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    photos: [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      'https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?w=400',
    ],
    bio: 'Teacher who loves making people laugh. Looking for my partner in crime for spontaneous adventures and lazy Sunday mornings.',
    occupation: 'High School Teacher',
    location: 'Austin, TX',
    distance: 18,
    compatibilityScore: 85,
    compatibilityBreakdown: {
      attachment: 82,
      mbti: 88,
      loveLanguage: 85,
      values: 88,
      lifestyle: 82,
    },
    attachmentStyle: 'Secure',
    mbtiType: 'ENFP',
    loveLanguages: ['words', 'touch'] as LoveLanguage[],
    sharedValues: ['Humor', 'Family', 'Education'],
    sharedInterests: ['Comedy', 'Sports', 'Board Games'],
    isVerified: true,
    verificationLevel: 'photo',
    redFlagProfile: {
      narcissismScore: 12,
      manipulationRisk: 8,
      emotionalAvailability: 85,
      consistencyScore: 88,
      flags: [],
    },
    hasWarnings: false,
    education: 'Bachelor\'s Degree',
    drinking: 'social',
    smoking: 'never',
    exercise: 'sometimes',
    relationshipGoal: 'serious',
  },
];

// Export combined mock matches with function to filter by preference
export const getMockMatchesForPreference = (lookingFor: string | null | undefined): Match[] => {
  if (!lookingFor || lookingFor === 'everyone') {
    return [...femaleMockMatches, ...maleMockMatches];
  }
  if (lookingFor === 'men') {
    return maleMockMatches;
  }
  if (lookingFor === 'women') {
    return femaleMockMatches;
  }
  return [...femaleMockMatches, ...maleMockMatches];
};

// Default export for backwards compatibility (shows women by default)
export const mockMatches: Match[] = femaleMockMatches;

export const mockConnections: Match[] = [
  {
    id: '7',
    name: 'Mia',
    age: 30,
    photo: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400',
    photos: [
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400',
      'https://images.unsplash.com/photo-1502767089025-6572583495f7?w=400',
    ],
    bio: 'Family therapist who believes in the power of connection. Love hiking and home cooking.',
    occupation: 'Family Therapist',
    location: 'Portland, OR',
    compatibilityScore: 91,
    compatibilityBreakdown: {
      attachment: 95,
      mbti: 88,
      loveLanguage: 90,
      values: 94,
      lifestyle: 88,
    },
    attachmentStyle: 'Secure',
    mbtiType: 'INFJ',
    loveLanguages: ['time', 'words'] as LoveLanguage[],
    sharedValues: ['Family', 'Trust', 'Adventure'],
    sharedInterests: ['Hiking', 'Cooking', 'Psychology'],
    isVerified: true,
    verificationLevel: 'id',
    redFlagProfile: {
      narcissismScore: 6,
      manipulationRisk: 4,
      emotionalAvailability: 95,
      consistencyScore: 98,
      flags: [],
    },
    hasWarnings: false,
    lastMessage: 'That sounds wonderful! I\'d love to hear more about...',
    lastMessageTime: '2m ago',
  },
  {
    id: '8',
    name: 'Charlotte',
    age: 28,
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    photos: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
      'https://images.unsplash.com/photo-1496440737103-cd596325d314?w=400',
    ],
    bio: 'Writer and podcast host exploring what it means to live authentically. Tea enthusiast.',
    occupation: 'Content Creator',
    location: 'Chicago, IL',
    compatibilityScore: 88,
    compatibilityBreakdown: {
      attachment: 92,
      mbti: 85,
      loveLanguage: 88,
      values: 90,
      lifestyle: 85,
    },
    attachmentStyle: 'Secure',
    mbtiType: 'ENFP',
    loveLanguages: ['words', 'time'] as LoveLanguage[],
    sharedValues: ['Growth', 'Authenticity'],
    sharedInterests: ['Writing', 'Podcasts', 'Personal Growth'],
    isVerified: true,
    verificationLevel: 'photo',
    redFlagProfile: {
      narcissismScore: 10,
      manipulationRisk: 8,
      emotionalAvailability: 90,
      consistencyScore: 92,
      flags: [],
    },
    hasWarnings: false,
    lastMessage: 'I completely agree with you on that!',
    lastMessageTime: '1h ago',
  },
];

export const attachmentQuestions = [
  {
    id: 'aq1',
    question: 'When my partner seems distant, I...',
    options: [
      { text: 'Feel comfortable giving them space', style: 'secure' },
      { text: 'Worry and seek reassurance', style: 'anxious' },
      { text: 'Pull away and focus on myself', style: 'avoidant' },
      { text: 'Feel confused about what to do', style: 'disorganized' },
    ],
  },
  {
    id: 'aq2',
    question: 'In relationships, I find it...',
    options: [
      { text: 'Easy to be close and depend on others', style: 'secure' },
      { text: 'Hard not to worry about being abandoned', style: 'anxious' },
      { text: 'Difficult to fully trust or depend on partners', style: 'avoidant' },
      { text: 'Scary yet desperately wanted', style: 'disorganized' },
    ],
  },
  {
    id: 'aq3',
    question: 'When conflict arises, I typically...',
    options: [
      { text: 'Address it calmly and openly', style: 'secure' },
      { text: 'Fear it means the relationship is ending', style: 'anxious' },
      { text: 'Shut down or walk away', style: 'avoidant' },
      { text: 'Feel overwhelmed and react unpredictably', style: 'disorganized' },
    ],
  },
  {
    id: 'aq4',
    question: 'My ideal relationship involves...',
    options: [
      { text: 'Balanced closeness and independence', style: 'secure' },
      { text: 'Very close emotional connection', style: 'anxious' },
      { text: 'Plenty of personal space and freedom', style: 'avoidant' },
      { text: 'I\'m not sure what I want', style: 'disorganized' },
    ],
  },
];

export const valueOptions = [
  'Authenticity',
  'Adventure',
  'Growth',
  'Family',
  'Career',
  'Creativity',
  'Health',
  'Loyalty',
  'Independence',
  'Communication',
  'Stability',
  'Travel',
  'Trust',
  'Humor',
  'Spirituality',
];

export const criticalQuestionSuggestions = [
  'What does a perfect Sunday look like for you?',
  'How do you handle disagreements in relationships?',
  'What\'s something you\'re working on improving about yourself?',
  'How important is family to you?',
  'What does emotional support look like to you?',
  'How do you prefer to spend quality time together?',
];

// Deeper psychological questions organized by category
export interface DeepQuestion {
  id: string;
  category: 'emotional_depth' | 'conflict_style' | 'vulnerability' | 'life_vision' | 'relationship_patterns';
  question: string;
  whyItMatters: string;
  followUp?: string;
}

export const deepQuestionBank: DeepQuestion[] = [
  // Emotional Depth
  {
    id: 'deep1',
    category: 'emotional_depth',
    question: 'When was the last time you cried, and what caused it?',
    whyItMatters: 'Reveals emotional openness and what moves them deeply',
    followUp: 'How comfortable are you showing emotions to a partner?',
  },
  {
    id: 'deep2',
    category: 'emotional_depth',
    question: 'What\'s a belief you held strongly that you\'ve changed your mind about?',
    whyItMatters: 'Shows intellectual humility and capacity for growth',
  },
  {
    id: 'deep3',
    category: 'emotional_depth',
    question: 'What does intimacy mean to you beyond physical connection?',
    whyItMatters: 'Reveals their depth of understanding about true connection',
  },

  // Conflict Style
  {
    id: 'conflict1',
    category: 'conflict_style',
    question: 'Describe a disagreement with someone close. What did you learn about yourself?',
    whyItMatters: 'Shows self-awareness and ability to reflect after conflict',
  },
  {
    id: 'conflict2',
    category: 'conflict_style',
    question: 'Do you tend to address issues immediately or need time to process first?',
    whyItMatters: 'Understanding processing styles prevents misunderstandings',
  },
  {
    id: 'conflict3',
    category: 'conflict_style',
    question: 'How do you know when you need to apologize?',
    whyItMatters: 'Reveals accountability and emotional maturity',
  },

  // Vulnerability
  {
    id: 'vuln1',
    category: 'vulnerability',
    question: 'What\'s something you struggle with that most people don\'t know?',
    whyItMatters: 'Tests willingness to be authentic and vulnerable',
  },
  {
    id: 'vuln2',
    category: 'vulnerability',
    question: 'What\'s your biggest fear in a relationship?',
    whyItMatters: 'Reveals attachment patterns and needs',
  },
  {
    id: 'vuln3',
    category: 'vulnerability',
    question: 'When you\'re stressed, do you want space or support?',
    whyItMatters: 'Critical for understanding how to be there for each other',
  },

  // Life Vision
  {
    id: 'vision1',
    category: 'life_vision',
    question: 'Where do you see yourself in 5 years, and who is beside you?',
    whyItMatters: 'Reveals long-term thinking and relationship expectations',
  },
  {
    id: 'vision2',
    category: 'life_vision',
    question: 'What would you sacrifice for love? What wouldn\'t you?',
    whyItMatters: 'Shows priorities and non-negotiables',
  },
  {
    id: 'vision3',
    category: 'life_vision',
    question: 'How do you define a successful relationship?',
    whyItMatters: 'Ensures aligned expectations about what you\'re building toward',
  },

  // Relationship Patterns
  {
    id: 'pattern1',
    category: 'relationship_patterns',
    question: 'What pattern from past relationships do you want to break?',
    whyItMatters: 'Shows self-awareness and commitment to growth',
  },
  {
    id: 'pattern2',
    category: 'relationship_patterns',
    question: 'What did your parents\' relationship teach you about love?',
    whyItMatters: 'Often reveals subconscious relationship models',
  },
  {
    id: 'pattern3',
    category: 'relationship_patterns',
    question: 'How do you show love when words feel inadequate?',
    whyItMatters: 'Reveals love language in action during difficult moments',
  },
];

export const questionCategories = [
  { id: 'emotional_depth', label: 'Emotional Depth', icon: 'heart', color: '#E07A5F' },
  { id: 'conflict_style', label: 'Conflict Style', icon: 'shield', color: '#81B29A' },
  { id: 'vulnerability', label: 'Vulnerability', icon: 'unlock', color: '#9333EA' },
  { id: 'life_vision', label: 'Life Vision', icon: 'compass', color: '#3B82F6' },
  { id: 'relationship_patterns', label: 'Relationship Patterns', icon: 'repeat', color: '#F2CC8F' },
];

// MBTI Questions
export interface MBTIQuestion {
  id: string;
  question: string;
  options: { text: string; value: string }[];
}

export const mbtiQuestions: MBTIQuestion[] = [
  {
    id: 'mbti1',
    question: 'At a party, you typically...',
    options: [
      { text: 'Talk to many people', value: 'E' },
      { text: 'Stay with a few close friends', value: 'I' },
    ],
  },
  {
    id: 'mbti2',
    question: 'You prefer to focus on...',
    options: [
      { text: 'Facts and details', value: 'S' },
      { text: 'Ideas and possibilities', value: 'N' },
    ],
  },
  {
    id: 'mbti3',
    question: 'When making decisions, you rely more on...',
    options: [
      { text: 'Logic and analysis', value: 'T' },
      { text: 'Values and feelings', value: 'F' },
    ],
  },
  {
    id: 'mbti4',
    question: 'You prefer your life to be...',
    options: [
      { text: 'Planned and organized', value: 'J' },
      { text: 'Flexible and spontaneous', value: 'P' },
    ],
  },
  {
    id: 'mbti5',
    question: 'After socializing, you feel...',
    options: [
      { text: 'Energized and excited', value: 'E' },
      { text: 'Need time to recharge', value: 'I' },
    ],
  },
  {
    id: 'mbti6',
    question: 'You trust more in...',
    options: [
      { text: 'Experience and what works', value: 'S' },
      { text: 'Intuition and hunches', value: 'N' },
    ],
  },
  {
    id: 'mbti7',
    question: 'In disagreements, you value...',
    options: [
      { text: 'Being fair and consistent', value: 'T' },
      { text: 'Harmony and understanding', value: 'F' },
    ],
  },
  {
    id: 'mbti8',
    question: 'You work better with...',
    options: [
      { text: 'Clear deadlines', value: 'J' },
      { text: 'Open-ended timelines', value: 'P' },
    ],
  },
];

// Love Language Questions
export interface LoveLanguageQuestion {
  id: string;
  question: string;
  options: { text: string; language: string }[];
}

export const loveLanguageQuestions: LoveLanguageQuestion[] = [
  {
    id: 'll1',
    question: 'I feel most loved when my partner...',
    options: [
      { text: 'Tells me they love me', language: 'words' },
      { text: 'Helps with tasks', language: 'acts' },
    ],
  },
  {
    id: 'll2',
    question: 'I prefer to show love by...',
    options: [
      { text: 'Giving thoughtful gifts', language: 'gifts' },
      { text: 'Spending quality time', language: 'time' },
    ],
  },
  {
    id: 'll3',
    question: 'What matters most to me is...',
    options: [
      { text: 'Physical affection', language: 'touch' },
      { text: 'Words of encouragement', language: 'words' },
    ],
  },
  {
    id: 'll4',
    question: 'I appreciate when my partner...',
    options: [
      { text: 'Does chores for me', language: 'acts' },
      { text: 'Holds my hand', language: 'touch' },
    ],
  },
  {
    id: 'll5',
    question: 'The best gift is...',
    options: [
      { text: 'Undivided attention', language: 'time' },
      { text: 'A meaningful present', language: 'gifts' },
    ],
  },
];

// Deal Breaker Options
export interface DealBreakerOption {
  id: string;
  label: string;
  options: { value: string; label: string }[];
}

export const dealBreakerOptions: DealBreakerOption[] = [
  {
    id: 'smoking',
    label: 'Smoking (Tobacco)',
    options: [
      { value: 'never', label: 'Non-smokers only' },
      { value: 'sometimes', label: 'Occasional OK' },
      { value: 'any', label: 'No preference' },
    ],
  },
  {
    id: 'drinking',
    label: 'Alcohol',
    options: [
      { value: 'never', label: 'Non-drinkers only' },
      { value: 'social', label: 'Social drinking OK' },
      { value: 'any', label: 'No preference' },
    ],
  },
  {
    id: 'cannabis',
    label: 'Cannabis Use',
    options: [
      { value: 'never', label: 'No cannabis users' },
      { value: 'occasional', label: 'Occasional OK' },
      { value: 'any', label: 'No preference' },
    ],
  },
  {
    id: 'hasKids',
    label: 'Has Children',
    options: [
      { value: 'no', label: 'No kids' },
      { value: 'yes', label: 'Has kids OK' },
      { value: 'any', label: 'No preference' },
    ],
  },
  {
    id: 'wantsKids',
    label: 'Wants Children',
    options: [
      { value: 'yes', label: 'Must want kids' },
      { value: 'no', label: 'Doesn\'t want kids' },
      { value: 'any', label: 'No preference' },
    ],
  },
  {
    id: 'drugs',
    label: 'Other Substances',
    options: [
      { value: 'no', label: 'No other drug use' },
      { value: 'any', label: 'No preference' },
    ],
  },
];

// Red Flag Questions for detecting narcissistic/manipulative tendencies
export interface RedFlagQuestion {
  id: string;
  question: string;
  description: string;
}

export const redFlagQuestions: RedFlagQuestion[] = [
  {
    id: 'rf1',
    question: 'How do you typically respond when someone criticizes you?',
    description: 'Measures emotional regulation and openness to feedback',
  },
  {
    id: 'rf2',
    question: 'In past relationships, how often were conflicts your fault?',
    description: 'Assesses accountability and self-awareness',
  },
  {
    id: 'rf3',
    question: 'How quickly do you expect exclusivity in a relationship?',
    description: 'Identifies potential love-bombing behavior',
  },
  {
    id: 'rf4',
    question: 'How do you feel about your partner spending time with friends?',
    description: 'Measures controlling tendencies',
  },
];

// AI Conversation Starters based on compatibility
export const aiConversationStarters = {
  highCompatibility: [
    "I noticed you both value {value}. Ask them about a time when this shaped an important decision!",
    "Your attachment styles complement each other well. You might enjoy discussing your communication preferences.",
    "You share {interest} as an interest. What first drew you to it?",
  ],
  loveLanguageTips: {
    words: "They appreciate verbal affirmation. Try complimenting something specific about their profile!",
    acts: "They value actions over words. Offer to help with something or suggest a thoughtful date idea.",
    gifts: "Thoughtful gestures matter to them. Mention something you'd love to share or experience together.",
    time: "Quality time is their priority. Suggest an activity you could do together on a first date.",
    touch: "Physical connection is important to them. When you meet, a warm greeting will go a long way.",
  },
  attachmentTips: {
    secure: "They have a secure attachment style - they'll appreciate direct, honest communication.",
    anxious: "They may need extra reassurance. Respond promptly and be clear about your intentions.",
    avoidant: "Give them space and don't push for quick commitment. Let things develop naturally.",
    disorganized: "Be patient and consistent. Building trust takes time.",
  },
};
