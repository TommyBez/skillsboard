export const landingFaqs = [
  {
    question: "What is Skills Board?",
    answer:
      "Skills Board is a shared library where a team collects the AI skills it recommends. Teammates search that library, see where each skill comes from, and choose the source, install command, or ZIP that fits their agent setup.",
  },
  {
    question: "How is Skills Board different from a public skill catalog?",
    answer:
      "Public catalogs help you discover what exists. Skills Board captures the smaller set your own team recommends, keeps each entry tied to its original source, and offers more than one way to use a skill across different agents.",
  },
  {
    question: "Do teammates need to use the same AI agent?",
    answer:
      "No. Skills Board is built for mixed setups. Everyone starts from the same team recommendation, then connects an MCP-compatible agent or opens the source, copies a compatible install command, or downloads the latest files as a ZIP.",
  },
  {
    question: "What can my agent do through MCP?",
    answer:
      "After you connect Skills Board, an MCP-compatible agent can list and search your team libraries, retrieve install commands for saved skills, and browse the public catalog. Access is read-only: the agent cannot add, edit, or delete team skills.",
  },
  {
    question: "Does every skill work with every agent?",
    answer:
      "No. Skills Board keeps the original source visible and offers practical usage choices, but it does not certify universal compatibility. Each teammate should pick the path that fits their agent and inspect the source when needed.",
  },
  {
    question: "Is Skills Board free?",
    answer:
      "Yes. The hosted product is free forever, with no trial, credit card, or paid tier. The code is also open source if a team wants to self-host.",
  },
  {
    question: "Is a saved skill a formal approval or security review?",
    answer:
      "No. A saved skill is a team recommendation, not a formal security review, approval, or compatibility certification. Teams should inspect the source and apply their own standards.",
  },
  {
    question: "Will I get the exact version someone on my team used?",
    answer:
      "Skills Board follows the latest version available from the saved source. It does not pin or preserve historical versions, so teammates always work from the current source files.",
  },
] as const
