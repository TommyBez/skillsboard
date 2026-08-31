import { interpolate } from "remotion";
import { clamp, Scene, useSceneFrame } from "../../product-demo/stage";
import { ink } from "../../product-demo/theme";
import { agentRun } from "../content";
import { Console, NoteRow, OutputBlock } from "../ui/agent-console";

const REF = 360;

/** The agent follows the note the teammate saved, then finishes the task. */
export function ApplyScene({ durationInFrames }: { durationInFrames: number }) {
  const frame = useSceneFrame(REF, durationInFrames);

  return (
    <Scene
      background={ink.background}
      drift={{ from: 1, to: 1.025 }}
      durationInFrames={durationInFrames}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
        <Console frame={frame}>
          <NoteRow at={12} frame={frame} />
          <OutputBlock at={80} frame={frame} />
        </Console>
        <div
          style={{
            fontSize: 32,
            color: ink.mutedForeground,
            opacity: interpolate(frame, [200, 224], [0, 1], clamp),
          }}
        >
          {agentRun.applyLine}
        </div>
      </div>
    </Scene>
  );
}
