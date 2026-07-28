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

**Desktop ramp (≥1024px) — 10 steps:**

| Token | Size | Weight | Line-height | Tracking | Face | Used for |
|---|---|---|---|---|---|---|
| `d1` | **72px** | 600 | 0.95 | -0.035em | Bricolage | Hero headline. **Exactly one per page.** |
| `d2` | **52px** | 600 | 1.04 | -0.03em | Bricolage | Section headline. Max one per section. |
| `h1` | **28px** | 600 | 1.2 | -0.02em | Bricolage | Sub-headline inside a section: workflow step title, MCP column title, FAQ question. |
| `h2` | **20px** | 600 | 1.4 | -0.01em | Bricolage | Card title, list-item title, skill name. |
| `lead` | **18px** | 400 | 1.55 | 0 | Bricolage | Hero subhead, section lead paragraph. One per section. |
| `body` | **16px** | 400 | 1.6 | 0 | Bricolage | Default prose. |
| `small` | **14px** | 400 | 1.55 | 0 | Bricolage | Caption, footnote, secondary line, footer link. |
| `micro` | **12px** | 500 | 1.35 | 0 | Bricolage | Dense metadata *inside* a product surface only (chips, counts). Never in page chrome. |
| `label` | **12px** | 500 | 1.35 | **0.12em**, uppercase | Geist Mono | Section eyebrow, footer nav, column header. |
| `code` | **13px** | 400 | 1.55 | 0 | Geist Mono | Install commands, repo paths, literal strings. Never uppercase, never tracked. |

**Mobile ramp (<1024px) — 7 steps. This is its own scale, not the desktop ramp scaled down.**

| Token | Size | Weight | Line-height | Tracking | Face | Used for |
|---|---|---|---|---|---|---|
| `d1` | **40px** | 600 | 0.98 | -0.03em | Bricolage | Hero headline only. |
| `d2` | **28px** | 600 | 1.1 | -0.025em | Bricolage | Section headline. |
| `h1` | **20px** | 600 | 1.3 | -0.015em | Bricolage | Everything sub-headline: step title, FAQ question, card title, column title. **`h2` does not exist on mobile — it collapses into `h1`.** |
| `body` | **16px** | 400 | 1.6 | 0 | Bricolage | Prose *and* leads. **`lead` does not exist on mobile — it collapses into `body`** and is distinguished by ink colour and measure, never by size. |
| `small` | **14px** | 400 | 1.5 | 0 | Bricolage | Caption, meta, footer link. **`micro` collapses into `small`.** |
| `label` | **12px** | 500 | 1.35 | **0.10em**, uppercase | Geist Mono | Eyebrow, column header. Muted, never accent. |
| `code` | **13px** | 400 | 1.55 | 0 | Geist Mono | Commands and paths. |

Notes and hard rules:

- **`d1` drops from 121px to 72px.** Our current hero headline is `clamp(2.75rem, 8.4vw, 8.75rem)` =
  120.96px at 1440 (measured). Linear and Vercel both ship 64px; input-otp ships 56px (all measured).
  We land at 72 — deliberately a touch larger than all three, because a confident display face at
  genuine scale is a thing the blind critics named as *our* advantage over both Vercel and input-otp,
  and we are not trading it away. 72 keeps the swagger and removes the poster.
- **Mobile has three steps fewer on purpose.** Measured at 390px: our page currently renders **32
  distinct type combinations**, of which **four sit above 35px within a 12px band** (48 / 44 / 40 /
  36 — one per section, each from a different `clamp()` slope) and **eight sit inside a single 8px
  band** (24.8 / 24 / 20 / 19.2 / 18 / 17.6 / 16.8 / 16.8). Linear at the same width renders 27
  combinations with exactly **one** size above 24px (38 / 24 / 20 / 16 / 15 / 14). That gap is
  precisely what the mobile critic meant by "the same mid-weight body type repeated at near-identical
  size for headings, sub-labels and paragraphs". A narrow column cannot carry ten steps — the
  differences stop being legible as hierarchy and start reading as inconsistency. Collapsing `h2`,
  `lead` and `micro` is not a compromise; it is the fix.
- **Ratios are the spec, not the pixel values.** Mobile: `d1:d2` = 1.43, `d2:h1` = 1.40, `h1:body` =
  1.25. Every adjacent pair is ≥1.25× apart. If a builder adds a step that lands inside 1.2× of its
  neighbour, the step is wrong. (Linear's mobile ratios, measured: 1.58 / 1.20 / 1.25.)
- **Mono is capped at two sizes, 12 and 13.** We currently ship seven mono label sizes between 9.28px
  and 11.52px (`0.58/0.6/0.62/0.65/0.675/0.7/0.72rem`, measured) with tracking between 0.0992px and
  2.3808px. All of it collapses to `label` (12px uppercase) or `code` (13px, no tracking). Nothing
  in Geist Mono is ever smaller than 12px. Linear's mono label tier is 12px and Vercel's is 14px
  (both measured); 9px mono is not restraint, it is unreadable.
- **Tracking above 0.14em is forbidden** (0.10em on mobile). Current eyebrows run 0.2–0.22em
  (measured). At 12px that reads as a 2010s "PREMIUM ARTISANAL" label.
- **Eyebrows are muted on mobile, not accent.** The mobile critic asked for "smaller, quieter
  eyebrows"; the fix is colour and weight, not size — 12px is already the floor.

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

## 4B. Mobile is a format, not a breakpoint

Blind judging ran again at 390px. Same result as desktop, same opponent: we beat Vercel, we beat
input-otp, **we lost to Linear.** Standing is 4–2 and both losses are to the same page. Mobile is now
our weakest surface and it gets its own position in this document.

**The diagnosis, in the critic's words:** we "stack a desktop layout into a single card column with
the same mid-weight body type repeated at near-identical size for headings, sub-labels and
paragraphs", and we ship "the hero's screenshot collage as a shrunken, illegible cluster that wastes
the first scroll before the product is ever shown at readable scale". A second critic hit the same
hero independently — "overlapping code cards whose text is too small to parse at this width" — and
added that the midsection is "monotonous: five near-identical cream sections, a team library list
repeated twice".

**The three laws.**

**1. One visual + one sentence per section.** This is the mobile composition rule and it is absolute.
A mobile section is: eyebrow, one `d2` headline, one paragraph, one visual. Not three columns
stacked. Not a list plus a diagram plus a caption. If a desktop section has three columns, the mobile
version does not stack all three — it **drops two of them.** Linear's mobile sections are 571, 575,
575, 575 and 581px tall (measured) — a **10px spread across five modules**, because each one is
mechanically the same shape. Ours must be too.

**2. Product visuals are cropped at full scale, never shrunk to fit.** This is the single most
important thing Linear does on a phone and the thing we get exactly backwards. In
`refs/linear-mobile-fold.png` the product slab starts 18px from the left gutter and **runs off the
right edge of the viewport** — the UI inside it is rendered at its native size and the viewport
simply crops it. It is legible because it was never scaled. In `refs/baseline/m-00-fold.png` we do
the opposite: five cards scaled down to fit 350px, overlapping, with `code-review`'s description
clipped mid-word and the repo path unreadable. **Never scale a product visual to fit the mobile
column.** Either show a full-scale crop that bleeds off the right edge, or show fewer elements at
full scale. Bleeding off-screen is not a defect on mobile; it is the technique.

**3. Rhythm comes from surface, not from colour.** The mobile critic's sharpest observation is the
one with a trap in it: across their scroll, our page "relies almost entirely on the single dark 0 /
Free. Forever. block for rhythm". The outlined zero that three desktop critics called placeholder art
is simultaneously the only thing giving mobile any beat. Deleting it (§8.5) therefore has to be paid
for, or mobile gets flatter, not better. **It is paid for structurally:** mobile sections alternate
between two treatments —

- **Type sections** — plain ground, 1px hairline top rule, text only.
- **Slab sections** — a full-bleed product visual that breaks both gutters and crops off the right
  edge, with no hairline.

Alternating those two produces a visible beat every ~560px without spending a single drop of colour.
**Plus exactly one ink-inverted section on the whole page** — the closing band, `--surface-ink`
ground with light type — which supplies the one dark beat the zero was accidentally providing, at a
third of the height and carrying a real CTA instead of a numeral.

**Mobile mechanics.**

- Gutters 20px. Slab sections break out to full bleed (`margin-inline: -20px`, or `width: 100vw`).
- Section padding 72px (56px for the closing band). No exceptions — see §4.
- **One column. There is no two-column layout below 1024px.** Not for the FAQ, not for the workflow,
  not for MCP.
- Tap targets ≥44px. CTAs are full-width at 48px tall, stacked with 12px between them.
- The header is 56px with the logo, one ink CTA, and nothing else. No hamburger for four links —
  they live in the footer.
- Target mobile document height: **≈4200px.** We are at 5507px today (measured) and Linear is at
  6382px (measured) — but Linear's 6382 contains eight product slabs and ours contains none.

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
  ships none at all (both measured). When a popover does need one, use a **layered ramp** rather than
  a single blur — `0 1px 2px, 0 3px 6px, 0 8px 16px, 0 18px 36px` at decreasing alpha. A single
  `box-shadow` cannot fake the falloff (measured on input-otp's hover card, `refs/motion-spec.md` §2.5).
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

`refs/motion-spec.md` is now complete — input-otp driven live via Playwright + CDP, with timings read
off `Animation.animationStarted`, the served CSS, and the shipped JS bundles. It also measured Linear
and Vercel the same way. Everything below is drawn from it; **it is the authority on values, this
section is the authority on what is allowed to move at all.** Section references like §2.4 point into
that file.

### 7.1 The easing inventory — exactly three curves

Vercel ships **43 distinct cubic-béziers** (measured) and reads, in the spec's words, "as many teams'
code in one stylesheet". Linear ships roughly **one** curve and a 100–160ms vocabulary for the entire
site (measured). Linear is our model.

| Token | Value | Job |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | **Anything the page shows you** — entrances, reveals, state announcements. |
| `--ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | **Anything the user touches** — hover, focus, toggle, press. **Add this token.** |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | **Exits and dismissals only.** **Add this token.** |

`--ease-out` already exists in `app/globals.css` and is within 0.02 on every control point of
input-otp's house curve `cubic-bezier(0.22, 1, 0.36, 1)` (measured). **Do not "upgrade" it** — it is
already correct. `--ease-standard` is the workhorse on all three references simultaneously: it is
input-otp's `.xp-btn` curve, and Vercel's two highest-frequency buckets (×79 and ×55, measured).

**Delete from landing usage:** `--ease-in-out` and `--ease-drawer`. There are no sheets and no
symmetric moves on this page. **Never use `linear` on anything a person can see** — it is for opacity
crossfades only. **No `linear()` springs.** input-otp has zero in its entire stylesheet and every
"springy" moment there is a hand-authored keyframe with explicit overshoot (measured); we are not
introducing a spring solver for a marketing page.

### 7.2 The duration inventory — five values, capped

| ms | Curve | Job |
|---|---|---|
| **0** | — | Header nav link hover. Opacity only. |
| **120** | `--ease-in` | Every exit, dismissal, and "leave" half of a hover pair. |
| **160** | `--ease-standard` | The interaction default: button/card/row hover, focus ring, toggle. |
| **240** | `--ease-out` | Disclosure (FAQ) and any layout-adjacent change. |
| **420** | `--ease-out` | Entrance and scroll reveal. |

**Nothing on this page uses any other duration. Nothing exceeds 420ms. There are no ambient loops at
any duration.** Two derived rules from the measured clustering (§1.2 of the motion spec, where
feedback lives at 90–200ms and entrances at 520–760ms with a deliberate dead zone between):

- **Nothing sits between 260ms and 400ms.** If a value lands there, it is either feedback (drop to
  160) or an entrance (raise to 420).
- **In ≠ out. Always.** Entrances get 2.5–3.5× the exit: 420 in / 120 out. Entrances use
  `--ease-out`, exits use `--ease-in`. Measured precedent: the OTP ring is 450 in / 120 out, the
  hover card 260 in / 150 out, the sponsor tilt 110 tracking / 420 settling (§7.4 of the spec:
  "entrances get time, dismissals get out of the way").

We choose 160ms over input-otp's 200ms because Linear's entire interaction vocabulary is 100–160ms
(measured: buckets of `0.1s` ×43 and `0.16s` ×72), and 420ms over input-otp's 520ms because our page
is losing a third of its height and should feel correspondingly brisker.

### 7.3 Hover and focus states live in CSS. This is not a preference.

**Every hover, `:focus-visible`, and `:active` state is declared in CSS with a `transition`. None of
them is ever driven from JavaScript** — not from `onMouseEnter`, not from a state variable, not from
an animation library. A PR that sets hover styling from a React event handler is rejected on sight.

The reason is measured, not aesthetic. Reversing input-otp's CTA hover 80ms into its 200ms transition
produced a **91.66ms** reverse under CDP (§5 of the motion spec). That is the CSS Transitions
reversing shortening factor doing the work: `cubic-bezier(0.4,0,0.2,1)` evaluated at `t = 0.4` gives
≈0.458, and `0.458 × 200 = 91.6ms`. The browser **starts from the currently rendered value and takes
proportionally less time.** Leaving after only 40ms produced a 0ms reverse. You get all of this free,
and you lose all of it the moment you reimplement hover as a fixed-duration JS tween — which is
exactly where the snap-back artefact everyone complains about comes from.

For state that genuinely must be JS-owned, the sanctioned pattern is **swap the duration, not the
implementation**: same property, same curve, one `data-` attribute toggling `110ms` while the user is
driving and `420ms` on release (measured on input-otp's sponsor tilt). There is nothing on this
landing page that needs it today.

### 7.4 What may animate, and what must not

**May animate:** `opacity`, `transform` (translate ≤12px, scale ≥0.96), `border-color`,
`background-color`, `box-shadow` (popovers only). Plus `block-size` on the FAQ disclosure — the
existing `interpolate-size: allow-keywords` / `::details-content` implementation in `app/globals.css`
is correct, well-built, and the only sanctioned layout animation on the page. Keep it exactly as is.

**Must not animate — no exceptions:**

- Anything scroll-linked. No position, opacity, path-length, or `stroke-dashoffset` driven by scroll
  offset. No CSS scroll-driven timelines (`animation-timeline` stays `auto`). No parallax. No sticky
  scroll-jacking. input-otp ships **zero** scroll-driven timelines and exactly **one** `position:
  sticky` element on a 9762px page (measured); Linear ships none on its homepage modules.
- Layout: `width`, `height`, `top`/`left`, grid position. input-otp animates none of these anywhere
  on the site (measured, §6.4).
- `.magnetic` cursor pull — delete it.
- Marquees, counters, ambient loops, page-transition overlays, cursor followers.

**No transform on press.** input-otp has **no press state anywhere** — `getComputedStyle` at 80ms
into `mousedown` on its CTA is byte-identical to its hover state (measured). We keep a press state
because our audience is keyboard-and-CLI and the feedback is worth it, but it is the cheapest
possible one: `opacity: 0.92` at **0ms**, no transform. Delete the `:active` scale on `.ctaButton`.
The `.ctaArrow` nudge on hover stays — it is directional and on-brand — at 160ms.

**Header nav links get 0ms.** `opacity: 1 → 0.8`, no transition declared, no colour change, no
underline, no background. Stolen directly (measured, §2.4). These are the most-hovered, least
important targets on the page; spend nothing on them. Spend the budget on the product surfaces.

### 7.5 Scroll reveal — one pattern, once

`opacity 0→1` + `translateY(10px→0)` over **420ms `--ease-out`**, triggered once at
`IntersectionObserver({ threshold: 0, rootMargin: "0px 0px -5% 0px" })`.

- **Stagger 80ms per sibling, capped at 6 children and 300ms total offset.** (Measured: input-otp
  uses 80ms per card sibling with a 300ms cap so long content never turns into slow motion.) Our
  existing `.cascade-grid` uses 45ms — retune to 80ms and cap at 6.
- **It never replays.** `unobserve` on first intersection plus a `data-rv-played` flag. Verified
  behaviour on input-otp: scrolled away and back produced **0 new animations** under CDP.
- **It cleans up after itself.** On `finish`, set `transition: none`, remove the inline `opacity`,
  `transform` **and `will-change`**, stamp `data-rv-done`, restore the original `transition` next
  rAF. Most implementations leave `will-change: transform` on hundreds of nodes forever.
- **Hard-finish everything on `visibilitychange`.** Tab away mid-reveal and come back to a settled
  page, not a replaying queue.

**Two things we deliberately do not steal.** input-otp splits headlines into words at 46ms and adds
`filter: blur(9px)→0` to each. Both are lovely and both are wrong here:

- **No per-word headline reveal.** A 7-word headline at 760ms + 46ms/word is over a second before the
  hero is readable. Our thesis is that an index withholds nothing (§1). One block per element.
- **No blur on text.** Blur-to-focus reads as a camera on input-otp's near-black ground; on our warm
  off-white with a semibold display grotesque it reads as a failed font load. *(This is my judgement,
  not a measurement.)* Blur is permitted on the hero card stack and the product slab — surfaces, not
  language — at 4px, and nowhere else.

### 7.6 The resting-state rule

*Every element must be complete and correct at zero scroll progress with JavaScript disabled.*

This is the rule our current page breaks most badly. In `refs/ours-baseline-desktop-full.png` the
pricing zero is caught as a set of thin concentric green **and orange** outlines; in
`refs/baseline/d-03-mcp.png` the entire third MCP column is grey ghost text at roughly 30% opacity.
Both are mid-animation states that a static screenshot happened to catch — which is precisely how
three blind critics saw them, and precisely why they read as broken.

**If you cannot screenshot your section at rest and have it look finished, the section is wrong.**

### 7.7 Reduced motion is a position, not a switch

input-otp ships **21 separate `prefers-reduced-motion` blocks** (measured) rather than one blanket
`* { animation: none }`. It removes the preloader, the scroll reveal, the WebGL loop, the proximity
glow, the marquee — and **deliberately keeps** the 140ms character-in, the 130ms indicator slide, and
the 200ms button hover, because those communicate state. Adopt the reasoning, component by component.

For us, under `prefers-reduced-motion: reduce`:

| Removed entirely | Kept at full speed |
|---|---|
| All scroll reveals — elements render at their final state immediately | Hover and focus colour changes (160ms) |
| All `transform` (translate, scale, the CTA arrow nudge) | The FAQ disclosure — but at 120ms, opacity only, no height interpolation |
| Any remaining sticky runway — collapses to natural height | The copy-confirmation icon swap and its 1500ms hold |
| The scroll-progress bar animation (it may still be present, just not animated) | The 0ms press opacity |

Every new component ships its own reduced-motion block. The existing blocks in
`landing-shared.module.css` and `globals.css` already do this properly — that is genuinely good work;
preserve its quality and match it. No exceptions, no "but it's subtle".

### 7.8 Two details worth stealing outright

- **Copy confirmation is one icon.** Click the install-command chip and a 14×14px glyph swaps to a
  green check for exactly **1500ms**, then swaps back. No toast, no chip flash, no width change, no
  layout shift (measured, §2.3). Our `.copy-success-icon` is already close — set the hold to 1500ms.
- **Focus rings are never animated, and must actually win the cascade.** `:focus-visible`, `2px
  solid var(--ring)`, `outline-offset: 3px`, no `transition` on `outline`. The motion spec caught
  input-otp's own CTA focus ring being silently killed by a higher-specificity `box-shadow` rule
  (§2.1, §9) — the intended ring never renders. Every builder must tab through their section and
  confirm the ring is visible on every interactive element.

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

**Good looks like (desktop):** one viewport, no runway. `d1` at 72px, two lines, line two in accent.
`lead` at 18px capped to 60ch. Two CTAs — one accent fill, one hairline-bordered ghost. The card
cluster stays — it is a genuine strength and the desktop critics called it art direction rather than
decoration — but it becomes a **static, un-rotated, un-shadowed stack**: three cards maximum, offset
on a consistent 16px x / 24px y step, each a `--card` fill with a 1px hairline, overlap never
obscuring text. Delete `height: 180vh`, delete `.heroGridLines`.

**Good looks like (mobile) — this is the biggest single mobile fix.** Two of three mobile critics
independently killed the card cluster: "a shrunken, illegible cluster that wastes the first scroll
before the product is ever shown at readable scale" and "overlapping code cards whose text is too
small to parse at this width". In `refs/baseline/m-00-fold.png` five cards are scaled to fit ~350px,
`code-review`'s description is clipped mid-word, and the repo paths are unreadable.

**At 390px the hero shows exactly one card, at full desktop scale, cropped by the right viewport
edge.** One `code-review` card, left edge on the 20px gutter, extending past the right edge and off
screen. Its internal type stays at `h2`/`code`/`small` — native sizes, nothing scaled. This is
Linear's technique, measured in `refs/linear-mobile-fold.png`: their product slab starts 18px from the
gutter and runs off the right edge at native scale, and that is why it is legible. **No overlap, no
rotation, no scaling, no second card.** One real object beats five illegible ones.

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

**Good looks like (desktop):** three rows on the 12-col grid — `01` marker + title (`h1`, cols 1–3),
body (`body`, cols 4–7), and **a real product fragment (cols 8–12)**: the paste-a-URL field for step
one, a search result row for step two, the copy-command chip for step three. Rows separated by
`--lp-hairline`, 48px padding block. **Number these steps `01 / 02 / 03`.** This is the one place on
the page where numbering is honest — Save → Find → Use is a genuine sequence — and we currently do
not number it while shipping a fake index (the rail) that we do. Section headline drops to `d2`.

**Mobile:** one column, three rows, each row = `01` label + `h1` title + one `body` sentence + the
product fragment at full scale bleeding off the right edge. This is a **slab section** in the §4B
alternation. Target 620px.

### 8.4 MCP — target 560px, plus a new 720px evidence slab before it

**Wrong today** (`refs/baseline/d-03-mcp.png`, `d-03-mcp-mid.png`): the section is `height: 240vh`
with a one-viewport sticky child — 2160px of document (measured) to deliver a small line schematic
that draws itself. At the entry scroll position the top 238px of the viewport is empty and the entire
third column ("Search team skills / Find saved recommendations / Get install commands") is grey ghost
text with no visual weight — all three blind critics flagged this independently. A stray orange dot
sits on the connector. The resolved state in `d-03-mcp-mid.png` is genuinely nice and almost nobody
will scroll slowly enough to see it.

**Good looks like (desktop):** delete `height: 240vh`. One static, resolved, full-ink three-column
row: copy and CTA (cols 1–4), the library list (cols 5–8), the agent actions (cols 9–12), schematic
connectors drawn at rest in a 1px accent rule. All three columns at the same ink weight — **ghost
text is not a resting state.** Remove the orange.

**Mobile — drop two of the three columns.** Per §4B law 1, a three-column desktop row does not become
three stacked blocks. Mobile MCP is: eyebrow, `d2` headline, one `body` sentence, one CTA, and **the
agent-actions column only** (three items, full ink). **The library list is cut entirely on mobile** —
see the deduplication note below. Target 480px, type section.

**Deduplicate the library list.** A mobile critic flagged "a team library list repeated twice": the
same five skill names (`code-review`, `pdf-extraction`, `brand-voice`, `sql-migrations`,
`release-notes`) appear in the hero board *and* again in the MCP section — visible in
`refs/baseline/m-00-fold.png` and `refs/baseline/m-03-mcp.png`. Two renderings of identical data on
one page is why the midsection reads as monotonous. **The list belongs to the hero and the product
slab. MCP does not repeat it at any breakpoint** — it shows what the *agent* does with it.

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

**Mobile — and the debt this creates.** A mobile critic noted our page "relies almost entirely on the
single dark 0 / Free. Forever. block for rhythm" across the whole scroll. Deleting it removes the one
beat mobile had, so **the beat moves to the closing band** (§8.7), which becomes the page's single
ink-inverted section. Pricing itself on mobile is a plain type section: `d2` headline, one sentence,
the three `label` items stacked as a 3-row list with hairlines, one full-width CTA. Target 300px. Do
not reintroduce a dark band here — one inverted section per page, and it is the closing.

### 8.6 FAQ — target 720px (currently 803px)

**Wrong today** (`refs/baseline/d-05-faq.png`): the layout is genuinely good — this is the healthiest
section on the page and the disclosure animation is well built. Two defects only: the left column runs
out of content at ~460px and leaves the rest empty, and the questions are set at 26.4px, heavier than
they need to be.

**Good looks like:** keep the two-column split on desktop. Questions drop to `h1` (28px → so barely a
change in size but a fixed token). Left column becomes `position: sticky; top: 88px` within the
section so the heading tracks the list, and gains one `small` line beneath the intro: a link to the
repo's discussions. Rows keep their hairlines, 24px padding block.

**Mobile:** one column — `d2` headline, one `body` sentence, then the eight rows at `h1`. No sticky
column, no two-column split. Type section. Target 720px.

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

**This is the page's one inverted section**, at both breakpoints: `--surface-ink` ground with
`--surface-ink-foreground` type. It inherits the rhythmic job the pricing band was accidentally doing
(§8.5) at roughly a third of the height, and it carries a real CTA instead of a numeral. Per §5, the
CTA inside it is **ink-inverted, not accent** — a light fill with dark label. No large green fill on
a dark ground anywhere on this page.

**Mobile:** identical treatment, `d2` at 28px, full-width CTA. Target 380px including the handoff.

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

| # | Section | Desktop | Mobile | Treatment (§4B) | Status |
|---|---|---|---|---|---|
| 1 | Hero | **720px** | **660px** | slab | shrink from 1620, remove 180vh runway |
| 2 | Proof strip | **120px** | **160px** | type | **new** |
| 3 | Workflow | **640px** | **620px** | slab | shrink from 855, fill the empty columns |
| 4 | Product slab | **720px** | **560px** | slab | **new** |
| 5 | MCP | **560px** | **480px** | type | shrink from 2160, remove 240vh runway |
| 6 | Pricing | **320px** | **300px** | type | shrink from 801, band and zero deleted |
| 7 | FAQ | **720px** | **720px** | type | roughly unchanged |
| 8 | Closing | **480px** | **380px** | **inverted** | shrink from 593 + 738 of void |
| 9 | Footer | **200px** | **280px** | type | grow from ~90 |
|  | **Total** | **≈4480px** | **≈4160px** | | from 7006 / 5507 |

Read the treatment column down: slab, type, slab, slab, type, type, type, inverted. That alternation
*is* the mobile rhythm (§4B law 3) — it replaces the dark band's beat structurally rather than
chromatically, and it costs nothing.

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
21. Letter-spacing above `0.14em` (`0.10em` on mobile).
22. Per-component `clamp()` and `vw` font sizes. Every size resolves to a §3 token.
23. A third typeface, in any form.
24. **On mobile: any type step within 1.2× of its neighbour.** We currently ship four display sizes
    inside a 12px band (48/44/40/36) and eight more inside an 8px band. Mobile has seven steps, and
    `h2`, `lead` and `micro` do not exist there.

**Mobile**

25. **Product visuals scaled down to fit the column.** Crop at full scale and bleed off the right
    edge instead. The five-card hero cluster at 390px is the worst instance.
26. Any two-column layout below 1024px.
27. Stacking all three columns of a desktop row. Drop two — one visual, one sentence.
28. Rendering the same data twice — the team-library list currently appears in both the hero and MCP.
29. More than one ink-inverted section per page. It is the closing band.

**Motion**

30. `.magnetic` cursor pull.
31. Scroll-linked opacity, position, or path-length on primary content. Parallax. Marquees.
    Animated counters. Ambient loops. CSS scroll-driven timelines.
32. Any duration over `420ms`, and any duration between `260ms` and `400ms`.
33. Any curve outside the three in §7.1. No `linear()` springs. No `linear` on anything visible
    except an opacity crossfade.
34. Hover, focus, or active states driven from JavaScript rather than CSS.
35. `transform` on `:active`. Press is `opacity: 0.92` at 0ms.
36. Per-word headline reveals, and `filter: blur()` on any text.
37. Reveals that replay on scroll-back, or that leave `will-change` on the node after finishing.

**And the things to protect, not kill:** the left-aligned editorial system, the warm neutral ground,
the forest green, the Bricolage/Geist pairing, the hero card stack as a *composed* object (on
desktop), the FAQ disclosure implementation, and the existing reduced-motion discipline. Blind
critics at both widths named the first four as the reasons we beat Vercel and input-otp — twice each.
We are 4–2, and both losses are to the same page for the same reason: Linear pays the reader on every
screen and we do not. Fix the proportion and the evidence. **This is an elevation. Nobody rebrands
anything.**
