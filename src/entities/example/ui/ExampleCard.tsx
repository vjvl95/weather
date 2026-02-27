import { View, Text } from 'react-native';
import type { ExampleCardProps } from '../model/types';

export function ExampleCard({ title, description, children }: ExampleCardProps) {
  return (
    <View className="w-full p-6 bg-gray-50 rounded-2xl">
      <Text className="text-lg font-bold text-gray-900">{title}</Text>
      <Text className="text-sm text-gray-500 mt-1">{description}</Text>
      {children}
    </View>
  );
}
