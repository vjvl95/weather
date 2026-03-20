---
name: monggeul-wo-check
description: Use when the user asks to inspect a Work Order document in the Monggeul weather project for ownership conflicts, missing exports or modules, or CLAUDE.md rule violations, or when they want the next pending WO doc checked automatically. This skill can auto-select the first eligible WO from docs/check/CHECK-ROAD.md, create docs/check/CHECK-WO-XXX.md, and update CHECK-ROAD statuses.
---

# Monggeul WO Check

Use this skill only in repos that contain `docs/check/`, `docs/work-orders/`, and `CLAUDE.md`.

## Resolve The Target WO

- If the user specified a WO, normalize it to `WO-XXX`.
- If the user did not specify a WO:
  - read `docs/check/CHECK-ROAD.md`
  - choose the first row whose check status is `대기`
  - skip rows already marked `진행 중`
  - if every row is already handled, report that there is no WO to inspect
- Mark the selected row in `CHECK-ROAD.md` as `진행 중` before deeper inspection.

## Read Before Inspecting

Read:

- `docs/work-orders/<WO>.md`
- `docs/check/CHECK-ROAD.md`
- `docs/work-orders/README.md`
- `CLAUDE.md`
- `docs/work-orders/AI-EXECUTION-PROTOCOL.md` when ownership or validation rules are unclear

## Inspection Scope

1. Ownership conflicts:
   - overlap with another WO's owned paths
   - files marked as `생성` that already exist
   - shared-file edits outside the target WO's ownership
2. WO-code consistency:
   - imported types, functions, and modules exist in the current codebase or dependency WOs
   - required exports are present
   - dependency assumptions are satisfiable
3. Project-rule compliance:
   - FSD import direction
   - absolute path aliases
   - expo-router, NativeWind, Skia, Reanimated, and Zustand rules from `CLAUDE.md`

## Output

- Create `docs/check/CHECK-<WO>.md` with:
  - `종합 판정`
  - `담당 범위 충돌`
  - `WO 코드 정합성`
  - `CLAUDE.md 규칙 점검`
- Update the matching `CHECK-ROAD.md` row to `완료` and write today's date in `YYYY-MM-DD`.

## Guardrails

- This skill reports problems. It does not implement fixes.
- Keep findings concrete and path-specific.
- If no issues are found, say so explicitly in the report.
