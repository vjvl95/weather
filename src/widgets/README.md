# Widgets (Layer 3)

여러 Feature/Entity를 조합한 복합 UI 블록.

## 규칙

- **독립적으로 의미 있는 UI 단위** (예: 헤더, 차트, 리스트 카드 그룹)
- features, entities, shared만 import 가능
- pages를 import 금지, 다른 widget을 직접 import 금지
- 비즈니스 로직은 features에 위임하고, widget은 조합/레이아웃 역할만 담당
- 각 Widget은 `index.ts`에서 public API만 export

## 폴더 구조

```
widgets/
├── my-widget/
│   ├── ui/
│   │   └── MyWidget.tsx
│   └── index.ts
└── README.md
```
