# Reduce it, and settle where interaction lives

An adjustment to what you have built. **This pass removes more than it adds.** The structure is right and there is too much of it on screen at once.

---

## 1 · The interaction model, settled

There are currently four control surfaces competing: the map, the panel, the lens card, and the focus control. **A map that is also a control panel competes with the panel that is also a control panel.** One has to be the instrument and the other the display.

**The panel is the instrument. The map is the display.**

**The map has exactly two interactions and no others.**

- **Hover a region or a project** to identify it.
- **Click a region or a project** to select it.

Selecting scopes the panel to that region or opens that property. That is the whole interaction budget for the map.

**Everything that changes what the map draws is a control in the panel.** Lens selection, stage filtering, any layer switching. None of it sits on the map.

**Nothing is layered over the map.** No summary card, no lens card, no legend card. The map is a map, edge to edge, and it gets the space back.

---

## 2 · What moves off the map

**The lens selector moves into the panel.** It is a control, so it belongs with the controls.

**The summary card goes entirely.** *"13 catchments assessed. Three carry the module. One property is commissioned."* That is the panel's job and the panel already says it.

**The legend reduces to almost nothing.** Seven prospect states with counts, a shading ramp, a contracted row and an explanatory paragraph is a large permanent object serving information a reader needs once. Replace it with the minimum that survives repeat viewing, and let **hover carry identity** instead. A reader who hovers a point learns what it is; a reader who has used the console twice does not need a persistent key.

**Region labels reduce to the module's own.** Thirteen catchments each labelled with a name and a hectare figure is a wall of type on the map, and they collide. **Label the regions the module is being built from. Leave the rest as shape**, identified on hover. That also makes the module's regions read as distinct without needing colour to do it.

---

## 3 · The panel needs a single dominant element per state

Four blocks currently compete at the top of the panel: a since-your-last-visit row, a prose answer, a three-number row, and the pipeline. Nothing leads.

**One element dominates. The rest are visibly subordinate.**

**And the dominant element changes with the state**, because the leading question does.

| State | What leads |
|---|---|
| **Pre-launch** | The coverage answer. Multiples of the target already assessed and eligible. This is the answer to "can you actually do this" |
| **Month 6** | Position against the curve, and what has changed since the last visit |
| **First crediting** | The first issuance, and modelled against validated against issued |
| **At nameplate** | Delivery against the contracted schedule |

**Some blocks are wrong for the state they are in.** A since-your-last-visit row belongs at month 6 and beyond, where there is movement to report. At pre-launch, before the module opens, a row of period-on-period changes is reporting on something that has not started. Likewise a fill-date improvement is a claim about a process that has not yet run for this module.

Where a block has nothing meaningful to say in a state, it does not appear in a diminished form. **It is absent, and something in the state says why.**

---

## 4 · Cut the explanations, keep the labels

This is the largest single density saving available and it is all copy.

**Every lens has an explanatory subtitle. Every pipeline stage has an explanatory subtitle. Every number has a caption.** For this reader that is guidance, and guidance for an expert is redundant: it costs them the effort of cross-referencing an explanation against something they already know.

- Lens names alone. **Recruitment, Carbon, Water, Delivery.** No subtitle under any of them.
- Pipeline stage names alone. The stage names are already plain language and they carry their meaning.
- Values, units and thresholds stay. Those are labels, not explanations, and they are load-bearing.

**The test: if the line explains what something means, cut it. If it states what something is or is worth, keep it.**

One place an explanation earns its keep: **an empty state saying why it is empty and when it resolves.** That is not guidance, it is information that exists nowhere else.

---

## 5 · Lenses appear when they have something to show

Four lenses at every state means two of them are empty at the first state, and an empty control is worse than an absent one because a reader spends a click finding out.

- **Pre-launch:** Recruitment. Water present but not enabled, because that is a purchasable capability and its presence is the point.
- **Month 6:** Recruitment, and Carbon once there is modelled yield to show.
- **First crediting onward:** all four.

A lens gaining options is not an element moving. The control stays in the same place and its contents grow.

---

## 6 · Colour is doing too many jobs

The accent currently appears on a navigation item, the selected lens, three regions, the contracted property, a headline multiple, every pipeline bar and the primary action. When the accent is on everything it signals nothing, and it is the fastest perceptual channel available.

**Reserve the strongest signal for one job per view.** At pre-launch that is the land the module is being built from. Pipeline stages are an ordered sequence and should read as a sequence, not as seven different things. Interface chrome does not take the accent at all.

---

## 7 · What stays exactly as it is

- The four time states and the control that moves between them.
- Regions as fixed geography, cohorts as groupings derived from their members.
- Both property state families and their transitions across time.
- The pipeline in hectares, live from the sales system.
- The property list and both entry routes into a property.
- The section structure and the focus control.

**This is a reduction pass. Do not add anything.**

---

## 8 · Constraints unchanged

- Australian English, no em dashes anywhere including titles, spaced hyphens instead.
- Empty states carry their reason and the date they resolve.
- Nothing modelled presented as validated.
- No dollar value on any credit volume.
- Unconsented landholders never identifiable.
- Nothing moves position between time states.
