import { CheckIcon, LockIcon } from "lucide-react";
import { interpolate } from "remotion";
import { clamp, outEasing } from "../../product-demo/stage";
import { displayTracking, light, MONO, radius } from "../../product-demo/theme";
import { BrandMark, Btn } from "../../product-demo/ui/atoms";
import { setup } from "../content";
import { Card } from "./chrome";

const { consent } = setup;

/**
 * The authorization screen, drawn from the app's own tokens. The two scopes are
 * the ones the MCP route checks: `skills:read` gates the connection,
 * `skills:write` gates the four write tools.
 */
export function ConsentCard({
  frame,
  at,
  pressAt,
  width = 1000,
}: {
  frame: number;
  at: number;
  pressAt: number;
  width?: number;
}) {
  const press = interpolate(frame, [pressAt, pressAt + 8], [1, 0], clamp);
  const granted = interpolate(frame, [pressAt + 10, pressAt + 26], [0, 1], outEasing);

  return (
    <Card width={width}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "24px 40px",
          borderBottom: `1px solid ${light.border}`,
        }}
      >
        <BrandMark size={34} />
        <span style={{ fontSize: 28, fontWeight: 600, letterSpacing: displayTracking }}>
          Skills Board
        </span>
        <span
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontFamily: MONO,
            fontSize: 19,
            color: light.mutedForeground,
          }}
        >
          <LockIcon size={17} color={light.mutedForeground} />
          {consent.footer}
        </span>
      </div>

      <div style={{ padding: "36px 40px 40px" }}>
        <div
          style={{
            fontSize: 34,
            fontWeight: 600,
            letterSpacing: displayTracking,
            opacity: interpolate(frame, [at, at + 14], [0, 1], clamp),
          }}
        >
          {consent.title}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 28 }}>
          {consent.scopes.map((scope, index) => {
            const reveal = interpolate(
              frame,
              [at + 12 + index * 10, at + 30 + index * 10],
              [0, 1],
              outEasing,
            );

            return (
              <div
                key={scope.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  padding: "20px 24px",
                  borderRadius: radius.xl,
                  border: `1px solid ${light.border}`,
                  background: light.background,
                  opacity: reveal,
                  translate: `0 ${(1 - reveal) * 12}px`,
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 30,
                    height: 30,
                    borderRadius: 999,
                    background: light.accent,
                  }}
                >
                  <CheckIcon size={19} color={light.accentForeground} strokeWidth={3} />
                </span>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 24,
                    fontWeight: 500,
                    color: light.foreground,
                    width: 210,
                  }}
                >
                  {scope.name}
                </span>
                <span style={{ fontSize: 24, color: light.mutedForeground }}>{scope.detail}</span>
              </div>
            );
          })}
        </div>

        <div style={{ position: "relative", height: 64, marginTop: 32 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              opacity: 1 - granted,
            }}
          >
            <Btn
              press={press}
              style={{ height: 62, padding: "0 40px", fontSize: 25, borderRadius: radius["2xl"] }}
            >
              {consent.approve}
            </Btn>
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              gap: 14,
              opacity: granted,
              translate: `0 ${(1 - granted) * 10}px`,
              color: light.primary,
              fontSize: 26,
              fontWeight: 600,
            }}
          >
            <CheckIcon size={26} color={light.primary} strokeWidth={3} />
            {consent.granted}
          </div>
        </div>
      </div>
    </Card>
  );
}
