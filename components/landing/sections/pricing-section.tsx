import type { CSSProperties } from "react"

import styles from "@/components/landing/styles/pricing.module.css"

/** The three absences, kept verbatim — set as a spec ledger. */
const ledger = ["No trial.", "No credit card.", "No paid tier."] as const

/** Outer contour and counter of the numeral, as one even-odd path. */
const ZERO_FILL =
  "M10 276A190 266 0 1 0 390 276A190 266 0 1 0 10 276Z" +
  "M110 276A90 188 0 1 0 290 276A90 188 0 1 0 110 276Z"

/** An out-of-register underplate: the numeral, printed in a second ink. */
function GhostPlate({ plate }: { plate: "warm" | "cool" }) {
  return (
    <path
      className={styles.zeroGhost}
      data-plate={plate}
      d={ZERO_FILL}
      fillRule="evenodd"
    />
  )
}

/** Pricing — the zero monument, pulled as a three-plate proof. */
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
      <div className={styles.rails} aria-hidden="true">
        <span className={styles.rail} />
        <span className={styles.rail} />
      </div>

      <div className={styles.sticky}>
        <div className={styles.frame}>
          <span className={styles.crop} data-corner="tl" aria-hidden="true" />
          <span className={styles.crop} data-corner="tr" aria-hidden="true" />
          <span className={styles.crop} data-corner="bl" aria-hidden="true" />
          <span className={styles.crop} data-corner="br" aria-hidden="true" />

          {(["t", "b"] as const).map((pos) => (
            <svg
              key={pos}
              className={styles.regTarget}
              data-pos={pos}
              viewBox="0 0 16 16"
              aria-hidden="true"
              focusable="false"
            >
              <circle cx="8" cy="8" r="4.25" />
              <path d="M8 0v4M8 12v4M0 8h4M12 8h4" />
            </svg>
          ))}

          <div className={styles.plate}>
            <p className={styles.plateIndex} aria-hidden="true">
              <span className={styles.plateNum} data-decode="">
                04
              </span>
              <span className={styles.plateHair} />
              <span className={styles.plateName}>Pricing</span>
              <span className={styles.plateHair} data-flex="" />
              <span className={styles.plateSwatches}>
                <span className={styles.swatch} data-plate="warm" />
                <span className={styles.swatch} data-plate="cool" />
                <span className={styles.swatch} data-plate="key" />
              </span>
            </p>

            <div className={styles.body}>
              <div className={styles.monument}>
                <svg
                  className={styles.zero}
                  viewBox="8 0 392 552"
                  preserveAspectRatio="xMinYMid meet"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    className={styles.zeroInk}
                    d={ZERO_FILL}
                    fillRule="evenodd"
                  />
                  <rect
                    className={styles.zeroSqueegee}
                    x="0"
                    y="0"
                    width="400"
                    height="552"
                  />
                  <rect
                    className={styles.zeroNip}
                    x="0"
                    y="6"
                    width="2.5"
                    height="540"
                  />
                  <GhostPlate plate="warm" />
                  <GhostPlate plate="cool" />
                  <g className={styles.zeroPlate} data-plate="key">
                    <ellipse
                      className={styles.zeroEdge}
                      cx="200"
                      cy="276"
                      rx="190"
                      ry="266"
                      pathLength="1"
                    />
                    <ellipse
                      className={styles.zeroEdge}
                      cx="200"
                      cy="276"
                      rx="90"
                      ry="188"
                      pathLength="1"
                      style={{ transitionDelay: "120ms" }}
                    />
                  </g>
                </svg>
              </div>

              <div className={styles.copy}>
                <h2 id="pricing-heading" className={styles.heading}>
                  Free. Forever.
                </h2>
                <p className={styles.lede}>
                  Skills Board is free to use and open source.
                </p>
              </div>
            </div>

            <ul className={styles.ledger}>
              {ledger.map((line, index) => (
                <li
                  key={line}
                  className={styles.ledgerRow}
                  style={{ "--i": index } as CSSProperties}
                >
                  <span className={styles.ledgerTick} aria-hidden="true" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
