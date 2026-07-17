# 004 — Reveal add-skill discovery fields without a jump

- **Status**: DONE
- **Commit**: 1a59c7e
- **Severity**: MEDIUM
- **Category**: Missed opportunities, Interruptibility, Accessibility
- **Estimated scope**: 2 files (`app/globals.css`, `components/add-skill-dialog.tsx`), ~30 lines
- **Depends on**: [002-app-motion-tokens.md](002-app-motion-tokens.md)

## Problem

After repository inspection succeeds, skill selection / “Skill found” / note / tags fields mount with a hard layout jump. The dialog chrome already animates; the in-dialog state change does not.

```tsx
/* components/add-skill-dialog.tsx:192-237 — current conditional mounts */
{skills.length > 1 ? (
  <Field>
    <FieldLabel htmlFor="skillPath">Skill</FieldLabel>
    {/* Select… */}
  </Field>
) : selectedSkill ? (
  <Field>
    <FieldLabel>Skill found</FieldLabel>
    <div className="rounded-xl border border-border bg-muted/35 p-4">
      {/* … */}
    </div>
  </Field>
) : null}

{selectedSkill ? (
  <>
    <Field>{/* note */}</Field>
    <Field>{/* tags */}</Field>
  </>
) : null}
```

Frequency: occasional (inside a modal flow). Purpose: preventing a jarring change + state indication. Budget: ≤200ms, ease-out, transform + opacity only. No stagger (must stay under 300ms total).

## Target

1. Add a reusable utility in `app/globals.css`:

```css
.reveal-enter {
  transition:
    opacity var(--duration-reveal) var(--ease-out),
    transform var(--duration-reveal) var(--ease-out);
}

@starting-style {
  .reveal-enter {
    opacity: 0;
    transform: scale(0.97);
  }
}

@media (prefers-reduced-motion: reduce) {
  .reveal-enter {
    transition: opacity 120ms var(--ease-out);
    transform: none;
  }

  @starting-style {
    .reveal-enter {
      opacity: 0;
      transform: none;
    }
  }
}
```

2. Wrap each newly revealed block in add-skill dialog with `className="reveal-enter"` on a single wrapper element (do not animate layout properties like height/margin):
   - The multi-skill `<Field>` branch (`skills.length > 1`)
   - The single-skill “Skill found” `<Field>` branch
   - The fragment containing note + tags (one wrapper around both fields is enough)

3. Do not animate the URL field or the footer submit button. Do not stagger children.

## Repo conventions to follow

- Global utilities live beside `.lift-on-hover` in `app/globals.css` (`app/globals.css:223+`).
- Dialog shell motion exemplar: `components/ui/dialog.tsx:56` (`data-open:animate-in`, `zoom-in-95`, `duration-100`) — in-dialog reveals should feel slightly slower/softer than the shell (200ms) but use the same ease-out personality via `var(--ease-out)`.
- Tokens from plan 002: `--duration-reveal`, `--ease-out`.

## Steps

1. Confirm plan 002 tokens exist. If missing, STOP.
2. Append `.reveal-enter` (+ `@starting-style` + reduced-motion) to `app/globals.css` exactly as in Target.
3. In `components/add-skill-dialog.tsx`, wrap the three reveal surfaces with an element that includes `reveal-enter` (prefer wrapping the existing `<Field>` / fragment without changing form field `name`s or validation).
4. Leave discovery/save pending label logic untouched.

## Boundaries

- Do NOT animate catalog grids, library lists, or empty states.
- Do NOT add Framer Motion / `useSpring`.
- Do NOT use `scale(0)`.
- Do NOT animate `height` / `grid-template-rows` for this reveal.
- If `@starting-style` is unsupported in a required browser target and fields appear with permanent `opacity: 0`, STOP and report — do not ship broken UI; fall back to no enter animation rather than leaving content invisible.

## Verification

- **Mechanical**: `npx tsc --noEmit`.
- **Feel check**:
  - Open “Save a skill”, paste a multi-skill repo URL, run inspect: Select field fades/scales from ~0.97 → 1 in ~200ms; no bounce.
  - Single-skill repo: “Skill found” + note/tags reveal the same way.
  - Rapidly change the URL (reset discovery) then re-inspect: transition retargets cleanly (CSS transition / `@starting-style`, not a keyframe that restarts awkwardly).
  - DevTools 10% playback: confirm scale never goes to 0.
  - `prefers-reduced-motion: reduce`: opacity-only ~120ms; no scale.
- **Done when**: discovery success no longer hard-cuts; reduced-motion softens transform; save flow still works end-to-end.
