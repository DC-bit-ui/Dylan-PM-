# Cowork Policy Review Task — paste into a fresh Cowork thread

**For:** Dylan to run in Cowork (on the personal Windows machine, which has filesystem access to the AgriProve policies folder).

**Purpose:** Pre-fill the 14 policy citations in the career portfolio compliance assessment. Replaces manual gathering of policy citations.

**Inputs:**
- Policies folder: `C:\Users\DylanCronje\AgriProve\AgriProve - Documents\SHARED AP\Admin\Policies`
- SharePoint URL (for reference): https://agriprove.sharepoint.com/:f:/g/IgCWX7m2GkPdQoLYQeN7WoBWAXHEF0Mz1c8q1KC5mJC5rGI?e=qIiAEv
- Compliance assessment template: [`./2026-05-11-career-portfolio-compliance-assessment.md`](./2026-05-11-career-portfolio-compliance-assessment.md)

**Output:** Populated draft of the compliance assessment, written to a Notion sub-page under "Dylan Cronje — Professional & Personal Summary" named **"Knowledge-Sharing Compliance — Cowork Draft"** (NOT the canonical sub-page — Dylan reviews and copies-into-canonical after edits).

**Critical:** this task READS from AgriProve filesystem and WRITES to Dylan's personal Notion. Verify `personal_notion` MCP token before any write.

---

## Prompt body (paste verbatim into Cowork fresh thread)

```
CAREER PORTFOLIO — COMPLIANCE PRE-FILL TASK

You are pre-filling the policy citations for the career-portfolio compliance assessment. The assessment template lives in this repo at inbox/cowork/2026-05-11-career-portfolio-compliance-assessment.md (you can read it via filesystem). The pre-filled draft goes to Dylan's PERSONAL Notion (NOT AgriProve Notion).

STEP 1 — VERIFY ACCESS

1a. Filesystem access:
   - Path: C:\Users\DylanCronje\AgriProve\AgriProve - Documents\SHARED AP\Admin\Policies
   - List all files (recursively). Report count and structure.
   - If access fails: ABORT, log to inbox/cowork/<date>-policy-review-error.md, surface the error to Dylan.

1b. Personal Notion MCP access:
   - Use personal_notion MCP server
   - Verify token resolves to Dylan's personal email (NOT @agriprove.io)
   - If wrong workspace: ABORT, log error.

1c. Verify the target page exists:
   - Page: "Dylan Cronje — Professional & Personal Summary"
   - Page ID: 3288c08eb28f81378a20f1a9913dcd27
   - If missing: ABORT and ask Dylan to create the page first.

STEP 2 — READ POLICIES

For each file in the policies folder:
- Read the full content
- Identify the policy type (employment / NDA / AUP / data classification / AI / InfoSec / external comms / social media / privacy / customer contract / Schedule 2 / trade secret / code of conduct / insider info / OTHER)
- Extract:
  - Policy name and version/date
  - Sections relevant to: data use, personal use of company systems, AI tools, external communications, employee IP, confidentiality scope
  - Verbatim quotes of the clauses that touch the career-portfolio architecture

Note: some files may be irrelevant (e.g., health & safety policy). Skip them but note in the output.

STEP 3 — MAP TO 14 CATEGORIES

The compliance assessment has 14 policy categories. For each:

1. Employment contract — IP assignment clause
2. Confidentiality agreement / NDA
3. Acceptable Use Policy (AUP) — IT systems
4. Data Classification Policy
5. AI / GenAI Usage Policy
6. Information Security Policy
7. External Communications Policy
8. Social Media Policy
9. Australian Privacy Act 1988 (general — not AgriProve doc; reference statute)
10. Customer contract obligations (LawrieCo and others)
11. Schedule 2 / Clean Energy Regulator obligations
12. Trade secret protection (common law — not AgriProve doc; reference principle)
13. Code of Conduct / Professional Conduct
14. Insider information / market-sensitive

For each category, populate:
- Policy citation: AgriProve document name + section + effective date (or "NOT FOUND in policies folder" if no AgriProve doc covers this category)
- Relevant text: verbatim quote of the most relevant clause(s)
- Alignment: 2-3 sentence analysis of how the career-portfolio architecture aligns (or doesn't) with this clause. Reference the architectural commitments table in the assessment template.
- Residual risk: anything that's not cleanly covered by the architecture's commitments
- Suggested decision: Proceed / Modify / Escalate (your recommendation; Dylan makes the final call)

If no AgriProve policy covers a category, say so explicitly and reference applicable law (e.g., Privacy Act 1988 for category 9, common law for category 12).

STEP 4 — WRITE THE DRAFT

Create or update Notion sub-page:
- Parent: "Dylan Cronje — Professional & Personal Summary" (3288c08eb28f81378a20f1a9913dcd27)
- Name: "Knowledge-Sharing Compliance — Cowork Draft"
- Body: full content of the compliance assessment template with all [PRE-FILLED] placeholders replaced by your findings.

IMPORTANT — do NOT write to the canonical "Knowledge-Sharing Compliance" sub-page if one exists. The Cowork Draft is a separate sub-page; Dylan reviews and copies edits into the canonical.

STEP 5 — OUTPUT SUMMARY

In Cowork chat, report:
- Files read: count, list of names
- Policies mapped to which categories
- Categories with NO AgriProve doc (Dylan needs to know which categories rely on statute or common law only)
- Your suggested decisions: count of Proceed / Modify / Escalate
- Items you flagged for high-priority Dylan attention (especially AUP and AI Usage Policy)
- Link to the Notion draft sub-page

STEP 6 — BACKUP

Also write a markdown snapshot to:
  inbox/cowork/<date>-policy-review-draft.md

This is the audit trail — the Notion draft can be edited; the markdown snapshot preserves your initial analysis verbatim.

DO NOT:
- Write to the canonical Knowledge-Sharing Compliance sub-page — only the Cowork Draft sub-page
- Modify any policy files
- Send any AgriProve policy text to external systems beyond personal Notion
- Skip categories that have no AgriProve doc — still populate them with statute/principle reference
- Make decisions on Dylan's behalf — your decisions in Step 3 are recommendations only

HANDLE FAILURE GRACEFULLY:
- If filesystem access fails: surface clearly, suggest Dylan re-syncs the SharePoint folder locally
- If personal_notion write fails: still produce the markdown snapshot in inbox/cowork/, so the analysis isn't lost
- If a policy file is unreadable (encrypted, corrupted, restricted format): list it as "unreadable" and continue
```

---

## Expected duration

- 5-10 min if the policies folder is well-organised (~10-20 files)
- 15-30 min if many policies or deeply nested folders
- Cowork may need to be prompted to continue if it pauses partway through reading the folder

---

## What Dylan does after Cowork runs this task

1. Open the Notion "Knowledge-Sharing Compliance — Cowork Draft" sub-page
2. Review each of the 14 categories. Edit any citations Cowork got wrong.
3. For each, make the final decision: Proceed / Modify / Escalate
4. Copy the final content into the canonical "Knowledge-Sharing Compliance" sub-page
5. Sign the bottom row of the sign-off table
6. The activation gate is now closed; proceed to Steps 1-4 of the setup walkthrough

---

## Risk: SharePoint files may not be locally synced

If the SharePoint folder is OneDrive-synced (cloud-only mode), Cowork's filesystem access may show file names but not contents. Check by trying to read a small file first.

If cloud-only:
- Option A: Right-click the policies folder in Windows Explorer → "Always keep on this device" → wait for sync → retry
- Option B: Manually download each file Cowork needs and place in a local folder; update the task's path input

---

## Re-running

If AgriProve updates a policy:
1. Trigger this task again
2. Cowork writes a fresh draft to a new sub-page "Knowledge-Sharing Compliance — Cowork Draft (re-run YYYY-MM-DD)"
3. Dylan diffs against the canonical, updates citations, re-signs
4. The Apex flows continue running — only the sign-off date in the canonical needs updating, unless a policy change requires architectural changes
