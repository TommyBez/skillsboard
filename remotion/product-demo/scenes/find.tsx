import { interpolate } from "remotion";
import { Cursor } from "@/components/remocn/cursor";
import { cursorPathAt } from "@/components/remocn/use-cursor-path";
import { find } from "../content";
import { clamp, outEasing, quiet, Scene, useSceneFrame } from "../stage";
import { light } from "../theme";
import { LibrarySearch, RESULT_CARD_WIDTH, ResultCard } from "../ui/surfaces";

const REF = 190;

/** The two moments the result set changes. */
const QUERY_AT = 62;
const TAG_AT = 116;

const GAP = 40;
const STEP = RESULT_CARD_WIDTH + GAP;

const WAYPOINTS = [
  { at: 0, x: 660, y: 300 },
  { at: 26, x: 360, y: 67, duration: 22, click: true },
  { at: TAG_AT, x: 69, y: 133, duration: 26, click: true },
];

function typed(text: string, frame: number, from: number, to: number) {
  return text.slice(0, Math.round(interpolate(frame, [from, to], [0, text.length], clamp)));
}

/** Slot position per stage, or null once the result has been filtered out. */
function slotX(index: number, stage: 0 | 1 | 2) {
  const kept = find.results
    .map((result, position) => ({ result, position }))
    .filter(({ result }) =>
      stage === 0
        ? true
        : stage === 1
          ? result.matchesQuery
          : result.matchesQuery && result.matchesTag,
    );
  const slot = kept.findIndex(({ position }) => position === index);
  if (slot === -1) return null;
  return (slot - (kept.length - 1) / 2) * STEP;
}

/** A card that leaves holds its last slot, so it never drifts under the survivors. */
function track(index: number) {
  const x0 = slotX(index, 0) ?? 0;
  const x1 = slotX(index, 1) ?? x0;
  const x2 = slotX(index, 2) ?? x1;
  return [x0, x1, x1, x2];
}

export function FindScene({ durationInFrames }: { durationInFrames: number }) {
  const frame = useSceneFrame(REF, durationInFrames);
  const cursor = quiet(cursorPathAt(WAYPOINTS, frame));

  return (
    <Scene zoom={1.12}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <div
          style={{
            position: "relative",
            opacity: interpolate(frame, [0, 14], [0, 1], clamp),
            translate: `0 ${interpolate(frame, [0, 18], [16, 0], outEasing)}px`,
          }}
        >
          <LibrarySearch
            query={typed(find.query, frame, 30, 58)}
            caret={frame >= 26 && frame < 70 && Math.floor(frame / 15) % 2 === 0 ? 1 : 0}
            activeTag={frame >= TAG_AT ? find.activeTag : null}
          />
          <Cursor
            style={cursor}
            theme={{ primary: light.primary, foreground: light.foreground, background: light.card }}
          />
        </div>

        <div style={{ position: "relative", width: 1120, height: 236 }}>
          {find.results.map((result, index) => {
            const droppedByQuery = !result.matchesQuery;
            const droppedByTag = result.matchesQuery && !result.matchesTag;
            const exitAt = droppedByQuery ? QUERY_AT : droppedByTag ? TAG_AT : null;

            return (
              <ResultCard
                key={result.title}
                result={result}
                opacity={
                  exitAt === null
                    ? interpolate(frame, [4 + index * 6, 22 + index * 6], [0, 1], clamp)
                    : interpolate(
                        frame,
                        [4 + index * 6, 22 + index * 6, exitAt, exitAt + 16],
                        [0, 1, 1, 0],
                        clamp,
                      )
                }
                scale={
                  exitAt === null ? 1 : interpolate(frame, [exitAt, exitAt + 16], [1, 0.94], clamp)
                }
                offsetX={interpolate(
                  frame,
                  [QUERY_AT, QUERY_AT + 24, TAG_AT, TAG_AT + 24],
                  track(index),
                  outEasing,
                )}
              />
            );
          })}
        </div>

        <div
          style={{
            fontSize: 22,
            color: light.mutedForeground,
            opacity: interpolate(frame, [148, 168], [0, 1], clamp),
          }}
        >
          {find.line}
        </div>
      </div>
    </Scene>
  );
}
