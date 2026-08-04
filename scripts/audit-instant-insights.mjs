/**
 * Dev Instant Insights audit against a running `next dev` server.
 * Signs in with the local OTP bypass, client-navigates key routes, and
 * reports Next.js Instant Insights / blocking messages from console + overlay.
 */
import { chromium } from "playwright"

const BASE = process.env.AUDIT_BASE_URL ?? "http://localhost:3000"
const EMAIL = process.env.AUDIT_EMAIL ?? "instant-audit@skillsboard.local"

const findings = []
const insightTexts = new Set()

function note(kind, detail) {
  findings.push({ kind, detail })
}

function maybeInsight(text) {
  if (!text) return
  const normalized = text.replace(/\s+/g, " ").trim()
  if (
    /instant|blocking prerender|URL data outside|Ways to fix|export const instant|partial prefetch|uncached data during|Suspense fallback|blocking-prerender|instant-shell|instant-link/i.test(
      normalized,
    )
  ) {
    insightTexts.add(normalized.slice(0, 2000))
    note("insight", normalized.slice(0, 2000))
  }
}

async function captureOverlayInsights(page, label) {
  const texts = await page.evaluate(() => {
    const out = []
    const visit = (root) => {
      if (!root) return
      const text = root.textContent?.replace(/\s+/g, " ").trim()
      if (
        text &&
        /instant|blocking|URL data|Ways to fix|Suspense|uncached|prefetch/i.test(text) &&
        !text.startsWith(":host") &&
        text.length < 5000
      ) {
        out.push(text)
      }
      const nodes = root.querySelectorAll ? root.querySelectorAll("*") : []
      for (const el of nodes) {
        if (el.shadowRoot) visit(el.shadowRoot)
      }
    }
    visit(document)
    for (const portal of document.querySelectorAll("nextjs-portal")) {
      visit(portal.shadowRoot ?? portal)
    }
    return out
  })
  for (const text of texts) maybeInsight(`[${label}] ${text}`)
}

async function clientClick(page, selector, label) {
  const loc = page.locator(selector).first()
  if (!(await loc.count())) {
    note("missing", `${label}: ${selector}`)
    return false
  }
  await loc.click({ timeout: 5000 })
  await page.waitForLoadState("domcontentloaded").catch(() => {})
  await page.waitForTimeout(800)
  note("nav", `${label} -> ${page.url()}`)
  await captureOverlayInsights(page, label)
  return true
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()

page.on("console", (msg) => maybeInsight(`[console:${msg.type()}] ${msg.text()}`))
page.on("pageerror", (error) => maybeInsight(`[pageerror] ${error.message}`))

async function signIn() {
  await page.goto(`${BASE}/sign-in`, { waitUntil: "networkidle" })
  // email step
  const email = page.locator('input[type="email"], input[name="email"]').first()
  await email.fill(EMAIL)
  await page.getByRole("button", { name: /continue/i }).click()
  await page.waitForTimeout(800)
  // OTP step — local dev accepts any 6 digits
  const otp = page.locator('input[autocomplete="one-time-code"], input[name="code"], input[inputmode="numeric"]').first()
  if (await otp.count()) {
    await otp.fill("123456")
    const verify = page.getByRole("button", { name: /verify|continue|sign in/i }).first()
    if (await verify.count()) await verify.click()
  } else {
    // input-otp often uses multiple slots
    const slots = page.locator('[data-input-otp] input, input[maxlength="1"]')
    const count = await slots.count()
    if (count >= 6) {
      for (let i = 0; i < 6; i++) await slots.nth(i).fill(String(i + 1))
    }
  }
  await page.waitForTimeout(1500)
  note("auth", `after sign-in url=${page.url()}`)
}

await signIn()

const routes = [
  "/library",
  "/discover",
  "/collections",
  "/settings/organization",
  "/settings/mcp",
  "/settings/email",
  "/resources",
  "/guides/share-agent-skills-with-your-team",
  "/guides/ai-skill-use-cases-for-teams",
  "/",
  "/privacy",
  "/contact",
]

for (const path of routes) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" }).catch(async () => {
    await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" })
  })
  await page.waitForTimeout(600)
  note("load", `${path} -> ${page.url()}`)
  await captureOverlayInsights(page, `load ${path}`)
}

// Client navigations inside the signed-in shell
await page.goto(`${BASE}/library`, { waitUntil: "networkidle" })
await clientClick(page, 'a[href="/discover"]', "library->discover")
await clientClick(page, 'a[href="/collections"]', "discover->collections")
await clientClick(page, 'a[href="/library"]', "collections->library")
await clientClick(page, 'a[href="/settings/organization"]', "library->org-settings")
await clientClick(page, 'a[href="/settings/mcp"]', "org->mcp")
await clientClick(page, 'a[href="/settings/email"]', "mcp->email")

await page.goto(`${BASE}/resources`, { waitUntil: "networkidle" })
const guideHrefs = await page.locator('a[href^="/guides/"]').evaluateAll((els) =>
  [...new Set(els.map((el) => el.getAttribute("href")).filter(Boolean))],
)
note("guides-found", guideHrefs.slice(0, 8).join(", ") || "(none)")
if (guideHrefs.length >= 2) {
  await page.goto(`${BASE}${guideHrefs[0]}`, { waitUntil: "networkidle" })
  await clientClick(page, `a[href="${guideHrefs[1]}"]`, "guideA->guideB")
  await clientClick(page, `a[href="${guideHrefs[0]}"]`, "guideB->guideA")
}

// Discover view switches (searchParams)
await page.goto(`${BASE}/discover`, { waitUntil: "networkidle" })
await clientClick(page, 'a[href="/discover?view=hot"]', "discover->hot")
await clientClick(page, 'a[href="/discover?view=trending"]', "discover->trending")
await clientClick(page, 'a[href="/discover?view=curated"]', "discover->curated")

await browser.close()

console.log(
  JSON.stringify(
    {
      insightCount: insightTexts.size,
      insights: [...insightTexts],
      findings,
    },
    null,
    2,
  ),
)
