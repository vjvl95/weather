## WO-001: 공통 타입 및 날씨·캐릭터 상수 정의 (2026-03-20)

### 분석 결과
- **생성 파일**: `src/shared/types/weather.ts`, `character.ts`, `index.ts`, `src/shared/config/weather.ts`, `character-motion.ts`
- **수정 파일**: `src/shared/config/index.ts`
- **특이사항**: 없음. WO 문서의 코드 블록과 정확히 일치하게 구현됨.

### 검토 항목
1. 담당 범위 일치: ✅ 6개 파일 모두 WO 담당 범위와 일치
2. 담당 범위 외 수정: ✅ 없음
3. CLAUDE.md 규칙 준수: ✅ FSD import 방향, 절대경로 별칭
4. 타입 정합성: ✅ 모든 타입/인터페이스가 WO 명세와 일치
5. config 정합성: ✅ WEATHER_CHARACTER_MAP 5개 조건, mapWeatherCode, 모션/타이밍 상수
6. 이미지 require(): ✅ 5개 이미지 파일 존재 확인

### 판정
- ✅ 검토 통과
