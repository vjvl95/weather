import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CharacterView } from '@widgets/character-view';
import { useWeatherFetch } from '@features/weather-fetch';
import { useLocation } from '@features/location';
import { useCharacterState } from '@features/character';
import { TemperatureText } from '@entities/weather';

export function HomePage() {
  const router = useRouter();
  const { currentLocation, requestGpsLocation } = useLocation();
  const { current, isLoading, error, fetchWeather } = useWeatherFetch();
  const { updateForWeather } = useCharacterState();

  // 초기 위치 + 날씨 로딩
  useEffect(() => {
    requestGpsLocation();
  }, []);

  // 위치 변경 시 날씨 가져오기 (FSD: gridX/gridY 파라미터로 전달)
  useEffect(() => {
    if (currentLocation) {
      fetchWeather(currentLocation.gridX, currentLocation.gridY);
    }
  }, [currentLocation]);

  // 날씨 변경 시 캐릭터 업데이트
  useEffect(() => {
    if (current) {
      updateForWeather(current.condition);
    }
  }, [current]);

  return (
    <View className="flex-1">
      <CharacterView />

      {/* 오버레이: 위치 + 날씨 정보 */}
      <SafeAreaView className="absolute inset-0" edges={['top']}>
        {/* 상단: 위치 */}
        <TouchableOpacity
          className="items-center pt-4"
          onPress={() => router.push('/city-search')}
        >
          <Text className="text-white/80 text-sm">현재 위치</Text>
          <Text className="text-white text-lg font-semibold">
            {currentLocation?.name ?? '위치를 불러오는 중...'}
          </Text>
        </TouchableOpacity>

        {/* 하단: 현재 온도 + 날씨 설명 */}
        {current && (
          <View className="absolute bottom-24 left-0 right-0 items-center">
            <TemperatureText temperature={current.temperature} size="lg" />
            <Text className="text-white text-base mt-1">{current.description}</Text>
          </View>
        )}

        {/* 에러 표시 */}
        {error && (
          <View className="absolute bottom-32 left-0 right-0 items-center px-8">
            <Text className="text-red-300 text-sm text-center">{error}</Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
