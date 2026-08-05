import { GitForkIcon, LinkIcon, SearchIcon } from "lucide-react"


/**
 * Three purpose-built micro-diagrams for the workflow chapter. Each one is
 * assembled from real product vocabulary (a pasted GitHub URL, the SkillDossier
 * card, the team search field, the four consumption routes) rather than stock
 * illustration, and each is decorative — the step copy carries the message, so
 * the whole visual is aria-hidden.
 *
 * Every column is built from the same three registers, and they share grid rows
 * with their neighbours, so the three diagrams line up register for register:
 *
 *   1. a captioned rule   (`URL -> SKILL` + hairline to the column's edge)
 *   2. the diagram body   (absorbs all the slack, so the three bottom out level)
 *   3. a key/value readout (a second captioned rule, closing the column)
 *
 * They also share two vertical axes inside the column: `--axis-mark` — the
 * centre of the leading glyph in each column's opening control, which is also
 * where the connectors hang — and `--row-pad`, where every row's text starts.
 *
 * All three are pure markup + CSS. They render in their finished, composed
 * state by default; `app/styles/landing/flow.css` only re-stages them when the shared
 * motion controller has armed the `flow` group, so no-JS and reduced-motion
 * viewers get the resting diagram with nothing hidden.
 */

/** A caption followed by a hairline that runs to the column's right edge. */
function VizLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="lp-flow-viz-label" aria-hidden="true">
      <span className="lp-flow-label-text">{children}</span>
      <span className="lp-flow-label-rule" />
    </p>
  )
}

/** The same object, closing the column: one measured fact about the diagram. */
function VizFoot({ label, value }: { label: string; value: string }) {
  return (
    <p className="lp-flow-viz-label lp-flow-viz-foot" aria-hidden="true">
      <span className="lp-flow-label-text">{label}</span>
      <span className="lp-flow-label-rule" />
      <span className="lp-flow-foot-val">{value}</span>
    </p>
  )
}

const Arrow = () => <span className="inline-block mx-[0.12em] tracking-[-0.06em]">{"->"}</span>

/* 01 — a pasted GitHub URL resolving into a populated skill card. */
export function PasteResolveVisual() {
  return (
    <>
      <VizLabel>
        url <Arrow /> skill
      </VizLabel>
      <div className="lp-flow-viz-body" aria-hidden="true">
        <div className="lp-flow-paste-field">
          <span className="lp-flow-paste-flash" />
          <LinkIcon className="lp-flow-ctrl-icon" aria-hidden="true" />
          <span className="lp-flow-paste-url">
            <span className="lp-flow-paste-dim">github.com/</span>
            anthropics/skills
          </span>
        </div>

        <span className="relative block flex-1 min-h-[2.6rem]">
          <span className="lp-flow-paste-wire">
            <span className="lp-flow-paste-wire-head" />
          </span>
          <span className="lp-flow-paste-wire-note">resolve</span>
        </span>

        <div className="lp-flow-mini-card">
          <div className="lp-flow-mini-body">
            <div className="lp-flow-mini-meta">
              <span className="lp-flow-mini-source">
                <GitForkIcon className="lp-flow-mini-fork" aria-hidden="true" />
                anthropics/skills
              </span>
              <span className="lp-flow-mini-stars">8.4k stars</span>
            </div>
            <p className="lp-flow-mini-name">pdf-extraction</p>
            <p className="lp-flow-mini-desc">
              Pull text, tables, and metadata from PDF documents.
            </p>
            <div className="lp-flow-mini-tags">
              <span className="lp-flow-mini-tag">documents</span>
              <span className="lp-flow-mini-tag">parsing</span>
            </div>
          </div>
          <div className="lp-flow-mini-foot">
            <code className="lp-flow-mini-cmd">
              npx skills add anthropics/skills --skill pdf-extraction
            </code>
          </div>
        </div>
      </div>
      {/* All three readouts carry a six-character key and a six-character
          value, so the three leader rules start and stop on the same x. */}
      <VizFoot label="fields" value="4 kept" />
    </>
  )
}

/* 02 — a query filtering the team library down to one match. */
const libraryRows = [
  { name: "code-review", repo: "acme/engineering" },
  { name: "brand-voice", repo: "acme/brand-kit" },
  { name: "sql-migrations", repo: "drizzle-team" },
  { name: "release-notes", repo: "vercel/skills" },
] as const

export function SearchFilterVisual() {
  return (
    <>
      <VizLabel>
        query <Arrow /> match
      </VizLabel>
      <div className="lp-flow-viz-body" aria-hidden="true">
        <div className="lp-flow-search-field">
          <SearchIcon className="lp-flow-ctrl-icon" aria-hidden="true" />
          <span className="lp-flow-search-query-wrap">
            <span className="lp-flow-search-query">pdf</span>
            <span className="lp-flow-search-caret" />
          </span>
        </div>

        <ul className="lp-flow-result-list">
          <li className="lp-flow-result-row" data-match="true">
            <span className="lp-flow-result-name">
              <span className="lp-flow-result-mark">pdf</span>-extraction
            </span>
            <span className="lp-flow-result-repo">anthropics/skills</span>
          </li>
        </ul>

        <p className="lp-flow-viz-label lp-flow-result-cut" aria-hidden="true">
          <span className="lp-flow-label-text">filtered out</span>
          <span className="lp-flow-label-rule" />
        </p>

        <ul className="lp-flow-result-list lp-flow-result-rest">
          {libraryRows.map((row) => (
            <li key={row.name} className="lp-flow-result-row" data-match="false">
              <span className="lp-flow-result-name">{row.name}</span>
              <span className="lp-flow-result-repo">{row.repo}</span>
            </li>
          ))}
        </ul>
      </div>
      <VizFoot label="result" value="1 / 24" />
    </>
  )
}

/* 03 — one saved skill branching into the four ways out of Skills Board. */
const routes = [
  { key: "source", value: "anthropics/skills" },
  { key: "install", value: "npx skills add" },
  { key: "zip", value: "skill.zip · 12 kB" },
  { key: "mcp", value: "tools/get_skill" },
] as const

export function RouteFanVisual() {
  return (
    <>
      <VizLabel>
        skill <Arrow /> routes
      </VizLabel>
      <div className="lp-flow-viz-body" aria-hidden="true">
        <p className="lp-flow-fan-node">
          <GitForkIcon className="lp-flow-ctrl-icon" aria-hidden="true" />
          pdf-extraction
        </p>
        <span className="lp-flow-fan-stem" />
        <ul className="lp-flow-fan-list">
          {routes.map((route) => (
            <li key={route.key} className="lp-flow-fan-row">
              <span className="lp-flow-fan-key">{route.key}</span>
              <span className="lp-flow-fan-val">{route.value}</span>
            </li>
          ))}
        </ul>
      </div>
      <VizFoot label="routes" value="4 open" />
    </>
  )
}
