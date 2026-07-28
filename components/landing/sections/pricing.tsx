import { ArrowUpRightIcon } from "lucide-react"

import styles from "@/components/landing/sections/pricing.module.css"
import { siteConfig } from "@/lib/site"

/** The three objections a reader raises at the word "free", in that order. */
const terms = ["No trial", "No credit card", "No paid tier"] as const

/**
 * Pricing — one hairline-bounded row on the normal ground. The near-black band
 * and the 56vw zero are deleted: the page carries exactly one ink-inverted
 * beat and it is the closing, not this.
 */
export function Pricing() {
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className={`${styles.pricingSection} lp-section scroll-mt-14`}
    >
      {/* Two children, 80ms apart — the controller's one reveal (§7.5). */}
      <div
        className={`${styles.pricingRow} lp-container lp-grid`}
        data-reveal="children"
      >
        <div className={styles.pricingStatement}>
          <h2 id="pricing-heading" className="lp-d2">
            Free. Forever.
          </h2>
          <p className={`${styles.pricingLead} lp-lead`}>
            Skills Board is free to use and open source.
          </p>
        </div>

        <div className={styles.pricingTerms}>
          <ul className={styles.pricingTermList}>
            {terms.map((term) => (
              <li key={term} className={`${styles.pricingTerm} lp-label`}>
                {term}
              </li>
            ))}
          </ul>
          <a
            className={`${styles.pricingCta} lp-body`}
            href={siteConfig.githubUrl}
            target="_blank"
            rel="noreferrer"
          >
            Read the source on GitHub
            <ArrowUpRightIcon
              aria-hidden="true"
              className={styles.pricingCtaIcon}
            />
          </a>
        </div>
      </div>
    </section>
  )
}
