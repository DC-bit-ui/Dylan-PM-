# Magic Patterns Prompt — HORIZON Snapshot Review Tool

> **Instructions:** Create a new blank design in Magic Patterns, name it `HORIZON Snapshot — Review Tool`, select **Chakra** as the design system, and paste everything below the line.

---

Build a full-page React internal tool for AgriProve's **HORIZON Snapshot Review Tool**. This is embedded inside Frontier (AgriProve's internal ops platform). The user is a Growth team member reviewing an auto-generated 12-page soil carbon assessment PDF before sending it to a landholder prospect. The tool shows a preview of the generated snapshot on the right, with review/editing controls on the left.

The workflow has 3 steps: **Review → Edit → Send**. The snapshot data arrives pre-populated from the platform pipeline — there is no upload step in production. A hidden "Dev" toggle exists for developers to manually upload test data.

Use the Frontier dark theme with the exact colour tokens below.

---

DESIGN TOKENS — FRONTIER DARK THEME (use these exact hex values — no substitutions):

- Page background:      #0F1A24
- Panel/nav background: #1A2D3D
- Card surface:         #1E3344
- Card hover:           #243D52
- Card border:          1px solid #2A4055
- Primary text:         #E8EDF2
- Muted/label text:     #8FA3B8
- Frontier ops accent:  #3DBA78  (use for active states, step indicators, primary buttons — NOT teal, this is the Frontier internal ops green)
- Success green:        #34D399  (completion badges)
- Warning amber:        #F59E0B  (in-progress indicators)
- Error red:            #EF4444  (error states)
- Muted grey badge:     #4A6380  (disabled/inactive states)
- Border:               #2A4055
- Font:                 Inter, system-ui, sans-serif

---

LAYOUT STRUCTURE:

The page is a two-panel layout: left sidebar (380px fixed) for controls, right panel (remaining width) for document preview. No horizontal tab nav — this is NOT a standalone portal. It is a tool view embedded in Frontier.

**1. HEADER BAR** (full width, background #1A2D3D, 56px tall, no border-bottom — relies on bg contrast)
   - LEFT: AgriProve wordmark/logo (small, muted)
   - CENTER: Property name badge — shows the property being reviewed: "DAWLISH ROAD" in #E8EDF2, 14px bold, with a status pill to the right: "Ready for Review" in success green badge style (bg: rgba(52,211,153,0.12), text: #34D399, border: rgba(52,211,153,0.3), 12px, rounded-full, px-10 py-2)
   - RIGHT: "Dev" toggle button — small, muted (#8FA3B8 text, no border, 12px), toggles developer mode. When active: text becomes #3DBA78, subtle dot indicator.

**2. WORKFLOW STEP NAV** (inside left sidebar, top section, horizontal 3-step indicator)
   - Three steps in a horizontal row: ① Review → ② Edit → ③ Send
   - Step indicator style: numbered circles (24px diameter) connected by lines
   - Active step: circle fill #3DBA78, white number, bold label below
   - Completed step: circle fill #3DBA78, white checkmark, label in #E8EDF2
   - Future step: circle outline #2A4055, number in #8FA3B8, label in #8FA3B8
   - The connecting lines between steps: completed segment = #3DBA78, future = #2A4055
   - Currently show Step 1 (Review) as active, Steps 2-3 as future

**3. LEFT SIDEBAR** (380px, background #0F1A24, full height below header, overflow-y auto, padding 20px)

   Content changes based on active workflow step. For the default view (Step 1: Review), show these panels as collapsible accordion sections:

   **3a. Property Overview** (expanded by default)
   - Card surface #1E3344, border 1px solid #2A4055, border-radius 8px, padding 16px
   - Property name: "Dawlish Road" — 16px bold #E8EDF2
   - Address: "Dawlish Road, Strathbogie VIC 3666" — 13px #8FA3B8
   - Two-column stat grid below:
     - Total Area: "39 ha" — value 18px bold #E8EDF2, label 11px uppercase #8FA3B8
     - Eligible Area: "28.9 ha (74%)" — same styling
     - Rainfall: "1,542 mm" — same styling
     - Soil Type: "Sodosol" — same styling
   - Bottom row: "ACCU Rate: 1.04 ACCUs/ha/year" — in a subtle accent bar (left-border 3px solid #3DBA78)

   **3b. ACCU Calculations** (collapsed by default)
   - Card surface #1E3344, same styling
   - Summary stats:
     - Estimated ACCU Potential: "~752 over 25 years" — value in #3DBA78, 20px bold
     - Number of Projects: "1 (~400ha each)"
     - Baseline Cost (Option 1): "$8,670"
     - Deferred ACCUs (Option 2): "694 ACCUs"
   - Small "Recalculate" link button in #3DBA78, 12px

   **3c. Generated Narratives** (collapsed by default)
   - Card surface #1E3344
   - Two sub-sections, each with a label and preview:
     - "Page 2 — HORIZON Summary" — label 11px uppercase #8FA3B8
       - Preview: first 2 lines of narrative text in 13px #E8EDF2, truncated with "..."
       - "Edit" button — text button in #3DBA78
     - "Page 4 — Property Summary" — same pattern
   - Communication style selector at bottom: "Style" label + two toggle pills: "Standard" (active, #3DBA78 bg) and "Stormboy" (inactive, #2A4055 bg)

   **3d. Action Bar** (sticky at bottom of sidebar, above any scroll)
   - Background: #1A2D3D, border-top 1px solid #2A4055, padding 12px 20px
   - Primary button: "Continue to Edit →" — bg #3DBA78, text white, border-radius 6px, full width, 40px tall, 14px bold
   - Secondary link below: "Export PDF without editing" — text #8FA3B8, 12px, centered

**4. RIGHT PANEL — DOCUMENT PREVIEW** (remaining width, background #0F1A24, padding 24px)

   **4a. Page Navigation Toolbar** (sticky top of preview area)
   - Background: #1A2D3D, border-radius 8px, padding 8px 16px, margin-bottom 16px
   - LEFT: "← Prev" and "Next →" arrow buttons (icon buttons, #8FA3B8, hover #E8EDF2)
   - CENTER: "Page 2 of 12" — 13px #E8EDF2
   - RIGHT: Zoom controls — "−" and "+" buttons with "100%" label between

   **4b. Thumbnail Strip** (horizontal scroll, below toolbar)
   - Row of 12 small page thumbnails (60px wide × 85px tall each)
   - Each thumbnail: bg #1E3344, border 1px solid #2A4055, border-radius 4px
   - Active thumbnail: border 2px solid #3DBA78
   - Dynamic pages (1, 2, 3, 4, 6) get a small green dot indicator (6px circle, #3DBA78) in top-right corner
   - Thumbnails show simplified page previews:
     - P1: white left half / dark right half (cover split)
     - P2: dark header bar + light blue map area + text block below
     - P3: two map rectangles stacked + table at bottom
     - P4: satellite map top + dark card bottom
     - P5: dark bg with white rounded cards
     - P6: dark bg with two table sections
     - P7-P12: generic dark/light patterns

   **4c. Single Page Display** (centered, below thumbnails)
   - Show ONE page at a time, centered horizontally
   - Page container: max-width 595px (A4 width at 72dpi), aspect ratio ~1:1.414
   - The actual page content is NOT rendered here in this prototype — show a placeholder:
     - Background: #FFFFFF (representing the actual Canva PDF page)
     - Center text: "Page 2: HORIZON Analysis" in #8FA3B8, 16px
     - Below: "[Canva template will be faithfully replicated in Claude Code build]" in #8FA3B8, 12px italic
   - Subtle drop shadow: 0 4px 20px rgba(0,0,0,0.3)

**5. DATA SOURCE TOGGLE** (top of left sidebar, above Step Nav)
   - A small segmented control: "Platform" (default, active) | "Upload ZIP"
   - Styling: bg #1A2D3D, border 1px solid #2A4055, border-radius 6px, height 32px
   - Active segment: bg #3DBA78, text white, 12px bold
   - Inactive segment: bg transparent, text #8FA3B8, 12px
   - When "Platform" is active: property data loads from the backend API (production flow)
   - When "Upload ZIP" is active: shows an inline upload panel (Section 5a below) instead of the Property Overview panel. All other panels remain the same — the upload replaces the data source, not the workflow.
   - Use case label below toggle: "Use Upload for properties with existing model output files" in 11px #8FA3B8, italic

   **5a. ZIP UPLOAD PANEL** (replaces Property Overview when "Upload ZIP" is selected)
   - Card surface #1E3344, border 1px solid #2A4055, border-radius 8px, padding 16px
   - Header: "Upload Model Output" — 14px bold #E8EDF2
   - Drag-and-drop zone: dashed border 2px #2A4055, border-radius 8px, 100px tall, centered content:
     - Upload icon (cloud-upload, 24px, #8FA3B8)
     - "Drop .zip file here" in 13px #8FA3B8
     - "or browse files" link in #3DBA78, 12px
   - On file selected/dropped: zone collapses to a single row showing filename + file size + "✕ Remove" button
   - Below the zone: "Parse & Load" button — full width, bg #3DBA78, text white, 36px tall, 13px bold
   - After parsing: Property Overview panel reappears below with the parsed data populated (same layout as Section 3a but with data extracted from metadata.txt and GeoJSON)
   - Accepted formats: .zip containing model output files, or individual metadata.txt

**6. DEV MODE PANEL** (hidden by default — only visible when Dev toggle is active)
   - Slides in as a narrow panel (280px) from the right edge, overlaying the preview
   - Background: #1A2D3D, border-left 1px solid #2A4055
   - Header: "Developer Tools" in 14px bold #E8EDF2, with × close button
   - Section 1 — "API Configuration":
     - Label: "Claude API Key" — 11px uppercase #8FA3B8
     - Input field: bg #0F1A24, border 1px solid #2A4055, text #E8EDF2, placeholder "sk-ant-..."
     - "Save" button: small, #3DBA78 text
   - Section 2 — "Generate Narratives":
     - "Generate All" button: full-width, bg #3DBA78, text white
     - Status text below: "Narratives will be generated using Claude API" in 12px #8FA3B8

---

COMPONENT DATA — use this realistic AgriProve data (not lorem ipsum):

- Property: Dawlish Road, Strathbogie VIC 3666
- Total area: 39 ha
- Eligible area: 28.9 ha (74%)
- Rainfall: 1,542 mm
- Soil type: Sodosol
- ACCU rate: 1.04 ACCUs/ha/year
- Estimated potential: ~752 ACCUs over 25 years
- Projects: 1 (~400ha each)
- Baseline cost: $8,670
- Deferred ACCUs: 694

---

CONSTRAINTS:

- This is an INTERNAL TOOL, not a customer-facing portal. No need for investor/referrer branding patterns.
- All surfaces dark — no white or light-grey backgrounds on the tool chrome. The only white surface is the document page preview itself (the actual snapshot pages are white/dark teal per Canva template).
- The document preview shows a PLACEHOLDER page, not actual rendered content. The real 12-page template will be built separately in Claude Code as a pixel-faithful Canva replication.
- Left sidebar + right preview must both be visible at 1440×900 without horizontal scroll.
- The sidebar scrolls independently from the preview area.
- Step nav, property overview, and action bar should be visible without scrolling the sidebar.
- Use Inter font throughout for the tool chrome.
- TypeScript, named exports, Tailwind utility classes with explicit hex values in brackets.
- Keyboard navigation: left/right arrow keys should navigate between pages.
- The Dev toggle is a small, unobtrusive button — not a prominent feature. It should feel hidden-in-plain-sight.

---

STEP 2 (Edit) LAYOUT — build this as a tab/state variant:

When the user clicks "Continue to Edit →", the left sidebar changes to show:
- Step indicator updates: Step 1 completed (checkmark), Step 2 active
- **Narrative Editor** (main panel, expanded):
  - "Page 2 — HORIZON Summary" section:
    - Full textarea (bg #0F1A24, border #2A4055, min-height 200px, text #E8EDF2, 14px)
    - Character count below: "142 / ~150 words" in #8FA3B8
    - "Regenerate with feedback" collapsible:
      - Small input: "What should change?" — single line, #0F1A24 bg
      - "Regenerate" button: #3DBA78 outline, small
  - "Page 4 — Property Summary" section: same pattern
- **Communication Style** toggle (Standard / Stormboy) — same as Step 1
- Action bar changes to: "Continue to Send →"

---

STEP 3 (Send) LAYOUT — build as another state variant:

When user reaches Step 3:
- Step indicator: Steps 1-2 completed, Step 3 active
- **Export Options** panel:
  - "Export as PDF" button — primary, full width, #3DBA78
  - "PDF Quality" selector: "Print (300dpi)" / "Screen (150dpi)" — toggle pills
- **Delivery Email** panel:
  - Preview of auto-generated email:
    - To: "[landholder email]" — editable input
    - Subject: "Your HORIZON Snapshot — Dawlish Road" — editable input
    - Body preview: card showing email text (editable textarea, 13px)
    - "Send via Outlook" button — #3DBA78 outline
    - "Copy to clipboard" link — #8FA3B8 text
- Action bar: "Mark as Sent ✓" button — #3DBA78 bg, full width
