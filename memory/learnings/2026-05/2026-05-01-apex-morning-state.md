# Apex Morning Run — 2026-05-01 State Snapshot

**Date:** 2026-05-01
**Source:** Apex Morning Briefing automated run, 05:00 SAST
**Confidence:** [high] (live connector data)

## Initiative state as of this morning

### Frontier Phase 2 (AP-1963)
- Two feature enhancement bugs remain to close v1 epic
- AP-2252 (CEA Import/Export) moved to Prod today (Gayathri) — needs Dylan verification
- AP-2253 (Address Search) in Discovery, Athul assigned — Dylan to send PRD + Figma + Loom to unblock dev start
- AP-2268 (scheduled_hubspot queues backed up AGAIN) in Prod, Cadel assigned — recurrence flag
- AP-2270 (Ingest CAPAD data into Postgres) Done today — may resolve AROSIN national park boundary mapping errors (verify before raising tickets)
- AP-2271 (Referrer Portal re-skin to Magic Patterns) Ready for dev — unassigned
- AP-2272 (Bordertown demo farm synthetic data) Ready for dev — unassigned
- Production deploy on hold until CADO returns (risk mitigation)

### EIH Automation (AP-2217)
- Requirements synthesis complete. Confluence doc published: https://agriprove.atlassian.net/wiki/spaces/SCRUM/pages/557252609
- Sourced from Will (Apr 21), DJ (Apr 24, Apr 30)
- Status: awaiting confirmation; follow-up meeting to schedule
- Jira comment added to AP-2217 pointing to the Confluence doc

### Claude MCP Integration Proposal (Q2)
- Draft published to Confluence ~9 hours ago (created May 1 ~04:00 SAST): https://agriprove.atlassian.net/wiki/spaces/SCRUM/pages/557449218
- Feature owner: Cadel Watson | Delivery owner: Dylan Cronje
- Status: Draft, awaiting Cadel review
- Notion task created to send to Cadel today

### Stormboy
- AP-2037 (Scrape Victorian properties) Done — completed by Dylan
- AP-2269 (Re-sync Victorian properties after import) in Development (Cadel)
- Stormboy properties re-import still needs Dan's approval before proceeding

### Soils / HORIZON
- AP-2248 (Soils MVP paddock-first + timeline architecture) in Development, Steve assigned — updated today
- AP-2116 (Model validation framework for Schedule 2) in Development, Cadel assigned
- AP-2231 (Snapshot bug — property details not passing) in Prod — needs verification

### LawrieCo / KCT
- AP-1965 (LawrieCo referrer view) Development, Steve — last updated Mar 11 (stale)
- AP-1964 (Operation KCT phase 1) Development, Steve — last updated Mar 11 (stale)

## Teams scan
Teams chat_message_search returned no results for either query (last 18h, product/Frontier/snapshot terms). Consistent with prior runs — Teams channel posts may not be captured by chat_message_search. [See standing feedback: teams_channels.md]

## Slipping items
- Stephen's security questions for Apex PM Microsoft API connection: raised Apr 23, now 8 days old. Escalated P2→P1 in Notion.
