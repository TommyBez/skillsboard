import styles from "@/components/landing/sections/proof-strip.module.css"

/**
 * The row directly under the fold — direction §9. Both references put a payload
 * here rather than empty ground, and this is the cheapest true one we have.
 *
 * Every claim is checkable: the licence is MIT (LICENSE), the four clients are
 * exactly the ones our own MCP setup guide documents, and the endpoint is the
 * OAuth-protected `/api/mcp` route. The GitHub star count is deliberately
 * absent — it was 5 when this was written, and a real number that small argues
 * against us.
 */
const claims = [
  {
    label: "Open source",
    value: "MIT licensed",
    detail: "github.com/TommyBez/skillsboard",
  },
  {
    label: "Works with",
    clients: ["Claude Code", "Claude Desktop", "Cursor", "VS Code"],
    detail: "Any MCP-compatible client",
  },
  {
    label: "Agent access",
    value: "Authenticated MCP server",
    detail: "/api/mcp",
  },
] as const

export function ProofStrip() {
  return (
    <section aria-label="What Skills Board is" className={styles.strip}>
      <div className={`${styles.inner} lp-bleed`}>
        {claims.map((claim) => (
          <div key={claim.label} className={styles.claim}>
            <p className={`${styles.label} lp-label`}>{claim.label}</p>
            <p className={`${styles.value} lp-body`}>
              {"clients" in claim
                ? claim.clients.map((client, index) => (
                    <span key={client} className={styles.client}>
                      {index > 0 ? (
                        <span className={styles.sep} aria-hidden="true">
                          ·
                        </span>
                      ) : null}
                      {client}
                    </span>
                  ))
                : claim.value}
            </p>
            <p className={`${styles.detail} lp-code`}>{claim.detail}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
