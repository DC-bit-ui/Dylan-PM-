/**
 * Claude Prompt Templates
 * Generates the exact prompts for HORIZON Summary (Page 2) and Property Summary (Page 4).
 *
 * Rules from manual process doc:
 * - Page 2: ~150 words, zone-location-specific, defensible language, no em dashes
 * - Page 4: ~145 words, soil + rainfall + depth + regional context, no em dashes
 * - Two registers: Standard (partnership) and Stormboy (high-energy)
 */

// Approved exemplars — known-good outputs the user has flagged as "what good
// looks like" for each section. Each entry has both the text and a description
// of its paragraph rhythm so buildExemplarBlock can give section-specific
// structural guidance. Add new entries here as more sections get approved.
const EXEMPLARS = {
  page2: {
    text: `Of the 1,351.12 hectares assessed, 820.8 hectares have been identified as eligible for a soil carbon project, representing approximately 60.7% of the total property. Areas excluded typically include forests, infrastructure, waterways, and other land assessed as unsuitable through satellite imagery analysis. Within the eligible area, the HORIZON model identifies three zone types. Strength Zones, concentrated across the central and northern portions of the property, are areas that sit above the property midpoint in modelled soil carbon characteristics, suggesting relatively stronger sequestration conditions compared to the broader property average. Stable Zones, sometimes called Reference Zones, represent areas of consistent soil carbon behaviour that help anchor project measurement and verification. Opportunity Zones indicate areas where adjusted land management may support additional carbon accumulation over time. Together, these zones form the basis for a three-project structure of approximately 400 hectares each. Please note: All zone classifications and estimates are derived from spatial modelling and indicative inputs; actual outcomes depend on verified soil carbon changes and land management practice.`,
    rhythm: 'eligibility arithmetic → exclusions explanation → zone definitions (Strength / Stable / Opportunity, each anchored to on-property location) → project-structure note → disclaimer'
  },
  page4: {
    text: `The Carr property at Calingunee presents a well-rounded profile for soil carbon. Receiving 600mm of annual rainfall and carrying dominant Dermosol soils rated high across water-holding capacity, productivity, and carbon stability, the property shows characteristics that align closely with productive sequestration conditions. Supporting Rudosol, Sodosol, and Vertosol types add variability across the landscape, and soil depths ranging from 0.28 to 1.5 metres suggest meaningful sequestration potential where deeper profiles concentrate. Strength Zones, concentrated across the central and northern portions of the property, sit above the property midpoint in modelled carbon characteristics, while Opportunity Zones represent genuine upside where adjusted land management may support further accumulation over time. The surrounding AgriProve portfolio adds further confidence, with 17 projects already active within 50 kilometres. Closer still, the Smith carbon project, approximately 91km away in Glenarbon, has earned around 1,022 ACCUs to date, offering concrete proof of what neighbouring properties in comparable conditions have already achieved. These estimates are based on spatial modelling and indicative inputs; our team works with you to define the right project configuration for your property, and figures may change as this process develops. We will give you a call in a couple of days to follow up and discuss this opportunity with you.`,
    rhythm: 'property name + location framing → integrated rainfall + dominant soil + carbon-characteristics rating → supporting soil types + depth range tied to sequestration potential → zones (interpretive, with on-property locations) → portfolio context (count within 50km) → credentialled neighbour citation by exact name + distance + ACCU count → softened defensible disclaimer → MANDATORY closing call-follow-up promise (verbatim)'
  },
  email: null   // add when an approved email exemplar exists
};

// Wraps a registered exemplar with framing instructions that anchor STYLE,
// STRUCTURE, TONE, and DEFENSIBILITY without forcing copy of specific facts.
// Per-section paragraph rhythm comes from the EXEMPLARS entry itself.
// Returns '' when no exemplar is registered.
function buildExemplarBlock(section) {
  const ex = EXEMPLARS[section];
  if (!ex || !ex.text) return '';
  return `APPROVED EXEMPLAR — what good looks like for this section:
"${ex.text}"

Match the STYLE, STRUCTURE, TONE, and DEFENSIBILITY of the exemplar above:
- Same paragraph rhythm: ${ex.rhythm}
- Same level of confidence (interpretive, not promotional — "identifies", "suggesting", "indicate", "shows characteristics of")
- Same way of anchoring zones, soils, and other facts to on-property locations / specific numbers
- Same defensible-language register throughout
- Same close pattern (warm partnership invitation, then softened disclaimer)

DO NOT copy the exemplar's specific numbers, soil types, locations, project names, or property-specific phrasing verbatim. Adapt all facts to the CURRENT property's data above.`;
}

// Centralised defensible-language block — the single source of truth for the
// constraint that prevents over-claiming in any narrative. Injected verbatim
// into every prompt builder (Page 2, Page 4, email, combined). Updated here,
// applied everywhere.
const DEFENSIBLE_LANGUAGE_BLOCK = `DEFENSIBLE LANGUAGE — NON-NEGOTIABLE (read this every time):
This is a regulated industry. We do NOT promise outcomes. Every line must be defensible if read aloud by a regulator, a competitor, or a sceptical landholder.

NEVER use any of these (incomplete list, not exhaustive):
- "delivers", "will deliver", "delivers you"
- "guarantees", "guaranteed", "guarantee you"
- "ensures", "ensures that"
- "proven to", "proven results"
- "promises", "promised", "we promise"
- "transforms", "transformative outcomes"
- "maximises returns", "maximise your"
- "outstanding returns", "exceptional yields"
- "will produce", "will earn", "will generate" (re: ACCUs or revenue)
- ANY phrasing that locks in a future financial outcome

ALWAYS use defensible alternatives:
- "estimated", "estimate suggests"
- "potential", "potential for"
- "could support", "could earn", "may earn"
- "modelling indicates", "data suggests"
- "is well-suited for" (NOT "is guaranteed to deliver")
- "shows characteristics of", "exhibits"
- "positioned to", "positioned for"

Reconciling enthusiasm with defensibility:
- Enthusiasm must come from INTERPRETATION of the data, not from claims about future returns.
- Strong-and-defensible (✓): "Your property's combination of Sodosol soils, 640mm rainfall, and substantial Strength Zones is exactly the kind of profile we see across our top-performing projects."
- Promotional-and-banned (✗): "Your property will deliver outstanding ACCU returns over the next 25 years."
- Show, don't promise. Confidence comes from the data itself, not from forward-looking guarantees.`;

function buildPropertyContext(parsed, calcs) {
  return `Property: ${parsed.name || 'Unknown'}
Address: ${parsed.address || 'Unknown'}
Total Area: ${parsed.totalArea ? parsed.totalArea.toLocaleString() : '?'} ha
Eligible Area: ${calcs.eligibleArea.toLocaleString()} ha (${calcs.eligiblePct}% of property)
Rainfall: ${calcs.rainfall.toLocaleString()} mm
Production System: ${parsed.productionSystem || calcs.landUse}
Soil Types: ${parsed.soilClasses ? parsed.soilClasses.join(', ') : 'Unknown'}
pH Range: ${calcs.phMin || '?'} - ${calcs.phMax || '?'}
Soil Depth Range: ${calcs.depthMin || '?'} - ${calcs.depthMax || '?'} m
ACCU Rate: ${calcs.accuRate} ACCUs/ha/year
Estimated ACCU Potential: ~${calcs.totalAccu.toLocaleString()} over 25 years
Number of Projects: ${calcs.numProjects} (~400ha each)`;
}

function buildPage2Prompt(parsed, calcs, zoneStats, style = 'standard', guidance = '', editorialContext = '') {
  const context = buildPropertyContext(parsed, calcs);
  const zoneInfo = zoneStats
    ? Object.keys(zoneStats).join(', ') + ' zones present in the model output'
    : 'zone data not available — use general directional language';

  return `You are writing the HORIZON Summary for Page 2 of an AgriProve HORIZON Snapshot document. This is a sales/recruitment document for Australian landholders considering soil carbon projects.

${context}

Zones: ${zoneInfo}
${editorialContext}
${DEFENSIBLE_LANGUAGE_BLOCK}

${buildExemplarBlock('page2')}

Write a ~150 word HORIZON Summary paragraph that:
- References ACTUAL zone locations visible on the map (e.g. "Strength Zones concentrated across the northern block and along the eastern edge")
- Explains what Strength, Stable (Reference), and Opportunity zones mean for the landholder
- Explains why eligible area is less than total area (forests, infrastructure, waterways, and other land unsuitable for soil carbon are excluded via satellite imagery analysis)
- Includes a brief geospatial disclaimer
- Contains NO em dashes (use commas or full stops instead)
- Is ${style === 'stormboy' ? 'high-energy and value-driven, with urgency' : 'warm, partnership-focused, and education-oriented'}
${guidance ? '\nAdditional guidance from the reviewer: ' + guidance : ''}

Write ONLY the paragraph text. No headers, labels, or markdown formatting.`;
}

function buildGeoBlock(geoContext) {
  if (!geoContext) return '';
  const c = geoContext.closest || {};
  const w50 = geoContext.within50km || {};
  const w100 = geoContext.within100km || {};
  const w200 = geoContext.within200km || {};
  const total50 = (w50.accusIssued || 0) + (w50.measured || 0) + (w50.existing || 0);
  const total100 = (w100.accusIssued || 0) + (w100.measured || 0) + (w100.existing || 0);
  const total200 = (w200.accusIssued || 0) + (w200.measured || 0) + (w200.existing || 0);
  const closestLines = [];
  if (c.accusIssued) closestLines.push(`Closest project with ACCUs Issued: "${c.accusIssued.name}", ~${c.accusIssued.distanceKm}km away`);
  if (c.measured)    closestLines.push(`Closest project with measured carbon increases: "${c.measured.name}", ~${c.measured.distanceKm}km away`);
  if (c.existing)    closestLines.push(`Closest existing AgriProve project: "${c.existing.name}", ~${c.existing.distanceKm}km away`);

  // Named credentialled neighbour — enriched from HubSpot with actual ACCU
  // counts. When populated, narratives MUST cite this specific project + count.
  const nb = geoContext.namedNeighbour;
  const nbBlock = nb
    ? `

CREDENTIALLED NEIGHBOUR (use this — concrete proof of nearby success):
- Project: ${nb.name} carbon project
- Location: ${[nb.city, nb.state].filter(Boolean).join(', ')}
- Distance: approximately ${nb.distanceKm}km from this property
- ACCUs earned to date: approximately ${nb.accusIssued.toLocaleString()}
(Use the EXACT project name and ACCU count above. State the distance honestly. Public data — safe to name and quantify.)`
    : '';

  return `
AgriProve Portfolio Context (use to articulate where this property sits in the existing portfolio):
- Within 50km:  ${total50} projects (${w50.accusIssued || 0} with ACCUs Issued, ${w50.measured || 0} with measured carbon increase, ${w50.existing || 0} existing)
- Within 100km: ${total100} projects (${w100.accusIssued || 0} with ACCUs Issued, ${w100.measured || 0} with measured carbon increase, ${w100.existing || 0} existing)
- Within 200km: ${total200} projects
${closestLines.length ? closestLines.map(l => '- ' + l).join('\n') : '- No nearby reference projects available'}${nbBlock}`;
}

function buildPage4Prompt(parsed, calcs, zoneStats, style = 'standard', guidance = '', geoContext = null, editorialContext = '') {
  const context = buildPropertyContext(parsed, calcs);
  const geoBlock = buildGeoBlock(geoContext);

  return `You are writing the Property Summary for Page 4 of an AgriProve HORIZON Snapshot document. This is a sales/recruitment document for Australian landholders considering soil carbon projects.

${context}

Soil Characteristics (for ${calcs.soil.dominant}):
- Water Holding Capacity: ${calcs.soil.water}
- Productivity: ${calcs.soil.productivity}
- Carbon Stability: ${calcs.soil.stability}
${geoBlock}
${editorialContext}
${DEFENSIBLE_LANGUAGE_BLOCK}

${buildExemplarBlock('page4')}

NARRATIVE INTENT (read this AFTER the defensible-language block):
This section is NOT a list of statistics about the property. The landholder already knows their rainfall, soil type, and acreage — telling them again insults their intelligence and wastes the page.

Instead, INTERPRET the data we have derived. Connect the dots between what we've measured (zones, soil characteristics, rainfall band, depth distribution, surrounding portfolio context) and the soil-carbon sequestration opportunity in front of them. Every fact you reference should land as EVIDENCE — proof that this property is well-suited for soil carbon. Build conviction.

The reader should finish this paragraph thinking: "my property has real potential here, and these people understand it." Confident and grounded — but EVERY claim must respect the defensible-language block above. Enthusiasm comes from interpretation of the data, not from outcome promises.

Write a ~145 word Property Summary paragraph that:
- Names SPECIFIC soil types (e.g. "Sodosol soils" — not "various soil types")
- Includes the EXACT rainfall figure (e.g. "receiving 640mm of annual rainfall" — not "moderate rainfall")
- References depth distribution and what it means for carbon crediting potential
- Frames Opportunity Zones as UPSIDE potential, not deficiency
- References any Strength Zones by their on-property location
${geoContext ? '- Naturally references the AgriProve Portfolio Context where it adds credibility (e.g. "neighbouring landholders within 50km have already had measured soil-carbon increases" or naming the closest credited project). Do not name properties unless they appear in the closest-project lines above.' : ''}
${geoContext?.namedNeighbour ? `- MUST cite the CREDENTIALLED NEIGHBOUR by exact name and ACCU count from the block above (e.g. "the ${geoContext.namedNeighbour.name} carbon project, approximately ${geoContext.namedNeighbour.distanceKm}km away, has earned around ${geoContext.namedNeighbour.accusIssued.toLocaleString()} ACCUs to date"). This concrete proof point is non-negotiable when available.` : ''}
- ENDS with TWO sentences, in this exact order:
    1. A softened defensible disclaimer that PRESERVES defensibility but lands as a partnership statement, not a hedging clause. Example phrasing: "These are initial estimates derived from spatial modelling and indicative inputs, and the figures will be refined as we measure soil carbon changes and shape the project together." Required defensible elements that must remain (in any wording): the words "estimates" and "spatial modelling", AND a clear acknowledgement that final outcomes depend on land management practice and verified/measured soil carbon changes.
    2. The FINAL sentence of the paragraph MUST be the call-follow-up promise, used VERBATIM (do not rephrase): "We will give you a call in a couple of days to follow up and discuss this opportunity with you."
- These two closing sentences are non-negotiable. The call-follow-up sentence is the exact final words of the paragraph.
- Contains NO em dashes (use commas or full stops instead)
- Is ${style === 'stormboy' ? 'high-energy, value-driven, with a sense of opportunity (within the defensible-language constraints above)' : 'warm, partnership-focused, and informative'}
${guidance ? '\nAdditional guidance from the reviewer: ' + guidance : ''}

Write ONLY the paragraph text. No headers, labels, or markdown formatting.`;
}

/**
 * Build the delivery email prompt (generated alongside the snapshot).
 */
function buildEmailPrompt(parsed, calcs, style = 'standard', editorialContext = '') {
  const context = buildPropertyContext(parsed, calcs);

  return `You are drafting the delivery email for an AgriProve HORIZON Snapshot. The Snapshot PDF will be attached.

${context}

Communication register: ${style === 'stormboy' ? 'Operation Stormboy (high-energy, value-driven, urgency-tinged) — applied within the defensible-language constraints below' : 'Standard (partnership tone, warm, education-focused)'}
${editorialContext}
${DEFENSIBLE_LANGUAGE_BLOCK}

Write:
1. Subject line
2. Email body (~150 words)

The email must:
- Reference the property by name
- Mention what's in the attached Snapshot (zone analysis, ACCU potential, pricing options)
- Include a geospatial disclaimer: "All figures are estimates derived from spatial modelling and indicative inputs; actual outcomes depend on land management practice and verified soil carbon changes."
- End with a specific call to action (booking a 30-minute call)
- Sign off as Ben (AgriProve Growth Team)
- Contain NO em dashes

Format the output as:
SUBJECT: [subject line]
---
[email body]`;
}

// ─────────────────────────────────────────────────────────────────
// Combined prompt — generates page2 + page4 + email in a single API call.
// ~50% input-token savings vs three separate calls (shared property context).
// Quality safeguards:
//   - Each section has its own clearly-bounded constraints
//   - Strong delimiters (===PAGE2===, ===PAGE4===, ===EMAIL_SUBJECT===, ===EMAIL_BODY===)
//   - Server parses delimited output; if any section is missing or short,
//     server falls back to the per-page prompts (no quality regression).
// ─────────────────────────────────────────────────────────────────
function buildCombinedPrompt(parsed, calcs, zoneStats, style = 'standard', guidance = '', geoContext = null, editorialContext = '') {
  const context = buildPropertyContext(parsed, calcs);
  const zoneInfo = zoneStats
    ? Object.keys(zoneStats).join(', ') + ' zones present in the model output'
    : 'zone data not available — use general directional language';
  const geoBlock = buildGeoBlock(geoContext);
  const styleNote = style === 'stormboy'
    ? 'Operation Stormboy — high-energy, value-driven, urgency-tinged'
    : 'Standard — warm, partnership-focused, education-oriented';

  return `You are writing three pieces of copy for an AgriProve HORIZON Snapshot — a sales/recruitment document for Australian landholders considering soil carbon projects.

PROPERTY CONTEXT (shared across all three outputs):
${context}

Zones: ${zoneInfo}

Soil Characteristics (dominant: ${calcs.soil.dominant}):
- Water Holding Capacity: ${calcs.soil.water}
- Productivity: ${calcs.soil.productivity}
- Carbon Stability: ${calcs.soil.stability}
${geoBlock}

Communication register: ${styleNote}
${guidance ? '\nReviewer guidance applies to ALL three outputs: ' + guidance : ''}
${editorialContext}
${DEFENSIBLE_LANGUAGE_BLOCK}

${buildExemplarBlock('page2') ? buildExemplarBlock('page2') + '\n(The exemplar above is for the PAGE2 section specifically. Use it as the style anchor for the ===PAGE2=== output below.)\n' : ''}
${buildExemplarBlock('page4') ? buildExemplarBlock('page4') + '\n(The exemplar above is for the PAGE4 section specifically. Use it as the style anchor for the ===PAGE4=== output below.)\n' : ''}
UNIVERSAL RULES (apply to every output, in addition to the defensible-language block above):
- Contain NO em dashes (use commas or full stops instead)
- No headers, labels, or markdown formatting inside the sections

OUTPUT FORMAT — return EXACTLY this structure with the literal delimiters shown:

===PAGE2===
[~110-130 word HORIZON Summary paragraph for Page 2 — tight, no filler. Hard ceiling: 130 words.
Must:
- Reference ACTUAL zone locations on the map (e.g. "Strength Zones concentrated across the northern block")
- Briefly explain what Strength, Stable (Reference), and Opportunity zones mean for the landholder
- Briefly note why eligible area is less than total area (forests, infrastructure, waterways excluded via satellite analysis)
- Include a one-line geospatial disclaimer at the end]

===PAGE4===
[~110-130 word Property Summary paragraph for Page 4 — tight, no filler. Hard ceiling: 130 words.

NARRATIVE INTENT: Do NOT recite statistics the landholder already knows about their property. Interpret the data — every fact you reference (zones, soil types, rainfall, depth, neighbour ACCUs) must land as EVIDENCE for why this property is well-suited for soil-carbon sequestration. Build conviction. The reader should finish thinking "my property has real potential, and these people understand it." Confident and grounded — but EVERY claim must respect the DEFENSIBLE LANGUAGE block above. Enthusiasm comes from interpretation, NOT from outcome promises ("delivers", "guarantees", "will earn" etc. are banned).

Must:
- Anchor the property in its GEOGRAPHIC region (use the address — extract suburb / region / state — e.g. "in the Riverina district of NSW", "near Dorrigo on the NSW Mid-North Coast"). This is non-negotiable; landholders need their location named.
- Name SPECIFIC soil types (e.g. "Sodosol soils" — not "various soil types")
- Include the EXACT rainfall figure (e.g. "receiving 640mm of annual rainfall")
- Reference depth distribution briefly
- Frame Opportunity Zones as UPSIDE potential, not deficiency
${geoContext ? '- MUST reference the broader AgriProve portfolio context — the surrounding farmer community (e.g. "X projects within 50km have already shown measured soil-carbon increases" or naming the closest credited project from the data above). This is non-negotiable. Use only names that appear in the closest-project lines above.' : '- (No portfolio data available — skip the broader-portfolio reference.)'}
${geoContext?.namedNeighbour ? `- MUST cite the CREDENTIALLED NEIGHBOUR by exact name and ACCU count (e.g. "the ${geoContext.namedNeighbour.name} carbon project, approximately ${geoContext.namedNeighbour.distanceKm}km away, has earned around ${geoContext.namedNeighbour.accusIssued.toLocaleString()} ACCUs to date"). Concrete proof point — non-negotiable when available.` : ''}
- ENDS with TWO sentences, in this exact order. First, a softened defensible disclaimer that preserves defensibility but lands as a partnership statement (e.g. "These are initial estimates derived from spatial modelling and indicative inputs, and the figures will be refined as we measure soil carbon changes and shape the project together"). Required defensible elements that must remain in any wording: the words "estimates" and "spatial modelling", AND clear acknowledgement that final outcomes depend on land management practice and verified/measured soil carbon changes. SECOND and FINAL — the closing sentence MUST be used VERBATIM (do not rephrase): "We will give you a call in a couple of days to follow up and discuss this opportunity with you." This call-follow-up sentence is the exact final words of the paragraph.]

===EMAIL_SUBJECT===
[Single-line email subject — references property by name, no quotes around it]

===EMAIL_BODY===
[~150 word email body for delivery email. Must:
- Reference the property by name
- Mention what's in the attached Snapshot (zone analysis, ACCU potential, pricing options)
- Include this geospatial disclaimer verbatim: "All figures are estimates derived from spatial modelling and indicative inputs; actual outcomes depend on land management practice and verified soil carbon changes."
- End with a specific call to action (booking a 30-minute call)
- Sign off as Ben (AgriProve Growth Team)]

===GROWTH===
[~120 word INTERNAL summary for the AgriProve Growth team — NOT customer-facing. Plain, operational tone. Use the four labelled sections below verbatim. No marketing language. Be concrete about numbers.

Opportunity: [1-2 sentences sizing the deal — eligible hectares, total ACCU potential over 25 years, rainfall band, deferred baseline value if relevant. Pull actual figures from the property context.]
Profile: [1-2 sentences on property characteristics — soil type(s), zone mix (Strength / Reference / Opportunity), single vs multi-project structure, anything notable about the land.]
Watch-outs: [1-2 sentences flagging anything unusual or that needs internal attention — e.g. mixed soil types, low rainfall band, large deferred overflow above $50K cap, very small or very large eligible area, complex multi-project setup. If nothing stands out, say "Standard profile, no flags".]
Next step: [1 sentence with a specific suggested action for the salesperson — e.g. "Follow-up call to discuss baseline sampling timing" or "Stormboy follow-up — high-energy register suits cold prospect" or "Ready for sampling quote — straightforward single-project setup".]]

===END===

Output the five sections in the exact order shown, each preceded by its delimiter line on its own line. No extra commentary before, between, or after.`;
}

// Parse the delimited output from buildCombinedPrompt back into { page2, page4, email }.
// Returns null on any parse problem so the caller can fall back to per-page prompts.
function parseCombinedOutput(text) {
  if (!text) return null;
  // Grab from `start` to the EARLIEST of any `endCandidates` that appears after.
  // Falls through to end-of-string if no candidate matches — keeps the parser
  // robust when the model omits a delimiter (esp. ===GROWTH===/===END===).
  const grab = (start, endCandidates) => {
    const i = text.indexOf(start);
    if (i === -1) return null;
    const startPos = i + start.length;
    const ends = Array.isArray(endCandidates) ? endCandidates : [endCandidates];
    let earliest = text.length;
    for (const e of ends) {
      const j = text.indexOf(e, startPos);
      if (j !== -1 && j < earliest) earliest = j;
    }
    return text.slice(startPos, earliest).trim();
  };
  const page2 = grab('===PAGE2===', '===PAGE4===');
  const page4 = grab('===PAGE4===', '===EMAIL_SUBJECT===');
  const subject = grab('===EMAIL_SUBJECT===', '===EMAIL_BODY===');
  // Body ends at GROWTH if present, else END, else EOF.
  const body = grab('===EMAIL_BODY===', ['===GROWTH===', '===END===']);
  // Growth ends at END if present, else EOF.
  const growth = grab('===GROWTH===', ['===END===']);
  if (!page2 || !page4 || !subject || !body) return null;
  // Sanity: each narrative should be substantive (>= 50 words ish, > 200 chars)
  if (page2.length < 200 || page4.length < 200 || body.length < 200) return null;
  return {
    page2,
    page4,
    email: `SUBJECT: ${subject}\n---\n${body}`,
    // Growth summary is non-blocking — return whatever the model produced, or
    // empty string if the section was missing (don't fail the whole parse).
    growth: growth || ''
  };
}

module.exports = {
  buildPage2Prompt, buildPage4Prompt, buildEmailPrompt,
  buildPropertyContext, buildCombinedPrompt, parseCombinedOutput
};
