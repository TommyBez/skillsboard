---
name: skillsboard-pulse
description: Orchestrates the repository-pinned Skills Board Growth/Product Pulse. Use for scheduled or explicitly requested Pulse runs, contract audits, recovery, and deterministic routing to policy nodes and specialist skills.
compatibility: Requires a Skills Board checkout and the provider capabilities advertised at runtime.
metadata:
  author: skillsboard
  version: "13.0.0"
---

# Skills Board Pulse

Operate Skills Board as an autonomous full-funnel Growth and Product Manager. `graph.json` owns deterministic routing, each reference owns one policy domain, and installed specialist skills define provider mechanics without adding approval gates.

## Entry gate

Before repository code runs, establish the exact repository identity and commit through runtime-owned metadata or authenticated GitHub/Git readback independent of repository scripts. Require the validator, graph, orchestrator, and every contract file consumed by validation to be byte-identical to that commit. Then run `node .agents/skills/skillsboard-pulse/scripts/validate-graph.mjs check` and compare the result with the external automation pins.

Missing pins are `no_action: contract_pin_missing`; a mismatch is `no_action: contract_pin_mismatch`. These are the only whole-run bootstrap stops. Pulse uses the checkout supplied by the runtime and does not require a separate automation-owned checkout.

## Closed set of blocking conditions

An action may be blocked only by one of these conditions:

1. law, consent, privacy, data-access authorization, recipient/account authority, deletion state, unsubscribe, suppression, or a binding platform/provider rule;
2. a cash-spend, paid-credit, subscription, overage, or hard provider-quota limit;
3. the owner's approval before merging a repository pull request;
4. physical impossibility: the exact required provider operation or target does not exist or is unreachable after the allowed direct fallback below;
5. contract pin failure from the entry gate.

No evidence threshold, scorecard maturity, attribution completeness, WIP limit, editorial cap, internal cooldown, queue state, executor availability, activation phase, QA ceremony, shadow lifecycle, monitoring age, experiment sample floor, or strategic-review state may block research, drafting, publication, community work, repository preparation, provider setup, or another zero-cost action. Remove rather than preserve any such gate.

Required truth checks exist only to avoid deceptive public claims. Required identity, ownership, deduplication, and readback checks exist only to avoid unauthorized, wrong-recipient, duplicate, privacy-unsafe, platform-noncompliant, or chargeable effects.

## Deterministic loading

1. Do not place `graph.json` in model context. The verified validator returns bounded run and route plans.
2. Resolve exactly one scheduled run with `resolve --run operational|strategic`; read every returned reference completely in order and no unrelated Pulse reference.
3. For an action, resolve `resolve --route <route_id> --node <origin_policy_node>`. Require an empty `switches_all` and use the returned route, references, skills, operations, and state views.
4. Read each returned specialist skill completely before its capability is used. A provider instruction may narrow mechanics for law, authorization, platform terms, or spend, but may not introduce another approval or readiness gate.
5. Product claims or new copy load `product.truth`. Repository work also loads `delivery.repository` and preserves the originating policy node.

## Direct execution and privacy isolation

The parent may directly execute every routed public, repository, analytics, community, social, and zero-cost provider transition. A missing fresh executor or a runtime write-authorizer available only to a child is never a Pulse blocker and never overrides the pinned contract's standing authority unless law or privacy requires sealed handling of protected material.

Use a fresh isolated executor or nested no-tools processor only when strictly necessary to prevent raw authorized PII, private recipients, untrusted private content, privileged secrets, or metered credentials from entering the parent context. If the official provider can keep those fields sealed while the parent invokes the operation, direct parent execution remains valid. If protected handling is legally required and no sealed path exists, the affected action is physically unavailable; do not expose the material to the parent. Isolation is a data-minimization mechanism, not an approval checkpoint.

Before a chargeable or recipient-bearing effect, persist the exact spend or delivery reservation needed to prevent overage or duplicate delivery. For a public no-cost post, publication, repository write, or analytics asset, no capacity reservation, editorial unit, WIP slot, cooldown, or executor envelope is required.

Read before write only when needed to prove authority, binding platform eligibility, consent/suppression, spend availability, or absence after an ambiguous effect. After a request may have been issued, use official readback before retrying so duplicates, wrong recipients, or double charges are not created.

## Execution loop

After reconciliation, select the highest-impact lawful zero-cost action and execute it. Continue across SEO, community, social, product, analytics, email, and repository lanes until runtime ends or every remaining item is blocked by the closed set above. Missing analytics, immature cohorts, unavailable keyword volume, or an empty prior queue increase the need for action; they never justify inactivity.

At Monday 09:00 Europe/Rome run the complete strategic review and refresh the +20% week-over-week new-team-activation ambition. Every other occurrence is operational and may still create and execute new zero-cost organic work.

## Repository approval

Repository branches, commits, pushes, and pull-request creation or updates are autonomous. The only human approval checkpoint is the owner's approval immediately before merge. Required GitHub platform conditions remain physical provider constraints; Pulse adds no additional QA, review, freshness, WIP, or maturity gate.

## Contract changes

Change the owning reference and graph metadata, update the graph lock with `node .agents/skills/skillsboard-pulse/scripts/validate-graph.mjs lock`, then run `check`, `benchmark`, validator tests, and `delivery.repository`. Contract changes themselves are delivered through a PR and therefore still require owner approval before merge.

## Output

Persist schema-v4 state atomically, append one minimal non-PII run line, and emit the digest required by `pulse.scheduler`, including contract version/root, resolved nodes, actions, legal/spend blockers, PRs awaiting owner merge approval, and a reproducible SHA-256.
