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
 * Three lines hold the composition, and every end of every one of them lands
 * on another line:
 *
 *   header rule   eyebrow → the chapter's right edge, one --joint after the
 *                 label; its right end is the vertical the drawer's own right
 *                 border stands on, 120px below
 *   spine         header rule → the state rail's track, on the 50% line
 *   drawer border the chapter's right edge, drawn once, by the drawer itself
 *
 * The copy column's floor rule is gone. It shared a y with card 05's bottom
 * border, 24px to its right and at 1.8× its weight, which reads as one
 * misaligned horizontal rather than as two things on a baseline; the spine runs
 * straight past to the rail instead.
 *
 * Everything else in the chapter is an object outline or an internal
 * division, and each of those two roles has exactly one value.
 *
 * Nothing in the chapter touches the page frame. Wherever the frame is drawn
 * (from 64rem up) every element's ink stands 11px inboard of the rail beside it
 * — the copy column and the SCATTERED terminal on the left, the header rule, the
 * drawer's right border and the FILED terminal on the right — and headline
 * line 1's terminal period stops the same 11px short of the spine. Below 64rem
 * there is no frame to clear, and the chapter's ink is on the page gutter.
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
                — the 50% line of the measure — and runs the chapter's full
                height at one constant value: top end on the header rule, bottom
                end on the state rail's track. Two things register to it without
                touching it: headline line 1's terminal period stops 11px short
                of it, and the deck column starts 16px past it — the same margin
                a filed card is given inside the drawer.

                The period used to end ON it. At a 100px cap height the dot's
                ink and a 1px rule at the same x are one shape; verified
                visually, it read as a defect. */}
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
