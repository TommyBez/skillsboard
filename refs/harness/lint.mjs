// Pass/fail gate over refs/harness/audit.mjs. Run it after every change, not
// at the end: the point is to catch a regression the moment it lands, while
// the diff that caused it is still on screen.
//
//   node refs/harness/lint.mjs [url] [flags]
//     --config path.json   thresholds (default refs/harness/lint.config.json)
//     --in path.json       lint an existing audit report instead of running one
//     --out path.json      where the fresh audit report goes
//     --suggest            print the measured numbers shaped as a config block
//
// Exits 1 on any failing rule, 0 when everything is inside its threshold.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const argv = process.argv.slice(2)
const VALUE_FLAGS = ['--config', '--in', '--out']
const url = argv.find((a, i) => !a.startsWith('--') && !VALUE_FLAGS.includes(argv[i - 1]))
function flag(name, fallback) {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 ? argv[i + 1] : fallback
}
const configPath = resolve(flag('config', 'refs/harness/lint.config.json'))
const config = JSON.parse(readFileSync(configPath, 'utf8'))
const inPath = flag('in', null)
const outPath = resolve(flag('out', 'refs/harness/out/audit.json'))
const suggest = argv.includes('--suggest')

let report
if (inPath) {
  report = JSON.parse(readFileSync(resolve(inPath), 'utf8'))
} else {
  const target = url || config.url
  // A generous cap: exemptions are matched against the item lists, so a list
  // truncated at the default 25 would make them silently incomplete.
  const args = ['refs/harness/audit.mjs', target, '--out', outPath, '--quiet', '--cap', '300']
  for (const vp of config.viewports) args.push('--viewport', vp)
  args.push('--scheme', config.schemes.length > 1 ? 'both' : config.schemes[0])
  const res = spawnSync(process.execPath, args, {
    stdio: ['ignore', 'inherit', 'inherit'],
    env: { ...process.env, NODE_USE_ENV_PROXY: '1' },
  })
  if (res.status !== 0) {
    console.error('lint: audit run failed')
    process.exit(2)
  }
  report = JSON.parse(readFileSync(outPath, 'utf8'))
}

// Each rule reads one number out of a run and compares it to a ceiling.
// `items` lets a rule be scoped: a selector fragment listed under `exempt` in
// the config subtracts the matching findings from the count. That is the only
// sanctioned way to forgive a defect — it is written down, it names what is
// forgiven, and the audit still reports it in full. A raised ceiling would hide
// the next, different defect underneath the same number.
const RULES = {
  proseClippedPastViewport: {
    label: 'elements carrying copy past the viewport edge',
    read: (r) => r.overflow.counts.text,
    items: (r) => r.overflow.text,
  },
  documentHorizontalOverflowPx: {
    label: 'horizontal document overflow (px)',
    read: (r) => r.overflow.documentOverflowPx,
  },
  textSlicedByClip: {
    label: 'text sliced by an overflow:hidden box',
    read: (r) => r.truncation.counts.sliced,
    items: (r) => r.truncation.clipped.filter((c) => c.category === 'sliced'),
  },
  ellipsisTruncation: {
    label: 'strings truncated with an ellipsis',
    read: (r) => r.truncation.counts.ellipsis,
    items: (r) => r.truncation.ellipsis,
  },
  invisibleText: {
    label: 'invisible text after a full scroll pass',
    read: (r) => r.invisibleText.count,
    items: (r) => r.invisibleText.items,
  },
  smallTapTargets: {
    label: 'interactive targets under 44px',
    read: (r) => r.tapTargets.count,
    items: (r) => r.tapTargets.items,
  },
  bodyContrastFailures: {
    label: 'body text under 4.5:1',
    read: (r) => r.contrast.bodyFailureCount,
  },
  contrastFailures: {
    label: 'text under its required ratio',
    read: (r) => r.contrast.failureCount,
  },
  typeCombinations: {
    label: 'distinct type combinations',
    read: (r) => r.type.combinations,
  },
  focusWithoutIndicator: {
    label: 'focusable elements with no visible focus indicator',
    read: (r) => r.focus.noVisibleIndicator.length,
    items: (r) => r.focus.noVisibleIndicator,
  },
  voidPctOfDocument: {
    label: 'share of the document that is a flat void band (%)',
    read: (r) => (r.voids && !r.voids.error ? r.voids.voidPctOfDocument : 0),
  },
  accentPerViewport: {
    label: 'accent-coloured elements in the busiest viewport',
    read: (r) => r.accent.maxPerViewport,
  },
}

function limitsFor(run) {
  return { ...config.defaults, ...(config.perViewport?.[run.viewport] || {}) }
}

const failures = []
const lines = []
const actuals = {}

for (const run of report.runs) {
  const key = `${run.viewport} ${run.scheme}`
  lines.push(`\n${key}`)
  actuals[run.viewport] = actuals[run.viewport] || {}

  // A run that never rendered properly cannot be graded — treat it as a hard
  // failure rather than letting a clean-looking audit of unstyled HTML pass.
  if (!run.navOk) {
    failures.push(`${key}: navigation failed`)
    lines.push('  FAIL  navigation failed')
    continue
  }
  if (run.health?.unstyled) {
    failures.push(`${key}: page loaded unstyled (${run.health.styleSheets} stylesheets)`)
    lines.push('  FAIL  page loaded unstyled — audit numbers are not about the real page')
    continue
  }

  const limits = limitsFor(run)
  for (const [name, rule] of Object.entries(RULES)) {
    const limit = limits[name]
    const raw = rule.read(run)
    const patterns = config.exempt?.[name] || []
    let exempted = 0
    if (patterns.length && rule.items) {
      const list = rule.items(run)
      if (list.length < raw) {
        lines.push(`  note  ${rule.label}: only ${list.length} of ${raw} findings kept — raise --cap before trusting exemptions`)
      }
      exempted = list.filter((it) =>
        patterns.some((p) => `${it.selector || ''} ${it.clippedBy || ''}`.includes(p)),
      ).length
    }
    const actual = Math.max(0, raw - exempted)
    actuals[run.viewport][name] = Math.max(actuals[run.viewport][name] ?? 0, actual)
    if (limit === undefined || limit === null) continue
    const ok = actual <= limit
    if (!ok) failures.push(`${key}: ${rule.label} = ${actual} (max ${limit})`)
    const suffix = exempted ? `  (${exempted} exempted by config)` : ''
    lines.push(`  ${ok ? 'pass' : 'FAIL'}  ${String(actual).padStart(5)} / ${String(limit).padEnd(5)} ${rule.label}${suffix}`)
  }
}

// The first six examples of whatever broke, so the gate is actionable without
// opening the JSON.
if (failures.length) {
  lines.push('\nEvidence')
  for (const run of report.runs) {
    const key = `${run.viewport} ${run.scheme}`
    for (const o of run.overflow.text.slice(0, 4)) {
      lines.push(`  ${key} +${o.overshootPx}px past edge  <${o.tag}> "${o.text.slice(0, 60)}"  ${o.selector.split(' > ').slice(-2).join(' > ')}`)
    }
    for (const t of (run.truncation.clipped || []).filter((c) => c.category === 'sliced').slice(0, 3)) {
      lines.push(`  ${key} -${t.hiddenPx}px ${t.axis} sliced  "${t.text.slice(0, 60)}"`)
    }
    for (const t of run.invisibleText.items.slice(0, 3)) {
      lines.push(`  ${key} invisible (${t.reasons.join(', ')})  "${t.text.slice(0, 60)}"`)
    }
    for (const c of run.contrast.failures.filter((f) => !f.large).slice(0, 3)) {
      lines.push(`  ${key} ${c.ratio}:1  ${c.fg} on ${c.bg}  "${c.text.slice(0, 40)}"`)
    }
    for (const f of run.focus.noVisibleIndicator.slice(0, 3)) {
      lines.push(`  ${key} no focus ring  <${f.tag}> ${f.label || f.selector}`)
    }
  }
}

console.log(`LINT ${report.url}${lines.join('\n')}`)
if (suggest) {
  console.log('\nmeasured (config-shaped):')
  console.log(JSON.stringify({ perViewport: actuals }, null, 2))
}
if (failures.length) {
  console.log(`\n${failures.length} failing rule${failures.length === 1 ? '' : 's'}:`)
  for (const f of failures) console.log(`  - ${f}`)
  process.exit(1)
}
console.log('\nall rules pass')
