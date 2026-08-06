import type { CSSProperties, ReactNode } from "react"

import { DecodeText } from "@/components/landing/decode-text"
import {
  PasteResolveVisual,
  RouteFanVisual,
  SearchFilterVisual,
} from "@/components/landing/flow/flow-visuals"
import { chapterMark } from "@/components/landing/styles"

const flowSteps: ReadonlyArray<{
  index: string
  title: string
  copy: string
  visual: ReactNode
}> = [
  {
    index: "1",
    title: "Save the skill",
    copy: "Paste a GitHub skill URL you want the team to reuse. Skills Board keeps the name, description, and install command tied to it.",
    visual: <PasteResolveVisual />,
  },
  {
    index: "2",
    title: "Find it later",
    copy: "One searchable library for the whole team—no more scrolling chat history for that one link somebody posted.",
    visual: <SearchFilterVisual />,
  },
  {
    index: "3",
    title: "Use it your way",
    copy: "Open the source, copy a compatible install command, download the latest files as a ZIP, or search the same library from your connected agent.",
    visual: <RouteFanVisual />,
  },
]

/** Workflow — three moves, indexed like a manual, each one demonstrated. */
export function FlowSection() {
  return (
    <section
      id="flow"
      aria-labelledby="flow-heading"
      className="lp-flow-section scroll-mt-14"
      data-chapter-target="flow"
    >
      {/* No bottom padding: the panel's own closing rule IS the chapter's, so
          the chapter never ends with an empty band trapped between two rules. */}
      <div
        className="relative mx-auto w-full max-w-[1440px] px-5 pt-16 md:px-10 md:pt-24"
        data-motion-group="flow"
        data-motion-state="pending"
      >
        <div className="lp-flow-head">
          <div className="flex items-center gap-3">
            <span className="lp-flow-index" aria-hidden="true">
              02
            </span>
            {/* The chapter head is the same object the three columns close
                with: caption, hairline, measured value. Top and bottom of the
                chapter now rhyme instead of the top being bare text. The value
               sits outside the decoded label — DecodeText rewrites its own
               text, so anything nested inside it would be destroyed. */}
            <div className="flex min-w-0 flex-1 items-center">
              <DecodeText
                as="p"
                className={`${chapterMark} min-w-0 flex-1 uppercase`}
                text="How it works"
              />
              <span className="lp-flow-mark-val" aria-hidden="true">
                3 steps
              </span>
            </div>
          </div>
          {/* The clear space above the headline lives INSIDE its box (5rem of
              padding, pulled back out with the margin so the rendered gap to
              the caption is the 2.25rem it looks like). The heading is the
              chapter's anchor target, and a 56px sticky header sits over the
              top of the viewport: with the air outside the box, any scroll that
              parks the viewport on this element buried the first line under the
              header — 11px of clearance above the caps against 53px below,
              which is what made the chapter read as clipped at its top. With
              the air inside the box the same landing gives 33px above and 40px
              below, and nothing about the resting composition moves. */}
          <h2
            id="flow-heading"
            className="mt-[-2.75rem] pt-20 ml-[-0.042em] max-w-[18ch] text-balance text-4xl font-semibold leading-[1.0] tracking-display md:text-6xl"
          >
            Save once. Find fast. Use it your way.
          </h2>
        </div>

        <ol className="lp-flow-grid">
          {flowSteps.map((step, i) => (
            <li
              key={step.title}
              className="lp-flow-step"
              style={{ "--c": i } as CSSProperties}
            >
              <span className="lp-flow-step-index" aria-hidden="true">
                {step.index}
                <span className="lp-flow-step-index-of">/3</span>
              </span>
              <h3 className="lp-flow-step-title">{step.title}</h3>
              <p className="lp-flow-step-copy">{step.copy}</p>
              {step.visual}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
