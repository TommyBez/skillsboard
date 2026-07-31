# interior.dev component audit

Every component published at <https://www.interior.dev/docs> assessed against the
interaction surfaces that actually exist in this app. **54 components across 10
categories** — none skipped. The catalog was enumerated from the site's own
`sitemap.xml` and each component page was read directly; nothing here is inferred
from the library's name.

- **Stamp**: `c762a6b`, 2026-07-31
- **Companion**: `plans/README.md` (motion plans 001–006, all DONE)

---

## 1. The blocking decision, up front

Every one of the 54 components has exactly one dependency: **`motion`**
(the package formerly published as `framer-motion`). The docs state the same
thing on every page — one dependency, and the component file is copied into your
project rather than installed.

This collides with two facts about this repo:

1. `motion` is **not** a dependency. `package.json` contains no `motion` and no
   `framer-motion`. All product motion today is CSS (`app/globals.css` +
   ~8,900 lines of landing CSS Modules) plus one vanilla-JS scroll controller
   (`components/landing/landing-motion-controller.tsx`).
2. `plans/README.md` closes with **"No plan in this set should introduce a
   motion library"**, and plan 002 repeats it as an explicit boundary.

So this audit splits every recommendation two ways:

- **Pattern** — the component's *idea* is the value, and it is reproducible in
  the existing CSS token system with no new dependency. This is the majority.
- **Library** — the component's value is a FLIP / shared-layout / gesture
  animation that CSS genuinely cannot do well. These are only worth doing if you
  decide to take on `motion`.

A second constraint shapes the overlay verdicts: this app's primitives are
**`@base-ui/react` v1.5.0**, not Radix. interior.dev's overlay set (Modal,
Popover, Drawer, Dropdown, Context Menu) reimplements focus trapping, scroll
locking and collision flipping from scratch. Swapping Base UI out for
hand-rolled equivalents would trade audited accessibility for animation, which
is the wrong trade. Those are logged as "borrow the timing, keep the primitive".

---

## 2. Verdicts — all 54

Legend: **ADOPT** = bring in, clear gap it fills · **ADAPT** = take the
behaviour, keep our implementation · **SKIP** = no surface for it here.

### Action Feedback (7)

| Component | Tagline | Verdict | Where it lands |
|---|---|---|---|
| [Copy Button](https://www.interior.dev/docs/copy-button) | Copy to tick, width locked, reverts after 2s | **ADAPT** · Tier 1 | `components/copy-button.tsx` — 9 call sites, the app's highest-frequency interaction |
| [Loading Button](https://www.interior.dev/docs/loading-button) | Label to state without layout shift | **ADAPT** · Tier 1 | `button-pending-content.tsx`, `form-submit-button.tsx`, and ~10 manual-pending buttons |
| [Hold to Confirm](https://www.interior.dev/docs/hold-to-confirm) | A guard rail in front of destructive actions | **ADOPT** · Tier 1 | The three unconfirmed destructive removes |
| [Press Depth](https://www.interior.dev/docs/press-depth) | The feeling that the press landed | **ADAPT** · Tier 2 | Generalise the `active:scale-[0.97]` that only `account-menu.tsx` has |
| [Icon Morph](https://www.interior.dev/docs/icon-morph) | Play/pause, menu/close as one mechanism | **ADAPT** · Tier 3 | `theme-toggle.tsx`, the `<details>` `+` in `mcp-setup-guide.tsx` |
| [Ripple](https://www.interior.dev/docs/ripple) | Touch feedback from the pointer origin | **SKIP** | Material idiom; clashes with the editorial/print aesthetic and duplicates Press Depth |
| [Like Burst](https://www.interior.dev/docs/like-burst) | Optimistic like that survives rapid taps | **SKIP** | No like, star or vote affordance exists |

### Input (6)

| Component | Tagline | Verdict | Where it lands |
|---|---|---|---|
| [Tag Input](https://www.interior.dev/docs/tag-input) | Enter adds, backspace highlights then removes | **ADOPT** · Tier 1 | `add-skill-dialog.tsx` and `collection-details-fields.tsx` — tags are a plain text field today |
| [Inline Validation](https://www.interior.dev/docs/inline-validation) | Error message that does not shove the form | **ADOPT** · Tier 1 | `auth-form.tsx`, `invite-member-form.tsx`, `add-skill-dialog.tsx` — errors currently push layout |
| [OTP Input](https://www.interior.dev/docs/otp-input) | Auto advance, paste, error recovery | **ADAPT** · Tier 2 | `components/ui/input-otp.tsx` — keep `input-otp`, borrow `error` / `focusOnError` recovery |
| [Expanding Search](https://www.interior.dev/docs/expanding-search) | Icon to field with focus handled | **SKIP** | Search is a permanent, primary affordance on Library/Collections/Discover — hiding it is a downgrade |
| [Floating Label](https://www.interior.dev/docs/floating-label) | The label makes room instead of disappearing | **SKIP** | Fixed `Label` + `Field` is the established form idiom; no problem to solve |
| [Password Strength](https://www.interior.dev/docs/password-strength) | Strength read segment by segment | **SKIP** | Auth is email OTP only — there are no passwords |

### Async (5)

| Component | Tagline | Verdict | Where it lands |
|---|---|---|---|
| [Skeleton Swap](https://www.interior.dev/docs/skeleton-swap) | Skeleton to content with zero layout shift | **ADOPT** · Tier 1 | All 11+ inline `<Suspense fallback>` sites and `components/ui/skeleton.tsx` |
| [Task Steps](https://www.interior.dev/docs/task-steps) | The system narrates its work | **ADOPT** · Tier 1 | `add-skill-dialog.tsx` — already a two-phase `discover` → `save` operation with no narration |
| [Progress Bar](https://www.interior.dev/docs/progress-bar) | Indeterminate handing over to determinate | **ADOPT** · Tier 2 | Add-skill discovery, ZIP download (`/api/skills/[skillId]/download`) |
| [Load More](https://www.interior.dev/docs/load-more) | Sentinel that loads before you hit the end | **ADAPT** · Tier 2 | `catalog-results.tsx` already has the sentinel; it lacks `maxAutoLoads` and structured `labels` |
| [Streaming Text](https://www.interior.dev/docs/streaming-text) | Token by token with a caret | **SKIP** | Nothing in the product streams tokens to the UI |

### Notification (5)

| Component | Tagline | Verdict | Where it lands |
|---|---|---|---|
| [Collapsible Banner](https://www.interior.dev/docs/collapsible-banner) | Folds to its title, or lets go entirely | **ADOPT** · Tier 2 | `invite-teammate-prompt.tsx`, `teammate-reuse-prompt.tsx`, `landing-launch-banner`, catalog-unavailable notice |
| [Presence Avatars](https://www.interior.dev/docs/presence-avatars) | Join and leave as a layout change | **ADAPT** · Tier 2 | `settings/organization` member directory + the hand-rolled initials squares in 4 files; use as a static stack, not live presence |
| [Live Activity](https://www.interior.dev/docs/live-activity) | The system's ongoing work, worn as a small object | **ADAPT** · Tier 3 | Sonner already covers this; only worth it if background ZIP/catalog work becomes long-running |
| [New Items Pill](https://www.interior.dev/docs/new-items-pill) | New content without stealing your scroll | **SKIP** | No realtime feed — nothing arrives while you read |
| [Typing Indicator](https://www.interior.dev/docs/typing-indicator) | Someone is writing | **SKIP** | No chat, no collaborative editing |

### Overlay (7)

All seven reimplement what `@base-ui/react` already provides here. The verdict
is uniformly "keep the primitive", but two real gaps surface.

| Component | Tagline | Verdict | Where it lands |
|---|---|---|---|
| [Command Palette](https://www.interior.dev/docs/command-palette) | Results reorder as you type | **ADOPT** · Tier 1 | *New capability.* Search exists three separate times (Library, Collections, Discover) with no unified ⌘K |
| [Tooltip Group](https://www.interior.dev/docs/tooltip-group) | Delayed once, instant after that | **ADAPT** · Tier 2 | *Real gap.* There is no tooltip in the product at all — hover hints are native `title=""` in 4 files. Use Base UI Tooltip with this shared-delay timing model |
| [Popover](https://www.interior.dev/docs/popover) | Knows its origin, flips on collision | **SKIP** (component) | Same gap as above; fill it with Base UI Popover, not a hand-rolled collision engine |
| [Modal](https://www.interior.dev/docs/modal) | Backdrop, scroll lock, focus trap | **SKIP** | `components/ui/dialog.tsx` has all three. **But borrow the timing** — see §4 |
| [Drawer](https://www.interior.dev/docs/drawer) | Side panel that keeps its place | **SKIP** | `components/ui/sheet.tsx` already exists and has zero importers — the app doesn't want a drawer |
| [Dropdown](https://www.interior.dev/docs/dropdown) | Active highlight travels between items | **SKIP** (component) | Base UI Menu is in use in 3 places; the travelling highlight is Tier 3 polish |
| [Context Menu](https://www.interior.dev/docs/context-menu) | Opens from the pointer, not the corner | **SKIP** | Right-click menus are undiscoverable for the card actions this app has |

### Navigation (6)

| Component | Tagline | Verdict | Where it lands |
|---|---|---|---|
| [Segmented Control](https://www.interior.dev/docs/segmented-control) | Thumb slides, label inverts through it | **ADOPT** · Tier 1 | `CatalogViewTabs` in `discover-filters.tsx` (4 views) and the tag chips on Library/Collections — all snap instantly today |
| [Wizard Steps](https://www.interior.dev/docs/wizard-steps) | Transition knows forward from back | **ADOPT** · Tier 2 | `auth-form.tsx` email → OTP → "use a different email" back-step; also `onboarding-form.tsx` |
| [Tabs](https://www.interior.dev/docs/tabs) | One indicator shared across tabs | **ADAPT** · Tier 2 | `components/ui/tabs.tsx` (used once, in `mcp-setup-guide.tsx`) — panel fades but the indicator jumps |
| [Accordion](https://www.interior.dev/docs/accordion) | height auto, done correctly | **SKIP** | Superseded locally. `.faq-disclosure` already animates native `<details>` with `interpolate-size: allow-keywords` + `::details-content` — zero JS, and better |
| [Pagination](https://www.interior.dev/docs/pagination) | The window moves, the row does not | **SKIP** | No numbered pagination anywhere; Discover is infinite scroll by design |
| [Tree View](https://www.interior.dev/docs/tree-view) | Disclosure the arrow keys can walk | **SKIP** | Collections are flat — there is no hierarchy to walk |

### Scroll (5)

| Component | Tagline | Verdict | Where it lands |
|---|---|---|---|
| [Scroll Spy](https://www.interior.dev/docs/scroll-spy) | The section you are actually in | **ADOPT** · Tier 1 | `components/guides/guide-page.tsx` — the sticky chapter nav has hash anchors and **no active-section state** across all 8 guides |
| [Reading Progress](https://www.interior.dev/docs/reading-progress) | How much is left | **ADOPT** · Tier 1 | The 8 guides + `/resources`; `words` / `wordsPerMinute` gives a time-remaining readout for free |
| [Sticky Header](https://www.interior.dev/docs/sticky-header) | Condenses as you go down | **ADOPT** · Tier 2 | `components/app-header.tsx` is sticky with `backdrop-blur-xl` but a fixed height |
| [Hide on Scroll](https://www.interior.dev/docs/hide-on-scroll) | Toolbar yields to the content | **ADOPT** · Tier 2 | The **fixed mobile bottom nav** in `app-header.tsx` permanently eats viewport on small screens |
| [Snap Carousel](https://www.interior.dev/docs/snap-carousel) | Momentum that lands on a slide | **SKIP** · Tier 3 | Only candidate is the horizontally scrollable command strip in `skill-dossier.tsx`, which is a one-line overflow, not a carousel |

### Data (4)

| Component | Tagline | Verdict | Where it lands |
|---|---|---|---|
| [Value Flash](https://www.interior.dev/docs/value-flash) | Marks what just changed | **ADOPT** · Tier 1 | Every `tabular-nums` counter in the app — Library stats, Collections stats, "N of 8", "N of M selected", member count, "Showing N skills", star counts. **None animate today** |
| [Filter Grid](https://www.interior.dev/docs/filter-grid) | Filtering rearranges, it does not blink | **ADOPT** · Tier 1 (library) | Library and Collections tag chips. Caveat in §5 — ours filters server-side |
| [Sortable Table](https://www.interior.dev/docs/sortable-table) | Rows travel to their new order | **SKIP** | The only real `<table>` is the static comparison matrix in `guide-page.tsx`; there is no sorting UI anywhere |
| [Poll Results](https://www.interior.dev/docs/poll-results) | The winner lands last | **SKIP** | No voting surface |

### Gesture (5)

| Component | Tagline | Verdict | Where it lands |
|---|---|---|---|
| [Reorder List](https://www.interior.dev/docs/reorder-list) | The gap the siblings open is the drop target | **ADOPT** · Tier 2 (library) | `prompt-examples-editor.tsx` (add/remove only, max 8) and collection skill order. A repo-wide grep for drag/reorder/dnd returns **zero hits** |
| [Long Press](https://www.interior.dev/docs/long-press) | Intent confirmed by time, and cancelled by everything else | **ADAPT** · Tier 3 | The mobile counterpart to Hold to Confirm; only ship it alongside that |
| [Slider Detents](https://www.interior.dev/docs/slider-detents) | Stops you can feel | **SKIP** | There is no slider in the product |
| [Swipe Deck](https://www.interior.dev/docs/swipe-deck) | A stack you decide through | **SKIP** | Would require inventing a Discover triage mode; speculative |
| [Lightbox](https://www.interior.dev/docs/lightbox) | Zoom that returns where it started | **SKIP** | The product has no photography — the only media is the landing demo video |

### Content (4)

| Component | Tagline | Verdict | Where it lands |
|---|---|---|---|
| [Show More](https://www.interior.dev/docs/show-more) | Height animates, text does not reflow | **ADOPT** · Tier 2 | Skill descriptions in `skill-dossier.tsx`; would also replace the "View all N" dialog hop in `skill-prompt-list.tsx` |
| [Text Reveal](https://www.interior.dev/docs/text-reveal) | Words arrive in reading order | **SKIP** | The landing page already has a bespoke reveal engine (`data-motion-group`, `data-decode`); a second one would fight it |
| [Logo Marquee](https://www.interior.dev/docs/logo-marquee) | Stops when you look at it | **SKIP** | There is no logo wall or social-proof strip. Revisit if one is added |
| [Blur-up Image](https://www.interior.dev/docs/blur-up-image) | Placeholder resolves into the photo | **SKIP** | No content photography; avatars are initials, not images |

**Tally** — 15 ADOPT · 11 ADAPT · 28 SKIP.

---

## 3. Tier 1 — the eight that matter

Ranked by value per unit of risk. The first five need **no new dependency**.

### 1. Value Flash → every counter in the app *(pattern, no dependency)*

The cheapest high-visibility win available. `tabular-nums` is applied on
counters throughout the app precisely so digits don't jitter when they
change — and then nothing ever animates them. Its API is the whole design:
`value`, `format`, `label`, `hold` (900 ms), `announceAfter` (700 ms). The
`announceAfter` delay exists so a screen reader hears one settled figure
instead of every intermediate tick — worth copying whatever you build.

Targets: `LibraryStats`, `CollectionsStats`, member count, "N of 8" and
"N of 800 characters" in `prompt-examples-editor.tsx`, "N of M selected" in
`add-skill-dialog.tsx`, "Showing N skills" in `catalog-results.tsx`.

### 2. Skeleton Swap → the Suspense fallbacks *(pattern, no dependency)*

The app has 11+ named inline fallbacks and zero `loading.tsx` files, all using
`animate-pulse` skeletons that appear and vanish instantly. Two props are the
entire insight: `delay: 120` (don't show a skeleton for a response that beats
the eye) and `minVisible: 380` (once shown, don't flash it away). Plus
`reserve` / `lines` / `lineHeight`, which hold the box so the swap costs no CLS.

`discover-pending.tsx` already reaches for a related idea — it dims previous
results with a 150 ms transition-delay rather than swapping to skeletons.
That instinct is right; this generalises it to the other ten sites.

### 3. Scroll Spy + Reading Progress → the 8 guides *(pattern, no dependency)*

`guide-page.tsx` renders a `lg:sticky lg:top-24` chapter nav with hash anchors
and `scroll-mt-24`, and never marks which chapter you're in. Scroll Spy's
`sections` / `offset` / `root` / `onChange` is exactly that missing state.
Reading Progress adds `words` + `wordsPerMinute` + `doneLabel`, which turns
into a time-remaining readout on 8 long-form SEO pages at near-zero cost.

These two together are the single best ratio of perceived polish to effort in
the whole audit.

### 4. Segmented Control → Discover views and tag chips *(pattern, no dependency)*

`CatalogViewTabs` (Trending / Hot / All time / Curated) is four link-buttons
intercepted into a `startTransition`; selection snaps. The sliding thumb with a
label that inverts as the thumb passes under it is a well-understood CSS
transform. Note the required `label` prop — the docs are explicit that an
unlabelled radiogroup announces nothing about what it switches, which is a real
bug in the current chip implementations.

### 5. Copy Button + Loading Button + Inline Validation → stop the layout shift *(pattern, no dependency)*

Three components, one shared idea: **reserve the space the state change will
need before it needs it.**

- Copy Button locks button width across `label` → `copiedLabel` → `errorLabel`.
  Ours (`components/copy-button.tsx`) is already a solid tri-state with a
  1600 ms reset, an `execCommand` fallback and a PostHog event — keep all of
  that, add the width lock. It fires on 9 surfaces including every skill card.
- Loading Button reserves the widest of `children` / `pendingLabel` /
  `successLabel` / `errorLabel`, and settles rejections into an error state
  rather than silently returning to idle. Our `button-pending-content.tsx` swaps
  in a spinner and lets the button resize.
- Inline Validation's `reserveLines` holds room for the message so an error
  doesn't shove the rest of the form down. `auth-form.tsx` and
  `invite-member-form.tsx` both do exactly that today.

### 6. Task Steps → the add-skill dialog *(pattern, no dependency)*

`add-skill-dialog.tsx` is the most complex surface in the product: URL →
async repo discovery → multi-select → save, with two distinct pending phases
and request-id race guarding. The user sees a spinner. `steps` / `current` /
`failed` narrates it instead, and `failed` gives the error path a place to land
that isn't a toast.

### 7. Hold to Confirm → the unconfirmed destructive actions *(pattern, no dependency)*

Three removes fire immediately with no confirmation:
`remove-from-collection-button.tsx`, the checkbox items in
`add-to-collection-menu.tsx`, and the rows in
`manage-collection-skills-dialog.tsx`. Delete-skill and delete-collection get
proper dialogs; these don't, and there is no undo anywhere in the app.

Hold to Confirm (`duration: 1800`, `releaseRate: 2.5` so releasing early rewinds
faster than it filled, `onAbort`) is the right weight for an inline destructive
action where a modal would be too heavy. One caveat worth weighing: for a
reversible action like "remove from collection", a toast-with-undo is often
kinder than a forced 1.8 s hold. Sonner is already mounted in
`protected-app-shell.tsx` and supports actions. Consider Hold to Confirm for
genuinely irreversible operations and undo for the rest.

### 8. Command Palette → a new capability *(library, needs `motion`)*

The one Tier 1 entry that is a feature rather than a polish pass. This app has
three separate search surfaces — a GET form on Library, a GET form on
Collections, a 300 ms debounced router-replace on Discover — and no way to jump
between skills, collections and settings from the keyboard. For a tool whose
whole job is *retrieving the right skill fast*, ⌘K is a strong fit.

Its `items` / `onSelect` / `maxRows` API is small. The reordering-as-you-type
animation is the part that needs `motion`; a non-animated version is
straightforward without it.

---

## 4. Cheap fixes this audit surfaced that aren't components at all

Worth doing regardless of what you decide about `motion`:

1. **`components/ui/dialog.tsx` uses `duration-100`** for both backdrop and
   popup, while `:root` declares `--duration-popover: 180ms` and
   `--duration-reveal: 200ms`. The tokens plan 002 introduced were never wired
   into the dialog. Every dialog in the app is faster than the system says it
   should be.
2. **`--ease-in-out` and `--ease-drawer` are declared and never used.** Either
   apply them or drop them.
3. **`.cascade-grid` only exists on Discover** (`catalog-results.tsx`). The
   Library and Collections grids — the two screens a returning user actually
   lands on — render flat. The keyframe already exists; this is a class name.
4. **Dead primitives**: `ui/sheet.tsx`, `ui/select.tsx`, `ui/avatar.tsx`,
   `ui/empty.tsx`, `ui/alert.tsx`, `ui/card.tsx`, `ui/label.tsx`,
   `ui/separator.tsx` have zero importers. Removing them makes the real
   surface legible.
5. **No tooltip exists anywhere.** Hover hints are native `title=""` in
   `delete-skill-dialog.tsx`, `prompt-examples-editor.tsx`, `theme-toggle.tsx`
   and the ZIP-download buttons. Base UI ships a Tooltip with delay grouping.
6. **~180 animation primitives sit unused in `components/remocn/`** — including
   `rolling-number.tsx` and `number-wheel.tsx`, which are precisely the Value
   Flash idea. They are Remotion frame-driven, so not drop-in, but they are a
   ready-made design reference for anything built here.

---

## 5. Caveats on the recommendations

- **Filter Grid assumes client-side filtering.** Its `items` prop is documented
  as the *full unfiltered set*, because item count is what fixes the reserved
  height. Library and Collections filter **server-side** via link navigation, so
  the grid never holds both states. Adopting it means either moving tag
  filtering client-side, or taking only the reserved-height idea and applying it
  to the existing server-filtered grid. The second is cheaper and lower risk.
- **Presence Avatars is a presence component.** There is no realtime presence in
  this app. It is worth taking as a static overlapping avatar stack with
  `max` / `overlap` / `onOverflowSelect` for the org member directory — not as
  the live join/leave feature it was built for.
- **Reorder List needs a persistence story.** `prompt_examples` ordering would
  have to be saved, and `onReorder` vs `onCommit` (optimistic vs persisted) maps
  onto the server-action pattern already used in `edit-skill-prompts-dialog.tsx`.
- **The landing page should be left alone.** It runs a bespoke, carefully
  reduced-motion-aware scroll engine where the static SSR markup *is* the
  finished state. Text Reveal, Sticky Header and Scroll Spy would all fight it.
  Every recommendation here targets `(app)`, `/guides` and `/resources`.

---

## 6. Source code

interior.dev distributes by copy-paste, not by install: each component's full
source lives on its own docs page, and the file becomes yours once copied. This
document deliberately does **not** vendor those files — component names, props,
defaults and behaviour above were read from the live pages and are accurate, but
the code itself should be copied from the linked page at implementation time so
it arrives current and intact, under whatever terms the site sets.

Destination convention used by the library is `components/interior/<slug>`,
which sits cleanly alongside `components/ui/` (Base UI) and `components/remocn/`
(Remotion) without colliding.

---

## 7. Suggested sequence

**Phase A — no new dependency, no decision needed** (Tier 1 items 1–7, plus §4).
Rebuild as CSS in the existing `--ease-out` / `--duration-*` token system,
following the reduced-motion pattern already established in `app/globals.css`:
keep a short opacity fade, drop every transform. This captures most of the value
in this audit and honours the `plans/README.md` boundary as written.

**Phase B — decide on `motion`.** Only these want it and cannot be faked well
in CSS: Command Palette result reordering, Filter Grid rearrangement, Reorder
List drag, Presence Avatars join/leave, Sortable Table row travel, Swipe Deck,
Lightbox. That is a real but narrow set. If the answer is no, Phase A still
stands on its own and Command Palette can ship unanimated.

This is a decision for the repo owner, not one this audit should make: it
reverses a stated constraint that plans 001–006 were all built under.

---

## 8. Implementation status

`motion@12.43.0` is now a dependency, so Phase B is unblocked. The audit's
boundary in `plans/README.md` ("no motion library") is superseded by that
decision — recorded here rather than silently ignored.

### Ported into `components/interior/`

Twenty components, each carrying the documented prop names, defaults and
behaviour from its docs page, restyled onto this app's oklch tokens rather
than the library's hardcoded stone palette, and honouring `useReducedMotion`
the way `app/globals.css` already does (keep a short opacity fade, drop every
transform).

`value-flash` · `skeleton-swap` · `scroll-spy` · `reading-progress` ·
`segmented-control` · `hold-to-confirm` · `task-steps` · `inline-validation` ·
`tag-input` · `progress-bar` · `collapsible-banner` · `presence-avatars` ·
`show-more` · `sticky-header` · `hide-on-scroll` · `press-depth` ·
`loading-button` · `filter-grid` · `reorder-list` · `wizard-steps` ·
`command-palette` · `tooltip` · `load-more` · `long-press` · `icon-morph` ·
`live-activity`

### Wired into product surfaces

| Change | Files |
|---|---|
| ⌘K command palette in the app shell | `components/command-menu.tsx`, `components/protected-app-shell.tsx` |
| Animated counters | `app/(app)/library/page.tsx`, `app/(app)/collections/page.tsx`, `app/(app)/settings/organization/page.tsx` |
| Chapter spy + reading progress on all 8 guides | `components/guides/guide-chapter-nav.tsx`, `components/guides/guide-page.tsx`, `lib/seo/guides.ts` |
| Travelling thumb on Discover views (links preserved) | `components/discover-filters.tsx` |
| Travelling indicator on MCP client tabs (row now scrolls instead of wrapping) | `components/ui/tabs.tsx`, `components/mcp-setup-guide.tsx`, `app/globals.css` |
| Hold-to-delete on the two irreversible deletes | `components/delete-skill-dialog.tsx`, `components/delete-collection-dialog.tsx` |
| Undo on the reversible remove | `components/remove-from-collection-button.tsx` |
| Expandable skill descriptions replacing a dead-end line-clamp | `components/skill-dossier.tsx` |
| Phase narration in the add-skill flow | `components/add-skill-dialog.tsx` |
| Member avatar stack | `app/(app)/settings/organization/page.tsx` |
| Dialog timing on the declared tokens (was `duration-100`) | `components/ui/dialog.tsx` |
| Copy button width lock | `components/copy-button.tsx` |
| Cascade on the Library and Collections grids | `app/(app)/library/page.tsx`, `app/(app)/collections/page.tsx` |

### Deliberately not done

- **Hold to Confirm on the collection-membership toggles.** Those actions are
  reversible, and a forced 1.8 s press is the wrong weight for something a
  second click already undoes. `remove-from-collection-button.tsx` got a real
  undo instead. The hold is reserved for the two deletes that cannot be undone.
- **Segmented Control on the Discover views.** The component is radio-based;
  the existing views are real links whose modifier-click and open-in-new-tab
  behaviour is deliberate. The travelling thumb was applied to the links
  directly instead of replacing them.
- **Accordion, Modal, Drawer, Popover, Dropdown, Context Menu.** Unchanged, per
  §2 — Base UI already owns these with audited focus and dismissal behaviour,
  and `.faq-disclosure` already animates native `<details>` better.
- Everything marked SKIP in §2 remains skipped; those surfaces do not exist.

### Verification

`tsc --noEmit` clean · `pnpm test:unit` 4/4 · `next build` reaches
"Compiled successfully". The build then fails collecting
`/variants/home/[code]` because `FLAGS_SECRET` is unset in this environment —
reproduced on a clean checkout of `c762a6b`, so it predates this work.
