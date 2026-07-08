# Daily-enrichment: full-universe HubSpot pulls exceed Cowork harness output limits

**Date:** 2026-06-12 · **Source:** daily-enrichment-pipeline run 2026-06-12T03:06Z · **Confidence:** [high]

## What happened
Step 1 of the pipeline spec ("pull all active deals, paginate limit=200") returned ~94K chars per page — over the Cowork tool-result token ceiling. Result was diverted to a file with line lengths unreadable by Read. A 1,099-deal × 9-property sweep (6 pages) + 1,785-contact sweep (9 pages) is not executable as specified in an interactive Cowork session.

## What the run did instead (worked)
1. Diff-mode filtered queries: `notes_last_updated GT <last-run-epoch>` → 7 deals + 11 contacts, single page each.
2. Merged Step 1 + Step 2a into one query (same objectType, superset of properties).
3. Lazy contact/deal matching for swept artifacts instead of upfront universe maps — viable because diff-mode artifact volume is small (0-20/day).

## Second finding
The SKILL.md premise "the bash sandbox cannot reach BUS_ROOT" is false in current Cowork sessions — the SharePoint folder is mounted and bash tmp+rename works (used for all 30 writes this run). The Write-tool-only constraint can be relaxed when the mount resolves.

## Recommended patch (queue per edit-in-repo rule, §6.3 CLAUDE.md)
Update `.claude/skills/cowork-scheduled/daily-enrichment-pipeline/SKILL.md`: make diff-mode use recency-filtered HubSpot queries (not full-universe pagination), document the merged Step1+2 query, and note bash-mount availability for batch writes. Do NOT edit the Cowork task prompt directly.
