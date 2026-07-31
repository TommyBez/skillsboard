import { AbsoluteFill, interpolate } from "remotion";
import { Cursor } from "@/components/remocn/cursor";
import { clickPress, cursorPathAt } from "@/components/remocn/use-cursor-path";
import { saveDialog } from "../content";
import { clamp, outEasing, quiet, Scene, useSceneFrame } from "../stage";
import { light } from "../theme";
import { DIALOG_WIDTH, HIT, SaveDialog, Toast } from "../ui/save-dialog";

const REF = 240;

const WAYPOINTS = [
  { at: 0, x: DIALOG_WIDTH - 40, y: 620 },
  { at: 24, x: HIT.url.x, y: HIT.url.y, duration: 20, click: true },
  { at: 92, x: HIT.firstSkill.x, y: HIT.firstSkill.y, duration: 22, click: true },
  { at: 150, x: HIT.submit.x, y: HIT.submit.y, duration: 16, click: true },
];

function typed(text: string, frame: number, from: number, to: number) {
  const count = Math.round(interpolate(frame, [from, to], [0, text.length], clamp));
  return text.slice(0, count);
}

export function SaveScene({ durationInFrames }: { durationInFrames: number }) {
  const frame = useSceneFrame(REF, durationInFrames);
  const cursor = quiet(cursorPathAt(WAYPOINTS, frame));
  const checked = frame >= 92;

  return (
    <Scene zoom={1.05}>
      <div
        style={{
          position: "relative",
          opacity: interpolate(frame, [0, 14, 150, 164], [0, 1, 1, 0], clamp),
          scale: String(interpolate(frame, [0, 18, 150, 166], [0.96, 1, 1, 0.97], clamp)),
          translate: `0 ${interpolate(frame, [0, 18], [16, 0], outEasing)}px`,
        }}
      >
        <SaveDialog
          url={typed(saveDialog.url, frame, 24, 58)}
          urlFocused={frame >= 24 && frame < 72}
          caret={frame >= 24 && frame < 72 && Math.floor(frame / 15) % 2 === 0 ? 1 : 0}
          discovery={interpolate(frame, [62, 84], [0, 1], outEasing)}
          checked={[checked, false, false]}
          checkProgress={interpolate(frame, [92, 104], [0, 1], clamp)}
          noteReveal={interpolate(frame, [104, 120], [0, 1], outEasing)}
          note={typed(saveDialog.note, frame, 116, 142)}
          noteCaret={frame >= 116 && frame < 150 && Math.floor(frame / 15) % 2 === 0 ? 1 : 0}
          tags={saveDialog.tags}
          tagsOpacity={interpolate(frame, [140, 150], [0, 1], clamp)}
          submitPress={clickPress(frame - 150)}
        />

        <Cursor
          style={cursor}
          theme={{ primary: light.primary, foreground: light.foreground, background: light.card }}
        />
      </div>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Toast
          opacity={interpolate(frame, [166, 179], [0, 1], clamp)}
          rise={interpolate(frame, [166, 182], [16, 0], outEasing)}
        />
      </AbsoluteFill>
    </Scene>
  );
}
