## WO-002: 캐릭터 에셋 배치 및 탭 네비게이션 구조 세팅 (2026-03-20)

### 분석 결과
- **생성 파일**: `app/(tabs)/hourly.tsx`, `app/(tabs)/weekly.tsx`, `app/city-search.tsx`
- **수정 파일**: `app/(tabs)/_layout.tsx` (2탭→4탭), `app/_layout.tsx` (detail→city-search 모달)
- **삭제 파일**: `app/detail.tsx`, `src/pages/detail/`
- **검증 파일**: `src/shared/assets/characters/` (이미지 5장 존재 확인)
- **특이사항**: placeholder 페이지(HourlyPage, WeeklyPage, CitySearchPage)는 fix-check에서 미리 생성됨

### 검토 항목
1. 담당 범위 일치: ✅ 모든 파일이 WO 담당 범위와 일치
2. 담당 범위 외 수정: ✅ 없음
3. CLAUDE.md 규칙 준수: ✅ thin wrapper, `src/app/` 미생성, 절대경로 별칭
4. 탭 구성: ✅ 4탭 (홈/시간별/주간/설정), Ionicons outline 아이콘
5. 모달 라우트: ✅ city-search `presentation: 'modal'`
6. 템플릿 정리: ✅ detail 라우트/페이지 삭제

### 판정
- ✅ 검토 통과
