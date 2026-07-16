# RULES — Learned rules register

**Write tier: 1 — append-only.** Loaded every session (`core/MAP.md` §1).
New rules land here AT CAPTURE TIME (entry format below). `/sweep` graduates rules older than 30 days into `core/PRINCIPLES.md` (Tier 2 PR) or retires them with a supersede note. Never delete an entry; supersede with a forward link.

Entry format:
```
### YYYY-MM-DD — <short title>
**Rule:** <imperative, self-contained — executable without reading the source>
**Source:** <file / meeting / thread>
```

Seeded 2026-07-16 from the learnings corpus (rules flagged for promotion 2026-04→2026-07 that never graduated — see `memory/deliverables/system/2026-07-16-os-rebuild-changelog.md`).

---

### 2026-05-14 — Task attribution: Dylan only when he is the named actor
**Rule:** Do not create or surface a task as Dylan's unless he is explicitly the first-person actor ("I'll…") or named PM/delivery owner, or it is a PM artefact (PRD, brief, decision doc). Devs self-assign tickets — never task Dylan with assigning them; engineering deliverables mentioned in meetings default to the engineer closest to the work; Lightning Lane docs, Geoscape API access, SLT updates, and ops sends are owned by other functions.
**Source:** memory/learnings/2026-05/2026-05-14-apex-task-ownership-corrections.md + 2026-05-18 + 2026-05-22 (jira-assignment)

### 2026-05-22 — Commercial/vendor task completion lives in Outlook sent items
**Rule:** Before auto-cancelling or escalating a commercial/vendor-facing task (pricing, listings, proposals, supplier email), check Outlook sent items for a matching outbound email after task creation. Found → Done-ack, not cancel.
**Source:** memory/learnings/2026-05/2026-05-22-auto-cancel-check-commercial-tasks.md

### 2026-05-22 — Teams channels need read_resource; chat_message_search is DM-only
**Rule:** `chat_message_search` silently returns empty for channel posts (200 OK, no error). Read channels with `read_resource` on `teams:///teams/{groupId}/channels/{channelId}/messages/`, filter client-side by `createdDateTime`. Empty chat-search result ≠ nothing happened.
**Source:** memory/learnings/2026-05/2026-05-22-apex-teams-blind.md; memory/integrations/cowork/apex-data-sources.md

### 2026-06-26 — Never escalate to P0 on Jira state alone when sign-off may live in a channel
**Rule:** A ticket sitting in Code Review/Staging is not P0 evidence by itself when the sign-off path could be a Teams channel post. Corroborate with a second signal (Confluence, Outlook, Granola) or classify ❓ Ambiguous and say so: "Unable to verify sign-off via Teams channels. Escalating with low confidence — confirm with Dylan."
**Source:** memory/learnings/2026-06/2026-06-26-drawing-tool-false-escalation-teams-channel-blindspot.md

### 2026-07-06 — Availability-blocked ≠ slipping; stale Granola commitments are phantom-risk
**Rule:** A task blocked on someone's known leave/travel is blocked, not slipping — don't escalate it. A ~7-day-old Granola commitment with no Notion task is probably already done: check Teams channels (Product > Epics etc.) for completion signals before creating a task. The HORIZON workshop partner is "DROVER" (all caps), never "Drova".
**Source:** memory/learnings/2026-07/2026-07-06-drover-name-correction-and-reconciliation-signals.md

### 2026-05-01 — Verify side effects, not artefacts
**Rule:** A run succeeded only if state changed in the systems that consume its output (Notion / Jira / memory/). Legible-looking output with no durable consumer is a failed run. Memory captures must land at the canonical path or fail loudly — no parallel folders.
**Source:** memory/learnings/2026-05/2026-05-01-looks-like-work-anti-pattern.md

### 2026-05-20 — Scheduled-task deploys: strip frontmatter, send body only
**Rule:** When deploying a cowork-scheduled SKILL.md, strip the leading `---…---` YAML block and send only the body as task_prompt; verify by diffing the body. (Full deploy procedure: core/PROTOCOLS.md §Deploys.)
**Source:** memory/learnings/2026-05/2026-05-20-cowork-deploy-no-frontmatter.md

### 2026-05-21 — Mount/OneDrive can serve truncated files; verify reads and blobs
**Rule:** Read repo file content with the Read tool, never bash cat (mount can return truncated/stale views). Before deploying from a file, confirm it ends with its expected final line; if truncated, wait 30s, re-read once, then HALT (never `git restore` inside a contention window). After committing, verify `git show HEAD:<path> | wc -l` matches the working file.
**Source:** memory/learnings/2026-05/2026-05-21-skill-md-onedrive-truncation.md + 2026-05-21-onedrive-git-contention.md + 2026-07-08-mount-sync-truncated-git-blobs.md

### 2026-05-21 — Architecture claims cite code or carry [ASPIRATIONAL]
**Rule:** Every diagram arrow / schema / pipeline claim in memory/, skills, or shared-growth-memory/architecture must cite the implementing file (+ line range where reasonable) or be tagged [ASPIRATIONAL]/[TODO]. When reading such docs, treat uncited claims as aspirational.
**Source:** memory/learnings/2026-05/2026-05-21-architecture-diagram-vs-reality-drift.md

### 2026-05-11 — git push 403 = auth failure, not network; don't retry
**Rule:** On HTTP 403 from `git push`, stop retrying (backoff is for network errors only). Use GitHub MCP push if available, then realign local with fetch + reset; otherwise leave the commit local and tell Dylan.
**Source:** memory/learnings/2026-05/2026-05-11-git-push-403-workaround.md

### 2026-06-10 — Write every ticket/requirement for a zero-context reader
**Rule:** Tickets, requirements, PRDs, and epics drafted for Dylan must be self-contained: no "as we discussed", every assumption explicit, full technical context stated. Split work into tickets only after wireframes are reviewed.
**Source:** memory/learnings/2026-06/2026-06-10-ticket-quality-zero-context-rule.md

### 2026-06-15 — Customer copy: business days; separate operator concepts; no AI tells
**Rule:** Customer-facing turnaround promises use business days ("within 1 business day"), never clock hours — hour targets are internal SLAs. Customer sign-off concepts show only customer screens; internal-operator steps get their own operator concept. No em dashes or AI tells anywhere, including HTML `<title>` — spaced hyphens instead.
**Source:** memory/learnings/2026-06/2026-06-15-customer-copy-business-days-and-operator-concept-split.md

### 2026-06-15 — Proposals ship as a self-contained editorial HTML one-pager
**Rule:** For "write this up" / implementation-plan asks, produce a single self-contained HTML one-pager reusing the CSS of `2026-06-09-eih-implementation-plan.html` (system font, 880px, warm palette, .tldr box, numbered h2 sections, inline SVG flows colour-coded gray=existing/teal=new/amber=confirm, named-owners Roles paragraph). The formal PRD stays separate in Confluence.
**Source:** memory/learnings/2026-06/2026-06-15-proposal-implementation-plan-format-standard.md

### 2026-06-15 — Independent-research prompts carry zero prior hypothesis
**Rule:** Research commissions must contain no prior lean, favourite, or "hypothesis to verify" — state "independent, first-principles evaluation; no preferred option; let the evidence decide". Lead with external authoritative sources; internal systems only confirm/discredit.
**Source:** memory/learnings/2026-06/2026-06-15-independent-research-prompts-and-esri-tracing-correction.md

### 2026-06-15 — Map imagery is a swappable layer; tracing rights attach to imagery
**Rule:** Architect satellite imagery as a swappable raster layer, separate from map engine and draw library. Esri free tier does NOT license commercial boundary tracing; prefer CC-BY state aerial (e.g. NSW SIX Maps) as trace surface; Google/Mapbox satellite are not trace surfaces. Engine choice (MapLibre + Terra Draw + Turf) unaffected.
**Source:** memory/learnings/2026-06/2026-06-15-independent-research-prompts-and-esri-tracing-correction.md

### 2026-06-29 — Voice: short internal Teams notify posts
**Rule:** Open "{FirstName}," (no "Hey" needed for these), lead with the action + purpose in one first-person line, one bullet per item with the URL inline at the end of its own bullet, casual one-line summaries ("Reckon…", "can you confirm and close if so?").
**Source:** memory/learnings/2026-06/2026-06-29-teams-ticket-notify-message-voice.md

### 2026-06-29 — Voice: dev-handoff comms
**Rule:** Dev handoffs go by email with leads/devs Cc'd, not a lone Teams post. "Hey {first name}" for close team; "Hi" for external/formal. No enthusiasm preamble or emoji; open with kickoff callback + deliverable; hedge confident claims and invite testing ("I believe it's a lift, not a rebuild - let's see!"); spaced hyphens; include the Claude Design prototype link; attachments as short bullets with one-line purpose; close "Any questions at all, just shout."
**Source:** memory/learnings/2026-06/2026-06-29-dylan-voice-handoff-email-edits.md

### 2026-07-08 — Technically lightweight delivery; dev-handoff-ready outputs
**Rule:** Insight tools: no month-long timelines; design output as close to product as possible; scripts + implementation plan dev-handoff-ready; iterate existing Claude Design work when the concept is unchanged; pilots scope to zero new backend services; anything needing schema migration waits for pilot evidence.
**Source:** memory/learnings/2026-07/2026-07-08-technically-lightweight-delivery-principle.md

### 2026-07-08 — Recommendation surfaces fail closed; implementability is the gate
**Rule:** Farmer-facing spatial recommendations must be physically buildable and pass a named human review (e.g. Hobbs) before any farmer sees them. Constrain generation to buildable geometry; omit unbuildable options rather than render them. One unbuildable output costs the whole insight layer its credibility.
**Source:** memory/learnings/2026-07/2026-07-08-implementability-first-grazing-planner.md

### 2026-07-08 — Inspect Jira descriptions after createJiraIssue
**Rule:** `createJiraIssue` with markdown intermittently double-escapes newlines (literal `\n` in the ticket). Always inspect the returned description; if broken, re-set via `editJiraIssue` (markdown) or create with ADF.
**Source:** memory/learnings/2026-07/2026-07-08-jira-create-markdown-newline-escaping.md

### 2026-07-15 — External positioning: natural capital analytics, not soil carbon developer
**Rule:** In bank/institutional/external contexts describe AgriProve as a "natural capital analytics service provider" (measurement + risk-intelligence infrastructure). Never lead with "soil carbon developer/company" — credits are one output, not the identity. Internal product docs may still say "soil carbon measurement platform"; this rule governs outward positioning only.
**Source:** memory/learnings/2026-07/2026-07-15-agriprove-positioning-natural-capital-analytics.md

### 2026-04-29 — Briefing outputs: prefer visual rendering
**Rule:** For at-a-glance briefing content in interactive sessions, default to a rendered visual widget over dense markdown ("much easier to interact with and understand" — Dylan).
**Source:** memory/learnings/2026-04/2026-04-29-visual-artifact-preference.md

### 2026-07-16 — Apex workstack model: simplified dual-stack
**Rule:** Briefings surface Stack A (Mine, cap 3 — Dylan the named actor/delivery owner, ranked P0–P3 with due-date weighting) plus at most a one-line leverage watch ("N team items may benefit from PM input: <keys>"). No Stack B leverage scoring, no suppression rules. Supersedes both the full dual-stack spec (memory/decisions/2026-04-28-dual-stack-prioritisation.md) and the flat 4-bucket production format.
**Source:** Dylan approval, OS rebuild session 2026-07-16 (memory/decisions/2026-07-16-os-rebuild.md)
