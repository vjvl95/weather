import { Text } from 'react-native';
import type { TemperatureTextProps } from '../model/types';

const SIZE_CLASSES = {
  sm: 'text-base text-gray-600',
  md: 'text-2xl font-semibold text-gray-800',
  lg: 'text-5xl font-bold text-gray-900',
} as const;

export function TemperatureText({
  temperature,
  unit = 'C',
  size = 'md',
}: TemperatureTextProps) {
  const symbol = unit === 'C' ? '°' : '°F';

  return (
    <Text className={SIZE_CLASSES[size]}>
      {Math.round(temperature)}{symbol}
    </Text>
  );
}
