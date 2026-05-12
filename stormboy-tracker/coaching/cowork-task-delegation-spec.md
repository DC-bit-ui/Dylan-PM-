# Cowork Task Delegation Spec

**Status:** Design / contract. Implementation deferred to Cowork side.
**Companion to:** [`cowork-orchestration-contract.md`](cowork-orchestration-contract.md) — the read/distill/write pipeline. This doc covers the **delegation path**: when the dashboard surfaces an action that requires *making something* the rep doesn't have time to draft, the rep delegates to Cowork.

## Principle

The system shouldn't add work. When coaching surfaces a tactical action like *"send a competitor-comparison one-pager to James Almond"*, the rep faces two paths:

1. **Self-do** — drop other work, draft the artifact, send it. ~30 minutes of focused effort.
2. **Delegate to Cowork** — one click; Cowork drafts the artifact + delivers it (to rep's review queue OR direct to customer). Rep spends 3 minutes reviewing instead of 30 minutes drafting.

Path 2 is the enablement layer.

## Task spec shape (what the dashboard hands Cowork)

A coaching card's primary action may include a `cowork_task` field with this shape:

```json
{
  "task_id": "<UUID — dashboard-assigned>",
  "task_type": "draft_email" | "draft_one_pager" | "generate_horizon_snapshot" | "prepare_call_brief" | "compile_case_study_set",
  "deal_id": "<HubSpot deal ID>",
  "contact_id": "<HubSpot contact ID, optional>",
  "owner_email": "<the rep — receives the output>",
  "context": {
    "deal_name": "...",
    "current_stage": "...",
    "days_in_current_stage": <number>,
    "coaching_message": "<the full coaching message that drove this delegation>",
    "supporting_twin_ids": ["...", "..."],
    "primary_action": "<verbatim action text>"
  },
  "instructions": "<≤500 chars; specific brief for the artifact>",
  "delivery_mode": "review" | "send_direct",
  "delivery_target": "outlook_inbox" | "teams_channel" | "hubspot_note" | "claude_code_inbox",
  "deadline_iso": "<ISO8601 — when the rep needs it by>",
  "callback": {
    "type": "webhook" | "claude_code_skill" | "none",
    "url": "<dashboard endpoint to PATCH when complete>",
    "skill": "<Claudia tool skill name, if applicable>"
  }
}
```

## Task types — initial catalog

### `draft_email`
**Input:** deal context, recipient (from HubSpot primary contact), framing instructions, length cap.
**Output:** Outlook-ready email draft saved to rep's inbox as a draft (NOT sent).
**Why it's safe:** rep reviews + sends; no autonomous customer communication.
**Example:** *"Draft email to James Almond. Topic: Daisy Bank — 21-day countersign deadline. Frame around AgriProve's 25/75 vs fee-for-service alternatives. Length: under 200 words. Personal tone — Ben's voice."*

### `draft_one_pager`
**Input:** deal context, topic (e.g., competitor comparison), target audience, format constraint.
**Output:** PDF + 3-paragraph email summary saved to rep's Outlook drafts; PDF attached.
**Example:** *"One-pager: AgriProve 25/75 + 25-year ERF compared to fee-for-service + shorter-term alternatives. Audience: James Almond (Daisy Bank). Format: bullet-point comparison table + 3 ACCU revenue scenarios using Daisy Bank's profile."*

### `generate_horizon_snapshot`
**Input:** deal's associated property (via contact's farm_name → Frontier lookup), date range.
**Output:** HORIZON Snapshot PDF (the actual conversion artifact in the Stormboy motion).
**Example:** *"Generate HORIZON Snapshot for Yarragundry Station (closed_lost re-engagement candidate). Compare to baseline 12 months ago — flag what's changed."*

### `prepare_call_brief`
**Input:** deal, upcoming call meeting (from Outlook calendar), recent coaching cache.
**Output:** 1-page brief delivered to rep's inbox 1h before the meeting.
**Example:** *"Prep call brief for Ben's call with Will McLachlan on Friday 10am. Include: Rosebank current state, recent twin comparisons (Shaun Nottle win pattern), top 2 likely objections, suggested opener."*

### `compile_case_study_set`
**Input:** deal characteristics (region, size, stage), case studies in Confluence.
**Output:** filtered + framed case study set (PDF or notion page).
**Example:** *"Compile case study set for Hanrahan-Plibersek's pre-Strategy framing. Filter to Riverina + grazing operations. Annotate with relevant talking points."*

## Trust + safety boundaries

Cowork **never** writes to customer-facing systems autonomously without rep review:

- ✅ Draft → rep's Outlook drafts folder (visible, editable, gated by rep clicking Send)
- ✅ PDF → rep's Outlook drafts as an attachment to a draft email
- ✅ Note → HubSpot deal record as a `note` (internal only, not customer-visible)
- ✅ Teams message → rep's own message draft area in their channel
- ❌ Customer email → NEVER autosent. Always to drafts.
- ❌ HubSpot deal stage change → NEVER. Stage transitions are the rep's call.
- ❌ Public LinkedIn / external posts → NEVER.

`delivery_mode: "send_direct"` is reserved for **internal** communications only (e.g., Teams post to leadership channel for the Monday/Friday briefing).

## Callback / status

When Cowork completes a task, it PATCHes the dashboard's task-status endpoint:

```
POST /api/coaching/tasks/{task_id}/complete
Body: {
  status: "completed" | "failed" | "needs_clarification",
  outputs: [{ type, location, preview }],
  errors: [...]
}
```

The dashboard updates the deal's coaching card to show the artifact is ready, with a link to wherever it landed.

## Cowork's side of the contract (mirror of Claudia's pelican294 pattern)

Cowork implements a single workflow file: `workflows/coaching-task-runner/coaching-task-runner.md`. Triggered by:
- An exact phrase from the dashboard (similar to `pelican294` triggering Aircall sync)
- A scheduled tick checking the dashboard's task queue
- A direct REST call from the dashboard

The workflow:
1. Reads the task spec
2. Validates inputs (deal exists, owner email valid, etc.)
3. Routes to the right artifact-generation skill (mirrors how Claudia's tool routes lead-research / call-admin / etc.)
4. Produces the artifact via Anthropic API calls
5. Delivers to `delivery_target` (Outlook drafts, HubSpot note, etc.)
6. Calls back to dashboard with status

## Cost ceiling

Per task: ~$0.05–$0.20 depending on complexity (email vs one-pager vs case study set). At ~5 tasks/day across the team, ~$1/day. Acceptable.

## Migration path

**Today (manual mining session):** I can produce drafts inline by calling Claude in this session and writing the output to the dashboard cache as a one-off. Proves the value, no Cowork integration yet.

**Phase 2:** Pattern A (inline draft) — dashboard's B1 prompt produces both action + draft in one Claude call. Rep sees the draft inline; can copy/paste.

**Phase 3:** Pattern B (this contract) — Cowork implements the task runner. Dashboard surfaces "delegate" button. Rep clicks once; Cowork handles everything.
