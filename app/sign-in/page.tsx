import { redirect } from "next/navigation"

import { AuthForm } from "@/components/auth-form"
import { Brand } from "@/components/brand"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSession } from "@/lib/session"

export default async function SignInPage() {
  const session = await getSession()
  if (session?.user) redirect("/library")
  return (
    <main className="flex min-h-svh flex-col bg-muted/30 p-4">
      <div className="mx-auto flex w-full max-w-6xl py-4"><Brand /></div>
      <div className="flex flex-1 items-center justify-center py-12">
        <Card className="w-full max-w-md shadow-sm">
          <CardHeader><CardTitle className="text-2xl">Welcome back</CardTitle><CardDescription>Sign in to open your team skills library.</CardDescription></CardHeader>
          <CardContent><AuthForm mode="sign-in" /></CardContent>
        </Card>
      </div>
    </main>
  )
}
