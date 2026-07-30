import styles from "@/components/landing/styles/faq.module.css"
import { landingFaqs } from "@/lib/seo/landing-faq"

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
        {/* Chapter strip, same grammar as 03 (MCP) and 04 (pricing). */}
        <p className={styles.faqStrip} aria-hidden="true">
          <span className={styles.faqStripNum} data-decode="">
            05
          </span>
          <span className={styles.faqStripHair} />
          <span className={styles.faqStripName}>FAQ</span>
          <span className={styles.faqStripHair} data-flex="" />
        </p>

        <div className={styles.faqBody}>
          <div className={styles.faqAside}>
            <h2 id="faq-heading" className={styles.faqHeading}>
              Common questions
            </h2>
            <p className={styles.faqIntro}>
              Straight answers about what Skills Board is, how it fits mixed
              agent setups, and{" "}
              <span className={styles.faqNoBreak}>what “recommended”</span>{" "}
              means.
            </p>

            {/* Counterweight: the title column's footer. Eight stations — one
                per entry — light with the open row, no ordinals required. */}
            <div className={styles.faqMap} aria-hidden="true">
              <span className={styles.faqMapScale}>
                {landingFaqs.map((faq) => (
                  <span key={faq.question} className={styles.faqMapTick} />
                ))}
              </span>
            </div>
          </div>

          <div className={styles.faqIndex}>
            {/* Minor vertical between the leader field and the control column,
                so the toggles stand in a ruled cell instead of floating off
                the right rail. */}
            <span className={styles.faqCtrlRule} aria-hidden="true" />
            {landingFaqs.map((faq, index) => (
              // Native exclusive disclosure: opening an entry closes the last
              // one, so the register never sprawls and the closed rows stay a
              // scannable index. No JS involved. The first entry rests open,
              // so the chapter shows its own primary interaction at rest.
              <details
                key={faq.question}
                name="faq-index"
                open={index === 0}
                className={`faq-disclosure ${styles.faqItem}`}
              >
                <summary className={styles.faqSummary}>
                  <span className={styles.faqQuestion}>{faq.question}</span>
                  {/* Leader: ties the entry to its control the way a contents
                      page ties a title to its folio. Its dots are phased from
                      the LEFT, off the ink of the question's final "?", so the
                      first dot stands one inset clear on all eight rows. */}
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
