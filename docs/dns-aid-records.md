# DNS for AI Discovery (DNS-AID) records

DNS-AID lets an agent find a domain's agent endpoints from a DNS lookup, before
it fetches anything over HTTP. It is the one item in the agent-discovery set
that **cannot be shipped from this repository**: the records live in the
`skillsboard.sh` zone, and this codebase does not manage DNS. The rest of the
discovery surface — the well-known documents, `auth.md`, `robots.txt` — is code
and is already deployed.

This file is the change to apply, so the zone edit is a copy-and-paste rather
than a re-derivation.

## What to publish

Two primary ServiceMode records that describe the endpoints, and two AliasMode
records under the `_agents` inventory leaf that point at them, per
`draft-mozleywilliams-dnsop-dnsaid-02` and the SVCB/HTTPS wire format in
[RFC 9460](https://www.rfc-editor.org/rfc/rfc9460).

The split is not stylistic. The draft is explicit about the inventory leaf:

> Operators MAY publish the same agent under an `_agents.example.com` inventory
> leaf ... In these cases SVCB AliasMode MUST be used to point at the primary
> owner.

So the parameters live on the primary owner, and `_agents` only redirects.

```zone
; DNS for AI Discovery, draft-mozleywilliams-dnsop-dnsaid-02
;
; Primary ServiceMode records. These carry the parameters.
;
; The site's agent entry point. `well-known` is relative to /.well-known/,
; so this names https://www.skillsboard.sh/.well-known/ai-catalog.json,
; the ARD manifest listing every resource an agent can fetch here.
agents-index.skillsboard.sh. 3600 IN SVCB 1 www.skillsboard.sh. (
    alpn="h2,http/1.1"
    port=443
    well-known=ai-catalog.json
    mandatory=alpn,port )

; The Model Context Protocol server. `bap` names the agent protocol, which
; `alpn` cannot: alpn describes the transport, and this one is ordinary HTTPS.
agents-mcp.skillsboard.sh.   3600 IN SVCB 1 www.skillsboard.sh. (
    alpn="h2,http/1.1"
    port=443
    bap=mcp
    well-known=mcp/server-card.json
    mandatory=alpn,port )

; Inventory leaves. AliasMode (SvcPriority 0), carrying no parameters.
_index._agents.skillsboard.sh. 3600 IN SVCB 0 agents-index.skillsboard.sh.
_mcp._agents.skillsboard.sh.   3600 IN SVCB 0 agents-mcp.skillsboard.sh.
```

Notes on each field:

- **Owner names.** `_<service>._agents.<domain>` is the inventory leaf an agent
  enumerates. `_index` is the entry point a scanner looks for first; `_mcp`
  names the protocol this site actually speaks. `_a2a` appears in the draft's
  examples, but Skills Board does not implement Agent-to-Agent, so publishing
  it would advertise a protocol that answers nothing.
- **SvcPriority `0` on the `_agents` records.** AliasMode, as the draft
  requires for an inventory leaf. A client follows the alias to the primary
  owner and reads the parameters there.
- **SvcPriority `1` on the primary records.** ServiceMode, where the parameters
  are legal to carry.
- **TargetName `www.skillsboard.sh.`** The canonical host. The apex redirects to
  it, and a redirect an agent has to follow is worse than naming the target.
- **`alpn`.** The transport is ordinary HTTPS, HTTP/2 with an HTTP/1.1
  fallback, because the MCP server is streamable HTTP at
  `https://www.skillsboard.sh/api/mcp`.
- **`bap=mcp`.** Which agent protocol the endpoint speaks, so a client can match
  on it without parsing `alpn`. The draft marks this key experimental and
  permits the protocol in `alpn` instead; it is not in `mandatory` precisely
  because a resolver that does not know the key must still be able to use the
  record.
- **`well-known`.** The RFC 8615 path, relative to `/.well-known/`, that holds
  the machine-readable description, so an agent arrives already knowing where
  to read rather than guessing.
- **`mandatory=alpn,port`.** A resolver that cannot honour both must treat the
  record as unusable rather than connect on a guess.

`cap` and `cap-sha256` are deliberately absent. `cap-sha256` is a digest of the
canonical capability descriptor, and this site's descriptor is generated per
deployment (`/.well-known/ai-catalog.json` names the origin serving it), so any
digest committed to DNS would be wrong for every deployment but one. A digest
that does not match is worse than no digest.

One practical caveat: `bap`, `well-known`, `cap`, and `cap-sha256` have no IANA
assignment yet. The names above are the draft's presentation names, and a
provider that validates SvcParams against the registry may reject them. Where
that happens, the draft's guidance is to use the numeric `keyNNNNN` form once
the numbers are assigned; until then, publish the two records without those
keys rather than guessing a number, since the same information is one HTTP
request away at `/.well-known/ai-catalog.json`.

## Where to apply it

`skillsboard.sh` is served through Vercel. Whichever nameservers hold the zone:

1. Add all four records above as **SVCB** (record type 64): the two primary
   `agents-*` records first, then the two `_agents` aliases that point at them.
   If the provider's UI has no SVCB type, the zone cannot carry DNS-AID and the
   domain needs a provider that supports RFC 9460 record types.
2. Enable **DNSSEC** on the zone if it is not already signed. A validating
   resolver only returns authenticated data for a signed zone, and an
   unauthenticated discovery record is one an on-path attacker can rewrite to
   point an agent at a host that is not ours. Turning DNSSEC on requires
   publishing the DS record at the registrar, so allow for propagation before
   verifying.
3. Keep the TTL at 3600. These records change roughly never, and a short TTL
   only multiplies lookups.

## Verifying

```sh
# The inventory leaves. Each answers with an AliasMode record (priority 0)
# naming its primary owner, and no parameters of its own.
dig +short _index._agents.skillsboard.sh SVCB
dig +short _mcp._agents.skillsboard.sh SVCB

# The primaries the aliases point at. The parameters live here.
dig +short agents-index.skillsboard.sh SVCB
dig +short agents-mcp.skillsboard.sh SVCB

# Authenticated data: look for the `ad` flag.
dig +dnssec _mcp._agents.skillsboard.sh SVCB | grep -E 'flags:|RRSIG'

# What the scanner does: DNS-over-HTTPS, Cloudflare first, Google as fallback.
curl -sH 'accept: application/dns-json' \
  'https://cloudflare-dns.com/dns-query?name=_index._agents.skillsboard.sh&type=SVCB'
```

The scanner reports this under `checks.discoverability.dnsAid.status`; it reads
`AD: true` from the DoH response, so a correct record on an unsigned zone will
still be reported as failing.

## Reference

- <https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/>
- <https://www.rfc-editor.org/rfc/rfc9460>
