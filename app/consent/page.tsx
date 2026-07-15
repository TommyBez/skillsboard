import { ShieldCheckIcon } from "lucide-react"
import { redirect } from "next/navigation"

import { Brand } from "@/components/brand"
import { ConsentForm } from "@/components/consent-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSession } from "@/lib/session"

export default async function ConsentPage() {
  const session = await getSession()
  if (!session?.user) redirect("/sign-in")
  return <main className="flex min-h-svh flex-col bg-muted/30 p-4"><div className="mx-auto flex w-full max-w-6xl py-4"><Brand /></div><div className="flex flex-1 items-center justify-center py-12"><Card className="w-full max-w-lg"><CardHeader><span className="mb-3 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><ShieldCheckIcon /></span><CardTitle className="text-2xl">Authorize MCP access</CardTitle><CardDescription>An MCP client is requesting access to your Skills Board account.</CardDescription></CardHeader><CardContent className="flex flex-col gap-6"><ul className="flex flex-col gap-3 text-sm"><li className="rounded-lg border p-3">View skills saved by your organizations</li><li className="rounded-lg border p-3">Search your library and retrieve install commands</li><li className="rounded-lg border p-3">Discover public skills from skills.sh</li></ul><p className="text-sm text-muted-foreground">You are signed in as {session.user.email}.</p><ConsentForm /></CardContent></Card></div></main>
}
