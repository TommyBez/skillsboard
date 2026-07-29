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
        {/* Chapter strip, same grammar as 03 (MCP) and 04 (pricing). It is
            symmetric by construction: a tabular numeral on each frame rail,
            a 36px hair inboard of each, and one long hair spanning the rest.
            Its rule is the register's head rule and runs the whole measure,
            so both columns hang from one edge. */}
        <p className={styles.faqStrip} aria-hidden="true">
          <span className={styles.faqStripNum} data-decode="">
            05
          </span>
          <span className={styles.faqStripHair} />
          <span className={styles.faqStripName}>FAQ</span>
          <span className={styles.faqStripHair} data-flex="" />
          <span className={styles.faqStripKey}>entry</span>
          <span className={styles.faqStripHair} />
          {/* Value is set from CSS by :has() on the open entry — a real
              readout of the register's state, with no JS. It rests on "00",
              a value, never on a placeholder dash. */}
          <span className={styles.faqStripReadout}>
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
              agent setups, and{" "}
              <span className={styles.faqNoBreak}>what “recommended”</span>{" "}
              means.
            </p>

            {/* Counterweight: the title column's footer, cut to whole register
                rows so its rule lands ON a row rule rather than beside one.
                A legend line, then eight stations — one per entry, on the
                register's own pitch, standing on the foot rule. The open one
                fills with the accent from the top down, the same gesture as
                the open row's segment across the divider. */}
            <div className={styles.faqMap} aria-hidden="true">
              <p className={styles.faqMapLegend}>
                <span className={styles.faqMapLabel}>index</span>
                <span className={styles.faqMapLead} />
                <span className={styles.faqMapTotal}>{entryCount}</span>
              </p>
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
              // scannable index. No JS involved. Entry 01 rests open, so the
              // chapter shows its own primary interaction at rest.
              <details
                key={faq.question}
                name="faq-index"
                open={index === 0}
                className={`faq-disclosure ${styles.faqItem}`}
              >
                <summary className={styles.faqSummary}>
                  <span className={styles.faqNum} aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.faqQuestion}>{faq.question}</span>
                  {/* Leader: ties the entry to its control the way a contents
                      page ties a title to its folio. Its dots are phased from
                      the right edge, so eight ragged lengths still resolve
                      into one aligned field of columns. */}
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
