# Learning — Jira hygiene feedback from Cadel; cleanup of 17 open tickets

**Date:** 2026-05-05
**Source:** Cadel 1:1 2026-05-04 (Granola `8caf6b5c-ce13-4a32-b2f0-e0fe15e9c052`) + Product standup 2026-05-04 (Granola `6d534b21-8f2e-4994-aea8-fca7ad97ad14`).
**Confidence:** [high] for the corrections; [moderate] for the cleanup outcome — only 1 of 17 was reconciled with verifiable post-creation completion signal; the rest left to Dylan's per-ticket review.

---

## What Cadel said

In the 1:1 (verbatim):

> "the task in jira that you're adding automatically. Great that they're there. Can you just please make sure that they're kept up to date? Because otherwise I just have to, like, keep filtering through, like, is this one relevant? Is this not."

And on debugging the automation:

> "you could create, like, a new project in jira and, like, use that to test... Then you could not wipe out breaking things."

Dylan's response:

> "Today will be a cleanup of get those things out of there. Especially because my daily system is not recognizing that, like, hey, I clearly actioned this. And it's done."

In the standup (verbatim):

> "I'm just trying to get through all of the updates... and just clearing out all of those tickets that you tagged me in today. So just confirming what's done, which most of them are done."

## What changed

**Decision recorded:** `memory/decisions/2026-05-05-notion-default-jira-criteria.md` — Notion is default; Jira ticket only when (a) cross-functional handoff, (b) under an active epic, (c) team-visible delivery.

## Cleanup actions executed (2026-05-05)

| Ticket | Action | Result |
|---|---|---|
| AP-2184 — Growth capacity review | Migrated to Notion + transitioned to Done | ✅ Notion `3578c08eb28f8165b7ccda7b8ed3a4b9` |
| AP-2247 — Snapshot automation schedule design review | Migrated to Notion + transitioned to Done | ✅ Notion `3578c08eb28f81789167dbcfb8111f26` |
| AP-2249 — Monthly AI presentation prep | Migrated to Notion; transition failed (ticket inaccessible — likely deleted server-side) | ⚠️ Notion `3578c08eb28f81e6bb39c2aead30a2b6` exists; Jira side unactionable |
| AP-2226 — HORIZON high-res for Justin Costello | Commented + transitioned to Done | ✅ Verified done — email sent 2026-04-29, Teams confirmation in Product > Tech |
| AP-2183, AP-2215, AP-2223 | Cross-linked to AP-2229 (HubSpot mandatory fields consolidation ticket) | ✅ Comment-only per Dylan's call |
| AP-2229 | Cross-link comment added (notes the three folded-in tickets) | ✅ |
| AP-2217, AP-2218, AP-2220, AP-2221 (Will's automation discovery cluster) | Left open — pending Dylan review | ⏳ Reconciliation could not verify completion |
| AP-2224 — EIH automation scoping | Left open — pending Dylan review | ⏳ |
| AP-2225 — Dev re-run script | Left open (assigned to dev, not Dylan) | ⏳ |
| AP-2248 — Soils MVP feedback to Steve | Left open — pending Dylan review | ⏳ |
| AP-2255, AP-2260 — Frontier property work | Left open — recent, likely in progress | ⏳ |

## What I learned (durable rules)

1. **"Most are done" without signal is unreliable.** Dylan said in the standup that "most" of the tagged tickets were done. The reconciliation pass against Granola/Teams/Confluence/Outlook only verified one (AP-2226). Either the completion signals aren't where I'm looking, or "most are done" was loose. Apex EOD Reconciliation should treat self-reported "done" claims as candidates, not confirmations — still require the post-creation signal.

2. **Test environments matter for automation work.** Iterating Jira-creation logic against the production AP project is fragile. Cadel explicitly suggested a sandbox Jira project. Filed as a follow-up.

3. **The "hygiene failure" vs "shape failure" distinction matters.** Cadel's complaint conflated two issues. The fix isn't only a tighter creation criterion — it's also stronger transition discipline at completion. Both went into the decision.

4. **Auto-created Jira tickets need a Linked-Notion-task back-pointer by default.** Right now, when Apex elevates a task to Jira, there's no automatic round-trip — the Notion task is the source of intent, but Jira becomes orphaned in Cadel's view. Future Apex change: every Jira ticket Apex creates gets the originating Notion task URL in description; every Notion task that gets elevated gets the Jira link in `Linked Jira`.

## Follow-ups

- [ ] Tier 2 PR — update `memory/profile/working-style.md` with the three-criterion rule (queued; awaiting clean working tree)
- [ ] Tier 2 PR — update `memory/integrations/cowork.md` Apex Morning Briefing prompt to enforce the Notion-default switch
- [ ] Sandbox Jira project for automation testing (filed for next planning conversation)
- [ ] 30-day review (2026-06-04): aged-open count for Dylan-reported tickets; Cadel surface check
- [ ] Per-ticket sweep of the 9 remaining left-open tickets (Dylan; not Apex) — most should be transitionable
