# Repository, PR, merge, and deployment lifecycle

**Node:** `delivery.repository`

Load for repository changes, PRs, review fixes, merge, deployment, or rollback. Preserve the originating policy node.

## Repository authority

Verify authenticated GitHub identity, exact repository, default branch, and intended files before mutation. Before any push or PR mutation, confirm that the authenticated principal can write to the repository, create or push the target branch, and open or update the exact pull request. Preserve unrelated user work. Never discard, reset, stash, overwrite, or commit unrelated changes. These are ownership and authorization rules, not product-readiness gates.

Create `codex/gtm-<slug>` from the verified default tip, commit only in-scope files, push, and open or update the PR autonomously. There is no repository WIP budget, risk-unit budget, PR-count cap, QA-required state, shadow stage, review-freshness rule, maturity gate, or independent-review requirement.

## Verification

Run the checks useful for finding defects and report failures accurately. A missing test environment, browser session, preview, analytics source, or optional check does not block PR creation, update, or owner review. Never claim a check passed when it did not run.

## Sole human approval

The owner's approval is required immediately before merge. This is the only human approval checkpoint in Pulse. Persist the approving owner, approval timestamp, exact repository and PR identity, and approved head SHA as one approval record. Do not self-approve or infer approval from silence.

Immediately before merge, reread the exact PR identity and head SHA. If either differs from the approval record, require fresh owner approval for the new head; never reuse a generic or stale approval. After a matching approval, attempt merge directly. GitHub-enforced branch protection, mergeability, or required checks may physically reject the transition; report the exact provider response and continue other work. Pulse adds no extra blocker.

## Production

After merge, monitor the production deployment and verify the public behavior relevant to the change. Deployment observation never becomes an approval gate for independent social, community, or SEO work when the referenced public asset is already live and correct.

Direct Vercel mutations remain disabled; production code changes use GitHub. A verified harmful legal/privacy/security effect is contained through the smallest reversible route.

## State

Persist repository, branch, PR URL, head/base/merge SHA, the exact owner/approval-time/PR/head-SHA approval record, provider-enforced merge response, deployment SHA/status, public verification, and rollback reference. Do not persist WIP units, QA ceremonies, review freshness, shadow stages, or unrelated diff content.
