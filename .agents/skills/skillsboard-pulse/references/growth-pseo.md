# Problem-led pSEO learning lane

**Node:** `growth.pseo`

This protected audience-led search lane is independent of the routed Product/Growth queue and PostHog availability. It is a bounded publish-to-learn system, not a page factory. Load for the weekly research pass, pSEO backlog, Search Console/DataForSEO use, an active page or PR, or a T+3/7/14/28 checkpoint.

## Research and identity

Every seven days research ICP problems and interests. Monday refreshes public evidence; prior work never skips sensing. Deduplicate product routes, intents/URLs/PRs, SERPs, public signals, Search Console, PostHog, and DataForSEO. Keep 30 seeds, shortlist five, and record market, language, provenance, date, and status.

Intent adjacency is audience-led, not keyword-led: queries need not contain “skill”, “agent”, “library”, or the product name. Store audience problem, intent, bridge hypothesis/evidence; require current ICP affinity, standalone value, and a truthful conversion path. Reject imagined affinity or traffic-only bridges.

- `canonical_intent_id` = normalized locale + audience/problem + intent, independent of format.
- `problem_cluster_id` = normalized locale + audience/problem family, independent of query and format.
- One learning PR contains at most two pages from one problem cluster and locks `github + content_cluster + production + problem_cluster_id`.
- Start at most three new experimental pSEO PRs per rolling seven days, each for a materially distinct `problem_cluster_id`; each PR still contains at most two pages and overlapping active clusters remain ineligible.
- At most four indexable experimental pages may remain live without a completed T+14 checkpoint by default. The limit may rise to eight only after every earlier live cluster has passed its T+3 technical-health checkpoint; any unresolved or failed checkpoint restores the limit to four and blocks further publication.

Missing or zero keyword volume is prioritization evidence, not a veto for bounded qualitative learning and never becomes asserted demand. Qualitative publication requires each page to have distinct intent, current attributable evidence, product fit, differentiated standalone utility, truthful shipped claims from `product.truth`, useful page-specific content, internal links, metadata, sitemap/indexation handling, supported structured data, measurement, rollback or `noindex`, and local verification. Quantitative demand or positive deployed-page evidence may justify at most three additional sibling pages through a separate queued scaling action.

Waiting for an existing page's maturity does not block a distinct cluster whose caps and gates pass. Monday selects the strongest eligible search action, a seven-day evidence repair, or an exact hard gate; “not due” is invalid.

The pSEO PR is the independent human checkpoint; no extra pilot approval exists. The three-cluster rolling pSEO PR budget is separate from general Product/Growth PRs.

## Sources

Public SERPs, official vendor material, primary research, and attributable public problem signals are eligible qualitative sources when their terms and data safety pass. Search Console is read-only and must use an official connected integration; its exact configured property must match live readback. No scraped UI, screenshot, unofficial client, or inferred property is allowed. Missing Search Console access disables only its fields.

DataForSEO is the only metered provider and Monday's default enrichment when route, quota, ledger, and spend pass. Start from audience/problem signals, not product-name keywords; use the smallest useful keyword/SERP batch. Failure disables only quantitative fields. Never decode, print, store, or copy its base64 credential. Defaults: location `2840`, language `en`.

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
- local desktop/mobile smoke of the affected flow before PR when available, otherwise an explicit `qa_required` record under `delivery.repository` that blocks merge and exposure until cleared.

Do not mass-generate thin variants, invent source evidence, or treat the at-most-two-page PR as permission to fill its quota.

## Checkpoints and decisions

- **T+3:** verify production deployment, canonical URL, sitemap discovery, crawlability, actual indexation state, and runtime health; repair a technical blocker immediately.
- **T+7:** read Search Console discovery, queries, and impressions plus pageviews and attributable intent where trustworthy. Correct-intent impressions keep the page active; wrong-intent impressions allow one bounded title, introduction, or targeting revision; zero on a healthy indexed page is insufficient evidence.
- **T+14:** make the first learning decision. Growing/correct-intent impressions may authorize separately routed sibling expansion; mismatch allows one repositioning iteration; a healthy zero-impression page remains observable through T+28.
- **T+28:** retain or expand useful discovery; otherwise consolidate, `noindex`, or retire. A second material iteration is eligible only on materially new attributable evidence, creates a new definition hash, and sets an absolute T+56 decision deadline unless frozen non-SEO utility already passes.

Zero impressions before T+28 is not negative value when technical health is valid. Without materially new evidence, a page still indexed with zero useful impressions at T+28 must be consolidated, `noindex`ed, or retired unless documented non-SEO value passes its frozen test. A page receiving the one eligible second material iteration must make that decision no later than T+56. Pause a pattern after two comparable mature misses.

Roll back or contain immediately for factual/product-contract error, privacy risk, broken routes, accidental indexation, or confirmed canonical conflict. Missing quantitative data is never silently converted to failure.
