const agents = ["Claude", "Codex", "Cursor", "Other agents"]

export function SocialImage({ height }: { height: number }) {
  const tall = height > 630

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: "#f7f8f4",
        color: "#17231b",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -230,
          left: -180,
          width: 700,
          height: 700,
          display: "flex",
          borderRadius: 999,
          background: "rgba(0, 132, 61, 0.055)",
        }}
      />

      <div
        style={{
          width: 820,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: tall ? "58px 64px 54px" : "52px 64px 48px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg
            width="42"
            height="42"
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3 3h26v7H11v4h14l4 4v11H3v-7h18v-4H7l-4-4V3Z"
              fill="#00843d"
            />
          </svg>
          <span style={{ fontSize: 29, fontWeight: 700, letterSpacing: -1.2 }}>
            Skills Board
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              marginBottom: 18,
              color: "#00843d",
              fontSize: 19,
              fontWeight: 700,
              letterSpacing: 1.4,
              textTransform: "uppercase",
            }}
          >
            Skills selected by your team
          </span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: tall ? 78 : 74,
              fontWeight: 700,
              lineHeight: 0.91,
              letterSpacing: -4.8,
            }}
          >
            <span>One shared library.</span>
            <span style={{ color: "#00843d" }}>Different agents.</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            width: "100%",
            paddingTop: 21,
            borderTop: "1px solid #d4dacd",
            color: "#5e6b61",
            fontSize: 20,
            lineHeight: 1.35,
          }}
        >
          Keep your team&apos;s recommended AI skills in one searchable place.
        </div>
      </div>

      <div
        style={{
          width: 380,
          height: "100%",
          display: "flex",
          position: "relative",
          flexDirection: "column",
          justifyContent: "space-between",
          overflow: "hidden",
          padding: tall ? "58px 50px 54px" : "52px 50px 48px",
          background: "#00843d",
          color: "#f7f8f4",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -108,
            top: -74,
            display: "flex",
            opacity: 0.08,
            transform: "rotate(-6deg)",
          }}
        >
          <svg width="400" height="400" viewBox="0 0 32 32" fill="none">
            <path
              d="M3 3h26v7H11v4h14l4 4v11H3v-7h18v-4H7l-4-4V3Z"
              fill="#f7f8f4"
            />
          </svg>
        </div>

        <span
          style={{
            display: "flex",
            position: "relative",
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: "uppercase",
          }}
        >
          Wherever people work
        </span>

        <div
          style={{
            display: "flex",
            position: "relative",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {agents.map((agent) => (
            <div
              key={agent}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "14px 0",
                borderBottom: "1px solid rgba(247, 248, 244, 0.32)",
                fontSize: 25,
                fontWeight: 700,
                letterSpacing: -0.8,
              }}
            >
              <span>{agent}</span>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            position: "relative",
            alignItems: "center",
            fontSize: 17,
            fontWeight: 700,
          }}
        >
          Free forever · Open source
        </div>
      </div>
    </div>
  )
}
