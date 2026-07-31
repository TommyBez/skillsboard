import { interpolate } from "remotion";
import { cards, teamLoop } from "../content";
import { clamp, outEasing, Scene, useSceneFrame } from "../stage";
import { displayTracking, light } from "../theme";
import { SkillCard } from "../ui/skill-card";
import { TeammateChips } from "../ui/surfaces";

const REF = 140;

export function LoopShareScene({ durationInFrames }: { durationInFrames: number }) {
  const frame = useSceneFrame(REF, durationInFrames);

  return (
    <Scene>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 26,
          scale: String(interpolate(frame, [0, 30], [0.92, 0.98], outEasing)),
        }}
      >
        <div
          style={{
            opacity: interpolate(frame, [0, 16], [0, 1], clamp),
            translate: `0 ${interpolate(frame, [0, 22], [26, 0], outEasing)}px`,
          }}
        >
          <SkillCard card={cards[0]} />
        </div>

        <div
          style={{
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: displayTracking,
            opacity: interpolate(frame, [44, 62], [0, 1], clamp),
          }}
        >
          {teamLoop.share.line}
        </div>

        <TeammateChips
          names={teamLoop.share.teammates}
          reveal={teamLoop.share.teammates.map((_, index) =>
            interpolate(frame, [58 + index * 10, 78 + index * 10], [0, 1], outEasing),
          )}
        />
      </div>
    </Scene>
  );
}
