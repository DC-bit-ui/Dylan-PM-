# Instructions for Kieren's Claude — writing insights to the shared bus

**Audience:** the Claude session Kieren runs analyses in (Claude Code, Cowork, or claude.ai web).
**Purpose:** when Kieren's analyses surface insights the rest of the team should benefit from, write them to the shared bus in a structured format so the dashboard + Claudia's tool + every other rep's Claude can read them.

**Cost model:** these writes are filesystem-only (no metered API calls). Kieren's Claude does its synthesis under his own subscription; the *output* lands in the bus via atomic file writes.

---

## 1. Where the bus lives

The bus is OneDrive-synced to Kieren's machine at:

```
<OneDrive root>\Claude Code Projects\shared-growth-memory\
```

Discover dynamically rather than hard-coding (works on any team member's machine):

```js
const path = require('path');
const os = require('os');
function busRoot() {
  if (process.env.BUS_PATH) return process.env.BUS_PATH;
  const od = process.env.OneDriveCommercial || process.env.OneDrive
          || path.join(os.homedir(), 'OneDrive - AgriProve');
  return path.join(od, 'Claude Code Projects', 'shared-growth-memory');
}
```

If `busRoot()` doesn't resolve to an existing folder, halt — don't auto-create. Tell Kieren.

---

## 2. The three things to write (in priority order)

When Kieren's analysis produces an output worth sharing, it lands in one of three places:

### 2a. Strategic findings → `patterns/<YYYY-MM-DD>-<slug>.md`

The primary surface for Kieren's work. Anything that's a durable observation about how the business actually works — a market shift, a project-coordination pattern that worked, a regulatory implication, a positioning insight — goes here.

**Filename:** `<date>-<kebab-case-title>.md`, e.g. `2026-05-18-multi-property-projects-need-relationship-mapping-upfront.md`

**Format (front-matter + body):**

```markdown
---
title: Multi-property projects need relationship mapping upfront
category: strategic_finding
confidence: moderate
written_at: 2026-05-18T09:00:00Z
sources:
  - kieren_analysis_session
evidence:
  - "Carr / Tanner schedule overlap caused field team thrash in Oct 2024"
  - "Same pattern visible in Yates discovery emails"
applicability:
  - multi-property landholder accounts
  - field-scheduling workstream
  - frontier property-creation flow
surfaced_in_systems:
  - kieren_claude
---

# Multi-property projects need relationship mapping upfront

## Observation
When a landholder has multiple titles or properties (Carr + Tanner, e.g.), our
current onboarding treats each as independent. In practice they're operationally
coupled — same field team, same logistics window, often same customer-side
decision-maker. Without explicit relationship mapping at intake we get late-stage
friction.

## Evidence
[≥2 concrete instances, dates, customers — sanitised per §3]

## Implication
[What changes — process, product, or sales-motion adjustment]

## Confidence
[Why moderate / low / high — what would tip it to the next level]
```

**Category values** (pick the best fit):
- `strategic_finding` — most of Kieren's work; durable insight about how the business works
- `tactical_play` — specific reusable move (rare from Kieren)
- `tactical_framing` — a way of describing something to a customer
- `hypothesis` — a thing worth testing but not yet evidenced

**Confidence values:**
- `low` — single observation, needs corroboration
- `moderate` — 2+ instances, but not yet cross-confirmed by another system or person
- `high` — multiple instances AND another system (dashboard, Claudia's tool, another rep) has independently surfaced the same thing

**Important:** start most things at `low` or `moderate`. The dashboard's pattern curator (runs weekly Friday 16:30 SAST) archives `confidence: low` patterns that haven't been cross-confirmed after 30 days — that's a feature, not a problem. A pattern that doesn't earn confirmation is noise; archive cleanly so the signal stays clean.

### 2b. System feedback → `POST /api/feedback` or `feedback/feedback-<id>.json`

When Kieren spots an error in what the system is showing or has a preference for how things should work, route it through feedback (not patterns). Two ways:

**Via the dashboard (easiest):** open `http://<dashboard-host>:3401/v2#health`, hit the floating "💬 Report" button bottom-right, fill in the form. One click.

**Via file (Claude Code direct write):** drop a JSON file in `feedback/`:

```json
{
  "id": "<auto: timestamp36-rand6>",
  "created_at": "<ISO timestamp>",
  "created_by": "kieren@agriprove.io",
  "type": "error | preference | comment | correction",
  "target_kind": "deal | contact | persona | pattern | suggestion | system",
  "target_id": "<HubSpot id or pattern slug or null>",
  "severity": "low | medium | high",
  "title": "≤200 chars",
  "body": "free text",
  "status": "open",
  "resolution": {"resolved_at": null, "resolved_by": null, "resolution_note": null, "action_taken": null},
  "tags": []
}
```

Filename: `feedback-<id>.json`. Use atomic write.

**Common Kieren-shaped feedback:**
- `type=preference, target_kind=system` — "I want pattern summaries to always include yearly trend, not just absolute counts"
- `type=correction, target_kind=deal, target_id=<id>` — "this deal's strategic context is wrong, here's what it actually is"
- `type=comment, target_kind=pattern` — "this pattern is real but the framing misses the regulatory angle"

The dashboard's coaching engines will eventually read open `type=error` feedback before generating new suggestions for the same target (suppression-then-annotate flow). Today: the feedback is at minimum visible at point-of-use (deal expand overlay) and in the HEALTH tab feedback widget.

### 2c. Customer-specific intelligence → `customer-positions/contact-<contact_id>.json`

If Kieren learns something material about a specific customer from his analysis (e.g., they mentioned an upcoming partner-board decision in a call, or a hostility about competitor X), surface it as a customer-position. Format per `schemas/customer-position.md`:

```json
{
  "contact_id": "<HubSpot contact id>",
  "positions": [
    {
      "as_of": "<ISO timestamp>",
      "verbatim_or_distilled": "≤300 chars, PII-generalised",
      "is_verbatim": false,
      "source": "kieren_strategic_review",
      "topic": "partner_alignment | competitor_mention | timing | strategic_priority | other",
      "sentiment": "positive | neutral_warm | neutral | neutral_cool | negative",
      "captured_by": "kieren_claude"
    }
  ],
  "last_updated": "<ISO timestamp>"
}
```

If the file already exists for that contact, MERGE — append to `positions[]` (keep last 5 + anything in last 14 days), update `last_updated`.

---

## 3. PII and confidentiality rules

Same as everywhere else in the bus. Strip → generalise:

| Strip | Replace with |
|---|---|
| Customer full names | First name + property/business surname when material; "the landholder" otherwise |
| Specific revenue / ACCU / hectare absolutes | Ratios, percentages, multipliers |
| Methodology IP code names | Category-level descriptors ("the 25-year baseline tooling") |
| Other reps' specific performance numbers | Role / category ("a senior account manager") unless explicitly attributed in a public artifact |
| Unannounced roadmap / strategy | Category-level only |
| Internal conflicts | Category-level learning, not named-and-shamed |

When unsure, over-strip and flag for Dylan rather than write. Patterns can be sharpened post-hoc; verbatim quotes can't easily un-leak.

**Exception for evidence in patterns:** verbatim CUSTOMER quotes are fine in `evidence:` lists (it's the entire point — to capture customer voice). Don't put rep-internal quotes verbatim there.

---

## 4. Atomic writes — non-negotiable

OneDrive sync exposes half-written files to other readers if you write directly. Always tmp + rename:

```js
const tmp = filePath + '.tmp';
fs.writeFileSync(tmp, content);
fs.renameSync(tmp, filePath);
```

JSON: `JSON.stringify(obj, null, 2)`. Markdown: LF line endings.

---

## 5. How the dashboard surfaces Kieren's output

| Where written | Where it shows up |
|---|---|
| `patterns/*.md` | HEALTH tab Patterns widget (count + by-confidence + recent list); BRAIN tab when relevant to an ASK question; eventually folded into rep-coaching suggestions |
| `feedback/feedback-*.json` | HEALTH tab Feedback widget; banner above timeline in deal/contact expand overlay if target_id matches |
| `customer-positions/contact-*.json` | Deal expand overlay's "What actually happened" column when the deal's contact has positions on file |
| `intelligence-bundles/*` (see §6) | HEALTH tab Intelligence-queue widget |

Cadence:
- Patterns are read by the dashboard on every page load (cheap filesystem scan).
- Feedback is checked when a target is rendered (instant).
- Customer-positions roll into next coaching refresh.
- Bus is OneDrive-synced — your write becomes visible to other team members within ~1 minute.

---

## 6. Offloading bigger analyses to subscription compute (optional)

If Kieren wants the system to *do* an analysis for him (e.g., "synthesise themes across the last 50 closed-lost deals"), there's a queue: `intelligence-bundles/`.

Write a bundle to `POST /api/intelligence/bundles` (or directly to the filesystem if the dashboard isn't reachable). Cowork's `apex-process-intelligence` scheduled task picks it up every 2h and runs the synthesis under Dylan's subscription, writing the result to `intelligence-results/<id>.json`.

This is the right pattern when:
- The analysis is computationally non-trivial
- It's repeatable (could run again next month against fresh data)
- Kieren doesn't need it instant

Skip the bundle queue for ad-hoc, one-shot exploratory work that Kieren does in his own Claude session — those just produce direct writes to `patterns/` per §2a.

Schema: `shared-growth-memory/schemas/intelligence-bundle.md`.

---

## 7. Suggested workflow when Kieren starts an analysis session

Open Claude Code (or claude.ai with this file pasted as context). Say something like:

> *"I'm about to analyse [X]. Read `shared-growth-memory/INSTRUCTIONS-FOR-KIEREN.md` (you're looking at it). When I share my analysis output, follow §2 to write the durable parts to the bus. Use atomic writes, PII-generalise per §3."*

Then run the analysis. Each finding worth keeping → patterns/, feedback/, or customer-positions/ as appropriate. Each one becomes available to the rest of the team's tools within ~1 minute via OneDrive sync.

---

## 8. What NOT to write

- Don't duplicate HubSpot data. The dashboard reads HubSpot live; we don't want a parallel snapshot here.
- Don't write Granola transcripts directly to the bus — Apex does that automatically (in `persona-supplements/<rep>/`, `contact-supplements/<contact-id>/`).
- Don't write Kieren's own private working notes / drafts. The bus is for outputs other team members should benefit from.
- Don't create new top-level folders. If a finding doesn't fit `patterns/` or `feedback/` or `customer-positions/`, raise it with Dylan first — the bus schema evolves through discussion, not silent expansion.

---

## 9. Reading order for orientation (first time only)

1. `README.md` — bus contract overview
2. `sales-motion-separation.md` — two-motion principle (Storm Boy vs Engaged Pipeline)
3. This file
4. `schemas/pattern.md` — pattern schema in detail (the primary thing Kieren writes)
5. `schemas/customer-position.md` — for §2c writes
6. `schemas/feedback.md` — for §2b writes
7. `team-brain/profiles/kieren.md` — Kieren's own auto-generated profile, useful for context-setting in conversations

---

**Contact:** Dylan (`dylan@agriprove.io`). Schemas evolve; pull this file fresh from the bus before any major analysis pass. Questions / disagreements with what's here → write them to `feedback/` so they don't get lost.
