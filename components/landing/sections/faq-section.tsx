import styles from "@/components/landing/styles/faq.module.css"
import { landingFaqs } from "@/lib/seo/landing-faq"

/** FAQ — technical index. */
export function FaqSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="scroll-mt-14 border-b border-border/70"
      data-chapter-target="faq"
    >
      <div className="mx-auto grid w-full max-w-[1440px] gap-12 px-5 py-16 md:px-10 md:py-24 lg:grid-cols-[minmax(16rem,0.7fr)_minmax(28rem,1.3fr)] lg:gap-20">
        <div>
          <h2
            id="faq-heading"
            className="max-w-[14ch] text-balance text-4xl font-semibold leading-[1.0] tracking-display md:text-6xl"
          >
            Common questions
          </h2>
          <p className="mt-5 max-w-md text-pretty text-lg leading-relaxed text-muted-foreground">
            Straight answers about what Skills Board is, how it fits mixed agent
            setups, and what “recommended” means.
          </p>
        </div>

        <div className="border-t border-border/80">
          {landingFaqs.map((faq) => (
            <details
              key={faq.question}
              className={`faq-disclosure ${styles.faqItem}`}
            >
              <summary className={styles.faqSummary}>
                <span className={styles.faqQuestion}>{faq.question}</span>
                <span className={styles.faqGlyph} aria-hidden="true" />
              </summary>
              <p
                className={`${styles.faqAnswer} max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground`}
              >
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
