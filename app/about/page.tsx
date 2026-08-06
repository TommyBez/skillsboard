import type { Metadata } from "next"
import Link from "next/link"
import { ExternalLinkIcon } from "lucide-react"

import { JsonLd } from "@/components/json-ld"
import { OG_SIZE, TWITTER_SIZE } from "@/lib/og/template"
import {
  aboutDescription,
  aboutSocialImageAlt,
  buildAboutSchema,
} from "@/lib/seo/about-schema"
import { resourcePaths } from "@/lib/seo/resources"
import { siteConfig } from "@/lib/site"

const socialTitle = "About Skills Board and our editorial method"

export const metadata: Metadata = {
  title: { absolute: "About Skills Board and Our Editorial Method" },
  description: aboutDescription,
  alternates: { canonical: resourcePaths.about },
  openGraph: {
    type: "website",
    url: resourcePaths.about,
    title: socialTitle,
    description: aboutDescription,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    images: [
      {
        url: `${resourcePaths.about}/opengraph-image`,
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        alt: aboutSocialImageAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: socialTitle,
    description: aboutDescription,
    images: [
      {
        url: `${resourcePaths.about}/twitter-image`,
        width: TWITTER_SIZE.width,
        height: TWITTER_SIZE.height,
        alt: aboutSocialImageAlt,
      },
    ],
  },
}

export default function AboutPage() {
  return (
    <>
      <JsonLd data={buildAboutSchema()} />

      <div className="mx-auto w-full max-w-[1200px] px-5 py-12 md:px-10 md:py-20">
        <article className="grid gap-12 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-20">
          <header className="lg:sticky lg:top-28 lg:self-start">
            <nav aria-label="Breadcrumb" className="mb-7 flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="transition-colors hover:text-foreground">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">About</span>
            </nav>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              About
            </p>
            <h1 className="mt-4 text-balance text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
              Who publishes Skills Board guidance
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-muted-foreground">
              Skills Board publishes practical guidance for teams sharing and operating reusable AI skills. This page
              explains the organization identity, editorial method, sourcing policy, and boundaries behind that work.
            </p>
          </header>

          <div className="space-y-10 text-[0.95rem] leading-7 text-muted-foreground [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:decoration-primary/40 [&_a]:underline-offset-4 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-[-0.025em] [&_h2]:text-foreground [&_li]:pl-1 [&_p+p]:mt-3 [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-2">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
              Last reviewed August 6, 2026
            </p>

            <section>
              <h2>Skills Board in one sentence</h2>
              <p>
                Skills Board is a shared AI skill library for teams. The hosted product runs at{" "}
                <a href={siteConfig.url}>{siteConfig.url.replace("https://", "")}</a>, and its source code is public in
                the{" "}
                <a href={siteConfig.githubUrl} target="_blank" rel="noreferrer">
                  Skills Board GitHub repository
                  <ExternalLinkIcon className="ml-1 inline size-3.5" aria-hidden="true" />
                </a>
                .
              </p>
              <p>
                The hosted service and public project are published under the {siteConfig.name} name. Product and
                editorial questions can be sent to{" "}
                <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
              </p>
            </section>

            <section>
              <h2>How guides are produced and reviewed</h2>
              <ol className="ml-5 list-decimal space-y-2">
                <li>Start with one bounded question a team can answer through an observable workflow.</li>
                <li>
                  Check product claims against the Skills Board source and external claims against current first-party
                  or standards documentation.
                </li>
                <li>
                  Write the direct answer first, then make the decision, steps, reusable record, pitfalls, and human
                  checks explicit.
                </li>
                <li>
                  Review the draft for unsupported claims, hidden permissions, agent-specific assumptions, and
                  conflicts with related guides.
                </li>
                <li>Publish the primary sources, publisher, and review dates on the guide itself.</li>
              </ol>
              <p>
                Guides are published by Skills Board. They are practical editorial guidance, not independently
                peer-reviewed research or a substitute for security, privacy, or legal review.
              </p>
            </section>

            <section>
              <h2>Sources and citations</h2>
              <p>
                Guides prefer primary material: official vendor documentation, standards, and the relevant open-source
                repositories. A guide’s Primary sources section links the material used and explains why each source
                matters. When a claim depends on Skills Board behavior, the public repository is the source of truth.
              </p>
              <p>
                External products and standards can change. Readers should open the linked sources and verify current
                behavior before a rollout, especially for authentication, permissions, installation, or agent
                compatibility.
              </p>
            </section>

            <section>
              <h2>Review and update policy</h2>
              <p>
                Each guide shows a publication date and a last-updated date. The updated date changes when the guide
                receives a material source, product, workflow, or editorial review—not merely because the page was
                requested or rebuilt.
              </p>
              <p>
                Skills Board revisits guidance when a cited source or documented product behavior changes. The visible
                date is not a promise that every external integration is continuously monitored, so current source
                verification remains part of the recommended workflow.
              </p>
            </section>

            <section>
              <h2>Product and guidance boundaries</h2>
              <ul>
                <li>A saved skill is a team recommendation, not a security review or compatibility certification.</li>
                <li>
                  Skills Board points to the latest available source and does not promise a pinned historical version of
                  that source.
                </li>
                <li>
                  MCP read access can list and search authorized skills and collections, retrieve install commands, and
                  discover public or repository skills. With <code>skills:write</code>, it can save new skills, create
                  collections, and add or remove saved skills from collections.
                </li>
                <li>
                  MCP access cannot edit or delete saved team skills, install skills in an agent, or execute skills.
                </li>
                <li>
                  Install commands and ZIP downloads are handoff paths. Teams remain responsible for inspecting source,
                  permissions, and results in their own environment.
                </li>
              </ul>
            </section>

            <section>
              <h2>Corrections and contact</h2>
              <p>
                For a factual correction or private product question, email{" "}
                <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>. Public documentation issues
                that contain no private account or team information can be filed in{" "}
                <a href={`${siteConfig.githubUrl}/issues`} target="_blank" rel="noreferrer">
                  GitHub issues
                  <ExternalLinkIcon className="ml-1 inline size-3.5" aria-hidden="true" />
                </a>
                . Suspected vulnerabilities should follow the repository’s{" "}
                <a href={`${siteConfig.githubUrl}/security/policy`} target="_blank" rel="noreferrer">
                  security reporting policy
                  <ExternalLinkIcon className="ml-1 inline size-3.5" aria-hidden="true" />
                </a>
                .
              </p>
              <p>
                Browse the three topical collections on the{" "}
                <Link href={resourcePaths.index}>Skills Board resources page</Link>.
              </p>
            </section>
          </div>
        </article>
      </div>
    </>
  )
}
