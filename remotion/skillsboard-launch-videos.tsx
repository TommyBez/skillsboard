import { Video } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { KineticCenterBuild } from "@/components/remocn/kinetic-center-build";
import { MicroScaleFade } from "@/components/remocn/micro-scale-fade";
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
        background: `radial-gradient(circle at 18% 12%, rgba(0,132,61,.13), transparent 34%), radial-gradient(circle at 86% 88%, rgba(108,145,86,.16), transparent 38%), ${COLORS.canvas}`,
        color: COLORS.ink,
        fontFamily: SANS,
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(23,35,27,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(23,35,27,.035) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,.45), transparent 78%)",
        }}
      />
      {children}
    </AbsoluteFill>
  );
}

function SceneFade({ children }: { children: React.ReactNode }) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12], [0, 1], {
    easing: EASE_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
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

function ProductWindow({
  label,
  playbackRate = 1,
  trimAfter,
  trimBefore,
}: {
  label: string;
  playbackRate?: number;
  trimAfter: number;
  trimBefore: number;
}) {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 18], [0.985, 1], {
    easing: EASE_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: COLORS.canvas,
        color: COLORS.ink,
        fontFamily: SANS,
      }}
    >
      <div
        style={{
          alignItems: "center",
          display: "flex",
          gap: 10,
          left: 42,
          position: "absolute",
          top: 10,
          zIndex: 3,
        }}
      >
        <LogoMark size={22} />
        <span
          style={{
            color: COLORS.muted,
            fontFamily: MONO,
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: ".035em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      </div>

      <div
        style={{
          background: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 18,
          bottom: 28,
          boxShadow: "0 24px 70px rgba(23,35,27,.16)",
          left: 32,
          opacity,
          overflow: "hidden",
          position: "absolute",
          right: 32,
          top: 38,
          transform: `scale(${scale})`,
        }}
      >
        <Video
          muted
          objectFit="cover"
          playbackRate={playbackRate}
          src={SOURCE}
          style={{ height: "100%", width: "100%" }}
          trimAfter={trimAfter}
          trimBefore={trimBefore}
        />
      </div>
    </AbsoluteFill>
  );
}

function PreviewScene() {
  return (
    <AbsoluteFill style={{ background: COLORS.canvas }}>
      <Sequence durationInFrames={seconds(6.5)}>
        <ProductWindow
          label="Alex saves a public skill"
          playbackRate={1.08}
          trimAfter={seconds(9)}
          trimBefore={seconds(2)}
        />
      </Sequence>
      <Sequence from={seconds(6.5)}>
        <ProductWindow
          label="Sam finds the team recommendation"
          playbackRate={1.08}
          trimAfter={seconds(26.57)}
          trimBefore={seconds(19.55)}
        />
      </Sequence>
    </AbsoluteFill>
  );
}

function ChapterScene() {
  const frame = useCurrentFrame();
  const lineWidth = interpolate(frame, [18, 50], [0, 310], {
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
          inset: 0,
          justifyContent: "center",
          position: "absolute",
        }}
      >
        <div style={{ height: 180, position: "relative", width: 1120 }}>
          <div
            style={{
              color: COLORS.accent,
              fontFamily: MONO,
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: ".09em",
              textAlign: "center",
              textTransform: "uppercase",
            }}
          >
            The complete workflow
          </div>
          <div
            style={{
              inset: 0,
              position: "absolute",
              ["--font-geist-sans" as string]: `'${SANS}'`,
            }}
          >
            <MicroScaleFade
              color={COLORS.ink}
              fontSize={58}
              fontWeight={600}
              text="Save → share → find → use"
            />
          </div>
          <div
            style={{
              background: COLORS.accent,
              bottom: -4,
              height: 4,
              left: `calc(50% - ${lineWidth / 2}px)`,
              position: "absolute",
              width: lineWidth,
            }}
          />
        </div>
      </div>
    </BrandBackground>
  );
}

function HandoffScene({ compact = false }: { compact?: boolean }) {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [10, compact ? 44 : 68], [0, 1], {
    easing: EASE_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const samScale = interpolate(frame, [compact ? 34 : 52, compact ? 54 : 76], [0.86, 1], {
    easing: EASE_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const avatar = (name: string, initial: string, accent: boolean) => (
    <div style={{ alignItems: "center", display: "flex", flexDirection: "column", gap: 18 }}>
      <div
        style={{
          alignItems: "center",
          background: accent ? COLORS.accent : COLORS.soft,
          border: `1px solid ${accent ? COLORS.accent : COLORS.border}`,
          borderRadius: 999,
          color: accent ? "white" : COLORS.accentDark,
          display: "flex",
          fontSize: 48,
          fontWeight: 700,
          height: 110,
          justifyContent: "center",
          transform: name === "Sam" ? `scale(${samScale})` : undefined,
          width: 110,
        }}
      >
        {initial}
      </div>
      <span style={{ fontFamily: MONO, fontSize: 20, fontWeight: 500 }}>{name}</span>
    </div>
  );

  return (
    <BrandBackground>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          gap: compact ? 44 : 60,
          inset: 0,
          justifyContent: "center",
          position: "absolute",
        }}
      >
        <div style={{ fontSize: compact ? 50 : 58, fontWeight: 600 }}>
          One recommendation. Shared team context.
        </div>
        <div style={{ alignItems: "center", display: "flex", gap: 42 }}>
          {avatar("Alex", "A", true)}
          <div style={{ height: 70, position: "relative", width: 470 }}>
            <div
              style={{
                background: COLORS.border,
                height: 3,
                left: 0,
                position: "absolute",
                right: 0,
                top: 34,
              }}
            />
            <div
              style={{
                background: COLORS.accent,
                height: 3,
                left: 0,
                position: "absolute",
                top: 34,
                width: `${progress * 100}%`,
              }}
            />
            <div
              style={{
                background: COLORS.card,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 999,
                boxShadow: "0 10px 30px rgba(23,35,27,.12)",
                color: COLORS.accentDark,
                fontFamily: MONO,
                fontSize: 16,
                fontWeight: 500,
                left: `${progress * 100}%`,
                padding: "12px 18px",
                position: "absolute",
                top: 12,
                transform: "translateX(-50%)",
                whiteSpace: "nowrap",
              }}
            >
              copywriting
            </div>
          </div>
          {avatar("Sam", "S", false)}
        </div>
      </div>
    </BrandBackground>
  );
}

const USAGE_PATHS = [
  ["Source", "Review the original"],
  ["Command", "Copy when compatible"],
  ["ZIP", "Download latest files"],
  ["MCP", "Connect an authenticated agent"],
] as const;

function UsageOptionsScene() {
  const frame = useCurrentFrame();

  return (
    <BrandBackground>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 54,
          inset: 0,
          justifyContent: "center",
          padding: "0 90px",
          position: "absolute",
        }}
      >
        <div>
          <div
            style={{
              color: COLORS.accent,
              fontFamily: MONO,
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: ".08em",
              marginBottom: 14,
              textTransform: "uppercase",
            }}
          >
            Keep the source visible
          </div>
          <div style={{ fontSize: 57, fontWeight: 600 }}>
            Use the recommendation in the way that fits.
          </div>
        </div>

        <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(4, 1fr)" }}>
          {USAGE_PATHS.map(([title, detail], index) => {
            const local = frame - index * 8;
            const opacity = interpolate(local, [0, 18], [0, 1], {
              easing: EASE_OUT,
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const y = interpolate(local, [0, 18], [24, 0], {
              easing: EASE_OUT,
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            return (
              <div
                key={title}
                style={{
                  background: COLORS.card,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 18,
                  boxShadow: "0 14px 35px rgba(23,35,27,.08)",
                  minHeight: 180,
                  opacity,
                  padding: 26,
                  transform: `translateY(${y}px)`,
                }}
              >
                <div
                  style={{
                    alignItems: "center",
                    background: COLORS.soft,
                    borderRadius: 10,
                    color: COLORS.accentDark,
                    display: "flex",
                    fontFamily: MONO,
                    fontSize: 16,
                    height: 42,
                    justifyContent: "center",
                    marginBottom: 22,
                    width: 76,
                  }}
                >
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>{title}</div>
                <div style={{ color: COLORS.muted, fontSize: 19, lineHeight: 1.35 }}>{detail}</div>
              </div>
            );
          })}
        </div>
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
      <SceneFade>
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
      </SceneFade>
    </BrandBackground>
  );
}

export function SkillsboardLaunchProductHunt() {
  return (
    <AbsoluteFill style={{ background: COLORS.canvas }}>
      <Sequence durationInFrames={seconds(4)}>
        <HookScene />
      </Sequence>
      <Sequence durationInFrames={seconds(13)} from={seconds(4)}>
        <PreviewScene />
      </Sequence>
      <Sequence durationInFrames={seconds(3.567)} from={seconds(17)}>
        <ChapterScene />
      </Sequence>
      <Sequence durationInFrames={seconds(16.05)} from={seconds(20.567)}>
        <ProductWindow
          label="Alex saves a public skill with team context"
          trimAfter={seconds(18.05)}
          trimBefore={seconds(2)}
        />
      </Sequence>
      <Sequence durationInFrames={seconds(1.5)} from={seconds(36.617)}>
        <ProductWindow
          label="The recommendation reaches the team library"
          trimAfter={seconds(19.55)}
          trimBefore={seconds(18.05)}
        />
      </Sequence>
      <Sequence durationInFrames={seconds(1.883)} from={seconds(38.117)}>
        <HandoffScene compact />
      </Sequence>
      <Sequence durationInFrames={seconds(9.45)} from={seconds(40)}>
        <ProductWindow
          label="Sam finds it and chooses how to use it"
          trimAfter={seconds(29)}
          trimBefore={seconds(19.55)}
        />
      </Sequence>
      <Sequence durationInFrames={seconds(5.05)} from={seconds(49.45)}>
        <UsageOptionsScene />
      </Sequence>
      <Sequence durationInFrames={seconds(5.5)} from={seconds(54.5)}>
        <CtaScene />
      </Sequence>
    </AbsoluteFill>
  );
}

export function SkillsboardLaunchSocial() {
  const addSourceDuration = seconds(18.05) - seconds(2);
  const addOutputDuration = seconds(15);
  const findSourceDuration = seconds(29) - seconds(19.55);
  const findOutputDuration = seconds(9);

  return (
    <AbsoluteFill style={{ background: COLORS.canvas }}>
      <Sequence durationInFrames={seconds(2.5)}>
        <HookScene compact />
      </Sequence>
      <Sequence durationInFrames={addOutputDuration} from={seconds(2.5)}>
        <ProductWindow
          label="Alex saves a public skill with team context"
          playbackRate={addSourceDuration / addOutputDuration}
          trimAfter={seconds(18.05)}
          trimBefore={seconds(2)}
        />
      </Sequence>
      <Sequence durationInFrames={seconds(2.5)} from={seconds(17.5)}>
        <HandoffScene compact />
      </Sequence>
      <Sequence durationInFrames={findOutputDuration} from={seconds(20)}>
        <ProductWindow
          label="Sam finds it and copies a compatible path"
          playbackRate={findSourceDuration / findOutputDuration}
          trimAfter={seconds(29)}
          trimBefore={seconds(19.55)}
        />
      </Sequence>
      <Sequence durationInFrames={seconds(2)} from={seconds(29)}>
        <CtaScene compact />
      </Sequence>
    </AbsoluteFill>
  );
}
