export type ThemeMode = 'light' | 'dark' | 'system';

export interface ColorTokens {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  accent: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  border: string;
  error: string;
  success: string;
}

export interface TypographyTokens {
  display: string;
  body: string;
  mono: string;
}

export interface SpacingTokens {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface ThemeState {
  mode: ThemeMode;
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  /** 현재 날씨 배경색 */
  weatherBackgroundColor: string;
}
