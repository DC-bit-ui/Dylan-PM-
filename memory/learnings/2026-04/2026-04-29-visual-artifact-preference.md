# Dylan Likes Visual Artifact Output for Briefings

**Date:** 2026-04-29
**Type:** preference
**Source:** Direct statement during Apex flow consolidation discussion. When confirming that the redundant `daily-briefing` flow should be deleted, Dylan said: *"I just liked the artifact style output it gave me. The UI was much easier to interact with and understand."*

---

## What this is

The `daily-briefing` Cowork flow rendered its output as a visual widget (via `mcp__visualize__show_widget`) rather than plain markdown chat. The Morning Briefing and EOD Reconciliation flows produce structured-text output only.

Dylan's preference, stated explicitly: visual artifacts are easier to interact with and understand than dense structured text — for at-a-glance morning context.

## Why this matters

Daily Briefing is being deleted because it duplicates Morning Briefing's job without adding unique value. But the *form factor* it accidentally provided — a visual widget — was a feature Dylan liked, separate from the function.

Conflating the form-factor preference with the redundant flow risks losing the form-factor signal. This learning preserves it.

## Possible follow-ups (not committed; pending Dylan's call)

1. **Add visual rendering as an output option in Morning Briefing's prompt.** Could add a final step: "Also render the briefing summary as a visual widget via `show_widget` for at-a-glance review." Trade-off: doubles output time per run; widget rendering is opaque (the diagnostic noted "widget HTML content not captured in transcript").

2. **Build a separate "AI Priority Synthesis" view in the Apex Command Center artifact** that pulls from the Morning Briefing's structured Notion writes. The Command Center already exists and supports widgets — this is the lighter integration path.

3. **Do nothing.** Accept the trade-off: structured-text is more debuggable, the Command Center already exists for visual interaction, the daily widget was incidental.

## Status

**Captured, not actioned.** Worth raising again next time Dylan iterates on briefing output format, or if the Command Center artifact gets revisited.

## Candidate for promotion

If Dylan re-affirms the visual-artifact preference (e.g. by re-introducing widget output, or by complaining when only structured text is available), promote to `memory/profile/working-style.md` as a standing output preference for briefing-style content.
