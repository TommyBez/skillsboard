import styles from "@/components/landing/sections/chapter-rail.module.css"

const railChapters = [
  { id: "intro", label: "Library" },
  { id: "flow", label: "Workflow" },
  { id: "mcp", label: "MCP" },
  { id: "pricing", label: "Pricing" },
  { id: "faq", label: "FAQ" },
  { id: "start", label: "Start" },
] as const

/**
 * Fixed section index. `aria-current` starts on the first chapter and is moved
 * by LandingMotionController through the `data-rail-link` hooks.
 */
export function ChapterRail() {
  return (
    <nav className={styles.rail} aria-label="Page chapters">
      {railChapters.map((chapter) => (
        <a
          key={chapter.id}
          href={`#${chapter.id}`}
          className={styles.railLink}
          data-rail-link={chapter.id}
          aria-current={chapter.id === "intro" ? "true" : undefined}
        >
          <span className={styles.railLabel}>{chapter.label}</span>
          <span className={styles.railTick} aria-hidden="true" />
        </a>
      ))}
    </nav>
  )
}
