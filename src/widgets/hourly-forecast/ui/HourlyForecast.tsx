import { View, Text, ScrollView } from 'react-native';
import type { HourlyForecast as HourlyForecastType } from '@shared/types';
import { HourlyItem } from './HourlyItem';

interface HourlyForecastProps {
  forecasts: HourlyForecastType[];
}

export function HourlyForecast({ forecasts }: HourlyForecastProps) {
  if (forecasts.length === 0) {
    return (
      <View className="items-center py-8">
        <Text className="text-gray-400">시간별 예보를 불러오는 중이에요...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {forecasts.map((item, index) => (
          <HourlyItem
            key={`${item.time}-${index}`}
            item={item}
            isNow={index === 0}
          />
        ))}
      </ScrollView>
    </View>
  );
}
