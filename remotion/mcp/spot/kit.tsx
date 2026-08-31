import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { clamp } from "../../product-demo/stage";
import { displayTracking, light, MONO, SANS } from "../../product-demo/theme";

/**
 * The grammar of the spot.
 *
 * A spot is cut, not flown: there is no camera here, no push, no drift, and
 * nothing that keeps moving after it has arrived. Everything on this page either
 * lands inside a third of a second and then holds perfectly still, or wipes the
 * frame clean for the next cut. Every beat is built on one left rail, so ten
 * hard cuts read as one film instead of ten slides.
 */

/** The rail every beat aligns to, and the matching air on the right. */
export const RAIL = 150;

/** The frame the beats are composed inside. */
export const SPOT = { width: 1920, height: 1080 } as const;

/** Entrances: fast out of the gate, dead stop at the end, no overshoot. */
export const snap = { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) };
/** Wipes: symmetric, because a wipe is a machine, not a gesture. */
export const wipeEase = { ...clamp, easing: Easing.bezier(0.4, 0, 0.2, 1) };

export const display: CSSProperties = {
  fontFamily: SANS,
  fontWeight: 600,
  letterSpacing: displayTracking,
  lineHeight: 1.08,
  color: light.foreground,
};

export const mono: CSSProperties = {
  fontFamily: MONO,
  fontWeight: 400,
  color: light.foreground,
};

/** The cream stage. Fixed size, left rail, vertically centred column. */
export function Beat({
  children,
  align = "flex-start",
  background = light.background,
  gap = 0,
}: {
  children: ReactNode;
  align?: CSSProperties["alignItems"];
  background?: string;
  gap?: number;
}) {
  return (
    <AbsoluteFill
      style={{
        background,
        fontFamily: SANS,
        color: light.foreground,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: align,
        gap,
        padding: `0 ${RAIL}px`,
      }}
    >
      <style>{"*, *::before, *::after { box-sizing: border-box; }"}</style>
      {children}
    </AbsoluteFill>
  );
}

/**
 * One element arriving. Twelve frames from invisible and slightly low to placed
 * and still; after `at + over` the style is constant, which is what makes the
 * hold read as a held frame rather than as a slow move.
 */
export function Land({
  at,
  children,
  from = 26,
  over = 10,
  style,
}: {
  at: number;
  children: ReactNode;
  from?: number;
  over?: number;
  style?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [at, at + over], [0, 1], snap);

  return (
    <div
      style={{
        opacity: t,
        translate: `0 ${(1 - t) * from}px`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** The label that names which surface a fragment was cut out of. */
export function Kicker({ at, children }: { at: number; children: ReactNode }) {
  return (
    <Land at={at} from={14} over={8}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontFamily: MONO,
          fontSize: 28,
          color: light.mutedForeground,
        }}
      >
        <span
          style={{ width: 14, height: 14, borderRadius: 999, background: light.primary }}
        />
        {children}
      </div>
    </Land>
  );
}

/** A green rule that draws from the rail outwards and then stops. */
export function Rule({
  at,
  color = light.primary,
  height = 6,
  over = 10,
  width,
}: {
  at: number;
  color?: string;
  height?: number;
  over?: number;
  width: number;
}) {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [at, at + over], [0, 1], snap);

  return (
    <div
      style={{
        width,
        height,
        background: color,
        borderRadius: height / 2,
        transformOrigin: "left center",
        scale: `${t} 1`,
      }}
    />
  );
}

const BLINK = 12;

/** Solid while characters are landing, blinking while the line waits. */
function caretOn(frame: number, typing: boolean) {
  return typing || Math.floor(frame / BLINK) % 2 === 0;
}

function Caret({ color, size }: { color: string; size: number }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: Math.round(size * 0.5),
        height: Math.round(size * 0.94),
        marginLeft: Math.round(size * 0.08),
        verticalAlign: "-0.14em",
        borderRadius: 3,
        background: color,
      }}
    />
  );
}

/**
 * A monospaced sentence arriving one character at a time across fixed rows.
 * The rows are fixed on purpose: a real console reflows while you type, and a
 * word jumping down a line mid take is the one thing a spot cannot afford.
 */
export function TypedLines({
  at,
  caret = light.primary,
  frame,
  lines,
  perChar,
  size,
  style,
}: {
  at: number;
  /** The block that follows the last character. Green on paper, warm in a client. */
  caret?: string;
  frame: number;
  lines: readonly string[];
  perChar: number;
  size: number;
  style?: CSSProperties;
}) {
  const total = lines.reduce((sum, line) => sum + line.length, 0);
  const shown = Math.floor(
    interpolate(frame, [at, at + total * perChar], [0, total], clamp),
  );
  const typing = frame >= at && shown < total;
  let consumed = 0;

  return (
    <div style={{ ...mono, fontSize: size, lineHeight: 1.34, ...style }}>
      {lines.map((line) => {
        const start = consumed;
        consumed += line.length;
        const count = Math.min(Math.max(shown - start, 0), line.length);
        const holds = shown >= start && shown < start + line.length;
        const parks = shown >= total && consumed === total;

        return (
          <div key={line} style={{ height: size * 1.34, whiteSpace: "pre" }}>
            {line.slice(0, count)}
            {(holds || parks) && caretOn(frame, typing) ? (
              <Caret color={caret} size={size} />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/**
 * A band of brand green that crosses the frame and takes the cut with it. It
 * covers the whole frame for exactly one frame at its midpoint, which is where
 * the beat underneath changes, so the audience never sees a dissolve.
 */
export function GreenWipe({ durationInFrames }: { durationInFrames: number }) {
  const frame = useCurrentFrame();
  const half = durationInFrames / 2;
  const on = interpolate(frame, [0, half], [0, 1], wipeEase);
  const off = interpolate(frame, [half, durationInFrames], [0, 1], wipeEase);

  return (
    <AbsoluteFill
      style={{
        background: light.primary,
        clipPath: `inset(0 ${(1 - on) * 100}% 0 ${off * 100}%)`,
      }}
    />
  );
}
