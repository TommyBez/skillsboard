# 005 — Near-imperceptible copy success feedback

- **Status**: DONE
- **Commit**: 1a59c7e
- **Severity**: LOW
- **Category**: Missed opportunities, Purpose & frequency, Accessibility
- **Estimated scope**: 2 files (`components/copy-button.tsx`, `app/globals.css`), ~25 lines
- **Depends on**: [002-app-motion-tokens.md](002-app-motion-tokens.md)

## Problem

`CopyButton` swaps Copy → Check and label text instantly. The control already inherits Button press scale (`active:scale-[0.98]`), but the success state itself has no feedback beyond the label change. Copy is a tens/day action on skill cards and MCP snippets — motion must stay near-imperceptible. No bounce. No >160ms scale.

```tsx
/* components/copy-button.tsx:49 — current */
return <Button aria-label={currentAriaLabel} variant="outline" size="sm" className={compact ? "h-7 border-transparent bg-card px-2" : undefined} onClick={copy}>{hasCopied ? <CheckIcon data-icon="inline-start" /> : <CopyIcon data-icon="inline-start" />}{hasCopied ? "Copied" : hasFailed ? "Copy failed" : label}</Button>
```

## Target

When `status === "copied"`, the Check icon enters with:

- `transform: scale(0.92)` → `scale(1)`
- Duration: `140ms` (inside press/feedback budget 100–160ms)
- Easing: `var(--ease-out)` → `cubic-bezier(0.23, 1, 0.32, 1)`
- Optional: icon opacity `0` → `1` over `120ms` with the same ease
- Properties: `transform` and `opacity` only

Implementation approach (pick one; do not do both):

**A (preferred):** CSS utility + remount key

```css
/* app/globals.css */
.copy-success-icon {
  transition:
    opacity 120ms var(--ease-out),
    transform 140ms var(--ease-out);
}

@starting-style {
  .copy-success-icon {
    opacity: 0;
    transform: scale(0.92);
  }
}

@media (prefers-reduced-motion: reduce) {
  .copy-success-icon {
    transition: none;
    opacity: 1;
    transform: none;
  }
}
```

```tsx
{hasCopied ? (
  <CheckIcon key="copied" data-icon="inline-start" className="copy-success-icon" />
) : (
  <CopyIcon key="idle" data-icon="inline-start" />
)}
```

**B:** `data-status="copied"` on a wrapper with the same transition values (no keyframes).

Failed state: no extra motion (label change is enough). Idle restore after 1600ms: no exit animation required.

## Repo conventions to follow

- Button press already handles click feedback — do not add a second press animation on CopyButton.
- Tokens from plan 002: `--ease-out`.
- Keep the public props API of `CopyButton` unchanged (`value`, `label`, `compact`, `ariaLabel`, `copiedAriaLabel`).

## Steps

1. Confirm plan 002 tokens exist. If missing, STOP.
2. Add `.copy-success-icon` (+ `@starting-style` + reduced-motion) to `app/globals.css` as in Target A.
3. Update `components/copy-button.tsx` so the Check icon uses that class (and a remount `key` if using `@starting-style`). Keep label logic identical.
4. Do not change the 1600ms reset timeout unless required for the animation to be visible (140ms << 1600ms — leave timeout alone).

## Boundaries

- Do NOT add toast-on-copy (Sonner is used elsewhere for save/delete).
- Do NOT bounce, spring, or use `scale(0)`.
- Do NOT animate the whole button width when the label changes to “Copied”.
- Do NOT touch `components/skill-dossier.tsx` or MCP guide beyond consuming CopyButton as-is.

## Verification

- **Mechanical**: `npx tsc --noEmit`.
- **Feel check**:
  - On a library skill card, click Copy command: Check icon pops in subtly (~140ms); feels like confirmation, not celebration.
  - Spam-click: no janky keyframe restart; acceptable to remount Check each success.
  - `prefers-reduced-motion: reduce`: icon/label still switch; no scale.
  - DevTools 10%: scale starts at 0.92, not 0.
- **Done when**: copied state has subtle icon enter; failed/idle paths unchanged; reduced-motion skips transform.
