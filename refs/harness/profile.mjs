// Design-system profiler. Extracts a comparable numeric profile from any URL so
// ours and the references can be put side by side as numbers rather than
// impressions.
//
//   ./refs/harness/run.sh profile.mjs <url> <label> [--out dir] [--dark]
//   ./refs/harness/run.sh profile.mjs --compare <a.json> <b.json> ... [--out file.md]
//
// Why numbers: every conclusion we had about these three references was a
// critic's opinion formed from one squashed full-page image. When the art
// director hand-measured type sizes and section padding instead, those numbers
// turned out to be the most useful artefacts of the project. This automates
// that measurement.
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { launchBrowser, openPage, settle, getSections, VIEWPORTS } from './lib.mjs'

const argv = process.argv.slice(2)
const VALUE_FLAGS = ['--out']
const flag = (name, def = null) => {
  const i = argv.indexOf(name)
  return i >= 0 ? argv[i + 1] : def
}
const has = (name) => argv.includes(name)
const positional = argv.filter(
  (a, i) => !a.startsWith('--') && !VALUE_FLAGS.includes(argv[i - 1]),
)

// ---------------------------------------------------------------------------
// Measurement — everything below MEASURE_FN runs inside the page.
// ---------------------------------------------------------------------------

// Returns the full profile for the current viewport. Must be called only after
// the page has been settled (scroll walk complete, back at top), otherwise
// scroll-revealed elements are still at opacity:0 and drop out of every count.
const MEASURE_FN = async function measure([vpW, vpH]) {
  const round = (n, p = 2) => Math.round(n * 10 ** p) / 10 ** p
  const bump = (map, key, by = 1) => map.set(key, (map.get(key) || 0) + by)
  const sortDesc = (map) => [...map.entries()].sort((a, b) => b[1] - a[1])

  // Split a computed multi-value list on top-level commas only. Naive
  // `.split(', ')` shreds `cubic-bezier(0.4, 0, 0.2, 1)` into four bogus
  // easings — which is exactly the kind of silent corruption that makes a
  // measured comparison worse than no comparison.
  const splitTop = (s) => {
    const out = []
    let depth = 0, cur = ''
    for (const ch of s || '') {
      if (ch === '(') depth++
      else if (ch === ')') depth--
      if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = '' } else cur += ch
    }
    if (cur.trim()) out.push(cur.trim())
    return out
  }

  // -- colour helpers -------------------------------------------------------
  // Chromium serialises computed colours in their authored colour space, so a
  // Tailwind v4 / oklch codebase hands back `lab(5.4 -3.9 1.7)` and a regex
  // over `rgb()` silently finds zero colours. Rasterising one pixel is the
  // only conversion that is correct for every space the browser accepts.
  const colorCanvas = document.createElement('canvas')
  colorCanvas.width = colorCanvas.height = 1
  const cctx = colorCanvas.getContext('2d', { willReadFrequently: true })
  const colorMemo = new Map()
  const parseColor = (s) => {
    if (!s || s === 'none' || s === 'transparent') return null
    if (colorMemo.has(s)) return colorMemo.get(s)
    let out = null
    try {
      cctx.clearRect(0, 0, 1, 1)
      cctx.fillStyle = '#000'
      cctx.fillStyle = s
      cctx.fillRect(0, 0, 1, 1)
      const [r, g, b, a] = cctx.getImageData(0, 0, 1, 1).data
      out = a === 0 ? { r: 0, g: 0, b: 0, a: 0 } : { r, g, b, a: a / 255 }
    } catch { out = null }
    colorMemo.set(s, out)
    return out
  }
  const toHsl = ({ r, g, b }) => {
    const R = r / 255, G = g / 255, B = b / 255
    const max = Math.max(R, G, B), min = Math.min(R, G, B), d = max - min
    let h = 0
    if (d) {
      if (max === R) h = ((G - B) / d) % 6
      else if (max === G) h = (B - R) / d + 2
      else h = (R - G) / d + 4
      h *= 60
      if (h < 0) h += 360
    }
    const l = (max + min) / 2
    const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
    return { h: round(h, 1), s: round(s, 3), l: round(l, 3) }
  }
  const toHex = ({ r, g, b }) =>
    '#' + [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, '0')).join('')

  // -- element sweep --------------------------------------------------------
  const layoutW = document.documentElement.clientWidth
  const all = [...document.querySelectorAll('body *')]
  const type = new Map()
  const textColor = new Map()
  const bgColor = new Map()
  const borderColor = new Map()
  const radii = new Map()
  const shadows = new Map()
  const transitions = new Map()
  const animations = new Map()
  const maxWidths = new Map()
  const fonts = new Map()
  const colorUsers = new Map() // colour -> element count, for accent frequency
  const inkRects = []
  const textRects = []
  let textLeft = Infinity, textRight = -Infinity, visibleCount = 0

  const docH = Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight,
  )

  for (const el of all) {
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden') continue
    if (parseFloat(cs.opacity) === 0) continue
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) continue
    const fixed = cs.position === 'fixed'
    const top = r.top + window.scrollY
    visibleCount++

    // Type ramp: only elements that own a non-empty text node, so a wrapper
    // div does not inherit-and-double-count its child's ramp entry.
    const ownText = [...el.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent)
      .join('')
      .trim()
    if (ownText) {
      const size = round(parseFloat(cs.fontSize), 1)
      const fam = (cs.fontFamily || '').split(',')[0].replace(/["']/g, '').trim()
      const lh = cs.lineHeight === 'normal' ? 'normal' : round(parseFloat(cs.lineHeight) / size, 2)
      const trackPx = cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing) || 0
      const track = round(trackPx / size, 3)
      const key = JSON.stringify({ size, weight: Number(cs.fontWeight), fam, lh, track })
      bump(type, key)
      bump(fonts, fam)
      const c = parseColor(cs.color)
      if (c && c.a > 0.05) {
        bump(textColor, cs.color, ownText.length)
        bump(colorUsers, cs.color)
      }
      // Only text that is actually on stage defines the content box. Marquee
      // belts and carousel tracks park copy hundreds of pixels off both edges,
      // which made Linear report a 1,515px content width and a *negative*
      // right gutter inside a 1,440px viewport.
      if (!fixed && r.left >= -1 && r.right <= layoutW + 1) {
        textLeft = Math.min(textLeft, r.left)
        textRight = Math.max(textRight, r.right)
      }
    }

    const bg = parseColor(cs.backgroundColor)
    if (bg && bg.a > 0.02) {
      bump(bgColor, cs.backgroundColor, Math.round(r.width * r.height))
      bump(colorUsers, cs.backgroundColor)
    }
    const bw = ['Top', 'Right', 'Bottom', 'Left'].map((s) => parseFloat(cs[`border${s}Width`]) || 0)
    if (bw.some((w) => w > 0)) {
      const bc = parseColor(cs.borderTopColor)
      if (bc && bc.a > 0.02) {
        bump(borderColor, cs.borderTopColor, 1)
        bump(colorUsers, cs.borderTopColor)
      }
    }
    if (cs.borderRadius && cs.borderRadius !== '0px') bump(radii, cs.borderRadius)
    if (cs.boxShadow && cs.boxShadow !== 'none') bump(shadows, cs.boxShadow)
    if (cs.maxWidth && cs.maxWidth.endsWith('px') && parseFloat(cs.maxWidth) > 320) {
      bump(maxWidths, cs.maxWidth)
    }

    // Motion as actually computed on live nodes (as opposed to declared in CSS
    // and never matched by anything).
    const tDur = splitTop(cs.transitionDuration)
    const tEase = splitTop(cs.transitionTimingFunction)
    const tProp = splitTop(cs.transitionProperty)
    tDur.forEach((d, i) => {
      const ms = Math.round(parseFloat(d) * 1000)
      // Bucket by duration+easing, not by property: "0.16s easeOutQuad ×72" is
      // the shape of a design system, the property list is noise.
      if (ms > 0 && (tProp[i] ?? tProp[0]) !== 'none') bump(transitions, `${ms}ms ${tEase[i] ?? tEase[0]}`)
    })
    const aDur = splitTop(cs.animationDuration)
    const aEase = splitTop(cs.animationTimingFunction)
    const aName = splitTop(cs.animationName)
    aDur.forEach((d, i) => {
      const ms = Math.round(parseFloat(d) * 1000)
      if (ms > 0 && aName[i] !== 'none') bump(animations, `${ms}ms ${aEase[i] ?? aEase[0]}`)
    })

    // Ink: anything that actually puts marks on the page. Used for the
    // content-to-void ratio, so backgrounds alone do not count as content.
    // A wrapper that spans essentially the whole document says nothing about
    // local density: one bordered full-height <main> made input-otp report
    // "100% content, one ink band, zero void" for a 9,762px page.
    const isPageWrapper = r.height > docH * 0.9
    if (!fixed && !isPageWrapper && top + r.height > 0) {
      const isMedia = ['IMG', 'SVG', 'CANVAS', 'VIDEO', 'PICTURE'].includes(el.tagName)
      const hasBgImage = cs.backgroundImage && cs.backgroundImage !== 'none'
      // Two thresholds, because they answer different questions. "Ink" counts
      // a bordered card as content (it is a made thing). "Substance" counts
      // only text and media — that is the measure that catches a section which
      // is mostly a big empty outlined box.
      if (ownText || isMedia) textRects.push([top, top + r.height])
      if (ownText || isMedia || hasBgImage || bw.some((w) => w > 0)) inkRects.push([top, top + r.height])
    }
  }

  // -- union of intervals -> content / void --------------------------------
  const union = (rects) => {
    const sorted = [...rects].sort((a, b) => a[0] - b[0])
    const merged = []
    for (const [s, e] of sorted) {
      const last = merged[merged.length - 1]
      if (last && s <= last[1] + 1) last[1] = Math.max(last[1], e)
      else merged.push([s, e])
    }
    let covered = 0
    let longestVoid = { px: 0, at: 0 }
    let cursor = 0
    for (const [s, e] of merged) {
      if (s - cursor > longestVoid.px) longestVoid = { px: Math.round(s - cursor), at: Math.round(cursor) }
      covered += Math.min(e, docH) - Math.max(s, 0)
      cursor = Math.max(cursor, e)
    }
    if (docH - cursor > longestVoid.px) longestVoid = { px: Math.round(docH - cursor), at: Math.round(cursor) }
    return { bands: merged.length, covered, longestVoid }
  }
  const ink = union(inkRects)
  const substance = union(textRects)
  const merged = ink.bands
  const covered = ink.covered
  const longestVoid = ink.longestVoid

  // -- stylesheets ----------------------------------------------------------
  // Declared motion, which computed styles cannot see: keyframe bodies, curves
  // used only by rules that have not matched yet, linear() springs.
  let cssText = ''
  let keyframes = 0
  const pending = new Set()
  for (const sheet of [...document.styleSheets]) {
    try {
      for (const rule of sheet.cssRules) {
        cssText += rule.cssText + '\n'
        if (rule.constructor.name === 'CSSKeyframesRule') keyframes++
      }
    } catch {
      // Deduped: the same href can appear twice in document.styleSheets, and
      // counting its @keyframes twice would inflate the headline number.
      if (sheet.href) pending.add(sheet.href)
    }
  }
  for (const href of pending) {
    // Cross-origin sheets throw on .cssRules; refetching goes through the same
    // request interception the page load did, so the text is available.
    try {
      const res = await fetch(href)
      const t = await res.text()
      cssText += t + '\n'
      keyframes += (t.match(/@(-\w+-)?keyframes\s/g) || []).length
    } catch { /* nothing to be done; counted as unavailable below */ }
  }
  const inlineStyleText = [...document.querySelectorAll('style')].map((s) => s.textContent).join('\n')
  if (!cssText.includes('@keyframes')) cssText += inlineStyleText

  const beziers = new Map()
  for (const m of cssText.matchAll(/cubic-bezier\(\s*[-\d.,\s]+\)/g)) bump(beziers, m[0].replace(/\s+/g, ''))
  const springs = new Set()
  for (const m of cssText.matchAll(/linear\(\s*[-\d.%,\s]+\)/g)) springs.add(m[0].slice(0, 60))
  const declaredDurations = new Map()
  for (const m of cssText.matchAll(/(?:transition|animation)(?:-duration)?\s*:[^;}]+/g)) {
    for (const d of m[0].matchAll(/(\d*\.?\d+)(ms|s)\b/g)) {
      const ms = Math.round(parseFloat(d[1]) * (d[2] === 's' ? 1000 : 1))
      if (ms > 0) bump(declaredDurations, `${ms}ms`)
    }
  }

  // -- palette summary ------------------------------------------------------
  const paletteOf = (map, role, top) =>
    sortDesc(map)
      .slice(0, top)
      .map(([css, weight]) => {
        const c = parseColor(css)
        const hsl = toHsl(c)
        return { role, css, hex: toHex(c), alpha: round(c.a, 2), ...hsl, weight, users: colorUsers.get(css) || 0 }
      })
  const palette = [
    ...paletteOf(bgColor, 'background', 10),
    ...paletteOf(textColor, 'text', 8),
    ...paletteOf(borderColor, 'border', 6),
  ]
  // "Hues that carry meaning": saturated, non-transparent, not near-black or
  // near-white. Bucketed at 30 degrees so #5e6ad2 and #6470d8 are one hue.
  const hueBuckets = new Map()
  for (const c of palette) {
    if (c.s < 0.15 || c.alpha < 0.2 || c.l < 0.06 || c.l > 0.96) continue
    bump(hueBuckets, Math.floor(c.h / 30) * 30, c.weight)
  }
  const chromatic = palette.filter((c) => c.s >= 0.25 && c.alpha >= 0.3 && c.l > 0.1 && c.l < 0.95)
  const accent = chromatic.sort((a, b) => b.users - a.users)[0] || null
  const screens = docH / vpH

  const typeRamp = sortDesc(type).map(([k, count]) => ({ ...JSON.parse(k), count }))
  typeRamp.sort((a, b) => b.size - a.size || b.count - a.count)

  // A page that failed to load produces a clean-looking profile of nothing —
  // one run reported Linear as "900px, 3 type combinations, 1 section" and
  // would have gone straight into the comparison table as fact.
  const health = { ok: true, reasons: [] }
  if (cssText.length < 3000) health.reasons.push('almost no CSS read — stylesheets may have failed')
  if (docH <= vpH * 1.15) health.reasons.push(`document is only ${Math.round(docH)}px — content likely never rendered`)
  if (visibleCount < 80) health.reasons.push(`only ${visibleCount} visible elements`)
  if (typeRamp.length < 5) health.reasons.push(`only ${typeRamp.length} type combinations`)
  health.ok = health.reasons.length === 0

  return {
    health,
    viewport: { width: vpW, height: vpH },
    document: {
      heightPx: Math.round(docH),
      screens: round(screens, 2),
      visibleElements: visibleCount,
      contentRatio: round(covered / docH, 3),
      substanceRatio: round(substance.covered / docH, 3),
      inkBands: merged,
      longestVoidPx: longestVoid.px,
      longestVoidAt: longestVoid.at,
      longestVoidScreens: round(longestVoid.px / vpH, 2),
      longestSubstanceVoidPx: substance.longestVoid.px,
      longestSubstanceVoidAt: substance.longestVoid.at,
      longestSubstanceVoidScreens: round(substance.longestVoid.px / vpH, 2),
    },
    type: {
      combinations: typeRamp.length,
      above24px: typeRamp.filter((t) => t.size > 24).length,
      above32px: typeRamp.filter((t) => t.size > 32).length,
      largestPx: typeRamp[0]?.size ?? 0,
      smallestPx: typeRamp[typeRamp.length - 1]?.size ?? 0,
      distinctSizes: new Set(typeRamp.map((t) => t.size)).size,
      distinctWeights: [...new Set(typeRamp.map((t) => t.weight))].sort((a, b) => a - b),
      families: sortDesc(fonts).map(([f, n]) => ({ family: f, count: n })),
      ramp: typeRamp,
    },
    container: {
      // Layout width, not viewport width — a classic scrollbar steals ~15px and
      // would otherwise show up as a phantom asymmetric gutter.
      layoutWidthPx: layoutW,
      textLeftPx: Number.isFinite(textLeft) ? Math.round(textLeft) : null,
      textRightPx: Number.isFinite(textRight) ? Math.round(textRight) : null,
      contentWidthPx: Number.isFinite(textLeft) ? Math.round(textRight - textLeft) : null,
      gutterLeftPx: Number.isFinite(textLeft) ? Math.round(textLeft) : null,
      gutterRightPx: Number.isFinite(textRight)
        ? Math.round(layoutW - textRight)
        : null,
      declaredMaxWidths: sortDesc(maxWidths).slice(0, 6).map(([w, n]) => ({ value: w, count: n })),
    },
    color: {
      distinctColors: bgColor.size + textColor.size + borderColor.size,
      meaningfulHues: hueBuckets.size,
      hueBuckets: sortDesc(hueBuckets).map(([h, w]) => ({ hueBucket: `${h}-${h + 30}`, weight: w })),
      accent: accent && {
        hex: accent.hex,
        css: accent.css,
        hue: accent.h,
        sat: accent.s,
        users: accent.users,
        perScreen: round(accent.users / screens, 2),
      },
      palette,
    },
    shape: {
      distinctRadii: radii.size,
      radii: sortDesc(radii).slice(0, 10).map(([v, n]) => ({ value: v, count: n })),
      distinctShadows: shadows.size,
      maxShadowLayers: Math.max(0, ...[...shadows.keys()].map((s) => s.split(/,(?![^(]*\))/).length)),
      shadows: sortDesc(shadows).slice(0, 8).map(([v, n]) => ({
        value: v.length > 150 ? v.slice(0, 150) + '…' : v,
        layers: v.split(/,(?![^(]*\))/).length,
        count: n,
      })),
    },
    motion: {
      computedTransitionBuckets: sortDesc(transitions).filter(([k]) => !k.startsWith('prop:')).slice(0, 14)
        .map(([k, n]) => ({ spec: k, count: n })),
      computedAnimationBuckets: sortDesc(animations).slice(0, 10).map(([k, n]) => ({ spec: k, count: n })),
      distinctComputedTransitions: [...transitions.keys()].filter((k) => !k.startsWith('prop:')).length,
      keyframes,
      distinctBeziers: beziers.size,
      topBeziers: sortDesc(beziers).slice(0, 8).map(([v, n]) => ({ curve: v, count: n })),
      linearSprings: springs.size,
      distinctDeclaredDurations: declaredDurations.size,
      topDeclaredDurations: sortDesc(declaredDurations).slice(0, 10).map(([v, n]) => ({ value: v, count: n })),
      cssBytesRead: cssText.length,
      refetchedSheets: pending.size,
    },
  }
}

async function profileSite() {
  const [url, label] = positional
  if (!url || !label) {
    console.error('usage: profile.mjs <url> <label> [--out dir] [--dark]')
    process.exit(1)
  }
  const outDir = flag('--out', 'refs/harness/out')
  mkdirSync(outDir, { recursive: true })

  const browser = await launchBrowser()
  const result = { label, url, capturedAt: new Date().toISOString(), viewports: {} }

  for (const vp of [VIEWPORTS.desktop, VIEWPORTS.mobile]) {
    // One retry on a bad load. Reference hosts intermittently hand back a stub
    // or an interstitial, and a silently-empty profile in the comparison table
    // is worse than no profile at all.
    for (let attempt = 1; attempt <= 2; attempt++) {
      const { ctx, page } = await openPage(browser, url, vp, {
        dark: has('--dark'),
        deviceScaleFactor: 1, // nothing is rasterised here, and 1 keeps memory sane
      })
      await settle(page, vp)
      const profile = await page.evaluate(MEASURE_FN, [vp.width, vp.height]).catch((e) => {
        console.error(`[${vp.name}] measure failed: ${e.message.split('\n')[0]}`)
        return null
      })
      const sections = await getSections(page, vp).catch(() => [])
      await ctx.close()
      if (!profile) continue
      result.viewports[vp.name] = { ...profile, sections: rhythm(sections, vp) }
      console.log(
        `[${label}/${vp.name}] ${profile.document.heightPx}px, ` +
          `${profile.type.combinations} type combos, ${sections.length} sections` +
          (profile.health.ok ? '' : `  ⚠ SUSPECT: ${profile.health.reasons.join('; ')}`),
      )
      if (profile.health.ok) break
      if (attempt === 1) console.error(`[${label}/${vp.name}] retrying…`)
    }
  }
  await browser.close()

  const out = `${outDir}/profile-${label}.json`
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, JSON.stringify(result, null, 2))
  console.log(`wrote ${out}`)
}

// Section rhythm derived outside the page so the segmentation function stays
// shared with sections.mjs and does no arithmetic of its own.
function rhythm(sections, vp) {
  const heights = sections.map((s) => s.height)
  const gaps = []
  for (let i = 1; i < sections.length; i++) {
    gaps.push(sections[i].top - (sections[i - 1].top + sections[i - 1].height))
  }
  const stat = (xs) => {
    if (!xs.length) return { n: 0 }
    const mean = xs.reduce((a, b) => a + b, 0) / xs.length
    const sd = Math.sqrt(xs.reduce((a, b) => a + (b - mean) ** 2, 0) / xs.length)
    const sorted = [...xs].sort((a, b) => a - b)
    return {
      n: xs.length,
      min: Math.round(sorted[0]),
      median: Math.round(sorted[Math.floor(xs.length / 2)]),
      max: Math.round(sorted[xs.length - 1]),
      mean: Math.round(mean),
      sd: Math.round(sd),
      // Coefficient of variation: "how much does the rhythm vary" in one
      // number, comparable across pages of different absolute scale.
      cv: mean ? Math.round((sd / mean) * 100) / 100 : 0,
    }
  }
  const pads = sections.map((s) => s.padTop + s.padBottom)
  return {
    count: sections.length,
    heights: stat(heights),
    heightsInScreens: heights.map((h) => Math.round((h / vp.height) * 100) / 100),
    gaps: stat(gaps),
    internalPadding: stat(pads.filter((p) => p > 0)),
    list: sections.map((s, i) => ({ i, ...s })),
  }
}

// ---------------------------------------------------------------------------
// Comparison renderer — the point of the whole exercise: four sites, one table.
// ---------------------------------------------------------------------------
function renderComparison() {
  const files = argv.filter(
    (a, i) => a.endsWith('.json') && !VALUE_FLAGS.includes(argv[i - 1]),
  )
  const outFile = flag('--out')
  const sites = files.map((f) => ({ file: f, ...JSON.parse(readFileSync(f, 'utf8')) }))
  if (!sites.length) {
    console.error('usage: profile.mjs --compare <a.json> <b.json> ... [--out file.md]')
    process.exit(1)
  }

  const fmt = (v) => (v === null || v === undefined ? '—' : typeof v === 'number' ? String(v) : String(v))
  const rows = [
    ['**Page**', null],
    ['Document height', (v) => `${v.document.heightPx}px`],
    ['Screens tall', (v) => `${v.document.screens}`],
    ['Content : void (ink)', (v) => `${Math.round(v.document.contentRatio * 100)}%`],
    ['Content : void (text+media)', (v) => `${Math.round(v.document.substanceRatio * 100)}%`],
    ['Longest empty run', (v) => `${v.document.longestVoidPx}px (${v.document.longestVoidScreens} screens)`],
    ['Longest text-free run', (v) =>
      `${v.document.longestSubstanceVoidPx}px @${v.document.longestSubstanceVoidAt}`],
    ['Visible elements', (v) => v.document.visibleElements],
    ['**Type**', null],
    ['Type combinations', (v) => v.type.combinations],
    ['…of which >24px', (v) => v.type.above24px],
    ['…of which >32px', (v) => v.type.above32px],
    ['Distinct sizes', (v) => v.type.distinctSizes],
    ['Size range', (v) => `${v.type.smallestPx}–${v.type.largestPx}px`],
    ['Weights', (v) => v.type.distinctWeights.join('/')],
    ['Families', (v) => v.type.families.slice(0, 3).map((f) => f.family).join(', ')],
    ['**Rhythm**', null],
    ['Top-level sections', (v) => v.sections.count],
    ['Section height med/max', (v) => `${v.sections.heights.median ?? 0}/${v.sections.heights.max ?? 0}px`],
    ['Section height CV', (v) => v.sections.heights.cv ?? 0],
    ['Gap between sections', (v) => `${v.sections.gaps.median ?? 0}px med`],
    ['Internal padding med', (v) => `${v.sections.internalPadding.median ?? 0}px`],
    ['**Container**', null],
    ['Content width', (v) => `${v.container.contentWidthPx}px`],
    ['Gutters L/R', (v) => `${v.container.gutterLeftPx}/${v.container.gutterRightPx}px`],
    ['Declared max-width', (v) => v.container.declaredMaxWidths[0]?.value ?? '—'],
    ['**Colour**', null],
    ['Distinct colours', (v) => v.color.distinctColors],
    ['Meaningful hues', (v) => v.color.meaningfulHues],
    ['Accent', (v) => v.color.accent?.hex ?? 'none'],
    ['Accent uses / screen', (v) => v.color.accent?.perScreen ?? 0],
    ['**Shape**', null],
    ['Distinct radii', (v) => v.shape.distinctRadii],
    ['Top radius', (v) => v.shape.radii[0]?.value ?? '—'],
    ['Distinct shadows', (v) => v.shape.distinctShadows],
    ['Max shadow layers', (v) => v.shape.maxShadowLayers],
    ['**Motion**', null],
    ['Computed transition buckets', (v) => v.motion.distinctComputedTransitions],
    ['Top transition', (v) => v.motion.computedTransitionBuckets[0]?.spec ?? '—'],
    ['@keyframes', (v) => v.motion.keyframes],
    ['Distinct cubic-beziers', (v) => v.motion.distinctBeziers],
    ['linear() springs', (v) => v.motion.linearSprings],
    ['Declared durations', (v) => v.motion.distinctDeclaredDurations],
  ]

  let md = ''
  for (const vpName of ['desktop', 'mobile']) {
    const vps = sites.map((s) => s.viewports[vpName]).filter(Boolean)
    if (vps.length !== sites.length) continue
    md += `\n### ${vpName === 'desktop' ? 'Desktop — 1440×900' : 'Mobile — 390×844'}\n\n`
    // Flag a bad capture in the header rather than letting it read as fact.
    md += `| Metric | ${sites
      .map((s, i) => s.label + (vps[i].health && !vps[i].health.ok ? ' ⚠' : ''))
      .join(' | ')} |\n`
    md += `|---|${sites.map(() => '---').join('|')}|\n`
    for (const [name, get] of rows) {
      if (!get) {
        md += `| ${name} | ${sites.map(() => '').join(' | ')} |\n`
        continue
      }
      const cells = vps.map((v) => {
        try { return fmt(get(v)) } catch { return '—' }
      })
      md += `| ${name} | ${cells.join(' | ')} |\n`
    }
  }
  if (outFile) {
    mkdirSync(dirname(outFile), { recursive: true })
    writeFileSync(outFile, md)
    console.log(`wrote ${outFile} (${sites.map((s) => s.label).join(', ')})`)
  } else {
    process.stdout.write(md)
  }
}

export { MEASURE_FN, rhythm }

// Dispatch last: MEASURE_FN is a const and profileSite closes over it.
if (has('--compare')) renderComparison()
else await profileSite()
