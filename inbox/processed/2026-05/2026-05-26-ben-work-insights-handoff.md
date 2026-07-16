---
date: 2026-05-26
source: claude_code_cli (stormboy-tracker session)
type: handoff
audience: cowork / apex / dylan-next-session
priority: medium
related:
  - granola_meeting_id: d5922502-765c-41b1-aa3e-e3b51e01ef1d  # Meeting with Ben — HORIZON snapshot + lead reengagement (2026-05-26)
  - existing_precedent: shared-growth-memory/INSTRUCTIONS-FOR-KIEREN.md
---

# Ben's plug-and-play Claude Code work-insights kit — shipped

## Why this happened in Claude Code, not Cowork

Dylan asked Cowork to author this. I was running in Claude Code CLI (stormboy-tracker v3 rewrite session) and can't launch the Cowork desktop app from CLI — but `C:\Dylan PM` is the shared memory layer Cowork reads from (per CLAUDE.md §15), so authoring here is functionally identical. Pointing this out so the routing model stays clean: the next Cowork session will see these files via OneDrive sync within ~1 minute of write.

## What Ben asked for (from Granola today)

Direct quote from the transcript: *"What I can do is I can create a prompt or some instructions that you can give to your Claude code to route it to where all that data is being saved. Because it's being saved in a SharePoint accessible area. And then you can prompt your Claude code."*

Ben's actual job-to-be-done:
1. "Who should I follow up with this week?" — answered from `queues/ben/work-cards.json` (dashboard pre-computes 28-card queue nightly at 05:00 SAST)
2. "Who's worth revisiting from the historical prospect database?" — the reengagement question, given the Stormboy pipeline is hitting a "cliff"
3. A feedback loop so corrections sharpen the system

## What I shipped

Three files in the shared bus + one in the bootstrap kit:

| File | Path | Role |
|---|---|---|
| `INSTRUCTIONS-FOR-BEN.md` | `shared-growth-memory/` | Operational instructions — mirrors `INSTRUCTIONS-FOR-KIEREN.md`. Tells Ben's Claude how to read the queue, how to surface reengagement candidates, how to log corrections |
| `CLAUDE.md` | `shared-growth-memory/team-brain/ben-bootstrap/` | Session primer — Claude reads this on start, resolves bus path, defers to INSTRUCTIONS-FOR-BEN |
| `INSTALL.md` | `shared-growth-memory/team-brain/ben-bootstrap/` | 3-step setup for Ben — verify OneDrive sync, copy bootstrap to local, open Claude Code |
| `README.md` | `shared-growth-memory/team-brain/ben-bootstrap/` | Why + how + cost (zero metered API) |

## Design decisions worth flagging

1. **Read-only by design.** Ben's Claude reads `queues/ben/work-cards.json`, `deal-signals/`, `customer-positions/`, `deal-supplements/`, `contact-supplements/`. Ben's Claude writes only to `feedback/` (corrections) and rarely `customer-positions/` or `patterns/`. The expensive coaching synthesis stays on Dylan's subscription via Apex; Ben's side is filesystem-only.

2. **Reengagement is a customer-positions sweep.** §2b of INSTRUCTIONS-FOR-BEN.md defines the heuristic: positions where `topic in [timing, partner_alignment, 25_year_commitment]` AND `sentiment in [neutral_warm, neutral, positive]` AND `as_of` 6-18 months ago AND no newer position. Cross-references deal-signals for `coaching_mode in [cooling, cold_loss_imminent]`. Falls back to deal-signals-only when customer-positions is sparse, with an honest warning.

3. **Apex freshness check enforced.** Ben's Claude reads `apex-runs.log` last line before answering. If >36h stale, it warns Ben rather than silently serving old data.

4. **No new top-level folders.** Bootstrap lives inside `team-brain/` per the existing schema-evolution-through-discussion rule.

## What this teases up for Apex

Two follow-up tasks for the next Apex / Cowork cycle:

1. **Daily reengagement digest** — instead of Ben's Claude walking customer-positions every session, Apex could pre-compute `queues/ben/reengagement-candidates.json` nightly using the same heuristic. Cheaper for Ben, faster session, same result.

2. **Surveillance of Ben's correction stream** — when Ben logs a `type=correction` feedback against a deal, the next coaching run should consume it (suppression-then-annotate flow). This was mentioned as eventual in `INSTRUCTIONS-FOR-KIEREN.md` §2b but is not yet implemented. Worth scheduling.

## Diagram

Generated via Figma MCP as a FigJam flowchart. Link in the next message Dylan sees from Figma — or in the session log. Title: *"Ben's work-insights flow — dashboard → bus → Claude Code"*.

## Routing

- Durable insight (the design pattern of "bus-as-handoff-substrate-for-team-Claudes") → not a pattern file yet. Worth promoting to `shared-growth-memory/patterns/2026-05-26-bus-as-team-claude-handoff.md` if the pattern recurs (e.g., when Will or another rep gets their own bootstrap).
- Routing to memory/: not needed. CLAUDE.md §15 already covers this seam.
- Routing to Notion: not needed. Notion is for tasks; this is a system artifact.

## Verification Dylan can run

```powershell
# Confirm the four files exist
ls "C:\Dylan PM\shared-growth-memory\INSTRUCTIONS-FOR-BEN.md"
ls "C:\Dylan PM\shared-growth-memory\team-brain\ben-bootstrap\"

# Dry-run what Ben's Claude would see on its first read
cat "C:\Dylan PM\shared-growth-memory\queues\ben\work-cards.json" | python -c "import sys,json; d=json.load(sys.stdin); print(f'cards={d[\"card_count\"]} generated_at={d[\"generated_at\"]}')"
```

— Claude Code (stormboy-tracker session)
