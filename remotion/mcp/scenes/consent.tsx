import { Scene, useSceneFrame } from "../../product-demo/stage";
import { setup } from "../content";
import { Rise, SceneHead } from "../ui/chrome";
import { ConsentCard } from "../ui/consent-card";

const REF = 260;
const { consent } = setup;

/** Step two: the browser authorization, on Skills Board's own tokens. */
export function ConsentScene({ durationInFrames }: { durationInFrames: number }) {
  const frame = useSceneFrame(REF, durationInFrames);

  return (
    <Scene>
      <div
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 44 }}
      >
        <SceneHead frame={frame} heading={consent.heading} step={consent.step} />
        <Rise at={22} distance={22} frame={frame}>
          <ConsentCard at={34} frame={frame} pressAt={148} />
        </Rise>
      </div>
    </Scene>
  );
}
