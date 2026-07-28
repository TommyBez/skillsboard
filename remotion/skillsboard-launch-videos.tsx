import { Video } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { DataFlowPipes } from "@/components/remocn/data-flow-pipes";
import { KineticCenterBuild } from "@/components/remocn/kinetic-center-build";
import { MONO, SANS } from "./fonts";

export const LAUNCH_FPS = 30;
export const PRODUCT_HUNT_DURATION = 60 * LAUNCH_FPS;
export const SOCIAL_DURATION = 31 * LAUNCH_FPS;

const COLORS = {
  accent: "#00843d",
  accentDark: "#07572e",
  canvas: "#f7f8f4",
  card: "#fdfdf8",
  border: "#d6d9cb",
  ink: "#17231b",
  muted: "#5e6b61",
  soft: "#e4ead9",
};

const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
const SOURCE = staticFile("launch/skills-board-workflow-source.mp4");

const seconds = (value: number) => Math.round(value * LAUNCH_FPS);

function LogoMark({ size = 46 }: { size?: number }) {
  return (
    <svg
      aria-label="Skills Board"
      fill="none"
      height={size}
      role="img"
      viewBox="0 0 32 32"
      width={size}
    >
      <path
        d="M3 3h26v7H11v4h14l4 4v11H3v-7h18v-4H7l-4-4V3Z"
        fill={COLORS.accent}
      />
    </svg>
  );
}

function BrandBackground({ children }: { children: React.ReactNode }) {
  return (
    <AbsoluteFill
      style={{
        background: COLORS.canvas,
        color: COLORS.ink,
        fontFamily: SANS,
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(23,35,27,.025) 1px, transparent 1px)",
          backgroundSize: "100% 90px",
          maskImage: "linear-gradient(to bottom, transparent, #000 20%, #000 80%, transparent)",
        }}
      />
      {children}
    </AbsoluteFill>
  );
}

function HookScene({ compact = false }: { compact?: boolean }) {
  const frame = useCurrentFrame();
  const subOpacity = interpolate(frame, [38, 58], [0, 1], {
    easing: EASE_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subY = interpolate(frame, [38, 58], [18, 0], {
    easing: EASE_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <BrandBackground>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          gap: 14,
          left: 64,
          position: "absolute",
          top: 52,
        }}
      >
        <LogoMark size={36} />
        <span
          style={{
            fontFamily: MONO,
            fontSize: 19,
            fontWeight: 500,
            letterSpacing: ".04em",
            textTransform: "uppercase",
          }}
        >
          Skills Board
        </span>
      </div>

      <div
        style={{
          inset: 0,
          position: "absolute",
          ["--font-geist-sans" as string]: `'${SANS}'`,
        }}
      >
        <KineticCenterBuild
          color={COLORS.ink}
          fontSize={compact ? 72 : 78}
          fontWeight={600}
          text="Which skill should I use?"
        />
      </div>

      <div
        style={{
          bottom: compact ? 205 : 190,
          color: COLORS.muted,
          fontSize: 30,
          fontWeight: 500,
          left: 0,
          opacity: subOpacity,
          position: "absolute",
          right: 0,
          textAlign: "center",
          transform: `translateY(${subY}px)`,
        }}
      >
        Answer it once. Keep the recommendation with the team.
      </div>
    </BrandBackground>
  );
}

type ProductShotKind =
  | "find-search"
  | "find-use"
  | "save-context"
  | "save-share"
  | "save-source";

const PRODUCT_SHOTS: Record<
  ProductShotKind,
  {
    detail: string;
    eyebrow: string;
    focus: string;
    number: string;
    panelSide: "left" | "right";
    scale: [number, number, number];
    title: string;
    x: [number, number, number];
    y: [number, number, number];
  }
> = {
  "save-source": {
    detail:
      "Paste a public repository or skill URL. Skills Board reads its valid SKILL.md.",
    eyebrow: "Save proof",
    focus: "Valid source attached",
    number: "01",
    panelSide: "left",
    scale: [1, 1.035, 1.06],
    title: "Start from the source.",
    x: [0, 0, 0],
    y: [0, 10, 0],
  },
  "save-context": {
    detail:
      "A team note, an example prompt, and tags travel with the skill.",
    eyebrow: "Save proof",
    focus: "Team context added",
    number: "02",
    panelSide: "left",
    scale: [1, 1.02, 1.03],
    title: "Add what your team knows.",
    x: [0, 0, 0],
    y: [22, 14, 4],
  },
  "save-share": {
    detail:
      "The public source, its metadata, and the team context stay together.",
    eyebrow: "Save proof",
    focus: "Saved to the team library",
    number: "03",
    panelSide: "left",
    scale: [1.03, 1.06, 1.04],
    title: "Make it available to the team.",
    x: [0, -20, -12],
    y: [0, -10, 0],
  },
  "find-search": {
    detail:
      "Sam searches the shared library and finds Alex's recommendation with its context intact.",
    eyebrow: "Find proof",
    focus: "Team recommendation found",
    number: "04",
    panelSide: "right",
    scale: [1, 1.04, 1.07],
    title: "Find the answer again.",
    x: [0, 35, 80],
    y: [0, 20, 55],
  },
  "find-use": {
    detail:
      "Copy a prompt or compatible command, open the source, or download the latest ZIP.",
    eyebrow: "Use proof",
    focus: "Compatible path copied",
    number: "05",
    panelSide: "right",
    scale: [1.04, 1.08, 1.09],
    title: "Use it the way that fits.",
    x: [60, 155, 220],
    y: [0, -20, -40],
  },
};

function ProductShot({
  durationInFrames,
  kind,
  playbackRate = 1,
  trimAfter,
  trimBefore,
}: {
  durationInFrames: number;
  kind: ProductShotKind;
  playbackRate?: number;
  trimAfter: number;
  trimBefore: number;
}) {
  const frame = useCurrentFrame();
  const shot = PRODUCT_SHOTS[kind];
  const progress = frame / Math.max(1, durationInFrames - 1);
  const scale = interpolate(progress, [0, 0.52, 1], shot.scale, {
    easing: EASE_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const x = interpolate(progress, [0, 0.52, 1], shot.x, {
    easing: EASE_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(progress, [0, 0.52, 1], shot.y, {
    easing: EASE_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const focusOpacity = interpolate(frame, [12, 24], [0, 1], {
    easing: EASE_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: COLORS.canvas,
        color: COLORS.ink,
        fontFamily: SANS,
        overflow: "hidden",
      }}
    >
      <Video
        muted
        objectFit="cover"
        playbackRate={playbackRate}
        src={SOURCE}
        style={{
          height: "100%",
          transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
          transformOrigin: "center",
          width: "100%",
        }}
        trimAfter={trimAfter}
        trimBefore={trimBefore}
      />

      <div
        style={{
          background:
            shot.panelSide === "left"
              ? `linear-gradient(90deg, ${COLORS.soft} 0%, ${COLORS.soft} 88%, transparent 100%)`
              : `linear-gradient(270deg, ${COLORS.soft} 0%, ${COLORS.soft} 88%, transparent 100%)`,
          bottom: 0,
          left: shot.panelSide === "left" ? 0 : undefined,
          padding: shot.panelSide === "left" ? "64px 70px 58px 54px" : "64px 54px 58px 70px",
          position: "absolute",
          right: shot.panelSide === "right" ? 0 : undefined,
          top: 0,
          width: 455,
          zIndex: 4,
        }}
      >
        <div style={{ alignItems: "center", display: "flex", gap: 10 }}>
          <LogoMark size={24} />
          <span
            style={{
              color: COLORS.muted,
              fontFamily: MONO,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Real product · {shot.eyebrow}
          </span>
        </div>
        <div
          style={{
            color: COLORS.accent,
            fontFamily: MONO,
            fontSize: 20,
            marginTop: 130,
          }}
        >
          {shot.number} / 05
        </div>
        <div
          style={{
            color: COLORS.ink,
            fontSize: 51,
            fontWeight: 600,
            letterSpacing: "-.035em",
            lineHeight: 1.02,
            marginTop: 22,
          }}
        >
          {shot.title}
        </div>
        <div
          style={{
            color: COLORS.muted,
            fontSize: 20,
            lineHeight: 1.45,
            marginTop: 24,
          }}
        >
          {shot.detail}
        </div>
        <div
          style={{
            background: "rgba(23,35,27,.14)",
            bottom: 58,
            height: 2,
            left: shot.panelSide === "left" ? 54 : 70,
            position: "absolute",
            right: shot.panelSide === "left" ? 70 : 54,
          }}
        >
          <div
            style={{
              background: COLORS.accent,
              height: "100%",
              width: `${Math.max(4, progress * 100)}%`,
            }}
          />
        </div>
      </div>

      <div
        style={{
          alignItems: "center",
          background: "rgba(253,253,248,.94)",
          border: `1px solid ${COLORS.border}`,
          borderRadius: 999,
          boxShadow: "0 12px 32px rgba(23,35,27,.14)",
          display: "flex",
          gap: 10,
          left: shot.panelSide === "right" ? 38 : undefined,
          opacity: focusOpacity,
          padding: "12px 17px",
          position: "absolute",
          right: shot.panelSide === "left" ? 38 : undefined,
          top: 34,
          zIndex: 3,
        }}
      >
        <span
          style={{
            background: COLORS.accent,
            borderRadius: 999,
            height: 9,
            width: 9,
          }}
        />
        <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 500 }}>
          {shot.focus}
        </span>
      </div>
    </AbsoluteFill>
  );
}

function SourceToContextScene({ compact = false }: { compact?: boolean }) {
  return (
    <BrandBackground>
      <div
        style={{
          color: COLORS.muted,
          fontFamily: MONO,
          fontSize: 15,
          left: 64,
          position: "absolute",
          top: 48,
        }}
      >
        THE SHARED-CONTEXT FLOW
      </div>
      <div
        style={{
          fontSize: compact ? 46 : 52,
          fontWeight: 600,
          left: 0,
          position: "absolute",
          right: 0,
          textAlign: "center",
          top: compact ? 92 : 82,
        }}
      >
        Public skill in. Team recommendation out.
      </div>
      <div
        style={{
          height: 720,
          left: 80,
          position: "absolute",
          top: 90,
          width: 1280,
        }}
      >
        <DataFlowPipes
          edges={[
            { from: "source", startFrame: 4, to: "metadata" },
            { from: "metadata", startFrame: 24, to: "context" },
            { from: "context", startFrame: 44, to: "library" },
          ]}
          nodeColor={COLORS.card}
          nodes={[
            { id: "source", label: "Public source", x: 130, y: 390 },
            { id: "metadata", label: "SKILL.md", x: 470, y: 390 },
            { id: "context", label: "Team context", x: 810, y: 390 },
            { id: "library", label: "Team library", x: 1150, y: 390 },
          ]}
          pipeColor="rgba(23,35,27,.18)"
          pulseColor="#27b967"
          pulseDuration={28}
          pulseLength={44}
          textColor={COLORS.ink}
        />
      </div>
    </BrandBackground>
  );
}

function LibraryValueScene() {
  const frame = useCurrentFrame();
  const cardY = interpolate(frame, [0, 24], [34, 0], {
    easing: EASE_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardScale = interpolate(frame, [0, seconds(6)], [1.015, 1.045], {
    easing: EASE_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <BrandBackground>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          left: 70,
          position: "absolute",
          top: 0,
          bottom: 0,
          width: 430,
        }}
      >
        <div
          style={{
            color: COLORS.accent,
            fontFamily: MONO,
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          THE TEAM LIBRARY
        </div>
        <div
          style={{
            fontSize: 58,
            fontWeight: 600,
            letterSpacing: "-.04em",
            lineHeight: 1.02,
            marginTop: 24,
          }}
        >
          The next teammate finds the same answer.
        </div>
        <div
          style={{
            color: COLORS.muted,
            fontSize: 21,
            lineHeight: 1.45,
            marginTop: 26,
          }}
        >
          Source, note, prompts, tags, and compatible usage paths stay visible
          together.
        </div>
      </div>

      <div
        style={{
          background: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 22,
          boxShadow: "0 26px 70px rgba(23,35,27,.15)",
          height: 610,
          overflow: "hidden",
          position: "absolute",
          right: 54,
          top: 145,
          transform: `translateY(${cardY}px)`,
          width: 830,
        }}
      >
        <Video
          muted
          objectFit="cover"
          playbackRate={0.72}
          src={SOURCE}
          style={{
            height: "100%",
            objectPosition: "left center",
            transform: `scale(${cardScale})`,
            transformOrigin: "left center",
            width: "100%",
          }}
          trimAfter={seconds(24.5)}
          trimBefore={seconds(20.2)}
        />
        <div
          style={{
            alignItems: "center",
            background: "rgba(253,253,248,.94)",
            borderRadius: 999,
            bottom: 20,
            display: "flex",
            fontFamily: MONO,
            fontSize: 14,
            gap: 9,
            left: 20,
            padding: "10px 14px",
            position: "absolute",
          }}
        >
          <span style={{ background: COLORS.accent, borderRadius: 99, height: 8, width: 8 }} />
          Real library view
        </div>
      </div>
    </BrandBackground>
  );
}

function MemoryStatementScene() {
  const frame = useCurrentFrame();
  const statementScale = interpolate(frame, [0, seconds(5)], [0.985, 1.015], {
    easing: EASE_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <BrandBackground>
      <div
        style={{
          color: COLORS.accent,
          fontFamily: MONO,
          fontSize: 16,
          left: 0,
          position: "absolute",
          right: 0,
          textAlign: "center",
          top: 92,
        }}
      >
        FROM INDIVIDUAL DISCOVERY TO TEAM CONTEXT
      </div>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          inset: 0,
          justifyContent: "center",
          padding: "0 150px",
          position: "absolute",
          textAlign: "center",
          transform: `scale(${statementScale})`,
          ["--font-geist-sans" as string]: `'${SANS}'`,
        }}
      >
        <div
          style={{
            color: COLORS.ink,
            fontFamily: SANS,
            fontSize: 58,
            fontWeight: 600,
            letterSpacing: "-.035em",
            lineHeight: 1.04,
          }}
        >
          One good recommendation stays with the team.
        </div>
      </div>
      <div
        style={{
          background: COLORS.accent,
          bottom: 112,
          height: 4,
          left: "calc(50% - 145px)",
          position: "absolute",
          width: 290,
        }}
      />
    </BrandBackground>
  );
}

function HandoffScene({ compact = false }: { compact?: boolean }) {
  return (
    <BrandBackground>
      <div
        style={{
          color: COLORS.accent,
          fontFamily: MONO,
          fontSize: 15,
          left: 0,
          position: "absolute",
          right: 0,
          textAlign: "center",
          top: 60,
        }}
      >
        SHARED TEAM CONTEXT
      </div>
      <div
        style={{
          fontSize: compact ? 48 : 56,
          fontWeight: 600,
          left: 0,
          position: "absolute",
          right: 0,
          textAlign: "center",
          top: 102,
        }}
      >
        Alex saves it. Sam can find it.
      </div>
      <div
        style={{
          height: 720,
          left: 80,
          position: "absolute",
          top: 90,
          width: 1280,
        }}
      >
        <DataFlowPipes
          edges={[
            { from: "alex", startFrame: 4, to: "skill" },
            { from: "skill", startFrame: 24, to: "library" },
            { from: "library", startFrame: 44, to: "sam" },
          ]}
          nodeColor={COLORS.card}
          nodes={[
            { id: "alex", label: "Alex", x: 130, y: 410 },
            { id: "skill", label: "copywriting", x: 470, y: 410 },
            { id: "library", label: "Team library", x: 810, y: 410 },
            { id: "sam", label: "Sam", x: 1150, y: 410 },
          ]}
          pipeColor="rgba(23,35,27,.18)"
          pulseColor="#27b967"
          pulseDuration={28}
          pulseLength={44}
          textColor={COLORS.ink}
        />
      </div>
    </BrandBackground>
  );
}

function UsageOptionsScene() {
  return (
    <BrandBackground>
      <div
        style={{
          color: COLORS.accent,
          fontFamily: MONO,
          fontSize: 15,
          left: 0,
          position: "absolute",
          right: 0,
          textAlign: "center",
          top: 54,
        }}
      >
        KEEP THE SOURCE VISIBLE
      </div>
      <div
        style={{
          fontSize: 54,
          fontWeight: 600,
          left: 0,
          position: "absolute",
          right: 0,
          textAlign: "center",
          top: 92,
        }}
      >
        One recommendation. Four compatible paths.
      </div>
      <div
        style={{
          height: 720,
          left: 80,
          position: "absolute",
          top: 100,
          width: 1280,
        }}
      >
        <DataFlowPipes
          edges={[
            { from: "skill", startFrame: 4, to: "source" },
            { from: "skill", startFrame: 22, to: "command" },
            { from: "skill", startFrame: 40, to: "zip" },
            { from: "skill", startFrame: 58, to: "mcp" },
          ]}
          nodeColor={COLORS.card}
          nodes={[
            { id: "skill", label: "Team skill", x: 210, y: 410 },
            { id: "source", label: "Source", x: 800, y: 220 },
            { id: "command", label: "Command", x: 1100, y: 340 },
            { id: "zip", label: "ZIP", x: 1100, y: 530 },
            { id: "mcp", label: "MCP", x: 800, y: 650 },
          ]}
          pipeColor="rgba(23,35,27,.18)"
          pulseColor="#27b967"
          pulseDuration={30}
          pulseLength={44}
          textColor={COLORS.ink}
        />
      </div>
      <div
        style={{
          bottom: 42,
          color: COLORS.muted,
          fontFamily: MONO,
          fontSize: 15,
          left: 0,
          position: "absolute",
          right: 0,
          textAlign: "center",
        }}
      >
        Review the original · copy when compatible · download latest · connect an authenticated agent
      </div>
    </BrandBackground>
  );
}

function CtaScene({ compact = false }: { compact?: boolean }) {
  const frame = useCurrentFrame();
  const ctaOpacity = interpolate(frame, [compact ? 18 : 28, compact ? 34 : 48], [0, 1], {
    easing: EASE_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ctaY = interpolate(frame, [compact ? 18 : 28, compact ? 34 : 48], [18, 0], {
    easing: EASE_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <BrandBackground>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          gap: compact ? 24 : 32,
          inset: 0,
          justifyContent: "center",
          position: "absolute",
          textAlign: "center",
        }}
      >
        <LogoMark size={compact ? 62 : 72} />
        <div style={{ fontSize: compact ? 55 : 67, fontWeight: 600 }}>
          Save once. Find fast. Use it your way.
        </div>
        <div
          style={{
            background: COLORS.accent,
            borderRadius: 999,
            color: "white",
            fontSize: compact ? 22 : 25,
            fontWeight: 600,
            opacity: ctaOpacity,
            padding: compact ? "15px 25px" : "18px 30px",
            transform: `translateY(${ctaY}px)`,
          }}
        >
          Create your team library
        </div>
        <div style={{ color: COLORS.muted, fontFamily: MONO, fontSize: 18 }}>
          skillsboard.sh
        </div>
      </div>
    </BrandBackground>
  );
}

export function SkillsboardLaunchProductHunt() {
  const saveSourceDuration = seconds(5.5);
  const saveContextDuration = seconds(5.5);
  const saveShareDuration = seconds(4.5);
  const findSearchDuration = seconds(5);
  const findUseDuration = seconds(4.5);

  return (
    <AbsoluteFill style={{ background: COLORS.canvas }}>
      <Sequence durationInFrames={seconds(4)}>
        <HookScene />
      </Sequence>
      <Sequence durationInFrames={seconds(4)} from={seconds(4)}>
        <SourceToContextScene />
      </Sequence>
      <Sequence durationInFrames={saveSourceDuration} from={seconds(8)}>
        <ProductShot
          durationInFrames={saveSourceDuration}
          kind="save-source"
          playbackRate={(seconds(8.6) - seconds(2)) / saveSourceDuration}
          trimAfter={seconds(8.6)}
          trimBefore={seconds(2)}
        />
      </Sequence>
      <Sequence durationInFrames={saveContextDuration} from={seconds(13.5)}>
        <ProductShot
          durationInFrames={saveContextDuration}
          kind="save-context"
          playbackRate={(seconds(14.47) - seconds(8.6)) / saveContextDuration}
          trimAfter={seconds(14.47)}
          trimBefore={seconds(8.6)}
        />
      </Sequence>
      <Sequence durationInFrames={saveShareDuration} from={seconds(19)}>
        <ProductShot
          durationInFrames={saveShareDuration}
          kind="save-share"
          playbackRate={(seconds(18.05) - seconds(14.47)) / saveShareDuration}
          trimAfter={seconds(18.05)}
          trimBefore={seconds(14.47)}
        />
      </Sequence>
      <Sequence durationInFrames={seconds(4)} from={seconds(23.5)}>
        <HandoffScene compact />
      </Sequence>
      <Sequence durationInFrames={findSearchDuration} from={seconds(27.5)}>
        <ProductShot
          durationInFrames={findSearchDuration}
          kind="find-search"
          playbackRate={(seconds(25.8) - seconds(20.2)) / findSearchDuration}
          trimAfter={seconds(25.8)}
          trimBefore={seconds(20.2)}
        />
      </Sequence>
      <Sequence durationInFrames={findUseDuration} from={seconds(32.5)}>
        <ProductShot
          durationInFrames={findUseDuration}
          kind="find-use"
          playbackRate={(seconds(29) - seconds(26.2)) / findUseDuration}
          trimAfter={seconds(29)}
          trimBefore={seconds(26.2)}
        />
      </Sequence>
      <Sequence durationInFrames={seconds(6)} from={seconds(37)}>
        <UsageOptionsScene />
      </Sequence>
      <Sequence durationInFrames={seconds(6)} from={seconds(43)}>
        <LibraryValueScene />
      </Sequence>
      <Sequence durationInFrames={seconds(5)} from={seconds(49)}>
        <MemoryStatementScene />
      </Sequence>
      <Sequence durationInFrames={seconds(6)} from={seconds(54)}>
        <CtaScene />
      </Sequence>
    </AbsoluteFill>
  );
}

export function SkillsboardLaunchSocial() {
  const saveSourceDuration = seconds(5);
  const saveContextDuration = seconds(4.5);
  const findSearchDuration = seconds(4.5);
  const findUseDuration = seconds(4);

  return (
    <AbsoluteFill style={{ background: COLORS.canvas }}>
      <Sequence durationInFrames={seconds(3)}>
        <HookScene compact />
      </Sequence>
      <Sequence durationInFrames={seconds(3)} from={seconds(3)}>
        <SourceToContextScene compact />
      </Sequence>
      <Sequence durationInFrames={saveSourceDuration} from={seconds(6)}>
        <ProductShot
          durationInFrames={saveSourceDuration}
          kind="save-source"
          playbackRate={(seconds(8.6) - seconds(2)) / saveSourceDuration}
          trimAfter={seconds(8.6)}
          trimBefore={seconds(2)}
        />
      </Sequence>
      <Sequence durationInFrames={saveContextDuration} from={seconds(11)}>
        <ProductShot
          durationInFrames={saveContextDuration}
          kind="save-context"
          playbackRate={(seconds(14.47) - seconds(8.6)) / saveContextDuration}
          trimAfter={seconds(14.47)}
          trimBefore={seconds(8.6)}
        />
      </Sequence>
      <Sequence durationInFrames={seconds(3)} from={seconds(15.5)}>
        <HandoffScene compact />
      </Sequence>
      <Sequence durationInFrames={findSearchDuration} from={seconds(18.5)}>
        <ProductShot
          durationInFrames={findSearchDuration}
          kind="find-search"
          playbackRate={(seconds(25.8) - seconds(20.2)) / findSearchDuration}
          trimAfter={seconds(25.8)}
          trimBefore={seconds(20.2)}
        />
      </Sequence>
      <Sequence durationInFrames={findUseDuration} from={seconds(23)}>
        <ProductShot
          durationInFrames={findUseDuration}
          kind="find-use"
          playbackRate={(seconds(29) - seconds(26.2)) / findUseDuration}
          trimAfter={seconds(29)}
          trimBefore={seconds(26.2)}
        />
      </Sequence>
      <Sequence durationInFrames={seconds(4)} from={seconds(27)}>
        <CtaScene compact />
      </Sequence>
    </AbsoluteFill>
  );
}
