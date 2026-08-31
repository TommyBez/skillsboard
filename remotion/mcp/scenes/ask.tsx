import { Scene, useSceneFrame } from "../../product-demo/stage";
import { ink } from "../../product-demo/theme";
import { agentRun } from "../content";
import { CallRow, Console, HitCard, PromptRow } from "../ui/agent-console";

const REF = 360;

/** A real task, and the search that answers it from the team library. */
export function AskScene({ durationInFrames }: { durationInFrames: number }) {
  const frame = useSceneFrame(REF, durationInFrames);

  return (
    <Scene
      background={ink.background}
      drift={{ from: 1, to: 1.025 }}
      durationInFrames={durationInFrames}
    >
      <Console frame={frame}>
        <PromptRow at={20} frame={frame} />
        <CallRow at={110} call={agentRun.call} frame={frame} />
        <HitCard at={180} frame={frame} />
      </Console>
    </Scene>
  );
}
