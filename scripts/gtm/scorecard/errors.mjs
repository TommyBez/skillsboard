export class ScorecardError extends Error {
  constructor(code, message, dataStatus = "broken") {
    super(message);
    this.name = "ScorecardError";
    this.code = code;
    this.dataStatus = dataStatus;
  }
}

export function statusError(code, message) {
  return { code, message };
}

export function safeError(error) {
  if (error instanceof ScorecardError) {
    return statusError(error.code, error.message);
  }

  return statusError(
    "unexpected_error",
    "The PostHog scorecard runner failed unexpectedly.",
  );
}

export function queryStatusForError(error) {
  return error instanceof ScorecardError && error.dataStatus === "unavailable"
    ? "unavailable"
    : "broken";
}
