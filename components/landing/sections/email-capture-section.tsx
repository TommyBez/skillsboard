import { EmailCaptureCard } from "@/components/email-capture-card"

/**
 * Updates: a quiet band between the FAQ register and the closing plate.
 *
 * Deliberately outside the chapter grammar: no index, no measure rule, no
 * `data-chapter-target`. The page numbers six chapters and ends on "06 ·
 * Start", and a seventh mark would renumber the argument to add a mailing
 * list. It carries the page's measure and gutters so the card sits on the same
 * column as the header wordmark and the colophon below it.
 */
export function EmailCaptureSection() {
  return (
    <section id="updates" className="relative scroll-mt-14">
      <div className="mx-auto w-full max-w-[1440px] px-5 pt-16 md:px-10 md:pt-20">
        <EmailCaptureCard className="mx-auto max-w-3xl" source="landing" />
      </div>
    </section>
  )
}
