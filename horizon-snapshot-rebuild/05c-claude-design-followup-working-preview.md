# Claude Design — Follow-up Prompt: real pages + collapsible page manager

> Additive/corrective prompt for the already-built tool. Two changes: (1) render the real snapshot pages and make the preview functional; (2) keep full page management (reorder, add, edit, remove) in the snapshot editor but make it easier and collapsible. Reuses the existing design system (no colours/tokens). Em-dash-free.
>
> This supersedes the earlier "move page management into a separate Template Editor mode" idea. Management stays in the snapshot editor; it is just collapsible and easier to use.
>
> Attach to the Claude Design session: `template_page_01.png` .. `template_page_12.png` from `C:\Dylan PM\horizon-snapshot\`. Optionally `COLOUR_SPEC_FOR_HORIZON_OUTPUT.md` for map legend colours.
>
> Note: a prototype cannot call Canva's Autofill/export API live (that is a production backend function). "Bringing in the real pages" in the prototype = displaying the actual exported page images and overlaying live sample data on them. The live Canva render is wired in the real build.

---

Two changes. Reuse the existing design system. Do not restyle unaffected screens.

**1. Show the real pages, and make the preview functional.**
- I am attaching the actual exported snapshot pages as images: `template_page_01.png` through `template_page_12.png`. Use each as the rendered preview for its block (page 1 = Cover, page 2 = HORIZON Analysis, and so on). Replace the placeholder "Marketing-authored page / MARKETING FIGURE / BRAND PANEL" mocks with these real page images.
- Make the preview genuinely work: prev/next, the thumbnail strip, Page/Scroll toggle and zoom all navigate these real pages.
- Overlay the live sample data on the pages so edits are visible in the preview: the property name on the Cover; the generated copy on HORIZON Analysis (page 2) and Portfolio & ACCU Potential (page 4); the ACCU numbers on Portfolio (page 4) and the Economics tables (page 6). Editing copy or recalculating in the inspector updates the overlaid text on the page image in real time.
- On the map pages (2, 3, 4), render a working map component with sample zones over the page, rather than a static crop, so the map reads as functional.
- Keep the caption that these brand pages are rendered server-side to a print-grade PDF in production; in this prototype they are shown from the attached page exports.

**2. Keep full page management in the editor, make it easier and collapsible.**
- Keep the left page-management panel in the snapshot editor with full functionality: **drag-to-reorder, add pages, edit, hide/show, remove, and duplicate**. Available while preparing any snapshot.
- Make the panel **collapsible**: a clear collapse/expand control. Collapsed, it reduces to a thin strip (or tucks away) so the preview gets maximum room; expanded, it shows the full page list. Remember the state. Default to a clean view where the panel can be opened when the user wants to manage pages.
- Make management **easier to use**: compact page rows with obvious drag handles; a clear locked indicator on brand/structural pages (they can be hidden but not removed, and reordering is constrained so the cover stays first and contact stays last); inline actions (edit, hide, remove, duplicate) revealed on hover or via a small per-row menu.
- Keep the **"+ Add block" picker** (grouped HORIZON / Verterra ACWIS / Brand pages / Internal, with Add buttons and "Soon" states) as the way to add a templated page.
- Named templates still define the starting page set for a snapshot type; saving structural changes back to a template can be a later, explicit action, not a separate mode.
