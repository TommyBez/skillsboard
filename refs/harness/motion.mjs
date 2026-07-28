// Interaction and motion evidence capture.
//
//   ./refs/harness/run.sh motion.mjs <url> <label> [--selector "a.btn"]...
//                                    [--out dir] [--dark] [--mobile] [--reduced]
//
// Stills cannot judge motion, which is the whole reason input-otp is on the
// reference list. This drives the page and records what actually happens.
//
// Method follows refs/motion-spec.md, which got its numbers out of input-otp
// with CDP `Animation.animationStarted` — that reports the real effect timing
// (duration, delay, easing, fill) for every CSS transition, CSS animation and
// WAAPI animation the page starts, rather than the durations a stylesheet
// declares for rules that may never match.
//
// Frames come from `Page.startScreencast`, not a screenshot loop: screencast
// frames carry the compositor's own timestamps and are only emitted when the
// page actually repaints, so "no frame" is itself evidence. They are composed
// into a contact strip by cropping in CSS — no image library, no new deps.
import { mkdirSync, writeFileSync } from 'node:fs'
import { launchBrowser, openPage, settle, scrollTo, getSections, slug, VIEWPORTS } from './lib.mjs'

const argv = process.argv.slice(2)
const VALUE_FLAGS = ['--out', '--selector']
const flag = (n, d = null) => (argv.indexOf(n) >= 0 ? argv[argv.indexOf(n) + 1] : d)
const has = (n) => argv.includes(n)
const [url, label] = argv.filter((a, i) => !a.startsWith('--') && !VALUE_FLAGS.includes(argv[i - 1]))
const selectors = argv.reduce((acc, a, i) => (a === '--selector' ? [...acc, argv[i + 1]] : acc), [])

if (!url || !label) {
  console.error('usage: motion.mjs <url> <label> [--selector S]... [--out dir]')
  process.exit(1)
}
const outDir = flag('--out', 'refs/harness/motion')
const vp = has('--mobile') ? VIEWPORTS.mobile : VIEWPORTS.desktop
const frameDir = `${outDir}/${label}`
mkdirSync(frameDir, { recursive: true })

// Properties worth diffing across states. Anything that changes and is not in
// this list is reported as "unlisted change" by the diff, so the list being
// incomplete degrades gracefully.
const WATCH = [
  'backgroundColor', 'color', 'borderColor', 'borderWidth', 'boxShadow', 'opacity',
  'transform', 'scale', 'filter', 'backdropFilter', 'outline', 'outlineOffset',
  'borderRadius', 'letterSpacing', 'textDecorationLine', 'backgroundImage',
  'transitionProperty', 'transitionDuration', 'transitionTimingFunction', 'transitionDelay',
  'animationName', 'animationDuration', 'animationTimingFunction', 'cursor', 'willChange',
]

const browser = await launchBrowser()
const { ctx, page } = await openPage(browser, url, vp, {
  dark: has('--dark'),
  deviceScaleFactor: 1, // screencast frames then map 1:1 to CSS px, so crops are trivial
  reducedMotion: has('--reduced') ? 'reduce' : undefined,
  waitMs: 800, // the entrance is the first thing we record, so do not sleep through it
})
const client = await ctx.newCDPSession(page)

// ---------------------------------------------------------------------------
// CDP animation recording
// ---------------------------------------------------------------------------
let animBuf = []
await client.send('Animation.enable')
client.on('Animation.animationStarted', ({ animation }) => {
  const s = animation.source || {}
  animBuf.push({
    id: animation.id,
    type: animation.type, // CSSTransition | CSSAnimation | WebAnimation
    name: animation.name || s.keyframesRule?.name || null,
    durationMs: Math.round(s.duration ?? 0),
    delayMs: Math.round(s.delay ?? 0),
    easing: s.easing ?? null,
    fill: s.fill ?? null,
    iterations: s.iterations ?? null,
    at: Date.now(),
  })
})

const startRecording = () => {
  animBuf = []
  return Date.now()
}
// Collapse the raw event stream into a timing table: N identical animations
// firing together is one row with a count, which is what a human reads.
const summarise = (t0) => {
  const rows = new Map()
  for (const a of animBuf) {
    const key = `${a.type}|${a.name}|${a.durationMs}|${a.easing}`
    const r = rows.get(key) || {
      type: a.type, name: a.name, durationMs: a.durationMs, easing: a.easing,
      count: 0, delaysMs: [], firstAtMs: Infinity,
    }
    r.count++
    if (r.delaysMs.length < 40) r.delaysMs.push(a.delayMs)
    r.firstAtMs = Math.min(r.firstAtMs, a.at - t0)
    rows.set(key, r)
  }
  return [...rows.values()]
    .map((r) => ({
      ...r,
      delaysMs: [...new Set(r.delaysMs)].sort((a, b) => a - b).slice(0, 12),
      // Stagger is the interval a viewer perceives as a ripple; it is the thing
      // people copy wrong, so surface it rather than making anyone diff delays.
      staggerMs: staggerOf(r.delaysMs),
    }))
    .sort((a, b) => a.firstAtMs - b.firstAtMs)
}
function staggerOf(delays) {
  const u = [...new Set(delays)].sort((a, b) => a - b)
  if (u.length < 2) return null
  const diffs = u.slice(1).map((d, i) => d - u[i])
  return Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length)
}

// ---------------------------------------------------------------------------
// Screencast -> frame strip
// ---------------------------------------------------------------------------
async function screencast(action, { settleMs = 900, baseFirst = false } = {}) {
  const frames = []
  const onFrame = async ({ data, sessionId, metadata }) => {
    frames.push({ data, t: metadata.timestamp })
    try { await client.send('Page.screencastFrameAck', { sessionId }) } catch { /* cast ended */ }
  }
  client.on('Page.screencastFrame', onFrame)
  await client.send('Page.startScreencast', {
    format: 'jpeg', quality: 90, maxWidth: vp.width, maxHeight: vp.height, everyNthFrame: 1,
  })
  await page.waitForTimeout(120) // let one baseline frame land before the trigger
  // Zero the clock at the last frame before the trigger, so pre-trigger frames
  // read as negative and the rest are "ms since the user did the thing".
  const t0 = frames.length ? frames[frames.length - 1].t : null
  await action()
  await page.waitForTimeout(settleMs)
  await client.send('Page.stopScreencast')
  client.off('Page.screencastFrame', onFrame)
  const base = (baseFirst ? frames[0]?.t : t0) ?? frames[0]?.t ?? 0
  return frames.map((f) => ({ data: f.data, ms: Math.round((f.t - base) * 1000) }))
}

// Compose frames into one contact strip. Cropping happens in CSS
// (background-position on a data: URI) so no image library is needed.
async function writeStrip(name, frames, clip, title) {
  if (!frames.length) return null
  const picked = pick(frames, 10)
  const cw = Math.min(clip.width, 420)
  const scale = cw / clip.width
  const ch = Math.round(clip.height * scale)
  const cells = picked
    .map(
      (f) => `<figure><div class="f" style="width:${cw}px;height:${ch}px;` +
        `background-image:url(data:image/jpeg;base64,${f.data});` +
        `background-size:${Math.round(vp.width * scale)}px ${Math.round(vp.height * scale)}px;` +
        `background-position:${-Math.round(clip.x * scale)}px ${-Math.round(clip.y * scale)}px">` +
        `</div><figcaption>+${f.ms}ms</figcaption></figure>`,
    )
    .join('')
  const html = `<style>
    body{margin:0;background:#111;color:#ddd;font:12px ui-monospace,monospace}
    h1{font:600 13px ui-sans-serif,system-ui;margin:12px 16px 4px;color:#fff}
    .strip{display:flex;gap:8px;padding:8px 16px 16px;align-items:flex-start}
    figure{margin:0}
    .f{background-repeat:no-repeat;border:1px solid #333;border-radius:3px}
    figcaption{padding-top:4px;text-align:center;color:#8a8}
  </style><h1>${title}</h1><div class="strip">${cells}</div>`
  const stripCtx = await browser.newContext({
    viewport: { width: Math.min(4000, picked.length * (cw + 8) + 32), height: ch + 80 },
  })
  const sp = await stripCtx.newPage()
  await sp.setContent(html)
  await sp.waitForTimeout(200)
  const file = `${name}-strip.png`
  await sp.screenshot({ path: `${frameDir}/${file}`, fullPage: true })
  await stripCtx.close()
  return { file, frames: picked.map((f) => f.ms) }
}

// Keep the first frames dense (that is where interaction feedback lives) and
// thin out the tail, rather than sampling uniformly across the settle window.
function pick(frames, n) {
  if (frames.length <= n) return frames
  const out = [frames[0]]
  const rest = frames.slice(1)
  for (let i = 1; i < n; i++) {
    const p = (i / (n - 1)) ** 1.7
    out.push(rest[Math.min(rest.length - 1, Math.round(p * (rest.length - 1)))])
  }
  return [...new Map(out.map((f) => [f.ms, f])).values()]
}

const styleOf = (sel) =>
  page.evaluate(
    ([s, props]) => {
      const el = document.querySelector(s)
      if (!el) return null
      const cs = getComputedStyle(el)
      const out = {}
      for (const p of props) out[p] = cs[p]
      const r = el.getBoundingClientRect()
      out._box = { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
      return out
    },
    [sel, WATCH],
  )

const diff = (a, b) => {
  if (!a || !b) return null
  const d = {}
  for (const k of Object.keys(a)) if (k !== '_box' && a[k] !== b[k]) d[k] = `${a[k]} → ${b[k]}`
  return d
}

const clipFor = (box, pad = 28) => ({
  x: Math.max(0, box.x - pad),
  y: Math.max(0, box.y - pad),
  width: Math.min(vp.width, box.w + pad * 2),
  height: Math.min(vp.height, box.h + pad * 2),
})

// ---------------------------------------------------------------------------
// 1. Entrance — recorded from first paint, before any settling
// ---------------------------------------------------------------------------
const report = { label, url, viewport: vp, capturedAt: new Date().toISOString(), reducedMotion: has('--reduced') }

{
  const t0 = startRecording()
  const frames = await screencast(async () => {}, { settleMs: 2600, baseFirst: true })
  report.entrance = {
    animations: summarise(t0),
    strip: await writeStrip('entrance', frames, { x: 0, y: 0, width: vp.width, height: vp.height }, `${label} — entrance`),
    frameCount: frames.length,
  }
  console.log(`[${label}] entrance: ${report.entrance.animations.length} animation groups, ${frames.length} frames`)
}

// ---------------------------------------------------------------------------
// 2. Scroll reveal — a mid-page section entering the viewport for the first time
// ---------------------------------------------------------------------------
{
  // Segmentation needs a settled page; the reveal measurement needs a page that
  // has never been scrolled. So: settle, choose the target, then reload and
  // jump straight to it. Creeping up on the section first is what made the
  // first attempt record nothing — a reveal engine with a negative rootMargin
  // had already fired by the time recording started, and only the scroll-back
  // (which should be silent) showed any animation at all.
  await settle(page, vp, { dwell: 160, tail: 600 })
  const sections = await getSections(page, vp)
  const target = sections.find((s) => s.top > vp.height * 1.4) || sections[1] || sections[0]
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2600)
  const docH = await page.evaluate(() => document.documentElement.scrollHeight)
  if (target) {
    const t0 = startRecording()
    const frames = await screencast(
      () => scrollTo(page, Math.min(target.top, docH - vp.height)),
      { settleMs: 2200 },
    )
    report.scrollReveal = {
      section: { label: target.label, top: target.top, height: target.height },
      animations: summarise(t0),
      strip: await writeStrip(
        `reveal-${slug(target.label || 'section')}`, frames,
        { x: 0, y: 0, width: vp.width, height: vp.height },
        `${label} — scroll reveal: ${(target.label || '').slice(0, 40)}`,
      ),
      frameCount: frames.length,
    }
    console.log(`[${label}] reveal: ${report.scrollReveal.animations.length} animation groups, ${frames.length} frames`)

    // Does it replay? Scrolling away and back is the cheap test that separates
    // a one-shot reveal engine from one that re-fires forever.
    await scrollTo(page, 0)
    await page.waitForTimeout(600)
    const t1 = startRecording()
    await scrollTo(page, Math.min(target.top, docH - vp.height))
    await page.waitForTimeout(1400)
    report.scrollReveal.replaysOnScrollBack = summarise(t1).length > 0
  }
}

// ---------------------------------------------------------------------------
// 3. Per-selector interaction: hover, press, focus, and hover interruption
// ---------------------------------------------------------------------------
await scrollTo(page, 0)
await page.waitForTimeout(500)
await settle(page, vp, { dwell: 160, tail: 800 })

let targets = selectors
if (!targets.length) {
  // No selectors given: take the largest interactive element in the fold (the
  // primary CTA, near enough on every marketing page) plus a nav link.
  targets = await page.evaluate((vpH) => {
    const cands = [...document.querySelectorAll('a[href], button, [role="button"], input')]
      .map((el) => {
        const r = el.getBoundingClientRect()
        return { el, r, area: r.width * r.height }
      })
      .filter((c) => c.r.top >= 0 && c.r.top < vpH && c.r.width > 40 && c.r.height > 16)
    cands.sort((a, b) => b.area - a.area)
    // Biggest in the fold is the primary CTA on essentially every marketing
    // page; smallest is a nav link. The two ends bracket the interaction
    // vocabulary — the thing they spent motion on and the thing they did not.
    const picks = [...new Set([cands[0], cands[cands.length - 1]].filter(Boolean))]
    // Stamp the elements rather than deriving a CSS path. Hashed CSS-module
    // classes and Tailwind's `group/button` defeat class selectors, and an
    // nth-child path breaks the moment a skip-link appears on first Tab —
    // which is exactly what silently dropped the nav link on the first run.
    return picks.map((c, i) => {
      c.el.setAttribute('data-harness-target', String(i))
      const text = (c.el.innerText || c.el.value || '').replace(/\s+/g, ' ').trim().slice(0, 30)
      return { sel: `[data-harness-target="${i}"]`, note: `${c.el.tagName.toLowerCase()} "${text}" ${Math.round(c.r.width)}×${Math.round(c.r.height)}` }
    })
  }, vp.height)
  console.log(`[${label}] auto-selected: ${targets.map((t) => t.note).join(' | ')}`)
  targets = targets.map((t) => t.sel)
}

report.interactions = []
for (const sel of targets) {
  const rest = await styleOf(sel)
  if (!rest) {
    console.log(`[${label}] selector not found: ${sel}`)
    report.interactions.push({ selector: sel, error: 'not found' })
    continue
  }
  const name = slug(sel, 28)
  const clip = clipFor(rest._box)
  const cx = rest._box.x + rest._box.w / 2
  const cy = rest._box.y + rest._box.h / 2
  const entry = { selector: sel, box: rest._box, rest }

  // -- hover ---------------------------------------------------------------
  await page.mouse.move(5, vp.height - 5)
  await page.waitForTimeout(400)
  let t0 = startRecording()
  let frames = await screencast(() => page.mouse.move(cx, cy, { steps: 6 }), { settleMs: 900 })
  entry.hover = {
    animations: summarise(t0),
    changed: diff(rest, await styleOf(sel)),
    strip: await writeStrip(`${name}-hover`, frames, clip, `${label} ${sel} — hover`),
  }

  // -- press ---------------------------------------------------------------
  const hovered = await styleOf(sel)
  t0 = startRecording()
  frames = await screencast(async () => {
    await page.mouse.down()
    await page.waitForTimeout(260)
  }, { settleMs: 320 })
  const pressed = await styleOf(sel)
  entry.press = {
    animations: summarise(t0),
    // Diffed against hover, not rest: a press state that merely equals hover is
    // "no press state", and that distinction is the finding.
    changedFromHover: diff(hovered, pressed),
    strip: await writeStrip(`${name}-press`, frames, clip, `${label} ${sel} — press`),
  }
  await page.mouse.up().catch(() => {})

  // -- hover interruption --------------------------------------------------
  // Reverse a hover 80ms in. CSS transitions shorten the reverse
  // proportionally; a JS-driven hover usually reports the full duration, which
  // is the snap-back artefact visible as a defect.
  await page.mouse.move(5, vp.height - 5)
  await page.waitForTimeout(700)
  await page.mouse.move(cx, cy, { steps: 4 })
  await page.waitForTimeout(80)
  t0 = startRecording()
  await page.mouse.move(5, vp.height - 5, { steps: 4 })
  await page.waitForTimeout(700)
  entry.hoverInterrupt = { leftAfterMs: 80, reverseAnimations: summarise(t0) }

  // -- keyboard focus ------------------------------------------------------
  await page.waitForTimeout(300)
  t0 = startRecording()
  frames = await screencast(async () => {
    await page.evaluate((s) => document.querySelector(s)?.focus({ focusVisible: true }), sel)
    // A real Tab is what triggers :focus-visible in Chromium; .focus() alone
    // often does not, and the difference is exactly what we are looking for.
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Tab')
  }, { settleMs: 700 })
  entry.focus = {
    animations: summarise(t0),
    changed: diff(rest, await styleOf(sel)),
    strip: await writeStrip(`${name}-focus`, frames, clip, `${label} ${sel} — keyboard focus`),
  }
  await page.evaluate(() => document.activeElement?.blur())

  report.interactions.push(entry)
  console.log(
    `[${label}] ${sel}: hover ${entry.hover.animations.length} anim / ` +
      `press ${Object.keys(entry.press.changedFromHover || {}).length} prop change / ` +
      `focus ${Object.keys(entry.focus.changed || {}).length} prop change`,
  )
}

const out = `${outDir}/motion-${label}${has('--mobile') ? '-mobile' : ''}.json`
writeFileSync(out, JSON.stringify(report, null, 2))
console.log(`wrote ${out} and strips in ${frameDir}/`)
await browser.close()
