import { interpolate } from "remotion";
import { clamp, outEasing, Scene, useSceneFrame } from "../../product-demo/stage";
import { displayTracking, light, radius } from "../../product-demo/theme";
import { agentRun } from "../content";

const REF = 250;
const { reach } = agentRun;

/** One saved skill, reached from every client that speaks MCP. */
export function ReachScene({ durationInFrames }: { durationInFrames: number }) {
  const frame = useSceneFrame(REF, durationInFrames);

  return (
    <Scene>
      <div
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 52 }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 600,
            letterSpacing: displayTracking,
            color: light.foreground,
            opacity: interpolate(frame, [0, 20], [0, 1], clamp),
            translate: `0 ${interpolate(frame, [0, 26], [18, 0], outEasing)}px`,
          }}
        >
          {reach.line}
        </div>

        <div style={{ display: "flex", gap: 18 }}>
          {reach.clients.map((client, index) => {
            const reveal = interpolate(
              frame,
              [40 + index * 12, 62 + index * 12],
              [0, 1],
              outEasing,
            );

            return (
              <span
                key={client}
                style={{
                  padding: "16px 32px",
                  borderRadius: radius["2xl"],
                  border: `1px solid ${light.border}`,
                  background: light.card,
                  color: light.foreground,
                  fontSize: 30,
                  opacity: reveal,
                  scale: String(0.94 + 0.06 * reveal),
                }}
              >
                {client}
              </span>
            );
          })}
        </div>
      </div>
    </Scene>
  );
}
