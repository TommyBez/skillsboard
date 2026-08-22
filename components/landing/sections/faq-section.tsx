import { landingFaqs } from "@/lib/seo/landing-faq"

/** FAQ — chapter 05, set as a ruled register. */
export function FaqSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative scroll-mt-14"
      data-chapter-target="faq"
    >
      <div
        className="lp-faq-inner"
        data-motion-group="faq"
        data-motion-state="pending"
      >
        {/* Chapter strip, same grammar as 03 (MCP) and 04 (pricing). */}
        <p className="lp-faq-strip" aria-hidden="true">
          <span className="lp-faq-strip-hair" />
          <span className="lp-faq-strip-name">FAQ</span>
          <span className="lp-faq-strip-hair" data-flex="" />
        </p>

        <div className="lp-faq-body">
          <div className="lp-faq-aside">
            <h2 id="faq-heading" className="lp-faq-heading">
              Common questions
            </h2>
            <p className="lp-faq-intro">
              Straight answers about what Skills Board is, how it fits mixed
              agent setups, and{" "}
              <span className="whitespace-nowrap">what a saved skill</span>{" "}
              does and does not mean.
            </p>

            {/* Counterweight: the title column's footer. Eight stations — one
                per entry — light with the open row, no ordinals required. */}
            <div className="lp-faq-map" aria-hidden="true">
              <span className="lp-faq-map-scale">
                {landingFaqs.map((faq) => (
                  <span key={faq.question} className="lp-faq-map-tick" />
                ))}
              </span>
            </div>
          </div>

          <div className="lp-faq-index">
            {/* Minor vertical between the leader field and the control column,
                so the toggles stand in a ruled cell instead of floating off
                the right rail. */}
            <span className="lp-faq-ctrl-rule" aria-hidden="true" />
            {landingFaqs.map((faq, index) => (
              // Native exclusive disclosure: opening an entry closes the last
              // one, so the register never sprawls and the closed rows stay a
              // scannable index. No JS involved. The first entry rests open,
              // so the chapter shows its own primary interaction at rest.
              <details
                key={faq.question}
                name="faq-index"
                open={index === 0}
                className="faq-disclosure lp-faq-item"
              >
                <summary className="lp-faq-summary">
                  {/* A heading rather than a span: these eight questions are
                      the page's only third-level structure, and a reader
                      extracting the document outline — a screen reader, a
                      crawler, an agent reading the raw HTML — sees a flat page
                      without them. `summary` takes heading content, and the
                      disclosure behaviour is unchanged. */}
                  <h3 className="lp-faq-question">{faq.question}</h3>
                  {/* Leader: ties the entry to its control the way a contents
                      page ties a title to its folio. Its dots are phased from
                      the LEFT, off the ink of the question's final "?", so the
                      first dot stands one inset clear on all eight rows. */}
                  <span className="lp-faq-lead" aria-hidden="true" />
                  <span className="lp-faq-glyph" aria-hidden="true" />
                </summary>
                <div className="lp-faq-answer-wrap">
                  <p className="lp-faq-answer">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
