import shared from "@/components/landing/landing-shared.module.css"
import styles from "@/components/landing/sections/pricing.module.css"

/** Pricing — the zero monument. */
export function Pricing() {
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className={`${styles.pricingSection} ${shared.grain} scroll-mt-14`}
      data-motion-group="pricing"
      data-chapter-target="pricing"
    >
      <div className="mx-auto w-full max-w-[1440px] px-5 py-20 md:px-10 md:py-28 lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.65fr)] lg:items-end lg:gap-6">
        <div className={styles.pricingZeroWrap} aria-hidden="true">
          <p className={styles.pricingZero}>0</p>
          <p className={styles.pricingZeroLayer} data-layer="alert">
            0
          </p>
          <p className={styles.pricingZeroLayer} data-layer="ink">
            0
          </p>
        </div>

        <div className={`${styles.pricingCopy} mt-12 max-w-lg lg:mt-0 lg:pb-3`}>
          <h2
            id="pricing-heading"
            className={`${styles.pricingMessage} text-balance text-5xl font-semibold leading-[0.94] tracking-display md:text-7xl`}
          >
            Free. Forever.
          </h2>
          <p className={`${styles.pricingMessage} mt-6 text-xl leading-relaxed md:text-2xl`}>
            Skills Board is free to use and open source.
          </p>
          <p
            className={`${styles.pricingNote} ${styles.pricingNoteRule} mt-8 pt-5 font-mono text-sm font-semibold tracking-[0.02em]`}
          >
            No trial. No credit card. No paid tier.
          </p>
        </div>
      </div>
    </section>
  )
}
