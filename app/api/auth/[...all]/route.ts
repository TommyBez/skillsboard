import { toNextJsHandler } from "better-auth/next-js"
import { connection } from "next/server"

import { auth } from "@/lib/auth"

const handler = toNextJsHandler(auth.handler)

export async function GET(request: Request) {
  await connection()
  return handler.GET(request)
}

export const POST = handler.POST
