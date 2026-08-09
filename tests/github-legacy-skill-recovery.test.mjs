import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { registerHooks, stripTypeScriptTypes } from "node:module"
import { test } from "node:test"
import { fileURLToPath, pathToFileURL } from "node:url"

const repositoryRoot = pathToFileURL(`${process.cwd()}/`).href

registerHooks({
  load(url, context, nextLoad) {
    if (url.startsWith(repositoryRoot) && url.endsWith(".ts")) {
      return {
        format: "module",
        shortCircuit: true,
        source: stripTypeScriptTypes(
          readFileSync(fileURLToPath(url), "utf8"),
          { mode: "transform" },
        ),
      }
    }
    return nextLoad(url, context)
  },
  resolve(specifier, context, nextResolve) {
    if (specifier === "server-only") {
      return {
        shortCircuit: true,
        url: "data:text/javascript,export default undefined",
      }
    }
    if (specifier === "next/cache") {
      return {
        shortCircuit: true,
        url: "data:text/javascript,export const cacheLife=()=>{};export const cacheTag=()=>{}",
      }
    }
    if (specifier.startsWith("@/")) {
      return {
        shortCircuit: true,
        url: new URL(`${specifier.slice(2)}.ts`, repositoryRoot).href,
      }
    }
    return nextResolve(specifier, context)
  },
})

const {
  discoverGitHubSkillCandidates,
  discoverGitHubSkills,
} = await import("../lib/github-skill-discovery.ts")
const { buildInstallableSkillArchives } = await import("../lib/github-skill-archive.ts")

const COMMIT_A = "a".repeat(40)
const COMMIT_B = "b".repeat(40)
const TREE_SHA = "f".repeat(40)
const REPOSITORY_URL = "https://github.com/acme/demo"

function descriptor(name, description = `${name} description`) {
  return `---\nname: ${name}\ndescription: ${description}\n---\n`
}

function jsonResponse(value) {
  return new Response(JSON.stringify(value), {
    headers: { "content-type": "application/json" },
  })
}

function createGitHubFetch(snapshot) {
  const entries = Object.keys(snapshot.descriptors).map((path, index) => ({
    mode: "100644",
    path,
    sha: index.toString(16).padStart(40, "0"),
    size: new TextEncoder().encode(snapshot.descriptors[path]).byteLength,
    type: "blob",
  }))

  return async (input) => {
    const url = new URL(String(input))
    if (url.href === "https://api.github.com/repos/acme/demo") {
      return jsonResponse({
        default_branch: "main",
        private: false,
        stargazers_count: 1,
        updated_at: "2026-08-09T00:00:00.000Z",
      })
    }
    if (url.href === "https://api.github.com/repos/acme/demo/commits/main") {
      return jsonResponse({
        commit: { tree: { sha: TREE_SHA } },
        sha: snapshot.commitSha,
      })
    }
    if (url.href === `https://api.github.com/repos/acme/demo/git/trees/${TREE_SHA}?recursive=1`) {
      return jsonResponse({ tree: entries, truncated: false })
    }

    const rawPrefix = `https://raw.githubusercontent.com/acme/demo/${snapshot.commitSha}/`
    if (url.href.startsWith(rawPrefix)) {
      const path = decodeURIComponent(url.href.slice(rawPrefix.length))
      const body = snapshot.descriptors[path]
      return body === undefined ? new Response(null, { status: 404 }) : new Response(body)
    }

    throw new Error(`Unexpected GitHub request: ${url.href}`)
  }
}

async function withMockGitHub(snapshot, operation) {
  const originalFetch = globalThis.fetch
  globalThis.fetch = createGitHubFetch(snapshot)
  try {
    return await operation()
  } finally {
    globalThis.fetch = originalFetch
  }
}

test("legacy recovery honors root-skill precedence before nested copies and examples", async () => {
  const descriptors = { "SKILL.md": descriptor("root-skill") }
  for (let index = 0; index < 105; index += 1) {
    descriptors[`vendor/example-${index}/SKILL.md`] = descriptor(`example-${index}`)
  }
  const snapshot = { commitSha: COMMIT_A, descriptors }

  await withMockGitHub(snapshot, async () => {
    const normal = await discoverGitHubSkills(REPOSITORY_URL)
    const recovery = await discoverGitHubSkillCandidates(REPOSITORY_URL)

    assert.deepEqual(normal.skills, [{
      description: "root-skill description",
      name: "root-skill",
      path: "",
    }])
    assert.deepEqual(recovery.skills, normal.skills)
  })
})

test("legacy recovery preserves duplicate canonical names in the authoritative tier", async () => {
  const snapshot = {
    commitSha: COMMIT_A,
    descriptors: {
      "skills/pdf-copy/SKILL.md": descriptor("pdf", "copy"),
      "skills/pdf/SKILL.md": descriptor("pdf", "original"),
    },
  }

  await withMockGitHub(snapshot, async () => {
    const normal = await discoverGitHubSkills(REPOSITORY_URL)
    const recovery = await discoverGitHubSkillCandidates(REPOSITORY_URL)

    assert.equal(normal.skills.length, 1)
    assert.deepEqual(recovery.skills.map(({ name, path }) => ({ name, path })), [
      { name: "pdf", path: "skills/pdf-copy" },
      { name: "pdf", path: "skills/pdf" },
    ])
  })
})

test("packaging rejects a newer GitHub commit than the one used for legacy recovery", async () => {
  const snapshot = {
    commitSha: COMMIT_A,
    descriptors: { "SKILL.md": descriptor("root-skill") },
  }

  await withMockGitHub(snapshot, async () => {
    const recovery = await discoverGitHubSkillCandidates(REPOSITORY_URL)
    snapshot.commitSha = COMMIT_B

    await assert.rejects(
      buildInstallableSkillArchives({
        expectedCommitSha: recovery.commitSha,
        githubUrl: REPOSITORY_URL,
        skillPaths: [""],
      }),
      (error) => {
        assert.equal(error.status, 409)
        assert.match(error.message, /repository changed/)
        return true
      },
    )
  })
})
