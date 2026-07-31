import "server-only"

import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "node:crypto"

import { normalizeEmailAddress, PRODUCT_COMMUNICATIONS_TOPIC } from "@/lib/email/product-communications"

const TOKEN_VERSION = 1
const TOKEN_MAX_LENGTH = 2048
const TOKEN_AAD = Buffer.from("skills-board/product-communications-unsubscribe/v1")

export const PRODUCT_COMMUNICATIONS_UNSUBSCRIBE_COOKIE =
  "skillsboard-product-communications-unsubscribe"

interface UnsubscribeTokenPayload {
  emailHash: string
  topic: typeof PRODUCT_COMMUNICATIONS_TOPIC
  userId: string
  version: typeof TOKEN_VERSION
}

type EmailPrivacyPurpose = "email-hash" | "unsubscribe-token"

function decodeEmailPrivacyRoot(value: string, name: string, allowPlainText = false): Buffer {
  if (/^[a-f0-9]{64,}$/i.test(value) && value.length % 2 === 0) {
    const decoded = Buffer.from(value, "hex")
    if (decoded.length >= 32) return decoded
  }

  const normalizedBase64 = value.replaceAll("-", "+").replaceAll("_", "/")
  if (/^[A-Za-z0-9+/]+={0,2}$/.test(normalizedBase64)) {
    const padded = normalizedBase64.padEnd(Math.ceil(normalizedBase64.length / 4) * 4, "=")
    const decoded = Buffer.from(padded, "base64")
    const canonical = decoded.toString("base64").replace(/=+$/, "")
    if (decoded.length >= 32 && canonical === normalizedBase64.replace(/=+$/, "")) return decoded
  }

  if (allowPlainText && Buffer.byteLength(value, "utf8") >= 32) return Buffer.from(value, "utf8")
  throw new Error(`${name} must contain at least 32 bytes encoded as base64 or hex`)
}

function getEmailPrivacyRoots(): Buffer[] {
  const dedicatedSecret = process.env.EMAIL_PRIVACY_SECRET?.trim()
  if (!dedicatedSecret && process.env.VERCEL_ENV === "production") {
    throw new Error("EMAIL_PRIVACY_SECRET is required in production")
  }
  const fallbackSecret = process.env.BETTER_AUTH_SECRET?.trim()
  if (!dedicatedSecret && !fallbackSecret) {
    throw new Error("EMAIL_PRIVACY_SECRET or BETTER_AUTH_SECRET is required")
  }
  const currentRoot = dedicatedSecret
    ? decodeEmailPrivacyRoot(dedicatedSecret, "EMAIL_PRIVACY_SECRET")
    : decodeEmailPrivacyRoot(fallbackSecret!, "BETTER_AUTH_SECRET", true)

  const previousSecretsValue = process.env.EMAIL_PRIVACY_SECRET_PREVIOUS?.trim()
  let previousSecrets: string[] = []
  if (previousSecretsValue) {
    let parsed: unknown
    try {
      parsed = JSON.parse(previousSecretsValue)
    } catch {
      throw new Error("EMAIL_PRIVACY_SECRET_PREVIOUS must be a JSON array")
    }
    if (!Array.isArray(parsed) || parsed.some((value) => typeof value !== "string" || !value.trim())) {
      throw new Error("EMAIL_PRIVACY_SECRET_PREVIOUS must contain only non-empty strings")
    }
    previousSecrets = parsed.map((value) => value.trim())
  }

  const roots = [
    currentRoot,
    ...previousSecrets.map((value) => decodeEmailPrivacyRoot(value, "EMAIL_PRIVACY_SECRET_PREVIOUS")),
  ]
  return [...new Map(roots.map((root) => [root.toString("hex"), root])).values()]
}

function deriveEmailPrivacyKey(rootSecret: Buffer, purpose: EmailPrivacyPurpose): Buffer {
  return createHmac("sha256", rootSecret)
    .update(`skills-board/email-privacy/v1/${purpose}`)
    .digest()
}

function decodeCanonicalBase64Url(value: string): Buffer | null {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null
  const decoded = Buffer.from(value, "base64url")
  return decoded.toString("base64url") === value ? decoded : null
}

export function hashEmailAddress(email: string): string {
  return hashEmailAddressCandidates(email)[0]
}

export function hashEmailAddressCandidates(email: string): [string, ...string[]] {
  const normalizedEmail = normalizeEmailAddress(email)
  const candidates = getEmailPrivacyRoots().map((rootSecret) => (
    createHmac("sha256", deriveEmailPrivacyKey(rootSecret, "email-hash"))
      .update(`email-address\0${normalizedEmail}`)
      .digest("hex")
  ))
  const [current, ...previous] = candidates
  if (!current) throw new Error("An email privacy root is required")
  return [current, ...previous]
}

export function createProductCommunicationsUnsubscribeToken(input: {
  emailHash: string
  userId: string
}): string {
  const payload: UnsubscribeTokenPayload = {
    emailHash: input.emailHash,
    topic: PRODUCT_COMMUNICATIONS_TOPIC,
    userId: input.userId,
    version: TOKEN_VERSION,
  }
  const iv = randomBytes(12)
  const [currentRoot] = getEmailPrivacyRoots()
  if (!currentRoot) throw new Error("An email privacy root is required")
  const cipher = createCipheriv("aes-256-gcm", deriveEmailPrivacyKey(currentRoot, "unsubscribe-token"), iv)
  cipher.setAAD(TOKEN_AAD)
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag()
  return [
    TOKEN_VERSION,
    iv.toString("base64url"),
    encrypted.toString("base64url"),
    authTag.toString("base64url"),
  ].join(".")
}

export function verifyProductCommunicationsUnsubscribeToken(token: string): UnsubscribeTokenPayload | null {
  if (!token || token.length > TOKEN_MAX_LENGTH) return null
  const [version, encodedIv, encryptedPayload, encodedAuthTag, extra] = token.split(".")
  if (
    version !== String(TOKEN_VERSION)
    || !encodedIv
    || !encryptedPayload
    || !encodedAuthTag
    || extra
  ) return null

  const privacyRoots = getEmailPrivacyRoots()
  try {
    const iv = decodeCanonicalBase64Url(encodedIv)
    const authTag = decodeCanonicalBase64Url(encodedAuthTag)
    const ciphertext = decodeCanonicalBase64Url(encryptedPayload)
    if (!iv || !authTag || !ciphertext || iv.length !== 12 || authTag.length !== 16) return null

    for (const rootSecret of privacyRoots) {
      try {
        const decipher = createDecipheriv(
          "aes-256-gcm",
          deriveEmailPrivacyKey(rootSecret, "unsubscribe-token"),
          iv,
        )
        decipher.setAAD(TOKEN_AAD)
        decipher.setAuthTag(authTag)
        const plaintext = Buffer.concat([
          decipher.update(ciphertext),
          decipher.final(),
        ]).toString("utf8")
        const parsed = JSON.parse(plaintext) as Partial<UnsubscribeTokenPayload>
        if (
          parsed.version === TOKEN_VERSION
          && parsed.topic === PRODUCT_COMMUNICATIONS_TOPIC
          && typeof parsed.userId === "string"
          && parsed.userId.length >= 1
          && parsed.userId.length <= 256
          && typeof parsed.emailHash === "string"
          && /^[a-f0-9]{64}$/.test(parsed.emailHash)
        ) {
          return parsed as UnsubscribeTokenPayload
        }
      } catch {
        // Try the next retained root during a planned key rotation.
      }
    }
    return null
  } catch {
    return null
  }
}
