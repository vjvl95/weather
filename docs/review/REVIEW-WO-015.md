## WO-015: Character View — Phase 3 앵커 이동 (2026-03-20)

### 분석 결과
- **생성 파일**:
  - `src/features/character/lib/useCharacterDirector.ts`
  - `src/shared/lib/animations.ts`
- **수정 파일**:
  - `src/shared/lib/index.ts` (animations export 추가)
  - `src/features/character/index.ts` (useCharacterDirector export 추가)
  - `src/widgets/character-view/ui/CharacterView.tsx` (앵커 컨테이너 패턴 도입)
- **특이사항**:
  - CharacterView.tsx에 WO-016 범위의 기능도 선행 통합됨 (진입 시퀀스, React.memo, showBubble)
  - 이는 다른 AI가 WO-016 작업 중 WO-015와 함께 구현한 것으로 보임

### 파일별 검토

#### `useCharacterDirector.ts`
- ✅ ANCHOR_ADJACENCY 인접 그래프 — 6개 앵커, 인접 이동만 허용
- ✅ `pickNextAnchor` — mulberry32 RNG 기반 인접 앵커 선택
- ✅ `getNextInterval` — 6~14초 랜덤 간격, 야간 2배 감소
- ✅ `scheduleNextMove` — 재귀적 setTimeout (withRepeat 회피)
- ✅ `scheduleIdleCheckIn` — 30초 방치 후 자동 말풍선
- ✅ `onInteraction` — 중앙 복귀 + 타이머 리셋
- ✅ Reduced Motion: 자동 이동 비활성화 (`if (reduceMotion) return`)
- ✅ cleanup: `clearTimeout` 정상 처리

#### `animations.ts`
- ✅ `EASING_VARIANTS` — 5가지 easing 함수 배열
- ✅ `pickEasing(seed)` — 시드 기반 easing 선택 (매번 다른 느낌)

#### `index.ts` (shared/lib)
- ✅ `pickEasing`, `EASING_VARIANTS` export 추가

#### `index.ts` (features/character)
- ✅ `useCharacterDirector` export 추가

#### `CharacterView.tsx` (수정)
- ✅ 앵커 컨테이너 패턴: `Animated.View` + `containerStyle` (translateX/Y)
- ✅ `pickEasing`으로 매번 다른 easing 적용
- ✅ `AUTO_MOVE_CONFIG.moveDuration` 사용
- ✅ `handleTap` — onInteraction + onCharacterTap 조합
- ✅ React.memo: AmbientEffects, SpeechBubble 래핑
- ✅ 진입 시퀀스: phase 기반 순차 표시 (bg → character → idle → ready)

### 담당 범위 확인
- ✅ WO-015 담당 범위 6개 파일 모두 일치
- ⚠️ CharacterView.tsx에 WO-016 범위 기능 선행 통합 (진입 시퀀스, React.memo, showBubble from useCharacterStore) — 기능적으로 문제 없으나 WO-016 작업 시 참고 필요

### CLAUDE.md 규칙 점검
- ✅ FSD: features → shared, widgets → features 정상
- ✅ Reanimated: useReducedMotion 체크, withRepeat 사용 안 함
- ✅ mulberry32 시드 기반 RNG
- ✅ 절대경로 별칭 사용

### 판정
- ✅ 검토 통과
