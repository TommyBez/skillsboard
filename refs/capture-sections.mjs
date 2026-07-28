// Per-section viewport captures of our own landing page (fair comparison for
// sticky/scroll-driven sections, which look empty in a naive full-page shot).
// Usage: node refs/capture-sections.mjs <url> <out-prefix> [--mobile] [--dark]
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const [, , url, outBase, ...rest] = process.argv
const flags = new Set(rest)
const mobile = flags.has('--mobile')
const vp = mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }

mkdirSync(dirname(outBase), { recursive: true })

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const ctx = await browser.newContext({
  viewport: vp,
  deviceScaleFactor: 2,
  isMobile: mobile,
  hasTouch: mobile,
  colorScheme: flags.has('--dark') ? 'dark' : 'light',
})
const page = await ctx.newPage()
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.waitForTimeout(2500)

const sections = ['intro', 'flow', 'mcp', 'pricing', 'faq', 'start']
// Walk the page in viewport-sized steps so scroll-driven motion settles.
// behavior:'instant' is load-bearing — the site sets scroll-behavior: smooth,
// so a plain scrollTo animates and never arrives between steps.
const total = await page.evaluate(() => document.body.scrollHeight)
for (let y = 0; y < total; y += Math.floor(vp.height * 0.6)) {
  await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y)
  await page.waitForTimeout(180)
}
await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
await page.waitForTimeout(1500)
await page.screenshot({ path: `${outBase}-00-fold.png` })

let i = 1
for (const id of sections) {
  const found = await page.evaluate((sid) => {
    const el = document.getElementById(sid)
    if (!el) return null
    const top = el.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top, behavior: 'instant' })
    return top
  }, id)
  if (found === null) {
    console.log(`missing section #${id}`)
    continue
  }
  await page.waitForTimeout(1400)
  const n = String(i).padStart(2, '0')
  await page.screenshot({ path: `${outBase}-${n}-${id}.png` })
  // Sticky chapters need a mid-scroll frame too — that is where their motion lives.
  const h = await page.evaluate((sid) => document.getElementById(sid).offsetHeight, id)
  if (h > vp.height * 1.6) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), found + h * 0.5)
    await page.waitForTimeout(1400)
    await page.screenshot({ path: `${outBase}-${n}-${id}-mid.png` })
  }
  i += 1
}
console.log('done')
await browser.close()
