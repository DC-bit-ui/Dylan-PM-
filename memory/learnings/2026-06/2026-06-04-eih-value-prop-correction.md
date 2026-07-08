# EIH Automation — where the value actually is (correction to "identification is easy")

**Date:** 2026-06-04
**Type:** correction + product value-prop framing
**Confidence:** [high] — Dylan stated directly; corroborated by DJ runthrough
**Sources:**
- Granola 2026-06-04 "EIH consent packages and ops dashboard prototype with DJ" (`d9fa021d-997d-49e2-a9f7-84fd5c543bc3`)
- Dylan correction, Cowork session 2026-06-04

---

## The correction

DJ said *"identifying the EIH is fast / easy."* I over-generalised that into "the
tool is automating the easy part." **Wrong scope.** Only **EIH extraction from a
single title** is easy/trivial. Dylan's exact clarification:

> It is not the whole flow he is saying is easy, it is just the EIH ID on a single
> title. Confirming the right title ID, purchase of the titles, identifying all
> interest holding parties, and subsequently creation of necessary signoff documents
> for each of these parties, + moving the actioning of sending these docs to the
> people earlier in the piece, and now prepping the bundles of evidence in advance to
> get the institutional/electrical interests engaged at the beginning of the project
> is highly valuable and not 'easy'. This all needs to be made easy and facilitated
> by our solution.

## The value chain the solution must make easy (NOT just single-title parsing)

1. Confirm the correct **title ID**
2. **Purchase** the titles
3. Identify **all** interest-holding parties — full set across every title, deduplicated
4. Create the necessary **sign-off / consent documents** for each party
5. Move the **actioning** (sending docs to parties) **earlier** in the project lifecycle
6. **Prep evidence bundles in advance** to engage institutional / electrical interests
   at the **start** of the project (not at crediting)

Trivial bit (do not mistake for the value): extracting EIHs from one individual title.

## Why it matters / how to apply

- **Don't down-rank title sourcing + full-party identification + doc generation.** They
  are core value, not commodity. (My earlier advice to "down-rank the parsing debate"
  applies ONLY to single-title extraction mechanics, not to the orchestration.)
- The deterministic multi-state parsers + accurate cross-title dedup remain important —
  identifying *all* parties correctly is a regulatory-accuracy job, not a freebie.
- The downstream engagement layer (per-party consent docs, early actioning, advance
  institutional bundles) is the highest-value, least-built part. See related:
  DJ's two package types (bank / utility), EIHC-as-PandaDoc-template, dual-path
  SharePoint search, EIH-before-resampling timing, draft-CER-submission-ID, and the
  unresolved bank-consent-before-signed-KCT process gate.
- Destination per DJ: **integrate into the ops app**, not a standalone / Claude-only
  surface. Joe is likely the primary user — get her input before 10 June demo.
