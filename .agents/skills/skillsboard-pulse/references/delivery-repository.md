# Repository, PR, merge, and deployment lifecycle

**Node:** `delivery.repository`

Load for every repository modification, open PR, review/check transition, merge, production deployment, or code rollback. This node cannot authorize scope by itself: each work item must also load and record its `origin_policy_node`.

## Preconditions and ownership

The dedicated whole-run checkout gate in `pulse.kernel` must already have passed. Before a new repository item, reconcile live open PRs and confirm no overlapping exact `resource_key` or materially conflicting `interference_keys`; reserve the applicable general repository risk units or pSEO slot.

For new work, create `codex/gtm-<slug>` from the synchronized default-branch tip. To update an existing Pulse-owned PR after the gate:

1. fetch its exact remote head;
2. verify clean checkout, resolved default base, matching GitHub/state head and owner/resource key, and no unrelated divergence;
3. switch only to that exact head.

Create or reuse only the kernel-owned private automation worktree. Never create another worktree, restore an arbitrary prior branch, rewrite history, combine unrelated resource keys, or continue after a failed gate. A pending PR locks only its resource key; independent lanes continue.

## Implementation and verification

Implement one coherent reversible change under the origin node. Run risk-proportionate verification and inspect the final diff for unrelated changes, secrets, raw PII, private configuration, generated noise, and contract inconsistency.

For user-facing work, complete the affected flow locally against the Development environment before PR whenever the exact QA capability is available. If an exact required environment, account, fixture, browser interaction, or authenticated capability is unavailable after every other repository gate passes, the Pulse may still open or update a reviewable PR in `qa_required` state. The PR and state must name each missing check, why it is unavailable, the exact reproduction path and expected result, and the deterministic predicate that clears it. Complete every available check; never report the missing interaction as verified. Vercel Preview is build/CI evidence only because access may be protected. Verify as applicable:

- exact product-contract and shipped-capability accuracy;
- type checks, focused tests, and build;
- desktop/mobile, keyboard/accessibility, and responsive behavior;
- empty, loading, error, and recovery states;
- UI-to-data path and cross-team isolation where relevant;
- backward compatibility and migration/deletion safety;
- preregistered flag-off or rollback path.

High-risk work also performs the risk-specific matrix in `product.lifecycle`. Do not claim browser interaction QA from a build or protected preview. `qa_required` permits PR creation and review only: it blocks that PR's merge and every deployment-triggering repository action, rollout, publication, send, or user exposure that depends on its change until official or local exact evidence proves every recorded check and atomically clears the state. Unrelated lanes remain eligible.

## PR contract

Commit and push only explicit in-scope files, then open or update the PR. The description records:

- deterministic resource key, origin policy node, route ID, and aggregate evidence;
- affected metric/window and opportunity or verified root cause;
- scope and explicitly excluded work;
- local and automated verification;
- any `qa_required` checks, reproduction path, expected result, and clearing evidence;
- observation window, success/kill rules, and interference;
- risk class and reserved repository WIP units;
- reversible containment and revert path.

Answer actionable review comments within scope and mark the PR ready for review when its available checks are green; `qa_required` remains a visible merge blocker until cleared. Inspect live thread-aware state: green CI does not resolve review threads. Never self-approve, dismiss the independent checkpoint, fabricate approval, or bypass branch protection.

GitHub's required checks, mergeability, actionable review threads, branch protection, and independent approval are authoritative. Do not invent approval timeout, approval freshness, or SHA-expiry rules beyond repository configuration.

## Merge and production

After independent approval, resolved actionable threads, green required checks, and exact clearing evidence for every `qa_required` item, merge through the allowed GitHub lifecycle. Then monitor the production Vercel deployment, verify its Git SHA matches the merge, inspect relevant health and measurement, and confirm the flag-off operational path before exposure.

Direct Vercel mutations are disabled under this contract. Production deployment and code rollback use GitHub. For an active harmful flag-backed change, remove exposure first through its official provider containment, then use a rollback/fix PR as required. A protected preview is never the final production proof.

## Operation readiness

Authenticated GitHub/Vercel reads may be `read_only`. Local branch/test/diff work is `shadow`. Repository effects require their exact canonical graph route ID, verified GitHub identity/repository/default branch, ownership, risk-weighted WIP capacity, no overlap, and lifecycle gates. Pulse operations have no environment opt-in switches. Vercel remains read-only.

The Pulse may merge only after the independent checkpoint; a human approval is not permission to ignore a new failing check or unresolved actionable thread. If GitHub or deployment readback is unavailable, keep the affected lifecycle read-only/unavailable and continue independent work.

## State and digest

Persist resource key, origin/policy nodes, route, branch/URL, exact head/base SHAs, owner, approval, checks, review threads, mergeability, merge SHA, production deployment SHA/status, local verification, monitoring, and rollback. Never store tokens, private review content beyond a sanitized actionable summary, or unrelated diff content.
