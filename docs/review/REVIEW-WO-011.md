## WO-011: 시간별/주간 예보 페이지 (2026-03-20)

### 분석 결과
- **생성 파일**:
  - `src/pages/hourly/ui/HourlyPage.tsx` ✅
  - `src/pages/hourly/index.ts` ✅
  - `src/pages/weekly/ui/WeeklyPage.tsx` ✅
  - `src/pages/weekly/index.ts` ✅
- **수정 파일**: 없음 ✅
- **특이사항**:
  - `presentation?.backgroundColors?.[0]`으로 FSD 타입 정합성 확인 (fix-check 반영)
  - `isLoading` destructure했으나 미사용 — 로딩 UI는 위젯 내부에서 처리

### 판정
- ✅ **검토 통과**
