# Farm Map tool: post-submission growth loops (another property + refer a friend)

**Date:** 2026-07-02
**Type:** product direction / scope addition — Farm Map Drawing Tool (AP-2514)
**Source:** Dylan, 2026-07-02. Added as Round 11 in `../../Farm Map Drawing Tool/design/claude-design-prompt.md`.
**Target design:** built onto "Direction A - Farm Boundary Tool (Desktop Map Only, Lock & Continue)" - Dylan's chosen non-contiguous flow (lock-and-continue confirmed over the non-lock version, 2026-07-02).

## What [high]
Add a post-submission "what next" screen, triggered AFTER the farmer submits details and requests their Snapshot (highest-intent moment). Three paths:
1. **Done / exit** - calm, no pressure.
2. **Assess another property (self-loop)** - back to the start of the flow (find + draw a new property), with contact details REMEMBERED and pre-filled at the details step. Fits the standing "one request per property" rule ([[2026-06-17-ben-feedback-outbound-confirm-and-non-contiguous]]) - separate properties = separate requests, so looping is the clean multi-property path.
3. **Refer a friend (viral loop)** - the volume play. Shareable link (copy + native SMS/WhatsApp/email). Seed copy "Know a friend who may be interested? Send them a link to assess their potential", to be made more fun/engaging. Claude Design given creative freedom on delight + wording.

## Notes / open [moderate]
- **Contact pre-fill** needs client-side state carried from the submitted request to the new run (no new backend for v1; the tool is public/no-login).
- **Referral attribution** (who referred whom) is NOT in v1 - the share is just the public tool link. If we want attribution/tracking or an incentive, that is a fast-follow and would need a tokenised/UTM link + a ticket. No specific rewards/numbers invented.
- Not yet in PRD/tickets - design exploration pending Dylan's review of what Claude Design returns.
