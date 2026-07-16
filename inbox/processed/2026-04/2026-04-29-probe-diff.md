# Preserved: Post-Bootstrap Probe (distinct from main's pre-bootstrap probe)

**Preserved by:** local Claude Code instance, 2026-04-29
**Source:** uncommitted `memory/learnings/2026-04/2026-04-29-cowork-bootstrap-probe.md` on branch `claude/setup-claude-system-9cDDB`
**Why preserved:** Materially different from main's version at `7486a72`. Same filename, same date, but captures a different event.

## Why this isn't just a diff

Main's `2026-04-29-cowork-bootstrap-probe.md` (committed at `7486a72`) is the **pre-clone** probe — Cowork looking at an un-cloned local folder, finding everything missing, CLI-annotated as a false-negative diagnostic.

The content below is the **post-clone** probe — Cowork running after the bootstrap completed, successfully loading `identity.md` and `company.md`, and cataloguing real gaps in the populated content (placeholder quarterly goals, revenue model, Verterra/ReadyGraze stubs, LawrieCo cross-link).

Both probes have independent diagnostic value. Main captures "the moment we discovered the un-cloned folder problem." This captures "the moment we validated the populated tree post-recovery and found the next layer of real gaps."

**Recommended next action:** if these gaps still hold post-checkout, promote this content to a fresh learning entry under a distinct filename (e.g. `2026-04-29-postbootstrap-probe-content-gaps.md`) or fold into `/learn` sessions that close the gaps directly. For now it lives here so the local working-tree edit can be discarded without losing the analysis.

---

## Original content (verbatim from local working tree)

# Cowork Bootstrap Probe — What Loaded and What's Missing

**Date:** 2026-04-29
**Type:** audit
**Source:** manual Cowork session — Dylan asked to read `identity.md` + `company.md` and report gaps

---

## What loaded successfully

### `memory/profile/identity.md` (last updated 2026-04-28)
- Basics, mandate, surface ownership (Frontier, Stormboy, HORIZON), touched-but-not-owned surfaces, constraints, and anti-patterns all populated.
- Standing meetings referenced but not enumerated with times/attendees — acceptable since Outlook calendar is the live source.

### `memory/business/company.md` (last updated 2026-04-28)
- Core product family (HORIZON, Frontier, Stormboy, Verterra, ReadyGraze, KCT) described at useful depth.
- Tech stack documented (TypeScript/GraphQL/PostGIS backend, Temporal workers, React/Chakra frontend, ArcGIS + HubSpot + GA Espace integrations).
- Org context table covers Product, Engineering, Growth, Field with leads named.

---

## Gaps identified

### `identity.md`
1. **Quarterly goals are placeholders** — all three items under "Goals (current quarter)" are `_(to confirm)_`. [high confidence this is a real gap] These should be populated once Dylan confirms Q2 2026 OKRs.
2. **No reporting line stated** — Kieren is referenced as "leadership stakeholder" in `company.md` but `identity.md` doesn't explicitly state who Dylan reports to.

### `company.md`
1. **Revenue model unconfirmed** — "How AgriProve makes money" is marked `_(To confirm with Dylan)_`. [high confidence gap]
2. **Verterra and ReadyGraze are stubs** — both say `_(needs detail)_`.
3. **Stage, headcount, public positioning, and 3+ year vision** are all explicitly flagged as open/unconfirmed.
4. **LawrieCo** is referenced in `identity.md` (surfaces touched but not owned) but not mentioned in `company.md` at all — minor cross-link gap.

### Cross-file
- Both files were last updated 2026-04-28 (Cowork handoff). No staleness concern yet, but the placeholder items above suggest the handoff captured structure without Dylan confirming several key facts.
- `strategy.md` is referenced in CLAUDE.md as sparse — the quarterly-goals gap in `identity.md` and the revenue-model gap in `company.md` likely cascade from that same sparseness.

---

## Recommendation
- **Next high-value capture:** Dylan confirming quarterly goals and revenue model would close the two most impactful gaps. A single `/learn` session targeting those would do it.
- **LawrieCo cross-link:** add a one-liner to `company.md` under "Core product family" or a new "Adjacent / partner" section.
