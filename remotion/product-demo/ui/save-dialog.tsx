import { CheckCircle2Icon, GitBranchIcon } from "lucide-react";
import { saveDialog } from "../content";
import { light, MONO, radius } from "../theme";
import { Btn, Checkbox, InputBox, type as t } from "./atoms";

export const DIALOG_WIDTH = 560;

const ROW_HEIGHT = 58;
const SELECT_ALL_HEIGHT = 40;
const NOTE_BOX_HEIGHT = 60;

/**
 * Both reveals clip to an animated height, so these must match the content
 * exactly — a couple of pixels short and the panel's bottom border is cut off.
 * `LABEL_HEIGHT` is pinned on the labels below so the sum stays predictable.
 * With the border-box reset in `Scene`, only the list container adds its own
 * borders on top of its children (it has no explicit height of its own).
 */
const LABEL_HEIGHT = 17;
const LABEL_GAP = 8;
const BORDERS = 2;
const LIST_HEIGHT =
  LABEL_HEIGHT +
  LABEL_GAP +
  BORDERS +
  SELECT_ALL_HEIGHT +
  ROW_HEIGHT * saveDialog.discovered.length;
const NOTE_HEIGHT = LABEL_HEIGHT + LABEL_GAP + NOTE_BOX_HEIGHT;

const label = { ...t.label, lineHeight: `${LABEL_HEIGHT}px` };

/** Steady-state geometry, so the cursor can aim at controls without measuring. */
export const HIT = {
  url: { x: 300, y: 278 },
  firstSkill: { x: 48, y: 408 },
  submit: { x: 476, y: 735 },
} as const;

interface SaveDialogProps {
  url: string;
  urlFocused?: boolean;
  caret?: number;
  /** 0 → 1 opens the discovered-skills list by height, the way the app reveals it. */
  discovery?: number;
  checked?: boolean[];
  checkProgress?: number;
  note?: string;
  noteCaret?: number;
  tags?: string;
  tagsOpacity?: number;
  noteReveal?: number;
  submitPress?: number;
}

export function SaveDialog({
  url,
  urlFocused = false,
  caret = 0,
  discovery = 0,
  checked = [false, false, false],
  checkProgress = 0,
  note = "",
  noteCaret = 0,
  tags = "",
  tagsOpacity = 0,
  noteReveal = 0,
  submitPress = 1,
}: SaveDialogProps) {
  const selected = checked.filter(Boolean).length;

  return (
    <div
      style={{
        width: DIALOG_WIDTH,
        borderRadius: radius.xl,
        background: light.card,
        boxShadow: `0 0 0 1px ${light.foreground}1a, 0 18px 44px ${light.foreground}14`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: 24,
          borderBottom: `1px solid ${light.border}`,
          background: `${light.muted}59`,
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 44,
            height: 44,
            marginBottom: 10,
            borderRadius: radius.xl,
            background: light.primary,
            color: light.primaryForeground,
          }}
        >
          <GitBranchIcon size={20} />
        </span>
        <h2 style={{ margin: 0, ...t.display, lineHeight: 1.2 }}>{saveDialog.title}</h2>
        <p
          style={{
            margin: "8px 0 0",
            maxWidth: 440,
            fontSize: 14,
            lineHeight: 1.6,
            color: light.mutedForeground,
          }}
        >
          {saveDialog.description}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={label}>{saveDialog.urlLabel}</span>
          <InputBox focused={urlFocused}>
            <span style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontFamily: MONO, fontSize: 13 }}>{url}</span>
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

        <div style={{ height: discovery * LIST_HEIGHT, overflow: "hidden" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, opacity: discovery }}>
            <span style={label}>{saveDialog.listLabel}</span>
            <div
              style={{
                borderRadius: radius.xl,
                border: `1px solid ${light.border}`,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  height: SELECT_ALL_HEIGHT,
                  padding: "0 16px",
                  borderBottom: `1px solid ${light.border}`,
                  background: `${light.muted}59`,
                }}
              >
                <Checkbox checked={false} />
                <span style={{ fontSize: 14, fontWeight: 500 }}>Select all</span>
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 12,
                    color: light.mutedForeground,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {selected} of {saveDialog.discovered.length} selected
                </span>
              </div>
              {saveDialog.discovered.map((skill, index) => (
                <div
                  key={skill.name}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    height: ROW_HEIGHT,
                    padding: "12px 16px",
                    borderBottom:
                      index === saveDialog.discovered.length - 1
                        ? undefined
                        : `1px solid ${light.border}`,
                    background: checked[index] ? `${light.muted}40` : undefined,
                  }}
                >
                  <div style={{ marginTop: 2 }}>
                    <Checkbox checked={Boolean(checked[index])} progress={checkProgress} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 600 }}>
                      {skill.name}
                    </div>
                    <div
                      style={{
                        marginTop: 2,
                        fontSize: 13,
                        lineHeight: 1.5,
                        color: light.mutedForeground,
                      }}
                    >
                      {skill.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ height: noteReveal * NOTE_HEIGHT, overflow: "hidden" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, opacity: noteReveal }}>
            <span style={label}>{saveDialog.noteLabel}</span>
            <div
              style={{
                display: "flex",
                height: NOTE_BOX_HEIGHT,
                padding: "10px 14px",
                borderRadius: radius.xl,
                border: `1px solid ${light.input}`,
                background: light.card,
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              <span>{note}</span>
              <span
                style={{
                  width: 1.5,
                  height: 17,
                  marginLeft: 1,
                  background: light.foreground,
                  opacity: noteCaret,
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={label}>{saveDialog.tagsLabel}</span>
            <InputBox>
              <span style={{ fontSize: 14, opacity: tagsOpacity }}>{tags}</span>
            </InputBox>
          </div>
          <Btn press={submitPress}>{saveDialog.submit}</Btn>
        </div>
      </div>
    </div>
  );
}

export function Toast({ opacity, rise }: { opacity: number; rise: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "16px 22px",
        borderRadius: radius.xl,
        border: `1px solid ${light.border}`,
        background: light.card,
        boxShadow: `0 8px 24px ${light.foreground}14`,
        opacity,
        translate: `0 ${rise}px`,
      }}
    >
      <CheckCircle2Icon size={22} color={light.primary} />
      <span style={{ fontSize: 18, fontWeight: 500 }}>{saveDialog.toast}</span>
    </div>
  );
}
