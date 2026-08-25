# Map and cohort patch

Six changes to the map and the cohort panel in the commercial module console. Everything else stays. One of them needs invention rather than adjustment, and it is flagged as such.

---

## 1 · The hexagons are direct recruitment effort, not the whole story

The four hexagons currently read as though they are where the module comes from. They are not. They are where field agents are based and where direct recruitment happens. Land also arrives from across the country through partner relationships and organic enquiry, and a majority of the portfolio sits outside the four zones.

Both halves of that are worth saying, and together they are a stronger claim than either alone: **there is direct field capacity in four places, and more than one way to get land.** A reader who works out on their own that most projects sit outside the hexagons will otherwise reasonably ask what the hexagons are claiming.

One figure carries it, on the order of *16 of 40 projects from direct field effort*. How and where it appears is yours.

---

## 2 · Projects show nationwide

The map currently has nothing in South Australia, Western Australia, the Northern Territory or Tasmania. That is factually wrong. South Australia carries a significant partner-sourced portfolio and Western Australia is growing quickly.

---

## 3 · Size the dots

Every project is drawn as the same circle, so a 638 hectare project and a 21,000 hectare project are visually identical. At Month 6 the deployment zone cards read Lachlan 28,540 hectares against Fitzroy 7,200, a four-fold difference, and both hexagons carry one identical dot.

Area proportional to the quantity that matters on that tab. Nothing else on this list adds as much.

---

## 4 · Colour by project state, not by how the land arrived

An earlier pass coloured dots by lead source. That is our operational concern rather than the module holder's, and it was already removed from the console in the August review under the ruling that the console reports outcomes and not process.

Colour instead by where the project sits in its journey to credits: **established**, **measured increase**, **credited**.

**A finding on the palette, because the house convention does not survive this use.** The existing convention runs dark green, light green, orange. Tested as three adjacent dot colours on the console surface, the light green and the orange collapse to a delta E of 0.1 under deuteranopia. That is not a near miss, it is the same colour for roughly one man in twelve, and on a map of small dots there is no secondary encoding that rescues it.

A single hue ramp passes every check and is also the more accurate encoding, since the three states are a progression rather than three unrelated categories:

`#556815` established → `#8aab1c` measured increase → `#cdfd29` credited

There is a second reason to prefer it. Orange conventionally signals caution, and credited is the best state a project can be in. On a buyer-facing surface the terminal, most valuable state should read as the brightest, which the ramp does naturally.

This amounts to proposing a correction to the house convention rather than following it. Worth flagging back if you disagree.

---

## 5 · The project count moves into the Properties section

Put the count on the top row of *Properties in the module* rather than on the map. It is already half present as a note on that section header. The map keeps the spatial job; the list keeps the inventory job.

---

## 6 · Cohorts: the part that needs invention

This is the item worth spending real thought on. It has been through two failed attempts and there is a hard constraint that removes the obvious answers.

**What a cohort is.** A group of projects sampled and credited together on an annual cadence. LAC-01 is three projects and 11,740 hectares. It is an administrative grouping, not a place.

**The constraint, settled and not open.** From the August review: *"Cohorts are dots, never shapes. Within a catchment, cohort membership is dispersed and cohorts overlap each other spatially. A polygon or a connecting line implies territory a cohort does not hold."*

So both of the obvious moves are excluded, and the reason is sound: a boundary or a line drawn on land asserts something about that land which is not true. A cohort holds no territory.

**Why the current approach fails anyway.** The remedy attached to that ruling was to colour the dots by cohort. On screen the cohort is not distinguishable at all. The reason is arithmetic rather than styling: there are nine or ten cohorts, and ten mutually distinguishable hues do not exist on a dark satellite basemap. Finding a third area fill colour for this console took a validator sweep; ten is not available at any quality.

**So the problem, stated plainly.** Make cohort membership instantly legible, using something that is neither a colour scheme spanning ten categories nor any mark that spans the space between members.

**One direction that seems to satisfy all of it, offered as a starting point rather than the answer.** Isolation on focus: select a cohort and everything not in it recedes hard, at which point the members are unmistakable with no additional mark at all. Anything further sits *on* the dot rather than *between* dots, so a concentric ring or the cohort reference set beside each member, since neither asserts anything about the ground in between.

That is one route. The interesting question is whether there is a better one, and this is a good problem for an aesthetic answer rather than a functional one. A cohort is a set that acts in time: its members are sampled together, credited together, and locked together until the next round. Something that expressed that shared timing rather than shared space would be closer to the truth of what a cohort is, and nothing in the constraint prevents it.

---

## 7 · Cost comes out of the sampling round figure

Kieren's feedback document, slide 4, comment 2: **no need to show cost** on the *Sampling round* figure. The mobilisation dollar figure comes out of the cohort panel.

---

## Constraints

- Australian English, and no em dashes anywhere including titles. Spaced hyphens instead.
- Modelled and forecast figures described as such, never as measured, validated or issued.
- No polygon, connecting line, or any mark spanning between cohort members.
- The console reports outcomes, not process. Nothing about how we source or organise work.
- Harvest and credit application are annual per cohort.
- Volumes are the purchaser's share.
- Hexagons are drive time reach, not tenure, ownership or quota.
- Three type sizes is the ceiling, and if the title and the mark are clear the explanatory sentence comes out.
- Project references rather than property or landholder names.

## Yours to decide

Proportion, motion, how the direct-effort figure is placed, dot sizing scale and how overlap is handled once sized, and above all how a cohort makes itself known without a shape.

Where what is already there does one of these jobs better than what is described here, keep yours and say so.
