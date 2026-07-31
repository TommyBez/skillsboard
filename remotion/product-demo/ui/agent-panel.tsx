import { agent } from "../content";
import { ink, MONO, radius } from "../theme";

export const AGENT_PANEL_WIDTH = 820;

/** `line` is 0 → 4: how many of the transcript rows have arrived. */
export function AgentPanel({ reveal }: { reveal: number[] }) {
  const rows = [
    <span key="prompt" style={{ color: ink.foreground }}>
      <span style={{ color: ink.primary }}>&gt;</span> {agent.prompt}
    </span>,
    <span key="call" style={{ color: ink.mutedForeground }}>
      · {agent.call}
    </span>,
    <span key="result">
      <span style={{ color: ink.primary, fontWeight: 500 }}>{agent.result}</span>
      <span style={{ color: ink.mutedForeground }}> · {agent.resultMeta}</span>
    </span>,
  ];

  return (
    <div
      style={{
        width: AGENT_PANEL_WIDTH,
        padding: 32,
        borderRadius: radius["2xl"],
        border: `1px solid ${ink.border}`,
        background: ink.card,
        fontFamily: MONO,
        fontSize: 19,
        lineHeight: 1.9,
      }}
    >
      {rows.map((row, index) => (
        <div
          key={index}
          style={{
            opacity: reveal[index] ?? 0,
            translate: `0 ${(1 - (reveal[index] ?? 0)) * 8}px`,
          }}
        >
          {row}
        </div>
      ))}
      <div
        style={{
          marginTop: 18,
          paddingLeft: 18,
          borderLeft: `2px solid ${ink.primary}`,
          color: ink.foreground,
          fontSize: 18,
          lineHeight: 1.7,
          opacity: reveal[3] ?? 0,
          translate: `0 ${(1 - (reveal[3] ?? 0)) * 10}px`,
        }}
      >
        “{agent.note}”
      </div>
    </div>
  );
}

export function AgentChips({ reveal }: { reveal: number[] }) {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      {agent.agents.map((name, index) => (
        <span
          key={name}
          style={{
            padding: "8px 18px",
            borderRadius: 999,
            border: `1px solid ${ink.border}`,
            color: ink.foreground,
            fontSize: 17,
            opacity: reveal[index] ?? 0,
            scale: String(0.94 + 0.06 * (reveal[index] ?? 0)),
          }}
        >
          {name}
        </span>
      ))}
    </div>
  );
}
