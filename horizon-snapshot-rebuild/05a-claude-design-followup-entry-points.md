# Claude Design — Follow-up Prompt: manual upload entry point (corrected)

> Additive/corrective prompt for the already-built tool. The pipeline is the primary entry point and already surfaces on the Review Queue dashboard, so there is NO chooser page. Manual ZIP upload is a secondary fallback: a header button that opens a single modal with an instruction set + drag-drop. Reuses the existing design system (no colours/tokens). Em-dash-free.

---

Two changes to the New Snapshot flow. Reuse the existing design system. Do not restyle other screens.

1. **Remove the separate "Create a HORIZON Snapshot" chooser page entirely.** The pipeline is the primary entry point and already surfaces on the Review Queue dashboard (pipeline snapshots arrive there automatically), so it needs no chooser and no pipeline button.

2. **Make the header button a single manual-upload action** (the secondary, fallback path). Rename "+ New Snapshot" to **"Upload snapshot"**. Clicking it opens a **modal, not a page**, titled "Upload a property snapshot", containing in order:

   a. A short **instruction set** for getting the ZIP out of Frontier, shown as clear numbered steps:
      1. In Frontier, open the property of interest. If a snapshot has not been generated yet, use Actions > Request Snapshot, then click the link in the channel notification once it surfaces. Otherwise just search for the property.
      2. In the property's right-hand panel, open the "Carbon Analysis" container, expand it, and click "Download Snapshot".
      3. Return here and upload the ZIP below.

   b. The **drag-and-drop upload zone** ("Drag your property .zip here, or browse") that responds on dragover and accepts `.zip`.

   c. On drop: a parse / progress state, then the **detected-contents checklist** (metadata.txt, map.png, map_ph.png, map_depth.png, horizon_landscape.geojson, input.geojson, classified.geojson) with a check per detected file and a subtle "not found, this section will be empty" note for anything missing.

   d. Primary action **"Parse & create snapshot"**, enabled once a valid ZIP is parsed. On success, go straight to the editor.

Keep it to one modal. No extra full-screen page. Aesthetic direction: calm, clear numbered steps, satisfying drag-drop.
