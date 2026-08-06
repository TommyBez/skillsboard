import type { CSSProperties } from "react"

import { DecodeText } from "@/components/landing/decode-text"

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
      className="lp-pricing relative scroll-mt-14"
      data-motion-group="pricing"
      data-motion-state="pending"
      data-chapter-target="pricing"
      data-scroll-chapter="pricing"
    >
      <div className="lp-pricing-stage relative flex items-center">
        <div className="mx-auto w-full max-w-[1440px] px-[var(--gutter)]">
          <div className="lp-pricing-plate">
            <DecodeText
              className="lp-pricing-index-num"
              aria-hidden="true"
              text="04"
            />
            <span className="lp-pricing-index-name" aria-hidden="true">
              Pricing
            </span>

            <span className="lp-pricing-rule-top" aria-hidden="true" />

            <div className="lp-pricing-numeral" aria-hidden="true">
              <svg
                className="block size-full fill-[var(--plate-key)]"
                viewBox="0 0 380 532"
                preserveAspectRatio="none"
                focusable="false"
              >
                <path d={ZERO} fillRule="evenodd" />
              </svg>
              <span className="lp-pricing-wipe" />
              <span className="lp-pricing-nip" />
            </div>

            <div className="lp-pricing-column">
              <div className="lp-pricing-statement">
                {/* The face draws F+r and F+o tight already, so the display
                    line's -0.038em made those two pairs read tighter than every
                    other pair in the line. The two capital F's get most of it
                    back. */}
                <h2 id="pricing-heading" className="lp-pricing-heading">
                  <span className="tracking-[-0.012em]">F</span>ree.{" "}
                  <span className="tracking-[-0.012em]">F</span>orever.
                </h2>
                <p className="lp-pricing-lede">
                  Skills Board is free to use and open source.
                </p>
              </div>

              <ul className="grid list-none md:grid-rows-3">
                {ledger.map((line, index) => (
                  <li
                    key={line}
                    className="lp-pricing-spec-row"
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
