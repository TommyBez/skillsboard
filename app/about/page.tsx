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

const socialTitle = "About Skills Board"

export const metadata: Metadata = {
  title: { absolute: "About Skills Board | Shared AI Skills for Teams" },
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
            <h1 data-testid="about-shell" className="mt-4 text-balance text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
              AI skills worth sharing. One place to keep them.
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-muted-foreground">
              Skills Board gives a team one place for its AI skills, so useful
              workflows stay easy to find, understand, and reuse.
            </p>
          </header>

          <div className="space-y-10 text-[0.95rem] leading-7 text-muted-foreground [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:decoration-primary/40 [&_a]:underline-offset-4 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-[-0.025em] [&_h2]:text-foreground [&_li]:pl-1 [&_p+p]:mt-3 [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-2">
            <section>
              <h2>Why Skills Board exists</h2>
              <p>
                Useful AI workflows often disappear into chat threads,
                bookmarks, and setup notes that only one person can find. The
                next teammate starts from scratch or asks the same question
                again.
              </p>
              <p>
                Skills Board turns those discoveries into a searchable team
                library. Save the original source, keep every entry visible,
                and give everyone a clear place to start.
              </p>
            </section>

            <section>
              <h2>One library, even when your tools differ</h2>
              <p>
                Teammates can use the same saved skill in the way that suits
                their setup:
              </p>
              <ul>
                <li>
                  Browse or search the skills and collections your team has
                  saved.
                </li>
                <li>
                  Open the original source, copy a compatible install command,
                  or download the latest files as a ZIP.
                </li>
                <li>
                  Connect an MCP-compatible agent to search the library and,
                  with permission, save or organize skills.
                </li>
              </ul>
              <p>
                The library stays useful even when teammates use different
                agents or installation paths.
              </p>
            </section>

            <section>
              <h2>Free and open source</h2>
              <p>
                Skills Board is free to use, and the source code is public. You
                can use the hosted product at{" "}
                <a href={siteConfig.url}>
                  {siteConfig.url.replace("https://", "")}
                </a>{" "}
                or explore the{" "}
                <a href={siteConfig.githubUrl} target="_blank" rel="noreferrer">
                  open-source project on GitHub
                  <ExternalLinkIcon className="ml-1 inline size-3.5" aria-hidden="true" />
                </a>
                .
              </p>
            </section>

            <section>
              <h2>Practical guides for teams</h2>
              <p>
                Skills Board also publishes guides for choosing, sharing, and
                operating AI skills as a team. Each guide links to the sources
                behind it and includes a review date, so you can verify the
                details before using it.
              </p>
              <p>
                <Link href={resourcePaths.index}>Explore Skills Board resources</Link>.
              </p>
            </section>

            <section>
              <h2>Get in touch</h2>
              <p>
                Questions, ideas, or feedback? Email{" "}
                <a href={`mailto:${siteConfig.contactEmail}`}>
                  {siteConfig.contactEmail}
                </a>
                . You can also open a public issue in the{" "}
                <a href={`${siteConfig.githubUrl}/issues`} target="_blank" rel="noreferrer">
                  GitHub repository
                  <ExternalLinkIcon className="ml-1 inline size-3.5" aria-hidden="true" />
                </a>
                . For a security issue, please use the project’s{" "}
                <a href={`${siteConfig.githubUrl}/security/policy`} target="_blank" rel="noreferrer">
                  security reporting policy
                  <ExternalLinkIcon className="ml-1 inline size-3.5" aria-hidden="true" />
                </a>
                .
              </p>
            </section>
          </div>
        </article>
      </div>
    </>
  )
}
