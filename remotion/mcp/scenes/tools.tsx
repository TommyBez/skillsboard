import { Scene, useSceneFrame } from "../../product-demo/stage";
import { setup } from "../content";
import { SceneHead } from "../ui/chrome";
import { ToolGrid } from "../ui/tool-grid";

const REF = 260;

/** The payoff: the tools the client now lists, by their registered names. */
export function ToolsScene({ durationInFrames }: { durationInFrames: number }) {
  const frame = useSceneFrame(REF, durationInFrames);

  return (
    <Scene>
      <div
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 38 }}
      >
        <SceneHead frame={frame} heading={setup.tools.heading} step={setup.tools.step} />
        <ToolGrid at={26} frame={frame} />
      </div>
    </Scene>
  );
}
