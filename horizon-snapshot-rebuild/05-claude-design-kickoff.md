# Claude Design — Kickoff Prompt: HORIZON Snapshot Tool

> Paste everything below the line into Claude Design. It builds the INTERNAL tool only (Frontier-embedded web app). The landholder-facing brand pages are marketing-authored templates rendered server-side to a real PDF, so the tool's preview shows them as high-fidelity page images, not CSS re-creations of the brochure. The final deliverable is always a single downloadable, exportable PDF that AgriProve owns. It is never a design-tool share link. Design system: Chakra. Stack: React + TypeScript, named exports, Tailwind utility classes with explicit hex values.

---

Build a full-page internal web tool for AgriProve called the **HORIZON Snapshot Tool**. It is embedded inside Frontier (AgriProve's internal ops platform). The user is a Growth or Ops team member who reviews, tailors and sends an auto-generated soil carbon assessment ("HORIZON Snapshot") to a landholder prospect.

## What this product actually is

Treat it as a prospect-conversion instrument, not a document viewer. The user's real job is to decide fast whether a prospect is worth pursuing, tailor the pitch where it matters, and send. Design for triage speed and confidence, not for admiring a PDF.

## Core mental model (build the UI around this)

A Snapshot is an **ordered list of Blocks**. Each block has a **render kind**:
- `brand-template` and `image`: marketing-authored templates rendered server-side to PDF, marketing-grade. Most brand and narrative pages.
- `overlay` and `native`: rendered as HTML. Used for data or interactive pages.

The whole snapshot exports to one self-contained PDF (pages merged in block order), which AgriProve owns and attaches to HubSpot or email. The output is never a design-tool link.

The tool does not re-draw brand pages in CSS. In the preview, brand blocks appear as high-fidelity page images. Show a small "Brand" tag on those blocks so it is clear which pages marketing owns.

Blocks can be added, removed, reordered and edited per snapshot before publish. Some blocks are **locked** (brand and structural pages): they can be hidden but not reordered or deleted. The cover is always first, contact always last.

## Use the Frontier dark theme. Exact hex, no substitutions.

- Page background: #0F1A24
- Panel / nav background: #1A2D3D
- Card surface: #1E3344
- Card hover: #243D52
- Card border: 1px solid #2A4055
- Primary text: #E8EDF2
- Muted / label text: #8FA3B8
- Ops accent (active states, primary buttons, step indicators): #3DBA78
- Success green: #34D399
- Warning amber (flags, cost warnings): #F59E0B
- Error red (errors, remove): #EF4444
- Muted grey badge (disabled): #4A6380
- Font: Inter, system-ui, sans-serif

## Screen 1: Review Queue (the landing view)

A queue is the entry point, because prospecting is a volume motion. Full-width list of snapshots "Ready for Review".

- Header bar (bg #1A2D3D, 56px): AgriProve wordmark left; title "HORIZON Snapshots" center; on the right a primary **"+ New Snapshot"** button (#3DBA78) and a small "Dev" toggle (muted #8FA3B8, becomes #3DBA78 with a dot when active).
- A row of filter chips: "Ready for Review", "Sent", "All". Plus a search field.
- The queue: one card per snapshot (bg #1E3344, border #2A4055, radius 8px, padding 16px, margin-bottom 10px), each showing:
  - Property name (16px bold #E8EDF2) and location (13px #8FA3B8).
  - Key facts inline: eligible area, ACCU rate, estimated ACCU potential.
  - **QA flags**: small amber pills for anything needing attention, e.g. "Small eligible area (36.55 ha)", "Low rainfall", "Map failed to render", "Copy rule flag". No flags shows a green "Clean" pill.
  - Right side: register tag (Standard / Stormboy), LLM cost chip (e.g. "$0.026"), and a primary "Review" button (#3DBA78).
  - A checkbox for multi-select, and a top bulk action bar: "Approve & send selected", "Dismiss selected" (for non-viable properties). This is the triage lever, make it obvious.

Clicking "Review" opens Screen 2.

## Screen 1b: New Snapshot (entry-point chooser)

Reached from "+ New Snapshot". This is the create moment. It must feel simple, welcoming and quick, like starting something, not filling in a form. Center the content on the page background with generous whitespace and a subtle entrance animation. A short heading: "Create a HORIZON Snapshot". Below it, **two equally weighted choice cards side by side**, each large, tappable, with an icon, a title, a one-line subtitle, and a hover lift.

**Card A: From the pipeline (recommended)**
- Icon: a flow / lightning glyph. Title: "From the platform pipeline". Subtitle: "Pick a property whose model run is ready. Everything is pre-filled."
- When chosen, the card expands to a searchable list of properties with a completed HORIZON run. Each row: property name, location, run date, and a green "Ready" pill.
- Primary action: "Create snapshot". This is the production default.

**Card B: Manual upload**
- Icon: an upload / cloud glyph. Title: "Upload property files". Subtitle: "Drop the downloaded property ZIP and we will populate everything from it."
- When chosen, the card expands to a large, friendly **drag-and-drop zone**: dashed 2px #2A4055 border, radius 12px, generous height, muted cloud-upload icon, copy "Drag your property .zip here, or browse". On dragover the border glows #3DBA78 and the zone lifts. Accept `.zip`.
- On drop: show an animated parse/progress state (a slim progress bar or pulsing check sequence), then a **detected-contents checklist** so the user trusts what was read:
  - `metadata.txt` → property, contact, soil, rainfall, land use
  - `map.png` → zone map · `map_ph.png` → pH map · `map_depth.png` → depth map
  - `horizon_landscape.geojson` → zone stats · `input.geojson` → boundary · `classified.geojson` → zones
  - Each detected file gets a green check with the fields it populates; anything missing gets an amber "not found, this section will be empty" note.
- Primary action: "Parse & create snapshot" (enabled once a valid ZIP is parsed).

Both paths converge on the same editor (Screen 2). Manual upload is a **first-class, always-available entry point**, not a dev-only feature. Keep this screen free of any developer jargon. Aesthetic direction: calm, spacious, one clear decision; smooth micro-interactions; the drag-drop moment should feel responsive and satisfying; a clear empty state and a clear "parsing" state.

## Screen 2: Snapshot editor (three zones, 1440x900, no horizontal scroll)

Three independently scrolling zones: Block Rail (300px) | Preview (flex) | Inspector (360px).

Header bar (bg #1A2D3D, 56px):
- Left: back-to-queue arrow + AgriProve wordmark.
- Center: property name badge "EUNGELLA" (14px bold #E8EDF2) + status pill "Ready for Review" (success style: bg rgba(52,211,153,0.12), text #34D399, border rgba(52,211,153,0.3), rounded-full). Next to it a **Template selector** dropdown: "Soil Carbon" (options: Soil Carbon, Stacked Opportunity, Environmental Plantings).
- Right: **Model selector** segmented control "Haiku | Sonnet" (Haiku active #3DBA78; tooltips: Haiku "fast, low cost, default", Sonnet "higher quality, higher cost"); a **cost chip** "$0.026" (amber if over threshold); a **QA flag summary** bell showing flag count; a **Settings** gear; the Dev toggle.

### Zone A: Block Rail (300px, bg #0F1A24, padding 12px)

- Header row: "Blocks" (12px uppercase #8FA3B8) and "+ Add block" (#3DBA78, 12px).
- A vertical, reorderable list of block cards in snapshot order. Each card (bg #1E3344, border #2A4055, radius 6px, padding 10px):
  - Drag handle (dotted grip, #8FA3B8) for reorderable blocks.
  - Block title (13px #E8EDF2).
  - A render-kind tag (10px): "Brand" (#3DBA78) for brand-template / image; "HTML" (#8FA3B8) for overlay / native; and a category tag "INTERNAL, not in PDF" (#F59E0B) for the Growth Summary.
  - Page number badge on the right for pages that appear in the PDF.
  - Eye icon (toggle visible / hidden), and a red remove icon (hover only) for non-locked blocks.
  - Locked blocks show a lock icon, no drag handle, no remove (hide only).
  - Selected card: 2px #3DBA78 border, bg #243D52.
  - Drag-to-reorder only within the locked boundaries (cover pinned first, contact last). If a drag would cross a locked boundary, show a red "not allowed" drop indicator.
- "+ Add block" opens a flyout listing available block types grouped by source: "HORIZON", "Verterra ACWIS (coming soon, greyed out)", "Brand pages", "Internal". Each row: name, one-line description, render-kind tag, and "Add".

### Zone B: Preview (flex, bg #0F1A24, padding 24px)

- Preview toolbar (sticky, bg #1A2D3D, rounded 8px): "Prev / Next" arrows; center label "Block 4 of 13, Portfolio & ACCU Potential"; right a "Page | Scroll" view toggle and zoom "− 100% +".
- Thumbnail strip: one thumbnail per block (60x85px). Active: 2px #3DBA78. Brand blocks: small "B" corner tag. Hidden blocks: 40% opacity + eye-off. Internal blocks: amber dot.
- Page display: a centered white page (max-width 595px, aspect ~1:1.414, drop shadow). For brand blocks, show a faithful mock of the marketing-grade page (dark teal #0A2E2A header bands, sage-green #93C572 headings, white body). Add a subtle caption under the page: "Marketing-grade page, exported to PDF" so it is clear this artefact is not edited pixel-by-pixel in the tool. For HTML blocks (maps, economics) show the interactive/native mock.

### Zone C: Inspector (360px, bg #0F1A24, padding 16px)

Top: a horizontal 3-step workflow nav: Review, Edit, Send. Numbered 24px circles connected by lines. Active fill #3DBA78 white number; completed fill #3DBA78 white check; future outline #2A4055 with #8FA3B8 number.

Below the step nav the inspector is contextual to the selected block, as accordion panels:

- **QA flags** (expanded if the block has any): amber list of what needs attention on this block, each with a one-line reason. This is where the reviewer's eye should go first.
- **Data source** (expanded): "SOURCE" label showing how this snapshot was created ("Pipeline, run 2 Jul 2026" or "Manual upload, eungella.zip"); a "Replace data" link (re-pull from pipeline, or upload a new ZIP) that preserves edits where possible; resolved read-only facts (property, total area, eligible area with an amber flag icon if small, rainfall, soil type, ACCU rate); a "Recalculate" link that opens a land-use split override.
- **Copy** (expanded, only for blocks with narrative): a textarea with the generated narrative; word count (amber if over target); a "Standard | Stormboy" register toggle with hint text; **regenerate**: one-tap chips ("Warmer", "Shorter", "More urgency", "Lead with the number") plus a freeform "What should change?" input and a "Regenerate" button (#3DBA78 outline); an edit-memory indicator ("3 guidance notes applied", with a clear link).
- **Layout / slots** (collapsed): the block's named slots with visibility toggles (for composite blocks like Soil & Carbon Indicators: "pH map", "Depth map", "Carbon table").

Sticky action bar at the bottom of the inspector (bg #1A2D3D, border-top #2A4055): primary "Continue to Edit" (#3DBA78, full width, 40px); secondary "Export PDF without editing" (#8FA3B8, centered).

## Growth Summary (internal block, make it visually distinct)

When the "Growth Summary" block is selected, the preview center shows an INTERNAL card (not a white PDF page): a #1E3344 card with an amber "INTERNAL, not sent to landholder" ribbon. Four editable sections: **Opportunity**, **Profile**, **Watch-outs**, **Next step**. Pre-fill Watch-outs with "Small 36.55 ha eligible area, confirm project viability before investing sales time". Buttons: "Copy" (all four parts, for HubSpot / Slack / CRM) and "Regenerate".

## Step 2 (Edit) and Step 3 (Send) variants

- Edit: step nav shows Step 1 complete, Step 2 active. Inspector focuses the Copy panel (larger textarea) while the Block Rail stays visible so the user can move block to block. Action bar becomes "Continue to Send".
- Send: steps 1 and 2 complete, Step 3 active. Panels: **Export** ("Export as PDF" primary, produces one self-contained downloadable PDF, the deliverable; quality "Print 300dpi | Screen 150dpi"; optional "Get shareable link" for an AgriProve-hosted tokenised web version, which is a separate interactive view, not the PDF and not a design-tool link). **Delivery Email** (editable To, Subject "Your HORIZON Snapshot, Eungella", Body textarea, ~150 to 175 words, signs off as Ben, thanks the landholder for hosting Hobbs). Primary **"Send via HubSpot"** with tooltip "Copies the email body and opens HubSpot AP1 filtered by contact, paste into the composer". Below: "Copy to clipboard". Action bar: "Mark as Sent".

## Settings drawer (gear icon)

- **Narrative Guide**: a large textarea of standing rules applied to every generation across all snapshots (example content: "no em dashes; defensible language only; always include the geospatial disclaimer"). "Save" button. Note: "Applied to every block that generates copy".
- **Usage**: all-time and last-30-day stat grid (snapshots, regenerations, total cost, average cost per snapshot).

## Dev mode panel (hidden unless Dev toggle active)

Slides from the right (280px, bg #1A2D3D): "Developer Tools" with a close button. Sections: "API Configuration" (Claude API key input, placeholder "sk-ant-...", Save); "Generate" ("Generate All Blocks" button + status text); "Raw parse" (inspect the parsed fields from the last upload/pipeline load). Note: manual ZIP upload is a normal user entry point on Screen 1b, not a dev feature.

## Demo data (use this, property "Eungella")

- Property: Eungella; Eligible area: 36.55 ha (flag as small); ACCU rate: 5.5 ACCUs/ha/year; Estimated ACCU potential: ~5,026 over 25 years; Number of projects: 1; Baseline cost (Option 1): $10,728; Deferred ACCUs (Option 2): 859; Model: Claude Haiku 4.5; LLM cost: $0.026; Register: Standard.
- Blocks in order: Cover (Brand, locked, p1), HORIZON Analysis (HTML map, p2), Soil & Carbon Indicators (HTML, p3), Portfolio & ACCU Potential (HTML map, p4), Background (Brand, locked, p5), AgriProve Economics (Brand template table, p6), The AgriProve Difference (Brand, locked, p7), The AgriProve Advantage (Brand, locked, p8), The AgriProve Process (Brand, locked, p9), Your ACCUs (Brand, locked, p10), The AgriProve Assessment (Brand, locked, p11), Contact Us (Brand, locked, p12), Growth Summary (internal, not in PDF).

## Constraints

- Internal tool, not a customer portal. All chrome surfaces dark. The only light surface is the white snapshot page in the preview.
- Do not re-create the landholder brochure pages in CSS. Brand blocks are shown as page images with a "Marketing-grade page, exported to PDF" caption. The final output is a single exportable PDF, never a design-tool link.
- Three zones all visible at 1440x900 with no horizontal scroll; each scrolls independently.
- Locked blocks cannot be reordered or removed, only hidden. Dynamic blocks reorder within the cover and contact boundaries. Make the boundary behaviour visible.
- Keyboard: left / right arrows navigate blocks; up / down reorder the selected non-locked block.
- Model selector, cost chip, template selector, QA flags and the Narrative Guide are first-class. Do not bury them.
- The Growth Summary is visibly internal and never appears as a white PDF page.
- Build the Review Queue, the three-zone editor, and the Edit / Send step variants as navigable states.
