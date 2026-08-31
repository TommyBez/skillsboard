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

/** One instruction inside the skill file. `key` is one of the two the run used. */
export interface NoteLine {
  text: string;
  key?: boolean;
}

/** The teammate's note, one sentence per row, as `../content` keeps it. */
const savedNote = agentRun.note
  .split(". ")
  .map((part, index, all) => (index < all.length - 1 ? `${part}.` : part));

/**
 * The instructions inside the skill file.
 *
 * `../content` keeps the note at the two sentences the long videos print, and it
 * stays that way: those two are the ones the run visibly obeys, so a longer
 * string there would put words in the output the output never uses. A file with
 * two lines in it is not a file anybody wrote, though, so the spot shows the
 * rest of the page around them (maintainer feedback, 31/08). The two saved
 * sentences come straight out of the note and keep their full size; the other
 * three are set smaller and quieter, which is how a real page reads: you see the
 * shape of a list and you read the lines that matter.
 */
export const noteLines: NoteLine[] = [
  { text: "Start from the merged pull requests since the last tag." },
  { key: true, text: savedNote[0] },
  { key: true, text: savedNote[1] },
  { text: "Keep every entry under twelve words." },
  { text: "Skip internal refactors unless they change behavior." },
];

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

/**
 * The skill file heading, kept in two pieces. The name is the one object the
 * fused beat moves: it starts as the title of the card and ends as the heading
 * of the file, so it cannot be a single baked string with the hash already in
 * it. The hash arrives on its own, while the name is still travelling.
 */
export const skillFileHeading = { hash: "# ", name: agentRun.hit.title } as const;

/** `agentRun.reach.line`, broken after the comma. */
export const reachLines = splitLine(agentRun.reach.line, 22);

/** The instruction over the endpoint plate, the same one the setup video uses. */
export const endpointHeading = setup.config.heading;
