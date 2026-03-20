## WO-003: 기상청 API 유틸 + 좌표 변환 (2026-03-20)

### 분석 결과
- **생성 파일**: `src/shared/lib/api.ts`, `src/shared/lib/location.ts`
- **수정 파일**: `src/shared/lib/index.ts`, `src/shared/config/constants.ts`
- **특이사항**: 없음

### 파일별 검토

#### `src/shared/lib/api.ts`
- ✅ `fetchShortForecast(nx, ny)` — WO 명세와 시그니처 일치
- ✅ `parseCurrentWeather(items)` — WO 명세와 일치, `mapWeatherCode` 사용
- ✅ `parseHourlyForecast(items)` — WO 명세와 일치, 시간순 정렬 + 24개 제한
- ✅ `getBaseDateTime()` — 단기예보 발표 시간 로직 정상
- ✅ `getWeatherDescription()` — 5가지 날씨 상태 설명 매핑
- ✅ `KmaResponse`, `KmaForecastItem` 인터페이스 — WO 명세와 일치
- ✅ import: `@shared/config`, `@shared/types` (FSD 규칙 준수)

#### `src/shared/lib/location.ts`
- ✅ `convertToGrid(lat, lon)` — Lambert Conformal Conic Projection 알고리즘 구현
- ✅ 기상청 격자 좌표 변환 상수 정확 (RE, GRID, SLAT1/2, OLON, OLAT, XO, YO)
- ✅ 반환값 `{ nx, ny }` — WO 명세와 일치

#### `src/shared/lib/index.ts`
- ✅ `convertToGrid`, `fetchShortForecast`, `parseCurrentWeather`, `parseHourlyForecast` export
- ✅ 기존 `storage` export 유지
- ✅ `mulberry32` export 추가 (WO-007 fix-check에서 공통 유틸로 분리)

#### `src/shared/config/constants.ts`
- ✅ `API_CONFIG` 추가 — `SERVICE_KEY`, `SHORT_FORECAST_URL`, `MID_FORECAST_URL`, `REFRESH_INTERVAL`
- ✅ `STORAGE_KEYS` 기존 유지 + `LAST_FETCH_TIME` 추가
- ✅ `APP_CONFIG` 기존 유지

### 완료 기준 체크
- [x] `src/shared/lib/location.ts` 생성 완료
- [x] `src/shared/lib/api.ts` 생성 완료
- [x] `src/shared/lib/index.ts` export 업데이트
- [x] `src/shared/config/constants.ts` API 상수 추가
- [x] 절대경로 import 사용 (`@shared/config`, `@shared/types`)
- [x] FSD import 방향 준수 (shared 레이어 내부)

### 판정
- ✅ 검토 통과
