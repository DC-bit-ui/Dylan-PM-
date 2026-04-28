# Playbook: Local setup on Windows (`C:\Dylan PM`)

**Purpose:** Run this Claude Code repo from a local folder on Dylan's Windows machine so it works alongside Cowork (browser-based) rather than instead of it.

**Why:** Cowork is browser-based — it runs Apex, the external skill packs (`agriprove-pm`, `soil-carbon-audit`, etc.), and the scheduled jobs. But it doesn't have a folder to operate from. Claude Code is folder-native — memory, agents, skills, hooks all live in the directory tree. Running this repo locally gives Dylan:
- Offline drafting (PRDs, briefs, decisions) when Cowork isn't reachable
- Full access to `memory/`, `.claude/agents/`, `.claude/skills/` from the IDE
- Same MCP reach as Cowork **once the MCPs are configured locally** (Notion, Jira, Granola, Teams, Outlook, HubSpot, Confluence)
- Hooks (Stop hook for end-of-session capture, SessionStart hook for context priming)

The two environments complement each other: **Cowork = orchestration + execution; local Claude Code = reasoning + memory.** Apex still runs in Cowork on schedule and writes to Notion. Local sessions read Notion + the same connectors and reason against them.

---

## Setup steps

### 1. Clone the repo

```powershell
# in Windows PowerShell
cd C:\
git clone <this-repo-url> "Dylan PM"
cd "C:\Dylan PM"
git checkout claude/setup-claude-system-9cDDB
```

(Use the same branch name we've been working on; rebase later if Dylan wants to converge on `main`.)

### 2. Install Claude Code

If not already installed: <https://docs.claude.com/en/docs/claude-code/setup>

### 3. Configure MCP servers (the load-bearing step)

The MCP servers wired into Cowork need to be wired into local Claude Code too — otherwise `/focus`, `/reconcile`, etc. fall back to memory snapshots and can't query live data.

Edit `C:\Dylan PM\.claude\settings.local.json` (or the user-scope settings — see Claude Code docs for precedence) and add the MCP servers Dylan already uses in Cowork. The exact transport (stdio command, HTTP URL, SSE) depends on how each connector is exposed:

```jsonc
{
  "mcpServers": {
    "notion": {
      // Notion's official MCP — see https://github.com/makenotion/notion-mcp-server
      // Uses an integration token Dylan already has from Cowork setup
    },
    "jira": {
      // Atlassian MCP — Jira + Confluence often share a server
    },
    "confluence": {
      // Same Atlassian MCP as Jira, or a dedicated Confluence one
    },
    "granola": {
      // Granola's MCP / API — see Granola integration docs
    },
    "teams": {
      // Microsoft 365 MCP (Teams + Outlook frequently share)
    },
    "outlook": {
      // Same Microsoft 365 MCP
    },
    "hubspot": {
      // HubSpot MCP — official or community
    }
  }
}
```

**Pull the actual server configs from Cowork's settings** — Dylan can copy them rather than re-discover. Each MCP needs the same auth tokens that Cowork already uses.

Once added, restart Claude Code in the project directory. Verify with `/mcp` — all servers should show as connected.

### 4. Allow the read-only tool calls

To avoid permission prompts on every Notion / Jira read, add an allowlist:

```jsonc
{
  "permissions": {
    "allow": [
      "mcp__notion__notion-query-database-view",
      "mcp__jira__search",
      "mcp__confluence__search",
      "mcp__granola__list-meetings",
      "mcp__teams__search",
      "mcp__outlook__search-mail",
      "mcp__outlook__list-events",
      "mcp__hubspot__search"
      // exact tool names depend on each server — adjust after first session
    ]
  }
}
```

The `fewer-permission-prompts` skill can help refine this allowlist by scanning a session's transcripts.

### 5. Run the connector-validation agents

Once MCPs are wired up, **dispatch agents in parallel** to probe each connector with a representative read:

- **Notion** — query the "Today" view of the Work Priorities DB; assert the response contains tasks
- **Jira** — list recent AP-tickets where Dylan is assignee
- **Confluence** — fetch the SCRUM space's PRD-template folder
- **Granola** — list meetings from the last 7 days
- **Teams** — search for a known channel or 1:1
- **Outlook** — list calendar events for today
- **HubSpot** — search for a known contact

Use the `general-purpose` agent for each, or `researcher`. Dispatch them in a single message (parallel) so the test takes minutes, not hours.

If any connector fails or returns malformed data, document in `memory/integrations/<connector>.md` under "Known issues".

### 6. Test the end-to-end

In the local session, run:
- `/focus` — should call `/reconcile` first, then return live Notion + reconciliation report
- `/standup` — same
- `/recall <person>` — try one of the people from `memory/people/roster.md`; verify connector-first behaviour
- `/learn` — verify writes work and the INDEX updates

If any of these fail, capture as a learning and adjust.

### 7. (Optional) Wire hooks

The Stop hook nudges end-of-session capture. The SessionStart hook can prime context. See `.claude/settings.example.json` (if present) or the Claude Code docs.

---

## Coexistence with Cowork

| Capability | Cowork | Local Claude Code |
|---|---|---|
| Apex Morning Briefing (04:45 SAST) | ✅ runs here | ❌ does not run; reads results |
| Apex EOD Reconciliation (12:00 SAST) | ✅ runs here | ❌ |
| External skill packs (`agriprove-pm`, `soil-carbon-audit`, …) | ✅ canonical | ❌ |
| `/focus`, `/standup`, `/reconcile` (this repo's skills) | partially (via Apex) | ✅ on demand |
| Drafting PRDs / briefs / decisions | ✅ via skills | ✅ via skills (saves to `memory/deliverables/`) |
| Memory (`memory/`) — strategy, people, decisions, retros | mirrored / synced | ✅ canonical |
| Hooks (Stop, SessionStart) | ❌ | ✅ |
| Offline / on a plane | ❌ | ✅ (within limits) |

**Rule of thumb:** Apex orchestrates; local Claude Code reasons. Use Cowork for run-the-day. Use local for think-about-the-week.

---

## Known unknowns

- **MCP servers Dylan currently uses in Cowork** — exact configs need to be copied across. Dylan to confirm the list and auth method.
- **Sync of `memory/` between Cowork and local** — both should read from the same git repo. Push from local; pull in Cowork. Cowork's writes (if any) need to flow back via PR or direct push.
- **Whether Cowork can read this repo's `memory/`** — TBD. If it can (e.g. via a "this repo's memory" skill in Cowork), excellent. If not, the human is the bridge.
