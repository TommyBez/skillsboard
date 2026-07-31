import { interpolate } from "remotion";
import { Cursor } from "@/components/remocn/cursor";
import { cursorPathAt } from "@/components/remocn/use-cursor-path";
import { cards } from "../content";
import { clamp, outEasing, quiet, Scene, useSceneFrame } from "../stage";
import { light } from "../theme";
import { SkillCard } from "../ui/skill-card";

const REF = 230;

/** Card A's centre sits half a gutter left of the pair's centre. */
const RECENTER = 330;

const WAYPOINTS = [
  { at: 0, x: 660, y: 620 },
  { at: 132, x: 572, y: 453, duration: 22, click: true },
];

export function LibraryScene({ durationInFrames }: { durationInFrames: number }) {
  const frame = useSceneFrame(REF, durationInFrames);
  const cursor = quiet(cursorPathAt(WAYPOINTS, frame));

  return (
    <Scene>
      <div
        style={{
          display: "flex",
          gap: 40,
          scale: String(interpolate(frame, [40, 84], [0.78, 1.25], outEasing)),
          translate: `${interpolate(frame, [40, 84], [0, RECENTER], outEasing)}px`,
        }}
      >
        <div
          style={{
            position: "relative",
            opacity: interpolate(frame, [0, 16], [0, 1], clamp),
            translate: `0 ${interpolate(frame, [0, 22], [34, 0], outEasing)}px`,
          }}
        >
          <SkillCard card={cards[0]} copied={interpolate(frame, [132, 144], [0, 1], clamp)} />
          <Cursor
            style={cursor}
            theme={{ primary: light.primary, foreground: light.foreground, background: light.card }}
          />
        </div>

        <div
          style={{
            opacity: interpolate(frame, [8, 26, 44, 72], [0, 1, 1, 0], clamp),
            translate: `0 ${interpolate(frame, [8, 30], [34, 0], outEasing)}px`,
          }}
        >
          <SkillCard card={cards[1]} />
        </div>
      </div>
    </Scene>
  );
}
