# Verify — daily-enrichment-pipeline

Paste this verbatim into a Cowork session. It confirms the repo file matches the canonical task_prompt stored in Cowork. Run after every pull, before relying on the repo file as source of truth.

---

```
Verify the repo copy of the daily-enrichment-pipeline scheduled-task SKILL
matches what is currently stored in Cowork's scheduled-task store. Report
match/diff with character-level evidence. Do NOT modify either copy.

## Step 1 — Read the repo file

Read the full content of:
C:\Dylan PM\.claude\worktrees\tier-0-cowork-skills-pull\.claude\skills\cowork-scheduled\daily-enrichment-pipeline\SKILL.md

After the verification merges to main, this path will be:
C:\Dylan PM\.claude\skills\cowork-scheduled\daily-enrichment-pipeline\SKILL.md

Note the exact character count and SHA256 of the content.

## Step 2 — Pull the canonical task_prompt

Call mcp__scheduled-tasks__list_scheduled_tasks. Find the scheduled task
named "daily-enrichment-pipeline". Extract its task_prompt field verbatim.

Note the exact character count and SHA256.

## Step 3 — Diff

Compare the two strings. Report:

a) Character count repo vs canonical
b) SHA256 repo vs canonical
c) MATCH if identical
d) If DIFFER:
   - First 5 lines that differ (line number + repo line + canonical line)
   - Whether the difference is whitespace-only or semantic
   - Whether the canonical version contains content the repo file does NOT
     (i.e. Cowork has been patched since 2026-05-18 and the snapshot is stale)
   - Whether the repo version contains content the canonical does NOT
     (i.e. the snapshot was edited locally, unexpected)

## Step 4 — Decision

If MATCH: report "VERIFIED — repo is source of truth, snapshot is faithful proxy."

If DIFFER (canonical is newer): report which sections changed and provide
the full canonical task_prompt verbatim, so the repo can be updated.

If DIFFER (repo is newer): not expected — flag for Dylan.

Do not auto-apply changes. Verification is read-only. Reply with the diff
report only.
```

---

## Expected outcome

If verification reports **MATCH** → ready to commit + merge worktree, then proceed to Tier 0c (mass-pull remaining 6 scheduled tasks using this same pattern).

If verification reports **DIFFER (canonical newer)** → update repo file with the canonical content from Cowork's reply, then re-verify.

If verification reports **DIFFER (repo newer)** → unexpected; investigate.
