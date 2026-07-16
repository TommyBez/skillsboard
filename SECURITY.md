# Security Policy

## Supported versions

Skills Board is currently pre-1.0. Security fixes are applied to the latest commit on `main`; older commits and self-hosted forks are not maintained as separate release lines.

## Report a vulnerability

Please use [GitHub private vulnerability reporting](https://github.com/TommyBez/skillsboard/security/advisories/new). Do not open a public issue or include secrets, personal data, private repository content, or working exploit details in public discussions.

Include, where possible:

- the affected route, component, or commit;
- the impact and conditions required to reproduce it;
- minimal reproduction steps or a proof of concept;
- suggested mitigations, if you have them.

You should receive an acknowledgement after a maintainer reviews the report. Please allow time for investigation and coordinated disclosure before publishing details.

## Scope notes

Skills Board retrieves skill metadata and files from third-party GitHub repositories. A skill saved by a team is a recommendation, not a security review. Users and self-hosters are responsible for reviewing third-party skill source before installing or executing it.
