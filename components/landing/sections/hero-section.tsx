import { Suspense } from "react"

import { HeroBoard } from "@/components/landing/hero-board"
import { HomeHeroActions, HomeHeroActionsFallback } from "@/components/landing/landing-ctas"
import base from "@/components/landing/styles/base.module.css"
import styles from "@/components/landing/styles/hero.module.css"

/**
 * Hero — sticky chapter: scattered dossiers file into the team library.
 *
 * The frame is a three-band grid (standing header rule / composition /
 * state rail) so both edges of the viewport are held by structure and the
 * composition never floats in dead space.
 *
 * Four lines hold the composition, and every end of every one of them lands
 * on another line:
 *
 *   header rule   spine → right rail, at the top band
 *   spine         header rule → floor rule, on the 50% line of the measure
 *   floor rule    left rail → spine, on the stage's floor
 *   drawer border the 75% line, drawn once, by the drawer that stands on it
 *
 * Everything else in the chapter is an object outline or an internal
 * division, and each of those two roles has exactly one value.
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
            {/* The one interior vertical. It stands on the composition's spine
                — the 50% line of the four-column measure — and it runs the
                stage's full height at one constant value, top end on the deck's
                top edge, bottom end on the floor rule. Three things land on it:
                headline line 1's terminal period, the stage's left edge, and
                the floor rule's right end. The other two lines the old grid
                drew (25% and 75%) are gone: 25% held nothing and sliced both
                the headline and the secondary button, and 75% is held by the
                drawer's own left border, so drawing it there produced two
                different greys pretending to be one line. */}
            <span className={styles.heroSpine} aria-hidden="true" />

            <div className={`${styles.heroCopyCol} ${styles.heroExit}`}>
              <h1 className={styles.heroHeadline}>
                <span className={styles.heroLineMask}>
                  {/* U+2019, not the typewriter prime: at a 74px cap height a
                      straight vertical tick is the loudest wrong mark on the
                      page. Same words, correct glyph. */}
                  <span className={`${styles.heroLine} ${styles.heroLineFirst}`}>
                    Your team’s skills.
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
                <Suspense fallback={<HomeHeroActionsFallback />}>
                  <HomeHeroActions />
                </Suspense>
              </div>
            </div>

            <HeroBoard />

            {/* The copy column's floor. Half the measure, left end on the
                frame's left rail, right end on the spine — the exact mirror of
                the header rule above, which is the same length hung off the
                right rail. Its own line sits on the board's floor, the same y
                as card 05's bottom edge, so the copy column and the card
                column terminate on one horizontal.

                It used to carry an "INDEXED 0/5" counter. Six numerals of
                machinery reporting what the state rail 60px below already
                reports; the rule alone closes the column. */}
            <div className={styles.heroFoot} aria-hidden="true">
              <span className={styles.heroFootRule} />
            </div>
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
