# Initiatives Index

> One row per active initiative. The `initiative-tracker` subagent maintains this. Newest-update at top.

> **Source of truth:** Jira AP project. This index is a snapshot — refresh by `initiative-tracker` weekly sweep or when stale.

**Last refreshed from Jira:** 2026-04-28 (handoff snapshot)

---

## Active

| Jira | Initiative | DRI | Stage | Status | Last update | File |
|---|---|---|---|---|---|---|
| AP-1963 | Frontier Phase 2 | Dylan | build | Development | 2026-04-28 (snapshot) | `ap-1963-frontier-phase-2.md` |
| AP-2009 | Frontier property management | Dylan | build | Development | 2026-04-28 (snapshot) | `ap-2009-frontier-property-management.md` |
| AP-2116 | HORIZON validation framework — first Schedule 2 run | Cadel | build | Development | 2026-04-28 (snapshot) | `ap-2116-horizon-validation-schedule-2.md` |
| AP-1964 | Operation KCT (phase 1) | Steve | build | Development | 2026-04-28 (snapshot) | `ap-1964-operation-kct-phase-1.md` |
| AP-1965 | LawrieCo referrer view | Steve | build | Development | 2026-04-28 (snapshot) | `ap-1965-lawrieco-referrer-view.md` |
| AP-2187 | Crediting Workflow Template — T1 Offsets Report | Unassigned | discovery | Discovery | 2026-04-28 (snapshot) | `ap-2187-crediting-workflow-t1-offsets.md` |

---

## Recently archived
| Initiative | Outcome | Closed | File |
|---|---|---|---|
| _(none yet)_ | | | |

---

## How to refresh
1. Query Jira for active epics: `project = AP AND type = Epic AND status != Done ORDER BY updated DESC`
2. For each epic, update `Status`, `Last update`, and append `Recent changes` line in the initiative file
3. Update this INDEX with the new `Last update` date
4. Move closed epics to `archive/`, keep one-line outcome in this INDEX
