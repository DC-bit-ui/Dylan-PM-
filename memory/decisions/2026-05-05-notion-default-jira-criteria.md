# Decision — Notion is the default; Jira tickets only when criteria met

**Date:** 2026-05-05
**Owner:** Dylan
**Status:** accepted
**Context:** Cadel 1:1 (2026-05-04) + Product standup (2026-05-04). See `memory/deliverables/meetings/` and Granola IDs `8caf6b5c-ce13-4a32-b2f0-e0fe15e9c052` (Cadel checkin) and `6d534b21-8f2e-4994-aea8-fca7ad97ad14` (Standup 04/05/26).

---

## The decision

Going forward, Apex (and any other automation creating Dylan-owned work) **defaults to Notion** for task capture. A task is only pushed into Jira when **all three** of the following are true:

1. **Cross-functional handoff.** The work requires another person (engineering, design, ops) to action a step. Pure self-driven work stays in Notion.
2. **Lives under an active epic, or warrants creating one.** A ticket without a parent epic is a smell — usually means it should be in Notion or absorbed into an existing initiative.
3. **Visible to the team's delivery view.** The work is something Cadel/Kieren/Will/Steve would expect to see in Jira's "what is product shipping?" view, not in Dylan's personal stack.

If even one of those three is false, the default is Notion.

## Rationale

Cadel (1:1, 2026-05-04, verbatim):
> "the task in jira that you're adding automatically. Great that they're there. Can you just please make sure that they're kept up to date? Because otherwise I just have to, like, keep filtering through, like, is this one relevant? Is this not."

The signal isn't "stop creating Jira tickets" — Cadel said "great that they're there." The signal is **two failure modes**:

- **Hygiene failure:** Jira tickets that are done in real life but not transitioned. Most of the cleanup pile (verified: AP-2226 — HORIZON output for Justin Costello, delivered 2026-04-29, not transitioned until 2026-05-05) fits this.
- **Shape failure:** Jira tickets created for personal-shaped work (AP-2184 Growth capacity review, AP-2247 schedule design review, AP-2249 monthly AI presentation prep). These shouldn't have been Jira tickets to begin with — they're Notion-shaped.

Both compound the same problem for Cadel: noise in his "what does product owe me / what is product working on?" view.

## Consequences

- Apex Morning Briefing's task-creation logic gets a Notion-default switch. Jira creation becomes a deliberate elevation, not the default route.
- Apex EOD Reconciliation gets a stronger transition mandate — when a signal is unambiguous (post-creation evidence of completion), transition the ticket without waiting for the next standup.
- Dylan retains the right to manually elevate a Notion task to Jira when the work matures into team-visible delivery (Notion task gets a `Linked Jira` URL, Jira ticket gets the Notion link in description).
- Cadel's noise floor in Jira drops materially (target: ≤3 stale-but-open tickets in any given week).

## Falsifier

If after 30 days (review on 2026-06-04), Cadel surfaces the same complaint OR Jira-aged-open count for Dylan-reported tickets has grown >5 since this decision, this rule is failing and needs revisiting. Most likely failure mode: the criteria are too loose and "cross-functional handoff" creep gets things into Jira anyway. Tighten by adding a fourth criterion (e.g. requires epic parent — no orphan tickets allowed) before scrapping.

## Implementation

**Immediate (2026-05-05):**
- Cleanup of 17 open tickets — see `memory/learnings/2026-05/2026-05-05-jira-hygiene-cadel-feedback.md` for full record.
- 3 personal-shaped tickets migrated to Notion (AP-2184, AP-2247, AP-2249).
- 3 HubSpot mandatory fields cluster cross-linked to AP-2229 (consolidation ticket).
- 1 verified-done ticket transitioned (AP-2226).

**Tier 2 PR (queued):**
- Update `memory/profile/working-style.md` — add the three-criterion rule under "How I want Claude to behave."
- Update Apex Morning Briefing prompt in `memory/integrations/cowork.md` so the Notion-default switch is enforced on next run.

**Test environment ask (Cadel suggestion, 2026-05-04):**
> "if you're debugging it... I think you could create, like, a new project in jira and, like, use that to test."

Spin up a sandbox Jira project before the next round of automation iteration. Filed as a follow-up — not a blocker for this rule.

## Related

- `memory/decisions/2026-04-28-reconciliation-flow.md` — phantom-task elimination; this rule reduces the input volume to that flow
- `memory/decisions/2026-04-28-notion-canonical-workstack.md` — establishes Notion as canonical; this decision tightens the criteria for when work crosses into Jira
- `memory/learnings/2026-05/2026-05-05-jira-hygiene-cadel-feedback.md` — full cleanup record + per-ticket actions
