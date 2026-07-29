import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  checkGraph,
  resolveGraph,
} from "../scripts/validate-graph.mjs";

test("operational runs resolve the governing objective and organic candidate families", () => {
  const checked = checkGraph();
  const run = resolveGraph(checked.graph, { run: "operational", nodes: [] });

  assert.equal(run.nodes.some(({ id }) => id === "learning.opportunities"), true);
  assert.equal(run.nodes.some(({ id }) => id === "analytics.scorecard"), true);
  assert.equal(run.nodes.some(({ id }) => id === "growth.pseo"), true);
  assert.equal(run.nodes.some(({ id }) => id === "channels.social"), true);
  assert.equal(run.nodes.some(({ id }) => id === "channels.distribution"), true);
  assert.equal(run.nodes.some(({ id }) => id === "email.inbound"), true);
  assert.equal(run.nodes.some(({ id }) => id === "email.outbound"), true);
  assert.equal(Object.hasOwn(run.state_views, "opportunities"), true);
  assert.equal(Object.hasOwn(run.state_views, "scorecard"), true);
  assert.equal(Object.hasOwn(run.state_views, "pseo"), true);
  assert.equal(Object.hasOwn(run.state_views, "social"), true);
  assert.equal(Object.hasOwn(run.state_views, "distribution"), true);
  assert.equal(Object.hasOwn(run.state_views, "email"), true);
  assert.equal(Object.hasOwn(run.state_views, "inbound"), true);
  assert.equal(Object.hasOwn(run.state_views, "delivery"), true);
});

test("the mandatory kernel exposes a closed blocker set and direct parent authority", () => {
  const checked = checkGraph();
  const kernel = readFileSync(new URL("../references/pulse-kernel.md", import.meta.url), "utf8");

  assert.deepEqual(checked.graph.mandatory_nodes, ["pulse.kernel"]);
  assert.match(kernel, /complete closed set of conditions that may block an action/);
  assert.match(kernel, /The only human approval is the owner's approval immediately before merging a pull request/);
  assert.match(kernel, /Every other historical gate is removed/);
  assert.match(kernel, /The pinned contract plus an active native automation authorize all routed actions except PR merge/);
  assert.match(kernel, /The parent executes routed actions directly/);
  assert.match(kernel, /Official provider confirmation prompts may enforce binding terms, recipient\/account authorization, irreversible deletion, or spend/);
  assert.match(kernel, /They may not add a general human confirmation for already-authorized publication/);
  assert.match(kernel, /DataForSEO is the only metered Pulse provider/);
  assert.match(kernel, /Contract pin failure alone stops the whole run/);
});

test("autonomy contract removes every routine blocker outside the closed set", () => {
  const checked = checkGraph();
  const orchestrator = readFileSync(new URL("../SKILL.md", import.meta.url), "utf8");
  const kernel = readFileSync(new URL("../references/pulse-kernel.md", import.meta.url), "utf8");
  const analytics = readFileSync(new URL("../references/analytics-control-plane.md", import.meta.url), "utf8");
  const scorecard = readFileSync(new URL("../references/analytics-scorecard.md", import.meta.url), "utf8");
  const learning = readFileSync(new URL("../references/learning-opportunities.md", import.meta.url), "utf8");
  const distribution = readFileSync(new URL("../references/channels-distribution.md", import.meta.url), "utf8");
  const social = readFileSync(new URL("../references/channels-social.md", import.meta.url), "utf8");
  const delivery = readFileSync(new URL("../references/delivery-repository.md", import.meta.url), "utf8");
  const inbound = readFileSync(new URL("../references/email-inbound.md", import.meta.url), "utf8");
  const email = readFileSync(new URL("../references/email-outbound.md", import.meta.url), "utf8");
  const pseo = readFileSync(new URL("../references/growth-pseo.md", import.meta.url), "utf8");
  const product = readFileSync(new URL("../references/product-lifecycle.md", import.meta.url), "utf8");
  const scheduler = readFileSync(new URL("../references/pulse-scheduler.md", import.meta.url), "utf8");

  assert.equal(checked.graph.contract_version, 18);
  for (const contractFile of [orchestrator, kernel, delivery, scheduler]) {
    assert.doesNotMatch(contractFile, /CODEX_HOME|automation_checkout_path_unavailable/);
  }
  assert.match(orchestrator, /closed blocker set/);
  assert.match(orchestrator, /pulse-kernel\.md/);
  assert.match(orchestrator, /The parent may directly execute every routed public, repository, analytics, community, social, and zero-cost provider transition/);
  assert.match(kernel, /The only human approval is the owner's approval immediately before merging a pull request/);
  assert.match(kernel, /Every other historical gate is removed/);
  assert.match(kernel, /The parent executes routed actions directly/);
  assert.match(kernel, /DataForSEO is the only metered Pulse provider/);
  assert.match(delivery, /The owner's approval is required immediately before merge/);
  assert.match(delivery, /There is no repository WIP budget, risk-unit budget, PR-count cap, QA-required state, shadow stage, review-freshness rule, maturity gate, or independent-review requirement/);
  assert.match(analytics, /There is no read-only-to-shadow-to-enabled lifecycle, asset cap, WIP gate, maturity requirement, exposure wait, preregistration gate, or measurement-health prerequisite/);
  assert.match(scorecard, /The scorecard reports reality and owns the governing growth objective\. It never authorizes or blocks/);
  assert.match(learning, /It does not impose evidence thresholds before action/);
  assert.match(distribution, /There is no Pulse-defined seven-day contact cap/);
  assert.match(social, /The parent invokes the official Typefully capability directly/);
  assert.match(social, /There is no rolling editorial cap, minimum gap, queue reservation, cooldown, weekly quota, or publishing-frequency gate/);
  assert.match(inbound, /There is no Pulse-defined mailbox lookback gate/);
  assert.match(email, /No per-send human confirmation, isolated executor availability, shadow draft, empty-segment ceremony, internal attention cap, campaign WIP, audience-size threshold, scheduling prohibition, or readiness lifecycle is required/);
  assert.match(pseo, /There is no rolling PR cap, page cap, problem-cluster lock, sibling limit, checkpoint gate, maturity wait/);
  assert.match(product, /There is no exposure-unit budget, survey-slot cap, experiment-series limit, minimum sample, evidence-stage threshold, WIP gate/);
  assert.match(scheduler, /Do not persist `waiting_maturity`, `waiting_cooldown`, `waiting_dependency`, `manual_action`, `setup_required`, `shadow`/);
  assert.match(email, /The pinned Resend connector skill remains byte-identical upstream/);
  assert.match(email, /Do not change or fork the upstream connector skill/);
});

test("the governing objective exhausts positive candidates without output quotas", () => {
  const orchestrator = readFileSync(new URL("../SKILL.md", import.meta.url), "utf8");
  const scorecard = readFileSync(new URL("../references/analytics-scorecard.md", import.meta.url), "utf8");
  const learning = readFileSync(new URL("../references/learning-opportunities.md", import.meta.url), "utf8");
  const pseo = readFileSync(new URL("../references/growth-pseo.md", import.meta.url), "utf8");
  const distribution = readFileSync(new URL("../references/channels-distribution.md", import.meta.url), "utf8");
  const social = readFileSync(new URL("../references/channels-social.md", import.meta.url), "utf8");
  const scheduler = readFileSync(new URL("../references/pulse-scheduler.md", import.meta.url), "utf8");
  const checked = checkGraph();
  const operational = resolveGraph(checked.graph, { run: "operational", nodes: [] });
  const operationalNodeIds = operational.nodes.map(({ id }) => id);

  assert.match(scorecard, /Grow `AAT-28` by at least 20% week over week/);
  assert.match(scorecard, /when the prior close is zero[^\n]*absolute target is at least one active team/);
  assert.match(scorecard, /`team_activated_14d` is a leading contribution to the objective, not the objective itself/);
  assert.match(learning, /Every run synthesizes the complete current candidate set from every applicable action family/);
  assert.match(learning, /finite-snapshot fields/);
  assert.match(learning, /deterministic maximal-set algorithm/);
  assert.match(learning, /A `prerequisite_pending` candidate remains excluded until every listed prerequisite is complete/);
  assert.match(learning, /closed-set blocker on a prerequisite never releases the edge/);
  assert.match(learning, /A `conflict_loser:<winner_candidate_id>` candidate returns for consideration while its winner remains incomplete/);
  assert.match(learning, /An empty queue, a first completed action, a first observed signal, or evidence repair never proves exhaustion/);
  assert.match(pseo, /Research the ICP's problems, work, tools, interests, and adjacent topics/);
  assert.match(pseo, /Queries do not need to contain “skill”, “agent”, “library”, or the product name/);
  assert.match(pseo, /DataForSEO is the only metered provider/);
  assert.match(pseo, /The user's “bananas” example is valid in principle/);
  assert.match(pseo, /There is no per-run output quota/);
  assert.match(pseo, /There is no rolling PR cap, page cap, problem-cluster lock, sibling limit, checkpoint gate, maturity wait/);
  assert.match(distribution, /Community is a zero-cost candidate family/);
  assert.match(distribution, /there is no per-run community quota/);
  assert.match(distribution, /There is no Pulse-defined seven-day contact cap, top-level-post cap, subreddit cooldown, directory quota/);
  assert.match(social, /Owned social is a near-zero-cost candidate family/);
  assert.match(social, /There is no per-run publication quota/);
  assert.match(social, /The parent invokes the official Typefully capability directly/);
  assert.match(orchestrator, /Execute only the first candidate in that snapshot's deterministic selected order/);
  assert.match(orchestrator, /continue through successive fresh snapshots while any mutually compatible positive candidate remains actionable/);
  assert.match(orchestrator, /Only the scheduler's fresh fixed-point proof establishes exhaustion; runtime ending earlier is an interruption/);
  assert.match(scheduler, /freeze a finite snapshot/);
  assert.match(scheduler, /select the deterministic maximal compatible set/);
  assert.match(scheduler, /`candidate\.v1\.<origin_hex>\.<route_hex>\.<effect_hex>`/);
  assert.match(scheduler, /Prerequisites are directed all-of edges and are never copied into the symmetric conflict graph/);
  assert.match(scheduler, /`prerequisite_pending:<sorted_candidate_ids>`/);
  assert.match(scheduler, /raw ASCII ascending/);
  assert.match(scheduler, /`conflict_loser:<winner_candidate_id>`/);
  assert.match(scheduler, /losing candidate is eligible for selection again/);
  assert.match(scheduler, /completing the first action or observing the first signal never discharges the objective/);
  assert.match(scheduler, /`fixed_point_complete` requires a fresh valid snapshot/);
  assert.match(scheduler, /every applicable family has `family_enumerated=true`/);
  assert.match(scheduler, /There is no repository WIP budget, pSEO PR\/page quota/);
  assert.doesNotMatch(learning, /must produce and execute a search action and a community\/social action/);
  assert.doesNotMatch(pseo, /Every strategic run publishes or opens a PR/);
  assert.doesNotMatch(social, /Every strategic run[^\n]*publishes/);
  assert.doesNotMatch(scheduler, /at least one smallest useful action|protected priority lane/);
  assert.equal(operationalNodeIds.includes("analytics.scorecard"), true);
  assert.equal(operationalNodeIds.includes("growth.pseo"), true);
  assert.equal(operationalNodeIds.includes("channels.social"), true);
  assert.equal(operationalNodeIds.includes("channels.distribution"), true);
  assert.equal(operationalNodeIds.includes("email.inbound"), true);
  assert.equal(operationalNodeIds.includes("email.outbound"), true);
  assert.equal(Object.hasOwn(operational.state_views, "scorecard"), true);
  assert.equal(Object.hasOwn(operational.state_views, "pseo"), true);
  assert.equal(Object.hasOwn(operational.state_views, "social"), true);
});

test("candidate IDs are canonical, injective, stable, and validated before selection", () => {
  const identityTuple = ({ effectKey, originPolicyNode, routeId }) => [
    originPolicyNode,
    routeId,
    effectKey,
  ];
  const encodeIdentityComponent = (value) => {
    assert.match(value, /^[\x21-\x7e]+$/, "non-canonical identity component");
    return Buffer.from(value, "utf8").toString("hex");
  };
  const deriveCandidateId = (candidate) =>
    `candidate.v1.${identityTuple(candidate).map(encodeIdentityComponent).join(".")}`;
  const compareCanonicalAscii = (left, right) => {
    const leftJson = JSON.stringify(left);
    const rightJson = JSON.stringify(right);
    return leftJson < rightJson ? -1 : leftJson > rightJson ? 1 : 0;
  };
  const setLikeFields = new Set([
    "conflicts",
    "interferenceKeys",
    "operations",
    "prerequisites",
  ]);
  const canonicalize = (value, fieldName) => {
    if (Array.isArray(value)) {
      const items = value.map((child) => canonicalize(child));
      return setLikeFields.has(fieldName) ? items.sort(compareCanonicalAscii) : items;
    }
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value)
          .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
          .map(([key, child]) => [key, canonicalize(child, key)]),
      );
    }
    return value;
  };
  const nonIdentityKey = (candidate) => {
    const {
      effectKey: _effectKey,
      originPolicyNode: _originPolicyNode,
      persistedId: _persistedId,
      routeId: _routeId,
      snapshotId: _snapshotId,
      ...nonIdentity
    } = candidate;
    return JSON.stringify(canonicalize(nonIdentity));
  };
  const prepareCandidates = (candidates) => {
    const unique = new Map();
    for (const candidate of candidates) {
      const derivedId = deriveCandidateId(candidate);
      if (candidate.persistedId && candidate.persistedId !== derivedId) {
        throw new Error("persisted candidate ID mismatch");
      }
      const identity = JSON.stringify(identityTuple(candidate));
      const nonIdentity = nonIdentityKey(candidate);
      const existing = unique.get(derivedId);
      if (existing && existing.identity !== identity) {
        throw new Error("candidate ID associated with different identity tuples");
      }
      if (existing && existing.nonIdentity !== nonIdentity) {
        throw new Error("inconsistent duplicate candidate emissions");
      }
      if (!existing) {
        unique.set(derivedId, {
          candidate: { ...candidate, id: derivedId },
          identity,
          nonIdentity,
        });
      }
    }
    return [...unique.values()].map(({ candidate }) => candidate);
  };

  const minimal = { effectKey: "c", originPolicyNode: "a", routeId: "b" };
  assert.equal(deriveCandidateId(minimal), "candidate.v1.61.62.63");
  assert.equal(deriveCandidateId({ ...minimal, rank: 4, snapshotId: "later" }), deriveCandidateId(minimal));
  assert.notEqual(
    deriveCandidateId({ effectKey: "d", originPolicyNode: "ab", routeId: "c" }),
    deriveCandidateId({ effectKey: "d", originPolicyNode: "a", routeId: "bc" }),
  );
  assert.notEqual(deriveCandidateId({ ...minimal, originPolicyNode: "z" }), deriveCandidateId(minimal));
  assert.notEqual(deriveCandidateId({ ...minimal, routeId: "z" }), deriveCandidateId(minimal));
  assert.notEqual(deriveCandidateId({ ...minimal, effectKey: "z" }), deriveCandidateId(minimal));
  assert.equal(prepareCandidates([minimal, { ...minimal }]).length, 1);
  const candidateWithOrderedAndSetLikeFields = {
    ...minimal,
    conflicts: ["candidate.z", "candidate.a"],
    prerequisites: ["candidate.p2", "candidate.p1"],
    rank: [4, 3, 2, 1],
  };
  assert.equal(prepareCandidates([
    candidateWithOrderedAndSetLikeFields,
    {
      ...candidateWithOrderedAndSetLikeFields,
      conflicts: ["candidate.a", "candidate.z"],
      prerequisites: ["candidate.p1", "candidate.p2"],
    },
  ]).length, 1);
  assert.throws(
    () => prepareCandidates([minimal, { ...minimal, rank: 2 }]),
    /inconsistent duplicate candidate emissions/,
  );
  assert.throws(
    () => prepareCandidates([{ ...minimal, rank: 2 }, minimal]),
    /inconsistent duplicate candidate emissions/,
  );
  assert.throws(
    () => prepareCandidates([
      candidateWithOrderedAndSetLikeFields,
      { ...candidateWithOrderedAndSetLikeFields, rank: [1, 2, 3, 4] },
    ]),
    /inconsistent duplicate candidate emissions/,
  );
  assert.throws(
    () => deriveCandidateId({ ...minimal, effectKey: "" }),
    /non-canonical identity component/,
  );
  assert.throws(
    () => deriveCandidateId({ ...minimal, effectKey: "é" }),
    /non-canonical identity component/,
  );
  assert.throws(
    () => prepareCandidates([{ ...minimal, persistedId: deriveCandidateId({ ...minimal, effectKey: "other" }) }]),
    /persisted candidate ID mismatch/,
  );

  const tiedA = { effectKey: "effect-a", originPolicyNode: "origin", routeId: "route" };
  const tiedB = { effectKey: "effect-b", originPolicyNode: "origin", routeId: "route" };
  const chooseTieWinner = (candidates) => [...candidates]
    .map((candidate) => ({ ...candidate, id: deriveCandidateId(candidate) }))
    .sort((left, right) => left.id < right.id ? -1 : left.id > right.id ? 1 : 0)[0].id;
  const tieWinnerId = chooseTieWinner([tiedA, tiedB]);
  assert.equal(chooseTieWinner([tiedB, tiedA]), tieWinnerId);
  assert.equal(`conflict_loser:${tieWinnerId}`.endsWith(tieWinnerId), true);
});

test("directed prerequisites and symmetric conflicts produce one deterministic valid snapshot", () => {
  const compareAscii = (left, right) => left < right ? -1 : left > right ? 1 : 0;
  const compareCandidates = (left, right) =>
    right.contribution - left.contribution
    || right.urgency - left.urgency
    || right.confidence - left.confidence
    || left.runtimeMinutes - right.runtimeMinutes
    || compareAscii(left.id, right.id);
  const validatePrerequisites = (candidates, completedIds) => {
    const currentIds = new Set(candidates.map(({ id }) => id));
    const knownIds = new Set([...currentIds, ...completedIds]);
    for (const candidate of candidates) {
      for (const conflictId of candidate.conflicts) {
        if (!currentIds.has(conflictId)) throw new Error("unknown conflict");
      }
      for (const prerequisiteId of candidate.prerequisites) {
        if (prerequisiteId === candidate.id) throw new Error("self prerequisite");
        if (!knownIds.has(prerequisiteId)) throw new Error("unknown prerequisite");
      }
    }
    const visiting = new Set();
    const visited = new Set();
    const byId = new Map(candidates.map((candidate) => [candidate.id, candidate]));
    const visit = (candidateId) => {
      if (visiting.has(candidateId)) throw new Error("prerequisite cycle");
      if (visited.has(candidateId) || completedIds.has(candidateId)) return;
      visiting.add(candidateId);
      for (const prerequisiteId of byId.get(candidateId)?.prerequisites || []) visit(prerequisiteId);
      visiting.delete(candidateId);
      visited.add(candidateId);
    };
    for (const candidate of candidates) visit(candidate.id);
  };
  const selectCompatible = (candidates, completedIds = new Set(), blockedIds = new Set()) => {
    validatePrerequisites(candidates, completedIds);
    const dispositions = new Map();
    const ready = candidates.filter((candidate) => {
      if (blockedIds.has(candidate.id)) {
        dispositions.set(candidate.id, "unavailable");
        return false;
      }
      const pendingIds = candidate.prerequisites
        .filter((prerequisiteId) => !completedIds.has(prerequisiteId))
        .sort(compareAscii);
      if (pendingIds.length === 0) return true;
      dispositions.set(candidate.id, `prerequisite_pending:${pendingIds.join(",")}`);
      return false;
    });
    const conflicts = new Map(ready.map(({ id }) => [id, new Set()]));
    for (const candidate of ready) {
      for (const conflictId of candidate.conflicts) {
        if (!conflicts.has(conflictId)) continue;
        conflicts.get(candidate.id).add(conflictId);
        conflicts.get(conflictId)?.add(candidate.id);
      }
    }
    const selected = [];
    for (const candidate of [...ready].sort(compareCandidates)) {
      const winner = selected.find((selectedCandidate) =>
        conflicts.get(candidate.id).has(selectedCandidate.id));
      if (winner) dispositions.set(candidate.id, `conflict_loser:${winner.id}`);
      else selected.push(candidate);
    }
    return { dispositions, selected };
  };
  const isFixedPoint = ({
    ambiguousIssuedEffect,
    candidates,
    conflictLosers = [],
    families,
    prerequisitePending = [],
    prerequisiteStates = new Map(),
  }) => {
    const nonReEvaluablePrerequisiteBlockers = new Set([
      "authority_or_identity",
      "legal_or_consent",
      "spend_or_overage",
      "unavailable",
    ]);
    return families.every(({ enumerated }) => enumerated)
      && candidates.length === 0
      && conflictLosers.length === 0
      && prerequisitePending.every(({ prerequisiteIds }) =>
        prerequisiteIds.every((id) =>
          nonReEvaluablePrerequisiteBlockers.has(prerequisiteStates.get(id))))
      && !ambiguousIssuedEffect;
  };

  const candidateA = {
    id: "candidate.a",
    conflicts: ["candidate.b"],
    prerequisites: [],
    contribution: 4,
    urgency: 3,
    confidence: 3,
    runtimeMinutes: 10,
  };
  const candidateB = {
    id: "candidate.b",
    conflicts: [],
    prerequisites: [],
    contribution: 3,
    urgency: 4,
    confidence: 4,
    runtimeMinutes: 5,
  };
  const candidateC = {
    id: "candidate.c",
    conflicts: [],
    prerequisites: [],
    contribution: 2,
    urgency: 2,
    confidence: 2,
    runtimeMinutes: 2,
  };

  const firstSnapshot = selectCompatible([candidateB, candidateC, candidateA]);
  assert.deepEqual(firstSnapshot.selected.map(({ id }) => id), ["candidate.a", "candidate.c"]);
  assert.equal(firstSnapshot.selected.some(({ id }) => id === "candidate.b"), false);
  assert.equal(firstSnapshot.dispositions.get("candidate.b"), "conflict_loser:candidate.a");
  assert.equal(isFixedPoint({
    ambiguousIssuedEffect: false,
    candidates: firstSnapshot.selected,
    families: [{ enumerated: true }, { enumerated: true }],
  }), false);
  assert.equal(isFixedPoint({
    ambiguousIssuedEffect: false,
    candidates: [],
    conflictLosers: [{ id: "candidate.b", winnerId: "candidate.a" }],
    families: [{ enumerated: true }, { enumerated: true }],
  }), false);

  const afterBlockedWinner = selectCompatible([candidateB, candidateC]);
  assert.deepEqual(afterBlockedWinner.selected.map(({ id }) => id), ["candidate.b", "candidate.c"]);
  assert.equal(isFixedPoint({
    ambiguousIssuedEffect: false,
    candidates: [],
    families: [{ enumerated: true }, { enumerated: true }],
  }), true);
  assert.equal(isFixedPoint({
    ambiguousIssuedEffect: false,
    candidates: [],
    families: [{ enumerated: true }, { enumerated: false }],
  }), false);

  const prerequisite = {
    id: "candidate.prerequisite",
    conflicts: [],
    prerequisites: [],
    contribution: 1,
    urgency: 1,
    confidence: 4,
    runtimeMinutes: 4,
  };
  const dependent = {
    id: "candidate.dependent",
    conflicts: [],
    prerequisites: [prerequisite.id],
    contribution: 4,
    urgency: 4,
    confidence: 4,
    runtimeMinutes: 1,
  };
  const independent = {
    id: "candidate.independent",
    conflicts: [],
    prerequisites: [],
    contribution: 2,
    urgency: 2,
    confidence: 2,
    runtimeMinutes: 2,
  };
  const beforePrerequisite = selectCompatible([dependent, independent, prerequisite]);
  assert.deepEqual(
    beforePrerequisite.selected.map(({ id }) => id),
    [independent.id, prerequisite.id],
  );
  assert.equal(
    beforePrerequisite.dispositions.get(dependent.id),
    `prerequisite_pending:${prerequisite.id}`,
  );
  assert.equal(beforePrerequisite.dispositions.has(prerequisite.id), false);

  const afterPrerequisite = selectCompatible([dependent, independent], new Set([prerequisite.id]));
  assert.deepEqual(afterPrerequisite.selected.map(({ id }) => id), [dependent.id, independent.id]);
  assert.equal(afterPrerequisite.dispositions.has(dependent.id), false);

  const secondPrerequisite = { ...prerequisite, id: "candidate.second-prerequisite" };
  const allOfDependent = {
    ...dependent,
    id: "candidate.all-of-dependent",
    prerequisites: [prerequisite.id, secondPrerequisite.id],
  };
  const oneOfTwoComplete = selectCompatible(
    [allOfDependent, secondPrerequisite],
    new Set([prerequisite.id]),
  );
  assert.equal(
    oneOfTwoComplete.dispositions.get(allOfDependent.id),
    `prerequisite_pending:${secondPrerequisite.id}`,
  );
  assert.deepEqual(oneOfTwoComplete.selected.map(({ id }) => id), [secondPrerequisite.id]);

  const blockedPrerequisite = selectCompatible(
    [dependent, prerequisite],
    new Set(),
    new Set([prerequisite.id]),
  );
  assert.deepEqual(blockedPrerequisite.selected, []);
  assert.equal(blockedPrerequisite.dispositions.get(prerequisite.id), "unavailable");
  assert.equal(
    blockedPrerequisite.dispositions.get(dependent.id),
    `prerequisite_pending:${prerequisite.id}`,
  );

  assert.throws(
    () => selectCompatible([{ ...dependent, prerequisites: [dependent.id] }]),
    /self prerequisite/,
  );
  assert.throws(
    () => selectCompatible([{ ...dependent, prerequisites: ["candidate.missing"] }]),
    /unknown prerequisite/,
  );
  assert.throws(
    () => selectCompatible([{ ...dependent, conflicts: ["candidate.missing"], prerequisites: [] }]),
    /unknown conflict/,
  );
  assert.throws(
    () => selectCompatible([
      { ...dependent, id: "candidate.cycle-a", prerequisites: ["candidate.cycle-b"] },
      { ...prerequisite, id: "candidate.cycle-b", prerequisites: ["candidate.cycle-a"] },
    ]),
    /prerequisite cycle/,
  );
  assert.equal(isFixedPoint({
    ambiguousIssuedEffect: false,
    candidates: [],
    families: [{ enumerated: true }],
    prerequisitePending: [{ id: dependent.id, prerequisiteIds: [prerequisite.id] }],
    prerequisiteStates: new Map([[prerequisite.id, "actionable_now"]]),
  }), false);
  assert.equal(isFixedPoint({
    ambiguousIssuedEffect: false,
    candidates: [],
    families: [{ enumerated: true }],
    prerequisitePending: [{ id: dependent.id, prerequisiteIds: [prerequisite.id] }],
    prerequisiteStates: new Map([[prerequisite.id, "ambiguous"]]),
  }), false);
  assert.equal(isFixedPoint({
    ambiguousIssuedEffect: false,
    candidates: [],
    families: [{ enumerated: true }],
    prerequisitePending: [{ id: dependent.id, prerequisiteIds: [prerequisite.id] }],
    prerequisiteStates: new Map([[prerequisite.id, "waiting_pr_approval"]]),
  }), false);
  assert.equal(isFixedPoint({
    ambiguousIssuedEffect: false,
    candidates: [],
    families: [{ enumerated: true }],
    prerequisitePending: [{ id: dependent.id, prerequisiteIds: [prerequisite.id] }],
  }), false);
  assert.equal(isFixedPoint({
    ambiguousIssuedEffect: false,
    candidates: [],
    families: [{ enumerated: true }],
    prerequisitePending: [{ id: dependent.id, prerequisiteIds: [prerequisite.id] }],
    prerequisiteStates: new Map([[prerequisite.id, "unavailable"]]),
  }), true);
});

test("public social publication never depends on a secondary executor or authorizer", () => {
  const orchestrator = readFileSync(new URL("../SKILL.md", import.meta.url), "utf8");
  const social = readFileSync(new URL("../references/channels-social.md", import.meta.url), "utf8");

  assert.match(orchestrator, /The parent may directly execute every routed public/);
  assert.match(social, /owner-approved, merged, externally pinned contract plus an active Pulse automation satisfy the pinned Typefully skill's standing automation authority/);
  assert.match(social, /A fresh isolated executor, child write-authorizer[^\n]*is not required/);
  assert.match(social, /retry only with provider-supported idempotency or after official exact-resource readback confirms that no public post exists/);
});

test("coordinated product launch remains routable without automatic priority", () => {
  const checked = checkGraph();
  const scheduler = readFileSync(new URL("../references/pulse-scheduler.md", import.meta.url), "utf8");
  const product = readFileSync(new URL("../references/product-lifecycle.md", import.meta.url), "utf8");
  const social = readFileSync(new URL("../references/channels-social.md", import.meta.url), "utf8");
  const launchPlan = readFileSync(new URL("../../../../docs/gtm/2026-08-product-launch.md", import.meta.url), "utf8");

  for (const runType of ["operational", "strategic"]) {
    assert.equal(checked.graph.run_types[runType].entry_nodes.includes("launch.campaign"), true);
    assert.equal(checked.graph.run_types[runType].state_views.includes("selected_work"), true);
  }
  const launchNode = checked.graph.nodes["launch.campaign"];
  const launchRoute = checked.graph.routes["strategy.launch"];
  assert.equal(launchNode.reference, ".agents/skills/skillsboard-pulse/references/launch-campaign.md");
  assert.deepEqual(launchNode.requires, ["product.lifecycle", "product.truth"]);
  assert.deepEqual(launchNode.provides, ["launch_plan"]);
  assert.deepEqual(launchRoute.entry_nodes, ["launch.campaign"]);
  assert.deepEqual(launchRoute.skills, ["launch"]);
  assert.deepEqual(launchRoute.state_views, ["active_index", "analytics", "core", "opportunities", "product", "selected_work"]);
  assert.equal(checked.graph.routes["contract.audit"].entry_nodes.includes("launch.campaign"), true);

  const launchExecutionRoutes = [
    "analytics.asset_write",
    "analytics.database_reconcile",
    "delivery.repository",
    "distribution.community",
    "distribution.hacker_news",
    "distribution.product_hunt",
    "email.broadcast_prepare",
    "email.broadcast_send",
    "email.reconcile",
    "product.repository",
    "social.draft",
    "social.publish",
    "social.reconcile",
  ];
  assert.equal(checked.graph.policy_invariants.campaign_origin_node, "launch.campaign");
  for (const routeId of launchExecutionRoutes) {
    const route = checked.graph.routes[routeId];
    assert.equal(route.accepts_campaign_origin, true, `${routeId} must accept campaign origin`);
    assert.equal(route.allowed_origin_policy_nodes.includes("launch.campaign"), false, `${routeId} must not graft launch.campaign into lane origins`);
    const resolved = resolveGraph(checked.graph, { route: routeId, nodes: ["launch.campaign"] });
    assert.equal(resolved.origin_policy_node, "launch.campaign");
    assert.equal(resolved.nodes.some(({ id }) => id === "launch.campaign"), true);
  }
  assert.match(scheduler, /The repository-pinned `launch\.campaign` is one candidate family/);
  assert.match(scheduler, /launch work has no automatic precedence over SEO, social, or another positive candidate/);
  assert.doesNotMatch(scheduler, /protected priority lane/);
  assert.match(product, /first-class candidate family/);
  assert.match(product, /never becomes a symmetric conflict or automatic precedence for unrelated work/);
  assert.match(product, /A true execution prerequisite affects eligibility through a directed prerequisite ID/);
  assert.match(social, /creates no automatic precedence over a stronger non-launch unit/);
  const launchReference = readFileSync(new URL("../references/launch-campaign.md", import.meta.url), "utf8");
  assert.match(launchReference, /Launch day: Tuesday, August 11, 2026/);
  assert.match(launchReference, /Launch membership alone does not determine rank/);
  assert.match(launchReference, /Prerequisites affect eligibility and are never normalized as conflicts/);
  assert.match(launchReference, /In each frozen snapshot, execute only the first candidate in the scheduler's deterministic selected order/);
  assert.match(launchReference, /Production-journey and funnel\/attribution QA are independent positive candidate inventory/);
  assert.match(launchReference, /missing or incomplete QA never gates publication or another lane/);
  assert.doesNotMatch(launchReference, /public launch announcement requires[^\n]*QA/);
  assert.doesNotMatch(launchReference, /must not outrank a compatible due product-launch item/);
  assert.match(launchPlan, /owned by `\.agents\/skills\/skillsboard-pulse\/references\/launch-campaign\.md`/);
  assert.match(launchPlan, /directed prerequisites kept separate from explicit cross-lane conflicts/);
  assert.match(launchPlan, /The remaining planning inventory is production journey QA, measurement QA, channel packages/);
  assert.match(launchPlan, /Sequence and dates inform rank only/);
  assert.match(launchPlan, /A directed prerequisite exists only for the exact effect that physically or truthfully depends/);
  assert.doesNotMatch(launchPlan, /The remaining critical path is/);
  assert.doesNotMatch(launchPlan, /Launch readiness gate|no launch-period post may be scheduled unless/);
});

test("upstream provider lifecycle labels normalize into the closed Pulse state set", () => {
  const email = readFileSync(new URL("../references/email-outbound.md", import.meta.url), "utf8");
  const scheduler = readFileSync(new URL("../references/pulse-scheduler.md", import.meta.url), "utf8");

  assert.match(email, /connector `setup_required` or failed authentication maps to `authority_or_identity`/);
  assert.match(email, /connector `manual_action` maps to the applicable `legal_or_consent`, `authority_or_identity`, or `spend_or_overage` state/);
  assert.match(email, /connector `shadow` describes inert unsent provider draft metadata only, never a Pulse work state or mandatory stage/);
  assert.match(email, /Do not change or fork the upstream connector skill to implement this mapping/);
  assert.match(scheduler, /On the first run with the v13 root[^\n]*atomically normalize existing schema-v4 state/);
  assert.match(scheduler, /Reclassify Pulse work in `waiting_maturity`, `waiting_cooldown`, `waiting_dependency`, `manual_action`, `shadow`/);
  assert.match(scheduler, /Rebuild work indexes from the normalized items and record source root, target root, completion time, and released reservation counts/);
});

test("v17 normalization cannot inherit a false fixed point", () => {
  const scheduler = readFileSync(new URL("../references/pulse-scheduler.md", import.meta.url), "utf8");

  assert.match(scheduler, /On the first run with the v17 root[^\n]*atomically normalize existing schema-v4 state/);
  assert.match(scheduler, /Set the governing objective to at least \+20% week-over-week `AAT-28`/);
  assert.match(scheduler, /Treat a prior `fixed_point_complete`, empty `actionable_now` index, empty lane output, or first blocked item as historical observations only/);
  assert.match(scheduler, /Rebuild current candidate and work indexes[^\n]*including SEO and social/);
  assert.match(scheduler, /Do not rewrite historical digest claims; supersede their current planning effect/);
});

test("v18 normalization rebuilds deterministic conflict state", () => {
  const scheduler = readFileSync(new URL("../references/pulse-scheduler.md", import.meta.url), "utf8");

  assert.match(scheduler, /On the first run with the v18 root[^\n]*atomically normalize existing schema-v4 state/);
  assert.match(scheduler, /This is a root migration, not an activation, readiness, reconciliation-only, or approval phase/);
  assert.match(scheduler, /recompute canonical candidate IDs from their identity tuples/);
  assert.match(scheduler, /directed prerequisite edges separately from normalized symmetric conflict edges/);
  assert.match(scheduler, /Do not promote legacy item keys or unverified persisted IDs/);
  assert.match(scheduler, /Treat every earlier compatibility label, prerequisite result, conflict loser, or fixed-point result as historical only/);
  assert.match(scheduler, /candidate count, prerequisite count, normalized conflict count, and family enumeration count/);
});

test("production Resend routes pin the connector adapter instead of API-key or CLI management", () => {
  const checked = checkGraph();
  const connectorOperationIds = [
    "demand.email",
    "inbound.process",
    "inbound.reply",
    "incident.email",
    "resend.audience.write",
    "resend.broadcast.send",
    "resend.broadcast_draft.write",
    "resend.domain.write",
    "resend.proactive.send",
    "resend.suppression_lift",
    "resend.topic.write",
    "resend.webhook.write",
    "review.outreach",
  ];
  const connectorRouteIds = [
    "distribution.demand_email",
    "distribution.review_outreach",
    "email.broadcast_prepare",
    "email.broadcast_send",
    "email.inbound_process",
    "email.inbound_reply",
    "email.proactive_send",
    "email.reconcile",
    "email.resend_audience",
    "email.resend_domain",
    "email.resend_suppression",
    "email.resend_topic",
    "email.resend_webhook",
    "incident.notify",
  ];
  const actualConnectorOperationIds = Object.entries(checked.graph.operations)
    .filter(([, operation]) => operation.skills.includes("resend_connector"))
    .map(([id]) => id)
    .sort();
  const actualConnectorRouteIds = Object.entries(checked.graph.routes)
    .filter(([, route]) => route.skills.includes("resend_connector"))
    .map(([id]) => id)
    .sort();

  assert.deepEqual(actualConnectorOperationIds, connectorOperationIds);
  assert.deepEqual(actualConnectorRouteIds, connectorRouteIds);
  assert.deepEqual(checked.graph.skills.resend_connector, {
    selector: "resend-connector",
    source: "repository",
    content_sha256: checked.graph.skills.resend_connector.content_sha256,
  });
  assert.equal(checked.graph.skills.resend, undefined);
  assert.equal(checked.graph.skills.resend_cli, undefined);

  for (const id of connectorOperationIds) {
    const operation = checked.graph.operations[id];
    assert.ok(operation, `${id} must exist`);
    assert.equal(operation.skills.includes("resend_connector"), true, `${id} must use resend_connector`);
    assert.equal(operation.skills.includes("resend"), false, `${id} must not require resend`);
    assert.equal(operation.skills.includes("resend_cli"), false, `${id} must not require resend_cli`);
  }

  for (const id of connectorRouteIds) {
    const route = checked.graph.routes[id];
    assert.ok(route, `${id} must exist`);
    assert.equal(route.skills.includes("resend_connector"), true, `${id} must use resend_connector`);
    assert.equal(route.skills.includes("resend"), false, `${id} must not require resend`);
    assert.equal(route.skills.includes("resend_cli"), false, `${id} must not require resend_cli`);
  }
});

test("analytics database reconciliation resolves the official Neon connector read-only", () => {
  const checked = checkGraph();
  const operation = checked.graph.operations["neon.database.read"];
  const route = checked.graph.routes["analytics.database_reconcile"];

  assert.deepEqual(checked.graph.skills.neon_postgres, {
    selector: "neon-postgres:neon-postgres",
    source: "runtime",
  });
  assert.deepEqual(operation, {
    effect: "read",
    autonomy: "autonomous",
    requires: ["analytics.control_plane"],
    required_capabilities: [],
    skills: ["neon_postgres"],
    conflicts_with: [],
    interference_keys: [],
  });
  assert.deepEqual(route, {
    entry_nodes: ["analytics.control_plane"],
    operations: ["neon.database.read"],
    skills: ["posthog"],
    state_views: ["analytics", "core", "scorecard", "selected_work"],
    max_known_context_bytes: 65_536,
    requires_origin_policy_node: true,
    accepts_campaign_origin: true,
    allowed_origin_policy_nodes: ["analytics.control_plane"],
  });

  const resolved = resolveGraph(checked.graph, {
    route: "analytics.database_reconcile",
    nodes: ["analytics.control_plane"],
  });
  assert.deepEqual(resolved.operations, ["neon.database.read"]);
  assert.deepEqual(resolved.skills.map(({ id }) => id), ["neon_postgres", "posthog"]);
  assert.equal(resolved.origin_policy_node, "analytics.control_plane");
  assert.equal(resolved.operations.every((id) => checked.graph.operations[id].effect === "read"), true);

  for (const runId of ["operational", "strategic"]) {
    const run = resolveGraph(checked.graph, { run: runId, nodes: [] });
    assert.equal(run.operations.includes("neon.database.read"), true, `${runId} must advertise the Neon read`);
    assert.equal(run.skills.some(({ id }) => id === "neon_postgres"), true, `${runId} must resolve the Neon skill`);
  }
});
