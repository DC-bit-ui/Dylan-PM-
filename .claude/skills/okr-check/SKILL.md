---
name: okr-check
description: Check a piece of work, an initiative, or this week's plan against current OKRs. Surfaces alignment gaps and "work that doesn't ladder". Use before kicking off new work, in weekly planning, and quarterly reviews.
---

# OKR Check Skill

## Workflow

1. **Read** `memory/business/strategy.md` for current OKRs (objective + key results). **If OKRs are not yet captured** (the file contains a "_pending_" status), do not invent them. Output:
   > "OKRs are pending for this quarter (per `memory/business/strategy.md`). Alignment lens unavailable. Strategic priorities listed in `strategy.md` are the working proxy — I'll check against those instead. Once Dylan populates Q OKRs, this skill returns to full strength."
   Then run the check against the strategic-priorities list as a best-effort substitute.
2. **Take the input** — the proposed work, initiative, or week plan.
3. **Map each item to a KR.** If it doesn't map cleanly, flag it as `[ORPHAN]`.
4. **Produce:**

```
## OKR check — <subject> — <YYYY-MM-DD>

### Mapped
- <work item> → <KR> — strength: <strong/weak>, expected contribution: <…>

### Orphans (do not ladder to a KR)
- <work item> — possible reasons it's still worth doing: <maintenance, debt, foundational>

### KRs with no work pointed at them
- <KR> — risk: <…>

### Recommendation
<keep / cut / re-scope items>
```

5. **Save** to `memory/deliverables/okr-checks/YYYY-MM-DD-<slug>.md` if the check is non-trivial.

## Heuristic

If >30% of the week is orphaned, the plan needs a re-think, not a rationalisation.
