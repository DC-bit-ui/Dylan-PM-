# Revision 02, from the Kieren and Hobbs debrief

**13 August 2026.** What changes in the spec, what is newly confirmed, and two things that need a ruling.

---

## 1 · The marketplace is not a tab. Kieren was explicit.

> *"I don't think I would want them to have access to that all the time though... that's your set up, this **config stage**... it's actually an **initial configuration page**. Like a module, you get them the portfolio view, and then we can have a conversation with you about what we can make accessible, and we can provide you with a list of what's available, and that would allow us to make your experience **bespoke and the price also bespoke** to them."*

And: *"ultimately we'll have a different pricing value on each one of those tabs, because if you're using all of the tabs we're going to charge you more than if you're using only some of them, because it's higher compute."*

**This strengthens the idea rather than weakening it.** He has independently described the marketplace as the thing that produces the tab set and the price, which is exactly the collapse we landed on. The correction is only about persistence: it runs at setup, not permanently in the nav.

So the shell becomes **three product sections plus a configuration stage that precedes them.** For the demo he is unambiguous: *"for our purposes right now we should just assume what they're gonna need."* Pre-configure Corporate Carbon, and if the marketplace appears at all it is as an opening beat showing what was selected, not a live catalogue.

**Section names, from your own framing in the call:** Recruitment · Delivery · Disclosure.

One small challenge on the first. *Recruitment* describes what AgriProve does. *Hectares* describes what the buyer owns, and on a buyer-facing surface the object usually beats the activity. Your call, and it is minor, but worth deciding rather than inheriting.

---

## 2 · Cohorts on the map, scheduled by quarter. This is Kieren's own design idea and it is good.

> *"We're not going to harvest the ACCUs on all of the cohorts in, say, January of one year. It's going to be **staged per cohort throughout the year**... you can highlight cohort one, two, three, four on the map and then have almost an **aggregated cohort view** — this is the estimate you're yielding, cohort A, cohort B, cohort C, **scheduled for delivery Q3, scheduled for delivery Q4**. So they've got that **schedule to enable operational lens** in a visual way."*

That is a complete specification for the Delivery map, and it does something the current build never manages: it makes delivery spatial. Cohorts are geographic, their schedule is temporal, and putting the schedule *on* the cohort marries the two.

He also connects it to the operational metrics: *"the status of where projects are, and that registration declaration cycle is important because that partially will feed into the timing of those cohorts."* So the registration and declaration ladder is not just year-one bookkeeping. It is the input to the delivery schedule, which gives it a job in both sections.

---

## 3 · Schedule 2's pitch is schedulability, not annual crediting

> Dylan: *"this crop of ACCUs will come online predicted at this point."*
> Kieren: *"that's inherently the **elegance of Schedule 2**, because sampling is absolutely no longer reactive. You know exactly how much you've got to do and you know exactly when you have to do it. Once that hectare is locked, that locks all that in."*

Worth reframing. Everything written so far sells Schedule 2 as *sample 10%, credit 100%, annually*. That is the mechanism. **The benefit a financier actually buys is that the delivery programme becomes schedulable rather than reactive**, and a schedulable programme is one you can finance. That belongs in Delivery, next to the cohort schedule.

---

## 4 · The flywheel, and what it does for the velocity panel

You asked what changes after the funding lands. Kieren's answer is the clearest statement of the commercial model anyone has given:

- Each module's initial spend **scales recruitment**
- Each module funds **four people: two regions, each with one field agent and one back-of-house sales person**
- The structure mirrors Hobbs and Ben on Storm Boy, one on farm and one running calls, bookings and visits, but with a marketing budget and the map draw tool behind it so the visits are more targeted
- Modules keep the business self-sufficient. **The inflexion point is Series B**, which the proof points and the revenue make reachable
- **A$50 million from BHP**, staged across module signings rather than arriving at once

**This is why the velocity panel matters more than I argued.** It is not only "are we any good at this". It is a closed loop the buyer can see: their capital funds field capacity, field capacity converts hectares, hectares fill their module. Days-to-contract and hectares-per-field-week stop being process hygiene and become the return on the thing they just funded.

I would not put the FTE arithmetic on screen without a decision, since it exposes AgriProve's cost model. But the *framing* of the velocity panel should carry it.

---

## 5 · Confirmed, and worth locking

**The map earns it, and Kieren gave the reason I had not.** *"It makes it way more real for them. It **gamifies** it, number one. It gives them a way to orient themselves towards the whole thing. And importantly for the platform, it gives us a **foundation upon which to build all the other elements**."* The second half is the strategic argument: the map is the substrate every future capability attaches to, which is why it is worth the permanence.

**Additions register as events.** Your line, and it is a real interaction requirement: *"seeing an extra pin now ping up and getting an insight of, 5,000 more hectares were added to your portfolio."* The map is not a static state, it is a feed.

**Two entry points to the twin**, agreed in the call: directly from the map, and from a project list ranked by predicted return. **Mulloon is the selectable one for the demo.**

**Keep the wow.** *"The Mulloon demo looked really nice, and I think we need to maintain that wow factor, but linking it in with the purely operational and delivery focus, which is what they will be looking at."* Operational is the frame, the twin is the payoff. Do not strip the twin to match the sobriety of the module view.

**The design ethos is now agreed by both of you**, and it is the same finding from a different direction: *"visual-led, as little copy as possible, immediately understandable via visuals"* and *"your eyes should know where to go immediately upon the screen."* That is already the strongest requirement in the prompt and it now has two names behind it.

---

## 6 · Two things that need a ruling before they get built

**Purchasing credits through the marketplace.** You described it in the call as *"additional ESG crediting opportunities added to your portfolio, so that's where you can **purchase reef credits**, where you can **purchase environmental plantings**."* Kieren did not object, which means it will get built.

Environmental plantings credits are ACCUs, which are financial products under Australian law, and AgriProve is an authorised representative rather than a licensee. Reef Credits are a voluntary instrument and may sit differently. **Operating a surface where a buyer purchases credits is a materially different regulated activity to developing projects**, and it is not the same question as AP-2698 on price display. I am not qualified to call it and neither is the design.

The safe build, if the ruling is slow: the marketplace item is the **eligibility assessment**, and any actual transaction happens off-platform. That preserves the whole commercial idea and removes the exposure.

**Is Disclosure a base section or a paid bolt-on?** You listed it as one of the three environments. Kieren's pricing model charges per tab. Those are different answers and the config stage cannot be designed until it is settled.

---

## 7 · One open action from the call

Kieren asked whether the psychological literature on readability and visual fluency had been looked at, and you took it as an action. **I can run that properly** — processing fluency, visual hierarchy and search time, cognitive load, and what the evidence actually supports versus what is design folklore. It would give the visual-led ethos a defensible basis rather than a shared instinct, which matters when it is being defended to Matthew.

Say the word and I will.

---

## What moves into the prompt

| Change | Where |
|---|---|
| Marketplace becomes a configuration stage, not a persistent section | Architecture |
| Three sections: Recruitment, Delivery, Disclosure | Architecture |
| Cohorts on the map with scheduled delivery quarters | Delivery section notes |
| Registration and declaration cycle feeds the cohort schedule | Recruitment section, ladder |
| Schedule 2 framed as schedulability | Delivery section notes |
| Two entry points to the property twin, Mulloon selectable | Map |
| Map additions register as events | Map |
| Visual-led, minimal copy, eyes land immediately | Constraints, strengthened |
