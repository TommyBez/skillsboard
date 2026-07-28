# Motion spec — `input-otp.rodz.dev` (Guilherme Rodz)

Reconnaissance target for motion and interactive craft. Everything below was measured on the
live site on 2026‑07‑28 by driving Chromium (Playwright + CDP), not read off a screenshot.

**How each claim was obtained** — labelled inline:

| Tag | Method |
|---|---|
| `[computed]` | `getComputedStyle` on the live element, before/during/after the interaction |
| `[CDP]` | Chrome DevTools Protocol `Animation.animationStarted` — reports the real effect timing (duration, delay, easing, fill) for every CSS transition / CSS animation / WAAPI animation the page starts |
| `[css]` | Read out of the served stylesheets (`_next/static/css/*.css`, parsed via `document.styleSheets`) |
| `[src]` | Read out of the served, minified JS bundles (8 files, ~519 KB) — exact constants, not guesses |
| `[frame]` | Visible in a screenshot under `refs/motion-frames/` |
| `[inferred]` | My reading, not directly measured. Called out every time. |

Stack: Next.js (app router), Tailwind, hand-written CSS + WAAPI. **No animation library.**
No Framer Motion, no GSAP, no Motion One in the bundle.

---

## 1. Timing / easing inventory

### 1.1 The easing set actually in use

Nine curves do essentially all the work. There is **no `linear()` spring anywhere on this
site** `[css]` — I scanned all served CSS for `linear(...)` and found zero matches. Everything
is a cubic-bézier. This matters: the "springy" feel comes from *keyframe overshoot*, not from
spring solvers (see §1.2).

| Curve | Nickname | Where it is used | Source |
|---|---|---|---|
| `cubic-bezier(0.22, 1, 0.36, 1)` | easeOutQuint | **The house curve.** Scroll/entrance reveals, `xp-otp-bounce`, `xp-win-letter`, `xp-kbd-pulse`, keycap-drop, anatomy-press, the OTP focus-ring fade-in | `[css]` `[src]` |
| `cubic-bezier(.22,1,.36,1)` | same, JS spelling | the WAAPI reveal engine's single `EASE` constant | `[src]` |
| `cubic-bezier(0.4, 0, 0.2, 1)` | Material standard / Tailwind default | `.xp-btn` (all hover state), every Tailwind `transition-*` utility | `[css]` `[CDP]` |
| `cubic-bezier(0.16, 1, 0.3, 1)` | easeOutExpo-ish | `--fb-ease` and `--pc-ease` — every feature-card demo; the "used by" hover-card open | `[css]` |
| `cubic-bezier(0.4, 0, 0.9, 0.6)` | `--pc-exit` | *exit / de-emphasis only* in the password-manager demo | `[css]` |
| `cubic-bezier(0.32, 0.72, 0, 1)` | `--pc-sheet` | sheet / keyboard slide in the iOS-keyboard demo | `[css]` |
| `cubic-bezier(0.5, 0, 0.9, 0.4)` | fast-out | closing the "used by" hover card | `[css]` |
| `cubic-bezier(0.36, 0.07, 0.19, 0.97)` | classic shake curve | `xp-otp-shake`, `xp-win-shake` | `[css]` |
| `cubic-bezier(0.22, 0.61, 0.36, 1)` | easeOutQuad-ish | hero/CTA canvas fade-in (800 ms), sponsor-card tilt | `[css]` |
| `cubic-bezier(0.76, 0, 0.24, 1)` | easeInOutQuart | the one big "lift" — intro panel exit (700 ms) | `[css]` |
| `cubic-bezier(0.65, 0, 0.35, 1)` | easeInOutCubic | intro wipe / sweep (620 ms) | `[css]` |
| `cubic-bezier(.14,.8,.3,1)` | hard-out | slot-machine reel stop | `[css]` |
| `cubic-bezier(0.45, 0, 0.3, 1)` | | slot-machine lever pull | `[css]` |
| `cubic-bezier(0.1, 0.7, 0.3, 1)` | | spark particles | `[css]` |
| `ease-in-out` | | the OTP focus ring **slide** (130 ms) | `[src]` `[computed]` |
| `step-end` | | every caret blink; the "used by" glitch/tear | `[css]` |
| `linear` | | the spot-ring opacity fade, reel motion-blur, marquees, beam spin | `[css]` `[CDP]` |

Note the discipline: **`ease-in-out` and symmetric curves appear only twice** — the OTP ring
slide and the intro lift. Everything the user triggers is an ease-*out*.

### 1.2 Duration table (measured)

| ms | Easing | Property | Where | Source |
|---|---|---|---|---|
| **0** | — | `opacity 1 → 0.8` | any `<a>` hover, incl. all header nav links (`.xp a:hover{opacity:.8}`, no transition declared) | `[css]` `[computed]` |
| 90 | default | `transform`, `background-color` | keycap `.xp-kbd` press-down | `[css]` |
| 110 | `cubic-bezier(0.22,0.61,0.36,1)` | `transform` | sponsor card **while actively tilting** (`[data-tilting]`) | `[computed]` |
| 120 | `ease` | `opacity` | OTP focus ring **hiding** (blur) | `[src]` `[CDP]` |
| **130** | `ease-in-out` | `transform` | OTP focus ring **sliding** between slots | `[src]` `[CDP]` `[computed]` |
| 140 | `ease-out` | `xp-char-in` (`opacity .2→1`, `translateY 18px→0`) | every typed / pasted character | `[css]` `[CDP]` |
| 140 | | `background`, `color` | keycap `.xp-kbd` colour |`[css]` |
| **150** | `ease` | `border-color`, `box-shadow` | `.xp-slot` state change (active / error / success) | `[css]` `[CDP]` |
| 150 | `cubic-bezier(0.5,0,0.9,0.4)` | `xp-usedby-shot-out` | "used by" preview card closing | `[css]` |
| 160 | | `color`, `opacity` | sponsor tier label | `[css]` |
| 180 | | `box-shadow` | sponsor card | `[css]` |
| 180 | | `color` / `background` | feature-card carousel step | `[css]` |
| **200** | `cubic-bezier(0.4,0,0.2,1)` | `background-color`, `color`, `box-shadow` | **`.xp-btn` hover — the primary CTA** | `[css]` `[CDP]` |
| 200 | `linear` | `opacity` | `.xp-spot-ring` and `.xp-slot::after` cursor-glow fade in/out | `[css]` `[CDP]` |
| 200 | `ease` | `box-shadow` | OTP focus-ring colour change (white → red / green) | `[src]` |
| 220 | | `opacity`, `filter` | "Become a sponsor" label crossfade | `[css]` |
| 220 | `cubic-bezier(0.22,1,0.36,1)` | keycap-drop | docs demo | `[css]` |
| 250 | `ease-out` | `xp-beam-in` | intro win-ring | `[css]` |
| 260 | `cubic-bezier(0.16,1,0.3,1)` | `xp-usedby-shot-in` (`scale .26→1`, `blur 7px→0`) | "used by" preview card opening | `[css]` |
| 300 / 320 | — | timer gap | hero auto-type: `""` → `"1"` → `"12"` | `[src]` |
| 320 | default | `opacity`, `transform` | intro pre-layer exit | `[css]` |
| **420** | `cubic-bezier(0.22,0.61,0.36,1)` | `transform` | sponsor card **settling after release** | `[computed]` |
| 440 | `--fb-ease` | `xp-fb-grid-in` | feature-card grid appear | `[css]` |
| **450** | `cubic-bezier(0.22,1,0.36,1)` | `opacity` | OTP focus ring **appearing** (focus) | `[src]` `[CDP]` |
| **450** | `cubic-bezier(0.36,0.07,0.19,0.97)` | `xp-otp-shake` (±8 px X) | wrong code | `[css]` `[CDP]` |
| 450 | same | `xp-win-shake` | intro jackpot | `[css]` |
| 500 | `ease` | `xp-fade-text` (`opacity 0→1`, `translateY 5px→0`) | every status / tutorial message | `[css]` `[CDP]` |
| 500 | `step-end` | `xp-usedby-tear` | logo glitch/tear on carousel change | `[css]` `[CDP]` |
| 520 | `cubic-bezier(.22,1,.36,1)` | reveal, block elements | scroll entrance (default) | `[src]` `[CDP]` |
| 520 | `cubic-bezier(0.22,1,0.36,1)` | `xp-kbd-pulse` (`scale .94→1.7`, `opacity .6→0`) | keycap key-press halo | `[css]` |
| 550 | `cubic-bezier(0.1,0.7,0.3,1)` | `xp-spark` | intro particles | `[css]` |
| 620 | `cubic-bezier(.22,1,.36,1)` | reveal, `lede` / `body` | scroll entrance (softer variant) | `[src]` `[CDP]` |
| 620 | `cubic-bezier(0.65,0,0.35,1)` | `xp-sweep-clip` | intro wipe | `[css]` |
| **650** | `cubic-bezier(0.22,1,0.36,1)` | `xp-otp-bounce` (`Y 0 → −10 → +3 → −4 → 0`) | correct code, whole field | `[css]` `[CDP]` |
| 650 | `cubic-bezier(0.22,1,0.36,1)` | `xp-win-letter` (`Y 0 → −3.5 → +1 → −1.5 → 0`), **14 ms/letter** | success message wave | `[css]` `[CDP]` |
| 650–1040 | `cubic-bezier(.14,.8,.3,1)` | `xp-reel` | intro reels, `650 + 130 × columnIndex` ms | `[src]` |
| 700 | `cubic-bezier(0.76,0,0.24,1)` | `transform` | intro panel lift-off | `[css]` `[CDP]` |
| **760** | `cubic-bezier(.22,1,.36,1)` | reveal, **per word** (`Y 16px→0`, `blur 9px→0`) | headline word-by-word entrance | `[src]` `[CDP]` |
| 800 | `cubic-bezier(0.22,0.61,0.36,1)` | `opacity` | hero WebGL field fade-in | `[css]` |
| 800 | `cubic-bezier(0.45,0,0.3,1)` | `xp-lever-pull` | intro slot-machine lever | `[css]` |
| 1000 | `step-end` | `xp-blink` | OTP caret (hero) | `[css]` `[CDP]` |
| 1050 | `step-end` | `pc-blink` | caret in the password-manager demo | `[css]` |
| 1200 | `ease-out` | `caret-blink` (70/20/50 keyframes — asymmetric) | docs OTP caret | `[css]` |
| 1300 | — | timer | success → tutorial mode | `[src]` |
| 3200 | `linear` | carousel progress fill | feature card | `[css]` |
| 4500 / 4800 / 5000 / 5400 | `--fb-ease` | ambient loops | feature-card demos | `[css]` |
| 7000 | `linear` | `xp-cta-scan` | light sweep across the footer hairline | `[css]` |

**The clustering is the point.** Interaction feedback: **90–200 ms**. State change: **450–650 ms**.
Entrance: **520–760 ms**. Ambient loops: **3–7 s**. Nothing sits in the dead zone between
250 ms and 400 ms except the sponsor-tilt settle.

### 1.3 Stagger intervals (all measured)

| Stagger | Where | Source |
|---|---|---|
| **14 ms** | letters of the success message (`xp-win-letter`, `--i × 14ms`) — CDP saw delays 0,14,28,…,406 | `[CDP]` `[css]` |
| **46 ms** | words of a headline during scroll entrance (`glyphStep`) — CDP saw 60,106,152,198 | `[src]` `[CDP]` |
| 55 ms | successive `chrome`-role elements | `[src]` |
| 60 ms | `anatomy-slot` press cascade | `[css]` |
| 70 ms / 80 ms / 90 ms | successive `action` / `card`+`lede`+`eyebrow` / `title` elements | `[src]` |
| 130 ms | each additional intro reel column's spin duration | `[src]` |
| 300 / 320 ms | the two hero auto-typed characters | `[src]` |

---

## 2. Per-interaction breakdown

### 2.1 Primary CTA — "Get started" (`a.xp-btn`)

**Rest** `[computed]`: transparent background; `border: 2px solid rgba(255,255,255,0.05)`;
`background-image: linear-gradient(104deg, rgba(252,252,252,.05) 5%, rgba(241,241,229,.1))`;
`backdrop-filter: blur(25px)`; `border-radius: 16px`;
`box-shadow: 0 1px 3px rgba(0,0,0,.1), 0 1px 2px -1px rgba(0,0,0,.1)`;
plus a `::after` overlay inset **−2px** on all sides carrying a repeating
`url(/button-grain.png)` **noise texture**.

| Trigger | What changes | Duration | Easing |
|---|---|---|---|
| hover / focus-visible | `background-color: transparent → rgba(255,255,255,0.9)`; `color: #fafafa → #09090b`; `box-shadow` → three stacked white glows `0 0 4px rgba(255,255,255,.06), 0 1px 14px rgba(255,255,255,.12), 0 3px 32px rgba(255,255,255,.18)` | **200 ms** | `cubic-bezier(0.4,0,0.2,1)` `[CDP]` |
| cursor **near** (≤ 560 px) | `.xp-spot-ring` — a 1-px conic/radial gradient *border* that lights up where the cursor is; `--xp-spot` opacity ramps quadratically with proximity, `--xp-mx/--xp-my` track the pointer | **200 ms `linear`** on opacity, position updates every rAF | `[CDP]` `[src]` |
| mouse down | **nothing.** `transform: none`, `scale: none`, identical background and shadow to hover | — | `[computed]` |

**There is no press state.** Measured `getComputedStyle` at 80 ms into `mousedown`: byte-identical
to the hover state. No scale-down, no translate, no shadow change. `[computed]` `[frame]`
(`btn-04-pressed.png` vs `btn-02-hover-settled.png`).

**Focus-visible is a measured defect, not a design choice.** The stylesheet declares
`.xp-btn:focus-visible { outline:none; box-shadow: 0 0 0 4px rgba(255,255,255,.3) }` `[css]`, but
`.xp .xp-btn:not(.xp-btn--quiet)` (specificity 0‑3‑1) also sets `box-shadow` and wins over
`.xp-btn:focus-visible` (0‑2‑1). Focusing the button by keyboard gives
`box-shadow: 0 1px 3px rgba(0,0,0,.1), 0 1px 2px -1px rgba(0,0,0,.1)` — **the resting shadow, no
ring** `[computed]`. The only focus affordance that survives is the white background (which the
`:focus-visible` selector also sets). See `btn-06-focus-visible.png`.

### 2.2 The cursor-proximity border glow (`--xp-spot`)

This is the site's signature ambient interaction and the thing a naive rebuild gets wrong.

Exact algorithm `[src]`:

```js
// one rAF-coalesced pointermove listener for the whole group
const dist = Math.hypot(
  Math.max(rect.left - mx, 0, mx - rect.right),   // 0 while inside the box
  Math.max(rect.top  - my, 0, my - rect.bottom)
)
const o = Math.max(0, 1 - dist / 560)
container.style.setProperty('--xp-spot', String(o * o))          // QUADRATIC falloff
slots.forEach((el, i) => {                                        // per child, not per group
  el.style.setProperty('--xp-mx', (mx - rects[i].left) + 'px')
  el.style.setProperty('--xp-my', (my - rects[i].top)  + 'px')
})
```

Rendered by `[css]`:

```css
.xp-spot-ring {                    /* also .xp-otp-spot .xp-slot::after */
  position: absolute; inset: 0; border-radius: inherit;
  padding: var(--xp-spot-width, 1px);
  background: radial-gradient(
      var(--xp-spot-spread, 240px) circle at var(--xp-mx, -9999px) var(--xp-my, -9999px),
      rgba(232,240,255,.95) 0, rgba(226,236,255,.42) 30%, rgba(214,228,255,0) 72%);
  mask: linear-gradient(#000 0, #000 0) content-box exclude,
        linear-gradient(#000 0, #000 0);          /* keeps only the 1px border band */
  opacity: var(--xp-spot, 0);
  transition: opacity .2s linear;
  pointer-events: none;
}
```

Key facts:
- **Radius is 560 px and the ramp is squared** — the glow starts appearing long before you hover,
  and accelerates as you close in. It is not an on/off `:hover`.
- Spread is tuned per component: `.xp-btn` **150 px**, install chip **200 px**, tweet card
  **300 px**, feature card **380 px**, OTP slot `--xp-reach` **240 px** (130 px under 900 px wide).
  `[computed]` `[css]`
- Each OTP slot additionally carries a fixed gain `--xp-lit` of
  **`[1, 0.6, 0.34, 0.34, 0.6, 1]`** `[src]` — the outer slots glow at full strength, the inner
  ones at a third. This makes the six-box group read as one lit object instead of six
  independent boxes.
- Recomputed on `scroll` and `resize` too, not only `pointermove` `[src]`, so the glow stays
  geometrically correct while the page moves under a stationary cursor.
- Killed entirely on coarse pointers and under reduced motion `[src]` `[css]`.

Verified live: moving from the button's top-left to its bottom-right changed
`--xp-mx/--xp-my` from `8px/8px` to `136px/40px`; leaving the element set `--xp-spot: 0` while
*leaving `--xp-mx/--xp-my` at their last values* (so the fade-out happens in place, it does not
snap the gradient to the origin) `[computed]`.

### 2.3 Copy-command chip (`npm install input-otp`)

| Trigger | What changes | Duration |
|---|---|---|
| cursor proximity | `.xp-spot-ring` at 200 px spread, 1.5 px band | 200 ms linear `[computed]` |
| hover the copy button | `color: #71717a → #fafafa` | **0 ms** — no transition declared `[css]` |
| click | icon element is **swapped**: copy glyph → a check `path` stroked `#34d399`, for exactly **1500 ms**, then swapped back | instant, no transition `[src]` |

There is no toast, no chip-wide flash, no width change, no haptic. The entire "copied" feedback
is one 14×14 px icon turning green. `[src]` `[frame]` `chip-04-copied-*.png`.

### 2.4 Header nav links

`[computed]` measured before/after hover:

- `color` unchanged (`rgb(161,161,170)`), `transform: none`, no underline, no background.
- The only change is `opacity: 1 → 0.8`, from the single global rule `.xp a:hover { opacity: .8 }`.
- `transition-duration: 0s` — **the change is instantaneous**, no easing at all.

The "★ 3.1k" GitHub pill: `background`, `border-color` and `color` all unchanged on hover
`[computed]`. It gets the same 0 ms opacity dip and nothing else.

The header is `position: static` `[computed]` — it scrolls away and never returns. There is no
sticky bar, no shrink, no backdrop-blur-on-scroll.

### 2.5 "Used by" logo row

- Idle: the row cycles logos on a ~1.5 s beat, each swap masked by `xp-usedby-tear` —
  a **500 ms `step-end`** glitch (7 discrete `clip-path` slices with X jitter of −5…+7 px and
  opacity flicker). `step-end` means it snaps between slices; there is no interpolation.
  `[css]` `[CDP]`
- Hover any logo: that item goes to `opacity: 1`, **every sibling drops to `opacity: 0.26`**
  over 220 ms `[css]` `[computed]` (measured `["1","0.26","0.26"]`).
- A 420 × 236 px product screenshot card portals in at the cursor:
  `xp-usedby-shot-in` **260 ms `cubic-bezier(0.16,1,0.3,1)`**, `scale .26→1` with
  `filter: blur(7px)→0` (blur clears at 55 % of the timeline, before the scale finishes).
  Closing uses a *different, faster, ease-in* curve: **150 ms `cubic-bezier(0.5,0,0.9,0.4)`**.
  `transform-origin` is set from the pointer position (`--ox/--oy`) so it grows out of the cursor.
  Shadow is a **six-layer ramp**: `0 0 0 1px rgba(250,250,250,.08), 0 1px 2px, 0 3px 6px,
  0 8px 16px, 0 18px 36px, 0 36px 72px` at decreasing alpha `.32 → .24`. `[css]` `[computed]`
  `[frame]` `usedby-hovercard-*.png`

### 2.6 Sponsor cards — pointer tilt

The clearest "interruptibility by design" pattern on the site `[computed]`:

| State | `transition-duration` | `transition-timing-function` |
|---|---|---|
| `[data-tilting]` (cursor inside, actively tracking) | **0.11 s** | `cubic-bezier(0.22,0.61,0.36,1)` |
| released (cursor gone) | **0.42 s** | same |

Same property (`transform`, a `matrix3d` tilt), same curve — only the duration is swapped by an
attribute. While you drive it, it feels welded to the cursor; when you let go, it settles.
`will-change: transform` is applied **only while `[data-tilting]`** `[css]`.

---

## 3. The OTP input — the centrepiece

Hero markup: six `.xp-slot` divs (82 × 104 px desktop, 44 × 58 px ≤ 900 px), a `·` separator, and
**one real `<input maxlength="6" autocomplete="one-time-code" pattern="^[a-zA-Z0-9]+$">`
absolutely positioned over the top** with `color: transparent; caret-color: transparent` and
`[data-input-otp]::selection { background: transparent !important; color: transparent !important }`
`[css]` — the native input is fully functional but visually erased.

### 3.1 The active-slot indicator is a shared floating element, not a per-slot class

This is the single highest-leverage detail on the page and the easiest to miss.

The white ring is **one absolutely-positioned `div`** over the whole field, moved by
`transform: translate(Xpx, Ypx)` and sized to the target slot. Measured translate values as I
typed: `0px → 92px → 184px` (82 px slot + 10 px gap) `[computed]`.

Its transition string is **swapped at runtime** depending on whether the move is a *slide* or a
*teleport* `[src]`:

```js
transition: snap
  ? "opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.2s ease"   // appearing
  : "transform 0.13s ease-in-out, opacity 0.12s ease, box-shadow 0.2s ease" // moving
boxShadow: `0 0 0 2px ${error ? '#ef4444' : success ? '#34d399' : '#fafafa'}`
```

`snap` is set when the ring was previously invisible. So:

- **Appearing** (focus): position is applied with **no transform transition** — it materialises in
  place — and fades in over **450 ms easeOutQuint**. It never flies in from `translate(0,0)`.
- **Moving** (keystroke): **130 ms `ease-in-out`** slide, verified by CDP as
  `CSSTransition transform dur=130 ease=ease-in-out` on every single keystroke and backspace.
- **Disappearing** (blur): **120 ms** opacity — measured asymmetry, out is 3.75× faster than in.
- **Recolouring** (error/success): **200 ms `ease`** on `box-shadow` only; the ring does not move.

Per-slot `.xp-slot` borders also transition `border-color, box-shadow` over **150 ms** `[css]`, but
in the hero the *static* `.xp-slot--active` class is only applied when more than one character is
present — the moving ring is the primary indicator.

### 3.2 Per keystroke

| Event | What happens | Timing |
|---|---|---|
| character committed | a fresh `<div class="xp-char-in">` is mounted inside the slot; `xp-char-in` = `opacity .2→1`, `translateY(18px)→0` | **140 ms `ease-out`** `[css]` `[CDP]` |
| ring | slides one slot | 130 ms ease-in-out `[CDP]` |
| caret | a `div.xp-caret` is *moved* into the next empty slot and runs `xp-blink` | **1000 ms `step-end`** (hard on/off, 50 % duty) `[css]` `[CDP]` |
| backspace | character div unmounts with **no exit animation**; ring slides back 130 ms; caret re-mounts | `[CDP]` |
| paste (6 chars) | **six `xp-char-in` at 140 ms fire simultaneously — zero stagger** | `[CDP]` |

The paste behaviour is a deliberate call: typing is sequential so each character earns its own
rise; pasting is one atomic event so the whole code lands at once. Invalid paste
(`ab-!cd`, fails the alnum pattern) is **silently rejected** — the field stays empty, no shake, no
message `[computed]`.

### 3.3 On completion

The hero is a guessing game; the target is hard-coded `"123456"` `[src]`:
`onComplete: v => v === "123456" ? success() : error()`.

**Correct** `[src]` `[CDP]` `[frame]` `otp-success-t0060ms-green.png`:
1. all six `.xp-slot` get `border-color: rgba(52,211,153,0.6)` over 150 ms;
2. the floating ring's `box-shadow` recolours to `#34d399` over 200 ms;
3. `xp-otp-bounce` on the **container** — `translateY 0 → −10px → +3px → −4px → 0`,
   **650 ms `cubic-bezier(0.22,1,0.36,1)`** — a keyframed overshoot, not a spring;
4. the message `✓ 123456 — you guessed it! let's play` renders with **one `<span>` per character**,
   each running `xp-win-letter` (`Y 0 → −3.5 → +1 → −1.5 → 0`, 650 ms, same curve) at
   **`--i × 14 ms`** — CDP captured 30 animations at delays 0…406 ms. A ripple, not a fade.
5. after exactly **1300 ms** the component switches to a keyboard tutorial mode.

**Wrong** `[src]` `[CDP]` — DOM captured mid-flight showed
`class="xp-otp-container xp-otp-spot xp-otp-shake"`, slots `xp-slot xp-slot--error`, message
`"nope. it starts with 1 2 …"` in `rgb(248,113,113)`:
1. `xp-otp-shake` — `X: −2, +4, −8, +8, −8, +8, −8, +4, −2, 0` over
   **450 ms `cubic-bezier(0.36,0.07,0.19,0.97)`**;
2. slots go red (`#ef4444` on the ring, `.xp-slot--error` border);
3. `xp-fade-text` 500 ms for the message;
4. after **exactly 450 ms** — the same length as the shake — the error clears, the value clears,
   and at **+850 ms** the demo restarts its own auto-type. The error is not sticky.

The error window is only 450 ms, which is *shorter than my screenshot round-trip on this page*, so
I have DOM + CDP proof of it but **no clean rasterised frame**. Stated explicitly rather than
faked.

### 3.4 The scripted demo around it

On load the field is `disabled` with `pointer-events: none` and types itself `[src]`:

```
t+0    reset, ghost caret at slot 0
t+300  value "1",  ghost caret 1
t+620  value "12", ghost caret 2
t+940  disabled = false, cursor: text, pointer-events: all  →  handed to the user
```

It **only auto-focuses if at least 60 % of the field's height is inside the viewport**
(`Math.min(rect.bottom, innerHeight) - Math.max(rect.top,0) >= 0.6 * rect.height`) `[src]` — it
will not steal your caret if you have already scrolled past the hero.

---

## 4. Entrance and scroll choreography

### 4.1 First-visit intro (once per browser)

A full-screen slot-machine preloader. Total scripted length **`2330 + 16 × 29 + 250 = 3044 ms`**,
then a 700 ms lift `[src]`. Sequence, with observed wall-clock offsets from a MutationObserver
installed before first paint `[measured]`:

| t (observed) | Event | Motion | Source |
|---|---|---|---|
| ~1.3 s | hero WebGL field `data-ready` | `opacity 0→1`, 800 ms `cubic-bezier(0.22,0.61,0.36,1)` | `[css]` |
| 0 | reels start (delay 240 ms) | `xp-reel` translateY, **`650 + 130×col` ms** `cubic-bezier(.14,.8,.3,1)` — cols 0‑3 = 650/780/910/1040 ms, so they stop left-to-right; paired with `xp-reel-blur` (`blur 0 → 2.5px` held 10–80 % → 0) for **real motion blur** | `[src]` `[CDP]` |
| 1280 ms | jackpot | box goes green (`border/background/box-shadow` 500 ms `ease`), `xp-win-shake` 450 ms, `xp-win-flash` 500 ms, `xp-beam-ring` (250 ms in + 650 ms linear infinite spin), **12 `xp-spark` particles** at radius `150 + (i%3)×55` px, 550 ms, delays `(i%4)×30 ms` | `[src]` `[css]` |
| 1630 ms | wipe | `xp-sweep-clip` clip-path wipe **620 ms `cubic-bezier(0.65,0,0.35,1)`** + a caret travelling `left: 100% → 0` on the same curve | `[css]` |
| 2330 ms | typewriter | "thank you for 700M downloads!" at **16 ms/char**, then a block caret `xp-blink 1s step-end` | `[src]` |
| 3044 ms | lift | `.xp-panel--up` `transform` **700 ms `cubic-bezier(0.76,0,0.24,1)`** + `.xp-pre-exit` opacity/transform 320 ms | `[css]` `[CDP]` |

Craft notes:
- **Any `pointerdown` or `keydown` skips it immediately** `[src]` — a global listener calls the
  same lift path. You are never trapped.
- `localStorage['xp-intro-seen']` — plays **once per browser, ever**. Repeat visits go straight to
  the hero. (I confirmed this by pre-seeding the key: `preloaderPresent: false`, `__xpIntroDone: true`.)
- Skipped entirely under `prefers-reduced-motion: reduce`.
- It dispatches `xp:intro-lift` / `xp:intro-done`; the reveal engine starts **300 ms after `lift`**,
  i.e. it overlaps the tail of the panel exit rather than waiting for it.

Frames: `intro-seq-00.png` … `intro-seq-25.png` (an ordered sequence at roughly 180–250 ms per
frame — the cadence is **not exact**, screenshot latency is included).

### 4.2 The scroll reveal engine

Hand-written WAAPI, ~60 lines. Complete config, read verbatim from the bundle `[src]`:

```js
const EASE = "cubic-bezier(.22,1,.36,1)"
{
  split:      { title: "words" },                 // only headlines are split
  followTitle: 1,
  base: { eyebrow:0, title:60, lede:110, body:170, card:180, action:300, chrome:420 },  // ms
  step: { eyebrow:80, title:90, lede:80, body:70, card:80, action:70, chrome:55 },      // ms per sibling
  glyphStep: 46,                                   // ms per word
  block: role => {                                 // non-split elements
    const soft = role === "lede" || role === "body"
    return [[{opacity:0, transform:`translateY(${soft?14:10}px)`, filter:`blur(${soft?6:4}px)`},
             {opacity:1, transform:"translateY(0)",               filter:"blur(0px)"}],
            {duration: soft ? 620 : 520, easing: EASE}]
  },
  glyph: () => [[{opacity:0, transform:"translateY(16px)", filter:"blur(9px)"},
                 {opacity:1, transform:"translateY(0)",    filter:"blur(0px)"}],
                {duration: 760, easing: EASE}]
}
delay = base[role]
      + (role==='title'||role==='eyebrow' ? 0 : followTitleOffset)
      + seq * step[role]
followTitleOffset = Math.min((titleWordCount - 1) * 46, 300)   // capped at 300ms
```

CDP confirmed these exact numbers firing on the features section: word animations at
`760 ms, delay 60/106/152/198` (46 ms apart), then blocks at `620 ms delay 248`,
`520 ms delay 318`, and a card run at `520 ms delay 180/260/340/420/500` (80 ms apart).

Behaviours that matter:

- **Blur is part of the reveal.** 4 px for most blocks, 6 px for body copy, **9 px for individual
  headline words**. The blur clears on the same curve as opacity and Y. This is what makes the
  entrance read as "focus pulling" rather than "fade up".
- **Only headlines are split into words.** Body copy animates as one block — no per-word text
  animation on paragraphs.
- **`followTitleOffset` is capped at 300 ms** so a long headline never pushes the rest of the
  section into a slow-motion cascade.
- **It never replays.** `IntersectionObserver({threshold: 0, rootMargin: "0px 0px -5% 0px"})`,
  `observer.unobserve(el)` on first intersection, plus `dataset.rvPlayed = "1"`. Measured: scrolled
  to the features section, back to top, and down again — **0 new animations** `[CDP]`.
  Frame: `scroll-03-features-scrollback-no-replay.png`.
- **It cleans up after itself.** On `animation.onfinish` it sets `transition: none`, *removes* the
  inline `opacity`, `transform`, `filter` **and `will-change`** properties, stamps
  `data-rv-done="1"`, then restores the element's original `transition` on the next rAF. No
  orphaned compositor layers, no stuck `will-change`. Confirmed live: the observer log shows
  `will-change: opacity, transform, filter` → `transition: none` → attribute removed, all within
  ~200 ms of the animation ending.
- **`visibilitychange` → finish everything instantly.** Tab away mid-reveal and come back and the
  page is already settled rather than replaying a queue.
- Non-hero groups that became visible before the intro finished get **+120 ms** extra delay so they
  land after the hero, not with it.

### 4.3 Rest of the page

- `html { scroll-behavior: smooth }` `[computed]`.
- Exactly **one** `position: sticky` element on the whole 9762 px page — a
  `sticky top-0 h-[100svh]` pinned scene inside "How I built it" `[computed]`.
- **No CSS scroll-driven animations.** `animation-timeline` is `auto` everywhere; no
  `scroll()` / `view()` timelines in any stylesheet `[css]`.
- Feature-card demos pause themselves: `.xp-fb-card.xp-fb-is-document-hidden * { animation-play-state: paused !important }`
  and a `data-running="false"` gate on carousel progress `[css]`. Off-screen / hidden-tab loops
  stop burning frames.

---

## 5. Interruptibility — measured, not assumed

I hovered the CTA and reversed the pointer mid-flight, reading the reverse transition's real
duration off CDP.

| Scenario | Forward duration | Reverse duration reported by CDP |
|---|---|---|
| leave after **80 ms** of a 200 ms hover | 200 ms | **91.66 ms** (`background-color`, `color`, `box-shadow`) |
| the spot-ring (200 ms `linear`) in the same gesture | 200 ms | **66.75 ms** |
| leave after **40 ms** | 200 ms | **0 ms** |

91.66 ms is exactly what you get from the CSS Transitions *reversing shortening factor*:
`cubic-bezier(0.4,0,0.2,1)` evaluated at `t = 80/200 = 0.4` outputs ≈ 0.458, and
`0.458 × 200 = 91.6 ms`. So the reverse **starts from the current rendered value and takes
proportionally less time** — it does not snap, and it does not take the full 200 ms to crawl back
from a value it never reached.

**This is free.** It is the browser's default behaviour for CSS transitions. The lesson is what
the site *doesn't* do: it never reimplements hover states in JS with fixed-duration tweens, which
is where the snap-back artefact normally comes from.

For state that is genuinely JS-owned, the site swaps durations rather than fighting the engine:

- **Sponsor tilt**: 110 ms while tracking → 420 ms on release (§2.6) `[computed]`.
- **OTP ring**: no `transform` transition at all when it teleports, 130 ms when it slides (§3.1)
  `[src]`. A shared-element indicator that never animates a long-distance jump is the correct
  general solution to "the ring flew across the screen".
- **"Used by" card**: 260 ms easeOutExpo open / 150 ms ease-in close — asymmetric by design,
  `[data-state]`-driven CSS animations with `onAnimationEnd` unmount `[css]` `[src]`.

Not verified: I did not test interrupting the OTP ring mid-slide (typing faster than 130 ms/char).
`[inferred]` — since it is a plain CSS transition on `transform`, the same reversing/retargeting
rules would apply.

---

## 6. What is deliberately still

Restraint is doing at least as much work here as the animation.

1. **Every header nav link.** No colour transition, no underline grow, no background, no
   translate. `opacity: 1 → 0.8` at **0 ms**. The most-hovered, least-important targets on the page
   get the cheapest possible feedback `[computed]`.
2. **The "★ 3.1k" pill.** Background, border and colour all unchanged on hover `[computed]`.
3. **No press/active state anywhere I measured.** The CTA at 80 ms into `mousedown` is identical
   to its hover state — no scale, no translate `[computed]`.
4. **No layout animation.** Nothing on the page animates `width`, `height`, `top/left`, or grid
   position. Every measured animation is confined to `transform`, `opacity`, `filter`,
   `clip-path`, `box-shadow`, `border-color`, `background-color`, `mask-position`, `stroke-dashoffset`.
5. **Body copy is never split.** Only headlines get per-word treatment `[src]`.
6. **Backspace has no exit animation.** Characters rise in over 140 ms and simply vanish on delete
   `[CDP]`.
7. **No sticky/shrinking header, no scroll progress bar, no parallax, no scroll-jacking, no
   cursor follower, no page-transition overlay, no scroll-driven CSS timelines.**
8. **Invalid paste is silent** — no shake, no error copy, nothing `[computed]`.
9. **The copy confirmation is one icon.** No toast, no chip flash, no width change `[src]`.
10. **Caret blinks are `step-end`.** Both hero (`xp-blink`, 1 s) and the demos (`pc-blink`,
    1.05 s) use hard on/off — matching a real terminal caret. The only faded caret
    (`caret-blink`, 1.2 s `ease-out`, 70/20/50 keyframes) lives on the docs page `[css]`.
11. **No `linear()` springs, no bounce library.** Every "springy" moment is a hand-authored
    keyframe with explicit overshoot values (`xp-otp-bounce`: −10, +3, −4, 0) `[css]`.

---

## 7. What makes it feel expensive (and what a naive rebuild misses)

Ranked by how much they matter versus how likely they are to be skipped.

1. **A shared moving indicator instead of per-item state.** Six slots with
   `.slot.active { border-color: white }` is the obvious build and it feels dead. One ring that
   *travels* 130 ms between slots is the whole difference — and the fact that it **snaps rather
   than slides when it appears** is what stops it feeling like a glitch on focus.
2. **Ambient proximity, not binary hover.** The 560 px squared-falloff glow means the UI starts
   responding to you before you arrive. A `:hover` boolean can never produce this.
3. **Per-element gain constants.** `--xp-lit: [1, .6, .34, .34, .6, 1]` on the six slots. Nobody
   would notice it consciously; without it the group looks like six unrelated boxes.
4. **Asymmetric in/out timing everywhere.** Ring in 450 ms / out 120 ms. Card open 260 ms
   easeOut / close 150 ms easeIn. Tilt track 110 ms / settle 420 ms. Entrances get time,
   dismissals get out of the way.
5. **Blur as an entrance channel.** `filter: blur(9px) → 0` on headline words, 4–6 px on blocks.
   Fade + translate alone reads as "web page"; adding blur reads as "camera".
6. **Motion blur on the fast thing.** The intro reels run a parallel `blur(0 → 2.5px → 0)` track
   for the duration of the spin. The reels stop **left to right** because each column's duration
   is `650 + 130×index` — mechanically correct, not decorative.
7. **Character-level stagger at 14 ms.** Fast enough to read as a single ripple, not as
   individual letters animating.
8. **Cleaning up `will-change`.** Applied only for the duration of the animation and *removed*
   on finish, with the original `transition` restored a frame later. Most implementations leave
   `will-change: transform` on hundreds of nodes forever.
9. **Every ambient loop is gated.** `document.hidden` pauses feature-card animations;
   `IntersectionObserver` gates the carousel; the pointer tracker is `rAF`-coalesced and listens
   `{passive: true}`; the reveal engine hard-finishes on `visibilitychange`.
10. **Layered shadows over single shadows.** The hover-card uses a six-stop ramp
    (1 → 2 → 6 → 16 → 36 → 72 px) at decreasing alpha; the CTA uses a three-stop white glow.
    A single `box-shadow` cannot fake the falloff.
11. **Texture on the hero button.** A repeating grain PNG on `::after`, inset −2 px so it covers
    the border too, plus `backdrop-filter: blur(25px)`. Static, but it is why the button reads as
    a material rather than a rectangle.
12. **The demo never fights the user.** It auto-types two characters, then hands over — and only
    focuses the field if ≥60 % of it is on screen.

---

## 8. `prefers-reduced-motion: reduce`

Reloaded with Playwright `reducedMotion: 'reduce'` and re-measured everything.

**Removed entirely:**

| Thing | Mechanism |
|---|---|
| The whole intro / preloader | JS branch: `if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setState('gone'); markIntroDone() }` `[src]` |
| The scroll reveal | JS branch: all `[data-rv]` elements are immediately finished, inline `opacity/transform/filter/will-change` stripped, `data-rv-done="1"` set. Measured: 8/8 sampled elements at `opacity: 1, transform: none, filter: none` `[computed]` |
| The WebGL hero field animation | early `return` before the rAF loop starts `[src]`. The canvas still renders a static frame; its fade-in is clamped to `transition-duration: 1e-05s` `[css]` `[computed]` `[frame]` `reducedmotion-01-hero.png` |
| `.xp-spot-ring` (cursor glow on buttons/cards) | `display: none` `[computed]` |
| `.xp-otp-spot .xp-slot::after` (cursor glow on slots) | `display: none` `[computed]` |
| The pointer tracker itself | early `return` `[src]` |
| `.xp-kbd-pulse` (key-press halo) | `display: none`; `.xp-kbd { transition: none }` `[css]` |
| `xp-win-letter`, `xp-usedby-tear`, `xp-cta-line` sweep | `animation: none` `[css]` |
| `.xp-fb-character--bad` (the rejected-character demo) | `display: none` `[css]` |
| The sponsor marquee | `.xp-sp-track { width: 100%; will-change: auto }`, belt reflows to a static wrapped row, mask removed, items 4+ hidden `[css]` |

**Clamped to ~0:** `.xp-fb *, ::before, ::after { animation-duration: .01ms !important;
animation-iteration-count: 1 !important; transition-duration: .01ms !important }`; plus
`.xp-hero-field`, `.xp-cta-field`, `.xp-sponsor-cta-*` at `0.01ms`; `.xp-usedby-shot-card` at `1ms`.
CDP confirmed 40+ feature-card animations starting with `dur: 0.01` `[CDP]`.

**Explicitly kept at full speed** — the OTP's own feedback is *not* reduced `[CDP]`:

- `xp-char-in` **140 ms** per character
- ring `transform` **130 ms**, slot `border-color` **150 ms**
- `xp-blink` caret **1000 ms**
- `xp-fade-text` **500 ms**
- `xp-otp-bounce` **650 ms** on success
- `.xp-btn` hover **200 ms** (`transition-duration: 0.2s`, identical colours and shadow)
  `[computed]` `[frame]` `reducedmotion-02-btn-hover.png`

**Read this as a position, not an oversight**: ambient/decorative motion is removed; the motion
that *communicates state* (which slot is active, that a character landed, that the code is right)
is preserved. It is a defensible reading of the media query, but note that a 650 ms bounce
survives it. `[inferred]` that this is intentional — the file has 21 separate
`prefers-reduced-motion` blocks, so the author clearly went through component by component and
chose what to keep.

**One honest caveat**: CDP recorded `xp-reel` (650–1040 ms), `xp-lever-pull` (800 ms) and
`xp-pre-fade` (650 ms) *starting* under reduced motion. The reduced-motion branch runs in a
`useEffect`, so the preloader markup exists for one commit before React removes it. I could not
determine whether this is visible to the eye; the settled screenshot shows no preloader.

---

## 9. Detail craft

| Aspect | Finding | Source |
|---|---|---|
| **Focus rings** | Three tiers, all `:focus-visible`: `outline: 2px solid rgba(250,250,250,0.72)` with `outline-offset` **6 px** (logo row, odometer button), **3 px** (chips, sponsor cards), **4 px** (`rgba(244,244,245,0.9)` on carousel steps and verdict rows). Some links (Clerk CTA, tweet cards, bio links) fall back to the **UA default** `outline: auto 1px` | `[computed]` |
| **Focus ring on the CTA** | **Broken** — the intended `0 0 0 4px rgba(255,255,255,.3)` is lost to a higher-specificity `box-shadow`. See §2.1 | `[computed]` |
| **Focus rings are never animated** | no `transition` on `outline` anywhere | `[css]` |
| **Cursors** | `.xp-otp-container` and `.xp-slot` → `text` (the slots are decoration over a real input, and the cursor says so); `.xp-btn`, `.xp-copy-btn`, nav, logo items → `pointer`; `body` → `auto`. The OTP container starts as `cursor: default; pointer-events: none` during the scripted auto-type and flips to `cursor: text; pointer-events: all` at the handover | `[computed]` |
| **Selection colour** | No global `::selection` override. The *only* selection rule is `[data-input-otp]::selection { background: transparent !important; color: transparent !important }` — hiding the real input's selection so the fake slot UI can render its own | `[css]` |
| **Scrollbar** | A full custom scrollbar exists (`scrollbar-width: thin`, `scrollbar-color: rgba(250,250,250,.22) transparent`, 14 px webkit track, 4 px transparent border + `background-clip: padding-box` for an inset pill thumb, hover `.38`, active `.50`, buttons and corner `display: none`) — but it is gated behind `html[data-scrollbars="classic"]`, and **that attribute was not present** on the homepage (`<html lang="en" class="dark … xp-intro-seen" style="color-scheme: dark">`). So on the marketing page you get the native overlay scrollbar | `[css]` `[computed]` |
| **Text rendering** | `-webkit-font-smoothing: antialiased`, `text-rendering: optimizeLegibility` on `.xp-body`. Inter (self-hosted, `next/font`) for UI, JetBrains Mono for anything code-flavoured. Headline `letter-spacing: -0.03em`, `text-wrap: balance`; lede `text-wrap: pretty` | `[computed]` `[css]` |
| **Colour scheme** | `color-scheme: dark` set on `<html>` inline — native form controls and scrollbars come up dark from the first paint | `[computed]` |
| **Sound / haptics** | **None.** No `Audio`, no `navigator.vibrate` anywhere in the bundle | `[src]` |
| **Motion on coarse pointers** | The whole proximity-glow system is disabled via `matchMedia('(pointer: coarse)')`; the tutorial copy also swaps to touch phrasing ("double-tap the code and tap Select All") | `[src]` |
| **Platform awareness** | `/Mac/i.test(navigator.platform)` picks `⌘` vs `Ctrl` in the tutorial chips | `[src]` |

---

## 10. Comparison points

Measured the same way on the same day.

**Linear (`linear.app`)** `[computed]` `[css]`
- One curve does almost everything: **`cubic-bezier(0.25, 0.46, 0.45, 0.94)`** (easeOutQuad).
- Computed transition buckets: `0.1s ease` ×43, `0.16s cubic-bezier(.25,.46,.45,.94)` ×72,
  `0.4s ease-out` ×25, `0.1s cubic-bezier(...)` ×9.
- Primary nav CTA hover: `transition: color, background 0.1s cubic-bezier(0.25,0.46,0.45,0.94)`;
  `background: transparent → rgba(255,255,255,0.08)`, `color: #8a8f98 → #f7f8f8`.
  **No transform, no shadow.**
- 82 `@keyframes`, but 25 of them are `grid-dot-N-M-upDown` — a generated ambient grid.
- No `linear()` springs found.
- **Takeaway: extreme consistency and extreme brevity.** 100–160 ms is the entire interaction
  vocabulary.

**Vercel (`vercel.com`)** `[computed]` `[css]`
- **43 distinct cubic-béziers** and 36 distinct declared durations — no unified system; it reads
  as many teams' code in one stylesheet.
- Two curves carry the load in practice: `0.1s cubic-bezier(0.4,0,0.2,1)` ×79 and
  `0.15s cubic-bezier(0.4,0,0.2,1)` ×55.
- Uses **real `linear()` springs** — e.g. a 95-stop `linear(0 0%, … 1.01269 53% … )` that overshoots
  to 1.0127 and settles. This is the one thing on this list that input-otp does not do.
- Several overshoot béziers with `y > 1` (`cubic-bezier(.1,0,.1,1.1)`, `(.5,0,.1,1.2)`,
  `(.175,.885,.32,1.1)`) and one with `y < 0` (`(0.2,-0.5,0,1.5)`).
- `Log In` hover: `background: #0a0a0a → #1f1f1f` over `0.15s cubic-bezier(0.4,0,0.2,1)`,
  `transition-property: all`. No transform.
- **Takeaway: technically further ahead (springs), systemically further behind (43 curves).**

Where input-otp sits: **Linear's discipline with Vercel's ambition.** Nine curves, but each one
has a job, and the two everything-curves (`0.22,1,0.36,1` for anything the page shows you,
`0.4,0,0.2,1` for anything you touch) cover ~80 % of the site.

---

## 11. Portable rules

Twelve things to steal, in the order I would apply them.

1. **Two curves, two durations, by default.** `cubic-bezier(0.4,0,0.2,1)` @ **200 ms** for
   *anything the user touches* (hover, focus, toggle). `cubic-bezier(0.22,1,0.36,1)` @ **520 ms**
   for *anything the page shows you* (entrance, state announcement). Add a third curve only when
   you can name the job.
2. **Make in ≠ out.** Entrance ~2–4× the exit. Ring: 450 in / 120 out. Card: 260 in / 150 out.
   Use an ease-*out* curve for in and an ease-*in* curve for out.
3. **One shared indicator, not N states.** For tabs, segmented controls, OTP slots, nav
   underlines: move one element with `transform` over **~130 ms `ease-in-out`**.
   **Do not animate the position when it first appears** — snap it and fade in over ~450 ms.
   This kills the "it flew in from the corner" bug permanently.
4. **Swap duration by state, not by property.** While the user is driving (drag, tilt, scrub) use
   **~110 ms**; on release use **~420 ms**. Same curve, same property, one attribute.
5. **Keep hover states in CSS.** You get correct interruption free (reversing at 80 ms of a 200 ms
   transition costs 92 ms, not 200 ms, and starts from the rendered value). Reimplementing hover
   in JS is how you acquire the snap-back artefact.
6. **Add blur to entrances.** `filter: blur(4px) → 0` on blocks, `blur(9px) → 0` on split words,
   alongside `translateY(10–16px)` and `opacity`. It is the cheapest single upgrade from "fade up"
   to "expensive".
7. **Stagger budget: 46 ms per word, 80 ms per sibling, 14 ms per character, capped at 300 ms
   total offset.** Cap the cascade so long content does not turn into slow motion.
8. **Reveal once. Clean up after.** `IntersectionObserver` + `unobserve` + a `played` flag; on
   `finish`, strip inline `opacity/transform/filter/**will-change**` and restore the original
   `transition` next frame. Also hard-finish everything on `visibilitychange`.
9. **Proximity beats hover for ambient effects.** Distance-to-rect, divide by ~560 px, **square
   it**, feed a CSS custom property, transition the opacity ~200 ms `linear`, coalesce into one
   rAF, recompute on `scroll` and `resize`, and disable on `(pointer: coarse)`.
10. **Vary intensity per child.** A fixed gain array (`[1,.6,.34,.34,.6,1]`) turns a row of boxes
    into one object. Costs one CSS variable.
11. **Spend the animation budget on state, not on chrome.** Nav links here get **0 ms**. The OTP
    gets six distinct choreographed states. Decide which 5 % of your UI is the product and starve
    the other 95 %.
12. **Reduced motion is a per-component decision.** 21 separate `prefers-reduced-motion` blocks,
    not one blanket `* { animation: none }`. Kill ambient loops, parallax, proximity glows,
    marquees and preloaders; **keep the 140 ms feedback that tells someone their keystroke
    registered.**

---

## 12. Things I could not verify

Stated explicitly so nobody treats them as measured.

- **No rasterised frame of the OTP error state.** The error lives exactly 450 ms (`setTimeout(…, 450)`
  in the bundle), shorter than my screenshot round-trip on this page. I have DOM evidence
  (`class="… xp-otp-shake"`, `.xp-slot--error`, message `"nope. it starts with 1 2 …"` at
  `rgb(248,113,113)`) and CDP evidence (`xp-otp-shake dur=450`), but no image. `CDP setPlaybackRate`
  did not help because it slows animations, not `setTimeout`.
- **CDP reports `easing: "linear"` for many CSS animations** whose stylesheet rule specifies a
  cubic-bézier (e.g. `xp-otp-bounce`). Where they disagree I have used the **CSS value**, which is
  authoritative. Durations and delays from CDP matched CSS everywhere I cross-checked.
- **Intro frame timestamps are approximate.** `intro-seq-NN.png` were taken on a ~120 ms loop plus
  screenshot latency; treat them as an ordered sequence at roughly 180–250 ms/frame, not as
  calibrated times. The *scripted* offsets in §4.1 come from the source and from a
  MutationObserver installed before first paint, and those are reliable.
- **Mobile / touch was not driven.** All measurements are desktop (1440 × 900, fine pointer).
  I know from source and CSS what changes (`(pointer: coarse)` disables the glow, tutorial copy
  swaps to touch phrasing, slots shrink to 44 × 58 px with `--xp-reach: 130px`, nav links hide
  under 900 px) but I did not verify it on a touch emulation.
- **The custom scrollbar was never observed active** — the `html[data-scrollbars="classic"]` gate
  was not set on the homepage and I did not find the code that sets it. The CSS is quoted as
  written, not as seen.
- **I did not audit `/docs`.** Some rules in the shared stylesheet (`caret-blink` 1.2 s,
  `keycap-drop`, `anatomy-ants`, `anatomy-press`, `otp-shake`) belong to pages I did not drive.
- **The "How I built it" section (5886 px, one `position: sticky` scene) was not analysed in
  depth** — I confirmed it is not driven by CSS scroll timelines, but did not reverse its
  scroll-listener choreography.
- **Reduced-motion preloader flash**: CDP records the intro reel animations *starting* under
  reduced motion (one React commit before removal). Whether that is perceptible is untested.

---

## 13. Frame index — `refs/motion-frames/`

| Files | Shows |
|---|---|
| `intro-seq-00…25.png` | First-visit slot-machine intro, ordered (approximate cadence) |
| `btn-01-rest` / `btn-02-hover-settled` / `btn-03-hover-midflight-70ms` / `btn-04-pressed` / `btn-05-hover-detail` | CTA rest → hover, and the **identical** pressed state |
| `btn-06-focus-visible` | Keyboard focus on the CTA — note the missing ring |
| `nav-01-rest` / `nav-02-hover` | Nav links: the 0 ms opacity dip |
| `chip-01-rest` / `chip-02-hover` / `chip-03-copybtn-hover` / `chip-04-copied-t{60,150,300,700,1500,2500}ms` | Copy chip, including the 1500 ms green-check window |
| `otp-01-empty-focused` … `otp-08-after-backspace` | Empty → keystroke → blur → refocus → backspace, with the moving ring |
| `otp-07-caret-a` / `otp-07-caret-b` | Caret on / off (`step-end`) |
| `otp-09-paste-60ms` … `otp-11-paste-660ms` | Paste, and the demo's own auto-type resuming |
| `otp-12-paste-settled-demo-reset` / `otp-13-after-demo-reset` | Demo re-typing `"12"` — **not** a paste result |
| `otp-17-paste-invalid-chars` | Invalid paste silently rejected |
| `otp-success-t0060ms-green` | **Success**: six green slots, green ring, `✓ 123456 …` |
| `otp-success-t0150…t2600ms` / `otp-after-success-tutorial` | Success settling into tutorial mode |
| `scroll-01-features-before` / `scroll-02-features-reveal-t{40,120,260,460,800,1400}ms` | Scroll reveal — t40 shows headline+lede in, cards not yet |
| `scroll-03-features-scrollback-no-replay` | Scrolled away and back: no replay |
| `usedby-hovercard-120ms` / `usedby-hovercard-settled` | Screenshot card growing from the cursor; siblings at 0.26 |
| `sponsor-tilt-hover` | Sponsor card mid-tilt |
| `reducedmotion-01-hero` / `-02-btn-hover` / `-03-otp-complete` | `prefers-reduced-motion: reduce` |
