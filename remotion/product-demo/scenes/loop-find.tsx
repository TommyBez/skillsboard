import { interpolate } from "remotion";
import { Cursor } from "@/components/remocn/cursor";
import { cursorPathAt } from "@/components/remocn/use-cursor-path";
import { find, teamLoop } from "../content";
import { clamp, outEasing, quiet, Scene, useSceneFrame } from "../stage";
import { light } from "../theme";
import { HandoffChips, LibrarySearch, RESULT_CARD_WIDTH, ResultCard } from "../ui/surfaces";

const REF = 166;

const QUERY_AT = 56;
const STEP = RESULT_CARD_WIDTH + 40;

const WAYPOINTS = [
  { at: 0, x: 640, y: 300 },
  { at: 22, x: 360, y: 67, duration: 20, click: true },
];

function typed(text: string, frame: number, from: number, to: number) {
  return text.slice(0, Math.round(interpolate(frame, [from, to], [0, text.length], clamp)));
}

/** Only the query narrows here — the tag step belongs to the longer cut. */
function track(index: number) {
  const kept = find.results.filter((result) => result.matchesQuery);
  const slot = kept.findIndex((result) => result === find.results[index]);
  const before = (index - (find.results.length - 1) / 2) * STEP;
  const after = slot === -1 ? before : (slot - (kept.length - 1) / 2) * STEP;
  return [before, after];
}

export function LoopFindScene({ durationInFrames }: { durationInFrames: number }) {
  const frame = useSceneFrame(REF, durationInFrames);
  const cursor = quiet(cursorPathAt(WAYPOINTS, frame));

  return (
    <Scene zoom={1.02}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 26,
          /* Closes well before the last frame: a residual few percent would
             show as a ghost when the loop wraps to the first frame. */
          opacity: interpolate(frame, [REF - 22, REF - 8], [1, 0], clamp),
        }}
      >
        <div
          style={{
            position: "relative",
            opacity: interpolate(frame, [0, 12], [0, 1], clamp),
            translate: `0 ${interpolate(frame, [0, 16], [14, 0], outEasing)}px`,
          }}
        >
          <LibrarySearch
            query={typed(find.query, frame, 26, 52)}
            caret={frame >= 22 && frame < 64 && Math.floor(frame / 15) % 2 === 0 ? 1 : 0}
            activeTag={null}
          />
          <Cursor
            style={cursor}
            theme={{ primary: light.primary, foreground: light.foreground, background: light.card }}
          />
        </div>

        <div style={{ position: "relative", width: 1120, height: 236 }}>
          {find.results.map((result, index) => (
            <ResultCard
              key={result.title}
              result={result}
              opacity={
                result.matchesQuery
                  ? interpolate(frame, [4 + index * 5, 20 + index * 5], [0, 1], clamp)
                  : interpolate(
                      frame,
                      [4 + index * 5, 20 + index * 5, QUERY_AT, QUERY_AT + 16],
                      [0, 1, 1, 0],
                      clamp,
                    )
              }
              scale={
                result.matchesQuery
                  ? 1
                  : interpolate(frame, [QUERY_AT, QUERY_AT + 16], [1, 0.94], clamp)
              }
              offsetX={interpolate(frame, [QUERY_AT, QUERY_AT + 24], track(index), outEasing)}
            />
          ))}
        </div>

        <div
          style={{
            fontSize: 20,
            color: light.mutedForeground,
            opacity: interpolate(frame, [96, 112], [0, 1], clamp),
          }}
        >
          {teamLoop.find.line}
        </div>

        <HandoffChips
          reveal={[0, 1, 2].map((index) =>
            interpolate(frame, [104 + index * 8, 122 + index * 8], [0, 1], outEasing),
          )}
        />
      </div>
    </Scene>
  );
}
