import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@features/theme-manager';

export function DetailPage() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
      <View
        className="w-20 h-1 rounded-full mb-8"
        style={{ backgroundColor: colors.border }}
      />

      <Text
        className="text-4xl font-bold mb-4"
        style={{ color: colors.text.primary }}
      >
        Detail
      </Text>

      <Text
        className="text-lg mb-12"
        style={{ color: colors.text.secondary }}
      >
        Modal presentation example
      </Text>

      <Pressable
        className="px-10 py-4 rounded-2xl active:opacity-70"
        style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
        onPress={() => router.back()}
      >
        <Text
          className="font-bold text-lg"
          style={{ color: colors.text.primary }}
        >
          Close
        </Text>
      </Pressable>
    </View>
  );
}
