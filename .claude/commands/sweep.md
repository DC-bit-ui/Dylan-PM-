---
description: On-demand system hygiene sweep (indexes, freshness, rules graduation, packs)
---

Run the OS hygiene sweep per the rebuilt maintenance model (memory/decisions/2026-07-16-os-rebuild.md §5):

1. REGENERATE INDEXES in full: memory/decisions/INDEX.md and memory/initiatives/INDEX.md (list every file, one line each; verify epic statuses live in Jira if available). Policy: core/PROTOCOLS.md §Naming.
2. FRESHNESS SWEEP: list every file in memory/state/, memory/business/, memory/initiatives/, memory/integrations/ past its Review-by date. Verify via connectors what you can (update headers); report the rest as "needs Dylan".
3. RULES GRADUATION: for entries in memory/state/rules.md older than 30 days — propose folding stable ones into core/PRINCIPLES.md via a Tier 2 PR (branch cowork/sweep-<date>); mark superseded ones with forward links.
4. DUPLICATION CHECK: spot-check the canonical-source table (core/MAP.md §2) — grep for epic lists, schedules, or ownership claims outside their canonical file; fix (pointer-ise) or flag.
5. PACK STALENESS: if packs/chat-core.md is stamped >14 days ago, regenerate per playbooks/pack-regen.md.
6. INBOX: confirm inbox/cowork/ is being archived (inbox/processed/<month>/ growing); flag if not.
7. Update memory/state/last-sweep.md to today. Write a short sweep report to memory/retros/session/<YYYY-MM-DD>-sweep.md. Commit (Tier 1).
