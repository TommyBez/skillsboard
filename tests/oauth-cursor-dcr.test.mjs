import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"

import { stripTypeScriptTypes } from "node:module"

const source = await readFile(new URL("../lib/oauth-cursor-dcr.ts", import.meta.url), "utf8")
const outputText = stripTypeScriptTypes(source, { mode: "transform" })
const {
  isCursorDcrRequest,
  isBetterAuthAcceptedNativeRedirect,
  prepareCursorDcrRegistration,
} = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`)

const cursorPayload = {
  client_name: "Cursor",
  redirect_uris: [
    "cursor://anysphere.cursor-mcp/oauth/callback",
    "https://www.cursor.com/agents/mcp/oauth/callback",
    "http://localhost:8787/callback",
  ],
  grant_types: ["authorization_code", "refresh_token"],
  response_types: ["code"],
  token_endpoint_auth_method: "none",
}

test("recognizes the current Cursor DCR payload", () => {
  assert.equal(isCursorDcrRequest(cursorPayload), true)
  assert.equal(
    isCursorDcrRequest({
      redirect_uris: ["cursor://anysphere.cursor-mcp/oauth/appname/callback"],
    }),
    true,
  )
})

test("leaves other MCP clients alone", () => {
  assert.equal(
    isCursorDcrRequest({
      client_name: "Claude",
      redirect_uris: ["https://claude.ai/api/mcp/auth_callback"],
    }),
    false,
  )
  assert.equal(
    isCursorDcrRequest({
      client_name: "Cursor",
      redirect_uris: ["https://evil.example/callback"],
    }),
    false,
  )
})

test("Better Auth 1.7 accepts loopback, claimed https, and reverse-domain schemes", () => {
  assert.equal(isBetterAuthAcceptedNativeRedirect("http://localhost:8787/callback"), true)
  assert.equal(isBetterAuthAcceptedNativeRedirect("http://127.0.0.1:8787/callback"), true)
  assert.equal(
    isBetterAuthAcceptedNativeRedirect("https://www.cursor.com/agents/mcp/oauth/callback"),
    true,
  )
  assert.equal(isBetterAuthAcceptedNativeRedirect("com.anysphere.cursor:/oauth/callback"), true)
  assert.equal(
    isBetterAuthAcceptedNativeRedirect("cursor://anysphere.cursor-mcp/oauth/callback"),
    false,
  )
})

test("registers the Cursor payload as native without the rejected custom scheme", () => {
  const { registrationBody, storedRedirectUris } = prepareCursorDcrRegistration(cursorPayload)
  assert.equal(registrationBody.application_type, "native")
  assert.deepEqual(registrationBody.redirect_uris, [
    "https://www.cursor.com/agents/mcp/oauth/callback",
    "http://localhost:8787/callback",
  ])
  assert.deepEqual(storedRedirectUris, cursorPayload.redirect_uris)
})

test("does not override an explicit application_type", () => {
  const { registrationBody } = prepareCursorDcrRegistration({
    ...cursorPayload,
    application_type: "native",
  })
  assert.equal(registrationBody.application_type, "native")
})

test("keeps a cursor-only payload registerable, then stores the custom scheme", () => {
  const { registrationBody, storedRedirectUris } = prepareCursorDcrRegistration({
    client_name: "Cursor",
    redirect_uris: ["cursor://anysphere.cursor-mcp/oauth/callback"],
  })
  assert.deepEqual(registrationBody.redirect_uris, ["http://localhost:8787/callback"])
  assert.ok(storedRedirectUris.includes("cursor://anysphere.cursor-mcp/oauth/callback"))
})
