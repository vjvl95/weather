import { useEffect, useRef, useCallback } from 'react';
import { useCharacterStore } from '../model/useCharacterStore';
import { useReducedMotion } from 'react-native-reanimated';
import {
  ANCHOR_POINTS,
  AUTO_MOVE_CONFIG,
  BUBBLE_CONFIG,
} from '@shared/config';
import type { AnchorId } from '@shared/types';
import { mulberry32 } from '@shared/lib';

const rng = mulberry32(Date.now());

/**
 * 앵커 간 인접 그래프 (허용 경로만 정의)
 *
 * 자유 선택이 아닌 인접 앵커만 이동 가능
 * 이유: 긴 대각선 점프나 UI를 가로지르는 이동 방지
 */
const ANCHOR_ADJACENCY: Record<AnchorId, AnchorId[]> = {
  'center-hero':     ['top-left-drift', 'top-right-drift', 'left-peek', 'right-peek', 'bottom-rest'],
  'top-left-drift':  ['center-hero', 'left-peek'],
  'top-right-drift': ['center-hero', 'right-peek'],
  'left-peek':       ['center-hero', 'top-left-drift', 'bottom-rest'],
  'right-peek':      ['center-hero', 'top-right-drift', 'bottom-rest'],
  'bottom-rest':     ['center-hero', 'left-peek', 'right-peek'],
};

/**
 * 캐릭터 자동 행동 디렉터
 *
 * 책임:
 * 1. 일정 간격으로 앵커 포인트 사이 자동 이동
 * 2. 방치 시 자동 말풍선 표시
 * 3. 야간 빈도 조절
 * 4. Reduced Motion 대응
 *
 * 이 훅은 CharacterView에서 한 번만 호출
 */
export function useCharacterDirector() {
  const reduceMotion = useReducedMotion();
  const {
    presentation,
    runtime,
    setAnchor,
    showBubble,
  } = useCharacterStore();

  const moveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isNight = presentation?.weatherCondition === 'night';

  /** 다음 앵커 포인트 선택 (인접 앵커만 허용) */
  const pickNextAnchor = useCallback((): AnchorId => {
    const currentAnchor = runtime.anchorId;
    const neighbors = ANCHOR_ADJACENCY[currentAnchor];
    const index = Math.floor(rng() * neighbors.length);
    return neighbors[index];
  }, [runtime.anchorId]);

  /** 랜덤 이동 간격 계산 */
  const getNextInterval = useCallback((): number => {
    const { intervalMin, intervalMax, nightSlowdown } = AUTO_MOVE_CONFIG;
    const base = intervalMin + rng() * (intervalMax - intervalMin);
    return isNight ? base * nightSlowdown : base;
  }, [isNight]);

  /** 자동 이동 스케줄링 */
  const scheduleNextMove = useCallback(() => {
    if (reduceMotion) return;

    moveTimerRef.current = setTimeout(() => {
      const nextAnchor = pickNextAnchor();
      setAnchor(nextAnchor);
      scheduleNextMove();
    }, getNextInterval());
  }, [reduceMotion, pickNextAnchor, getNextInterval, setAnchor]);

  /** 방치 시 자동 말풍선 */
  const scheduleIdleCheckIn = useCallback(() => {
    idleTimerRef.current = setTimeout(() => {
      showBubble();
      scheduleIdleCheckIn();
    }, BUBBLE_CONFIG.idleCheckInDelay);
  }, [showBubble]);

  useEffect(() => {
    scheduleNextMove();
    scheduleIdleCheckIn();

    return () => {
      if (moveTimerRef.current) clearTimeout(moveTimerRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [scheduleNextMove, scheduleIdleCheckIn]);

  /** 상호작용 시 자동 이동 타이머 리셋 */
  const onInteraction = useCallback(() => {
    if (moveTimerRef.current) clearTimeout(moveTimerRef.current);
    scheduleNextMove();

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    scheduleIdleCheckIn();
  }, [scheduleNextMove, scheduleIdleCheckIn]);

  /** 자동 이동 일시 중지 (드래그 중 사용) */
  const pauseAutoMove = useCallback(() => {
    if (moveTimerRef.current) clearTimeout(moveTimerRef.current);
  }, []);

  /** 자동 이동 재개 */
  const resumeAutoMove = useCallback(() => {
    if (moveTimerRef.current) clearTimeout(moveTimerRef.current);
    scheduleNextMove();
  }, [scheduleNextMove]);

  const currentAnchorPosition = ANCHOR_POINTS[runtime.anchorId];

  return {
    currentAnchorPosition,
    onInteraction,
    pauseAutoMove,
    resumeAutoMove,
  };
}
