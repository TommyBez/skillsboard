import assert from "node:assert/strict"
import { test } from "node:test"

import { loadTsModule } from "./helpers/load-ts-module.mjs"

const {
  INSTALLABLE_COLLECTION_SCHEMA_URL,
  buildInstallableCollectionArtifactFilename,
  buildInstallableCollectionArtifactPath,
  buildInstallableCollectionCommand,
  buildInstallableCollectionUrl,
  buildWellKnownManifest,
  isValidInstallableCollectionShareId,
} = await loadTsModule(
  new URL("../lib/installable-collection-protocol.ts", import.meta.url),
)

const SHARE_ID = "Ab_-".repeat(8)
const DIGEST_A = `sha256:${"a".repeat(64)}`
const DIGEST_B = `sha256:${"b".repeat(64)}`

test("builds a project install command and normalizes the base URL", () => {
  assert.equal(
    buildInstallableCollectionCommand("https://www.skillsboard.sh/", SHARE_ID),
    `npx skills add https://www.skillsboard.sh/p/${SHARE_ID} --skill "*"`,
  )
})

test("URL-encodes a base path before appending the encoded share ID", () => {
  assert.equal(
    buildInstallableCollectionUrl("https://example.com/team collections/", SHARE_ID),
    `https://example.com/team%20collections/p/${SHARE_ID}`,
  )
  assert.equal(
    buildInstallableCollectionCommand("https://example.com/team collections/", SHARE_ID),
    `npx skills add https://example.com/team%20collections/p/${SHARE_ID} --skill "*"`,
  )
})

test("validates installable collection share IDs without throwing", () => {
  assert.equal(isValidInstallableCollectionShareId(SHARE_ID), true)

  for (const value of [
    undefined,
    null,
    "a".repeat(31),
    "a".repeat(33),
    `${"a".repeat(31)}/`,
  ]) {
    assert.equal(isValidInstallableCollectionShareId(value), false, String(value))
  }
})

test("builds deterministic artifact filenames and relative paths", () => {
  assert.equal(
    buildInstallableCollectionArtifactFilename("frontend-review"),
    "frontend-review.zip",
  )
  assert.equal(
    buildInstallableCollectionArtifactPath(
      "123e4567-e89b-12d3-a456-426614174000",
      "frontend-review",
    ),
    "../../artifacts/123e4567-e89b-12d3-a456-426614174000/frontend-review.zip",
  )
})

test("builds a v0.2 archive manifest in input order", () => {
  assert.deepEqual(
    buildWellKnownManifest([
      {
        artifactId: "artifact-one",
        skillName: "frontend-review",
        description: "Review frontend code",
        digest: DIGEST_A,
      },
      {
        artifactId: "artifact-two",
        skillName: "release-notes",
        description: "Prepare release notes",
        digest: DIGEST_B,
      },
    ]),
    {
      $schema: INSTALLABLE_COLLECTION_SCHEMA_URL,
      skills: [
        {
          name: "frontend-review",
          description: "Review frontend code",
          type: "archive",
          url: "../../artifacts/artifact-one/frontend-review.zip",
          digest: DIGEST_A,
        },
        {
          name: "release-notes",
          description: "Prepare release notes",
          type: "archive",
          url: "../../artifacts/artifact-two/release-notes.zip",
          digest: DIGEST_B,
        },
      ],
    },
  )
})

test("rejects malformed share IDs and unsafe base URLs", () => {
  assert.throws(
    () => buildInstallableCollectionCommand("https://skillsboard.sh", "a".repeat(31)),
    /Share ID/,
  )
  assert.throws(
    () =>
      buildInstallableCollectionCommand(
        "https://skillsboard.sh",
        `${"a".repeat(31)}/`,
      ),
    /Share ID/,
  )
  assert.throws(
    () => buildInstallableCollectionCommand("javascript:alert(1)", SHARE_ID),
    /Base URL/,
  )
  assert.throws(
    () => buildInstallableCollectionCommand("https://user@example.com", SHARE_ID),
    /Base URL/,
  )
})

test("rejects invalid skill names and artifact IDs", () => {
  for (const skillName of [
    "",
    "Uppercase",
    "leading-",
    "double--hyphen",
    "under_score",
    "con",
    "com1",
    "lpt9",
    "a".repeat(65),
  ]) {
    assert.throws(
      () => buildInstallableCollectionArtifactFilename(skillName),
      /Skill name/,
      skillName,
    )
  }

  assert.throws(
    () => buildInstallableCollectionArtifactPath("../artifact", "valid-name"),
    /Artifact ID/,
  )
})

test("rejects malformed digests and descriptions", () => {
  const entry = {
    artifactId: "artifact-one",
    skillName: "frontend-review",
    description: "Review frontend code",
    digest: DIGEST_A,
  }

  for (const digest of [
    "a".repeat(64),
    `sha256:${"a".repeat(63)}`,
    `sha256:${"A".repeat(64)}`,
  ]) {
    assert.throws(() => buildWellKnownManifest([{ ...entry, digest }]), /Digest/)
  }

  assert.throws(
    () => buildWellKnownManifest([{ ...entry, description: "" }]),
    /description/,
  )
  assert.doesNotThrow(
    () => buildWellKnownManifest([{ ...entry, description: "a".repeat(1024) }]),
  )
  assert.throws(
    () => buildWellKnownManifest([{ ...entry, description: "a".repeat(1025) }]),
    /description/,
  )
})
