import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useCounterStore } from '@features/counter';
import { ExampleCard } from '@entities/example';

export function HomePage() {
  const router = useRouter();
  const { count, increment, decrement } = useCounterStore();

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-3xl font-bold text-gray-900 mb-8">Home</Text>

      <ExampleCard title="Counter" description="FSD 패턴 예시: Feature → Entity → Shared">
        <View className="flex-row items-center gap-4 mt-4">
          <Pressable
            className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center"
            onPress={decrement}
          >
            <Text className="text-white text-xl font-bold">-</Text>
          </Pressable>
          <Text className="text-2xl font-bold text-gray-900 w-12 text-center">{count}</Text>
          <Pressable
            className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center"
            onPress={increment}
          >
            <Text className="text-white text-xl font-bold">+</Text>
          </Pressable>
        </View>
      </ExampleCard>

      <Pressable
        className="mt-8 px-6 py-3 bg-blue-500 rounded-xl"
        onPress={() => router.push('/detail')}
      >
        <Text className="text-white font-semibold">Open Detail (Stack)</Text>
      </Pressable>
    </View>
  );
}
