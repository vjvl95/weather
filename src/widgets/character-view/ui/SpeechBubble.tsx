import { View, Text } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useEffect } from 'react';
import { BUBBLE_CONFIG } from '@shared/config';

interface SpeechBubbleProps {
  message: string | null;
  visible: boolean;
  onAutoHide: () => void;
}

/**
 * 캐릭터 위에 표시되는 말풍선
 *
 * - Spring fade-in, 200ms fade-out
 * - 자동 숨김 타이머 내장
 */
export function SpeechBubble({ message, visible, onAutoHide }: SpeechBubbleProps) {
  // 자동 숨김 타이머
  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(() => {
      onAutoHide();
    }, BUBBLE_CONFIG.autoHideDuration);

    return () => clearTimeout(timer);
  }, [visible, onAutoHide]);

  if (!visible || !message) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      exiting={FadeOut.duration(200)}
      className="absolute bg-white rounded-2xl px-5 py-3 shadow-md"
      style={{ bottom: 190, alignSelf: 'center', maxWidth: 280 }}
    >
      <Text className="text-base text-gray-800 text-center leading-6">
        {message}
      </Text>
      {/* 말풍선 꼬리 */}
      <View
        className="absolute -bottom-2 left-1/2 -ml-2 w-0 h-0"
        style={{
          borderLeftWidth: 8,
          borderRightWidth: 8,
          borderTopWidth: 8,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: 'white',
        }}
      />
    </Animated.View>
  );
}
