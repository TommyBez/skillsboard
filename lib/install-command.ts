const SAFE_SHELL_ARGUMENT = /^[A-Za-z0-9_@%+=:,./-]+$/

export function quoteShellArg(value: string) {
  if (SAFE_SHELL_ARGUMENT.test(value)) return value

  return `'${value.replaceAll("'", "'\\''")}'`
}

export function buildInstallCommand(githubUrl: string, skillName: string) {
  return `npx skills add ${quoteShellArg(githubUrl)} --skill ${quoteShellArg(skillName)}`
}
