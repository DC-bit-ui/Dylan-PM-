# Customer-facing time promises in business days; split operator views out of customer concepts

**Date:** 2026-06-15
**Type:** preference / comms + design — `[moderate]`, supersede if corrected
**Trigger:** Dylan's direction on the Snapshot self-serve design concept (2026-06-15).

## Two rules

1. **Customer-facing turnaround promises are stated in business days, not hours.**
   Use "within 1 business day", not "within 24 hours", in any customer-facing copy (confirmation screens, SMS, email). Reason: a clock-hours promise overpromises for requests that arrive on a Friday or over the weekend. The tighter hours-based target can stay as the *internal* SLA in the PRD/proposal, but it does not go in front of the customer. See [[feedback-no-ai-tells]] (same "how copy reads to the customer" lens).

2. **Keep internal-operator workflow out of customer-facing design concepts; give the operator its own concept.**
   A "for sign-off" customer concept should show only the customer's screens. Internal steps (e.g. Ben creating the property in Frontier, parcel selection, submitting the Snapshot) belong in a *separate* operator concept. For operator views, design for the real job: e.g. Ben's handoff view is built to split-screen against Frontier with one-click copy of every field and the boundary as a downloadable GeoJSON — "all the information in a format I can easily transfer into Frontier with minimal clicks."

## Also reaffirmed
- **No em dashes / AI tells** in any drafted copy, including HTML `<title>` tags. Already a standing rule ([[feedback-no-ai-tells]]); reaffirmed here.

## Applied in
- `Farm Map Drawing Tool/design/concept-mobile.html` (farmer flow only; step 6 notification screen; "1 business day")
- `Farm Map Drawing Tool/design/ben-handoff-concept.html` (separate operator concept)
