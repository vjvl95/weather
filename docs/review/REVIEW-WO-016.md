## WO-016: Character View — Phase 4 폴리시/접근성 (2026-03-20)

### 분석 결과
- **생성 파일**: 없음 (모든 파일 수정만)
- **수정 파일**:
  - `src/widgets/character-view/ui/CharacterSprite.tsx` — Reduced Motion JS 타이머 패턴
  - `src/widgets/character-view/ui/AmbientEffects.tsx` — Reduced Motion 파티클 감소 (WO-014에서 선행 구현)
  - `src/widgets/character-view/ui/CharacterView.tsx` — 진입 시퀀스 + React.memo (WO-015에서 선행 통합)
  - `src/features/character/lib/useCharacterDirector.ts` — Reduced Motion 자동 이동 비활성화 (WO-015에서 구현)
  - `src/shared/lib/animations.ts` — WO-015에서 생성, 현재 상태로 충분 (추가 확장 없음)
- **특이사항**:
  - 진입 시퀀스, React.memo, showBubble은 WO-015에서 선행 통합됨
  - AmbientEffects의 Reduced Motion 대응은 WO-014에서 선행 구현됨
  - WO-016 고유 작업은 CharacterSprite의 Reduced Motion JS 타이머 패턴 교체

### 파일별 검토

#### `CharacterSprite.tsx`
- ✅ Reduced Motion: `if (reduceMotion)` → JS 타이머 느린 1회 시퀀스 (기존 `return` 제거)
- ✅ 진폭 15% 감소 (`params.floatAmplitude * 0.15`), 속도 2배 느림
- ✅ `setInterval`로 반복 (withRepeat(-1) 완전 회피)
- ✅ `clearInterval` cleanup 정상
- ✅ idleRotate: reduceMotion일 때 0 유지 (회전 없음)
- ✅ 탭 반응 유지 (1회성이므로 ANR 위험 없음)

#### `AmbientEffects.tsx`
- ✅ Reduced Motion: 파티클 수 감소 (20→5, 15→5, 10→3) — WO-014에서 구현
- ✅ JS 타이머 기반 느린 반복 — WO-014에서 구현

#### `CharacterView.tsx`
- ✅ 진입 시퀀스 (phase: bg → character → idle → ready) — WO-015에서 통합
- ✅ React.memo: AmbientEffects, SpeechBubble 래핑 — WO-015에서 통합
- ✅ showBubble: useCharacterStore에서 직접 접근

#### `useCharacterDirector.ts`
- ✅ Reduced Motion: 자동 이동 비활성화 (`if (reduceMotion) return`) — WO-015에서 구현
- ✅ 방치 말풍선은 유지

#### `animations.ts`
- ✅ pickEasing, EASING_VARIANTS — WO-015에서 생성, 추가 확장 불필요

### 완료 기준 체크
- [x] CharacterSprite Reduced Motion — JS 타이머 느린 1회 시퀀스 (withRepeat 금지) ✅
- [x] AmbientEffects Reduced Motion — 밀도/속도 감소 ✅
- [x] 자동 이동 비활성화 (center-hero 고정) ✅
- [x] 탭 반응 유지 ✅
- [x] React.memo 적용 ✅
- [x] 진입 시퀀스 ✅
- [x] animations.ts 확인 ✅

### 판정
- ✅ 검토 통과
