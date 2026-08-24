import path from "node:path"

import { test, type Page } from "@playwright/test"

import { expectInstantInitialLoad, expectInstantSoftNav, readFixtures } from "./helpers"

// Signed-in surface: the session is the storage state written by global-setup
// (Better Auth dev OTP bypass), so initial-load guards never navigate to log
// in first. The test user owns one organization with one seeded skill and one
// seeded collection.
test.use({ storageState: path.join(process.cwd(), "e2e", ".auth", "user.json") })

test.describe("instant initial load: app routes", () => {
  test("/library", async ({ page }) => {
    await expectInstantInitialLoad(page, "/library", "library-shell", "library-content")
  })

  test("/collections", async ({ page }) => {
    await expectInstantInitialLoad(page, "/collections", "collections-shell", "collections-content")
  })

  test("/collections/[collectionId]", async ({ page }) => {
    await expectInstantInitialLoad(
      page,
      `/collections/${readFixtures().collectionId}`,
      "collection-detail-shell",
      "collection-detail-content",
    )
  })

  test("/discover", async ({ page }) => {
    await expectInstantInitialLoad(page, "/discover", "discover-shell", "discover-content")
  })

  test("/settings/organization", async ({ page }) => {
    await expectInstantInitialLoad(page, "/settings/organization", "org-settings-shell", "org-settings-content")
  })

  test("/settings/email", async ({ page }) => {
    await expectInstantInitialLoad(page, "/settings/email", "email-settings-shell", "email-settings-content")
  })

  // Authenticated now: the guide streams the team-scoped config behind the
  // shell, the same shape as every other app route.
  test("/connect", async ({ page }) => {
    await expectInstantInitialLoad(page, "/connect", "mcp-shell", "mcp-content")
  })

  test("/onboarding", async ({ page }) => {
    // The gate redirects users who already have a team to /library, but only
    // when it streams in — the shell itself must still commit instantly.
    await expectInstantInitialLoad(page, "/onboarding", "access-shell")
  })

  test("/consent", async ({ page }) => {
    // Unauthenticated visitors are proxied to /sign-in, so this lives in the
    // authenticated spec. Without a client_id the deferred gate renders the
    // invalid-request notice — still a real shell + deferred-content pair.
    await expectInstantInitialLoad(page, "/consent", "access-shell", "consent-content")
  })
})

const productNav = (name: string) => (p: Page) =>
  p.getByRole("navigation", { name: "Product navigation" }).getByRole("link", { name })

test.describe("instant soft navigation: app routes", () => {
  test("/library -> /collections", async ({ page }) => {
    await expectInstantSoftNav(page, {
      from: "/library",
      trigger: productNav("Collections"),
      shellTestId: "collections-shell",
      contentTestId: "collections-content",
    })
  })

  test("/library -> /discover", async ({ page }) => {
    await expectInstantSoftNav(page, {
      from: "/library",
      trigger: productNav("Find skills"),
      shellTestId: "discover-shell",
      contentTestId: "discover-content",
      // The catalog is a real network call (skills.sh); only the post-release
      // stream gets slack. The shell assertion under the lock never does.
      contentTimeout: 30_000,
    })
  })

  test("/library -> /connect", async ({ page }) => {
    await expectInstantSoftNav(page, {
      from: "/library",
      trigger: productNav("Connect agent"),
      shellTestId: "mcp-shell",
      contentTestId: "mcp-content",
    })
  })

  test("/collections -> /library", async ({ page }) => {
    await expectInstantSoftNav(page, {
      from: "/collections",
      trigger: productNav("Library"),
      shellTestId: "library-shell",
      contentTestId: "library-content",
    })
  })

  test("/collections -> /collections/[collectionId] (card)", async ({ page }) => {
    const { collectionId } = readFixtures()
    await expectInstantSoftNav(page, {
      from: "/collections",
      trigger: (p) => p.locator(`a[href="/collections/${collectionId}"]`).first(),
      shellTestId: "collection-detail-shell",
      contentTestId: "collection-detail-content",
    })
  })

  // The account menu items are anchors rendered with the menuitem role
  // (Base UI DropdownMenuItem with nativeButton={false}).
  test("/library -> /settings/organization (account menu)", async ({ page }) => {
    await expectInstantSoftNav(page, {
      from: "/library",
      trigger: (p) => p.getByRole("menuitem", { name: "Team access" }),
      shellTestId: "org-settings-shell",
      contentTestId: "org-settings-content",
      beforeLock: async (p) => {
        await p.getByRole("button", { name: "User menu" }).click()
      },
    })
  })

  test("/collections -> /settings/email (account menu)", async ({ page }) => {
    await expectInstantSoftNav(page, {
      from: "/collections",
      trigger: (p) => p.getByRole("menuitem", { name: "Email preferences" }),
      shellTestId: "email-settings-shell",
      contentTestId: "email-settings-content",
      beforeLock: async (p) => {
        await p.getByRole("button", { name: "User menu" }).click()
      },
    })
  })
})

test.describe("instant shells hold at mobile width", () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test("/library (mobile)", async ({ page }) => {
    await expectInstantInitialLoad(page, "/library", "library-shell", "library-content")
  })
})
