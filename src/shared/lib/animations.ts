import { Easing, type EasingFunction } from 'react-native-reanimated';

/**
 * 이동/전환에 사용할 easing 배열
 * 매번 같은 느낌이 반복되지 않도록 시드 기반 랜덤 선택
 */
export const EASING_VARIANTS: EasingFunction[] = [
  Easing.inOut(Easing.ease),
  Easing.inOut(Easing.quad),
  Easing.bezier(0.25, 0.1, 0.25, 1),
  Easing.bezier(0.42, 0, 0.58, 1),
  Easing.inOut(Easing.cubic),
];

/**
 * 시드 기반 easing 선택
 */
export function pickEasing(seed: number): EasingFunction {
  const index = Math.abs(seed) % EASING_VARIANTS.length;
  return EASING_VARIANTS[index];
}
