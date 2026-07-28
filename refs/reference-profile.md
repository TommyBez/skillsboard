# Reference profile — measured, not judged

Generated from `refs/harness/out/profile-*.json` (`./refs/harness/run.sh profile.mjs <url> <label>`),
captured 2026-07-28. Every number here came out of a browser, not out of an opinion.

This exists because our entire reference analysis had been one full-page screenshot per site handed
to a critic. That method produced six wins and missed a mobile layout that sliced words in half.
Numbers do not have taste, but they do not flatter either.

## Desktop, 1440×900

| | ours | Linear | Vercel | input-otp |
|---|---|---|---|---|
| Document height | **4,955px** | 10,898px | 5,956px | 9,762px |
| Screens of scroll | **5.5** | 12.1 | 6.6 | 10.9 |
| Content ratio | **0.85** | 0.68 | 0.65 | 1.00 |
| Longest void run | **256px** | 330px | 360px | 0px |
| Sections | 8 | 11 | 7 | 8 |
| Median section height | **676px** | 1,090px | 714px | 498px |
| Tallest section | **919px** (1.02 screens) | 1,404px (1.56) | 926px (1.03) | 5,760px (6.4) |
| Type combinations | **13** | 42 | 16 | 63 |
| Distinct weights | **3** | 4 | 3 | 9 |
| Typefaces | **2** | 2 | 2 | 4 |
| Smallest type | **12px** | 10px | 11px | 7.5px |
| Distinct radii | **2** (6, 10) | 19 | 6 | 19 |
| Distinct shadows | **0** | — | 3 (up to 6 layers) | 5 |
| Distinct computed transitions | **3** | 5 | 8+ | 10+ |

## Mobile, 390×844

| | ours | Linear | Vercel | input-otp |
|---|---|---|---|---|
| Document height | **5,006px** | 6,382px | 6,697px | 10,877px |
| Screens of scroll | **5.9** | 7.6 | 7.9 | 12.9 |
| Type combinations | **10** | 28 | 16 | 63 |
| Sizes above 24px | 2 | 1 | 2 | 7 |
| Largest type | 44px | 38px | 48px | 54.6px |

## What the numbers say

**Discipline: we win, and not narrowly.** 13 type combinations against Linear's 42 and input-otp's
63. Two radii against nineteen. Zero shadows. Three computed transition specs on the whole page.
This is the axis the shared ramp was built for and it worked — the page shipped 33 combinations from
seven different `vw` slopes before it existed. The blind critics kept calling this "one considered
system"; it is measurable, and it is the most defensible thing about the page.

**Void: the original complaint is genuinely fixed.** Content ratio 0.85 against Linear's 0.68 and
Vercel's 0.65, and our longest single void run is 256px — which is exactly `128 + 128`, two sections'
padding meeting, i.e. the rhythm rather than a hole. At baseline 58% of our page was flat band.

**Density: we are still the shortest page here, and that is the real trade.** 5.5 screens against
Linear's 12.1. We are not short because we are efficient; we are short because we have less to say.
Linear spends twelve screens because it has twelve screens of product to show.

**And here is the measured version of "uniformly polite".** Our tallest section is 919px — **1.02
screens. Nothing on our page ever fills more than one viewport.** Linear's median section is 1,090px
and seven of its eleven sections exceed a full screen; input-otp has one section 6.4 screens tall.
Both of them have moments that take over the viewport and hold it. We have eight polite,
bite-sized blocks in a row.

That is a much more actionable statement than the critics' "never a single scale shift". It is not
that our sections vary too little in height — Vercel's coefficient of variation is 0.17 against our
0.39, so we are *more* varied than Vercel and Vercel does not read as monotonous. It is that **none
of ours is ever big enough to dominate.** The fix is not more variance; it is one section that
commands a full screen and refuses to share it.

## What the profiler got wrong

Stated because a measuring instrument that is trusted uncritically is how we got here.

- **Accent detection is unreliable on our page.** It reports our accent as `#f5f4ec` at hue 53 —
  that is the warm off-white ground, not the forest green. The heuristic picks by weighted
  prevalence and a near-neutral ground with a slight hue bias beats a green used four times per
  viewport. Read the accent row on any of these sites with suspicion.
- **`contentRatio` of 1.00 for input-otp** means the row-scan found no flat band at all, which is an
  artefact of a dark page with an animated ASCII texture behind everything: every row varies by more
  than the threshold. It does not mean the page has no empty space.
- **Section segmentation is heuristic.** It reports 8 sections for us and 11 for Linear by walking
  top-level blocks; a differently-marked-up page will segment differently, so cross-site section
  counts are indicative, not exact.
- Two widths only, resting state only, headless Chromium. See `refs/harness/README.md` for the full
  list of what none of this can see.

## The question this was built to answer

Does "we beat all three" survive being compared at the scale a human actually sees, rather than as
two 10,000px smears?

`refs/harness/sections.mjs` now captures like-for-like viewport-sized modules. Two head-to-heads
against Linear were run at that scale, and the honest answer is: **partly no, and the instrument
was at fault before the design was.**

**First run, hero vs hero — we won.** The critic's stated reason for Linear losing was that "the
headline is amputated by the viewport, the first line sits behind the nav and reads as ghosted
noise". That is not a design judgement. `sections.mjs` was scrolling each section's top edge to the
top of the screen, so on any site with a fixed header the first line of every section rendered
underneath it. The tool was penalising Linear for having a sticky nav — and it did the same to us,
we just happen to open with an eyebrow rather than a headline.

Fixed: the capture now measures the tallest top-pinned overlay and offsets by it.

**Re-run on the corrected instrument — Linear wins.** Same pair, same protocol, blind, forced
pick, and the verdict reversed:

> "The headline states a specific, contested category claim — 'The product development system for
> teams and agents' — and is backed by a real, dense product surface, an actual issue with an agent
> session pushing a draft PR, so the copy and the visual make the same argument instead of merely
> coexisting."

And on ours:

> "A generic two-line platitude whose second line is a filler phrase given the loudest treatment on
> the page. It needs a claim that says what the product actually does that nothing else does, and it
> needs to stop colouring the weakest words green."

That last clause matters more than the loss. The single green line is the thing two earlier critics
named as our discipline and the direction protected explicitly as "the reason we read as a brand and
not as a template". It is being spent on *"All in one place."* — the least informative four words on
the page.

**Evidence module vs Linear's, at viewport scale — we won, and this one stands.** Ours was legible
where Linear's was not: "you can read the search field, the tag filters, the '18 team skills' count,
a real reviewer note and the exact `npx skills add` command, so the module teaches you what the
thing does in one glance, while B fades 60% of its board into near-black and crops the left column,
delivering atmosphere instead of information." That comparison was not affected by the header bug —
neither module leads with a headline at its top edge.

**So the corrected standing at section scale against Linear is 1–1, not 2–0.** The full-page sweep
of six wins was taken on an instrument that flattened Linear's dense UI into a smear; at the scale a
visitor actually sees, Linear's hero beats ours and our evidence module beats theirs. Both readings
are defensible about different things, and the honest summary is that we win on legibility and
system discipline and lose on the strength of the claim.
