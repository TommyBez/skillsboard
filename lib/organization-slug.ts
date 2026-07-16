import { organizationSlugExists } from "@/lib/db/queries"

const SLUG_MAX_LENGTH = 80
const SLUG_MIN_LENGTH = 2
const SLUG_FALLBACK = "team"

export function slugifyOrganizationName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, SLUG_MAX_LENGTH)
}

function withMinimumSlugLength(slug: string): string {
  if (slug.length >= SLUG_MIN_LENGTH) return slug
  return SLUG_FALLBACK
}

export async function resolveUniqueOrganizationSlug(name: string): Promise<string> {
  const base = withMinimumSlugLength(slugifyOrganizationName(name))
  let candidate = base
  let counter = 2

  while (await organizationSlugExists(candidate)) {
    const suffix = `-${counter}`
    candidate = `${base.slice(0, SLUG_MAX_LENGTH - suffix.length)}${suffix}`
    counter += 1
  }

  return candidate
}
