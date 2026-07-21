import { loadFont } from "@remotion/fonts";
import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { focusPull } from "@/components/remocn/focus-pull";
import { KineticCenterBuild } from "@/components/remocn/kinetic-center-build";
import { MicroScaleFade } from "@/components/remocn/micro-scale-fade";
import { PerCharacterRise } from "@/components/remocn/per-character-rise";
import { pushThrough } from "@/components/remocn/push-through";
import { ShaderMeshGradient } from "@/components/remocn/shader-mesh-gradient";
import { SimulatedCursor } from "@/components/remocn/simulated-cursor";

const SANS = "Bricolage Grotesque";
const MONO = "Geist Mono";

for (const weight of ["400", "500", "600", "700"]) {
  loadFont({
    family: SANS,
    url: staticFile(`fonts/bricolage-grotesque-latin-${weight}-normal.woff2`),
    weight,
  });
}
for (const weight of ["400", "500"]) {
  loadFont({
    family: MONO,
    url: staticFile(`fonts/geist-mono-latin-${weight}-normal.woff2`),
    weight,
  });
}

// Skills Board design tokens (app/globals.css, light theme).
const CANVAS = "#f7f8f4"; // --background
const INK = "#17231b"; // --foreground
const MUTED = "#5e6b61"; // --muted-foreground
const ACCENT = "#00843d"; // --primary
const CARD = "#fdfdf8"; // --card
const BORDER = "#d6d9cb"; // --border
const CHIP = "#e4ead9"; // --accent (soft green chip)
const CHIP_TEXT = "#2c4a35"; // --accent-foreground

const MONO_STACK = `'${MONO}', ui-monospace, monospace`;

// Frame budget (~21.8s @ 30fps): sequence durations minus transition overlaps.
export const HOOK = 100;
export const POSITIONING = 110;
export const PRODUCT = 290;
export const FEATURES = 105;
export const CTA = 115;
const T_FADE = 15;
const T_PUSH = 18;
const T_FOCUS = 18;

export const PROMO_DURATION =
  HOOK +
  POSITIONING +
  PRODUCT +
  FEATURES +
  CTA -
  (T_FADE + T_PUSH + T_FOCUS + T_FADE);

const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);

// Global frame where the product scene starts (transitions overlap scenes).
const PRODUCT_START = HOOK - T_FADE + POSITIONING - T_PUSH;

function LogoMark({ size }: { size: number }) {
  return (
    <svg
      fill="none"
      height={size}
      role="img"
      style={{ display: "block" }}
      viewBox="0 0 32 32"
      width={size}
    >
      <title>Skills Board</title>
      <path d="M3 3h26v7H11v4h14l4 4v11H3v-7h18v-4H7l-4-4V3Z" fill={ACCENT} />
    </svg>
  );
}

function HookScene() {
  return (
    <AbsoluteFill>
      <ShaderMeshGradient
        colors={["#f7f8f4", "#eef1e9", "#dce8dd", "#c9e0cf"]}
        speed={0.5}
      />
      <AbsoluteFill
        style={{ alignItems: "center", justifyContent: "center", padding: 80 }}
      >
        <KineticCenterBuild
          color={INK}
          fontSize={64}
          text="“Which skill should I use?”"
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

const SUBLINE_WORDS = [
  { accent: false, text: "Your" },
  { accent: false, text: "team’s" },
  { accent: false, text: "skills." },
  { accent: true, text: "All" },
  { accent: true, text: "in" },
  { accent: true, text: "one" },
  { accent: true, text: "place." },
];

function PositioningScene() {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        background: CANVAS,
        gap: 28,
        justifyContent: "center",
      }}
    >
      <div
        style={{
          opacity: interpolate(frame, [0, 18], [0, 1], {
            easing: EASE_OUT,
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: `${interpolate(frame, [0, 18], [0.7, 1], {
            easing: EASE_OUT,
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}`,
        }}
      >
        <LogoMark size={80} />
      </div>
      <div style={{ height: 122, position: "relative", width: "100%" }}>
        <PerCharacterRise color={INK} fontSize={88} text="Skills Board" />
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 32,
          fontWeight: 600,
          gap: 10,
        }}
      >
        {SUBLINE_WORDS.map((word, i) => {
          const start = 32 + i * 4;
          const ease = Easing.bezier(0.4, 0, 0.2, 1);
          return (
            <span
              key={`${word.text}-${i}`}
              style={{
                color: word.accent ? ACCENT : INK,
                display: "inline-block",
                filter: `blur(${interpolate(frame, [start, start + 24], [5, 0], {
                  easing: ease,
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })}px)`,
                opacity: interpolate(frame, [start, start + 26], [0, 1], {
                  easing: ease,
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
                translate: `0 ${interpolate(
                  frame,
                  [start, start + 28],
                  [8, 0],
                  {
                    easing: ease,
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  },
                )}px`,
              }}
            >
              {word.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------------------
// Product reveal — a faithful sim of the Library view (app/(app)/library).
// Timeline (local frames):
//   0–30   window + header enter
//   12–48  dossier cards stagger in
//   70–130 cursor reaches search, types "review"
//   ~112   library filters down to code-review
//   ~154   cursor clicks "Copy" on the install command → Copied + toast
// ---------------------------------------------------------------------------

const WINDOW_X = 90;
const WINDOW_Y = 56;
const WINDOW_W = 1100;
const WINDOW_H = 608;

const DOSSIERS = [
  {
    installShort: "npx skills add acme/engineering-skills…",
    match: true,
    name: "code-review",
    source: "acme/engineering-skills",
    tags: ["review", "ci"],
  },
  {
    installShort: "npx skills add acme/brand-kit…",
    match: false,
    name: "brand-voice",
    source: "acme/brand-kit",
    tags: ["writing", "brand"],
  },
  {
    installShort: "npx skills add drizzle-team/skills…",
    match: false,
    name: "sql-migrations",
    source: "drizzle-team/skills",
    tags: ["database"],
  },
  {
    installShort: "npx skills add vercel/skills…",
    match: false,
    name: "release-notes",
    source: "vercel/skills",
    tags: ["shipping", "docs"],
  },
];

const SEARCH_QUERY = "review";
const TYPE_START = 100;
const TYPE_END = 128;
const FILTER_AT = 136;
const CLICK_AT = 174;
const TOAST_AT = 188;

function NavPill({ active, label }: { active?: boolean; label: string }) {
  return (
    <div
      style={{
        background: active ? CHIP : "transparent",
        borderRadius: 8,
        color: active ? CHIP_TEXT : MUTED,
        fontSize: 13,
        fontWeight: 500,
        padding: "5px 12px",
      }}
    >
      {label}
    </div>
  );
}

function DossierCard({
  dossier,
  frame,
  index,
}: {
  dossier: (typeof DOSSIERS)[number];
  frame: number;
  index: number;
}) {
  const startFrame = 12 + index * 9;
  const dimmed = frame >= FILTER_AT && !dossier.match;
  const highlighted = frame >= FILTER_AT && dossier.match;
  const copied = frame >= CLICK_AT + 4 && dossier.match;

  const enterOpacity = interpolate(
    frame,
    [startFrame, startFrame + 16],
    [0, 1],
    { easing: EASE_OUT, extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const filterOpacity = dimmed
    ? interpolate(frame, [FILTER_AT, FILTER_AT + 14], [1, 0.14], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  return (
    <div
      style={{
        background: CARD,
        border: `1px solid ${highlighted ? ACCENT : BORDER}`,
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        opacity: enterOpacity * filterOpacity,
        padding: "14px 16px 12px",
        translate: `0 ${interpolate(
          frame,
          [startFrame, startFrame + 18],
          [18, 0],
          {
            easing: EASE_OUT,
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        )}px`,
      }}
    >
      <div
        style={{
          alignItems: "center",
          color: MUTED,
          display: "flex",
          fontFamily: MONO_STACK,
          fontSize: 11.5,
          gap: 6,
        }}
      >
        <span style={{ color: ACCENT, fontWeight: 600 }}>
          #{String(index + 1).padStart(2, "0")}
        </span>
        <span>⑂ {dossier.source}</span>
      </div>
      <div
        style={{
          color: INK,
          fontSize: 21,
          fontWeight: 600,
          letterSpacing: "-0.035em",
        }}
      >
        {dossier.name}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {dossier.tags.map((tag) => (
          <span
            key={tag}
            style={{
              background: CHIP,
              borderRadius: 6,
              color: CHIP_TEXT,
              fontSize: 11.5,
              fontWeight: 500,
              padding: "2px 8px",
            }}
          >
            {tag}
          </span>
        ))}
      </div>
      <div
        style={{
          alignItems: "center",
          background: "#f4f5ee",
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          display: "flex",
          gap: 8,
          justifyContent: "space-between",
          marginTop: 2,
          padding: "6px 8px 6px 10px",
        }}
      >
        <span
          style={{
            color: MUTED,
            fontFamily: MONO_STACK,
            fontSize: 11.5,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {dossier.installShort}
        </span>
        <span
          style={{
            background: copied ? ACCENT : "#ffffff",
            border: `1px solid ${copied ? ACCENT : BORDER}`,
            borderRadius: 6,
            color: copied ? "#ffffff" : INK,
            flexShrink: 0,
            fontSize: 11.5,
            fontWeight: 600,
            padding: "3px 10px",
          }}
        >
          {copied ? "Copied ✓" : "Copy"}
        </span>
      </div>
    </div>
  );
}

function ProductScene() {
  const frame = useCurrentFrame();

  const typedChars = Math.round(
    interpolate(frame, [TYPE_START, TYPE_END], [0, SEARCH_QUERY.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const typed = SEARCH_QUERY.slice(0, typedChars);
  const searchFocused = frame >= TYPE_START - 6;
  const caretVisible = searchFocused && Math.floor(frame / 15) % 2 === 0;

  return (
    <AbsoluteFill style={{ background: CANVAS }}>
      <div
        style={{
          background: CARD,
          border: `1px solid ${BORDER}`,
          borderRadius: 16,
          boxShadow: "0 18px 50px rgba(23,35,27,0.13)",
          height: WINDOW_H,
          left: WINDOW_X,
          opacity: interpolate(frame, [0, 16], [0, 1], {
            easing: EASE_OUT,
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          overflow: "hidden",
          position: "absolute",
          top: WINDOW_Y,
          translate: `0 ${interpolate(frame, [0, 20], [26, 0], {
            easing: EASE_OUT,
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}px`,
          width: WINDOW_W,
        }}
      >
        {/* App header */}
        <div
          style={{
            alignItems: "center",
            borderBottom: `1px solid ${BORDER}`,
            display: "flex",
            gap: 14,
            height: 56,
            padding: "0 20px",
          }}
        >
          <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
            <LogoMark size={22} />
            <span style={{ color: INK, fontSize: 16, fontWeight: 600 }}>
              Skills Board
            </span>
          </div>
          <div
            style={{
              border: `1px solid ${BORDER}`,
              borderRadius: 10,
              display: "flex",
              gap: 2,
              padding: 3,
            }}
          >
            <NavPill active label="Library" />
            <NavPill label="Find skills" />
            <NavPill label="Connect agent" />
          </div>
          <div
            style={{
              alignItems: "center",
              display: "flex",
              gap: 8,
              marginLeft: "auto",
            }}
          >
            <span
              style={{
                alignItems: "center",
                background: CHIP,
                borderRadius: 6,
                color: CHIP_TEXT,
                display: "flex",
                fontFamily: MONO_STACK,
                fontSize: 11,
                fontWeight: 600,
                height: 24,
                justifyContent: "center",
                width: 24,
              }}
            >
              A
            </span>
            <span style={{ color: INK, fontSize: 13, fontWeight: 500 }}>
              Acme
            </span>
          </div>
        </div>

        {/* Library content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            padding: "18px 24px 20px",
          }}
        >
          <div
            style={{
              alignItems: "baseline",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                color: INK,
                fontSize: 24,
                fontWeight: 600,
                letterSpacing: "-0.035em",
              }}
            >
              Team library
            </span>
            <span
              style={{ color: MUTED, fontFamily: MONO_STACK, fontSize: 12.5 }}
            >
              {frame >= FILTER_AT ? "1 of 4 skills" : "4 team skills · 7 tags"}
            </span>
          </div>

          {/* Search */}
          <div
            style={{
              alignItems: "center",
              background: "#ffffff",
              border: `1.5px solid ${searchFocused ? ACCENT : BORDER}`,
              borderRadius: 10,
              display: "flex",
              gap: 10,
              height: 42,
              padding: "0 14px",
            }}
          >
            <svg fill="none" height="15" viewBox="0 0 24 24" width="15">
              <circle cx="11" cy="11" r="7" stroke={MUTED} strokeWidth="2" />
              <path
                d="M20 20l-3.5-3.5"
                stroke={MUTED}
                strokeLinecap="round"
                strokeWidth="2"
              />
            </svg>
            {typed ? (
              <span style={{ color: INK, fontSize: 14.5, fontWeight: 500 }}>
                {typed}
              </span>
            ) : (
              <span style={{ color: MUTED, fontSize: 14.5 }}>
                Search by task, repo, or tag…
              </span>
            )}
            {caretVisible ? (
              <span
                style={{
                  background: INK,
                  height: 18,
                  marginLeft: typed ? -6 : -8,
                  width: 1.5,
                }}
              />
            ) : null}
          </div>

          {/* Dossier grid */}
          <div
            style={{
              display: "grid",
              gap: 14,
              gridTemplateColumns: "1fr 1fr",
            }}
          >
            {DOSSIERS.map((dossier, i) => (
              <DossierCard
                dossier={dossier}
                frame={frame}
                index={i}
                key={dossier.name}
              />
            ))}
          </div>
        </div>

        {/* Toast */}
        <div
          style={{
            alignItems: "center",
            background: INK,
            borderRadius: 10,
            bottom: 18,
            boxShadow: "0 8px 24px rgba(23,35,27,0.25)",
            color: "#f2f3eb",
            display: "flex",
            fontSize: 13,
            fontWeight: 500,
            gap: 8,
            opacity: interpolate(frame, [TOAST_AT, TOAST_AT + 12], [0, 1], {
              easing: EASE_OUT,
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            padding: "10px 16px",
            position: "absolute",
            right: 18,
            translate: `0 ${interpolate(
              frame,
              [TOAST_AT, TOAST_AT + 12],
              [16, 0],
              {
                easing: EASE_OUT,
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            )}px`,
          }}
        >
          <span style={{ color: "#6bd58f", fontWeight: 700 }}>✓</span>
          Install command copied — ready for your agent
        </div>
      </div>

      {/* Cursor overlay (frame coordinates). The first leg is a zero-length
          travel so the initial hold doesn't swallow the real first move. */}
      <SimulatedCursor
        color={INK}
        points={[
          { hold: 0, x: 840, y: 600 },
          { hold: 46, x: 840, y: 600 },
          { hold: 56, x: 420, y: 196 },
          { click: true, hold: 130, x: 580, y: 348 },
        ]}
        size={22}
      />
    </AbsoluteFill>
  );
}

const FEATURES_LIST = [
  { label: "Save a skill once", sub: "One shared, searchable library" },
  { label: "Search by task, repo, or tag", sub: "Everyone knows where to look" },
  { label: "Use it with any agent", sub: "Claude, Codex, Cursor & more" },
];

function FeatureCard({
  label,
  startFrame,
  sub,
}: {
  label: string;
  startFrame: number;
  sub: string;
}) {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        alignItems: "center",
        background: CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: 13,
        boxShadow: "0 1px 2px rgba(23,35,27,0.08)",
        display: "flex",
        gap: 20,
        opacity: interpolate(frame, [startFrame, startFrame + 16], [0, 1], {
          easing: EASE_OUT,
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        padding: "20px 26px",
        translate: `0 ${interpolate(
          frame,
          [startFrame, startFrame + 18],
          [26, 0],
          {
            easing: EASE_OUT,
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        )}px`,
        width: 620,
      }}
    >
      <div
        style={{
          alignItems: "center",
          background: ACCENT,
          borderRadius: 999,
          display: "flex",
          height: 44,
          justifyContent: "center",
          scale: `${interpolate(
            frame,
            [startFrame + 8, startFrame + 20],
            [0, 1],
            {
              easing: Easing.bezier(0.34, 1.56, 0.64, 1),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          )}`,
          width: 44,
        }}
      >
        <svg fill="none" height="22" viewBox="0 0 24 24" width="22">
          <path
            d="M5 12.5l4.5 4.5L19 7"
            stroke="#fff"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
          />
        </svg>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <div style={{ color: INK, fontSize: 27, fontWeight: 600 }}>{label}</div>
        <div style={{ color: MUTED, fontSize: 18, fontWeight: 400 }}>{sub}</div>
      </div>
    </div>
  );
}

function FeaturesScene() {
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        background: CANVAS,
        gap: 40,
        justifyContent: "center",
      }}
    >
      <div style={{ height: 60, position: "relative", width: "100%" }}>
        <MicroScaleFade
          color={INK}
          fontSize={40}
          text="Answer it once, for the whole team"
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {FEATURES_LIST.map((feature, i) => (
          <FeatureCard
            key={feature.label}
            label={feature.label}
            startFrame={10 + i * 22}
            sub={feature.sub}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
}

function CtaScene() {
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        background: CANVAS,
        gap: 28,
        justifyContent: "center",
      }}
    >
      <div style={{ height: 66, position: "relative", width: "100%" }}>
        <MicroScaleFade
          color={INK}
          fontSize={44}
          text="Create your team library"
        />
      </div>
      <Sequence from={22} layout="none" name="CTA domain">
        <div style={{ height: 88, position: "relative", width: "100%" }}>
          <PerCharacterRise
            color={ACCENT}
            fontSize={58}
            fontWeight={700}
            text="skillsboard.sh"
          />
        </div>
      </Sequence>
    </AbsoluteFill>
  );
}

export function SkillsboardPromo() {
  return (
    <AbsoluteFill
      style={
        {
          "--font-geist-mono": MONO_STACK,
          "--font-geist-sans": `'${SANS}', ui-sans-serif, sans-serif`,
          background: CANVAS,
          fontFamily: `'${SANS}', ui-sans-serif, sans-serif`,
        } as React.CSSProperties
      }
    >
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={HOOK}>
          <HookScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T_FADE })}
        />

        <TransitionSeries.Sequence durationInFrames={POSITIONING}>
          <PositioningScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={pushThrough()}
          timing={linearTiming({ durationInFrames: T_PUSH })}
        />

        <TransitionSeries.Sequence durationInFrames={PRODUCT}>
          <ProductScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={focusPull()}
          timing={linearTiming({ durationInFrames: T_FOCUS })}
        />

        <TransitionSeries.Sequence durationInFrames={FEATURES}>
          <FeaturesScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T_FADE })}
        />

        <TransitionSeries.Sequence durationInFrames={CTA}>
          <CtaScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* Background music — "Fresh Focus" (FreePD, CC0 / public domain),
          gentle fade in and a longer fade out into the CTA hold. */}
      <Audio
        name="Music"
        src={staticFile("music/fresh-focus.mp3")}
        volume={(f) =>
          interpolate(
            f,
            [0, 24, PROMO_DURATION - 70, PROMO_DURATION - 4],
            [0, 0.38, 0.38, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          )
        }
      />
    </AbsoluteFill>
  );
}
