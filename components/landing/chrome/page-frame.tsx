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
 * ink is `mix-blend-mode: difference`, which keeps the rails visible across
 * the inverted pricing plate in both themes without a second layer. Off below
 * 64rem, where the gutter is too narrow for a frame to mean anything.
 */
export function PageFrame() {
  return (
    <div aria-hidden="true">
      <span className={base.frameRail} data-side="start" />
      <span className={base.frameRail} data-side="end" />
    </div>
  )
}
