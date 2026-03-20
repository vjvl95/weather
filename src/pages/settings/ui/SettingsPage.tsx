import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocation } from '@features/location';
import { useCharacterState } from '@features/character';
import type { WeatherCondition } from '@shared/types';

const WEATHER_OPTIONS: { condition: WeatherCondition; label: string; emoji: string }[] = [
  { condition: 'sunny', label: '맑음', emoji: '☀️' },
  { condition: 'cloudy', label: '흐림', emoji: '☁️' },
  { condition: 'rainy', label: '비', emoji: '🌧️' },
  { condition: 'snowy', label: '눈', emoji: '❄️' },
  { condition: 'night', label: '밤', emoji: '🌙' },
];

export function SettingsPage() {
  const router = useRouter();
  const { currentLocation, requestGpsLocation } = useLocation();
  const { currentCondition, updateForWeather } = useCharacterState();

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">설정</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-4">
        {/* 캐릭터 미리보기 섹션 */}
        <View className="bg-white rounded-2xl p-4 mb-4">
          <Text className="text-base font-semibold text-gray-900 mb-3">캐릭터 날씨 변경</Text>
          <Text className="text-sm text-gray-500 mb-3">날씨를 선택하면 몽글이가 변해요</Text>

          <View className="flex-row flex-wrap gap-2">
            {WEATHER_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.condition}
                className={`flex-row items-center px-4 py-3 rounded-xl ${
                  currentCondition === opt.condition
                    ? 'bg-blue-500'
                    : 'bg-gray-100'
                }`}
                onPress={() => updateForWeather(opt.condition)}
              >
                <Text className="text-lg mr-2">{opt.emoji}</Text>
                <Text
                  className={`text-sm font-medium ${
                    currentCondition === opt.condition
                      ? 'text-white'
                      : 'text-gray-700'
                  }`}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 위치 관리 섹션 */}
        <View className="bg-white rounded-2xl p-4 mb-4">
          <Text className="text-base font-semibold text-gray-900 mb-3">위치 관리</Text>

          {/* 현재 위치 */}
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <View>
              <Text className="text-sm text-gray-500">현재 위치</Text>
              <Text className="text-base text-gray-900">
                {currentLocation?.name ?? '설정되지 않음'}
              </Text>
            </View>
            <TouchableOpacity
              className="bg-blue-50 px-4 py-2 rounded-xl"
              onPress={requestGpsLocation}
            >
              <Text className="text-blue-600 text-sm font-medium">GPS 갱신</Text>
            </TouchableOpacity>
          </View>

          {/* 도시 검색 */}
          <TouchableOpacity
            className="flex-row items-center justify-between py-3"
            onPress={() => router.push('/city-search')}
          >
            <Text className="text-base text-gray-900">도시 검색</Text>
            <Text className="text-gray-400 text-lg">›</Text>
          </TouchableOpacity>
        </View>

        {/* 앱 정보 */}
        <View className="bg-white rounded-2xl p-4 mb-4">
          <Text className="text-base font-semibold text-gray-900 mb-3">앱 정보</Text>
          <View className="flex-row items-center justify-between py-2">
            <Text className="text-gray-500">버전</Text>
            <Text className="text-gray-900">1.0.0</Text>
          </View>
          <View className="flex-row items-center justify-between py-2">
            <Text className="text-gray-500">데이터 제공</Text>
            <Text className="text-gray-900">기상청</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
