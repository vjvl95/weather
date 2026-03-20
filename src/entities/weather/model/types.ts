import type { WeatherCondition } from '@shared/types';

export interface WeatherIconProps {
  condition: WeatherCondition;
  size?: number;
}

export interface TemperatureTextProps {
  temperature: number;
  unit?: 'C' | 'F';
  size?: 'sm' | 'md' | 'lg';
}
