# Features (Layer 4)

사용자 시나리오 단위의 비즈니스 로직.

## 규칙

- **하나의 유저 액션 = 하나의 Feature** (예: 로그인, 카운터 증가, 데이터 저장)
- entities, shared만 import 가능
- pages, widgets를 import 금지, 다른 feature를 직접 import 금지
- zustand store는 `model/` 폴더에 배치
- 각 Feature는 `index.ts`에서 public API만 export

## 폴더 구조

```
features/
├── counter/
│   ├── model/
│   │   └── useCounterStore.ts    # zustand store
│   ├── ui/                        # (선택) feature 전용 UI
│   ├── lib/                       # (선택) feature 전용 유틸
│   └── index.ts
└── README.md
```

## 사용 예시

```typescript
import { useCounterStore } from '@features/counter';

const { count, increment } = useCounterStore();
```
