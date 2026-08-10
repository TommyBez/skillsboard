import { mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"

import { request, type FullConfig } from "@playwright/test"
import dotenv from "dotenv"
import { Pool } from "pg"

dotenv.config({ path: path.join(process.cwd(), ".env.local") })

const TEST_USER_EMAIL = "instant-nav-e2e@example.com"
const TEST_USER_NAME = "Instant Nav E2E"
const ORG_NAME = "Instant Nav E2E Team"
const ORG_SLUG = "instant-nav-e2e-team"

const FIXTURE_GITHUB_URL = "https://github.com/vercel/next.js"
const FIXTURE_SKILL_NAME = "e2e-instant-nav-skill"
const FIXTURE_COLLECTION_TITLE = "E2E Instant Nav Collection"
// Exactly 32 URL-safe characters, as required by the share-id pattern.
const FIXTURE_SHARE_ID = "e2e-instant-nav-share-".padEnd(32, "0")
const FIXTURE_COMMIT_SHA = "a".repeat(40)
const FIXTURE_ARTIFACT = Buffer.from(
  "---\nname: e2e-instant-nav-skill\ndescription: Seeded fixture for the instant-navigation e2e suite.\n---\n\nFixture body.\n",
)
const FIXTURE_ARTIFACT_DIGEST = `sha256:${"0".repeat(64)}`

/**
 * Signs the test user in through the Better Auth HTTP API (the rig server runs
 * with VERCEL_ENV=development, so any 6-digit OTP verifies), ensures it owns an
 * active organization, seeds the rows the fixture routes need, and persists the
 * session as a Playwright storage state the app spec reuses. Runs before any
 * test, so the freshly started server's per-org `use cache` reads pick the
 * seeded rows up on first access.
 */
export default async function globalSetup(_config: FullConfig) {
  const baseURL = process.env.BASE_URL ?? "http://localhost:3100"
  // Better Auth rejects state-changing calls without a trusted Origin header.
  const context = await request.newContext({
    baseURL,
    extraHTTPHeaders: { origin: baseURL },
  })

  const sendOtp = await context.post("/api/auth/email-otp/send-verification-otp", {
    data: { email: TEST_USER_EMAIL, type: "sign-in" },
  })
  if (!sendOtp.ok()) {
    throw new Error(`send-verification-otp failed (${sendOtp.status()}): ${await sendOtp.text()}`)
  }

  const verify = await context.post("/api/auth/sign-in/email-otp", {
    data: {
      email: TEST_USER_EMAIL,
      otp: "123456",
      name: TEST_USER_NAME,
      // Creates the product-email preference row on first sign-up, which
      // /settings/email requires to render.
      skillsboardProductCommunicationsChoice: false,
    },
  })
  if (!verify.ok()) {
    throw new Error(`sign-in/email-otp failed (${verify.status()}): ${await verify.text()}`)
  }

  const sessionResponse = await context.get("/api/auth/get-session")
  const session = await sessionResponse.json()
  const userId = session?.user?.id as string | undefined
  if (!userId) throw new Error("No session after sign-in; the rig server must run with VERCEL_ENV=development")

  const orgsResponse = await context.get("/api/auth/organization/list")
  const orgs = await orgsResponse.json()
  let organizationId = orgs?.[0]?.id as string | undefined
  if (!organizationId) {
    const created = await context.post("/api/auth/organization/create", {
      data: { name: ORG_NAME, slug: ORG_SLUG },
    })
    if (!created.ok()) {
      throw new Error(`organization/create failed (${created.status()}): ${await created.text()}`)
    }
    organizationId = (await created.json())?.id
  }
  if (!organizationId) throw new Error("Unable to resolve the test organization")
  const setActive = await context.post("/api/auth/organization/set-active", {
    data: { organizationId },
  })
  if (!setActive.ok()) {
    throw new Error(`organization/set-active failed (${setActive.status()}): ${await setActive.text()}`)
  }

  const collectionId = await seedFixtures(userId, organizationId)

  const authDir = path.join(process.cwd(), "e2e", ".auth")
  mkdirSync(authDir, { recursive: true })
  await context.storageState({ path: path.join(authDir, "user.json") })
  writeFileSync(
    path.join(authDir, "fixtures.json"),
    JSON.stringify({
      email: TEST_USER_EMAIL,
      userId,
      organizationId,
      collectionId,
      shareId: FIXTURE_SHARE_ID,
    }),
  )
  await context.dispose()
}

async function seedFixtures(userId: string, organizationId: string): Promise<string> {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) throw new Error("DATABASE_URL missing; populate .env.local (see AGENTS.md)")

  const pool = new Pool({ connectionString: databaseUrl })
  try {
    // Check-then-insert everywhere: the Neon development branch does not carry
    // every constraint name the drizzle schema declares, so ON CONFLICT ON
    // CONSTRAINT is unreliable here.
    const skillId = (
      await pool.query<{ id: string }>(
        `SELECT "id" FROM "skill" WHERE "organizationId" = $1 AND "githubUrl" = $2 AND "skillName" = $3`,
        [organizationId, FIXTURE_GITHUB_URL, FIXTURE_SKILL_NAME],
      )
    ).rows[0]?.id ?? (
      await pool.query<{ id: string }>(
        `INSERT INTO "skill" ("organizationId", "createdBy", "githubUrl", "skillName", "title", "description", "repoOwner", "repoName", "tags")
         VALUES ($1, $2, $3, $4, 'E2E fixture skill', 'Seeded for the instant-navigation e2e suite.', 'vercel', 'next.js', ARRAY['e2e'])
         RETURNING "id"`,
        [organizationId, userId, FIXTURE_GITHUB_URL, FIXTURE_SKILL_NAME],
      )
    ).rows[0]?.id
    if (!skillId) throw new Error("Unable to seed the fixture skill")

    const existingCollection = await pool.query<{ id: string }>(
      `SELECT "id" FROM "collection" WHERE "organizationId" = $1 AND "title" = $2`,
      [organizationId, FIXTURE_COLLECTION_TITLE],
    )
    let collectionId = existingCollection.rows[0]?.id
    if (!collectionId) {
      const inserted = await pool.query<{ id: string }>(
        `INSERT INTO "collection" ("organizationId", "createdBy", "title", "description", "tags")
         VALUES ($1, $2, $3, 'Seeded for the instant-navigation e2e suite.', ARRAY['e2e'])
         RETURNING "id"`,
        [organizationId, userId, FIXTURE_COLLECTION_TITLE],
      )
      collectionId = inserted.rows[0]?.id
    }
    if (!collectionId) throw new Error("Unable to seed the fixture collection")

    await pool.query(
      `INSERT INTO "collectionSkill" ("collectionId", "skillId", "addedBy")
       SELECT $1, $2, $3
       WHERE NOT EXISTS (
         SELECT 1 FROM "collectionSkill" WHERE "collectionId" = $1 AND "skillId" = $2
       )`,
      [collectionId, skillId, userId],
    )

    const releaseId = (
      await pool.query<{ id: string }>(
        `SELECT "id" FROM "collectionRelease" WHERE "collectionId" = $1 AND "revision" = 1`,
        [collectionId],
      )
    ).rows[0]?.id ?? (
      await pool.query<{ id: string }>(
        `INSERT INTO "collectionRelease" ("collectionId", "revision", "title", "description", "createdBy")
         VALUES ($1, 1, $2, 'Seeded for the instant-navigation e2e suite.', $3)
         RETURNING "id"`,
        [collectionId, FIXTURE_COLLECTION_TITLE, userId],
      )
    ).rows[0]?.id
    if (!releaseId) throw new Error("Unable to seed the fixture collection release")

    await pool.query(
      `INSERT INTO "collectionReleaseSkill" ("releaseId", "sourceSkillId", "position", "skillName", "description", "githubUrl", "repoOwner", "repoName", "skillPath", "commitSha", "artifactDigest", "artifactBase64", "artifactBytes")
       SELECT $1, $2, 0, $3, 'Seeded fixture for the instant-navigation e2e suite.', $4, 'vercel', 'next.js', 'SKILL.md', $5, $6, $7, $8
       WHERE NOT EXISTS (
         SELECT 1 FROM "collectionReleaseSkill" WHERE "releaseId" = $1 AND "skillName" = $3
       )`,
      [
        releaseId,
        skillId,
        FIXTURE_SKILL_NAME,
        FIXTURE_GITHUB_URL,
        FIXTURE_COMMIT_SHA,
        FIXTURE_ARTIFACT_DIGEST,
        FIXTURE_ARTIFACT.toString("base64"),
        FIXTURE_ARTIFACT.byteLength,
      ],
    )

    await pool.query(
      `INSERT INTO "collectionDistribution" ("collectionId", "shareId", "activeReleaseId", "activeRevision", "publishedAt", "createdBy")
       SELECT $1, $2, $3, 1, CURRENT_TIMESTAMP, $4
       WHERE NOT EXISTS (
         SELECT 1 FROM "collectionDistribution" WHERE "collectionId" = $1 OR "shareId" = $2
       )`,
      [collectionId, FIXTURE_SHARE_ID, releaseId, userId],
    )

    return collectionId
  } finally {
    await pool.end()
  }
}
