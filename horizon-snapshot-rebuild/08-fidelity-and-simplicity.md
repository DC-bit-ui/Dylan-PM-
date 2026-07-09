# Fidelity guarantee + PM simplicity

**Author:** Dylan Cronje (with Claude) · 3 July 2026
**Answers two standing concerns:** (A) how we deliver pixel-perfect, on-brand, marketing-grade output *every time* and stop Claude producing "close enough"; (B) how the feature stays simple for the daily user and the PM.

---

## A. Why "close enough" becomes structurally impossible

The reason LLM-driven document tools (including the current vibe build) look amateur is that the model, or code the model writes, is responsible for **rendering** — it approximates a layout, and approximation drifts every run. The fix is not better prompting. It is to **remove the model from the rendering path entirely.**

### The one principle: the model never renders. It fills fields.

Three roles, and the model touches only one:

| Role | Owner | Output |
|---|---|---|
| Layout + brand | the **designer**, in Canva (Brand Template) | fixed, human-made, pixel-perfect by definition |
| Values | the **model / pipeline** | text strings, numbers, and map images — content, never layout |
| Render | the **deterministic engine** (Canva Autofill + export) | same inputs → identical pixels, no model involved |

Claude writes a 150-word summary; Canva places it in the designer's frame with the designer's font. Claude's only possible failure is bad *words*, never bad *layout*. **Mental model: treat Claude like a mail-merge field, not a designer.** Mail merge never produces "close enough" layout because it does not do layout.

### Defense in depth — the guarantees stacked

1. **Deterministic, model-free render.** Canva Autofill + export is a fixed function of (template, field values). Same values → identical output. (Contrast: html2canvas / model-generated HTML vary run to run.)
2. **Fonts embedded, never substituted.** Brand fonts live in the template / embedded in the PDF. No web-safe fallback drift — a classic "close enough" tell, eliminated.
3. **Slots are fixed frames.** The model writes into a bounded box it cannot move or resize. Overflow is handled by length budget → autofit to a min font floor → truncate. Text can never push the layout around.
4. **Maps are pre-composed images at 300 dpi**, framed by the user in the framing window (what you framed is what prints), injected as an image. Never drawn live, never soft.
5. **Send-ready gate.** Nothing goes Live or out unless every slot is mapped-or-static, every map has a frame + legend, every copy field is within budget. Automated, not eyeballed.
6. **Visual-regression CI (the anti-drift net).** Render a fixed set of reference properties through each template and pixel-diff against approved golden images. Any diff over threshold fails the build. This is the specific mechanism that catches drift before a customer ever sees it.
7. **Versioned, locked templates.** A template that passes design QA is frozen; editing creates a new version that must re-pass. An approved look cannot silently degrade.
8. **Human sign-off on first Live.** A designer approves the first live render of each template against the Canva reference. One-time per template, not per snapshot.

### The caveat that will otherwise mislead you

The **Claude Design prototype is not the production renderer.** It will look approximate because it is a React mock for testing UX. Do not judge fidelity by the prototype — judge it by the Canva-rendered PDF. The only place the model's output is seen verbatim in production is the **copy** (words), which is governed by budgets, copy rules, register and human review in the Edit step. That is a wording risk, not a layout risk.

---

## B. Keeping it simple — for the daily user and the PM

All the machinery above (dictionary, bindings, namespaces, gates, CI) is **backend complexity that must stay hidden**. The design principle: push complexity into infrequent, role-scoped setup, and keep the recurring journeys clean.

- **Complexity is one-time template setup, not per-snapshot.** Fields + bindings are defined once per template (marketing + PM). Producing a snapshot is then: pick property (or upload ZIP) → guided flow → send. The daily user never touches the dictionary or bindings.
- **The PM's entire recurring surface is one lever: approve a field.** Governance is a small, batched **approval queue** ("LawrieCo requests 6 new fields → review labels + bindings → approve"). Not per-snapshot, not per-send. Infrequent.
- **Plain language, keys hidden.** Marketing sees "Property name"; the PM sees "approve: Microbe test output (LawrieCo, manual)". No one sees `lawrieco.microbeTestOutputs` unless they go looking.
- **Auto-map does the heavy lifting.** Well-named templates map themselves; only exceptions surface for a human.
- **Progressive disclosure.** Daily snapshot flow shows none of this; the Template Hub shows it only to template authors; the approval queue shows it only to the PM.

**Net PM journey for this whole feature:** occasionally clear an approval queue. That is it. Everything else is automated or one-time.

---

## C. What this means for the build (route to engineering)

- Canva Connect Autofill + export is the render engine; no client-side or model-side rendering of brand pages. (Prototype excepted.)
- Stand up the **visual-regression pixel-diff CI** with a golden-image set per template early — it is the guarantee, not a nice-to-have.
- Embed brand fonts; render maps server-side at 300 dpi.
- Build the **field approval queue** as the PM's only recurring surface.
- Treat the send-ready gate as a hard release gate, like a test suite.
