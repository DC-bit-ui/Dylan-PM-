# Magic Patterns Prompt — HORIZON Snapshot Tool (v2, Block Editor)

> **Instructions:** Create a new blank design in Magic Patterns, name it `HORIZON Snapshot — Tool v2`, select **Chakra** as the design system, and paste everything below the line. This supersedes `MAGIC_PATTERNS_PROMPT.md` (v1). It keeps the Review → Edit → Send workflow and Frontier dark chrome, and adds the composable **Block Editor** plus the live features to preserve (Growth Summary, Narrative Guide, model selector + cost, guided regeneration).

---

Build a full-page React internal tool for AgriProve's **HORIZON Snapshot Tool**, embedded inside Frontier (AgriProve's internal ops platform). The user is a Growth or Ops team member who reviews, edits and sends an auto-generated soil carbon assessment to a landholder prospect. The snapshot is now a **composable set of Blocks** (an ordered list) rather than a fixed 12-page PDF. The tool lets the user add, remove, reorder and edit blocks and their copy before publishing.

Use the Frontier dark theme with the exact colour tokens below. TypeScript, named exports, Tailwind utility classes with explicit hex values in brackets. Inter font throughout the chrome.

---

DESIGN TOKENS — FRONTIER DARK THEME (exact hex, no substitutions):

- Page background:      #0F1A24
- Panel/nav background: #1A2D3D
- Card surface:         #1E3344
- Card hover:           #243D52
- Card border:          1px solid #2A4055
- Primary text:         #E8EDF2
- Muted/label text:     #8FA3B8
- Frontier ops accent:  #3DBA78  (active states, step indicators, primary buttons — the internal ops green, NOT teal)
- Success green:        #34D399  (completion badges)
- Warning amber:        #F59E0B  (in-progress / cost warnings)
- Error red:            #EF4444  (errors, remove actions)
- Muted grey badge:     #4A6380  (disabled/inactive)
- Border:               #2A4055
- Font:                 Inter, system-ui, sans-serif

---

LAYOUT — THREE ZONES:

A three-zone layout at 1440×900 with no horizontal scroll:
- **LEFT — Block Rail** (300px fixed): the ordered list of blocks (the snapshot outline). Add / remove / reorder here.
- **CENTER — Preview** (flex): the rendered snapshot, one block/page at a time, or continuous scroll.
- **RIGHT — Inspector** (360px fixed): controls for the selected block, and the workflow step controls.

Each zone scrolls independently.

**1. HEADER BAR** (full width, bg #1A2D3D, 56px, no border-bottom)
   - LEFT: AgriProve wordmark (small, muted).
   - CENTER: Property name badge "EUNGELLA" in #E8EDF2 14px bold + status pill "Ready for Review" (bg rgba(52,211,153,0.12), text #34D399, border rgba(52,211,153,0.3), 12px, rounded-full).
   - CENTER-RIGHT: **Template selector** dropdown — "Soil Carbon ▾" (options: Soil Carbon, Stacked Opportunity, Environmental Plantings). 13px, bg #1E3344, border #2A4055. Changing template swaps the block set.
   - RIGHT group:
     - **Model selector** segmented control: "Haiku" (active, #3DBA78) | "Sonnet" (#2A4055). 12px. Tooltip on Haiku: "Fast, low cost — default". On Sonnet: "Higher quality, higher cost".
     - **Cost chip**: "$0.026" with a small coin icon, 12px #8FA3B8; amber (#F59E0B) if a snapshot exceeds a threshold. Tooltip: "LLM cost this snapshot".
     - **Dev** toggle — small, muted (#8FA3B8), becomes #3DBA78 with a dot when active.

**2. WORKFLOW STEP NAV** (top of RIGHT inspector, horizontal 3-step)
   - ① Review → ② Edit → ③ Send. Numbered 24px circles connected by lines.
   - Active: fill #3DBA78, white number, bold label. Completed: fill #3DBA78, white check. Future: outline #2A4055, #8FA3B8 number/label. Connectors: completed #3DBA78, future #2A4055.
   - Default: Step 1 (Review) active.

**3. LEFT — BLOCK RAIL** (300px, bg #0F1A24, full height below header, overflow-y auto, padding 12px)

   Header row: "Blocks" 12px uppercase #8FA3B8, and a "+ Add block" button (right-aligned, #3DBA78 text, 12px).

   Below: a **vertical, reorderable list of Block cards**, one per block in snapshot order. Each card:
   - bg #1E3344, border 1px solid #2A4055, border-radius 6px, padding 10px, margin-bottom 8px.
   - **Drag handle** (⋮⋮ icon, #8FA3B8) on the left — indicates draggable.
   - Block title: 13px #E8EDF2 (e.g. "HORIZON Analysis", "Portfolio & ACCU Potential", "AgriProve Economics").
   - Small type tag under the title, 10px uppercase: "DYNAMIC" (#3DBA78), "STATIC" (#8FA3B8), or "INTERNAL — not in PDF" (#F59E0B) for the Growth Summary.
   - Page-affinity number badge on the right (e.g. "2"), 11px #8FA3B8.
   - **Eye icon** (toggle visible/hidden) and, for non-locked blocks, a **× remove** icon (#EF4444, hover only).
   - **Locked blocks** (Cover, Background, Difference, Advantage, Process, Your ACCUs, Assessment, Contact) show a small lock icon and NO drag handle / remove — they cannot be reordered or deleted, only hidden. (This enforces the brand arc; state this constraint visually.)
   - Selected card: border 2px solid #3DBA78, bg #243D52.
   - The list supports drag-to-reorder for the non-locked dynamic blocks. When a drag would cross a locked boundary (e.g. above Cover or below Contact), show a red "not allowed" drop indicator.

   **Add block flyout** (opens from "+ Add block"): a small panel listing available Block Types grouped by source — "HORIZON", "Verterra ACWIS (coming soon — disabled/greyed)", "Static / brand", "Internal". Each row: block name + one-line description + "Add" button.

**4. CENTER — PREVIEW** (flex, bg #0F1A24, padding 24px)

   **4a. Preview toolbar** (sticky top, bg #1A2D3D, rounded 8px, padding 8px 16px, margin-bottom 16px)
   - LEFT: "← Prev" / "Next →" (icon buttons #8FA3B8, hover #E8EDF2).
   - CENTER: "Block 4 of 13 — Portfolio & ACCU Potential" 13px #E8EDF2.
   - RIGHT: view toggle "Page | Scroll" (segmented), and Zoom "− 100% +".

   **4b. Thumbnail strip** (horizontal scroll, below toolbar)
   - One thumbnail per block (60×85px), bg #1E3344, border 1px #2A4055, radius 4px.
   - Active: border 2px #3DBA78. Dynamic blocks: green dot (6px #3DBA78) top-right. Hidden blocks: 40% opacity + eye-off icon. Internal (Growth Summary): amber dot.

   **4c. Page display** (centered white page, max-width 595px, aspect ~1:1.414, drop shadow 0 4px 20px rgba(0,0,0,0.3))
   - Render the selected block. For the prototype, show a faithful mock of the snapshot page (dark teal #0A2E2A header bands, sage-green #93C572 headings, white body) — e.g. for "HORIZON Analysis": teal "HORIZON SNAPSHOT" band, "HORIZON ANALYSIS" sub-band, a map placeholder with a bottom-right "Horizon Layer" legend (Farm Boundary, Eligible Area, Strength Zones, Reference Zones, Opportunity Zones), and "HORIZON Summary:" body text below. (Real render is built in code; this is the visual target.)

**5. RIGHT — INSPECTOR** (360px, bg #0F1A24, full height, overflow-y auto, padding 16px)

   Below the step nav, the inspector is **contextual to the selected block** and shows these panels as accordion sections. For a dynamic block like "HORIZON Analysis" or "Portfolio & ACCU Potential":

   **5a. Data Source** (expanded)
   - Card #1E3344. Label "SOURCE" 11px uppercase #8FA3B8.
   - Segmented control: "Platform" (active, #3DBA78) | "Upload ZIP" (dev-only, shown only in Dev mode).
   - Shows resolved key facts pulled from the source, read-only: Property "Eungella", Total area, **Eligible area "36.55 ha"** (small amber flag icon with tooltip "Small eligible area — review commercial fit"), Rainfall, Soil type, ACCU rate. This mirrors the current Property Overview.
   - "Recalculate" link (#3DBA78, 12px) opens a small override (e.g. land-use split for mixed enterprises).

   **5b. Copy** (expanded, only for blocks with narrative)
   - Full textarea (bg #0F1A24, border #2A4055, min-height 180px, #E8EDF2, 14px) with the generated narrative.
   - Word count below: "152 / ~150 words" #8FA3B8 (amber if >10% over).
   - **Register** toggle: "Standard" (active #3DBA78) | "Stormboy" (#2A4055). Hint text 11px italic #8FA3B8 changes per register.
   - **Regenerate with feedback** (collapsible): single-line input "What should change?" (#0F1A24 bg) + "Regenerate" button (#3DBA78 outline, small). Below it, an **Edit-memory indicator**: "3 guidance notes applied" 11px #8FA3B8 with a "clear" link.

   **5c. Layout / Slots** (collapsed)
   - Lists the block's named slots with visibility toggles, e.g. "Zone map ✓", "Legend ✓", "Summary text ✓". For composite blocks (Soil & Carbon Indicators), toggles for "pH map", "Depth map", "Carbon table".

   **5d. Action bar** (sticky bottom of inspector, bg #1A2D3D, border-top 1px #2A4055, padding 12px)
   - Primary "Continue to Edit →" (bg #3DBA78, white, full width, 40px, 14px bold).
   - Secondary "Export PDF without editing" (#8FA3B8, 12px, centered).

**6. GROWTH SUMMARY PANEL** (a distinct INTERNAL block — surface it prominently)
   - When the "Growth Summary" block is selected, the preview center shows a **non-PDF internal card** (make it visually distinct — a #1E3344 card with an amber "INTERNAL — not sent to landholder" ribbon), NOT a white page.
   - Four labelled sections, each editable: **Opportunity**, **Profile**, **Watch-outs**, **Next step**. Watch-outs candidly flags commercial risk (pre-fill: "Small 36.55 ha eligible area — confirm project viability before investing sales time").
   - Buttons: "Copy" (copies all four parts to clipboard for HubSpot/Slack/CRM) and "Regenerate".

**7. STEP 2 (Edit)** — inspector variant
   - Step nav: Step 1 completed, Step 2 active.
   - Inspector focuses the Copy panel for the selected block (larger textarea), keeps Register + Regenerate. The Block Rail stays visible so the user can jump block to block while editing. Action bar → "Continue to Send →".

**8. STEP 3 (Send)** — inspector variant
   - Step nav: Steps 1-2 completed, Step 3 active.
   - **Export Options**: "Export as PDF" (primary, #3DBA78) + PDF Quality pills "Print (300dpi) / Screen (150dpi)" + "Get shareable link" (tokenised URL, #3DBA78 outline).
   - **Delivery Email** card: To (editable, pre-filled landholder email), Subject "Your HORIZON Snapshot — Eungella" (editable), Body (editable textarea, ~150-175 words, signs off as Ben, thanks landholder for hosting Hobbs).
   - **Send via HubSpot** (primary, #3DBA78): tooltip "Copies the email body and opens HubSpot AP1 filtered by contact — paste into the composer." Below: "Copy to clipboard" (#8FA3B8).
   - Action bar: "Mark as Sent ✓" (#3DBA78, full width).

**9. SETTINGS — Persistent Narrative Guide** (gear icon in header opens a modal/drawer)
   - Drawer bg #1A2D3D, border-left 1px #2A4055.
   - Section "Narrative Guide" — a large textarea (#0F1A24 bg) holding standing rules applied to every generation across all snapshots (e.g. "no em dashes; defensible language only; always include the geospatial disclaimer"). "Save" (#3DBA78). Note 11px #8FA3B8: "Applied to every block that generates copy."
   - Section "Usage" — all-time and last-30-day: snapshots, regenerations, total cost, avg cost per snapshot. Small stat grid.

**10. DEV MODE PANEL** (hidden unless Dev toggle active) — slides from right, 280px, bg #1A2D3D.
   - "Developer Tools" header + × close.
   - "API Configuration": Claude API key input (#0F1A24 bg, placeholder "sk-ant-..."), "Save" (#3DBA78).
   - "Data source": enable "Upload ZIP" segment in inspector 5a; drag-drop .zip / metadata.txt zone (dashed 2px #2A4055).
   - "Generate": "Generate All Blocks" (#3DBA78) + status text 12px #8FA3B8.

---

COMPONENT DATA — use this realistic AgriProve data (property "Eungella", from the live walkthrough):

- Property: Eungella
- Eligible area: 36.55 ha  (flag as small)
- ACCU rate: 5.5 ACCUs/ha/year
- Cores per project: 24
- Deferred ACCU price: $12.50
- Max deferred baseline: $50,000
- Model: Claude Haiku 4.5 (default)
- Snapshot LLM cost: $0.026
- Register: Standard
- Blocks (in order): Cover(1,static,locked) · HORIZON Analysis(2,dynamic) · Soil & Carbon Indicators(3,dynamic) · Portfolio & ACCU Potential(4,dynamic) · Background(5,static,locked) · AgriProve Economics(6,dynamic) · The AgriProve Difference(7,static,locked) · The AgriProve Advantage(8,static,locked) · The AgriProve Process(9,static,locked) · Your ACCUs(10,static,locked) · The AgriProve Assessment(11,static,locked) · Contact Us(12,static,locked) · Growth Summary(internal, not in PDF)

---

CONSTRAINTS:

- INTERNAL tool, not a customer portal. No investor/referrer branding. All chrome surfaces dark; the only light surface is the white snapshot page in the preview.
- Three zones (Block Rail 300 / Preview flex / Inspector 360) all visible at 1440×900 without horizontal scroll; each scrolls independently.
- Locked static/brand blocks cannot be reordered or removed — only hidden. Dynamic blocks reorder within the locked boundaries (Cover pinned first, Contact pinned last). Make the boundary behaviour visible.
- Keyboard: left/right arrows navigate blocks; up/down reorder the selected non-locked block.
- Model selector, cost chip, template selector, and Narrative Guide are first-class — do not bury them.
- The Growth Summary is visibly INTERNAL and never appears as a white PDF page.
- Dev toggle stays unobtrusive (hidden-in-plain-sight).
- The preview page mock uses the snapshot output palette (dark teal #0A2E2A header bands, sage #93C572 headings, white body), distinct from the dark tool chrome.
