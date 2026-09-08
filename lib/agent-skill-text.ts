/**
 * The one sanitizer for text read out of a third party SKILL.md.
 *
 * A skill descriptor is a file somebody else wrote, and both readers of it
 * render its strings somewhere a terminal escape would be interpreted: the
 * discovery path stores a name and a description that later reach an agent,
 * and the format checker quotes keys and values back in its report. Escape
 * sequences and control characters are stripped here so neither reader has to
 * remember to do it, and so the two cannot drift apart.
 *
 * Pure and free of `server-only`: the checker's rules run in a unit test and
 * in the browser as well as on the server.
 */

const CSI_ESCAPE = /\x1b\[[\x30-\x3f]*[\x20-\x2f]*[\x40-\x7e]/g
const OSC_ESCAPE = /\x1b\][\s\S]*?(?:\x07|\x1b\\)/g
const DCS_PM_APC_ESCAPE = /\x1b[P^_][\s\S]*?(?:\x1b\\)/g
const SIMPLE_ESCAPE = /\x1b[\x20-\x7e]/g
const C1_CONTROL = /[\x80-\x9f]/g
const TERMINAL_CONTROL = /[\x00-\x06\x07\x08\x0b\x0c\x0d-\x1a\x1c-\x1f\x7f]/g

/** One line of plain text: no escapes, no control characters, no newlines. */
export function sanitizeAgentSkillText(value: string) {
  return value
    .replace(OSC_ESCAPE, "")
    .replace(DCS_PM_APC_ESCAPE, "")
    .replace(CSI_ESCAPE, "")
    .replace(SIMPLE_ESCAPE, "")
    .replace(C1_CONTROL, "")
    .replace(TERMINAL_CONTROL, "")
    .replace(/[\r\n]+/g, " ")
    .trim()
}
