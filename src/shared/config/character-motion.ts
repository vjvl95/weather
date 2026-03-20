import type { AnchorId, MotionPreset } from '@shared/types';

/** 앵커 포인트 좌표 (화면 비율 기준, 0~1) — 화면 중앙 부근에 배치 */
export const ANCHOR_POINTS: Record<AnchorId, { x: number; y: number }> = {
  'center-hero':     { x: 0.5, y: 0.50 },
  'top-left-drift':  { x: 0.38, y: 0.43 },
  'top-right-drift': { x: 0.62, y: 0.43 },
  'left-peek':       { x: 0.35, y: 0.52 },
  'right-peek':      { x: 0.65, y: 0.52 },
  'bottom-rest':     { x: 0.5, y: 0.58 },
};

/** 모션 프리셋별 애니메이션 파라미터 */
export const MOTION_PARAMS: Record<MotionPreset, {
  floatAmplitude: number;   // translateY 진폭 (px)
  floatDuration: number;    // 한 사이클 시간 (ms)
  rotateAmplitude: number;  // 미세 회전 범위 (deg)
}> = {
  'float-soft':    { floatAmplitude: 6, floatDuration: 3000, rotateAmplitude: 1.5 },
  'float-sleepy':  { floatAmplitude: 4, floatDuration: 4000, rotateAmplitude: 0.8 },
  'bounce-happy':  { floatAmplitude: 10, floatDuration: 2500, rotateAmplitude: 2.0 },
  'settle-night':  { floatAmplitude: 3, floatDuration: 4500, rotateAmplitude: 0.5 },
  // shiver-cold 제거: 800ms/3deg는 idle이 아닌 reaction 수준
  // → v2 온도 밴드 기반 reaction 시스템에서 사용
};

/** 자동 이동 타이밍 */
export const AUTO_MOVE_CONFIG = {
  /** 이동 간격 최소/최대 (ms) */
  intervalMin: 6000,
  intervalMax: 14000,
  /** 이동 애니메이션 시간 (ms) */
  moveDuration: 2000,
  /** 야간 이동 빈도 배수 (2 = 절반 빈도) */
  nightSlowdown: 2,
};

/** 말풍선 타이밍 */
export const BUBBLE_CONFIG = {
  /** 자동 표시 후 숨김까지 (ms) */
  autoHideDuration: 4000,
  /** 탭 후 쿨다운 (ms) */
  tapCooldown: 2000,
  /** 방치 후 자동 말풍선 (ms) */
  idleCheckInDelay: 30000,
};
