# 2026-04-29 — Cowork Bootstrap Probe

**Source:** Manual session — Dylan requested a read of `memory/profile/identity.md` and `memory/business/company.md` from inside Cowork desktop.

**Authored by:** Cowork desktop session (filesystem-only surface).
**Persisted to canonical repo by:** Claude Code CLI (paste-relay), 2026-04-29.

---

## What was loaded (Cowork's view)

Neither file exists. The entire `memory/` directory tree is effectively empty — the only file present is `memory/retros/session/2026-04-29-eod.md`.

## Gaps identified [high confidence — within Cowork's view]

The following directories and files referenced in `COWORK.md` §3 (session-start reads) are missing from Cowork's local folder:

| Expected path | Purpose (per COWORK.md) | Status |
|---|---|---|
| `memory/profile/identity.md` | Role + mandate | **Missing** |
| `memory/profile/communication.md` | Voice, tone, behavioural rules | **Missing** |
| `memory/profile/decision-frameworks.md` | P0–P3 prioritisation | **Missing** |
| `memory/profile/working-style.md` | Connector-first protocol, reconciliation rule | **Missing** |
| `memory/business/strategy.md` | Strategic priorities, OKRs | **Missing** |
| `memory/business/glossary.md` | Domain terminology | **Missing** |
| `memory/business/products.md` | Product descriptions | **Missing** |
| `memory/business/customers.md` | Customer profiles | **Missing** |
| `memory/business/company.md` | Company overview (requested by Dylan) | **Missing** |
| `memory/people/roster.md` | Named people | **Missing** |
| `memory/initiatives/INDEX.md` | Active initiatives | **Missing** |
| `memory/decisions/INDEX.md` | Standing decisions | **Missing** |
| `memory/integrations/cowork.md` | Apex specifics | **Missing** |
| `memory/learnings/INDEX.md` | Learnings index | **Missing** |

Also missing: `COWORK.md` and `CLAUDE.md` at the repo root.

## Implication (Cowork's stated)

Apex scheduled runs, reconciliation, dual-stack prioritisation, and all skill-based drafting depend on these files. Until the memory tree is scaffolded and populated, Cowork is operating without its contract, voice spec, domain context, or decision history.

## Recommended next step (Cowork's stated)

Bootstrap the `memory/` directory structure per COWORK.md. Minimum viable set: `profile/identity.md`, `profile/communication.md`, `profile/decision-frameworks.md`, `business/strategy.md`, `business/glossary.md`, root `COWORK.md`, root `CLAUDE.md`. Dylan should confirm content or provide source material to populate them.

---

## CLI annotation — the probe's premise was a false negative

All files listed above as "missing" **DO exist** in the canonical repo (`DC-bit-ui/Dylan-PM-`, branch `main`, current at `30fd1f8` when this annotation was written). The CLI's working tree contains the populated tree right now: `CLAUDE.md`, `COWORK.md`, `memory/profile/*`, `memory/business/*`, `memory/integrations/*`, the full deck.

**Why Cowork couldn't see them:** Cowork desktop is pointed at a Windows folder (`C:\Dylan PM` or similar) that was never a git clone of the repo. It only contains files Cowork has authored locally during recent sessions. The seam pattern in `memory/decisions/2026-04-28-multi-surface-strategy.md` and CLAUDE.md §15 assumes a git clone exists at the local path — that assumption was never operationalised.

**The probe's actual diagnostic value (inverted):** it surfaced the un-cloned-folder gap, not a memory gap. The cure isn't scaffolding from scratch (that would create a divergent tree and a merge nightmare) — it's cloning the canonical repo into the path Cowork already points at, preserving the two files Cowork has authored locally (this probe + an EOD retro) by carrying them across.

**Recovery sequence in flight (2026-04-29):**
1. Dylan: `Move-Item "C:\Dylan PM" "C:\Dylan-PM-prebootstrap"` then `git clone https://github.com/DC-bit-ui/Dylan-PM-.git "C:\Dylan PM"`
2. CLI (this commit): persist this probe + Cowork's EOD retro to the canonical repo so the fresh clone lands with them included
3. Dylan: re-run the probe in a fresh Cowork thread post-clone — should successfully read `CLAUDE.md`, `memory/profile/identity.md`, etc.

## Related

- `memory/learnings/2026-04/2026-04-29-mcp-surface-availability.md` — surface→MCP map
- `memory/decisions/2026-04-28-multi-surface-strategy.md` — multi-surface architecture
- `COWORK.md` — bidirectional contract
- `playbooks/multi-surface-capture.md` — capture template (for inbox flow)
