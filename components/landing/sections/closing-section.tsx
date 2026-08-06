import { ClosingPlate } from "@/components/landing/closing/closing-plate"
import { DecodeText } from "@/components/landing/decode-text"
import { HomeFinalActions } from "@/components/landing/landing-ctas"
import { chapterMark } from "@/components/landing/styles"

/** Closing — the final plate: everything indexed, one terminal action. */
export function ClosingSection() {
  return (
    <section
      id="start"
      className="lp-grain lp-closing relative scroll-mt-14"
      data-motion-group="closing"
      data-motion-state="pending"
      data-chapter-target="start"
    >
      <span className="lp-closing-field" aria-hidden="true" />

      <div className="lp-closing-inner">
        {/* The column rail: the gutter's rule, from the chapter rule down to
            the footer rule. The sheet's left border is drawn on it. */}
        <span className="lp-closing-split" aria-hidden="true" />
        {/* Chapter index, in the page's numbering: 01 hero … 06 start. Same
            mono voice, size and measure rule as every other chapter mark. */}
        <p className={`${chapterMark} lp-closing-mark uppercase`}>
          <span className="inline-flex items-center gap-[0.6rem] ml-[-0.65px]">
            <DecodeText text="06" />
            <span className="lp-closing-mark-sep" aria-hidden="true">
              ·
            </span>
            <span>Start</span>
          </span>
        </p>

        <div className="lp-closing-grid">
          <div className="lp-closing-main">
            <h2
              className="lp-closing-heading text-balance text-[clamp(2.5rem,6.1vw,5.75rem)] font-semibold leading-[0.96] tracking-display"
            >
              Answer “which skill should I use?”{" "}
              <span className="lp-closing-once-stamp">once.</span>
            </h2>
            <p
              className="lp-closing-copy mt-6 text-balance text-lg leading-relaxed text-muted-foreground"
            >
              Save the recommendation where the whole team can find it. The next
              person can get started without asking where to look.
            </p>
          </div>

          <ClosingPlate />

          {/* Terminal action. Third grid child so that it is the last thing on
              the page in the single-column layout too, and so the plate can
              span both rows beside it at desktop widths. */}
          <div className="lp-closing-cta">
            <HomeFinalActions />
          </div>
        </div>
      </div>
    </section>
  )
}
