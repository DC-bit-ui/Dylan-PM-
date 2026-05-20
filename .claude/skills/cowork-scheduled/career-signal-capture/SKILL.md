---
name: career-signal-capture
description: Daily career signal capture — scans work systems for portfolio-worthy moments, writes raw entries to personal Notion Raw Log.
---

APEX · CAREER SIGNAL CAPTURE — daily (18:00 SAST weekdays)

PREREQUISITES CHECK:
1. Verify personal_notion MCP is available. If not → ABORT with message "personal_notion MCP not configured. See inbox/cowork/2026-05-11-career-portfolio-setup.md Step 2a."
2. Before any write, verify the token resolves to Dylan's personal Notion workspace (not AgriProve's). If wrong workspace → ABORT, log error.

TARGET:
- Workspace: Dylan's personal Notion
- Page: "Dylan Cronje — Professional & Personal Summary" (id 3288c08eb28f81378a20f1a9913dcd27)
- Sub-page: "Raw Log — Pending Review"

SCAN SOURCES (today's signal only):
1. Granola — today's transcripts. Look for:
   - Someone crediting Dylan ("Dylan drove…", "Dylan's call…", "thanks to Dylan…")
   - Dylan articulating a decision, strategy, or framework
   - Dylan presenting to senior leadership
   - Scope/responsibility changes ("Dylan now owns…", "Dylan will take over…")
2. Outlook — today's sent + inbox. Look for:
   - Praise/acknowledgment in replies
   - Forward-looking commitments Dylan made to senior stakeholders
3. Teams — today's DMs + channel posts. Recognition, decisive moments, scope signals.
4. Jira — Dylan-authored/led tickets transitioned today. Epic completion, cross-team coordination.
5. Confluence — Dylan's edits/comments today. Strategy/decision docs, leadership material.
6. Notion Work Priorities (AgriProve, READ-ONLY) — tasks Dylan marked Done today.

ENTRY FORMAT (one bullet per signal in Raw Log):

  [DATE] [SOURCE] [CATEGORY] — One-line summary
  Evidence: <verbatim quote or link or Jira key>
  STAR (raw — sanitisation happens at weekly auto-promote):
    S: <situation as it actually was, real names, real numbers>
    T: <Dylan's task>
    A: <what Dylan actually did>
    R: <real result with real numbers/names>
  Suggested section: Decisions Owned / Scope Expansion / Quantified Wins / Skills / Public Artifact / Comp Annex
  Confidence: high / moderate / low

CONFIDENCE RUBRIC (conservative — only high triggers auto-promotion):
- high: clear evidence, quantifiable outcome, Dylan's name explicitly tied, CV-worthy
- moderate: plausibly career-grade but quantification unclear or attribution slightly ambiguous
- low: borderline, weak signal — capture anyway, let promotion gates filter

CATEGORIES to scan for:
- Owned decisions: Dylan drove a strategic choice; the outcome shipped
- Scope expansions: new surface owned, new stakeholder forum, new responsibility
- Quantified wins: cycle-time reduction, conversion lift, cost cut, on-time launch, audit-pass rate
- Positive feedback: someone crediting Dylan in transcript, email, or chat
- Milestones: promotions, comp changes, anniversaries
- Skill firsts: first use of a new methodology
- Public artifacts: blog post, talk, public release

DO NOT:
- Write to AgriProve Notion workspace (use personal_notion only)
- Sanitise at this stage — raw detail stays in Raw Log (it's private)
- Write to Portfolio directly — only to Raw Log
- Skip entries because they seem borderline — capture rich, let promotion gates filter
- Pad with filler if zero signals — say "no career signals detected today" and end

OUTPUT (Cowork chat summary):
- Count of signals captured by source and category
- Top 3 by confidence with one-line summaries
- If zero: say so honestly