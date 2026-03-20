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

export function WeatherIcon({ condition, size = 24 }: WeatherIconProps) {
  return (
    <View className="items-center justify-center">
      <Text style={{ fontSize: size }}>{WEATHER_EMOJI[condition]}</Text>
    </View>
  );
}
