import { absoluteUrl, siteConfig } from "@/lib/site"

/**
 * Resolve a public email asset URL.
 *
 * - React Email preview (`pnpm email`) serves files from `emails/static/` at `/static/`.
 * - Resend and production clients need absolute URLs on the hosted site (`public/email/`).
 */
export function emailAssetUrl(filename: string): string {
  if (isReactEmailPreview()) {
    return `/static/${filename}`
  }
  return absoluteUrl(`/email/${filename}`)
}

export function getBrandLogoMark() {
  return {
    src: emailAssetUrl("logo-mark.png"),
    alt: siteConfig.name,
    width: 40,
    height: 40,
  } as const
}

function isReactEmailPreview(): boolean {
  // Next.js send paths set NEXT_RUNTIME; Vercel sets VERCEL. React Email's
  // preview server sets neither, so relative /static/ URLs work locally.
  return process.env.NEXT_RUNTIME === undefined && process.env.VERCEL === undefined
}
