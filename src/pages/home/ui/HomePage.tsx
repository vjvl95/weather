import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useCounterStore } from '@features/counter';
import { ExampleCard } from '@entities/example';
import { useTheme } from '@features/theme-manager';
import { LinearGradient } from 'expo-linear-gradient';

export function HomePage() {
  const router = useRouter();
  const { count, increment, decrement } = useCounterStore();
  const { colors, isDark } = useTheme();

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <LinearGradient
        colors={[isDark ? colors.surface : colors.primary, colors.background]}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 300 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="opacity-20"
      />

      <View className="flex-1 items-center justify-center px-6">
        <Text
          className="text-4xl font-bold mb-8"
          style={{ color: colors.text.primary }}
        >
          Home
        </Text>

        <ExampleCard title="Counter" description="FSD 패턴 예시: Feature → Entity → Shared">
          <View className="flex-row items-center gap-4 mt-4">
            <Pressable
              className="w-12 h-12 rounded-full items-center justify-center active:opacity-70"
              style={{ backgroundColor: colors.primary }}
              onPress={decrement}
            >
              <Text className="text-white text-2xl font-bold">-</Text>
            </Pressable>

            <Text
              className="text-3xl font-bold w-16 text-center"
              style={{ color: colors.text.primary }}
            >
              {count}
            </Text>

            <Pressable
              className="w-12 h-12 rounded-full items-center justify-center active:opacity-70"
              style={{ backgroundColor: colors.primary }}
              onPress={increment}
            >
              <Text className="text-white text-2xl font-bold">+</Text>
            </Pressable>
          </View>
        </ExampleCard>

        <Pressable
          className="mt-12 px-10 py-4 rounded-2xl active:opacity-80 shadow-sm"
          style={{ backgroundColor: colors.primary }}
          onPress={() => router.push('/detail')}
        >
          <Text className="text-white font-bold text-lg">Open Detail</Text>
        </Pressable>
      </View>
    </View>
  );
}
