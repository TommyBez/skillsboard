import { readFileSync } from "node:fs"
import path from "node:path"

import { instant } from "@next/playwright"
import { expect, type Locator, type Page } from "@playwright/test"

export const BASE_URL = process.env.BASE_URL ?? "http://localhost:3100"

export function testUrl(path: string) {
  return new URL(path, BASE_URL).toString()
}

export interface E2eFixtures {
  email: string
  userId: string
  organizationId: string
  collectionId: string
  shareId: string
}

let cachedFixtures: E2eFixtures | undefined

export function readFixtures(): E2eFixtures {
  cachedFixtures ??= JSON.parse(
    readFileSync(path.join(process.cwd(), "e2e", ".auth", "fixtures.json"), "utf8"),
  ) as E2eFixtures
  return cachedFixtures
}

/**
 * Initial load (hard navigation): the served document under the instant() lock
 * is the route's prerendered static shell. baseURL is required because the page
 * is still about:blank when instant() acquires the lock.
 *
 * `contentTestId`, when given, is the deferred data the shell guards: it must be
 * gated under the lock (this is what makes a vacuous pass impossible). Nothing
 * streams after release on an initial load, so there is no post-release check
 * here — that half is covered by the soft-navigation guard.
 */
export async function expectInstantInitialLoad(
  page: Page,
  path: string,
  shellTestId: string,
  contentTestId?: string,
) {
  const url = testUrl(path)
  await instant(
    page,
    async () => {
      await page.goto(url)
      await expect(page.getByTestId(shellTestId)).toBeVisible()
      if (contentTestId) await expect(page.getByTestId(contentTestId)).toHaveCount(0)
    },
    { baseURL: BASE_URL },
  )
}

/**
 * Soft navigation (client-side): drive a real <Link> click. Under the lock the
 * router initiates and awaits the destination's prefetch itself, so no manual
 * warming is needed or wanted. After release, the deferred content streams in.
 */
export async function expectInstantSoftNav(
  page: Page,
  options: {
    from: string
    trigger: (page: Page) => Locator
    shellTestId: string
    /**
     * Text the destination shell must carry. Required when source and
     * destination share a shell marker (e.g. both are AccessShell pages):
     * without it a click that never navigated still "passes" the shell check.
     */
    shellText?: string | RegExp
    contentTestId?: string
    /** Real-network slack for the post-release stream only (never for the shell). */
    contentTimeout?: number
    /** Run before instant() — e.g. open the menu that contains the trigger. */
    beforeLock?: (page: Page) => Promise<void>
  },
) {
  await page.goto(testUrl(options.from))
  // beforeLock opens whatever reveals the trigger (e.g. a dropdown menu); the
  // trigger may not exist in the DOM until then.
  await options.beforeLock?.(page)
  const trigger = options.trigger(page)
  await expect(trigger).toBeVisible({ timeout: 20_000 })

  await instant(page, async () => {
    await trigger.click()
    // During the commit the outgoing page can still be in the DOM, so when
    // source and destination share a shell marker, filter by the destination
    // text instead of asserting on the bare marker (strict-mode violation).
    const shell = options.shellText
      ? page.getByTestId(options.shellTestId).filter({ hasText: options.shellText })
      : page.getByTestId(options.shellTestId)
    await expect(shell).toBeVisible()
    if (options.contentTestId) {
      await expect(page.getByTestId(options.contentTestId)).toHaveCount(0)
    }
  })

  if (options.contentTestId) {
    await expect(page.getByTestId(options.contentTestId)).toBeVisible(
      options.contentTimeout ? { timeout: options.contentTimeout } : undefined,
    )
  }
}
