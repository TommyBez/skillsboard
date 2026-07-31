import type { CSSProperties, ReactNode } from "react";
import { light, MONO, radius } from "../theme";

/** Shared type ramps, matching the app's Tailwind scale. */
export const type = {
  display: { fontSize: 24, fontWeight: 600, letterSpacing: "-0.035em" } as CSSProperties,
  body: { fontSize: 16, lineHeight: 1.625, color: light.mutedForeground } as CSSProperties,
  label: { fontSize: 14, fontWeight: 600 } as CSSProperties,
  meta: { fontSize: 12, fontFamily: MONO, color: light.mutedForeground } as CSSProperties,
};

export function Badge({ children, active = false }: { children: ReactNode; active?: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        minHeight: 24,
        padding: "2px 8px",
        borderRadius: radius.md,
        border: `1px solid ${active ? "transparent" : light.border}`,
        background: active ? light.primary : "transparent",
        color: active ? light.primaryForeground : light.foreground,
        fontFamily: MONO,
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "-0.01em",
      }}
    >
      {children}
    </span>
  );
}

export function Btn({
  children,
  variant = "default",
  press = 1,
  style,
}: {
  children: ReactNode;
  variant?: "default" | "outline";
  /** 1 = at rest, 0 = fully pressed; the app scales to 0.98 on `:active`. */
  press?: number;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        height: 40,
        padding: "0 16px",
        borderRadius: radius.xl,
        border: `1px solid ${variant === "outline" ? light.border : "transparent"}`,
        background: variant === "outline" ? light.card : light.primary,
        color: variant === "outline" ? light.foreground : light.primaryForeground,
        fontSize: 14,
        fontWeight: 600,
        scale: String(0.98 + 0.02 * press),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Checkbox({ checked, progress = 1 }: { checked: boolean; progress?: number }) {
  return (
    <span
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 16,
        height: 16,
        borderRadius: 4,
        border: `1px solid ${checked ? light.primary : light.input}`,
        background: checked ? light.primary : "transparent",
      }}
    >
      <svg width={11} height={11} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M20 6 9 17l-5-5"
          stroke={light.primaryForeground}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={checked ? 1 - progress : 1}
        />
      </svg>
    </span>
  );
}

export function InputBox({
  children,
  focused = false,
  width,
  style,
}: {
  children: ReactNode;
  focused?: boolean;
  width?: number;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        width,
        height: 44,
        padding: "0 14px",
        borderRadius: radius.xl,
        border: `1px solid ${focused ? light.primary : light.input}`,
        background: light.card,
        boxShadow: focused ? `0 0 0 3px ${light.primary}25` : undefined,
        fontSize: 14,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function BrandMark({ size = 32, color = light.primary }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M3 3h26v7H11v4h14l4 4v11H3v-7h18v-4H7l-4-4V3Z" fill={color} />
    </svg>
  );
}
