# Absolute defect audit — `audit.mjs` and `lint.mjs`

Everything else in this folder compares us to somebody. These two do not.

We rebuilt the landing page and judged it by handing unlabelled screenshot pairs
— ours against linear.app, vercel.com, input-otp.rodz.dev — to critics who
picked a winner. We won all six comparisons. Then the owner opened the page on
a phone and found text sliced mid-word against the viewport edge in three
sections, chips whose right edge sat at 500px inside a 390px viewport, and two
of the six critics had explicitly praised our mobile.

Relative judging cannot catch that. It asks *which of these two is better* and
will hand you a win for being least bad against references whose mobile is also
broken. `audit.mjs` only ever asks the absolute question: **what is wrong with
this page.** No reference site is involved.

## Running it

A production server must be up: `pnpm build && pnpm start` (port 3000).

```bash
# full matrix — 1440x900 and 390x844, light and dark
node refs/harness/audit.mjs http://localhost:3000/

# one cell, fast (the void scan is the slow part)
node refs/harness/audit.mjs http://localhost:3000/ --viewport 390x844 --scheme light --no-void

# an external site: NODE_USE_ENV_PROXY must be set before node starts
./refs/harness/audit.sh https://linear.app --viewport 390x844   # or: ./refs/harness/run.sh audit.mjs …

# the gate — runs the audit, applies lint.config.json, exits non-zero on a regression
node refs/harness/lint.mjs
node refs/harness/lint.mjs --in refs/harness/out/audit.json   # re-grade an existing report
node refs/harness/lint.mjs --suggest                          # print measured numbers, config-shaped
```

Flags: `--viewport WxH` (repeatable), `--scheme light|dark|both`, `--out
path.json` (default `refs/harness/out/audit.json`), `--wait ms`, `--cap n`
(items kept per list), `--no-void`, `--quiet`. `refs/harness/out/` is scratch —
regenerate it, don't read it as a record.

`probe.mjs` is the in-page half of `audit.mjs`; it is serialised into the
browser by `page.evaluate` and never runs in Node. Edit it as browser code.

## What `audit.mjs` measures

Every run scrolls the whole page first (`behavior: 'instant'` — the site sets
`scroll-behavior: smooth`, and a plain `scrollTo` animates, never arrives, and
leaves reveal-on-scroll sections at `opacity: 0`. That mistake cost an
afternoon and is why the capture harness carries the same comment).

| Finding | What it means |
| --- | --- |
| `overflow.counts.text` | Elements carrying prose, a command, a label or a heading whose right edge is past the viewport. **Always a defect.** |
| `overflow.counts.surface` | Large or textless boxes past the edge; `plausibleCrop` marks the ones wide enough to read as an intentional bleed. Reported, never silently forgiven. |
| `overflow.counts.offstage` | Items parked entirely outside a box that hides most of its own width — a marquee belt or carousel track. Not a defect, but shown so you can disagree. |
| `overflow.documentOverflowPx` | `scrollWidth − innerWidth`. Anything above 0 is a horizontal scrollbar on a phone. |
| `truncation.ellipsis` | `text-overflow: ellipsis` (or `-webkit-line-clamp`) that is *actually triggering*, with the full string. |
| `truncation.counts.sliced` | Text cut off inside a box that was meant to hold it. `cropped-surface` = the box hides ≥1.5× its content on purpose; `beyond-crop` = the element is entirely outside it. |
| `invisibleText` | Real strings at `opacity: 0`, `visibility: hidden`, or zero size **after** the scroll pass. `display: none` subtrees and the `sr-only` idiom are excluded. |
| `tapTargets` | Links, buttons, summaries, inputs under 44×44. Inline links inside running prose are excluded — they are words, not targets. |
| `contrast` | Every text element against its composited ancestor background: <4.5:1 body, <3:1 large (≥24px, or ≥18.66px bold). Grouped by colour pair, worst first, with computed RGB. `overImageCount` is text over a gradient or image — reported, not judged. |
| `type.combinations` | Distinct rendered (size, weight, family, line-height, letter-spacing), with counts and an example selector. The single most useful number here: the page shipped **33** combinations from seven `vw` slopes before the ramp was made shared; it is 13 desktop / 10 mobile now. |
| `spacing` | Distinct padding, margin and gap values with counts, plus everything off the 4px scale. |
| `radii`, `shadows`, `accent` | Distinct values; accent counts saturated (non-grey) elements per viewport-height band, with max and mean. |
| `voids` | The full-page screenshot scanned row by row: a row whose entire width varies by <12 RGB points is dead space. Reports total void rows, % of the document, and the three largest runs with y-offsets. Our art director found this by hand and it reframed the project; it is now one command. |
| `focus` | Real `Tab` presses through the whole order, comparing computed style (including `::before`/`::after`) focused vs unfocused. Anything with no visible change is listed. |
| `health.unstyled` | Guard: if the stylesheets 404'd (a server mid-rebuild), the audit says so and `lint.mjs` hard-fails. A clean audit of unstyled HTML is the most dangerous output this tool could produce. |

Colours are resolved by painting them onto a 1px canvas over black and over
white. A regex is not enough — this page's tokens are `oklch()`, which Chromium
keeps unserialised in computed styles; reading them naively made every contrast
ratio come back exactly 1:1 and every accent disappear.

## What `lint.mjs` gates

Thresholds live in `lint.config.json`, per breakpoint. `0` means the defect must
not exist; a non-zero ceiling is **measured debt, not a target** — it exists so
a regression fails today, and it should be ratcheted down. `null` disables a
rule (report-only). Re-measure with `--suggest`.

Hard zero: prose past the viewport edge, horizontal document overflow, text
sliced by a clip, invisible text, body-text contrast, focus rings, unstyled or
failed loads. Ceilings today: 13/10 type combinations (desktop/mobile), 7/4
sub-44px targets, 6 ellipsis truncations, 60% void.

Exit 1 on any failure, with the first few offending strings and selectors
printed underneath so you do not have to open the JSON.

To forgive something deliberate, name it under `exempt` — a selector fragment,
per rule — and its findings are subtracted from that rule's count and reported
as `(N exempted by config)`. That is the only sanctioned way to make the gate
green on a known-and-accepted finding. **Do not raise a ceiling instead**: a
ceiling of 27 hides the next, different defect underneath the same number,
which is precisely how a page ships with severed text.

`exempt` is empty on purpose. The gate is red today at 390px on the product
slab, which is a deliberate full-bleed window whose crop line is the viewport
edge — and also exactly the shape of the defect the owner found on his phone.
The harness cannot tell those apart, so a human has to decide once, in writing:
exempt `product-slab-module`, or stop the slab slicing words. `_standingDecision`
in the config says so too.

## What it cannot see

Do not trust this the way we trusted screenshots. It is a list of specific
failure modes, and passing it means those were not detected — nothing more.

- **Only two widths.** 390 and 1440. A layout that breaks at 744 or 1024 is
  invisible unless you pass `--viewport`.
- **Only the resting state.** Nothing is hovered, opened, submitted or dragged.
  Menus, dialogs, popovers, form errors, empty and loading states, and every
  route other than the URL you give it are unmeasured.
- **Only Chromium, headless, DPR 1.** Real iOS Safari has different viewport
  units, safe areas, text auto-sizing and font rendering. A Safari-only break
  will not appear here.
- **No taste.** It cannot tell you the hierarchy is wrong, the headline is the
  wrong size, the accent is in the wrong place, or the page is boring. Void
  analysis reports flat bands; whether a band is generous or empty is a human
  call.
- **The overflow/crop split is a heuristic.** A deliberate crop only 1.3× wider
  than its box gets reported as a defect; a genuine accident inside a marquee
  gets forgiven as offstage. Read the classified lists, do not just read the
  count.
- **Contrast is approximate.** It composites ancestor background colours only.
  Text over an image, gradient, video or `backdrop-filter` is bucketed as "not
  judged", and text overlapping an absolutely-positioned sibling is measured
  against the wrong backdrop. It also says nothing about non-text contrast
  (borders, icons, focus rings against their surroundings).
- **Focus visibility is a style diff, not a pixel diff.** A ring that exists but
  is clipped by an ancestor, offset off-screen, or the same colour as what is
  behind it still counts as visible. Focus *order*, focus traps and skip links
  are not judged.
- **Tap targets ignore hit-area tricks.** A 20px link with a 44px `::after` hit
  area is reported as small, and spacing between adjacent targets is not
  checked.
- **No semantics.** Heading order, alt text, ARIA correctness, form labelling,
  reading order — none of it. Invisible text and focus rings are the only
  accessibility checks here.
- **No motion, no performance.** Animation quality, scroll jank, layout shift,
  image weight and load time are out of scope (`motion.mjs` covers some of
  this).
- **No content judgement.** Spelling, factual claims, a broken link, a
  placeholder that shipped — all pass.
- **Randomised or live content moves the numbers.** Two runs of a page with
  rotating testimonials are not directly comparable.

The audit found the mobile defect the critics missed. It will not find the next
class of defect nobody has thought to encode. Keep opening the page on a phone.

---

# Relative comparison — `profile.mjs`, `sections.mjs`, `motion.mjs`

The other half of the folder. `audit.mjs` asks *what is wrong with this page*;
these three ask *how does this page differ from the references* — as numbers,
as like-for-like images, and as measured motion, rather than as one critic's
impression of one squashed screenshot.

They exist because the previous method had four faults that we watched bite:

1. **The full-page still flatters us.** Linear's page is 10,898px tall. Squashed
   into one image its dense product UI becomes an illegible grey smear, and
   critics penalised it for exactly that — "its evidence is unreadable, a dim
   slab of miniature UI". Live at 1440×900 it is not.
2. **Stills cannot judge motion**, which is the whole reason input-otp is on the
   list.
3. **Whole-page comparison hides local truth.** "Which page is better" says
   nothing about whether our hero beats their hero.
4. **Nothing was measured.** When the art director hand-measured the references
   instead, those numbers were the most useful artefacts of the project.

## Running them

```bash
./refs/harness/run.sh <tool.mjs> <args…>
```

Use the wrapper. Node must see `NODE_USE_ENV_PROXY=1` **before it starts** or
external hosts fail: Chromium's own TLS to the egress proxy gets reset, so every
request is fetched by Node and fulfilled into the page (`attachProxyRouting` in
`lib.mjs`, copied from `refs/capture.mjs`). Local URLs skip routing entirely.

## `profile.mjs` — comparable design-system profile

```bash
./refs/harness/run.sh profile.mjs <url> <label> [--out dir] [--dark]
./refs/harness/run.sh profile.mjs --compare refs/harness/out/profile-*.json [--out table.md]
```

At 1440×900 and 390×844, into `out/profile-<label>.json`:

| Group | What comes out |
|---|---|
| Type | Every distinct size/weight/family/line-height/tracking combination *actually rendered*, with counts, sorted by size; how many are above 24px and 32px; distinct sizes, weights, families |
| Rhythm | Top-level section heights, the gaps between them, internal padding, and the coefficient of variation of each — one number for "how much does the rhythm vary" |
| Container | Content width and gutters from real text extents, plus declared `max-width` values |
| Colour | Weighted palette (background by area, text by character count), distinct colours, how many hues carry meaning, the accent, and accent uses per viewport-height |
| Shape | Radii and shadow values in use, with counts and shadow layer depth |
| Motion | Computed transition buckets (duration + easing), `@keyframes`, distinct cubic-béziers, `linear()` springs, declared durations |
| Document | Height, screens tall, content-to-void ratio at two thresholds, and the longest empty run with its position |

`--compare` puts every profile in one table, desktop and mobile, so you can read
"we ship 13 type combinations, Linear ships 42, Vercel 30" at a glance.

The type-combination count agrees with `audit.mjs` (13 desktop / 10 mobile) —
they compute it independently, so treat a divergence as a bug in one of them.

Method notes that change the numbers:

- Measurement happens only after a full scroll walk, so scroll-revealed content
  is not counted as invisible.
- Colours are rasterised through a 1×1 canvas, not regex-parsed — the same
  lesson `audit.mjs` learned. Chromium serialises computed colour in the
  authored space, so our page hands back `lab(5.4 -3.9 1.7)` and an `rgb()`
  regex finds **zero** colours on it.
- Multi-value computed strings are split on top-level commas only.
  `.split(', ')` shreds `cubic-bezier(0.4, 0, 0.2, 1)` into four bogus easings.
- Cross-origin stylesheets throw on `.cssRules`, so they are refetched through
  the same request interception and parsed as text. On Linear that is 68 sheets;
  a same-origin-only reading sees a fraction of its motion.
- Every profile carries a `health` block. A page that failed to load produces a
  *clean-looking* profile of nothing — the run that reported Linear as "900px,
  3 type combinations" is what put the guard there. `--compare` marks suspect
  columns; re-run rather than reading them.

## `sections.mjs` — like-for-like, viewport-sized section captures

```bash
./refs/harness/run.sh sections.mjs <url> <label> [--out dir] \
    [--desktop-only|--mobile-only] [--dark] [--max-frames 4]
```

Segments the page into top-level modules and captures each at 1440×900 and
390×844 — the scale a human actually sees — instead of one 10,000px smear.
Writes `sections/<label>/<label>-<viewport>-<NN>-<slug>[-pN].png` plus a
`manifest.json` giving each section's index, `role` (`hero`, `body1`…, `footer`),
label, top, height and frames. Pair across sites by index or role and hand the
pair to `refs/blind.mjs`.

A module taller than the viewport becomes several frames spread across it,
capped, so a 5,800px sticky chapter does not produce forty images.

## `motion.mjs` — interaction and motion evidence

```bash
./refs/harness/run.sh motion.mjs <url> <label> [--selector S]… \
    [--out dir] [--mobile] [--dark] [--reduced]
```

Follows `refs/motion-spec.md`: CDP `Animation.animationStarted` reports the real
effect timing (duration, delay, easing, fill) for every CSS transition, CSS
animation and WAAPI animation the page starts — as opposed to durations a
stylesheet declares for rules that may never match.

Into `motion-<label>.json` plus frame strips in `motion/<label>/`:

- **Entrance** — recorded from first paint, before any settling.
- **Scroll reveal** — the page is settled to choose a target section, then
  *reloaded* and jumped straight to it, so the reveal is a genuine first
  intersection. Plus a scroll-back replay test that ignores ambient loops.
- **Per selector** — hover, press, keyboard focus, and a hover interrupted 80ms
  in. Press is diffed against *hover*, not rest: a press state that merely
  equals hover is "no press state", and that is the finding.
- With no `--selector` it stamps the largest interactive element in the fold
  (the primary CTA) and the smallest (a nav link) — the two ends of a site's
  interaction vocabulary.

Frames come from `Page.startScreencast`, not a screenshot loop: they carry the
compositor's own timestamps and are only emitted when the page repaints, so "no
frame" is itself evidence. Strips are composed by cropping in CSS on a `data:`
URI — no image library, no new dependency.

Two behaviours worth knowing: the press test really presses, so default actions
(`click`, `submit`, Enter) are cancelled at capture phase for its duration —
without that, pressing a link navigates and every later measurement describes a
different page. And frame cadence is real but not calibrated, because driving
the mouse takes time; trust the JSON timings over the strip captions.

**Validation.** Run against input-otp, `motion.mjs` independently reproduced the
hand-measured spec: the 46ms per-word reveal stagger at delays 60/106/152/198
over 760ms `cubic-bezier(.22,1,.36,1)`; the 200ms `cubic-bezier(0.4,0,0.2,1)`
CTA hover; **no press state**; the reveal never replaying; and the broken focus
ring (focus changes background and colour but not `box-shadow`). `profile.mjs`
reproduced the spec's Linear transition buckets — `160ms
cubic-bezier(.25,.46,.45,.94)` ×74 against the spec's ×72.

## `lib.mjs` — shared plumbing

Browser launch, proxy routing, page opening, the scroll-settle walk, and the
section segmentation shared by `profile.mjs` and `sections.mjs` so "section 03"
is the same band of pixels in both.

Segmentation is structural, not semantic — most marketing pages do not use
`<section>` honestly. It walks down from `<body>`, opening up any element that is
tall, whose children tile it, and most of whose *height* is made of module-sized
children; then merges runts and closes holes. Four things it learned the hard
way, all still in the code as comments: `display: contents` wrappers have no
rect (input-otp's whole 9,762px document hangs off one), single-child wrappers
must not consume a depth step (Linear stacks four), absolutely-positioned
mega-menus inflate `<header>` to 900px and swallow the hero beneath it, and a
1,224px section whose three children are 320px each is one module, not three.

## Output layout

```
refs/harness/out/profile-<label>.json      profile.mjs
refs/harness/sections/<label>/…            sections.mjs + manifest.json
refs/harness/motion/motion-<label>.json    motion.mjs timing tables
refs/harness/motion/<label>/*-strip.png    motion.mjs frame strips
```

The written-up comparison lives in `refs/reference-profile.md`.

## What these cannot see

- **Two widths, one browser, light scheme by default.** Same limits as the
  audit.
- **`profile.mjs` counts what rendered, not what was intended.** A type
  combination used once by a legal footnote weighs the same as the headline
  until you read the counts.
- **Section segmentation is a heuristic.** It is good enough to pair modules
  across four unrelated codebases; it is not the authors' own idea of their
  sections. Read `manifest.json` before trusting a pairing.
- **`motion.mjs` drives one selector at a time on a fine pointer.** Touch,
  drag, scroll-linked and multi-element choreography are unmeasured, and
  anything gated behind a first-visit flag (input-otp's preloader) plays or does
  not play depending on storage state.
- **None of them has taste.** They can prove our hero has three type sizes and
  Linear's has five. They cannot tell you whose hero is better.
