import assert from "node:assert/strict"
import { test } from "node:test"

import { unzipSync } from "fflate"

import {
  buildDeterministicZip,
  canonicalizePortableArchivePath,
} from "../lib/deterministic-zip.ts"

const encoder = new TextEncoder()
const files = [
  { relativePath: "references/checklist.md", bytes: encoder.encode("check") },
  { relativePath: "SKILL.md", bytes: encoder.encode("---\nname: demo\n---\n") },
]

test("creates byte-identical ZIPs regardless of input order", () => {
  const forward = buildDeterministicZip(files, null)
  const reversed = buildDeterministicZip([...files].reverse(), null)

  assert.deepEqual(forward, reversed)
})

test("places installable skill files at the archive root", () => {
  const archive = unzipSync(buildDeterministicZip(files, null))

  assert.deepEqual(Object.keys(archive).sort(), ["SKILL.md", "references/checklist.md"])
})

test("retains an outer folder for the existing browser ZIP format", () => {
  const archive = unzipSync(buildDeterministicZip(files, "demo"))

  assert.deepEqual(Object.keys(archive).sort(), [
    "demo/SKILL.md",
    "demo/references/checklist.md",
  ])
})

test("rejects duplicate archive paths", () => {
  assert.throws(
    () => buildDeterministicZip([files[0], files[0]], null),
    /Duplicate archive path/,
  )
})

test("rejects paths that collide on case-insensitive filesystems", () => {
  assert.throws(
    () => buildDeterministicZip([
      { relativePath: "SKILL.md", bytes: encoder.encode("one") },
      { relativePath: "skill.md", bytes: encoder.encode("two") },
    ], null),
    /collide on common filesystems/,
  )
})

test("canonicalizes Unicode case folds and Win32 trailing dots and spaces per segment", () => {
  assert.equal(
    canonicalizePortableArchivePath("CAFÉ/STRAẞE. "),
    "café/strasse",
  )
  assert.throws(
    () => buildDeterministicZip([
      { relativePath: "references/café.md", bytes: encoder.encode("one") },
      { relativePath: "REFERENCES/cafe\u0301.md. ", bytes: encoder.encode("two") },
    ], null),
    /collide on common filesystems/,
  )
})

test("rejects archive segments emptied by Win32 normalization", () => {
  for (const relativePath of ["docs/.", "docs/...", "docs/   "]) {
    assert.throws(
      () => buildDeterministicZip([
        { relativePath, bytes: encoder.encode("unsafe") },
      ], null),
      /unsafe Win32 segment/,
      relativePath,
    )
  }
})

test("rejects Win32-invalid filename characters", () => {
  for (const relativePath of ["docs/a:b.md", "docs/a?.md", "docs/a*.md", "docs/a|b.md"]) {
    assert.throws(
      () => buildDeterministicZip([
        { relativePath, bytes: encoder.encode("unsafe") },
      ], null),
      /unsafe Win32 segment/,
      relativePath,
    )
  }
})

test("rejects file-directory collisions after portable normalization", () => {
  assert.throws(
    () => buildDeterministicZip([
      { relativePath: "References", bytes: encoder.encode("file") },
      { relativePath: "references/checklist.md", bytes: encoder.encode("nested") },
    ], null),
    /collide on common filesystems/,
  )
  assert.throws(
    () => buildDeterministicZip([
      { relativePath: "REFERENCES/checklist.md", bytes: encoder.encode("nested") },
      { relativePath: "references", bytes: encoder.encode("file") },
    ], null),
    /collide on common filesystems/,
  )
})

test("rejects reserved Win32 device names with casing or extensions", () => {
  for (const relativePath of [
    "CON",
    "docs/prn.txt",
    "Aux.json",
    "nul.",
    "COM1",
    "com9.log",
    "LPT1",
    "lpt9.md",
  ]) {
    assert.throws(
      () => buildDeterministicZip([
        { relativePath, bytes: encoder.encode("unsafe") },
      ], null),
      /reserved Win32 device name/,
      relativePath,
    )
  }

  for (const relativePath of ["console.md", "com0", "com10", "lpt0", "lpt10"]) {
    assert.doesNotThrow(
      () => buildDeterministicZip([
        { relativePath, bytes: encoder.encode("safe") },
      ], null),
      relativePath,
    )
  }
})

test("rejects prototype-like paths that fflate cannot represent safely", () => {
  assert.throws(
    () => buildDeterministicZip([
      { relativePath: "SKILL.md", bytes: encoder.encode("skill") },
      { relativePath: "__proto__", bytes: encoder.encode("unsafe") },
    ], null),
    /Unsafe archive path/,
  )
})
