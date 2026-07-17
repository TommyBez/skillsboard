# Animation plans

| # | Plan | Severity | Status |
| --- | --- | --- | --- |
| 001 | [Choreograph the landing page](001-landing-motion-system.md) | MEDIUM | DONE |
| 002 | [Add shared app motion tokens](002-app-motion-tokens.md) | LOW | DONE |
| 003 | [Animate the account menu from its trigger](003-user-menu-motion.md) | MEDIUM | DONE |
| 004 | [Reveal add-skill discovery fields](004-add-skill-discovery-reveal.md) | MEDIUM | DONE |
| 005 | [Near-imperceptible copy success feedback](005-copy-success-feedback.md) | LOW | DONE |
| 006 | [Fade MCP setup tab panel swaps](006-tabs-content-fade.md) | LOW | DONE |

## Source

Plans 002–006 are the gated microinteraction opportunities from `find-animation-opportunities` (app surfaces only; landing excluded as already good). Stamp commit: `1a59c7e`.

## Recommended execution order

1. **002** — tokens first (no UI change).
2. **003** — highest leverage teleport fix (account menu). Depends on 002.
3. **004** — add-skill discovery reveal. Depends on 002; independent of 003.
4. **005** then **006** — low-severity polish. Both depend on 002; independent of each other.

`003` and `004` can run in parallel after `002`. Do not start 003–006 before 002 lands.

## Dependencies

```
002 ──┬── 003
      ├── 004
      ├── 005
      └── 006
```

## Execution

For any plan: `improve-animations execute plans/00N-….md` (or hand the plan file to any agent). After each implementation, review the diff with `review-animations`.

No plan in this set should introduce a motion library.
