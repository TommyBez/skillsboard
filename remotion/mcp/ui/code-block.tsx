import { interpolate } from "remotion";
import { clamp, outEasing } from "../../product-demo/stage";
import { light, radius } from "../../product-demo/theme";
import { configLines } from "../content";
import { Card, t, WindowBar } from "./chrome";

/**
 * `"key": value` is the only shape in this file, so one split colours the whole
 * block without a tokenizer: the key takes the foreground, the value takes the
 * primary, and the braces stay muted.
 */
const PAIR = /^(\s*)("[^"]*")(:\s*)(.*)$/;

function JsonLine({ line }: { line: string }) {
  const parts = PAIR.exec(line);

  if (!parts) {
    return <span style={{ color: light.mutedForeground }}>{line}</span>;
  }

  const [, indent, key, colon, value] = parts;

  return (
    <>
      <span>{indent}</span>
      <span style={{ color: light.foreground, fontWeight: 500 }}>{key}</span>
      <span style={{ color: light.mutedForeground }}>{colon}</span>
      <span style={{ color: light.primary }}>{value}</span>
    </>
  );
}

const LINE_HEIGHT = Math.round(27 * 1.62);

/**
 * The config as an editor shows it. Lines cascade in two frames apart, which
 * reads as a paste landing rather than as something typed by hand, and the
 * endpoint line takes a highlight once the block has settled.
 */
export function ConfigBlock({
  frame,
  at,
  highlightAt,
  highlightLine,
  width = 1440,
}: {
  frame: number;
  at: number;
  highlightAt: number;
  highlightLine: number;
  width?: number;
}) {
  const highlight = interpolate(frame, [highlightAt, highlightAt + 14], [0, 1], outEasing);

  return (
    <Card width={width}>
      <WindowBar file="mcp.json" />
      <div style={{ position: "relative", padding: "30px 34px" }}>
        <div
          style={{
            position: "absolute",
            left: 20,
            right: 20,
            top: 30 + highlightLine * LINE_HEIGHT - 4,
            height: LINE_HEIGHT + 8,
            borderRadius: radius.md,
            background: `${light.primary}14`,
            boxShadow: `inset 0 0 0 1px ${light.primary}3d`,
            opacity: highlight,
            scale: `${0.985 + 0.015 * highlight} 1`,
          }}
        />
        <div style={{ position: "relative", ...t.code, whiteSpace: "pre" }}>
          {configLines.map((line, index) => (
            <div
              key={line}
              style={{
                opacity: interpolate(frame, [at + index * 2, at + 12 + index * 2], [0, 1], clamp),
                translate: `0 ${interpolate(
                  frame,
                  [at + index * 2, at + 16 + index * 2],
                  [10, 0],
                  outEasing,
                )}px`,
              }}
            >
              <JsonLine line={line} />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
