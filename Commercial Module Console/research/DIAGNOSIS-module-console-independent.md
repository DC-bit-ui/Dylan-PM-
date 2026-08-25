# Independent diagnosis: why the module console does not convince

**12 August 2026.** Formed against §3 of `KICKOFF-prototyping-and-module-delivery.md`, before reading the three prior reviews. Prior reviews read afterwards and reconciled at §5.

Diagnosis only. No briefs, no prescriptions, no layout direction.

---

## 0 · What I could and could not see, because it bounds everything below

**Could not see the build.** The `.dc.html` files are not in any connected folder. DesignSync cannot authorise in this session, and the Claude Design links and Loom walkthroughs posted to Teams on 11 August are not reachable from here.

So this diagnosis is formed from the handover document describing the current state of `Module and Monetise V2`, the eight briefs and strategy notes in `Bank and institution exploration/`, Teams from 1 July, the Verterra and Warnken correspondence, and Granola summaries.

**What that means in practice.** Findings 1 to 6 are about content, object model and evidence. They do not depend on seeing pixels and I hold them at [high]. Anything about visual register is at [moderate] at best and is marked. **On the specific words "does not visually convince" I am partly guessing, and you should discount me accordingly.**

**One source note.** Granola transcripts are gated behind a paid tier on this account and public-workspace notes are excluded by the plan, so everything from Granola is a generated summary, not verbatim. Atlassian is unauthorised in this session, so AP-2707, AP-2708, AP-2698, AP-2719 and AP-2720 exist here as titles only.

**One state correction.** §6 of the kickoff says the Module tab is built and the other four sections are briefed but not built. The handover describes all five as built. The handover is later. I have diagnosed the five-section build.

---

## 1 · The diagnosis, in one paragraph

The console shows what the machine produces and never shows what the machine has proved. Every panel on the Module tab is an output - a forecast, a leaderboard, a cohort, a flag, a statistic the model computes about itself. Not one of them is a thing a sceptic can check against an external fact. And because the surface is set in 2030, the outputs it shows have not happened yet: the measured content is simulated. The result is an artefact that any competent competitor with a design tool and no soil cores could build in a fortnight, and which a carbon desk will read that way inside thirty seconds. **The trust problem is not that the interface communicates the evidence badly. It is that the evidence is not on the interface.**

---

## 2 · The findings, heaviest first

### 2.1 The console is set in 2030, so its measured figures are invented [high]

The handover states a *2030 · today* marker on the price panel, 761,856 ACCUs delivered by 2030 against a scheduled 742,500, and a chart running 2028 to 2032 with the two pre-crediting years cut.

Today is August 2026. The module term starts 1 April 2026. **Zero crediting years have elapsed.** Every delivery figure on the surface describes a state four years away.

The prior review praises the `[Measured]` / `[Modelled]` badges as the best single decision in the build, and on its own terms that is right. But `[Measured]` is currently attached to 761,856 ACCUs that nobody has measured. **The build's best discipline is being used to certify fabricated data.** If a prospect ever works out that the "measured" column is simulated, the honesty apparatus stops being the differentiator and becomes the exhibit against you. This audience is described across your own strategy work as technical, sceptical and allergic to marketing. They are exactly the audience that checks a delivery figure against a public registry.

There is a second cost, and it is the larger one. Setting the demo in 2030 **swaps out the only asset a competitor cannot copy**. Fox, Gunthorpe, Peart and Doran are real, credited, cored, with 41 issuances across 8,067 hectares behind them. Those are facts in a federal registry. They have been replaced with plausible 2030 arithmetic that anyone could author.

I cannot tell from here whether this was deliberate. It is the question at §7.

### 2.2 The one exhibit every strategy document calls decisive is not on the surface [high]

Predicted against cored against issued appears in four separate documents as the most important thing available:

- `BRIEF-commercial-module-view.md` §7: *"That comparison is worth more than any forecast, and no competitor without a track record can produce it."*
- `WORKSHOP-module-narrative-and-usecases.md` §8, listed under what is missing: *"Still the single strongest credibility asset available and still not on the list."*
- `STRATEGY-module-buyer-insights.md` §5, aha 3: *"Not reassurance, proof."*
- `PROMPT-module-and-monetise.md`, under Integrity: *"predicted at baseline, versus cored, versus issued."*

It is not in the build. What is in its place is the Certainty panel: bootstrap confidence intervals, a p-value, a bias adjustment, an integrity score, credited amount marked conservative of the mean.

**Those are two different kinds of object and the difference is the whole problem.** A confidence interval is the model's own account of its own uncertainty. A backtest is an external fact that either agrees with the model or does not. Every instrument a carbon desk holds has been backtested by someone who was not selling it. Handing that reader a vendor-computed statistic where a backtest belongs reads as sophistication substituting for evidence, and sophisticated people recognise the substitution immediately.

**The material for it exists and is stronger than the substitute.** Gayathri, Teams, 11 August: the model *"agrees to within about 15% on the eight credited projects we could check against cores."* That is a checkable number with a stated denominator. It is worth more than every statistic currently on the Certainty panel combined.

**And the failure is worth more than the success.** Cadel's 22 May post-mortem on Messner and Morrison is on record: HORIZON showed an increase, sampling came back all negative, cause traced to almost no Western Australian training data in baseline v1, plus roughly 10% additional error in sandy soils, fixed by v1.1 going from 15 projects and 430 samples to 72 projects and 3,136 samples. A vendor who shows a miss, names the cause and shows the fix is doing something no competitor's marketing surface will ever do. A vendor who shows only clean statistics is doing what everyone does.

### 2.3 The headline number is the wrong object, and it is the first thing read [high]

The hero tile reads **Contracted to you: 1,875,000 ACCUs**. That is 125,000 ha × 3.0 × 5 crediting years, which is total module output. The development plan specifies **220,000 ACCUs fixed delivery to the financier** over a seven-year term, with landholders retaining 75% and a 25% success fee of which a quarter goes to the financier.

You wrote the correct version of this yourself in `NOTE-module-plan-corrections.md` §1: *"The console is showing an order against a module, and the header calling it 'Commercial module, holder view' is describing the wrong object."*

The build still does it, in the largest type on the page. A carbon desk professional's first act on any position screen is to check the headline against their own paperwork. **If the top number is not their number, nothing below it is read.** That is not a nuance discovered on the third scroll. It is the first fifteen seconds.

`BRIEF-commercial-module-view.md` §10 lists a single headline credit number as failure mode number one: *"It will be the most requested element and the most misleading thing available. The value is entirely in the decomposition."* The build leads with it.

### 2.4 The certainty ladder is gone, so nothing on screen shows movement [high]

The ladder was the structural idea that made the whole thing cohere. Five rungs - modelled, baselined, registered, sampled, issued. From `BRIEF-commercial-module-view.md` §4: *"the ramp curve, the confidence band narrowing, and the ladder distribution are three views of one underlying movement. Uncertainty reduction is what the funder's capital buys, and it is measurable."*

The build has a fill bar, a delivery chart, a leaderboard ranked by modelled yield and a statistics panel. None of those is the ladder. A fill bar shows enrolment. A delivery chart shows output.

**Nothing on the surface shows the band narrowing**, which is the only element that is simultaneously true, impossible without cores in the ground, and a direct picture of the customer's money working. It is the answer to your own Tuesday question and it is absent.

This also explains the "bolted on" quality that a merge of two builds usually produces. `STRATEGY-module-buyer-insights.md` §10 predicted it exactly: *"Merging them works only because the certainty ladder is genuinely shared... Anything that does not resolve to that spine will feel bolted on."* The merge happened. The spine did not come with it.

### 2.5 Five sections, four disjoint datasets, so "one machine" is asserted and never shown [high]

Module runs on 25 module properties. Monetise runs on 600,000 hectares the buyer owns. Remediation runs on GundaPark and Bowen. Acquisition runs on five Southern Tablelands properties. **Nothing crosses.**

The claim these sections exist to prove is that this is one instrument pointed at different targets. The mechanism specified to prove it was the AI layer making connections a user would not make - *three properties in your module sit in a catchment with a published sediment target*, *the rehabilitation site you are monitoring would model as eligible*. Those sentences are only possible if the datasets overlap. They do not, so the connections cannot exist, and five sections sharing a nav bar is literally what has been built.

This is a data-population problem, not a design problem, which is why it is worth naming separately: no amount of visual work fixes it.

Two things sit underneath it. **GundaPark's console carries Mulloon's data** by your own known-gaps list, so the second-largest worked example is not real. And **the Remediation weighting - cover 38, erosion 32, canopy 22, soil carbon 8** - is a precise-looking set of numbers I cannot trace to any source in the corpus. `PROMPT-remediation-acquisition-reporting.md` flagged the underlying analogue-site claim at [moderate] and asked for it to be checked with Verterra before it went in front of a mining prospect. It is now built and rendered as settled fact, summing tidily to 100. Precision without provenance is the specific thing this audience punishes.

### 2.6 The Monetise hero undercuts the strongest commercial argument you have [moderate]

`STRATEGY-module-buyer-insights.md` §5 names the strongest asset for this persona: the module is the cheapest way to test, on someone else's land, a capability they will want across their own estate. Procurement becomes a pilot. The second contract is the prize.

The Monetise hero is **1.434 million ACCUs gross attainable over 25 years across 600,000 ha they own.** Annualised that is 57,360 per year, against a module running at 375,000 per year. **The console's own numbers tell the buyer their entire estate is worth about one sixth per year of the thing they have already bought.**

If the estate argument is the reason to buy, the hero number argues against it. Marked [moderate] because I cannot see how the figure is framed on screen, and because the gross-attainable-over-25-years construction may be doing something I am misreading.

### 2.7 The AI layer is built as the two patterns the brief ruled out [high]

`PROMPT-module-and-monetise.md` is unambiguous: *"connective tissue running through every section, not a layer sitting above them and not a body of prose at the top of a page."*

What exists is a prose alert card at the top of the page and a floating launcher bottom right. Both ruled-out patterns, built.

Two consequences. The floating pill is the single most recognisable "we added AI" signature of the last two years, and to a reader allergic to marketing it is a tell rather than a capability. And the action model routes insight CTAs into a conversation rather than into the action - *a CTA that opens the assistant to talk it through, not the action directly*. `WORKSHOP-module-narrative-and-usecases.md` §6 set the bar: *"A button that initiates the process, not one that suggests you email someone."* Opening a chat panel is the current form of suggesting you email someone.

### 2.8 The compliance panel is built at the highest-risk of the three options [high]

`WORKSHOP-module-narrative-and-usecases.md` §7 laid out A, B and C, and recommended designing to A until a ruling came back. The build is C: contracted A$27.00 against spot A$103, spread shaded, expressed as a percentage above entry.

AP-2698 is High and untouched. There is internal precedent - "estimated value" was previously stripped from a customer-facing insight on financial-advice grounds. And `BRIEF-commercial-module-view.md` §3.1 forbids *"a credit count placed adjacent to a price such that a reader performs the multiplication."* 1,875,000 ACCUs and A$103 are on the same tab.

Separately: the one price permitted as an attributed fact was **A$38.25, CORE Markets, August 2026**. The build shows A$103, which is a 2030 projection. So the single sourced fact on the panel has been replaced by a forecast.

### 2.9 The figures do not reconcile with each other [high]

The handover's own working convention: *"Every number on screen must reconcile with every other number on screen."* Take the four headline figures:

| | |
|---|---|
| Contracted | 1,875,000 (2028 to 2032) |
| Delivered by 2030 | 761,856 |
| Model forecast, next two years | 532,000 |
| Forecast at term end | 1,958,000 |

761,856 + 532,000 = **1,293,856**. That leaves **664,144** to arrive after the forecast window, inside a crediting period ending 2032.

Both readings fail:

- **If "delivered by 2030" covers 2028 and 2029**, three crediting years remain, the next two carry 532,000, and 2032 alone must deliver 664,144. On 103,952 enrolled hectares that is **6.4 ACCUs/ha/yr**, more than double the contracted 3.0 and inside conversation range of the proposed 11 cap.
- **If it covers 2028 to 2030**, two crediting years remain, "next two years" is the whole remainder, and the tiles fall **664,144 short** of the term-end figure. That is 35% of the contract, unexplained.

Note also that 532,000 over two years is 266,000 per year, which is **2.56 ACCUs/ha/yr on enrolled hectares**, below the contracted rate. So the surface shows a near-term rate under contract and a term-end total over contract at the same time. The only way both hold is a late acceleration with no stated basis - and the handover confirms the curve is drawn accelerating.

An analyst does this arithmetic with a phone calculator during the meeting. Marked [high] on the contradiction, [ASSUMPTION] on which years each figure covers, since I am inferring that from the handover.

### 2.10 On visual register, which is the part I am least able to judge [moderate]

Dark theme, lime neon, drifting grid, scanline, pulsing SYSTEM LIVE, a welcome modal dismissed with *Enter the system*.

That is a coherent and well-executed genre. It is the mission-control genre, and its function is to signal capability. **The problem is that signalling capability is what a vendor does when it cannot demonstrate capability**, and this reader has been trained by a hundred ESG decks to recognise the move.

Their native instruments - Bloomberg, Refinitiv, their own risk system - are dense, grey, boring and information-first. Trust in that visual culture comes from provenance and density, not atmosphere. A scanline is the visual equivalent of a marketing verb, and marketing verbs are banned everywhere else in this workstream.

Two smaller things in the same class. A welcome modal a returning holder cannot dismiss permanently is friction this audience will not pay twice. And **the demo holder is named Corporate Carbon**, which is your own AFS licensee and a live counterparty - showing that to BHP is either confusing or reads as disclosing another client's book.

I am at [moderate] because I have not seen it. `REVIEW-console-versions-v1-v5.md` reached the opposite conclusion on theme from a position of having seen it, and that disagreement should be settled by you, not by me.

---

## 3 · The five questions in §6 of the kickoff

**What does a person believe after thirty seconds?** That this is a well-made carbon portfolio dashboard. Not that these people measure land better than anyone else. Nothing in the first thirty seconds is about measurement at all - it is a welcome modal, then an alert, then position tiles.

**Where does trust come from in this domain?** Track record, provenance and disclosed error. None of the three is on the surface. What is there instead is self-computed statistics, which is the thing that looks most like trust and provides least.

**What could not be produced by a competitor?** As built, nothing. Every element - forecast curve, leaderboard, cohorts, flags, spot chart, radar, coverage matrix - is producible by a team with zero cores in the ground. The things that could not be produced are 30,000 cores, eight years of history, 41 issuances and a ±15% agreement against labs. None are on screen.

**What would a holder get on a Tuesday that they would miss if it were gone?** One thing only: the harvest cohort surfacing. *The model says these properties crossed the threshold, act now.* That is the sole element on the surface that is time-sensitive and actionable. Everything else is a quarterly report at higher fidelity, and a quarterly report does not earn a Tuesday.

**Which element does the most work, and which is decoration?** Most work: harvest cohorts, and *enter the digital twin* from the leaderboard, which is the only place the two surfaces prove they are one system rather than two builds. Decoration: the spot panel, the land health radar, the grid and scanline, the welcome modal, and the Certainty panel - which is doing the opposite of work, because it occupies the position where evidence belongs.

---

## 4 · What is worth protecting

Three things in the build are better than anything in the versions that preceded it, and a rework would lose them by accident.

**The empty state discipline.** *"Not modelled · Not scored · awaiting a snapshot · Layers only, area not on file."* Every gap carries its reason. This is the actual differentiator against every competitor who would render the same modelled number as fact.

**The intelligence footer.** *18 layers read across 25 properties, 4,312 pairwise joins evaluated, 5 cleared the materiality floor, 6 set aside, scan ran 06:14 today.* This is the only element on the surface that is evidence of a machine running rather than a claim that one exists. It does the living-system job that the rest of the page asserts.

**"HORIZON estimates; cores decide."** Six words that do more than the Certainty panel.

---

## 5 · Where I land against the prior reviews, read afterwards

**Agree, independently reached:** the AI layer is built as both ruled-out patterns; the spot panel is at option C with AP-2698 open; the demo holder should not be the AFS licensee; the empty-state discipline is the asset.

**Confirmed and carry forward as fact:** the yield conversion defect. The arithmetic checks out - 3.6667 × 0.9 × 0.75 = 2.475; 2.22 × 2.475 = 5.49, not 8.14; 3.12 × 2.475 = 7.72, not 11.45. Note the handover's Module tab inventory does not list a yield table, so **confirm whether it survived into V2** before ticketing it as live.

**Where I differ, and it is the substance of this note.** The prior review's headline finding is structural - *this is a scroll, not a system* - and its remedy is to reorder blocks. I do not think reordering fixes anything, because the content that would build trust is not on the page in any order. A better-sequenced page of self-computed statistics is still a page of self-computed statistics.

**And three things the prior review does not name at all**, which I think are larger than everything it does name: the surface is set in 2030 and its measured figures are therefore fabricated; the predicted-versus-cored-versus-issued exhibit is absent; the headline is total module output presented as a holder entitlement. The prior review reads 761,856 as a measured figure and praises the badge on it.

---

## 6 · Verification items, in priority order

| Item | Why | State |
|---|---|---|
| Is the 2030 setting deliberate | Changes whether §2.1 is a decision or a defect, and changes the entire diagnosis | Blocking, see §7 |
| Reconcile 761,856 + 532,000 against 1,958,000 | 664,144 unexplained under either reading, 35% of contract | Not ticketed |
| Confirm the ±15% agreement figure and its denominator | The strongest checkable claim in the corpus, currently only in a Teams reply | Not ticketed |
| Is 11.45 ACCUs/ha/yr actual issuance or a raw conversion | Determines whether real issuances breach the proposed cap | AP-2708 adjacent, not ticketed in its own right |
| Provenance of the Remediation weights 38/32/22/8 | Rendered as fact, untraceable in the corpus | Not ticketed |
| Whether the yield table survived into V2 | Determines whether the conversion defect is live | Not ticketed |
| 220,000 versus 1,875,000 | AP-2707. Absent from Teams entirely - it lives in the development plan and Jira only | In development |
| AP-2698 ruling | The panel is built at the highest-risk option | High, untouched |

---

## 7 · The one question

**Is the console being set in 2030 a deliberate choice?**

If it is deliberate - to show a mature module rather than an empty one, on the reasoning that an August 2026 module has nothing in it - then the diagnosis is that the choice is the root cause and the trade is a bad one, because it buys apparent maturity by spending the only asset a competitor cannot copy.

If it is not deliberate, and the dates came out of a design tool filling a chart, then it is a defect and a much smaller conversation.

Everything in §2.1, §2.2 and §2.9 turns on the answer, so I would rather have it than guess.
