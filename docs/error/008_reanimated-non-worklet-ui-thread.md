# ERR-008: Reanimated "Tried to synchronously call a non-worklet function on the UI thread"

## 증상

- 앱 실행 중 캐릭터 탭 또는 쓰다듬기 시 크래시
- 에러 메시지: `Tried to synchronously call a non-worklet function 'handleTap' on the UI thread.`
- 제스처 콜백(`onEnd`, `onStart`, `onUpdate`) 내에서 발생

## 원인

`react-native-gesture-handler`의 제스처 콜백(`Gesture.Tap().onEnd()`, `Gesture.Pan().onStart()` 등)은 **UI 스레드(worklet)**에서 실행됩니다.

이 콜백 내에서 일반 JS 함수(React 상태 변경, Zustand 액션 등)를 직접 호출하면 UI 스레드에서 JS 스레드 함수를 동기 호출하려 해서 크래시가 발생합니다.

```typescript
// ❌ 크래시 — UI 스레드에서 JS 함수 직접 호출
const tapGesture = Gesture.Tap().onEnd(() => {
  scale.value = withSpring(1.15);  // ✅ SharedValue는 OK (worklet)
  onTap();                          // ❌ JS 함수 직접 호출 → 크래시
});
```

## 해결

`react-native-reanimated`의 `runOnJS`로 JS 함수 호출을 감쌉니다.

```typescript
import { runOnJS } from 'react-native-reanimated';

// ✅ 정상 — runOnJS로 JS 스레드에서 실행
const tapGesture = Gesture.Tap().onEnd(() => {
  scale.value = withSpring(1.15);   // SharedValue 조작은 그대로
  runOnJS(onTap)();                  // JS 함수는 runOnJS로 감싸기
});

const panGesture = Gesture.Pan()
  .onStart(() => {
    runOnJS(onPetStart)();           // ✅
  })
  .onUpdate((e) => {
    'worklet';
    rotate.value = e.translationX * 0.1;  // SharedValue만 조작
  })
  .onEnd(() => {
    rotate.value = withSpring(0);
    runOnJS(onPetEnd)();             // ✅
  });
```

## 판별 기준

제스처 콜백 내에서 호출하는 함수가:

| 대상 | UI 스레드 안전 | 처리 |
|------|:---:|------|
| SharedValue 조작 (`.value = ...`) | ✅ | 그대로 사용 |
| Reanimated 함수 (`withSpring`, `withTiming` 등) | ✅ | 그대로 사용 |
| JS 함수 (React 콜백, Zustand 액션, `console.log`) | ❌ | `runOnJS(fn)()` |
| `'worklet'` 지시어가 있는 함수 | ✅ | 그대로 사용 |

## 관련 파일

- `src/widgets/character-view/ui/CharacterSprite.tsx` — 탭/팬 제스처 콜백
