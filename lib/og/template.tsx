import { readFile } from "node:fs/promises"
import { join } from "node:path"

import { ImageResponse } from "next/og"

export const OG_SIZE = { width: 1200, height: 630 } as const
export const TWITTER_SIZE = { width: 1200, height: 675 } as const

export interface OgTitleLine {
  text: string
  accent?: boolean
}

export interface OgTemplateContent {
  eyebrow: string
  title: readonly OgTitleLine[]
  description: string
  /** Mono label in the top-right corner, e.g. "skillsboard.sh/guides". */
  contextLabel?: string
  /** Pill badges on the bottom-left, e.g. supported agents. */
  chips?: readonly string[]
  /** Mono note on the bottom-right. */
  footnote?: string
  /** "paper" is the light marketing look, "ink" the dark editorial one. */
  variant?: "paper" | "ink"
  /** Override the headline font size for long titles. */
  titleSize?: number
}

interface OgTheme {
  background: string
  ink: string
  muted: string
  border: string
  accent: string
  accentSoft: string
  watermark: string
}

const themes: Record<"paper" | "ink", OgTheme> = {
  paper: {
    background: "#f6f5ef",
    ink: "#1b241e",
    muted: "#5d6960",
    border: "#d7d5c6",
    accent: "#00843d",
    accentSoft: "rgba(0, 132, 61, 0.08)",
    watermark: "rgba(0, 132, 61, 0.06)",
  },
  ink: {
    background: "#161f19",
    ink: "#f2f1e9",
    muted: "#9ca89e",
    border: "rgba(242, 241, 233, 0.18)",
    accent: "#5ac085",
    accentSoft: "rgba(90, 192, 133, 0.14)",
    watermark: "rgba(242, 241, 233, 0.05)",
  },
}

const LOGO_PATH = "M3 3h26v7H11v4h14l4 4v11H3v-7h18v-4H7l-4-4V3Z"

function LogoMark({ size, fill }: { size: number; fill: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d={LOGO_PATH} fill={fill} />
    </svg>
  )
}

function CornerMark({
  color,
  position,
}: {
  color: string
  position: { top?: number; bottom?: number; left?: number; right?: number }
}) {
  return (
    <div
      style={{
        position: "absolute",
        ...position,
        width: 14,
        height: 14,
        display: "flex",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 6,
          left: 0,
          width: 14,
          height: 2,
          display: "flex",
          background: color,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 6,
          width: 2,
          height: 14,
          display: "flex",
          background: color,
        }}
      />
    </div>
  )
}

function OgTemplate({
  width,
  height,
  content,
}: {
  width: number
  height: number
  content: OgTemplateContent
}) {
  const theme = themes[content.variant ?? "paper"]
  const titleSize = content.titleSize ?? 82
  const frameInset = 26
  const markOffset = frameInset - 7

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: theme.background,
        color: theme.ink,
        fontFamily: "Bricolage Grotesque",
      }}
    >
      <div
        style={{
          position: "absolute",
          right: -130,
          bottom: -170,
          display: "flex",
          transform: "rotate(-8deg)",
        }}
      >
        <svg width="620" height="620" viewBox="0 0 32 32" fill="none">
          <path d={LOGO_PATH} fill={theme.watermark} />
        </svg>
      </div>

      <div
        style={{
          position: "absolute",
          top: frameInset,
          left: frameInset,
          width: width - frameInset * 2,
          height: height - frameInset * 2,
          display: "flex",
          border: `1px solid ${theme.border}`,
        }}
      />
      <CornerMark color={theme.muted} position={{ top: markOffset, left: markOffset }} />
      <CornerMark color={theme.muted} position={{ top: markOffset, right: markOffset }} />
      <CornerMark color={theme.muted} position={{ bottom: markOffset, left: markOffset }} />
      <CornerMark color={theme.muted} position={{ bottom: markOffset, right: markOffset }} />

      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          padding: "62px 72px 58px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
            <LogoMark size={40} fill={theme.accent} />
            <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: -1.2 }}>
              Skills Board
            </span>
          </div>
          <span
            style={{
              fontFamily: "Geist Mono",
              fontSize: 17,
              fontWeight: 500,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: theme.muted,
            }}
          >
            {content.contextLabel ?? "skillsboard.sh"}
          </span>
        </div>

        <div style={{ display: "flex", flex: 1 }} />

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 30,
              height: 3,
              display: "flex",
              background: theme.accent,
            }}
          />
          <span
            style={{
              fontFamily: "Geist Mono",
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: theme.accent,
            }}
          >
            {content.eyebrow}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 20,
            fontSize: titleSize,
            fontWeight: 800,
            lineHeight: 1.01,
            letterSpacing: -3.6,
          }}
        >
          {content.title.map((line) => (
            <span
              key={line.text}
              style={{ color: line.accent ? theme.accent : theme.ink }}
            >
              {line.text}
            </span>
          ))}
        </div>

        <span
          style={{
            marginTop: 26,
            maxWidth: 800,
            fontSize: 23,
            fontWeight: 500,
            lineHeight: 1.45,
            color: theme.muted,
          }}
        >
          {content.description}
        </span>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 38,
            paddingTop: 26,
            borderTop: `1px solid ${theme.border}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {(content.chips ?? []).map((chip) => (
              <span
                key={chip}
                style={{
                  padding: "7px 15px",
                  borderRadius: 999,
                  border: `1px solid ${theme.border}`,
                  background: theme.accentSoft,
                  fontFamily: "Geist Mono",
                  fontSize: 15,
                  fontWeight: 500,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                  color: theme.ink,
                }}
              >
                {chip}
              </span>
            ))}
          </div>
          <span
            style={{
              fontFamily: "Geist Mono",
              fontSize: 15,
              fontWeight: 500,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: theme.muted,
            }}
          >
            {content.footnote ?? "Free forever · Open source"}
          </span>
        </div>
      </div>
    </div>
  )
}

const fontsDir = join(process.cwd(), "lib", "og", "fonts")

async function loadOgFonts() {
  const [medium, bold, extraBold, mono] = await Promise.all([
    readFile(join(fontsDir, "bricolage-grotesque-500.ttf")),
    readFile(join(fontsDir, "bricolage-grotesque-700.ttf")),
    readFile(join(fontsDir, "bricolage-grotesque-800.ttf")),
    readFile(join(fontsDir, "geist-mono-500.ttf")),
  ])

  return [
    { name: "Bricolage Grotesque", data: medium, weight: 500 as const, style: "normal" as const },
    { name: "Bricolage Grotesque", data: bold, weight: 700 as const, style: "normal" as const },
    { name: "Bricolage Grotesque", data: extraBold, weight: 800 as const, style: "normal" as const },
    { name: "Geist Mono", data: mono, weight: 500 as const, style: "normal" as const },
  ]
}

export async function createSocialImageResponse(
  size: { width: number; height: number },
  content: OgTemplateContent,
) {
  return new ImageResponse(
    <OgTemplate width={size.width} height={size.height} content={content} />,
    { ...size, fonts: await loadOgFonts() },
  )
}
