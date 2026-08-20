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

Two ServiceMode SVCB records under the `_agents` namespace of the apex domain,
per `draft-mozleywilliams-dnsop-dnsaid` and the SVCB/HTTPS wire format in
[RFC 9460](https://www.rfc-editor.org/rfc/rfc9460).

```zone
; DNS for AI Discovery — draft-mozleywilliams-dnsop-dnsaid
; The site's entry point: where an agent starts.
_index._agents.skillsboard.sh. 3600 IN SVCB 1 www.skillsboard.sh. (
    alpn="h2,http/1.1"
    port=443
    mandatory=alpn,port )

; The Model Context Protocol server.
_mcp._agents.skillsboard.sh.   3600 IN SVCB 1 www.skillsboard.sh. (
    alpn="h2,http/1.1"
    port=443
    mandatory=alpn,port )
```

Notes on each field:

- **Owner name.** `_<service>._agents.<domain>`. `_index` is the well-known
  entry point a scanner looks for first. `_mcp` names the protocol this site
  actually speaks; `_a2a` appears in the draft's examples but Skills Board does
  not implement Agent-to-Agent, so publishing it would advertise a protocol
  that answers nothing.
- **SvcPriority `1`.** ServiceMode, not AliasMode. AliasMode (priority `0`)
  carries no parameters, and the parameters are the point.
- **TargetName `www.skillsboard.sh.`** The canonical host. The apex redirects to
  it, and a redirect an agent has to follow is worse than naming the target.
- **`alpn`.** The transport is ordinary HTTPS — HTTP/2 with an HTTP/1.1
  fallback — because the MCP server is streamable HTTP at
  `https://www.skillsboard.sh/api/mcp`.
- **`mandatory=alpn,port`.** A resolver that cannot honour both must treat the
  record as unusable rather than connect on a guess.

The record points at a host, not a path. The path is discovered over HTTP once
the agent is connected: `/.well-known/mcp/server-card.json` for the MCP
endpoint, `/.well-known/ai-catalog.json` for the full capability list.

Do not invent named SvcParamKeys for the endpoint path. Until a key is
registered with IANA the draft says to use numeric `keyNNNNN` names, and a
resolver that does not know the key will pass it through as an opaque value —
which is not worth publishing when the same information is one HTTP request
away.

## Where to apply it

`skillsboard.sh` is served through Vercel. Whichever nameservers hold the zone:

1. Add the two records above as **SVCB** (record type 64). If the provider's UI
   has no SVCB type, the zone cannot carry DNS-AID and the domain needs a
   provider that supports RFC 9460 record types.
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
# The record itself.
dig +short _index._agents.skillsboard.sh SVCB
dig +short _mcp._agents.skillsboard.sh SVCB

# Authenticated data: look for the `ad` flag.
dig +dnssec _index._agents.skillsboard.sh SVCB | grep -E 'flags:|RRSIG'

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
