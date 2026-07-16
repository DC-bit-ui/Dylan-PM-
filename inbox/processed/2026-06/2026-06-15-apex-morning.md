# Apex Morning Briefing — 2026-06-15

**Run:** 04:45 SAST | **Model:** claude-sonnet-4-6 | **Skill version:** 2026-05-20

---

## Headline

Monday morning. Steve's LawrieCo dashboard work is in Prod (AP-2366) with Harry Clark workshops due mid-to-late June — escalated to P0. KCT Light vs Full confirm is day 3+ carryover — P0. Cadel shipped 5+ HORIZON 2.0 tickets to Done this morning; the AP-2488 PRD review is now the PM bottleneck. Four new tasks created from Granola commits (EIH wireframes, KCT flow redesign, Stormboy lead reassignment, exit strategy data). Teams fully degraded (429 rate limit throughout).

---

## Top 3 Priorities

**#1 — P0 | Frontier**: Reply to Steve re LawrieCo dashboard — HORIZON farms not showing
- AP-2366 transitioned to Prod status. Harry Clark workshops mid-to-late June. Demo data segregation likely root cause. PM needs to understand the issue and provide direction.
- Notion task: `37d8c08eb28f81749167c417af73fc19` (updated P0, Rank 1)

**#2 — P0 | Operating System**: Confirm KCT Light vs Full with Will/German
- 3+ days carryover since Jun 11. Blocks AP-2330 (KCT Issuance epic). Will + German are waiting.
- Notion task: `37d8c08eb28f81f7b490d4494ad66659` (updated Rank 2)

**#3 — P1 | Horizon**: EIH flow — produce wireframes and trigger point logic for Cadel review
- Committed Jun 10. Cadel is actively shipping HORIZON 2.0 sprint tickets; PM review and EIH wireframes are next blocker. Also: Jira comment added to AP-2488.
- Notion task: `3808c08eb28f81119e5ae907fd11e169` (created P1, Rank 3, due today)

---

## Stack A — Mine (cap 3)

| Rank | Priority | Task | Source | Age |
|---|---|---|---|---|
| 1 | P0 | LawrieCo dashboard — reply to Steve | Jira AP-2366 Prod status | Fresh |
| 2 | P0 | KCT Light vs Full — confirm with Will/German | Notion carryover | 3+ days |
| 3 | P1 | EIH flow wireframes — Cadel review | Granola Jun 10 | 5 days |

## Stack B — Complement (cap 3)

| Rank | Score | Opportunity | Source |
|---|---|---|---|
| 1 | High | AP-2488 PRD review — 5+ sprint tickets Done, next wave needs PM sign-off | Jira sprint activity today |
| 2 | Medium | KCT flow redesign with Jo — land title purchase as first step | Granola Jun 12 |
| 3 | Medium | Stormboy lead reassignment — Claudia list → Ben, post update in channel | Granola Jun 12 |

---

## Slipping Items

- **KCT Light vs Full** (P0) — 3+ days, no signal in any connector. Escalated. Bump to P0.
- **EIH wireframes** (P1) — 5 days since Granola commit Jun 10. Escalated to P1, task created, due today.
- **AP-2488 PRD** — Cadel's sprint is live. PM review unactioned since Jun 11.

---

## Source Roll-Up

| Source | Result |
|---|---|
| Notion (Today + Overdue) | Pulled. Overdue view 61.7KB — processed via preview; oldest items captured. |
| Jira | Active epics scanned. AP-2366 in Prod. AP-2488 5+ tickets Done today. AP-2367 (LawrieCo) in Testing. |
| Granola | 4 meetings Jun 9–12. 4 unactioned commitments found; all 4 tasks created in Notion. |
| Teams | **Fully degraded.** Rate-limited (429) on all queries. Channel posts not readable (chat_message_search blind to channels). |
| HubSpot | No material deal stage changes in 48h. |
| Confluence | AP-1963 PRD last edited May 29 — no new changes. |

---

## Notion Writes This Run

**Created (4):**
- `3808c08eb28f81119e5ae907fd11e169` — Horizon EIH flow wireframes (P1, due 2026-06-15)
- `3808c08eb28f810cb290ea01b06a7f0e` — Stormboy lead reassignment (P2)
- `3808c08eb28f81b9901bf348fc6a9951` — Stormboy exit strategy data (P2)
- `3808c08eb28f8101a192f9d870ea8b74` — KCT flow redesign with Jo (P1)

**Updated (2):**
- `37d8c08eb28f81749167c417af73fc19` — LawrieCo dashboard task → P0, Rank 1
- `37d8c08eb28f81f7b490d4494ad66659` — KCT Light vs Full → Rank 2

---

## Jira Comments This Run

- **AP-2488** — PM review queued for today. Flagged to Cadel that sprint shipping makes PM sign-off time-sensitive.

---

## Teams Signal

**Status: Fully degraded.** Microsoft Graph returned 429 (rate limited) on all channel and chat queries. No structured overnight signal available. Retry tomorrow.

Note: chat_message_search is also architecturally blind to channel posts — even when unthrottled, channel signals (standup, Epics) are not surfaced via this tool. See memory feedback: `feedback_teams_channels_no_chat_search.md`.

---

## Git commit

_Tier 1 write — no durable learnings captured this run beyond what's in Notion. No memory/ writes required._
