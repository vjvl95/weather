## WO-007: Character Feature (V1 상태 모델) (2026-03-20)

### 분석 결과
- **생성 파일**: `src/features/character/model/types.ts`, `model/useCharacterStore.ts`, `lib/mapWeatherToCharacter.ts`, `lib/useCharacterState.ts`, `index.ts`
- **삭제 파일**: `src/features/counter/`
- **특이사항**: `mulberry32`를 `@shared/lib`에서 import하여 Math.random 금지 규칙 준수

### 검토 항목
1. 담당 범위 일치: ✅ 5개 파일 생성 + counter 삭제
2. 담당 범위 외 수정: ✅ 없음
3. CLAUDE.md 규칙: ✅ FSD import, 절대경로, Zustand persist 미사용, 시드 기반 RNG
4. useCharacterStore: ✅ 날씨별 전환, 말풍선 랜덤, 쿨다운, 앵커 관리
5. mapWeatherToCharacter: ✅ 순수 함수, WEATHER_CHARACTER_MAP 활용
6. useCharacterState: ✅ 외부 소비 훅, useCallback 최적화
7. index.ts Public API: ✅ 필요한 것만 export

### 판정
- ✅ 검토 통과
