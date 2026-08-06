import type { Metadata } from "next"
import { ExternalLinkIcon, MailIcon, MapPinIcon } from "lucide-react"

import { LegalPageShell } from "@/components/legal-page-shell"
import { siteConfig } from "@/lib/site"

const description = "Contact Skills Board for product, account, privacy, or security questions."
const socialTitle = "Contact | Skills Board"
const socialImageAlt = "Skills Board: Your team’s skills. All in one place."

export const metadata: Metadata = {
  title: "Contact",
  description,
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    url: "/contact",
    title: socialTitle,
    description,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    images: [{ url: "/opengraph-image", alt: socialImageAlt }],
  },
  twitter: {
    card: "summary_large_image",
    title: socialTitle,
    description,
    images: [{ url: "/twitter-image", alt: socialImageAlt }],
  },
}

export default function ContactPage() {
  return (
    <LegalPageShell
      eyebrow="Contact"
      title="Talk to Skills Board"
      description="Use the channel that matches your question. Do not include passwords, sign-in codes, or private tokens."
    >
      <section className="rounded-[16px] border border-border bg-card p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <MailIcon className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h2>Email</h2>
            <p>
              For product, account, privacy, or legal questions, email{" "}
              <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[16px] border border-border bg-card p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-foreground text-background">
            <MapPinIcon className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h2>Postal address</h2>
            <address className="not-italic text-foreground">{siteConfig.postalAddress}</address>
          </div>
        </div>
      </section>

      <section>
        <h2>Public bug reports and feature requests</h2>
        <p>
          If the report can be public and contains no account or private team information, you can use the{" "}
          <a href={`${siteConfig.githubUrl}/issues`} target="_blank" rel="noreferrer">
            Skills Board GitHub issues
            <ExternalLinkIcon className="ml-1 inline size-3.5" aria-hidden="true" />
          </a>
          . Send private reports by email instead.
        </p>
      </section>

      <section>
        <h2>Security reports</h2>
        <p>
          Do not open a public issue for a suspected vulnerability. Follow the{" "}
          <a href={`${siteConfig.githubUrl}/security/policy`} target="_blank" rel="noreferrer">
            security reporting policy
            <ExternalLinkIcon className="ml-1 inline size-3.5" aria-hidden="true" />
          </a>{" "}
          or email {siteConfig.contactEmail} with a concise description and reproduction details.
        </p>
      </section>
    </LegalPageShell>
  )
}
