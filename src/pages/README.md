# Pages (Layer 2)

전체 화면 단위의 UI 컴포넌트를 배치하는 레이어.

## 규칙

- **하나의 라우트 = 하나의 Page**
- `app/` 디렉토리의 라우트 파일은 thin wrapper로만 사용하고, 실제 UI는 이곳에서 구현
- widgets, features, entities, shared만 import 가능
- 다른 Page를 직접 import 금지
- 각 Page는 `index.ts`에서 public API만 export

## 폴더 구조

```
pages/
├── home/
│   ├── ui/
│   │   └── HomePage.tsx
│   └── index.ts          # export { HomePage } from './ui/HomePage'
├── settings/
│   ├── ui/
│   │   └── SettingsPage.tsx
│   └── index.ts
└── README.md
```

## 사용 예시

```typescript
// app/(tabs)/index.tsx (thin wrapper)
import { HomePage } from '@pages/home';
export default HomePage;
```
