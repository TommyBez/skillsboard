# Skills Board

Skills Board is a shared library of AI skills for teams. A team keeps the Agent Skills it recommends in one searchable place, and every member installs them the way they prefer: from the GitHub source, with an install command, as a ZIP, or through an authenticated MCP endpoint. Skills Board is free and open source under the MIT license.

This plugin connects Claude to your team's library. It adds the Skills Board MCP server and one skill, `team-skill-library`, that tells Claude when and how to use it.

## What you can do with it

Ask Claude in plain language, for example:

- "Which skills does my team use for code review?"
- "Give me the install command for our frontend design skill."
- "Show the skills in our onboarding collection and the command to install all of them."
- "Check whether this GitHub repository has installable skills, then save the best one to our library."

The MCP server exposes 13 tools. Nine only read: list and search team skills, get the install command for a saved skill, discover public skills, inspect a GitHub repository for skills, list and search collections, list the skills in a collection, and get a collection install command. Four write to your team library and need the `skills:write` scope: add a skill, create a collection, add a skill to a collection, and remove a skill from a collection. No tool deletes a saved skill.

## Setup

1. Create a free account and a team at https://www.skillsboard.sh.
2. Install the plugin.
3. Connect the `skills-board` server when Claude asks, sign in to Skills Board, and approve the requested scopes. The server uses OAuth 2.0, so the plugin never stores a password or an API key.

The server URL is `https://www.skillsboard.sh/api/mcp`. Developer documentation: https://www.skillsboard.sh/developers.

## Data and privacy

The plugin contains no code that runs on your machine. It only points Claude at the Skills Board MCP server, and that server receives only what Claude sends in a tool call: search queries, skill and collection names, and the GitHub repository URLs you ask it to inspect or save. It reads and writes only the team libraries your Skills Board account belongs to. To look up public skills and repositories, the server calls GitHub and skills.sh on your behalf.

Skills Board records which tool was called and whether it succeeded, tied to your account, to measure product use. It does not read your conversations, your files, or your chat history. The full policy, including retention and your rights, is at https://www.skillsboard.sh/privacy.

## Support

Open an issue at https://github.com/TommyBez/skillsboard/issues or write to tommaso@skillsboard.sh.

## License

MIT. See the repository [LICENSE](https://github.com/TommyBez/skillsboard/blob/main/LICENSE).
