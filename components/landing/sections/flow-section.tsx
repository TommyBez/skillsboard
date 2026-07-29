import { Suspense, type CSSProperties, type ReactNode } from "react"

import {
  PasteResolveVisual,
  RouteFanVisual,
  SearchFilterVisual,
} from "@/components/landing/flow/flow-visuals"
import { HomeCtaFallback, HomeLaunchActions } from "@/components/landing/landing-ctas"
import { LaunchDemoLoop } from "@/components/landing/launch-demo-loop"
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

function HomeLaunchDemo() {
  return (
    <div
      id="launch-demo"
      className={`surface-shadow ${styles.launchDemo} grid scroll-mt-28 overflow-hidden border border-border bg-card lg:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)]`}
    >
      <LaunchDemoLoop />
      <div className="flex flex-col justify-center border-t border-border p-6 md:p-8 lg:border-l lg:border-t-0 lg:p-10">
        <p className={`${base.chapterMark} uppercase`}>
          Current product · synthetic demo data
        </p>
        <h3 className="mt-5 max-w-[14ch] text-balance text-3xl font-semibold leading-none tracking-display md:text-4xl">
          One teammate saves it. The next finds it.
        </h3>
        <p className="mt-5 text-pretty leading-relaxed text-muted-foreground">
          Skills Board is already available. This short walkthrough shows the
          current add → share → find loop using synthetic identities and a
          public skill.
        </p>
        <div className="mt-7">
          <Suspense fallback={<HomeCtaFallback />}>
            <HomeLaunchActions />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

/** Workflow — three moves, indexed like a manual, each one demonstrated. */
export function FlowSection({ showLaunchTreatment }: { showLaunchTreatment: boolean }) {
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
            <p
              className={`${base.chapterMark} ${styles.flowMark} uppercase`}
              data-decode=""
            >
              How it works
            </p>
          </div>
          <h2
            id="flow-heading"
            className="mt-5 max-w-[18ch] text-balance text-4xl font-semibold leading-[1.0] tracking-display md:text-6xl"
          >
            Save once. Find fast. Use it your way.
          </h2>
        </div>

        {showLaunchTreatment ? <HomeLaunchDemo /> : null}

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
