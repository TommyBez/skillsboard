import { interpolate } from "remotion";
import { outEasing } from "../../product-demo/stage";
import { light, MONO, radius } from "../../product-demo/theme";
import { setup, tools } from "../content";

/**
 * The tool list as a client prints it after the connection is approved. Names
 * are the ones registered in `app/api/[transport]/route.ts`; the badge marks
 * the four that need `skills:write`.
 */
export function ToolGrid({ frame, at, width = 1320 }: { frame: number; at: number; width?: number }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "12px 26px",
        width,
      }}
    >
      {tools.map((tool, index) => {
        const reveal = interpolate(
          frame,
          [at + index * 4, at + 18 + index * 4],
          [0, 1],
          outEasing,
        );

        return (
          <div
            key={tool.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 20px",
              borderRadius: radius.xl,
              border: `1px solid ${tool.write ? `${light.primary}4d` : light.border}`,
              background: light.card,
              opacity: reveal,
              translate: `0 ${(1 - reveal) * 10}px`,
            }}
          >
            <span
              style={{
                fontFamily: MONO,
                fontSize: 25,
                fontWeight: 500,
                color: light.foreground,
              }}
            >
              {tool.name}
            </span>
            {tool.write ? (
              <span
                style={{
                  marginLeft: "auto",
                  padding: "3px 12px",
                  borderRadius: radius.md,
                  background: light.primary,
                  color: light.primaryForeground,
                  fontFamily: MONO,
                  fontSize: 17,
                  fontWeight: 500,
                }}
              >
                {setup.tools.writeBadge}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
