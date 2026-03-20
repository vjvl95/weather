/**
 * 위도/경도 기반 일출·일몰 시각 계산
 * NOAA Solar Calculator 알고리즘 (간략 버전)
 */

/** 도 → 라디안 */
const rad = (d: number) => (d * Math.PI) / 180;
/** 라디안 → 도 */
const deg = (r: number) => (r * 180) / Math.PI;

interface SunTimes {
  sunrise: string; // "06:23"
  sunset: string;  // "18:41"
}

/**
 * 특정 날짜·위치의 일출/일몰 시각 계산 (KST)
 */
export function getSunTimes(lat: number, lng: number, date: Date = new Date()): SunTimes {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // 율리우스 날짜 계산
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const jdn =
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;

  // Julian century
  const jc = (jdn - 0.5 - 2451545) / 36525;

  // 태양 기하 평균 경도 (도)
  const L0 = (280.46646 + jc * (36000.76983 + 0.0003032 * jc)) % 360;
  // 태양 기하 평균 이상 (도)
  const M = (357.52911 + jc * (35999.05029 - 0.0001537 * jc)) % 360;
  // 지구 궤도 이심률
  const e = 0.016708634 - jc * (0.000042037 + 0.0000001267 * jc);

  // 태양 중심 방정식
  const sinM = Math.sin(rad(M));
  const sin2M = Math.sin(rad(2 * M));
  const sin3M = Math.sin(rad(3 * M));
  const C =
    sinM * (1.914602 - jc * (0.004817 + 0.000014 * jc)) +
    sin2M * (0.019993 - 0.000101 * jc) +
    sin3M * 0.000289;

  // 태양 진경도
  const sunLng = L0 + C;
  // 태양 겉보기 경도
  const omega = 125.04 - 1934.136 * jc;
  const lambda = sunLng - 0.00569 - 0.00478 * Math.sin(rad(omega));

  // 황도 경사각
  const obliq =
    23 +
    (26 + (21.448 - jc * (46.815 + jc * (0.00059 - jc * 0.001813))) / 60) / 60;
  const obliqCorr = obliq + 0.00256 * Math.cos(rad(omega));

  // 태양 적위
  const decl = deg(Math.asin(Math.sin(rad(obliqCorr)) * Math.sin(rad(lambda))));

  // 균시차 (분)
  const tanHalfObliq = Math.tan(rad(obliqCorr / 2));
  const y2 = tanHalfObliq * tanHalfObliq;
  const eqTime =
    4 *
    deg(
      y2 * Math.sin(2 * rad(L0)) -
        2 * e * sinM +
        4 * e * y2 * sinM * Math.cos(2 * rad(L0)) -
        0.5 * y2 * y2 * Math.sin(4 * rad(L0)) -
        1.25 * e * e * sin2M,
    );

  // 시간각 (도)
  const zenith = 90.833; // 공식 일출/일몰 천정각
  const cosHA =
    (Math.cos(rad(zenith)) / (Math.cos(rad(lat)) * Math.cos(rad(decl)))) -
    Math.tan(rad(lat)) * Math.tan(rad(decl));

  // 극지방 등 일출/일몰 없는 경우 방어
  if (cosHA > 1 || cosHA < -1) {
    return { sunrise: '--:--', sunset: '--:--' };
  }

  const ha = deg(Math.acos(cosHA));

  // UTC 분 단위 → KST (+9시간)
  const KST_OFFSET = 540; // 9 * 60
  const sunriseMin = 720 - 4 * (lng + ha) - eqTime + KST_OFFSET;
  const sunsetMin = 720 - 4 * (lng - ha) - eqTime + KST_OFFSET;

  return {
    sunrise: minToTime(sunriseMin),
    sunset: minToTime(sunsetMin),
  };
}

function minToTime(totalMin: number): string {
  const m = ((totalMin % 1440) + 1440) % 1440; // 0~1439 범위
  const h = Math.floor(m / 60);
  const min = Math.round(m % 60);
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}
