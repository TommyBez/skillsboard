import { home } from "@/lib/seo/home"

/**
 * Related resources: the home page's own index, in the HTML.
 *
 * `lib/seo/home` has carried this block since the home page got a Markdown
 * twin, and until now only the twin and the web MCP tool read it: `/index.md`
 * listed five destinations that `/` did not link to. Same page, two link
 * graphs, depending on who asked for it. This renders the block from that one
 * definition, so adding or removing an entry moves the HTML and the twin
 * together.
 *
 * Read as a colophon rather than a chapter: no chapter mark and no rule of its
 * own. The closing band is bounded by the chapter rule above it and the
 * footer's measure rule below it, and a third hairline in that gap would read
 * as a seam. The label is the footer nav's own type, one step wider, so the
 * band belongs to the colophon it sits on. It takes a stacking context because
 * the footer paints its field 5rem up into this band.
 *
 * Plain anchors, not `Link`: `/llms.txt` is a static file rather than a route,
 * and the 404's recovery list (`lib/agent-recovery`) already lists it beside
 * routes this way.
 */
export function RelatedResourcesSection() {
  return (
    <section className="relative z-10">
      <div className="mx-auto w-full max-w-[var(--lp-measure)] px-[calc(var(--lp-gutter)+1.5rem)] pb-14 lg:px-[calc(var(--lp-gutter)+1.75rem)] min-[84rem]:px-[calc(var(--lp-gutter)+2rem)]">
        <nav aria-labelledby="home-related-resources">
          <h2
            id="home-related-resources"
            className="font-mono text-[0.675rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground"
          >
            {home.relatedTitle}
          </h2>
          <ul className="mt-6 grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2">
            {home.related.map((entry) => (
              <li key={entry.href} className="leading-relaxed">
                <a
                  href={entry.href}
                  className="font-semibold underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
                >
                  {entry.label}
                </a>
                <span className="block text-sm text-muted-foreground">
                  {entry.description}
                </span>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  )
}
