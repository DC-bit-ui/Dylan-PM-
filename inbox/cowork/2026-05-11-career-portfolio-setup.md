# Career Portfolio System — setup walkthrough

**For:** Dylan. **Date:** 2026-05-11. **Status:** Action required by Dylan to enact. **Gated by Step 0.**

This is the paste-ready setup for the career portfolio system. The architecture lives in your personal Notion workspace, orchestrated by Apex (on your personal Windows machine). Nothing career-sensitive persists in this AgriProve-adjacent repo.

---

## Step 0 — Compliance review (BLOCKING — do this first)

Open [`./2026-05-11-career-portfolio-compliance-assessment.md`](./2026-05-11-career-portfolio-compliance-assessment.md).

1. Create a Notion sub-page under "Dylan Cronje — Professional & Personal Summary" called **"Knowledge-Sharing Compliance"**.
2. Paste the markdown from that file as the page body.
3. Populate every `[POLICY CITATION]` placeholder against AgriProve's actual policy documents:
   - Employment contract (IP assignment clause)
   - Confidentiality agreement / NDA
   - Acceptable Use Policy (IT systems)
   - Data Classification Policy
   - AI / GenAI Usage Policy ← **high-priority item**
   - Information Security Policy
   - External Communications Policy
   - Social Media Policy
   - Australian Privacy Act 1988 (general — not AgriProve-specific)
   - Customer contract obligations (LawrieCo, others)
   - Schedule 2 / Clean Energy Regulator obligations
   - Trade secret protection (common law)
   - Code of Conduct
   - Insider information / market-sensitive (if applicable)
4. For each: decide **Proceed / Modify / Escalate**.
5. Sign the "Dylan Cronje (self)" row in the sign-off table.

**Until Step 0 is complete, do not proceed to Steps 1–4.** The Apex prompt files in `memory/integrations/cowork/apex-career-signal-capture-prompt-2026-05-11.md` are marked DRAFT for this reason.

If Step 0 surfaces any "Escalate" decision, pause everything and resolve with AgriProve People / Legal before resuming.

---

## Step 1 — Notion personal workspace prep (15 min, after Step 0)

### 1a. Confirm the target page is in your PERSONAL workspace

Open: https://www.notion.so/Dylan-Cronje-Professional-Personal-Summary-3288c08eb28f81378a20f1a9913dcd27

Check the workspace switcher (top-left). It must be your **personal** account, NOT `agriprove.notion.so`. If it's in AgriProve's workspace, **stop and move/duplicate the page to your personal workspace first**. The IP separation depends on this.

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
├── Promotion Candidates — Week of YYYY-MM-DD  (created weekly by Apex Task 2)
├── Skills Index  (auto-derived skill graph; created by Apex Task 3)
├── Comp Benchmark Annex  (private — scope-expansion flags)
├── Public Artifacts Registry  (talks, blog, podcasts, public PR with URLs)
├── Counter-Evidence Annex  (PRIVATE — growth areas, weaknesses; for your interview prep only, never published, never read by personal Claude)
└── Confidentiality Canary List  (private — see Step 4)
```

### 1c. Create a Notion integration scoped to personal workspace only

1. Go to https://www.notion.so/profile/integrations (signed into your personal account)
2. "+ New integration"
3. Name: `Apex Career Capture`
4. Associated workspace: your personal workspace (NOT AgriProve's)
5. Capabilities: Read content, Update content, Insert content. **No** User information.
6. Submit → copy the "Internal Integration Token" (starts with `secret_` or `ntn_`)
7. On the "Dylan Cronje — Professional & Personal Summary" page, click "..." → "Connections" → add `Apex Career Capture`

This token is what Apex uses to write career data. It is scoped to your personal workspace only. It cannot accidentally write to AgriProve Notion.

---

## Step 2 — Cowork side (20 min)

### 2a. Add the personal Notion MCP server to Cowork

In Cowork → Settings → MCP Servers → "+ Add":

- Name: `personal_notion` (deliberately different from the existing AgriProve `notion`)
- Type: match your existing AgriProve Notion integration's transport (HTTP / stdio)
- URL: same Notion MCP endpoint
- Auth: paste the integration token from Step 1c
- **Keep separate from the existing AgriProve Notion MCP server** — different name, different token, different workspace.

### 2b. Create three new Apex tasks in Cowork

For each: Cowork → Tasks → "+ New task". Paste the verbatim prompt body from `memory/integrations/cowork/apex-career-signal-capture-prompt-2026-05-11.md` as the task's instructions.

| Task | Schedule (intended SAST) | Cron (AEST) | MCP servers |
|---|---|---|---|
| Apex · Career Signal Capture (daily) | 18:00 weekdays | `0 2 * * 2-6` | `personal_notion`, `granola`, `outlook`, `teams`, `jira`, `confluence`, `notion` (read-only) |
| Apex · Weekly Portfolio Review (weekly) | Friday 16:30 | `30 0 * * 6` | `personal_notion` only |
| Apex · Monthly Portfolio Meta-Pass (monthly) | First Monday 06:00 | `0 14 1-7 * 1` | `personal_notion` only |

### 2c. First manual run

Run "Apex · Career Signal Capture" manually once to verify:
- It writes to your personal Notion (not AgriProve) — check the page edit attribution
- The Raw Log entries are reasonable shape
- Granola/Outlook scans pick up today's signal

If anything's off, **stop** — don't let a misconfigured run sit overnight. Re-check the `personal_notion` token's workspace association.

---

## Step 3 — Personal Claude account bridge (10 min)

So your **personal Claude account** can read the portfolio for CV / cover letter / interview prep / LinkedIn updates:

### 3a. Personal Claude project setup

In your personal Claude account (not the @agriprove.io one):

1. New Project → name it "Career Portfolio"
2. Project instructions (paste):

```
This project is for career-related work: CVs, cover letters, LinkedIn updates, interview prep, remuneration discussions.

Source of truth: my personal Notion page "Dylan Cronje — Professional & Personal Summary" (https://www.notion.so/Dylan-Cronje-Professional-Personal-Summary-3288c08eb28f81378a20f1a9913dcd27).

Read from there via the Notion MCP. Do not assume any career information not on that page. If asked about specific work, customers, metrics, or internals that aren't on the Portfolio sub-page, say so — don't fabricate.

When drafting external-facing artifacts (CV, LinkedIn, cover letter, interview answer), pull only from the Portfolio sub-page (sanitised). Never quote from Raw Log, Counter-Evidence Annex, Comp Benchmark Annex, or Confidentiality Canary List — those are private and never appear in external artifacts.

Voice: direct, opinionated, accurate. No flattery. Quantify where possible (ratios and percentages, not absolutes).

Confidentiality: if I ask you to include specific customer names, internal product code names not in public marketing, or absolute revenue / ACCU / hectare numbers, refuse and explain — those have been deliberately sanitised out and re-introducing them would breach the architecture.
```

### 3b. Personal Claude → Notion MCP

In the personal Claude project → Settings → Connectors → Notion → connect using your personal Notion account. Grant access to the "Dylan Cronje — Professional & Personal Summary" page only (not your entire workspace).

### 3c. Smoke test

Ask the personal Claude project:

> Pull the latest 5 Track Record entries from my Portfolio sub-page and shape them into LinkedIn About-section bullets.

Expected: it reads from Notion via MCP, sanitised-only content, no fabrication. If it tries to read from Raw Log or Counter-Evidence, the project instructions are wrong — fix.

---

## Step 4 — Confidentiality canary list (5 min, anytime in first week)

In your personal Notion, populate the **Confidentiality Canary List** sub-page (private):

- Customer names you've handled (one per line)
- Internal product code names not in public marketing
- Specific revenue / ACCU / hectare numbers you don't want quoted
- Initiative code names not yet announced
- Named individuals beyond standard public-facing leaders (CEO, COO, CTO are typically OK to name in context; private investors / customers / partners are not)
- Methodology specifics that are AgriProve trade secret

This is your fail-closed reference. Apex Task 2 greps the Portfolio against this list weekly. Any hit → flagged for your explicit review, not auto-promoted.

---

## What lives where — summary

| Surface | Holds | Token / access |
|---|---|---|
| This repo (AgriProve-adjacent) | Protocol + Apex prompt specs only. No career data. | AgriProve git |
| Cowork (personal Windows machine) | Apex runs, orchestrates capture | Cowork session, both Notion tokens |
| Personal Notion | Raw Log, Portfolio, Skills, Comp, Counter-Evidence, Public Artifacts, Compliance, Canary | Personal Notion account only |
| Personal Claude account | Reads Portfolio for CV / LinkedIn / interview prep | Personal Notion MCP token, scoped to Portfolio sub-page only |

---

## Innovation additions baked in

- **STAR format** at capture, so Raw Log entries are already interview-shaped
- **Skill graph** auto-derived from Portfolio entries (LinkedIn skills feed)
- **Comp benchmarking** flags scope expansions and prompts re-benchmark with market data
- **Public artifacts log** captures URLs you'd otherwise forget (talks, podcasts, blog)
- **Counter-evidence private annex** for honest interview prep on weaknesses — never published, never read by personal Claude
- **Quarterly narrative arc** that builds the through-line story for CVs and senior interviews
- **Confidentiality canary** as a fail-closed backstop on top of sanitisation
- **Compliance page in Notion** as the authoritative alignment record — share-ready if HR/Legal ever ask

---

## Activation checklist (in order — Step 0 is blocking)

0. [ ] **Compliance assessment signed off** (`./2026-05-11-career-portfolio-compliance-assessment.md` and corresponding Notion sub-page)
1. [ ] Step 1a-c — Notion personal workspace prep
2. [ ] Step 2a-c — Cowork tasks created and first run verified
3. [ ] Step 3a-c — Personal Claude project bridged
4. [ ] Step 4 — Confidentiality canary list populated

Total time: ~50 min one-off (excluding Step 0 policy review).

If Step 0 surfaces a blocker (e.g., AI Usage Policy prohibits this Claude/Apex flow): pause, escalate to AgriProve People / Legal, document outcome in the compliance Notion page.
