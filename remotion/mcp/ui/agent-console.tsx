import { CheckIcon, GitForkIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { interpolate } from "remotion";
import { clamp, outEasing } from "../../product-demo/stage";
import { displayTracking, ink, MONO, radius } from "../../product-demo/theme";
import { agentRun } from "../content";

export const CONSOLE_WIDTH = 1400;

/** Rows arrive on the same rise the light scenes use, one step darker. */
export function Row({
  at,
  frame,
  children,
  style,
}: {
  at: number;
  frame: number;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const reveal = interpolate(frame, [at, at + 16], [0, 1], outEasing);

  return (
    <div style={{ opacity: reveal, translate: `0 ${(1 - reveal) * 10}px`, ...style }}>
      {children}
    </div>
  );
}

/**
 * The client window. The header names the connection the way a client does:
 * the server key from the config and the endpoint it points at.
 */
export function Console({
  children,
  frame,
  width = CONSOLE_WIDTH,
}: {
  children: ReactNode;
  frame: number;
  width?: number;
}) {
  return (
    <div
      style={{
        width,
        borderRadius: radius["2xl"],
        border: `1px solid ${ink.border}`,
        background: ink.card,
        overflow: "hidden",
        opacity: interpolate(frame, [0, 14], [0, 1], clamp),
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "22px 34px",
          borderBottom: `1px solid ${ink.border}`,
          background: ink.background,
        }}
      >
        <span style={{ fontSize: 24, fontWeight: 600, color: ink.foreground }}>
          {agentRun.client}
        </span>
        <span
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontFamily: MONO,
            fontSize: 20,
            color: ink.mutedForeground,
          }}
        >
          <span
            style={{ width: 10, height: 10, borderRadius: 999, background: ink.primary }}
          />
          {agentRun.server}
          <span style={{ opacity: 0.6 }}>{agentRun.endpoint}</span>
        </span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 22,
          padding: "34px 40px 40px",
          fontFamily: MONO,
          fontSize: 28,
          lineHeight: 1.5,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function PromptRow({ at, frame }: { at: number; frame: number }) {
  return (
    <Row at={at} frame={frame}>
      <span style={{ color: ink.foreground }}>
        <span style={{ color: ink.primary }}>&gt;</span> {agentRun.prompt}
      </span>
    </Row>
  );
}

/** The call, with the tool name lifted out of the arguments. */
export function CallRow({ at, frame, call }: { at: number; frame: number; call: string }) {
  const split = call.indexOf("(");
  const name = split === -1 ? call : call.slice(0, split);
  const args = split === -1 ? "" : call.slice(split);

  return (
    <Row at={at} frame={frame}>
      <span style={{ color: ink.mutedForeground }}>
        {"· "}
        <span style={{ color: ink.primary, fontWeight: 500 }}>{name}</span>
        {args}
      </span>
    </Row>
  );
}

/** The one skill the search returns, with the source it was saved from. */
export function HitCard({ at, frame }: { at: number; frame: number }) {
  const { hit } = agentRun;

  return (
    <Row at={at} frame={frame}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          padding: "26px 30px",
          borderRadius: radius.xl,
          border: `1px solid ${ink.border}`,
          background: ink.background,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 22,
            color: ink.mutedForeground,
          }}
        >
          <GitForkIcon size={20} color={ink.primary} />
          {hit.source}
        </div>
        <div
          style={{
            fontSize: 36,
            fontWeight: 500,
            letterSpacing: displayTracking,
            color: ink.foreground,
          }}
        >
          {hit.title}
        </div>
        <div style={{ fontSize: 24, color: ink.mutedForeground, lineHeight: 1.45 }}>
          {hit.description}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
          {hit.tags.map((tag) => (
            <span
              key={tag}
              style={{
                padding: "5px 14px",
                borderRadius: radius.md,
                border: `1px solid ${ink.border}`,
                fontSize: 19,
                color: ink.mutedForeground,
              }}
            >
              {tag}
            </span>
          ))}
          <span style={{ marginLeft: 10, fontSize: 21, color: ink.mutedForeground }}>
            Saved by{" "}
            <span style={{ color: ink.foreground }}>{hit.savedBy}</span> in {hit.team}
          </span>
        </div>
      </div>
    </Row>
  );
}

/** The teammate's note, quoted the way the library stores it. */
export function NoteRow({ at, frame }: { at: number; frame: number }) {
  return (
    <Row at={at} frame={frame}>
      <div
        style={{
          paddingLeft: 24,
          borderLeft: `3px solid ${ink.primary}`,
          color: ink.foreground,
          fontSize: 27,
          lineHeight: 1.5,
        }}
      >
        {agentRun.note}
        <div style={{ marginTop: 8, fontSize: 21, color: ink.mutedForeground }}>
          note from {agentRun.hit.savedBy}
        </div>
      </div>
    </Row>
  );
}

/** What the agent hands back once it has followed the note. */
export function OutputBlock({ at, frame }: { at: number; frame: number }) {
  const { output } = agentRun;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Row at={at} frame={frame}>
        <span style={{ color: ink.primary, fontWeight: 500, fontSize: 30 }}>{output.title}</span>
      </Row>
      {output.rows.map((row, index) => (
        <Row at={at + 14 + index * 12} frame={frame} key={row}>
          <span style={{ color: ink.foreground, fontSize: 27 }}>{row}</span>
        </Row>
      ))}
      <Row at={at + 14 + output.rows.length * 12 + 10} frame={frame} style={{ marginTop: 10 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            color: ink.primary,
            fontSize: 25,
          }}
        >
          <CheckIcon size={24} color={ink.primary} strokeWidth={3} />
          {output.done}
        </span>
      </Row>
    </div>
  );
}
