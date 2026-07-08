# Vendor escalation pattern — Ceres Tag 30-day silence-then-deflect

**Date:** 2026-05-21
**Confidence:** [high] — directly observed across 30 days of correspondence
**Triggering event:** Dylan ↔ Kieren escalation call after Rod McIntyre forwarded Ceres's 20 May reply.

## Pattern observed

When a vendor (Ceres) is presented with a formal, evidence-rich situation report (20 April, with 5 figures, telemetry analysis, CTO co-sign), the response pattern was:

1. **Acknowledge receipt without engaging.** 17-day gap. Then a single line to the affected customer: *"We are having discussions with AgriProve now whilst we review the report."* (7 May)
2. **No direct response back to AgriProve.** The vendor talked TO the customer, not back to the report sender.
3. **Deflect via narrower framing.** When pressed again (Rod, 18 May), reply (20 May) cited a 24-hour connectivity / accuracy snapshot — narrower window, includes legacy fleet — as evidence "nothing at this stage to suggest a deeper issue." Reframed the AgriProve discussions as *"centered on a range of broader future developments rather than any specific use case"* — undercutting the partnership stance in front of the customer.
4. **Continue routing the customer through support inbox**, not through the named exec contact who received the original report.

## What worked / what didn't

- **Worked:** The 20 April situation report itself. Quality of evidence (CTO-co-signed, 5 figures, 31-day window, per-device data) means the vendor cannot claim ignorance and is now arguing against a specific record.
- **Worked:** Customer paper trail. Rod's own emails to Ceres support are the most damaging evidence in the escalation, because they are not from us — they are from the customer to the vendor, time-stamped, going back to 2 April.
- **Didn't work:** Sending the report once and waiting. 17 days of silence is the cost.
- **Didn't work:** Cadel's earlier guidance (30 April) to keep the response non-rebuttal-shaped was correct, but it meant the first follow-up after the 7 May Ceres line was deferred to AgriProve. Vendor took the gap to issue the 20 May deflection to the customer directly.

## Rule going forward

When sending a formal escalation document to a vendor:

1. **Set a written follow-up window in the original email.** "We would welcome a substantive response by [date]." The 20 April send did not do this, which gave Ceres the option to drift.
2. **Name a single point of contact on the vendor side and ask them to confirm ownership.** If they don't respond, that itself is the signal.
3. **Track vendor's parallel communication with the affected customer.** Ceres's 20 May reply to Rod was the data point that triggered escalation — without sight of that reply, we would still be waiting.
4. **At the 14-day mark on a vendor escalation, send a one-line nudge.** Silence is not neutral; it is a negotiating posture.
5. **GM-level escalation needs a deadline AND a named next step.** Held in reserve for this iteration (delicate tone), but should be the default escalation template after a first soft follow-up has been declined or ignored.

## Sub-rule: customer-quote selection for vendor escalations (added 21 May, Dylan-flagged)

When picking customer quotes to lead a vendor conversation, **favour quotes with information content over quotes with emotional content**:

- **Information-bearing:** numbers, observable patterns, hypotheses the customer is testing, third-party validation, time-stamped behaviour reports. ("Only 7 of the 20 are showing where the cows actually are." / "We have tried this with the last three tags we replaced and they seem to be performing better.")
- **Emotion-bearing:** requests to talk, expressions of frustration, statements of disappointment without specifics. ("I would like to discuss this with you. Please give me a call at your earliest convenience.")

The emotional quotes are real and matter for the relationship, but they give the vendor nothing concrete to engage with — they can be acknowledged with empathy and then deflected. The information-bearing quotes force a technical or product response. **Lead the email with the latter; the former can sit in the chronology if needed.**

Specific case where this surfaced: my first draft of the Ceres email led with Rod's "I would like to discuss this with you" line as one of three quotes. Dylan's pushback: *"referencing a 'can we please talk about this' style email is of no real substantive value."* Rewrote to lead with Rod's back-of-ear placement trial (concrete, hardware-relevant, gives Ceres something specific to comment on).

## Sub-rule: don't misread customer behaviour as hypothesis-testing when it is desperation (added 21 May, Dylan-flagged)

I initially framed Rod's back-of-ear placement on three replacement tags as a customer-led trial — i.e., a hypothesis Rod was testing because he was curious about hardware behaviour. Dylan's correction: that misreads the situation. Rod is not running R&D. He is a customer who cannot rely on the data he is paying for, and is now willing to try configurations the vendor's own guidance explicitly warns against because the standard configuration is not working.

The difference matters for how the email frames it to the vendor:

- **"Trial" framing** lets the vendor engage at arm's length ("interesting observation, here's the hardware reason it would or wouldn't work"). It positions the customer as a curious user.
- **"Desperation" framing** forces the vendor to engage with the lived customer experience ("our customer has run out of options and is acting against your guidance because your standard configuration has failed them"). It positions the customer as someone the partnership is failing.

**Rule:** when a customer is doing something off-script with a vendor product, distinguish carefully between curiosity (run-it-by-them, no urgency) and desperation (the product is not meeting their need and they are reaching for anything). Default to "desperation" reading unless there is positive evidence the customer is calm and exploring. Curious customers tend to ask before they act; desperate ones act and then report.

## Sub-rule: name the partnership stakes explicitly in vendor escalations (added 21 May)

Dylan's final framing addition surfaced a beat my earlier drafts had skipped: the explicit partnership-stakes statement. The reputational damage to AgriProve, the unbudgeted resource drain into troubleshooting a product meant to reduce support load, and the sales-channel implication if the regression is representative of the broader fleet — all of these are partnership-level facts that should be on the table in a vendor escalation, not just the customer-level facts.

The phrasing matters: name these as our problem to solve together, not as a deadline or a threat. The line "very difficult for us to continue confidently promoting these devices into our marketplace right now" is the partnership-stakes statement in the Ceres email — it signals seriousness without burning the relationship. Vendors hear "marketplace promotion" loud and clear; they do not need an explicit deadline beside it to register the stakes.

**Rule:** every vendor escalation where the affected product is in our marketplace should include, somewhere, an explicit statement of what is happening to our reputation / resourcing / sales confidence as a result of the unresolved issue. Not as a threat, not as a deadline — as a partnership-stakes fact. This is the lever that distinguishes a customer-escalation email from a partnership-escalation email.

## Sub-rule: don't let subject-line gaps hide the substantive email

The most important customer email in this thread (20 May 11:30 AEST, Rod to Dylan + Kieren) **had no subject line**. My initial Outlook search surfaced it lower in the results than the more searchable emails. I worked from the easier-to-find emails and missed the substantive one until Dylan flagged it.

**Rule:** when gathering customer correspondence for a vendor escalation or stakeholder doc, read the full body of every email from the affected customer in the relevant window, not just the ones with informative subject lines. Empty-subject and one-liner emails are often where the real content sits in landholder correspondence.

## How to apply

- Apply to any future vendor relationship where we hold the customer relationship and the vendor holds the hardware/IP (Ceres, mOOvement, Verterra, any future marketplace partner).
- Treat the original "what we are asking for" list in any future situation report as the **floor** of the escalation, not the ceiling. Subsequent escalations can add asks (remediation path, named owner, etc.) — that is appropriate, not a contradiction.

## Sources

- Outlook — full Rod ↔ Ceres support thread (28 Aug 2025 → 20 May 2026)
- Outlook — Dylan's 20 Apr situation-report email to Joe Pasanen + info@cerestag.com
- SharePoint — `bugs/CERES_Situation_Report_17Apr2026.docx`
- Teams — Dylan ↔ Cadel chat re Apr 30 draft review (note: *"Going line-by-line seems to imply a level of argument that they haven't escalated to"*)
- Granola — Dylan ↔ Kieren escalation call, 21 May 2026
- Jira — AP-2178 (Done, 20 Apr)
- Linked deliverable: `memory/deliverables/updates/2026-05-21-ceres-escalation-email-for-kieren.md`
