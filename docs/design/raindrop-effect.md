# 유리창 빗방울 이펙트 구현 가이드

> 비 날씨일 때 화면에 유리창에 맺힌 물방울처럼 보이는 이펙트.
> 떨어지는 빗줄기(RainOverlay)는 현재 비활성화 — 물방울만으로 충분한 비 느낌.

---

## 핵심 원칙: "투명한 렌즈"

유리 위 물방울은 3D 구체가 아니라 **거의 투명한 렌즈**다.
눈에 보이는 건 본체가 아니라 **가장자리 굴절 테두리**와 **작은 빛 반사 점**뿐이다.

### 안 되는 것 (실패한 접근)

| 접근 | 결과 | 이유 |
|------|------|------|
| RadialGradient로 본체 채움 | 3D 공/구슬 느낌 | 물방울은 채워진 물체가 아님 |
| 하이라이트를 넓게 | 비눗방울 느낌 | 실제 물방울 하이라이트는 아주 작은 점 |
| 완벽한 원형 (Circle) | 인위적 | 유리 위 물방울은 표면장력으로 불규칙 |
| 위가 좁고 아래가 둥근 물방울 모양 | 플라스크 병 느낌 | 유리에 맺힌 물방울은 눈물 모양이 아님 |
| BlurView (expo-blur) | 배경 가림 | 뒤의 빗줄기/캐릭터를 덮어버림 |
| 흰색 fill (불투명) | 흰 동그라미 | 물방울이 아니라 눈처럼 보임 |
| 작은 물방울 너무 많이 | 무섭게 보임 | 크기 최소 25px 이상만 사용 |

---

## 구현 구조

### 컴포넌트: `Droplet` (in `AmbientEffects.tsx`)

```
RainDroplets (컨테이너)
└── Droplet × 60개 (일반) / 15개 (Reduced Motion)
    └── SVG (viewBox 54x56)
        ├── 외곽 굴절 테두리 (Path, stroke)
        ├── 안쪽 굴절 링 (Path, stroke)
        ├── 하단 caustic (Path, stroke)
        └── 스펙큘러 하이라이트 (Circle × 2)
```

### SVG 레이어 (4개)

#### 1. 외곽 굴절 테두리 — 물방울의 핵심
```xml
<Path d={blobPath} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" />
```
- **fill 없음** — 본체는 완전 투명
- 어두운 테두리만으로 물방울 형태를 표현
- 빛이 물방울 가장자리에서 굴절되어 어둡게 보이는 현상을 재현

#### 2. 안쪽 굴절 링 — 테두리 두께감
```xml
<Path d={blobPath} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="3" />
```
- 외곽보다 연하고 두꺼운 두 번째 링
- 굴절 영역의 두께를 표현

#### 3. 하단 caustic — 빛 집광 효과
```xml
<Path d="M16 36 Q27 43 38 36" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
```
- 물방울 하단에 빛이 모이는 caustic 효과
- 곡선(Q)으로 자연스럽게

#### 4. 스펙큘러 하이라이트 — 좌상단 빛 반사 점
```xml
<Circle cx="19" cy="17" r="2.5" fill="rgba(255,255,255,0.6)" />
<Circle cx="20" cy="16" r="1" fill="rgba(255,255,255,0.9)" />
```
- 큰 원(0.6 투명도) + 작은 밝은 점(0.9 투명도)
- 2개를 겹쳐서 자연스러운 빛 반사 표현

---

## 불규칙한 형태: BLOB_PATHS

완벽한 원 대신 8가지 불규칙 Path를 사용한다.

```typescript
const BLOB_PATHS = [
  // 거의 원형, 살짝 찌그러진 원, 옆으로 넓은 타원,
  // 세로로 긴 타원, 불규칙 블롭, 한쪽 눌린 형태,
  // 위가 살짝만 좁은 방울, 약간 기울어진 형태
];
```

### 다양성을 만드는 3가지 요소

| 요소 | 값 | 효과 |
|------|-----|------|
| `shapeIndex` | 0~7 | 8가지 기본 형태 중 랜덤 선택 |
| `rotation` | 0~360° | 같은 형태도 회전시켜 다르게 보임 |
| `size` | 25~43px | 중간~큰 방울만 (작은 물방울은 부자연스러움) |

→ 8 × 360° × 다양한 크기 = 사실상 모든 물방울이 다르게 보임

---

## 애니메이션

### 페이드 인/아웃 사이클 (물방울마다 랜덤)

```
[initialDelay 0~8s] → [fade-in 1~2s] → [유지 5~9s] → [fade-out 1~2s] → 반복
```

총 사이클: 약 7~13초 (물방울마다 다름)

```typescript
const fadeIn = 1000 + (delay % 1000);        // 1~2초
const showDuration = 5000 + (delay % 4000);   // 5~9초
const fadeOut = 1000 + (delay % 1000);        // 1~2초
const initialDelay = delay;                    // 0~8초 (첫 등장 시차)
```

- **initialDelay**: 각 물방울이 다른 시간에 첫 등장 → 동시 나타남/사라짐 방지
- **fadeIn/showDuration/fadeOut 모두 물방울마다 다름** → 자연스러운 리듬
- Reduced Motion: 유지 시간 15초로 늘림
- opacity: 0 → 0.8~1.0 (크기에 비례) → 0
- JS 타이머(`setTimeout` + `setInterval`) 기반 — `withRepeat(-1)` 사용 안 함

### 미세 움직임 (drift)

물방울이 맺혀있는 동안 중력으로 살짝 흘러내리고 좌우 흔들림.

```typescript
// 아래로 흘러내림 (큰 물방울일수록 더 많이)
driftY: 0 → 15 + size * 0.15  (약 15~22px)

// 좌우 미세 흔들림
driftX: 0 → -8 + size * 0.3   (약 -1~5px)
```

- 움직임은 showDuration 동안 서서히 진행
- 사이클 시작 시 위치 리셋

---

## 배치

```typescript
{
  x: rng() * SCREEN_WIDTH * 0.92,   // 화면 오른쪽 여백
  y: rng() * SCREEN_HEIGHT * 0.9,   // 화면 하단 여백
  size: 25 + rng() * 18,            // 25~43px (작은 물방울 제외)
  delay: rng() * 8000,              // 0~8초 딜레이 (동시에 안 나타나게)
  shapeIndex: 0~7,                  // 불규칙 형태
  rotation: 0~360°,                 // 회전으로 추가 다양성
}
```

---

## 레이어 순서 (CharacterView)

```
1. WeatherBackground    — 배경 그라데이션
2. AmbientEffects       — 물방울 (캐릭터 뒤)
3. AnchorContainer      — 캐릭터 + 그림자 + 말풍선
4. RainOverlay          — 떨어지는 빗줄기 (현재 비활성화)
```

물방울은 캐릭터 **뒤**에 배치하여
"유리창에 물방울이 맺혀 있고, 그 뒤로 몽글이가 보이는" 느낌을 준다.

> 빗줄기(RainOverlay)는 테스트 결과 물방울만으로 충분한 비 느낌이어서 비활성화.
> 필요 시 `RainOverlay`에서 `return null` → `return <RainEffect ... />`로 복원 가능.

---

## 주의사항

- `mulberry32` 시드 기반 RNG 사용 (CLAUDE.md: `Math.random()` 금지)
- Hooks를 `.map()` 안에서 호출 금지 → `Droplet`을 별도 컴포넌트로 분리 (CLAUDE.md 규칙)
- `withRepeat(-1)` 사용 금지 → JS 타이머 패턴 (CLAUDE.md ANR 규칙)
- 물방울 개수 60개 이상은 성능 저하 가능 — 디바이스 테스트 필수
- 작은 물방울(< 25px)은 오히려 부자연스러움 — 최소 크기 25px 유지
