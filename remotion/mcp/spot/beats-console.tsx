import { CheckIcon } from "lucide-react";
import { interpolate, useCurrentFrame } from "remotion";
import { clamp } from "../../product-demo/stage";
import { light } from "../../product-demo/theme";
import { Beat, Kicker, mono, snap } from "./kit";
import { agentRun, spotClient } from "./spot-content";

/**
 * The beat cut out of the window.
 *
 * The window itself gets six and a half seconds in the middle of the film, at
 * which point everything in it is the right size to follow and the wrong size to
 * read from the far side of a room. So the beat after it takes one object out of
 * that window, sets it at billboard size against the paper, and holds it for one
 * idea's worth of time. The strings are the ones the session uses. The skill
 * that came back with the search is lifted the same way, in `beat-card-opens`.
 */

const { output } = agentRun;

/**
 * The confirmation, alone on the frame. One line, and the whole point of the
 * run, so it gets a cut of its own rather than a corner of the window it was
 * lifted out of.
 */
export function DoneBeat() {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [6, 14], [0, 1], snap);

  return (
    <Beat gap={44}>
      <Kicker at={0}>{spotClient}</Kicker>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 26,
          opacity: interpolate(frame, [6, 10], [0, 1], clamp),
          scale: String(0.93 + 0.07 * t),
          transformOrigin: "left center",
        }}
      >
        <CheckIcon color={light.primary} size={76} strokeWidth={3} />
        <span style={{ ...mono, fontSize: 76, color: light.primary, fontWeight: 500 }}>
          {output.done}
        </span>
      </div>
    </Beat>
  );
}
