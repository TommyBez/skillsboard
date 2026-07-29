import { Suspense } from "react"

import { ClosingPlate } from "@/components/landing/closing/closing-plate"
import { HomeCtaFallback, HomeFinalActions } from "@/components/landing/landing-ctas"
import base from "@/components/landing/styles/base.module.css"
import styles from "@/components/landing/styles/closing.module.css"

/** Closing — the final plate: everything indexed, one terminal action. */
export function ClosingSection() {
  return (
    <section
      id="start"
      className={`${base.grain} ${styles.closing} scroll-mt-14`}
      data-motion-group="closing"
      data-chapter-target="start"
    >
      <span className={styles.closingField} aria-hidden="true" />

      <div className={styles.closingInner}>
        <p className={`${base.chapterMark} ${styles.closingMark}`}>
          <span data-decode="">06</span>
        </p>

        <div className={styles.closingFrame}>
          <div className={styles.closingGrid}>
            <div className={styles.closingMain}>
              <h2
                className={`${styles.closingHeading} max-w-[15ch] text-balance text-[clamp(2.5rem,6.1vw,5.75rem)] font-semibold leading-[0.96] tracking-display`}
              >
                Answer “which skill should I use?”{" "}
                <span className={styles.onceStamp}>once.</span>
              </h2>
              <p
                className={`${styles.closingCopy} mt-6 max-w-xl text-balance text-lg leading-relaxed text-muted-foreground`}
              >
                Save the recommendation where the whole team can find it. The
                next person can get started without asking where to look.
              </p>
              <div className={styles.closingCtaRow}>
                <div className={styles.closingCta}>
                  <Suspense fallback={<HomeCtaFallback />}>
                    <HomeFinalActions />
                  </Suspense>
                </div>
              </div>
            </div>

            <ClosingPlate />
          </div>

          <p className={styles.closingEnd} aria-hidden="true">
            <span className={styles.closingEndRule} />
            <span className={styles.closingEndMark} />
          </p>
        </div>
      </div>
    </section>
  )
}
