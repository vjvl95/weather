# 구현 가이드

> 이 프로젝트의 공통 구현 패턴과 기술적 의사결정을 정리합니다.

---

## 1. 상태 관리 패턴 (Zustand + AsyncStorage)

### persist 미들웨어 대신 수동 직렬화 큐 사용

```typescript
// features/[slice]/model/use[Slice]Store.ts

type State = {
  data: SomeType[];
  _isHydrated: boolean;
};

type Actions = {
  loadData: () => Promise<void>;
  addItem: (item: SomeType) => void;
};

// 직렬화 큐 — 순서 보장 + 레이스컨디션 방지
let _saveQueue: Promise<void> = Promise.resolve();
function enqueueSave(state: State) {
  _saveQueue = _saveQueue.then(() =>
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.data))
  );
}

export const use[Slice]Store = create<State & Actions>((set, get) => ({
  data: [],
  _isHydrated: false,

  loadData: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : [];
      set({ data, _isHydrated: true });
    } catch {
      set({ _isHydrated: true });
    }
  },

  addItem: (item) => {
    set((s) => ({ data: [...s.data, item] }));
    enqueueSave(get());
  },
}));
```

### _isHydrated 가드 패턴

```typescript
// 컴포넌트에서 hydration 완료 전 렌더 차단
const isHydrated = use[Slice]Store((s) => s._isHydrated);
if (!isHydrated) return <LoadingSpinner />;
```

---

## 2. FSD 슬라이스 구조

```
src/features/[slice]/
├── model/
│   ├── use[Slice]Store.ts   # Zustand store
│   ├── types.ts             # 슬라이스 전용 타입
│   └── [utils].ts           # 순수 함수
├── ui/
│   └── [Component].tsx      # UI 컴포넌트
└── index.ts                 # Public API (명시적 export)
```

### index.ts — Public API 원칙
```typescript
// 필요한 것만 export (내부 구현 노출 금지)
export { use[Slice]Store } from './model/use[Slice]Store';
export type { SliceType } from './model/types';
```

---

## 3. 네비게이션 (expo-router)

### 라우트 파일은 thin wrapper
```typescript
// app/[route].tsx — UI 로직 없음
import { [Page]Page } from '@pages/[page]';
export default function Route() {
  return <[Page]Page />;
}
```

### 타입 안전 라우팅
```typescript
import { useRouter } from 'expo-router';
const router = useRouter();
router.push('/[route]');
router.replace('/');  // 뒤로가기 스택 제거
```

---

## 4. NativeWind v4 스타일링 규칙

- RN 기본 컴포넌트(`View`, `Text`, `Pressable`)에만 className 사용
- Skia Canvas 내부에 NativeWind 클래스 사용 불가
- 동적 클래스 생성 금지 — 정적 클래스만 사용 (Tailwind 정적 분석 한계)

```typescript
// ❌ 동적 클래스 (Tailwind에서 감지 불가)
const color = isDark ? 'bg-gray-900' : 'bg-white';
<View className={`bg-${color}`} />

// ✅ 정적 클래스
<View className={isDark ? 'bg-gray-900' : 'bg-white'} />
```

---

## 5. Skia 애니메이션 패턴

### 메시 그라데이션 (카드 배경)
```typescript
// worklet 내부에서만 실행 — JS 함수 호출 금지
const animateBackground = useWorklet(() => {
  'worklet';
  const t = time.value;
  x1.value = cx + Math.sin(t * 0.8) * 60;
  y1.value = cy + Math.cos(t * 0.6) * 40;
});
```

### 오버레이 패턴 (Skia + RN View 혼합)
```typescript
// Canvas를 배경으로, RN View를 절대 위치로 오버레이
<View style={StyleSheet.absoluteFill}>
  <Canvas style={StyleSheet.absoluteFill}>
    {/* Skia 배경 */}
  </Canvas>
  <View className="flex-1 justify-center items-center">
    {/* RN UI */}
  </View>
</View>
```

### Reduced Motion 대응 (필수)
```typescript
import { useReducedMotion } from 'react-native-reanimated';

function AnimatedComponent() {
  const reduceMotion = useReducedMotion();
  // withRepeat(-1) 사용 전 반드시 체크
  const animation = reduceMotion
    ? withTiming(1, { duration: 0 })
    : withRepeat(withTiming(1, { duration: 1000 }), -1, true);
}
```

---

## 6. 시드 기반 랜덤 (mulberry32)

```typescript
import { mulberry32, hashSeed } from '@shared/lib';

// Math.random() 금지 — 반드시 시드 기반 RNG 사용
const rng = mulberry32(hashSeed('my-seed-string'));
const value = rng(); // 0~1 사이 결정론적 난수
```

---

## 7. 에러 처리

### ErrorBoundary 적용
```typescript
// app/[route].tsx 또는 최상위 컴포넌트에서 래핑
import { ErrorBoundary } from '@shared/ui';

function ScreenWrapper() {
  return (
    <ErrorBoundary onReset={() => { /* 추가 정리 */ }}>
      <ScreenContent />
    </ErrorBoundary>
  );
}
```

---

## 8. 스토리지 키 관리

```typescript
// shared/config/constants.ts — 모든 키를 중앙 관리
export const STORAGE_KEYS = {
  SETTINGS: '@app/settings',
  FAVORITES: '@app/favorites',
  // ...
} as const;
```

---

## 9. 타입 정의 위치

| 타입 종류 | 위치 |
|-----------|------|
| 도메인 엔티티 타입 | `src/entities/[도메인]/model/types.ts` |
| 슬라이스 내부 타입 | `src/features/[slice]/model/types.ts` |
| 공통 유틸 타입 | `src/shared/types/` |
| 컴포넌트 Props 타입 | 컴포넌트 파일 내 inline |
