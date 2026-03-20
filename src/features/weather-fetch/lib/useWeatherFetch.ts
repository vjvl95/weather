import { useCallback } from 'react';
import { useWeatherStore } from '../model/useWeatherStore';
import {
  fetchShortForecast,
  parseCurrentWeather,
  parseHourlyForecast,
} from '@shared/lib';
import { API_CONFIG } from '@shared/config';

export function useWeatherFetch() {
  const {
    current,
    hourly,
    daily,
    isLoading,
    error,
    lastFetchedAt,
    setCurrent,
    setHourly,
    setLoading,
    setError,
    setLastFetchedAt,
  } = useWeatherStore();

  /** 날씨 데이터 갱신이 필요한지 확인 */
  const needsRefresh = useCallback((): boolean => {
    if (!lastFetchedAt) return true;
    return Date.now() - lastFetchedAt > API_CONFIG.REFRESH_INTERVAL;
  }, [lastFetchedAt]);

  /**
   * 날씨 데이터 가져오기
   *
   * FSD 규칙 준수: location은 파라미터로 받음 (같은 레이어 import 금지)
   * widgets/pages 레이어에서 useLocationStore().currentLocation을 넘겨줌
   */
  const fetchWeather = useCallback(async (gridX: number, gridY: number): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // 단기예보 호출
      const items = await fetchShortForecast(gridX, gridY);

      // 현재 날씨 파싱
      const currentWeather = parseCurrentWeather(items);
      setCurrent(currentWeather);

      // 시간별 예보 파싱
      const hourlyForecasts = parseHourlyForecast(items);
      setHourly(hourlyForecasts);

      // TODO: 주간 예보 (중기예보 API) — v1에서는 단기예보의 3일치 데이터로 대체
      // setDaily(dailyForecasts);

      setLastFetchedAt(Date.now());
    } catch (e) {
      const message = e instanceof Error ? e.message : '날씨 데이터를 가져올 수 없어요.';
      setError(message);
      console.error('Weather fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [setCurrent, setHourly, setLoading, setError, setLastFetchedAt]);

  /** 앱 포그라운드 복귀 시 조건부 갱신 */
  const refreshIfNeeded = useCallback(async (gridX: number, gridY: number): Promise<void> => {
    if (needsRefresh()) {
      await fetchWeather(gridX, gridY);
    }
  }, [needsRefresh, fetchWeather]);

  return {
    current,
    hourly,
    daily,
    isLoading,
    error,
    fetchWeather,
    refreshIfNeeded,
  };
}
