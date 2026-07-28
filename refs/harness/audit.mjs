// Absolute defect audit of a single URL. No reference site, no comparison —
// the only question it asks is "what is wrong with this page".
//
//   node refs/harness/audit.mjs <url> [flags]
//     --viewport 390x844     repeatable; default 1440x900 and 390x844
//     --scheme light|dark|both   default both
//     --out path.json        default refs/harness/out/audit.json
//     --wait ms              settle time after load (default 2500)
//     --cap n                max items kept per finding list (default 25)
//     --no-void              skip the pixel void scan (it is the slow part)
//     --quiet                JSON only, no readable summary
//
// External hosts are fetched through Node's env proxy and fulfilled into the
// page: Chromium's own TLS to the egress proxy gets reset, Node's does not.
// NODE_USE_ENV_PROXY must be set before node starts — use refs/harness/audit.sh.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { probe } from './probe.mjs'

const argv = process.argv.slice(2)
const url = argv.find((a) => !a.startsWith('--'))
if (!url) {
  console.error('usage: node refs/harness/audit.mjs <url> [--viewport WxH] [--scheme both] [--out f.json]')
  process.exit(1)
}
function flag(name, fallback) {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 ? argv[i + 1] : fallback
}
function has(name) {
  return argv.includes(`--${name}`)
}
const viewportArgs = argv.reduce((acc, a, i) => (a === '--viewport' ? [...acc, argv[i + 1]] : acc), [])
const viewports = (viewportArgs.length ? viewportArgs : ['1440x900', '390x844']).map((v) => {
  const [w, h] = v.split('x').map(Number)
  return { width: w, height: h, label: v }
})
const schemeArg = flag('scheme', 'both')
const schemes = schemeArg === 'both' ? ['light', 'dark'] : [schemeArg]
const waitMs = Number(flag('wait', 2500))
const cap = Number(flag('cap', 25))
const outPath = resolve(flag('out', 'refs/harness/out/audit.json'))
const quiet = has('quiet')
const doVoid = !has('no-void')
const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)([:/]|$)/.test(url)

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--no-sandbox', '--force-color-profile=srgb', '--font-render-hinting=none'],
})

async function attachProxyRouting(ctx) {
  if (isLocal) return
  await ctx.route('**/*', async (route) => {
    const req = route.request()
    try {
      // Strip hop-by-hop and encoding headers: undici sets its own, and a
      // forwarded accept-encoding makes it hand back still-compressed bytes.
      const headers = { ...req.headers() }
      for (const k of ['host', 'connection', 'accept-encoding', 'content-length']) delete headers[k]
      const res = await fetch(req.url(), {
        method: req.method(),
        headers,
        body: ['GET', 'HEAD'].includes(req.method()) ? undefined : req.postDataBuffer(),
        redirect: 'follow',
      })
      const body = Buffer.from(await res.arrayBuffer())
      const outHeaders = {}
      res.headers.forEach((v, k) => {
        if (!['content-encoding', 'content-length', 'transfer-encoding', 'content-security-policy'].includes(k)) {
          outHeaders[k] = v
        }
      })
      await route.fulfill({ status: res.status, headers: outHeaders, body })
    } catch (e) {
      if (process.env.AUDIT_DEBUG) console.error('route fail', req.url().slice(0, 90), e.message)
      await route.abort()
    }
  })
}

// A scroll pass is required before any measurement: reveal-on-scroll sections
// are opacity:0 until they intersect. behavior:'instant' is load-bearing — the
// site sets scroll-behavior: smooth, so a plain scrollTo animates, never
// arrives between steps, and late sections stay unrevealed. That mistake is
// what let a broken mobile page look fine for an afternoon.
async function scrollPass(page, vpHeight) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < h; y += Math.floor(vpHeight * 0.7)) {
    await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y)
    await page.waitForTimeout(220)
  }
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }))
  await page.waitForTimeout(400)
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForTimeout(700)
  return h
}

// ---------- focus visibility ----------

const FOCUS_SEL =
  'a[href], button, input:not([type=hidden]), select, textarea, summary, [tabindex]:not([tabindex="-1"]), [contenteditable=""], [contenteditable="true"]'

async function focusPass(page) {
  const baseline = await page.evaluate((sel) => {
    const props = [
      'outlineStyle', 'outlineWidth', 'outlineColor', 'outlineOffset', 'boxShadow',
      'backgroundColor', 'backgroundImage', 'color', 'borderTopColor', 'borderTopWidth',
      'textDecorationLine', 'filter', 'opacity', 'transform',
    ]
    const pseudoProps = ['content', 'boxShadow', 'outlineStyle', 'backgroundColor', 'borderTopColor', 'opacity', 'transform', 'width', 'height', 'inset']
    // Same canvas trick as probe.mjs: the ring colour is an oklch() token, so
    // a regex would read alpha 0 and every focus ring would look invisible.
    const paint = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
    paint.canvas.width = 1
    paint.canvas.height = 1
    window.__auditAlpha = (str) => {
      if (!str) return 0
      const read = (backdrop) => {
        paint.globalCompositeOperation = 'copy'
        paint.fillStyle = backdrop
        paint.fillRect(0, 0, 1, 1)
        paint.globalCompositeOperation = 'source-over'
        paint.fillStyle = str
        paint.fillRect(0, 0, 1, 1)
        return paint.getImageData(0, 0, 1, 1).data
      }
      const b = read('#000000')
      const w = read('#ffffff')
      return Math.max(0, Math.min(1, 1 - (w[0] - b[0] + (w[1] - b[1]) + (w[2] - b[2])) / (3 * 255)))
    }
    window.__auditFp = (el) => {
      const s = getComputedStyle(el)
      const out = {}
      for (const p of props) out[p] = s[p]
      out.outlineAlpha = String(window.__auditAlpha(s.outlineColor))
      for (const pe of ['::before', '::after']) {
        const ps = getComputedStyle(el, pe)
        for (const p of pseudoProps) out[`${pe}${p}`] = ps[p]
      }
      return out
    }
    const els = [...document.querySelectorAll(sel)]
    els.forEach((el, i) => el.setAttribute('data-audit-fx', String(i)))
    return els.map((el, i) => {
      const r = el.getBoundingClientRect()
      return {
        idx: i,
        tag: el.tagName.toLowerCase(),
        visible: r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden',
        fp: window.__auditFp(el),
      }
    })
  }, FOCUS_SEL)

  const seen = new Set()
  const results = []
  const maxTabs = Math.min(baseline.length * 2 + 5, 300)
  for (let i = 0; i < maxTabs; i++) {
    await page.keyboard.press('Tab')
    const active = await page.evaluate(() => {
      const el = document.activeElement
      if (!el || el === document.body || el === document.documentElement) return null
      const idx = el.getAttribute('data-audit-fx')
      const r = el.getBoundingClientRect()
      return {
        idx: idx === null ? null : Number(idx),
        selector: el.tagName.toLowerCase() + (el.id ? `#${el.id}` : ''),
        label: (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 50),
        rect: { w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.top + window.scrollY) },
        fp: window.__auditFp(el),
      }
    })
    if (!active) break
    if (active.idx === null) continue
    if (seen.has(active.idx)) break
    seen.add(active.idx)
    const base = baseline[active.idx]
    if (!base || !base.visible) continue
    const changed = Object.keys(active.fp).filter((k) => active.fp[k] !== base.fp[k])
    const f = active.fp
    const ring =
      f.outlineStyle !== 'none' && parseFloat(f.outlineWidth) > 0 && Number(f.outlineAlpha) > 0.1
    const shadow = changed.includes('boxShadow') && f.boxShadow !== 'none'
    const pseudo = changed.some((k) => k.startsWith('::'))
    const paint = changed.some((k) =>
      ['backgroundColor', 'backgroundImage', 'color', 'borderTopColor', 'borderTopWidth', 'textDecorationLine', 'filter', 'transform', 'opacity'].includes(k),
    )
    const visibleIndicator = ring || shadow || pseudo || paint
    results.push({
      idx: active.idx,
      tag: base.tag,
      label: active.label,
      selector: active.selector,
      size: `${active.rect.w}x${active.rect.h}`,
      docY: active.rect.y,
      visibleIndicator,
      evidence: visibleIndicator
        ? [ring && 'outline', shadow && 'box-shadow', pseudo && 'pseudo-element', paint && 'repaint'].filter(Boolean)
        : [],
      changed: visibleIndicator ? undefined : changed.slice(0, 6),
    })
  }
  await page.evaluate(() => document.querySelectorAll('[data-audit-fx]').forEach((el) => el.removeAttribute('data-audit-fx')))
  return {
    focusableCount: baseline.filter((b) => b.visible).length,
    tabbedCount: results.length,
    noVisibleIndicator: results.filter((r) => !r.visibleIndicator),
    withIndicator: results.filter((r) => r.visibleIndicator).length,
  }
}

// ---------- void analysis ----------

// Decode the full-page screenshot inside a blank page and scan it row by row:
// a band whose whole width varies by less than ~12 RGB points reads as dead
// space. Done in-browser because the harness may not add dependencies and Node
// has no PNG decoder.
async function voidScan(browserRef, png, threshold = 12) {
  const ctx = await browserRef.newContext({ viewport: { width: 400, height: 300 } })
  const page = await ctx.newPage()
  await page.goto('about:blank')
  const result = await page.evaluate(
    async ({ dataUrl, thr }) => {
      const img = new Image()
      img.src = dataUrl
      await img.decode()
      const W = img.naturalWidth
      const H = img.naturalHeight
      const canvas = document.createElement('canvas')
      canvas.width = W
      canvas.height = H
      const c2d = canvas.getContext('2d', { willReadFrequently: true })
      c2d.drawImage(img, 0, 0)
      const rows = []
      const STRIP = 1500
      for (let y0 = 0; y0 < H; y0 += STRIP) {
        const hh = Math.min(STRIP, H - y0)
        const data = c2d.getImageData(0, y0, W, hh).data
        for (let y = 0; y < hh; y++) {
          let minR = 255, maxR = 0, minG = 255, maxG = 0, minB = 255, maxB = 0
          const base = y * W * 4
          for (let x = 0; x < W; x += 2) {
            const i = base + x * 4
            const r = data[i], g = data[i + 1], b = data[i + 2]
            if (r < minR) minR = r
            if (r > maxR) maxR = r
            if (g < minG) minG = g
            if (g > maxG) maxG = g
            if (b < minB) minB = b
            if (b > maxB) maxB = b
          }
          rows.push(Math.max(maxR - minR, maxG - minG, maxB - minB))
        }
      }
      const runs = []
      let start = null
      for (let y = 0; y <= rows.length; y++) {
        const isVoid = y < rows.length && rows[y] < thr
        if (isVoid && start === null) start = y
        if (!isVoid && start !== null) {
          runs.push({ startY: start, endY: y - 1, height: y - start })
          start = null
        }
      }
      const voidRows = runs.reduce((s, r) => s + r.height, 0)
      return {
        width: W,
        height: H,
        threshold: thr,
        voidRows,
        voidAreaPx: voidRows * W,
        voidPctOfDocument: Math.round((voidRows / H) * 1000) / 10,
        runCount: runs.length,
        largestRuns: runs.sort((a, b) => b.height - a.height).slice(0, 3),
        runsOver200px: runs.filter((r) => r.height > 200).length,
      }
    },
    { dataUrl: `data:image/png;base64,${png.toString('base64')}`, thr: threshold },
  )
  await ctx.close()
  return result
}

// ---------- run the matrix ----------

const runs = []
for (const vp of viewports) {
  for (const scheme of schemes) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      isMobile: vp.width < 500,
      hasTouch: vp.width < 500,
      colorScheme: scheme,
      ignoreHTTPSErrors: true,
      userAgent:
        vp.width < 500
          ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
          : undefined,
    })
    await attachProxyRouting(ctx)
    const page = await ctx.newPage()
    const errors = []
    const badAssets = []
    page.on('pageerror', (e) => errors.push(e.message.split('\n')[0]))
    page.on('requestfailed', (r) => badAssets.push(`${r.failure()?.errorText || 'failed'} ${r.url().slice(0, 120)}`))
    page.on('response', (r) => {
      if (r.status() >= 400) badAssets.push(`${r.status()} ${r.url().slice(0, 120)}`)
    })
    let navOk = true
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 })
    } catch (e) {
      navOk = false
      errors.push(`goto: ${e.message.split('\n')[0]}`)
    }
    await page.waitForTimeout(waitMs)
    const docHeight = await scrollPass(page, vp.height)

    // A page whose stylesheets 404'd (a server mid-rebuild, say) measures
    // beautifully and means nothing — every later number would be about
    // unstyled HTML. Detect it and say so loudly rather than reporting a clean
    // audit of a broken load.
    const health = await page.evaluate(() => ({
      styleSheets: document.styleSheets.length,
      bodyFont: getComputedStyle(document.body).fontFamily,
      landingRoot: !!document.querySelector('[data-landing-page]'),
    }))
    const unstyled = health.styleSheets === 0 || /^(Times|serif)/i.test(health.bodyFont.trim())

    const findings = await page.evaluate(probe, { cap })
    const focus = await focusPass(page)

    let voids = null
    if (doVoid) {
      try {
        const png = await page.screenshot({ fullPage: true })
        voids = await voidScan(browser, png)
      } catch (e) {
        voids = { error: e.message.split('\n')[0] }
      }
    }

    runs.push({
      ...findings,
      viewport: vp.label,
      scheme,
      navOk,
      health: { ...health, unstyled, failedAssets: [...new Set(badAssets)].slice(0, 10) },
      pageErrors: errors.slice(0, 10),
      docHeight,
      focus,
      voids,
    })
    if (!quiet) console.error(`  scanned ${vp.label} ${scheme}`)
    await ctx.close()
  }
}
await browser.close()

const report = { url, ranAt: new Date().toISOString(), runs }
mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, JSON.stringify(report, null, 2))

// ---------- readable summary ----------

function line(label, value) {
  return `  ${label.padEnd(30)} ${value}`
}

if (!quiet) {
  const out = []
  out.push(`\nAUDIT ${url}`)
  for (const r of runs) {
    out.push(`\n─── ${r.viewport} ${r.scheme} ─────────────────────────────────`)
    if (!r.navOk) out.push('  NAVIGATION FAILED')
    if (r.health.unstyled) out.push(`  !! PAGE LOADED UNSTYLED (${r.health.styleSheets} stylesheets, body font ${r.health.bodyFont}) — every number below is meaningless`)
    if (r.health.failedAssets.length) out.push(line('failed assets', r.health.failedAssets.slice(0, 3).join(' | ')))
    out.push(line('document', `${r.document.scrollWidth}x${r.document.scrollHeight} (${r.document.elementsScanned} elements)`))
    out.push(line('horizontal doc overflow', `${r.overflow.documentOverflowPx}px`))
    out.push(
      line(
        'overflow past viewport',
        `${r.overflow.counts.text} carrying copy, ${r.overflow.counts.surface} surfaces (${r.overflow.counts.surfacePlausibleCrop} plausible crops), ${r.overflow.counts.offstage} parked offstage, ${r.overflow.counts.scrollable} inside scrollers`,
      ),
    )
    for (const o of r.overflow.text.slice(0, 6)) {
      out.push(`      DEFECT +${o.overshootPx}px  <${o.tag}> "${o.text}"`)
      out.push(`             ${o.selector}  right=${o.rect.right} vp=${r.viewport.split('x')[0]} y=${o.docY}`)
    }
    for (const o of r.overflow.surface.slice(0, 4)) {
      out.push(`      ${o.plausibleCrop ? 'CROP? ' : 'SURF  '} +${o.overshootPx}px  <${o.tag}> ${o.selector}${o.text ? `  "${o.text.slice(0, 40)}"` : ''}`)
    }
    out.push(line('ellipsis truncation', r.truncation.counts.ellipsis))
    for (const t of r.truncation.ellipsis.slice(0, 4)) out.push(`      "${t.text}" (${t.selector})`)
    out.push(
      line(
        'clipped by overflow:hidden',
        `${r.truncation.counts.clipped} (${r.truncation.counts.sliced} sliced mid-box, ${r.truncation.counts.croppedSurface} inside a deliberate crop, ${r.truncation.counts.beyondCrop} entirely past one)`,
      ),
    )
    for (const t of r.truncation.clipped.slice(0, 6)) {
      out.push(`      ${t.category === 'sliced' ? 'SLICED' : t.category === 'cropped-surface' ? 'crop  ' : 'past  '} -${t.hiddenPx}px ${t.axis}  "${t.text}"  in ${t.clippedBy.split(' > ').slice(-2).join(' > ')}`)
    }
    out.push(line('invisible text nodes', r.invisibleText.count))
    for (const t of r.invisibleText.items.slice(0, 5)) out.push(`      ${t.reasons.join(', ')}  "${t.text}" (${t.selector})`)
    out.push(line('tap targets under 44px', r.tapTargets.count))
    for (const t of r.tapTargets.items.slice(0, 6)) out.push(`      ${t.size}  <${t.tag}> ${t.label || t.selector}`)
    out.push(line('contrast failures', `${r.contrast.failureCount} of ${r.contrast.textElements} text elements (${r.contrast.bodyFailureCount} body)`))
    for (const c of r.contrast.failures.slice(0, 6)) {
      out.push(`      ${c.ratio}:1 need ${c.required}  ${c.fg} on ${c.bg}  ${c.fontSize}px/${c.weight} x${c.count}  "${c.text.slice(0, 40)}"`)
    }
    if (r.contrast.overImageCount) out.push(line('contrast over image/gradient', `${r.contrast.overImageCount} (not judged)`))
    out.push(line('type combinations', r.type.combinations))
    for (const t of r.type.items.slice(0, 8)) out.push(`      x${String(t.count).padStart(3)}  ${t.key}`)
    if (r.type.items.length > 8) out.push(`      … ${r.type.items.length - 8} more`)
    out.push(line('spacing distinct p/m/g', `${r.spacing.padding.distinct}/${r.spacing.margin.distinct}/${r.spacing.gap.distinct}`))
    if (r.spacing.offScale.length) out.push(`      off 4px scale: ${r.spacing.offScale.slice(0, 8).map((s) => s.value).join(', ')}`)
    out.push(line('radii / shadows distinct', `${r.radii.distinct} / ${r.shadows.distinct}`))
    out.push(line('accent elements', `${r.accent.elementsTotal} total, max ${r.accent.maxPerViewport} per viewport, mean ${r.accent.meanPerViewport}, ${r.accent.distinctColors} colours`))
    if (r.voids && !r.voids.error) {
      out.push(line('void bands', `${r.voids.voidRows}px of ${r.voids.height}px = ${r.voids.voidPctOfDocument}% of document, ${r.voids.runCount} runs`))
      for (const v of r.voids.largestRuns) out.push(`      ${v.height}px void at y=${v.startY}–${v.endY}`)
    } else if (r.voids) {
      out.push(line('void bands', `error: ${r.voids.error}`))
    }
    out.push(line('focus', `${r.focus.tabbedCount} tabbed, ${r.focus.noVisibleIndicator.length} with no visible indicator`))
    for (const f of r.focus.noVisibleIndicator.slice(0, 6)) out.push(`      <${f.tag}> ${f.label || f.selector} (${f.size})`)
    if (r.pageErrors.length) out.push(line('page errors', r.pageErrors.join(' | ')))
  }
  out.push(`\nwrote ${outPath}\n`)
  console.log(out.join('\n'))
}
