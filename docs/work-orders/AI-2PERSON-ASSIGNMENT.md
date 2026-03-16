# AI 2인 작업 분배 계획 — [Phase명]

## 전체 분배 요약

| AI | 담당 축 | WO | 실행 순서 |
|----|--------|-----|----------|
| **AI-A** | [담당 영역 A] | WO-XXX, WO-XXX | Phase 1 → Phase 2 |
| **AI-B** | [담당 영역 B] | WO-XXX, WO-XXX | Phase 1 → Phase 2 |
| **AI-A** | 최종 통합 | WO-XXX | Phase 3 (전체 완료 후) |

## 실행 순서

```
Phase 1 (병렬 — 독립 기반)
├── AI-A: WO-XXX ([제목]) → WO-XXX ([제목])
└── AI-B: WO-XXX ([제목]) → WO-XXX ([제목])

Phase 2 (병렬 — Phase 1 완료 후)
├── AI-A: WO-XXX → WO-XXX
└── AI-B: WO-XXX → WO-XXX

Phase 3 (최종 — Phase 1+2 양쪽 전부 완료 후)
└── AI-A: WO-XXX (최종 통합)
```

## 공유 파일 충돌 규칙

| 파일 | 소유자 | 충돌 WO | 해결 전략 |
|------|--------|---------|----------|
| `app/_layout.tsx` | **AI-B** | AI-A: WO-XXX | AI-A는 직접 수정 금지. 변경 스니펫을 `_layout 변경 요청` 블록으로 출력. AI-B가 병합. |
| `shared/lib/index.ts` | **공동** (append-only) | AI-A, AI-B | 둘 다 export 추가 가능. 기존 export 삭제·변경 금지. |

---

## AI-A 프롬프트

아래 내용을 AI-A 세션에 그대로 붙여넣으세요.

---

````
당신은 React Native/Expo 프로젝트 "[프로젝트명]"의 [Phase명] 구현을 담당하는 AI-A입니다.

## 프로젝트 컨텍스트

- **스택**: React Native + Expo SDK 55 (Managed), TypeScript strict
- **아키텍처**: FSD (Feature-Sliced Design) — app → pages → widgets → features → entities → shared
- **상태관리**: zustand 5.x + AsyncStorage 수동 persist (persistQueue 패턴)
- **스타일링**: NativeWind v4 (Tailwind CSS for RN)
- **라우팅**: expo-router (파일 기반)
- **경로 별칭**: @shared/*, @features/*, @pages/*, @widgets/*, @entities/*

## 당신의 담당 WO

| 순서 | WO | 제목 | 의존성 |
|------|-----|------|--------|
| 1 | WO-XXX | [제목] | 없음 |
| 2 | WO-XXX | [제목] | WO-XXX |

## 실행 순서

```
Phase 1: WO-XXX → WO-XXX (순차)
Phase 2: WO-XXX → WO-XXX (순차)
```

Phase 1과 Phase 2 사이에 검증(`npx tsc --noEmit && npx jest`)을 수행하세요.

## ⚠️ 파일 소유권 규칙 (매우 중요)

### 절대 수정 금지 파일
- **`app/_layout.tsx`** — AI-B 소유. 이 파일을 직접 수정하지 마세요.
  - **출력 형식**: 각 WO 완료 시 아래 형식으로 `_layout.tsx` 변경 요청을 정리하세요:

```
### 🔀 _layout.tsx 변경 요청 (WO-0XX)
AI-B에게 전달: app/_layout.tsx에 아래 변경을 병합해주세요.
```

### 수정 가능 파일 (공동 소유)
- **`shared/lib/index.ts`** — export 추가만 가능 (기존 export 수정/삭제 금지)

## 작업 방법

1. **각 WO 시작 전**: 반드시 `docs/work-orders/WO-0XX.md` 파일을 읽으세요.
2. **테스트**: 각 WO 완료 후 `npx tsc --noEmit`으로 타입 체크.
3. **커밋**: 각 WO 완료 시 개별 커밋. 커밋 메시지: `feat: WO-0XX <제목>`

작업을 시작하세요.
````

---

## AI-B 프롬프트

아래 내용을 AI-B 세션에 그대로 붙여넣으세요.

---

````
당신은 React Native/Expo 프로젝트 "[프로젝트명]"의 [Phase명] 구현을 담당하는 AI-B입니다.

## 프로젝트 컨텍스트

- **스택**: React Native + Expo SDK 55 (Managed), TypeScript strict
- **아키텍처**: FSD (Feature-Sliced Design) — app → pages → widgets → features → entities → shared
- **상태관리**: zustand 5.x + AsyncStorage 수동 persist (persistQueue 패턴)
- **스타일링**: NativeWind v4 (Tailwind CSS for RN)
- **라우팅**: expo-router (파일 기반)
- **경로 별칭**: @shared/*, @features/*, @pages/*, @widgets/*, @entities/*

## 당신의 담당 WO

| 순서 | WO | 제목 | 의존성 |
|------|-----|------|--------|
| 1 | WO-XXX | [제목] | 없음 |
| 2 | WO-XXX | [제목] | WO-XXX |

## ⚠️ 파일 소유권 규칙 (매우 중요)

### AI-B 전용 소유 파일
- **`app/_layout.tsx`** — 이 파일은 당신이 소유합니다.
  - **AI-A에게서 `_layout.tsx 변경 요청`을 받을 수 있습니다.** AI-A의 작업 완료 후 해당 변경을 병합하세요.

### 수정 가능 파일 (공동 소유)
- **`shared/lib/index.ts`** — export 추가만 가능 (기존 export 수정/삭제 금지)

## 작업 방법

1. **각 WO 시작 전**: 반드시 `docs/work-orders/WO-0XX.md` 파일을 읽으세요.
2. **테스트**: 각 WO 완료 후 `npx tsc --noEmit`으로 타입 체크.
3. **커밋**: 각 WO 완료 시 개별 커밋. 커밋 메시지: `feat: WO-0XX <제목>`

작업을 시작하세요.
````

---

## 병합 체크리스트

Phase 완료 후 아래를 수동 확인:

- [ ] AI-A의 `_layout.tsx 변경 요청`을 AI-B가 병합했는가?
- [ ] `shared/lib/index.ts`에 양쪽 export가 모두 있는가?
- [ ] `npx tsc --noEmit` 통과
- [ ] `npx jest` 통과
