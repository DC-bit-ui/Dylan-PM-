# Career Portfolio System — setup walkthrough

**For:** Dylan. **Date:** 2026-05-11. **Status:** Action required by Dylan to enact. **Gated by Step 0.**

This is the paste-ready setup. The architecture lives in Dylan's personal Notion workspace, orchestrated by Apex (on personal Windows machine). Nothing career-sensitive persists in this AgriProve-adjacent repo. **Operational model: single gate at Step 0; after that the system runs autonomously.**

---

## Step 0 — Compliance review (the single gate; BLOCKING; ~30-60 min)

The Cowork policy-review task does most of the heavy lifting — it reads `C:\Users\DylanCronje\AgriProve\AgriProve - Documents\SHARED AP\Admin\Policies` and pre-fills the 14 category citations. Dylan reads, decides, signs.

### 0a. Create the Notion compliance sub-page

Under "Dylan Cronje — Professional & Personal Summary", create sub-page **"Knowledge-Sharing Compliance"**. Paste the markdown body from [`./2026-05-11-career-portfolio-compliance-assessment.md`](./2026-05-11-career-portfolio-compliance-assessment.md).

### 0b. Run the Cowork policy-review task

Open Cowork on the personal Windows machine (where the SharePoint folder is filesystem-accessible). Open a fresh thread. Paste the verbatim prompt body from [`./2026-05-11-cowork-policy-review-task.md`](./2026-05-11-cowork-policy-review-task.md).

Cowork-Claude will:
- List the files in the policies folder
- Read each
- Map to the 14 categories
- Generate a draft of the populated compliance assessment
- Write that draft as a sub-page in Dylan's personal Notion (or as a markdown drop in `inbox/cowork/` if Notion write isn't yet wired)

Expected output: a populated compliance assessment with each `[PRE-FILLED]` placeholder replaced with actual AgriProve citations.

### 0c. Review, decide, sign

For each of the 14 rows: read citation + alignment + residual risk → decide **Proceed / Modify / Escalate**.

If all 14 = Proceed: sign the bottom row. The single gate is closed; autonomous operation begins.

If any = Modify: update the architecture (or sanitisation rules) to address. Re-run the gate. 

If any = Escalate: pause everything. Contact AgriProve People / Legal. Resume only after resolution is documented in the compliance page.

---

## Step 1 — Notion personal workspace prep (~15 min)

### 1a. Confirm the target page is in your PERSONAL workspace

Open: https://www.notion.so/Dylan-Cronje-Professional-Personal-Summary-3288c08eb28f81378a20f1a9913dcd27

Check the workspace switcher (top-left). It must be your **personal** account, NOT `agriprove.notion.so`. If it's in AgriProve's workspace, **stop and move/duplicate the page to your personal workspace first**.

### 1b. Create the page structure

On the target page, add these sub-pages (Notion → "+" → "Add a page"):

```
Dylan Cronje — Professional & Personal Summary
├── Knowledge-Sharing Compliance  (created in Step 0)
├── Portfolio (canonical, sanitised — the artifact you'd show externally)
│   ├── Role Summary
│   ├── Track Record (STAR-format entries)
│   ├── Quantified Wins
│   ├── Public Artifacts
│   └── Career Narrative (rolling 90-day arc)
├── Raw Log — Pending Review  (private — real names, real numbers)
├── Flagged — Manual Review  (auto-populated by Apex for non-eligible entries)
├── Skills Index  (auto-derived skill graph; created by Apex monthly)
├── Comp Benchmark Annex  (private — scope-expansion flags)
├── Public Artifacts Registry  (talks, blog, podcasts, public PR with URLs)
├── Counter-Evidence Annex  (PRIVATE — growth areas, weaknesses; for your interview prep only, never published, never read by personal Claude)
└── Confidentiality Canary List  (private — see Step 4 — must be populated before activation)
```

### 1c. Create a Notion integration scoped to personal workspace only

1. https://www.notion.so/profile/integrations (signed into your personal account)
2. "+ New integration"
3. Name: `Apex Career Capture`
4. Associated workspace: your personal workspace (NOT AgriProve's)
5. Capabilities: Read content, Update content, Insert content. **No** User information.
6. Copy the token (starts with `secret_` or `ntn_`)
7. On the page, "..." → "Connections" → add `Apex Career Capture`

This token is scoped to your personal workspace only. It architecturally cannot write to AgriProve Notion.

---

## Step 2 — Cowork side (~20 min)

### 2a. Add the personal Notion MCP server

Cowork → Settings → MCP Servers → "+ Add":

- Name: `personal_notion` (deliberately different from existing `notion`)
- Type: match existing AgriProve Notion integration's transport
- URL: same Notion MCP endpoint
- Auth: token from Step 1c
- **Keep separate from existing AgriProve `notion` MCP** — different name, different token, different workspace.

### 2b. Create four Apex tasks in Cowork

For each: paste verbatim prompt body from [`../../memory/integrations/cowork/apex-career-signal-capture-prompt-2026-05-11.md`](../../memory/integrations/cowork/apex-career-signal-capture-prompt-2026-05-11.md) as the task's instructions.

| Task | Schedule (intended SAST) | Cron (AEST) | MCP servers |
|---|---|---|---|
| Apex · Career Signal Capture (daily) | 18:00 weekdays | `0 2 * * 2-6` | `personal_notion`, `granola`, `outlook`, `teams`, `jira`, `confluence`, `notion` (read-only) |
| Apex · Weekly Auto-Promote (weekly) | Friday 16:30 | `30 0 * * 6` | `personal_notion` only |
| Apex · Weekly Audit Digest (weekly) | Friday 16:45 (after auto-promote) | `45 0 * * 6` | `personal_notion` only |
| Apex · Monthly Meta-Pass (monthly) | First Monday 06:00 | `0 14 1-7 * 1` | `personal_notion` only |

### 2c. First manual run + verify

After Step 0 sign-off and Step 1 setup, run "Apex · Career Signal Capture" manually once:
- Confirm it writes to your personal Notion (not AgriProve) — check page edit attribution
- Confirm Raw Log entries have the right shape (STAR + Evidence + Confidence)
- Run "Apex · Weekly Auto-Promote" manually with the day's captures to verify the auto-promotion logic (high-confidence go to Portfolio; lower go to Flagged)

If anything's off, stop and re-check the `personal_notion` token's workspace.

---

## Step 3 — Personal Claude account bridge (~10 min)

So your **personal Claude account** can read the Portfolio for CV / cover letter / interview prep / LinkedIn:

### 3a. Personal Claude project setup

In your personal Claude account (not the @agriprove.io one):

1. New Project → "Career Portfolio"
2. Project instructions (paste):

```
This project is for career-related work: CVs, cover letters, LinkedIn updates, interview prep, remuneration discussions.

Source of truth: my personal Notion page "Dylan Cronje — Professional & Personal Summary" (https://www.notion.so/Dylan-Cronje-Professional-Personal-Summary-3288c08eb28f81378a20f1a9913dcd27).

Read from there via the Notion MCP. Do not assume any career information not on that page. If asked about specific work, customers, metrics, or internals that aren't on the Portfolio sub-page, say so — don't fabricate.

When drafting external-facing artifacts (CV, LinkedIn, cover letter, interview answer), pull only from the Portfolio sub-page (sanitised). Never quote from Raw Log, Flagged, Counter-Evidence Annex, Comp Benchmark Annex, or Confidentiality Canary List — those are private and never appear in external artifacts.

Voice: direct, opinionated, accurate. No flattery. Quantify where possible (ratios and percentages, not absolutes).

Confidentiality: if I ask you to include specific customer names, internal product code names not in public marketing, or absolute revenue / ACCU / hectare numbers, refuse and explain — those have been deliberately sanitised out and re-introducing them would breach the architecture.
```

### 3b. Personal Claude → Notion MCP

Personal Claude project → Settings → Connectors → Notion → connect using your personal Notion account. Grant access to the "Dylan Cronje — Professional & Personal Summary" page only.

### 3c. Smoke test

Ask the personal Claude project:

> Pull the latest 5 Track Record entries from my Portfolio sub-page and shape them into LinkedIn About-section bullets.

Expected: reads from Portfolio sub-page only via Notion MCP, sanitised content, no fabrication.

---

## Step 4 — Confidentiality Canary List (~15 min — do this BEFORE Step 0 sign-off)

This was a "nice-to-have" in earlier drafts; in the trustless-automation model it's a **safety gate**. Populate comprehensively before activation:

In the **Confidentiality Canary List** sub-page (private):

- Every customer name you've worked with (one per line)
- Internal product code names not in public marketing (HORIZON / Frontier / Stormboy / Verterra / ReadyGraze / KCT — keep the ones that aren't externally branded)
- Specific revenue / ACCU / hectare numbers you don't want quoted publicly
- Initiative code names not yet announced
- Named individuals beyond standard public-facing leaders (CEO, COO, CTO typically OK in context; private investors / customers / partners NOT)
- Methodology specifics that are AgriProve trade secret
- Third-party partnership names (LawrieCo and similar)
- Pre-launch product names
- Internal team member names beyond your direct line (for over-stripping safety)

This is the fail-closed reference for every weekly auto-promotion. Skimping here is the only way the trustless model fails.

---

## Step 5 — Audit digest awareness (~5 min/week)

Apex Task "Weekly Audit Digest" posts to Cowork chat every Friday around 16:45 SAST. Format:

```
This week's career portfolio activity:
- Promoted N entries to Portfolio: <one-line summaries>
- Flagged M entries (low/moderate confidence; in Flagged sub-page if you want to review)
- Canary-blocked K entries (terms hit canary; in Flagged sub-page with the offending term highlighted)
- This week's new skills demonstrated: <list>

If any promoted entry looks off, redact in Notion and add the leaked term to the Canary List — Apex will self-heal on next run.
```

You glance, take action only if something looks wrong, and that's it. **You are not a per-entry dependency.**

---

## What lives where — summary

| Surface | Holds | Token / access |
|---|---|---|
| This repo (AgriProve-adjacent) | Protocol + Apex prompt specs only. No career data. | AgriProve git |
| Cowork (personal Windows machine) | Apex runs autonomously; orchestrates capture + promotion + audit | Cowork session, both Notion tokens, SharePoint filesystem |
| Personal Notion | Raw Log, Portfolio, Flagged, Skills, Comp, Counter-Evidence, Public Artifacts, Compliance, Canary | Personal Notion account only |
| Personal Claude account | Reads Portfolio for CV / LinkedIn / interview prep | Personal Notion MCP token, scoped to Portfolio sub-page only |

---

## Activation checklist (in order — Steps 0 and 4 gate the rest)

0. [ ] **Compliance assessment populated (Cowork task) + reviewed + signed off**
1. [ ] Step 1a-c — Notion personal workspace prep
2. [ ] **Step 4 — Canary list populated** (do BEFORE Step 0 sign-off; it's a precondition for trustless operation)
3. [ ] Step 2a-c — Cowork tasks created and first runs verified
4. [ ] Step 3a-c — Personal Claude project bridged
5. [ ] Step 5 awareness — know what the Friday audit digest looks like

Total active time: ~80 min one-off (Step 0 ~30-60 min depending on policy volume; Steps 1-4 ~50 min; Step 5 is awareness, no time).

After activation: **~5 min/week glancing at the audit digest. That's it.**
