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

### 2026-08-11 — Future capability is a release schedule, not a disclosure problem
**Rule:** Constrain present-tense measurement claims only — a modelled figure is never shown as measured, and a number on screen today must be real and traceable. Do NOT constrain forward capability: the digital twin is aspirational by design. Never soften, hide, defer or hedge a product line because it isn't live; show it with an availability window ("reservable, method in development"), not a caveat. "Reserve" is the verb, not "register interest". Keep empty layers visible with their reason — that is what makes the forward claims believable. Corrected three times in one session.
**Source:** memory/learnings/2026-08/2026-08-11-future-capability-claims-unconstrained.md

### 2026-08-13 — A large ESM correction measures basis placement, not mass instability
**Rule:** Never treat a large Equivalent Soil Mass correction as a defect signal on its own. It measures where M* was frozen relative to the ODM distribution — when M* sits close to the lowest date's ODM median the correction blows up on perfectly sound data, which systematically penalises small homogeneous properties. Check the headroom (Mulloon +109 t/ha vs Glenn Canny +11), re-freeze on the minimum-ODM date, and re-test. Flag on **inter-round mass swing**, which is basis-independent. Also: soil mass is quasi-static, so L1 ODM CV is a free measure of model noise — where SOC varies by less than ODM does, the year-to-year movement carries no interpretable signal, and that is a stronger argument than minimum detectable change because it assumes nothing about effective sample size.
**Source:** memory/learnings/2026-08/2026-08-13-esm-gate-measures-basis-placement-not-instability.md (AP-2724)

### 2026-08-13 — Register an epic in the OS the moment it is created
**Rule:** When a Jira epic is created or discovered during a session, add it to `memory/state/NOW.md` (owned-epics table + strategy section if it changes priorities) and create `memory/initiatives/<key>-<slug>.md` per the AP-2514 pattern, then regenerate `memory/initiatives/INDEX.md`. Working folders outside `memory/` are sanctioned ONLY when an initiative file points into them (`core/MAP.md` §6) — a workspace with no initiative file is invisible to the OS. AP-2664 and AP-2693 both ran for days with no OS record.
**Source:** memory/initiatives/INDEX.md §Known gap; session 2026-08-13

### 2026-08-24 — Verify every named external standard before it reaches a buyer surface
**Rule:** Any framework, standard, scheme or certification named on a customer-facing surface must be verified current at the time of build, not recalled. A retired or superseded standard on screen does not just cost that tag, it makes every other figure on the surface look unchecked. Found four dead tags on one tab: TCFD (disbanded 2023), Climate Active (closure announced July 2026), GRI 304 (superseded by GRI 101 Biodiversity 2024 from 1 Jan 2026), plus Scope tags applied to offset instruments, which are category errors. Applies equally to a standard a specific buyer has not adopted: BHP mentions TNFD four times in 248 pages, all definitional, and does not disclose GRI 101.
**Source:** memory/learnings/2026-08/2026-08-24-retired-frameworks-on-buyer-surface.md

### 2026-08-25 — Design prompts carry the problem and the material, never the solution
**Rule:** When briefing Claude Design, supply the reader, the critique of what exists, the raw facts, and the outcome to design for. Withhold the form entirely, and do NOT attach our own reference renders, which anchor hard and collapse the space. End every prompt with something genuinely open and an explicit invitation to reject our framing. Send one intent per prompt, sequenced, so each can be judged before the next opens. Dylan: "prompt it on what we want to achieve and break it down bit by bit ... in the most creative and innovative manner possible to elicit it to be as creative as it can be."
**Source:** Extends memory/learnings/2026-08/2026-08-06-claude-design-non-prescriptive-prompting.md, which established the withhold-form rule. This entry adds the sequencing and the no-reference-renders point. Cowork commercial module console thread, 2026-08-25.

### 2026-08-25 — Console to Claude Design, Frontier to the dev team
**Rule:** Commercial module console work is briefed to Claude Design directly. Frontier work is packaged for the dev team, who pass it to Claude Code, and those packages must be self-contained and Frontier-only. Never mix the two in one document or one handoff. Corrected once when a console brief was written as a dev handoff.
**Source:** Cowork commercial module console thread, 2026-08.
