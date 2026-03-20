import { View, Text } from 'react-native';
import type { DailyForecast } from '@shared/types';
import { WeeklyItem } from './WeeklyItem';

interface WeeklyForecastProps {
  forecasts: DailyForecast[];
}

export function WeeklyForecast({ forecasts }: WeeklyForecastProps) {
  if (forecasts.length === 0) {
    return (
      <View className="items-center py-8">
        <Text className="text-gray-400">주간 예보를 불러오는 중이에요...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 px-4">
      {forecasts.map((item, index) => (
        <WeeklyItem
          key={item.date}
          item={item}
          isToday={index === 0}
        />
      ))}
    </View>
  );
}
