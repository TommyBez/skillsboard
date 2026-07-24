---
name: skillsboard-pulse
description: Orchestrates the repository-pinned Skills Board Growth/Product Pulse. Use for scheduled or explicitly requested Pulse runs, contract audits, recovery, and deterministic routing to policy nodes and specialist skills.
compatibility: Requires a Skills Board checkout and the provider capabilities advertised at runtime.
metadata:
  author: skillsboard
  version: "5.0.0"
---

# Skills Board Pulse

Operate Skills Board as an autonomous full-funnel Growth and Product Manager. This skill is the only Pulse orchestrator. `graph.json` owns routing; each reference owns one policy domain; installed specialist skills govern how to use a capability but never broaden this contract.

## Entry gate

The repository checkout gate in `.agents/skills/skillsboard-pulse/references/pulse-kernel.md` must have passed in the current run before loading product context, state, providers, or any other node. The invoking automation performs it first. If there is no recorded proof, read only that node, run the gate, and stop with its exact whole-run `no_action` on failure. A read-only audit of a contract candidate may then use `contract.audit` plus `delivery.repository` to switch from the synchronized default branch to one fetched, clean, exact, verified Pulse-owned PR head; it loads no runtime state/provider and makes no external mutation. Being already on an arbitrary candidate branch never bypasses the gate.

## Deterministic loading

1. Run `node .agents/skills/skillsboard-pulse/scripts/validate-graph.mjs check` and compare the computed contract version/root hash with the exact values in the invoking scheduled task. Missing pins are `no_action: contract_pin_missing`; a mismatch is `no_action: contract_pin_mismatch`. A contract-candidate audit may instead use the verified candidate root under the entry-gate exception and must remain read-only.
2. Do not place `graph.json` in model context. The validator reads the machine manifest and returns a bounded plan without exposing the manifest or node contents. Every returned reference path is relative to the repository root.
3. The parent orchestrator resolves exactly one run with `resolve --run operational|strategic`. It reads every returned reference completely, in resolver order, and no other Pulse reference. Only then does it load the returned state views and use their route and policy IDs rather than inferring from free text.
4. For a selected work item, the parent obtains the machine route plan with `resolve --route <route_id> --node <origin_policy_node>` but does not read its returned references or skills yet. Every work item has exactly one origin. Standard routes accept only an origin already inside their policy closure; repository delivery routes additionally enforce their explicit allowlist.
5. Evaluate every `switches_all` value from that plan before reserving or dispatching. Any value other than literal `1` makes the operation `disabled`; the parent persists `switch_disabled` without loading route references, specialist skills, or a provider. If all preflight gates pass, dispatch the exact plan to a fresh isolated executor context, which rechecks the root and resolves the same route and origin.
6. Never combine `--run` and `--route`, append active nodes to a run closure, or reuse an executor for a second transition.
7. Read each returned specialist skill completely before using its capability. A missing required node, skill, read, route, isolated executor, or advertised operation blocks only the dependent operation unless the kernel says it is whole-run critical.

The resolver's `context` block counts this orchestrator entrypoint, resolved policy references, and repository specialist-skill entrypoints. Runtime skills and nested files requested by any skill are explicitly `unpriced`; do not claim the known total is complete. Run `node .agents/skills/skillsboard-pulse/scripts/validate-graph.mjs benchmark` after contract or skill-catalog changes.

The static policy graph and the mutable schema-v4 work graph are different artifacts. Never write live state, evidence, IDs, counters, or queue items into `graph.json`.

## Route selection

- A scheduled run always selects its exact `operational` or `strategic` run type.
- Runtime state supplies active and due policy-node IDs through the selectors declared in `graph.json`; do not infer substitutes from resource names.
- A transition that writes externally must select the exact advertised operation route. If no route covers it, the operation is `policy_ineligible` until the contract changes.
- Every work item carries exactly one originating policy node. A repository item carries that node in addition to `delivery.repository`; delivery policy cannot authorize product or GTM scope by itself.
- Product claims or new copy add `product.truth`; pure readback does not.
- Conditional skills and nodes are loaded only when the route's stated predicate is true.

## Isolated execution envelope

The parent is the sole writer of schema-v4 state, the run log, queue, and digest. Before any external effect it atomically reserves the exact work/resource key, interference keys, cap or send allowance, and worst-case ambiguous capacity. It may reserve a compatible batch and parallelize low-risk reads or independent executors, but it must never dispatch overlapping effects or let children race on the shared state file.

Each executor receives only an immutable non-PII envelope containing: checkout gate proof and default SHA; contract version/root; run and attempt IDs; work and resource keys; definition hash; route and origin-policy IDs; exact selected state views; switch results; current-task authorization scopes required by the selected specialist lifecycle; ownership/readback identity; lock, interference, cap and reservation snapshot; expected transition; and deterministic recovery name. It must fail closed if any identity, authorization scope, or hash differs from the current invocation or official readback.

An executor performs at most one bounded transition, follows every returned policy and specialist skill, performs official readback, and returns canonical sorted-key JSON no larger than the resolver's `executor_result.max_bytes` (4 KiB in this contract). Use every required key and no others:

```json
{"ambiguity":false,"attempt_id":"opaque","attempted":false,"capacity_consumed":{},"containment":"none","definition_hash":"lower-case SHA-256","definition_match":null,"effect":"none","evidence_refs":[],"live_id":null,"outcome":"no_action","readback":"not_required","reason_code":"switch_disabled","reason_detail":null,"resource_key":"opaque","route_id":"route.id","schema_version":1}
```

`definition_match` is `true|false|null`; `live_id` and sanitized `reason_detail` are string or null; `capacity_consumed` maps sorted non-PII ledger IDs to non-negative integers; `evidence_refs` contains only opaque IDs or public URLs. Use only the resolver-advertised values for `effect`, `outcome`, `readback`, `containment`, and `reason_code`. The parent rejects an unknown key/value, identity mismatch, invalid hash, non-canonical encoding, oversized result, or unexpected attempt/route/resource/definition. The executor never edits state, log, queue, or digest. Lost, oversized, invalid, or ambiguous responses keep the parent's reservation live and are recovered by deterministic official readback; never blind-retry.

## Fixed-point execution

After the run closure's reconciliation and monitoring steps:

1. refresh dependencies, caps, locks, interference, capability state, and official readback;
2. select the highest-priority compatible `actionable_now` item;
3. reserve and dispatch the exact isolated route executor;
4. validate its official readback result, persist the non-PII transition atomically, and reconcile the external effect;
5. recompute the work graph and repeat until fixed point.

Do not stop merely because one action completed. Do not route a second strategic constraint during an operational run. If runtime ends while compatible work remains, preserve it as `interrupted_with_runnable_work`.

## State projection and context hygiene

The parent loads only the schema-v4 index, active/due route and policy IDs, aggregate counters required by the run closure, and one selected projection per reserved executor. An executor receives only its envelope and resolved route state views. Do not place raw PII, secrets, message bodies, survey free text, untrusted inbound text, or unrelated historical work in model context. Detailed external effects remain in official provider readback; state remains a reconciled non-PII projection.

## Contract changes

Every policy rule has one owning reference. Change that owner and graph metadata rather than duplicating prose elsewhere. Update the graph lock with `node .agents/skills/skillsboard-pulse/scripts/validate-graph.mjs lock`, run `check`, `benchmark`, and the validator tests, then follow `delivery.repository`. A new pinned contract first runs `reconciliation_only`, then one read-only strategic bootstrap, before normal execution.

## Output

Emit the digest required by `pulse.scheduler`. Include the resolved node IDs and graph root hash so another run can reproduce the policy closure without loading unrelated nodes.
