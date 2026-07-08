# Land-sale portfolio data: not tracked in systems + the Gunthorpe proof point

**Date:** 2026-06-12
**Source:** Granola "Stormboy" standups (22/05, 29/05) + Round Table 12 Jun (uploaded transcript); HubSpot Project Pipeline schema + records; CER guidance. Triggered by Dylan's request for a portfolio analysis on "how many businesses sold land since doing a soil carbon project" for a prospect-education piece.
**Confidence:** [high] on the data-gap finding; [moderate-high] on the outcome facts (field/sales-team sourced, not system-verified).

## The data gap [high]
There is **no structured field anywhere** that records a land sale / subdivision / title or ownership change / proponent change on an *active* soil carbon project:
- HubSpot DEAL object: no property for sale, ownership, transfer, proponent, novation, co-proponent, boundary, or parcel change (searched schema directly).
- Closed-lost reason "Sold property / no longer operating" exists but is used on **zero** deals, and only ever described pre-signing churn.
- "Project Discarded" stage (176 records) is corrupted by bulk duplicates (one landholder = up to 20 records discarded same minute, e.g. Cramer/Hammat ×20, Howson/Gunthorpe ×15), so no exit rate is derivable from it.
- AgriProve platform `get_project` does not resolve by CRM project names; a single read shows only current state, so historical parcel removal is invisible.
- Notes and calls objects are permission-blocked for the Cowork HubSpot connection.

**Implication:** the "how many sold" statistic cannot be queried. It requires a manual field-team review (Will/Hobbs/Ben) — which is exactly the open action item Hobbs raised. Dylan declined (2026-06-12) to build a standing capture mechanism "for now".

## Portfolio scale (records, not distinct businesses) [high]
Project Pipeline (HubSpot pipeline id `80806704`): 918 deal records total; 742 non-discarded; 238 at advanced stages (Annual Review / Tn Sampling / Crediting / Completed); 36 at Crediting stage. Counts overstate distinct landholders because projects are split into many CEA-level records. The 6 "in-project" stages (Baseline → Completed) hold ~596 records; a 200-record sample contained 78 distinct landholder surnames (≈2.6 records/landholder), implying **roughly 200+ distinct landholdings** with a project underway [moderate, estimated]. Denominator for the prospect-piece stat: "1 known sale out of 200+ landholders in a project".

## The outcome facts (the real "number") [moderate-high]
- **Zero** AgriProve landholders have ever had to relinquish/return ACCUs because of a property sale.
- **Zero** projects have been put "on ice" due to a sale.
- **Dylan confirmed (2026-06-12)** Gunthorpe is the only known case of a landholder selling part or all of a property while in a project. Featured as the lead stat ("1") in the education piece with "on record / known to us" framing; statnote flags the true count may be higher since in-project sales aren't centrally tracked.
- **One** confirmed sale of a property carrying *issued* ACCUs: **Adam Gunthorpe** (Gunthorpe Cattle Company; "Howson Carbon Project" CEAs, ~15 records at Annual Review). Outcome: new landholder is taking over and continuing the project; Gunthorpe returned **no** credits. Only friction was extra legal/conveyancing cost (buyer's solicitor had not handled a carbon-project transfer). Corroborated by Dylan directly + Granola standups.
- Fear-driven *lost deals* (not actual sale failures): Alec Thompson (KCT issued, exited on exit-strategy concern); one unnamed deal lost 29/05 over ACCU-return fear (market misinformation).

## Reusable framing
For prospect reassurance, the regulatory certainty ("selling is a solved, routine process; project runs with the land; AgriProve can stay proponent; sold blocks come off the boundary") is a stronger lever than a base rate. The decisive prospect question is "if it happens to me, am I trapped?" not "how often does it happen?". CER process: [Selling or buying ACCU Scheme project property](https://cer.gov.au/schemes/australian-carbon-credit-unit-scheme/how-to-participate/making-changes-to-your-project/selling-or-buying-accu-scheme-project-property) (updated 16 Dec 2024).

## Verified contract / regulatory facts (added 2026-06-12, quadruple-verify pass) [high unless noted]
Sources: CER "Selling or buying ACCU Scheme project property" (16 Dec 2024) + "Permanence obligations"; agriprove.io/running-a-soil-carbon-project; AgriProve Soil Carbon Licence & ACCU Sales Agreement (SLA clauses); internal WF-KW FAQ deck + "260525 Regulatory Risk Paper" (both CONFIDENTIAL).
- **The real landholder commitment** is to keep the land in an agricultural system for the permanence period (no subdivision/residential/commercial/industrial conversion of the project area). SLA cl 5.4; agriprove.io confirms verbatim. Selling per se is NOT the constraint.
- **On sale**: agreement is novated to the buyer (notify when property is listed). AgriProve stays project proponent (cl 5.5, 5.6). New owner can continue, modify, or cease activities but must allow AgriProve 5-yearly MRV sampling.
- **Issued ACCUs are kept** by the original owner on sale; whether they pass to the buyer is a commercial negotiation (FAQ deck).
- **Exit = revocation = repay an equivalent of ALL issued ACCUs**, at the exiting landholder's cost (buy back on market if already sold), regardless of current soil-carbon level. Nothing to repay if none issued. SLA cl 14.4/14.5 + FAQ deck. (This corrected a too-soft draft claim.)
- **Claw-back triggers**: revocation, land leaving agriculture, or fraud/knowing reversal (s87-91 CFI Act). Natural fluctuation does not trigger payback. AgriProve (as proponent) carries post-25-yr reversal liability, not the landholder [moderate, internal source].
- **Govt change**: SLA cl 14.7 — termination on change of law only once existing obligations met. "Changes apply going forward not retrospectively" is a historical pattern, NOT a guarantee — keep hedged, needs legal review.
- **Portfolio scale (authoritative)**: Regulatory Risk Paper states "more than 650 registered projects and more than 50 reasonable assurance audits to date, AgriProve has not had any relinquishment notices triggered." Strong reassurance stat but CONFIDENTIAL source — clear before external publish.
- **Could not find**: standalone current "Master Terms & Conditions" (referenced by 2026 Key Commercial Terms + LMS Pre-Read); no KCT/Koolah agreement template in the contract folder. Operative clauses quoted are from the 2018/2021-method SLA template — confirm current wording matches before legal reliance.

## Deliverable
Prospect-facing HTML one-pager: `memory/deliverables/education/2026-06-12-selling-your-property-soil-carbon.html`. Pending: PDF version + HORIZON snapshot FAQ block + internal cheat sheet (one-liners / objection handling for the field team). External "zero clawbacks" claim should be team-verified before publishing.
