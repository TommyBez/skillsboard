import type { Metadata } from "next"
import Link from "next/link"

import { JsonLd } from "@/components/json-ld"
import { markdownTwinAlternates } from "@/lib/markdown/twins"
import { developers, developersPath, problemAnchor } from "@/lib/seo/developers"
import { buildDevelopersSchema } from "@/lib/seo/developers-schema"
import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: { absolute: "Skills Board developer docs | MCP API, OAuth, and discovery" },
  description: developers.description,
  alternates: markdownTwinAlternates(developersPath),
  openGraph: {
    type: "article",
    url: developersPath,
    title: "Skills Board developer docs",
    description: developers.description,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
  },
}

/**
 * Copy with its `code spans` rendered as code.
 *
 * The strings behind this page are written once and rendered twice: as this
 * page and as `/developers.md`. Markdown's backticks are the only markup in
 * them, and dropping them into HTML unread would leave a developer reading
 * literal backticks around every header name, so they are turned into the
 * element they stand for here and left alone in the twin.
 */
function Prose({ children }: { children: string }) {
  return (
    <>
      {children.split(/`([^`]+)`/).map((part, index) =>
        index % 2 === 1 ? (
          <code key={`${part}-${index}`} className="font-mono text-[0.9em] text-foreground">
            {part}
          </code>
        ) : (
          part
        ),
      )}
    </>
  )
}

/** Section heading plus its anchor, so every section is linkable on its own. */
function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-20">
      {children}
    </h2>
  )
}

function LabelledTable({
  caption,
  columns,
  rows,
}: {
  caption: string
  columns: readonly string[]
  rows: readonly { label: string; cells: readonly string[] }[]
}) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-border">
            {columns.map((column) => (
              <th
                key={column}
                scope="col"
                className="py-2 pr-4 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-foreground"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-border/60 align-top">
              <th scope="row" className="py-2.5 pr-4 font-mono text-[0.8rem] font-normal text-foreground">
                {row.label}
              </th>
              {row.cells.map((value, index) => (
                <td key={columns[index + 1] ?? index} className="py-2.5 pr-4">
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="mt-4 overflow-x-auto rounded-[3px] border border-border bg-muted/40 p-4 text-[0.8rem] leading-6 text-foreground">
      <code>{children}</code>
    </pre>
  )
}

/**
 * The developer portal.
 *
 * Every fact on it comes from `lib/seo/developers`, which reads the tool list,
 * the scopes, the error registry, and the request budget from the modules that
 * define them. The page is a rendering of that data and so is the Markdown twin
 * at `/developers.md`, which is what keeps a developer portal from drifting
 * away from the API it documents.
 */
export default function DevelopersPage() {
  return (
    <>
      <JsonLd data={buildDevelopersSchema()} />

      <div className="mx-auto w-full max-w-[1200px] px-5 py-12 md:px-10 md:py-20">
        <article className="grid gap-12 lg:grid-cols-[minmax(0,0.62fr)_minmax(0,1.38fr)] lg:gap-20">
          <header className="lg:sticky lg:top-28 lg:self-start">
            <nav aria-label="Breadcrumb" className="mb-7 flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="transition-colors hover:text-foreground">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">Developers</span>
            </nav>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Developers
            </p>
            <h1 className="mt-4 text-balance text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl">
              Connect an agent to your team’s Skills Board.
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-muted-foreground">
              The MCP endpoint, the OAuth flow, and the discovery documents an
              agent reads before it connects, with the versioning, error, and
              rate-limit conventions the whole surface follows.
            </p>
            <p className="mt-5 font-mono text-xs text-muted-foreground">
              <a href="/developers.md" className="underline decoration-primary/40 underline-offset-4">
                Read this page as Markdown
              </a>
            </p>
          </header>

          <div className="space-y-12 text-[0.95rem] leading-7 text-muted-foreground [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:decoration-primary/40 [&_a]:underline-offset-4 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-[-0.025em] [&_h2]:text-foreground [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:font-mono [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:pl-1 [&_ol]:ml-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_p+p]:mt-3 [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-2">
            <section>
              {developers.intro.map((paragraph) => (
                <p key={paragraph}><Prose>{paragraph}</Prose></p>
              ))}
            </section>

            <section>
              <SectionHeading id="surface">{developers.publicSurface.title}</SectionHeading>
              <p><Prose>{developers.publicSurface.intro}</Prose></p>
              <LabelledTable
                caption={developers.publicSurface.title}
                columns={developers.publicSurface.columns}
                rows={developers.publicSurface.rows}
              />
            </section>

            <section>
              <SectionHeading id="quickstart">{developers.connectAnAgent.title}</SectionHeading>
              <p><Prose>{developers.connectAnAgent.intro}</Prose></p>
              <ol className="mt-4">
                {developers.connectAnAgent.steps.map((step) => (
                  <li key={step}><Prose>{step}</Prose></li>
                ))}
              </ol>
              <CodeBlock>{developers.connectAnAgent.template}</CodeBlock>
              <p className="mt-4"><Prose>{developers.connectAnAgent.note}</Prose></p>
            </section>

            <section>
              <SectionHeading id="tools">{developers.tools.title}</SectionHeading>
              <p><Prose>{developers.tools.intro}</Prose></p>
              <LabelledTable
                caption={developers.tools.title}
                columns={developers.tools.columns}
                rows={developers.tools.rows}
              />
            </section>

            <section>
              <SectionHeading id="authentication">{developers.authenticationAndScopes.title}</SectionHeading>
              <p><Prose>{developers.authenticationAndScopes.intro}</Prose></p>
              <LabelledTable
                caption={developers.authenticationAndScopes.title}
                columns={developers.authenticationAndScopes.columns}
                rows={developers.authenticationAndScopes.rows}
              />
              <p className="mt-4"><Prose>{developers.authenticationAndScopes.note}</Prose></p>
              <p>
                <Prose>{developers.authenticationAndScopes.link.lead}</Prose>{" "}
                <a href={developers.authenticationAndScopes.link.href}>{developers.authenticationAndScopes.link.label}</a>
                {developers.authenticationAndScopes.link.trail}
              </p>
            </section>

            <section>
              <SectionHeading id="versioning">{developers.versioningAndDeprecation.title}</SectionHeading>
              {developers.versioningAndDeprecation.body.map((paragraph) => (
                <p key={paragraph}><Prose>{paragraph}</Prose></p>
              ))}
            </section>

            <section>
              <SectionHeading id="errors">{developers.errors.title}</SectionHeading>
              <p><Prose>{developers.errors.intro}</Prose></p>
              <CodeBlock>{developers.errors.template}</CodeBlock>
              <p className="mt-4"><Prose>{developers.errors.note}</Prose></p>
              {developers.errors.codes.rows.map((problem) => (
                <div key={problem.label}>
                  <h3 id={problemAnchor(problem.label)} className="scroll-mt-20">
                    {problem.label}
                  </h3>
                  <p>
                    <strong className="text-foreground">
                      {problem.cells[0]} {problem.cells[1]}.
                    </strong>{" "}
                    <Prose>{problem.cells[2]}</Prose>
                  </p>
                </div>
              ))}
            </section>

            <section>
              <SectionHeading id="rate-limits">{developers.rateLimits.title}</SectionHeading>
              {developers.rateLimits.body.map((paragraph) => (
                <p key={paragraph}><Prose>{paragraph}</Prose></p>
              ))}
              <LabelledTable
                caption={developers.rateLimits.title}
                columns={developers.rateLimits.columns}
                rows={developers.rateLimits.rows}
              />
            </section>

            <section>
              <SectionHeading id="markdown">{developers.markdownRepresentations.title}</SectionHeading>
              {developers.markdownRepresentations.body.map((paragraph) => (
                <p key={paragraph}><Prose>{paragraph}</Prose></p>
              ))}
            </section>

            <section>
              <SectionHeading id="status">{developers.supportAndSource.title}</SectionHeading>
              <ul className="mt-4">
                {developers.supportAndSource.entries.map((entry) => (
                  <li key={entry.href}>
                    <a href={entry.href}>{entry.label}</a>: {entry.note}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </article>
      </div>
    </>
  )
}
