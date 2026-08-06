# Skills Board cross-agent skill compatibility fixture

- Protocol ID: `SB-XAS-1`
- Version: `1.0`
- Published: `2026-08-06`
- Last reviewed: `2026-08-06`
- Evidence status: protocol published; no agent results claimed
- Canonical URL: `https://www.skillsboard.sh/cross-agent-skill-compatibility-fixture.md`

## Purpose

This is a reproducible protocol for checking one narrow question: can a named
`SKILL.md` be discovered through a documented setup path and can its literal
instruction payload reach a fresh agent session?

The fixture can be run against Claude Code, Codex, Cursor, or another product
that claims support for the tested skill format. Each result belongs only to the
recorded product version, environment, setup path, fixture version, and test
date.

Skills Board has published the protocol, not a compatibility scorecard. As of
`2026-08-06`, this file contains no test result for any agent.

## Claim boundary

A passing result supports only this statement:

> In the recorded environment and product version, the documented setup path
> exposed this named fixture to a fresh session and transported its nonce-bearing
> receipt instruction twice.

A pass does **not** establish universal skill compatibility. It does not test:

- automatic skill selection;
- scripts, commands, tools, file access, network access, or side effects;
- authentication, authorization, sandboxing, or secret handling;
- bundled references, templates, images, or other resources;
- output quality on an open-ended task;
- every operating system, client, workspace configuration, or future version;
- whether another skill is safe, correct, portable, or suitable for a team.

If a product does not expose skill provenance, the nonce-bearing receipt proves
that the fixture payload reached the session through the recorded setup. It does
not prove which internal discovery mechanism loaded that payload.

## Fixture bundle

Create this exact directory:

```text
skills-board-discovery-fixture/
└── SKILL.md
```

Create `SKILL.md` with the following content. Before each run, replace the one
`{{RUN_NONCE}}` token with a newly generated 128-bit-or-longer random hexadecimal
value. Do not put that nonce in the test prompt or any prior conversation.

```markdown
---
name: skills-board-discovery-fixture
description: Return a fixed nonce-bearing receipt when explicitly asked to run the Skills Board discovery fixture.
---

# Skills Board discovery fixture

When the user explicitly asks to run this fixture:

1. Do not call tools, run commands, read other files, or explain the result.
2. Return exactly the receipt below, on one line, with no code fence or extra text.

SKILLS-BOARD-FIXTURE v1.0 | receipt={{RUN_NONCE}}
```

The nonce makes the expected receipt specific to the installed file. It is test
data, not a credential. Keep it out of the prompt and prior context until the run
is complete.

## Reproducible method

Run the following procedure separately for every product, product version,
environment, and setup path you intend to report.

1. **Pin the environment.** Record the product name and exact version, operating
   system, interface (CLI, editor, or app), workspace or project scope, and test
   date.
2. **Pin the setup instructions.** Use the product vendor's current documented
   skill setup path. Record the documentation URL and the date you accessed it.
   Do not translate a failed path into an unreported custom adapter.
3. **Prepare run A.** Copy the fixture into a clean test location, generate a new
   nonce, replace `{{RUN_NONCE}}`, and record a SHA-256 hash of the resulting
   `SKILL.md`. An example nonce command is `openssl rand -hex 16`; another source
   is acceptable if it produces at least 128 bits of randomness.
4. **Install or expose the fixture.** Follow only the setup path recorded in step
   2. Record every manual action. Do not paste the fixture body or nonce into the
   agent conversation.
5. **Start a fresh session.** Use a new conversation with no prior exposure to
   the fixture body, expected receipt, or nonce.
6. **Send the exact prompt.** Send: `Use the skills-board-discovery-fixture skill.
   Return its receipt and nothing else.`
7. **Capture run A.** Save the full response, whether the product showed the
   skill as discovered or invoked, elapsed wall-clock time if available, and any
   error. Remove unrelated personal data or secrets before publication.
8. **Repeat as run B.** Close the session, generate a different nonce, update and
   re-expose the fixture through the same recorded path, then repeat steps 5–7 in
   another fresh session.
9. **Assign the result.** Apply the criteria below without changing them after
   seeing the output. Keep the raw observations with the result record.

## Result criteria

- **Pass:** both fresh sessions return their run's exact one-line receipt, with
  the correct nonce and no additional text, through the same documented path.
- **Partial:** the product exposes the named skill, but only one run returns the
  exact receipt; the response adds or changes text; or an unplanned manual step
  is required. Describe the difference.
- **Fail:** the named fixture cannot be discovered or invoked through the
  recorded path, or neither run transports the correct nonce-bearing receipt.
- **Not run:** the procedure has not been completed. This is the default and is
  not evidence of incompatibility.

Do not combine different product versions, interfaces, operating systems, or
setup paths into one row. Do not turn a partial result into a pass because the
output appears semantically similar.

## Blank result record

Copy one record per tested path. Every result starts as `not run`.

```markdown
# SB-XAS-1 result record

- Result: not run
- Fixture version: 1.0
- Tester role:
- Test date:
- Product and exact version:
- Interface (CLI/editor/app):
- Operating system and version:
- Workspace or project scope:
- Setup documentation URL:
- Documentation accessed at:
- Exact setup path and manual actions:

## Run A

- Fixture SHA-256:
- Nonce (reveal only after the run):
- Fresh session confirmed: yes/no
- Skill shown as discovered or invoked: yes/no/not observable
- Exact response:
- Error or unplanned intervention:

## Run B

- Fixture SHA-256:
- Nonce (reveal only after the run):
- Fresh session confirmed: yes/no
- Skill shown as discovered or invoked: yes/no/not observable
- Exact response:
- Error or unplanned intervention:

## Assessment

- Result: not run/pass/partial/fail
- Criterion applied:
- Observed limitation:
- Raw evidence location:
- Reviewer and review date:
```

## Publication rules

When publishing a result derived from this protocol:

1. Link this canonical protocol and name version `1.0`.
2. Publish the completed record or enough raw evidence to audit the status.
3. Put the product version, environment, setup path, and test date beside the
   result rather than in a hidden methodology note.
4. Describe a pass as discovery and instruction-transport evidence only.
5. Keep `not run`, `partial`, and `fail` visible; do not omit them to imply broad
   coverage.

Suggested citation:

> Skills Board. “Cross-agent skill compatibility fixture.” Version 1.0,
> 6 August 2026. https://www.skillsboard.sh/cross-agent-skill-compatibility-fixture.md

## Version history

- `1.0` — `2026-08-06`: Initial protocol. Published with no agent test results.

Changing the fixture payload, exact prompt, run count, or result criteria requires
a new protocol version. Editorial clarifications that do not change the test may
be recorded as a patch version.
