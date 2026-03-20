import { View, Text } from 'react-native';
import { WeatherIcon, TemperatureText } from '@entities/weather';
import type { DailyForecast } from '@shared/types';

interface WeeklyItemProps {
  item: DailyForecast;
  isToday?: boolean;
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export function WeeklyItem({ item, isToday = false }: WeeklyItemProps) {
  const date = new Date(item.date);
  const dayName = DAY_NAMES[date.getDay()];

  return (
    <View className={`flex-row items-center justify-between px-6 py-4 ${isToday ? 'bg-white/10 rounded-2xl' : ''}`}>
      {/* 요일 */}
      <Text className={`w-12 text-base ${isToday ? 'font-bold text-white' : 'text-white/80'}`}>
        {isToday ? '오늘' : dayName}
      </Text>

      {/* 날씨 아이콘 */}
      <WeatherIcon condition={item.condition} size={28} />

      {/* 최저/최고 온도 */}
      <View className="flex-row items-center gap-3">
        <TemperatureText temperature={item.temperatureMin} size="sm" />
        <Text className="text-white/40">/</Text>
        <TemperatureText temperature={item.temperatureMax} size="sm" />
      </View>
    </View>
  );
}
