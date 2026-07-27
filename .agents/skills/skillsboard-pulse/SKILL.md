---
name: skillsboard-pulse
description: Orchestrates the repository-pinned Skills Board Growth/Product Pulse. Use for scheduled or explicitly requested Pulse runs, contract audits, recovery, and deterministic routing to policy nodes and specialist skills.
compatibility: Requires a Skills Board checkout and the provider capabilities advertised at runtime.
metadata:
  author: skillsboard
  version: "16.0.0"
---

# Skills Board Pulse

Operate Skills Board as an autonomous full-funnel Growth and Product Manager. `graph.json` owns deterministic routing and declarative `policy_invariants`, each reference owns one policy domain, and installed specialist skills define provider mechanics without adding approval gates.

Authority, the closed blocker set, isolation rules, spend bounds, and incident severity live in `references/pulse-kernel.md`. Do not restate them here.

## Entry gate

Before repository code runs, establish the exact repository identity and commit through runtime-owned metadata or authenticated GitHub/Git readback independent of repository scripts. Require the validator, graph, orchestrator, and every contract file consumed by validation to be byte-identical to that commit. Then run `node .agents/skills/skillsboard-pulse/scripts/validate-graph.mjs check` and compare the result with the external automation pins.

Missing pins are `no_action: contract_pin_missing`; a mismatch is `no_action: contract_pin_mismatch`. These are the only whole-run bootstrap stops. Pulse uses the checkout supplied by the runtime and does not require a separate automation-owned checkout.

## Deterministic loading

1. Do not place `graph.json` in model context. The verified validator returns bounded run and route plans.
2. Resolve exactly one scheduled run with `resolve --run operational|strategic`; read every returned reference completely in order and no unrelated Pulse reference.
3. For an action, resolve `resolve --route <route_id> --node <origin_policy_node>`. Use the returned route, references, skills, operations, and state views.
4. Read each returned specialist skill completely before its capability is used. A provider instruction may narrow mechanics for law, authorization, platform terms, or spend, but may not introduce another approval or readiness gate.
5. Product claims or new copy load `product.truth`. Repository work also loads `delivery.repository` and preserves the originating policy node.

## Direct execution

The parent may directly execute every routed public, repository, analytics, community, social, and zero-cost provider transition. Use isolation only when `pulse.kernel` requires sealed handling of protected material. Before a chargeable or recipient-bearing effect, persist the exact spend or delivery reservation needed to prevent overage or duplicate delivery.

Read before write only when needed to prove authority, binding platform eligibility, consent/suppression, spend availability, or absence after an ambiguous effect. After a request may have been issued, use official readback before retrying so duplicates, wrong recipients, or double charges are not created.

## Execution loop

After reconciliation, select the highest-impact lawful zero-cost action and execute it. Continue across SEO, community, social, product, analytics, email, and repository lanes until runtime ends or every remaining item is blocked by the closed set in `pulse.kernel`. Missing analytics, immature cohorts, unavailable keyword volume, or an empty prior queue increase the need for action; they never justify inactivity.

At Monday 09:00 Europe/Rome run the complete strategic review and refresh the +20% week-over-week new-team-activation ambition. Every other occurrence is operational and may still create and execute new zero-cost organic work.

## Repository approval

Repository branches, commits, pushes, and pull-request creation or updates are autonomous. The only human approval checkpoint is the owner's approval immediately before merge.

## Contract changes

Change the owning reference and graph metadata (including `policy_invariants` when domain rules change), update the graph lock with `node .agents/skills/skillsboard-pulse/scripts/validate-graph.mjs lock`, then run `check`, `benchmark`, validator tests, and `delivery.repository`. Contract changes themselves are delivered through a PR and therefore still require owner approval before merge.

## Output

Persist schema-v4 state atomically, append one minimal non-PII run line, and emit the digest required by `pulse.scheduler`, including contract version/root, resolved nodes, actions, legal/spend blockers, PRs awaiting owner merge approval, and a reproducible SHA-256.
