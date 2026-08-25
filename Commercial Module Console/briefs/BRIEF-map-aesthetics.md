# Making the map beautiful

The logic is settled. This is about craft. Every instruction here is a technique rather than an adjective, because "make it beautiful" is not actionable and "soften the edge over forty pixels" is.

---

## The one colour rule, and it is computed rather than judged

Checked against the dark surface, the mid-luminance set **passes every test** - lightness band, chroma floor, colour-vision separation, and contrast:

`#7f9c18` olive · `#3987e5` blue · `#d95926` ochre

The bright lime **fails the lightness band at 0.928**, far above the 0.48 to 0.67 range that holds up as an area fill. It passes contrast comfortably.

**So the bright lime is a stroke and accent colour, never a fill.** Edges, points, type, the selected state. Anything with area uses the mid-luminance set at low opacity. A flat lime hexagon will blow out against the dark ground and flatten everything near it; a lime *edge* around a nearly-transparent fill will sing.

That single distinction does more for this map than any other change here.

---

## The recession: depth of field, not a mask

Receding the land outside the catchments is the core move. **How it is done decides whether it reads as craft or as a bug.**

Desaturation alone looks like a loading state. Darkening alone looks like a shadow. **Desaturate, darken, and blur very slightly, together** - that combination is what a camera does, and the eye reads it as depth rather than as damage.

**Then soften the boundary.** A hard edge on a receded basemap draws the eye straight to the edge, which is the opposite of the intent. A transition of roughly thirty to fifty pixels lets the catchment **emerge from the ground** rather than being cut out of it. Nothing about the shape should feel stencilled.

The receded land is still land. It should be legible as terrain, just clearly not the subject.

---

## Hexagons: the edge carries it

A solid hexagon is a game board. A drawn one is an instrument.

**A bright, thin, confident stroke with a fill at very low opacity.** The country inside stays visible, which matters because that country is what is being bought. Fill exists to hold the shape together, not to colour it in.

Three details that separate a hexagon from a shape:

**The centre is a place.** A small precise mark on the base town with its name beneath. That is what turns the hexagon from an abstraction into "a person works from here and can reach this far".

**Vertices can carry a little more weight than the edges between them.** A surveyed quality rather than a drawn one. Subtle enough that nobody notices why it looks precise.

**A drive radius is a reach, not a boundary.** If a treatment can suggest that - the faintest inscribed circle, a soft falloff from the centre - the hexagon starts explaining itself. Worth one attempt; drop it if it adds noise.

---

## Five layers, five registers

Depth is what makes a dark map feel expensive. Each layer needs to be unmistakably in front of or behind the next, and right now most of them share a register.

| Layer | Register |
|---|---|
| Receded land | Desaturated, darkened, soft |
| Catchments | Basemap at full clarity. No border, no fill - just *not receded* |
| Hexagons | Bright stroke, near-transparent fill |
| Projects | Solid marks, the brightest things on the surface |
| Type | Above everything, its own weight |

A reader should be able to say which layer any element belongs to without thinking about it.

---

## Let the frame change with the lens

The four zones are all on the eastern seaboard, so two thirds of the continent is currently empty on the default view. That emptiness is dead weight when the subject is four hexagons, and it is the entire argument when the subject is national opportunity.

**So change the frame, not just the layers.**

On the default lens, **crop tight to the working country** - roughly the eastern third. Four hexagons at a scale where they have presence, the composition filled, the map feeling like a place rather than a diagram.

On the soil carbon and water lenses, **pull back to the whole continent.** The camera move itself carries the message: this is bigger than what you were looking at.

That is the most valuable compositional change available, and it costs one animated transition.

---

## Type on a photographic basemap

Labels over satellite imagery need separation from the ground or they are unreadable. **A hard stroke or halo around type looks cheap** and is the fastest way to make a considered map look like a prototype.

Use a **soft dark glow** instead - a wide, low-opacity shadow that darkens the imagery immediately behind the letterforms without producing a visible outline.

Small, generously letter-spaced, sentence case. Cartographic rather than interface. Place names quiet; zone names slightly stronger; nothing shouting.

---

## Two finishing techniques

**Grain.** A very fine noise over the whole surface, imperceptible individually, unifies crisp vector overlay with photographic basemap. Without it, vectors always look pasted on top. This is the single cheapest way to make the two materials belong to each other.

**Motion.** Nothing on this map should cut. The recession cross-fades. Hexagons draw in along their edges rather than appearing. Stepping through time states animates projects arriving rather than swapping one frame for another. Easing matters more than duration - a fast start and a long settle reads as considered; linear reads as mechanical.

---

## What restraint means here

Restraint is not less colour, less contrast and less presence. It is **fewer things, each of them fully committed.**

One bright accent, used only on the subject. One recession technique, applied consistently. One type treatment. No borders that could be a fill, no fills that could be a stroke, no third grey.

The test: **if an element were removed and nothing was lost, it should not have been there.** And conversely, every element that stays should look deliberate enough that removing it would be obviously wrong.

---

## Constraints

- Australian English, no em dashes anywhere including titles, spaced hyphens instead.
- No legend, no key, no explanatory copy on the map.
- Three type sizes at most across the whole surface.
- Fills use the mid-luminance set. The bright accent is stroke, point and type only.
- Landholders who have not consented are never individually identifiable.

## Yours to decide

Exact opacities, blur radii, easing curves, the falloff distance on the recession, hexagon stroke weight, whether vertices carry emphasis, and how far the frame crops on the default lens.

The requirement is a surface that looks composed rather than assembled, and that someone would want to keep looking at.
