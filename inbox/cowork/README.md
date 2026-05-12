# inbox/cowork/

Landing zone for ad-hoc drops from claude.ai web, Claude mobile, and Cowork session summaries. Read by `/inbox-process` (Apex Morning Briefing or on demand) — durable insights routed to `memory/`, ephemeral drops archived to `inbox/processed/`.

**Format:** drops should follow the capture template in `playbooks/multi-surface-capture.md`. Filename: `<YYYY-MM-DD>-<topic-slug>.md`.

**Empty is healthy.** This directory should empty out as `/inbox-process` runs. If it's accumulating, either the seam is busy (good signal — capture discipline working) or processing has stalled (check Apex).

See:
- Decision: [`memory/decisions/2026-04-28-multi-surface-strategy.md`](../../memory/decisions/2026-04-28-multi-surface-strategy.md)
- Playbook: [`playbooks/multi-surface-capture.md`](../../playbooks/multi-surface-capture.md)
- Skill: [`.claude/skills/inbox-process/SKILL.md`](../../.claude/skills/inbox-process/SKILL.md)
