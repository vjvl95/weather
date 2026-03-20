import * as Location from 'expo-location';
import { useLocationStore } from '../model/useLocationStore';
import { convertToGrid } from '@shared/lib';
import type { LocationInfo } from '@shared/types';

/** GPS 위치를 가져와서 LocationStore에 저장 */
export function useLocation() {
  const {
    currentLocation,
    gpsLocation,
    isLoading,
    error,
    setCurrentLocation,
    setGpsLocation,
    setLoading,
    setError,
  } = useLocationStore();

  /** GPS 위치 요청 */
  const requestGpsLocation = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setError('위치 권한이 필요해요. 설정에서 허용해주세요.');
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = position.coords;
      const { nx, ny } = convertToGrid(latitude, longitude);

      // 역지오코딩으로 도시명 가져오기
      const [address] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const locationInfo: LocationInfo = {
        name: address?.district ?? address?.city ?? address?.region ?? '현재 위치',
        latitude,
        longitude,
        gridX: nx,
        gridY: ny,
      };

      setGpsLocation(locationInfo);

      // 수동 선택된 위치가 없으면 GPS 위치를 현재 위치로
      if (!currentLocation) {
        setCurrentLocation(locationInfo);
      }
    } catch (e) {
      setError('위치를 가져올 수 없어요. 다시 시도해주세요.');
      console.error('GPS location error:', e);
    } finally {
      setLoading(false);
    }
  };

  return {
    currentLocation,
    gpsLocation,
    isLoading,
    error,
    requestGpsLocation,
    setCurrentLocation,
  };
}
