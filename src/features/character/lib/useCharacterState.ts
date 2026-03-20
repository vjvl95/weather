import { useCallback } from 'react';
import { useCharacterStore } from '../model/useCharacterStore';
import type { WeatherCondition } from '@shared/types';
import { BUBBLE_CONFIG } from '@shared/config';

/**
 * pages/widgets 레이어에서 캐릭터 상태를 소비하는 훅
 *
 * store 직접 접근 대신 이 훅을 통해 접근 (Public API)
 */
export function useCharacterState() {
  const {
    currentCondition,
    presentation,
    runtime,
    setCondition,
    showBubble,
    hideBubble,
    setIsPetting,
    setReactionCooldown,
  } = useCharacterStore();

  /** 날씨 변경 시 캐릭터 업데이트 */
  const updateForWeather = useCallback(
    (condition: WeatherCondition) => {
      if (condition !== currentCondition) {
        setCondition(condition);
        showBubble();
      }
    },
    [currentCondition, setCondition, showBubble],
  );

  /** 캐릭터 탭 시 */
  const onCharacterTap = useCallback(() => {
    if (runtime.isBubbleVisible) {
      hideBubble();
    } else {
      showBubble();
      setReactionCooldown(Date.now() + BUBBLE_CONFIG.tapCooldown);
    }
  }, [runtime.isBubbleVisible, showBubble, hideBubble, setReactionCooldown]);

  /** 쓰다듬기 시작/끝 */
  const onPetStart = useCallback(() => setIsPetting(true), [setIsPetting]);
  const onPetEnd = useCallback(() => setIsPetting(false), [setIsPetting]);

  return {
    currentCondition,
    presentation,
    runtime,
    updateForWeather,
    onCharacterTap,
    onPetStart,
    onPetEnd,
    hideBubble,
  };
}
