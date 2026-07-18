import { DEFAULT_TIMEOUT_MS } from "./config.mjs";
import { ScorecardError } from "./errors.mjs";

const MAX_RESPONSE_BYTES = 1_000_000;

function responseError(response) {
  if (response.status === 401 || response.status === 403) {
    return new ScorecardError(
      "authentication_failed",
      "PostHog rejected the read-only API credentials.",
    );
  }

  if (response.status === 429) {
    return new ScorecardError(
      "rate_limited",
      "PostHog rate-limited the scorecard query.",
    );
  }

  if (response.status >= 500) {
    return new ScorecardError(
      "posthog_unavailable",
      "PostHog is temporarily unavailable.",
    );
  }

  return new ScorecardError(
    "query_rejected",
    `PostHog rejected the scorecard query with HTTP ${response.status}.`,
  );
}

export async function executeHogQlQuery({
  config,
  sql,
  fetchImpl = globalThis.fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}) {
  if (typeof fetchImpl !== "function") {
    throw new ScorecardError(
      "fetch_unavailable",
      "This Node.js runtime does not provide fetch.",
    );
  }

  const endpoint = new URL(
    `/api/projects/${encodeURIComponent(config.projectId)}/query/`,
    config.host,
  );
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let response;

    try {
      response = await fetchImpl(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: {
            kind: "HogQLQuery",
            query: sql,
          },
        }),
        cache: "no-store",
        signal: controller.signal,
      });
    } catch (error) {
      if (
        controller.signal.aborted ||
        (error && typeof error === "object" && error.name === "AbortError")
      ) {
        throw new ScorecardError(
          "query_timeout",
          "The PostHog scorecard query timed out.",
        );
      }

      throw new ScorecardError(
        "network_error",
        "The PostHog scorecard query could not reach the API.",
      );
    }

    if (!response.ok) {
      throw responseError(response);
    }

    const responseText = await response.text();
    if (Buffer.byteLength(responseText, "utf8") > MAX_RESPONSE_BYTES) {
      throw new ScorecardError(
        "response_too_large",
        "PostHog returned more data than an aggregate scorecard may contain.",
      );
    }

    try {
      return JSON.parse(responseText);
    } catch {
      throw new ScorecardError(
        "invalid_response",
        "PostHog returned invalid JSON.",
      );
    }
  } finally {
    clearTimeout(timeout);
  }
}
