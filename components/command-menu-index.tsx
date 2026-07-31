import { CommandMenu, type CommandIndex } from "@/components/command-menu"
import { getAppContext } from "@/lib/app-context"
import {
  listOrganizationCollections,
  listOrganizationSkills,
} from "@/lib/db/queries"
import { buildInstallCommand } from "@/lib/install-command"

/**
 * Server side of the ⌘K palette: the active team's skills and collections,
 * shaped down to what the palette needs to search and act (ids, names, the
 * install command). The underlying queries are cached for hours and
 * invalidated by the same tags every mutation already updates, so the index
 * stays fresh without a per-open fetch.
 */
export async function CommandMenuIndex() {
  const { activeId } = await getAppContext()
  const [skills, collections] = await Promise.all([
    listOrganizationSkills(activeId),
    listOrganizationCollections(activeId),
  ])

  const index: CommandIndex = {
    skills: skills.map((item) => ({
      id: item.id,
      title: item.title,
      skillName: item.skillName,
      source: `${item.repoOwner}/${item.repoName}`,
      tags: item.tags,
      command: buildInstallCommand(item.githubUrl, item.skillName),
    })),
    collections: collections.map((item) => ({
      id: item.id,
      title: item.title,
      skillCount: item.skillCount,
    })),
  }

  return <CommandMenu index={index} />
}
