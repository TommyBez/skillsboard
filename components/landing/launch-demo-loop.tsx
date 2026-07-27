"use client"

import { useEffect, useRef } from "react"

const loopSteps = [
  {
    index: "01",
    title: "Save",
    copy: "Add the source and the context your team needs.",
  },
  {
    index: "02",
    title: "Share",
    copy: "The recommendation becomes available to the team.",
  },
  {
    index: "03",
    title: "Find",
    copy: "A teammate searches and chooses how to use it.",
  },
] as const

export function LaunchDemoLoop() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")

    if (!video) return

    const syncPlayback = () => {
      if (reducedMotion.matches) {
        video.pause()
        video.currentTime = 0
        return
      }

      void video.play().catch(() => {
        // The poster and captions preserve the complete message if autoplay is blocked.
      })
    }

    syncPlayback()
    reducedMotion.addEventListener("change", syncPlayback)

    return () => reducedMotion.removeEventListener("change", syncPlayback)
  }, [])

  return (
    <figure className="overflow-hidden bg-card">
      <div className="relative aspect-[8/5] overflow-hidden bg-[#f4f3e9]">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          muted
          loop
          playsInline
          preload="metadata"
          poster="/launch/skills-board-team-loop-poster.jpg"
          disablePictureInPicture
          aria-describedby="launch-demo-caption"
        >
          <source src="/launch/skills-board-team-loop.mp4" type="video/mp4" />
        </video>
        <div className="pointer-events-none absolute left-3 top-3 border border-foreground/15 bg-background/92 px-3 py-2 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-foreground shadow-sm backdrop-blur-sm md:left-4 md:top-4">
          Save → share → find · 14 seconds
        </div>
      </div>

      <figcaption
        id="launch-demo-caption"
        className="grid grid-cols-3 border-t border-border"
      >
        {loopSteps.map((step, index) => (
          <div
            key={step.index}
            className={`p-3 sm:p-5 md:p-6 ${index > 0 ? "border-l border-border" : ""}`}
          >
            <p className="font-mono text-[0.65rem] font-semibold tracking-[0.16em] text-primary">
              {step.index} · {step.title}
            </p>
            <p className="mt-3 hidden text-sm leading-relaxed text-muted-foreground sm:block">
              {step.copy}
            </p>
          </div>
        ))}
      </figcaption>
    </figure>
  )
}
