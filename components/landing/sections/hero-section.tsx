import { Suspense } from "react"

import { HeroBoard } from "@/components/landing/hero-board"
import { HomeCtaFallback, HomeHeroActions } from "@/components/landing/landing-ctas"
import base from "@/components/landing/styles/base.module.css"
import styles from "@/components/landing/styles/hero.module.css"

/** Hero — sticky chapter: scattered dossiers file into the team library. */
export function HeroSection() {
  return (
    <section
      id="intro"
      className={styles.hero}
      data-hero-scene
      data-chapter-target="intro"
    >
      <div className={`${styles.heroSticky} ${base.grain}`}>
        <div className="relative mx-auto flex h-full w-full max-w-[1440px] flex-col justify-center px-5 py-14 md:px-10 lg:py-16">
          <div className={styles.heroGridLines} aria-hidden="true" />

          <div className={`${styles.heroExit} relative z-0`}>
            <p className={styles.heroEyebrow} data-decode="">
              Skills selected by your team
            </p>
            <h1
              className={`${styles.heroHeadline} mt-6 text-[clamp(2.75rem,8.4vw,8.75rem)] font-semibold leading-[0.92] tracking-[-0.045em]`}
            >
              <span className={styles.heroLineMask}>
                <span className={`${styles.heroLine} ${styles.heroLineFirst}`}>
                  Your team&apos;s skills.
                </span>
              </span>
              <span className={styles.heroLineMask}>
                <span
                  className={`${styles.heroLine} ${styles.heroLineSecond} text-primary`}
                >
                  All in one place.
                </span>
              </span>
            </h1>
          </div>

          <div
            className={`${styles.heroExit} relative z-10 mt-9 lg:mt-12 lg:max-w-[34rem]`}
          >
            <p
              className={`${styles.heroCopy} max-w-[34rem] text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl`}
            >
              Build a shared, searchable library so everyone knows which skills
              to use and where to find them.
            </p>
            <div className={`${styles.heroCta} mt-7`}>
              <Suspense fallback={<HomeCtaFallback />}>
                <HomeHeroActions />
              </Suspense>
            </div>
          </div>

          <HeroBoard />
        </div>
      </div>
    </section>
  )
}
