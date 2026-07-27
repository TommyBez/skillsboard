import { compareAscii } from "./expect.mjs";
import { invariant } from "./errors.mjs";

/** Lane origins plus optional campaign origin from policy_invariants. */
export function effectiveOriginPolicyNodes(graph, route) {
  const laneOrigins = route.allowed_origin_policy_nodes ?? [];
  if (route.accepts_campaign_origin !== true) return [...laneOrigins];

  const campaignOrigin = graph.policy_invariants?.campaign_origin_node;
  invariant(
    typeof campaignOrigin === "string" && campaignOrigin.length > 0,
    "accepts_campaign_origin requires policy_invariants.campaign_origin_node",
  );
  invariant(graph.nodes[campaignOrigin], `campaign origin node does not exist: ${campaignOrigin}`);
  invariant(graph.nodes[campaignOrigin].kind === "policy", `campaign origin ${campaignOrigin} must be a policy node`);
  invariant(
    !graph.mandatory_nodes.includes(campaignOrigin),
    `campaign origin ${campaignOrigin} must not be mandatory`,
  );
  invariant(
    !laneOrigins.includes(campaignOrigin),
    `route must not list campaign origin ${campaignOrigin} in allowed_origin_policy_nodes when accepts_campaign_origin is true`,
  );

  return [...laneOrigins, campaignOrigin].sort(compareAscii);
}

export function routeAllowsOrigin(graph, route, originId) {
  return effectiveOriginPolicyNodes(graph, route).includes(originId);
}
