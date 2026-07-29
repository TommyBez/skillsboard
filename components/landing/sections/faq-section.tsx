import base from "@/components/landing/styles/base.module.css"
import styles from "@/components/landing/styles/faq.module.css"
import { landingFaqs } from "@/lib/seo/landing-faq"

const entryCount = String(landingFaqs.length).padStart(2, "0")

/** FAQ — technical index. */
export function FaqSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className={`${styles.faqSection} scroll-mt-14`}
      data-chapter-target="faq"
    >
      <div className={styles.faqInner} data-motion-group="faq">
        <div className={styles.faqAside}>
          {/* No decode scramble here: the label must be readable before the
              entries it introduces, and this chapter's job is fast scanning. */}
          <p className={`${base.chapterMark} ${styles.faqMark} uppercase`}>
            05 / FAQ
          </p>
          <div className={styles.faqPlate}>
            <h2 id="faq-heading" className={styles.faqHeading}>
              Common questions
            </h2>
            <p className={styles.faqIntro}>
              Straight answers about what Skills Board is, how it fits mixed
              agent setups, and what “recommended” means.
            </p>
          </div>
          <p className={styles.faqLegend} aria-hidden="true">
            <span>Entries</span>
            <span className={styles.faqLegendRule} />
            <span className={styles.faqLegendCount}>{entryCount}</span>
          </p>
        </div>

        <div className={styles.faqIndex}>
          <span className={styles.faqIndexRule} aria-hidden="true" />

          {landingFaqs.map((faq, index) => (
            // Native exclusive disclosure: opening an entry closes the last
            // one, so the register never sprawls and the closed rows stay a
            // scannable index. No JS involved.
            <details
              key={faq.question}
              name="faq-index"
              className={`faq-disclosure ${styles.faqItem}`}
            >
              <summary className={styles.faqSummary}>
                <span className={styles.faqNum} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className={styles.faqQuestion}>{faq.question}</span>
                <span className={styles.faqGlyph} aria-hidden="true" />
              </summary>
              <div className={styles.faqAnswerWrap}>
                <p className={styles.faqAnswer}>{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
