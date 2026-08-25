# Process improvement, quantified

What the numbers actually support, what they do not, and which figures are safe to publish.

Measured 17 August 2026. Primary source is HubSpot deal stage transition timestamps, n = 119 deals that have ever entered the `SLA - Mapping, Soil Carbon Plan & KCT` stage of the Sales Pipeline, earliest entry 11 May 2023. Secondary sources are the shared growth memory baseline file, Granola, Teams and Notion.

---

## 1 · The headline you were probably expecting

**The KCT production step has halved.**

Time inside the `SLA - Mapping, Soil Carbon Plan & KCT` stage, from stage entry to `KCT Issued`, by half of stage entry:

| Cohort | n | Median | Mean |
|---|---|---|---|
| H2 2024 | 1 | 142.1 d | 142.1 d |
| H1 2025 | 15 | **60.8 d** | 78.9 d |
| H2 2025 | 26 | 34.6 d | 47.0 d |
| H1 2026 | 15 | **30.9 d** | 47.0 d |
| Q3 2026 to date | 1 | 15.0 d | 15.0 d |

H1 2025 to H1 2026: **60.8 → 30.9 days, a 49% reduction in median.**

That is a real, measured number from transition timestamps rather than a self-report. It is also the number I would not put in front of a buyer without the next two sections.

---

## 2 · Why that number does not mean what it looks like

### The gain has not reached the end-to-end timeline

Widen the window to the whole sales runway and the improvement mostly disappears.

**Qualified Account → KCT Issued**, the same deals:

| Cohort | n | Median |
|---|---|---|
| H1 2025 | 14 | 74.4 d |
| H2 2025 | 26 | 64.2 d |
| H1 2026 | 15 | **66.3 d** |

74.4 → 66.3 days is **an 11% reduction, not 49%.**

Decomposed by median (component medians do not sum exactly to the total median, because each is a median over a slightly different set):

| Cohort | QA → Strategy | Strategy → SLA/KCT | SLA/KCT → KCT Issued | QA → KCT Issued |
|---|---|---|---|---|
| H1 2025 | 7.9 d | 0.8 d | 60.8 d | 74.4 d |
| H2 2025 | 3.8 d | 0.1 d | 34.6 d | 64.2 d |
| H1 2026 | **12.6 d** | 0.7 d | **30.9 d** | 66.3 d |

**The KCT step gave back 30 days and the front of the funnel absorbed most of it.** Qualified Account to Strategy Call has gone from 7.9 to 12.6 days over the same period. Whatever the landholder experiences as "how long this took", it has improved by about a week and a half over eighteen months, not by a month.

This is the single most important finding here. A faster KCT step is only worth what the customer feels, and right now the customer is not feeling most of it.

### The improvement predates the automation

The KCT mapping automation was still shipping in mid-2026:

- 18 Mar 2026 - Ops app in design. Development order agreed as exclusion zones first, then project config, then EAAs or CEAs. Target stated as a 70% automation success rate on exclusion zones, lower on CEAs.
- 29 May 2026 - end-to-end KCT workflow run manually to surface gaps.
- 09 Jun 2026 - automation tool demoed to ops. Joe: *"awesome, makes things so fast."*
- 26 to 29 Jun 2026 - AP-2554 KCT Automation Workflow Phase 3.
- 29 Jun to 06 Jul 2026 - AP-2565 Consents Phase 1, KCT Mapping workspace.
- 01 Jul 2026 - HORIZON run status tile accepted into the KCT mapping screen, targeting a ~2 hour ops blind spot.

But the halving happened in **H2 2025**: 60.8 → 34.6 days, before any of this existed. H1 2026 added only a further 34.6 → 30.9 days.

**Exactly one deal has completed the KCT step entirely after the automation landed** (Q3 2026, 15.0 days). One observation is not a result.

The honest position: **we cannot yet attribute any measured cycle-time gain to KCT mapping automation.** What we have is a documented baseline, a shipped tool, positive ops feedback, and no post-implementation cohort large enough to measure. The retro confirms this directly - roughly one KCT was going through every two weeks during development, so the sample accumulates slowly.

### The cost of the gain, and nobody is reporting this one

Win rate of deals that entered the KCT stage, of those now resolved:

| Cohort | Entered | Won | Lost | Still open | Win rate of resolved |
|---|---|---|---|---|---|
| H2 2024 | 16 | 12 | 4 | 0 | **75.0%** |
| H1 2025 | 19 | 9 | 10 | 0 | 47.4% |
| H2 2025 | 27 | 12 | 11 | 4 | 52.2% |
| H1 2026 | 18 | 6 | 7 | 5 | **46.2%** |

**Conversion out of the KCT stage has fallen by roughly a third since 2024**, and throughput into the stage is flat at 16 to 27 deals per half. The most likely explanation is deal mix: the shift from a referral-led motion to Operation Storm Boy cold outreach puts more, and less committed, prospects into the same stage. That is a defensible trade if the volume compensates, but the volume is not there yet in this stage, so on current numbers the funnel is producing faster KCTs that close less often.

This should be checked before any efficiency claim is made externally.

---

## 3 · What the KCT automation was actually built to fix

The baseline is documented even though the outcome is not yet measurable. From the March 2026 sessions:

- **Map confirmation with a landholder took weeks.** Ops or growth set up a map in prospect view and waited for confirmation by PDF. Described independently as *"a two-week waiting period"* and *"it takes weeks to get the map confirmed back."*
- **Eligibility calls are mobile-to-mobile**, so reviewing a map on screen during the call was not practical. This is why the tokenised URL approach matters more than the mapping speed itself.
- **Stated goal: reduce first customer contact to KCT signing from months to weeks or days.**
- The deliberate product call was **speed over accuracy** - rough draft mapping to get the KCT signed, refined after signature.

The right measure for this work is therefore **not** time inside the KCT stage. It is **time from map sent to map confirmed**, which is not currently instrumented anywhere. If that is the thing being fixed, that is the thing to count.

---

## 4 · Improvements that do survive scrutiny

| Change | Measured result | Source and confidence |
|---|---|---|
| **HORIZON Snapshot automation** | Issuance rate **one per 23.6 h → one per 6.4 h, ~3.7×** | Reported at Town Hall 07 Jul 2026, corroborated independently 03 Jul as 1/24h → 1/6.4h. **High** |
| **HORIZON Snapshot conversion** | **4%** since launch | Town Hall 07 Jul 2026. Described internally as unusually strong for the product type. **Medium**, denominator not stated |
| **Cost per assessment** | **~AUD 0.02** | AP-2301, repeated consistently. **High** |
| **Operation Storm Boy lead engine** | **1,500+ leads generated, 1,800 contactable, 100,000 ha booked into farm visits** by 29 May 2026, 12 bookings that week | Teams 18 May, Granola 29 May 2026. **High** |
| **Frontier campaign platform** | Quarterly recruitment target exceeded **at 60% of the allotted time** | Jira-verified completed epic. **Medium**, the entry's own dating convention is ambiguous |
| **Draw Your Farm tool** | Shipped to prod 25 Jun 2026, **~5 submissions per day** and growing by 02 Jul | Jira and Granola. **High** for adoption, **not yet quantified** for conversion |
| **PRD and epic templates** | Revision cycles down **~40%** | Manager feedback. **Medium**, self-reported |
| **External design retainer** | **~USD 5,000 per month** avoided, replaced by Claude Design to Claude Code | 29 Jun 2026. **Medium**, conditional on the workflow being sustained |
| **Dye & Durham API** | **~AUD 5,000** integration dropped in favour of a self-built workaround | 15 Jun 2026. **High** |

### One claim to stop using

**"10× throughput on personalised prospect assessments."** It appears as an assertion in the AP-2301 epic and is then re-quoted twice as established fact. It has **no stated baseline and no measurement method** anywhere in the record. The measured figure for the same system is **3.7×**. Use that one. A carbon desk professional who asks "ten times what?" and gets no answer will discount everything else on the page.

---

## 5 · Independent corroboration on overall deal velocity

The growth memory baseline, generated 18 May 2026 over the prior 730 days, is a separate instrument and agrees on direction:

- 241 closed deals, 62 won, 179 lost, **win rate 25.7%**
- Won deals: **median 140 days** to close, mean 170.6
- Won by year: 2024 = 34, 2025 = 18, 2026 = 10

Against that, deal-created to closed-won in this cohort:

| Cohort | n | Median |
|---|---|---|
| H1 2024 | 16 | 231.0 d |
| H2 2024 | 12 | 82.3 d |
| H1 2025 | 9 | 57.0 d |
| H2 2025 | 12 | 89.3 d |
| H1 2026 | 6 | 69.5 d |

The 2024 collapse from 231 to 82 days is the largest single move in the record and it happened before any of the 2026 automation. Since then, velocity has been flat and noisy at 57 to 89 days on single-digit sample sizes.

---

## 6 · Caveats that would be raised in the room

1. **Small n.** Every cohort in section 1 is 15 to 26 deals. Medians on that sample move on one or two outliers.
2. **Stage hygiene is not clean.** 107 of 119 deals have no Discovery Call timestamp, and Strategy Call to SLA/KCT entry has a median of 0.7 days, meaning deals are commonly batch-advanced through stages in one action. Stage timestamps record when someone updated HubSpot, not when the work happened.
3. **Two deals carry both a closed-won and a closed-lost timestamp.**
4. **The `KCT Issued` stage did not exist before late 2024**, so no pre-2025 cohort can be compared on the KCT step at all.
5. **Selection bias.** Only deals that reached the KCT stage are in this population. Prospects that died earlier are invisible here, and they are exactly where a recruitment improvement should show up first.
6. **Confounders in the same window**: Storm Boy launch, Frontier launch, HORIZON snapshot automation, the single-page KCT Light sign-off, team composition changes. Nothing here isolates one cause.

---

## 7 · What to do about it

**To make the KCT automation claim measurable**, instrument the thing it was built to fix: timestamp map sent and map confirmed, and report the interval. The current baseline is "weeks". Anything under a week is a publishable result and the tokenised URL should deliver same-day. Nothing else currently in HubSpot will show this.

**Before publishing any velocity number to a module holder**, decide which one. The three candidates say different things:

- *KCT step, 49% faster* - true, favourable, and mostly predates the automation
- *Qualified Account to KCT Issued, 11% faster* - true, defensible, unimpressive
- *Map confirmation, weeks to same-day* - the real claim, not yet instrumented

**The second-order finding worth raising internally**: conversion out of the KCT stage has fallen from 75% to 46% while cycle time improved. Faster is not obviously better if the deals that arrive convert at two thirds the old rate. Worth understanding whether that is deal mix from cold outreach, or whether speed-over-accuracy mapping is costing conversions at signature.
