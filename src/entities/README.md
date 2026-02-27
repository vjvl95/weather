# Entities (Layer 5)

도메인 객체(비즈니스 엔티티)의 타입, UI, 유틸리티.

## 규칙

- **도메인 모델 중심** (예: User, Product, Session)
- shared만 import 가능
- pages, widgets, features를 import 금지, 다른 entity를 직접 import 금지
- 타입 정의는 `model/` 폴더에 배치
- Entity 전용 UI 컴포넌트는 `ui/` 폴더에 배치
- 각 Entity는 `index.ts`에서 public API만 export

## 폴더 구조

```
entities/
├── example/
│   ├── model/
│   │   └── types.ts          # 타입/인터페이스 정의
│   ├── ui/
│   │   └── ExampleCard.tsx   # Entity 전용 UI
│   ├── lib/                   # (선택) Entity 전용 유틸
│   └── index.ts
└── README.md
```

## 사용 예시

```typescript
import { ExampleCard } from '@entities/example';
import type { ExampleCardProps } from '@entities/example';
```
