# Expo FSD 템플릿 — 사용 가이드

## 이 템플릿이란?

Expo SDK 55 + TypeScript strict + FSD 아키텍처 + NativeWind v4 + 절대경로가
미리 세팅된 **시작점**입니다. 새 앱을 만들 때 이 레포를 클론해서 시작하세요.

---

## ⚡ 새 프로젝트 시작 체크리스트

클론 직후 반드시 아래 순서대로 진행하세요.

### 1단계 — 식별자 교체

| 파일 | 변경 항목 | 예시 |
|------|-----------|------|
| `package.json` | `"name"` | `"my-new-app"` |
| `app.json` | `name`, `slug`, `scheme` | `"나의 앱"`, `"my-app"` |
| `app.json` | `ios.bundleIdentifier` | `"com.mycompany.myapp"` |
| `app.json` | `android.package` | `"com.mycompany.myapp"` |
| `CLAUDE.md` (이 파일) | 프로젝트명 및 기획 내용 | 직접 작성 |

### 2단계 — 템플릿 예제 파일 제거

새 프로젝트에 맞지 않는 예제 파일들을 삭제합니다:

```bash
# 예제 엔티티 / 피처 삭제
rm -rf src/entities/example
rm -rf src/features/counter

# 예제 페이지 삭제 (필요에 따라)
rm -rf src/pages/detail
```

> **⛔ `src/app/` 폴더는 절대 생성하지 마세요** (이 템플릿에서는 이미 제거됨)
> expo-router가 `src/app/`을 라우터 루트로 오인하여 `app/` 디렉토리의
> 라우트가 전부 무시됩니다. → `docs/error/001_expo-router-src-app-conflict.md` 참고

### 3단계 — 의존성 설치 및 확인

```bash
npm install

# NativeWind 4가지 설정 파일 확인 (ERR-002 방지)
# ✅ metro.config.js 존재 확인
# ✅ tailwind.config.js content 경로 확인
# ✅ babel.config.js jsxImportSource 확인
# ✅ src/global.css @tailwind 지시문 확인
```

### 4단계 — EAS 설정 (네이티브 빌드 필요 시)

```bash
# eas.json 생성
eas build:configure

# Android 빌드 전 확인 (ERR-003, ERR-005, ERR-006 방지)
# ✅ 루트에 index.js 존재 확인
# ✅ babel-preset-expo 설치 확인
# ✅ Android SDK 경로 설정 확인
```

### 5단계 — docs 문서 작성

```
docs/work-orders/README.md  ← 이 프로젝트의 WO 의존성 그래프 작성
docs/work-orders/ROADMAP.md ← 마일스톤 및 WO 목록 작성
```

---

## 📁 전체 프로젝트 구조

```
[프로젝트 루트]
├── app/                        # expo-router 라우트 (thin wrapper만)
│   ├── _layout.tsx             # RootLayout — 프로바이더, 폰트 로딩, 네비게이션 가드
│   ├── (tabs)/
│   │   ├── _layout.tsx         # 탭 네비게이션 정의
│   │   ├── index.tsx           # → src/pages/home
│   │   └── settings.tsx        # → src/pages/settings
│   └── detail.tsx              # → src/pages/detail (Stack/Modal)
│
├── src/                        # 실제 앱 코드 (FSD 구조)
│   ├── pages/                  # Layer 2: 전체 화면 단위
│   ├── widgets/                # Layer 3: 복합 UI 블록
│   ├── features/               # Layer 4: 비즈니스 로직 슬라이스
│   ├── entities/               # Layer 5: 도메인 모델
│   └── shared/                 # Layer 6: 공통 유틸, 설정, UI
│       ├── config/             # 앱 전역 상수, 카테고리 등
│       ├── lib/                # 순수 유틸 함수 (프레임워크 무관)
│       ├── types/              # 공통 타입 정의
│       └── ui/                 # 공통 UI 컴포넌트 (ErrorBoundary 등)
│
├── docs/                       # 📚 프로젝트 지식 베이스 (아래 상세 설명)
│
├── assets/                     # 이미지, 폰트, 사운드
├── app.json                    # Expo 앱 설정
├── babel.config.js             # Babel 설정 (reanimated/plugin 마지막!)
├── metro.config.js             # Metro 설정 (withNativeWind 필수)
├── tailwind.config.js          # Tailwind/NativeWind 설정
├── tsconfig.json               # TypeScript + 절대경로 별칭
└── CLAUDE.md                   # ← 지금 이 파일
```

---

## 📚 docs 폴더 구조와 사용법

> **docs 폴더는 "프로젝트의 두뇌"입니다.**
> 기획, 설계 결정, 에러 해결 기록, AI 협업 지시서가 모두 여기에 있습니다.
> Claude 세션을 시작할 때 항상 관련 docs 파일을 먼저 읽으세요.

```
docs/
├── design/          # 🎨 디자인 시스템 스펙
├── error/           # 🚨 트러블슈팅 기록 (가장 중요)
├── work-orders/     # 📋 작업 지시서 시스템
│   └── archive/     # 완료된 WO 보관
└── gamma-dispatch.md  # AI 2인 병렬 작업 시 프롬프트
```

---

### 🚨 docs/error/ — 트러블슈팅 기록 (먼저 읽으세요)

**개발 중 실제로 겪었던 에러와 해결 과정을 기록한 폴더입니다.**
새 프로젝트 시작 전, 빌드 문제 발생 시 반드시 확인하세요.

| 파일 | 핵심 내용 |
|------|-----------|
| `001_expo-router-src-app-conflict.md` | `src/app/` 존재 시 라우팅 완전 실패 |
| `002_metro-config-missing-nativewind.md` | NativeWind 스타일 전체 미적용 (사일런트 실패) |
| `003_index-js-missing-android.md` | Android 네이티브 빌드 번들 로딩 실패 |
| `004_redirect-usefonts-infinite-remount.md` | 무한 리마운트 루프 (가장 복잡한 버그) |
| `005_babel-preset-expo-missing.md` | Gradle 빌드 실패 |
| `006_android-sdk-location-not-found.md` | Android SDK 경로 미설정 |

**새 에러 발견 시 반드시 추가하세요:**
```
docs/error/00N_핵심-키워드.md
```
형식: 증상 → 원인 → 해결 → 교훈 → 관련 환경 → 발견일

---

### 📋 docs/work-orders/ — 작업 지시서 시스템

**AI 에이전트(Claude)에게 작업을 분배하는 시스템입니다.**
Wave 단위로 병렬 작업이 가능하며, 파일 소유권 충돌을 방지합니다.

#### 파일 역할

| 파일 | 용도 |
|------|------|
| `README.md` | **이 프로젝트의 WO 의존성 그래프** (처음 작성할 곳) |
| `ROADMAP.md` | **WO 진행 현황 추적표** (WO 완료 시 업데이트) |
| `work-orders-templet.md` | WO 작성 시 복사해서 쓰는 템플릿 |
| `IMPLEMENTATION_GUIDE.md` | 공통 구현 패턴 레퍼런스 |
| `AI-EXECUTION-PROTOCOL.md` | AI가 WO 수행 시 지켜야 할 규칙 |
| `AI-2PERSON-ASSIGNMENT.md` | AI 2명 병렬 작업 시 분배 계획 템플릿 |
| `TEMP.md` | 임시 메모 |
| `archive/` | 완료된 WO 이동 보관 |

#### WO 작업 흐름

```
1. README.md에 의존성 그래프 작성
        ↓
2. work-orders-templet.md 복사 → WO-001.md 작성
        ↓
3. Claude에게 WO 파일 경로 전달 → 구현
        ↓
4. 완료 시 ROADMAP.md 상태 업데이트
        ↓
5. WO 파일을 archive/ 폴더로 이동
```

#### WO 파일명 규칙
```
WO-001.md   # 아직 진행 중 → work-orders/ 루트에 위치
archive/WO-001.md  # 완료 → archive 이동
```

---

### 🎨 docs/design/ — 디자인 시스템 스펙

앱의 시각적 언어를 정의합니다. 구현 전에 먼저 확인하세요.

| 파일 | 내용 |
|------|------|
| `01-공통-토큰-구조.md` | 테마 컬러 토큰 계층 구조 |
| `02-디자인-시스템.md` | 컬러 팔레트, 타이포그래피, 간격 |
| `03-애니메이션-전환.md` | Reanimated 프리셋, Reduced Motion 주의사항 |
| `04-Skia-에셋-목록.md` | Skia 컴포넌트 목록 및 오버레이 패턴 |
| `05-다크모드-전환-규칙.md` | colorScheme 처리 규칙 |
| `06-미디어-에셋-관리.md` | 이미지/폰트/사운드 에셋 관리 |
| `07-폰트-관리.md` | 커스텀 폰트 로딩 패턴, FOUT 방지 |

---

### ⚡ docs/gamma-dispatch.md — AI 병렬 작업

**대규모 Phase(10개 이상 WO)를 AI 2명에게 동시 분배할 때 사용합니다.**
각 AI의 담당 WO, 파일 소유권, 세션 프롬프트를 이 파일에 작성하세요.

---

## 🏗️ FSD 레이어 규칙

### 레이어 개요

| 레이어 | 폴더 | 역할 |
|--------|------|------|
| Layer 6 | `shared/` | 공통 유틸, UI 컴포넌트, 타입, 상수 |
| Layer 5 | `entities/` | 도메인 모델, 타입, 엔티티 UI |
| Layer 4 | `features/` | 유저 액션 단위 비즈니스 로직 + Zustand Store |
| Layer 3 | `widgets/` | 복합 UI 블록 (여러 features 조합) |
| Layer 2 | `pages/` | 전체 화면 단위 컴포넌트 |

### Import 방향 (절대 규칙)

```
app → pages → widgets → features → entities → shared
```

- ✅ 상위 레이어가 하위 레이어를 import
- ❌ 같은 레이어 간 직접 import 금지
- ❌ 하위 레이어가 상위 레이어를 import 금지

### 슬라이스 구조

```
src/features/[slice-name]/
├── model/
│   ├── use[Slice]Store.ts   # Zustand store
│   └── types.ts
├── ui/
│   └── [Component].tsx
└── index.ts                 # Public API (명시적 export만)
```

### index.ts Public API 원칙

```typescript
// ✅ 필요한 것만 export
export { useMyStore } from './model/useMyStore';
export type { MyType } from './model/types';

// ❌ 내부 구현 노출 금지
// export * from './model/internalUtils';
```

---

## 📐 절대경로 별칭

```typescript
// tsconfig.json + babel-plugin-module-resolver로 설정됨

import { HomePage } from '@pages/home';
import { useMyStore } from '@features/my-feature';
import { MyEntity } from '@entities/my-entity';
import { STORAGE_KEYS } from '@shared/config/constants';
import { ErrorBoundary } from '@shared/ui';
```

| 별칭 | 실제 경로 |
|------|-----------|
| `@pages/` | `src/pages/` |
| `@widgets/` | `src/widgets/` |
| `@features/` | `src/features/` |
| `@entities/` | `src/entities/` |
| `@shared/` | `src/shared/` |

**상대경로(`../../`) 사용 금지.**

---

## ⚙️ 기술 스택

| 항목 | 선택 | 비고 |
|------|------|------|
| 플랫폼 | iOS / Android | React Native |
| 프레임워크 | Expo SDK 55 | Managed → EAS Build |
| 언어 | TypeScript strict | `any` 금지 |
| 아키텍처 | FSD | 6레이어 |
| 스타일링 | NativeWind v4 | Tailwind CSS for RN |
| 애니메이션 | react-native-reanimated 4.x | worklets 포함 |
| 2D 렌더링 | @shopify/react-native-skia | EAS Build 필수 |
| 상태관리 | zustand 5.x | persistQueue 패턴 |
| 네비게이션 | expo-router | 파일 기반 |
| 저장소 | AsyncStorage | 수동 persist |
| 햅틱 | expo-haptics | |
| 패키지 매니저 | npm | |

---

## ⚠️ 핵심 기술 주의사항

### expo-router
- **`src/app/` 폴더 생성 금지** — expo-router가 라우터 루트로 오인 (ERR-001)
- `<Redirect>`를 `<Stack>` 외부에서 조건부 렌더 금지 → 무한 루프 (ERR-004)
- `app/` 라우트 파일은 thin wrapper만 — UI 로직은 `src/pages/`에

### NativeWind
- 4가지 설정 파일 모두 필요: `metro.config.js`, `tailwind.config.js`, `babel.config.js`, `src/global.css` (ERR-002)
- 동적 클래스 생성 금지: `bg-${color}` ❌ → `isDark ? 'bg-gray-900' : 'bg-white'` ✅
- Skia Canvas 내부에 NativeWind 클래스 사용 불가

### Skia
- **Expo Go 미지원 → EAS Build (dev client) 필수**
- Canvas 내부에 RN View 직접 배치 불가 → 오버레이 패턴 사용
- `Skia.Font(null, size)` → JSI 크래시. 반드시 `Skia.Font(undefined, size)`

### Reanimated
- `reanimated/plugin`은 `babel.config.js` plugins 배열 **마지막**에 위치
- `withRepeat(-1)` + Reduced Motion = **ANR 크래시** → `useReducedMotion()` 체크 필수
- Hooks를 `.map()` 안에서 호출 금지 → 별도 컴포넌트로 분리
- SharedValue 남용 금지 → 필요한 것만 선언

### Zustand + AsyncStorage
- persist 미들웨어 사용 금지 → **persistQueue 패턴** 사용 (직렬화 큐)
- `_isHydrated: false` 가드 필수 — hydration 완료 전 렌더 차단
- `Math.random()` 금지 → 시드 기반 RNG(`mulberry32`) 사용

### Android 빌드
- 루트에 `index.js` 필요: `import 'expo-router/entry';` (ERR-003)
- `babel-preset-expo` 설치 확인 (ERR-005)
- Android SDK 경로 설정 확인 (ERR-006)

### 폰트
- Dev Client에서 `useFonts` 에러는 정상 → 에러를 "완료"로 처리 (ERR-004)
- Skia 폰트 + RN 폰트 둘 다 완료 후 SplashScreen 숨기기

---

## 🔄 Zustand Store 기본 패턴

```typescript
// src/features/[slice]/model/use[Slice]Store.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

type State = {
  data: MyType[];
  _isHydrated: boolean;
};
type Actions = {
  load: () => Promise<void>;
  add: (item: MyType) => void;
};

// 직렬화 큐 — 순서 보장 + 레이스컨디션 방지
let _saveQueue: Promise<void> = Promise.resolve();
function enqueueSave(data: MyType[]) {
  _saveQueue = _saveQueue.then(() =>
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(console.error)
  );
}

export const use[Slice]Store = create<State & Actions>((set, get) => ({
  data: [],
  _isHydrated: false,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      set({ data: raw ? JSON.parse(raw) : [], _isHydrated: true });
    } catch {
      set({ _isHydrated: true });
    }
  },

  add: (item) => {
    set((s) => ({ data: [...s.data, item] }));
    enqueueSave(get().data);
  },
}));
```

---

## 🧭 새 기능 추가 절차

```
1. docs/work-orders/WO-XXX.md 작성 (templet 복사)
        ↓
2. Claude에게 WO 파일 전달
   "docs/work-orders/WO-XXX.md를 읽고 구현해주세요"
        ↓
3. 구현 완료 후 npx tsc --noEmit 확인
        ↓
4. docs/work-orders/ROADMAP.md 상태 업데이트
        ↓
5. WO-XXX.md → archive/ 이동
        ↓
6. 새 에러 발견 시 docs/error/에 추가
```
