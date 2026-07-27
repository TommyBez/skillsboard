import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  checkGraph,
  resolveGraph,
} from "../scripts/validate-graph.mjs";

test("operational runs resolve the continuous per-lane replan policy and state", () => {
  const checked = checkGraph();
  const run = resolveGraph(checked.graph, { run: "operational", nodes: [] });

  assert.equal(run.nodes.some(({ id }) => id === "learning.opportunities"), true);
  assert.equal(Object.hasOwn(run.state_views, "opportunities"), true);
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

  assert.equal(checked.graph.contract_version, 15);
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
  assert.match(scorecard, /The scorecard reports reality and guides prioritization\. It never authorizes or blocks/);
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

test("protected organic growth lanes execute without internal readiness gates", () => {
  const scorecard = readFileSync(new URL("../references/analytics-scorecard.md", import.meta.url), "utf8");
  const learning = readFileSync(new URL("../references/learning-opportunities.md", import.meta.url), "utf8");
  const pseo = readFileSync(new URL("../references/growth-pseo.md", import.meta.url), "utf8");
  const distribution = readFileSync(new URL("../references/channels-distribution.md", import.meta.url), "utf8");
  const social = readFileSync(new URL("../references/channels-social.md", import.meta.url), "utf8");
  const scheduler = readFileSync(new URL("../references/pulse-scheduler.md", import.meta.url), "utf8");
  const checked = checkGraph();
  const strategic = resolveGraph(checked.graph, { run: "strategic", nodes: [] });
  const strategicNodeIds = strategic.nodes.map(({ id }) => id);

  assert.match(scorecard, /at least 20% week-over-week growth in new `team_activated_14d` teams/);
  assert.match(scorecard, /When the prior closed week is zero, the percentage is undefined and the absolute target is at least one additional activated team/);
  assert.match(learning, /It must produce and execute a search action and a community\/social action/);
  assert.match(learning, /An empty queue, evidence repair in place of action, or evidence-insufficient no-action is invalid/);
  assert.match(pseo, /Research the ICP's problems, work, tools, interests, and adjacent topics/);
  assert.match(pseo, /Queries do not need to contain “skill”, “agent”, “library”, or the product name/);
  assert.match(pseo, /DataForSEO is the only metered provider/);
  assert.match(pseo, /The user's “bananas” example is valid in principle/);
  assert.match(pseo, /There is no rolling PR cap, page cap, problem-cluster lock, sibling limit, checkpoint gate, maturity wait/);
  assert.match(distribution, /Community includes social and is a protected zero-cost growth lane/);
  assert.match(distribution, /There is no Pulse-defined seven-day contact cap, top-level-post cap, subreddit cooldown, directory quota/);
  assert.match(social, /Owned social is a protected organic lane/);
  assert.match(social, /The parent invokes the official Typefully capability directly/);
  assert.match(scheduler, /Search and community\/social remain protected independent lanes/);
  assert.match(scheduler, /repeat until runtime ends or only the closed-set blockers/);
  assert.match(scheduler, /There is no repository WIP budget, pSEO PR\/page quota/);
  assert.doesNotMatch(scheduler, /Monday 09:00[^\n]*pSEO research and learning/);
  assert.equal(strategicNodeIds.includes("channels.distribution"), true);
  assert.equal(strategicNodeIds.includes("channels.social"), true);
  assert.equal(Object.hasOwn(strategic.state_views, "distribution"), true);
  assert.equal(Object.hasOwn(strategic.state_views, "social"), true);
});

test("public social publication never depends on a secondary executor or authorizer", () => {
  const orchestrator = readFileSync(new URL("../SKILL.md", import.meta.url), "utf8");
  const social = readFileSync(new URL("../references/channels-social.md", import.meta.url), "utf8");

  assert.match(orchestrator, /The parent may directly execute every routed public/);
  assert.match(social, /owner-approved, merged, externally pinned contract plus an active Pulse automation satisfy the pinned Typefully skill's standing automation authority/);
  assert.match(social, /A fresh isolated executor, child write-authorizer[^\n]*is not required/);
  assert.match(social, /retry only with provider-supported idempotency or after official exact-resource readback confirms that no public post exists/);
});

test("coordinated product launch is first-class work on every run", () => {
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
  for (const routeId of launchExecutionRoutes) {
    const resolved = resolveGraph(checked.graph, { route: routeId, nodes: ["launch.campaign"] });
    assert.equal(resolved.origin_policy_node, "launch.campaign");
    assert.equal(resolved.nodes.some(({ id }) => id === "launch.campaign"), true);
  }
  assert.match(scheduler, /treat its dated product launch as a protected priority lane/);
  assert.match(scheduler, /not the product launch/);
  assert.match(product, /first-class product work/);
  assert.match(product, /Launch prioritization is not a readiness phase, editorial gate, cooldown, evidence threshold, WIP limit, or additional approval/);
  assert.match(social, /prefer the due product-launch unit over unrelated generic advice/);
  const launchReference = readFileSync(new URL("../references/launch-campaign.md", import.meta.url), "utf8");
  assert.match(launchReference, /Launch day: Tuesday, August 11, 2026/);
  assert.match(launchPlan, /owned by `\.agents\/skills\/skillsboard-pulse\/references\/launch-campaign\.md`/);
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
    allowed_origin_policy_nodes: ["analytics.control_plane", "launch.campaign"],
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

