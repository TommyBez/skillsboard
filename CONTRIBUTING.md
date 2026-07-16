# Contributing to Skills Board

Thanks for helping make team skill recommendations easier to share. Contributions of code, documentation, bug reports, and focused product feedback are welcome.

## Before you start

- Search the existing issues and pull requests before opening a new one.
- Open an issue before a large feature or architectural change so the direction can be agreed on early.
- Never include credentials, private skill content, access tokens, or production data in an issue or pull request.
- Remember the product contract: a saved skill is a team recommendation, not a security review or compatibility guarantee.

## Development setup

Follow the [local setup in the README](./README.md#run-locally). The shortest validation loop is:

```bash
pnpm install
pnpm check
pnpm build
```

The production build may need the environment variables documented in `.env.example`. The CI workflow intentionally runs the environment-independent checks.

## Making a change

1. Fork the repository and create a focused branch from `main`.
2. Keep changes narrow and avoid unrelated formatting or dependency updates.
3. Add or update documentation when behavior, configuration, or setup changes.
4. Run `pnpm check` and any relevant manual flow before opening the pull request.
5. Include screenshots or a short recording for visible UI changes.

## Pull requests

A useful pull request explains:

- the user problem being solved;
- the chosen approach and meaningful tradeoffs;
- how the change was validated;
- any database, environment, security, or deployment impact.

Maintainers may ask to split a broad pull request into smaller changes. By contributing, you agree that your contribution is licensed under the repository's [MIT License](./LICENSE).

## Reporting security issues

Do not report vulnerabilities in a public issue. Follow [SECURITY.md](./SECURITY.md) so maintainers can investigate privately.
