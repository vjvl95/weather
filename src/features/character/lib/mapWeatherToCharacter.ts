import type { WeatherCondition, CharacterPresentationState } from '@shared/types';
import { mulberry32 } from '@shared/lib';
import { WEATHER_CHARACTER_MAP } from '@shared/config';

/**
 * 날씨 조건을 캐릭터 표현 상태로 변환
 *
 * 순수 함수 — 사이드이펙트 없음
 * 향후 시간대, 온도 밴드 등 추가 입력으로 확장 가능
 */
export function mapWeatherToCharacter(
  condition: WeatherCondition,
): CharacterPresentationState {
  return WEATHER_CHARACTER_MAP[condition];
}

const rng = mulberry32(Date.now());

export function pickRandomMessage(messages: string[]): string {
  const index = Math.floor(rng() * messages.length);
  return messages[index];
}
