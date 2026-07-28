import type { ReactNode } from "react"

import { Brand } from "@/components/brand"
import styles from "@/components/landing/sections/site-header.module.css"

/**
 * Sticky command strip. `actions` carries the session-dependent nav from the
 * page, so the header itself stays free of `getSession()` calls.
 *
 * The bar rides `lp-container`, not the old 1440px shell, so the wordmark
 * shares a left edge with every headline on the page (§4).
 */
export function SiteHeader({ actions }: { actions: ReactNode }) {
  return (
    <header className={styles.header}>
      <div className={`lp-container ${styles.bar}`}>
        <Brand compactOnMobile />
        {actions}
      </div>
      <span className={styles.scrollProgress} aria-hidden="true" />
    </header>
  )
}
