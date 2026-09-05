/**
 * The three moves the workflow chapter walks through, without their visuals.
 *
 * Shared so the home page's Markdown twin describes the same three steps the
 * page shows, rather than a paraphrase that can drift away from it.
 */
export const landingFlowSteps = [
  {
    index: "1",
    title: "Save the skill",
    copy: "Paste a GitHub skill URL you want the team to reuse. Skills Board keeps the name, description, and install command tied to it.",
  },
  {
    index: "2",
    title: "Find it later",
    copy: "One searchable library for the whole team, no more scrolling chat history for that one link somebody posted.",
  },
  {
    index: "3",
    title: "Use it your way",
    copy: "Open the source, copy a compatible install command, download the latest files as a ZIP, or search the same library from your connected agent.",
  },
] as const
