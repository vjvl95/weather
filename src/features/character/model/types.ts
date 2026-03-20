import type {
  CharacterPresentationState,
  CharacterRuntimeState,
  WeatherCondition,
  AnchorId,
} from '@shared/types';

/** Character Store 상태 */
export interface CharacterStoreState {
  /** 현재 날씨 조건 */
  currentCondition: WeatherCondition;
  /** 날씨 → 캐릭터 매핑 결과 (표현 상태) */
  presentation: CharacterPresentationState | null;
  /** UI 런타임 상태 */
  runtime: CharacterRuntimeState;
}

/** Character Store 액션 */
export interface CharacterStoreActions {
  /** 날씨 조건 변경 → 표현 상태 자동 업데이트 */
  setCondition: (condition: WeatherCondition) => void;
  /** 말풍선 표시 (랜덤 메시지 선택) */
  showBubble: () => void;
  /** 말풍선 숨김 */
  hideBubble: () => void;
  /** 현재 앵커 포인트 변경 */
  setAnchor: (anchorId: AnchorId) => void;
  /** 쓰다듬기 상태 토글 */
  setIsPetting: (isPetting: boolean) => void;
  /** 리액션 쿨다운 설정 */
  setReactionCooldown: (until: number) => void;
}
