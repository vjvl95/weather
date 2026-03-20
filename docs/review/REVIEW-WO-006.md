## WO-006: Weather Fetch Feature (2026-03-20)

### 분석 결과
- **생성 파일**:
  - `src/features/weather-fetch/model/types.ts` ✅
  - `src/features/weather-fetch/model/useWeatherStore.ts` ✅
  - `src/features/weather-fetch/lib/useWeatherFetch.ts` ✅
  - `src/features/weather-fetch/index.ts` ✅
- **수정 파일**: 없음 (담당 범위 외 수정 없음) ✅
- **특이사항**:
  - `refreshIfNeeded(gridX, gridY)` — WO 문서(archive)에서는 파라미터 없는 시그니처였으나, 실제 코드는 FSD 규칙에 맞게 gridX/gridY 파라미터 추가됨. 코드가 더 정확
  - `@features/location` import 제거됨 — fix-check에서 FSD 위반 수정 반영 확인
  - `setDaily` store에서 미사용 — v1에서 주간 예보 미구현 (TODO 표기)

### 판정
- ✅ **검토 통과**
