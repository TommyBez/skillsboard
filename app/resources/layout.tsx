import { ResourceShell } from "@/components/resources/resource-chrome"
import { resourcePaths } from "@/lib/seo/resources"

export default function ResourcesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ResourceShell
      landingPath={resourcePaths.index}
      location="resources_header"
    >
      {children}
    </ResourceShell>
  )
}
