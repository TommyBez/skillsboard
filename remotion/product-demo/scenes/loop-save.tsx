import { AbsoluteFill, interpolate } from "remotion";
import { Cursor } from "@/components/remocn/cursor";
import { clickPress, cursorPathAt } from "@/components/remocn/use-cursor-path";
import { saveDialog } from "../content";
import { clamp, outEasing, quiet, Scene, useSceneFrame } from "../stage";
import { light } from "../theme";
import { DIALOG_WIDTH, HIT, SaveDialog, Toast } from "../ui/save-dialog";

const REF = 170;

/** The loop opens mid-task: the repository is already inspected. */
const WAYPOINTS = [
  { at: 0, x: DIALOG_WIDTH - 60, y: 560 },
  { at: 22, x: HIT.firstSkill.x, y: HIT.firstSkill.y, duration: 18, click: true },
  { at: 88, x: HIT.submit.x, y: HIT.submit.y, duration: 16, click: true },
];

function typed(text: string, frame: number, from: number, to: number) {
  return text.slice(0, Math.round(interpolate(frame, [from, to], [0, text.length], clamp)));
}

export function LoopSaveScene({ durationInFrames }: { durationInFrames: number }) {
  const frame = useSceneFrame(REF, durationInFrames);
  const cursor = quiet(cursorPathAt(WAYPOINTS, frame));

  return (
    <Scene zoom={1.05}>
      <div
        style={{
          position: "relative",
          opacity: interpolate(frame, [0, 12, 92, 106], [0, 1, 1, 0], clamp),
          scale: String(interpolate(frame, [0, 16, 92, 108], [0.97, 1, 1, 0.97], clamp)),
        }}
      >
        <SaveDialog
          url={saveDialog.url}
          discovery={1}
          checked={[frame >= 22, false, false]}
          checkProgress={interpolate(frame, [22, 34], [0, 1], clamp)}
          noteReveal={interpolate(frame, [34, 50], [0, 1], outEasing)}
          note={typed(saveDialog.note, frame, 46, 76)}
          noteCaret={frame >= 46 && frame < 88 && Math.floor(frame / 15) % 2 === 0 ? 1 : 0}
          tags={saveDialog.tags}
          tagsOpacity={interpolate(frame, [76, 88], [0, 1], clamp)}
          submitPress={clickPress(frame - 88)}
        />

        <Cursor
          style={cursor}
          theme={{ primary: light.primary, foreground: light.foreground, background: light.card }}
        />
      </div>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Toast
          opacity={interpolate(frame, [108, 122], [0, 1], clamp)}
          rise={interpolate(frame, [108, 126], [16, 0], outEasing)}
        />
      </AbsoluteFill>
    </Scene>
  );
}
