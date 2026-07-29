import base from "@/components/landing/styles/base.module.css"

/**
 * The page frame.
 *
 * Two continuous hairlines pinned to the shared content measure
 * (`max-w-[1440px]` + `px-5 md:px-10`), so every chapter is seen to live
 * inside one deliberate column instead of floating in unbounded field.
 *
 * Deliberately non-invasive: fixed, `pointer-events: none`, painted above the
 * section fields but below the command strip — so the header's measure rule
 * reads as the frame's top edge and nothing in any chapter has to move. The
 * ink is differenced white, which keeps one alpha correct in both themes. Off
 * below 64rem, where the gutter is too narrow for a frame to mean anything.
 *
 * Each rail carries its own opaque field and isolates that ink on top of it,
 * so the rail renders one value for its whole length regardless of what is
 * behind it — measured, 98.4% of every rail pixel down the document is a
 * single number in both themes. Not cosmetic: three chapters draw their own
 * vertical border on exactly this measure, and a blended rail landing on one
 * of those rendered half again as heavy as the same rail a band earlier,
 * which read as the page frame changing weight partway down. See the
 * `.frameRail` note in `base.module.css`.
 */
export function PageFrame() {
  return (
    <div aria-hidden="true">
      <span className={base.frameRail} data-side="start" />
      <span className={base.frameRail} data-side="end" />
    </div>
  )
}
