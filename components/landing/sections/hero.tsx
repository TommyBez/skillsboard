import type { ReactNode } from "react"

import { HeroBoard } from "@/components/landing/hero-board"
import styles from "@/components/landing/sections/hero.module.css"

/**
 * Hero — one viewport, no runway. The sticky chapter it used to be produced
 * ~872px of measured void immediately after it (direction §9), so the section
 * is now content plus the standard section padding and nothing else.
 * `actions` carries the session-dependent CTA pair from the page.
 */
export function Hero({ actions }: { actions: ReactNode }) {
  return (
    <section id="intro" className={`${styles.hero} lp-section`}>
      <div className={`${styles.inner} lp-container lp-grid`}>
        <div className={styles.copy} data-reveal="children">
          <p className={`${styles.eyebrow} lp-label`}>
            Skills selected by your team
          </p>
          <h1 className={`${styles.headline} lp-d1`}>
            <span className={styles.line}>Your team&apos;s skills.</span>
            <span className={`${styles.line} ${styles.lineAccent}`}>
              All in one place.
            </span>
          </h1>
          <p className={`${styles.lead} lp-lead`}>
            Build a shared, searchable library so everyone knows which skills
            to use and where to find them.
          </p>
          <div className={styles.cta}>{actions}</div>
        </div>

        <HeroBoard />
      </div>
    </section>
  )
}
