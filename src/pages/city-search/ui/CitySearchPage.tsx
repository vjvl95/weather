import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocation } from '@features/location';
import type { LocationInfo } from '@shared/types';

/** 주요 도시 목록 (격자 좌표 포함) */
const MAJOR_CITIES: LocationInfo[] = [
  { name: '서울', latitude: 37.5665, longitude: 126.9780, gridX: 60, gridY: 127 },
  { name: '부산', latitude: 35.1796, longitude: 129.0756, gridX: 98, gridY: 76 },
  { name: '대구', latitude: 35.8714, longitude: 128.6014, gridX: 89, gridY: 90 },
  { name: '인천', latitude: 37.4563, longitude: 126.7052, gridX: 55, gridY: 124 },
  { name: '광주', latitude: 35.1595, longitude: 126.8526, gridX: 58, gridY: 74 },
  { name: '대전', latitude: 36.3504, longitude: 127.3845, gridX: 67, gridY: 100 },
  { name: '울산', latitude: 35.5384, longitude: 129.3114, gridX: 102, gridY: 84 },
  { name: '세종', latitude: 36.4800, longitude: 127.0000, gridX: 66, gridY: 103 },
  { name: '수원', latitude: 37.2636, longitude: 127.0286, gridX: 60, gridY: 121 },
  { name: '제주', latitude: 33.4996, longitude: 126.5312, gridX: 52, gridY: 38 },
  { name: '춘천', latitude: 37.8813, longitude: 127.7298, gridX: 73, gridY: 134 },
  { name: '강릉', latitude: 37.7519, longitude: 128.8761, gridX: 92, gridY: 131 },
  { name: '전주', latitude: 35.8242, longitude: 127.1480, gridX: 63, gridY: 89 },
  { name: '청주', latitude: 36.6424, longitude: 127.4890, gridX: 69, gridY: 106 },
  { name: '포항', latitude: 36.0190, longitude: 129.3435, gridX: 102, gridY: 94 },
];

export function CitySearchPage() {
  const router = useRouter();
  const { setCurrentLocation } = useLocation();
  const [query, setQuery] = useState('');

  const filteredCities = useMemo(() => {
    if (!query.trim()) return MAJOR_CITIES;
    return MAJOR_CITIES.filter((city) =>
      city.name.includes(query.trim()),
    );
  }, [query]);

  const handleSelectCity = (city: LocationInfo) => {
    setCurrentLocation(city);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* 헤더 */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="pr-3">
          <Text className="text-blue-600 text-base">닫기</Text>
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900 flex-1 text-center">
          도시 검색
        </Text>
        <View className="w-12" />
      </View>

      {/* 검색 입력 */}
      <View className="px-4 py-3">
        <TextInput
          className="bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-900"
          placeholder="도시 이름을 검색하세요"
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
      </View>

      {/* 도시 목록 */}
      <FlatList
        data={filteredCities}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="flex-row items-center px-6 py-4 border-b border-gray-50"
            onPress={() => handleSelectCity(item)}
          >
            <Text className="text-base text-gray-900">{item.name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="items-center py-8">
            <Text className="text-gray-400">검색 결과가 없어요</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
