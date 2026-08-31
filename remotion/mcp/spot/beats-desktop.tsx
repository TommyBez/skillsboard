import { ArrowUpIcon, CheckIcon, WrenchIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { clamp } from "../../product-demo/stage";
import { light, MONO, SANS } from "../../product-demo/theme";
import { Land, snap, TypedLines } from "./kit";
import {
  agentRun,
  desktop,
  libraryHeading,
  promptLines,
  toolArgs,
  toolName,
} from "./spot-content";

/**
 * The one beat that shows the whole window.
 *
 * Every other beat in the spot is a fragment: one object lifted out of a client
 * and set at billboard size, which is how a spot buys legibility. That trade has
 * a cost, and the cost is that a viewer never sees where any of it happens. So
 * the middle of the film gives the window back, whole, for six and a half
 * seconds: the app the skill arrives in, the message a person actually sends,
 * the tool block the client draws when an MCP server answers, and the composer
 * at the bottom, which is the single element that makes a screenshot of this app
 * recognisable from across a room.
 *
 * It is the only place in the film that leaves the brand palette. A chat client
 * painted cream and green would be a mock of nothing; painted in its own warm
 * ivory and terracotta it is a place, and the cut back to cream afterwards is
 * what tells you the film is not the app.
 */

/** The app's own colours, which are not the brand's. */
const CLAUDE = {
  surface: "#F4F3EE",
  raised: "#FBFAF7",
  sunken: "#EFEDE4",
  composer: "#FFFFFF",
  ink: "#1F1E1D",
  muted: "#6E6B64",
  faint: "#8D8981",
  line: "#E3E0D6",
  bubble: "#E9E6DC",
  accent: "#D97757",
} as const;

/** The window, inset far enough that the cream reads as a desk. */
const WINDOW = { left: 108, top: 44, width: 1704, height: 992 } as const;
const TITLE_BAR = 78;
/** The conversation column, centred in the window the way the app centres it. */
const COLUMN = 1360;

const TRAFFIC = ["#FF5F57", "#FEBC2E", "#28C840"] as const;

/**
 * The sparkle in the title bar. Eight tapered rays out of one centre, which is
 * the shape the app puts next to its name.
 */
function ClaudeMark({ size = 34 }: { size?: number }) {
  return (
    <svg aria-hidden="true" fill="none" height={size} viewBox="0 0 32 32" width={size}>
      {Array.from({ length: 8 }, (_, index) => (
        <path
          d="M16 3.2c0.72 0 1.22 3.9 1.22 7.2 0 2.2-.5 3.4-1.22 3.4s-1.22-1.2-1.22-3.4c0-3.3.5-7.2 1.22-7.2Z"
          fill={CLAUDE.accent}
          key={`ray-${index * 45}`}
          transform={`rotate(${index * 45} 16 16)`}
        />
      ))}
    </svg>
  );
}

function TitleBar() {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexShrink: 0,
        alignItems: "center",
        height: TITLE_BAR,
        padding: "0 30px",
        borderBottom: `1px solid ${CLAUDE.line}`,
      }}
    >
      <div style={{ display: "flex", gap: 13 }}>
        {TRAFFIC.map((dot) => (
          <span
            key={dot}
            style={{ width: 17, height: 17, borderRadius: 999, background: dot }}
          />
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <ClaudeMark />
        <span
          style={{
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 32,
            letterSpacing: "-0.02em",
            color: CLAUDE.ink,
          }}
        >
          {desktop.app}
        </span>
      </div>
    </div>
  );
}

/** The pill the client puts around the server a tool belongs to. */
function Chip({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        padding: "7px 18px",
        borderRadius: 999,
        border: `1px solid ${CLAUDE.line}`,
        background: CLAUDE.sunken,
        fontFamily: MONO,
        fontSize: 24,
        color: CLAUDE.muted,
      }}
    >
      {children}
    </span>
  );
}

const row: CSSProperties = { display: "flex", alignItems: "center" };

/**
 * The tool block. Header with the tool, the server it came from and a state on
 * the right; the arguments under it in a sunken row; the result once the state
 * has flipped.
 */
function ToolCall({ done, spin }: { done: number; spin: number }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: "22px 28px 24px",
        borderRadius: 18,
        border: `1px solid ${CLAUDE.line}`,
        background: CLAUDE.raised,
      }}
    >
      <div style={{ ...row, gap: 16 }}>
        <WrenchIcon color={CLAUDE.accent} size={30} strokeWidth={2} />
        <span
          style={{
            fontFamily: MONO,
            fontWeight: 500,
            fontSize: 34,
            color: CLAUDE.ink,
          }}
        >
          {toolName}
        </span>
        <Chip>{agentRun.server}</Chip>

        <span style={{ ...row, gap: 10, marginLeft: "auto" }}>
          {done > 0 ? (
            <CheckIcon color={CLAUDE.accent} size={26} strokeWidth={3} />
          ) : (
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: 999,
                border: `3px solid ${CLAUDE.faint}`,
                borderTopColor: "transparent",
                rotate: `${spin * 13}deg`,
              }}
            />
          )}
          <span style={{ fontFamily: MONO, fontSize: 26, color: CLAUDE.muted }}>
            {done > 0 ? desktop.done : desktop.running}
          </span>
        </span>
      </div>

      <div
        style={{
          padding: "12px 22px",
          borderRadius: 12,
          background: CLAUDE.sunken,
          fontFamily: MONO,
          fontSize: 28,
          color: CLAUDE.muted,
        }}
      >
        {toolArgs}
      </div>

      <div style={{ ...row, gap: 20, opacity: done, height: 40 }}>
        <span
          style={{
            fontFamily: MONO,
            fontWeight: 500,
            fontSize: 30,
            color: CLAUDE.ink,
          }}
        >
          {agentRun.hit.title}
        </span>
        <span style={{ fontFamily: SANS, fontSize: 27, color: CLAUDE.faint }}>
          {libraryHeading}
        </span>
      </div>
    </div>
  );
}

/** Frames the three release note rows arrive on. */
const ROW_AT = [102, 112, 122] as const;

export function DesktopBeat() {
  const frame = useCurrentFrame();
  const done = interpolate(frame, [74, 82], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ background: light.background, fontFamily: SANS }}>
      <style>{"*, *::before, *::after { box-sizing: border-box; }"}</style>

      <div
        style={{
          position: "absolute",
          ...WINDOW,
          display: "flex",
          flexDirection: "column",
          borderRadius: 30,
          border: `1px solid ${CLAUDE.line}`,
          background: CLAUDE.surface,
          boxShadow:
            "0 44px 96px rgba(28, 24, 14, 0.14), 0 8px 22px rgba(28, 24, 14, 0.07)",
          overflow: "hidden",
        }}
      >
        <TitleBar />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "30px 0 0",
          }}
        >
          <div
            style={{
              width: COLUMN,
              display: "flex",
              flexDirection: "column",
              gap: 22,
            }}
          >
            <Land at={6} from={18} over={9} style={{ display: "flex" }}>
              <div style={{ marginLeft: "auto" }}>
                <div
                  style={{
                    width: 820,
                    padding: "24px 34px",
                    borderRadius: 24,
                    border: `1px solid ${CLAUDE.line}`,
                    background: CLAUDE.bubble,
                  }}
                >
                  <TypedLines
                    at={12}
                    caret={CLAUDE.accent}
                    frame={frame}
                    lines={promptLines}
                    perChar={0.58}
                    size={40}
                    style={{ fontFamily: SANS, color: CLAUDE.ink }}
                  />
                </div>
              </div>
            </Land>

            <Land at={54} from={22} over={9}>
              <ToolCall done={done} spin={frame} />
            </Land>

            <Land at={92} from={16} over={8}>
              <div
                style={{
                  fontFamily: MONO,
                  fontWeight: 500,
                  fontSize: 40,
                  color: CLAUDE.ink,
                }}
              >
                {agentRun.output.title}
              </div>
            </Land>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {agentRun.output.rows.map((line, index) => {
                const at = ROW_AT[index];
                const t = interpolate(frame, [at, at + 7], [0, 1], snap);

                return (
                  <div
                    key={line}
                    style={{
                      ...row,
                      gap: 18,
                      opacity: interpolate(frame, [at, at + 5], [0, 1], clamp),
                      translate: `${(1 - t) * -18}px 0`,
                    }}
                  >
                    <span
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: 999,
                        background: CLAUDE.faint,
                      }}
                    />
                    <span
                      style={{ fontFamily: MONO, fontSize: 32, color: CLAUDE.ink }}
                    >
                      {line}
                    </span>
                  </div>
                );
              })}
            </div>

            <Land at={136} from={12} over={8}>
              <div style={{ ...row, gap: 12 }}>
                <CheckIcon color={CLAUDE.accent} size={26} strokeWidth={3} />
                <span style={{ fontFamily: MONO, fontSize: 28, color: CLAUDE.muted }}>
                  {agentRun.output.done}
                </span>
              </div>
            </Land>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexShrink: 0,
            justifyContent: "center",
            padding: "0 0 34px",
          }}
        >
          <div
            style={{
              ...row,
              width: COLUMN,
              height: 104,
              paddingLeft: 34,
              paddingRight: 22,
              borderRadius: 28,
              border: `1px solid ${CLAUDE.line}`,
              background: CLAUDE.composer,
            }}
          >
            <span style={{ fontSize: 32, color: CLAUDE.faint }}>
              {desktop.placeholder}
            </span>
            <span
              style={{
                ...row,
                justifyContent: "center",
                marginLeft: "auto",
                width: 62,
                height: 62,
                borderRadius: 999,
                background: CLAUDE.accent,
              }}
            >
              <ArrowUpIcon color="#FFFFFF" size={30} strokeWidth={2.6} />
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}
