# Schema — `feedback/`

User-raised feedback about the system: errors to fix, preferences to honour, comments to surface, corrections to apply. Both systems read this; coaching engines should check for relevant entries before generating new suggestions on a target.

## File location

```
feedback/feedback-<id>.json
```

`id` is a short slug — `<timestamp36>-<random6>` — generated at creation.

## Shape

```json
{
  "id": "mp9d12ab-x7q3rs",
  "created_at": "2026-05-17T08:30:00Z",
  "created_by": "dylan@agriprove.io",
  "type": "error | preference | comment | correction",
  "target_kind": "deal | contact | persona | pattern | suggestion | system",
  "target_id": "31711997037",
  "severity": "low | medium | high",
  "title": "≤120 chars summary of what's wrong / what the user wants",
  "body": "Free text up to ~2000 chars. The full explanation.",
  "system_context": {
    "source_view": "v2#work / v2#brain / etc.",
    "captured_at": "ISO when the user saw the system state being reported on",
    "snapshot": "Optional verbatim copy of what the system showed (probe text, diagnosis, etc.)"
  },
  "status": "open | in_progress | resolved | wontfix",
  "resolution": {
    "resolved_at": null,
    "resolved_by": null,
    "resolution_note": null,
    "action_taken": null
  },
  "tags": ["coaching", "data-quality", "ui"]
}
```

## How the system uses it

1. **Visible at point-of-use** — when a rep opens a deal/contact view, any open feedback tagged to that target shows inline. Don't make people read a separate feedback queue.
2. **Suppression** — coaching engines check open `type=error` feedback before generating suggestions. If a probe was flagged as wrong, the engine generates a different one or annotates the new suggestion with "previous error flagged — please verify".
3. **Preference accumulation** — `type=preference` entries influence future coaching prompts. A preference at `target_kind=system` affects everything; at `target_kind=persona` only that persona's outputs.
4. **Audit trail** — `resolution.action_taken` should describe what changed in the code/config to address the feedback. Coding agents can scan this to find unresolved bugs.

## Severity guidance

- `high` — system is producing wrong output that risks rep action (e.g. "this draft email is going to offend the customer"). Resolve same-day.
- `medium` — incorrect but not action-blocking (e.g. "wrong owner attributed to a pattern"). Resolve same-week.
- `low` — nice-to-have, cosmetic, or aspirational ("could you also surface X here?"). Backlog.

## Idempotency

`id` is unique per feedback. Updates merge field-by-field into the existing file.

## Atomic writes

Same as all other bus writes — `.tmp` then rename.

## Sensitivity

Feedback body can quote customer names verbatim when reporting accuracy issues (the WHOLE POINT is to flag accuracy). But anything that lands in `system_context.snapshot` must be PII-generalised — that's the part that gets surfaced in standup/retros.

## Conflicts

Last-write-wins via atomic rename. If two reps flag the same issue, write two separate entries — they may be reporting different angles of the same root cause. The curator can mark one as a duplicate of the other via `tags: ["duplicate-of-<id>"]` rather than deleting either.
