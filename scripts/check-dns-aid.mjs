/**
 * Runs the DNS for AI Discovery (DNS-AID) lookups the isitagentready.com
 * scanner runs, over the same DNS-over-HTTPS resolvers, and prints what came
 * back. See docs/dns-aid-records.md for the records this expects to find.
 *
 *   pnpm dns:check                 # www.skillsboard.sh and skillsboard.sh
 *   pnpm dns:check example.com     # any other domain
 *
 * Exits non-zero when no DNS-AID record answers anywhere, so this can gate a
 * zone change rather than only describe one.
 */

// The scanner's default resolver, and the one it falls back to on a
// resolver-level failure. Not on a NOERROR-with-no-answers, which is a real
// answer meaning the name does not exist.
const RESOLVERS = [
  "https://cloudflare-dns.com/dns-query",
  "https://dns.google/resolve",
]

// SVCB is RR type 64 and HTTPS is 65. `dns-json` returns the numeric type, and
// neither resolver accepts every spelling of the name, so ask by number.
const SVCB = 64
const HTTPS = 65
const TXT = 16

const SERVICES = ["_index", "_a2a", "_mcp"]

const domains = process.argv.slice(2)
const targets = domains.length > 0 ? domains : ["www.skillsboard.sh", "skillsboard.sh"]

function typeName(type) {
  return { [SVCB]: "SVCB", [HTTPS]: "HTTPS", [TXT]: "TXT" }[type] ?? String(type)
}

async function resolve(name, type) {
  let lastError
  for (const resolver of RESOLVERS) {
    const url = `${resolver}?name=${encodeURIComponent(name)}&type=${type}&do=1`
    try {
      const response = await fetch(url, { headers: { accept: "application/dns-json" } })
      if (!response.ok) {
        lastError = new Error(`${resolver} answered ${response.status}`)
        continue
      }
      return await response.json()
    } catch (error) {
      lastError = error
    }
  }
  throw lastError ?? new Error(`no resolver answered for ${name}`)
}

/**
 * Every query the scanner makes for one domain: SVCB and HTTPS at each service
 * leaf, plus the TXT fallback the draft discusses in section 4, which it reads
 * at `_index` only.
 */
function queriesFor(domain) {
  const queries = []
  for (const service of SERVICES) {
    for (const type of [SVCB, HTTPS]) {
      queries.push({ name: `${service}._agents.${domain}`, type })
    }
  }
  queries.push({ name: `_index._agents.${domain}`, type: TXT })
  return queries
}

let answered = 0
let authenticated = 0
let failures = 0

for (const domain of targets) {
  console.log(`\n${domain}`)

  for (const { name, type } of queriesFor(domain)) {
    let result
    try {
      result = await resolve(name, type)
    } catch (error) {
      failures += 1
      console.log(`  ${typeName(type).padEnd(5)} ${name}  resolver error: ${error.message}`)
      continue
    }

    // `do=1` asks for DNSSEC records, so the answer section carries the RRSIG
    // beside the record it signs. Count the records, not their signatures.
    const answers = (result.Answer ?? []).filter((answer) => answer.type === type)
    if (answers.length === 0) {
      // NXDOMAIN (3) and NOERROR (0) both mean nothing is published here; say
      // which, because NXDOMAIN also rules out the parent name existing.
      const status = result.Status === 3 ? "NXDOMAIN" : `no answers (status ${result.Status})`
      console.log(`  ${typeName(type).padEnd(5)} ${name}  ${status}`)
      continue
    }

    answered += answers.length
    if (result.AD) authenticated += answers.length

    for (const answer of answers) {
      const flag = result.AD ? "AD" : "unsigned"
      console.log(`  ${typeName(type).padEnd(5)} ${name}  ${answer.data}  [${flag}]`)
    }
  }
}

console.log(
  `\n${answered} DNS-AID record(s) found, ${authenticated} of them under a validated DNSSEC chain.`,
)

if (failures > 0) {
  console.error(`${failures} query(ies) could not be resolved at all.`)
}

if (answered === 0) {
  console.error(
    "No DNS-AID records are published. Apply docs/dns-aid-records.md to the zone.",
  )
  process.exit(1)
}

if (authenticated < answered) {
  console.error(
    "Some records came back without authenticated data. Sign the zone with DNSSEC:\n" +
      "a validating resolver, and the scanner, will not trust an unsigned record.",
  )
  process.exit(1)
}
