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
        // GPS 권한 없으면 기본 위치(서울)로 설정
        const fallback: LocationInfo = {
          name: '서울',
          latitude: 37.5665,
          longitude: 126.9780,
          gridX: 60,
          gridY: 127,
        };
        setGpsLocation(fallback);
        if (!currentLocation) {
          setCurrentLocation(fallback);
        }
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

      // 시도 + 구/시 조합 (예: "서울특별시 강남구", "경기도 수원시")
      const region = address?.region ?? '';   // 시도 (서울특별시, 경기도 등)
      const district = address?.district ?? address?.city ?? '';  // 구/시
      const displayName = region && district
        ? `${region} ${district}`
        : region || district || '현재 위치';

      const locationInfo: LocationInfo = {
        name: displayName,
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
      // GPS 실패 시 기본 위치(서울)로 설정
      const fallback: LocationInfo = {
        name: '서울',
        latitude: 37.5665,
        longitude: 126.9780,
        gridX: 60,
        gridY: 127,
      };
      setGpsLocation(fallback);
      if (!currentLocation) {
        setCurrentLocation(fallback);
      }
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
