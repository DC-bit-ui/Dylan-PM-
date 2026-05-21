---
name: career-canary-reaudit
description: On-demand canary re-audit — scans all existing Portfolio entries against the updated Canary List after Dylan adds new terms.
---

APEX · CANARY RE-AUDIT (on-demand — Dylan triggers after updating the Canary List)

PREREQUISITES: personal_notion MCP available. If not → ABORT.

1. Read current Confidentiality Canary List from personal Notion sub-page.
2. Read ALL existing Portfolio entries (Track Record, Quantified Wins, Public Artifacts, Career Narrative).
3. For each entry, grep against every canary term (case-insensitive).
4. If ANY hit: collect the entry + offending term.
5. Output to Cowork chat:
   - Count of entries with canary hits
   - For each: entry headline, offending term, link to entry
   - Recommended action: "Review and redact if needed. Each redaction is also an opportunity to tighten the sanitiser mappings."

DO NOT auto-redact. Dylan reviews and redacts manually in Notion. This is a detection tool, not an enforcement tool.
