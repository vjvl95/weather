import type { WeatherCondition } from '@shared/types';

export interface WeatherIconProps {
  condition: WeatherCondition;
  size?: number;
  /** 시간 (0~23). night일 때 달 모양 변화에 사용 */
  hour?: number;
}

export interface TemperatureTextProps {
  temperature: number;
  unit?: 'C' | 'F';
  size?: 'sm' | 'md' | 'lg';
}
