import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { displayTracking, light, MONO, radius, SANS } from "../../product-demo/theme";
import { BrandMark } from "../../product-demo/ui/atoms";
import { Beat, display, Kicker, Land, RAIL, snap, SPOT } from "./kit";
import {
  agentRun,
  applyLines,
  brand,
  endpointHeading,
  hookLines,
  noteLines,
  reachLines,
  skillFileName,
} from "./spot-content";

/**
 * The six beats that are pure type.
 *
 * These are the posters between the fragments: one sentence, set as large as
 * the frame allows, on the same paper and the same rail as everything else.
 * They land in a third of a second and then do not move again, because the cut
 * is what carries the rhythm from here on.
 */

/** The job, before any mention of the product. */
export function HookBeat() {
  return (
    <Beat>
      {hookLines.map((line, index) => (
        <Land
          at={index * 6}
          key={line.map((segment) => segment.text).join("")}
          over={11}
        >
          <div style={{ ...display, fontSize: 104 }}>
            {line.map((segment) => (
              <span
                key={segment.text}
                style={{ color: segment.accent ? light.primary : light.foreground }}
              >
                {segment.text}
              </span>
            ))}
          </div>
        </Land>
      ))}
    </Beat>
  );
}

/** The instructions inside the skill file, at the size of what they decide. */
export function NoteBeat() {
  const frame = useCurrentFrame();
  const rule = interpolate(frame, [0, 9], [0, 1], snap);

  return (
    <Beat gap={34}>
      <Kicker at={0}>SKILL.md</Kicker>
      <div style={{ display: "flex", gap: 40 }}>
        <div
          style={{
            width: 10,
            borderRadius: 5,
            background: light.primary,
            transformOrigin: "top center",
            scale: `1 ${rule}`,
          }}
        />
        <div>
          <Land at={3} over={9}>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 44,
                fontWeight: 700,
                color: light.primary,
                marginBottom: 22,
              }}
            >
              {skillFileName}
            </div>
          </Land>
          {noteLines.map((line, index) => (
            <Land at={5 + index * 6} key={line} over={11}>
              <div style={{ ...display, fontSize: 80, fontWeight: 500 }}>{line}</div>
            </Land>
          ))}
          <Land at={26} from={12} over={9}>
            <div
              style={{
                marginTop: 26,
                fontFamily: MONO,
                fontSize: 30,
                color: light.mutedForeground,
              }}
            >
              written by {agentRun.hit.savedBy}
            </div>
          </Land>
        </div>
      </div>
    </Beat>
  );
}

/** What the run just proved, in the product's own words. */
export function ApplyBeat() {
  const [first, second] = applyLines;
  const rest = first.slice(brand.wordmark.length);

  return (
    <Beat>
      <Land at={0} over={11}>
        <div style={{ ...display, fontSize: 74 }}>
          <span style={{ color: light.primary }}>{brand.wordmark}</span>
          {rest}
        </div>
      </Land>
      <Land at={6} over={11}>
        <div style={{ ...display, fontSize: 74 }}>{second}</div>
      </Land>
    </Beat>
  );
}

/** The same skill, from anywhere that speaks the protocol. */
export function ReachBeat() {
  const frame = useCurrentFrame();

  return (
    <Beat gap={62}>
      <div>
        {reachLines.map((line, index) => (
          <Land at={index * 6} key={line} over={11}>
            <div style={{ ...display, fontSize: 92 }}>{line}</div>
          </Land>
        ))}
      </div>

      <div style={{ display: "flex", gap: 20 }}>
        {agentRun.reach.clients.map((client, index) => {
          const at = 30 + index * 6;
          const t = interpolate(frame, [at, at + 8], [0, 1], snap);

          return (
            <span
              key={client}
              style={{
                padding: "18px 38px",
                borderRadius: radius["2xl"],
                border: `1px solid ${light.border}`,
                background: light.card,
                fontSize: 38,
                opacity: t,
                scale: String(0.9 + 0.1 * t),
              }}
            >
              {client}
            </span>
          );
        })}
      </div>
    </Beat>
  );
}

/**
 * The product, which is a URL. The one inverted frame in the spot: a plate of
 * brand green wipes across the lower half and the endpoint sits on it in paper
 * white, big enough to read off a phone at arm's length.
 */
export function EndpointBeat() {
  const frame = useCurrentFrame();
  const heading = interpolate(frame, [0, 10], [0, 1], snap);
  const plate = interpolate(frame, [4, 14], [0, 1], snap);
  const url = interpolate(frame, [13, 22], [0, 1], snap);

  return (
    <AbsoluteFill style={{ background: light.background, fontFamily: SANS }}>
      <style>{"*, *::before, *::after { box-sizing: border-box; }"}</style>

      <div
        style={{
          position: "absolute",
          left: RAIL,
          top: 268,
          ...display,
          fontSize: 54,
          opacity: heading,
          translate: `0 ${(1 - heading) * 20}px`,
        }}
      >
        {endpointHeading}
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          top: 420,
          width: SPOT.width,
          height: 460,
          background: light.primary,
          clipPath: `inset(0 ${(1 - plate) * 100}% 0 0)`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: SPOT.width,
            height: 460,
            paddingLeft: RAIL,
          }}
        >
          <span
            style={{
              fontFamily: MONO,
              fontSize: 92,
              color: light.primaryForeground,
              opacity: url,
              translate: `${(1 - url) * -18}px 0`,
            }}
          >
            {agentRun.endpoint}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
}

/** The close: mark, category, domain, licence. */
export function EndCardBeat() {
  return (
    <Beat align="center" gap={28}>
      <Land at={0} over={11}>
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <BrandMark size={86} />
          <span style={{ ...display, fontSize: 88 }}>{brand.wordmark}</span>
        </div>
      </Land>

      <Land at={8} from={16} over={10}>
        <div style={{ fontSize: 44 }}>{brand.category}</div>
      </Land>

      <Land at={18} from={14} over={10}>
        <div
          style={{
            marginTop: 14,
            fontFamily: MONO,
            fontSize: 46,
            color: light.primary,
          }}
        >
          {brand.domain}
        </div>
      </Land>

      <Land at={28} from={12} over={10}>
        <div style={{ fontSize: 34, color: light.mutedForeground }}>{brand.licence}</div>
      </Land>
    </Beat>
  );
}
