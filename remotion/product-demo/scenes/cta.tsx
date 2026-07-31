import { interpolate } from "remotion";
import { brand } from "../content";
import { clamp, outEasing, Scene, useSceneFrame } from "../stage";
import { displayTracking, light, MONO } from "../theme";
import { BrandMark } from "../ui/atoms";

const REF = 180;

export function CtaScene({ durationInFrames }: { durationInFrames: number }) {
  const frame = useSceneFrame(REF, durationInFrames);

  return (
    <Scene>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            opacity: interpolate(frame, [0, 18], [0, 1], clamp),
            translate: `0 ${interpolate(frame, [0, 24], [16, 0], outEasing)}px`,
          }}
        >
          <BrandMark size={58} />
          <span style={{ fontSize: 56, fontWeight: 600, letterSpacing: displayTracking }}>
            {brand.wordmark}
          </span>
        </div>

        <div
          style={{
            fontFamily: MONO,
            fontSize: 26,
            color: light.primary,
            opacity: interpolate(frame, [26, 44], [0, 1], clamp),
            translate: `0 ${interpolate(frame, [26, 48], [10, 0], outEasing)}px`,
          }}
        >
          {brand.domain}
        </div>

        <div
          style={{
            marginTop: 6,
            fontSize: 24,
            color: light.mutedForeground,
            opacity: interpolate(frame, [52, 72], [0, 1], clamp),
          }}
        >
          {brand.closing}
        </div>
      </div>
    </Scene>
  );
}
