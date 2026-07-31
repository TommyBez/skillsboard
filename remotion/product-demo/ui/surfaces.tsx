import {
  ArrowUpRightIcon,
  CopyIcon,
  DownloadIcon,
  FolderIcon,
  GitForkIcon,
  SearchIcon,
  TagsIcon,
} from "lucide-react";
import { ValueSwap } from "@/components/remocn/value-swap";
import { find } from "../content";
import { light, MONO, radius } from "../theme";
import { Badge, InputBox, type as t } from "./atoms";

/** The library search panel, cropped to the search card only. */
export function LibrarySearch({
  query,
  caret,
  activeTag,
  width = 720,
}: {
  query: string;
  caret: number;
  activeTag: string | null;
  width?: number;
}) {
  return (
    <div
      style={{
        width,
        padding: 20,
        borderRadius: radius["2xl"],
        border: `1px solid ${light.border}`,
        background: `${light.card}cc`,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={t.label}>{find.label}</span>
        <InputBox focused={caret > 0}>
          <SearchIcon size={16} color={light.mutedForeground} />
          {/* Text and caret share one box: the input's own gap would otherwise
              park the caret a space away from the last character. */}
          <span style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: 14, color: query ? light.foreground : light.mutedForeground }}>
              {query || find.placeholder}
            </span>
            <span
              style={{
                width: 1.5,
                height: 17,
                marginLeft: 1,
                background: light.foreground,
                opacity: caret,
              }}
            />
          </span>
        </InputBox>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginTop: 16,
          paddingTop: 16,
          borderTop: `1px solid ${light.border}`,
        }}
      >
        <TagsIcon size={16} color={light.mutedForeground} />
        <div style={{ display: "flex", gap: 8 }}>
          {find.tags.map((tag) => (
            <Badge key={tag} active={tag === activeTag}>
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

export const RESULT_CARD_WIDTH = 330;

/** The library result as the app renders it, minus the install footer. */
export function ResultCard({
  result,
  opacity,
  scale,
  offsetX,
  width = RESULT_CARD_WIDTH,
}: {
  result: {
    title: string;
    source: string;
    description: string;
    tags: readonly string[];
    addedBy: string;
  };
  opacity: number;
  scale: number;
  offsetX: number;
  width?: number;
}) {
  const initials = result.addedBy
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: "50%",
        marginLeft: -width / 2,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        width,
        padding: 20,
        borderRadius: radius["2xl"],
        border: `1px solid ${light.border}`,
        background: light.card,
        opacity,
        scale: String(scale),
        translate: `${offsetX}px`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, ...t.meta }}>
        <GitForkIcon size={13} color={light.primary} />
        <span>{result.source}</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.035em" }}>{result.title}</div>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: light.mutedForeground }}>
        {result.description}
      </p>
      <div style={{ display: "flex", gap: 6 }}>
        {result.tags.map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 22,
            height: 22,
            borderRadius: radius.md,
            background: light.accent,
            color: light.accentForeground,
            fontFamily: MONO,
            fontSize: 9,
            fontWeight: 600,
          }}
        >
          {initials}
        </span>
        <span style={{ fontSize: 13, color: light.mutedForeground }}>
          Added by <span style={{ fontWeight: 500, color: light.foreground }}>{result.addedBy}</span>
        </span>
      </div>
    </div>
  );
}

const HANDOFF_ICONS = [ArrowUpRightIcon, CopyIcon, DownloadIcon];

export function HandoffRow({
  label,
  index,
  reveal,
  width = 420,
}: {
  label: string;
  index: number;
  reveal: number;
  width?: number;
}) {
  const Icon = HANDOFF_ICONS[index] ?? ArrowUpRightIcon;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        width,
        padding: "16px 20px",
        borderRadius: radius.xl,
        border: `1px solid ${light.border}`,
        background: light.card,
        fontSize: 18,
        fontWeight: 500,
        opacity: reveal,
        translate: `0 ${(1 - reveal) * 14}px`,
      }}
    >
      <Icon size={20} color={light.primary} />
      {label}
    </div>
  );
}

export function CollectionCard({
  title,
  count,
  swapAt,
  active,
  members,
  incoming = 0,
  width = 300,
}: {
  title: string;
  count: readonly string[];
  swapAt: number;
  active: boolean;
  members: readonly string[];
  /** The skill that just landed in this collection, 0 → 1. */
  incoming?: number;
  width?: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        width,
        padding: 22,
        borderRadius: radius["2xl"],
        border: `1px solid ${active ? light.primary : light.border}`,
        background: light.card,
      }}
    >
      <FolderIcon size={22} color={active ? light.primary : light.mutedForeground} />
      <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.035em" }}>{title}</div>
      <ValueSwap
        values={[...count]}
        at={swapAt}
        style={{
          fontFamily: MONO,
          fontSize: 14,
          color: active ? light.primary : light.mutedForeground,
        }}
      />
      <div style={{ display: "flex", gap: 8, height: 26 }}>
        {members.map((member) => (
          <Badge key={member}>{member}</Badge>
        ))}
        {incoming > 0 ? (
          <span style={{ opacity: incoming, scale: String(0.9 + 0.1 * incoming) }}>
            <Badge active>pdf</Badge>
          </span>
        ) : null}
      </div>
    </div>
  );
}

/** The three handoffs as compact chips — the loop has no room for full rows. */
export function HandoffChips({ reveal }: { reveal: number[] }) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      {["Open source", "Copy install command", "Download ZIP"].map((label, index) => {
        const Icon = HANDOFF_ICONS[index] ?? ArrowUpRightIcon;

        return (
          <span
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              borderRadius: radius.xl,
              border: `1px solid ${light.border}`,
              background: light.card,
              fontSize: 14,
              fontWeight: 500,
              opacity: reveal[index] ?? 0,
              translate: `0 ${(1 - (reveal[index] ?? 0)) * 10}px`,
            }}
          >
            <Icon size={15} color={light.primary} />
            {label}
          </span>
        );
      })}
    </div>
  );
}

/** Teammates the recommendation just became available to. */
export function TeammateChips({ names, reveal }: { names: readonly string[]; reveal: number[] }) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      {names.map((name, index) => {
        const initials = name
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();

        return (
          <span
            key={name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px 6px 6px",
              borderRadius: 999,
              border: `1px solid ${light.border}`,
              background: light.card,
              fontSize: 14,
              opacity: reveal[index] ?? 0,
              scale: String(0.94 + 0.06 * (reveal[index] ?? 0)),
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 24,
                height: 24,
                borderRadius: 999,
                background: light.accent,
                color: light.accentForeground,
                fontFamily: MONO,
                fontSize: 10,
                fontWeight: 600,
              }}
            >
              {initials}
            </span>
            {name}
          </span>
        );
      })}
    </div>
  );
}
