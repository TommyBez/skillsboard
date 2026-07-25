# Problem-led pSEO learning lane

**Node:** `growth.pseo`

This protected lane is independent of the routed Product/Growth queue and PostHog availability. It is a bounded publish-to-learn system, not a page factory. Load for the weekly research pass, pSEO backlog, Search Console/DataForSEO use, an active page or PR, or a T+3/7/14/28 checkpoint.

## Research and identity

At least every seven days research adjacent team problems with a truthful path to creating a team skill library. Refresh a deduplicated backlog from current product routes, existing canonical intents/URLs/candidates/open PRs, public SERPs, official vendor material, primary research, attributable public problem signals, Search Console when connected, downstream PostHog outcomes, and optional DataForSEO. Maintain at most 30 deduplicated seeds and shortlist at most five. The first heartbeat catches an overdue pass. Record market, language, provenance, source/event date, and `available|unavailable|broken`.

- `canonical_intent_id` = normalized locale + audience/problem + intent, independent of format.
- `problem_cluster_id` = normalized locale + audience/problem family, independent of query and format.
- One learning PR contains at most two pages from one problem cluster and locks `github + content_cluster + production + problem_cluster_id`.
- Start at most one new experimental pSEO PR per seven-day learning slot even if the prior PR merges sooner.
- At most four indexable experimental pages may remain live without a completed T+14 checkpoint.

Missing or zero keyword volume is prioritization evidence, not a veto for bounded qualitative learning and never becomes asserted demand. Qualitative publication requires each page to have distinct intent, current attributable evidence, product fit, differentiated standalone utility, truthful shipped claims from `product.truth`, useful page-specific content, internal links, metadata, sitemap/indexation handling, supported structured data, measurement, rollback or `noindex`, and local verification. Quantitative demand or positive deployed-page evidence may justify at most three additional sibling pages through a separate queued scaling action.

The pSEO PR is the independent human checkpoint; no extra pilot approval exists. The pSEO PR slot is separate from general Product/Growth PRs.

## Sources

Public SERPs, official vendor material, primary research, and attributable public problem signals are eligible qualitative sources when their terms and data safety pass. Search Console is read-only and must use an official connected integration; its exact configured property must match live readback. No scraped UI, screenshot, unofficial client, or inferred property is allowed. Missing Search Console access disables only its fields.

DataForSEO is the only metered research provider and optional enrichment. Use only the approved operation route after secure credential presence, target scope, quota, and spend checks pass. The credential is the existing base64-encoded `login:password` value; never decode, print, store, or copy it. Target location code is `2840` and language code is `en` unless a stricter private setting narrows the operation.

The private loader recognizes these exact non-PII configuration names and rejects unknown or broader values:

```text
PULSE_GSC_PROPERTY
DATA_FOR_SEO_LOGIN_PASSWORD
PULSE_DATAFORSEO_LOCATION_CODE=2840
PULSE_DATAFORSEO_LANGUAGE_CODE=en
PULSE_DATAFORSEO_RUN_REQUEST_CAP=200
PULSE_DATAFORSEO_RUN_HARD_USD=2.00
PULSE_DATAFORSEO_MONTH_HARD_USD=10.00
PULSE_DATAFORSEO_RUN_RESERVATION_USD=1.80
PULSE_DATAFORSEO_MONTH_RESERVATION_USD=9.00
```

The numeric values may narrow but never increase the repository caps. `PULSE_GSC_PROPERTY` must exactly match official Search Console readback. Secret values are checked for presence only and never echoed.

Quantitative fields store value, status, source, market/language, and `as_of`. Keep search volume, monthly searches, keyword difficulty, Google Ads competition, CPC, and categorical intent distinct. A demand decision freezes a versioned market, language, formula, completeness rule, comparison window, and threshold.

## Metered ledger

Use the Europe/Rome calendar month.

- Hard cap: USD 2.00 per run, USD 10.00 per month, and 200 requests per run.
- Normal reservation ceiling with 10% safety margin: USD 1.80 per run and USD 9.00 per month. The margin may only absorb provider variance or finish an already issued bounded operation.
- `availability = hard_cap - confirmed_actual - active_reservations - ambiguous_amount`.
- Atomically reserve worst-case cost before a call. Release only a never-issued reservation. Reconcile an issued request from official actuals.
- A lost/ambiguous response retains its full reservation and is not blindly retried. Unresolved amounts crossing a month boundary encumber the new month.
- Use provider billing timestamp when available, otherwise request timestamp.
- An overrun pauses the metered perimeter; uncontrolled continuing spend is SEV0.

The route must also pass the shared included-quota reserve in `pulse.kernel`. Missing credentials, caps, or quota readback make only DataForSEO unavailable. Qualitative research continues. State/digest shows currency, period, confirmed actual, reserved, ambiguous, hard-cap remaining, normal-ceiling remaining, request count, and opaque provider references.

## Publication gates

Before a repository PR, add `delivery.repository`, `product.truth`, and the exact specialist skills resolved by the graph. Require:

- one `canonical_intent_id` per page, one shared `problem_cluster_id` for the PR, and no overlapping active cluster PR;
- useful standalone content that solves the queried problem rather than doorway or templated filler;
- only verified shipped product claims and a natural path to Skills Board;
- canonical, metadata, internal-link, sitemap, robots/indexation, structured-data, and privacy safety;
- page-level measurement and rollback/noindex path;
- local desktop/mobile smoke of the affected flow before PR.

Do not mass-generate thin variants, invent source evidence, or treat the at-most-two-page PR as permission to fill its quota.

## Checkpoints and decisions

- **T+3:** verify production deployment, canonical URL, sitemap discovery, crawlability, actual indexation state, and runtime health; repair a technical blocker immediately.
- **T+7:** read Search Console discovery, queries, and impressions plus pageviews and attributable intent where trustworthy. Correct-intent impressions keep the page active; wrong-intent impressions allow one bounded title, introduction, or targeting revision; zero on a healthy indexed page is insufficient evidence.
- **T+14:** make the first learning decision. Growing/correct-intent impressions may authorize separately routed sibling expansion; mismatch allows one repositioning iteration; a healthy zero-impression page remains observable through T+28.
- **T+28:** retain or expand useful discovery; otherwise consolidate, `noindex`, or retire after one material iteration unless frozen non-SEO utility passes.

Zero impressions before T+28 is not negative value when technical health is valid. After one material iteration, a page still indexed with zero useful impressions at T+28 must be consolidated, `noindex`ed, or retired unless documented non-SEO value passes its frozen test. Pause a pattern after two comparable 28-day misses.

Roll back or contain immediately for factual/product-contract error, privacy risk, broken routes, accidental indexation, or confirmed canonical conflict. Missing quantitative data is never silently converted to failure.
