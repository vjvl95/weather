import type { ImageSourcePropType } from 'react-native';
import type { WeatherCondition } from './weather';

/** 캐릭터 감정 상태 */
export type CharacterMood = 'happy' | 'sleepy' | 'cozy' | 'sad' | 'excited' | 'calm';

/** 기본 idle 모션 프리셋 (Calm First 원칙: 과하지 않은 기본 상태) */
export type MotionPreset =
  | 'float-soft'      // 비: 부드러운 부유
  | 'float-sleepy'    // 흐림: 느린 부유
  | 'bounce-happy'    // 맑음/눈: 밝고 가벼운 바운스
  | 'settle-night';   // 밤: 안정적인 최소 움직임

// shiver-cold는 idle 프리셋에서 제외
// → 온도 밴드 기반 reaction으로 이동 (v2 또는 별도 reaction 시스템)

/** 배경 효과 프리셋 */
export type EffectPreset =
  | 'sun-glow'
  | 'cloud-drift'
  | 'rain-fall'
  | 'snow-fall'
  | 'night-stars';

/** 캐릭터 에셋 정보 */
export interface CharacterAsset {
  image: ImageSourcePropType;
  expression: string;
}

/** 캐릭터 표현 상태 (날씨 → 캐릭터 매핑 결과) */
export interface CharacterPresentationState {
  weatherCondition: WeatherCondition;
  mood: CharacterMood;
  motionPreset: MotionPreset;
  effectPreset: EffectPreset;
  bubbleMessages: string[];
  backgroundColors: [string, string]; // [top, bottom] gradient
  asset: CharacterAsset;
}

/** 앵커 포인트 ID */
export type AnchorId =
  | 'center-hero'
  | 'top-left-drift'
  | 'top-right-drift'
  | 'left-peek'
  | 'right-peek'
  | 'bottom-rest';

/** 캐릭터 런타임 상태 (짧게 변하는 UI 반응용) */
export interface CharacterRuntimeState {
  anchorId: AnchorId;
  isBubbleVisible: boolean;
  currentBubbleMessage: string | null;
  isBeingPetted: boolean;
  reactionCooldownUntil: number | null;
  lastAutoMoveAt: number | null;
}
