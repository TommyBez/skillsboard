import styles from "@/components/landing/sections/faq.module.css"
import { landingFaqs } from "@/lib/seo/landing-faq"
import { siteConfig } from "@/lib/site"

/** FAQ — technical index. */
export function Faq() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className={`${styles.faq} lp-section scroll-mt-14`}
    >
      <div className="lp-container">
        <div className={`lp-grid ${styles.faqLayout}`}>
          {/* Sticky on desktop: the list is twice the column's height, so a
              static heading strands the left half of the section empty. */}
          <div className={styles.faqIntro}>
            <h2 id="faq-heading" className="lp-d2">
              Common questions
            </h2>
            <p className={`lp-lead ${styles.faqLede}`}>
              Straight answers about what Skills Board is, how it fits mixed
              agent setups, and what “recommended” means.
            </p>
            <p className={`lp-small ${styles.faqAside}`}>
              Something we have not answered?{" "}
              <a
                className={styles.faqLink}
                href={`${siteConfig.githubUrl}/discussions`}
                rel="noreferrer"
                target="_blank"
              >
                Ask in the repo discussions
              </a>
              .
            </p>
          </div>

          <div className={styles.faqList}>
            {landingFaqs.map((faq) => (
              <details
                key={faq.question}
                className={`faq-disclosure ${styles.faqItem}`}
              >
                <summary className={styles.faqSummary}>
                  <span className={`lp-h1 ${styles.faqQuestion}`}>
                    {faq.question}
                  </span>
                  <span className={styles.faqGlyph} aria-hidden="true" />
                </summary>
                <p className={`lp-body ${styles.faqAnswer}`}>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
