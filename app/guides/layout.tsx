import { ResourceShell } from "@/components/resources/resource-chrome"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default function GuidesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <ResourceShell location="guide_header">{children}</ResourceShell>
}
