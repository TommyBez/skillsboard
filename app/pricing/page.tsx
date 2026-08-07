import type { Metadata } from "next"
import Link from "next/link"
import { ExternalLinkIcon } from "lucide-react"

import { JsonLd } from "@/components/json-ld"
import {
  buildPricingSchema,
  pricingDescription,
  pricingFaq,
  pricingPath,
} from "@/lib/seo/pricing-schema"
import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: { absolute: "Pricing | Skills Board — Free Forever" },
  description: pricingDescription,
  alternates: { canonical: pricingPath },
}

const hostedFeatures = [
  "Unlimited team libraries",
  "Shared skill library with search and team-specific tags",
  "Original source visible for every saved skill",
  "Install commands and ZIP downloads of the latest source files",
  "Authenticated MCP access for compatible agents",
] as const

const selfHostedFeatures = [
  "Core team-library features from the same open-source codebase",
  "Limits determined by your own infrastructure",
  "Email, OAuth, public catalog, and other integrations require your own provider configuration",
] as const

export default function PricingPage() {
  return (
    <>
      <JsonLd data={buildPricingSchema()} />

      <div className="mx-auto w-full max-w-[1200px] px-5 py-12 md:px-10 md:py-20">
        <nav
          aria-label="Breadcrumb"
          className="mb-7 flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Pricing</span>
        </nav>

        <header className="max-w-2xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Pricing
          </p>
          <h1 className="mt-4 text-balance text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl">
            Free forever. No trial, no credit card, no paid tier.
          </h1>
          <p className="mt-5 text-pretty text-base leading-7 text-muted-foreground">
            Skills Board keeps the AI skills your team recommends in one
            searchable library. The hosted product costs nothing, and the code
            is MIT-licensed open source.
          </p>
        </header>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <section
            aria-labelledby="hosted-plan"
            className="rounded-lg border border-border bg-card p-7"
          >
            <h2
              id="hosted-plan"
              className="text-2xl font-semibold tracking-[-0.025em]"
            >
              Hosted
            </h2>
            <p className="mt-2 text-3xl font-semibold tabular-nums">
              $0
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                / month, free forever
              </span>
            </p>
            <ul className="mt-6 space-y-2 text-[0.95rem] leading-7 text-muted-foreground">
              {hostedFeatures.map((feature) => (
                <li key={feature} className="flex gap-2.5">
                  <span aria-hidden="true" className="text-primary">
                    —
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </section>

          <section
            aria-labelledby="self-hosted-plan"
            className="rounded-lg border border-border bg-card p-7"
          >
            <h2
              id="self-hosted-plan"
              className="text-2xl font-semibold tracking-[-0.025em]"
            >
              Self-hosted
            </h2>
            <p className="mt-2 text-3xl font-semibold tabular-nums">
              $0
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                open source
              </span>
            </p>
            <ul className="mt-6 space-y-2 text-[0.95rem] leading-7 text-muted-foreground">
              {selfHostedFeatures.map((feature) => (
                <li key={feature} className="flex gap-2.5">
                  <span aria-hidden="true" className="text-primary">
                    —
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-6 text-muted-foreground">
              <a
                href={siteConfig.githubUrl}
                rel="noopener noreferrer"
                target="_blank"
                className="inline-flex items-center gap-1 font-medium text-foreground underline decoration-primary/40 underline-offset-4"
              >
                View the source on GitHub
                <ExternalLinkIcon aria-hidden="true" className="size-3.5" />
              </a>
            </p>
          </section>
        </div>

        <section aria-labelledby="pricing-faq" className="mt-16 max-w-2xl">
          <h2
            id="pricing-faq"
            className="text-2xl font-semibold tracking-[-0.025em]"
          >
            Frequently asked questions
          </h2>
          <dl className="mt-6 space-y-8">
            {pricingFaq.map((entry) => (
              <div key={entry.question}>
                <dt className="font-semibold text-foreground">
                  {entry.question}
                </dt>
                <dd className="mt-2 text-[0.95rem] leading-7 text-muted-foreground">
                  {entry.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </>
  )
}
