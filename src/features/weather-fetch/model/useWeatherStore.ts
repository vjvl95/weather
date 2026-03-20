import { create } from 'zustand';
import type { WeatherState, WeatherActions } from './types';

type WeatherStore = WeatherState & WeatherActions;

const initialState: WeatherState = {
  current: null,
  hourly: [],
  daily: [],
  airQuality: null,
  isLoading: false,
  error: null,
  lastFetchedAt: null,
};

export const useWeatherStore = create<WeatherStore>((set) => ({
  ...initialState,

  setCurrent: (weather) => set({ current: weather }),
  setHourly: (forecasts) => set({ hourly: forecasts }),
  setDaily: (forecasts) => set({ daily: forecasts }),
  setAirQuality: (airQuality) => set({ airQuality }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setLastFetchedAt: (time) => set({ lastFetchedAt: time }),
  reset: () => set(initialState),
}));
