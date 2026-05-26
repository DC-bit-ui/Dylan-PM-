---
date: 2026-05-26
status: decided
type: architectural
decided_by: Dylan
supersedes: null
---

# Stormboy Tracker frontend rewrite — React 18 + TS + Vite + Chakra v2 + Apollo

## Decision

Stormboy Tracker (the standalone PM dashboard at `localhost:3401`) will be **rewritten on the AgriProve frontend stack** so it can be merged into `frontend/src/` rather than living as a parallel vanilla-JS tool indefinitely.

## Source of constraint

CPO vibe-coding guide saved 2026-05-26 — original at `cowork/2026-05-26-cpo-product-guide.md.md`, canonical copy at `memory/decisions/2026-05-26-cpo-vibe-coding-guide.md`. Mandates:

- **React 18 + TypeScript** (no React 19, no JS)
- **Vite SPA** (no Next.js, Remix, Astro)
- **Chakra UI v2** with `@emotion/react` + `framer-motion`
- **React Hook Form + Zod** for forms
- **Apollo Client shape** for data (`useQuery`/`useMutation`) — even when mocking, write the hook signature so it swaps later
- **Lato** via `@fontsource/lato`
- PascalCase components, one-component-per-file, named export matching filename
- No raw `<div>` for layout — Chakra primitives (`Box`, `Flex`, `Stack`, etc.)
- No hardcoded colors/spacing — Chakra tokens only
- Light + dark mode safe
- Hooks-shaped data layer: `{ data, loading, error }` even over REST mocks
- No auth in vibe code — mock `useCurrentUser()` in `ContextProvider`

## What stays unchanged

- **Node/Express backend** — the CPO guide explicitly allows "tiny Express app in a sibling `server/` folder" as throwaway scaffolding. Our 40+ engines in `coaching/engine/` and `server.js` routes stay as-is during the rewrite.
- **Resource-shaped REST endpoints** — they already match the guide's pattern (`GET /api/stats/efficacy`, etc.). When eventually merged into the main app, the backend swaps to GraphQL and the `services/*Client.ts` files are the only thing that changes — hooks + components stay identical.
- **Bus integration** — Apex / Cowork / SharePoint sync model stays untouched.

## Migration strategy

Tab-by-tab incremental rewrite (NOT a big-bang switchover). Each surface is rewritten in `public-v3/` (new directory), validated side-by-side against the existing `public-v2/`, then the old version retires when the new one ships.

Sequence (smallest → largest):
1. **Foundation** — Vite + TS scaffolding + Chakra theme + Apollo client (mocked to existing REST) + ContextProvider + Lato + base layout (sidebar/tabs/container) · ~3 days
2. **HOME / scoreboard** — small surface, good first-rewrite candidate · ~1 day
3. **ASK** — recently rebuilt, easy to port · ~1 day
4. **HEALTH** — moderate complexity · ~2 days
5. **MESSAGING** — moderate, marketing-grade theme cards · ~2 days
6. **BRAIN** — profile rendering + objection cards + distillates + team workshopping · ~3 days
7. **WORK** — two-stream layout + exemplar cards + call cadence + farm visits · ~3 days
8. **STATS** — 14+ sub-modules · ~5 days
9. **FEEDBACK / INTELLIGENCE** — auxiliary surfaces · ~2 days
10. **Switch-over** — flip `/` from v2 to v3, retire vanilla JS · ~1 day

**Total estimate: 3 weeks** including reviews and validation passes.

## Open questions still to decide

1. **Directory layout**: rewrite goes in `stormboy-tracker/public-v3/` (sister to `public-v2/`) OR in a new `stormboy-tracker/frontend/` directory mirroring the main app's structure? *(Recommended: `frontend/` so the eventual merge is a straight directory move.)*
2. **GraphQL backend now or later?**: Apollo Client wired against existing REST (current REST endpoints stay; hooks just shape the response like `useQuery`) OR rewrite backend to GraphQL alongside the frontend? *(Recommended: REST stays. Apollo hooks call thin `services/*Client.ts` functions that hit REST. When merged into main app, swap clients to GraphQL ops — hooks unchanged.)*
3. **Light/dark mode**: dashboard is currently light-only. Implement dark mode from the start, or defer until merge? *(Recommended: implement from the start via Chakra `useColorModeValue` — cheap during rewrite, expensive later.)*

## What this displaces

- Feature work on the existing `public-v2/` surface pauses or slows during the rewrite window. New insights / engines can still ship on the backend; new UI surfaces wait for the React track.
- The recent ASK redesign (command-palette) gets ported as the FIRST React rewrite — proves the framework works on a small surface before tackling STATS.

## Risks

- **Visual parity gap during the transition**: users running the dashboard see both v2 + v3 routes during the migration window. Mitigation: side-by-side validation, no v2 retirement until v3 covers the same insights.
- **Backend coupling**: some engines were written assuming the v2 vanilla-JS frontend's HTML-template shape (e.g., HTML strings returned in API responses). Audit before rewrite — if any exist, swap to JSON-first responses.
- **localStorage state**: v2 saves user prefs (STATS module order, recent ASK prompts, etc.) under `v2-*` keys. v3 will use `v3-*` keys — users lose their customisations once. Worth documenting in the switchover plan.

## Authority

This decision was made by Dylan on 2026-05-26 after reviewing the CPO vibe-coding guide. It supersedes the implicit "keep evolving vanilla JS" trajectory of the previous 3 weeks of work on `public-v2/`.

Future Claude sessions in this codebase MUST follow the CPO guide when writing frontend code. Reference: `memory/decisions/2026-05-26-cpo-vibe-coding-guide.md`.
