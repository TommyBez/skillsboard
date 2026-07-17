# 006 — Fade MCP setup tab panel swaps

- **Status**: DONE
- **Commit**: 1a59c7e
- **Severity**: LOW
- **Category**: Missed opportunities, Accessibility
- **Estimated scope**: 1–2 files (`components/ui/tabs.tsx`, optionally `app/globals.css`), ~15 lines
- **Depends on**: [002-app-motion-tokens.md](002-app-motion-tokens.md)

## Problem

MCP setup (`components/mcp-setup-guide.tsx`) switches client guides via shared `Tabs` / `TabsContent`. Panel content hard-cuts with no transition, which is a small jarring change on an occasional settings surface.

```tsx
/* components/ui/tabs.tsx:72-78 — current */
function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  )
}
```

```tsx
/* components/mcp-setup-guide.tsx:210-214 — consumer */
{clients.map((client) => (
  <TabsContent key={client.id} value={client.id} className="pt-5">
    <StepList steps={client.steps} />
  </TabsContent>
))}
```

Frequency: occasional (settings). Purpose: preventing a jarring change. Animate **opacity only** — instructional content must not scale or slide.

## Target

When a tab panel becomes active/visible, fade in:

- `opacity: 0` → `1`
- Duration: `160ms`
- Easing: `var(--ease-out)` → `cubic-bezier(0.23, 1, 0.32, 1)`
- No `transform`, no blur, no stagger of step list items

Preferred implementation — utility on `TabsContent` default classes so MCP (and any future tabs) inherit coherently:

```tsx
className={cn(
  "flex-1 text-sm outline-none tabs-content-enter",
  className,
)}
```

```css
/* app/globals.css */
.tabs-content-enter {
  transition: opacity 160ms var(--ease-out);
}

@starting-style {
  .tabs-content-enter {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tabs-content-enter {
    transition: none;
  }
}
```

If Base UI keeps inactive panels mounted and only toggles `hidden` / `data-hidden`, verify `@starting-style` actually fires on activation. If it does not (panel never “starts”), use the panel’s open/active data attribute from Base UI instead, e.g. transition when leaving the hidden state — inspect the DOM for `data-hidden`, `hidden`, or similar and bind:

```css
.tabs-content-enter[data-hidden],
.tabs-content-enter[hidden] {
  opacity: 0;
}
.tabs-content-enter {
  opacity: 1;
  transition: opacity 160ms var(--ease-out);
}
```

(Adjust attribute to whatever Base UI emits at this commit. If unclear, STOP and report the attribute you observed rather than guessing.)

## Repo conventions to follow

- Tabs live in `components/ui/tabs.tsx`; consumers pass `className` only.
- Tokens from plan 002: `--ease-out`.
- Crisp product personality: opacity-only, ≤160ms, no bounce.

## Steps

1. Confirm plan 002 tokens exist. If missing, STOP.
2. In the running app, open `/settings/mcp`, switch tabs once with DevTools open, and note how inactive `TabsContent` is hidden (attribute / style).
3. Add `.tabs-content-enter` to `app/globals.css` using `@starting-style` **or** the hidden-attribute pattern from Target — whichever matches step 2.
4. Add the class to the default `TabsContent` `className` in `components/ui/tabs.tsx`.
5. Do not edit `mcp-setup-guide.tsx` unless a local override is required (it should not be).

## Boundaries

- Do NOT animate `TabsTrigger` active pill (high-frequency relative to panel content; leave as color/shadow swap).
- Do NOT add scale/translate to tab panels.
- Do NOT introduce a motion library.
- Do NOT change troubleshooting accordion-like sections below the tabs.

## Verification

- **Mechanical**: `npx tsc --noEmit`.
- **Feel check**:
  - `/settings/mcp`: switch Claude Code → Cursor → VS Code — panel text fades ~160ms, readable immediately, no slide/scale.
  - Fast tab spam: opacity transitions retarget; no flash of empty layout longer than the fade.
  - `prefers-reduced-motion: reduce`: instant panel swap (no transition).
- **Done when**: tab panel swaps fade with opacity only; triggers unchanged; reduced-motion disables the fade.
