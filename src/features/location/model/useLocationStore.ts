import { create } from 'zustand';
import type { LocationState, LocationActions } from './types';
import type { LocationInfo } from '@shared/types';
import { enqueueSave } from '@shared/lib';
import { STORAGE_KEYS } from '@shared/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LocationStore = LocationState & LocationActions;

export const useLocationStore = create<LocationStore>((set) => ({
  // State
  currentLocation: null,
  gpsLocation: null,
  isLoading: false,
  error: null,
  _isHydrated: false,

  // Actions
  setCurrentLocation: (location: LocationInfo) => {
    set({ currentLocation: location });
    enqueueSave(STORAGE_KEYS.LAST_LOCATION, location);
  },

  setGpsLocation: (location: LocationInfo) => {
    set({ gpsLocation: location });
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setError: (error: string | null) => set({ error }),

  setHydrated: () => set({ _isHydrated: true }),
}));

/** 앱 시작 시 저장된 위치 복원 */
export async function hydrateLocationStore(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.LAST_LOCATION);
    if (stored) {
      const location: LocationInfo = JSON.parse(stored);
      useLocationStore.getState().setCurrentLocation(location);
    }
  } catch (e) {
    console.error('Failed to hydrate location store:', e);
  } finally {
    useLocationStore.getState().setHydrated();
  }
}
