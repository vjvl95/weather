## WO-013: 통합 테스트 및 테마 연동 (2026-03-20)

### 분석 결과
- **생성 파일**: 없음
- **수정 파일**:
  - `src/features/theme-manager/model/types.ts` — `weatherBackgroundColor` 추가
  - `src/features/theme-manager/model/useThemeStore.ts` — `setWeatherBackgroundColor` 액션 추가
  - `src/features/theme-manager/lib/useTheme.ts` — `weatherBackgroundColor`, `setWeatherBackgroundColor` 노출
  - `app/_layout.tsx` — `hydrateLocationStore` 호출, city-search 모달 라우트
  - `app/(tabs)/_layout.tsx` — WO-002에서 이미 4탭 완성, 추가 수정 불필요
- **특이사항**: `app/(tabs)/_layout.tsx`는 WO-013 담당 범위이나, WO-002에서 완성된 상태 유지 (추가 수정 없음, 정상)

### 파일별 검토

#### `types.ts`
- ✅ `ThemeState`에 `weatherBackgroundColor: string` 추가

#### `useThemeStore.ts`
- ✅ `ThemeActions`에 `setWeatherBackgroundColor` 추가
- ✅ 초기값 `'#87CEEB'` (맑은 하늘 색)
- ✅ Zustand persist 미사용 (CLAUDE.md 규칙 준수)

#### `useTheme.ts`
- ✅ `weatherBackgroundColor`, `setWeatherBackgroundColor` 반환값에 노출

#### `app/_layout.tsx`
- ✅ `hydrateLocationStore` import 및 `prepare()` 내 호출
- ✅ `city-search` 모달 라우트 (`presentation: 'modal'`)
- ✅ `detail` 라우트 제거 완료
- ✅ FSD: app/ → @features/location 정상

#### `app/(tabs)/_layout.tsx`
- ✅ 4탭 (홈/시간별/주간/설정) WO-002에서 완성 유지

### 담당 범위 일치 확인
- ✅ 5개 파일 모두 WO 담당 범위와 일치
- ✅ 담당 범위 외 파일 수정 없음

### 판정
- ✅ 검토 통과
