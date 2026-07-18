import { resolve } from "node:path";

import { config as loadDotenv } from "dotenv";

import {
  DEFAULT_OUTPUT_PATH,
  DEFAULT_TIMEOUT_MS,
  REPOSITORY_ROOT,
} from "./config.mjs";
import { ScorecardError, safeError, statusError } from "./errors.mjs";
import { writeJsonAtomically } from "./fs.mjs";
import { baseSnapshot, runScorecard } from "./run.mjs";

export function parseCliArguments(argumentsList) {
  const options = {
    check: false,
    help: false,
    outputPath: DEFAULT_OUTPUT_PATH,
    timeoutMs: DEFAULT_TIMEOUT_MS,
  };

  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];

    if (argument === "--check") {
      options.check = true;
      continue;
    }

    if (argument === "--help" || argument === "-h") {
      options.help = true;
      continue;
    }

    if (argument === "--output") {
      const outputPath = argumentsList[index + 1];
      if (!outputPath) {
        throw new ScorecardError(
          "invalid_arguments",
          "--output requires a file path.",
        );
      }

      options.outputPath = resolve(process.cwd(), outputPath);
      index += 1;
      continue;
    }

    if (argument === "--timeout-ms") {
      const timeoutValue = Number.parseInt(argumentsList[index + 1] ?? "", 10);
      if (
        !Number.isInteger(timeoutValue) ||
        timeoutValue < 1_000 ||
        timeoutValue > 60_000
      ) {
        throw new ScorecardError(
          "invalid_arguments",
          "--timeout-ms must be an integer between 1000 and 60000.",
        );
      }

      options.timeoutMs = timeoutValue;
      index += 1;
      continue;
    }

    throw new ScorecardError(
      "invalid_arguments",
      "An unknown command-line argument was provided.",
    );
  }

  return options;
}

function helpText() {
  return [
    "Usage: node scripts/gtm/posthog-scorecard.mjs [--check] [--output PATH] [--timeout-ms N]",
    "",
    "Without --check, executes aggregate queries and atomically writes:",
    `  ${DEFAULT_OUTPUT_PATH}`,
    "",
    "--check validates credentials and PostHog query API access without writing a snapshot.",
  ].join("\n");
}

export async function runCli(argumentsList = process.argv.slice(2)) {
  loadDotenv({
    path: resolve(REPOSITORY_ROOT, ".env.local"),
    override: false,
    quiet: true,
  });

  let options;
  try {
    options = parseCliArguments(argumentsList);
  } catch (error) {
    const snapshot = baseSnapshot({
      generatedAt: new Date().toISOString(),
      mode: "check",
    });
    snapshot.error = safeError(error);
    process.stdout.write(`${JSON.stringify(snapshot, null, 2)}\n`);
    return 1;
  }

  if (options.help) {
    process.stdout.write(`${helpText()}\n`);
    return 0;
  }

  const snapshot = await runScorecard({
    check: options.check,
    timeoutMs: options.timeoutMs,
  });

  if (!options.check) {
    await writeJsonAtomically(options.outputPath, snapshot);
  }

  process.stdout.write(`${JSON.stringify(snapshot, null, 2)}\n`);

  if (snapshot.status === "ready") {
    return 0;
  }

  return snapshot.status === "unavailable" ? 2 : 1;
}

export function writeUnexpectedCliFailure() {
  const snapshot = baseSnapshot({
    generatedAt: new Date().toISOString(),
    mode: "snapshot",
  });
  snapshot.error = statusError(
    "unexpected_error",
    "The PostHog scorecard runner failed unexpectedly.",
  );
  process.stdout.write(`${JSON.stringify(snapshot, null, 2)}\n`);
}
