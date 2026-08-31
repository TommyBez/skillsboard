import { interpolate } from "remotion";
import { clamp, outEasing, Scene, useSceneFrame } from "../../product-demo/stage";
import { light } from "../../product-demo/theme";
import { agentRun } from "../content";
import {
  BLOCK_HEIGHT,
  CallRow,
  Console,
  CONSOLE_VIEWPORT,
  HitCard,
  NoteRow,
  OutputBlock,
  PromptRow,
  STREAM_GAP,
  STREAM_PAD_BOTTOM,
  STREAM_PAD_TOP,
} from "../ui/agent-console";

const REF = 770;

/**
 * One session, one window, one continuous run of frames: the task is typed, the
 * call goes out, the skill comes back and stays on screen while the note it
 * carries turns into the answer. Nothing here cuts away or clears.
 */
const T = {
  prompt: 34,
  call: 178,
  hit: 262,
  note: 408,
  output: 500,
  caption: 656,
} as const;

/** Typing speed in frames per character. The agent types faster than the user. */
const PACE = {
  prompt: 1.8,
  call: 1.4,
  output: 0.7,
} as const;

const CONTENT_HEIGHT =
  STREAM_PAD_TOP +
  STREAM_PAD_BOTTOM +
  BLOCK_HEIGHT.prompt +
  BLOCK_HEIGHT.call +
  BLOCK_HEIGHT.hit +
  BLOCK_HEIGHT.note +
  BLOCK_HEIGHT.output +
  STREAM_GAP * 4;

/**
 * The column outruns the window by exactly the height of the first row and the
 * gap under it, so the one scroll of the video parks the call at the top edge
 * with the returned skill whole underneath it.
 */
const SCROLL = Math.max(0, CONTENT_HEIGHT - CONSOLE_VIEWPORT);

export function SessionScene({ durationInFrames }: { durationInFrames: number }) {
  const frame = useSceneFrame(REF, durationInFrames);
  const scroll = interpolate(
    frame,
    [588, 616, 626, 652],
    [0, SCROLL / 2, SCROLL / 2, SCROLL],
    outEasing,
  );

  return (
    <Scene drift={{ from: 1, to: 1.012 }} durationInFrames={durationInFrames}>
      <div
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}
      >
        <Console frame={frame} scroll={scroll}>
          <PromptRow
            at={T.prompt}
            caret={frame < T.call}
            frame={frame}
            perChar={PACE.prompt}
          />
          <CallRow
            at={T.call}
            caret={frame >= T.call && frame < T.hit}
            frame={frame}
            perChar={PACE.call}
          />
          <HitCard at={T.hit} frame={frame} />
          <NoteRow at={T.note} frame={frame} />
          <OutputBlock at={T.output} frame={frame} perChar={PACE.output} />
        </Console>

        <div
          style={{
            fontSize: 30,
            color: light.mutedForeground,
            opacity: interpolate(frame, [T.caption, T.caption + 22], [0, 1], clamp),
          }}
        >
          {agentRun.applyLine}
        </div>
      </div>
    </Scene>
  );
}
