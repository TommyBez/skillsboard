import { Easing, interpolate } from "remotion";
import { clamp, Scene, useSceneFrame } from "../../product-demo/stage";
import { displayTracking, light } from "../../product-demo/theme";
import { setup } from "../content";

const REF = 130;
const { hook } = setup;

/** The problem, in one sentence, before anything about the product. */
export function HookScene({ durationInFrames }: { durationInFrames: number }) {
  const frame = useSceneFrame(REF, durationInFrames);
  let wordIndex = -1;

  return (
    <Scene>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 44,
          width: 1500,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            fontSize: 78,
            fontWeight: 600,
            letterSpacing: displayTracking,
            lineHeight: 1.12,
          }}
        >
          {hook.lines.map((line) => (
            <div key={line.join(" ")} style={{ display: "flex", gap: 20 }}>
              {line.map((word, index) => {
                wordIndex += 1;
                const start = 8 + wordIndex * 4;
                const accent = word.replace(/[^a-z]/gi, "") === hook.accentWord;

                return (
                  <span
                    key={`${word}-${index}`}
                    style={{
                      color: accent ? light.primary : light.foreground,
                      opacity: interpolate(frame, [start, start + 16], [0, 1], clamp),
                      translate: `0 ${interpolate(frame, [start, start + 20], [30, 0], {
                        ...clamp,
                        easing: Easing.bezier(0.16, 1, 0.3, 1),
                      })}px`,
                      filter: `blur(${interpolate(frame, [start, start + 14], [7, 0], clamp)}px)`,
                    }}
                  >
                    {word}
                  </span>
                );
              })}
            </div>
          ))}
        </div>

        <div
          style={{
            fontSize: 34,
            color: light.mutedForeground,
            opacity: interpolate(frame, [66, 86], [0, 1], clamp),
            translate: `0 ${interpolate(frame, [66, 90], [12, 0], clamp)}px`,
          }}
        >
          {hook.sub}
        </div>
      </div>
    </Scene>
  );
}
