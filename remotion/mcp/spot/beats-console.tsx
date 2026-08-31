import { CheckIcon, GitForkIcon } from "lucide-react";
import { interpolate, useCurrentFrame } from "remotion";
import { clamp } from "../../product-demo/stage";
import { displayTracking, light, MONO, radius } from "../../product-demo/theme";
import { Beat, Kicker, Land, mono, snap } from "./kit";
import { agentRun, spotClient } from "./spot-content";

/**
 * The two beats cut out of the window.
 *
 * The window itself gets six and a half seconds in the middle of the film, at
 * which point everything in it is the right size to follow and the wrong size to
 * read from the far side of a room. So the beats on either side of it take one
 * object out of that window, set it at billboard size against the paper, and
 * hold it for one idea's worth of time. The strings are the ones the session
 * uses.
 */

const { hit, output } = agentRun;

/**
 * The skill the search came back with. It arrives after the window rather than
 * before it, because the interesting question is not what the client called: it
 * is why the draft came out in the house style, and the answer is this card.
 */
export function CardBeat() {
  const frame = useCurrentFrame();
  const marker = interpolate(frame, [40, 50], [0, 1], snap);

  return (
    <Beat gap={46}>
      <Land at={5} from={30} over={10}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            width: 1440,
            padding: "52px 56px 56px",
            borderRadius: radius["2xl"],
            border: `1px solid ${light.border}`,
            background: light.card,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontFamily: MONO,
              fontSize: 30,
              color: light.mutedForeground,
            }}
          >
            <GitForkIcon color={light.primary} size={28} />
            {hit.source}
          </div>

          <div
            style={{
              fontSize: 82,
              fontWeight: 600,
              letterSpacing: displayTracking,
              lineHeight: 1.06,
            }}
          >
            {hit.title}
          </div>

          <div style={{ fontSize: 36, lineHeight: 1.38, color: light.mutedForeground }}>
            {hit.description}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10 }}>
            {hit.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  padding: "8px 22px",
                  borderRadius: radius.lg,
                  border: `1px solid ${light.border}`,
                  fontFamily: MONO,
                  fontSize: 26,
                  color: light.mutedForeground,
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <div style={{ marginTop: 18 }}>
            <span
              style={{
                position: "relative",
                display: "inline-block",
                padding: "12px 22px",
                fontSize: 40,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: radius.md,
                  background: light.accent,
                  transformOrigin: "left center",
                  scale: `${marker} 1`,
                }}
              />
              <span style={{ position: "relative", color: light.accentForeground }}>
                Saved by{" "}
                <span style={{ fontWeight: 600 }}>{hit.savedBy}</span> in {hit.team}
              </span>
            </span>
          </div>
        </div>
      </Land>
    </Beat>
  );
}

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
