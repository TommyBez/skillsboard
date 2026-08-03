import "server-only"

import { createHmac } from "node:crypto"

function getEmailIdempotencySecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET?.trim()
  if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
    throw new Error("BETTER_AUTH_SECRET must contain at least 32 bytes")
  }
  return secret
}

export function createEmailIdempotencyKey(namespace: string, parts: readonly string[]): string {
  const hmac = createHmac("sha256", getEmailIdempotencySecret())
  hmac.update(namespace)
  for (const part of parts) hmac.update("\0").update(part)
  return `${namespace}/${hmac.digest("hex").slice(0, 32)}`
}
