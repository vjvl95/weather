---
name: monggeul-wo-start
description: Use when the user asks to start or implement a specific Work Order in the Monggeul weather project, such as "WO-008 시작", "8번 WO 구현", or "work on WO-005". This skill normalizes WO IDs, checks dependencies in docs/work-orders/ROADMAP.md, updates WO and roadmap statuses, implements only the assigned paths, records device-only checks, and archives the finished WO file.
---

# Monggeul WO Start

Use this skill only in repos that contain `docs/work-orders/` and `CLAUDE.md`.

## Resolve The Target WO

- Normalize the user's WO reference:
  - `8` or `008` -> `WO-008`
  - `WO-008` -> keep as is
- If the user did not specify a WO, ask for the WO number instead of guessing.

## Read Before Editing

Read these files first:

- `docs/work-orders/<WO>.md`
- `docs/work-orders/ROADMAP.md`
- `CLAUDE.md`
- `docs/work-orders/AI-EXECUTION-PROTOCOL.md` when ownership or validation rules are unclear

## Workflow

1. Verify every dependency WO is already complete in `ROADMAP.md`.
2. Confirm the target WO's owned paths and avoid edits outside that scope.
3. Before coding, change the WO status to `진행 중`.
4. Update the matching `ROADMAP.md` row to `진행 중` and keep the summary counts consistent.
5. Implement the WO while respecting FSD import direction, absolute imports, append-only shared exports, and the Reanimated/Skia/Zustand guardrails in `CLAUDE.md`.
6. Run the code-only validation that the WO requires. Do not mark device or runtime checks complete.
7. Update the WO status to `완료`, check only code-verification items, and append any pending device checks to `docs/device-test-checklist.md`.
8. Update the `ROADMAP.md` row to `완료`, write today's date in `YYYY-MM-DD`, and keep the summary counts consistent.
9. Move the completed WO file to `docs/work-orders/archive/`.

## Guardrails

- Do not modify files outside the WO's owned paths unless the WO explicitly owns a shared append-only file.
- Do not mark device checks complete unless the user actually ran them.
- If dependencies are incomplete or ownership conflicts exist, stop and report the blocker before coding.
- Never revert unrelated user changes.
