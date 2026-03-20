import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HourlyForecast } from '@widgets/hourly-forecast';
import { useWeatherFetch } from '@features/weather-fetch';
import { useCharacterState } from '@features/character';

export function HourlyPage() {
  const { hourly, isLoading } = useWeatherFetch();
  const { presentation } = useCharacterState();

  const bgColor = presentation?.backgroundColors?.[0] ?? '#87CEEB';

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: bgColor }} edges={['top']}>
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-white">시간별 예보</Text>
        <Text className="text-white/70 text-sm mt-1">오늘의 시간별 날씨예요</Text>
      </View>

      <View className="flex-1 pt-4">
        <HourlyForecast forecasts={hourly} />
      </View>
    </SafeAreaView>
  );
}
