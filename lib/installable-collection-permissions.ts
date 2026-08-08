export function canChangeCollectionMembership(input: {
  collectionCreatedBy: string
  hasDistribution: boolean
  role: string | null | undefined
  userId: string
}) {
  return (
    !input.hasDistribution
    || input.collectionCreatedBy === input.userId
    || input.role === "owner"
    || input.role === "admin"
  )
}
