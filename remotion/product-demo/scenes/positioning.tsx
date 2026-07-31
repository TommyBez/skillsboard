import { interpolate } from "remotion";
import { brand } from "../content";
import { clamp, outEasing, Scene, useSceneFrame } from "../stage";
import { displayTracking, light } from "../theme";
import { BrandMark } from "../ui/atoms";

const REF = 120;

export function PositioningScene({ durationInFrames }: { durationInFrames: number }) {
  const frame = useSceneFrame(REF, durationInFrames);
  const letters = brand.wordmark.split("");

  return (
    <Scene drift={{ from: 1, to: 1.03 }} durationInFrames={durationInFrames}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 26,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              clipPath: `inset(0 ${interpolate(frame, [0, 26], [100, 0], outEasing)}% 0 0)`,
            }}
          >
            <BrandMark size={68} />
          </div>
          <div style={{ display: "flex", fontSize: 62, fontWeight: 600, letterSpacing: displayTracking }}>
            {letters.map((letter, index) => {
              const start = 16 + index * 2.5;

              return (
                <span
                  key={`${letter}-${index}`}
                  style={{
                    whiteSpace: "pre",
                    opacity: interpolate(frame, [start, start + 12], [0, 1], clamp),
                    translate: `0 ${interpolate(frame, [start, start + 18], [18, 0], outEasing)}px`,
                  }}
                >
                  {letter}
                </span>
              );
            })}
          </div>
        </div>

        <div
          style={{
            fontSize: 26,
            color: light.mutedForeground,
            opacity: interpolate(frame, [46, 66], [0, 1], clamp),
            scale: String(interpolate(frame, [46, 70], [0.98, 1], outEasing)),
          }}
        >
          {brand.tagline}
        </div>
      </div>
    </Scene>
  );
}
