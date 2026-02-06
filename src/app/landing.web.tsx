/**
 * InnerMatchEQ Web - Landing Page
 *
 * This is a web-only component that serves as the landing page for the web app.
 * It showcases the app's features and provides sign up/sign in options.
 */

import React from 'react';
import { View, Text, Pressable, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Brain, Shield, Sparkles, CheckCircle, ArrowRight } from 'lucide-react-native';

const FEATURES = [
  {
    icon: Brain,
    title: 'Psychology-First Matching',
    description: 'Match based on attachment styles, MBTI, and emotional intelligence',
  },
  {
    icon: Heart,
    title: 'Deep Compatibility',
    description: 'Go beyond surface-level with love languages and values alignment',
  },
  {
    icon: Shield,
    title: 'Red Flag Detection',
    description: 'AI-powered analysis to identify potential relationship concerns',
  },
  {
    icon: Sparkles,
    title: 'Personalized Insights',
    description: 'Get detailed reports about yourself and your ideal partner',
  },
];

const TESTIMONIALS = [
  {
    quote: "Finally, an app that understands what makes relationships work.",
    author: "Sarah, 28",
  },
  {
    quote: "The psychology assessments helped me understand myself better.",
    author: "Michael, 32",
  },
  {
    quote: "I found someone who truly complements my personality.",
    author: "Emma, 26",
  },
];

export default function WebLandingPage() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-slate-950">
      {/* Hero Section */}
      <LinearGradient
        colors={['#0f172a', '#1e1b4b', '#312e81']}
        style={{ minHeight: 600, justifyContent: 'center', alignItems: 'center', padding: 24 }}
      >
        <View className="max-w-4xl w-full items-center">
          {/* Logo */}
          <View className="flex-row items-center mb-6">
            <Heart size={48} color="#f472b6" fill="#f472b6" />
            <Text className="text-4xl font-bold text-white ml-3">InnerMatch</Text>
            <Text className="text-4xl font-light text-pink-400">EQ</Text>
          </View>

          {/* Tagline */}
          <Text className="text-5xl font-bold text-white text-center mb-4">
            Find Love That Lasts
          </Text>
          <Text className="text-xl text-slate-300 text-center mb-8 max-w-xl">
            The psychology-first dating app that matches you based on emotional intelligence,
            attachment styles, and deep compatibility.
          </Text>

          {/* CTA Buttons */}
          <View className="flex-row gap-4">
            <Pressable
              onPress={() => router.push('/auth?mode=signup')}
              className="bg-pink-500 px-8 py-4 rounded-full"
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            >
              <Text className="text-white font-semibold text-lg">Get Started Free</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/auth?mode=signin')}
              className="bg-white/10 border border-white/30 px-8 py-4 rounded-full"
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            >
              <Text className="text-white font-semibold text-lg">Sign In</Text>
            </Pressable>
          </View>

          {/* Trust Badges */}
          <View className="flex-row items-center mt-8 gap-6">
            <View className="flex-row items-center">
              <CheckCircle size={20} color="#4ade80" />
              <Text className="text-slate-400 ml-2">Secure & Private</Text>
            </View>
            <View className="flex-row items-center">
              <CheckCircle size={20} color="#4ade80" />
              <Text className="text-slate-400 ml-2">No Fake Profiles</Text>
            </View>
            <View className="flex-row items-center">
              <CheckCircle size={20} color="#4ade80" />
              <Text className="text-slate-400 ml-2">Science-Based</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Features Section */}
      <View className="bg-slate-900 py-20 px-6">
        <View className="max-w-5xl mx-auto">
          <Text className="text-3xl font-bold text-white text-center mb-4">
            Why InnerMatch EQ?
          </Text>
          <Text className="text-lg text-slate-400 text-center mb-12 max-w-2xl mx-auto">
            We use proven psychological frameworks to help you find truly compatible partners.
          </Text>

          <View className="flex-row flex-wrap justify-center gap-6">
            {FEATURES.map((feature, index) => (
              <View
                key={index}
                className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 w-72"
              >
                <View className="w-12 h-12 bg-pink-500/20 rounded-xl items-center justify-center mb-4">
                  <feature.icon size={24} color="#f472b6" />
                </View>
                <Text className="text-xl font-semibold text-white mb-2">{feature.title}</Text>
                <Text className="text-slate-400">{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* How It Works */}
      <View className="bg-slate-950 py-20 px-6">
        <View className="max-w-5xl mx-auto">
          <Text className="text-3xl font-bold text-white text-center mb-12">
            How It Works
          </Text>

          <View className="flex-row justify-center gap-8 flex-wrap">
            {[
              { step: 1, title: 'Take Assessments', desc: 'Complete psychological assessments to understand yourself' },
              { step: 2, title: 'Get Matched', desc: 'Our algorithm finds compatible partners based on psychology' },
              { step: 3, title: 'Connect Deeply', desc: 'Start meaningful conversations with your matches' },
            ].map((item) => (
              <View key={item.step} className="items-center w-64">
                <View className="w-16 h-16 bg-pink-500 rounded-full items-center justify-center mb-4">
                  <Text className="text-white text-2xl font-bold">{item.step}</Text>
                </View>
                <Text className="text-xl font-semibold text-white mb-2">{item.title}</Text>
                <Text className="text-slate-400 text-center">{item.desc}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Testimonials */}
      <View className="bg-slate-900 py-20 px-6">
        <View className="max-w-5xl mx-auto">
          <Text className="text-3xl font-bold text-white text-center mb-12">
            What Our Members Say
          </Text>

          <View className="flex-row justify-center gap-6 flex-wrap">
            {TESTIMONIALS.map((testimonial, index) => (
              <View
                key={index}
                className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 w-80"
              >
                <Text className="text-lg text-slate-300 italic mb-4">"{testimonial.quote}"</Text>
                <Text className="text-pink-400 font-semibold">— {testimonial.author}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* CTA Section */}
      <LinearGradient
        colors={['#312e81', '#1e1b4b', '#0f172a']}
        style={{ padding: 48, alignItems: 'center' }}
      >
        <Text className="text-3xl font-bold text-white text-center mb-4">
          Ready to Find Your Match?
        </Text>
        <Text className="text-lg text-slate-300 text-center mb-8 max-w-xl">
          Join thousands of people finding meaningful connections through psychology-based matching.
        </Text>
        <Pressable
          onPress={() => router.push('/auth?mode=signup')}
          className="bg-pink-500 px-10 py-4 rounded-full flex-row items-center"
          style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
        >
          <Text className="text-white font-semibold text-lg mr-2">Start Your Journey</Text>
          <ArrowRight size={20} color="white" />
        </Pressable>
      </LinearGradient>

      {/* Footer */}
      <View className="bg-slate-950 py-12 px-6 border-t border-slate-800">
        <View className="max-w-5xl mx-auto">
          <View className="flex-row justify-between items-center flex-wrap gap-6">
            <View className="flex-row items-center">
              <Heart size={24} color="#f472b6" fill="#f472b6" />
              <Text className="text-xl font-bold text-white ml-2">InnerMatch</Text>
              <Text className="text-xl font-light text-pink-400">EQ</Text>
            </View>
            <View className="flex-row gap-6">
              <Pressable>
                <Text className="text-slate-400">Privacy Policy</Text>
              </Pressable>
              <Pressable>
                <Text className="text-slate-400">Terms of Service</Text>
              </Pressable>
              <Pressable>
                <Text className="text-slate-400">Contact</Text>
              </Pressable>
            </View>
          </View>
          <Text className="text-slate-500 text-center mt-8">
            © 2024 InnerMatch EQ. All rights reserved.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
