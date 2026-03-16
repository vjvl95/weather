# AI 실행 프로토콜

## 기본 원칙

AI 에이전트가 Work Order를 수행할 때 반드시 준수해야 하는 규칙입니다.

---

## 1. WO 시작 전 체크리스트

- [ ] `docs/work-orders/WO-XXX.md` 파일 읽기 완료
- [ ] 담당 경로 확인 — 다른 WO와 겹치지 않는가?
- [ ] 의존성 WO가 모두 완료되었는가?
- [ ] 현재 브랜치/워크트리 확인

## 2. 코드 작성 규칙

### 절대 규칙
- FSD import 방향 위반 금지 (`app → pages → widgets → features → entities → shared`)
- 같은 레이어 간 직접 import 금지
- 절대경로 필수 — 상대경로 `../../` 금지
- `Math.random()` 금지 — 시드 기반 RNG 사용 (`mulberry32`)
- 하드코딩 색상 금지 — 테마 토큰 사용

### TypeScript
- strict mode 준수
- `any` 타입 금지
- `as unknown as T` 남용 금지

### 파일 소유권
- **담당 WO 경로 외의 파일 수정 금지**
- 공유 파일(`shared/lib/index.ts` 등)은 append-only (기존 export 삭제·변경 금지)

## 3. WO 완료 기준

모든 항목이 체크되어야 완료로 간주합니다:

- [ ] 모든 파일 생성/수정 완료
- [ ] `npx tsc --noEmit` — TypeScript 컴파일 에러 없음
- [ ] `npx jest` — 테스트 통과 (테스트가 있는 WO에 한함)
- [ ] 절대경로 import 정상 동작
- [ ] WO별 완료 기준 항목 전부 체크

## 4. 커밋 규칙

```bash
# WO 완료 시 개별 커밋
git commit -m "feat: WO-0XX <작업 제목>"

# 버그 수정
git commit -m "fix: WO-0XX <수정 내용>"
```

## 5. 파일 소유권 충돌 해결

공유 파일에 변경이 필요한 경우 직접 수정 대신 아래 형식으로 출력:

```
### 🔀 [파일명] 변경 요청 (WO-0XX)
소유자에게 전달: [파일 경로]에 아래 변경을 병합해주세요.

**추가할 import:**
\`\`\`typescript
import { ... } from '...';
\`\`\`

**추가할 코드:**
\`\`\`typescript
// 추가 위치 설명
...
\`\`\`
```

## 6. 에러 처리 정책

- 런타임 에러는 ErrorBoundary로 처리
- async 함수는 try/catch 필수
- storage 읽기/쓰기 실패 시 기본값 fallback 제공

## 7. 성능 주의사항

- `withRepeat(-1)` + Reduced Motion = ANR 크래시 → `useReducedMotion()` 체크 필수
- Hooks를 `.map()` 안에서 호출 금지 → 별도 컴포넌트 추출
- SharedValue 남용 금지 → 필요한 것만 선언
- Skia Canvas 내부에 RN View 직접 배치 불가 → 오버레이 패턴 사용
