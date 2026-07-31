import { interpolate } from "remotion";
import { handoff } from "../content";
import { clamp, outEasing, Scene, useSceneFrame } from "../stage";
import { displayTracking, light, radius } from "../theme";
import { HandoffRow } from "../ui/surfaces";

const REF = 160;

export function HandoffScene({ durationInFrames }: { durationInFrames: number }) {
  const frame = useSceneFrame(REF, durationInFrames);

  return (
    <Scene zoom={1.35}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {handoff.paths.map((label, index) => (
            <HandoffRow
              key={label}
              label={label}
              index={index}
              reveal={interpolate(frame, [index * 12, 20 + index * 12], [0, 1], outEasing)}
            />
          ))}
        </div>

        <div
          style={{
            fontSize: 30,
            fontWeight: 600,
            letterSpacing: displayTracking,
            opacity: interpolate(frame, [60, 78], [0, 1], clamp),
            translate: `0 ${interpolate(frame, [60, 82], [12, 0], outEasing)}px`,
          }}
        >
          {handoff.line}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {handoff.agents.map((name, index) => (
            <span
              key={name}
              style={{
                padding: "8px 18px",
                borderRadius: radius.xl,
                border: `1px solid ${light.border}`,
                background: light.card,
                fontSize: 17,
                color: light.mutedForeground,
                opacity: interpolate(frame, [84 + index * 8, 100 + index * 8], [0, 1], clamp),
                scale: String(
                  interpolate(frame, [84 + index * 8, 104 + index * 8], [0.94, 1], outEasing),
                ),
              }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </Scene>
  );
}
