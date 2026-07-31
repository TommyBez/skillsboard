import {
  ArrowUpRightIcon,
  CheckIcon,
  CopyIcon,
  GitForkIcon,
  MessageSquareQuoteIcon,
} from "lucide-react";
import { light, MONO, radius } from "../theme";
import { Badge, type as t } from "./atoms";

export const CARD_WIDTH = 620;

interface CardContent {
  source: string;
  metric: string;
  title: string;
  description: string;
  note: string;
  prompt: string;
  tags: readonly string[];
  addedBy: string;
  command: string;
}

function GitHubMark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.866-.013-1.7-2.782.605-3.369-1.343-3.369-1.343-.455-1.159-1.11-1.468-1.11-1.468-.908-.62.069-.608.069-.608 1.003.071 1.531 1.031 1.531 1.031.892 1.53 2.341 1.088 2.91.832.091-.647.349-1.088.635-1.338-2.221-.253-4.555-1.112-4.555-4.947 0-1.093.39-1.987 1.029-2.686-.103-.253-.446-1.27.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.026 2.747-1.026.546 1.38.203 2.397.1 2.65.64.699 1.028 1.593 1.028 2.686 0 3.844-2.337 4.691-4.566 4.94.359.31.679.923.679 1.86 0 1.343-.012 2.426-.012 2.757 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.523 2 12 2Z" />
    </svg>
  );
}

/** The example-prompt panel — the surface the team's own context lives on. */
export function PromptPanel({
  prompt,
  label = "Example prompts",
  width,
}: {
  prompt: string;
  label?: string;
  width?: number;
}) {
  return (
    <div
      style={{
        width,
        padding: 14,
        borderRadius: radius["2xl"],
        background: `${light.primary}0c`,
        boxShadow: `inset 0 0 0 1px ${light.primary}26`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <MessageSquareQuoteIcon size={16} color={light.primary} />
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: light.primary,
          }}
        >
          {label}
        </span>
      </div>
      <p
        style={{
          margin: "10px 0 0",
          paddingTop: 12,
          borderTop: `1px solid ${light.primary}1a`,
          fontSize: 14,
          lineHeight: 1.6,
          color: `${light.foreground}e6`,
        }}
      >
        {prompt}
      </p>
    </div>
  );
}

export function CommandBar({
  command,
  copied = 0,
  scroll = 0,
  width,
}: {
  command: string;
  /** 0 = copy icon, 1 = the check the app swaps in after a successful copy. */
  copied?: number;
  /** The app's command strip scrolls horizontally; the demo nudges it to the tail. */
  scroll?: number;
  width?: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        width,
        height: 40,
        padding: "0 12px",
        borderRadius: radius.lg,
        border: `1px solid ${light.border}`,
        background: `${light.background}bf`,
        overflow: "hidden",
      }}
    >
      <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
        <code
          style={{
            display: "block",
            whiteSpace: "nowrap",
            fontFamily: MONO,
            fontSize: 12,
            color: light.mutedForeground,
            translate: `${-scroll}px`,
          }}
        >
          {command}
        </code>
      </div>
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28,
          height: 28,
          borderRadius: radius.md,
        }}
      >
        <span style={{ position: "absolute", opacity: 1 - copied, scale: String(1 - 0.2 * copied) }}>
          <CopyIcon size={14} color={light.mutedForeground} />
        </span>
        <span style={{ position: "absolute", opacity: copied, scale: String(0.8 + 0.2 * copied) }}>
          <CheckIcon size={14} color={light.primary} />
        </span>
      </div>
    </div>
  );
}

export function SkillCard({
  card,
  copied = 0,
  scroll = 0,
  width = CARD_WIDTH,
}: {
  card: CardContent;
  copied?: number;
  scroll?: number;
  width?: number;
}) {
  const initials = card.addedBy
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article
      style={{
        display: "flex",
        flexDirection: "column",
        width,
        borderRadius: radius["2xl"],
        border: `1px solid ${light.border}`,
        background: light.card,
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, ...t.meta }}>
            <GitForkIcon size={14} color={light.primary} />
            <span>{card.source}</span>
          </div>
          <span style={{ ...t.meta, fontVariantNumeric: "tabular-nums" }}>{card.metric}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h2 style={{ margin: 0, ...t.display }}>{card.title}</h2>
          <p style={{ margin: 0, ...t.body }}>{card.description}</p>
          <p
            style={{
              margin: 0,
              padding: "8px 12px",
              borderRadius: radius.lg,
              background: `${light.accent}80`,
              fontSize: 15,
              lineHeight: 1.6,
              color: `${light.foreground}e6`,
            }}
          >
            {card.note}
          </p>
          <PromptPanel prompt={card.prompt} />
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {card.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 24,
              height: 24,
              borderRadius: radius.md,
              background: light.accent,
              color: light.accentForeground,
              fontFamily: MONO,
              fontSize: 10,
              fontWeight: 600,
            }}
          >
            {initials}
          </span>
          <p style={{ margin: 0, fontSize: 14, color: light.mutedForeground }}>
            Added by <span style={{ fontWeight: 500, color: light.foreground }}>{card.addedBy}</span>
          </p>
        </div>
      </div>

      <div
        style={{
          padding: 16,
          borderTop: `1px solid ${light.border}`,
          background: `${light.muted}66`,
        }}
      >
        <CommandBar command={card.command} copied={copied} scroll={scroll} />
        <div style={{ display: "flex", alignItems: "center", height: 32, marginTop: 12, gap: 6 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6, color: light.foreground }}>
            <GitHubMark />
            <ArrowUpRightIcon size={14} />
          </span>
        </div>
      </div>
    </article>
  );
}
