import { AbsoluteFill } from "remotion";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { focusPull } from "@/components/remocn/focus-pull";
import { pushThrough } from "@/components/remocn/push-through";
import { zoomBlur } from "@/components/remocn/zoom-blur";
import "../product-demo/fonts";
import { light } from "../product-demo/theme";
import { ConfigScene } from "./scenes/config";
import { ConsentScene } from "./scenes/consent";
import { EndCardScene } from "./scenes/end-card";
import { HookScene } from "./scenes/hook";
import { ReachScene } from "./scenes/reach";
import { SessionScene } from "./scenes/session";
import { ToolsScene } from "./scenes/tools";

/** The thirty second cut of the agent video, built as a spot. */
export {
  MCP_AGENT_SPOT_DURATION,
  MCP_AGENT_SPOT_POSTER_FRAME,
  SkillsboardMcpAgentSpot,
} from "./spot";

export const MCP_FPS = 30;

/** 1110 frames of scene, 88 of overlap. */
export const MCP_SETUP_DURATION = 1022;
/** 1180 frames of scene, 44 of overlap. */
export const MCP_AGENT_DURATION = 1136;

/** Frames the two posters are cut from: the endpoint, and the finished session. */
export const MCP_SETUP_POSTER_FRAME = 306;
export const MCP_AGENT_POSTER_FRAME = 700;

function timing(durationInFrames: number) {
  return linearTiming({ durationInFrames });
}

/**
 * Connecting a client: the problem, the config, the authorization, the tools.
 * Every fact on screen is read out of the repository, so the video and the
 * product cannot drift apart without the source drifting first.
 */
export function SkillsboardMcpSetup() {
  return (
    <AbsoluteFill style={{ background: light.background }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={130}>
          <HookScene durationInFrames={130} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={focusPull()} timing={timing(24)} />

        <TransitionSeries.Sequence durationInFrames={300}>
          <ConfigScene durationInFrames={300} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={pushThrough()} timing={timing(22)} />

        <TransitionSeries.Sequence durationInFrames={260}>
          <ConsentScene durationInFrames={260} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={zoomBlur()} timing={timing(20)} />

        <TransitionSeries.Sequence durationInFrames={260}>
          <ToolsScene durationInFrames={260} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing(22)} />

        <TransitionSeries.Sequence durationInFrames={160}>
          <EndCardScene durationInFrames={160} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
}

/**
 * The connection at work: one task, one search against the team library, and
 * the teammate's own note carried into the answer. It runs as a single session
 * in a single window, on the same light stage as the setup video, so the search
 * and the answer read as one job rather than as two examples.
 */
export function SkillsboardMcpAgent() {
  return (
    <AbsoluteFill style={{ background: light.background }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={770}>
          <SessionScene durationInFrames={770} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={pushThrough()} timing={timing(22)} />

        <TransitionSeries.Sequence durationInFrames={250}>
          <ReachScene durationInFrames={250} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing(22)} />

        <TransitionSeries.Sequence durationInFrames={160}>
          <EndCardScene durationInFrames={160} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
}
