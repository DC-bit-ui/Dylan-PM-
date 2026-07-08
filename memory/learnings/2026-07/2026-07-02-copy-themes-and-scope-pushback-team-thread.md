# Farm Map tool: copy themes + scope pushback from the Epics team thread

**Date:** 2026-07-02
**Type:** team feedback -> copy decisions + open scope calls — Farm Map Drawing Tool (AP-2514)
**Source:** Teams > Product > Epics, thread "Farm Boundary Tool - Non-Contiguous Boundaries" (Hobbs, Ben, Steve Le Moenic, Dylan), 2026-07-02, pasted by Dylan (channel posts not readable via connector here). Feeds Round 9/10 in `../../Farm Map Drawing Tool/design/claude-design-prompt.md`.

## Copy decisions (settled) [high]
- **"Corner", not "point"/"vertex".** Hobbs explicit ("I like 'corner' better than 'point'"); Ben independently asked for "corners of your property". Use "corner" in the draw instruction on every version.
- **Guiding theme: "a 10-year-old should be able to use it."** Dylan confirmed in-thread ("That is our guiding theme"). Copy mandate: plainest language, one instruction per screen, one obvious next action, no jargon (no polygon / vertex / parcel / lot-plan / cadastre / AOI farmer-facing).
- **"Lock my property" / "Lock area N" wording is liked** (Hobbs) IF a lock control is shown. Copy is cheap to swap; the team's line is "it is the functionality that we want to get right."

Captured as Round 10 (copy pass) in the design prompt.

## Open calls flagged to Dylan (functionality, not copy) [moderate]
1. ~~**Lock step: keep or kill.**~~ **RESOLVED 2026-07-02 (Dylan): keep the lock.** Dylan chose **"Direction A - Farm Boundary Tool (Desktop Map Only, Lock & Continue)"** as the preferred non-contiguous flow, i.e. the lock-and-continue interaction over the non-lock version. Post-submission growth loops (Round 11) now build onto Direction A. See [[2026-07-02-post-submit-growth-loops-another-property-refer-friend]].
2. **Cadastral / land-titles layer (Round 8) is contested.** A team voice agrees the titles layer "adds noise", said it "mimics the OG EOI app which didn't cut through", and prefers a **phased approach based on market reaction**. This pushes back on the Round 8 direction (bring the parcel overlay inbound). Decision pending: park Round 8 as a later phase?
3. **Block overlapping polygons?** Suggestion raised in-thread. Contradicts the earlier decision ([[2026-06-17-ben-feedback-outbound-confirm-and-non-contiguous]]: "touching/overlapping areas: keep as drawn, let parcel detection resolve"). Decision pending.

## Actioned
- Round 10 copy-pass prompt added to `design/claude-design-prompt.md` (corner wording, 10-year-old plainness, lock-my-property label, no jargon).
- Open calls 1-3 surfaced to Dylan; not baked into designs or tickets pending his decision.
