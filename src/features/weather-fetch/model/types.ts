import type { CurrentWeather, HourlyForecast, DailyForecast } from '@shared/types';

export interface WeatherState {
  /** 현재 날씨 */
  current: CurrentWeather | null;
  /** 시간별 예보 (최대 24개) */
  hourly: HourlyForecast[];
  /** 주간 예보 (최대 7개) */
  daily: DailyForecast[];
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 마지막 갱신 시간 */
  lastFetchedAt: number | null;
}

export interface WeatherActions {
  setCurrent: (weather: CurrentWeather) => void;
  setHourly: (forecasts: HourlyForecast[]) => void;
  setDaily: (forecasts: DailyForecast[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastFetchedAt: (time: number) => void;
  reset: () => void;
}
