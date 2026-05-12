# Task: Backfill Victorian Storm Boy Property IDs in HubSpot

## Context

Cadel's geospatial scrape produced ~500 Victorian properties with `property_id` as the key identifier linking properties in the application database to contacts in HubSpot. Athul then ran the scrape through an enrichment pipeline (`scrape_enricher.py` using OSM + ABR, then `webhound_prefilter.py`) which filtered non-agricultural properties and produced 4 output CSVs. The master record is `vic_properties_VIC_enriched_all.csv` — it contains ALL properties with `property_id` preserved.

Dylan then took the enrichment outputs through Claude + Webhound to resolve owner names. The final enriched CSV was imported to HubSpot on 19 March 2026, creating 46 "Stormvic" placeholder contacts and 13 real-named contacts — but **the `property_id` column was dropped during the Claude/Webhound enrichment step**.

**Result:** 59 of 61 Victorian Storm Boy HubSpot contacts have no `property_id`. This breaks the link between HubSpot contacts and the property database, which Frontier relies on.

### The enrichment pipeline (for reference)

```
vic_properties.csv (Cadel's raw scrape, ~500 properties, SharePoint > Epics, 18 Jan 2026)
       ↓ scrape_enricher.py (OSM + ABR lookup — filtered ~500 → 69 unresolved)
vic_properties_VIC_enriched_all.csv ← MASTER RECORD (ALL properties, property_id preserved)
       ↓ webhound_prefilter.py (filtered 69 → 42 candidates + 27 excluded)
vic_properties_VIC_webhound_candidates.csv (69 unresolved properties)
vic_properties_VIC_webhound_candidates_VIC_webhound_ready.csv (42 clean → sent to Webhound)
vic_properties_VIC_webhound_candidates_VIC_excluded.csv (27 excluded with reasons)
```

All 4 enrichment CSVs are on SharePoint at `sites/AgriProveProduct/Shared Documents/Tech/` (posted by Athul George, 31 Mar 2026, Product > Tech channel).

Source: [Athul George: Vic Property Scrape Update | Product > Tech](https://teams.microsoft.com/l/message/19:248262429ed346549a3d79331424eeae@thread.tacv2/1774923371144)

### What's in HubSpot now (live data, 29 Apr 2026)

| Segment | Count | Notes |
|---|---|---|
| Stormvic placeholder contacts (no property_id) | 46 | Created 19 Mar, all have `address` |
| Real-named VIC contacts (no property_id) | 13 | Created 19 Mar, from Webhound enrichment |
| VIC contacts WITH property_id | 2 | Peter Lawson + Glenn Canny (from earlier Feb import) |
| **Total VIC Storm Boy contacts** | **61** | |

### Verified alignment: raw scrape vs Athul's enriched output

The raw scrape (`vic_properties.csv`) has 502 properties with unique property_ids. Athul's `scrape_enricher.py` preserves property_id via `row.get('property_id')` — the enrichment only ADDS columns (`enrichment_source`, `enrichment_confidence`, `enrichment_notes`), it does not modify or drop `property_id` or `address`. Therefore the property_ids are identical between the raw scrape and the enriched_all output.

**The raw scrape is a valid and sufficient source of truth for this backfill.** It's already in this directory.

Spot-checked against HubSpot contacts (live 29 Apr):
- Stormvic17 ("360 LEAKES ROAD CUDGEWA 3705") → property_id `5133770` ✓ in scrape
- Stormvic23 ("BENAMBRA-CORRYONG ROAD DARTMOUTH 3701") → property_id `52528138` ✓ in scrape
- Gary Zauner ("3234 MURRAY RIVER ROAD GRANYA 3701") → property_id `5223660` ✓ in scrape
- Xavier Burton ("233 EMBLING ROAD GLENROWAN WEST 3675") → property_id `422321593` ✓ in scrape (note: HubSpot has mixed case "233 Embling road Glenrowan west" — normalisation needed)
- Cadel's example `45150376` → "GRAYS TRACK THOWGLA VALLEY 3707" ✓ in scrape (but no HubSpot contact — correctly filtered as non-ag by ABR)

Peter Lawson (property_id `4144829`) and Glenn Canny (`3961773`) are **NOT in this VIC scrape** — they're from the earlier NSW/Feb import. No conflict.

## Input Files

Two files are needed in this directory (`hubspot-backfill/`):

1. **`vic_properties.csv`** ← ALREADY HERE — Cadel's raw scrape (502 properties, 18 Jan 2026). Property_ids confirmed identical to Athul's enriched output. Key columns:
   - `property_id` — column 1, Victorian state government property identifier (this is what we need to backfill)
   - `address` — column 8, street address in UPPERCASE (e.g. "360 LEAKES ROAD CUDGEWA 3705")
   - `postcode` — column 6 (note: often empty — postcode is usually appended to address string instead)
   - `hectares`, `centroid_lat`, `centroid_lon`, `distance_from_albury_km` — secondary data
   - 20 `source_*` columns — Vicmap cadastral metadata (not needed for matching)

2. **`hubspot_vic_contacts.csv`** ← DYLAN NEEDS TO EXPORT THIS — from HubSpot filtered to State = VIC + Storm Boy Campaign Member = Yes. Key columns:
   - `Record ID` — HubSpot's unique contact ID (needed for the update import)
   - `Street address` or `address` — the address carried through from the original scrape
   - `First Name`, `Last Name` — for verification
   - `Postal Code` or `zip` — secondary match key
   - `Property ID` or `property_id` — will be empty on almost all records (that's the problem)

## What To Do

### Step 1: Load and inspect all CSVs
- Read the enriched_all CSV and the HubSpot export, print column names and row counts
- Print 5 sample rows from each to confirm structure
- Confirm that `vic_properties_VIC_enriched_all.csv` has `property_id` populated on all rows
- Confirm that `hubspot_vic_contacts.csv` has `property_id` mostly empty
- If `vic_properties.csv` (raw scrape) is also present, load it as a fallback source
- Report the column names from each file before proceeding

### Step 2: Normalise addresses for matching
The scrape/enrichment CSVs use uppercase addresses (e.g. "360 LEAKES ROAD CUDGEWA 3705"). HubSpot contacts have the same addresses but may have minor formatting differences from the Claude/Webhound step.

Known address patterns from HubSpot (from live data):
- Stormvic17: "360 LEAKES ROAD CUDGEWA 3705" (uppercase, postcode appended)
- Stormvic19: "1279 EDI-CHESHUNT ROAD WHITFIELD 3733"
- Gary Zauner: "3234 MURRAY RIVER ROAD GRANYA 3701" 
- Xavier Burton: "233 Embling road Glenrowan west" (mixed case, no postcode — Webhound enriched)
- David Blackmore: "44 CHESNEY ROAD BENALLA 3672"

Normalisation rules:
- Uppercase everything
- Strip leading/trailing whitespace
- Collapse multiple spaces to single space
- Remove trailing postcode from address string if present (some addresses include postcode in the string, some don't — normalise to without)
- Strip common punctuation differences (periods, commas)

### Step 3: Match on address
- **Primary match:** exact normalised address match between vic_properties.csv and HubSpot export
- **Secondary match (if exact < 80%):** fuzzy matching using rapidfuzz or fuzzywuzzy:
  - `token_sort_ratio` with threshold >= 85
  - Also try matching on street number + street name only (first 3 words of address)
  - Known case: Xavier Burton's HubSpot address is "233 Embling road Glenrowan west" vs scrape "233 EMBLING ROAD GLENROWAN WEST 3675" — uppercase normalisation + postcode stripping should handle this
- **Tertiary match:** last 4 digits of address (postcode) + first word (street number) — weak but catches edge cases where road name was abbreviated

### Step 4: Generate output files

**`hubspot_backfill_import.csv`** — the file to import to HubSpot:
- Columns: `Record ID`, `Property ID`
- Only include rows where a confident match was found
- `Record ID` = the HubSpot contact's Record ID
- `Property ID` = the `property_id` from the enriched_all CSV (or raw scrape fallback)

**`match_report.csv`** — full audit trail:
- All columns from the HubSpot export + matched `property_id` + `match_type` (exact/fuzzy/fallback/unmatched) + `match_confidence` + `matched_source` (enriched_all or raw_scrape) + `matched_scrape_address` (for Dylan to verify)

**`unmatched_contacts.csv`** — HubSpot contacts that couldn't be matched:
- Full row from HubSpot export + reason (no address match found in any source)

**`unmatched_properties.csv`** — Enriched properties that didn't match any HubSpot contact:
- Full row from enriched_all CSV (these are the ~440 properties correctly filtered as non-agricultural — expect most to be unmatched)

### Step 5: Print summary
```
=== BACKFILL SUMMARY ===
Source: vic_properties_VIC_enriched_all.csv
Total enriched properties:      XX
Total HubSpot VIC contacts:     XX
Already have property_id:       XX (skip these)
Exact address matches:          XX
Fuzzy matches:                  XX
Fallback matches:               XX
Unmatched contacts:             XX
Unmatched properties:           XX
Ready for HubSpot import:       XX

=== EXPECTED COUNTS (from live HubSpot data) ===
Stormvic placeholders to backfill:  46
Real-named contacts to backfill:    13
Already correct (Lawson, Canny):    2
Total expected in import file:      ~59
```

### Step 6: Validate
- Check for duplicate property_ids being assigned to multiple contacts (legitimate if multiple contacts per property, but flag it for review)
- Check for duplicate Record IDs in the output (should never happen — error if so)
- Spot-check 5 matches by printing the enriched_all row and HubSpot row side by side
- **Cross-check the 2 contacts that already have property_ids** (Peter Lawson 4144829, Glenn Canny 3961773) — if they appear in the enriched_all CSV, confirm the property_id matches. If it conflicts, flag for manual review — do NOT overwrite.

## HubSpot Import Instructions (for Dylan — not for the script)

Once `hubspot_backfill_import.csv` is generated:
1. Go to HubSpot > Contacts > Import
2. Choose "Import file from computer" > "One file" > "One object" > "Contacts"
3. Upload `hubspot_backfill_import.csv`
4. Map `Record ID` → Record ID (this tells HubSpot to UPDATE existing contacts, not create new ones)
5. Map `Property ID` → Property ID
6. Run import — this backfills the missing property_ids without creating duplicates

## Important Notes

- Do NOT create any contacts in HubSpot — this is a backfill/update only
- The `property_id` is a Victorian state government property identifier (numeric, e.g. 45150376), not a HubSpot internal ID
- Some HubSpot contacts are "real" contacts (with actual names like Gary Zauner, from Webhound) while others are placeholders (Stormvic17 Boy, where Webhound couldn't find an owner) — both need the backfill
- The scrape CSV has 502 rows but only ~59 should match HubSpot contacts — the rest were correctly filtered as non-agricultural by the ABR scoring in Athul's pipeline
- Peter Lawson (property_id 4144829) and Glenn Canny (property_id 3961773) already have property_ids from the earlier Feb NSW import — their property_ids are NOT in this VIC scrape (confirmed). They should be excluded from the import file entirely.
- The `postcode` column in the scrape is frequently empty — the postcode is embedded in the `address` string instead (e.g. "360 LEAKES ROAD CUDGEWA 3705"). Parse postcode from the trailing 4 digits of the address if needed for matching.

## Source

Investigation by Cowork (29 Apr 2026).
- Notion task: https://app.notion.com/p/3518c08eb28f817eb58eeb8566713e7e
- Jira: AP-2037 (scrape VIC properties)
- Teams: Cadel Watson, Product > Stand up, 24 Apr 2026 (original flag)
- Teams: Athul George, Product > Tech, 31 Mar 2026 (enrichment pipeline outputs)
- SharePoint: vic_properties_VIC_enriched_all.csv in Tech folder (master record)
- SharePoint: vic_properties.csv in Epics folder (raw scrape fallback)
- HubSpot: live contact data queried 29 Apr 2026
