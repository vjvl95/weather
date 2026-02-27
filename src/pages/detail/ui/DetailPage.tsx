import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export function DetailPage() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-3xl font-bold text-gray-900 mb-4">Detail</Text>
      <Text className="text-gray-500 mb-8">Stack 네비게이션 예시 (Modal)</Text>

      <Pressable className="px-6 py-3 bg-gray-200 rounded-xl" onPress={() => router.back()}>
        <Text className="text-gray-900 font-semibold">Close</Text>
      </Pressable>
    </View>
  );
}
