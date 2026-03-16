# ERR-004: Redirect + useFonts 에러 조합으로 인한 무한 리마운트 루프

## 증상

- 앱 실행 시 **영구 검은 화면** (스플래시 이후 아무것도 표시되지 않음)
- `adb logcat` 확인 시 `_layout.tsx`의 `useEffect`가 **수백 번 반복 실행**
- 콘솔: `Font file for [폰트명] is empty` 에러 반복
- CPU 사용량 급증, 앱 응답 없음

## 원인

3가지 문제가 동시에 결합되어 무한 루프가 발생했다:

### 1. useFonts의 "Font file is empty" 에러 (Dev Client 한정)

Dev Client에서 커스텀 폰트 로딩 시 Metro가 폰트 바이너리를 제대로 전달하지 못하면 `fontError`가 발생한다. 이는 Dev Client의 알려진 제한사항이며, EAS 프로덕션 빌드에서는 발생하지 않는다.

### 2. Redirect 컴포넌트의 레이아웃 리마운트

```tsx
// ❌ 문제가 되는 패턴
if (!hasCompletedOnboarding) {
  return <Redirect href="/onboarding" />;
}

return (
  <Stack>...</Stack>
);
```

`<Redirect>`가 `<Stack>` **외부**에서 렌더링되면 expo-router가 전체 레이아웃을 리마운트한다. 이는 모든 `useState`, `useEffect`를 초기화시킨다.

### 3. 무한 루프 메커니즘

```
1. 컴포넌트 마운트
2. useFonts → fontError 발생 ("Font file is empty")
3. fontsLoaded=false, fontError=Error → allFontsReady=true
4. onboarding 미완료 → <Redirect href="/onboarding"> 렌더
5. Redirect → 전체 레이아웃 리마운트 (모든 state 초기화!)
6. → 다시 1번으로... (무한 반복)
```

## 잘못된 해결 시도

### 시도 1: useRef로 fontError 캡처

```tsx
// ❌ useRef는 리렌더를 트리거하지 않음
const fontErrorCaptured = useRef(false);
useEffect(() => {
  if (fontError) fontErrorCaptured.current = true;
}, [fontError]);
```

`useRef` 변경은 리렌더를 발생시키지 않으므로, `allFontsReady`가 영원히 `false`로 남아 **영구 검은 화면**이 된다.

## 올바른 해결

두 가지를 동시에 수정:

### 수정 1: fontsDone을 useState로 (단방향 전이)

```tsx
// ✅ false→true 한 방향만 허용
const [fontsDone, setFontsDone] = useState(false);
useEffect(() => {
  if (!fontsDone && (fontsLoaded || fontError)) {
    setFontsDone(true);
  }
}, [fontsLoaded, fontError, fontsDone]);
```

`useState`는 리렌더를 트리거하고, `!fontsDone` 가드로 한 번만 전이된다.

### 수정 2: Redirect → useEffect + router.replace

```tsx
// ✅ Stack 마운트 후 네비게이션 — 리마운트 방지
useEffect(() => {
  if (allFontsReady && onboardingHydrated && !hasCompletedOnboarding) {
    router.replace('/onboarding');
  }
}, [allFontsReady, onboardingHydrated, hasCompletedOnboarding, router]);

// Stack은 항상 렌더됨
return (
  <Stack>
    <Stack.Screen name="(tabs)" />
    <Stack.Screen name="onboarding" />
  </Stack>
);
```

`router.replace()`는 Stack을 리마운트하지 않고 네비게이션만 수행한다.

## 교훈

- `<Redirect>`를 `<Stack>` 외부에서 조건부 렌더링하면 레이아웃 리마운트가 발생한다
- Dev Client에서 `useFonts` 에러는 정상적인 상황 — **에러를 "완료"로 처리**해야 한다
- `useRef` vs `useState`: 값 변경이 리렌더를 트리거해야 하는 경우 반드시 `useState` 사용
- 상태 전이를 단방향(monotonic)으로 설계하면 루프를 구조적으로 방지할 수 있다
- **3개 이상의 문제가 결합되면 개별 증상만으로 원인 파악이 매우 어렵다** — 디버그 로그로 실행 흐름을 추적해야 한다

## 관련 환경

- Expo SDK 55
- expo-router (Stack layout)
- expo-font (useFonts hook)
- EAS Dev Client (Android)

## 발견일

2026-03-09
