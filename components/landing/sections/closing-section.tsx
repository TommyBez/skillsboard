import Link from "next/link"

import { ClosingPlate } from "@/components/landing/closing/closing-plate"
import { HomeFinalActions } from "@/components/landing/landing-ctas"
import { chapterMark } from "@/components/landing/styles"
import { guidePaths } from "@/lib/seo/guides/types"

const startingGuides = [
  {
    href: guidePaths.sharedMcpSkillLibrary,
    label: "Use the team library through MCP",
  },
  {
    href: guidePaths.aiSkillUseCases,
    label: "Explore repeatable skill use cases",
  },
  {
    href: guidePaths.onboardNewTeammateSkills,
    label: "Onboard a teammate with shared skills",
  },
] as const

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
        <p className={`${chapterMark} lp-closing-mark uppercase`}>
          <span className="ml-[-0.65px]">Start</span>
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
              person can get started without asking where to look, and the{" "}
              <Link
                href="/claude-skills"
                className="underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
              >
                guide to Claude skills
              </Link>{" "}
              covers the format for anyone meeting it for the first time.
            </p>
            <nav
              aria-label="Starting guides"
              className="mt-7 flex max-w-2xl flex-wrap gap-x-6 gap-y-3 text-sm font-semibold"
            >
              {startingGuides.map((guide) => (
                <Link
                  key={guide.href}
                  href={guide.href}
                  className="inline-flex min-h-11 items-center px-2 underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
                >
                  {guide.label}
                </Link>
              ))}
            </nav>
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
