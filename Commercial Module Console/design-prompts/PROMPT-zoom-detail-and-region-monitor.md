# Zoom-appropriate detail, and the region monitor

Two adjustments. Both reduce what is on screen at once. **Do not add anything.**

---

## 1 · The map shows what is legible at the zoom it is at

At national extent the map currently draws every assessed property as a point. Several hundred points inside thirteen regions cannot be counted, cannot be told apart by state, and collide with each other. **They are texture, not information.**

**Detail arrives with zoom.**

| Zoom | What the map draws |
|---|---|
| **National** | Region boundaries, with an indicator of each region's role and progress. **Plus every project in the module**, individually, because those are what the buyer owns |
| **Region** | Prospect properties appear as points in their pipeline states. Cohort groupings appear once they exist |
| **Property** | The property's own detailed view |

**The rule underneath it: the buyer's own land is always visible, at every zoom.** Prospects are third-party land that has not been contracted, they are aggregate at national scale, and they only become individually meaningful when the reader is close enough to act on one.

That also solves a privacy problem for free. Unconverted landholders are never individually identifiable at a zoom where a reader could pick one out.

**At the first time state this means one project point on a map of Australia**, named, sitting inside one region. That is the honest picture and it is a strong one: everything else on screen is capability, and this single point is what has been committed.

### What a region must communicate at national zoom, without being read

- **Which regions carry the module** and which are assessed but not in play. This must be perceptible before any label is read.
- **Roughly how far each carrying region has filled.** Approximate is enough at this zoom. Precision belongs in the panel.

**One grammar for every region label, or none.** Currently some regions carry a hectare figure, some carry a three-number sentence, and some carry nothing, so a reader must first work out which kind of label they are looking at. **Region detail belongs in the panel.** On the map a region needs its name and nothing else.

---

## 2 · The region monitor

Replace the region information currently carried in map labels with a monitor in the panel. Its job is **one glance: which regions are carrying the module and how is each doing.** Not a table to read.

### One row per region, and the row is a mark, not a sentence

Each region shows three quantities that belong on **one track**: what is contracted, what is in the pipeline behind it, and the region's target contribution. Contracted and pipeline are both progress toward the same target and share a scale, so they share a track.

**A reader must be able to answer two questions from the shape alone, without reading any number:**

- **Is this region on track?** How much of its target is contracted.
- **Can it finish?** Whether there is enough in the pipeline behind it to cover what is left.

That second question is the one the current design cannot answer at all, and it is the more useful of the two.

### Everything else is secondary or on demand

Region name and the track, plus at most one figure. **No sentences.** Whether a field team is present, whether a campaign is running, which instruments the catchment carries, and the cohorts inside it are all detail that appears on selection, not in the row.

### Ordering

**By attention, not alphabet.** The interesting region early in the module's life is the one furthest behind its curve. Once the module is full, ordering shifts to contribution.

### The total is visibly the sum

The module's overall position is the sum of the region rows and should read that way. A reader must be able to see that the module fills because its regions fill, rather than being handed an aggregate and a separate list.

### It degrades correctly

**Before the module opens, every contracted figure is zero.** The track still works, because pipeline depth is the meaningful quantity at that point and it is the answer to "can you finish". The row does not disappear or collapse; it shows what is true.

### Selecting a region

Selecting a row scopes the whole view to that region: the map moves to it, the pipeline scopes to it, the event feed scopes to it. Selecting it again returns to the module view. **Selection is the only route to region detail** — nothing about a region is permanently expanded in the list.

---

## 3 · Copy

The region rows carry a name, a track, and at most one number. Nothing explains what a region is or what the track means.

Where the current build states a region's position as a sentence with several figures and a separator, that is a decoding task rather than a reading task. **The shape carries the position. The figures confirm it.**

---

## 4 · Unchanged

The map's two interactions remain hover to identify and click to select. All controls remain in the panel. The four time states, the region and cohort distinction, the property state families, the property list and both entry routes are unaffected.

Australian English, no em dashes anywhere including titles, spaced hyphens instead. Empty states carry their reason and the date they resolve. Nothing modelled presented as validated. Unconsented landholders never identifiable.
