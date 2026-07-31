import { AbsoluteFill } from "remotion";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { focusPull } from "@/components/remocn/focus-pull";
import { pushThrough } from "@/components/remocn/push-through";
import { whipPan } from "@/components/remocn/whip-pan";
import { zoomBlur } from "@/components/remocn/zoom-blur";
import "./fonts";
import { AgentScene } from "./scenes/agent";
import { CollectionsScene } from "./scenes/collections";
import { CtaScene } from "./scenes/cta";
import { FindScene } from "./scenes/find";
import { HandoffScene } from "./scenes/handoff";
import { HookScene } from "./scenes/hook";
import { LibraryScene } from "./scenes/library";
import { LoopFindScene } from "./scenes/loop-find";
import { LoopSaveScene } from "./scenes/loop-save";
import { LoopShareScene } from "./scenes/loop-share";
import { PositioningScene } from "./scenes/positioning";
import { SaveScene } from "./scenes/save";
import { light } from "./theme";

export const FPS = 30;
export const SOCIAL_DURATION = 900;
export const PRODUCT_HUNT_DURATION = 1372;

/**
 * The one cut into the dark agent scene. A dissolve washed the light frame grey
 * mid-transition; the push reads as descending into the agent and keeps both
 * sides clean.
 */
const DESCENT = pushThrough({ zoom: 1.9, blur: 12 });

function timing(durationInFrames: number) {
  return linearTiming({ durationInFrames });
}

export function SkillsboardDemoSocial() {
  return (
    <AbsoluteFill style={{ background: light.background }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={130}>
          <HookScene durationInFrames={130} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={focusPull()} timing={timing(30)} />

        <TransitionSeries.Sequence durationInFrames={120}>
          <PositioningScene durationInFrames={120} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={pushThrough()} timing={timing(26)} />

        <TransitionSeries.Sequence durationInFrames={222}>
          <SaveScene durationInFrames={222} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={zoomBlur()} timing={timing(18)} />

        <TransitionSeries.Sequence durationInFrames={180}>
          <LibraryScene durationInFrames={180} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={DESCENT} timing={timing(28)} />

        <TransitionSeries.Sequence durationInFrames={215}>
          <AgentScene durationInFrames={215} />
        </TransitionSeries.Sequence>
        {/* A scaled, blurred layer shows its own edges over a light frame — the agent
            scene already lifts its background, so a plain fade is the clean cut. */}
        <TransitionSeries.Transition presentation={fade()} timing={timing(24)} />

        <TransitionSeries.Sequence durationInFrames={159}>
          <CtaScene durationInFrames={159} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
}

export function SkillsboardDemoProductHunt() {
  return (
    <AbsoluteFill style={{ background: light.background }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={130}>
          <HookScene durationInFrames={130} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={focusPull()} timing={timing(30)} />

        <TransitionSeries.Sequence durationInFrames={130}>
          <PositioningScene durationInFrames={130} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={pushThrough()} timing={timing(26)} />

        <TransitionSeries.Sequence durationInFrames={250}>
          <SaveScene durationInFrames={250} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={zoomBlur()} timing={timing(18)} />

        <TransitionSeries.Sequence durationInFrames={200}>
          <LibraryScene durationInFrames={200} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={whipPan()} timing={timing(20)} />

        <TransitionSeries.Sequence durationInFrames={190}>
          <FindScene durationInFrames={190} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={whipPan()} timing={timing(20)} />

        <TransitionSeries.Sequence durationInFrames={150}>
          <HandoffScene durationInFrames={150} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={zoomBlur()} timing={timing(18)} />

        <TransitionSeries.Sequence durationInFrames={120}>
          <CollectionsScene durationInFrames={120} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={DESCENT} timing={timing(28)} />

        <TransitionSeries.Sequence durationInFrames={250}>
          <AgentScene durationInFrames={250} tail="hold" />
        </TransitionSeries.Sequence>
        {/* A scaled, blurred layer shows its own edges over a light frame — the agent
            scene already lifts its background, so a plain fade is the clean cut. */}
        <TransitionSeries.Transition presentation={fade()} timing={timing(24)} />

        <TransitionSeries.Sequence durationInFrames={140}>
          <CtaScene durationInFrames={140} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
}

export const TEAM_LOOP_DURATION = 420;

/**
 * The landing-page loop: save → share → find, matching the three steps printed
 * under the player. Both ends fade to the page background so the seam between
 * the last and first frame reads as one continuous move.
 */
export function SkillsboardTeamLoop() {
  return (
    <AbsoluteFill style={{ background: light.background }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={170}>
          <LoopSaveScene durationInFrames={170} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={zoomBlur()} timing={timing(18)} />

        <TransitionSeries.Sequence durationInFrames={130}>
          <LoopShareScene durationInFrames={130} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={pushThrough()} timing={timing(18)} />

        <TransitionSeries.Sequence durationInFrames={156}>
          <LoopFindScene durationInFrames={156} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
}
