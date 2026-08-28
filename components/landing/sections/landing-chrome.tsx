import { Brand } from "@/components/brand"
import { FooterNavColumns } from "@/components/footer-nav"
import { PageFrame } from "@/components/landing/chrome/page-frame"
import { HomeHeaderActions } from "@/components/landing/landing-ctas"

/**
 * Retired chapter index.
 *
 * It rendered a fixed six-tick spine with hover-revealed labels in the 40px
 * outer gutter, *past* the frame's right rail. Read without knowing what it
 * was, it read as ornament: outside the frame it belonged to, breaking the
 * page's left/right symmetry, pinned against the viewport edge, duplicating
 * the browser scrollbar, and with ticks spaced evenly rather than at the
 * positions of the chapters they stood for. An index whose labels only appear
 * on hover, in a gutter with no room to show them, is not navigation — and at
 * this measure there is no room to make it navigation. The page keeps one
 * honest position signal (the gauge on its own row inside the command strip)
 * and the footer keeps the links.
 *
 * Kept as an export because the page composes it; the motion controller
 * already no-ops when no `[data-rail-link]` exists.
 */
export function ChapterRail() {
  return null
}

/**
 * Sticky command strip.
 *
 * Two cells on one 56px row: the wordmark on the measure's left edge, the
 * control cluster on its right, and the frame's top edge under both.
 *
 * The scroll gauge that used to ride the strip's leading edge is gone. Four
 * treatments drew it in four positions and four separate reviews called it
 * decoration; the fourth put it as well as it can be put — 2px, flush with the
 * top of the window, spanning exactly the measure, 53px clear of anything else,
 * terminating in a 4px accent knob — and the objection did not move, because the
 * objection was never to its position. It reported a number the browser's own
 * scrollbar already reports, it was absent without script and absent under
 * reduced motion, and in a still it was a line that stopped mid-air. Cut, the
 * way the chapter index was cut in round 3. See the retirement note in
 * `app/styles/landing/base.css`.
 *
 * `bg-transparent` is the strip's resting field, and it is meant to be beaten:
 * the scrolled state and the no-script fallback both give it `--background`
 * from an unlayered stylesheet, which outranks any utility.
 */
export function LandingHeader() {
  return (
    <>
      <PageFrame />
      <header className="lp-header sticky top-0 z-40 bg-transparent">
        <div className="mx-auto flex h-14 w-full max-w-[1440px] items-center justify-between gap-4 px-5 md:px-10">
          <span className={brandLockup}>
            <Brand compactOnMobile />
          </span>
          <HomeHeaderActions />
        </div>
      </header>
    </>
  )
}

/**
 * The brand lockup, pulled back onto the column by the mark's own side bearing
 * so the first ink of the page starts on the measure rather than three pixels
 * inside it. Header and footer use the same pair, so the wordmark reads as
 * hanging from one column top to bottom.
 *
 * The class is still needed: it is the hook for the rule that lifts the mark
 * onto the wordmark's optical centre, which reaches for a child this wrapper
 * does not render itself.
 */
const brandLockup = "lp-brand-lockup inline-flex ms-[calc(-1*var(--lp-mark-bearing))]"

/**
 * A colophon link, and the caps that title the group it sits in.
 *
 * The link used to carry a negative inline-end margin, to take back the
 * trailing letter-space of the tracked caps so the optical gap to the next
 * cell matched the gap between the links. The links are in columns now, one
 * per row, so there is no next cell on the row to match, and the box is left
 * aligned rather than centred so the hover underline lands under the word
 * instead of under the 44px hit target.
 *
 * The class carries the underline it grows on hover and the two states that
 * drive it. The group title is the same mono, one step smaller and one step
 * wider, at full contrast so it reads as the label of the column rather than
 * as its first entry.
 */
const footerNavLink =
  "lp-footer-nav-link relative inline-flex min-h-11 min-w-11 items-center py-[0.15rem] text-muted-foreground no-underline"

const footerGroupTitle = "text-[0.675rem] tracking-[0.22em] text-foreground"

function GitHubMark() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.866-.013-1.7-2.782.605-3.369-1.343-3.369-1.343-.455-1.159-1.11-1.468-1.11-1.468-.908-.62.069-.608.069-.608 1.003.071 1.531 1.031 1.531 1.031.892 1.53 2.341 1.088 2.91.832.091-.647.349-1.088.635-1.338-2.221-.253-4.555-1.112-4.555-4.947 0-1.093.39-1.987 1.029-2.686-.103-.253-.446-1.27.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.026 2.747-1.026.546 1.38.203 2.397.1 2.65.64.699 1.028 1.593 1.028 2.686 0 3.844-2.337 4.691-4.566 4.94.359.31.679.923.679 1.86 0 1.343-.012 2.426-.012 2.757 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.523 2 12 2Z" />
    </svg>
  )
}

/**
 * Footer — open-source colophon.
 *
 * The last chapter dissolves into a slightly recessed field and the measure
 * rule returns as the frame's bottom edge. That rule is the same 1px of the
 * same ink across the same span as the rule at the top of the page; it keeps
 * its own class because it is painted as two layers, and that construction is
 * argued in the stylesheet.
 *
 * The plate is the hand-off — the closing chapter fades into it over the last
 * 5rem before the rule — and where the frame exists it stops at the frame, so
 * the page's last field is inside the frame like everything else instead of
 * running out under it.
 *
 * The inner measure carries the same content clear as the closing chapter
 * above it, page gutter plus the extra air off the frame rails, so the
 * colophon doesn't snap back out to the rails after "06 · Start".
 *
 * The nav lists pages, in the three groups defined once in
 * `components/footer-nav`, so this colophon and the resource one cannot name
 * different sets. It used to list two in-page anchors and three pages, which
 * left `/compare`, `/alternatives` and `/skill-creator` with no link from the
 * site's most linked page and put `/pricing` behind the anchor to its own
 * section. Naming every page then made the row a wrapping line of eight
 * tracked caps, which is what the columns are for. One anchor is left:
 * `#faq` has no page of its own to point at, and it is offered here only,
 * because here is the only page that has the section.
 *
 * The mark hangs under the wordmark rather than at the far end of a control
 * row, so the left cell is the brand and the right cell is the whole nav.
 */
export function LandingFooter() {
  return (
    <footer className="relative">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-20 bottom-0 z-0 bg-[linear-gradient(to_bottom,transparent_0,var(--lp-footer-field)_5rem)] lg:left-[var(--lp-frame-inset)] lg:right-[var(--lp-frame-inset)]"
      />
      <span className="lp-footer-rule" aria-hidden="true" />
      <div className="relative mx-auto flex w-full max-w-[var(--lp-measure)] flex-col gap-10 px-[calc(var(--lp-gutter)+1.5rem)] py-12 md:py-14 lg:flex-row lg:items-start lg:justify-between lg:gap-16 lg:px-[calc(var(--lp-gutter)+1.75rem)] min-[84rem]:px-[calc(var(--lp-gutter)+2rem)]">
        <div className="flex min-w-0 flex-col items-start gap-6">
          <span className={brandLockup}>
            <Brand />
          </span>
          <a
            href="https://github.com/TommyBez/skillsboard"
            target="_blank"
            rel="noreferrer"
            aria-label="Skills Board on GitHub"
            className="lp-footer-mark inline-flex size-11 shrink-0 items-center justify-center"
          >
            <GitHubMark />
          </a>
        </div>
        <FooterNavColumns
          ariaLabel="Footer"
          faqAnchor
          className="font-mono text-xs font-semibold uppercase tracking-[0.18em] lg:w-auto lg:gap-x-14"
          titleClassName={footerGroupTitle}
          linkClassName={footerNavLink}
        />
      </div>
    </footer>
  )
}
