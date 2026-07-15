import type { SVGProps } from "react"

export function BrandMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M3 3h26v7H11v4h14l4 4v11H3v-7h18v-4H7l-4-4V3Z"
        fill="currentColor"
      />
    </svg>
  )
}
