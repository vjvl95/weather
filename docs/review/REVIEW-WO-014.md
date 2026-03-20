## WO-014: Character View — Phase 2 이펙트/그림자 (2026-03-20)

### 분석 결과
- **생성 파일**:
  - `src/widgets/character-view/ui/AmbientEffects.tsx`
  - `src/widgets/character-view/ui/CharacterShadow.tsx`
  - `src/shared/assets/effects/.gitkeep`
- **수정 파일**:
  - `src/widgets/character-view/ui/CharacterView.tsx` (AmbientEffects + CharacterShadow 레이어 추가)
  - `src/widgets/character-view/ui/CharacterSprite.tsx` (mood prop + reactHappy/reactComfort + idleOffsetYOutput + scaleY)
- **특이사항**: 없음

### 파일별 검토

#### `AmbientEffects.tsx`
- ✅ 3가지 이펙트 구현: RainEffect, SnowEffect, StarEffect
- ✅ sun-glow, cloud-drift는 null 반환 (Phase 1 범위)
- ✅ Reduced Motion: 파티클 수 감소 (20→5, 15→5, 10→3) + JS 타이머 느린 반복
- ✅ `withRepeat(-1)` — Reduced Motion일 때 사용하지 않음 (JS 타이머로 대체)
- ✅ Hooks `.map()` 금지 규칙: RainDrop, Snowflake, Star 별도 컴포넌트 분리
- ✅ `mulberry32` 시드 기반 RNG 사용 (Math.random 금지)
- ✅ `useMemo`로 파티클 배열 캐싱

#### `CharacterShadow.tsx`
- ✅ `idleOffsetY` SharedValue 기반 그림자 스케일/투명도 연동
- ✅ `interpolate`로 부유 높이에 따라 그림자 크기/투명도 변화

#### `CharacterSprite.tsx` (수정)
- ✅ `mood` prop 추가 — `CharacterMood` 타입
- ✅ reactHappy (happy/excited): 밝은 점프
- ✅ reactComfort (cozy/calm/sad): 부드러운 웅크림 (scaleY)
- ✅ `idleOffsetYOutput` — `useAnimatedReaction`으로 그림자 동기화
- ✅ 기존 Phase 1 기능 유지 (idleFloat, idleRotate, blink, tapBounce, petTilt)

#### `CharacterView.tsx` (수정)
- ✅ AmbientEffects + CharacterShadow 레이어 추가
- ✅ `idleOffsetY` SharedValue 생성 → CharacterSprite/CharacterShadow 연결
- ✅ `mood` prop 전달 (`presentation.mood`)
- ✅ 레이어 순서: Background → AmbientEffects → SpeechBubble → CharacterSprite → CharacterShadow

### 담당 범위 일치 확인
- ✅ 4개 파일 모두 WO 담당 범위와 일치
- ✅ `src/shared/assets/effects/` 디렉토리 생성 (.gitkeep)
- ✅ 담당 범위 외 파일 수정 없음

### CLAUDE.md 규칙 점검
- ✅ FSD: widgets → features → shared 정상
- ✅ Reanimated: `useReducedMotion()` + JS 타이머 패턴
- ✅ Math.random 금지: `mulberry32` 사용
- ✅ Hooks `.map()` 금지: 파티클 컴포넌트 분리

### 판정
- ✅ 검토 통과
