import { Composition } from "remotion";
import {
  MCP_AGENT_DURATION,
  MCP_FPS,
  MCP_SETUP_DURATION,
  SkillsboardMcpAgent,
  SkillsboardMcpSetup,
} from "./mcp";
import {
  FPS,
  PRODUCT_HUNT_DURATION,
  SOCIAL_DURATION,
  SkillsboardDemoProductHunt,
  SkillsboardDemoSocial,
  SkillsboardTeamLoop,
  TEAM_LOOP_DURATION,
} from "./product-demo";
import { PROMO_DURATION, SkillsboardPromo } from "./skillsboard-promo";

export function RemotionRoot() {
  return (
    <>
      <Composition
        component={SkillsboardPromo}
        durationInFrames={PROMO_DURATION}
        fps={30}
        height={720}
        id="skillsboard-promo"
        width={1280}
      />
      <Composition
        component={SkillsboardDemoProductHunt}
        durationInFrames={PRODUCT_HUNT_DURATION}
        fps={FPS}
        height={900}
        id="skillsboard-launch-product-hunt"
        width={1440}
      />
      <Composition
        component={SkillsboardTeamLoop}
        durationInFrames={TEAM_LOOP_DURATION}
        fps={FPS}
        height={900}
        id="skillsboard-team-loop"
        width={1440}
      />
      <Composition
        component={SkillsboardDemoSocial}
        durationInFrames={SOCIAL_DURATION}
        fps={FPS}
        height={900}
        id="skillsboard-launch-social"
        width={1440}
      />
      <Composition
        component={SkillsboardMcpSetup}
        durationInFrames={MCP_SETUP_DURATION}
        fps={MCP_FPS}
        height={1080}
        id="skillsboard-mcp-setup"
        width={1920}
      />
      <Composition
        component={SkillsboardMcpAgent}
        durationInFrames={MCP_AGENT_DURATION}
        fps={MCP_FPS}
        height={1080}
        id="skillsboard-mcp-agent"
        width={1920}
      />
    </>
  );
}
