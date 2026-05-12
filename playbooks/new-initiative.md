# Playbook: Spin up a new initiative

> Use when Dylan picks up a new piece of work. Not every task is an initiative — only things big enough to need tracking, stakeholders, a metric.

## Steps

1. **Create the initiative file** — `memory/initiatives/<slug>.md` using the schema in `.claude/agents/initiative-tracker.md`.
2. **Tie it to strategy** — fill in "Why it exists", linking to a KR in `memory/business/strategy.md`. If you can't, pause: is this work actually worth doing?
3. **Define success** — one metric, current value, target. If the metric isn't in `memory/business/metrics.md`, add it.
4. **Identify stakeholders** — verify each is in `memory/people/roster.md`. Add if missing.
5. **Write a one-pager** using `/one-pager` to align the room before kickoff.
6. **Run a kickoff** using `templates/kickoff.md`. File at `memory/deliverables/kickoffs/`.
7. **Add to** `memory/initiatives/INDEX.md`.
8. **Set first milestone** in the initiative file's Recent Changes log.

## Anti-patterns

- Don't start an initiative without a named owner.
- Don't start without a measurable success criterion.
- Don't skip the one-pager — alignment cost is paid up front or paid later, with interest.
