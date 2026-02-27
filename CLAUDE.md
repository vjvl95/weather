# MyApp - 프로젝트명을 변경하세요

## 프로젝트 상태: 초기 세팅 완료

Expo SDK 55 + TypeScript strict + FSD 구조 + NativeWind + 절대경로 설정 완료.
expo-router 기반 네비게이션 (탭: Home/Settings + Stack: Detail).

---

## 기술 스택

| 항목 | 선택 |
|------|------|
| 플랫폼 | iOS / Android (React Native) |
| 프레임워크 | Expo (Managed → EAS Build) |
| 언어 | TypeScript (strict mode) |
| 아키텍처 | FSD (Feature-Sliced Design) |
| 스타일링 | NativeWind v4 (Tailwind CSS for RN) |
| 애니메이션 | react-native-reanimated 4.x + react-native-worklets |
| 2D 렌더링 | @shopify/react-native-skia |
| 리스트 | @legendapp/list v2 (LegendList) |
| 상태관리 | zustand 5.x |
| 네비게이션 | expo-router |
| 사운드 | expo-av |
| 햅틱 | expo-haptics |
| 저장소 | AsyncStorage |

---

## FSD 폴더 구조

```
src/
├── app/          # Layer 1: 앱 초기화, 프로바이더
├── pages/        # Layer 2: 전체 화면 단위
├── widgets/      # Layer 3: 복합 UI 블록
├── features/     # Layer 4: 유저 액션 단위 비즈니스 로직
├── entities/     # Layer 5: 도메인 모델
└── shared/       # Layer 6: 공통 유틸, 설정, UI
```

### expo-router 라우팅 (`app/` 디렉토리)
```
app/
├── _layout.tsx          # RootLayout (GestureHandler, StatusBar)
├── (tabs)/
│   ├── _layout.tsx      # 탭 네비게이션
│   ├── index.tsx        # → HomePage
│   └── settings.tsx     # → SettingsPage
└── detail.tsx           # → DetailPage (Stack/Modal)
```
라우트 파일은 thin wrapper. 실제 UI는 `src/pages/` FSD 구조에서 구현.

### FSD import 규칙 (엄격)
- **상위 → 하위만 허용**: app → pages → widgets → features → entities → shared
- 같은 레이어 간 직접 import 금지
- 각 슬라이스의 `index.ts`에서 public API만 export

---

## 절대경로 (필수)

```typescript
// 상대경로 금지
import { HomePage } from '@pages/home';
import { useCounterStore } from '@features/counter';
import { ExampleCard } from '@entities/example';
import { theme } from '@shared/config/theme';
```

별칭: `@app/`, `@pages/`, `@widgets/`, `@features/`, `@entities/`, `@shared/`
설정: tsconfig.json paths + babel-plugin-module-resolver

---

## 기술적 주의사항

- **Skia는 Expo Go 미지원** → EAS Build (dev client) 필수
- Skia Canvas 내부에 RN View 직접 배치 불가 → 오버레이 패턴 사용
- SharedValue 남용 금지 → 필요한 것만 선언 (메모리 이슈)
- NativeWind는 RN View/Text 등 일반 UI에만 사용 (Skia 내부 불가)
- `reanimated/plugin`은 babel plugins 배열의 **마지막**에 위치
- 물리 연산은 worklet 내 순수 수학만 (JS 함수 호출 금지)
