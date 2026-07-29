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
