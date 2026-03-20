import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WeeklyForecast } from '@widgets/weekly-forecast';
import { useWeatherFetch } from '@features/weather-fetch';
import { useCharacterState } from '@features/character';

export function WeeklyPage() {
  const { daily, isLoading } = useWeatherFetch();
  const { presentation } = useCharacterState();

  const bgColor = presentation?.backgroundColors?.[0] ?? '#87CEEB';

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: bgColor }} edges={['top']}>
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-white">주간 예보</Text>
        <Text className="text-white/70 text-sm mt-1">이번 주 날씨를 확인하세요</Text>
      </View>

      <ScrollView className="flex-1 pt-4">
        <WeeklyForecast forecasts={daily} />
      </ScrollView>
    </SafeAreaView>
  );
}
