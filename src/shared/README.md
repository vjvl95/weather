# Shared (Layer 6)

모든 레이어에서 사용 가능한 공통 유틸리티, 설정, UI 컴포넌트.

## 규칙

- **다른 레이어(pages, widgets, features, entities)를 import 금지**
- 외부 라이브러리 래핑, 공통 유틸, 디자인 토큰 등을 배치
- 앱 전체에서 재사용되는 것만 이곳에 배치

## 폴더 구조

```
shared/
├── config/          # 디자인 토큰(theme), 상수(constants)
├── lib/             # 유틸리티 함수 (haptics, sound, date 등)
├── types/           # 글로벌 타입 정의
├── ui/              # 공통 UI 컴포넌트 (Button, Card 등)
└── README.md
```

## 예시

```typescript
import { theme } from '@shared/config/theme';
import { haptics } from '@shared/lib/haptics';
import { Button } from '@shared/ui';
```
