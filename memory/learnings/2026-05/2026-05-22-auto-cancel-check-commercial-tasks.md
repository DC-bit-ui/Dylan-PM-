# Learning: Don't auto-cancel commercial/vendor tasks without checking completion signals

**Date:** 2026-05-22
**Source:** Dylan correction during EOD reconciliation
**Confidence:** [high]

Apex auto-cancelled "Set up marketplace product listing for Paniri Gen 6 tags" (5 days Proposed, no Jira link, no Granola signal). But Dylan had already completed the work: email sent to Paniri, pricing document produced, approval from Kieren on pricing email, price proposal sent to Helen.

The auto-cancel rule fired correctly on signals (>3 days, no triage, no Jira, no Granola mention) — but the completion signal for commercial/vendor work doesn't appear in those systems. Pricing emails and vendor proposals go via Outlook, and the task was created manually (not from Apex), so Granola wouldn't capture it.

## Rule

For commercial or vendor-facing tasks (marketplace listings, pricing emails, vendor proposals, customer-facing documents), Outlook sent items are the completion signal — not Jira or Granola. Before auto-cancelling:

1. Check Outlook sent items for an email matching the vendor/topic within the task creation window
2. If found post-creation → Done-ack, not cancel

## Affected task types

- Marketplace product listings
- Vendor pricing emails / proposals
- Customer proposal documents
- Supplier correspondence

## Why this matters

Apex incorrectly cancelled completed work, then Dylan had to manually correct it. This erodes trust in auto-cancel.
