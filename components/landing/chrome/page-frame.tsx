import { FrameExtent } from "@/components/landing/chrome/frame-extent"
import base from "@/components/landing/styles/base.module.css"

/**
 * The page frame.
 *
 * Two continuous hairlines pinned to the shared content measure
 * (`max-w-[1440px]` + `px-5 md:px-10`), so every chapter is seen to live
 * inside one deliberate column instead of floating in unbounded field.
 *
 * Deliberately non-invasive: `pointer-events: none`, painted above the section
 * fields but below the command strip — so the header's measure rule reads as
 * the frame's top edge and nothing in any chapter has to move. Off below 64rem,
 * where the gutter is too narrow for a frame to mean anything.
 *
 * The rails are anchored in the document, not in the viewport, so the frame is
 * a closed rectangle: the top of each rail meets the header rule and the
 * bottom meets the footer rule. `FrameExtent` supplies the only measurement
 * CSS cannot make on its own — where the footer starts.
 *
 * Four elements, two jobs:
 *
 * - The **mattes** own the two outer gutters, plus the rail's own column. They
 *   are what makes the frame a boundary instead of a line drawn on a field that
 *   carries on past it: measured at 1440 before this pass, a chapter's radial
 *   field ran 40px past the frame on both sides, so the ground outside the
 *   frame read 7,14,10 on the left and up to 25,31,27 on the right.
 * - The **rails** are then plain `--lp-chrome-rule` — alpha, like every other
 *   hairline on the page — because the matte guarantees what is underneath
 *   them. That is what lets one declaration be both a single rendered value
 *   down the whole document and a single constant step over its local ground.
 *   They were opaque for two rounds because three chapters draw their own
 *   vertical border on exactly this measure and a translucent rail landing on
 *   one of those doubled; those borders are behind the matte now.
 *
 * See the `.frameMatte` / `.frameRail` notes in `base.module.css` for the
 * measurements and for what the matte covers.
 */
export function PageFrame() {
  return (
    <div aria-hidden="true">
      <FrameExtent />
      <span className={base.frameMatte} data-side="start" />
      <span className={base.frameMatte} data-side="end" />
      <span className={base.frameRail} data-side="start" />
      <span className={base.frameRail} data-side="end" />
    </div>
  )
}
