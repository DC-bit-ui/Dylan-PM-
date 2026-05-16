# Team Brain — shared captured intelligence

**Established:** 2026-05-13
**Authoritative source:** `stormboy-tracker/coaching/` (Dylan's machine) — these files are mirrored here so Claudia's Storm Boy Claude Tool and any other team Claude Code instance can read the same source material.

## What's here

```
team-brain/
├── profiles/
│   ├── hobbs.md         — digital replica: signature moves, language bank, plays, objection responses
│   ├── ben.md           — performance profile: call patterns, Hills mechanism, calling discipline
│   ├── claudia.md       — operating model: tool philosophy, workspace architecture, /improve cycle
│   └── will.md          — command profile: ownership, decision frames, default policies
└── distillates/
    ├── hobbs-farm-visits.json   — 6 farm visits, topic distillates per visit (customer_position, hobbs_response, outcome)
    └── hobbs-calls.json         — 6 Aircall transcripts distilled (cold opens, framings, outcomes)
```

## Who maintains these

The Stormboy Conversion Tracker dashboard (Dylan's repo) is the authoritative writer. When Dylan adds new visit transcripts, edits a profile, or runs new distillation, those changes are mirrored here on the next sync. Treat the bus copy as **read-only from Claudia's-tool perspective**.

## How to use these from Claudia's tool

### Option 1 — Local ASK skill (recommended)

Add a `/ask-team` skill to the tool. It loads the files above, builds the same prompt structure as `stormboy-tracker/coaching/engine/ask.js`, and calls Anthropic directly. Reps query the brain inside their existing workflow tool — no context switch, no HTTP dependency.

A reference implementation lives in this folder at `ask-team-skill-template.md`. Drop the contents into `cross-project-shared/skills/ask-team/SKILL.md` in your tool and adjust paths.

### Option 2 — HTTP via the dashboard

If a rep is at a machine running the dashboard (`http://localhost:3401`), the tool can POST to `/api/ask` with `{question, history}`. Same result, but requires the dashboard to be running. Use this only when the local-skill path isn't available.

## Refresh cadence

Currently manual — when Dylan updates the brain, he re-syncs. Future: a Friday end-of-week job that auto-mirrors changes (plus any new distillates from Hobbs's continued visits).

## What goes back the other way

When Claudia's tool generates artifacts that should feed the brain (call outcome distillates, Storm Boy patterns, learnings), they get written to `shared-growth-memory/patterns/` or `shared-growth-memory/probe-outcomes/` per the schemas. The brain itself stays Dashboard-authored; the bus's other folders are the bidirectional channel.

## Contract notes

- Filenames and shapes here are stable. If the dashboard changes them, this README updates and a heads-up gets posted to the Stormboy Deals Teams channel.
- File sizes are small (profiles ~10-25KB, distillates ~16-31KB). Whole-file loading is fine.
- All files use UTF-8 with LF line endings.
