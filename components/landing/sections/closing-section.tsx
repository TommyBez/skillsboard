import { Suspense } from "react"

import { HomeCtaFallback, HomeFinalActions } from "@/components/landing/landing-ctas"
import base from "@/components/landing/styles/base.module.css"
import styles from "@/components/landing/styles/closing.module.css"

/** Closing — everything indexed, one final action. */
export function ClosingSection() {
  return (
    <section
      id="start"
      className={`${base.grain} scroll-mt-14`}
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
        <div className={`${styles.closingCta} mt-8`}>
          <Suspense fallback={<HomeCtaFallback />}>
            <HomeFinalActions />
          </Suspense>
        </div>
      </div>
    </section>
  )
}
