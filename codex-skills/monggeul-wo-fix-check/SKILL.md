---
name: monggeul-wo-fix-check
description: Use when the user asks to apply or follow up on CHECK review results in the Monggeul weather project, such as "CHECK 결과 반영", "fix CHECK for WO-006", or "검수 결과 수정". This skill selects a target CHECK doc, classifies issues into code, WO-doc, and user-decision buckets, applies safe fixes when possible, updates CHECK-WO-XXX.md, and updates CHECK-ROAD.md.
---

# Monggeul WO Fix Check

Use this skill only in repos that contain `docs/check/`, `docs/work-orders/`, and `CLAUDE.md`.

## Resolve The Target WO

- If the user specified a WO, normalize it to `WO-XXX`.
- If the user did not specify a WO:
  - read `docs/check/CHECK-ROAD.md`
  - choose the first row whose status is `완료` and whose `docs/check/CHECK-<WO>.md` still contains `⚠️` or `❌`
  - skip rows already marked `수정 중`
  - if nothing qualifies, report that there is no CHECK result to fix
- Mark the selected row in `CHECK-ROAD.md` as `수정 중`.

## Read Before Acting

Read:

- `docs/check/CHECK-<WO>.md`
- `docs/check/CHECK-ROAD.md`
- the related `docs/work-orders/<WO>.md`
- `CLAUDE.md`

## Workflow

1. If the CHECK doc already says there is no problem to fix, update the `CHECK-ROAD.md` row to `검토 완료`, set today's date, and report that no action was needed.
2. Classify each open issue:
   - code fix
   - WO or roadmap document fix
   - user decision required
3. Apply code fixes directly when they are safe and local.
4. When a placeholder is required to unblock the codebase, add `// TODO: [WO-XXX] 실제 구현 예정`.
5. Update WO or roadmap docs directly when the issue is purely documentary.
6. If a design or product choice is required, stop and ask the user a concise question instead of guessing.
7. Update `docs/check/CHECK-<WO>.md`:
   - resolved items -> `✅`
   - still-blocked items -> keep `⚠️` or `❌` with the blocker
   - rewrite the overall verdict
8. If every issue is resolved, update `CHECK-ROAD.md` to `검토 완료` with today's date. Otherwise set it to `검토 필요`.

## Guardrails

- Do not silently widen scope beyond the CHECK findings.
- Do not change unrelated WOs or review documents.
- Keep the final report split into `해결된 문제`, `사용자 결정 필요`, and `최종 판정`.
