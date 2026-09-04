import Link from "next/link"
import { ExternalLinkIcon } from "lucide-react"

import { JsonLd } from "@/components/json-ld"
import {
  CodeBlock,
  formatArticleDate,
  NoteList,
  SectionHeading,
  SectionSources,
  SectionTable,
  StepList,
} from "@/components/resources/article-parts"
import { ResourceBreadcrumb } from "@/components/resources/resource-breadcrumb"
import { ResourceCta } from "@/components/resources/resource-chrome"
import type {
  ClaudeCodeForTeamsDefinition,
  ClaudeCodeForTeamsInlineLink,
} from "@/lib/seo/claude-code-for-teams"
import { buildResourceArticleSchema } from "@/lib/seo/resource-article-schema"
import { resourcePaths } from "@/lib/seo/resources"
import { siteConfig } from "@/lib/site"

function InlineLink({ link }: { link: ClaudeCodeForTeamsInlineLink }) {
  return (
    <p className="mt-7 max-w-3xl text-[0.95rem] leading-7 text-muted-foreground">
      {link.lead}{" "}
      <Link
        href={link.href}
        className="font-semibold underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
      >
        {link.label}
      </Link>
      {link.trail}
    </p>
  )
}

export function ClaudeCodeForTeamsPage({
  entry,
}: {
  entry: ClaudeCodeForTeamsDefinition
}) {
  return (
    <>
      <JsonLd data={buildResourceArticleSchema(entry)} />

      <div className="mx-auto w-full max-w-[1000px] px-5 py-12 md:px-10 md:py-16">
        <ResourceBreadcrumb page={entry.eyebrow} />

        <header className="mt-8">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {entry.eyebrow}
          </p>
          <h1 className="mt-4 text-balance text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl">
            {entry.title}
          </h1>
          <div className="mt-6 max-w-3xl space-y-4 text-[1.05rem] leading-8 text-muted-foreground">
            {entry.intro.map((paragraph) => (
              <p key={paragraph} className="text-pretty">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <ResourceCta location="hero" />
            <a
              href={siteConfig.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
            >
              Read the source on GitHub
              <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
            </a>
          </div>
          <dl className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-border/70 pt-5 text-sm text-muted-foreground">
            <div className="flex gap-2">
              <dt className="font-semibold text-foreground">Publisher</dt>
              <dd>
                <Link
                  href="/"
                  className="underline decoration-border underline-offset-4 hover:text-foreground"
                >
                  {siteConfig.name}
                </Link>
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold text-foreground">Published</dt>
              <dd>
                <time dateTime={entry.publishedAt}>
                  {formatArticleDate(entry.publishedAt)}
                </time>
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold text-foreground">Last checked</dt>
              <dd>
                <time dateTime={entry.modifiedAt}>
                  {formatArticleDate(entry.modifiedAt)}
                </time>
              </dd>
            </div>
          </dl>
        </header>

        <section
          aria-labelledby="answer-heading"
          className="mt-12 rounded-[3px] border border-primary/30 bg-primary/5 p-6 md:p-8"
        >
          <h2
            id="answer-heading"
            className="text-2xl font-semibold tracking-tight md:text-3xl"
          >
            What a Claude Code team rollout decides
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed">
            {entry.answer}
          </p>
          <NoteList notes={entry.answerNotes} />
          <SectionSources
            sourceIds={entry.answerSourceIds}
            sources={entry.sources}
          />
        </section>

        <section aria-labelledby="plans-heading" className="pt-16">
          <SectionHeading
            eyebrow="01 / Plans"
            id="plans"
            title={entry.plans.title}
            intro={entry.plans.intro}
          />
          <SectionTable
            caption="Each administrative capability, whether Team and Enterprise plans carry it, and what the source adds."
            columns={entry.plans.columns}
            rows={entry.plans.rows}
            labelWidth="w-[24%]"
          />
          <NoteList notes={entry.plans.notes} />
          <InlineLink link={entry.plans.link} />
          <SectionSources
            sourceIds={entry.plans.sourceIds}
            sources={entry.sources}
          />
        </section>

        <section aria-labelledby="settings-heading" className="pt-16">
          <SectionHeading
            eyebrow="02 / Settings"
            id="settings"
            title={entry.settings.title}
            intro={entry.settings.intro}
          />
          <SectionTable
            caption="The five settings layers in precedence order, where each one lives, and who it reaches."
            columns={entry.settings.columns}
            rows={entry.settings.rows}
            labelWidth="w-[20%]"
          />
          <NoteList notes={entry.settings.notes} />
          <InlineLink link={entry.settings.link} />
          <SectionSources
            sourceIds={entry.settings.sourceIds}
            sources={entry.sources}
          />
        </section>

        <section aria-labelledby="conventions-heading" className="pt-16">
          <SectionHeading
            eyebrow="03 / Conventions"
            id="conventions"
            title={entry.conventions.title}
            intro={entry.conventions.intro}
          />
          <SectionTable
            caption="Every place a CLAUDE.md instruction can live, and how far each one reaches."
            columns={entry.conventions.columns}
            rows={entry.conventions.rows}
            labelWidth="w-[20%]"
          />
          <NoteList notes={entry.conventions.notes} />
          <InlineLink link={entry.conventions.link} />
          <SectionSources
            sourceIds={entry.conventions.sourceIds}
            sources={entry.sources}
          />
        </section>

        <section aria-labelledby="skills-heading" className="pt-16">
          <SectionHeading
            eyebrow="04 / Skills"
            id="skills"
            title={entry.skills.title}
            intro={entry.skills.intro}
          />
          <SectionTable
            caption="Every directory Claude Code reads a SKILL.md from, and who ends up with it."
            columns={entry.skills.columns}
            rows={entry.skills.rows}
            labelWidth="w-[18%]"
          />
          <NoteList notes={entry.skills.notes} />
          <InlineLink link={entry.skills.link} />
          <SectionSources
            sourceIds={entry.skills.sourceIds}
            sources={entry.sources}
          />
        </section>

        <section aria-labelledby="plugins-heading" className="pt-16">
          <SectionHeading
            eyebrow="05 / Plugins"
            id="plugins"
            title={entry.plugins.title}
            intro={entry.plugins.intro}
          />
          <SectionTable
            caption="Every documented way a plugin or a marketplace reaches a team, and where the declaration lives."
            columns={entry.plugins.columns}
            rows={entry.plugins.rows}
            labelWidth="w-[24%]"
          />
          <NoteList notes={entry.plugins.notes} />
          <InlineLink link={entry.plugins.link} />
          <SectionSources
            sourceIds={entry.plugins.sourceIds}
            sources={entry.sources}
          />
        </section>

        <section aria-labelledby="mcp-heading" className="pt-16">
          <SectionHeading
            eyebrow="06 / MCP"
            id="mcp"
            title={entry.mcp.title}
            intro={entry.mcp.intro}
          />
          <SectionTable
            caption="Every MCP scope, where the configuration is stored, and whether teammates get it."
            columns={entry.mcp.columns}
            rows={entry.mcp.rows}
            labelWidth="w-[18%]"
          />
          <NoteList notes={entry.mcp.notes} />
          <InlineLink link={entry.mcp.link} />
          <SectionSources
            sourceIds={entry.mcp.sourceIds}
            sources={entry.sources}
          />
        </section>

        <section aria-labelledby="trust-heading" className="pt-16">
          <SectionHeading
            eyebrow="07 / Trust"
            id="trust"
            title={entry.trust.title}
            intro={entry.trust.intro}
          />
          <SectionTable
            caption="What a repository supplies before the folder itself has been trusted, in the two situations where it has not been."
            columns={entry.trust.columns}
            rows={entry.trust.rows}
            labelWidth="w-[34%]"
          />
          <NoteList notes={entry.trust.notes} />
          <InlineLink link={entry.trust.link} />
          <SectionSources
            sourceIds={entry.trust.sourceIds}
            sources={entry.sources}
          />
        </section>

        <section aria-labelledby="install-heading" className="pt-16">
          <SectionHeading
            eyebrow="08 / Rollout"
            id="install"
            title={entry.install.title}
            intro={entry.install.intro}
          />
          <StepList steps={entry.install.steps} />
          <CodeBlock
            label="A team's shared .claude/settings.json"
            value={entry.install.template}
            copy={{
              buttonLabel: "Copy settings.json",
              ariaLabel: "Copy the shared settings file",
              copiedAriaLabel: "Shared settings file copied",
            }}
          />
          <SectionSources
            sourceIds={entry.install.sourceIds}
            sources={entry.sources}
          />
        </section>

        <section aria-labelledby="team-heading" className="pt-16">
          <SectionHeading
            eyebrow="09 / Teams"
            id="team"
            title={entry.team.title}
            intro={entry.team.intro}
          />
          <NoteList notes={entry.team.body} />
          <dl className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-[3px] border border-border bg-border md:grid-cols-2">
            {entry.team.paths.map((path) => (
              <div key={path.label} className="bg-card p-5">
                <dt className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  {path.label}
                </dt>
                <dd className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {path.body}
                </dd>
              </div>
            ))}
          </dl>
          <ul className="mt-7 ml-5 list-disc space-y-3 text-[0.95rem] leading-7 text-muted-foreground">
            {entry.team.limits.map((limit) => (
              <li key={limit} className="pl-1">
                {limit}
              </li>
            ))}
          </ul>
          <InlineLink link={entry.team.link} />
          <div className="mt-8">
            <ResourceCta location="inline" />
          </div>
          <SectionSources
            sourceIds={entry.team.sourceIds}
            sources={entry.sources}
          />
        </section>

        <section aria-labelledby="open-questions-heading" className="pt-16">
          <SectionHeading
            eyebrow="10 / Limits"
            id="open-questions"
            title={entry.openQuestions.title}
            intro={entry.openQuestions.intro}
          />
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {entry.openQuestions.entries.map((item) => (
              <div
                key={item.title}
                className="rounded-[3px] border border-border bg-card p-5"
              >
                <h3 className="text-base font-semibold leading-snug">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
          <SectionSources
            sourceIds={entry.openQuestions.sourceIds}
            sources={entry.sources}
          />
        </section>

        <section aria-labelledby="faq-heading" className="pt-16">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            11 / Questions
          </p>
          <h2
            id="faq-heading"
            className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl"
          >
            Frequently asked questions
          </h2>
          <dl className="mt-7 max-w-3xl space-y-8">
            {entry.faq.map((item) => (
              <div key={item.question}>
                <dt className="font-semibold text-foreground">
                  {item.question}
                </dt>
                <dd className="mt-2 text-[0.95rem] leading-7 text-muted-foreground">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="sources-heading" className="pt-16">
          <h2
            id="sources-heading"
            className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary"
          >
            Sources
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">
              Editorial method:
            </span>{" "}
            every claim about how Claude Code behaves for a team comes from the
            first-party documentation below, fetched on the date at the top of
            this page. Where two Anthropic pages disagree, this page names the
            disagreement instead of picking quietly. Product behavior changes,
            so check the linked pages before you rely on a detail.
          </p>
          <ul className="mt-6 space-y-4">
            {entry.sources.map((source) => (
              <li key={source.id} className="text-sm leading-6">
                <a
                  href={source.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center gap-1.5 font-semibold underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
                >
                  {source.label}
                  <ExternalLinkIcon className="size-3" aria-hidden="true" />
                </a>
                <p className="text-muted-foreground">{source.note}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="related-heading" className="pt-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2
              id="related-heading"
              className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary"
            >
              Keep reading
            </h2>
            <Link
              href={resourcePaths.index}
              className="text-sm font-semibold text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
            >
              View all resources
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            {entry.related.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex flex-col rounded-[3px] border border-border bg-card p-5 transition-colors hover:border-primary/70"
              >
                <span className="text-base font-semibold leading-snug transition-colors group-hover:text-primary">
                  {link.label}
                </span>
                <span className="mt-2 text-sm leading-6 text-muted-foreground">
                  {link.description}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16 border-t border-border py-14 text-center md:py-16">
          <p className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Put your team's AI skills somewhere everyone can find them.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Free forever, MIT licensed, and open source. Create a library, save
            the first skill, and invite the people who keep asking which one to
            use.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <ResourceCta location="closing" />
            <a
              href={siteConfig.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
            >
              View the code on GitHub
              <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
            </a>
          </div>
        </section>
      </div>
    </>
  )
}
