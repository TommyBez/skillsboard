import type { ReactNode } from "react"

import { Brand } from "@/components/brand"
import styles from "@/components/landing/sections/site-header.module.css"

/**
 * Sticky command strip. `actions` carries the session-dependent nav from the
 * page, so the header itself stays free of `getSession()` calls.
 */
export function SiteHeader({ actions }: { actions: ReactNode }) {
  return (
    <header className={styles.header}>
      <div className="mx-auto flex h-14 w-full max-w-[1440px] items-center justify-between gap-4 px-5 md:px-10">
        <Brand compactOnMobile />
        {actions}
      </div>
      <span className={styles.scrollProgress} aria-hidden="true" />
    </header>
  )
}
