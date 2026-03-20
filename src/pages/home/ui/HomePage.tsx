import { View, Text, TouchableOpacity, RefreshControl, ScrollView, AppState, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CharacterView } from '@widgets/character-view';
import { useWeatherFetch } from '@features/weather-fetch';
import { useLocation } from '@features/location';
import { useCharacterState } from '@features/character';
import { TemperatureText, WeatherIcon } from '@entities/weather';
import type { WeatherCondition } from '@shared/types';

/** 날씨별 카드 배경색 — 배경 그라데이션과 어울리도록 살짝 어둡고 반투명 */
const CARD_BG: Record<WeatherCondition, string> = {
  sunny: 'rgba(70, 140, 200, 0.35)',
  cloudy: 'rgba(100, 100, 110, 0.4)',
  rainy: 'rgba(60, 70, 90, 0.45)',
  snowy: 'rgba(130, 150, 180, 0.4)',
  night: 'rgba(80, 80, 140, 0.8)',
};

export function HomePage() {
  const router = useRouter();
  const { currentLocation, requestGpsLocation, isLoading: locationLoading } = useLocation();
  const { current, hourly, isLoading, error, fetchWeather, refreshIfNeeded } = useWeatherFetch();
  const { updateForWeather, presentation } = useCharacterState();

  // 초기 위치 + 날씨 로딩
  useEffect(() => {
    requestGpsLocation();
  }, []);

  // 위치 변경 시 날씨 가져오기
  useEffect(() => {
    if (currentLocation) {
      fetchWeather(currentLocation.gridX, currentLocation.gridY, currentLocation.latitude, currentLocation.longitude, currentLocation.name);
    }
  }, [currentLocation]);

  // 날씨 변경 시 캐릭터 업데이트
  useEffect(() => {
    if (current) {
      updateForWeather(current.condition);
    }
  }, [current]);

  // 앱 포그라운드 복귀 시 자동 갱신 (30분 간격)
  const appState = useRef(AppState.currentState);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        if (currentLocation) {
          refreshIfNeeded(currentLocation.gridX, currentLocation.gridY);
        }
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, [currentLocation, refreshIfNeeded]);

  // Pull-to-refresh
  const onRefresh = useCallback(async () => {
    if (currentLocation) {
      await fetchWeather(currentLocation.gridX, currentLocation.gridY, currentLocation.latitude, currentLocation.longitude);
    } else {
      await requestGpsLocation();
    }
  }, [currentLocation, fetchWeather, requestGpsLocation]);

  // 초기 로딩 상태
  const isInitialLoading = !current && (isLoading || locationLoading);

  return (
    <View className="flex-1">
      {/* 캐릭터 배경 */}
      <View className="absolute inset-0" style={{ zIndex: 10 }}>
        <CharacterView />
      </View>

      {/* 오버레이 — 터치 통과시켜서 캐릭터 조작 가능 */}
      <SafeAreaView className="absolute inset-0" style={{ zIndex: 20 }} edges={['top']} pointerEvents="box-none">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flex: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={onRefresh}
              tintColor="rgba(255,255,255,0.7)"
            />
          }
          pointerEvents="box-none"
        >
          {/* 상단 카드: 위치 + 현재 날씨 정보 */}
          <View className="mx-4 mt-2" pointerEvents="box-none">
            <View
              className="w-full rounded-3xl px-6 py-5 items-center"
              style={{
                backgroundColor: current ? CARD_BG[current.condition] : 'rgba(70, 140, 200, 0.35)',
              }}
            >
              {/* 위치명 */}
              <TouchableOpacity
                className="items-center"
                onPress={() => router.push('/city-search')}
              >
                <Text className="text-white/70 text-xs">현재 위치</Text>
                <Text className="text-white text-base font-semibold">
                  {currentLocation?.name ?? '위치를 불러오는 중...'}
                </Text>
              </TouchableOpacity>

              {/* 현재 온도 + 날씨 */}
              {current ? (
                <>
                  <TemperatureText temperature={current.temperature} size="lg" />
                  <View className="flex-row items-center mt-1">
                    <WeatherIcon condition={current.condition} size={18} hour={new Date().getHours()} />
                    <Text className="text-white text-base ml-1">{current.description}</Text>
                  </View>

                  {/* 체감온도 + 습도 */}
                  <View className="flex-row items-center mt-2 gap-4">
                    <Text className="text-white/60 text-xs">
                      체감 {Math.round(current.feelsLike)}°C
                    </Text>
                    <Text className="text-white/60 text-xs">
                      습도 {current.humidity}%
                    </Text>
                  </View>
                </>
              ) : isInitialLoading ? (
                <View className="items-center py-4">
                  <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" />
                  <Text className="text-white/60 text-xs mt-2">날씨를 불러오는 중...</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* 에러 표시 */}
          {error && !isLoading && (
            <View className="absolute bottom-32 left-0 right-0 items-center px-8" pointerEvents="box-none">
              <TouchableOpacity
                className="bg-black/30 rounded-2xl px-5 py-3"
                onPress={onRefresh}
              >
                <Text className="text-white/90 text-sm text-center">{error}</Text>
                <Text className="text-white/60 text-xs text-center mt-1">탭하여 다시 시도</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
