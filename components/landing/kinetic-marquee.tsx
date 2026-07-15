"use client"

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
    <div aria-hidden className="overflow-hidden border-y border-border/60 bg-card py-4">
      <div className="animate-marquee flex w-max">
        {[0, 1].map((half) => (
          <div key={half} className="flex shrink-0 items-center">
            {ROW.map((name) => (
              <span key={`${half}-${name}`} className="flex items-center gap-6 pr-6 font-mono text-sm text-muted-foreground">
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
