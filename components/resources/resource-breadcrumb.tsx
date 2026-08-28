import Link from "next/link"

import { resourcePaths } from "@/lib/seo/resources"
import { cn } from "@/lib/utils"

/**
 * The breadcrumb every page under the resource hub renders.
 *
 * These pages used to declare the home as their parent (`Home / <page>`) while
 * `/resources` is what lists them, promotes them, and receives their up-link.
 * Stating the real parent here, and in the `BreadcrumbList` the same pages
 * emit, is the only place the site says the hub is a hub: there is no
 * horizontal nav with dropdowns to say it anywhere else.
 */
export function ResourceBreadcrumb({
  page,
  className,
}: {
  /** Label of the current page, the last crumb. */
  page: string
  className?: string
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex flex-wrap items-center gap-2 text-sm text-muted-foreground",
        className,
      )}
    >
      <Link href="/" className="transition-colors hover:text-foreground">
        Home
      </Link>
      <span aria-hidden="true">/</span>
      <Link
        href={resourcePaths.index}
        className="transition-colors hover:text-foreground"
      >
        Resources
      </Link>
      <span aria-hidden="true">/</span>
      <span aria-current="page">{page}</span>
    </nav>
  )
}
