import { zipSync, type Zippable } from "fflate"

const DETERMINISTIC_ARCHIVE_DATE = new Date(1980, 0, 1, 0, 0, 0)
const WIN32_DEVICE_NAME_PATTERN = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])$/
const WIN32_INVALID_SEGMENT_PATTERN = /[<>:"\\|?*\u0000-\u001f]/u

export interface DeterministicArchiveFile {
  bytes: Uint8Array
  relativePath: string
}

function caseFold(value: string) {
  // The lower/upper/lower sequence covers Unicode folds such as sharp-s and
  // final sigma that a single toLowerCase() pass leaves distinct.
  return value.toLowerCase().toUpperCase().toLowerCase()
}

/** Canonical form used to detect archive paths that collide on Win32 filesystems. */
export function canonicalizePortableArchivePath(path: string) {
  return path.split("/").map((segment) => {
    const withoutWin32Suffix = segment.normalize("NFC").replace(/[ .]+$/u, "")
    if (!withoutWin32Suffix || WIN32_INVALID_SEGMENT_PATTERN.test(withoutWin32Suffix)) {
      throw new TypeError(`Archive path contains an unsafe Win32 segment: ${path}`)
    }

    const canonicalSegment = caseFold(withoutWin32Suffix).normalize("NFC")
    const deviceStem = canonicalSegment.split(".", 1)[0].replace(/ +$/u, "")
    if (WIN32_DEVICE_NAME_PATTERN.test(deviceStem)) {
      throw new TypeError(`Archive path uses a reserved Win32 device name: ${path}`)
    }

    return canonicalSegment
  }).join("/")
}

/** Creates byte-stable ZIP output by fixing entry order and DOS timestamps. */
export function buildDeterministicZip(
  files: readonly DeterministicArchiveFile[],
  archiveRoot: string | null,
) {
  const archiveEntries = Object.create(null) as Zippable
  const seenPaths = new Set<string>()
  const seenPortablePaths = new Set<string>()
  const seenPortableDirectories = new Set<string>()
  const orderedFiles = [...files].sort((a, b) => (
    a.relativePath < b.relativePath ? -1 : a.relativePath > b.relativePath ? 1 : 0
  ))

  for (const file of orderedFiles) {
    const path = archiveRoot ? `${archiveRoot}/${file.relativePath}` : file.relativePath
    if (path.split("/").includes("__proto__")) {
      throw new TypeError(`Unsafe archive path: ${path}`)
    }
    if (seenPaths.has(path)) throw new TypeError(`Duplicate archive path: ${path}`)
    const portablePath = canonicalizePortableArchivePath(path)
    const portableSegments = portablePath.split("/")
    const portableDirectories = portableSegments.slice(0, -1).map((_, index) => (
      portableSegments.slice(0, index + 1).join("/")
    ))
    if (
      seenPortablePaths.has(portablePath)
      || seenPortableDirectories.has(portablePath)
      || portableDirectories.some((directory) => seenPortablePaths.has(directory))
    ) {
      throw new TypeError(`Archive paths collide on common filesystems: ${path}`)
    }
    seenPaths.add(path)
    seenPortablePaths.add(portablePath)
    for (const directory of portableDirectories) seenPortableDirectories.add(directory)
    archiveEntries[path] = [file.bytes, { mtime: DETERMINISTIC_ARCHIVE_DATE }]
  }

  return zipSync(archiveEntries, { level: 6 })
}
