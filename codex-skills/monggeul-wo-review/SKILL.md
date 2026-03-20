---
name: monggeul-wo-review
description: Use when the user asks to review whether a completed Work Order implementation matches its WO in the Monggeul weather project, such as "WO-008 리뷰" or "Review WO-010". This skill reads the WO and owned files, checks scope and rule compliance, writes docs/review/REVIEW-WO-XXX.md, and updates ROADMAP review statuses.
---

# Monggeul WO Review

Use this skill only in repos that contain `docs/work-orders/ROADMAP.md` and `CLAUDE.md`.

## Resolve The Target WO

- Normalize the user's WO reference to `WO-XXX`.
- If the user did not specify a WO, ask for the WO number instead of guessing.

## Read Before Reviewing

Read:

- `docs/work-orders/<WO>.md`
- `docs/work-orders/ROADMAP.md`
- `CLAUDE.md`
- every file inside the WO's owned paths that was created or modified for the implementation

## Workflow

1. Change the target `ROADMAP.md` row to `검토 중`.
2. If the summary table does not already include `검토 중` or `검토 완료`, add the missing rows before updating counts.
3. Review only the target WO's owned paths.
4. Check:
   - whether every WO requirement is implemented
   - whether files outside the owned scope were modified
   - whether the implementation follows the project rules from `CLAUDE.md`
   - whether code-verification completion items are actually satisfied
5. Do not mark device-only checks as complete.
6. Create `docs/review/REVIEW-<WO>.md`. Create `docs/review/` first if it does not exist.
7. Write findings to the user with issues first, then assumptions, then a short summary if needed.
8. Update the target `ROADMAP.md` row to `검토 완료`, write today's date in `YYYY-MM-DD`, and keep the summary counts consistent.

## Report Template

Use this structure in `docs/review/REVIEW-<WO>.md`:

```markdown
## <WO>: 제목 (YYYY-MM-DD)

### 분석 결과
- 생성 파일: ...
- 수정 파일: ...
- 특이사항: ...
```

## Guardrails

- This skill reviews code. It does not silently fix the implementation.
- Keep the review grounded in the WO document and owned paths.
- Flag out-of-scope edits explicitly.
