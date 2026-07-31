import type { ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import type { CursorStyle } from "@/components/remocn/cursor";
import { easeOut, light, SANS } from "./theme";

/**
 * Scenes are choreographed against a reference length and time-mapped onto the
 * length they actually get, so the social and Product Hunt cuts share one set of
 * keyframes instead of two.
 */
export function useSceneFrame(referenceFrames: number, durationInFrames: number) {
  return useCurrentFrame() * (referenceFrames / durationInFrames);
}

export const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

export const outEasing = { ...clamp, easing: Easing.bezier(...easeOut) };

interface SceneProps {
  children: ReactNode;
  background?: string;
  /** Slow push or pull across the whole scene — presence, never enough to notice. */
  drift?: { from: number; to: number };
  durationInFrames?: number;
  /** Content is authored at app scale; the stage magnifies it to stay legible. */
  zoom?: number;
}

export function Scene({
  children,
  background = light.background,
  drift,
  durationInFrames = 1,
  zoom = 1,
}: SceneProps) {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background,
        fontFamily: SANS,
        color: light.foreground,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <style>{"*, *::before, *::after { box-sizing: border-box; }"}</style>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          scale: drift
            ? String(
                interpolate(frame, [0, durationInFrames], [drift.from, drift.to], clamp),
              )
            : undefined,
        }}
      >
        <div style={{ zoom }}>{children}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

/**
 * Drops the click ripple. The pointer landing on a control that reacts already
 * reads as a click; the expanding ring only adds noise.
 */
export function quiet(style: CursorStyle): CursorStyle {
  return { ...style, rippleOpacity: 0, rippleScale: 0 };
}
