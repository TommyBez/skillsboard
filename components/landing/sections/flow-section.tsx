import type { CSSProperties, ReactNode } from "react"

import { DecodeText } from "@/components/landing/decode-text"
import {
  PasteResolveVisual,
  RouteFanVisual,
  SearchFilterVisual,
} from "@/components/landing/flow/flow-visuals"
import base from "@/components/landing/styles/base.module.css"
import styles from "@/components/landing/styles/flow.module.css"

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
    copy: "Open the source, copy the install command, download a ZIP, or let your agent fetch it over MCP.",
    visual: <RouteFanVisual />,
  },
]

/** Workflow — three moves, indexed like a manual, each one demonstrated. */
export function FlowSection() {
  return (
    <section
      id="flow"
      aria-labelledby="flow-heading"
      className={`${styles.flowSection} scroll-mt-14`}
      data-chapter-target="flow"
    >
      {/* No bottom padding: the panel's own closing rule IS the chapter's, so
          the chapter never ends with an empty band trapped between two rules. */}
      <div
        className="relative mx-auto w-full max-w-[1440px] px-5 pt-16 md:px-10 md:pt-24"
        data-motion-group="flow"
      >
        <div className={styles.flowHead}>
          <div className={styles.flowMarkRow}>
            <span className={styles.flowIndex} aria-hidden="true">
              02
            </span>
            {/* The chapter head is the same object the three columns close
                with: caption, hairline, measured value. Top and bottom of the
                chapter now rhyme instead of the top being bare text. The value
                sits outside the decoded label — DecodeText rewrites its own
                text, so anything nested inside it would be destroyed. */}
            <div className={styles.flowMarkLine}>
              <DecodeText
                as="p"
                className={`${base.chapterMark} ${styles.flowMark} uppercase`}
                text="How it works"
              />
              <span className={styles.flowMarkVal} aria-hidden="true">
                3 steps
              </span>
            </div>
          </div>
          <h2
            id="flow-heading"
            className={`${styles.flowTitle} max-w-[18ch] text-balance text-4xl font-semibold leading-[1.0] tracking-display md:text-6xl`}
          >
            Save once. Find fast. Use it your way.
          </h2>
        </div>

        <ol className={styles.flowGrid}>
          {flowSteps.map((step, i) => (
            <li
              key={step.title}
              className={styles.flowStep}
              style={{ "--c": i } as CSSProperties}
            >
              <span className={styles.stepIndex} aria-hidden="true">
                {step.index}
                <span className={styles.stepIndexOf}>/3</span>
              </span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepCopy}>{step.copy}</p>
              {step.visual}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
