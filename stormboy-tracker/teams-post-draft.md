# Teams Post Draft — Stormboy Conversion Tracker

**Target channel:** Product > Stormboy
**Tag:** @Will @Cadel

---

**Stormboy Conversion Tracker — built, needs hosting**

@Will — you flagged this last week:

> "We start to get really granular on what those conversion rates are along each step of the funnel. Something like this will become kind of a live operational dashboard that will go live to Corporate Carbon so they can track progress and see how things are tracking, where the bottlenecks are, and how we can respond to them."

I've had a first pass at this — keen to get your input and see how we can make it better together.

It's a live dashboard pulling straight from HubSpot (no spreadsheets, no exports, no lag). Here's what it gives us:

- **Funnel visibility** — stage-by-stage conversion rates and drop-off analysis across the full pipeline. See where deals stall and how long each stage takes.
- **Stormboy recruitment pipeline** — contact-level tracking from Identified through to Sales Pipeline, with exit reasons and call outcome breakdowns.
- **Era comparison** — Legacy vs KCT vs Stormboy v1/v2 side by side. Quantifies whether our process changes are actually making us faster (and where they're not).
- **Active pipeline risk flags** — current deals with age, predicted close dates, and at-risk identification. The operational view for catching slipping deals early.
- **AI analysis on every tab** — Claude reads the live numbers and surfaces specific patterns and recommendations. Not canned text — real analysis of current data.

Where this sets us up to go further: the AI integration lets us do much deeper analysis on top of what we already have in Frontier and HubSpot — ask it why deals are stalling at a stage, what the common thread is across recent losses, or how Stormboy is shifting the conversion mix. Turns the data into actionable analysis without pulling reports manually.

Happy to jump on a call and run you through it — easier to show than describe.

@Cadel — it's a lightweight Node.js app (Express + Chart.js, Docker-ready). Needs a HubSpot Private App token (two read scopes) and somewhere to host it. What's our best option for internal hosting? The API layer is designed so our Claude Code agents can consume it too — one HubSpot integration, many consumers.
