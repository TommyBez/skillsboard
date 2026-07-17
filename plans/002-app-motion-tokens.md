# 002 — Add shared app motion tokens

- **Status**: DONE
- **Commit**: 1a59c7e
- **Severity**: LOW
- **Category**: Cohesion & tokens
- **Estimated scope**: 1 file (`app/globals.css`), ~15 lines

## Problem

App microinteractions currently mix Tailwind’s default `ease-out` with ad-hoc durations. The landing page already defines the preferred strong curves, but they are scoped to the landing CSS module and cannot be reused by Library / Discover / settings:

```css
/* components/landing/landing-motion.module.css:1-4 — current (landing-only) */
.root {
  --landing-ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --landing-ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
}
```

```css
/* app/globals.css:50-87 — :root has no motion tokens */
:root {
  color-scheme: light;
  --background: oklch(0.965 0.011 103);
  /* …color tokens… */
  --shadow-color: 151 28% 18%;
}
```

Plans 003–006 depend on a single shared vocabulary so executors do not invent parallel curves.

## Target

Add these exact tokens on `:root` in `app/globals.css` (and mirror on `.dark` only if other custom properties are duplicated there — colors are; motion tokens do not need to differ by theme, so `:root` alone is enough):

```css
:root {
  /* existing tokens unchanged… */
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
  --duration-press: 150ms;
  --duration-popover: 180ms;
  --duration-reveal: 200ms;
}
```

Do **not** refactor the landing module in this plan. Landing may keep `--landing-ease-out`; optional aliasing is out of scope.

Also extend the existing reduced-motion block so future utility classes can opt in cleanly — do not strip all motion globally:

```css
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .lift-on-hover { transition: none; }
  .lift-on-hover:hover { transform: none; }
}
```

Leave that block as-is in this plan; later plans add their own reduced-motion rules next to their utilities.

## Repo conventions to follow

- Global design tokens live in `app/globals.css` under `:root` (see `--shadow-color`, `--radius`).
- Hover-gated motion already uses `@media (hover: hover) and (pointer: fine)` for `.lift-on-hover` (`app/globals.css:223-232`) — imitate that pattern when later plans add hover motion.
- Exemplar curve values match `components/landing/landing-motion.module.css:2-3` and the improve-animations AUDIT.md easing table.

## Steps

1. Open `app/globals.css`. In the `:root` block, after `--shadow-color: 151 28% 18%;`, append the six custom properties listed in Target with those exact values.
2. Do not change `.lift-on-hover`, landing CSS, or any component files.
3. Stop. Downstream plans consume `var(--ease-out)` and the duration tokens.

## Boundaries

- Do NOT edit `components/landing/**`.
- Do NOT change Tailwind theme mapping unless required for `var(--ease-out)` to resolve (plain CSS variables on `:root` are enough).
- Do NOT add a motion library.
- Do NOT implement the microinteractions themselves — that is plans 003–006.
- If `:root` no longer contains `--shadow-color` (drift), insert the new tokens at the end of `:root` and report the drift.

## Verification

- **Mechanical**: `npx tsc --noEmit` (expect clean). Grep confirms tokens exist: `rg --ease-out app/globals.css`.
- **Feel check**: none (tokens only). Spot-check in DevTools that `getComputedStyle(document.documentElement).getPropertyValue('--ease-out')` returns `cubic-bezier(0.23, 1, 0.32, 1)`.
- **Done when**: all six tokens exist on `:root` with the exact values above, and no other files changed.
