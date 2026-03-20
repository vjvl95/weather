import { View, Text, TouchableOpacity, RefreshControl, ScrollView, AppState, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CharacterView } from '@widgets/character-view';
import { useWeatherFetch } from '@features/weather-fetch';
import { useLocation } from '@features/location';
import { useCharacterState } from '@features/character';
import { TemperatureText, WeatherIcon } from '@entities/weather';

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
      fetchWeather(currentLocation.gridX, currentLocation.gridY);
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
      await fetchWeather(currentLocation.gridX, currentLocation.gridY);
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
          {/* 상단: 위치명 (터치로 도시 검색) */}
          <TouchableOpacity
            className="items-center pt-4"
            onPress={() => router.push('/city-search')}
          >
            <Text className="text-white/80 text-sm">현재 위치</Text>
            <Text className="text-white text-lg font-semibold">
              {currentLocation?.name ?? '위치를 불러오는 중...'}
            </Text>
          </TouchableOpacity>

          {/* 초기 로딩 표시 */}
          {isInitialLoading && (
            <View className="flex-1 items-center justify-center" pointerEvents="none">
              <ActivityIndicator size="large" color="rgba(255,255,255,0.7)" />
              <Text className="text-white/60 text-sm mt-3">날씨를 불러오는 중...</Text>
            </View>
          )}

          {/* 하단: 현재 온도 + 날씨 + 시간별 미리보기 */}
          {current && (
            <View className="absolute bottom-20 left-0 right-0 items-center" pointerEvents="none">
              {/* 현재 온도 */}
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
            </View>
          )}

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

          {/* 디버그 패널 — 출시 전 제거 */}
          {__DEV__ && (
            <View className="absolute top-16 right-3" style={{ backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8, padding: 8, maxWidth: 200 }} pointerEvents="none">
              <Text style={{ color: '#0f0', fontSize: 9, fontFamily: 'monospace' }}>
                [DEBUG]{'\n'}
                위치: {currentLocation ? `${currentLocation.name} (${currentLocation.gridX},${currentLocation.gridY})` : '없음'}{'\n'}
                GPS로딩: {locationLoading ? 'Y' : 'N'}{'\n'}
                API로딩: {isLoading ? 'Y' : 'N'}{'\n'}
                날씨: {current ? `${current.condition} ${current.temperature}°` : '없음'}{'\n'}
                시간별: {hourly.length}개{'\n'}
                에러: {error ?? '없음'}
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
