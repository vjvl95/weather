export const APP_CONFIG = {
  NAME: '몽글날씨',
  VERSION: '1.0.0',
};

export const STORAGE_KEYS = {
  THEME_MODE: 'theme_mode',
  LAST_LOCATION: 'last_location',
  LAST_FETCH_TIME: 'last_fetch_time',
};

export const API_CONFIG = {
  /** 공공데이터포털 API 키 (사용자가 발급받아 교체) */
  SERVICE_KEY: 'YOUR_SERVICE_KEY_HERE',
  /** 단기예보 베이스 URL */
  SHORT_FORECAST_URL: 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0',
  /** 중기예보 베이스 URL */
  MID_FORECAST_URL: 'http://apis.data.go.kr/1360000/MidFcstInfoService',
  /** 데이터 갱신 간격 (ms) — 30분 */
  REFRESH_INTERVAL: 30 * 60 * 1000,
};
