import { interpolate } from "remotion";
import { clamp, Scene, useSceneFrame } from "../../product-demo/stage";
import { light } from "../../product-demo/theme";
import { CONFIG_URL_LINE, setup } from "../content";
import { Rise, SceneHead, t } from "../ui/chrome";
import { ConfigBlock } from "../ui/code-block";

const REF = 300;
const { config } = setup;

/** Step one: the block from `plugin/mcp.json`, pasted into the client. */
export function ConfigScene({ durationInFrames }: { durationInFrames: number }) {
  const frame = useSceneFrame(REF, durationInFrames);

  return (
    <Scene>
      <div
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 44 }}
      >
        <SceneHead frame={frame} heading={config.heading} step={config.step} />

        <Rise at={24} distance={22} frame={frame}>
          <ConfigBlock at={34} frame={frame} highlightAt={132} highlightLine={CONFIG_URL_LINE} />
        </Rise>

        <div
          style={{
            ...t.caption,
            color: light.mutedForeground,
            opacity: interpolate(frame, [176, 196], [0, 1], clamp),
          }}
        >
          {config.caption}
        </div>
      </div>
    </Scene>
  );
}
