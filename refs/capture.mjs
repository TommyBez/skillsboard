// Screenshot capture utility.
//   node refs/capture.mjs <url> <out-basename> [--desktop-only|--mobile-only] [--wait ms] [--dark]
//
// External hosts are fetched through Node's env proxy and fulfilled into the
// page: Chromium's own TLS to the egress proxy gets reset, Node's does not.
// NODE_USE_ENV_PROXY must be set before node starts — use refs/shot.sh.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const [, , url, outBase, ...rest] = process.argv
if (!url || !outBase) {
  console.error('usage: node capture.mjs <url> <out-basename> [flags]')
  process.exit(1)
}
const flags = new Set(rest.filter((r) => r.startsWith('--')))
const waitIdx = rest.indexOf('--wait')
const parsedWait = waitIdx >= 0 ? Number(rest[waitIdx + 1]) : 3500
const waitMs = Number.isFinite(parsedWait) && parsedWait >= 0 ? parsedWait : 3500
const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)([:/]|$)/.test(url)

const viewports = []
if (!flags.has('--mobile-only')) viewports.push({ name: 'desktop', width: 1440, height: 900 })
if (!flags.has('--desktop-only')) viewports.push({ name: 'mobile', width: 390, height: 844 })

mkdirSync(dirname(outBase), { recursive: true })

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
        if (
          !['content-encoding', 'content-length', 'transfer-encoding', 'content-security-policy']
            .includes(k)
        ) {
          outHeaders[k] = v
        }
      })
      await route.fulfill({ status: res.status, headers: outHeaders, body })
    } catch (e) {
      if (process.env.CAPTURE_DEBUG) console.error('route fail', req.url().slice(0, 90), e.message)
      await route.abort()
    }
  })
}

for (const vp of viewports) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
    isMobile: vp.name === 'mobile',
    hasTouch: vp.name === 'mobile',
    colorScheme: flags.has('--dark') ? 'dark' : 'light',
    ignoreHTTPSErrors: true,
    userAgent:
      vp.name === 'mobile'
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        : undefined,
  })
  await attachProxyRouting(ctx)
  const page = await ctx.newPage()
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 })
  } catch (e) {
    console.error(`[${vp.name}] goto failed: ${e.message.split('\n')[0]}`)
  }
  await page.waitForTimeout(waitMs)
  // Walk the page so lazy content and scroll-triggered reveals settle before
// capture. behavior:'instant' is load-bearing — the site sets
// scroll-behavior: smooth, so a plain scrollTo animates and never arrives
// between steps, leaving late sections unrevealed and blank in the capture.
  const h = await page.evaluate(() => document.body.scrollHeight)
  for (let y = 0; y < h; y += Math.floor(vp.height * 0.7)) {
    await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y)
    await page.waitForTimeout(260)
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${outBase}-${vp.name}-fold.png` })
  await page.screenshot({ path: `${outBase}-${vp.name}-full.png`, fullPage: true })
  console.log(`[${vp.name}] captured ${outBase}-${vp.name}-{fold,full}.png (height ${h}px)`)
  await ctx.close()
}
await browser.close()
