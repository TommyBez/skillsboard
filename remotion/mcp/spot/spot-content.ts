/**
 * The strings the spot puts on screen.
 *
 * Almost everything is re-exported from `../content`, which is the file the two
 * long MCP videos already read from, so the spot cannot claim anything the
 * longer cuts do not. What is added here is line breaking: a spot sets type at
 * billboard size, and a sentence that fits one console row has to be broken by
 * hand to fit one frame. The breaks are computed from the source sentence, so a
 * copy change upstream moves the break instead of silently going off screen.
 */

import { agentRun, brand, setup } from "../content";

export { agentRun, brand };

/** Breaks `text` at the last space at or before `at`, keeping both halves whole. */
function splitLine(text: string, at: number): [string, string] {
  const cut = text.lastIndexOf(" ", at);

  return cut < 0 ? [text, ""] : [text.slice(0, cut), text.slice(cut + 1)];
}

/**
 * The opening card. The one sentence written for the spot rather than lifted
 * from the product: it names the habit the whole film is about and stays clear
 * of the example, which does not arrive for another eight seconds.
 */
export interface Segment {
  text: string;
  accent?: boolean;
}

export const hookLines: Segment[][] = [
  [{ text: "Every team has " }, { text: "its own way", accent: true }],
  [{ text: "of doing things." }],
];

/**
 * The library beat.
 *
 * The product is the shelf, not the one skill the example run pulls off it, so
 * the shelf has to be on screen before the run starts. The team is the invented
 * one the long videos already use, and the five entries under it are invented
 * too: they are there to show a plural, and none of them carries a product
 * claim. `release-notes` is the entry the rest of the film follows, which is why
 * it is listed first and why it is the one that gets marked.
 */
export const libraryHeading = `${agentRun.hit.team} team library`;

export const librarySkills = [
  { name: agentRun.hit.title, tag: agentRun.hit.tags[0] },
  { name: "pr-review", tag: "code" },
  { name: "bug-triage", tag: "support" },
  { name: "onboarding-guide", tag: "docs" },
  { name: "customer-feedback", tag: "research" },
] as const;

/** The count under the heading, kept true to the grid above it. */
export const librarySkillCount = `${librarySkills.length} skills saved by the team`;

/** What the card fragment is a fragment of, once the library has been seen. */

/**
 * The client the spot films.
 *
 * The long agent video films `agentRun.client`; the spot films the desktop app,
 * because a chat window reads at broadcast size in a way a shell prompt does
 * not. It is the second name on the list the closing chips already carry, so the
 * film never shows a client the product has not named.
 */
export const spotClient = agentRun.reach.clients[1];

/** The furniture of that window: app chrome, not product copy. */
export const desktop = {
  app: "Claude",
  placeholder: "Reply to Claude...",
  running: "Running",
  done: "Completed",
} as const;

const callOpens = agentRun.call.indexOf("(");

/** `search_skills`, taken off the front of the call the long video prints. */
export const toolName = agentRun.call.slice(0, callOpens);

/** The argument of that same call, printed the way a client prints JSON. */
export const toolArgs = agentRun.call.slice(callOpens + 1, -1).replace(/(\w+):/, '"$1":');

/** The task, as the person at the keyboard types it, over two rows. */
export const promptLines = splitLine(agentRun.prompt, 32);

/** The teammate's note, one sentence per row. */
export const noteLines = agentRun.note
  .split(". ")
  .map((part, index, all) => (index < all.length - 1 ? `${part}.` : part));

/**
 * The thesis beat. The film says what the product is with the canonical
 * definition from the marketing contract, not the "note" line: after the
 * release-notes de-emphasis the word note made the product read as a
 * note-taking tool (maintainer feedback, 31/08).
 */
export const applyLines = [
  "Skills Board, the web app where a team",
  "keeps and shares its AI skills.",
] as const;

/** The skill file heading shown over the instruction lines. */
export const skillFileName = `# ${agentRun.hit.title}`;

/** `agentRun.reach.line`, broken after the comma. */
export const reachLines = splitLine(agentRun.reach.line, 22);

/** The instruction over the endpoint plate, the same one the setup video uses. */
export const endpointHeading = setup.config.heading;
