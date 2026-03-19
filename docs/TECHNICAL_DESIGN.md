# 기술 설계서: 몽글날씨

> PRD 기반 기술 설계 문서

---

## 1. FSD 슬라이스 구조

### 1-1. 전체 구조

```
src/
├── shared/                        # Layer 6: 공통
│   ├── config/
│   │   ├── constants.ts           # 앱 설정, API 키, 스토리지 키
│   │   ├── weather.ts             # 날씨 상태 매핑 데이터
│   │   └── index.ts
│   ├── lib/
│   │   ├── storage.ts             # AsyncStorage 큐 (기존)
│   │   ├── api.ts                 # 기상청 API 호출 유틸
│   │   ├── location.ts            # 위치 관련 유틸 (GPS, 좌표 변환)
│   │   └── index.ts
│   ├── types/
│   │   ├── weather.ts             # 날씨 관련 공통 타입
│   │   └── index.ts
│   ├── ui/
│   │   ├── ErrorBoundary.tsx      # (기존)
│   │   ├── ErrorFallback.tsx      # (기존)
│   │   └── index.ts
│   └── assets/
│       └── characters/
│           ├── monggeul-sunny.png
│           ├── monggeul-cloudy.png
│           ├── monggeul-rainy.png
│           ├── monggeul-snowy.png
│           └── monggeul-night.png
│
├── entities/                      # Layer 5: 도메인 모델
│   └── weather/
│       ├── model/
│       │   └── types.ts           # Weather 도메인 타입 (현재/시간별/주간)
│       ├── ui/
│       │   ├── WeatherIcon.tsx    # 날씨 상태 아이콘 컴포넌트
│       │   └── TemperatureText.tsx # 온도 표시 컴포넌트
│       └── index.ts
│
├── features/                      # Layer 4: 비즈니스 로직
│   ├── weather-fetch/
│   │   ├── model/
│   │   │   ├── types.ts           # API 응답 타입, 스토어 타입
│   │   │   └── useWeatherStore.ts # Zustand: 날씨 데이터 상태관리
│   │   ├── lib/
│   │   │   └── useWeatherFetch.ts # 기상청 API 호출 훅
│   │   └── index.ts
│   │
│   ├── location/
│   │   ├── model/
│   │   │   ├── types.ts           # 위치 관련 타입
│   │   │   └── useLocationStore.ts # Zustand: 현재 위치, 선택 도시
│   │   ├── lib/
│   │   │   └── useLocation.ts     # GPS 위치 가져오기 훅
│   │   └── index.ts
│   │
│   ├── character/
│   │   ├── model/
│   │   │   ├── types.ts           # 캐릭터 상태 타입
│   │   │   └── useCharacterStore.ts # Zustand: 현재 캐릭터 상태
│   │   ├── lib/
│   │   │   └── useCharacterState.ts # 날씨 → 캐릭터 상태 매핑 훅
│   │   └── index.ts
│   │
│   └── theme-manager/             # (기존 — 날씨 테마에 맞게 확장)
│       ├── model/
│       │   ├── types.ts
│       │   └── useThemeStore.ts
│       ├── lib/
│       │   └── useTheme.ts
│       └── index.ts
│
├── widgets/                       # Layer 3: 복합 UI
│   ├── character-view/
│   │   ├── ui/
│   │   │   ├── CharacterView.tsx  # 몽글이 캐릭터 + 애니메이션 + 배경
│   │   │   ├── SpeechBubble.tsx   # 말풍선 컴포넌트
│   │   │   └── WeatherBackground.tsx # 날씨별 배경 (색상 + 효과)
│   │   └── index.ts
│   │
│   ├── hourly-forecast/
│   │   ├── ui/
│   │   │   ├── HourlyForecast.tsx # 시간별 예보 리스트
│   │   │   └── HourlyItem.tsx     # 시간별 예보 개별 항목
│   │   └── index.ts
│   │
│   └── weekly-forecast/
│       ├── ui/
│       │   ├── WeeklyForecast.tsx # 주간 예보 리스트
│       │   └── WeeklyItem.tsx     # 주간 예보 개별 항목
│       └── index.ts
│
└── pages/                         # Layer 2: 화면
    ├── home/
    │   ├── ui/
    │   │   └── HomePage.tsx       # 홈: 몽글이 + 현재 날씨 + 위치
    │   └── index.ts
    │
    ├── hourly/
    │   ├── ui/
    │   │   └── HourlyPage.tsx     # 시간별 예보 화면
    │   └── index.ts
    │
    ├── weekly/
    │   ├── ui/
    │   │   └── WeeklyPage.tsx     # 주간 예보 화면
    │   └── index.ts
    │
    ├── settings/
    │   ├── ui/
    │   │   └── SettingsPage.tsx   # 설정 화면 (기존 확장)
    │   └── index.ts
    │
    └── city-search/
        ├── ui/
        │   └── CitySearchPage.tsx # 도시 검색 화면
        └── index.ts
```

### 1-2. 라우트 구조 (expo-router)

```
app/
├── _layout.tsx                    # RootLayout (Stack)
├── (tabs)/
│   ├── _layout.tsx                # TabLayout (하단 탭 4개)
│   ├── index.tsx                  # → HomePage
│   ├── hourly.tsx                 # → HourlyPage
│   ├── weekly.tsx                 # → WeeklyPage
│   └── settings.tsx               # → SettingsPage
└── city-search.tsx                # → CitySearchPage (모달)
```

---

## 2. 날씨 → 캐릭터 상태 매핑

### 2-1. 매핑 데이터 구조 (`shared/config/weather.ts`)

```typescript
export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'night';

export interface CharacterState {
  image: ImageSourcePropType;      // 몽글이 이미지
  expression: string;              // 표정 설명 (접근성용)
  backgroundColor: string;         // 배경 색상
  message: string;                 // 말풍선 메시지
}

export const WEATHER_CHARACTER_MAP: Record<WeatherCondition, CharacterState> = {
  sunny: {
    image: require('@shared/assets/characters/monggeul-sunny.png'),
    expression: '행복한 표정',
    backgroundColor: '#87CEEB',
    message: '오늘 날씨가 정말 좋아요! 기분 좋은 하루 되세요~',
  },
  cloudy: {
    image: require('@shared/assets/characters/monggeul-cloudy.png'),
    expression: '졸린 표정',
    backgroundColor: '#B0B0B0',
    message: '오늘은 구름이 많아요. 그래도 좋은 하루예요~',
  },
  rainy: {
    image: require('@shared/assets/characters/monggeul-rainy.png'),
    expression: '살짝 슬픈 표정',
    backgroundColor: '#708090',
    message: '비가 와요! 우산 꼭 챙기세요~',
  },
  snowy: {
    image: require('@shared/assets/characters/monggeul-snowy.png'),
    expression: '신난 표정',
    backgroundColor: '#B0C4DE',
    message: '눈이 와요! 따뜻하게 입고 나가세요~',
  },
  night: {
    image: require('@shared/assets/characters/monggeul-night.png'),
    expression: '나른한 표정',
    backgroundColor: '#1A1A3E',
    message: '좋은 밤이에요. 오늘도 수고했어요~',
  },
};
```

> **확장 시**: `WeatherCondition` 타입에 `'thunder' | 'fog' | 'wind'` 등을 추가하고 매핑 데이터만 넣으면 됨

### 2-2. 날씨 코드 → 상태 변환 (`features/character/lib/useCharacterState.ts`)

```typescript
// 기상청 API 날씨 코드를 WeatherCondition으로 변환
function mapWeatherCode(code: string, hour: number): WeatherCondition {
  // 밤 시간 (18시~06시)이면 night
  if (hour >= 18 || hour < 6) return 'night';

  // 기상청 PTY(강수형태) 코드 기반
  switch (code) {
    case '1': return 'rainy';   // 비
    case '2': return 'rainy';   // 비/눈
    case '3': return 'snowy';   // 눈
    case '4': return 'rainy';   // 소나기
    default: break;
  }

  // 기상청 SKY(하늘상태) 코드 기반
  // '1': 맑음, '3': 구름많음, '4': 흐림
  // ... 추가 매핑 로직
}
```

---

## 3. 기상청 API 연동

### 3-1. 사용 API

| API | 용도 | 엔드포인트 |
|-----|------|-----------|
| **단기예보 조회서비스** | 현재 날씨 + 시간별 예보 | `getVilageFcst` |
| **중기예보 조회서비스** | 주간 예보 (3~10일) | `getMidTa`, `getMidLandFcst` |

### 3-2. 좌표 변환

기상청 API는 위경도가 아닌 **격자 좌표(nx, ny)** 를 사용합니다.

```typescript
// shared/lib/location.ts
// GPS 위경도 → 기상청 격자 좌표 변환 함수
function convertToGrid(lat: number, lon: number): { nx: number; ny: number } {
  // Lambert Conformal Conic Projection 변환
  // ... 변환 로직
}
```

### 3-3. API 호출 흐름

```
앱 실행
  ↓
GPS 위치 가져오기 (expo-location)
  ↓
위경도 → 격자 좌표 변환
  ↓
기상청 단기예보 API 호출
  ↓
응답 데이터 파싱 → WeatherStore에 저장
  ↓
WeatherCondition 결정 → CharacterStore에 저장
  ↓
몽글이 상태 변경 (이미지 + 배경 + 말풍선)
```

### 3-4. 데이터 갱신 주기

| 상황 | 갱신 |
|------|------|
| 앱 실행 시 | 항상 최신 데이터 호출 |
| 앱 포그라운드 복귀 | 마지막 호출 후 30분 이상이면 갱신 |
| 수동 새로고침 | Pull-to-refresh |

---

## 4. 상태관리 (Zustand)

### 4-1. Store 목록

| Store | 위치 | 역할 |
|-------|------|------|
| `useWeatherStore` | features/weather-fetch | 날씨 데이터 (현재/시간별/주간) |
| `useLocationStore` | features/location | 현재 위치, 선택 도시 |
| `useCharacterStore` | features/character | 몽글이 현재 상태 (표정/색상/메시지) |
| `useThemeStore` | features/theme-manager | 테마 (날씨별 배경 컬러 연동) |

### 4-2. Store 간 데이터 흐름

```
useLocationStore (위치)
        ↓
useWeatherStore (날씨 데이터)
        ↓
useCharacterStore (몽글이 상태)
        ↓
useThemeStore (배경 컬러)
```

---

## 5. 캐릭터 애니메이션 (Reanimated)

### 5-1. 애니메이션 목록

| 애니메이션 | 트리거 | 구현 방식 |
|-----------|--------|-----------|
| **둥실둥실** | 항상 (기본) | `withRepeat` + `withSequence` (translateY) |
| **탭 반응** | 캐릭터 터치 | `withSpring` (scale 1 → 1.2 → 1) |
| **쓰다듬기** | 좌우 스와이프 | `Gesture.Pan` + `withSpring` (rotate) |
| **날씨 전환** | 날씨 변경 시 | `withTiming` (opacity 0 → 1) |
| **말풍선 등장** | 탭 또는 자동 | `withSpring` (scale 0 → 1) + `withDelay` |

### 5-2. 주의사항 (CLAUDE.md 기반)

- `withRepeat(-1)` + Reduced Motion = ANR 크래시 → `useReducedMotion()` 체크 필수
- Hooks를 `.map()` 안에서 호출 금지 → 별도 컴포넌트로 분리
- `reanimated/plugin`은 babel.config.js plugins 배열 마지막에 위치 (이미 설정됨)

---

## 6. 네비게이션 설계

### 6-1. 하단 탭 (4개)

```
┌─────────┬──────────┬─────────┬──────────┐
│  🏠 홈  │ ⏰ 시간별 │ 📅 주간  │ ⚙️ 설정  │
└─────────┴──────────┴─────────┴──────────┘
```

### 6-2. 모달

- **도시 검색**: 홈 상단 위치 탭 또는 설정에서 → `city-search` 모달

---

## 7. 추가 필요 패키지

| 패키지 | 용도 |
|--------|------|
| `expo-location` | GPS 위치 가져오기 |

> 나머지는 기존 템플릿에 이미 설치되어 있음 (Reanimated, Skia, Zustand, NativeWind 등)

---

## 8. 확장 가능한 설계 포인트

| 영역 | 확장 방법 |
|------|-----------|
| **날씨 상태 추가** | `WeatherCondition` 타입 + `WEATHER_CHARACTER_MAP`에 데이터 추가 |
| **캐릭터 추가** | `shared/assets/characters/` 하위에 캐릭터별 폴더 + 매핑 데이터 |
| **소품/꾸미기** | `features/customization/` 슬라이스 추가 |
| **미세먼지 등** | `features/air-quality/` 슬라이스 추가 |
| **푸시 알림** | `features/notification/` 슬라이스 추가 |
| **다크모드** | `useThemeStore` 확장 (이미 light/dark 구조 있음) |
| **해외 날씨** | `shared/lib/api.ts`에 OpenWeatherMap 추가 |
