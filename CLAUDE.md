# Expo FSD 템플릿

Expo SDK 55 + TypeScript strict + FSD 아키텍처 + NativeWind v4 + 절대경로가
미리 세팅된 **시작점**입니다. 새 앱을 만들 때 이 레포를 클론해서 시작하세요.

> 새 프로젝트 초기 설정은 → `docs/SETUP_CHECKLIST.md`
> docs 폴더 안내는 → `docs/README.md`
> 에러 트러블슈팅은 → `docs/error/README.md`
> 구현 패턴 레퍼런스는 → `docs/work-orders/IMPLEMENTATION_GUIDE.md`

---

## 🏗️ FSD 레이어 규칙

| 레이어  | 폴더        | 역할                                         |
| ------- | ----------- | -------------------------------------------- |
| Layer 6 | `shared/`   | 공통 유틸, UI 컴포넌트, 타입, 상수           |
| Layer 5 | `entities/` | 도메인 모델, 타입, 엔티티 UI                 |
| Layer 4 | `features/` | 유저 액션 단위 비즈니스 로직 + Zustand Store |
| Layer 3 | `widgets/`  | 복합 UI 블록 (여러 features 조합)            |
| Layer 2 | `pages/`    | 전체 화면 단위 컴포넌트                      |

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

| 별칭         | 실제 경로       |
| ------------ | --------------- |
| `@pages/`    | `src/pages/`    |
| `@widgets/`  | `src/widgets/`  |
| `@features/` | `src/features/` |
| `@entities/` | `src/entities/` |
| `@shared/`   | `src/shared/`   |

설정: `tsconfig.json` paths + `babel-plugin-module-resolver`
**상대경로(`../../`) 사용 금지.**

---

## ⚠️ 핵심 기술 주의사항

### expo-router
- **`src/app/` 폴더 생성 금지** — expo-router가 라우터 루트로 오인 (ERR-001)
- `<Redirect>`를 `<Stack>` 외부에서 조건부 렌더 금지 → 무한 루프 (ERR-004)
- `app/` 라우트 파일은 thin wrapper만 — UI 로직은 `src/pages/`에

### NativeWind
- 핵심 설정 4개가 모두 필요: `metro.config.js`, `tailwind.config.js`, `babel.config.js`, `src/global.css` (ERR-002)
- `babel.config.js`에는 `jsxImportSource: 'nativewind'`와 `'nativewind/babel'`이 모두 있어야 함
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

### Zustand + AsyncStorage
- persist 미들웨어 사용 금지 → **persistQueue 패턴** 사용 (직렬화 큐)
- `_isHydrated: false` 가드 필수 — hydration 완료 전 렌더 차단
- `Math.random()` 금지 → 시드 기반 RNG(`mulberry32`) 사용

### Android 빌드
- 루트 `index.js`는 `import 'expo-router/entry';` 한 줄만 유지하는 호환성 브리지 (ERR-003)
- `babel-preset-expo` 설치 확인 (ERR-005)
- Android SDK 경로 설정 확인 (ERR-006)

### 폰트
- Dev Client에서 `useFonts` 에러는 정상 → 에러를 "완료"로 처리 (ERR-004)
- Skia 폰트 + RN 폰트 둘 다 완료 후 SplashScreen 숨기기

---

## ★ WO 시작 프로토콜 (필수)

> **WO 작업을 시작할 때 반드시 아래를 수행해야 합니다.**

**0단계: WO 상태를 "진행 중"으로 변경**

1. 해당 `docs/work-orders/WO-XXX.md` 파일:
```markdown
- **상태**: 대기 → - **상태**: 진행 중
```

2. `docs/work-orders/ROADMAP.md` 두 곳:
```markdown
# ① 해당 WO 행 — 상태 변경
| WO-XXX | 제목 | 그룹 | 시간 | 의존 | 대기 | - |
                                          ↓
| WO-XXX | 제목 | 그룹 | 시간 | 의존 | 진행 중 | - |

# ② 상단 진행 현황 요약 카운터 업데이트
| 진행 중 | 0 |  →  | 진행 중 | 1 |
| 대기 | 10 |   →  | 대기 | 9 |
```

---

## ★ WO 완료 처리 프로토콜 (필수)

> **WO 작업이 완료되면 반드시 아래 3단계를 수행해야 합니다.**
> 코드만 작성하고 이 단계를 건너뛰면 안 됩니다.

**1단계: WO 파일 체크박스 + 상태 업데이트**

해당 `docs/work-orders/WO-XXX.md` 파일 수정:
```markdown
## 메타 — 상태 변경
- **상태**: 진행 중 → - **상태**: 완료

## 완료 기준 — 체크박스 체크 (코드 검증 항목만)
- [ ] 파일 생성 완료 → - [x] 파일 생성 완료
- [ ] tsc --noEmit 통과 → - [x] tsc --noEmit 통과
```

> **⚠️ 코드 검증 vs 디바이스 검증 구분 (필수)**
>
> | 구분              | 예시                                                   | 체크 주체          |
> | ----------------- | ------------------------------------------------------ | ------------------ |
> | **코드 검증**     | 파일 존재, 타입 일치, 로직 정합성, import 규칙         | Claude가 직접 체크 |
> | **디바이스 검증** | EAS 빌드 성공, 런타임 동작, 애니메이션 확인, 햅틱 동작 | 사용자가 직접 확인 |
>
> - 디바이스 검증 항목은 코드 리뷰만으로 **절대 체크하지 말 것**
> - 디바이스 검증이 필요한 항목은 `docs/device-test-checklist.md`에 별도 기록
> - 형식: `- [ ] [WO-XXX] 검증 항목 설명` → 사용자가 실기기 확인 후 체크

**2단계: ROADMAP.md 두 곳 업데이트**

`docs/work-orders/ROADMAP.md` 수정:
```markdown
# ① 해당 WO 행 — 상태/완료일 변경
| WO-XXX | 제목 | 그룹 | 시간 | 의존 | 진행 중 | - |
                                          ↓
| WO-XXX | 제목 | 그룹 | 시간 | 의존 | 완료 | 2026-03-19 |

# ② 상단 진행 현황 요약 카운터 업데이트
| 완료 | 1 |     →   | 완료 | 2 |
| 진행 중 | 1 |  →   | 진행 중 | 0 |
```

**3단계: 완료된 WO 파일을 archive로 이동**
```bash
mv docs/work-orders/WO-XXX.md docs/work-orders/archive/
```
