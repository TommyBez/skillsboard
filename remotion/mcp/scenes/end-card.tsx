import { interpolate } from "remotion";
import { clamp, outEasing, Scene, useSceneFrame } from "../../product-demo/stage";
import { displayTracking, light, MONO } from "../../product-demo/theme";
import { BrandMark } from "../../product-demo/ui/atoms";
import { brand } from "../content";

const REF = 160;

/** The same close on both videos: mark, category, domain, licence. */
export function EndCardScene({ durationInFrames }: { durationInFrames: number }) {
  const frame = useSceneFrame(REF, durationInFrames);

  return (
    <Scene>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
            opacity: interpolate(frame, [0, 18], [0, 1], clamp),
            translate: `0 ${interpolate(frame, [0, 24], [18, 0], outEasing)}px`,
          }}
        >
          <BrandMark size={72} />
          <span style={{ fontSize: 70, fontWeight: 600, letterSpacing: displayTracking }}>
            {brand.wordmark}
          </span>
        </div>

        <div
          style={{
            fontSize: 36,
            color: light.foreground,
            opacity: interpolate(frame, [22, 42], [0, 1], clamp),
            translate: `0 ${interpolate(frame, [22, 46], [12, 0], outEasing)}px`,
          }}
        >
          {brand.category}
        </div>

        <div
          style={{
            marginTop: 10,
            fontFamily: MONO,
            fontSize: 32,
            color: light.primary,
            opacity: interpolate(frame, [46, 66], [0, 1], clamp),
          }}
        >
          {brand.domain}
        </div>

        <div
          style={{
            fontSize: 28,
            color: light.mutedForeground,
            opacity: interpolate(frame, [66, 86], [0, 1], clamp),
          }}
        >
          {brand.licence}
        </div>
      </div>
    </Scene>
  );
}
