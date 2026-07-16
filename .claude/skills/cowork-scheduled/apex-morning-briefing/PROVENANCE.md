# Provenance — apex-morning-briefing

## Pull

- **Domain:** Apex / Personal PM
- **Pulled from:** `…\local-agent-mode-sessions\…\local_9ec5094f-78d3-4e2f-b160-b105df452f81\uploads\SKILL.md`
- **Pulled on:** 2026-05-20
- **Snapshot date:** 2026-05-20 (most recent of the 7 — fired today)
- **Size:** 16,309 bytes
- **Pull reason:** Tier 0 — Cowork scheduled-task prompts brought into repo as canonical source of truth.

## Verification status

- [x] **Proof-by-execution:** This is the SKILL.md that Cowork's session uploaded into its working directory at run time. The most recent invocation was 2026-05-20.
- [ ] **Diff against canonical task_prompt** — not feasible from Claude Code (cross-surface limit). Trust-but-verify on next deploy.

## 2026-05-22 patch batch 1 — applied to repo, NOT yet deployed to Cowork

Source: Dylan flagged 2026-05-22 that Apex was missing Teams channel signal (the richest data source for task accuracy). Investigation confirmed Step 4 used `chat_message_search` which is DM-only and silently returns zero results for channel posts.

1. ✅ **Step 4 rewritten — replace `chat_message_search` with `read_resource` per channel URI.** All 4 Operation Stormboy channels + all 6 Product Team channels enumerated inline. DMs still use `chat_message_search` (correct for DMs). Reference: `memory/integrations/cowork/apex-data-sources.md`.

Source contract: `memory/integrations/cowork/apex-data-sources.md` (canonical channel inventory).

Companion patches:
- `apex-eod-reconciliation/SKILL.md` Step 2c — same fix
- `memory/learnings/2026-05/2026-05-22-apex-teams-blind.md` — discovery + impact

## Deploy history

| Date | Change | Deployer | Verified by |
|------|--------|----------|-------------|
| _(none yet — pending Prompt G deploy via Cowork)_ | | | |

## 2026-07-16 — repo patch: OS-rebuild override block (DEPLOY PENDING)
- Appended "SYSTEM UPDATE 2026-07-16" override: kernel reads (core/ + state/), yesterday-EOD read-back, freshness sweep, inbox/sweep warnings, simplified dual-stack output model.
- NOTE: the 2026-05-22 read_resource Teams patch is ALSO still undeployed. Next deploy ships both. Deploy per core/PROTOCOLS.md §Deploys (strip frontmatter; verify body diff; record here).
- Patched by: claude-code (Fable 5), Dylan-approved rebuild session.
