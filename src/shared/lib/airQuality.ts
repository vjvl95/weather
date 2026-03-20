import { API_CONFIG } from '@shared/config';
import type { AirQuality } from '@shared/types';

/** 에어코리아 API 응답 구조 */
interface AirKoreaResponse {
  response: {
    header: { resultCode: string; resultMsg: string };
    body: {
      items: AirKoreaItem[];
    };
  };
}

interface AirKoreaItem {
  stationName?: string;
  dataTime?: string;
  khaiValue?: string;
  khaiGrade?: string;
  pm10Value?: string;
  pm10Grade?: string;
  pm25Value?: string;
  pm25Grade?: string;
}

const AIRKOREA_BASE = 'http://apis.data.go.kr/B552584';

/** 위치명 → 시도명 매핑 (에어코리아 API 파라미터용) */
const SIDO_MAP: Record<string, string> = {
  서울: '서울',
  부산: '부산',
  대구: '대구',
  인천: '인천',
  광주: '광주',
  대전: '대전',
  울산: '울산',
  세종: '세종',
  경기: '경기',
  강원: '강원',
  충북: '충북',
  충남: '충남',
  전북: '전북',
  전남: '전남',
  경북: '경북',
  경남: '경남',
  제주: '제주',
  // 전체 이름도 매핑
  서울특별시: '서울',
  부산광역시: '부산',
  대구광역시: '대구',
  인천광역시: '인천',
  광주광역시: '광주',
  대전광역시: '대전',
  울산광역시: '울산',
  세종특별자치시: '세종',
  경기도: '경기',
  강원도: '강원',
  강원특별자치도: '강원',
  충청북도: '충북',
  충청남도: '충남',
  전라북도: '전북',
  전북특별자치도: '전북',
  전라남도: '전남',
  경상북도: '경북',
  경상남도: '경남',
  제주도: '제주',
  제주특별자치도: '제주',
};

/** 위도/경도 → 시도명 대략 판별 (fallback용) */
function sidoFromCoords(lat: number, lng: number): string | null {
  // 대한민국 주요 시도의 대략적 위경도 범위
  if (lat >= 37.4 && lat <= 37.7 && lng >= 126.8 && lng <= 127.2) return '서울';
  if (lat >= 37.2 && lat <= 37.9 && lng >= 126.5 && lng <= 127.6) return '경기';
  if (lat >= 37.3 && lat <= 37.6 && lng >= 126.5 && lng <= 126.8) return '인천';
  if (lat >= 34.9 && lat <= 35.3 && lng >= 128.8 && lng <= 129.3) return '부산';
  if (lat >= 35.7 && lat <= 36.0 && lng >= 128.4 && lng <= 128.8) return '대구';
  if (lat >= 35.0 && lat <= 35.3 && lng >= 126.7 && lng <= 127.0) return '광주';
  if (lat >= 36.2 && lat <= 36.5 && lng >= 127.2 && lng <= 127.5) return '대전';
  if (lat >= 35.4 && lat <= 35.7 && lng >= 129.2 && lng <= 129.5) return '울산';
  if (lat >= 36.4 && lat <= 36.7 && lng >= 126.9 && lng <= 127.3) return '세종';
  if (lat >= 33.1 && lat <= 33.6 && lng >= 126.1 && lng <= 127.0) return '제주';
  if (lat >= 37.0 && lat <= 38.0 && lng >= 127.5 && lng <= 129.5) return '강원';
  if (lat >= 36.4 && lat <= 37.1 && lng >= 127.2 && lng <= 128.2) return '충북';
  if (lat >= 35.9 && lat <= 36.9 && lng >= 126.0 && lng <= 127.3) return '충남';
  if (lat >= 35.3 && lat <= 36.1 && lng >= 126.3 && lng <= 127.5) return '전북';
  if (lat >= 34.2 && lat <= 35.5 && lng >= 126.0 && lng <= 127.5) return '전남';
  if (lat >= 35.5 && lat <= 37.0 && lng >= 128.0 && lng <= 129.5) return '경북';
  if (lat >= 34.7 && lat <= 35.7 && lng >= 127.5 && lng <= 129.0) return '경남';
  return null;
}

/** 위치명에서 시도명 추출 */
function extractSido(locationName: string, lat?: number, lng?: number): string | null {
  // 1. 위치명의 각 토큰으로 매칭 시도
  const parts = locationName.split(' ');
  for (const part of parts) {
    if (SIDO_MAP[part]) return SIDO_MAP[part];
    const prefix = part.substring(0, 2);
    if (SIDO_MAP[prefix]) return SIDO_MAP[prefix];
  }

  // 2. 좌표 기반 fallback
  if (lat != null && lng != null) {
    return sidoFromCoords(lat, lng);
  }

  return null;
}

/** 위치명에서 구/군 추출 (가장 가까운 측정소 찾기용) */
function extractDistrict(locationName: string): string | null {
  const parts = locationName.split(' ');
  // "서울특별시 강남구" → "강남구" → "강남"
  if (parts.length >= 2) {
    return parts[1].replace(/[구시군]/g, '');
  }
  return null;
}

/** 등급 코드 → 텍스트 */
function gradeText(grade: string | undefined): string {
  switch (grade) {
    case '1': return '좋음';
    case '2': return '보통';
    case '3': return '나쁨';
    case '4': return '매우나쁨';
    default: return '-';
  }
}

function parseNum(v: string | undefined): number | null {
  if (!v || v === '-' || v === '') return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

/**
 * 시도별 실시간 대기질 조회
 * 대기오염정보 조회 서비스만으로 동작 (측정소정보 서비스 불필요)
 */
export async function fetchAirQuality(
  _lat: number,
  _lng: number,
  locationName?: string,
): Promise<AirQuality> {
  const sidoName = extractSido(locationName ?? '', _lat, _lng);
  if (!sidoName) {
    throw new Error(`시도명을 추출할 수 없어요: ${locationName ?? '(없음)'} (${_lat}, ${_lng})`);
  }

  const params = new URLSearchParams({
    sidoName,
    pageNo: '1',
    numOfRows: '100',
    returnType: 'json',
    ver: '1.5',
  });

  const url = `${AIRKOREA_BASE}/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty?serviceKey=${API_CONFIG.SERVICE_KEY}&${params}`;

  console.log('[대기질API] 시도별 조회:', sidoName);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`대기질 조회 실패: ${response.status}`);
  }

  const text = await response.text();
  if (text.startsWith('<') || text.startsWith('<?xml')) {
    console.error('[대기질API] XML 응답:', text.substring(0, 300));
    throw new Error('에어코리아 API 인증 오류. 활용신청을 확인해주세요.');
  }

  let data: AirKoreaResponse;
  try {
    data = JSON.parse(text);
  } catch {
    console.error('[대기질API] JSON 파싱 실패:', text.substring(0, 200));
    throw new Error('대기질 응답을 처리할 수 없어요.');
  }

  if (data.response.header.resultCode !== '00') {
    throw new Error(`대기질 에러: ${data.response.header.resultMsg}`);
  }

  const items = data.response.body?.items;
  if (!items || items.length === 0) {
    throw new Error('대기질 데이터가 없어요.');
  }

  // 구/군 이름으로 가장 가까운 측정소 찾기
  const district = extractDistrict(locationName ?? '');
  let bestItem = items[0];

  if (district) {
    // 측정소 이름이나 주소에 구/군 이름이 포함된 항목 우선
    const matched = items.find(
      (item) => item.stationName?.includes(district),
    );
    if (matched) bestItem = matched;
  }

  // 유효한 데이터가 있는 항목 선택 (pm10Value가 '-'이 아닌 것)
  if (bestItem.pm10Value === '-' || !bestItem.pm10Value) {
    const valid = items.find((item) => item.pm10Value && item.pm10Value !== '-');
    if (valid) bestItem = valid;
  }

  console.log('[대기질API] 선택 측정소:', bestItem.stationName);

  return {
    stationName: bestItem.stationName ?? sidoName,
    khaiValue: parseNum(bestItem.khaiValue),
    khaiGrade: gradeText(bestItem.khaiGrade),
    pm10Value: parseNum(bestItem.pm10Value),
    pm10Grade: gradeText(bestItem.pm10Grade),
    pm25Value: parseNum(bestItem.pm25Value),
    pm25Grade: gradeText(bestItem.pm25Grade),
    dataTime: bestItem.dataTime ?? '',
  };
}
