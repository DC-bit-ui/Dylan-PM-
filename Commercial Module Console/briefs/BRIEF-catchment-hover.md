# Every catchment on the map responds

An addition to the map, and a corrected geometry file.

---

## The change

All thirty-five catchments on the map are interactive, not only the four the module is being built from.

**Hovering any catchment surfaces its identity.** Name, state, why it is on the map, and its size. Four values, no sentence.

The quiet ones are currently inert, which makes them read as decoration. They are not decoration - they are the national opportunity, and a reader who hovers one and gets *Macquarie-Bogan, New South Wales, soil carbon opportunity, 7.3 million hectares* understands the scale of the business in a way no caption achieves. **It turns the map from something to look at into something to explore**, at the cost of no permanent pixels at all.

---

## Hover identifies. Click still only selects what can be acted on.

Keep the interaction budget where it is. **Hover identifies any catchment. Click selects only a working zone or a project**, because those are the only things with anything behind them.

A quiet catchment that responds to hover but not to click is correct rather than broken, and it protects the reader from a click that opens nothing.

The label should be inline and light. Hovering a background shape must not move the panel, change the view or disturb the four working zones.

---

## Areas outside the set stay silent

Thirty-five catchments are drawn and thirty-five respond. Everything else on the continent is not drawn and does not react.

That is honest. Land outside the set is not opportunity for this business - it is too arid, too cropped, or not grazing country - and a reader hovering the Simpson Desert and getting nothing has been told something true.

---

## The file

`catchments-national.geojson`, thirty-five features, 89 KB. Each carries:

| Property | Example | Use |
|---|---|---|
| `label` | `Macquarie-Bogan` | The display name |
| `state` | `NSW` | Context on hover |
| `lens` | `carbon` | One of: `recruitment`, `recruitment+water`, `carbon`, `carbon+water`, `water` |
| `focus` | `false` | True for the four working zones |
| `area_ha` | `7342000` | The true area of this geometry |
| `official_name` | `MACQUARIE-BOGAN RIVERS` | Formal hydrological name, if it is ever needed |

**Five labels were wrong in the previous file** and are corrected here - Border Rivers, Murray Riverina, Condamine-Culgoa, Macquarie-Bogan and Mitchell-Thomson had all lost characters. Use this file.

`area_ha` remains the authoritative area for the shape as drawn, and any figure shown on screen should match it.

---

## What hover should say

Four values and nothing else:

- **Name** and state
- **Why it is on the map** - a soil carbon opportunity, a water quality opportunity, or both. Derive this from `lens` rather than storing a sentence.
- **Area**
- For the four working zones only, whatever already appears on selection

No description, no explanation of what a catchment is, no note about the data source. If the hover needs a sentence, it is carrying too much.

---

## Constraints

- Australian English, no em dashes anywhere including titles, spaced hyphens instead.
- No legend or key added anywhere. Hover is what replaces a key.
- The four working zones stay the brightest thing on the surface, and hovering a quiet catchment does not change that.
- One shared colour and weight set.

## Yours to decide

How the label appears and follows the cursor, how a hovered shape acknowledges the cursor without competing with the working zones, and whether hover behaves differently between lenses.
