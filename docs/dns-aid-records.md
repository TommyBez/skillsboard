# DNS for AI Discovery (DNS-AID) records

DNS-AID lets an agent find a domain's agent endpoints from a DNS lookup, before
it fetches anything over HTTP. It is the one item in the agent-discovery set
that **cannot be shipped from this repository**: the records live in the
`skillsboard.sh` zone, and this codebase does not manage DNS. The rest of the
discovery surface — the well-known documents, `auth.md`, `robots.txt` — is code
and is already deployed.

This file is the change to apply, so the zone edit is a copy-and-paste rather
than a re-derivation.

## Where the zone stands today

Checked 2026-08-21 over DNS-over-HTTPS, the same way the scanner checks:

| Fact | Value | Consequence |
| --- | --- | --- |
| Authoritative nameservers | `ns1.vercel-dns.com.` (SOA `hostmaster.nsone.net.`) | The zone is on Vercel DNS, so Vercel's record-type support decides what can be published. |
| `DS` and `DNSKEY` at `skillsboard.sh` | Absent | The zone is unsigned. Every answer comes back `AD: false`. |
| `_index._agents` / `_mcp._agents` / `_a2a._agents`, under both the apex and `www` | `NOERROR`, no answers | Nothing is published yet. |

Re-run the checks in [Verifying](#verifying) before applying anything; a zone
that moved provider changes which of the two record sets below applies.

## Vercel DNS cannot carry SVCB, only HTTPS

This is the constraint that shapes everything else. Vercel's DNS record type
enum — in the [create-a-DNS-record API](https://vercel.com/docs/rest-api/dns/create-a-dns-record)
and in `vercel dns add` — is `A`, `AAAA`, `ALIAS`, `CAA`, `CNAME`, `HTTPS`,
`MX`, `SRV`, `TXT`, `NS`. There is no `SVCB` (RR type 64). There is `HTTPS`
(RR type 65), which is the same wire format and the same SvcParams, specialised
for HTTPS origins by [RFC 9460](https://www.rfc-editor.org/rfc/rfc9460).

That is enough. Every endpoint DNS-AID would advertise here is an HTTPS origin,
the draft permits the HTTPS RR for exactly that case, and the scanner queries
**both** `SVCB` and `HTTPS` at every name it probes (see the query list under
[What the scanner actually asks for](#what-the-scanner-actually-asks-for)). So
publish the HTTPS form while the zone is on Vercel DNS, and keep the SVCB form
for a zone that moves to a provider supporting RR type 64.

## What to publish (Vercel DNS, HTTPS records)

Two primary ServiceMode records that describe the endpoints, and two AliasMode
records under the `_agents` inventory leaf that point at them, per
`draft-mozleywilliams-dnsop-dnsaid-02`.

The split is not stylistic. The draft is explicit about the inventory leaf:

> Operators MAY publish the same agent under an `_agents.example.com` inventory
> leaf ... In these cases SVCB AliasMode MUST be used to point at the primary
> owner.

So the parameters live on the primary owner, and `_agents` only redirects.

Vercel's HTTPS record body is `{ priority, target, params }`, where `params` is
the SvcParams in RFC 9460 presentation form as a single string. Priority `0` is
AliasMode; anything higher is ServiceMode.

```sh
# 1. The site's agent entry point, ServiceMode. `well-known` is relative to
#    /.well-known/, so this names the ARD manifest listing every resource an
#    agent can fetch here.
curl -X POST "https://api.vercel.com/v2/domains/skillsboard.sh/records" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "HTTPS",
    "name": "agents-index",
    "ttl": 3600,
    "https": {
      "priority": 1,
      "target": "www.skillsboard.sh",
      "params": "alpn=h2,http/1.1 port=443 mandatory=alpn,port"
    },
    "comment": "DNS-AID entry point, draft-mozleywilliams-dnsop-dnsaid-02"
  }'

# 2. The MCP server, ServiceMode.
curl -X POST "https://api.vercel.com/v2/domains/skillsboard.sh/records" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "HTTPS",
    "name": "agents-mcp",
    "ttl": 3600,
    "https": {
      "priority": 1,
      "target": "www.skillsboard.sh",
      "params": "alpn=h2,http/1.1 port=443 mandatory=alpn,port"
    },
    "comment": "DNS-AID MCP endpoint, draft-mozleywilliams-dnsop-dnsaid-02"
  }'

# 3-4. The inventory leaves, AliasMode: priority 0, no params of their own.
curl -X POST "https://api.vercel.com/v2/domains/skillsboard.sh/records" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "HTTPS",
    "name": "_index._agents",
    "ttl": 3600,
    "https": { "priority": 0, "target": "agents-index.skillsboard.sh" },
    "comment": "DNS-AID inventory leaf"
  }'

curl -X POST "https://api.vercel.com/v2/domains/skillsboard.sh/records" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "HTTPS",
    "name": "_mcp._agents",
    "ttl": 3600,
    "https": { "priority": 0, "target": "agents-mcp.skillsboard.sh" },
    "comment": "DNS-AID inventory leaf"
  }'
```

The resulting zone, in presentation form:

```zone
agents-index.skillsboard.sh.   3600 IN HTTPS 1 www.skillsboard.sh. alpn="h2,http/1.1" port=443 mandatory=alpn,port
agents-mcp.skillsboard.sh.     3600 IN HTTPS 1 www.skillsboard.sh. alpn="h2,http/1.1" port=443 mandatory=alpn,port
_index._agents.skillsboard.sh. 3600 IN HTTPS 0 agents-index.skillsboard.sh.
_mcp._agents.skillsboard.sh.   3600 IN HTTPS 0 agents-mcp.skillsboard.sh.
```

Note what is missing next to the SVCB form below: `bap` and `well-known`. Vercel
passes `params` through to NS1, which validates SvcParams against the registered
keys, and neither key is registered yet (the draft defers the numbers to IANA).
Try the record with them; if it is rejected, publish without them. The draft's
own guidance is to use the numeric `keyNNNNN` form once the numbers are
assigned, and until then the same information is one HTTP request away at
`/.well-known/ai-catalog.json`.

## What to publish (a provider that supports SVCB)

Identical records, as RR type 64, with the two experimental parameters the
Vercel path has to drop:

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

## What the scanner actually asks for

Taken from a live scan of `https://www.skillsboard.sh` on 2026-08-21, so the
record set above is aimed at the names that are really queried rather than at
the ones the draft happens to use in its examples:

```
SVCB|HTTPS  _index._agents.www.skillsboard.sh    SVCB|HTTPS  _index._agents.skillsboard.sh
SVCB|HTTPS  _a2a._agents.www.skillsboard.sh      SVCB|HTTPS  _a2a._agents.skillsboard.sh
SVCB|HTTPS  _mcp._agents.www.skillsboard.sh      SVCB|HTTPS  _mcp._agents.skillsboard.sh
TXT         _index._agents.www.skillsboard.sh    TXT         _index._agents.skillsboard.sh
```

Three things follow from that list:

1. **Both the apex and `www` are probed.** The records above are published at
   the apex, which is where the zone is. If a scan reports the apex records but
   the site is canonically `www`, publishing the same four names under
   `_agents.www.skillsboard.sh` costs nothing and removes the ambiguity.
2. **`HTTPS` is queried beside `SVCB` at every name**, which is what makes the
   Vercel path viable at all.
3. **A `TXT` fallback at `_index._agents` is read** (the draft discusses TXT as
   a fallback in section 4, for exactly the case where a DNS provider has no
   SVCB support). It is not used here: the draft specifies no RDATA format for
   it, so anything published would be a guess, and Vercel's `HTTPS` support
   means the fallback is not needed.

## DNSSEC

The zone is unsigned today — no `DS` at the registrar, no `DNSKEY` in the zone,
and every answer comes back with `AD: false`. That matters more than it looks:
an unauthenticated discovery record is one an on-path attacker can rewrite to
point an agent at a host that is not ours, and the scanner reads `AD` from the
DoH response, so a correct record on an unsigned zone is still reported as
failing.

Vercel's DNS documentation does not describe signing a zone served from
`vercel-dns.com` nameservers. Before publishing, check whether signing is
available for this domain in the Vercel dashboard. If it is not, the zone has to
move to a provider that both signs and supports RFC 9460 record types, and the
`DS` record then goes to the registrar for `.sh`. Allow for propagation of the
`DS` before re-checking `AD`.

## Applying it

1. Add the four records for whichever provider holds the zone: the two primary
   `agents-*` records first, then the two `_agents` aliases that point at them.
2. Enable DNSSEC, per the section above.
3. Keep the TTL at 3600. These records change roughly never, and a short TTL
   only multiplies lookups.

## Verifying

`pnpm dns:check` runs every query the scanner runs, over the same DoH resolver,
and prints what came back:

```sh
pnpm dns:check                      # www.skillsboard.sh and skillsboard.sh
pnpm dns:check example.com          # any other domain
```

By hand:

```sh
# The inventory leaves. Each answers with an AliasMode record (priority 0)
# naming its primary owner, and no parameters of its own.
dig +short _index._agents.skillsboard.sh HTTPS
dig +short _mcp._agents.skillsboard.sh HTTPS

# The primaries the aliases point at. The parameters live here.
dig +short agents-index.skillsboard.sh HTTPS
dig +short agents-mcp.skillsboard.sh HTTPS

# Authenticated data: look for the `ad` flag.
dig +dnssec _mcp._agents.skillsboard.sh HTTPS | grep -E 'flags:|RRSIG'

# What the scanner does: DNS-over-HTTPS, Cloudflare first, Google as fallback.
curl -sH 'accept: application/dns-json' \
  'https://cloudflare-dns.com/dns-query?name=_index._agents.skillsboard.sh&type=HTTPS&do=1'
```

Then re-run the scan; it reports this under `checks.discoverability.dnsAid`:

```sh
curl -sX POST https://isitagentready.com/api/scan \
  -H 'Content-Type: application/json' \
  -d '{"url": "https://www.skillsboard.sh"}' |
  python3 -c 'import json,sys; print(json.load(sys.stdin)["checks"]["discoverability"]["dnsAid"])'
```

Swap `SVCB` for `HTTPS` in every command above if the zone ends up on a provider
that carries RR type 64.

## Reference

- <https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/>
- <https://www.rfc-editor.org/rfc/rfc9460>
- <https://vercel.com/docs/rest-api/dns/create-a-dns-record>
