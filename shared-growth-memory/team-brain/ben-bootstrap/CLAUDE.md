# Ben's work-insights Claude session

**Hi Ben.** This folder is your portable bootstrap. When you open Claude Code with this folder as the working directory, Claude reads this file and knows:

1. **Where the bus is** — your OneDrive-synced copy of `Claude Code Projects/shared-growth-memory/`
2. **What you ask for** — follow-up targets, reengagement candidates, deep-reads on specific deals
3. **How to log corrections** — when Claude gets something wrong, it writes the correction to `feedback/` so the dashboard learns

## What Claude should do on session start

1. Resolve the bus path:

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

2. Read `<busRoot>/INSTRUCTIONS-FOR-BEN.md` — the operational instructions. Follow them verbatim.

3. Confirm freshness — read the last line of `<busRoot>/apex-runs.log`. If >36h stale, warn Ben before answering.

4. Wait for Ben's question. Don't volunteer cards uninvited.

## Standard openers Ben uses

- *"Who should I follow up with today?"*
- *"Show me reengagement candidates from the historical database."*
- *"Why is [name] still in my queue?"*
- *"What changed for [deal] this week?"*
- *"That suggestion is wrong because..."*

## Response shape Ben expects

Lead with the answer. Then evidence. Quotes from the customer where they land. Cite source (which file, which date). Be honest about gaps — if `customer-positions/` is sparse, say so. Don't fabricate a card if the queue doesn't contain it.

For each card:

```
[HOT · Strategy Call · 246d in stage · risk 100]
Brigalow and Mostowie — Rodger Jefferis

→ Next step: Call Rodger to re-confirm November deferral status.
  (He asked to revisit in November 208 days ago. Verify if that's still his intent
   before sending any collateral. A yes-call unlocks the PDF; silence after PDF
   wastes the asset.)

Why:
  1. Rodger explicitly deferred — not ghosted — 208 days ago.
  2. Unsolicited PDF resets the clock without permission.
  3. Re-permission check before any asset.

HubSpot: https://app.hubspot.com/contacts/24224559/record/0-3/141507724737
```

## What this folder is NOT

- Not a fork of the bus. Don't copy bus files into this folder — Claude reads them directly from the OneDrive sync path. This folder is just the bootstrap.
- Not a place for Ben's notes. Ben's working notes belong wherever Ben usually keeps them; the bus is for outputs the whole team benefits from.
- Not a write target. Claude writes back to the bus (via `<busRoot>/feedback/...`), never to this folder.

## When something looks broken

- Bus path won't resolve → OneDrive may not have synced yet. Open File Explorer, navigate to `OneDrive - AgriProve\Claude Code Projects\` — if the folder isn't there, ping Dylan and he'll re-share. If it's there but empty, give OneDrive 5 minutes to finish syncing.
- `queues/ben/work-cards.json` is empty or missing → Apex hasn't run yet (Mon-Fri 05:00 SAST) or the dashboard is down. Check `<busRoot>/apex-runs.log`.
- Claude says something Ben knows is wrong → tell Claude *"log a correction"* — it'll write to `<busRoot>/feedback/feedback-<id>.json` and the dashboard reads it within a minute.

See `INSTALL.md` for first-time setup.
