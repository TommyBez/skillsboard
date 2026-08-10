import { test } from "@playwright/test"

import { expectInstantInitialLoad, expectInstantSoftNav, readFixtures } from "./helpers"

// Public surface: no session. Every assertion is the destination's static
// shell committing under the instant() lock; `content` markers are the
// deferred data that must stay gated until the lock releases.
test.use({ storageState: { cookies: [], origins: [] } })

const GUIDE_PATH = "/guides/shared-mcp-skill-library-for-teams"

test.describe("instant initial load: public routes", () => {
  test("/", async ({ page }) => {
    await expectInstantInitialLoad(page, "/", "home-shell")
  })

  test("/pricing", async ({ page }) => {
    await expectInstantInitialLoad(page, "/pricing", "pricing-shell")
  })

  test("/about", async ({ page }) => {
    await expectInstantInitialLoad(page, "/about", "about-shell")
  })

  test("/resources", async ({ page }) => {
    await expectInstantInitialLoad(page, "/resources", "resources-shell")
  })

  test(GUIDE_PATH, async ({ page }) => {
    await expectInstantInitialLoad(page, GUIDE_PATH, "guide-shell")
  })

  test("/contact", async ({ page }) => {
    await expectInstantInitialLoad(page, "/contact", "legal-shell")
  })

  test("/privacy", async ({ page }) => {
    await expectInstantInitialLoad(page, "/privacy", "legal-shell")
  })

  test("/terms", async ({ page }) => {
    await expectInstantInitialLoad(page, "/terms", "legal-shell")
  })

  test("/sign-in", async ({ page }) => {
    await expectInstantInitialLoad(page, "/sign-in", "access-shell", "sign-in-content")
  })

  test("/sign-up", async ({ page }) => {
    await expectInstantInitialLoad(page, "/sign-up", "access-shell", "sign-up-content")
  })

  test("/email/unsubscribe", async ({ page }) => {
    await expectInstantInitialLoad(page, "/email/unsubscribe", "legal-shell", "unsubscribe-content")
  })

  test("/p/[shareId]", async ({ page }) => {
    await expectInstantInitialLoad(page, `/p/${readFixtures().shareId}`, "share-shell", "share-content")
  })

  test("/invite/[invitationId]", async ({ page }) => {
    // Unauthenticated visitors are redirected to sign-up by the deferred gate;
    // under the lock the route still commits its shell. A bogus id is enough.
    await expectInstantInitialLoad(page, "/invite/e2e-not-a-real-invitation", "invite-shell", "access-shell")
  })
})

test.describe("instant soft navigation: public routes", () => {
  // The marketing chromes style their header CTAs as buttons but render them
  // as <a> elements (Base UI Button with nativeButton={false}), so href
  // selectors are the robust handle.
  test("/ -> /sign-in (header)", async ({ page }) => {
    await expectInstantSoftNav(page, {
      from: "/",
      trigger: (p) => p.locator('header a[href="/sign-in"]'),
      shellTestId: "access-shell",
      shellText: "Welcome back",
      contentTestId: "sign-in-content",
    })
  })

  test("/ -> /sign-up (header)", async ({ page }) => {
    await expectInstantSoftNav(page, {
      from: "/",
      trigger: (p) => p.locator('header a[href="/sign-up"]'),
      shellTestId: "access-shell",
      shellText: "Create your shared AI skill library",
      contentTestId: "sign-up-content",
    })
  })

  test("/ -> /resources (footer)", async ({ page }) => {
    await expectInstantSoftNav(page, {
      from: "/",
      trigger: (p) => p.getByRole("navigation", { name: "Footer" }).getByRole("link", { name: "Resources" }),
      shellTestId: "resources-shell",
    })
  })

  test("/ -> /about (footer)", async ({ page }) => {
    await expectInstantSoftNav(page, {
      from: "/",
      trigger: (p) => p.getByRole("navigation", { name: "Footer" }).getByRole("link", { name: "About" }),
      shellTestId: "about-shell",
    })
  })

  test("/resources -> /guides/[slug] (guide card)", async ({ page }) => {
    await expectInstantSoftNav(page, {
      from: "/resources",
      trigger: (p) => p.locator(`a[href="${GUIDE_PATH}"]`).first(),
      shellTestId: "guide-shell",
    })
  })

  test("/resources -> /about (learn more)", async ({ page }) => {
    await expectInstantSoftNav(page, {
      from: "/resources",
      trigger: (p) => p.getByRole("link", { name: "Learn more about Skills Board" }),
      shellTestId: "about-shell",
    })
  })

  test("/pricing -> /sign-in (header)", async ({ page }) => {
    await expectInstantSoftNav(page, {
      from: "/pricing",
      trigger: (p) => p.locator('header a[href="/sign-in"]'),
      shellTestId: "access-shell",
      shellText: "Welcome back",
      contentTestId: "sign-in-content",
    })
  })

  test("/guides/[slug] -> /resources (breadcrumb)", async ({ page }) => {
    await expectInstantSoftNav(page, {
      from: GUIDE_PATH,
      trigger: (p) => p.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: "Resources" }),
      shellTestId: "resources-shell",
    })
  })

  test("/sign-in -> /sign-up (alternate action)", async ({ page }) => {
    // The switch link lives inside the deferred AuthForm, so the starting
    // page must finish streaming before it can be clicked. Both pages share
    // the access-shell marker, so the destination title disambiguates.
    await expectInstantSoftNav(page, {
      from: "/sign-in",
      trigger: (p) => p.getByRole("link", { name: "Create an account" }),
      shellTestId: "access-shell",
      shellText: "Create your shared AI skill library",
      contentTestId: "sign-up-content",
    })
  })
})

test.describe("instant shells hold at mobile width", () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test("/ (mobile)", async ({ page }) => {
    await expectInstantInitialLoad(page, "/", "home-shell")
  })

  test("/resources (mobile)", async ({ page }) => {
    await expectInstantInitialLoad(page, "/resources", "resources-shell")
  })
})
