## WO-008: Character View — Phase 1 MVP (2026-03-20)

### 분석 결과
- **생성 파일**: `src/widgets/character-view/ui/CharacterView.tsx`, `CharacterSprite.tsx`, `SpeechBubble.tsx`, `WeatherBackground.tsx`, `index.ts`
- **수정 파일**: 없음
- **특이사항**:
  - `mulberry32`를 `@shared/lib`에서 import하여 blink RNG 구현 (CHECK에서 발견된 import 누락 수정됨)
  - Reduced Motion 시 `if (reduceMotion) return` — Phase 1 임시, WO-016에서 JS 타이머로 교체 예정
  - blink 오버레이 위치/색상은 에셋별 조정 필요 (하드코딩)

### 검토 항목
1. 담당 범위 일치: ✅ 5개 파일 생성
2. 담당 범위 외 수정: ✅ 없음
3. CLAUDE.md 규칙: ✅ FSD import, `useReducedMotion`, NativeWind 정적 클래스, Gesture 분리
4. CharacterView: ✅ 레이어 조합, `useCharacterState` 1회 호출
5. CharacterSprite: ✅ idleFloat + idleRotate + blink + tapBounce + petTilt
6. SpeechBubble: ✅ FadeIn/FadeOut + 자동 숨김
7. WeatherBackground: ✅ LinearGradient

### 판정
- ✅ 검토 통과
