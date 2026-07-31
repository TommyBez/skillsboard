/**
 * Design tokens for the product demo, resolved from `app/globals.css`.
 *
 * The app stores them as oklch() custom properties; Remotion renders without the
 * Tailwind layer, so they are pinned here as hex. Keep both in sync when the app
 * palette moves.
 */

export const light = {
  background: "#f5f4ec",
  foreground: "#0b140f",
  card: "#fdfdf8",
  primary: "#00752a",
  primaryForeground: "#fbfaf4",
  muted: "#e7e7de",
  mutedForeground: "#4c5951",
  accent: "#c8e3ca",
  accentForeground: "#043512",
  border: "#cccbbe",
  input: "#c6c5b6",
} as const;

export const ink = {
  background: "#0f1a14",
  foreground: "#efefe8",
  card: "#16211a",
  primary: "#5dbd6f",
  border: "#303b34",
  mutedForeground: "#9d9c8f",
} as const;

export const SANS = "Bricolage Grotesque";
export const MONO = "Geist Mono";

/** `--radius: 0.8rem` and the derived steps from the `@theme inline` block. */
export const radius = {
  sm: 7,
  md: 10,
  lg: 13,
  xl: 16,
  "2xl": 20,
} as const;

/** `--tracking-display` on display type. */
export const displayTracking = "-0.04em";

/** Entrances: the app's `--ease-out`, expressed for `Easing.bezier`. */
export const easeOut = [0.23, 1, 0.32, 1] as const;
/** Small controls only — a little overshoot on press, check, and copy. */
export const easeBack = [0.34, 1.56, 0.64, 1] as const;

export const CANVAS = { width: 1440, height: 900 } as const;
