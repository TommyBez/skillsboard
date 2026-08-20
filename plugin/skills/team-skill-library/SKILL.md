---
name: team-skill-library
description: Work with a team's shared Agent Skills library on Skills Board through the Skills Board MCP server at https://www.skillsboard.sh/api/mcp. Use when the user asks which skills their team recommends, wants to search or list the team library or its collections, needs the install command for a saved skill or for a published collection, wants to check a GitHub repository for installable skills, or wants to save a skill to the team library. Do not use it to write or edit SKILL.md files, to install unrelated npm packages or MCP servers, to edit or delete skills already saved on Skills Board, or when the Skills Board MCP server is not connected to this client.
license: MIT
---

# Skills Board team library

Skills Board is a web app where a team keeps the skills it recommends in one
searchable library. This skill covers how to use that library from an agent:
find a recommendation, hand off an install command, and save a new skill back
to the team.

## Before the first call

The plugin ships one MCP server, `skills-board`, pointing at
`https://www.skillsboard.sh/api/mcp`. It is OAuth protected: the client runs
the authorization flow, not this skill. If the tools are missing, tell the user
to connect the server in their client and to sign in at
https://www.skillsboard.sh first.

Two scopes matter:

- `skills:read` is required for every tool. Without it the endpoint answers 403.
- `skills:write` is required to save skills or change collections. Without it
  the write tools return an error asking the user to reconnect with write access.

Clients usually namespace tool names, for example `mcp__skills-board__list_skills`.
Match on the trailing tool name.

## Find what the team already recommends

- `search_skills` takes a `query` and matches saved skills by name, description,
  note, example prompt, repository, or tag. Start here.
- `list_skills` returns every skill saved across the user's team libraries. Use
  it when the library is small or when a search returns nothing.
- `search_collections` and `list_collections` do the same for collections, which
  group saved skills by use case or project.
- `get_collection_skills` takes a `collectionId` and returns the skills in that
  collection, each with an install command.

Report what the team saved, including the note and example prompts a teammate
wrote, before suggesting anything from outside the library.

## Hand off an install

Skills Board records recommendations. It does not install skills into an agent,
so the last step is always a command the user runs, or a file the user downloads.

- One saved skill: `get_skill_command` with its `skillId` returns
  `npx skills add <github url> --skill <skill name>`.
- A published collection: `get_collection_install_command` with its
  `collectionId` returns the share URL and
  `npx skills add https://www.skillsboard.sh/p/<share id> --skill "*"`, plus the
  active revision. It errors when the collection has no active install link.
  Rerunning the command adds skills introduced by a later revision. The update
  path refreshes installed skills but does not remove skills deleted from the
  collection.
- The original GitHub source is in every skill record. Reading the source before
  installing is the honest default: a saved skill is a team recommendation, not
  a review or a pinned release.

Downloading a skill as a ZIP happens in the web app on
https://www.skillsboard.sh, not through an MCP tool.

## Look outside the library

- `discover_repository_skills` takes a `githubUrl` and lists the SKILL.md
  definitions in that repository with the `skillPath` to use when saving one.
- `discover_skills` searches the public skills.sh catalog with `query`, or
  browses a leaderboard with `view` (`trending`, `hot`, or `all-time`) and
  `page`. It can report that the catalog is unavailable; that is not a failure
  of the team library.

## Save back to the team

These need `skills:write`.

- `add_skill` saves a skill from `githubUrl`. Pass `skillPath` when the
  repository holds more than one skill; run `discover_repository_skills` first
  to pick it. Optional `tags`, `note`, and `examplePrompts` are what make the
  entry findable later, so ask for a short note when the user has context worth
  keeping. Pass `organizationId` when the user belongs to more than one team.
- `create_collection` creates a team collection, and
  `add_skill_to_collection` / `remove_skill_from_collection` change its
  contents by `collectionId` and `skillId`. Removing a skill from a collection
  keeps it in the library.

## What these tools cannot do

They cannot edit or delete a saved skill, install a skill into the current
agent, or run one. Do not claim otherwise. If the user wants to author or edit a
SKILL.md, that is ordinary file work, not this skill.
