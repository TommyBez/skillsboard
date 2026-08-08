import { readFile } from "node:fs/promises"
import { stripTypeScriptTypes } from "node:module"

export async function loadTsModule(url) {
  const source = await readFile(url, "utf8")
  const outputText = stripTypeScriptTypes(source, { mode: "transform" })
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`)
}
