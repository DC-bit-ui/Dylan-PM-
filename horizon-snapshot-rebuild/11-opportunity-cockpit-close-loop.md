# Opportunity cockpit — closing the acquisition-to-project loop

**Date:** 8 July 2026 · Builds on the engagement-queue idea in `10-ux-review-v2-prototype.md`.
**Reframe:** the tool stops being a document generator and becomes the home of the **opportunity** from creation to conversion — the missing middle between Frontier (acquire) and project establishment (deliver). Motto still holds: simply, elegantly, pleasant UX.

---

## 1. The loop, and clear boundaries

Three tools, one object (the opportunity) travelling through them with its context intact:

- **Frontier — acquire.** Search, scrape, qualify the lead. Hands over a property + model run.
- **HORIZON Snapshot — create + nurture the opportunity (this tool).** Turns the run into the value artifact, sends it, watches engagement, prompts the follow-up, qualifies, and converts.
- **Project establishment — deliver.** KCT, registration, ops. Receives a committed opportunity.

**The boundary that keeps it simple (and prevents bloat): this tool is not a CRM.** HubSpot/Frontier stay the systems of record for contacts and pipeline. This tool owns three things nothing else does: the **artifact**, its **engagement telemetry**, and the **prompt to act** on that telemetry. When in doubt, if a feature duplicates HubSpot, it does not belong here.

## 2. The lifecycle the tool owns

`Create → Send → Warm → Follow up → Convert` — surfaced as gentle queue segments, not a heavy pipeline:

| Stage | What it means | Primary action on the card |
|---|---|---|
| Create | Snapshot generated from pipeline/upload | Review |
| Send | Delivered to the landholder | Send |
| Warm | Engagement detected on the sent snapshot | Follow up |
| Follow up | In conversation (replied / call booked) | Log / advance |
| Convert | Committed | Convert to project |

One surface (the existing queue) does triage *and* follow-up — the segments just shift. No second CRM screen.

## 3. Engagement enrichment (simple, elegant)

The unique fuel is the **tokenised web snapshot's telemetry**. Kept light:

1. **Engagement pulse on the card.** A small line: opened / pages viewed / revisits / time on the economics page. One glance tells you warmth. (Only on Sent cards; Ready cards stay clean.)
2. **Warmth re-sort.** Sent snapshots re-order by engagement recency and intensity, so the warmest float to the top. This is the "conversion cockpit" — the queue tells you who to call.
3. **Contextual next action.** "Boonderoo opened the economics page twice yesterday → call now." The signal becomes a prompt, not just data.
4. **One-tap, context-aware follow-up.** Draft a follow-up that references what they actually viewed, send via HubSpot. Closes the loop back to comms without leaving the tool.
5. **Convert handoff.** A single "Convert to project / start KCT" action that passes the opportunity forward to establishment with its context (property, run, snapshot, engagement history) intact — nothing re-keyed.
6. **Visible seams.** A quiet "from Frontier ↗" (acquisition context) and, once converted, "to project ↗" (establishment) on the card, so the opportunity's whole journey is one click in either direction.

## 4. Keeping it simple and pleasant

- **One surface, shifting segments** — never a separate CRM/pipeline view.
- **One primary action per card, changing by stage** (Review → Send → Follow up → Convert). The user is never asked "what now?".
- **Engagement is a quiet pulse, not a dashboard.** Detail on demand; the card stays scannable.
- **Signals become single prompts**, not analytics the user has to interpret.
- **Progressive disclosure** — a rep sees warmth and a next action; the PM sees aggregate conversion; marketing never sees any of it.
- **The artifact stays the hero.** Everything else supports getting the right snapshot in front of the right prospect and knowing when they are ready.

## 5. Why this is the right long-term bet

It turns a cost centre (making documents) into a revenue instrument (converting opportunities), and it makes the three tools one continuous path instead of three disconnected steps. The data it generates (which snapshots, which pages, which framings convert) feeds back into better templates and better targeting over time — the system gets smarter with use. And it does all of this by *adding signals and prompts to the surface that already exists*, not by bolting on a second app — which is how it stays simple.

## 6. Out of scope (guardrails against bloat)

- Full CRM / contact management (HubSpot).
- Lead sourcing / scraping (Frontier).
- Project delivery workflow (establishment / ops).
- Anything that asks the user to interpret analytics rather than act on a prompt.
