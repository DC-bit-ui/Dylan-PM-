# PROTOCOLS — Operational procedures

Last-verified: 2026-07-16 · Review-by: 2026-10-16 · Verified-by: claude-code
**Write tier: 2 — changes via PR.** Written for the least capable model that might ever load this system: numbered steps, exact paths, no inference required.

Load this file before: any write to this folder, any capture, any reconciliation, any scheduled run, any deploy, any pack regeneration.

---

## §Freshness

Files in `memory/state/`, `memory/business/`, `memory/initiatives/`, `memory/integrations/` begin with:

```
Last-verified: YYYY-MM-DD
Review-by: YYYY-MM-DD
Verified-by: dylan | apex | claude-code
```

Procedure when reading such a file:
1. Compare today's date to `Review-by`.
2. If today ≤ Review-by: use the file normally.
3. If today > Review-by: (a) prefix every fact taken from it with `[STALE — unverified since <Last-verified>]`; (b) do not present those facts as current; (c) if a connector can verify a fact, verify it, then update the fact AND the header (this is a Tier 1 write); (d) if you cannot verify, add one line to your output: `Stale file needs review: <path>`.

Procedure when updating any such file: set `Last-verified` to today, set `Review-by` per the file's cadence (state/NOW.md: +30 days; business/, integrations/: +90 days; initiatives/: +45 days), set `Verified-by` to who you are.

## §Connector-first

Before asking Dylan for a fact, query the system that holds it. Contracts with exact tool names and gotchas: `memory/integrations/<connector>.md`.

| Need | Query | Note |
|---|---|---|
| Person, role, last interaction | Teams / Outlook / Granola / HubSpot | |
| Meeting time, attendees, booked? | Outlook calendar | |
| Teams content | **Channels: `read_resource` with `teams:///teams/{groupId}/channels/{channelId}/messages/`** then filter by `createdDateTime`. DMs only: `chat_message_search`. `chat_message_search` returns empty for channels WITHOUT error — empty ≠ nothing happened | rules.md 2026-05-22 |
| Ticket status / comments | Jira JQL | Verify created-issue descriptions render (rules.md 2026-07-08) |
| Doc existence / content / edits | Confluence | |
| Email thread / sent proof | Outlook | Commercial-task completion signals live in sent items (rules.md 2026-05-22) |
| Transcript / commitment | Granola | |
| Customer / deal | HubSpot | |
| Dylan's tasks | Notion | |

Ask Dylan only when: (a) connector unavailable, (b) returns nothing after a correct query, (c) the question needs his judgement (preference, intent, tone).

## §Reconciliation (run before surfacing any task as open — /focus, /standup, briefings, status updates)

For each candidate open task:
1. Infer the completion signal from the task pattern: "book meeting with X" → Outlook calendar invite to X after task creation · "reply/email X" → Outlook sent items · "message X" → Teams outbound (check CHANNELS too) · "review doc" → Confluence comment/edit by Dylan · "update AP-NNNN" → Jira comment/transition by Dylan · "follow up with X on Y" → any outbound referencing Y · "read/digest X" → no reliable signal, leave open, flag ambiguous.
2. Query the signal. Categorise: ✅ **Done-ack** (signal found, post-creation) → recommend mark done with system + timestamp + link · 🟡 **Still-open** → keep, prioritise · ❓ **Ambiguous** (unverifiable — e.g. sign-off likely happened in a Teams channel you cannot confirm) → flag for Dylan, never escalate to P0 on Jira state alone · 🔍 **Missing** (Granola commitment with no task) → propose adding.
3. Availability check: if a task is blocked on a person's known leave/travel, it is *blocked*, not slipping.
4. Auto-mark done only when the signal is unambiguous, timestamped, post-creation, in the right system. Default is read-only recommendation.

## §Writes — tiered protocol

### Routing table (what goes where)

| You captured | Write to | Tier |
|---|---|---|
| A rule Dylan expects to apply going forward | `memory/state/rules.md` (append entry: date, rule, source) | 1 |
| A decision (explicit or clearly implied, durable) | `memory/decisions/YYYY-MM-DD-<slug>.md` + regenerate INDEX | 1 |
| Current-state change (strategy, epic status, org, schedule) | `memory/state/NOW.md` — update the section AND its `As-of` date | 1 |
| Meeting synthesis / event / observation | `memory/learnings/<YYYY-MM>/YYYY-MM-DD-<slug>.md` | 1 |
| New person | `memory/people/roster.md` (connector-first for full name/role before writing) | 1 |
| New term | `memory/business/glossary.md` | 1 |
| Epic detail change | `memory/initiatives/<key>.md` status block + dated changelog line | 1 |
| EOD run record | `memory/retros/session/YYYY-MM-DD-<slug>.md` | 1 |
| Deliverable | `memory/deliverables/<subdir>/` — never at deliverables/ root | 1 |
| Rule graduation, protocol/contract/template/skill/scheduled-prompt change | the target file, via branch `cowork/<slug>` + PR | 2 |
| core/IDENTITY.md, .claude/agents/, packs/ | DO NOT WRITE — journal the case (Tier 1) | 3 |

### Capture triggers (judgment, not keywords)

Capture immediately when Dylan: states a preference about how he works · corrects a fact, term, or framing · articulates a forward rule ("from now on", "always", "never") · introduces a new term/person/product · says "remember this" / "save this" · repeats the same correction twice. The trigger is "Dylan expects this to stick". Ambiguous → capture with `[moderate]` + "supersede if corrected". Do NOT capture speculation, brainstorming, or venting with no rule attached.

### Universal write rules

Append, don't overwrite · date-stamp every entry · cite the source signal (meeting/thread/ticket/email link) · cross-link with relative paths · confidence markers · supersede with forward links, never delete.

### Confirmation (after every successful write)

> ✅ Captured: `<path>` — "<one-line summary>" — commit `<sha>` (Tier 1) / PR `<url>` (Tier 2)

### No-silent-fallback (when a write fails)

The filesystem under this folder is the ONLY memory. Never fall back to Claude.ai built-in memory, a parallel folder, or a chat attachment. On failure, report exactly:

> ❗ Memory write failed.
> Path: `<full path>` · Capture: `<one-line summary>`
> Tool: `<tool>` — Error: `<verbatim error>`
> **No fallback created.** Likely causes: read-only mount, folder access needs re-granting (Cowork → Project → Settings), or parent directory missing.
> Resolve and ask me to retry.

## §Naming & indexes

- Dated files: `YYYY-MM-DD-<kebab-slug>.md`. The directory listing IS the primary index.
- Hand-maintained INDEX.md files are abolished except: `memory/decisions/INDEX.md` and `memory/initiatives/INDEX.md` — both **regenerated in full** (never hand-appended) by `/sweep` or whenever you add a file there. Regenerate = list every file in the directory with a one-line summary; if you cannot regenerate completely, do not touch it.
- A "last sweep" marker lives at `memory/state/last-sweep.md` (single line: `Last sweep: YYYY-MM-DD`). Morning briefings warn when it is >14 days old.

## §Git

- Tier 1 → commit directly to `main`, message `[cowork] <lowercase verb> <what>` (or `[claude-code]` from Claude Code), body cites the source signal. Tier 2 → branch `cowork/<slug>`, push, PR titled `[cowork] ...`.
- Stage only the files you changed (`git add <paths>`) — never `git add -A` (the folder contains unrelated dirty files).
- Push failure = network → retry ×4 with backoff (2s/4s/8s/16s). Push failure = HTTP 403 → do not retry; use GitHub MCP push if available, else leave committed locally and tell Dylan (rules.md 2026-05-11).
- Diverged from origin → `git fetch origin && git rebase origin/main`; if rebase fails, open a PR branch and let Dylan resolve. Never force-push.
- Mount hazard: the connected-folder mount can present truncated files. Read file content with the Read tool, not bash `cat`. After any commit, verify the blob: `git show HEAD:<path> | wc -l` matches the working file (rules.md 2026-05-21 cluster).

## §Deploys (Cowork scheduled tasks)

1. Edit `.claude/skills/cowork-scheduled/<task>/SKILL.md` in the repo. Never edit the prompt in Cowork chat.
2. Pre-flight: Read the full file; confirm it ends with its expected final line (mount-truncation check). If truncated: wait 30s, re-read once; still truncated → HALT and tell Dylan. Do NOT `git restore`.
3. Strip the YAML frontmatter block (`---` ... `---` + blank line); deploy body only via `mcp__scheduled-tasks__update_scheduled_task` (Cowork re-adds its own metadata; sending the full file doubles the frontmatter).
4. Verify post-deploy by diffing the returned prompt body against the file body.
5. Record in that task's `PROVENANCE.md`: date, change summary, deployer, verification result.
6. Cron times: Cowork interprets crons in **UTC**. SAST = UTC+2; AEST = UTC+10. Always write the intended SAST time in PROVENANCE next to the cron.

## §Inbox lifecycle (owned by Apex EOD, every run)

1. List `inbox/cowork/` and `inbox/granola/` files not yet processed.
2. For each: route durable content per §Writes routing table (most apex-morning briefs contain nothing durable beyond what the day's writes already captured — that's fine).
3. Move every processed file to `inbox/processed/<YYYY-MM>/` (same filename).
4. A file may stay unprocessed at most 7 days; the Morning Briefing warns at >20 unprocessed files.

## §End of session (any non-trivial session or scheduled run)

Answer four questions; each produces a write or an explicit "nothing durable":
1. What did Dylan teach (correction/preference/rule)? → rules.md or journal.
2. What was decided? → decisions/.
3. Next concrete action — captured in Notion?
4. Did current-state change? → update NOW.md section + As-of date.

## §Regeneration (derivative files)

- `cowork/project-instructions.md`: the paste-source for Cowork → Project → Settings → Project Instructions. It deliberately restates ONLY bootstrap essentials (session-start list, hard rules, write-tier summary) and points to core/ for everything else. When core/ changes in a way that touches those essentials: update this file to match (Tier 2), bump its `Synced-with-core` date, and remind Dylan to re-paste into Cowork settings. Any other edit to it is a defect — the content belongs in core/.
- `packs/*.md`: pure derivatives for chat surfaces — never hand-edit. Regenerate per `playbooks/pack-regen.md` when core/ or state/NOW.md changes materially, or when a pack's stamp is >14 days old (Morning Briefing warns). Edits belong in core/ or state/, then regenerate.
