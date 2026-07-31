"use client"

/**
 * ReorderList — "The gap the siblings open is the drop target"
 *
 * Ported from https://www.interior.dev/docs/reorder-list. API as documented:
 * items / getId / getLabel / onReorder / onCommit / children / label.
 *
 * There is no separate drop indicator: the siblings part, and the space they
 * open is where the row will land. Keyboard reordering runs through the same
 * path, because drag alone is not an accessible way to reorder anything.
 */

import { useCallback, useState } from "react"
import { Reorder, useDragControls, useReducedMotion } from "motion/react"
import { GripVerticalIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ReorderListProps<T> {
  items: readonly T[]
  getId: (item: T) => string
  getLabel: (item: T) => string
  /** Fires continuously while the order changes — optimistic state. */
  onReorder: (items: T[]) => void
  /** Fires once the interaction settles — the persistence hook. */
  onCommit?: (items: T[]) => void
  children: (item: T, index: number) => React.ReactNode
  label: string
  className?: string
}

export function ReorderList<T>({
  items,
  getId,
  getLabel,
  onReorder,
  onCommit,
  children,
  label,
  className,
}: ReorderListProps<T>) {
  const reduced = useReducedMotion()
  const list = [...items]

  const move = useCallback(
    (from: number, to: number) => {
      if (to < 0 || to >= list.length) return
      const next = [...list]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      onReorder(next)
      onCommit?.(next)
    },
    [list, onReorder, onCommit]
  )

  return (
    <Reorder.Group
      as="ul"
      axis="y"
      values={list}
      onReorder={onReorder}
      aria-label={label}
      className={cn("flex flex-col gap-1.5", className)}
    >
      {list.map((item, index) => (
        <ReorderRow
          key={getId(item)}
          item={item}
          index={index}
          total={list.length}
          getLabel={getLabel}
          reduced={Boolean(reduced)}
          onSettle={() => onCommit?.(list)}
          onMove={move}
        >
          {children(item, index)}
        </ReorderRow>
      ))}
    </Reorder.Group>
  )
}

function ReorderRow<T>({
  item,
  index,
  total,
  getLabel,
  reduced,
  onSettle,
  onMove,
  children,
}: {
  item: T
  index: number
  total: number
  getLabel: (item: T) => string
  reduced: boolean
  onSettle: () => void
  onMove: (from: number, to: number) => void
  children: React.ReactNode
}) {
  const controls = useDragControls()
  const [dragging, setDragging] = useState(false)

  return (
    <Reorder.Item
      as="li"
      value={item}
      dragListener={false}
      dragControls={controls}
      onDragStart={() => setDragging(true)}
      onDragEnd={() => {
        setDragging(false)
        onSettle()
      }}
      transition={
        reduced
          ? { duration: 0 }
          : { type: "spring", stiffness: 520, damping: 42 }
      }
      className={cn(
        "flex items-center gap-2 rounded-md border bg-card px-2 py-1.5",
        dragging ? "border-primary/50 shadow-lg" : "border-border"
      )}
    >
      <button
        type="button"
        aria-label={`Reorder ${getLabel(item)}. Position ${index + 1} of ${total}. Use arrow keys to move.`}
        onPointerDown={(event) => controls.start(event)}
        onKeyDown={(event) => {
          if (event.key === "ArrowUp") {
            event.preventDefault()
            onMove(index, index - 1)
          }
          if (event.key === "ArrowDown") {
            event.preventDefault()
            onMove(index, index + 1)
          }
        }}
        className="shrink-0 cursor-grab touch-none rounded-sm p-1 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
      >
        <GripVerticalIcon className="size-3.5" />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </Reorder.Item>
  )
}
