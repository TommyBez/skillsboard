# 001 — Choreograph the landing page

- **Status**: DONE
- **Commit**: 765b9fa
- **Severity**: MEDIUM
- **Category**: Missed opportunities, cohesion, accessibility, performance
- **Estimated scope**: 3 source files, roughly 250 lines

## Problem

The landing page has a strong editorial hierarchy but almost no motion. The hero,
the central “shared library to different agents” explanation, the pricing promise,
and the closing CTA all appear fully assembled. Runtime inspection confirmed that
only the existing 150ms button and brand transitions are active.

```tsx
// app/page.tsx:102 — current hero
<h1 className="text-balance text-[clamp(2.75rem,7vw,7rem)] font-semibold leading-[0.9] tracking-[-0.065em]">
  <span className="block">One shared library.</span>
  <span className="block text-primary">Different agents.</span>
</h1>
```

```tsx
// app/page.tsx:135 — current explanatory figure
<figure
  className="w-full"
  aria-label="One team library can support different agents"
>
```

```tsx
// app/page.tsx:181 — current pricing section
<section
  id="pricing"
  aria-labelledby="pricing-heading"
  className="border-b border-primary/30 bg-primary text-primary-foreground"
>
```

```tsx
// app/page.tsx:211 — current closing section
<section>
```

The missing motion makes the page feel flatter than its design and misses the
chance to explain the product’s core story without introducing fake UI.

## Target

Implement four one-time narrative sequences and one CTA micro-interaction.

1. **Hero, once on page load**
   - Eyebrow: `opacity: 0` plus `translate3d(0, 10px, 0)` to final,
     `360ms cubic-bezier(0.23, 1, 0.32, 1)`.
   - H1 lines: transform only, from `translate3d(0, 22px, 0)` to final,
     `560ms cubic-bezier(0.23, 1, 0.32, 1)`, delays `70ms` and `140ms`.
     Do not animate H1 opacity, because it is likely the LCP element.
   - Copy: opacity plus `translate3d(0, 14px, 0)`, `440ms`, delay `170ms`.
   - CTA: opacity plus `translate3d(0, 10px, 0)`, `360ms`, delay `230ms`.

2. **Shared-library explanation, once at 25% viewport intersection**
   - Source: opacity plus `translate3d(0, 12px, 0)`, `420ms` ease-out.
   - Arrow after `90ms`: desktop starts at `translate3d(-16px, 0, 0)`;
     mobile starts at `translate3d(0, -12px, 0)`. Duration `420ms` with
     `cubic-bezier(0.77, 0, 0.175, 1)`.
   - Agents after `150ms`: opacity plus `translate3d(0, 10px, 0)`,
     `360ms` ease-out, stagger `45ms`.
   - Caption: opacity plus `translate3d(0, 8px, 0)`, `320ms`, delay `340ms`.

3. **Pricing, once at 25% viewport intersection**
   - `0`: from `opacity: 0.35` and
     `translate3d(-24px, 0, 0) scale(0.96)` on mobile, or
     `translate3d(-6%, 0, 0) scale(0.96)` from `sm` upward; duration `650ms`
     ease-out.
   - Heading and supporting copy: opacity plus `translate3d(0, 18px, 0)`,
     `480ms`, delay `100ms`.
   - “No trial…” note: opacity plus `translate3d(0, 10px, 0)`, `360ms`,
     delay `210ms`.

4. **Closing CTA, once at 25% viewport intersection**
   - H2: opacity plus `translate3d(0, 20px, 0)`, `520ms` ease-out.
   - Paragraph: opacity plus `translate3d(0, 12px, 0)`, `420ms`, delay `80ms`.
   - CTA: opacity plus `translate3d(0, 8px, 0)`, `360ms`, delay `150ms`.

5. **CTA arrows, occasional pointer feedback**
   - On `(hover: hover) and (pointer: fine)`, move the arrow to
     `translate3d(3px, 0, 0)` over `160ms cubic-bezier(0.23, 1, 0.32, 1)`.
   - Preserve the existing local button press feedback.

Animate only `transform` and `opacity`. Viewport sequences run once. With
`prefers-reduced-motion: reduce`, remove all positional and scale movement;
the controller must never leave content hidden. Hover movement must be disabled.

## Repo conventions to follow

- Keep `app/page.tsx` a Server Component. Isolate browser APIs in one small
  `"use client"` leaf under `components/landing/`.
- The existing press feedback in `components/ui/button.tsx:7` is the interaction
  exemplar: short, explicit transform transition and no `transition: all`.
- The existing hover gating in `app/globals.css:223` is the pointer-capability
  exemplar.
- The existing reduced-motion handling in `app/globals.css:234` is the media-query
  placement exemplar.
- Use a colocated CSS module for landing-only motion. Do not add global utilities
  or modify shared UI primitives.

## Steps

1. Add `components/landing/landing-motion-controller.tsx` as a client leaf.
   In one `useEffect`, find the landing root and every `[data-motion-group]`.
   If `IntersectionObserver` is unavailable or reduced motion is requested,
   leave all content in its final visible state. Otherwise mark groups pending,
   enable motion on the root, then observe with `threshold: 0.25` and
   `rootMargin: "0px 0px -8% 0px"`. On first intersection set the group visible
   and unobserve it. Disconnect and remove temporary attributes on cleanup.
   Do not add a scroll listener.
2. Add `components/landing/landing-motion.module.css`. Define local tokens
   `--landing-ease-out: cubic-bezier(0.23, 1, 0.32, 1)` and
   `--landing-ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`. Implement the exact
   hero and viewport keyframes above. Pending groups must be hidden only when
   JavaScript has explicitly enabled motion, so no-JS content remains visible.
3. Update `app/page.tsx` to mount the controller, apply the CSS module root,
   add semantic data attributes/classes for the four sequences, and add the
   CTA/arrow classes. Preserve all copy, links, accessibility labels, session
   Suspense boundaries, responsive layout, and dark-mode colors.
4. Add a reduced-motion branch in the CSS module: no transform/scale animation,
   no stagger delay, no arrow translation. Content must remain immediately
   readable and interactive.

## Boundaries

- Do NOT change copy, visual layout, spacing, typography, colors, or information
  architecture.
- Do NOT modify `components/ui/button.tsx` or any other shared primitive.
- Do NOT add Motion, Framer Motion, GSAP, or any dependency.
- Do NOT create fake product UI, marquees, parallax, magnetic buttons, cursor
  followers, count-up pricing, or perpetual animation.
- Do NOT turn `app/page.tsx` into a Client Component.
- If the cited structure differs from commit `765b9fa`, stop and report instead
  of improvising.

## Verification

- **Mechanical**: run `pnpm lint`, `pnpm build`, `git diff --check`, and
  `npx -y react-doctor@latest --verbose --diff`. All must complete without new
  landing-related errors.
- **Feel check**: run the app and inspect at `1440x1000` and `390x844`.
  Confirm the hero reads immediately, the central sequence clearly travels from
  library to agents in the correct responsive direction, the pricing `0` is the
  single expressive beat, and the closing section feels like one grouped climax.
- Inspect the CTA on a fine pointer: only the arrow moves 3px; the button keeps
  its existing press feedback. Confirm no hover motion is required on touch.
- Emulate `prefers-reduced-motion: reduce` and confirm every section is visible,
  no element translates/scales, and navigation remains usable.
- In DevTools Animations, slow playback to 10% and confirm staggers follow the
  specified order without overlapping text or snapping at the end.
- **Done when**: all four narrative moments trigger once, the CTA feedback is
  gated correctly, there is no continuous motion, no new dependency, no layout
  shift, and no content depends on JavaScript to be visible.
