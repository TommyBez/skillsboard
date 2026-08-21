import assert from "node:assert/strict"
import { test } from "node:test"

const {
  ALIAS_CHASE_LIMIT,
  chase,
  checkDomains,
  HTTPS,
  parseServiceBinding,
  problemsIn,
  queriesFor,
  targetOwner,
  TXT,
} = await import("../scripts/check-dns-aid.mjs")

/** A DoH `application/dns-json` body, as Cloudflare and Google return one. */
function answer(name, type, data, { ad = true, status = 0 } = {}) {
  return { Status: status, AD: ad, Answer: [{ name, type, data }] }
}

function empty({ ad = true, status = 0 } = {}) {
  return { Status: status, AD: ad, Answer: [] }
}

/** Resolves from a fixed zone; anything not in it answers NOERROR with nothing. */
function zone(records) {
  return async (name, type) => records[`${type} ${name}`] ?? empty()
}

test("presentation form splits into priority, target, and the rest", () => {
  assert.deepEqual(parseServiceBinding("0 agents-index.skillsboard.sh."), {
    priority: 0,
    target: "agents-index.skillsboard.sh.",
    params: "",
  })
  assert.deepEqual(parseServiceBinding('1 www.skillsboard.sh. alpn="h2,http/1.1" port=443'), {
    priority: 1,
    target: "www.skillsboard.sh.",
    params: 'alpn="h2,http/1.1" port=443',
  })
  // Anything that is not a service binding is reported as such, not guessed at.
  assert.equal(parseServiceBinding("not a binding"), undefined)
  assert.equal(parseServiceBinding(undefined), undefined)
})

test("a target of . means the owner name itself", () => {
  assert.equal(targetOwner(".", "_mcp._agents.example.com"), "_mcp._agents.example.com")
  assert.equal(targetOwner("agents-mcp.example.com.", "_mcp._agents.example.com"), "agents-mcp.example.com")
})

test("an alias is followed to the ServiceMode record behind it", async () => {
  const resolve = zone({
    [`${HTTPS} _mcp._agents.example.com`]: answer(
      "_mcp._agents.example.com",
      HTTPS,
      "0 agents-mcp.example.com.",
    ),
    [`${HTTPS} agents-mcp.example.com`]: answer(
      "agents-mcp.example.com",
      HTTPS,
      '1 www.example.com. alpn="h2,http/1.1" port=443',
    ),
  })

  const outcome = await chase("_mcp._agents.example.com", HTTPS, { resolve })

  assert.equal(outcome.kind, "service")
  assert.equal(outcome.record.priority, 1)
  assert.equal(outcome.record.target, "www.example.com.")
  assert.deepEqual(outcome.via, ["_mcp._agents.example.com", "agents-mcp.example.com"])
  assert.equal(outcome.authenticated, true)
})

test("an alias pointing at nothing is broken, not a usable record", async () => {
  // The bug this guards: counting the alias itself as a success meant a signed
  // `_index._agents` pointing at a missing primary owner reported healthy
  // discovery while no agent could connect to anything.
  const resolve = zone({
    [`${HTTPS} _index._agents.example.com`]: answer(
      "_index._agents.example.com",
      HTTPS,
      "0 agents-index.example.com.",
    ),
    // agents-index.example.com is absent: the operator mistyped it.
  })

  const outcome = await chase("_index._agents.example.com", HTTPS, { resolve })

  assert.equal(outcome.kind, "dangling")
  assert.equal(outcome.name, "agents-index.example.com")
  assert.deepEqual(outcome.via, ["_index._agents.example.com", "agents-index.example.com"])
})

test("an unsigned hop anywhere in the chain taints the result", async () => {
  const resolve = zone({
    [`${HTTPS} _mcp._agents.example.com`]: answer(
      "_mcp._agents.example.com",
      HTTPS,
      "0 agents-mcp.example.com.",
      { ad: true },
    ),
    [`${HTTPS} agents-mcp.example.com`]: answer(
      "agents-mcp.example.com",
      HTTPS,
      "1 www.example.com. alpn=h2",
      { ad: false },
    ),
  })

  const outcome = await chase("_mcp._agents.example.com", HTTPS, { resolve })

  assert.equal(outcome.kind, "service")
  assert.equal(outcome.authenticated, false, "a signed alias cannot vouch for an unsigned target")
})

test("a circular alias chain ends rather than recursing forever", async () => {
  const resolve = zone({
    [`${HTTPS} a.example.com`]: answer("a.example.com", HTTPS, "0 b.example.com."),
    [`${HTTPS} b.example.com`]: answer("b.example.com", HTTPS, "0 a.example.com."),
  })

  const outcome = await chase("a.example.com", HTTPS, { resolve })

  assert.equal(outcome.kind, "chain")
  assert.equal(outcome.via.length, ALIAS_CHASE_LIMIT + 1)
})

test("the query set is every name the scanner probes, for each domain", () => {
  const queries = queriesFor("example.com").map((query) => `${query.type} ${query.name}`)

  assert.equal(queries.length, 7)
  assert.equal(new Set(queries).size, queries.length)
  for (const service of ["_index", "_a2a", "_mcp"]) {
    for (const type of [64, HTTPS]) {
      assert.ok(queries.includes(`${type} ${service}._agents.example.com`))
    }
  }
  // The TXT fallback is read at _index only, as the scanner reads it.
  assert.ok(queries.includes(`${TXT} _index._agents.example.com`))
})

test("a healthy signed zone reports no problems", async () => {
  const resolve = zone({
    [`${HTTPS} _index._agents.example.com`]: answer(
      "_index._agents.example.com",
      HTTPS,
      "1 www.example.com. alpn=h2",
    ),
  })

  const totals = await checkDomains(["example.com"], { resolve, log() {} })

  assert.equal(totals.usable, 1)
  assert.equal(totals.unauthenticated, 0)
  assert.equal(totals.broken, 0)
  assert.deepEqual(problemsIn(totals), [])
})

test("every failing condition is reported, not just the first", () => {
  const problems = problemsIn({ usable: 0, unauthenticated: 0, broken: 1, failures: 2 })

  assert.equal(problems.length, 3)
  assert.match(problems.join("\n"), /could not be resolved/)
  assert.match(problems.join("\n"), /do not lead to a ServiceMode record/)
  assert.match(problems.join("\n"), /No usable DNS-AID records/)
})

test("a resolver that throws fails the run instead of passing quietly", async () => {
  // Every query errors, so nothing was actually checked. Exiting 0 here would
  // report a clean zone on the strength of no evidence at all.
  const resolve = async () => {
    throw new Error("network down")
  }

  const totals = await checkDomains(["example.com"], { resolve, log() {} })

  assert.equal(totals.failures, 7)
  assert.equal(totals.usable, 0)
  assert.match(problemsIn(totals).join("\n"), /did not check everything/)
})
