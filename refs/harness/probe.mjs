// In-page DOM probe for refs/harness/audit.mjs.
//
// Everything here is serialised into the browser by page.evaluate, so it must
// be a single self-contained function with no imports and no closure over
// module scope. Exported separately from audit.mjs only to keep that file
// readable — nothing here runs in Node.

export function probe(cfg) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const doc = document.documentElement
  const TEXT_MIN = 2

  // ---------- small utilities ----------

  function selectorFor(el) {
    const parts = []
    let node = el
    for (let depth = 0; node && node.nodeType === 1 && depth < 4; depth++) {
      let part = node.tagName.toLowerCase()
      if (node.id) {
        parts.unshift(`#${node.id}`)
        break
      }
      const cls = (node.getAttribute('class') || '')
        .trim()
        .split(/\s+/)
        .filter((c) => c && !/^(css-|jsx-)/.test(c))
        .slice(0, 2)
      if (cls.length) part += `.${cls.join('.')}`
      const parent = node.parentElement
      if (parent) {
        const sibs = [...parent.children].filter((s) => s.tagName === node.tagName)
        if (sibs.length > 1) part += `:nth-of-type(${sibs.indexOf(node) + 1})`
      }
      parts.unshift(part)
      node = node.parentElement
    }
    return parts.join(' > ')
  }

  // Colours are resolved by painting them on a 1px canvas over black and then
  // over white, which recovers alpha from the difference. A regex over
  // getComputedStyle is not enough: this page's tokens are oklch(), and
  // Chromium keeps oklch/color-mix/lab in the computed value rather than
  // serialising to rgb(). Reading them as unparseable made every contrast
  // ratio come back 1:1 and every accent colour disappear.
  const paint = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  paint.canvas.width = 1
  paint.canvas.height = 1
  const colorCache = new Map()
  function parseColor(str) {
    if (!str || str === 'transparent' || str === 'none') return { r: 0, g: 0, b: 0, a: 0 }
    const hit = colorCache.get(str)
    if (hit) return hit
    const read = (backdrop) => {
      paint.globalCompositeOperation = 'copy'
      paint.fillStyle = backdrop
      paint.fillRect(0, 0, 1, 1)
      paint.globalCompositeOperation = 'source-over'
      paint.fillStyle = '#010203'
      paint.fillStyle = str
      if (paint.fillStyle === '#010203' && !/^#010203$/i.test(str.trim())) return null
      paint.fillRect(0, 0, 1, 1)
      return paint.getImageData(0, 0, 1, 1).data
    }
    let out = { r: 0, g: 0, b: 0, a: 0 }
    const onBlack = read('#000000')
    const onWhite = read('#ffffff')
    if (onBlack && onWhite) {
      const a =
        1 -
        ((onWhite[0] - onBlack[0]) + (onWhite[1] - onBlack[1]) + (onWhite[2] - onBlack[2])) / (3 * 255)
      const alpha = Math.min(1, Math.max(0, a))
      out = alpha < 0.004
        ? { r: 0, g: 0, b: 0, a: 0 }
        : { r: onBlack[0] / alpha, g: onBlack[1] / alpha, b: onBlack[2] / alpha, a: alpha }
    }
    colorCache.set(str, out)
    return out
  }

  function over(fg, bg) {
    const a = fg.a + bg.a * (1 - fg.a)
    if (a === 0) return { r: 0, g: 0, b: 0, a: 0 }
    return {
      r: (fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / a,
      g: (fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / a,
      b: (fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / a,
      a,
    }
  }

  function lum(c) {
    const f = (v) => {
      const s = v / 255
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
    }
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b)
  }

  function contrast(a, b) {
    const l1 = lum(a)
    const l2 = lum(b)
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
  }

  function rgbStr(c) {
    return `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`
  }

  // Chroma proxy: how far the colour is from the grey axis. Cheap and good
  // enough to separate an accent from the neutral ramp.
  function chroma(c) {
    return Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b)
  }

  const styleCache = new Map()
  function cs(el) {
    let s = styleCache.get(el)
    if (!s) {
      s = getComputedStyle(el)
      styleCache.set(el, s)
    }
    return s
  }

  // display:none removes the box for the whole subtree, but a descendant's own
  // computed display is still 'flex' or 'block'. Without walking up, every
  // string inside a mobile-hidden card reads as 0x0 invisible text.
  function isRendered(el) {
    let node = el
    while (node && node.nodeType === 1) {
      if (cs(node).display === 'none') return false
      if (cs(node).contentVisibility === 'hidden') return false
      node = node.parentElement
    }
    return true
  }

  function directText(el) {
    let out = ''
    for (const n of el.childNodes) if (n.nodeType === 3) out += n.nodeValue
    return out.replace(/\s+/g, ' ').trim()
  }

  function isPresentational(el) {
    return el.getAttribute('aria-hidden') === 'true' || el.hasAttribute('inert')
  }

  // The visually-hidden idiom (1px box, clipped, absolute) is deliberate; it
  // must not show up as an invisible-content defect.
  function isScreenReaderOnly(el, s, rect) {
    if (rect.width <= 2 && rect.height <= 2 && s.position === 'absolute') return true
    return /inset\(\s*50%/.test(s.clip || '') || /inset\(\s*50%/.test(s.clipPath || '')
  }

  function effectiveBackground(el) {
    let acc = { r: 0, g: 0, b: 0, a: 0 }
    let imageBehind = false
    let node = el
    while (node && node.nodeType === 1) {
      const s = cs(node)
      if (s.backgroundImage && s.backgroundImage !== 'none') imageBehind = true
      const c = parseColor(s.backgroundColor)
      if (c.a > 0) {
        acc = over(acc, c)
        if (acc.a >= 0.999) return { color: acc, uncertain: imageBehind }
      }
      node = node.parentElement
    }
    // Nothing opaque all the way up: fall back to the canvas colour.
    const canvas = parseColor(cs(document.body).backgroundColor)
    const root = parseColor(cs(doc).backgroundColor)
    let base = canvas.a >= 0.999 ? canvas : root.a >= 0.999 ? root : { r: 255, g: 255, b: 255, a: 1 }
    return { color: over(acc, base), uncertain: imageBehind }
  }

  function inheritedOpacity(el) {
    let o = 1
    let node = el
    while (node && node.nodeType === 1) {
      o *= Number(cs(node).opacity)
      node = node.parentElement
    }
    return o
  }

  // Nearest ancestor that clips on x, with how much of its own content it
  // hides. A marquee belt or a carousel track parks items far outside a box
  // that hides most of its width on purpose; a chip whose tail is cut off does
  // not. Without this distinction every infinite marquee on the web reads as
  // ninety broken strings.
  function clipContextX(el) {
    let node = el.parentElement
    let guard = 0
    while (node && node.nodeType === 1 && guard++ < 24) {
      const s = cs(node)
      if (s.overflowX === 'hidden' || s.overflowX === 'clip') {
        const r = node.getBoundingClientRect()
        const bl = parseFloat(s.borderLeftWidth) || 0
        const br = parseFloat(s.borderRightWidth) || 0
        const box = { left: r.left + bl, right: r.right - br }
        const span = box.right - box.left
        return { node, box, ratio: span > 0 ? node.scrollWidth / span : 1 }
      }
      node = node.parentElement
    }
    return null
  }

  function scrollableAncestor(el, axis) {
    let node = el.parentElement
    while (node && node.nodeType === 1) {
      const s = cs(node)
      const v = axis === 'x' ? s.overflowX : s.overflowY
      if (v === 'auto' || v === 'scroll') return node
      node = node.parentElement
    }
    return null
  }

  function snippet(el) {
    const t = (el.textContent || '').replace(/\s+/g, ' ').trim()
    return t.length > 90 ? `${t.slice(0, 90)}…` : t
  }

  const PROSE_TAGS = new Set([
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'code', 'pre', 'span', 'a', 'button',
    'label', 'strong', 'em', 'blockquote', 'dt', 'dd', 'figcaption', 'small', 'td', 'th',
    'summary', 'legend', 'option', 'kbd', 'samp',
  ])

  const SURFACE_TAGS = new Set(['img', 'svg', 'canvas', 'video', 'picture', 'iframe'])

  // ---------- single pass over the DOM ----------

  const all = [...document.body.querySelectorAll('*')]
  const overflowText = []
  const overflowSurface = []
  const overflowScrollable = []
  const overflowOffstage = []
  const ellipsis = []
  const clipped = []
  const invisibleText = []
  const smallTargets = []
  const contrastAll = []
  const contrastUnknown = []
  const typeMap = new Map()
  const padMap = new Map()
  const marginMap = new Map()
  const gapMap = new Map()
  const radiusMap = new Map()
  const shadowMap = new Map()
  const accentMap = new Map()
  const accentBands = new Map()
  let accentVisible = 0

  const scrollY = window.scrollY
  const scrollX = window.scrollX

  for (const el of all) {
    if (el.closest('[data-audit-ignore]')) continue
    const tag = el.tagName.toLowerCase()
    if (tag === 'script' || tag === 'style' || tag === 'noscript' || tag === 'template') continue

    const s = cs(el)
    if (s.display === 'none' || !isRendered(el)) continue
    const rect = el.getBoundingClientRect()
    const own = directText(el)
    const hasOwnText = own.length >= TEXT_MIN
    const anyText = (el.textContent || '').trim().length >= TEXT_MIN
    const opacity = inheritedOpacity(el)
    const hidden = s.visibility === 'hidden' || s.visibility === 'collapse'
    const zeroSize = rect.width < 1 || rect.height < 1
    const visible = !hidden && opacity > 0.05 && !zeroSize

    // --- invisible or unreachable text ---
    if (hasOwnText && !isPresentational(el) && !isScreenReaderOnly(el, s, rect)) {
      const reasons = []
      if (opacity <= 0.05) reasons.push(`opacity ${opacity.toFixed(3)}`)
      if (hidden) reasons.push(`visibility: ${s.visibility}`)
      if (zeroSize) reasons.push(`size ${rect.width.toFixed(1)}x${rect.height.toFixed(1)}`)
      if (reasons.length) {
        invisibleText.push({
          selector: selectorFor(el),
          tag,
          text: own.slice(0, 90),
          reasons,
          docY: Math.round(rect.top + scrollY),
        })
      }
    }

    if (!visible) continue

    const right = rect.right
    const overshoot = right - vw

    // --- horizontal overflow past the viewport edge ---
    if (overshoot > 1 && rect.width > 0) {
      const scroller = scrollableAncestor(el, 'x')
      const entry = {
        selector: selectorFor(el),
        tag,
        text: snippet(el).slice(0, 90),
        rect: {
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        },
        overshootPx: Math.round(overshoot),
        docY: Math.round(rect.top + scrollY),
      }
      const carriesCopy = hasOwnText && (PROSE_TAGS.has(tag) || el.childElementCount === 0)
      const clip = clipContextX(el)
      const offstage = clip && clip.ratio >= 1.5 && rect.left >= clip.box.right - 1
      if (scroller) {
        entry.scrollableAncestor = selectorFor(scroller)
        overflowScrollable.push(entry)
      } else if (offstage) {
        entry.parkedOutside = selectorFor(clip.node)
        entry.containerCropRatio = Math.round(clip.ratio * 100) / 100
        overflowOffstage.push(entry)
      } else if (carriesCopy) {
        overflowText.push(entry)
      } else if (!anyText || SURFACE_TAGS.has(tag) || rect.width > vw * 0.3) {
        entry.plausibleCrop = SURFACE_TAGS.has(tag) || rect.width > vw * 0.3
        overflowSurface.push(entry)
      } else {
        overflowSurface.push({ ...entry, plausibleCrop: false })
      }
    }

    // --- ellipsis actually triggering ---
    if (
      s.textOverflow === 'ellipsis' &&
      anyText &&
      el.scrollWidth > el.clientWidth + 1 &&
      el.clientWidth > 0
    ) {
      ellipsis.push({
        selector: selectorFor(el),
        tag,
        text: snippet(el),
        visibleWidth: el.clientWidth,
        contentWidth: el.scrollWidth,
        docY: Math.round(rect.top + scrollY),
      })
    }
    // line-clamp is ellipsis by another name
    if (anyText && s.webkitLineClamp && s.webkitLineClamp !== 'none' && el.scrollHeight > el.clientHeight + 1) {
      ellipsis.push({
        selector: selectorFor(el),
        tag,
        text: snippet(el),
        lineClamp: s.webkitLineClamp,
        visibleHeight: el.clientHeight,
        contentHeight: el.scrollHeight,
        docY: Math.round(rect.top + scrollY),
      })
    }

    // --- text clipped by an overflow:hidden ancestor ---
    if (hasOwnText) {
      let node = el.parentElement
      let guard = 0
      while (node && node.nodeType === 1 && guard++ < 24) {
        const ps = cs(node)
        const clipX = ps.overflowX === 'hidden' || ps.overflowX === 'clip'
        const clipY = ps.overflowY === 'hidden' || ps.overflowY === 'clip'
        if (clipX || clipY) {
          const pr = node.getBoundingClientRect()
          const bt = parseFloat(ps.borderTopWidth) || 0
          const bb = parseFloat(ps.borderBottomWidth) || 0
          const bl = parseFloat(ps.borderLeftWidth) || 0
          const br = parseFloat(ps.borderRightWidth) || 0
          const box = {
            top: pr.top + bt,
            bottom: pr.bottom - bb,
            left: pr.left + bl,
            right: pr.right - br,
          }
          const outBottom = rect.bottom - box.bottom
          const outRight = rect.right - box.right
          const outTop = box.top - rect.top
          const outLeft = box.left - rect.left
          const worst = Math.max(
            clipY ? Math.max(outBottom, outTop) : 0,
            clipX ? Math.max(outRight, outLeft) : 0,
          )
          if (worst > 2) {
            const axis = clipX && Math.max(outRight, outLeft) > 2 ? 'x' : 'y'
            const span = axis === 'x' ? box.right - box.left : box.bottom - box.top
            const content = axis === 'x' ? node.scrollWidth : node.scrollHeight
            const cropRatio = span > 0 ? content / span : 1
            // Three different situations, and collapsing them is how a real
            // slice hides inside a page full of deliberate crops:
            //   sliced          a word cut off inside a box that was meant to
            //                   hold it — always an accident
            //   cropped-surface the box hides most of its content on purpose
            //                   (a card stack, a bleeding product mock)
            //   beyond-crop     the element sits entirely outside the box
            const inside = axis === 'x' ? rect.left < box.right : rect.top < box.bottom
            const category = !inside
              ? 'beyond-crop'
              : cropRatio >= 1.5
                ? 'cropped-surface'
                : 'sliced'
            clipped.push({
              selector: selectorFor(el),
              text: own.slice(0, 90),
              clippedBy: selectorFor(node),
              axis,
              hiddenPx: Math.round(worst),
              containerPx: Math.round(span),
              cropRatio: Math.round(cropRatio * 100) / 100,
              category,
              docY: Math.round(rect.top + scrollY),
            })
            break
          }
        }
        node = node.parentElement
      }
    }

    // --- tap targets ---
    const interactive =
      tag === 'button' ||
      tag === 'summary' ||
      tag === 'select' ||
      tag === 'textarea' ||
      (tag === 'input' && el.type !== 'hidden') ||
      (tag === 'a' && el.hasAttribute('href')) ||
      ['button', 'link', 'menuitem', 'tab', 'switch', 'checkbox', 'radio'].includes(
        el.getAttribute('role') || '',
      )
    if (interactive && !isPresentational(el)) {
      // An inline link inside running prose is a word, not a tap target.
      const inlineInProse =
        (s.display === 'inline' || s.display === 'inline-block') &&
        !!el.closest('p, li, blockquote, dd, figcaption') &&
        el.getBoundingClientRect().height < 40
      const w = rect.width
      const h = rect.height
      if (!inlineInProse && (w < 44 || h < 44)) {
        smallTargets.push({
          selector: selectorFor(el),
          tag,
          label: (el.getAttribute('aria-label') || snippet(el) || '').slice(0, 60),
          size: `${Math.round(w)}x${Math.round(h)}`,
          width: Math.round(w),
          height: Math.round(h),
          docY: Math.round(rect.top + scrollY),
        })
      }
    }

    // --- type, spacing, radius, shadow, accent inventories ---
    const inDoc = rect.top + scrollY
    if (hasOwnText) {
      const family = s.fontFamily.split(',')[0].replace(/["']/g, '').trim()
      const key = [
        `${Math.round(parseFloat(s.fontSize) * 10) / 10}px`,
        s.fontWeight,
        family,
        s.lineHeight === 'normal' ? 'normal' : `${Math.round(parseFloat(s.lineHeight) * 10) / 10}px`,
        s.letterSpacing === 'normal' ? '0' : `${Math.round(parseFloat(s.letterSpacing) * 100) / 100}px`,
      ].join(' | ')
      const rec = typeMap.get(key) || { key, count: 0, example: selectorFor(el), sample: own.slice(0, 48) }
      rec.count++
      typeMap.set(key, rec)

      // --- contrast ---
      const fgRaw = parseColor(s.color)
      const bg = effectiveBackground(el)
      const fg = over({ ...fgRaw, a: fgRaw.a * opacity }, bg.color)
      const size = parseFloat(s.fontSize)
      const weight = Number(s.fontWeight) || 400
      const large = size >= 24 || (size >= 18.66 && weight >= 700)
      const ratio = contrast(fg, bg.color)
      const item = {
        selector: selectorFor(el),
        text: own.slice(0, 60),
        fontSize: Math.round(size * 10) / 10,
        weight,
        large,
        fg: rgbStr(fg),
        bg: rgbStr(bg.color),
        ratio: Math.round(ratio * 100) / 100,
        required: large ? 3 : 4.5,
        docY: Math.round(inDoc),
      }
      if (bg.uncertain) contrastUnknown.push(item)
      else contrastAll.push(item)
    }

    for (const [prop, map] of [
      ['padding', padMap],
      ['margin', marginMap],
    ]) {
      for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
        const v = s[prop + side]
        const n = parseFloat(v)
        if (!n || Number.isNaN(n)) continue
        const k = `${Math.round(n * 10) / 10}px`
        const rec = map.get(k) || { value: k, count: 0, example: selectorFor(el) }
        rec.count++
        map.set(k, rec)
      }
    }
    for (const g of [s.rowGap, s.columnGap]) {
      const n = parseFloat(g)
      if (!n || Number.isNaN(n)) continue
      const k = `${Math.round(n * 10) / 10}px`
      const rec = gapMap.get(k) || { value: k, count: 0, example: selectorFor(el) }
      rec.count++
      gapMap.set(k, rec)
    }
    if (parseFloat(s.borderTopLeftRadius) > 0) {
      const k = [s.borderTopLeftRadius, s.borderTopRightRadius, s.borderBottomRightRadius, s.borderBottomLeftRadius]
        .join(' ')
      const rec = radiusMap.get(k) || { value: k, count: 0, example: selectorFor(el) }
      rec.count++
      radiusMap.set(k, rec)
    }
    if (s.boxShadow && s.boxShadow !== 'none') {
      const rec = shadowMap.get(s.boxShadow) || { value: s.boxShadow, count: 0, example: selectorFor(el) }
      rec.count++
      shadowMap.set(s.boxShadow, rec)
    }

    const accentHits = []
    if (hasOwnText) accentHits.push(parseColor(s.color))
    accentHits.push(parseColor(s.backgroundColor))
    accentHits.push(parseColor(s.borderTopColor))
    if (tag === 'svg' || tag === 'path') accentHits.push(parseColor(s.fill))
    const accents = accentHits.filter((c) => c.a > 0.2 && chroma(c) > 24)
    if (accents.length) {
      accentVisible++
      const band = Math.floor((rect.top + scrollY) / vh)
      accentBands.set(band, (accentBands.get(band) || 0) + 1)
      for (const c of accents) {
        const k = rgbStr(c)
        accentMap.set(k, (accentMap.get(k) || 0) + 1)
      }
    }
  }

  // ---------- roll-ups ----------

  const byCount = (a, b) => b.count - a.count
  const bands = [...accentBands.entries()].map(([band, count]) => ({ band, count })).sort((a, b) => a.band - b.band)

  const contrastFailures = contrastAll
    .filter((c) => c.ratio < c.required)
    .sort((a, b) => a.ratio - b.ratio)

  // Collapse identical colour/size pairs so one repeated component does not
  // drown out five distinct problems.
  const failGroups = new Map()
  for (const f of contrastFailures) {
    const k = `${f.fg}|${f.bg}|${f.fontSize}|${f.weight}`
    const rec = failGroups.get(k) || { ...f, count: 0 }
    rec.count++
    failGroups.set(k, rec)
  }

  return {
    viewport: { width: vw, height: vh },
    document: {
      scrollWidth: doc.scrollWidth,
      scrollHeight: doc.scrollHeight,
      bodyScrollWidth: document.body.scrollWidth,
      horizontalOverflowPx: Math.max(0, doc.scrollWidth - vw),
      elementsScanned: all.length,
      scrollX,
      scrollY,
    },
    overflow: {
      documentOverflowPx: Math.max(0, doc.scrollWidth - vw),
      text: overflowText.sort((a, b) => b.overshootPx - a.overshootPx).slice(0, cfg.cap),
      surface: overflowSurface.sort((a, b) => b.overshootPx - a.overshootPx).slice(0, cfg.cap),
      scrollable: overflowScrollable.sort((a, b) => b.overshootPx - a.overshootPx).slice(0, cfg.cap),
      offstage: overflowOffstage.sort((a, b) => b.overshootPx - a.overshootPx).slice(0, cfg.cap),
      counts: {
        text: overflowText.length,
        surface: overflowSurface.length,
        surfacePlausibleCrop: overflowSurface.filter((o) => o.plausibleCrop).length,
        scrollable: overflowScrollable.length,
        offstage: overflowOffstage.length,
      },
    },
    truncation: {
      ellipsis: ellipsis.slice(0, cfg.cap),
      clipped: clipped
        .sort((a, b) => (a.category === b.category ? b.hiddenPx - a.hiddenPx : a.category === 'sliced' ? -1 : 1))
        .slice(0, cfg.cap),
      counts: {
        ellipsis: ellipsis.length,
        clipped: clipped.length,
        sliced: clipped.filter((c) => c.category === 'sliced').length,
        croppedSurface: clipped.filter((c) => c.category === 'cropped-surface').length,
        beyondCrop: clipped.filter((c) => c.category === 'beyond-crop').length,
      },
    },
    invisibleText: { items: invisibleText.slice(0, cfg.cap), count: invisibleText.length },
    tapTargets: {
      items: smallTargets.sort((a, b) => a.width * a.height - b.width * b.height).slice(0, cfg.cap),
      count: smallTargets.length,
    },
    contrast: {
      textElements: contrastAll.length,
      failures: [...failGroups.values()].sort((a, b) => a.ratio - b.ratio).slice(0, cfg.cap),
      failureCount: contrastFailures.length,
      bodyFailureCount: contrastFailures.filter((c) => !c.large).length,
      overImageCount: contrastUnknown.length,
      overImageWorst: contrastUnknown.sort((a, b) => a.ratio - b.ratio).slice(0, 5),
      worstPassing: contrastAll.filter((c) => c.ratio >= c.required).sort((a, b) => a.ratio - b.ratio).slice(0, 5),
    },
    type: {
      combinations: typeMap.size,
      items: [...typeMap.values()].sort(byCount),
    },
    spacing: {
      padding: { distinct: padMap.size, items: [...padMap.values()].sort(byCount).slice(0, 40) },
      margin: { distinct: marginMap.size, items: [...marginMap.values()].sort(byCount).slice(0, 40) },
      gap: { distinct: gapMap.size, items: [...gapMap.values()].sort(byCount).slice(0, 40) },
      offScale: [...padMap.values(), ...marginMap.values(), ...gapMap.values()]
        .filter((v) => {
          const n = parseFloat(v.value)
          return n >= 4 && Math.abs(n / 4 - Math.round(n / 4)) > 0.01
        })
        .sort(byCount)
        .slice(0, 20),
    },
    radii: { distinct: radiusMap.size, items: [...radiusMap.values()].sort(byCount).slice(0, 20) },
    shadows: { distinct: shadowMap.size, items: [...shadowMap.values()].sort(byCount).slice(0, 12) },
    accent: {
      distinctColors: accentMap.size,
      colors: [...accentMap.entries()].map(([color, count]) => ({ color, count })).sort(byCount),
      elementsTotal: accentVisible,
      perViewportBand: bands,
      maxPerViewport: bands.reduce((m, b) => Math.max(m, b.count), 0),
      meanPerViewport: bands.length
        ? Math.round((bands.reduce((s2, b) => s2 + b.count, 0) / bands.length) * 10) / 10
        : 0,
    },
  }
}
