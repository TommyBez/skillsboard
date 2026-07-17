<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/header/surface.svg?title=Skills%20Board&amp;subtitle=One%20shared%20library.%20Different%20agents.&amp;size=wide&amp;align=left&amp;font=space-grotesk&amp;border=true&amp;radius=18&amp;watermark=false&amp;logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI%2BPHBhdGggZmlsbD0iIzZiZDU4ZiIgZD0iTTMgM2gyNnY3SDExdjRoMTRsNCA0djExSDN2LTdoMTh2LTRIN2wtNC00VjNaIi8%2BPC9zdmc%2B&amp;logoColor=6bd58f&amp;bg=111a14&amp;accent=6bd58f&amp;titleColor=f7f8f4&amp;subtitleColor=aab5aa&amp;mode=dark" />
    <img alt="Skills Board — One shared library. Different agents." src="https://shieldcn.dev/header/surface.svg?title=Skills%20Board&amp;subtitle=One%20shared%20library.%20Different%20agents.&amp;size=wide&amp;align=left&amp;font=space-grotesk&amp;border=true&amp;radius=18&amp;watermark=false&amp;logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI%2BPHBhdGggZmlsbD0iIzAwODQzZCIgZD0iTTMgM2gyNnY3SDExdjRoMTRsNCA0djExSDN2LTdoMTh2LTRIN2wtNC00VjNaIi8%2BPC9zdmc%2B&amp;logoColor=00843d&amp;bg=f7f8f4&amp;accent=00843d&amp;titleColor=17231b&amp;subtitleColor=5e6b61&amp;mode=light" />
  </picture>
</p>

<p align="center">
  Keep your team’s recommended AI skills in one place, so everyone knows where to find and use them.
</p>

<p align="center">
  <a href="https://github.com/TommyBez/skillsboard/stargazers">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/github/stars/TommyBez/skillsboard.svg?variant=outline&amp;size=xs&amp;theme=zinc&amp;font=geist&amp;mode=dark" />
      <img alt="GitHub stars" src="https://shieldcn.dev/github/stars/TommyBez/skillsboard.svg?variant=outline&amp;size=xs&amp;theme=zinc&amp;font=geist&amp;mode=light" />
    </picture>
  </a>
  <a href="./LICENSE">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/license-MIT-27272a.svg?variant=outline&amp;size=xs&amp;theme=zinc&amp;font=geist&amp;mode=dark&amp;logo=false" />
      <img alt="MIT license" src="https://shieldcn.dev/badge/license-MIT-27272a.svg?variant=outline&amp;size=xs&amp;theme=zinc&amp;font=geist&amp;mode=light&amp;logo=false" />
    </picture>
  </a>
  <a href="https://github.com/TommyBez/skillsboard/actions/workflows/ci.yml">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/github/ci/TommyBez/skillsboard.svg?workflow=ci.yml&amp;branch=main&amp;variant=outline&amp;size=xs&amp;theme=zinc&amp;font=geist&amp;mode=dark" />
      <img alt="CI status" src="https://shieldcn.dev/github/ci/TommyBez/skillsboard.svg?workflow=ci.yml&amp;branch=main&amp;variant=outline&amp;size=xs&amp;theme=zinc&amp;font=geist&amp;mode=light" />
    </picture>
  </a>
</p>

<p align="center">
  <a href="https://skillsboard.sh"><strong>Try the hosted app</strong></a>
  ·
  <a href="#run-locally">Run it locally</a>
  ·
  <a href="./CONTRIBUTING.md">Contribute</a>
</p>

## Why Skills Board

Useful skill recommendations tend to disappear into chats, bookmarks, and personal agent setups. Skills Board gives a team one searchable place to collect the skills it recommends and lets every teammate choose how to use them.

- **One team library.** Save useful skills once, organize them with team-specific tags, and make them easy to find again.
- **Different agents welcome.** Share the same recommendation across Claude, Codex, Cursor, and other agent setups.
- **A choice of handoff.** Open the original source, copy a compatible install command, or download the latest skill files as a ZIP.
- **Organization-scoped access.** Create a team, invite members, and keep each library available to its members.
- **Optional MCP access.** Connect compatible agents to authenticated, read-only tools for listing and searching the library.

> [!IMPORTANT]
> A saved skill is a team recommendation, not a security review, compatibility certification, or pinned release. Skills Board reads the latest available source; inspect that source before using it in an agent.

## How it works

1. Create a team library and add a skill from its GitHub repository.
2. Skills Board keeps the original source visible and records the recommendation for the team.
3. Teammates search by task, description, repository, or tag.
4. Each teammate opens the source, copies a compatible command, or downloads the latest files as a ZIP.

The public catalog can help with discovery when the deployment has Vercel OIDC available. The team library and direct GitHub flow remain the core product.

## Run locally

### Prerequisites

- Node.js 20.9 or newer
- pnpm 10
- PostgreSQL 15 or newer

### 1. Install the app

```bash
git clone https://github.com/TommyBez/skillsboard.git
cd skillsboard
corepack enable
pnpm install
cp .env.example .env.local
```

Generate a Better Auth secret with `openssl rand -base64 32`, then add it and your PostgreSQL connection string to `.env.local`.

### 2. Prepare the database

Push the Drizzle schema to a new database. This creates both the Better Auth tables and the application-specific tables from `lib/db/schema.ts`.

```bash
pnpm db:push
```

### 3. Start developing

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Restart the server after changing `DATABASE_URL`, because the PostgreSQL pool is created when the module loads.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Better Auth and Drizzle. |
| `BETTER_AUTH_SECRET` | Yes | Secret used to sign and encrypt authentication data. |
| `BETTER_AUTH_URL` | Recommended | Public application origin; use `http://localhost:3000` locally. |
| `RESEND_API_KEY` | Yes outside development | Sends sign-in OTP and team invitation emails through Resend. |
| `EMAIL_FROM` | Yes outside development | Verified Resend sender for OTP and invitation emails (e.g. `Skills Board <login@your-verified-domain.com>`). |
| `GITHUB_TOKEN` | No | Raises GitHub API rate limits for metadata and ZIP downloads. |
| `VERCEL_OIDC_TOKEN` | No | Supplied automatically by Vercel for the optional skills.sh catalog. |

Sign-in and sign-up use email one-time codes (no passwords). Outside development, configure both `RESEND_API_KEY` and a domain-verified `EMAIL_FROM`; the fallback Resend test sender only works for Resend’s own test recipients. In development, OTP emails are skipped and any 6-digit code works. Without Vercel OIDC, the Discover catalog degrades gracefully while team libraries continue to work.

## MCP access

Skills Board exposes an OAuth-protected MCP endpoint at `/api/mcp`. After signing in, open **Settings → MCP** for the connection flow. The server offers read-only tools to list and search team skills, get a saved skill's install command, and browse the optional public catalog.

## Tech stack

| Layer | Technology |
| --- | --- |
| Application | Next.js 16 App Router, React 19, TypeScript |
| UI | Tailwind CSS 4, shadcn/ui, Base UI |
| Authentication | Better Auth (email OTP) with organizations and OAuth provider support |
| Data | PostgreSQL, Drizzle ORM |
| Email | Resend and React Email |
| Agent access | Model Context Protocol via `mcp-handler` |
| Hosting | Vercel and Neon in the hosted deployment; self-hosting is supported |

## Project commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the Turbopack development server. |
| `pnpm typecheck` | Run the TypeScript compiler without emitting files. |
| `pnpm check` | Run the repository's required local checks. |
| `pnpm db:push` | Push the Drizzle schema to the configured PostgreSQL database. |
| `pnpm build` | Create a production build. |
| `pnpm start` | Start the production server. |
| `pnpm email` | Preview React Email templates on port 3001. |

## Contributing

Issues and pull requests are welcome. Read [CONTRIBUTING.md](./CONTRIBUTING.md) before making a substantial change, follow the [Code of Conduct](./CODE_OF_CONDUCT.md), and report vulnerabilities through the process in [SECURITY.md](./SECURITY.md).

See the people who have helped build Skills Board on the [contributors page](https://github.com/TommyBez/skillsboard/graphs/contributors).

## License

Skills Board is available under the [MIT License](./LICENSE).
