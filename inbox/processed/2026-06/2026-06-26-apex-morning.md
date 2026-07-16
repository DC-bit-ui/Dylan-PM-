# Apex Morning Brief — 2026-06-26 (Friday)

**Run time:** 04:45 SAST | **Generated:** 2026-06-26T04:45 SAST  
**Model:** claude-sonnet-4-6 | **Session:** Apex Morning Briefing v2026-05-20

---

## Carryover

- **74 items** in Overdue/Today view (many stale March–April; not re-escalated)
- Top persistent items with updated ranks:
  - EIH/KCT tile designs → Steve (Rank 2) — 3 days overdue, Steve blocked
  - Drawing Tool Manager Briefing (Rank 3) — **escalated P1 → P0** (11 days, AP-2539 in Code Review, AP-2542 in Staging — dev shipping without PM sign-off)
  - HORIZON stuck snapshots (Rank 4) — 4 snapshots stuck 4–7 days
  - Reply to Cadel: Drawing Tool questions (Rank 5) — 9 days overdue

---

## New discoveries

### Granola (Jun 15–18 — Jun 22–26 returned zero meetings, Granola may be offline this week)

- **Jun 18 — Prospective Projects prototype:** Commitment to share with DJ and Joe for testing. No matching Notion task found → **new P1 task created** (Rank 6).
- **Jun 23 — HORIZON Snapshot walkthrough with Ben:** Ben walked through snapshot flow; action was to follow up on stuck snapshots. Existing task updated.
- **Jun 16 — Frontier Alignment:** Cadel mentioned project planning across several sessions. Teams DM (Jun 25) confirmed active blocking state.

### Teams (DMs only — channel blindspot active)

- **Cadel DM (Jun 25):** Holding structural planning decisions. Athul has capacity imminently. Explicit blocker. → **New P0 task created** (Rank 1): "Frontier — Align with Cadel on project rejig + unblock Athul capacity"

### Jira

- **AP-2539** (Drawing Tool): Code Review — dev shipping without Manager Briefing sign-off. Triggered P0 escalation.
- **AP-2542** (Drawing Tool): Staging — same concern.
- **ROAD-187 to ROAD-194** (8 new roadmap ideas, all Cadel, Jun 25): Satellite imagery integration, deep learning, foundation model embeddings, climate anomalies, project-history context, KCT splitting, project hub. All in "Deliver" status. Correlates with Cadel's project rejig DM — he's actively shaping HORIZON 2.0 scope. → Stack B signal.
- **AP-2116** (HORIZON validation, Cadel): In Progress — no blockers surfaced.
- **ROAD project** (Prod query): Returned ROAD roadmap ideas only — no AP tickets currently in Prod status.

### HubSpot / Outlook / Confluence

- Not scanned this run (context limit reached after Jira + Teams + Granola sweep). Flag for next run.

---

## Stack A — Mine (Top 3, P0 priority)

| Rank | Task | Why P0 |
|---|---|---|
| 1 | **Frontier — Align with Cadel on project rejig + unblock Athul capacity** | Cadel explicitly blocked waiting. Athul capacity imminent. Newly created. |
| 2 | **EIH/KCT dashboard tile designs → Steve** | Steve blocked 3+ days. Design handover is the only unlock. |
| 3 | **Drawing Tool — Complete Manager Briefing** | AP-2539 in Code Review, AP-2542 in Staging. Dev shipping without PM sign-off. Escalated from P1. |

---

## Stack B — Complement (Top 3 leverage opportunities)

| Item | Leverage signal | Why Dylan's input matters |
|---|---|---|
| **ROAD-187 to ROAD-194 — HORIZON 2.0 roadmap scope** | Cadel logged 8 new roadmap ideas on Jun 25 same day as blocking DM. Scope is being shaped without PM input. | Dylan owns the PM perspective on what's feasible vs aspirational. These ideas need appetite-sizing before Cadel structures them into epics. |
| **HORIZON stuck snapshots (4 properties, WA region)** | Pattern consistent with new ROAD-190 (satellite imagery / WA data gaps). | Cross-surface bug that may be masking a data quality issue. Engineering may not connect the dots without PM raising it. |
| **Drawing Tool questions from Cadel (Product > Epics channel)** | 9 days unanswered. Cadel is actively engaged on HORIZON 2.0 scope — batching this into today's project rejig call is the efficient path. | Unblocks Cadel on sign-up edge cases + tokenised URL design. |

---

## Notion writes this run

**Created (Proposed):**
1. "Frontier — Align with Cadel on project rejig + unblock Athul capacity" — P0, Rank 1 (page `38a8c08eb28f81909985e58d1990da84`)
2. "Frontier — Share Prospective Projects prototype with DJ and Joe for testing" — P1, Rank 6 (page `38a8c08eb28f81a7b946d790ce42fb96`)

**Updated:**
1. Drawing Tool Manager Briefing — P1 → P0, Rank 3, Next step updated with escalation reason (page `3818c08eb28f8165bd14c16e634f47bb`)
2. EIH/KCT tile designs → Steve — Rank 2, Next step updated (page `3898c08eb28f81a5ab40f55de97deaac`)
3. HORIZON stuck snapshots — Rank 4, Next step updated (page `3898c08eb28f817a8bd2c66f72037e22`)
4. Reply to Cadel: Drawing Tool questions — Rank 5, Next step updated (page `3828c08eb28f811280ace2adccdba5d6`)

---

## Slipping items

- **Drawing Tool Manager Briefing** — 11 days, escalated P0. AP-2539/2542 shipping. CRITICAL.
- **Reply to Cadel: Drawing Tool questions** — 9 days, no action detected.
- **EIH/KCT tile designs → Steve** — 3 days, Steve blocked.
- **Prospective Projects prototype → DJ and Joe** — Jun 18 commitment, 8 days elapsed, no Notion task existed until today.

---

## Data quality flags

- `teams_pull_errors`: Teams `chat_message_search` scans DMs only. Channel posts (Product > Epics, Growth: Deals, Ops: Projects, Auditing & Crediting, etc.) not accessible. Brief is **incomplete on Teams channels**. Mitigation: none available this session.
- `granola_this_week_empty`: Jun 22–26 Granola query returned zero meetings. Granola may not be running on machine this week. All action items sourced from Jun 15–18 range. Commitments from this week's meetings not captured.
- `hubspot_confluence_outlook_not_scanned`: Context limit reached before HubSpot/Outlook/Confluence sweep. Flag for EOD run.
