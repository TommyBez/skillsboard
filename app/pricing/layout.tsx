import { ResourceShell } from "@/components/resources/resource-chrome"

export default function PricingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <ResourceShell location="pricing_header">{children}</ResourceShell>
}
