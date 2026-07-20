import { loadFont } from "@remotion/fonts";
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
import {
  type TerminalLine,
  TerminalSimulator,
} from "@/components/remocn/terminal-simulator";

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
const SURFACE_INK = "#1b2620"; // --surface-ink
const SURFACE_INK_CHROME = "#243129";

// Frame budget (~20.6s @ 30fps): sequence durations minus transition overlaps.
export const HOOK = 135;
export const POSITIONING = 120;
export const PRODUCT = 185;
export const FEATURES = 125;
export const CTA = 120;
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

const TERMINAL_LINES: TerminalLine[] = [
  {
    text: "npx skills add coreyhaines31/marketingskills",
    type: "command",
    delay: 6,
  },
  { text: "Fetching latest source from GitHub...", type: "log", delay: 8 },
  { text: "✓ seo-audit installed for Claude Code", type: "success", delay: 10 },
  {
    text: "✓ Recommended by your team on Skills Board",
    type: "success",
    delay: 8,
    pause: 24,
  },
];

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
          fontSize={62}
          text="AI skills get lost in chats"
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

function PositioningScene() {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        background: CANVAS,
        gap: 30,
        justifyContent: "center",
      }}
    >
      <div
        style={{
          opacity: interpolate(frame, [0, 18], [0, 1], {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: `${interpolate(frame, [0, 18], [0.7, 1], {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}`,
        }}
      >
        <LogoMark size={84} />
      </div>
      <div style={{ height: 130, position: "relative", width: "100%" }}>
        <PerCharacterRise color={INK} fontSize={92} text="Skills Board" />
      </div>
      <Sequence from={30} layout="none" name="Positioning subline">
        <div style={{ height: 48, position: "relative", width: "100%" }}>
          <MicroScaleFade
            color={MUTED}
            fontSize={30}
            fontWeight={500}
            text="Your team's skills. All in one place."
          />
        </div>
      </Sequence>
    </AbsoluteFill>
  );
}

function ProductScene() {
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        background: CANVAS,
        justifyContent: "center",
        padding: 60,
      }}
    >
      <div style={{ height: 480, width: 960 }}>
        <TerminalSimulator
          background={SURFACE_INK}
          chromeColor={SURFACE_INK_CHROME}
          chunkSize={2}
          fontSize={20}
          lines={TERMINAL_LINES}
          title="~/acme — install a team skill"
        />
      </div>
    </AbsoluteFill>
  );
}

const FEATURES_LIST = [
  { label: "Save a skill once", sub: "From any GitHub repository" },
  { label: "Tag it for your team", sub: "Searchable by task and tag" },
  { label: "Install it anywhere", sub: "Claude, Codex, Cursor & more" },
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
  const enter = Easing.bezier(0.16, 1, 0.3, 1);

  return (
    <div
      style={{
        alignItems: "center",
        background: "#fdfdf8",
        border: "1px solid #d6d9cb",
        borderRadius: 13,
        boxShadow: "0 1px 2px rgba(23,35,27,0.08)",
        display: "flex",
        gap: 20,
        opacity: interpolate(frame, [startFrame, startFrame + 16], [0, 1], {
          easing: enter,
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        padding: "20px 26px",
        translate: `0 ${interpolate(
          frame,
          [startFrame, startFrame + 18],
          [26, 0],
          {
            easing: enter,
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
      <div style={{ height: 56, position: "relative", width: "100%" }}>
        <MicroScaleFade
          color={INK}
          fontSize={40}
          text="One library, every agent"
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
          text="Put your team's skills in one place"
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
          "--font-geist-mono": `'${MONO}', ui-monospace, monospace`,
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
    </AbsoluteFill>
  );
}
