import { TagInput } from "@/components/interior/tag-input"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface CollectionDetailsFieldsProps {
  idPrefix: string
  defaultTitle?: string
  defaultDescription?: string | null
  defaultTags?: string[]
  disabled?: boolean
}

export function parseCollectionTags(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
}

export function CollectionDetailsFields({
  idPrefix,
  defaultTitle = "",
  defaultDescription = "",
  defaultTags = [],
  disabled = false,
}: CollectionDetailsFieldsProps) {
  return (
    <>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-title`}>Title</FieldLabel>
        <Input
          id={`${idPrefix}-title`}
          name="title"
          maxLength={80}
          defaultValue={defaultTitle}
          placeholder="Research workflows"
          disabled={disabled}
          required
        />
        <FieldDescription>A short name for the use case or project. Up to 80 characters.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-description`}>Description</FieldLabel>
        <Textarea
          id={`${idPrefix}-description`}
          name="description"
          rows={3}
          maxLength={500}
          defaultValue={defaultDescription ?? ""}
          placeholder="What these skills have in common, and when your team should reach for them."
          disabled={disabled}
        />
        <FieldDescription>Shared with your team. Up to 500 characters.</FieldDescription>
      </Field>
      <Field>
        {/* Tags were a comma-separated text field: nothing showed you what had
            been parsed until after saving. TagInput commits each tag to a chip
            as you type, and still submits the same comma-joined value the
            server action already parses. */}
        <TagInput
          name="tags"
          label="Tags (optional)"
          defaultValue={defaultTags}
          max={10}
          placeholder="research, onboarding"
          disabled={disabled}
        />
        <FieldDescription>Press Enter or comma to add. Up to 10 tags.</FieldDescription>
      </Field>
    </>
  )
}
