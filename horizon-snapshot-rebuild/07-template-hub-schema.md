# Template ingestion + Template Hub — functional schema

**Author:** Dylan Cronje (with Claude) · 3 July 2026
**Goal:** a Template Hub where marketing can bring in any template (Canva link preferred, PDF fallback), map its variable areas to data with minimal effort, preview it, and publish it Live for snapshot creation. Built on the template contract (doc 06) and the data dictionary (doc 01 §4B).
**Design north star:** marketing does design in Canva; the Hub does mapping and validation. The easiest possible path is "name your Canva fields from our list, paste the link, click Publish."

---

## 1. Object schema

### Template
```jsonc
Template {
  "id": "tpl_reef_case_study",
  "name": "Reef Credit — Case Study",
  "source": "canva-link" | "pdf",
  "canvaTemplateId": "BAF..." ,        // when canva-link
  "pdfAssetId": "asset_...",           // when pdf
  "interests": ["reef-credit"],        // opportunity scope; ["shared"] for brand pages
  "version": 3,
  "status": "draft" | "needs-mapping" | "send-ready" | "live" | "archived",
  "pages": [ /* Page[] */ ],
  "thumbnail": "url",
  "createdBy": "marketing-user",
  "updatedAt": "2026-07-03T10:00:00+02:00",
  "publishedBy": "pm-user",            // set on first go-Live (approval gate)
  "changelog": [ { "version": 3, "ts": "...", "note": "new economics figure field" } ]
}
```

### Page
```jsonc
Page {
  "id": "pg_2",
  "order": 2,
  "role": "cover" | "shared-brand" | "opportunity" | "contact",
  "interest": "soil-carbon" | "shared" | ...,
  "locked": false,                     // cover/contact = true (fixed position)
  "slots": [ /* Slot[] */ ]
}
```

### Slot (the unit that gets filled)
```jsonc
Slot {
  "id": "slot_p2_summary",
  "label": "HORIZON summary",          // human label shown in the Hub
  "type": "text" | "number" | "currency" | "map" | "image" | "static",
  "fieldKey": "copy.page2" | "calcs.totalAccu" | "maps.zone" | null,  // dictionary anchor; null = unmapped or static
  "opportunityScope": "soil-carbon",
  "status": "mapped" | "unmapped" | "static" | "flagged",

  // type: text (copy)  -> generated narrative
  "copy": { "maxChars": 900, "minFontPt": 9, "overflow": "shrink-then-truncate", "register": "agnostic",
            "authoringNote": "keep to two sentences, lead with rainfall" },  // optional per-field intent/tone; shapes words, not placement

  // type: number/currency (data-value)
  "data": { "formatOverride": "ha" | "hectares" | "~#,###" | null },

  // type: map/image
  "map": { "rect": {"xPct":7.4,"yPct":30,"wPct":85,"hPct":45}, "aspect":"16:9", "dpi":300,
           "legend": "tool-composed" | "baked-static" }
}
```

The `fieldKey` is the contract anchor. It must resolve to a data dictionary value (doc 01 §4B) or the slot is `static`. Nothing outside a slot is ever written.

---

## 2. Ingestion flow (what marketing does)

1. **Add template** → paste a **Canva link** (preferred) or upload a **PDF**.
2. **System reads slots:** Canva → read the Brand Template dataset (named fields); PDF → find `{{token}}` placeholders, or open the manual box-drawing step.
3. **Auto-map:** each detected field is matched to a dictionary value by exact key or known alias. Auto-mapped slots turn green. This is where the naming cheat-sheet (below) earns its keep — good names = 100% auto-map, zero manual work.
4. **Review & map (only what's left):** unmapped fields are listed; marketing picks the value from a plain-language dropdown ("Estimated ACCUs (25 yr)") or marks it **Static**. For map slots, confirm the rectangle and the legend choice. For copy slots, confirm the length budget (auto-suggested from frame size).
5. **Live preview** with a sample property (Eungella): see it render, catch overflow and legend overlap.
6. **Send-ready check** (gate): all slots mapped-or-static, every map slot has frame + legend, every copy slot has a budget. Pass → **Publish to Live** (first publish routes through a light PM/brand approval).
7. **Live:** the template appears in the interest selector / Add-page picker for snapshot creation. Editing a Live template creates a new version that must re-pass the check.

### Template states
`Draft` (ingested, not mapped) → `Needs mapping` (unmapped slots remain) → `Send-ready` (all resolved) → `Live` (approved, usable) → `Archived`.

---

## 3. What makes it super easy for marketing

- **The naming cheat-sheet.** The Hub publishes the exact field names to use in Canva (copy-paste list, grouped and plain-language). If marketing names their fields from it, ingestion is one click and auto-map hits everything. This is the single biggest ease lever.
- **Plain language, never keys.** Marketing sees "Property name", "Estimated ACCUs (25 yr)", "Zone map" — never `calcs.totalAccu`. The key mapping is hidden.
- **Auto-map first, surface only exceptions.** Green auto-mapped rows collapse; the review list shows only what needs a decision.
- **Click-to-locate.** Clicking a slot in the Hub highlights it on the preview, so marketing sees exactly what they are mapping.
- **Sample-data live preview** with a real property, so overflow and legend overlap are caught before Live.
- **One "what's left to go Live" checklist**, not a wall of settings.
- **Templates library:** searchable list with thumbnail, interest, status chip, version, last edited, and duplicate/archive.

---

## 4. Locked decisions (2026-07-03)

1. **Field naming strictness — LOCKED.** Publish exact names + a curated **alias table**; fuzzy matches are *suggestions requiring confirm*, never auto-applied.
2. **Legend ownership — LOCKED.** **Tool-composed legend** by default (doc 06 §4); per-map "baked-static" override allowed.
3. **Publish approval — LOCKED.** Marketing self-serves Draft→Send-ready; **first go-Live needs a light PM/brand approval**; later versions of an approved template are marketing-self-serve.
4. **Versioning — LOCKED.** Editing a Live template creates a new version that must re-pass send-ready; the old version stays Live until the new one is approved.
5. **Dictionary additions — LOCKED.** New data fields need a dictionary key before a template can bind them; **PM (Dylan) owns approving a new dictionary field**. This is the governance seam.

### Per-field authoring note (copy intent)
Each copy slot may carry an optional `authoringNote` (tone, length, what to convey). It shapes the generated words for that field, not its placement. Placement is always the named native field (doc 06 §2A).

---

## 5. PM workstream

Add "Template ingestion + Template Hub" as a high-level PM task: own the field-naming convention + cheat-sheet, the send-ready gate, the approval + versioning policy, and the dictionary-addition governance. The build is the naming convention + gate more than the upload UI.
