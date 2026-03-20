# 몽글이 V1 아키텍처

> Expo 블로그 "Making AI feel human in a mobile app with Expo, Reanimated, and Skia"의 판단 기준을 반영한 v1 캐릭터 아키텍처 문서

---

## 1. 문서 목적

이 문서는 몽글날씨의 핵심 경험인 "몽글이가 살아 있는 것처럼 느껴지는 홈 화면"을 v1 범위에서 어떻게 구현할지 정의합니다.

핵심 결론은 다음과 같습니다.

- v1의 목표는 **3D 자유 이동 캐릭터**가 아니다.
- v1의 목표는 **따뜻하고 예측 가능하며 감정적으로 반응하는 2.5D 캐릭터 경험**이다.
- 구현 스택은 **Reanimated + Skia + Gesture Handler**를 중심으로 한다.
- Lottie는 메인 캐릭터 런타임이 아니라 **보조 모션**에만 제한적으로 사용한다.

이 방향은 Callie 사례에서 확인된 두 가지 원칙을 따른다.

1. 캐릭터 경험의 핵심은 "복잡한 3D"가 아니라 "정서적으로 섬세한 반응성"이다.
2. 사용자 입력과 상태 변화에 실시간 반응해야 하는 핵심 모션은 프리렌더 애니메이션보다 런타임 제어가 유리하다.

---

## 2. V1 제품 목표

### 2-1. 반드시 달성할 경험

- 앱을 열면 날씨보다 먼저 몽글이가 눈에 들어온다.
- 몽글이는 날씨, 시간대, 사용자 터치에 따라 자연스럽게 반응한다.
- 화면은 과하게 시끄럽지 않고, 부드럽고 안정적이어야 한다.
- 사용자는 몽글이를 "기능"보다 "동반자"처럼 느껴야 한다.

### 2-2. v1 비목표

- 완전한 3D 캐릭터
- 물리 엔진 기반 자유 배회
- 페이지 전체를 가로지르는 복잡한 충돌 처리
- 커스터마이징 파츠 시스템
- 음성, 립싱크, 고급 AI 대화 연출

---

## 3. 아키텍처 결정 요약

### 3-1. 왜 3D가 아닌가

3D는 기술적으로 가능하지만, v1에서는 비용 대비 효과가 좋지 않다.

- 3D 모델, 리깅, 애니메이션 클립 제작 비용이 큼
- 모바일 성능과 배터리 제약이 큼
- 날씨 앱에서 가장 중요한 것은 자유 이동보다도 "정서적으로 자연스러운 반응"임
- v1에서는 화면 위를 완전히 자유롭게 돌아다니기보다, 자유로워 보이는 연출만으로도 충분함

즉, v1에서는 "실제 자유 이동"이 아니라 **제한된 이동 규칙으로 자유롭게 보이게 만드는 방식**이 적합하다.

### 3-2. 왜 Lottie가 메인이 아닌가

Lottie는 미리 만들어둔 애니메이션 재생에는 좋지만, 다음 요구에 약하다.

- 날씨 상태에 따른 세밀한 실시간 반응
- 터치 위치, 드래그 방향, 속도에 따른 변형
- 말풍선, 배경 효과, 캐릭터 모션이 동시에 연결된 상태 기반 연출

따라서 v1 메인 런타임은 `Reanimated + Skia`로 두고, Lottie는 필요 시 이모트 스티커나 짧은 축하 연출에만 사용한다.

### 3-3. V1 표현 전략

v1은 **2D 스프라이트 + 레이어드 배경 + 런타임 모션**으로 구현한다.

- 캐릭터 본체: 투명 배경 스프라이트
- 표정 변화: 날씨별 별도 스프라이트 또는 얼굴 파츠 교체
- 배경: 그라데이션 + Skia 효과 레이어
- 움직임: Reanimated
- 터치 반응: Gesture Handler
- 말풍선: RN 오버레이

이 조합은 구현 난이도와 결과 품질의 균형이 가장 좋다.

---

## 4. V1 경험 설계 원칙

### 4-1. Calm First

캐릭터는 귀엽더라도 과하게 부산하면 안 된다.

- 기본 상태는 느리고 안정적인 `idle`
- 화면 변화는 급격하지 않게 전환
- 무한 반복 모션은 진폭을 작게 유지

### 4-2. Predictable Warmth

사용자는 "왜 저 반응이 나왔는지" 감으로 이해할 수 있어야 한다.

- 맑음: 밝고 가벼움
- 흐림: 느리고 졸림
- 비: 움츠림, 위로 메시지
- 눈: 반짝임, 들뜬 반응
- 밤: 조용함, 낮은 활동성

### 4-3. Interaction Over Spectacle

큰 기술 데모보다 작은 반응의 일관성이 중요하다.

- 탭하면 통통 튄다
- 쓰다듬기 제스처에 몸을 기울인다
- 잠시 후 말풍선으로 한마디를 건넨다
- 같은 행동을 반복해도 미세한 랜덤성이 있어야 한다

### 4-4. Freedom As Illusion

완전 자유 이동 대신 **앵커 포인트 기반 이동**을 사용한다.

- 화면 내 4~6개의 안전 지점만 이동
- 버튼, 탭바, 주요 텍스트 영역은 금지 구역으로 둠
- 사용자는 자유롭게 돌아다니는 것처럼 느끼지만, 실제로는 통제된 경로를 사용함

---

## 5. V1 렌더링 구조

### 5-1. 홈 화면 기준 레이어

```text
HomePage
  -> CharacterView (full screen hero widget)
    -> WeatherBackgroundLayer
    -> AmbientEffectLayer
    -> CharacterShadowLayer
    -> CharacterSpriteLayer
    -> DialogueLayer
    -> WeatherInfoOverlay
```

### 5-2. 레이어 역할

#### 1) WeatherBackgroundLayer

- 날씨별 배경색, 그라데이션, 시간대 톤 조정
- 구현: `expo-linear-gradient` 또는 Skia
- 예:
  - 맑음: 밝은 하늘색, 상단 광원
  - 비: 회색-남색 계열, 채도 낮춤
  - 눈: 푸른 흰색 계열
  - 밤: 남색-검정 그라데이션, 별 점광

#### 2) AmbientEffectLayer

- 비, 눈, 안개, 별, 햇빛 입자 등
- 구현:
  - v1 기본: Reanimated + RN View 또는 Skia
  - 고급 효과: Skia shader 또는 particle-like 연출
- 주의:
  - 캐릭터보다 앞에 오지 않는다
  - 과도한 밀도 금지

#### 3) CharacterShadowLayer

- 캐릭터 아래 그림자
- 캐릭터의 `translateY`와 반비례해 미세하게 크기/투명도 변화
- 작은 요소지만 생동감을 크게 올린다

#### 4) CharacterSpriteLayer

- 몽글이 본체
- Reanimated 기반 `idle`, `tap`, `petting`, `reaction` 모션 적용
- 스프라이트는 반드시 투명 배경 에셋 사용

#### 5) DialogueLayer

- 말풍선, 짧은 반응 텍스트
- 캐릭터 상태와 상호작용 후킹
- 예:
  - 첫 진입
  - 탭 반응
  - 날씨 변경
  - 일정 시간 방치 후 체크인

#### 6) WeatherInfoOverlay

- 위치, 온도, 상태 텍스트
- 캐릭터를 가리지 않게 상단/하단 오버레이 배치
- 정보는 캐릭터의 보조 요소여야 함

---

## 6. 상태 모델

### 6-1. 입력 상태

캐릭터는 직접 날씨 API를 보지 않고, 아래 입력 상태를 바탕으로 파생 상태를 만든다.

- `weatherCondition`
- `timeOfDay`
- `temperatureBand`
- `isUserInteracting`
- `lastInteractionAt`
- `isReducedMotion`

### 6-2. 파생 상태

```ts
type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'night';

type CharacterMood = 'happy' | 'sleepy' | 'cozy' | 'sad' | 'excited' | 'calm';

type MotionPreset =
  | 'float-soft'
  | 'float-sleepy'
  | 'bounce-happy'
  | 'shiver-cold'
  | 'settle-night';

type EffectPreset =
  | 'sun-glow'
  | 'cloud-drift'
  | 'rain-fall'
  | 'snow-fall'
  | 'night-stars';

interface CharacterPresentationState {
  weatherCondition: WeatherCondition;
  mood: CharacterMood;
  motionPreset: MotionPreset;
  effectPreset: EffectPreset;
  bubbleMessages: string[];
  backgroundTone: string;
  spriteKey: string;
}
```

### 6-3. 런타임 상태

런타임 상태는 짧게 변하는 UI 반응 전용이다.

```ts
interface CharacterRuntimeState {
  anchorId: string;
  isBubbleVisible: boolean;
  currentBubbleMessage: string | null;
  isBeingPetted: boolean;
  reactionCooldownUntil: number | null;
  lastAutoMoveAt: number | null;
}
```

### 6-4. 상태 책임 분리

- `weather-fetch`: 날씨 원본 데이터 관리
- `character`: 날씨를 캐릭터 표현 상태로 변환
- `character-view`: 현재 표현 상태를 실제 UI로 렌더링

즉, 캐릭터 위젯은 "무엇을 표현할지"를 계산하지 않고 "어떻게 보여줄지"만 담당한다.

---

## 7. 이동 시스템

### 7-1. v1 이동 방식

v1은 자유 이동이 아니라 **앵커 포인트 기반 자동 이동**이다.

```text
[top-left drift]      [top-right drift]

         [center hero]

[left peek]             [right peek]

         [bottom rest]
```

### 7-2. 이동 규칙

- 첫 진입 시 `center hero`에 등장
- 일정 시간 유휴 상태면 주변 앵커로 천천히 이동
- 탭 후에는 잠깐 중앙 근처로 복귀
- 날씨 상태가 바뀌면 새 프리셋에 맞는 위치로 재정렬
- 야간에는 이동 빈도를 크게 줄임

### 7-3. 금지 구역

다음 영역은 이동 대상에서 제외한다.

- 상단 위치명 UI
- 하단 온도/설명 UI
- 탭바 영역
- 향후 CTA 버튼 영역

### 7-4. 자연스럽게 보이게 하는 규칙

- 이동 간격은 고정하지 않고 6~14초 사이 랜덤
- 이동 거리는 짧게 유지
- 각 이동의 easing을 동일하게 쓰지 않음
- 정지 상태에서도 미세한 `idle` 모션 유지

---

## 8. 애니메이션 체계

### 8-1. 기본 모션

- `idleFloat`: 2.5~4초 주기의 미세한 상하 부유
- `idleRotate`: 아주 작은 회전
- `blink`: 불규칙 간격의 표정 변화
- `shadowPulse`: 그림자 미세 변화

### 8-2. 상호작용 모션

- `tapBounce`: 눌림 후 통통 튀기
- `petTilt`: 쓰다듬기 방향으로 기울기
- `reactHappy`: 밝은 날/좋은 반응
- `reactComfort`: 비/밤 위로 반응

### 8-3. 접근성

Reduced Motion이 켜져 있으면 아래 규칙을 적용한다.

- 무한 반복 진폭 축소
- 자동 이동 비활성화 또는 빈도 최소화
- 배경 이펙트 밀도 감소
- 탭 반응만 유지

---

## 9. 에셋 전략

### 9-1. 필수 원칙

현재 루트에 있는 완성 일러스트형 PNG는 v1 메인 캐릭터 런타임에 그대로 쓰지 않는다.

이유:

- 캐릭터만 움직여도 배경까지 함께 흔들려 보임
- 날씨 배경 레이어와 중복됨
- 자연스러운 반응형 UI 연출에 불리함

### 9-2. 권장 에셋 구성

```text
src/shared/assets/characters/monggeul/
  sunny/body.png
  cloudy/body.png
  rainy/body.png
  snowy/body.png
  night/body.png

src/shared/assets/effects/
  rain-drop.png
  snow-flake.png
  star-dot.png
  fog-noise.png
```

### 9-3. v1 현실적 선택

다음 두 가지 중 하나를 선택한다.

1. 날씨별 스프라이트 5장
2. 공통 몸통 1장 + 얼굴/소품 파츠 분리

v1에서는 **날씨별 스프라이트 5장**이 구현 안정성이 높다.

---

## 10. 코드 구조 제안

현재 기술 설계 문서의 FSD 방향을 유지하되, 캐릭터 위젯을 사실상 "stage"로 취급한다.

```text
src/
  shared/
    assets/
      characters/
      effects/
    config/
      weather.ts
      character-motion.ts
    lib/
      animations.ts
    types/
      weather.ts

  features/
    character/
      model/
        types.ts
        useCharacterStore.ts
      lib/
        mapWeatherToCharacter.ts
        useCharacterDirector.ts
      index.ts

  widgets/
    character-view/
      ui/
        CharacterView.tsx
        CharacterSprite.tsx
        CharacterShadow.tsx
        WeatherBackground.tsx
        AmbientEffects.tsx
        SpeechBubble.tsx
      index.ts

  pages/
    home/
      ui/
        HomePage.tsx
```

### 10-1. 핵심 역할

- `mapWeatherToCharacter.ts`
  - 날씨 데이터를 캐릭터 표현 상태로 변환
- `useCharacterDirector.ts`
  - 자동 이동, 말풍선 노출, 반응 쿨다운 제어
- `CharacterView.tsx`
  - 레이어 조합 및 전체 배치
- `CharacterSprite.tsx`
  - 제스처와 본체 애니메이션

---

## 11. 화면 범위

### 11-1. v1 적용 범위

v1에서 캐릭터는 **홈 화면의 메인 히어로**로만 동작한다.

- 홈: 풀사이즈 캐릭터
- 시간별/주간/설정: v1에서는 미적용 또는 작은 정적 표시

### 11-2. 왜 전역 roaming을 미루는가

전역 roaming은 다음을 추가로 요구한다.

- 페이지 전환 간 좌표 연속성
- 스크롤/탭 UI 충돌 회피
- 전역 오버레이 호스트
- 화면별 금지 구역 관리

이는 v1 범위를 넘는다.  
따라서 v1은 홈에서 경험을 완성하고, v2에서 전역 존재감을 확장한다.

---

## 12. 구현 단계 제안

### Phase 1. 캐릭터 MVP

- 날씨별 캐릭터 매핑
- 홈 중앙 고정 배치
- `idleFloat`, `tapBounce`
- 말풍선 1차 구현

### Phase 2. 분위기 강화

- 날씨별 배경색 전환
- 비/눈/별/안개 레이어
- 그림자 반응 추가

### Phase 3. 자유로워 보이는 이동

- 앵커 포인트 기반 자동 이동
- 금지 구역 회피
- 메시지 랜덤화

### Phase 4. polish

- Reduced Motion 대응
- 성능 최적화
- 진입/복귀 타이밍 미세 조정

---

## 13. v2 승격 조건

아래 조건이 만족되면 3D 확장을 검토한다.

- 홈 화면의 2.5D 캐릭터 경험이 리텐션에 실제 기여함
- 캐릭터가 앱의 핵심 상품성으로 검증됨
- 3D 모델링/리깅/애니메이션 제작 리소스 확보
- Dev Client 기반 그래픽 파이프라인 운영 여력 확보

v2에서 가능한 확장:

- `three + @react-three/fiber/native + expo-gl`
- 3D 모델 기반 idle/walk/react 클립
- 전역 roaming 호스트
- 소품/코스튬 파츠

---

## 14. 최종 결론

몽글날씨 v1의 정답은 "3D 캐릭터를 자유롭게 돌아다니게 만드는 것"이 아니다.

정답은 아래 네 가지를 일관되게 구현하는 것이다.

- 날씨와 시간에 맞는 감정 표현
- 작지만 섬세한 모션
- 터치에 대한 예측 가능한 반응
- 캐릭터가 주인공인 화면 구성

즉, v1은 **2.5D 감정형 캐릭터 아키텍처**로 간다.

- 메인 스택: `Reanimated + Skia + Gesture Handler`
- 이동 방식: `앵커 포인트 기반 제한 이동`
- 적용 범위: `홈 중심`
- 목표: `3D 과시`가 아니라 `정서적 생동감`

이 구조가 가장 빠르게 구현 가능하고, 가장 자연스러운 결과를 낼 가능성이 높다.

---

## 참고

- Expo Blog: Making AI feel human in a mobile app with Expo, Reanimated, and Skia
- App Store: Callie: Food Self Care Pet
