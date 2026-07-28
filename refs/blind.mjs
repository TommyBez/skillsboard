// Build a blind A/B comparison folder for a critic.
//
//   node refs/blind.mjs <outDir> <oursPng> <refPng> [seedString]
//
// Writes <outDir>/A.png and <outDir>/B.png with a randomised assignment, plus
// <outDir>/.key.json recording which is which. The critic is told to read only
// A.png and B.png; the dispatcher reads the key afterwards.
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

const [, , outDir, oursPng, refPng, seed = ''] = process.argv
if (!outDir || !oursPng || !refPng) {
  console.error('usage: node refs/blind.mjs <outDir> <oursPng> <refPng> [seed]')
  process.exit(1)
}
mkdirSync(outDir, { recursive: true })

// Deterministic from the seed so a re-run of the same comparison is stable,
// but unguessable from the file names alone.
const digest = createHash('sha256').update(`${seed}|${oursPng}|${refPng}`).digest()
const oursIsA = (digest[0] & 1) === 0

copyFileSync(oursPng, `${outDir}/${oursIsA ? 'A' : 'B'}.png`)
copyFileSync(refPng, `${outDir}/${oursIsA ? 'B' : 'A'}.png`)
writeFileSync(
  `${outDir}/.key.json`,
  JSON.stringify({ A: oursIsA ? 'ours' : 'reference', B: oursIsA ? 'reference' : 'ours', oursPng, refPng }, null, 2),
)
console.log(`${outDir}: A=${oursIsA ? 'ours' : 'ref'} B=${oursIsA ? 'ref' : 'ours'}`)
