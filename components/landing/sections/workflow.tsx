import { CopyIcon, LinkIcon, SearchIcon, TerminalIcon } from "lucide-react"
import type { ReactNode } from "react"

import { LaunchDemoLoop } from "@/components/landing/launch-demo-loop"
import styles from "@/components/landing/sections/workflow.module.css"

/**
 * One skill followed through all three moves. The fragments are the same object
 * at three moments — pasted, found, installed — so the row does the arguing
 * instead of a third sentence. Deliberately not one of the skills the hero and
 * the product slab already render (direction §10.28).
 */
const SKILL = "incident-review"
const REPO = "https://github.com/acme/oncall-skills"

const flowSteps = [
  {
    title: "Save the skill",
    copy: "Paste a GitHub URL. Skills Board keeps the name, description, and install command.",
    fragment: (
      <>
        <LinkIcon className={styles.fragmentIcon} />
        <code className={`lp-code ${styles.fragmentText}`}>{REPO}</code>
      </>
    ),
  },
  {
    title: "Find it later",
    copy: "One searchable library for the whole team. No more scrolling chat for that link.",
    fragment: (
      <>
        <SearchIcon className={styles.fragmentIcon} />
        <code className={`lp-code ${styles.fragmentText}`}>{SKILL}</code>
        <span className={`lp-code ${styles.fragmentMeta}`}>acme/oncall-skills</span>
      </>
    ),
  },
  {
    title: "Use it your way",
    copy: "Copy the install command, open the source, grab a ZIP, or let your agent fetch it.",
    fragment: (
      <>
        <TerminalIcon className={styles.fragmentIcon} />
        <code className={`lp-code ${styles.fragmentText}`}>
          {`npx skills add ${REPO} --skill ${SKILL}`}
        </code>
        <CopyIcon className={styles.fragmentIcon} />
      </>
    ),
  },
] as const

/** Gated launch treatment: the current-product walkthrough loop. */
function LaunchDemo({ actions }: { actions: ReactNode }) {
  return (
    <div
      id="launch-demo"
      className={`${styles.launchDemo} scroll-mt-28`}
      data-reveal
    >
      <LaunchDemoLoop />
      <div className={styles.launchCopy}>
        <p className={`lp-label ${styles.eyebrow}`}>
          Current product · synthetic demo data
        </p>
        <h3 className={`lp-h1 ${styles.launchTitle}`}>
          One teammate saves it. The next finds it.
        </h3>
        <p className={`lp-body ${styles.launchBody}`}>
          Skills Board is already available. This short walkthrough shows the current add → share → find loop using synthetic identities and a public skill.
        </p>
        <div className={styles.launchActions}>{actions}</div>
      </div>
    </div>
  )
}

/**
 * Workflow — three moves, indexed like a manual. Numbered because Save → Find →
 * Use is a real sequence, not three parallel features. `launchActions` carries
 * the session-dependent CTA for the gated demo block from the page.
 */
export function Workflow({
  showLaunchDemo,
  launchActions,
}: {
  showLaunchDemo: boolean
  launchActions: ReactNode
}) {
  return (
    <section
      id="flow"
      aria-labelledby="flow-heading"
      className={`${styles.section} lp-section scroll-mt-14`}
    >
      <div className="lp-container">
        <div className={styles.head} data-reveal>
          <p className={`lp-label ${styles.eyebrow}`}>How it works</p>
          <h2 id="flow-heading" className="lp-d2">
            Save once. Find fast.
          </h2>
        </div>

        {showLaunchDemo ? <LaunchDemo actions={launchActions} /> : null}

        {/* The three rows stagger against each other; the head enters alone. */}
        <ol className={styles.steps} data-reveal="children">
          {flowSteps.map((step, index) => (
            <li key={step.title} className={styles.step}>
              <h3 className={styles.heading}>
                <span className={`lp-label ${styles.index}`} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="lp-h1">{step.title}</span>
              </h3>
              <p className={`lp-body ${styles.copy}`}>{step.copy}</p>
              <span className={styles.fragment} aria-hidden="true">
                {step.fragment}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
