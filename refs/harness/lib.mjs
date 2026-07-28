// Shared plumbing for the reference-analysis harness.
//
// Nothing here captures or measures anything on its own — it exists so
// profile.mjs, sections.mjs and motion.mjs open a page the *same* way. If two
// tools settle a page differently, their numbers stop being comparable, which
// is the whole failure mode this harness was built to remove.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs'

export const VIEWPORTS = {
  desktop: { name: 'desktop', width: 1440, height: 900 },
  mobile: { name: 'mobile', width: 390, height: 844 },
}

export const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'

export const isLocal = (url) => /^https?:\/\/(localhost|127\.0\.0\.1)([:/]|$)/.test(url)

export async function launchBrowser() {
  return chromium.launch({
    executablePath: '/opt/pw-browsers/chromium',
    args: ['--no-sandbox', '--force-color-profile=srgb', '--font-render-hinting=none'],
  })
}

// Verbatim from refs/capture.mjs: external hosts are fetched through Node's env
// proxy and fulfilled into the page, because Chromium's own TLS to the egress
// proxy gets reset. NODE_USE_ENV_PROXY must be set before node starts — use
// refs/harness/run.sh.
export async function attachProxyRouting(ctx, url) {
  if (isLocal(url)) return
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
        if (
          !['content-encoding', 'content-length', 'transfer-encoding', 'content-security-policy']
            .includes(k)
        ) {
          outHeaders[k] = v
        }
      })
      await route.fulfill({ status: res.status, headers: outHeaders, body })
    } catch (e) {
      if (process.env.HARNESS_DEBUG) console.error('route fail', req.url().slice(0, 90), e.message)
      await route.abort()
    }
  })
}

export async function openPage(browser, url, vp, opts = {}) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: opts.deviceScaleFactor ?? 2,
    isMobile: vp.name === 'mobile',
    hasTouch: vp.name === 'mobile',
    colorScheme: opts.dark ? 'dark' : 'light',
    reducedMotion: opts.reducedMotion,
    ignoreHTTPSErrors: true,
    userAgent: vp.name === 'mobile' ? MOBILE_UA : undefined,
  })
  await attachProxyRouting(ctx, url)
  const page = await ctx.newPage()
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 })
  } catch (e) {
    console.error(`[${vp.name}] goto failed: ${e.message.split('\n')[0]}`)
  }
  await page.waitForTimeout(opts.waitMs ?? 3500)
  return { ctx, page }
}

// Walk the page top to bottom so lazy content and scroll-triggered reveals have
// actually played before anything is measured or captured.
//
// behavior:'instant' is load-bearing — our own site sets scroll-behavior:smooth,
// so a plain scrollTo animates, never arrives between steps, and leaves late
// sections unrevealed. That produced a phantom bug we nearly "fixed" in the app.
export async function settle(page, vp, { step = 0.7, dwell = 260, tail = 1500 } = {}) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < h; y += Math.floor(vp.height * step)) {
    await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y)
    await page.waitForTimeout(dwell)
  }
  await scrollTo(page, 0)
  await page.waitForTimeout(tail)
  return h
}

export const scrollTo = (page, y) =>
  page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y)

export const slug = (s, max = 24) =>
  (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, max) || 'section'

// ---------------------------------------------------------------------------
// Section segmentation — shared by profile.mjs (rhythm numbers) and
// sections.mjs (captures) so a "section 03" in one is the same band of pixels
// as "section 03" in the other.
//
// Runs in the page. Strategy: start from body's flow children and expand any
// child that is really just a wrapper (tall, and its own children tile it),
// then merge the runts. Deliberately structural rather than semantic — most
// marketing pages do not use <section> honestly, and we need the same rule to
// work on four different codebases.
// ---------------------------------------------------------------------------
export const SEGMENT_FN = function segment(vpH) {
  const rectOf = (el) => {
    const r = el.getBoundingClientRect()
    return { top: r.top + window.scrollY, height: r.height, width: r.width }
  }
  const inFlow = (el) => {
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden') return false
    // Fixed chrome (nav bars, cookie banners) is not part of the page's
    // vertical rhythm and would otherwise land at y=0 as a phantom section.
    if (cs.position === 'fixed') return false
    if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'LINK', 'META'].includes(el.tagName)) return false
    return rectOf(el).height > 4
  }
  const kidsOf = (el) => [...el.children].filter(inFlow)

  const expand = (el, depth) => {
    const { height } = rectOf(el)
    if (height < vpH * 1.2) return [el] // already viewport-sized: this is a module
    const kids = kidsOf(el)
    if (kids.length === 0) return [el]
    // A pass-through wrapper does not consume a depth step. Real pages stack
    // three or four wrapper divs before the first actual module (Linear:
    // div > div.container > main > div.homepage), and charging each one a
    // level made the whole page come back as two sections.
    if (kids.length === 1) return expand(kids[0], depth)
    if (depth >= 3) return [el]
    // Only treat it as a container if its children actually tile it. Under 0.7
    // it is a real section with absolutely-positioned decoration; over 1.35 the
    // children overlap (stacked layers), and splitting on them is meaningless.
    const covered = kids.reduce((a, k) => a + rectOf(k).height, 0)
    if (covered < height * 0.7 || covered > height * 1.35) return [el]
    // The decisive test: is most of this element's height made of children that
    // are themselves module-sized? A 1,224px section whose three children are
    // 320px each is one module built from three rows, and splitting there turns
    // a like-for-like section comparison back into apples-to-oranges.
    //
    // Weighted by height, not counted: [nav 57, main 4667, footer 231] is only
    // one-third module-sized by count but 94% by height, and main obviously
    // must be opened up.
    const bigShare = kids.reduce((a, k) => {
      const h = rectOf(k).height
      return a + (h >= vpH * 0.4 ? h : 0)
    }, 0) / height
    if (bigShare < 0.6) return [el]
    return kids.flatMap((k) => expand(k, depth + 1))
  }

  const label = (el) => {
    const h = el.querySelector('h1, h2, h3, [role="heading"]')
    const t = (h?.textContent || el.getAttribute('aria-label') || el.id || el.textContent || '')
      .replace(/\s+/g, ' ')
      .trim()
    return t.slice(0, 60)
  }

  let raw = kidsOf(document.body).flatMap((el) => expand(el, 0))
  raw = raw
    .map((el) => {
      const r = rectOf(el)
      const cs = getComputedStyle(el)
      return {
        tag: el.tagName.toLowerCase(),
        id: el.id || null,
        cls: (typeof el.className === 'string' ? el.className : '').split(/\s+/).slice(0, 3).join(' '),
        label: label(el),
        top: Math.round(r.top),
        height: Math.round(r.height),
        padTop: Math.round(parseFloat(cs.paddingTop) || 0),
        padBottom: Math.round(parseFloat(cs.paddingBottom) || 0),
        sticky: cs.position === 'sticky',
      }
    })
    .filter((s) => s.height > 0)
    .sort((a, b) => a.top - b.top)

  // Merge runts forward: sub-quarter-viewport strips are dividers, hairlines
  // and one-line banners, not modules. Keeping them would inflate the section
  // count and wreck the variance numbers.
  const min = vpH * 0.25
  const out = []
  for (const s of raw) {
    const prev = out[out.length - 1]
    if (prev && (s.height < min || prev.height < min) && s.top <= prev.top + prev.height + 4) {
      prev.height = Math.max(prev.height + prev.top, s.top + s.height) - prev.top
      if (!prev.label) prev.label = s.label
      prev.merged = (prev.merged || 1) + 1
    } else {
      out.push({ ...s })
    }
  }
  return out
}

export const getSections = (page, vp) => page.evaluate(SEGMENT_FN, vp.height)
