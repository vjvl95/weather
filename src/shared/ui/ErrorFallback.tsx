import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

type ErrorFallbackProps = {
  error: Error | null;
  /** 필수: ErrorBoundary 에러 상태를 초기화하는 콜백. 호출 없이 navigate하면 무한 루프 발생 */
  onReset: () => void;
};

export function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  const router = useRouter();

  const handleRetry = () => {
    // 에러 상태 초기화 → 자식 컴포넌트 재렌더링 시도
    onReset();
  };

  const handleGoHome = () => {
    onReset();           // ← 에러 상태 초기화 (필수, 먼저 호출)
    router.replace('/'); // ← 홈으로 이동
  };

  return (
    <View className="flex-1 justify-center items-center px-8 bg-white">
      <Text className="text-6xl mb-4">⚠️</Text>
      <Text className="text-xl font-bold text-gray-800 mb-2 text-center">
        문제가 발생했습니다
      </Text>
      <Text className="text-sm text-gray-500 mb-8 text-center">
        {error?.message ?? '알 수 없는 오류가 발생했습니다'}
      </Text>

      <View className="w-full gap-3">
        <Pressable
          className="w-full py-4 bg-blue-500 rounded-2xl active:opacity-80"
          onPress={handleRetry}
        >
          <Text className="text-white text-lg font-bold text-center">
            다시 시도
          </Text>
        </Pressable>

        <Pressable
          className="w-full py-4 bg-gray-200 rounded-2xl active:opacity-80"
          onPress={handleGoHome}
        >
          <Text className="text-gray-700 text-lg font-bold text-center">
            홈으로
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
