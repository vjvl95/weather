# WO-XXX: 작업 제목

## 메타
- **우선순위**: AXX (A01=최우선, A02=우선, A03=표준, A04=후순위)
- **상태**: 대기 | 진행중 | 완료
- **예상 소요**: X~X시간
- **의존성**: WO-XXX, WO-XXX (없으면 "없음")
- **Wave**: X (동시 작업 그룹 번호)

---

## 담당 범위 (충돌 방지)

이 WO는 아래 경로의 파일만 생성·수정·삭제합니다.
**다른 WO의 담당 경로를 절대 수정하지 마세요.**

| 작업 | 경로 |
|------|------|
| **생성** | `src/xxx/xxx.ts` |
| **수정** | `src/xxx/xxx.ts` |
| **삭제** | `src/xxx/xxx.ts` |

---

## 기술 스택 요약
- **언어**: TypeScript (strict mode)
- **프레임워크**: Expo SDK 55 (Managed → EAS Build)
- **스타일링**: NativeWind v4 (Tailwind CSS for RN)
- **아키텍처**: FSD (Feature-Sliced Design)
- **경로**: 절대경로 필수 (`@app/`, `@pages/`, `@widgets/`, `@features/`, `@entities/`, `@shared/`)
- **패키지 매니저**: npm
- (이 WO에 관련된 기술만 기재)

---

## 작업 내용

### 1. 첫 번째 작업

구체적인 설명과 함께 생성/수정할 파일의 코드를 명시한다.

```typescript
// File: src/xxx/xxx.ts
// 실제 코드 내용
export function example() {
  return 'hello';
}
```

### 2. 두 번째 작업

```typescript
// File: src/xxx/yyy.ts
```

### 3. 단위 테스트 (해당 시)

```typescript
// File: src/xxx/__tests__/xxx.test.ts
import { example } from '../xxx';

describe('example', () => {
  it('기본 동작', () => {
    expect(example()).toBe('hello');
  });
});
```

---

## 완료 기준
- [ ] 모든 파일 생성/수정 완료
- [ ] TypeScript 컴파일 에러 없음 (`npx tsc --noEmit`)
- [ ] 테스트 통과 (해당 시) (`npx jest src/xxx`)
- [ ] 절대경로 import 동작 확인
- [ ] (기능별 구체적 기준 추가)

## 참고
- FSD import 규칙: 상위 → 하위만 허용 (`app → pages → widgets → features → entities → shared`)
- 절대경로 필수: `@shared/types`, `@entities/[도메인]` 등 (상대경로 `../../` 금지)
- 참고 문서: [관련 기획 문서] 섹션 X
- (이 WO 특이사항, 주의점, 향후 확장 포인트 등 기재)
