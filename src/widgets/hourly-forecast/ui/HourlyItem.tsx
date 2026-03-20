import { View, Text } from 'react-native';
import { WeatherIcon, TemperatureText } from '@entities/weather';
import type { HourlyForecast } from '@shared/types';

interface HourlyItemProps {
  item: HourlyForecast;
  isNow?: boolean;
}

export function HourlyItem({ item, isNow = false }: HourlyItemProps) {
  return (
    <View className={`items-center px-4 py-3 ${isNow ? 'bg-white/20 rounded-2xl' : ''}`}>
      <Text className={`text-sm mb-2 ${isNow ? 'font-bold text-white' : 'text-white/80'}`}>
        {isNow ? '지금' : item.time}
      </Text>
      <WeatherIcon condition={item.condition} size={28} />
      <TemperatureText temperature={item.temperature} size="sm" />
    </View>
  );
}
