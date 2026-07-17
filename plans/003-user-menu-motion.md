# 003 — Animate the account menu from its trigger

- **Status**: DONE
- **Commit**: 1a59c7e
- **Severity**: MEDIUM
- **Category**: Missed opportunities, Physicality & origin, Accessibility
- **Estimated scope**: 2 files (`components/app-header.tsx`, possibly a tiny client wrapper), ~40–80 lines
- **Depends on**: [002-app-motion-tokens.md](002-app-motion-tokens.md)

## Problem

The account menu is a native `<details>` panel that teleports open and closed. Dialogs, selects, and dropdowns in this app already animate; this control does not, so it feels disconnected from the rest of the chrome.

```tsx
/* components/app-header.tsx:35-44 — current */
<details className="group relative">
  <summary
    aria-label="User menu"
    className="flex size-10 cursor-pointer list-none items-center justify-center rounded-xl border border-border bg-card/65 transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring group-open:bg-muted [&::-webkit-details-marker]:hidden"
  >
    <span className="flex size-8 items-center justify-center rounded-lg bg-foreground font-mono text-[0.7rem] text-background">
      {initials}
    </span>
  </summary>
  <div className="absolute right-0 top-12 z-40 min-w-64 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-[0_18px_48px_hsl(var(--shadow-color)/0.18)]">
```

Native `<details>` uses `display: none` when closed, so CSS transitions cannot play a reliable exit. Do not try to “CSS-only” the exit on `<details>`.

The trigger also has no press scale (it is not a `Button`). Frequency is tens/day — press feedback must stay near-imperceptible (0.97, ≤160ms).

## Target

1. Replace the `<details>` account menu with the existing Base UI menu wrapper in `components/ui/dropdown-menu.tsx`, which already scales from the trigger via `origin-(--transform-origin)` and has open/close animate classes.
2. Tune **this menu instance** (via `className` on `DropdownMenuContent`, not a global default change) to popover budget:
   - Duration: `180ms` → use `duration-[180ms]` or `style` / class that resolves to `var(--duration-popover)` if Tailwind arbitrary values are used: `duration-[var(--duration-popover)]`.
   - Easing: prefer the shared token. If Tailwind’s `animate-in` utilities ignore custom easing, add a local class on the popup:

```css
/* add to app/globals.css next to other utilities — only if animate-in cannot take the token */
.account-menu-content {
  transition-timing-function: var(--ease-out);
}
```

   Exact visual target: enter `opacity: 0` + `scale(0.96)` (equivalent to zoom-in-95 is acceptable if already provided by `data-open:zoom-in-95`) from **top-right / trigger origin**; exit the reverse on the same edge. Never `scale(0)`.
3. Trigger press feedback: `active:scale-[0.97]` with `transition-transform duration-[var(--duration-press)]` using `var(--ease-out)` (or `ease-out` if the token cannot be referenced in the utility). Override Button’s `active:not-aria-[haspopup]:scale-[0.98]` exclusion for this trigger only, e.g. `active:scale-[0.97]!` / `active:scale-[0.97]` with sufficient specificity.
4. Reduced motion: keep opacity fade; drop or neutralize scale/translate. If relying on `animate-in` / `animate-out`, add:

```css
@media (prefers-reduced-motion: reduce) {
  .account-menu-content {
    animation-duration: 120ms !important;
    /* keep fade; avoid large movement — if the utility only zooms, prefer fade-only classes under this query */
  }
}
```

Preserve all existing links (Team access, MCP setup), user name/email block, and Sign out form behavior and copy.

## Repo conventions to follow

- Dropdown enter/exit exemplar: `components/ui/dropdown-menu.tsx:42-44` (`origin-(--transform-origin)`, `data-open:animate-in`, `data-open:fade-in-0`, `data-open:zoom-in-95`, matching closed counterparts).
- Press feedback exemplar: `components/brand.tsx:12` (`transition-transform duration-150 ease-out group-active:scale-[0.94]`) and `components/ui/button.tsx:7` (`active:…scale-[0.98]`, `duration-150 ease-out`).
- App shell stays a Server Component if possible: extract a small `"use client"` child (e.g. `components/account-menu.tsx`) that receives `user` props, rather than marking all of `app-header.tsx` as client.
- Motion tokens from plan 002: `var(--ease-out)`, `var(--duration-popover)`, `var(--duration-press)`.

## Steps

1. Confirm plan 002 tokens exist in `app/globals.css`. If missing, STOP and run 002 first.
2. Create `components/account-menu.tsx` as a client component that renders:
   - `DropdownMenu` → `DropdownMenuTrigger` (avatar button matching current summary styles) → `DropdownMenuContent` (`align="end"`, `side="bottom"`, `sideOffset` ~8 to approximate `top-12`, `className` including `min-w-64`, popover border/shadow matching current panel, `account-menu-content`, duration override).
   - Same inner structure: identity block, nav links, SignOutForm button.
3. Replace the `<details>…</details>` block in `components/app-header.tsx:35-65` with `<AccountMenu user={user} />` (pass `name` / `email` only).
4. On the trigger: add press scale `active:scale-[0.97]` and `transition-[transform,background-color] duration-[var(--duration-press)]` (plus existing hover/focus styles). Ensure `aria-label="User menu"` remains.
5. Add reduced-motion handling for `.account-menu-content` in `app/globals.css` as in Target.
6. Do not change mobile bottom nav or organization switcher.

## Boundaries

- Do NOT restyle Library / Discover nav.
- Do NOT change `components/ui/dropdown-menu.tsx` defaults globally unless a bug blocks per-instance classNames — prefer instance `className`.
- Do NOT add Framer Motion / new dependencies.
- Do NOT animate the mobile bottom nav.
- If DropdownMenu API props differ from this stamp, STOP and report; do not invent a parallel menu system.

## Verification

- **Mechanical**: `npx tsc --noEmit`. App header still renders for a signed-in user.
- **Feel check**:
  - Click the avatar: menu scales from the avatar (top-right origin), not from the viewport center; duration feels ~180ms, responsive (ease-out, not slow start).
  - Close via click-outside / Escape: exit uses the same edge/scale direction (no snap-off).
  - Press and hold the avatar: scale settles near 0.97; release restores — no bounce.
  - DevTools → Animations → 10% playback: confirm transform-origin is near the trigger.
  - Rendering → `prefers-reduced-motion: reduce`: movement minimized; menu still appears (opacity OK).
- **Done when**: `<details>` account menu is gone; menu open/close is animated from the trigger; press feedback exists; reduced-motion softens transform; sign-out and settings links still work.
