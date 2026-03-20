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

  if (!API_CONFIG.SERVICE_KEY) {
    throw new Error('기상청 API 키가 설정되지 않았어요. .env 파일을 확인해주세요.');
  }

  // serviceKey는 이미 URL 인코딩된 상태로 발급됨
  // URLSearchParams를 사용하면 이중 인코딩되어 401 발생 (ERR-009)
  const params = new URLSearchParams({
    numOfRows: '1000',
    pageNo: '1',
    dataType: 'JSON',
    base_date: baseDate,
    base_time: baseTime,
    nx: String(nx),
    ny: String(ny),
  });

  const url = `${API_CONFIG.SHORT_FORECAST_URL}/getVilageFcst?serviceKey=${API_CONFIG.SERVICE_KEY}&${params}`;

  console.log('[날씨API] 호출:', { baseDate, baseTime, nx, ny });

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`기상청 API 호출 실패: ${response.status}`);
  }

  const text = await response.text();

  // 기상청 API가 에러 시 XML로 응답하는 경우 처리
  if (text.startsWith('<') || text.startsWith('<?xml')) {
    console.error('[날씨API] XML 응답 (API 키 또는 파라미터 오류):', text.substring(0, 200));
    throw new Error('기상청 API 인증 오류. API 키를 확인해주세요.');
  }

  let data: KmaResponse;
  try {
    data = JSON.parse(text);
  } catch {
    console.error('[날씨API] JSON 파싱 실패:', text.substring(0, 200));
    throw new Error('기상청 API 응답을 처리할 수 없어요.');
  }

  if (data.response.header.resultCode !== '00') {
    console.error('[날씨API] 에러 코드:', data.response.header);
    throw new Error(`기상청 API 에러: ${data.response.header.resultMsg}`);
  }

  const items = data.response.body?.items?.item;
  if (!items || items.length === 0) {
    throw new Error('날씨 데이터가 비어있어요. 잠시 후 다시 시도해주세요.');
  }

  console.log('[날씨API] 성공:', items.length, '개 항목');
  return items;
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

/** 단기예보 응답 → 시간별 예보 파싱 (API가 제공하는 모든 시간 포함) */
export function parseHourlyForecast(items: KmaForecastItem[]): HourlyForecast[] {
  const now = new Date();

  // fcstDate + fcstTime 기준으로 그룹핑
  const grouped = new Map<string, Map<string, string>>();

  for (const item of items) {
    const key = `${item.fcstDate}_${item.fcstTime}`;
    if (!grouped.has(key)) grouped.set(key, new Map());
    grouped.get(key)!.set(item.category, item.fcstValue);
  }

  const forecasts: { dateTime: Date; forecast: HourlyForecast }[] = [];

  for (const [key, values] of grouped) {
    const [dateStr, timeStr] = key.split('_');
    const hour = Number(timeStr.substring(0, 2));
    const year = Number(dateStr.substring(0, 4));
    const month = Number(dateStr.substring(4, 6)) - 1;
    const day = Number(dateStr.substring(6, 8));
    const dateTime = new Date(year, month, day, hour);

    const pty = values.get('PTY') ?? '0';
    const sky = values.get('SKY') ?? '1';
    const tmp = Number(values.get('TMP') ?? '0');
    const pop = Number(values.get('POP') ?? '0');
    const reh = Number(values.get('REH') ?? '0');
    const wsd = Number(values.get('WSD') ?? '0');
    const vec = Number(values.get('VEC') ?? '0');

    // 날짜 라벨: 오늘 "14:00", 내일 "내일 14:00", 모레 이후 "3/22 14:00"
    const isToday = dateTime.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = dateTime.toDateString() === tomorrow.toDateString();
    const dayAfter = new Date(now);
    dayAfter.setDate(dayAfter.getDate() + 2);
    const isDayAfter = dateTime.toDateString() === dayAfter.toDateString();

    // 모레 이후는 제외
    if (!isToday && !isTomorrow && !isDayAfter) continue;

    let timeLabel = `${String(hour).padStart(2, '0')}:00`;
    if (isTomorrow) timeLabel = `내일 ${timeLabel}`;
    else if (isDayAfter) timeLabel = `모레 ${timeLabel}`;

    forecasts.push({
      dateTime,
      forecast: {
        time: timeLabel,
        condition: mapWeatherCode(pty, sky, hour),
        temperature: tmp,
        rainChance: pop,
        humidity: reh,
        windSpeed: wsd,
        windDirection: vec,
      },
    });
  }

  // 시간순 정렬, 전체 반환 (제한 없음)
  return forecasts
    .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())
    .map((f) => f.forecast);
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
