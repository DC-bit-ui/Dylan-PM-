---
date: 2026-05-20
source: Prompt A deploy of daily-enrichment-pipeline patch batch 1 (Cowork session zealous-fervent-meitner)
tags: [cowork, scheduled-tasks, deploy, mcp]
---

# Cowork task_prompt deploys must strip YAML frontmatter

## The trap

The repo's `.claude/skills/cowork-scheduled/<task>/SKILL.md` files include leading YAML frontmatter:

```yaml
---
name: <task-name>
description: <one-line description>
---
```

When deploying back to Cowork via `mcp__scheduled-tasks__update_scheduled_task`, **Cowork auto-prepends frontmatter from its own task metadata**. Sending the full file (including frontmatter) produces a **doubled frontmatter block** in the runtime SKILL.md — broken state.

## What Cowork does

Cowork stores task metadata (`name`, `description`, `cronExpression`, etc.) separately from `task_prompt`. At runtime, when materialising `uploads/SKILL.md`, it serialises the metadata as YAML frontmatter and concatenates with `task_prompt`.

So `task_prompt` should be **body only**, no frontmatter.

## Symptoms of getting this wrong

Cowork's deploy diagnostic for daily-enrichment-pipeline (2026-05-20):
> "Required two `update_scheduled_task` calls — first attempt left leading YAML frontmatter in the prompt and produced doubled frontmatter (Cowork auto-prepends from task metadata); second attempt sent body-only and byte-matched the repo."

## How to do it correctly

In any Cowork deploy prompt, instruct the deployer to:
1. Read the repo SKILL.md
2. **Strip the leading `---\n...\n---\n` block** (everything from the first `---` to the second `---`, inclusive, plus any trailing blank line)
3. Send the remaining body as the `task_prompt` parameter
4. After deploy, the next `uploads/SKILL.md` will have one frontmatter block (Cowork's serialised metadata) + the body — matching the repo file exactly

## Verification

Post-deploy, the runtime SHA256 of the materialised SKILL.md should byte-match the repo file. If the repo file has frontmatter that matches Cowork's auto-prepended frontmatter, this works. If the YAML differs (e.g., field order or quoting), the post-deploy file won't byte-match even though it's semantically correct.

Pragmatic rule: post-deploy verification should diff the **body** (everything after the second `---`), not the full file.

## Update to the standing convention

Update `.claude/skills/cowork-scheduled/README.md` to note the frontmatter-stripping rule. Update every deploy prompt template (e.g. Prompt A used in 2026-05-20) to include the strip step explicitly.

## Related

- `.claude/skills/cowork-scheduled/daily-enrichment-pipeline/PROVENANCE.md` — deploy log noting the two-call sequence
- `memory/learnings/2026-05/2026-05-20-cowork-uploads-snapshot-semantics.md` — companion learning on uploads/ snapshot semantics
