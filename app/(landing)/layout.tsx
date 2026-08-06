import { LandingMotionController } from "@/components/landing/landing-motion-controller"
import {
  ChapterRail,
  LandingFooter,
  LandingHeader,
} from "@/components/landing/sections/landing-chrome"

/**
 * The landing surface's frame: motion root, command strip, footer.
 *
 * The page composes chapters; the layout owns everything around them. The
 * route group keeps this off every other route under `app/` — the app shell,
 * auth, and the legal pages each carry their own chrome.
 */
export default function LandingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className="lp-root relative min-h-[100dvh] overflow-x-clip bg-background text-foreground"
      data-landing-motion-root
    >
      <LandingMotionController />
      <ChapterRail />

      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <LandingHeader />

      <main id="main-content">{children}</main>

      <LandingFooter />
    </div>
  )
}
