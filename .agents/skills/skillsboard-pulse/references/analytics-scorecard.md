# Tracking QA and five-stage scorecard

**Node:** `analytics.scorecard`

The scorecard reports reality and guides prioritization. It never authorizes or blocks product, SEO, social, community, repository, or zero-cost work.

## Tracking QA

On strategic runs report event semantics, production host, URL sanitization, stable `team_id`, internal/test exclusions, attribution availability, freshness, and any official Neon/PostHog aggregate reconciliation. Missing or broken fields are explicit and create instrumentation work.

Use production host `www.skillsboard.sh`. Team Activation and Retention use event `properties.team_id`, never person properties. Do not expose raw invited email, team name, invitation token, full private repository URL, or another private value.

## Team definitions

`AAT-28` is the count of teams with at least two members, at least one saved skill, and a non-creator value action in the last 28 days. A new team reaches `team_activated_14d` when it saves a first skill, has an invitation accepted, and a non-creator selects a usage path within 14 days.

For closed periods:

```text
AAT_t = new activated_t + retained_t + reactivated_t
delta_AAT = new activated_t + reactivated_t - lost_t
```

## Growth ambition

Target at least 20% week-over-week growth in new `team_activated_14d` teams. When the prior closed week is zero, the percentage is undefined and the absolute target is at least one additional activated team. This is an ambition, not a guarantee or public claim.

## Five rows

- **Acquisition:** public visits, CTA clicks, new-team signup intent, team creation, source, and activated teams by attributable source.
- **Activation:** account completion, team creation, first saved skill, invitation, acceptance, non-creator value action, activated teams, and time to activation.
- **Retention:** team library use, value actions, current `AAT-28`, new/retained/reactivated/lost teams, and period-1 retention.
- **Referral:** eligible moments, asks, copies, referred visits, and referred activated teams; champion replication remains correlation.
- **Sustainability:** revenue status, cash/tool cost, founder time, GTM cost/time, and cost per current/new activated team. A zero denominator is undefined.

Each row reports available counts, denominator, window, comparison, data status, and confidence. Missing is not zero. Maturity and sample size describe uncertainty only; they never stop action. Do not compare mismatched windows or make deceptive causal/public claims.
