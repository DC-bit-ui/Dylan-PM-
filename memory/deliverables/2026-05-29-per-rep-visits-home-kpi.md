---
date: 2026-05-29
status: spec — ready to build
type: feature-brief
owner: Dylan
target_surface: stormboy-tracker · v3 frontend · /v3 (Home)
relates_to: 2026-05-26-stormboy-tracker-frontend-rewrite.md
---

# Per-rep "Visits this week" breakdown on Home

## TL;DR

Add a **"Visits this week · by rep"** breakdown to the v3 Home page so the team can see *who is driving the booked-visit number* at a glance, without bouncing to Work, Stats, or HubSpot. Backed by the existing `/api/work/header-stats` endpoint extended with a `by_rep[]` field — no new fetch on Home, no new schedule. ~3 hours end-to-end.

---

## Why

The Home "Visits this week" KPI card today shows a single aggregate: `X booked · Y completed · lifetime Z`. That answers *"are we hitting it?"* but not *"who is hitting it?"* — and the team can't see at the daily-glance level whether one rep is carrying the week or it's a balanced effort. Today they have to:

- open HubSpot, filter deals by rep, count booked stage transitions, OR
- bounce to v3 Work → Hobbs diary → manually count.

That's ~3 minutes of friction per check. Per-rep visibility on Home turns the question into a 1-second scan.

**Bonus signal this unlocks:** a rep showing zero booked visits two weeks running is a quiet flag the daily glance currently can't surface — useful for a coaching nudge before the gap shows up in Stats efficacy four weeks later.

## What — the feature

A compact "By rep" block beneath the KPI row on `/v3`, showing each active sales rep's booked + completed count for **the current ISO week (Mon → Sun)** in AEST. Rendered as a small horizontal stack of rep tiles or a compact list — see UI section.

### Constraints

- Must fit inside Home's tight first-screen layout (KPI row + Outlook strip + calendar/calls row must all stay above the fold on a 1440×900 monitor).
- Must reuse `useHeaderStats` — no new HTTP request on Home (already 9 hooks).
- Must respect the daily-glance ethos: scannable in 1 second; deeper detail lives on Work / Stats.
- Must degrade gracefully if `by_rep` is missing from the response (back-compat with old API shape).

---

## Data layer

### Backend (single endpoint touched)

Extend the existing `/api/work/header-stats` response (source: `coaching/engine/work-header-stats.js`) with a new top-level field:

```jsonc
{
  // ...existing fields unchanged: target_set_date, project_ha_*, farm_visits, stormboy_wins, etc.
  "farm_visits_by_rep": {
    "week_start": "2026-05-25",       // ISO Monday of the current week, AEST
    "week_end":   "2026-05-31",
    "reps": [
      {
        "owner_id":          "76812243",
        "name":              "Hobbs",
        "booked_this_week":  4,
        "completed_this_week": 2,
        "is_sales_rep":      true
      },
      // ...
    ]
  }
}
```

**Source of names:** reuse the HubSpot-owner → display-name resolution the call-analytics engine already does (`coaching/engine/call-analytics.js` produces `by_rep[].name`). Factor that resolution into a shared helper if it isn't already — `coaching/engine/hubspot-owners.js` is a sensible home.

**Source of booked/completed counts:** the same HubSpot meeting-engagement query that already feeds `farm_visits.booked_this_week` — group by owner_id instead of summing.

**Filter rule:** include only reps where `booked_this_week > 0 OR completed_this_week > 0` for the current week (we don't want a leaderboard of zeros). `is_sales_rep` available for client-side filtering if needed.

**Sort rule:** server returns by `booked_this_week` descending, tiebreak by `completed_this_week` descending.

**Cache:** same TTL as the rest of `header-stats` (currently in-memory short-lived; no change needed).

### Frontend

- **No new client / hook** — extend `frontend/src/types/headerStats.ts` to include the new shape:

  ```ts
  export interface RepVisitsThisWeek {
    owner_id: string;
    name: string;
    booked_this_week: number;
    completed_this_week: number;
    is_sales_rep: boolean;
  }
  export interface FarmVisitsByRep {
    week_start: string;
    week_end: string;
    reps: RepVisitsThisWeek[];
  }
  export interface HeaderStats {
    // ...existing...
    farm_visits_by_rep?: FarmVisitsByRep;  // optional for back-compat
  }
  ```

- `useHeaderStats` already exposes the new field via `data.farm_visits_by_rep`. **No change to the hook.**

---

## UI

### Placement

Insert a new block **between the existing KPI row and the Outlook strip** on `/v3/`. Reasoning:

1. KPI row answers *what's the number?* — keep clean.
2. By-rep block answers *who's driving it?* — fits as a one-line expansion right beneath.
3. Outlook strip stays as the bridge to the calendar/call-volume row.

Doing it as a slim full-width strip keeps it dense and avoids stealing column space from Hobbs / Call Volume.

### Component

New: `frontend/src/components/home/VisitsByRepStrip.tsx`

### Visual spec (single horizontal strip)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ VISITS BOOKED THIS WEEK · BY REP                            w/c 25 May        │
│                                                                              │
│  Hobbs   [████████] 4 booked · 2 completed                                   │
│  Ben     [████____] 2 booked · 0 completed                                   │
│  Will    [██______] 1 booked · 1 completed                                   │
│  Claudia [________] —                                                        │
└──────────────────────────────────────────────────────────────────────────────┘
```

- **Layout:** A single full-width `Box` (matches Outlook strip pattern) with a vertical stack of `RepRow`s.
- **Each row:** rep first-name (12ch, fixed-width text aligned left) → mini bar normalized to the top rep's count → `N booked · M completed` text.
- **Bar:** Chakra `Box` 100% width of available space, `bg=brand.500` fill width = `(booked / maxBooked) × 100%`, min 4% so 1-booked is still visible.
- **Order:** server-side, booked desc; completed desc on tiebreak.
- **Cap:** show up to 6 reps. If more, show top 5 + "+ N more (see Work)" link to `/v3/work`.
- **Zero-row:** if all sales reps have zero, show "No visits booked this week yet — first one this week scores the row." (subtle italic helper text, not a card.)
- **Loading:** Chakra `Skeleton h="80px" rounded="md"` while `header.loading && !header.data`.
- **Error:** silent fail — the KPI card above carries the headline number; the strip just hides. (`farm_visits_by_rep` optional in the type.)

### Colors / tokens

- Card chrome: same `cardBg` / `cardBorder` / `subColor` / `bodyColor` `useColorModeValue` values used by the existing Outlook strip — copy the surrounding style for consistency.
- Bar fill: `brand.500` (matches the call-volume bars on Home).
- Text:
  - section header: `2xs` uppercase letter-spaced (matches sibling section headers).
  - rep name: `sm` `fontWeight={700}`.
  - "X booked · Y completed": `xs` `color=subColor`.
- "+ N more" link: `RouterLink to="/v3/work"`, brand-coloured.

---

## Edge cases

| Case | Behaviour |
|---|---|
| Old backend (no `farm_visits_by_rep` field) | Strip hides silently — KPI card still works. |
| Empty `reps` array | Show "No visits booked this week yet…" helper line. Don't render the strip chrome heading-only. |
| Owner_id with no resolvable name | Fallback to "Unknown owner (76812243)" — log on the backend so we know to add them to the resolver. |
| Non-sales-rep books a visit (ops user, partner channel) | Server still returns the row but with `is_sales_rep: false`; client filters them out by default for the Home strip. (They show up on Work.) |
| Week boundary in flight (Sunday → Monday) | Server uses **server-local AEST**; the team is AEST so this matches the team's mental week. Document explicitly so we don't get a 9 hr drift at handover to a SAST viewer. |
| Booked-then-cancelled within the week | Subtract on cancel — already true of `farm_visits.booked_this_week` (uses current state); apply same rule per-rep. |
| Visit booked last week, completed this week | Counts as `completed_this_week`, NOT `booked_this_week`. Documented at the engine level. |

---

## Out of scope (intentionally)

- **Targets per rep** — no per-rep target tracking on Home (cap on scope; targets are a different conversation).
- **Click-through to per-rep detail** — not on Home; the team can use the existing Work filters.
- **Historical comparison** — no W-on-W delta on the Home strip. If wanted, surface on Stats.
- **Granular outcome breakdown** — no "of which N converted to Sales Pipeline". Belongs in Stats.

---

## Success criteria

1. Anyone glancing at `/v3/` in under 3 seconds can name the top-booking rep this week.
2. The strip stays above-the-fold on a 1440×900 monitor alongside the existing KPI row + Outlook strip + first row of the calendar/call-volume grid.
3. No new fetch on Home page load (extending `header-stats`, not adding an endpoint).
4. Back-compat: if the backend hasn't been deployed yet, Home still renders normally.
5. The biggest stuck-state on the bus (a rep with 0 booked) is visible without leaving Home.

---

## Build plan (3 hours)

| # | Step | File(s) | Effort |
|---|------|---------|--------|
| 1 | Extend `work-header-stats.js` engine: group HubSpot meetings by owner_id for current ISO week, resolve names via shared owner resolver, return `farm_visits_by_rep`. | `stormboy-tracker/coaching/engine/work-header-stats.js`, optionally new `coaching/engine/hubspot-owners.js` if not factored | 60 min |
| 2 | Update TypeScript type to include optional `farm_visits_by_rep` per spec. | `frontend/src/types/headerStats.ts` | 5 min |
| 3 | Build `VisitsByRepStrip.tsx` component per UI spec. | `frontend/src/components/home/VisitsByRepStrip.tsx` (new) | 45 min |
| 4 | Wire into `HomePage.tsx`: import + render between KPI row and Outlook strip. Pass `header.data?.farm_visits_by_rep`. | `frontend/src/pages/HomePage.tsx` | 10 min |
| 5 | Verify: typecheck + build + boot + curl `/api/work/header-stats` to confirm new field shape; navigate to `/v3/` and visually verify the strip. | — | 20 min |
| 6 | Commit: one commit, scoped frontend + backend; message lays out the engine change + the UI block. | git | 10 min |
| 7 | Manual UX check: with real data, does the bar normalisation read right? Should we cap at top 5 vs top 6? Bar minimum width? | live | 20 min |

**Total:** ~3 hours including verification.

---

## Risks & gotchas

- **HubSpot meeting-engagement query already runs once for the existing aggregate** — make sure step 1 doesn't add a second HubSpot call; it should be one pass over the same dataset with both a group-by and a sum.
- **Owner-name resolution is the only place this could fail silently** — if the resolver returns the owner_id verbatim for missing names, log it so we can patch the roster. Don't hide unknown reps from the strip; visibility is half the point.
- **AEST week boundary** — if the server runs SAST (it does — 5am SAST scheduler in `.env`), confirm whether to compute "this week" in AEST or SAST. **Pre-decision: use AEST** — the team works in AEST, the visits happen in AEST, the strip should match the team's mental week. Document at the engine level so a future maintainer doesn't reset it to server-local.

---

## Open questions

1. **Should the strip include partner / non-sales reps?** Recommend hiding from Home, surfacing only on Work. Easy to flip via a `?include_all=1` query param if it ever matters.
2. **Should "completed" use HubSpot meeting outcome = "completed", or also accept transcript-confirmed visits (the `confirmed_via_transcript` totals on hobbs-calendar)?** Recommend HubSpot-completed only for v1 — the transcript-confirmed pipeline is still maturing and conflating sources here makes the count harder to reconcile. Same rule as the existing aggregate.
3. **Should I add a "rep portrait" / avatar?** Not for v1 — keeps the strip dense. Easy to layer in later if you want it more personal.

---

## Defaults (no decisions needed unless flagged)

- **Cap:** top 6 reps, "+ N more" link if overflow.
- **Hide zero-booked sales reps** from the strip on Home.
- **Sort:** booked desc, completed desc tiebreak.
- **Component file:** `frontend/src/components/home/VisitsByRepStrip.tsx`.
- **Placement:** between KPI row and Outlook strip.
- **Names:** first name only for compactness (Hobbs, Ben, Will, Claudia) — if collisions ever happen we add last-initial.
