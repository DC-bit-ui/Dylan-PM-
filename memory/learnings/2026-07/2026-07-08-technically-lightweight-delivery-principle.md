# Technically lightweight delivery — grazing planner standing principle

**Date:** 2026-07-08 · **Source:** Dylan (Cowork session, evening) · **Confidence:** [high] — explicit directive

Dylan's rule for the grazing planner (and the pattern for insight tools generally): **no month-long delivery timelines.** Design output must be as close to product as possible; scripts + technical implementation plan must be dev-handoff-ready. Prototype iterates on existing Claude Design work rather than rebuilding when the concept is unchanged.

Encoded: `specs/grazing-planner-demo-kit/TECH-IMPLEMENTATION-PLAN.md` — pilot = zero new backend services (script as pipeline step + S3 bundle + static client page + one snapshot page); anything needing a schema migration or new service is deferred behind pilot evidence. Consistent with the 2026-05-12 pivot's scrappy-MVP delivery mode — this extends it from "how we build" to "how we hand off".
