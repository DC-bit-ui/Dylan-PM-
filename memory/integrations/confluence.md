# Integration: Confluence — Documentation

**Purpose:** AgriProve's long-form documentation lives in Confluence. PRDs, technical specs, process docs.
**Direction:** read primarily; potential write for PRD / RFC creation.
**Access:** via Atlassian MCP (same connector as Jira) — must be enabled in active session.
**Status:** **available — usage not yet validated against live data** (per cowork handoff).

---

## Site
- Same Atlassian site as Jira: `agriprove.atlassian.net`
- Same cloud ID: `93303eda-f479-47a1-ab3a-d4609f4901b3`

---

## MCP access

**Tool:** `mcp__b19a3849-7be2-4183-9786-51f9c690e73f__searchConfluenceUsingCql`

**Useful CQL:**
| Purpose | CQL |
|---|---|
| Recent changes (last 24h) | `type = page AND lastModified >= now('-1d') ORDER BY lastModified DESC` |
| PRDs created this month | `type = page AND title ~ "PRD" AND created >= startOfMonth() ORDER BY created DESC` |
| Pages by author | `type = page AND creator = "<accountId>" ORDER BY lastModified DESC` |
| In a specific space | `type = page AND space = "<KEY>"` |

---

## When agents consult Confluence

| Trigger | Approach |
|---|---|
| `deliverable-builder` PRD work | check for existing PRD on the topic before drafting |
| `researcher` deep-context investigations | spec history, prior art |
| `pm-strategist` checking what's been written about a strategic question | CQL search by topic |
| `initiative-tracker` linking initiative → spec | filter to relevant space + epic |

---

## Where Confluence data lands

| Confluence content | Lands at |
|---|---|
| PRD link | `memory/initiatives/<slug>.md` `Linked artifacts` |
| Process / standard docs | linked from relevant playbook in `playbooks/` (don't copy the content; link) |
| Technical spec referenced in a decision | linked from `memory/decisions/<file>.md` |

---

## Write-back policy
- Default off. PRDs drafted in this repo (`memory/deliverables/prds/`) can be exported / created in Confluence on Dylan's confirmation.
- Don't auto-create Confluence pages from this repo without explicit ask.

---

## Failure mode
- Connector unavailable → ask Dylan for a paste / link.
- **Don't fabricate Confluence URLs or page titles.**

---

## Setup checklist
- [ ] Probe `searchConfluenceUsingCql` against the AgriProve cloud
- [ ] Identify primary spaces (e.g. Product, Engineering, Onboarding)
- [ ] Confirm Dylan's account ID for "pages by author" queries (matches Jira accountId: `712020:177437ab-7799-4e10-8604-116a8def9eb1`)
