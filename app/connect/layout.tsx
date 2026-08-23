import { ResourceShell } from "@/components/resources/resource-chrome"

/**
 * One frame, the public one.
 *
 * Connecting an agent is the first thing a reader checks before opening an
 * account, so `/connect` is a public, indexable page and nothing else. It reads
 * no session, no cookie, and no header, which is what lets it be prerendered
 * and what stops a stale session cookie from turning an acquisition page into a
 * redirect to sign in.
 *
 * The personalized, team scoped version of this setup lives behind the session,
 * on `/start`.
 */
export default function ConnectLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <ResourceShell location="connect_header">{children}</ResourceShell>
}
