---
date: 2026-05-21
source: Cowork Prompt F v2 deploy session — daily-enrichment + weekly-system-retro provenance schema enforcement
tags: [cowork, scheduled-tasks, deploy, onedrive, infrastructure, pre-flight]
severity: high — silently corrupts deploys if pre-flight is skipped
related:
  - 2026-05-21-onedrive-git-contention.md
  - 2026-05-20-cowork-deploy-no-frontmatter.md
---

# OneDrive transiently truncates `.claude/skills/cowork-scheduled/*/SKILL.md` in the working tree — deploys must pre-flight-check sentinels

## The trap

`.claude/skills/cowork-scheduled/<task>/SKILL.md` files are the canonical source for Cowork scheduled-task prompts. Because `C:\Dylan PM\` is OneDrive-synced, these files are exposed to a **transient, self-healing truncation pattern**: a partial OneDrive write can leave the working-tree file ending mid-sentence (no closing newline, content from the tail missing) for a window of minutes-to-hours, after which OneDrive resyncs and the file is whole again.

`git show HEAD:<path>` returns the full file throughout the truncation window — only the working tree on disk is broken. A naive deploy (read working tree → strip frontmatter → push to Cowork via `update_scheduled_task`) will **silently push the truncated body** and overwrite the live scheduled task with a broken prompt.

## What happened on 2026-05-21 (incident #4 of the OneDrive contention pattern)

Cowork session received Prompt F v1: deploy provenance-schema patches to `daily-enrichment-pipeline` and `weekly-system-retro`. Read the repo files and computed body SHA256s. Both diverged from the user-cited canonical `ee5e575b...eb4661` (which on inspection turned out to be the post-batch-1 deployed SHA — instruction text was garbled). Bash inspection via `wc -lc` and `tail -c` revealed:

| File | Working tree | HEAD | Truncation |
|---|---|---|---|
| `daily-enrichment-pipeline/SKILL.md` | 417 lines / 20,114 bytes — ends `...Never write withou` | 444 lines / 22,978 bytes | ~27 lines lost (Rule 2 partial through Rule 18) |
| `weekly-system-retro/SKILL.md` | 84 lines / 4,204 bytes — ends `...probes_created={` | 115 lines / 5,809 bytes | ~31 lines lost (tail of Step 2 through Rules) |

Session halted before any `update_scheduled_task` call. Dylan reissued as Prompt F v2 with corrected canonical SHAs (HEAD body hashes, supplied directly: `52501623...69cdf` for daily-enrichment, `a7748d7c...031e8` for weekly-system-retro) AND added a **pre-flight sentinel check**: read each file, verify the last paragraph matches an expected sentinel string, retry once after a 30s OneDrive resync window if not.

v2 pre-flight ran. Files were still truncated 30s later. Session halted again — correctly — without deploying. No `git restore`, no `git checkout HEAD`, deferred to Dylan.

## The mitigation v2 introduced — the pre-flight sentinel check

**For every Cowork deploy prompt that reads from `C:\Dylan PM` and pushes to a scheduled task**, the prompt MUST include a Step 0 pre-flight that:

1. Reads the full file
2. Verifies it ends with the expected sentinel string (typically the last numbered rule + period + nothing after)
3. If absent: `sleep 30` and re-read once
4. If still absent: HALT and report — do **not** invoke `git restore` or `git checkout HEAD --`; defer to Dylan

This is cheap (one tail-of-file check + at most one 30s sleep) and catches the failure mode before it propagates into Cowork. It's strictly additive to the existing post-deploy SHA256 byte-match verification — the SHA verification would also catch a truncated deploy, but only AFTER the broken file was pushed to Cowork.

## The sentinels (record for future deploy prompts)

These are the verbatim end-of-file strings as of HEAD commit `b918409` (2026-05-21). Update them whenever the canonical changes.

**`daily-enrichment-pipeline/SKILL.md`** should end with:
> `18. **No hard-coded usernames** — the BUS_ROOT path must be resolved dynamically every run. Never embed \`DylanCronje\` or any username literal in file paths.`

**`weekly-system-retro/SKILL.md`** should end with:
> `6. **No hard-coded usernames** — BUS_ROOT resolved dynamically every run.`

Each ends with a closing period and a final newline. Working-tree truncations on this pattern have all ended mid-word with no closing punctuation — pre-flight can pass on a stricter check (last character `.` or `\n`).

## Why `git restore` is not the right reflex

It would work for THIS incident — HEAD is clean and the working tree is the only thing broken. But the symptom indicates active OneDrive contention on the file. Restoring inside the contention window can lose other in-flight edits the user has staged or unsaved. Defer to Dylan, who can:

1. Check OneDrive sync state in Explorer
2. Confirm no other editor / Cowork session has writes pending
3. Manually restore or wait for resync
4. Reissue the deploy when the working tree is clean

Cowork halting cleanly is the correct behaviour. Auto-recovery would mask a class of bugs we still don't fully understand.

## The bigger context

This is incident #4 of the OneDrive vs git contention pattern documented in `2026-05-21-onedrive-git-contention.md`. The other three:

1. `.git/index.lock` held by OneDrive — blocked Cowork commits 2026-05-20 and 2026-05-21
2. Working-tree `PROVENANCE.md` truncated to 1299 bytes vs HEAD's 2722 — Cowork worked around by `git show HEAD:` + atomic write
3. (now this — SKILL.md transient truncation on TWO files in one session)

The migration urgency for moving `C:\Dylan PM` off the OneDrive-synced path is now critical per that learning. Until then, every deploy prompt that reads from working tree needs the pre-flight sentinel check.

## Hard rules (this session forward)

1. **Every Cowork scheduled-task deploy prompt** MUST include a Step 0 sentinel pre-flight on every file it reads from `C:\Dylan PM`.
2. **The canonical reference in the deploy prompt** MUST be the HEAD body SHA256, not the previous deploy's runtime SHA. Mixing these (as v1 of this prompt did) creates confusing diff-check failures even when the working tree is fine.
3. **Halt > heal.** If pre-flight fails, halt the session and defer to Dylan. Do not invoke `git restore`, do not `git checkout HEAD --`, do not rebuild content from `git show HEAD:` unless explicitly authorised in the prompt.
4. **Post-deploy verification stays in place.** Post-deploy SHA256 byte-match remains the second line of defence even with pre-flight active.

## Open follow-ups

- Update the standing deploy-prompt template (wherever Apex / external sessions pull the deploy macro from) to bake in Step 0 sentinel pre-flight by default.
- Consider promoting "OneDrive transient truncation — pre-flight required" to `memory/profile/working-style.md` once the migration timeline is fixed, OR as a standing rule until then. Tier 2 PR when ready.
- Worth a Tier 2 PR after migration to **remove** the pre-flight if `C:\Dylan PM` moves off OneDrive — otherwise it's dead weight on every deploy.
