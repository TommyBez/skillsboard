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
        <FieldLabel htmlFor={`${idPrefix}-tags`}>Tags (optional)</FieldLabel>
        <Input
          id={`${idPrefix}-tags`}
          name="tags"
          defaultValue={defaultTags.join(", ")}
          placeholder="research, onboarding"
          disabled={disabled}
        />
        <FieldDescription>Comma-separated, up to 10 tags.</FieldDescription>
      </Field>
    </>
  )
}
