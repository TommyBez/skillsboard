import { Suspense } from "react"

import { HeroBoard } from "@/components/landing/hero-board"
import { HomeCtaFallback, HomeHeroActions } from "@/components/landing/landing-ctas"
import base from "@/components/landing/styles/base.module.css"
import styles from "@/components/landing/styles/hero.module.css"

/**
 * Hero — sticky chapter: scattered dossiers file into the team library.
 *
 * The frame is a three-band grid (standing header rule / composition /
 * state rail) so both edges of the viewport are held by structure and the
 * composition never floats in dead space.
 */
export function HeroSection() {
  return (
    <section
      id="intro"
      className={styles.hero}
      data-hero-scene
      data-chapter-target="intro"
      data-view-progress="hero"
    >
      <div className={`${styles.heroSticky} ${base.grain}`}>
        <div className={styles.heroFrame}>
          <div className={styles.heroField} aria-hidden="true" />
          <div className={styles.heroRules} aria-hidden="true" />

          <div className={styles.heroTop}>
            {/* Chapter index, same grammar as 02–06. */}
            <span className={styles.heroIndex} aria-hidden="true">
              01
            </span>
            <p className={styles.heroEyebrow} data-decode="">
              Skills selected by your team
            </p>
            <span className={styles.heroTopRule} aria-hidden="true" />
          </div>

          <div className={styles.heroMid}>
            <div className={`${styles.heroCopyCol} ${styles.heroExit}`}>
              <h1 className={styles.heroHeadline}>
                <span className={styles.heroLineMask}>
                  <span className={`${styles.heroLine} ${styles.heroLineFirst}`}>
                    Your team&apos;s skills.
                  </span>
                </span>
                <span className={styles.heroLineMask}>
                  <span className={`${styles.heroLine} ${styles.heroLineSecond}`}>
                    All in one place.
                  </span>
                </span>
              </h1>
            </div>

            <div className={`${styles.heroLower} ${styles.heroExit}`}>
              <p className={styles.heroBlurb}>
                Build a shared, searchable library so everyone knows which skills
                to use and where to find them.
              </p>
              <div className={styles.heroCta}>
                <Suspense fallback={<HomeCtaFallback />}>
                  <HomeHeroActions />
                </Suspense>
              </div>
            </div>

            <HeroBoard />

            {/* Digital half of the scene's readout: the copy column ends on the
                same baseline the board does, and reports the count the rail
                reports as a bar. Numeric index only — no prose. */}
            <p className={styles.heroTally} aria-hidden="true">
              <span className={styles.heroTallyKey}>Filed</span>
              <span className={styles.heroTallyNum}>
                {[0, 1, 2, 3, 4, 5].map((n) => (
                  <span key={n} className={styles.heroTallyDigit} data-n={n}>
                    {String(n).padStart(2, "0")}
                  </span>
                ))}
              </span>
              <span className={styles.heroTallyTotal}>/05</span>
            </p>
          </div>

          <div className={styles.heroRail} aria-hidden="true">
            <span className={styles.heroRailLabel} data-state="scattered">
              Scattered
            </span>
            <span className={styles.heroRailTrack}>
              <span className={styles.heroRailFill} />
            </span>
            <span className={styles.heroRailLabel} data-state="filed">
              Filed
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
