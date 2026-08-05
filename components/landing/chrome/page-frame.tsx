import { FrameExtent } from "@/components/landing/chrome/frame-extent"

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
 * ONE RECTANGLE, ONE NUMBER, FOUR EDGES — and, now, ONE GROUND.
 *
 * Round 3 made the rails opaque (`--lp-chrome-rule` over a backdrop of the
 * page's own field) because a translucent rail landing on a chapter's own
 * vertical border rendered half again as heavy as the same rail a band earlier:
 * measured, 46.8 down the hero against 71.9 through the MCP chapter, on a line
 * that is meant to be one continuous edge.
 *
 * Round 5 found the other half of the same problem. The rails printed a
 * constant 60,65,60, but the *ground* they were drawn against did not: the left
 * gutter measured 7,14,10 at every depth while the right measured up to
 * 25,31,27, so one rule read 1.87:1 against its surroundings on the left and
 * 1.59:1 on the right. Every other hairline on the page is alpha, i.e. a
 * constant step over its local ground; an opaque rail is a constant number
 * instead, and where the ground moves the two are not the same thing.
 *
 * The two requirements only conflict when the ground moves. So fix the ground.
 * The matte lays the page's own field over both outer gutters *and* over the
 * rail's own column, and the rails go back to being what every other hairline
 * is — plain `--lp-chrome-rule`, no backdrop, alpha over its local ground.
 * Because that ground is now uniform by construction, the rail is
 * simultaneously one rendered value down the whole document and one constant
 * step over the field beside it. Measured after: 60,65,60 at every depth, left
 * and right, 1.871:1 both sides; the gutters read 7,14,10 with standard
 * deviation 0.000 at every depth. The chapter borders that used to double under
 * a translucent rail are now *behind* the matte, so they cannot.
 *
 * What the matte covers, measured on a full-document capture at 1440: the hero
 * chapter's radial field (1440 wide, so 40px past the frame; visible in the
 * right gutter y=106–765), one full-bleed 1px horizontal on the hero's bottom
 * border at y=1855, and the closing chapter's 28px dot raster from y=7752 down.
 * All three are chapter-owned and all three crossed a boundary the page claims
 * is a boundary. Nothing else lives out there — no chapter paints a deliberate
 * full-bleed plate — and the matte sits below `z-index: 21`, which is where the
 * closing headline's 2px optical overhang lives, so the type that deliberately
 * breaks the measure still paints in front.
 *
 * The cost, taken knowingly: where a chapter's display type overhangs the
 * measure by its own side bearing — the closing headline does, by ~2px — the
 * rail cuts a 1px seam through the glyph instead of ghosting it. That is the
 * frame passing in front of type that broke it, which is at least one
 * consistent story; the real fix belongs in the chapter that overhangs.
 */

/* The matte's `top-0` is deliberate — not the header height — because the strip
   is transparent at rest, so the gutter above the frame's top edge would
   otherwise show a chapter's field too. Its width is the rail's own column, so
   the rail composites over the matte and nothing else: the `50%` inside
   `--lp-frame-inset` resolves against the same containing block either way. */
const matte =
  "pointer-events-none absolute top-0 bottom-[var(--lp-frame-end,0px)] z-[19] hidden w-[calc(var(--lp-frame-inset)+1px)] bg-background lg:block"

/* Absolute, not fixed. Fixed rails cannot know where the page ends, so they ran
   from the header rule to the *viewport's* bottom edge: at the end of the
   document the frame was closed at the top and open at the bottom, with 47px of
   rail hanging below the footer rule and past the corner it was supposed to
   turn. Anchored in the document instead, the rails start on the header rule
   and stop on the footer rule, and the four edges close a rectangle. A rail is a
   straight vertical line at a constant x, so scrolling with the page rather than
   with the viewport is visually identical everywhere except at the two ends —
   which are the only places this was ever wrong. */
const rail =
  "pointer-events-none absolute top-[var(--lp-header-h)] bottom-[var(--lp-frame-end,0px)] z-20 hidden w-px bg-[var(--lp-chrome-rule)] lg:block"

export function PageFrame() {
  return (
    <div aria-hidden="true">
      <FrameExtent />
      <span className={`${matte} left-0`} />
      <span className={`${matte} right-0`} />
      <span className={`${rail} left-[var(--lp-frame-inset)]`} />
      <span className={`${rail} right-[var(--lp-frame-inset)]`} />
    </div>
  )
}
