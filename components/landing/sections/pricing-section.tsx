import type { CSSProperties } from "react"

import styles from "@/components/landing/styles/pricing.module.css"

/** The three absences, kept verbatim — ruled as a spec ledger. */
const ledger = ["No trial.", "No credit card.", "No paid tier."] as const

/**
 * The numeral: outer contour and counter as one even-odd path.
 * Box is 380 × 532 — the letterform ratio the whole plate is derived from.
 */
const ZERO =
  "M0 266A190 266 0 1 0 380 266A190 266 0 1 0 0 266Z" +
  "M93 266A97 191 0 1 0 287 266A97 191 0 1 0 93 266Z"

/**
 * Pricing — one printed plate.
 *
 * The chapter inverts as an *object*: a plate laid inside the page frame, with
 * the frame's rails running past it on both sides. One derived grid holds it:
 * the column rule sits at exactly two fifths of the plate, the numeral is drawn
 * to fill that column and overshoots every boundary it has by the same 5px —
 * crossing the head rule and the column rule, running off the left and bottom
 * trim — and the display line is set to the measure of the column it lives in.
 * The plate is trimmed on its last rule, so nothing ends in dead air. The only
 * motion is the press run: rules scribe, then the key ink is pulled across the
 * numeral. Rests finished with no JS and under reduced motion.
 */
export function PricingSection() {
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className={`${styles.pricingSection} scroll-mt-14`}
      data-motion-group="pricing"
      data-chapter-target="pricing"
      data-scroll-chapter="pricing"
    >
      <div className={styles.sticky}>
        <div className={styles.frame}>
          <div className={styles.plate}>
            <span className={styles.indexNum} aria-hidden="true" data-decode="">
              04
            </span>
            <span className={styles.indexName} aria-hidden="true">
              Pricing
            </span>

            <span className={styles.ruleTop} aria-hidden="true" />

            <div className={styles.numeral} aria-hidden="true">
              <svg
                className={styles.zero}
                viewBox="0 0 380 532"
                preserveAspectRatio="none"
                focusable="false"
              >
                <path d={ZERO} fillRule="evenodd" />
              </svg>
              <span className={styles.wipe} />
              <span className={styles.nip} />
            </div>

            <div className={styles.column}>
              <div className={styles.statement}>
                {/* The two capital F's carry the setting's negative tracking on a
                    pair the face already draws tight; they get it back. */}
                <h2 id="pricing-heading" className={styles.heading}>
                  <span className={styles.kern}>F</span>ree.{" "}
                  <span className={styles.kern}>F</span>orever.
                </h2>
                <p className={styles.lede}>
                  Skills Board is free to use and open source.
                </p>
              </div>

              <ul className={styles.spec}>
                {ledger.map((line, index) => (
                  <li
                    key={line}
                    className={styles.specRow}
                    style={{ "--i": index } as CSSProperties}
                  >
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
