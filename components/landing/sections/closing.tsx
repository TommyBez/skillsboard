import type { ReactNode } from "react"

import shared from "@/components/landing/landing-shared.module.css"
import styles from "@/components/landing/sections/closing.module.css"

/**
 * Closing — everything indexed, one final action. `actions` carries the
 * session-dependent CTA from the page.
 */
export function Closing({ actions }: { actions: ReactNode }) {
  return (
    <section
      id="start"
      className={`${shared.grain} scroll-mt-14`}
      data-motion-group="closing"
      data-chapter-target="start"
    >
      <div className="relative mx-auto flex w-full max-w-[1440px] flex-col items-start px-5 py-20 md:px-10 md:py-32">
        <h2
          className={`${styles.closingHeading} max-w-[18ch] text-balance text-[clamp(2.5rem,6vw,5.75rem)] font-semibold leading-[0.98] tracking-display`}
        >
          Answer “which skill should I use?”{" "}
          <span className={styles.onceStamp}>once.</span>
        </h2>
        <p
          className={`${styles.closingCopy} mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground`}
        >
          Save the recommendation where the whole team can find it. The next
          person can get started without asking where to look.
        </p>
        <div className={`${styles.closingCta} mt-8`}>{actions}</div>
      </div>
    </section>
  )
}
