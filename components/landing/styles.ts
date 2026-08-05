/**
 * Shared Tailwind recipes for the marketing surface.
 *
 * What lives here: a class list used by more than one chapter that has a
 * complete utility spelling. What does not: anything the chapters' stylesheets
 * under `app/styles/landing/` still own — derived geometry, the plates and
 * rules drawn as pseudo-elements, keyframes, and the descendant selectors the
 * motion controller drives.
 *
 * These are plain strings rather than a `cva` config on purpose: they take no
 * variants, and every consumer composes them with a chapter class that has to
 * be able to override them.
 */

/**
 * Chapter index annotation — a thin technical mark, decorative only, ruled off
 * to the end of its column.
 *
 * The one odd number is the rule's negative margin. Tracked caps carry their
 * letter-space after the final glyph, so a 0.75rem gap measured box-to-box
 * reads as 0.75rem + 0.22em of air; taking the trailing space back makes the
 * joint the size it says it is.
 *
 * Each chapter pairs this with its own mark class, which is declared in an
 * unlayered stylesheet and therefore still outranks anything here.
 */
export const chapterMark =
  "flex items-center gap-3 font-mono text-[0.675rem] font-semibold tracking-[0.22em] text-muted-foreground after:ml-[-0.22em] after:h-px after:flex-1 after:bg-[var(--lp-hairline)] after:content-['']"
