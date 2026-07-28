# Skills Board landing — art direction

**Status:** binding spec for the seven-section parallel rebuild.
**Scope:** `app/variants/home/[code]/page.tsx` and everything under `components/landing/`.
**Authority:** where this document and your own taste disagree, this document wins. Where this
document and `refs/motion-spec.md` disagree *about motion values*, motion-spec wins; this document
still governs *what is allowed to move at all*.

Every measurement of a reference below was taken one of two ways, and which one is always stated:
**(measured)** = read off the captured PNG in `refs/` at 1:1, or pulled as a computed style from the
live site at a 1440×900 / DPR 2 viewport — the same viewport `refs/capture.mjs` uses. **(inferred)**
= my reading of an image, not a number I can prove. Treat inferred claims as weaker.

---

## 1. The thesis

Skills Board is a shared card index for the skills a team already trusts — it is free, open source,
and its whole value is that the answer is *written down where everyone can find it*. The page must
therefore feel like a well-kept index, not a launch poster: quiet warm ground, one confident display
voice, hairlines instead of boxes, and real product surface doing the arguing. The reader should
finish it believing the library is already full and already working. That rules things out. It rules
out the page being a sequence of full-viewport moments that resolve into one small diagram — an index
is dense, not theatrical. It rules out decoration that isn't information: no floating grids, no
grain, no scattered paper-stack shadows, no giant numerals standing in for evidence. It rules out
suspense as a device — nothing may be withheld until scroll delivers it, because an index withholds
nothing. And it rules out a second visual idea per section: one system, repeated with discipline, is
the entire point. **We are not building a page that impresses on the first screen and empties out on
the second. We are building eight screens that each hand over something new.**

---

## 2. What we take from each reference — and what we refuse

### Linear (`refs/linear-desktop-fold.png`, `refs/linear-desktop-full.png`)

**Take:**

- **One repeated module, not eight layout ideas.** Every homepage section is the same shape: a 48px
  headline top-left, a 24px paragraph to its right, then a full-bleed product slab beneath carrying
  the actual argument. Five consecutive sections use it (measured: five `section.b-30Va_rootHomepage`
  elements, heights 1090/1172/1196/1216/1224px — a 134px spread across five modules).
- **A literally uniform rhythm.** Every one of those five sections is `padding: 128px 0` (measured).
  Not "roughly 8rem" — the same number, five times.
- **Three type sizes above the fold and nothing decorative competing with the headline.** The fold is
  64px headline / 15px subhead / 15px nav, and the only other object is the product screenshot
  (measured: h1 is `64px/64px, weight 510, letter-spacing -1.408px`; the subhead and the entire nav
  are `15px/24px, weight 400/510`). There is no eyebrow, no badge, no illustration, no gradient.
- **Hairlines carry structure, not shadows.** Census of every element ≥24×16px: 51 elements with a
  1px `rgba(255,255,255,0.05–0.08)` border, against 16 with a real shadow, and the most common shadow
  is `0 2px 4px rgba(0,0,0,0.4)` — invisible at reading distance (measured).
- **Display weight is barely above regular.** 510 on a variable Inter (measured). The size does the
  work, not the weight.

**Refuse:**

- Near-black ground. Ours is warm off-white and stays that way.
- Their 40 distinct type combinations (measured). That is affordable for a team with a design system
  team; across seven parallel builders it is how a page falls apart.
- Their density of product chrome. Linear can show its own app because its app is the product; our
  library UI is simpler and we should show less of it, better.

### Vercel (`refs/vercel-desktop-fold.png`, `refs/vercel-desktop-full.png`)

**Take:**

- **A genuinely capped type scale.** The entire homepage uses **17** distinct
  size/weight/leading/tracking combinations (measured). Seventeen, for a 5333px page. That is the
  discipline target.
- **Zero elevation.** Not "subtle shadows" — none. The only 13 shadow entries in the census are
  Tailwind's `0 0 0 0` ring reset, plus one 1px hairline ring (measured). Depth is communicated
  purely by fill and border.
- **Extreme negative tracking on display, low weight.** h1 is `64px/64px, weight 400,
  letter-spacing -3.84px` = **-0.06em at weight 400** (measured). A big headline that is not shouting.
- **Whitespace between payloads, never instead of them.** Section gaps are `margin-top: 160px`
  (`mt-40`), widening to 208px at larger breakpoints (measured) — generous. But every gap lands on
  something: logo wall, real product screenshot, stat row. Scroll a Vercel gap and you are paid.
- **One radius.** 6px on 45 elements; everything else is a pill or an outlier (measured).

**Refuse:**

- The centred hero object (the floating triangle). We are left-aligned end to end and that is a
  strength — protect it.
- Their near-total absence of accent colour. We have a brand green and we are keeping it.
- Their logo-wall-as-proof. We do not have those logos; faking that shape with an empty row would be
  worse than not having one.

### input-otp (`refs/inputotp-desktop-fold.png`, `refs/inputotp-mobile-full.png`)

**Take:**

- **Craft at component scale.** The OTP field is the hero; the page exists to show one thing working
  beautifully. Our equivalent is the library surface, and we currently never show it.
- **Motion as feedback, not as staging.** Measured in `refs/motion-spec.md` §6: no sticky header, no
  scroll progress bar, no parallax, no scroll-jacking, no cursor follower, no scroll-driven CSS
  timelines, and exactly **one** `position: sticky` element on a 9762px page. Everything that moves
  is either a user action or a one-shot entrance.
- **Reveal once, never replay.** Measured, not inferred: `IntersectionObserver` + `unobserve` on
  first intersection + a `data-rv-played` flag; scrolling away and back produced **0 new animations**
  under CDP (`refs/motion-spec.md` §4.2). Adopt this wholesale.
- **Restraint as a budget.** Header nav links get `opacity: 1 → 0.8` at **0ms** — no transition at
  all — while the OTP field gets six choreographed states (§2.4, §6). Decide which 5% of the page is
  the product and starve the rest.

**Refuse:**

- Their type sprawl: **54** distinct combinations, including a handwriting face
  (`__Architects_Daughter`) and sizes like 73.6px, 27.2px, 22.304px, 16.96px (measured). This is the
  anti-pattern our own page is currently closest to.
- Their section rhythm: paddings of 84/46/56/68/96/124px in a single page (measured). Charming for a
  solo OSS project, unusable as a shared spec.
- Their 16px-dominant radius and their real shadows (`0 18px 40px -22px`) (measured).
- Their bold display weight (700). Ours stays at 600.

---

## 3. Type scale

Two faces. **Bricolage Grotesque** (`--font-sans`) for everything that is language.
**Geist Mono** (`--font-mono`) for labels, code, and machine metadata. **There is no third face.**
Not a serif, not a handwriting face, not a system fallback used deliberately.

**Three weights exist: 400, 500, 600.** Weight 650 and 700 are currently in use (measured on our
page) and are forbidden — 650 is not a decision, it is a slip. Nothing below 400.

**Ten steps. That is the whole ramp.** Every `font-size` in `components/landing/` must resolve to one
of these tokens. No `clamp()` on a per-component basis, no `vw` units, no fractional pixel sizes.
Today our page renders 33 distinct combinations including 120.96px, 86.4px, 26.4px, 20.88px, 16.8px,
14.72px, 11.52px, 10.4px, 9.92px and 9.28px (measured) — sizes nobody chose, produced by seven
different `vw` slopes. That ends here.

| Token | Desktop ≥1024 | Mobile <1024 | Weight | Line-height | Tracking | Face | Used for |
|---|---|---|---|---|---|---|---|
| `d1` | **72px** | 40px | 600 | 0.95 | -0.035em | Bricolage | Hero headline. **Exactly one per page.** |
| `d2` | **52px** | 32px | 600 | 1.04 | -0.03em | Bricolage | Section headline. Max one per section. |
| `h1` | **28px** | 22px | 600 | 1.2 | -0.02em | Bricolage | Sub-headline inside a section: workflow step title, MCP column title, FAQ question. |
| `h2` | **20px** | 18px | 600 | 1.4 | -0.01em | Bricolage | Card title, list-item title, skill name. |
| `lead` | **18px** | 17px | 400 | 1.55 | 0 | Bricolage | Hero subhead, section lead paragraph. One per section. |
| `body` | **16px** | 16px | 400 | 1.6 | 0 | Bricolage | Default prose. |
| `small` | **14px** | 14px | 400 | 1.55 | 0 | Bricolage | Caption, footnote, secondary line, footer link. |
| `micro` | **12px** | 12px | 500 | 1.35 | 0 | Bricolage | Dense metadata *inside* a product surface only (chips, counts). Never in page chrome. |
| `label` | **12px** | 12px | 500 | 1.35 | **0.12em**, uppercase | Geist Mono | Section eyebrow, footer nav, column header. |
| `code` | **13px** | 13px | 400 | 1.55 | 0 | Geist Mono | Install commands, repo paths, literal strings. Never uppercase, never tracked. |

Notes and hard rules:

- **`d1` drops from 121px to 72px.** Our current hero headline is `clamp(2.75rem, 8.4vw, 8.75rem)` =
  120.96px at 1440 (measured). Linear and Vercel both ship 64px; input-otp ships 56px (all measured).
  We land at 72 — deliberately a touch larger than all three, because a confident display face at
  genuine scale is a thing the blind critics named as *our* advantage over both Vercel and input-otp,
  and we are not trading it away. 72 keeps the swagger and removes the poster.
- **Mono is capped at two sizes, 12 and 13.** We currently ship seven mono label sizes between 9.28px
  and 11.52px (`0.58/0.6/0.62/0.65/0.675/0.7/0.72rem`, measured) with tracking between 0.0992px and
  2.3808px. All of it collapses to `label` (12px/0.12em/uppercase) or `code` (13px/0/none). Nothing
  in Geist Mono is ever smaller than 12px. Linear's mono label tier is 12px and Vercel's is 14px
  (both measured); 9px mono is not restraint, it is unreadable.
- **Tracking above 0.14em is forbidden.** Current eyebrows run 0.2–0.22em (measured). At 12px that
  reads as a 2010s "PREMIUM ARTISANAL" label.
- Text measure: `lead` ≤ 60ch, `body` ≤ 72ch, `d1`/`d2` ≤ 18ch. Enforce with `max-width`, not with
  manual line breaks.
- `d1` and `d2` set `text-wrap: balance`. Nothing else does.

---

## 4. Spacing and rhythm

**Base unit: 4px.** The only permitted spacing values are
`4, 8, 12, 16, 24, 32, 48, 64, 96, 128`. No `1.25rem`, no `0.65rem`, no `2.4vw`.

**Section padding — this is the single most important number in the document.**

| Breakpoint | Standard section | Permitted exception |
|---|---|---|
| ≥1024px | `padding: 128px 0` | `96px 0` — **closing band only** |
| <1024px | `padding: 72px 0` | `56px 0` — closing band only |

That is two values per breakpoint and one named exception. There is no third option, and no section
may set its own. Linear ships literally `128px / 128px` on all five homepage modules (measured) and
that uniformity is a large part of why it beat us in blind judging. Vercel's equivalent is a uniform
`160px` / `208px` (measured). We take Linear's number because our modules are shorter.

**Vertical rhythm variance between sections: zero.** Adjacent sections are separated by
`128 + 128 = 256px` of padding and nothing else. No section adds `margin-top`. No section is
`min-height: 100vh`. No section is taller than its content plus its padding.

**Grid and width:**

- Page container: `max-width: 1200px`, centred.
- Full-bleed elements (product slabs, the proof strip) may break out to `max-width: 1440px` but keep
  the same gutters.
- Gutters: **32px** ≥1024, **24px** 640–1023, **20px** <640.
- 12-column grid, **24px** column gap desktop / 16px mobile. Sections declare column spans; they do
  not invent their own column counts.
- Our content currently starts 40px from the viewport edge and runs to ~1400px (measured from
  `refs/baseline/d-00-fold.png`) — a 1360px content width. That is why the workflow's body column
  ends up marooned on the far right with 600px of dead ground beside it. 1200px fixes it structurally.

**Empty columns are forbidden.** If a grid cell has no content, the grid is wrong — change the span,
do not ship the hole. See `refs/baseline/d-02-flow.png`: columns 3–7 of that section are empty across
all three rows.

---

## 5. Colour

Tokens live in `app/globals.css`. Use them by name; do not write literal `oklch()` in a section
module.

| Role | Light token | Dark token | Notes |
|---|---|---|---|
| Ground | `--background` `oklch(0.965 0.011 103)` | `oklch(0.155 0.014 158)` | Warm off-white. Chroma 0.011 — this is a *neutral* off-white, not a craft cream. Keep it that way. |
| Ink | `--foreground` `oklch(0.18 0.017 158)` | `oklch(0.945 0.009 103)` | |
| Muted | `--muted-foreground` `oklch(0.45 0.02 158)` | `oklch(0.69 0.018 103)` | All secondary prose. |
| Hairline | `--lp-hairline` | same | **Change from 16% → 12%** of ink. |
| Hairline strong | `--lp-hairline-strong` | same | **Change from 30% → 22%.** Section dividers only. |
| Surface | `--card` | `--card` | One step off ground. The *only* fill allowed for a panel. |
| Accent | `--primary` `oklch(0.49 0.145 148)` | `oklch(0.72 0.145 148)` | Forest green. |

**Proposed additions:** none. **Proposed deletions: two.**

- **`--lp-grid-line`** (ink at 7%) — deleted with the decorative grid overlay it exists to draw.
- **`--lp-alert`** `oklch(0.62 0.15 55)` — **deleted.** This is a terracotta orange, it is a second
  accent hue nobody sanctioned, and it currently renders as a stray dot on the MCP connector and as
  an outline stroke on the pricing zero (measured in `refs/baseline/d-03-mcp-mid.png` and
  `refs/ours-baseline-desktop-full.png`). One accent hue. Alerts are not a landing-page concern.

**Accent budget — per viewport, at 1440×900:**

- **Maximum four accent-bearing elements visible at once.**
- **At most one accent *fill* larger than 40×40px per viewport.** That fill is always the single
  primary CTA in the body.
- **At most one instance of accent on display type per *page*.** That instance is hero headline line
  two ("All in one place."). It stays — it is the reason we read as a brand and not as a template,
  and two of three blind critics named the single-green-accent discipline as a thing we win on. But
  it happens once, in the hero, at 72px, and nowhere else on the page.
- **The header CTA is ink-filled, never accent.** Linear's `Sign up` is light-on-dark and Vercel's is
  solid black (both measured from their fold shots) — neither spends brand colour on persistent
  chrome. Ours currently ships a saturated green button that is on screen for all 7000px, which is
  what pushes every viewport over budget.
- Accent is otherwise permitted on: the logo mark, the section eyebrow label, a 1px rule or connector
  inside a product surface, and link hover.
- **Accent is never** a background band, a highlight box behind a word, a large numeral, or a stroke
  on decorative geometry.

**Dark mode.** The dark accent is `oklch(0.72 0.145 148)` — a bright mint on a near-black green
ground. That combination, used as a large fill, *is* the "lone acid-green pop on near-black" cliché
named in our own brief. Therefore: **in dark mode, accent fills are replaced by ink-inverted fills**
(light chip, dark label). Accent survives in dark mode only as text, as a 1px mark, and on the logo.
Both themes must be checked by every builder — dark is not a post-pass.

---

## 6. Surface and depth

**We do not use elevation. There is exactly one z-plane for page content, and it is the page.**

This is the least negotiable section, because inconsistent depth is the specific thing that reads as
amateur, and we are currently inconsistent in five directions at once.

- **Surfaces are distinguished by, in order of preference:** (1) nothing — just spacing; (2) a 1px
  `--lp-hairline` rule; (3) a `--card` fill with a 1px hairline. That is the complete vocabulary.
- **`box-shadow` is permitted only on elements genuinely floating above the document in z** — an open
  popover, dropdown, or dialog. Never on a card, panel, button, image, or section. Delete
  `.surface-shadow` (`0 24px 70px`) and the shadow half of `.lift-on-hover` (`0 26px 64px`) from
  landing usage. For calibration: Linear's most-used shadow is `0 2px 4px rgba(0,0,0,0.4)` and Vercel
  ships none at all (both measured).
- **Hover state on a surface is a border-colour change to `--lp-hairline-strong`, plus nothing.** No
  lift, no translate, no scale, no shadow bloom.
- **Radii: two values. `6px` and `10px`.** `6px` for controls, chips, inputs, small surfaces. `10px`
  for large panels and product slabs. `0` for full-bleed bands. **No pills, no `9999px`, no `16px`,
  no `3px`, no `2px`.** We currently ship five radii (6/16/3/8/2 — measured); Vercel ships
  essentially one (6px on 45 elements — measured). Note that 6px is deliberately *not* `rounded-lg`:
  the generic look is 8–12px everywhere, and we are tighter than that on purpose.
- **No rotation on content.** Ever. The hero card stack may overlap and offset; it may not tilt.
- **No gradients**, except a single flat-to-transparent mask used to fade a product slab's bottom
  edge. No radial glows — delete the `.app-canvas` radial from landing usage.
- **No texture.** Delete the `.grain` overlay. At `opacity: 0.05, mix-blend-mode: multiply` it is not
  perceived as paper; it is perceived as a dirty screen, it costs a full-page composite layer, and it
  degrades badly over the dark surfaces. None of the three references uses texture.

---

## 7. Motion principles

`refs/motion-spec.md` does not exist as of this writing — a separate agent is measuring input-otp
live and its findings will be merged in. **Defer all per-interaction values to that file when it
lands.** What follows is the envelope it must fit inside, and the envelope does not move.

**Durations.** `120ms` press/state · `180ms` hover and small enter · `240ms` disclosure and layout ·
`320ms` scroll reveal. **Nothing on this page exceeds 320ms.**

**Easing.** Entrances and moves use the existing `--ease-out`
`cubic-bezier(0.23, 1, 0.32, 1)`. Exits use `cubic-bezier(0.4, 0, 1, 1)` at 160ms. Do not introduce
new curves; do not use `linear` on anything a person can see.

**What may animate:** `opacity`, `transform` (translate ≤ 12px, scale ≥ 0.96), `border-color`,
`background-color`. Plus `block-size` on the FAQ disclosure only — the existing
`interpolate-size: allow-keywords` / `::details-content` implementation in `app/globals.css` is
correct and well-built; keep it exactly as is.

**What must not animate:** anything scroll-linked that moves, fades, or draws *primary content*.
Position, opacity, and path-length driven by scroll offset are removed from this page. No parallax.
No sticky scroll-jacking. No magnetic cursor pull (delete `.magnetic`). No marquee. No counters.

**Scroll reveal:** one pattern only — `opacity 0→1` plus `translateY(8px→0)` over 320ms, triggered
once at 15% intersection, **never replaying on scroll-back**. Stagger 45ms, maximum 6 children,
so total sequence ≤ 270ms. The existing `.cascade-grid` rules are close; align them to these numbers.

**The resting-state rule.** *Every element must be complete and correct with zero scroll progress and
zero JavaScript.* This is the rule our current page breaks most badly: in the full-page capture
`refs/ours-baseline-desktop-full.png` the pricing zero is caught as a set of thin concentric green
and orange outlines, and in `refs/baseline/d-03-mcp.png` the entire third MCP column is grey ghost
text at roughly 30% opacity. Both are mid-animation states. A page whose screenshot looks broken is a
page doing too much work with scroll. If a builder cannot screenshot their section at rest and have
it look finished, the section is wrong.

**Reduced motion** (`prefers-reduced-motion: reduce`): all transforms become `none`, all durations
clamp to ≤120ms, and only opacity remains. Every sticky runway collapses to natural height. The
existing reduced-motion blocks in `landing-shared.module.css` and `globals.css` already do this
properly — preserve that quality, and add a block for anything new you write. No exceptions, no
"but it's subtle".

---

## 8. Per-section directives

Target heights are **content + padding at 1440×900, desktop**. Treat them as budgets: coming in 15%
under is fine, going over needs a reason.

### 8.1 Hero — target 720px (currently 1620px)

**Wrong today** (`refs/baseline/d-00-fold.png`, `refs/baseline/d-01-intro.png`): the section is
`height: 180vh` with a one-viewport sticky child, so 80vh of scroll produces no new content —
`d-01-intro.png` is pixel-for-pixel the same composition as `d-00-fold.png` apart from the header
tint. The headline is 121px, roughly double every reference. Five skill cards are individually
rotated and individually drop-shadowed into a scatter. A decorative 6-column grid overlay
(`.heroGridLines`) sits behind everything. On mobile (`refs/baseline/m-00-fold.png`) the cards
overlap so heavily that `code-review`'s description is clipped mid-word.

**Good looks like:** one viewport, no runway. `d1` at 72px, two lines, line two in accent. `lead` at
18px capped to 60ch. Two CTAs — one accent fill, one hairline-bordered ghost. The card cluster stays
— it is a genuine strength and the blind critics called it art direction rather than decoration — but
it becomes a **static, un-rotated, un-shadowed stack**: three cards maximum, offset on a consistent
16px x / 24px y step, each a `--card` fill with a 1px hairline, overlap never obscuring text. Delete
`height: 180vh`, delete `.heroGridLines`. On mobile, the stack becomes a single un-overlapped card.

### 8.2 Chrome — header, rail, footer

**Header.** Keep the 56px height. **Fix the tint:** the scrolled header is
`color-mix(in oklch, var(--background) 88%, transparent)` plus `backdrop-filter: blur(12px)`, and it
renders **rgb(250,242,242)** against a page ground of **rgb(245,244,236)** (both measured from
`refs/baseline/d-02-flow.png`). Red is 8 points above green and blue, and green equals blue — the
header is literally pink on a warm-yellow ground. Over the dark band it goes rgb(221,215,215)
(measured from `d-04-pricing.png`). Replace with a solid `--background` fill and a 1px
`--lp-hairline` bottom rule. No backdrop blur — it buys nothing over a flat ground and it is causing
this. The header CTA becomes ink-filled per §5. Keep the scroll-progress hairline, reduced to 1px.

**Rail — delete it.** `ChapterRail` renders six links fixed to the right margin, but at 1440 the
labels are suppressed and only six anonymous 12px dashes survive, sitting 29px from the viewport edge
and visually colliding with content in `refs/baseline/d-02-flow.png`, `d-04-pricing.png` and
`d-05-faq.png`. It is an index of six items that are not a sequence, navigating a page that will be
~4500px long. Nobody needs it and it reads as leftover UI. Remove the component, its module, and its
controller hooks.

**Footer.** Currently a single thin row with 9.6px mono nav (measured) — smaller than anything else
on the page and below our 12px mono floor. Rebuild at ~200px: three `label` column headers
(Product / Resources / Open source), `small` links beneath, and a closing line carrying the licence
and the repo. Linear's prefooter is 228px (measured); this is the one place a little more furniture
is correct, because "open source, MIT, here is the repo" is load-bearing for this brand.

### 8.3 Workflow — target 640px (currently 855px)

**Wrong today** (`refs/baseline/d-02-flow.png`): three rows, each with a title in column 1 and body
text in columns 8–11, and **columns 3–7 empty in every row**. A 60px section headline sits above 90px
of actual content per row inside 210px rows. It is a table with a hole in it.

**Good looks like:** three rows on the 12-col grid — `01` marker + title (`h1`, cols 1–3), body
(`body`, cols 4–7), and **a real product fragment (cols 8–12)**: the paste-a-URL field for step one,
a search result row for step two, the copy-command chip for step three. Rows separated by
`--lp-hairline`, 48px padding block. **Number these steps `01 / 02 / 03`.** This is the one place on
the page where numbering is honest — Save → Find → Use is a genuine sequence — and we currently do
not number it while shipping a fake index (the rail) that we do. Section headline drops to `d2`.

### 8.4 MCP — target 560px, plus a new 720px evidence slab before it

**Wrong today** (`refs/baseline/d-03-mcp.png`, `d-03-mcp-mid.png`): the section is `height: 240vh`
with a one-viewport sticky child — 2160px of document (measured) to deliver a small line schematic
that draws itself. At the entry scroll position the top 238px of the viewport is empty and the entire
third column ("Search team skills / Find saved recommendations / Get install commands") is grey ghost
text with no visual weight — all three blind critics flagged this independently. A stray orange dot
sits on the connector. The resolved state in `d-03-mcp-mid.png` is genuinely nice and almost nobody
will scroll slowly enough to see it.

**Good looks like:** delete `height: 240vh`. One static, resolved, full-ink three-column row: copy and
CTA (cols 1–4), the library list (cols 5–8), the agent actions (cols 9–12), schematic connectors
drawn at rest in a 1px accent rule. All three columns at the same ink weight — **ghost text is not a
resting state.** Remove the orange.

**And add, immediately before it, a 720px full-bleed product slab.** This is the largest single gap
between us and Linear and it is why we lost: Linear puts a real screenshot under the fold and another
in every module, so "dense real UI imagery carries the argument". We currently show the product
nowhere. One `10px`-radius, hairline-bordered, 1440-wide slab of the actual library — search field,
result rows, a skill open — bottom edge masked. This section is not optional and it is not a
placeholder; if the real UI is not screenshot-ready, that is the thing to fix first.

### 8.5 Pricing — target 320px (currently 801px)

**Wrong today** (`refs/baseline/d-04-pricing.png`, and mid-scroll in
`refs/ours-baseline-desktop-full.png`): a near-black full-bleed band containing a `56vw` numeral zero.
At rest it is a flat mid-green fill; mid-scroll it is a set of thin concentric green *and orange*
outlines. One critic's verdict was "reads as placeholder art"; another, "an enormous, near-empty dark
interruption that earns almost none of the vertical length it consumes". They are right. It is also,
precisely, the acid-green-on-near-black cliché from our own trap list.

**Good looks like:** **delete the band and delete the zero.** Pricing becomes a single hairline-bounded
row on the normal ground: `d2` "Free. Forever." (cols 1–5), `lead` "Skills Board is free to use and
open source." beneath it, and a three-item `label` row — `NO TRIAL · NO CREDIT CARD · NO PAID TIER` —
plus the CTA (cols 7–12). Roughly 320px. If someone later wants a proof moment here, it must be a
*stat* moment with real numbers (skills indexed, teams, stars), not a numeral standing in for one.

### 8.6 FAQ — target 720px (currently 803px)

**Wrong today** (`refs/baseline/d-05-faq.png`): the layout is genuinely good — this is the healthiest
section on the page and the disclosure animation is well built. Two defects only: the left column runs
out of content at ~460px and leaves the rest empty, and the questions are set at 26.4px, heavier than
they need to be.

**Good looks like:** keep the two-column split. Questions drop to `h1` (28px → so barely a change in
size but a fixed token). Left column becomes `position: sticky; top: 88px` within the section so the
heading tracks the list, and gains one `small` line beneath the intro: a link to the repo's
discussions. Rows keep their hairlines, 24px padding block.

### 8.7 Closing — target 480px including footer handoff (currently 593px + 738px of trailing void)

**Wrong today** (`refs/baseline/d-06-start.png`): headline at 86.4px on a *different* clamp slope
from the hero's, so the two largest things on the page are sized by two unrelated rules. The word
"once." sits in a rotated saturated-green highlight box — a marker-pen device that is the page's
second accent-on-display instance and its only rotated element. The right half of the section is
empty, and `refs/ours-baseline-desktop-full.png` shows ~738px of blank ground before the footer.

**Good looks like:** `d2` at 52px — the closing echoes the hero, it does not compete with it. **Delete
the green highlight box**; if "once." needs emphasis it gets ink weight or a full stop, not a
rotated fill. Headline, `lead`, one accent-fill CTA, `96px` padding (the one permitted exception),
straight into the footer. No trailing void.

---

## 9. Structural verdict

**The sticky chapters do not earn their scroll cost. Delete both.**

The numbers, all measured:

- Our page is **7006px** tall. Scanning it row by row for horizontal bands with under 12 RGB points
  of variation, **4094px — 58% — is uniform empty ground.** The three largest single voids are
  **872px** immediately after the hero, **1622px** in the tail of the MCP chapter, and **738px**
  before the footer. Those three alone are 3232px, or 46% of the document.
- The cause is explicit in the CSS: `.hero` is `height: 180vh` and `.mcpChapter` is `height: 240vh`,
  each wrapping a `position: sticky` child one viewport tall. That is **220vh ≈ 1980px of scroll that
  produces no new content by construction.** `refs/baseline/d-01-intro.png` is the proof: a full
  viewport of scrolling past `d-00-fold.png` changes nothing but the header colour.
- What the 1980px buys: one card-cluster-into-library transition, and one line schematic drawing
  itself. Both are pleasant. Neither is worth two full screens.
- For scale: Linear is 10898px and has **zero** comparable voids — five modules of 1090–1224px, each
  `128px` padded, each ending on a product slab (measured). Vercel is 5333px with gaps of 160–208px
  that always land on a payload (measured). Both references pay the reader for every screen.

This is also exactly where we lost the blind comparison. Two of three critics ranked us the winner on
system coherence and hero composition, and **all three, independently, named the same defect**: "the
hero is followed by roughly a full viewport of nothing", "the huge blank runs make the scroll feel
padded rather than paced". Our problem was never taste. It is that we have length without payload.

**What replaces them.** Not a shorter page for its own sake — a denser one. Target composition:

| # | Section | Target height | Status |
|---|---|---|---|
| 1 | Hero | **720px** | shrink from 1620, remove 180vh runway |
| 2 | Proof strip | **120px** | **new** |
| 3 | Workflow | **640px** | shrink from 855, fill the empty columns |
| 4 | Product slab | **720px** | **new** |
| 5 | MCP | **560px** | shrink from 2160, remove 240vh runway |
| 6 | Pricing | **320px** | shrink from 801, band and zero deleted |
| 7 | FAQ | **720px** | roughly unchanged |
| 8 | Closing | **480px** | shrink from 593 + 738 of void |
| 9 | Footer | **200px** | grow from ~90 |
|  | **Total** | **≈4480px** | from 7006 |

Two of those rows are new and they are the point. **The proof strip** (120px, hairline-bounded, full
width) is what fills the 872px hole after the hero: `OPEN SOURCE · MIT` as a `label`, the GitHub star
count, and the compatible clients as plain wordmarks — `Claude · Cursor · VS Code · Zed`. Both Linear
and Vercel place exactly this kind of row immediately below the fold (measured in both fold shots);
it is the cheapest possible payload and it is true. **The product slab** (§8.4) is what replaces the
MCP runway.

To be explicit about the target: **the goal is not 4480px, and it is certainly not 10898px. The goal
is zero px of void.** If we later add three more evidence modules at ~900px each we will be back near
7000px — and that will be a better page than today's 7000px, because every screen of it will hand the
reader something. Length is not the metric. Payload per screen is.

---

## 10. The kill list

Remove on sight. No discussion, no "but in my section it works".

**Structure**

1. `height: 180vh` on `.hero` and `height: 240vh` on `.mcpChapter`, and both `position: sticky`
   runway children. All scroll-jacking.
2. `ChapterRail` — the component, `chapter-rail.module.css`, and its controller hooks. Six anonymous
   dashes indexing six things that are not a sequence.
3. Any section with `min-height: 100vh` / `100dvh`, or taller than its content plus its padding.
4. Empty grid columns used as layout — the workflow's dead middle, the MCP's dead top 238px.
5. Any element whose resting, no-JS, zero-scroll state is incomplete, ghosted, or half-drawn.

**Colour and ornament**

6. **The giant zero** — `font-size: clamp(15rem, 56vw, 50rem)` in `pricing.module.css` — and the
   near-black band behind it. Placeholder art, and the acid-green-on-near-black cliché besides.
7. **Ghost text as a state.** The MCP third column at ~30% opacity. Copy is either present at full
   ink weight or it is not on the page.
8. `--lp-alert` `oklch(0.62 0.15 55)` and every use of it. One accent hue. No terracotta.
9. The green highlight box behind "once." in the closing — the second accent-on-display instance and
   the page's only rotated element.
10. `.heroGridLines` — the decorative 6-column overlay.
11. `.grain` and its `mix-blend-mode: multiply` texture.
12. The `.app-canvas` radial glow, and gradients generally.
13. Accent as a background band, a large numeral, or a stroke on decorative geometry.
14. A saturated-green header CTA. Header chrome is ink-filled.

**Surface**

15. `.surface-shadow` (`0 24px 70px`) and the shadow + translate in `.lift-on-hover`, on any landing
    surface.
16. Per-card `rotate()` and per-card drop shadows in the hero cluster. Keep the stack, kill the tilt.
17. Radii other than `6px` and `10px` — we currently ship `2, 3, 6, 8, 16`.
18. Any `box-shadow` on something that is not a popover, dropdown, or dialog.

**Type**

19. Font weights `650` and `700`. Three weights: 400, 500, 600.
20. Geist Mono below `12px` — we currently ship seven sizes from 9.28px to 11.52px.
21. Letter-spacing above `0.14em`.
22. Per-component `clamp()` and `vw` font sizes. Every size resolves to a §3 token.
23. A third typeface, in any form.

**Motion**

24. `.magnetic` cursor pull.
25. Scroll-linked opacity, position, or path-length on primary content. Parallax. Marquees.
    Animated counters.
26. Any duration over `320ms`.
27. Reveals that replay on scroll-back.

**And one thing to protect, not kill:** the left-aligned editorial system, the warm neutral ground,
the forest green, the Bricolage/Geist pairing, the hero card stack as a *composed* object, and the
FAQ disclosure implementation. Blind critics named these as the reasons we beat two of three
references. This is an elevation. Nobody rebrands anything.
