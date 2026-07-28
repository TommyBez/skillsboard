// Like-for-like section capture.
//
//   ./refs/harness/run.sh sections.mjs <url> <label> [--out dir] [--desktop-only]
//                                      [--mobile-only] [--dark] [--max-frames 4]
//
// Why this exists: our whole reference analysis was one full-page screenshot per
// site. Linear's page is 10,898px tall — squeezed into a single image its dense
// product UI becomes an illegible grey smear, and critics penalised it for
// exactly that ("a dim slab of miniature UI"). Live, at 1440×900, it is not.
// Part of our winning margin was an artefact of the framing.
//
// So: segment the page into top-level modules and capture each one at the scale
// a human actually sees it, one viewport at a time. Frames are named
// <label>-<viewport>-<NN>-<slug>[-pN].png with a manifest, so a comparison
// script can pair ours-desktop-01-* against linear-desktop-01-* by index.
import { mkdirSync, writeFileSync } from 'node:fs'
import { launchBrowser, openPage, settle, scrollTo, getSections, slug, VIEWPORTS } from './lib.mjs'

const argv = process.argv.slice(2)
const VALUE_FLAGS = ['--out', '--max-frames']
const flag = (n, d = null) => (argv.indexOf(n) >= 0 ? argv[argv.indexOf(n) + 1] : d)
const has = (n) => argv.includes(n)
const [url, label] = argv.filter((a, i) => !a.startsWith('--') && !VALUE_FLAGS.includes(argv[i - 1]))

if (!url || !label) {
  console.error('usage: sections.mjs <url> <label> [--out dir] [--desktop-only|--mobile-only]')
  process.exit(1)
}
const outDir = flag('--out', 'refs/harness/sections')
const maxFrames = Number(flag('--max-frames', 4))

const viewports = []
if (!has('--mobile-only')) viewports.push(VIEWPORTS.desktop)
if (!has('--desktop-only')) viewports.push(VIEWPORTS.mobile)

mkdirSync(`${outDir}/${label}`, { recursive: true })

const browser = await launchBrowser()
const manifest = { label, url, capturedAt: new Date().toISOString(), viewports: {} }

for (const vp of viewports) {
  const { ctx, page } = await openPage(browser, url, vp, { dark: has('--dark') })
  const docHeight = await settle(page, vp)
  const sections = await getSections(page, vp)

  const entries = []
  let n = 0
  // Measured once per viewport: the tallest bar pinned to the top of the screen
  // that actually paints over content. Without it, every frame of a site with a
  // sticky header opens with that section's first line hidden underneath it —
  // a blind critic caught exactly that on Linear ("the headline is amputated by
  // the viewport, the first line sits behind the nav"), which is the instrument
  // penalising a site for having a fixed nav, not a design judgement.
  const overlayTop = await page.evaluate(() => {
    let worst = 0
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el)
      if (cs.position !== 'fixed' && cs.position !== 'sticky') continue
      if (cs.visibility === 'hidden' || cs.opacity === '0') continue
      const r = el.getBoundingClientRect()
      if (r.top > 4 || r.height < 8 || r.height > 200) continue
      if (r.width < window.innerWidth * 0.5) continue
      worst = Math.max(worst, Math.round(r.bottom))
    }
    return worst
  })

  for (const s of sections) {
    n += 1
    const idx = String(n).padStart(2, '0')
    // Role is what makes cross-site pairing meaningful: comparing "our hero vs
    // their hero" is the question; comparing "our section 4 vs their section 4"
    // usually is not.
    const role = n === 1 ? 'hero' : n === sections.length ? 'footer' : `body${n - 1}`
    const name = `${label}-${vp.name}-${idx}-${slug(s.label || s.id || s.tag)}`

    // A module taller than the viewport is not one image. Capture it as the
    // consecutive screens a visitor would actually scroll through, capped, so
    // a 5,000px sticky chapter does not produce forty frames.
    const screens = Math.max(1, Math.min(maxFrames, Math.ceil(s.height / vp.height)))
    const frames = []
    for (let k = 0; k < screens; k++) {
      // Spread the frames across the section rather than tiling from the top:
      // for a tall section the interesting states are distributed through it.
      const y = screens === 1
        ? s.top
        : Math.round(s.top + (k * (s.height - vp.height)) / (screens - 1))
      // Offset by any fixed/sticky overlay pinned to the top, or the frame
      // opens with the section's first line hidden behind someone's nav. A
      // blind critic caught this on Linear — "the headline is amputated by the
      // viewport, the first line sits behind the nav" — which is the instrument
      // penalising a site for having a sticky header, not a design judgement.
      await scrollTo(page, Math.max(0, Math.min(y - overlayTop, docHeight - vp.height)))
      await page.waitForTimeout(900)
      const file = screens === 1 ? `${name}.png` : `${name}-p${k + 1}.png`
      await page.screenshot({ path: `${outDir}/${label}/${file}` })
      frames.push(file)
    }
    entries.push({ index: n, role, slug: slug(s.label || s.id || s.tag), label: s.label, top: s.top, height: s.height, screens, sticky: s.sticky, frames })
    console.log(`[${label}/${vp.name}] ${idx} ${role} "${(s.label || '').slice(0, 34)}" ${s.height}px -> ${frames.length} frame(s)`)
  }

  manifest.viewports[vp.name] = { docHeight, sectionCount: entries.length, sections: entries }
  await ctx.close()
}
await browser.close()

writeFileSync(`${outDir}/${label}/manifest.json`, JSON.stringify(manifest, null, 2))
console.log(`wrote ${outDir}/${label}/manifest.json`)
