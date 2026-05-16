# Objection plays — source documents

Captured from Ben (2026-05-13 chat) and Hobbs's own SharePoint-stored writings. The .md files are the extracted text content readable by the dashboard's ASK + BRAIN tabs. The original .docx / .pdf files sit alongside for human review.

## Catalogue

- **[AgriProve Sales FAQs](agriprove-sales-faqs-2022.md)** · AgriProve team · 2022-01-07 — Foundational FAQ covering the most common landholder questions on carbon projects, methodology, and pricing.
- **[Hobbs Farmer Objection Handbook](hobbs-farmer-objection-handbook.md)** · Hobbs Magaret · 2025-11-26 — Hobbs-authored playbook for the objections he hears most on-farm. Verbatim language for each.
- **[AgriProve Objection Handling Guide](agriprove-objection-handling-guide.md)** · AgriProve team · undated — General objection-handling guide. Bookend to the Hobbs handbook — broader framings, more conservative tone.
- **[Storm Boy Cold-Call Script](storm-boy-cold-call-script.md)** · AgriProve Storm Boy team · current — Current cold-call script template for Storm Boy outreach. Reference for the opening + early-objection patterns reps are expected to deploy.

## How the dashboard uses these

- **ASK tab** loads the extracted markdown into the team brain context (alongside profiles + distillates). Reps asking "how do we handle X objection?" pull answers from these directly with verbatim citations.
- **BRAIN tab** surfaces them as cards in the distillates grid (planned next iteration).
- **Phase 2:** structured per-objection cards — one card per objection (the 25%, "I'm just a grazier", privacy concerns, etc.) with Hobbs's verbatim response, alternative responses, and which transcripts validate it.

## Provenance

Originals copied from `shared-growth-memory/` root (where Dylan dropped them after a 2026-05-13 chat with Ben). Moved into this folder so they're co-located with the rest of `team-brain/` and ASK can find them deterministically.

## Re-extraction

If a source doc is updated, re-run `stormboy-tracker/coaching/tools/extract-objection-docs.py`. Idempotent — overwrites the .md files with fresh extraction.
