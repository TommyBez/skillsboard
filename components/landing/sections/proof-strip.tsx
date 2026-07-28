import styles from "@/components/landing/sections/proof-strip.module.css"

const clients = ["Claude", "Cursor", "VS Code", "Zed"] as const

/**
 * The row directly under the fold. Both references place a payload here rather
 * than empty ground, and this is the cheapest true one we have.
 */
export function ProofStrip() {
  return (
    <section aria-label="What Skills Board is" className={styles.strip}>
      <div className={styles.inner}>
        <p className={styles.claim}>
          <span className={styles.label}>Open source</span>
          <span className={styles.rule} aria-hidden="true" />
          <span className={styles.value}>MIT licensed</span>
        </p>
        <p className={styles.claim}>
          <span className={styles.label}>Works with</span>
          <span className={styles.rule} aria-hidden="true" />
          <span className={styles.value}>
            {clients.map((client) => (
              <span key={client} className={styles.client}>
                {client}
              </span>
            ))}
          </span>
        </p>
      </div>
    </section>
  )
}
