import { expect, test } from "@playwright/test"

// TEMPORARY (PR #219): fails on purpose so the MCP runtime job's
// `if: failure()` step uploads test-results/ with actions/upload-artifact@v7.
// Reverted in the next commit; must not reach main.
test("TEMP upload-artifact v7 probe (intentional failure)", async ({ page }) => {
  await page.goto("/api/health")
  expect("intentional failure for upload-artifact v7 probe").toBe("pass")
})
