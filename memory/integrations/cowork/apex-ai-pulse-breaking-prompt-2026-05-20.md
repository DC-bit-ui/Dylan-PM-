# Apex AI Pulse — Breaking Layer Prompt Snapshot 2026-05-20

**What this is:** companion to the weekly digest — a lightweight daily check that fires ONLY when a major Anthropic / Claude Code / OpenAI / Notion / Granola / Atlassian release lands in the last 24h. 99% of days it writes nothing.

**Why it exists:** the weekly digest is too slow for major releases. If Claude Code ships a feature on Wednesday, Dylan finds out on Monday — by then the Notion + Cowork + slash command ecosystem has moved on. This routine catches big drops fast without spamming.

**Output landing zone:** `inbox/cowork/<YYYY-MM-DD>-ai-pulse-breaking.md` (only when something material lands). The local apex-pm importer recognises `*-breaking.md` files and tags the digest `kind=breaking` (workbench renders with a red "BREAKING" badge).

**Cowork routine setup:**
- **Name:** Apex AI Pulse — Breaking
- **Cron (UTC):** `0 7 * * *` (= 09:00 SAST daily, well after the morning brief)
- **MCPs:** None required (WebFetch). Optional: Notion.
- **Files to read first:** `apex-pm/ai-pulse/source_trust.json` (if exists), the last weekly digest in `inbox/cowork/` for de-dup.

---

## Verbatim prompt

```
APEX AI PULSE — Breaking Release Check

You are doing a fast daily check for MAJOR AI tooling releases that landed in the last 24 hours and would change Dylan Cronje's workflows TODAY. The bar is much higher than the weekly digest: if you find more than 3 items in a day, you're probably miscalibrating — most days produce zero items, and that's correct.

## STEP 0: READ THE LAST WEEKLY DIGEST (DE-DUP)

Find the most recent `inbox/cowork/<YYYY-MM-DD>-ai-pulse.md` (the weekly digest from last Monday). Read it. Any item you'd otherwise include here that's already in last week's digest: SKIP. You're a breaking-news layer, not a re-run.

## STEP 1: SCAN ONLY THESE SOURCES (last 24h)

Tight scope on purpose:
- Anthropic news + Claude Code release notes (https://www.anthropic.com/news)
- OpenAI release notes / changelog
- Notion release notes
- Granola changelog
- Atlassian what's new

No HN, no newsletters, no curated content. Those wait for the weekly digest.

## STEP 2: BREAKING THRESHOLD

Include an item ONLY if ALL of these are true:

1. **Released in the last 24h** (the source's own publish date — not just when you found it).
2. **Changes a workflow Dylan actively runs** (same list as the weekly: morning brief, workstack triage, standup, decisions, Granola synth, Notion writes, Jira interaction, Teams scanning, Confluence drafting, Claude Code orchestration).
3. **It would change behaviour TODAY**, not "experiment with this next sprint." Concrete, immediate.
4. **Not in last Monday's weekly digest** (from STEP 0).

Examples of items that PASS:
- "Claude Code 4.7 ships an MCP for X" — direct, immediate.
- "Notion AI launches a 'summarise database' command" — Dylan reads Notion every morning.
- "Granola releases a structured action-item extractor" — replaces a current /apex-midday step.

Examples of items that FAIL:
- "OpenAI announces GPT-5 release date" → rumor / future
- "Anthropic publishes a research paper on scaling" → not a workflow shift
- "New benchmark shows Claude beats X on Y" → not a shipped feature
- "Notion previews their roadmap" → not shipped

If you have zero items: write the file ANYWAY with `items: 0` and a one-line note. Empty days are valid output — they prove the check ran.

## STEP 3: WRITE THE FILE

Write to: `inbox/cowork/<YYYY-MM-DD>-ai-pulse-breaking.md` (today's SAST date).

```markdown
# Apex AI Pulse — BREAKING — <YYYY-MM-DD>

**Generated:** <UTC ISO 8601>
**Window:** last 24h
**Sources scanned:** <list>
**Items found:** <N>

---

## 1. <one-line headline>

- **Source:** <Source name> — <URL>
- **Published:** <YYYY-MM-DD>
- **Affects:** <workflows>
- **Implication:** <one sentence>
- **Suggested action:** <one sentence>

(... up to 3 ...)

---

## Notes

<if items: 0 — "Daily breaking check ran. Nothing material in scope. Next weekly digest: <date>.">
```

## OUTPUT TO CHAT

After writing:
- Items found: <N>
- File: `inbox/cowork/<YYYY-MM-DD>-ai-pulse-breaking.md`
- If N >= 1: top headline verbatim

If N = 0, a single line: "Apex AI Pulse — Breaking: nothing today (<date>)." No emojis, no chatter.

Do not update source_trust.json. Do not write to Notion or Jira.
```

---

## Notes on this prompt

- **Empty days produce a file.** This is intentional — it proves the check ran. The apex-pm importer treats a 0-item file as informational (no badge, no widget update), but the file's existence in `inbox/cowork/` is the audit trail.
- **De-dup against weekly is essential.** Without STEP 0, the daily check would re-flag every Anthropic release that landed Sunday night.
- **Tight scope at STEP 1 is intentional.** HN and newsletters move slowly and are better-curated in the weekly digest. Including them here would just produce noise.
- **Cron `0 7 * * *` UTC = 09:00 SAST daily.** Daily is fine because the empty-day handling is cheap.
