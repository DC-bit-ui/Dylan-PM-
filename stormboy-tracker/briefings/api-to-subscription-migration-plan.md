# Migration plan — Anthropic API → subscription compute

**Driver:** Cadel directive in standup 2026-05-18. Shared `ANTHROPIC_API_KEY` is hitting rate limits across products; spend is unpredictable; AgriProve is cash-flow constrained. Dashboard's analytic synthesis must move to flat-fee Claude subscriptions (Cowork-scheduled + Claude Code interactive).

**Substrate landed:** Phase 8 commit (intelligence bundles) — `coaching/engine/intelligence-bundles.js` + endpoints + UI + Apex commission `2026-05-18-apex-intelligence-bundles-commission.md`.

## Mental model

```
BEFORE                                AFTER
┌──────────────┐                      ┌──────────────┐
│  Dashboard   │ ── HTTPS ──┐         │  Dashboard   │ ── writes bundle ──┐
└──────────────┘            ↓         └──────────────┘                    ↓
                    api.anthropic.com                              <bus>/intelligence-bundles/
                            ↓                                             ↓
                   metered $$ / shared limits                  ┌─────────────────────┐
                                                               │ Cowork apex task    │ (every 2h, subscription)
                                                               │ OR Claude Code CLI  │ (ad-hoc, subscription)
                                                               └─────────────────────┘
                                                                          ↓
                                                               <bus>/intelligence-results/
                                                                          ↓
                                                                    Dashboard reads
```

## The 7 call sites to migrate

Each row below is a current dashboard flow that calls `api.anthropic.com`. Migration converts it to write a bundle instead; Cowork (every 2h) or Claude Code (interactive) processes it.

| # | Current call site | Purpose enum | Migration difficulty | Notes |
|---|---|---|---|---|
| 1 | `/api/ai/analyze` (v1 dashboard, `server.js`) | `ai-analyze` | **Easy** | Single-prompt one-shot. Replace fetch with bundle create + 202-Accepted response. v1 UI shows "Result will be ready within 2h" + a refresh button that polls `/api/intelligence/results/:id`. |
| 2 | `coaching/engine/persona-builder.js` Haiku synthesis call | `persona-refresh` | **Medium** | The corpus build (HubSpot reads) stays as-is. Only the final synthesis pass becomes a bundle. Cache the corpus on disk so it survives between the queue-write and the queue-read. |
| 3 | `coaching/engine/ask.js` (BRAIN tab) | `brain-ask` | **Hard (interactive)** | ASK is conversational. Bundle-based fits poorly. Better: move the BRAIN tab's ASK affordance to a "this question runs in your next Claude Code session" pattern — write the question into a bundle, surface it as a copy-to-clipboard, dashboard polls for the result. OR drop ASK from the dashboard and direct users to claude.ai web with the brain content pre-loaded. |
| 4 | `coaching/engine/customer-themes.js` clustering | `customer-themes-cluster` | **Easy** | Batch operation; already runs irregularly. Schedule it as a bundle once/week. |
| 5 | `coaching/engine/diagnose-from-timeline.js` | `deal-diagnosis` | **Medium** | One bundle per deal — fan out, max 10 per scheduled run. Use Cowork-scheduled (nightly) cadence. |
| 6 | `coaching/engine/win-patterns.js` | `win-pattern-extraction` | **Easy** | Weekly batch. Same shape as customer-themes. |
| 7 | ~~`coaching/engine/objection-cards.js`~~ | n/a | **Not needed** | **Re-audit 2026-05-18:** this module is a deterministic markdown parser. No Anthropic calls. Removed from migration scope. |
| 8 | `coaching/engine/live-pipeline.js` | `friction-analysis` · `twin-narration` · `coaching-message` | **Hard** | **Missed in initial audit.** 3 call sites: line 216 (Sonnet friction analysis, ~4K tokens), line 322 (Haiku twin narration per active deal), line 393 (Haiku coaching message per active deal). Called from scheduler.js + jobs.js. Highest output volume per run. Needs Session B.4 (~2-3h). |

## Suggested order (per session, parallel to other work)

**Session A — quick wins (1, 6, 4)**
1. `/api/ai/analyze` — most-visible if it breaks because the v1 dashboard is still in active use. ~1h.
2. `win-patterns` — already infrequent; conversion is mostly cosmetic. ~0.5h.
3. `customer-themes` — same shape. ~0.5h.

**Session B — synthesis (2, 5, 7)**
4. `persona-builder` — biggest leverage (current Haiku synthesis pass is the largest direct cost driver). ~2h. Test with one rep before applying to all five.
5. `diagnose-from-timeline` — high volume, fan-out pattern. ~1.5h.
6. `objection-cards` — small refactor. ~0.5h.

**Session C — interactive (3)**
7. `ask.js` — design call. Two options surfaced; pick one before building. ~3h.

## Per-migration recipe

For each call site:

1. **Move the prompt + system message into a bundle template** in `coaching/engine/<site>.js`. The function signature stays the same to callers, but the body changes from `callJson(...)` to `intelligenceBundles.create({...})`.

2. **Decide synchrony**:
   - If callers don't need an immediate response (most batch flows): return `{ status: 'queued', bundle_id }` and let them poll.
   - If callers need synchrony in dev (rare): keep an `ANTHROPIC_API_KEY` fallback path behind an env flag `USE_API_FALLBACK=1`. Default off; emergency-only.

3. **Update the consumer** (UI or downstream engine) to read from `/api/intelligence/results/:id` and tolerate "not yet processed" as a 404 with a friendly message.

4. **Add a "Run via Claude Code" button** where the original call had a user-facing trigger, using `v2Intelligence.runBundle({...})`. Gives Dylan an immediate-completion path when impatient.

5. **Verify** end-to-end: bundle written → Cowork processes (or paste-back works) → result file lands → dashboard reads.

## Don't touch

These are NOT Anthropic API calls; leave them alone:
- HubSpot `/crm/v3/...` — different vendor, different concern
- Microsoft 365 MCP — Cowork-side, not metered
- Atlassian / Granola / Notion MCPs — same

## Risk

The transition window has both code paths live (old API calls + new bundle flow). Cowork's bundle processor is the rate-limiter — if it falls behind, queue grows. The HEALTH tab's "Intelligence queue" widget surfaces this. If queue depth > 20 for more than 2 hours, increase Cowork's bundle-processing budget (default 10 per run) or add a second scheduled task at offset cadence.

## Reversibility

The old API call sites can be left intact as fallback while the new flow proves itself. Each migration is one edit per site, one commit per site. Backing out a single site is `git revert <commit>`. Nothing in the bundle infrastructure breaks if a site's migration is delayed.
