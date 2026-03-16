# 작업 지시서 (Work Orders) — [프로젝트명]

## 마일스톤 목표

> **"[이 마일스톤에서 달성할 핵심 목표를 한 문장으로]"**

---

## 의존성 그래프

```
Wave 1 (동시 진행 가능) ─ 선행 작업, 의존성 없음
├── WO-001: [작업 제목]
└── WO-002: [작업 제목]
        │
        ▼
Wave 2 (동시 진행 가능) ─ Wave 1 완료 후
├── WO-003: [작업 제목]   [의존: WO-001]  → src/shared/config/
├── WO-004: [작업 제목]   [의존: WO-002]  → src/shared/lib/
└── WO-005: [작업 제목]   [의존: WO-002]  → src/entities/[도메인]/
        │
        ▼
Wave 3 (동시 진행 가능) ─ Wave 2 완료 후
└── WO-006: [작업 제목]   [의존: WO-003, WO-004, WO-005]  → src/features/[기능]/
```

---

## 충돌 방지 규칙 (필독)

1. **각 WO는 "담당 경로"에 명시된 파일/폴더만 생성·수정·삭제한다**
2. 다른 WO의 담당 경로에 있는 파일을 **절대** 수정하지 않는다
3. 같은 Wave 내 WO끼리는 담당 경로가 완전히 분리되어 있으므로 동시 작업 가능
4. 다른 WO에서 export한 모듈을 import하는 것은 허용 (읽기 전용)
5. `src/shared/` 하위 index.ts는 해당 서브폴더 WO 담당자만 수정

---

## WO 총괄표

| WO | 제목 | Wave | 담당 경로 | 의존성 | 예상 소요 |
|----|------|------|-----------|--------|-----------|
| 001 | [제목] | 1 | `src/shared/types/` | 없음 | 1~2h |
| 002 | [제목] | 1 | `app/*` | 없음 | 1~2h |
| 003 | [제목] | 2 | `src/shared/config/` | WO-002 | 1~2h |
| 004 | [제목] | 2 | `src/shared/lib/` | WO-001 | 2~3h |
| 005 | [제목] | 2 | `src/entities/[도메인]/` | WO-001 | 2~3h |
| 006 | [제목] | 3 | `src/features/[기능]/` | WO-003,004,005 | 3~4h |

---

## 작업 순서 요약

```
[1일차]  Wave 1 → 2명이 WO-001, WO-002 동시 진행
[2일차]  Wave 2 → 최대 N명이 WO-003~005 동시 진행
[3일차]  Wave 3 → 2명이 WO-006 진행
```

> 각 Wave는 이전 Wave가 모두 완료 & 머지된 후 시작한다.
> 실제 일정은 WO별 난이도와 인원에 따라 조정.

---

## 기술 스택 (공통)

| 항목 | 선택 |
|------|------|
| 프레임워크 | Expo SDK 55 |
| 언어 | TypeScript (strict mode) |
| 아키텍처 | FSD (Feature-Sliced Design) |
| 스타일링 | NativeWind v4 |
| 상태관리 | zustand 5.x |
| 네비게이션 | expo-router |
| 패키지 매니저 | npm |

---

## FSD import 규칙 (전 WO 공통)

```
상위 → 하위만 허용:
app → pages → widgets → features → entities → shared
```

- 같은 레이어 간 직접 import 금지
- 절대경로 필수 (`@shared/`, `@entities/`, `@features/`, `@widgets/`, `@pages/`)
- 각 슬라이스의 `index.ts`에서 public API만 export
