import type { CSSProperties, ReactNode } from "react";
import { interpolate } from "remotion";
import { clamp, outEasing } from "../../product-demo/stage";
import { displayTracking, light, MONO, radius } from "../../product-demo/theme";

/** The type ramp for a 1920 x 1080 frame, one step up from the app's own. */
export const t = {
  step: {
    fontFamily: MONO,
    fontSize: 22,
    fontWeight: 600,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: light.primary,
  } as CSSProperties,
  heading: {
    fontSize: 58,
    fontWeight: 600,
    letterSpacing: displayTracking,
    color: light.foreground,
  } as CSSProperties,
  caption: {
    fontSize: 28,
    color: light.mutedForeground,
  } as CSSProperties,
  code: {
    fontFamily: MONO,
    fontSize: 27,
    lineHeight: 1.62,
  } as CSSProperties,
};

/**
 * One entrance for every block on the light scenes: a short rise out of a blur,
 * on the app's own `--ease-out`.
 */
export function Rise({
  at,
  frame,
  children,
  distance = 18,
  style,
}: {
  at: number;
  frame: number;
  children: ReactNode;
  distance?: number;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        opacity: interpolate(frame, [at, at + 16], [0, 1], clamp),
        translate: `0 ${interpolate(frame, [at, at + 22], [distance, 0], outEasing)}px`,
        filter: `blur(${interpolate(frame, [at, at + 14], [5, 0], clamp)}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** The step label and the headline, stacked the way `/connect` stacks them. */
export function SceneHead({
  step,
  heading,
  frame,
}: {
  step: string;
  heading: string;
  frame: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <Rise at={0} frame={frame}>
        <span style={t.step}>{step}</span>
      </Rise>
      <Rise at={6} frame={frame}>
        <span style={t.heading}>{heading}</span>
      </Rise>
    </div>
  );
}

/** The app's card: one border, one radius, the paper background. */
export function Card({
  children,
  width,
  style,
}: {
  children: ReactNode;
  width?: number;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        width,
        borderRadius: radius["2xl"],
        border: `1px solid ${light.border}`,
        background: light.card,
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** The window bar over a code panel, with the file name in mono. */
export function WindowBar({ file }: { file: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "18px 26px",
        borderBottom: `1px solid ${light.border}`,
        background: light.muted,
      }}
    >
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          style={{ width: 12, height: 12, borderRadius: 999, background: light.border }}
        />
      ))}
      <span
        style={{
          marginLeft: 12,
          fontFamily: MONO,
          fontSize: 21,
          color: light.mutedForeground,
        }}
      >
        {file}
      </span>
    </div>
  );
}
