# Apex Morning Briefing — 2026-05-22 (Friday)

**Generated:** 2026-05-22T04:45:00Z
**Trigger:** scheduled
**SAST time at run:** 06:45 SAST

---

## Headline

KCT Light sales doc is due TODAY and still Proposed — that's the first thing you open.

---

## TOP 3 PRIORITIES

1. **Stormboy — Complete KCT Light sales process document** — Hard deadline today (Friday 22 May). Branded doc with fillable fields for KCT Light sales process. Kieren review was required this week — don't let this slip to EOD without touching it. [Notion: 3618c08eb28f81c6b5d8d5debf6b3c47]

2. **Operating system — Draft CERES escalation email for Kieren** — CERES meeting held yesterday (21/05). Rod McIntyre operationally incapacitated; remediation made things worse. Agreed path: Dylan drafts comprehensive summary of Rod's issues, Kieren sends in his own voice to Briana/Joe; copy David if no response by Mon 25. Must reach Kieren today. Rod's HubSpot record updated 21/05 — live signal. [Notion: 3688c08eb28f81a7bfe8c9bdcb3572bb]

3. **Horizon snapshot — Reply to Athul re: snapshot zip file** — Athul DM'd at 03:08 UTC on 21/05 asking for a zip file to test the Horizon snapshot pipeline. Sent a follow-up at 03:49 UTC. 21+ hours old, unanswered, blocking his testing. Reply with zip or direct to the existing Loom. [Notion: 3688c08eb28f819a8505c3f7477bf924]

---

## Slipping items (>3 days, low movement)

- **KCT Light sales process doc** — commitment from Product Refinement Meeting 14/05 (8 days ago), still Proposed. Due TODAY. P0 after this run.
- **Athul DMs** — 21+ hours unanswered (2 messages). Blocking snapshot pipeline testing.
- **Ben DM** — 18+ hours unanswered. Asked how to know when snapshots are ready.
- **Jira AP-2221 / AP-2218** — Dylan-assigned subtasks (document requirements, scope solution for land title automation). In Development since late April — no movement visible in ~30 days. Review if still relevant or if scope changed.

---

## Teams signal (structured)

### Mentions of me (3 DMs, channel search blind — see note)

- [DM] Athul George @ 2026-05-21T03:08 UTC: "Hey Dylan, I am trying to test the Horizon snapshot pipeline feature, could you send me a zip file that you would normally upload so I can test it?"
- [DM] Athul George @ 2026-05-21T03:49 UTC: "Hey Dylan, just tagging in case you missed this." — follow-up to above
- [DM] Ben Payne @ 2026-05-21T05:50 UTC: "Hey Dylan, the two snapshot that we requested last week, how do I know when they are ready?"

**Note:** `chat_message_search` is blind to channel posts (Teams limitation — only DMs returned). Channel keyword search returned no results. Channel activity inferred from Outlook Teams notification digests below.

### Decisions (from Outlook Teams notifications, 21–22 May)

- [Channel — unknown] Cadel Watson @ 2026-05-22T01:19 UTC: "Not live yet - stand by I'll work out estimate for Messner now" — snapshot for Messner property not yet live; Cadel estimating.
- [Channel — unknown] @ 2026-05-21T23:31 UTC: "Thanks for investigating Gayathri" — thread on Gayathri's DB permissions; Cadel + 2 replied; may be in progress.
- [Channel — Deals] @ 2026-05-22T02:23 UTC: "Hobbs Magaret, this has cancelled today. I have notified Hobbs over the phone" — a Hobbs meeting cancelled today.

### Questions for me (2 unanswered DMs)

- [DM] Athul George @ 2026-05-21T03:08 UTC: "could you send me a zip file that you would normally upload so I can test it?" — answered: no
- [DM] Ben Payne @ 2026-05-21T05:50 UTC: "how do I know when they are ready?" — answered: no

### Commitments to me (0 confirmed)

None identified via DM search. Channel posts not accessible.

### Channel freshness

- `chat_message_search` returned empty on keyword search (snapshot, KCT, Stormboy, Frontier, HORIZON) — channel posts not surfaced. Only DMs returned. Treat as degraded source for channel freshness.

---

## Source roll-up

- **Notion carryover:** 5 items (2 in progress, 3 proposed — all due today)
- **Granola open commitments:** 12+ across 12 meetings this week — 2 already tracked in Notion (InfoTrack post, Stormboy email), 7 newly created this run
- **Teams:** 2 unanswered questions (Athul x2 DMs, Ben x1 DM); 3 channel-signal items inferred from Outlook notifications; channel post search degraded
- **HubSpot:** Rod McIntyre deal updated 21/05 (confirms CERES escalation active); Tallawanta and Wombinoo Station deals updated today morning (owner: 76812243 — likely Kieren/sales side, no PM action required); Swartz Carbon Projects bulk-updated; Bradley Boldiston new deal created 12/05 (close date 2026-07-01)
- **Confluence:** 1 page updated — Kieren created KW<>DW weekly meeting template for 25 May (next 1:1). No PRD or design doc updates.
- **Outlook Jira emails:** AP-2400 "[Frontier Address Search] Property search not surfacing linked property-contact relationship" — 2 Jira automation updates today. Active bug on Athul's epic (AP-2253). No PM action needed unless Athul flags it — monitor.

---

## Jira snapshot

**Active epics (not Done):**
| Epic | Status | Assignee | Last updated |
|---|---|---|---|
| AP-2330 Project KCT Phase 2 | Designs | unassigned | 2026-05-19 |
| AP-2367 Referrer Portal Phase 2 | Discovery | Steve/Will | 2026-05-18 |
| AP-2342 Sampling Leaderboard v2 | PRD | Steve | 2026-05-18 |
| AP-1964 Operation KCT Phase 1 | Development | Steve | 2026-05-07 |
| AP-2253 Frontier Address Search | Development | Athul | 2026-05-06 |
| AP-2187 Crediting Workflow Template | Discovery | unassigned | 2026-04-21 |

**Dylan's assigned tickets:**
- AP-2217 Support Will's automation request (story) — Development
- AP-2218 Document requirements and ACs — Development
- AP-2221 Scope solution and identify dependencies — Development
- AP-2220 Draft engineering ticket for review — Ready for development

**Watch:** AP-2367 Referrer Portal Phase 2 — demo farm setup for LawrieCo workshops mid-June. Cadel is a dependency; Harry Clark needs 6 segregated demo farms. High stakes, short runway.

**Blocked items in Jira:** 0

---

## Key blockers (from Granola this week)

- Exclusion zones API bug — permissions issue breaking KCT workflow adoption
- ACT exclusion zone errors on staging — separate from API bug
- Claude API issues blocking snapshot generation (workaround being explored)
- 120+ customer onboarding accounts in limbo — password setup links expired for manual onboards from Claudia
- Vibe zone auth incompatibility — no resolution path agreed
- Demo farm setup for LawrieCo workshops blocked on Cadel (mid-June deadline)
- 25% discount issue for T2/subsequent TENs — no owner assigned

---

## Notion writes this run

**Created (7 new Proposed tasks):**
- Operating system — Draft CERES escalation email for Kieren [3688c08eb28f81a7bfe8c9bdcb3572bb] — P0, due 2026-05-22
- Horizon snapshot — Reply to Athul: send snapshot zip file [3688c08eb28f819a8505c3f7477bf924] — P1, due 2026-05-22
- Horizon snapshot — Reply to Ben: snapshot status [3688c08eb28f8111bd55de9b74855842] — P1, due 2026-05-22
- Operating system — Grant DB read-only permissions for Gayathri [3688c08eb28f81e4bc90df7d4b03c018] — P1, due 2026-05-22
- Operating system — Send simplified vendor email for Land Title API [3688c08eb28f81989e79fa8fcc72ff57] — P1, due 2026-05-22
- Stormboy — KCT operationalisation: guide Joe and DJ while Steve away [3688c08eb28f8113ab72cff769c06c65] — P1, due 2026-06-08
- Operating system — Create Loom tutorials: property creation + snapshot request [3688c08eb28f810d8866e763bacd2cec] — P2, due 2026-05-29

**Updated (1):**
- Stormboy — Draft KCT Light sales process document [3618c08eb28f81c6b5d8d5debf6b3c47] — bumped P1→P0, Today Rank 3→1

---

## Errors / degraded sources

- **Teams channel posts:** `chat_message_search` blind to channel posts (DMs only). Keyword search (snapshot, KCT, Frontier, Stormboy, HORIZON) returned zero results — expected behaviour per known Teams limitation. Channel signal inferred from Outlook Teams notification digests only. Treat Teams channel data as ❓ incomplete this run.
- **Jira recently updated (24h):** result exceeded max token size; saved to file. Summary extracted via pattern; full data not read. Low risk — key epics and Dylan's tickets captured separately.
- **Notion Overdue view:** result exceeded 64KB; saved to file. Not processed this run. Overdue items not reconciled against today's workstack. Recommend: Dylan reviews Overdue view manually or ask Apex EOD to reconcile.
