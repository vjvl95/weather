## WO-005: Location Feature (2026-03-20)

### 분석 결과
- **생성 파일**:
  - `src/features/location/model/types.ts` ✅
  - `src/features/location/model/useLocationStore.ts` ✅
  - `src/features/location/lib/useLocation.ts` ✅
  - `src/features/location/index.ts` ✅
- **수정 파일**: 없음 (담당 범위 외 수정 없음) ✅
- **특이사항**:
  - ❌ **`expo-location` 미설치**: `package.json`에 `expo-location`이 없음. WO 완료 기준에 "설치 완료"로 체크되어 있지만 실제로 미설치. `npx expo install expo-location` 실행 필요
  - 의존 모듈 모두 존재: `enqueueSave` (`@shared/lib/storage`), `convertToGrid` (`@shared/lib/location`), `STORAGE_KEYS.LAST_LOCATION` (`@shared/config/constants`)
  - 코드는 WO 문서와 완벽히 일치

### 완료 기준 체크 (코드 검증만)
- [x] `src/features/location/` 슬라이스 생성 완료
- [x] `useLocationStore` — 위치 저장/복원 동작 (코드 정합성 확인)
- [x] `useLocation` — GPS 권한 요청 + 위치 가져오기 (코드 정합성 확인)
- [x] `hydrateLocationStore` — AsyncStorage에서 복원 (코드 정합성 확인)
- [x] TypeScript 타입 정합성 확인
- ❌ `expo-location` 설치 미완료 → 수정 필요

### CLAUDE.md 규칙
- ✅ FSD import 방향: features → shared (정상)
- ✅ 절대경로 별칭 사용
- ✅ Zustand persist 미사용 → persistQueue 패턴 (`enqueueSave`)
- ✅ `_isHydrated` 가드 있음

### 판정
- ❌ **수정 필요** (사유: `expo-location` 패키지 미설치)
