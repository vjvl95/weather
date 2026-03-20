import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState, useMemo } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { useWeatherFetch } from '@features/weather-fetch';
import { useLocation } from '@features/location';
import { useCharacterState } from '@features/character';
import { WeatherBackground, AmbientEffects } from '@widgets/character-view';
import { WeatherIcon } from '@entities/weather';
import { getSunTimes } from '@shared/lib';
import type { HourlyForecast } from '@shared/types';

/** 날짜별로 예보를 그룹핑 */
interface DayGroup {
  label: string;
  date: string;
  forecasts: HourlyForecast[];
  maxTemp: number;
  minTemp: number;
}

function groupByDay(hourly: HourlyForecast[]): DayGroup[] {
  const groups = new Map<string, HourlyForecast[]>();

  for (const item of hourly) {
    let dateKey: string;
    if (item.time.startsWith('내일')) dateKey = '내일';
    else if (item.time.startsWith('모레')) dateKey = '모레';
    else if (item.time.includes('/')) dateKey = item.time.split(' ')[0];
    else dateKey = '오늘';

    if (!groups.has(dateKey)) groups.set(dateKey, []);
    groups.get(dateKey)!.push(item);
  }

  const result: DayGroup[] = [];
  for (const [dateKey, forecasts] of groups) {
    const temps = forecasts.map((f) => f.temperature);
    result.push({
      label: dateKey,
      date: dateKey,
      forecasts,
      maxTemp: Math.max(...temps),
      minTemp: Math.min(...temps),
    });
  }

  return result;
}

/** 풍향 → 방향 텍스트 */
function getWindDirection(deg: number): string {
  const dirs = ['북', '북동', '동', '남동', '남', '남서', '서', '북서'];
  return dirs[Math.round(deg / 45) % 8];
}

/** 대기질 등급 → 텍스트 색상 */
function getAqColor(grade: string): string {
  switch (grade) {
    case '좋음': return 'text-green-400';
    case '보통': return 'text-blue-300';
    case '나쁨': return 'text-yellow-400';
    case '매우나쁨': return 'text-red-400';
    default: return 'text-white';
  }
}

export function HourlyPage() {
  const { current, hourly, airQuality, isLoading, error, fetchWeather } = useWeatherFetch();
  const { currentLocation, requestGpsLocation, isLoading: locationLoading } = useLocation();
  const { presentation } = useCharacterState();

  const bgColors = presentation?.backgroundColors ?? ['#87CEEB', '#5BA3D9'] as [string, string];
  const effectPreset = presentation?.effectPreset ?? 'sun-glow';
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!currentLocation && !locationLoading) {
      requestGpsLocation();
    }
  }, []);

  useEffect(() => {
    if (hourly.length === 0 && currentLocation && !isLoading) {
      fetchWeather(currentLocation.gridX, currentLocation.gridY);
    }
  }, [currentLocation]);

  const noLocation = !currentLocation && !locationLoading;
  const loading = locationLoading || (isLoading && hourly.length === 0);

  const dayGroups = useMemo(() => groupByDay(hourly), [hourly]);
  const [selectedDay, setSelectedDay] = useState(0);
  const activeGroup = dayGroups[selectedDay] ?? dayGroups[0];

  // 선택된 날짜의 평균 바람/습도/최대 강수확률
  const avgWind = activeGroup
    ? Math.round(activeGroup.forecasts.reduce((s, f) => s + f.windSpeed, 0) / activeGroup.forecasts.length * 10) / 10
    : 0;
  const avgHumidity = activeGroup
    ? Math.round(activeGroup.forecasts.reduce((s, f) => s + f.humidity, 0) / activeGroup.forecasts.length)
    : 0;
  const maxRainChance = activeGroup
    ? Math.max(...activeGroup.forecasts.map((f) => f.rainChance))
    : 0;
  const maxWind = activeGroup
    ? Math.max(...activeGroup.forecasts.map((f) => f.windSpeed))
    : 0;

  return (
    <WeatherBackground colors={bgColors}>
    <View className="flex-1">
      <View className="absolute inset-0" style={{ zIndex: 0, opacity: 0.2 }} pointerEvents="none">
        {isFocused && <AmbientEffects effectPreset={effectPreset} />}
      </View>
    <SafeAreaView className="flex-1" style={{ zIndex: 1 }} edges={['top']}>
      {noLocation ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-white/80 text-base text-center mb-4">위치 정보가 필요해요</Text>
          <TouchableOpacity className="bg-white/20 rounded-2xl px-6 py-3" onPress={requestGpsLocation}>
            <Text className="text-white font-medium">위치 허용하기</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="rgba(255,255,255,0.7)" />
          <Text className="text-white/60 text-sm mt-3">날씨를 불러오는 중...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-white/80 text-sm text-center mb-3">{error}</Text>
          <TouchableOpacity
            className="bg-white/20 rounded-2xl px-5 py-2"
            onPress={() => currentLocation && fetchWeather(currentLocation.gridX, currentLocation.gridY)}
          >
            <Text className="text-white text-sm">다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* 헤더 */}
          <View className="px-6 pt-4 pb-2">
            <Text className="text-2xl font-bold text-white">시간별 예보</Text>
            <Text className="text-white/70 text-sm mt-1">{currentLocation?.name ?? ''}</Text>
          </View>

          {/* 현재 날씨 요약 */}
          {current && (
            <View className="mx-6 mt-2 p-4 rounded-2xl flex-row items-center justify-between" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              <View className="flex-row items-center">
                <WeatherIcon condition={current.condition} size={36} hour={new Date().getHours()} />
                <View className="ml-3">
                  <Text className="text-white text-2xl font-bold">{Math.round(current.temperature)}°C</Text>
                  <Text className="text-white/70 text-xs">{current.description} · 체감 {Math.round(current.feelsLike)}°C</Text>
                </View>
              </View>
              <View className="items-end">
                {currentLocation && (() => {
                  const sun = getSunTimes(currentLocation.latitude, currentLocation.longitude);
                  return (
                    <>
                      <Text className="text-white/70 text-sm">
                        {'\u2600\uFE0F'} {sun.sunrise}
                      </Text>
                      <Text className="text-white/70 text-sm mt-0.5">
                        {'\uD83C\uDF19'} {sun.sunset}
                      </Text>
                    </>
                  );
                })()}
              </View>
            </View>
          )}

          {/* 날짜 탭 */}
          <View className="flex-row mx-6 mt-4 rounded-2xl overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
            {dayGroups.map((group, index) => (
              <TouchableOpacity
                key={group.date}
                className="flex-1 py-3 items-center"
                style={selectedDay === index ? { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16 } : undefined}
                onPress={() => setSelectedDay(index)}
              >
                <Text className={`text-sm font-medium ${selectedDay === index ? 'text-white' : 'text-white/50'}`}>
                  {group.label}
                </Text>
                <Text className={`text-xs mt-0.5 ${selectedDay === index ? 'text-white/70' : 'text-white/30'}`}>
                  {Math.round(group.minTemp)}°~{Math.round(group.maxTemp)}°C
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 시간별 가로 스크롤 — 아이콘 + 온도만 깔끔하게 */}
          {activeGroup && (
            <View className="mt-4">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                {activeGroup.forecasts.map((item, index) => {
                  const isFirst = index === 0 && selectedDay === 0;
                  const displayTime = item.time.includes(' ') ? item.time.split(' ').pop()! : item.time;
                  const itemHour = Number(displayTime.split(':')[0]);
                  return (
                    <View
                      key={`${item.time}-${index}`}
                      className="items-center mr-1 py-3 rounded-2xl"
                      style={{
                        backgroundColor: isFirst ? 'rgba(255,255,255,0.2)' : 'transparent',
                        paddingHorizontal: 14,
                      }}
                    >
                      <Text className={`text-xs ${isFirst ? 'font-bold text-white' : 'text-white/60'}`}>
                        {isFirst ? '지금' : displayTime}
                      </Text>
                      <View className="my-2">
                        <WeatherIcon condition={item.condition} size={26} hour={itemHour} />
                      </View>
                      <Text className={`text-sm ${isFirst ? 'font-bold text-white' : 'text-white/90'}`}>
                        {Math.round(item.temperature)}°
                      </Text>
                      <Text className={`text-xs mt-1 ${item.rainChance >= 50 ? 'text-blue-300' : 'text-white/40'}`}>
                        💧{item.rainChance}%
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* 상세 정보 카드 모듈 — 바람, 습도, 강수 분리 */}
          {activeGroup && (
            <View className="mx-6 mt-5 mb-8">
              <Text className="text-white/70 text-sm mb-3">상세 정보</Text>

              <View className="flex-row gap-3">
                {/* 강수 카드 */}
                <View className="flex-1 p-4 rounded-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <Text className="text-white/50 text-xs">💧 강수확률</Text>
                  <Text className={`text-2xl font-bold mt-1 ${maxRainChance >= 50 ? 'text-blue-300' : 'text-white'}`}>
                    {maxRainChance}%
                  </Text>
                  <Text className="text-white/40 text-xs mt-1">
                    {maxRainChance >= 60 ? '우산을 챙기세요' : maxRainChance >= 30 ? '비 올 수 있어요' : '맑은 하루'}
                  </Text>
                </View>

                {/* 습도 카드 */}
                <View className="flex-1 p-4 rounded-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <Text className="text-white/50 text-xs">💦 습도</Text>
                  <Text className="text-2xl font-bold text-white mt-1">{avgHumidity}%</Text>
                  <Text className="text-white/40 text-xs mt-1">
                    {avgHumidity >= 80 ? '매우 습함' : avgHumidity >= 60 ? '다소 습함' : avgHumidity >= 40 ? '적당함' : '건조함'}
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-3 mt-3">
                {/* 바람 카드 */}
                <View className="flex-1 p-4 rounded-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <Text className="text-white/50 text-xs">🌬️ 바람</Text>
                  <Text className="text-2xl font-bold text-white mt-1">{avgWind}m/s</Text>
                  <Text className="text-white/40 text-xs mt-1">
                    {maxWind >= 10 ? '강풍 주의' : maxWind >= 5 ? '약간 바람' : '바람 없음'}
                    {activeGroup.forecasts[0] ? ` · ${getWindDirection(activeGroup.forecasts[0].windDirection)}풍` : ''}
                  </Text>
                </View>

                {/* 기온차 카드 */}
                <View className="flex-1 p-4 rounded-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <Text className="text-white/50 text-xs">🌡️ 기온차</Text>
                  <Text className="text-2xl font-bold text-white mt-1">
                    {Math.round(activeGroup.maxTemp - activeGroup.minTemp)}°
                  </Text>
                  <Text className="text-white/40 text-xs mt-1">
                    {Math.round(activeGroup.minTemp)}° ~ {Math.round(activeGroup.maxTemp)}°C
                  </Text>
                </View>
              </View>

              {/* 대기질 카드 */}
              {airQuality && (
                <>
                  <Text className="text-white/70 text-sm mt-5 mb-3">대기질</Text>
                  <View className="flex-row gap-3">
                    {/* 미세먼지 PM10 */}
                    <View className="flex-1 p-4 rounded-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                      <Text className="text-white/50 text-xs">😷 미세먼지</Text>
                      <Text className={`text-2xl font-bold mt-1 ${getAqColor(airQuality.pm10Grade)}`}>
                        {airQuality.pm10Value ?? '-'}
                      </Text>
                      <Text className="text-white/40 text-xs mt-1">
                        {airQuality.pm10Grade} · PM10 ㎍/㎥
                      </Text>
                    </View>

                    {/* 초미세먼지 PM2.5 */}
                    <View className="flex-1 p-4 rounded-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                      <Text className="text-white/50 text-xs">🫁 초미세먼지</Text>
                      <Text className={`text-2xl font-bold mt-1 ${getAqColor(airQuality.pm25Grade)}`}>
                        {airQuality.pm25Value ?? '-'}
                      </Text>
                      <Text className="text-white/40 text-xs mt-1">
                        {airQuality.pm25Grade} · PM2.5 ㎍/㎥
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row gap-3 mt-3">
                    {/* 통합대기지수 */}
                    <View className="flex-1 p-4 rounded-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                      <Text className="text-white/50 text-xs">🌫️ 통합대기지수</Text>
                      <Text className={`text-2xl font-bold mt-1 ${getAqColor(airQuality.khaiGrade)}`}>
                        {airQuality.khaiValue ?? '-'}
                      </Text>
                      <Text className="text-white/40 text-xs mt-1">
                        {airQuality.khaiGrade}
                      </Text>
                    </View>

                    {/* 측정 정보 */}
                    <View className="flex-1 p-4 rounded-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                      <Text className="text-white/50 text-xs">📍 측정소</Text>
                      <Text className="text-base font-bold text-white mt-1">
                        {airQuality.stationName}
                      </Text>
                      <Text className="text-white/40 text-xs mt-1">
                        {airQuality.dataTime}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
    </View>
    </WeatherBackground>
  );
}
