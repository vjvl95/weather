import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { WeeklyForecast } from '@widgets/weekly-forecast';
import { useWeatherFetch } from '@features/weather-fetch';
import { useLocation } from '@features/location';
import { useCharacterState } from '@features/character';

export function WeeklyPage() {
  const { daily, hourly, isLoading, error, fetchWeather } = useWeatherFetch();
  const { currentLocation } = useLocation();
  const { presentation } = useCharacterState();

  const bgColor = presentation?.backgroundColors?.[0] ?? '#87CEEB';

  // 데이터가 없으면 자동으로 로드
  useEffect(() => {
    if (hourly.length === 0 && currentLocation && !isLoading) {
      fetchWeather(currentLocation.gridX, currentLocation.gridY);
    }
  }, [hourly.length, currentLocation, isLoading]);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: bgColor }} edges={['top']}>
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-white">주간 예보</Text>
        <Text className="text-white/70 text-sm mt-1">이번 주 날씨를 확인하세요</Text>
      </View>

      {isLoading && daily.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="rgba(255,255,255,0.7)" />
          <Text className="text-white/60 text-sm mt-3">날씨를 불러오는 중...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-white/80 text-sm text-center">{error}</Text>
        </View>
      ) : daily.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-white/60 text-sm text-center">
            주간 예보는 아직 준비 중이에요{'\n'}(v1: 단기예보 데이터만 지원)
          </Text>
        </View>
      ) : (
        <ScrollView className="flex-1 pt-4">
          <WeeklyForecast forecasts={daily} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
