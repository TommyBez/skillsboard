const ROW = [
  "find-skills",
  "design-taste-frontend",
  "commit",
  "review-pr",
  "ai-sdk",
  "agent-browser",
  "workflow",
  "charts",
  "stripe-checkout",
  "neon-auth",
]

export function KineticMarquee() {
  return (
    <div className="overflow-hidden border-b border-border/70 bg-card/65 py-4">
      <span className="sr-only">Popular skills: {ROW.join(", ")}</span>
      <div aria-hidden className="animate-marquee flex w-max">
        {[0, 1].map((half) => (
          <div key={half} className="flex shrink-0 items-center">
            {ROW.map((name) => (
              <span key={`${half}-${name}`} className="flex items-center gap-6 pr-6 font-mono text-xs font-medium text-muted-foreground md:text-sm">
                <span>{name}</span>
                <span className="text-primary">/</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
