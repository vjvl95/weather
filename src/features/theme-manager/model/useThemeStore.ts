import { create } from 'zustand';
import { ColorTokens, ThemeMode, ThemeState, TypographyTokens, SpacingTokens } from './types';

const lightColors: ColorTokens = {
  background: '#FFFFFF',
  surface: '#F8F9FA',
  primary: '#3B82F6',
  secondary: '#64748B',
  accent: '#F59E0B',
  text: {
    primary: '#111827',
    secondary: '#4B5563',
    disabled: '#9CA3AF',
  },
  border: '#E5E7EB',
  error: '#EF4444',
  success: '#10B981',
};

const darkColors: ColorTokens = {
  background: '#111827',
  surface: '#1F2937',
  primary: '#60A5FA',
  secondary: '#94A3B8',
  accent: '#FBBF24',
  text: {
    primary: '#F9FAFB',
    secondary: '#D1D5DB',
    disabled: '#6B7280',
  },
  border: '#374151',
  error: '#F87171',
  success: '#34D399',
};

const typography: TypographyTokens = {
  display: 'System', // Will be replaced by Pretendard-Bold if loaded
  body: 'System',
  mono: 'System',
};

const spacing: SpacingTokens = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

interface ThemeActions {
  setMode: (mode: ThemeMode) => void;
  setWeatherBackgroundColor: (color: string) => void;
}

export const useThemeStore = create<ThemeState & ThemeActions>((set) => ({
  mode: 'system',
  colors: lightColors,
  typography,
  spacing,
  weatherBackgroundColor: '#87CEEB',
  setMode: (mode) => set({ mode }),
  setWeatherBackgroundColor: (color) => set({ weatherBackgroundColor: color }),
}));

export { lightColors, darkColors };
