import { LinearGradient } from 'expo-linear-gradient';

interface WeatherBackgroundProps {
  colors: [string, string];
  children: React.ReactNode;
}

/**
 * 날씨에 따라 배경 그라데이션이 부드럽게 전환
 *
 * Phase 1: 단순 그라데이션만 적용
 * Phase 2 (WO-014): 시간대별 톤 보정 + Skia 효과 추가
 */
export function WeatherBackground({ colors, children }: WeatherBackgroundProps) {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      className="flex-1"
    >
      {children}
    </LinearGradient>
  );
}
