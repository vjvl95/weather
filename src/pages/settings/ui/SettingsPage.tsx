import { View, Text } from 'react-native';

export function SettingsPage() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-3xl font-bold text-gray-900 mb-4">Settings</Text>
      <Text className="text-gray-500">앱 설정 화면</Text>
    </View>
  );
}
