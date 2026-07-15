import Link from "next/link"

import { BrandMark } from "@/components/brand-mark"

export function Brand() {
  return (
    <Link
      href="/"
      className="group flex shrink-0 items-center gap-2.5 whitespace-nowrap"
      aria-label="Skills Board home"
    >
      <BrandMark className="brand-mark size-7 transition-transform duration-150 ease-out group-active:scale-[0.94]" />
      <span className="text-[1.05rem] font-semibold leading-none tracking-[-0.04em]">Skills Board</span>
    </Link>
  )
}
