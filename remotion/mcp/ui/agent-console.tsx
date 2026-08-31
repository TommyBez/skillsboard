import { CheckIcon, GitForkIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { interpolate } from "remotion";
import { clamp, outEasing } from "../../product-demo/stage";
import { displayTracking, light, MONO, radius } from "../../product-demo/theme";
import { agentRun } from "../content";

/**
 * The client window for the agent video, built on the same card the setup video
 * uses for `mcp.json`: one hairline border, a bar with three dots, and the paper
 * background. One session runs inside it from the first keystroke to the last
 * line, so the window is measured rather than laid out loosely: every block
 * declares its height, and the scene scrolls the column by the exact difference
 * between the content and the viewport.
 */
export const CONSOLE_WIDTH = 1400;
export const CONSOLE_VIEWPORT = 720;
export const STREAM_GAP = 22;
export const STREAM_PAD_TOP = 28;
export const STREAM_PAD_BOTTOM = 30;

export const BLOCK_HEIGHT = {
  prompt: 42,
  call: 42,
  hit: 250,
  note: 92,
  output: 240,
} as const;

const BODY_SIZE = 27;
/** Frames the caret spends on, then off, while nothing is being typed. */
const BLINK = 15;

/** How many characters of `text` have landed by `frame`. */
export function typedCount(text: string, frame: number, at: number, perChar: number) {
  return Math.floor(
    interpolate(frame, [at, at + text.length * perChar], [0, text.length], clamp),
  );
}

function Caret() {
  return (
    <span
      style={{
        display: "inline-block",
        width: 13,
        height: 28,
        marginLeft: 3,
        verticalAlign: "-5px",
        borderRadius: 2,
        background: light.primary,
      }}
    />
  );
}

/**
 * A caret is solid while the line it sits on is being typed and blinks when the
 * session is waiting, which is how a client renders it.
 */
function caretVisible(frame: number, typing: boolean) {
  return typing || Math.floor(frame / BLINK) % 2 === 0;
}

/** Text that lands one character at a time, with the caret riding the end. */
export function Typed({
  at,
  caret = false,
  frame,
  perChar,
  style,
  text,
}: {
  at: number;
  caret?: boolean;
  frame: number;
  perChar: number;
  style?: CSSProperties;
  text: string;
}) {
  const shown = typedCount(text, frame, at, perChar);
  const typing = frame >= at && shown < text.length;

  return (
    <span style={style}>
      {text.slice(0, shown)}
      {caret && caretVisible(frame, typing) ? <Caret /> : null}
    </span>
  );
}

/** One measured row of the session, so the scroll arithmetic stays exact. */
export function StreamBlock({
  children,
  height,
  style,
}: {
  children: ReactNode;
  height: number;
  style?: CSSProperties;
}) {
  return <div style={{ height, ...style }}>{children}</div>;
}

/** The bar names the connection the way a client does, endpoint included. */
function ConsoleBar() {
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
      <span style={{ marginLeft: 12, fontSize: 22, fontWeight: 600, color: light.foreground }}>
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
          color: light.mutedForeground,
        }}
      >
        <span style={{ width: 9, height: 9, borderRadius: 999, background: light.primary }} />
        <span style={{ color: light.foreground }}>{agentRun.server}</span>
        {agentRun.endpoint}
      </span>
    </div>
  );
}

/** The window itself. `scroll` moves the column, never the frame. */
export function Console({
  children,
  frame,
  scroll,
  width = CONSOLE_WIDTH,
}: {
  children: ReactNode;
  frame: number;
  scroll: number;
  width?: number;
}) {
  return (
    <div
      style={{
        width,
        borderRadius: radius["2xl"],
        border: `1px solid ${light.border}`,
        background: light.card,
        overflow: "hidden",
        opacity: interpolate(frame, [0, 16], [0, 1], clamp),
      }}
    >
      <ConsoleBar />
      <div style={{ height: CONSOLE_VIEWPORT, overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: STREAM_GAP,
            padding: `${STREAM_PAD_TOP}px 40px ${STREAM_PAD_BOTTOM}px`,
            translate: `0 ${-scroll}px`,
            fontFamily: MONO,
            fontSize: BODY_SIZE,
            lineHeight: 1.5,
            color: light.foreground,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/** The task, typed by the person at the keyboard. */
export function PromptRow({
  at,
  caret,
  frame,
  perChar,
}: {
  at: number;
  caret: boolean;
  frame: number;
  perChar: number;
}) {
  return (
    <StreamBlock height={BLOCK_HEIGHT.prompt}>
      <span style={{ color: light.primary }}>&gt;</span>{" "}
      <Typed
        at={at}
        caret={caret}
        frame={frame}
        perChar={perChar}
        style={{ color: light.foreground }}
        text={agentRun.prompt}
      />
    </StreamBlock>
  );
}

/** The call the agent types back, with the tool name lifted out of the arguments. */
export function CallRow({
  at,
  caret,
  frame,
  perChar,
}: {
  at: number;
  caret: boolean;
  frame: number;
  perChar: number;
}) {
  const call = agentRun.call;
  const shown = typedCount(call, frame, at, perChar);
  const typing = frame >= at && shown < call.length;
  const split = call.indexOf("(");
  const name = call.slice(0, Math.min(shown, split));
  const args = shown > split ? call.slice(split, shown) : "";

  return (
    <StreamBlock height={BLOCK_HEIGHT.call} style={{ opacity: frame >= at ? 1 : 0 }}>
      <span style={{ color: light.mutedForeground }}>
        {"· "}
        <span style={{ color: light.primary, fontWeight: 500 }}>{name}</span>
        {args}
        {caret && caretVisible(frame, typing) ? <Caret /> : null}
      </span>
    </StreamBlock>
  );
}

/** The one skill the search returns, with the source it was saved from. */
export function HitCard({ at, frame }: { at: number; frame: number }) {
  const { hit } = agentRun;
  const reveal = interpolate(frame, [at, at + 22], [0, 1], outEasing);

  return (
    <StreamBlock
      height={BLOCK_HEIGHT.hit}
      style={{ opacity: reveal, translate: `0 ${(1 - reveal) * 16}px` }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          height: "100%",
          padding: "24px 30px",
          borderRadius: radius.xl,
          border: `1px solid ${light.border}`,
          background: light.background,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 22,
            color: light.mutedForeground,
          }}
        >
          <GitForkIcon color={light.primary} size={20} />
          {hit.source}
        </div>
        <div
          style={{
            fontSize: 34,
            fontWeight: 500,
            letterSpacing: displayTracking,
            color: light.foreground,
          }}
        >
          {hit.title}
        </div>
        <div style={{ fontSize: 23, color: light.mutedForeground, lineHeight: 1.45 }}>
          {hit.description}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 2 }}>
          {hit.tags.map((tag) => (
            <span
              key={tag}
              style={{
                padding: "5px 14px",
                borderRadius: radius.md,
                border: `1px solid ${light.border}`,
                fontSize: 19,
                color: light.mutedForeground,
              }}
            >
              {tag}
            </span>
          ))}
          <span style={{ marginLeft: 10, fontSize: 21, color: light.mutedForeground }}>
            Saved by <span style={{ color: light.foreground }}>{hit.savedBy}</span> in {hit.team}
          </span>
        </div>
      </div>
    </StreamBlock>
  );
}

/** The teammate's note, quoted the way the library stores it. */
export function NoteRow({ at, frame }: { at: number; frame: number }) {
  const reveal = interpolate(frame, [at, at + 18], [0, 1], outEasing);

  return (
    <StreamBlock
      height={BLOCK_HEIGHT.note}
      style={{ opacity: reveal, translate: `0 ${(1 - reveal) * 12}px` }}
    >
      <div
        style={{
          paddingLeft: 24,
          borderLeft: `3px solid ${light.primary}`,
          color: light.foreground,
          fontSize: 26,
          lineHeight: 1.5,
        }}
      >
        {agentRun.note}
        <div style={{ marginTop: 6, fontSize: 21, color: light.mutedForeground }}>
          note from {agentRun.hit.savedBy}
        </div>
      </div>
    </StreamBlock>
  );
}

/** Offsets from the first output frame, so the scene can time its scroll. */
export const OUTPUT_STEPS = {
  title: 0,
  rows: [26, 57, 88],
  done: 126,
} as const;

/** What the agent hands back once it has followed the note. */
export function OutputBlock({
  at,
  frame,
  perChar,
}: {
  at: number;
  frame: number;
  perChar: number;
}) {
  const { output } = agentRun;
  const doneAt = at + OUTPUT_STEPS.done;

  return (
    <StreamBlock height={BLOCK_HEIGHT.output}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Typed
          at={at}
          caret={frame >= at && frame < at + OUTPUT_STEPS.rows[0]}
          frame={frame}
          perChar={2.5}
          style={{ color: light.primary, fontWeight: 500, fontSize: 30 }}
          text={output.title}
        />
        {output.rows.map((row, index) => {
          const rowAt = at + OUTPUT_STEPS.rows[index];
          const next = OUTPUT_STEPS.rows[index + 1] ?? OUTPUT_STEPS.done;

          return (
            <Typed
              at={rowAt}
              caret={frame >= rowAt && frame < at + next}
              frame={frame}
              key={row}
              perChar={perChar}
              style={{ color: light.foreground, fontSize: 26 }}
              text={row}
            />
          );
        })}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            marginTop: 8,
            color: light.primary,
            fontSize: 25,
            opacity: interpolate(frame, [doneAt, doneAt + 8], [0, 1], clamp),
          }}
        >
          <CheckIcon color={light.primary} size={24} strokeWidth={3} />
          <Typed
            at={doneAt}
            caret={frame >= doneAt}
            frame={frame}
            perChar={perChar}
            text={output.done}
          />
        </span>
      </div>
    </StreamBlock>
  );
}
