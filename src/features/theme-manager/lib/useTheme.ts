import { useColorScheme } from 'react-native';
import { useThemeStore, lightColors, darkColors } from '../model/useThemeStore';

export function useTheme() {
  const systemColorScheme = useColorScheme();
  const { mode, setMode, typography, spacing } = useThemeStore();

  const isDark = mode === 'system' ? systemColorScheme === 'dark' : mode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return {
    isDark,
    colors,
    mode,
    setMode,
    typography,
    spacing,
  };
}
