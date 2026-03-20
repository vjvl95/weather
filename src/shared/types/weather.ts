/** 기상청 API 강수형태 코드 */
export type PrecipitationType = '0' | '1' | '2' | '3' | '4';

/** 기상청 API 하늘상태 코드 */
export type SkyStatus = '1' | '3' | '4';

/** 앱에서 사용하는 날씨 상태 (v1: 5종) */
export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'night';

/** 현재 날씨 데이터 */
export interface CurrentWeather {
  condition: WeatherCondition;
  temperature: number;
  feelsLike: number;
  humidity: number;
  description: string;
}

/** 시간별 예보 항목 */
export interface HourlyForecast {
  time: string;
  condition: WeatherCondition;
  temperature: number;
}

/** 주간 예보 항목 */
export interface DailyForecast {
  date: string;
  condition: WeatherCondition;
  temperatureMin: number;
  temperatureMax: number;
}

/** 위치 정보 */
export interface LocationInfo {
  name: string;
  latitude: number;
  longitude: number;
  gridX: number;
  gridY: number;
}
