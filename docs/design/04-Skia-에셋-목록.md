# 04 — Skia 에셋 목록

> @shopify/react-native-skia를 사용하는 커스텀 그래픽 컴포넌트 목록입니다.

---

## ⚠️ 주의사항

- **Skia는 Expo Go 미지원** → EAS Build (dev client) 필수
- Skia Canvas 내부에 RN View 직접 배치 불가 → **오버레이 패턴** 사용
- NativeWind 클래스는 Skia Canvas 내부에 적용 불가

---

## 오버레이 패턴 (필수)

```typescript
import { Canvas } from '@shopify/react-native-skia';
import { StyleSheet, View } from 'react-native';

function SkiaWithRNOverlay() {
  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Skia 레이어 (배경) */}
      <Canvas style={StyleSheet.absoluteFill}>
        {/* Skia 그래픽 */}
      </Canvas>
      {/* RN 레이어 (포그라운드) */}
      <View className="flex-1 justify-center items-center">
        {/* 일반 RN 컴포넌트 */}
      </View>
    </View>
  );
}
```

---

## 에셋 목록

| 컴포넌트 | 위치 | 설명 |
|----------|------|------|
| (추가 예정) | - | - |

---

## Skia 폰트 로딩

```typescript
// Skia 폰트는 RN 폰트와 별도로 로딩 필요
import { Skia } from '@shopify/react-native-skia';

// ⚠️ Skia.Font(null, size) → JSI 크래시
// ✅ 반드시 Skia.Font(undefined, size) 사용
const font = Skia.Font(undefined, 16);
```

---

> TODO: 프로젝트에서 사용할 Skia 컴포넌트 목록 작성
