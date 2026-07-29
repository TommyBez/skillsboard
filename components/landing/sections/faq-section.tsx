import styles from "@/components/landing/styles/faq.module.css"
import { landingFaqs } from "@/lib/seo/landing-faq"

const entryCount = String(landingFaqs.length).padStart(2, "0")

/** FAQ — chapter 05, set as a ruled register. */
export function FaqSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className={`${styles.faqSection} scroll-mt-14`}
      data-chapter-target="faq"
    >
      <div className={styles.faqInner} data-motion-group="faq">
        {/* Chapter strip, same grammar as 03 (MCP) and 04 (pricing): index,
            hairline, name, then an instrument readout on the far end. Its
            rule is the register's head rule and runs the whole measure, so
            both columns hang from one edge. */}
        <p className={styles.faqStrip} aria-hidden="true">
          <span className={styles.faqStripNum} data-decode="">
            05
          </span>
          <span className={styles.faqStripHair} />
          <span className={styles.faqStripName}>FAQ</span>
          <span className={styles.faqStripHair} data-flex="" />
          <span className={styles.faqStripReadout}>
            <span className={styles.faqStripKey}>entry</span>
            {/* Value is set from CSS by :has() on the open entry — a real
                readout of the register's state, with no JS. */}
            <span className={styles.faqStripValue} />
            <span className={styles.faqStripTotal}>/ {entryCount}</span>
          </span>
        </p>

        <div className={styles.faqBody}>
          <div className={styles.faqAside}>
            <h2 id="faq-heading" className={styles.faqHeading}>
              Common questions
            </h2>
            <p className={styles.faqIntro}>
              Straight answers about what Skills Board is, how it fits mixed
              agent setups, and what “recommended” means.
            </p>
          </div>

          <div className={styles.faqIndex}>
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
                  {/* Leader: ties the entry to its control the way a contents
                      page ties a title to its folio. */}
                  <span className={styles.faqLead} aria-hidden="true" />
                  <span className={styles.faqGlyph} aria-hidden="true" />
                </summary>
                <div className={styles.faqAnswerWrap}>
                  <p className={styles.faqAnswer}>{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
