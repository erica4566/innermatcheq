import React, { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { HelpCircle, X } from 'lucide-react-native';
import * as Haptics from '@/lib/haptics';

interface InfoTooltipProps {
  title: string;
  content: string;
  bulletPoints?: string[];
  iconSize?: number;
  iconColor?: string;
}

export default function InfoTooltip({
  title,
  content,
  bulletPoints,
  iconSize = 14,
  iconColor = '#A0A8AB',
}: InfoTooltipProps) {
  const [visible, setVisible] = useState(false);

  const handleOpen = () => {
    Haptics.selectionAsync();
    setVisible(true);
  };

  const handleClose = () => {
    Haptics.selectionAsync();
    setVisible(false);
  };

  return (
    <>
      <Pressable
        onPress={handleOpen}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        className="ml-1"
      >
        <HelpCircle size={iconSize} color={iconColor} />
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <Pressable
          className="flex-1 bg-black/40 items-center justify-center px-6"
          onPress={handleClose}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Animated.View
              entering={ZoomIn.duration(200)}
              className="bg-white rounded-2xl p-5 w-full max-w-sm"
            >
              {/* Header */}
              <View className="flex-row items-center justify-between mb-3">
                <Text
                  className="text-lg text-[#2D3436]"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  {title}
                </Text>
                <Pressable
                  onPress={handleClose}
                  className="w-8 h-8 rounded-full bg-[#F5F0ED] items-center justify-center"
                >
                  <X size={16} color="#636E72" />
                </Pressable>
              </View>

              {/* Content */}
              <Text
                className="text-sm text-[#636E72] leading-6 mb-3"
                style={{ fontFamily: 'Outfit_400Regular' }}
              >
                {content}
              </Text>

              {/* Bullet Points */}
              {bulletPoints && bulletPoints.length > 0 && (
                <View className="mt-2">
                  {bulletPoints.map((point, index) => (
                    <View key={index} className="flex-row items-start mb-2">
                      <View className="w-1.5 h-1.5 rounded-full bg-[#E07A5F] mt-2 mr-2" />
                      <Text
                        className="flex-1 text-sm text-[#636E72]"
                        style={{ fontFamily: 'Outfit_400Regular' }}
                      >
                        {point}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Got it button */}
              <Pressable
                onPress={handleClose}
                className="bg-[#E07A5F] rounded-xl py-3 mt-4 active:scale-[0.98]"
              >
                <Text
                  className="text-white text-center"
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  Got it
                </Text>
              </Pressable>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
