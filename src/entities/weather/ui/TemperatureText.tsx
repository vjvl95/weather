import { Text } from 'react-native';
import type { TemperatureTextProps } from '../model/types';

const SIZE_CLASSES = {
  sm: 'text-base text-white/80',
  md: 'text-2xl font-semibold text-white',
  lg: 'text-5xl font-bold text-white',
} as const;

export function TemperatureText({
  temperature,
  unit = 'C',
  size = 'md',
}: TemperatureTextProps) {
  const symbol = unit === 'C' ? '°C' : '°F';

  return (
    <Text className={SIZE_CLASSES[size]}>
      {Math.round(temperature)}{symbol}
    </Text>
  );
}
