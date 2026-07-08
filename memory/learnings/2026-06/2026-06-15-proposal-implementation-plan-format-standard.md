# Proposal / implementation-plan format standard (editorial HTML one-pager)

**Date:** 2026-06-15
**Type:** preference / working-style (format standard) — `[moderate]`, supersede if corrected
**Trigger:** Dylan: "Build the user flows and proposal in the new format we said we want to enact moving forward — like this one", attaching `2026-06-09-eih-implementation-plan.html`.

## The rule

Going forward, **proposals and implementation plans** (the doc that explains "what we're building, how it fits, how it's built, what's outstanding") should be authored as a **single self-contained editorial HTML one-pager** in the style of the 2026-06-09 EIH/consent implementation plan — **not** as a markdown wall of text or ASCII diagrams.

This is distinct from the formal **PRD** (Lean Core + Design Appendix, Confluence-bound). The HTML one-pager is the *thinking / circulation* artifact for eng + cross-functional readers; the PRD remains the formal spec.

## The format (template anatomy)

- Constrained editorial CSS: system font, `max-width:880px`, warm palette — `--ink:#2C2C2A`, `--mut:#5F5E5A`, `--line:#D3D1C7`, `--surf:#F1EFE8`, info blue `#185FA5`/`#E6F1FB`.
- `h1` + a `.meta` line: "For: <named readers> — <date> · source".
- A `.tldr` box (grey surface) — the whole thing in ~5 bullets.
- **Numbered `h2` sections**: "1 · Where it fits", "2 · …", "3 · How it's built", then Dependencies to confirm / Open decisions / Next workstream (open) / Roles.
- **Hand-built inline SVG flow diagrams** in `<figure>` + `<figcaption>`, colour-coded by a consistent legend:
  - `c-gray` = existing / reuse · `c-teal` = new build · `c-amber` = confirm / dependency / human gate.
  - boxes (`rect` rx 6–10) + `.th`/`.ts` text + arrows via a `<marker>`.
- A `.note` callout for the key "**Why not X?**" decision (e.g. EIH: "Why not an MCP?"; map-draw: "Why not Google Maps?").
- **Roles** paragraph at the end (named owners).

## How to apply

When Dylan asks for a proposal / implementation plan / "write this up for eng": produce the HTML one-pager in this exact visual language. Reuse the CSS block verbatim. Keep diagrams clean (don't overcrowd; verify SVG well-formedness + that max y ≤ viewBox height). Use named readers in the meta line; flag any unconfirmed names.

## Reference implementations
- Template: `inbox/`/upload `2026-06-09-eih-implementation-plan.html` (EIH/consent).
- First reuse: `Farm Map Drawing Tool/proposal/proposal-and-flows.html` (HORIZON Snapshot self-serve).

## Candidate for promotion
Appears once explicitly as a "going forward" standard. If it holds across the next 1–2 proposals, promote to `memory/profile/working-style.md` (Tier 2 PR). See also [[ticket-quality-zero-context-rule]] (zero-context-reader rule applies to these docs too).
