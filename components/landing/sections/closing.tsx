import type { ReactNode } from "react"

import styles from "@/components/landing/sections/closing.module.css"

/**
 * Closing — the page's one ink-inverted band. It carries the beat the pricing
 * monument used to supply, at a third of the height and with a real action
 * instead of a numeral. `actions` carries the session-dependent CTA.
 */
export function Closing({ actions }: { actions: ReactNode }) {
  return (
    <section
      id="start"
      aria-labelledby="closing-heading"
      className={`${styles.closing} lp-section-tight scroll-mt-14`}
    >
      {/* The entrance lives in the controller: one 420ms reveal, 80ms per
          child, played once. Nothing here depends on it running. */}
      <div className="lp-container" data-reveal="children">
        <h2 className="lp-d2" id="closing-heading">
          Answer “which skill should I use?” once.
        </h2>
        <p className={`lp-lead ${styles.closingCopy}`}>
          Save the recommendation where the whole team can find it. The next
          person can get started without asking where to look.
        </p>
        <div className={styles.closingCta}>{actions}</div>
      </div>
    </section>
  )
}
