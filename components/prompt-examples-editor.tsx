"use client"

import { Suspense, lazy, useEffect, useRef, useState } from "react"
import { PlusIcon, Trash2Icon } from "lucide-react"

// ReorderList's drag interactions pull in the full motion runtime, so it
// stays out of the route bundle and only loads once the editor is on screen.
const loadReorderList = () => import("@/components/interior/reorder-list")
const ReorderList = lazy(async () => ({
  default: (await loadReorderList()).ReorderList,
})) as unknown as (typeof import("@/components/interior/reorder-list"))["ReorderList"]
import { Button } from "@/components/ui/button"
import {
  FieldDescription,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"

const MAX_PROMPTS = 8
const MAX_PROMPT_LENGTH = 800

interface PromptDraft {
  id: number
  value: string
}

interface PromptExamplesEditorProps {
  defaultValue?: string[]
  disabled?: boolean
}

export function PromptExamplesEditor({
  defaultValue = [],
  disabled = false,
}: PromptExamplesEditorProps) {
  const nextId = useRef(Math.max(defaultValue.length, 1))
  const textareas = useRef(new Map<number, HTMLTextAreaElement>())
  // Which prompt's textarea currently holds focus. Removing a focused node
  // (as happens when the lazy ReorderList replaces the Suspense fallback)
  // fires no blur event, so this survives the swap and lets the replacement
  // node reclaim focus in its ref callback.
  const focusedPromptId = useRef<number | null>(null)
  const [focusId, setFocusId] = useState<number | null>(null)
  const [prompts, setPrompts] = useState<PromptDraft[]>(() => (
    defaultValue.length
      ? defaultValue.map((value, id) => ({ id, value }))
      : [{ id: 0, value: "" }]
  ))
  const completedCount = prompts.filter((prompt) => prompt.value.trim()).length
  const canAddPrompt = prompts.length < MAX_PROMPTS && Boolean(prompts.at(-1)?.value.trim())

  useEffect(() => {
    if (focusId === null) return
    textareas.current.get(focusId)?.focus()
    setFocusId(null)
  }, [focusId, prompts])

  // Warm the reorder chunk as soon as the editor mounts (dialog open), so by
  // the time a second prompt exists the lazy component resolves synchronously
  // instead of committing an interactive fallback and swapping it later.
  useEffect(() => {
    void loadReorderList()
  }, [])

  function addPrompt() {
    if (prompts.length >= MAX_PROMPTS) return
    const id = nextId.current
    nextId.current += 1
    setPrompts((current) => [...current, { id, value: "" }])
    setFocusId(id)
  }

  function removePrompt(id: number) {
    const fallbackId = nextId.current
    nextId.current += 1
    setPrompts((current) => {
      const next = current.filter((prompt) => prompt.id !== id)
      return next.length ? next : [{ id: fallbackId, value: "" }]
    })
  }

  function renderRow(prompt: PromptDraft, index: number) {
    return (
      <div className="group/prompt grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 rounded-xl border border-border bg-muted/25 p-2 transition-colors focus-within:border-ring focus-within:bg-background">
        <div className="min-w-0">
          <Textarea
            ref={(node) => {
              if (node) {
                textareas.current.set(prompt.id, node)
                if (focusedPromptId.current === prompt.id && document.activeElement !== node) {
                  node.focus()
                  const end = node.value.length
                  node.setSelectionRange(end, end)
                }
              } else {
                textareas.current.delete(prompt.id)
              }
            }}
            onFocus={() => {
              focusedPromptId.current = prompt.id
            }}
            onBlur={() => {
              if (focusedPromptId.current === prompt.id) focusedPromptId.current = null
            }}
            aria-label={`Example prompt ${index + 1}`}
            name="examplePrompts"
            rows={2}
            maxLength={MAX_PROMPT_LENGTH}
            value={prompt.value}
            disabled={disabled}
            onChange={(event) => {
              const value = event.target.value
              setPrompts((current) => current.map((item) => (
                item.id === prompt.id ? { ...item, value } : item
              )))
            }}
            placeholder={index === 0
              ? "Audit this onboarding flow and identify the three highest-impact improvements."
              : "Add another way your team could use this skill."}
            className="min-h-16 resize-y border-0 bg-transparent px-2 py-1.5 shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
          <p className="px-2 pt-1 text-right text-[0.68rem] tabular-nums text-muted-foreground" aria-hidden="true">
            {prompt.value.length} of {MAX_PROMPT_LENGTH} characters
          </p>
        </div>
        {prompts.length > 1 || prompt.value ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={disabled}
            onClick={() => removePrompt(prompt.id)}
            aria-label={`Remove example prompt ${index + 1}`}
            title="Remove prompt"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2Icon />
          </Button>
        ) : <span className="size-7" aria-hidden="true" />}
      </div>
    )
  }

  return (
    <FieldSet className="gap-3">
      <div className="flex items-start justify-between gap-4">
        <div className="grid gap-1">
          <FieldLegend className="mb-0 text-sm">
            Example prompts <span className="font-normal text-muted-foreground">(optional)</span>
          </FieldLegend>
          <FieldDescription>
            Give teammates ready-to-copy starting points for using this skill.
          </FieldDescription>
        </div>
        <span className="shrink-0 rounded-full border border-border bg-muted/45 px-2.5 py-1 text-xs tabular-nums text-muted-foreground">
          {completedCount} of {MAX_PROMPTS}
        </span>
      </div>

      {/* Order is meaningful: skill-prompt-list shows the first prompt inline
          and keeps the rest behind "View all N", so promoting a prompt is a
          real edit. The rows submit through name="examplePrompts", so their
          DOM order is the saved order and reordering needs no extra plumbing.
          A single row gets no handle — there is nothing to reorder. */}
      {prompts.length > 1 ? (
        <Suspense
          fallback={(
            <div className="grid gap-2.5">
              {prompts.map((prompt, index) => (
                <div key={prompt.id}>{renderRow(prompt, index)}</div>
              ))}
            </div>
          )}
        >
        <ReorderList
          items={prompts}
          getId={(prompt) => String(prompt.id)}
          getLabel={(prompt) =>
            prompt.value.trim().slice(0, 40) || "empty prompt"
          }
          onReorder={setPrompts}
          label="Example prompts. Drag the handle or use the arrow keys to reorder."
          className="gap-2.5"
        >
          {renderRow}
        </ReorderList>
        </Suspense>
      ) : (
        <div className="grid gap-2.5">
          {prompts.map((prompt, index) => (
            <div key={prompt.id}>{renderRow(prompt, index)}</div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || !canAddPrompt}
          onClick={addPrompt}
        >
          <PlusIcon data-icon="inline-start" />
          Add another prompt
        </Button>
        <p className="text-xs text-muted-foreground">
          {prompts.length >= MAX_PROMPTS
            ? "Maximum reached"
            : canAddPrompt
              ? "Empty prompts won’t be saved"
              : "Write this prompt before adding another"}
        </p>
      </div>
    </FieldSet>
  )
}
