# EIH-C package builder — workflow & structure strategy (handoff to Cowork)

**From:** Claude Code session, 2026-06-09 (built the EIH-C package builder end-to-end)
**For:** a Cowork strategy session — where this fits in the ops app, vs the KCT automation, the UI/flow, and whether the MCP structure is plug-and-play.
**Full build context:** memory `eihc_package_builder.md` (auto-memory) + commits 42178e0 → 3f4281f in `EIH Automation`. Demo to DJ/Joe/Jesse **Wed 10 June 2026**.

## What exists now (one line)
A per-entity "Build the EIH-C pack" surface: for each bank/utility EIH, a gap-checklist of the ~12–15 required docs, one-click generate (cover letter + pre-filled CER EIH-C form), and a Build-pack → .zip that bundles generated docs + standard collateral + sourced project docs. Missing docs can be sourced from SharePoint (MCP text-ingest now; server-side Graph binary download pending Cadel's creds).

## The four questions to strategise

### 1. Where it fits in the flow (and vs the KCT automation)
- App flow today: **Titles → EIH curation → KCT/SLA → Registration** (4-tile hub).
- **KCT automation = LANDHOLDER consent** (PandaDoc e-sign). **EIH-C packs = NON-landholder ENTITY consent** (banks/utilities sign the CER EIH-C form). They are **two tracks of the same job: "get every eligible interest holder to consent."**
- Strategic intent Dylan stated: **pull entity consent to the FRONT** (around registration) instead of waiting until crediting and being blocked for months. So the EIH-C pack should fire as soon as titles are confirmed + entity EIHs classified + project registered/declared — not at crediting.
- Shared pattern with KCT: both = "generate the right consent artifact from project data → send → track to signed." Opportunity: a **unified consent view** (landholder KCTs + entity EIH-C packs) with one coverage/status surface.

### 2. UI / user-flow structure
- Currently EIH-C is its **own spoke + a 5th hub tile + a banner from the EIH page**.
- Open question: does a 5th tile dilute the clean 4-step mental model? Options to weigh in Cowork:
  - (a) Keep EIH-C as its own spoke (current).
  - (b) Nest it under EIH consent (it *is* entity consent) — EIH spoke = classify + curate, with "entity packs" as a section.
  - (c) Introduce a **single "Consent" surface** that unifies landholder KCT + entity EIH-C, since both gate registration/crediting.
- Mirror the existing gap-view idiom (title coverage, KCT coverage) — EIH-C already does this, so it's consistent.

### 3. Does the MCP structure make it plug-and-play? (the crux)
**Short answer: not yet, and this is the key structural decision.**
- The app uses **Option B**: the *user's own Claude* is the engine (holds M365/HubSpot/AgriProve connectors), the app's MCP server is the EIH spine, they meet at the shared Prisma DB. This is powerful for an operator with Claude wired up — but it is **NOT plug-and-play**:
  - The MCP server is **stdio/local-dev only**; remote hosting + **per-user OAuth is [BLOCKED] on Cadel** (same gate as the AgriProve MCP).
  - Every user (DJ, Joe, Jesse) would need their own Claude connected to the hosted MCP **and** their own connectors. That's per-user setup, not click-and-go.
- **Cadel's Graph-credential work changes this.** If the *server* can read SharePoint directly (server-side Graph creds, behind the GraphQL API he proposed), the app sources documents **natively** — any user clicks "source", the server fetches. No per-user Claude needed for that path. **So the Graph creds aren't just about map/binary fidelity — they're what makes the sourcing plug-and-play.**
- **Direction of travel to decide:** move integrations **server-side** (Graph for SharePoint, the HubSpot token already is) for plug-and-play users, and keep **MCP as the operator's-Claude power layer** (hands-off bulk ops, judgement calls). Frame for the team: *MCP = power tool for the operator; server-side integrations = plug-and-play for everyone.*

### 4. Structural fit with the team's just-built KCT automation
- If KCT automation lives in the same ops app (it does), EIH-C should reuse its patterns: PandaDoc-style status tracking, the same coverage/gap UI, the same "operator confirms" gates. Avoid a parallel silo.
- Decide whether EIH-C consent status feeds the **same registration-readiness gate** as KCTs (it should — registration/crediting needs ALL EIH consent, landholder + entity).

## Open decisions for the session
1. Spoke vs nested vs unified "Consent" surface (Q2).
2. Server-side-integrations vs MCP-power-layer split, and what that means for the hosted-MCP/OAuth ask to Cadel (Q3).
3. Trigger point: confirm EIH-C packs fire at registration, and what surfaces the "you have entity EIHs to chase NOW" nudge (landing priority? triage?).
4. Who the real users are (DJ + Joe + Jesse) and which surface each uses — drives plug-and-play priority.

## Constraints
- **10 June demo** — prototype Graph app scoped to a few projects (Wonga/Scullin/Cooeeanna) is what's needed; official API-app-behind-GraphQL is post-demo.
- Graph creds **pending Cadel/Stephen** (Files.SelectedOperations.Selected, folder-scoped).
