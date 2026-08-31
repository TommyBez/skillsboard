import { GitForkIcon } from "lucide-react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  interpolateColors,
  useCurrentFrame,
} from "remotion";
import { clamp } from "../../product-demo/stage";
import { displayTracking, light, MONO, radius, SANS } from "../../product-demo/theme";
import { Kicker, RAIL, snap, SPOT } from "./kit";
import { agentRun, noteLines, skillFileHeading } from "./spot-content";

/**
 * The card, opening into the file.
 *
 * This was two beats and a hard cut: the card the search came back with, then
 * the page inside it. The cut was the weak seam in the film, because the two
 * frames are one fact and the audience was made to take delivery of it twice
 * (maintainer feedback, 31/08). So they are one beat now, and the join is a
 * match on the thing both frames already had in common: the name of the skill.
 * `release-notes` is a single element on a single trajectory. It sits in the
 * card at title size and it arrives at the top of the page at heading size,
 * green, with a hash in front of it. It is set in the mono face at both ends,
 * which is a change to the card: the display face was tried first and had to
 * cross over to mono somewhere in the middle of the move, and a face crossing
 * over is two words in the same place, which is the one thing this beat is
 * supposed to have got rid of. A skill name is a file name anyway, and the
 * source and the tags on that card were already mono. Nothing swaps and nothing
 * dissolves into a copy of itself: the object moves, the frame holds still, and
 * everything that was card falls away around it.
 *
 * The layout is written out in absolute pixels rather than left to the browser,
 * because a match cut is only as good as the two coordinates it joins, and a
 * gap that resolves to a different number at render time would put the name
 * somewhere the eye can watch it jump.
 */

const { hit } = agentRun;

/* Phase A: the card, at the size and the rail it always had. */
const CARD_TOP = 279;
const CARD_PAD_TOP = 52;
const CARD_PAD_X = 56;
const CARD_WIDTH = 1440;
/** The row above the name, so the name's own top is a number and not a guess. */
const SOURCE_HEIGHT = 40;
const TITLE_GAP = 20;
const TITLE_SIZE = 82;
/** The box the name is lifted out of, held open in the card while it travels. */
const TITLE_BOX = 92;
const TITLE_LEFT = RAIL + CARD_PAD_X;
const TITLE_TOP = CARD_TOP + CARD_PAD_TOP + SOURCE_HEIGHT + TITLE_GAP;

/* Phase B: the page, on the same rail, with the green rule for a margin. */
const KICKER_TOP = 234;
const HEAD_TOP = 296;
const HEAD_SIZE = 44;
const COLUMN_LEFT = RAIL + 50;
/** Geist Mono is a 0.6em face, so `# ` is two of those in front of the name. */
const HEAD_LEFT = COLUMN_LEFT + Math.round(2 * 0.6 * HEAD_SIZE);
const LINES_TOP = 373;
const RULE_HEIGHT = 485;
const CAPTION_TOP = 811;

/* The clock: the card, then the move, then the page. */
/** The frame the card starts opening on. */
const OPEN = 88;
/** How long the name takes to cross: long enough to follow, short enough to cut. */
const TRAVEL = 22;
/**
 * The first instruction. It starts before the name has finished landing, on
 * purpose: a page that waits politely for the heading to park reads as two
 * events, and this beat is one.
 */
const LINES_AT = 106;
const CAPTION_AT = 142;

/** The length of the whole beat, so the table upstairs and this clock agree. */
export const CARD_OPENS_LENGTH = 210;

/**
 * The move: off one rest and onto another, decisive through the middle, no
 * overshoot at either end. A spring here would read as a bounce, and nothing in
 * this film bounces.
 */
const travel = { ...clamp, easing: Easing.bezier(0.5, 0, 0.12, 1) };
/** Everything that leaves: slow to let go, then gone. */
const leave = { ...clamp, easing: Easing.bezier(0.4, 0, 0.7, 1) };

export function CardOpensBeat() {
  const frame = useCurrentFrame();

  /** The card landing, at the top of the beat. */
  const enter = interpolate(frame, [5, 15], [0, 1], snap);
  const drop = (1 - enter) * 30;

  /** The one trajectory. Position, size, and colour all ride on it. */
  const t = interpolate(frame, [OPEN, OPEN + TRAVEL], [0, 1], travel);
  const nameLeft = interpolate(t, [0, 1], [TITLE_LEFT, HEAD_LEFT]);
  const nameTop = interpolate(t, [0, 1], [TITLE_TOP, HEAD_TOP]);
  const nameSize = interpolate(t, [0, 1], [TITLE_SIZE, HEAD_SIZE]);
  const nameColour = interpolateColors(t, [0, 1], [light.foreground, light.primary]);
  /** The hash arrives on the way, not on landing. */
  const hash = interpolate(frame, [OPEN + 9, OPEN + 17], [0, 1], snap);

  /** The card, going. The border and the paper go with it. */
  const chrome = interpolate(frame, [OPEN, OPEN + 12], [1, 0], leave);
  /**
   * Its rows collapse rather than fading where they stand, and all of them go
   * the same way the name is going, so nothing crosses the name's path.
   */
  const above = interpolate(frame, [OPEN, OPEN + 10], [0, 1], leave);
  const below = interpolate(frame, [OPEN + 2, OPEN + 12], [0, 1], leave);

  /** The marker sweeps in under the teammate, and sweeps back out to leave. */
  const marker =
    interpolate(frame, [40, 50], [0, 1], snap) *
    interpolate(frame, [OPEN, OPEN + 10], [1, 0], leave);

  /** The green the marker gave up, drawing down the margin of the page. */
  const rule = interpolate(frame, [OPEN + 8, OPEN + 20], [0, 1], snap);

  /** The teammate, named again at the bottom of her own page. */
  const caption = interpolate(frame, [CAPTION_AT, CAPTION_AT + 9], [0, 1], snap);

  return (
    <AbsoluteFill
      style={{
        background: light.background,
        color: light.foreground,
        fontFamily: SANS,
      }}
    >
      <style>{"*, *::before, *::after { box-sizing: border-box; }"}</style>

      <div
        style={{
          background: light.card,
          border: `1px solid ${light.border}`,
          borderRadius: radius["2xl"],
          left: RAIL,
          opacity: enter * chrome,
          padding: `${CARD_PAD_TOP}px ${CARD_PAD_X}px 56px`,
          position: "absolute",
          top: CARD_TOP,
          translate: `0 ${drop}px`,
          width: CARD_WIDTH,
        }}
      >
        <div
          style={{
            alignItems: "center",
            color: light.mutedForeground,
            display: "flex",
            fontFamily: MONO,
            fontSize: 30,
            gap: 16,
            height: SOURCE_HEIGHT,
            opacity: 1 - above,
            translate: `0 ${above * -18}px`,
          }}
        >
          <GitForkIcon color={light.primary} size={28} />
          {hit.source}
        </div>

        {/* The name is drawn over the card, not in it. Its box is held open here. */}
        <div style={{ height: TITLE_BOX, marginTop: TITLE_GAP }} />

        <div
          style={{
            color: light.mutedForeground,
            fontSize: 36,
            lineHeight: 1.38,
            marginTop: 20,
            opacity: 1 - below,
            translate: `0 ${below * -22}px`,
          }}
        >
          {hit.description}
        </div>

        <div
          style={{
            alignItems: "center",
            display: "flex",
            gap: 14,
            marginTop: 30,
            opacity: 1 - below,
            translate: `0 ${below * -34}px`,
          }}
        >
          {hit.tags.map((tag) => (
            <span
              key={tag}
              style={{
                border: `1px solid ${light.border}`,
                borderRadius: radius.lg,
                color: light.mutedForeground,
                fontFamily: MONO,
                fontSize: 26,
                padding: "8px 22px",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <div
          style={{
            marginTop: 38,
            opacity: 1 - below,
            translate: `0 ${below * -46}px`,
          }}
        >
          <span
            style={{
              display: "inline-block",
              fontSize: 40,
              padding: "12px 22px",
              position: "relative",
            }}
          >
            <span
              style={{
                background: light.accent,
                borderRadius: radius.md,
                inset: 0,
                position: "absolute",
                scale: `${marker} 1`,
                transformOrigin: "left center",
              }}
            />
            <span style={{ color: light.accentForeground, position: "relative" }}>
              Saved by <span style={{ fontWeight: 600 }}>{hit.savedBy}</span> in{" "}
              {hit.team}
            </span>
          </span>
        </div>
      </div>

      <div style={{ left: RAIL, position: "absolute", top: KICKER_TOP }}>
        <Kicker at={OPEN + 10}>SKILL.md</Kicker>
      </div>

      <div
        style={{
          background: light.primary,
          borderRadius: 5,
          height: RULE_HEIGHT,
          left: RAIL,
          position: "absolute",
          scale: `1 ${rule}`,
          top: HEAD_TOP,
          transformOrigin: "top center",
          width: 10,
        }}
      />

      {/* The element that is in both frames, on its way between them. */}
      <div
        style={{
          color: nameColour,
          fontFamily: MONO,
          fontSize: nameSize,
          fontWeight: 500,
          left: nameLeft,
          lineHeight: 1.1,
          opacity: enter,
          position: "absolute",
          top: nameTop,
          translate: `0 ${drop}px`,
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ display: "inline-block", position: "relative" }}>
          {skillFileHeading.name}
          <span
            style={{
              opacity: hash,
              position: "absolute",
              right: "100%",
              whiteSpace: "pre",
            }}
          >
            {skillFileHeading.hash}
          </span>
        </span>
      </div>

      <div
        style={{
          left: COLUMN_LEFT,
          position: "absolute",
          top: LINES_TOP,
          width: SPOT.width - COLUMN_LEFT - RAIL,
        }}
      >
        {noteLines.map((line, index) => {
          const at = LINES_AT + index * 5;
          const landed = interpolate(frame, [at, at + 9], [0, 1], snap);
          const gap = line.key ? 12 : 14;

          return (
            <div
              key={line.text}
              style={{
                color: line.key ? light.foreground : light.mutedForeground,
                fontSize: line.key ? 80 : 52,
                fontWeight: line.key ? 500 : 400,
                letterSpacing: displayTracking,
                lineHeight: line.key ? 1.1 : 1.16,
                marginBottom: index === noteLines.length - 1 ? 0 : gap,
                opacity: landed,
                translate: `0 ${(1 - landed) * 22}px`,
              }}
            >
              {line.text}
            </div>
          );
        })}
      </div>

      <div
        style={{
          color: light.mutedForeground,
          fontFamily: MONO,
          fontSize: 30,
          left: COLUMN_LEFT,
          opacity: caption,
          position: "absolute",
          top: CAPTION_TOP,
          translate: `0 ${(1 - caption) * 12}px`,
        }}
      >
        written by {hit.savedBy}
      </div>
    </AbsoluteFill>
  );
}
