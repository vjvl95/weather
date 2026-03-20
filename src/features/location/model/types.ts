import type { LocationInfo } from '@shared/types';

export interface LocationState {
  /** 현재 선택된 위치 */
  currentLocation: LocationInfo | null;
  /** GPS로 감지된 위치 */
  gpsLocation: LocationInfo | null;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** hydration 완료 여부 */
  _isHydrated: boolean;
}

export interface LocationActions {
  setCurrentLocation: (location: LocationInfo) => void;
  setGpsLocation: (location: LocationInfo) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHydrated: () => void;
}
