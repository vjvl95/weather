import { API_CONFIG } from '@shared/config';
import type {
  CurrentWeather,
  HourlyForecast,
  WeatherCondition,
} from '@shared/types';
import { mapWeatherCode } from '@shared/config';

/** 기상청 API 응답 공통 구조 */
interface KmaResponse {
  response: {
    header: { resultCode: string; resultMsg: string };
    body: {
      items: {
        item: KmaForecastItem[];
      };
    };
  };
}

interface KmaForecastItem {
  category: string;  // TMP, PTY, SKY 등
  fcstDate: string;  // "20260320"
  fcstTime: string;  // "0600"
  fcstValue: string;
}

/** 단기예보 기준 시간 계산 */
function getBaseDateTime(): { baseDate: string; baseTime: string } {
  const now = new Date();
  const hours = now.getHours();
  const baseTimes = [2, 5, 8, 11, 14, 17, 20, 23];

  // 현재 시간에서 가장 가까운 이전 발표 시간 찾기
  let baseHour = baseTimes[0];
  for (const bt of baseTimes) {
    if (hours >= bt + 1) {  // 발표 후 ~1시간 뒤 API 제공
      baseHour = bt;
    }
  }

  // 자정~3시 사이면 전날 23시 발표 사용
  const baseDate = new Date(now);
  if (hours < 3) {
    baseDate.setDate(baseDate.getDate() - 1);
    baseHour = 23;
  }

  const year = baseDate.getFullYear();
  const month = String(baseDate.getMonth() + 1).padStart(2, '0');
  const day = String(baseDate.getDate()).padStart(2, '0');

  return {
    baseDate: `${year}${month}${day}`,
    baseTime: String(baseHour).padStart(2, '0') + '00',
  };
}

/** 단기예보 API 호출 */
export async function fetchShortForecast(
  nx: number,
  ny: number,
): Promise<KmaForecastItem[]> {
  const { baseDate, baseTime } = getBaseDateTime();

  const params = new URLSearchParams({
    serviceKey: API_CONFIG.SERVICE_KEY,
    numOfRows: '1000',
    pageNo: '1',
    dataType: 'JSON',
    base_date: baseDate,
    base_time: baseTime,
    nx: String(nx),
    ny: String(ny),
  });

  const url = `${API_CONFIG.SHORT_FORECAST_URL}/getVilageFcst?${params}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`기상청 API 호출 실패: ${response.status}`);
  }

  const data: KmaResponse = await response.json();

  if (data.response.header.resultCode !== '00') {
    throw new Error(`기상청 API 에러: ${data.response.header.resultMsg}`);
  }

  return data.response.body.items.item;
}

/** 단기예보 응답 → 현재 날씨 파싱 */
export function parseCurrentWeather(items: KmaForecastItem[]): CurrentWeather {
  const now = new Date();
  const currentHour = String(now.getHours()).padStart(2, '0') + '00';
  const currentDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

  // 현재 시간에 가장 가까운 예보 찾기
  const currentItems = items.filter(
    (item) => item.fcstDate === currentDate && item.fcstTime === currentHour,
  );

  const getValue = (category: string): string =>
    currentItems.find((item) => item.category === category)?.fcstValue ?? '0';

  const temperature = Number(getValue('TMP'));
  const pty = getValue('PTY');
  const sky = getValue('SKY');
  const humidity = Number(getValue('REH'));
  const condition = mapWeatherCode(pty, sky, now.getHours());

  return {
    condition,
    temperature,
    feelsLike: temperature,  // 체감온도는 WCI/HI 계산 필요 — 임시로 기온 사용
    humidity,
    description: getWeatherDescription(condition),
  };
}

/** 단기예보 응답 → 시간별 예보 파싱 */
export function parseHourlyForecast(items: KmaForecastItem[]): HourlyForecast[] {
  // fcstDate + fcstTime 기준으로 그룹핑
  const grouped = new Map<string, Map<string, string>>();

  for (const item of items) {
    const key = `${item.fcstDate}_${item.fcstTime}`;
    if (!grouped.has(key)) grouped.set(key, new Map());
    grouped.get(key)!.set(item.category, item.fcstValue);
  }

  const forecasts: HourlyForecast[] = [];

  for (const [key, values] of grouped) {
    const [, timeStr] = key.split('_');
    const hour = Number(timeStr.substring(0, 2));
    const pty = values.get('PTY') ?? '0';
    const sky = values.get('SKY') ?? '1';
    const tmp = Number(values.get('TMP') ?? '0');

    forecasts.push({
      time: `${String(hour).padStart(2, '0')}:00`,
      condition: mapWeatherCode(pty, sky, hour),
      temperature: tmp,
    });
  }

  // 시간순 정렬, 최대 24개
  return forecasts
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(0, 24);
}

/** 날씨 상태 → 설명 텍스트 */
function getWeatherDescription(condition: WeatherCondition): string {
  const descriptions: Record<WeatherCondition, string> = {
    sunny: '맑음',
    cloudy: '흐림',
    rainy: '비',
    snowy: '눈',
    night: '밤',
  };
  return descriptions[condition];
}
