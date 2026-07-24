---
name: resend-connector
description: Operate Resend through the official authenticated Codex connector under the Skills Board Pulse privacy, ownership, readback, and lifecycle contract.
license: MIT
metadata:
  author: skillsboard
  version: "1.0.0"
---

# Official Resend connector

Use only official connected Resend tools advertised at runtime. Live descriptions control parameters, read-before-write, confirmation, reversibility, and lossy editor transitions; they may narrow but never broaden this contract.

## Control-plane boundary

- Do not run the Resend CLI, use `RESEND_API_KEY`, create an API key, call Resend REST endpoints, or build a custom SDK client for Pulse management. Existing application transactional delivery is separate and grants no Pulse authority.
- Connecting, reauthorizing, changing scopes or account ownership, revoking grants, and accepting terms are human setup. Missing authentication is `setup_required`.
- Verify the connected account boundary with successful low-risk authenticated connector reads and exactly one verified Skills Board domain/capability match before trusting any resource. If the connector advertises OAuth-grant metadata, use only its non-secret status and scopes as supporting evidence; do not require grant uniqueness or infer which grant backs the connection. Failed authentication or an absent, duplicate, or mismatched domain/capability result is `resend_identity_readback_unavailable` and quarantines Resend mutations.
- Discover capabilities each reconciliation. A missing mandatory read or operation makes only that operation `unavailable`; never substitute another interface.

## Data boundary

Keep raw contacts, addresses, names, subjects, bodies, headers, attachments, received email, suppression rows, and content-bearing logs out of model context, state, logs, PRs, and digests.

- Non-PII metadata reads may inspect domains, OAuth-grant status, topics, segments, webhook status, Broadcast status, automation status, and aggregate request health.
- A PII- or content-bearing read is eligible only when the connector advertises a server-side field-limited or aggregate projection that keeps raw fields out of the tool result and model context. Agent-side filtering, a child agent, or discarding the response later is not isolation. Without that projection, do not call it.
- Do not use contact listing, received-email reads, sent-email content, attachments, or full log bodies as a shortcut around the sealed application or inbound planes.
- This boundary applies to provider-returned and user-authored content. It does not prohibit the Pulse from composing bounded non-PII draft copy locally under `product.truth`; do not retrieve a provider copy of that content when safe status-only readback is sufficient.
- If live capability discovery does not expose a dedicated safe suppression read, do not infer provider suppression eligibility from contacts, delivery logs, webhook history, or absence of an error. Suppression-dependent sends and lifts remain unavailable until a sealed authoritative read exists.

## Lifecycle

Read before every mutation and reconcile afterward by opaque ID. Manage only Pulse-owned resources with deterministic names and exact definitions. Never blindly retry a lost or ambiguous response.

- Prefer reversible `update`, `disable`, or `cancel` operations over removal. Any connector tool that requires a fresh explicit human confirmation remains `manual_action`; standing Pulse autonomy is not that confirmation.
- Never create a webhook unless the live connector advertises a path for its one-time signing secret to flow directly into an approved sealed sink without appearing in connector output or model context. Otherwise creation is unavailable; metadata readback and reversible disable may remain eligible.
- A connector-created Broadcast may enter `shadow` as an unsent zero-audience draft only after local non-PII payload validation and binding to an exact Pulse-owned empty, non-reused segment. Keep that segment empty and the draft unsent until every audience and send gate passes. Follow `get_tiptap_json_content -> compose_broadcast` before changing editor content. Compose only when the existing editor mode is compatible or the live workflow permits it without a fresh user decision; if a mode switch requires that decision, do not switch and keep the draft inert.
- If an unsent draft is wrong, update it only when identity and definition remain valid. Otherwise leave it inactive, version the deterministic definition, and use a replacement only after ownership and capacity checks; do not remove it without the connector-required human confirmation.
- Missing exact topic binding, authoritative suppression readback, just-in-time validation, or a required reversible lifecycle blocks audience population and send. It need not block the bounded zero-audience `shadow` draft above when exact ownership, empty-segment binding, local copy validation, and status readback all pass. Metadata reconciliation and unsent-draft containment remain independent.
- Keep individual proactive send unavailable whenever the live surface lacks a deterministic provider-enforced idempotency-key input or PII-safe status-only readback by ID. Do not use scheduled send/cancel as a substitute for idempotency.
- Topic metadata and empty-segment metadata may advance independently after exact route, ownership, and readback checks. Contact creation/import, membership, per-recipient topic changes, and audience freezing remain unavailable unless the live connector provides an approved server-side projection and mutation path that keeps raw PII out of tool results and model context.

Return only the bounded canonical executor result required by `skillsboard-pulse`; never return provider payloads.
