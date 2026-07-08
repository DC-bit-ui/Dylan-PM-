# Jira: createJiraIssue markdown descriptions can double-escape newlines

**Date:** 2026-07-08
**Type:** tooling learning — Atlassian MCP (Jira)

`createJiraIssue` with `contentFormat: "markdown"` sometimes double-escapes `\n` in the description, so line breaks render as literal `\n` text in the ticket (happened on AP-2618). The same markdown on `editJiraIssue` rendered correctly (real line breaks, bullets).

**Rule:** when a created ticket's description looks like raw `\n`, re-set the description via `editJiraIssue` (contentFormat markdown) — that path renders. Alternatively create with `contentFormat: "adf"` and a doc object. Epic/Story creates (AP-2616/2617) rendered fine on create; the Task create (AP-2618) did not, so it is intermittent — always eyeball the returned `description`. Supersedes/extends the earlier ADF note ([[2026-06-17-mapbox-reuse-tap-to-place-and-sms-decisions]] tooling note).
