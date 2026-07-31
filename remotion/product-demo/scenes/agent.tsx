import { AbsoluteFill, interpolate, interpolateColors } from "remotion";
import { agent } from "../content";
import { clamp, outEasing, Scene, useSceneFrame } from "../stage";
import { displayTracking, ink, light } from "../theme";
import { AGENT_PANEL_WIDTH, AgentChips, AgentPanel } from "../ui/agent-panel";

const REF = 250;

/** Row arrivals: prompt, tool call, result, the team's note. */
const ROW_AT = [10, 52, 86, 116];

interface AgentSceneProps {
  durationInFrames: number;
  /**
   * "chips" closes on the agent line-up — the social cut has no handoff scene to
   * carry it. "hold" keeps the transcript on screen instead, so the Product Hunt
   * cut does not show the same three chips twice.
   */
  tail?: "chips" | "hold";
}

export function AgentScene({ durationInFrames, tail = "chips" }: AgentSceneProps) {
  const frame = useSceneFrame(REF, durationInFrames);
  const panelOut = tail === "chips" ? 166 : 210;

  return (
    <Scene
      zoom={1.15}
      background={interpolateColors(frame, [224, 246], [ink.background, light.background])}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 40,
          opacity: interpolate(frame, [228, 244], [1, 0], clamp),
        }}
      >
        <div
          style={{
            fontSize: 32,
            fontWeight: 600,
            letterSpacing: displayTracking,
            color: ink.foreground,
            opacity: interpolate(frame, [0, 18], [0, 1], clamp),
            translate: `0 ${interpolate(frame, [0, 22], [12, 0], outEasing)}px`,
          }}
        >
          {agent.line}
        </div>

        <div style={{ position: "relative", width: AGENT_PANEL_WIDTH, height: 250 }}>
          <AbsoluteFill
            style={{
              alignItems: "center",
              justifyContent: "center",
              opacity: interpolate(frame, [panelOut, panelOut + 22], [1, 0], clamp),
              translate: `0 ${interpolate(frame, [panelOut, panelOut + 26], [0, -24], outEasing)}px`,
            }}
          >
            <AgentPanel
              reveal={ROW_AT.map((at) => interpolate(frame, [at, at + 16], [0, 1], outEasing))}
            />
          </AbsoluteFill>

          {tail === "chips" ? (
            <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
              <AgentChips
                reveal={agent.agents.map((_, index) =>
                  interpolate(frame, [184 + index * 8, 202 + index * 8], [0, 1], outEasing),
                )}
              />
            </AbsoluteFill>
          ) : null}
        </div>
      </div>
    </Scene>
  );
}
