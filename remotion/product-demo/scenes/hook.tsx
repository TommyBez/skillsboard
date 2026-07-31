import { Easing, interpolate } from "remotion";
import { hook } from "../content";
import { clamp, outEasing, Scene, useSceneFrame } from "../stage";
import { displayTracking, light, radius } from "../theme";

const REF = 130;

/** Where the abandoned chatter sits before it drifts off frame. */
const BUBBLES = [
  { x: -430, y: -250, drift: -70 },
  { x: 340, y: -170, drift: 60 },
  { x: -250, y: 250, drift: -50 },
];

export function HookScene({ durationInFrames }: { durationInFrames: number }) {
  const frame = useSceneFrame(REF, durationInFrames);
  let wordIndex = -1;

  return (
    <Scene>
      <div style={{ position: "relative", width: 1180, height: 620 }}>
        {BUBBLES.map((bubble, index) => (
          <div
            key={hook.chatter[index]}
            style={{
              position: "absolute",
              left: 590 + bubble.x,
              top: 310 + bubble.y,
              padding: "14px 20px",
              borderRadius: radius["2xl"],
              border: `1px solid ${light.border}`,
              background: light.card,
              fontSize: 19,
              color: light.mutedForeground,
              whiteSpace: "nowrap",
              opacity: interpolate(
                frame,
                [index * 6, 14 + index * 6, 46 + index * 5, 74 + index * 5],
                [0, 1, 1, 0],
                clamp,
              ),
              translate: `${interpolate(frame, [40, 104], [0, bubble.drift], outEasing)}px ${interpolate(frame, [40, 104], [0, bubble.drift * 0.4], outEasing)}px`,
              filter: `blur(${interpolate(frame, [46, 96], [0, 7], clamp)}px)`,
            }}
          >
            {hook.chatter[index]}
          </div>
        ))}

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            fontSize: 58,
            fontWeight: 600,
            letterSpacing: displayTracking,
            lineHeight: 1.15,
          }}
        >
          {hook.lines.map((line, lineIndex) => (
            <div key={lineIndex} style={{ display: "flex", gap: 16 }}>
              {line.map((word, index) => {
                wordIndex += 1;
                const start = 34 + wordIndex * 4;
                const accent = word.replace(/[^a-z]/gi, "") === hook.accentWord;

                return (
                  <span
                    key={`${word}-${index}`}
                    style={{
                      color: accent ? light.primary : light.foreground,
                      opacity: interpolate(frame, [start, start + 16], [0, 1], clamp),
                      translate: `0 ${interpolate(frame, [start, start + 20], [26, 0], {
                        ...clamp,
                        easing: Easing.bezier(0.16, 1, 0.3, 1),
                      })}px`,
                      filter: `blur(${interpolate(frame, [start, start + 14], [6, 0], clamp)}px)`,
                    }}
                  >
                    {word}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </Scene>
  );
}
