import Link from "next/link"

import { BrandMark } from "@/components/brand-mark"

/**
 * `compactOnMobile` tucks the wordmark away on narrow viewports: the default
 * `true` only below 360px (marketing chrome, which has room beside it), `"sm"`
 * until the sm breakpoint (app chrome, which packs the switcher and controls
 * onto the same row — with the wordmark shown a phone-width row overflows and
 * drags the layout viewport wide).
 */
export function Brand({ compactOnMobile = false }: { compactOnMobile?: boolean | "sm" } = {}) {
  const wordmarkVisibility =
    compactOnMobile === "sm"
      ? "hidden sm:inline"
      : compactOnMobile
        ? "hidden min-[360px]:inline"
        : ""

  return (
    <Link
      href="/"
      className="group flex min-h-11 min-w-11 shrink-0 items-center gap-2.5 whitespace-nowrap"
      aria-label="Skills Board home"
    >
      <BrandMark className="brand-mark size-7 transition-transform duration-150 ease-out group-active:scale-[0.94]" />
      <span
        className={`${wordmarkVisibility} text-[1.05rem] font-semibold leading-none tracking-[-0.04em]`}
      >
        Skills Board
      </span>
    </Link>
  )
}
