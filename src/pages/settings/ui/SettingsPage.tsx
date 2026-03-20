import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocation } from '@features/location';

export function SettingsPage() {
  const router = useRouter();
  const { currentLocation, requestGpsLocation } = useLocation();

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">설정</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-4">
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
