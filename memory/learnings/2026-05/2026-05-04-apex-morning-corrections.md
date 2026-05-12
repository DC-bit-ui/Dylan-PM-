# Apex Morning Briefing — Corrections & System Rules
**Date:** 2026-05-04
**Source:** Dylan's 6-point correction after Apex Morning Briefing run
**Confidence:** [high] — direct corrections from Dylan, same session

---

## 1. Teams query strategy was wrong — connector is fine

**Rule:** Never combine `sender` + `afterDateTime` in `chat_message_search`. Never use multi-word topic phrases as the query. These patterns fail silently (empty result, no error).

**Why:** The Monday morning briefing used queries like `sender: dylan@agriprove.io, afterDateTime: 2026-04-28` and topic phrases like `"Frontier Stormboy product"` — both silent-fail patterns. The connector itself is working. Diagnostic testing on 2026-05-04 confirmed the correct patterns (see `memory/integrations/teams.md` for full query constraint table).

**Verified correct patterns:**
- Broad activity: `query: "*"` + `afterDateTime` (no sender) → works
- Dylan outbound: `query: "*"` + `sender: "dylan@agriprove.io"` (no date) → filter by createdDateTime in logic
- Single topic: `query: "single-keyword"` + `afterDateTime` → works; multi-word phrases do not
- Never combine `sender` + `afterDateTime` — silent empty result

**How to apply:**
- Apex Morning Briefing: run two queries — (1) `*` + afterDateTime for broad activity, (2) `*` + sender for Dylan's outbound signals. Filter dates in logic, not via parameter.
- For completion signal checks: look for Dylan's name in broad results, or query `sender: dylan@agriprove.io` and filter by date post-task-creation.
- Remove multi-word topic phrase queries entirely from the briefing playbook.

---

## 2. Monday scan window must cover the full prior week (not 18 hours)

**Rule:** On Mondays, Apex must scan Granola, Outlook, Teams, and Jira for the past 7 days (back to previous Monday), not just the prior 18 hours.

**Why:** Dylan's completed tasks from Thursday/Friday were invisible because the scan window was too narrow. The Athul address search materials (sent days ago, flagged in prior sessions) and the Claudia 1:1 (occurred Friday May 1) were both missed on a Monday briefing.

**How to apply:**
- On Mondays: set all connector time windows to `last 7 days` (or `since last Monday`), not `last 24h`.
- This applies to Granola meeting scan, Outlook sent items check, Teams message search, and Jira comment/transition queries.
- The existing COWORK.md Granola scan rule (`window = 7 days, not just yesterday`) already covers Granola — extend this same logic to all connectors on Mondays.

---

## 3. Granola reconciliation must pattern-match meeting titles against open Notion tasks

**Rule:** Before escalating any open Notion task, check whether a Granola meeting from the scan window has a title or participants that match the task description. If yes, treat the meeting as a potential completion signal and verify before escalating.

**Why:** The Notion task "Stormboy — 1:1 with Claudia to define exact Claude Code workflow" was escalated as 6 days overdue. The Granola scan had retrieved a meeting titled "Claude code stormboy project architecture walkthrough with Claudia" (May 1 — 3 days prior). These clearly match. The escalation was wrong because reconciliation didn't cross-reference meeting titles against open task text.

**How to apply:**
- For each open Notion task, before marking it "Still-open," run a title similarity check against all Granola meetings in the scan window.
- Match on: person name, project name (Stormboy, Frontier, Horizon, etc.), action verb (1:1, walkthrough, review, kickoff, session).
- If a meeting matches: categorise the task as "Ambiguous" at minimum; probe the meeting details before escalating.
- Implement this as a step in the reconciliation flow, explicitly in `.claude/skills/reconcile/SKILL.md` (propose as Tier 2 PR).

---

## 4. Only create Notion tasks for Jira tickets where Dylan is the actor

**Rule:** Do NOT create a Dylan Notion task for a Jira ticket where Dylan is not the assignee, unless the ticket type is explicitly a review/approval/sign-off action (e.g. "Design Review — Dylan to approve").

**Why:** AP-2274 ("Verify new Schedule 2 calculations using Duncan CP2 example") was assigned to Cadel. I created a Notion task for Dylan. Dylan: "Nothing to do with me." Surfacing teammate execution tickets as Dylan actions is noise and erodes briefing trust.

**How to apply:**
- In Apex Jira scan: filter `assignee = Dylan` OR `mentioned in comments as action owner` before creating Notion tasks.
- Tickets assigned to others may appear in Stack B (Complement) if they touch Dylan's owned surfaces — but only as "may want to weigh in," never as Dylan execution tasks.
- Tickets in Prod status (`Build and Test`) only warrant a Dylan task if they're blocked and Dylan is the unblocking party, or if Dylan is explicitly named in a comment.

---

## 5. Completion signals from prior sessions must be persisted to memory

**Rule:** When Dylan confirms a task is complete (in any session), write it to memory immediately — `memory/retros/session/<date>-eod.md` or as a learning. Do not rely on connector re-verification in a future session.

**Why:** Dylan confirmed he sent the Athul address search materials "days ago" and "flagged it several times" in previous sessions. The completion was never persisted. Monday's briefing re-surfaced it as P0, which eroded Dylan's trust ("Are you not using any sort of memory?").

**How to apply:**
- Any time Dylan says "I did that," "sent it," "done," "completed" — write a completion record to `memory/retros/session/<date>-eod.md` with task name, confirmed-complete date, and source of confirmation (Dylan's statement).
- Apex Morning Briefing should check this log before surfacing overdue tasks: if a task appears in recent EOD retros as completed, mark it Done and confirm rather than re-escalating.
- This is a gap in the current reconciliation flow — propose as Tier 2 PR to COWORK.md.

---

## 6. HubSpot tasks are PM-execution, not dev-dependency

**Rule:** When surfacing HubSpot configuration tasks (mandatory fields, list management, contact allocation), frame them as Dylan's direct HubSpot admin work — not as items blocking engineering.

**Why:** AP-2215 "HubSpot mandatory fields scaffold" was described as "blocking dev work." Dylan: "This is on me — nothing to do with Dev, it is a HubSpot task 90% complete." Misframing inflates urgency and creates false blockers for engineering.

**How to apply:**
- HubSpot tasks pattern: if the ticket involves HubSpot field configuration, list management, contact/deal setup, or CRM data hygiene — assume Dylan executes it directly in HubSpot. Do not connect it to dev team capacity.
- Only call it a dev blocker if the ticket description explicitly states "Engineering required" or "API integration."
- In Notion Next step, use "HubSpot admin — Dylan action" as the framing, not "unblock design/dev."

---

## Meta: briefing trust model

**Rule:** A briefing that surfaces 3 phantom tasks in a single run is a briefing that erodes trust. The threshold for creating a Notion task should be: "Am I confident this is unambiguously Dylan's action, with a real completion gap?"

**Why:** This session had AP-2274 (wrong actor), Athul materials (already done), and Claudia 1:1 (already done) — 3 out of ~6 surfaced items were wrong. That's a 50% false-positive rate for task creation.

**How to apply:**
- Before creating any Proposed Notion task, explicitly ask: (a) Is Dylan the actor? (b) Is there a completion signal in any connector? (c) Is this a genuine gap or a stale escalation?
- Default to "Still-open, confirm with Dylan" over "Create new Proposed task" when confidence is below [high].
- Track false-positive rate in weekly retros per COWORK.md §10 dual-stack source-quality check.
