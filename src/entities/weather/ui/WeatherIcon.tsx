import { View, Text } from 'react-native';
import type { WeatherIconProps } from '../model/types';
import type { WeatherCondition } from '@shared/types';

const WEATHER_EMOJI: Record<WeatherCondition, string> = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧️',
  snowy: '❄️',
  night: '🌙',
};

/**
 * 시간대별 달 이모지
 *
 * 18시: 🌕 둥근달 (해 진 직후)
 * 19시: 🌖 기울어지기 시작
 * 20시: 🌗 반달
 * 22시: 🌘 그믐달
 * 00~02시: 🌙 초승달 (가장 깊은 밤)
 * 03시: 🌘 다시 밝아지기 시작
 * 04시: 🌗 반달
 * 05시: 🌖 거의 둥근달
 */
function getMoonEmoji(hour: number): string {
  if (hour === 18) return '🌕';
  if (hour === 19) return '🌖';
  if (hour === 20 || hour === 21) return '🌗';
  if (hour === 22 || hour === 23) return '🌘';
  if (hour >= 0 && hour <= 2) return '🌑';
  if (hour === 3) return '🌘';
  if (hour === 4) return '🌗';
  if (hour === 5) return '🌖';
  return '🌑';
}

export function WeatherIcon({ condition, size = 24, hour }: WeatherIconProps) {
  const emoji = condition === 'night' && hour !== undefined
    ? getMoonEmoji(hour)
    : WEATHER_EMOJI[condition];

  return (
    <View className="items-center justify-center">
      <Text style={{ fontSize: size }}>{emoji}</Text>
    </View>
  );
}
