import '../src/global.css';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { ErrorBoundary } from '@shared/ui';
import { useTheme } from '@features/theme-manager';

// 앱 실행 시 SplashScreen 유지
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isDark } = useTheme();
  const [appIsReady, setAppIsReady] = useState(false);

  // 폰트 로딩 (실제 폰트 파일이 없으면 에러가 나므로, 템플릿 단계에선 일단 주석 처리하거나 기본 폰트 사용)
  const [fontsLoaded, fontsError] = useFonts({
    // 'Pretendard-Bold': require('../assets/fonts/Pretendard-Bold.ttf'),
  });

  useEffect(() => {
    async function prepare() {
      try {
        // 인위적인 지연이나 초기 설정 로직 (Zustand Hydration 등)을 여기에 추가 가능
        // await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      // 폰트가 로드되었거나, 에러가 났을 때(시스템 폰트로 대체) SplashScreen 숨김
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <ErrorBoundary onReset={() => {}}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="detail" options={{ presentation: 'modal' }} />
        </Stack>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
