/**
 * Runs the DNS for AI Discovery (DNS-AID) lookups the isitagentready.com
 * scanner runs, over the same DNS-over-HTTPS resolvers, and prints what came
 * back. See docs/dns-aid-records.md for the records this expects to find.
 *
 *   pnpm dns:check                 # www.skillsboard.sh and skillsboard.sh
 *   pnpm dns:check example.com     # any other domain
 *
 * Exits non-zero unless discovery is actually usable end to end, so this can
 * gate a zone change rather than only describe one. "Usable" means a
 * ServiceMode record was reached — following AliasMode as far as it goes —
 * under a validated DNSSEC chain, with every query answered.
 *
 * The lookup logic is exported so tests/dns-aid-check.test.mjs can drive it
 * against a stub resolver; only a direct `node scripts/check-dns-aid.mjs` run
 * touches the network.
 */

import { fileURLToPath } from "node:url"

// The scanner's default resolver, and the one it falls back to on a
// resolver-level failure. Not on an empty answer: NODATA and NXDOMAIN are the
// zone answering, and asking a second resolver cannot change either.
const RESOLVERS = [
  "https://cloudflare-dns.com/dns-query",
  "https://dns.google/resolve",
]

// Node's fetch has no default request timeout, so one stalled resolver would
// hold up the whole sequential scan.
const DOH_TIMEOUT_MS = 5000

// SVCB is RR type 64 and HTTPS is 65. `dns-json` returns the numeric type, and
// neither resolver accepts every spelling of the name, so ask by number.
export const SVCB = 64
export const HTTPS = 65
export const TXT = 16

const SERVICES = ["_index", "_a2a", "_mcp"]

// RFC 9460 section 3.1 has a client bound how far it chases AliasMode rather
// than follow a chain that may be circular.
export const ALIAS_CHASE_LIMIT = 4

export function typeName(type) {
  return { [SVCB]: "SVCB", [HTTPS]: "HTTPS", [TXT]: "TXT" }[type] ?? String(type)
}

/**
 * NOERROR and NXDOMAIN are the zone speaking. Every other RCODE — SERVFAIL
 * above all — is the resolver failing to reach it, and reporting that as an
 * empty name would read as "nothing is published" when nothing was learned.
 */
function isAnswer(status) {
  return status === 0 || status === 3
}

export async function resolveOverDoh(name, type) {
  let lastError
  for (const resolver of RESOLVERS) {
    const url = `${resolver}?name=${encodeURIComponent(name)}&type=${type}&do=1`
    try {
      const response = await fetch(url, {
        headers: { accept: "application/dns-json" },
        signal: AbortSignal.timeout(DOH_TIMEOUT_MS),
      })
      if (!response.ok) {
        lastError = new Error(`${resolver} answered ${response.status}`)
        continue
      }
      const result = await response.json()
      if (!isAnswer(result.Status)) {
        lastError = new Error(`${resolver} returned DNS status ${result.Status}`)
        continue
      }
      return result
    } catch (error) {
      lastError = error
    }
  }
  throw lastError ?? new Error(`no resolver answered for ${name}`)
}

/**
 * `<priority> <target> [params]` in RFC 9460 presentation form. Priority 0 is
 * AliasMode, which carries no parameters and only names another owner; higher
 * is ServiceMode, which is the record a client can actually connect on.
 */
export function parseServiceBinding(data) {
  const match = /^\s*(\d+)\s+(\S+)\s*(.*)$/.exec(data ?? "")
  if (!match) return undefined
  return { priority: Number(match[1]), target: match[2], params: match[3].trim() }
}

/** A target of "." means the owner name itself (RFC 9460 section 2.5). */
export function targetOwner(target, owner) {
  return target === "." ? owner : target.replace(/\.$/, "")
}

/** Answers of the type that was asked for. `do=1` also returns their RRSIGs. */
function recordsOfType(result, type) {
  return (result.Answer ?? []).filter((answer) => answer.type === type)
}

/**
 * Resolve one name, following AliasMode to the ServiceMode record behind it.
 *
 * An alias is not a usable answer on its own: a signed `_index._agents` alias
 * pointing at a missing or misspelled primary owner leaves discovery broken
 * while every individual lookup still succeeds. So the chase reports the
 * ServiceMode record it ended on, or why it could not reach one, and a record
 * counts as authenticated only if every hop of the chain was.
 */
export async function chase(name, type, options = {}) {
  const { resolve = resolveOverDoh, depth = 0, authenticated: inherited = true } = options

  const result = await resolve(name, type)
  const answers = recordsOfType(result, type)
  const authenticated = inherited && Boolean(result.AD)

  if (answers.length === 0) {
    // Say which of the two empty answers this is. NXDOMAIN means the name does
    // not exist at all; NODATA means it exists with other record types, which
    // is what a zone looks like when the wrong RR type was published.
    const status = result.Status === 3 ? "NXDOMAIN" : "NODATA"

    return { kind: depth === 0 ? "absent" : "dangling", name, status, authenticated }
  }

  const bindings = answers.map((answer) => parseServiceBinding(answer.data)).filter(Boolean)
  const service = bindings.find((binding) => binding.priority > 0)
  if (service) {
    return { kind: "service", name, record: service, authenticated }
  }

  const alias = bindings[0]
  if (!alias) {
    return { kind: "unparsable", name, data: answers[0].data, authenticated }
  }
  if (depth >= ALIAS_CHASE_LIMIT) {
    return { kind: "chain", name, authenticated }
  }

  const next = targetOwner(alias.target, name)
  const chased = await chase(next, type, { resolve, depth: depth + 1, authenticated })
  // The path an operator has to debug is every owner the chase touched,
  // including the one it stopped on, so start from the outcome's own name.
  return { ...chased, via: [name, ...(chased.via ?? [chased.name])] }
}

/**
 * Every query the scanner makes for one domain: SVCB and HTTPS at each service
 * leaf, plus the TXT fallback the draft discusses in section 4, which it reads
 * at `_index` only.
 */
export function queriesFor(domain) {
  const queries = []
  for (const service of SERVICES) {
    for (const type of [SVCB, HTTPS]) {
      queries.push({ name: `${service}._agents.${domain}`, type })
    }
  }
  queries.push({ name: `_index._agents.${domain}`, type: TXT })
  return queries
}

/**
 * Run every query for every domain and total up what discovery would actually
 * be able to use. Returns the tallies so a caller can decide the exit code.
 */
export async function checkDomains(domains, { resolve = resolveOverDoh, log = console.log } = {}) {
  const totals = { usable: 0, unauthenticated: 0, broken: 0, failures: 0 }

  for (const domain of domains) {
    log(`\n${domain}`)

    for (const { name, type } of queriesFor(domain)) {
      const label = `  ${typeName(type).padEnd(5)} ${name}`

      if (type === TXT) {
        let result
        try {
          result = await resolve(name, type)
        } catch (error) {
          totals.failures += 1
          log(`${label}  resolver error: ${error.message}`)
          continue
        }
        const answers = recordsOfType(result, type)
        if (answers.length === 0) {
          log(`${label}  ${result.Status === 3 ? "NXDOMAIN" : "NODATA"}`)
          continue
        }
        // The draft specifies no RDATA format for the TXT index, so report it
        // without judging it. It is not what makes discovery usable.
        for (const answer of answers) {
          log(`${label}  ${answer.data}  [informational]`)
        }
        continue
      }

      let outcome
      try {
        outcome = await chase(name, type, { resolve })
      } catch (error) {
        totals.failures += 1
        log(`${label}  resolver error: ${error.message}`)
        continue
      }

      const path = outcome.via ? ` (via ${outcome.via.join(" -> ")})` : ""

      switch (outcome.kind) {
        case "absent":
          log(`${label}  ${outcome.status}`)
          break
        case "dangling":
          totals.broken += 1
          log(
            `${label}  BROKEN: alias${path} points at ${outcome.name}, which answers ${outcome.status}`,
          )
          break
        case "chain":
          totals.broken += 1
          log(`${label}  BROKEN: alias chain deeper than ${ALIAS_CHASE_LIMIT}${path}`)
          break
        case "unparsable":
          totals.broken += 1
          log(`${label}  BROKEN: cannot parse RDATA ${JSON.stringify(outcome.data)}`)
          break
        case "service": {
          totals.usable += 1
          if (!outcome.authenticated) totals.unauthenticated += 1
          const { priority, target, params } = outcome.record
          const rdata = [priority, target, params].filter(Boolean).join(" ")
          log(`${label}  ${rdata}${path}  [${outcome.authenticated ? "AD" : "unsigned"}]`)
          break
        }
      }
    }
  }

  return totals
}

/** Every reason this run should fail, so none of them is silently the last word. */
export function problemsIn({ usable, unauthenticated, broken, failures }) {
  const problems = []
  if (failures > 0) {
    problems.push(
      `${failures} query(ies) could not be resolved at all, so this run did not check everything.`,
    )
  }
  if (broken > 0) {
    problems.push(
      `${broken} alias(es) do not lead to a ServiceMode record. Publish the primary owner they name.`,
    )
  }
  if (usable === 0) {
    problems.push(
      "No usable DNS-AID records are published. Apply docs/dns-aid-records.md to the zone.",
    )
  }
  if (unauthenticated > 0) {
    problems.push(
      `${unauthenticated} record(s) came back without authenticated data. Sign the zone with ` +
        "DNSSEC: a validating resolver, and the scanner, will not trust an unsigned record.",
    )
  }
  return problems
}

async function main() {
  const domains = process.argv.slice(2)
  const totals = await checkDomains(
    domains.length > 0 ? domains : ["www.skillsboard.sh", "skillsboard.sh"],
  )

  console.log(
    `\n${totals.usable} usable ServiceMode record(s), ` +
      `${totals.usable - totals.unauthenticated} of them under a validated DNSSEC chain.`,
  )

  const problems = problemsIn(totals)
  for (const problem of problems) console.error(problem)
  if (problems.length > 0) process.exit(1)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await main()
}
