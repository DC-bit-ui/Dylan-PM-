# Ben's work-insights bootstrap

A 3-file kit that gives Ben a Claude Code session connected to the dashboard's
overnight work intelligence — without the dashboard needing to be open and
without a single metered API call.

## Why

Ben sells. He doesn't want to babysit a UI. He wants to ask in plain English:

- *"Who should I follow up with today?"*
- *"Who's worth revisiting from the old prospect database?"*
- *"Why is this deal still in my queue?"*

…and get the answer with the rationale behind it, in his own Claude Code session.

The dashboard already produces this intelligence overnight under Dylan's
subscription. The output lands in the shared SharePoint folder both machines
sync. This bootstrap is the thin layer that lets Ben's Claude Code reach into
that folder and answer his question.

## What's in this folder

```
ben-bootstrap/
├── CLAUDE.md     ← Claude reads this automatically on session start
├── INSTALL.md    ← One-time setup, ~3 minutes
└── README.md     ← This file
```

That's it. No code, no dependencies, no install scripts. Everything in here is
markdown that Claude reads as context.

## How it works (one paragraph)

The dashboard (`stormboy-tracker` on Dylan's laptop) runs a nightly coaching
pipeline. For every active deal owned by Ben, it generates a card: heat, next
step, three-step diagnosis, qualifier. It writes the full card list to
`shared-growth-memory/queues/ben/work-cards.json`. OneDrive syncs that file to
Ben's laptop within a minute. Ben opens Claude Code in this bootstrap folder.
Claude reads `CLAUDE.md`, resolves the OneDrive path to the bus, reads
`INSTRUCTIONS-FOR-BEN.md` (the operational instructions), and waits. Ben asks
*"who should I follow up?"* and Claude reads the queue file, sorts, and answers.

When Claude gets something wrong, Ben tells it. Claude writes the correction to
`shared-growth-memory/feedback/feedback-<id>.json`. The dashboard reads that
within a minute and applies it to the next overnight run.

## Setup

See `INSTALL.md`.

## Cost

Zero metered API spend. Ben's questions run on his own Claude subscription. The
expensive synthesis (nightly coaching) runs on Dylan's subscription via Cowork's
Apex automation.

## Owner

Dylan (`dylan@agriprove.io`). Schemas + folder conventions evolve — pull this
folder fresh from the bus periodically.
