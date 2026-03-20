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
  /** 강수확률 (%) */
  rainChance: number;
  /** 습도 (%) */
  humidity: number;
  /** 풍속 (m/s) */
  windSpeed: number;
  /** 풍향 (degree, 0=북, 90=동, 180=남, 270=서) */
  windDirection: number;
}

/** 주간 예보 항목 */
export interface DailyForecast {
  date: string;
  condition: WeatherCondition;
  temperatureMin: number;
  temperatureMax: number;
}

/** 대기질 데이터 */
export interface AirQuality {
  /** 측정소명 */
  stationName: string;
  /** 통합대기환경지수 */
  khaiValue: number | null;
  khaiGrade: string;
  /** 미세먼지 PM10 (㎍/㎥) */
  pm10Value: number | null;
  pm10Grade: string;
  /** 초미세먼지 PM2.5 (㎍/㎥) */
  pm25Value: number | null;
  pm25Grade: string;
  /** 자외선 지수 (별도 API 없이 시간대 기반 추정) */
  /** 측정 시각 */
  dataTime: string;
}

/** 위치 정보 */
export interface LocationInfo {
  name: string;
  latitude: number;
  longitude: number;
  gridX: number;
  gridY: number;
}
