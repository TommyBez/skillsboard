import { sql } from "drizzle-orm"
import {
  boolean,
  foreignKey,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  unique("user_email_key").on(table.email),
])

export const emailPreference = pgTable("emailPreference", {
  userId: text("userId").notNull(),
  topic: text("topic").notNull(),
  emailHash: text("emailHash").notNull(),
  subscribed: boolean("subscribed").notNull().default(false),
  source: text("source").notNull(),
  noticeVersion: text("noticeVersion").notNull(),
  noticeText: text("noticeText").notNull(),
  unsubscribeToken: text("unsubscribeToken"),
  consentedAt: timestamp("consentedAt", { withTimezone: true }),
  withdrawnAt: timestamp("withdrawnAt", { withTimezone: true }),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  primaryKey({ name: "emailPreference_pkey", columns: [table.userId, table.topic] }),
  index("emailPreference_topic_subscribed_idx").on(table.topic, table.subscribed),
  foreignKey({
    columns: [table.userId],
    foreignColumns: [user.id],
    name: "emailPreference_userId_fkey",
  }).onDelete("cascade"),
])

export const emailConsentEvent = pgTable("emailConsentEvent", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("userId"),
  emailHash: text("emailHash").notNull(),
  topic: text("topic").notNull(),
  action: text("action").notNull(),
  source: text("source").notNull(),
  noticeVersion: text("noticeVersion").notNull(),
  noticeText: text("noticeText").notNull(),
  providerReference: text("providerReference"),
  occurredAt: timestamp("occurredAt", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("emailConsentEvent_email_topic_idx").on(table.emailHash, table.topic, table.occurredAt),
  index("emailConsentEvent_user_idx").on(table.userId, table.occurredAt),
  foreignKey({
    columns: [table.userId],
    foreignColumns: [user.id],
    name: "emailConsentEvent_userId_fkey",
  }).onDelete("set null"),
])

export const emailSuppression = pgTable("emailSuppression", {
  id: uuid("id").primaryKey().defaultRandom(),
  emailHash: text("emailHash").notNull(),
  scope: text("scope").notNull(),
  reason: text("reason").notNull(),
  source: text("source").notNull(),
  sourceReference: text("sourceReference"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
  lastSeenAt: timestamp("lastSeenAt", { withTimezone: true }).notNull().defaultNow(),
  liftedAt: timestamp("liftedAt", { withTimezone: true }),
  liftedSource: text("liftedSource"),
}, (table) => [
  uniqueIndex("emailSuppression_email_scope_reason_unique").on(table.emailHash, table.scope, table.reason),
  index("emailSuppression_active_lookup_idx").on(table.emailHash, table.active, table.scope),
])

export const emailProviderContactState = pgTable("emailProviderContactState", {
  provider: text("provider").notNull(),
  emailHash: text("emailHash").notNull(),
  unsubscribed: boolean("unsubscribed").notNull(),
  providerReference: text("providerReference"),
  providerOccurredAt: timestamp("providerOccurredAt", { withTimezone: true }).notNull(),
  observedAt: timestamp("observedAt", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  primaryKey({
    name: "emailProviderContactState_pkey",
    columns: [table.provider, table.emailHash],
  }),
  index("emailProviderContactState_email_idx").on(table.emailHash, table.providerOccurredAt),
])

export const emailWebhookEvent = pgTable("emailWebhookEvent", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  payloadHash: text("payloadHash").notNull(),
  providerEmailId: text("providerEmailId"),
  status: text("status").notNull().default("pending"),
  attempts: integer("attempts").notNull().default(0),
  providerCreatedAt: timestamp("providerCreatedAt", { withTimezone: true }),
  receivedAt: timestamp("receivedAt", { withTimezone: true }).notNull().defaultNow(),
  processedAt: timestamp("processedAt", { withTimezone: true }),
  lastError: text("lastError"),
})

export const emailProactiveDelivery = pgTable("emailProactiveDelivery", {
  providerEmailId: text("providerEmailId").notNull(),
  emailHash: text("emailHash").notNull(),
  providerBroadcastId: text("providerBroadcastId").notNull(),
  sentAt: timestamp("sentAt", { withTimezone: true }).notNull(),
  receivedAt: timestamp("receivedAt", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  primaryKey({
    name: "emailProactiveDelivery_pkey",
    columns: [table.providerEmailId, table.emailHash],
  }),
  index("emailProactiveDelivery_email_sent_idx").on(table.emailHash, table.sentAt),
])

/**
 * Marketing list for Skills Board product updates, captured from the public
 * pages. Separate from `emailPreference`, which records account-scoped consent
 * for signed-in users: this table holds addresses left by visitors who have no
 * account, and nothing is sent to them from here.
 *
 * Every new subscription writes a matching `emailConsentEvent` in the same
 * transaction, with a null `userId`, the hashed address, the capturing page,
 * and the notice that was on screen. A visitor capture therefore leaves the
 * same audit trail as a signed-in consent change, and a duplicate submission
 * writes neither row.
 */
export const emailSubscriber = pgTable("emailSubscriber", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Lowercased and trimmed before insert; the unique key is the raw column. */
  email: text("email").notNull(),
  /** The page that captured the address: landing, guide_<slug>, alternatives_<slug>. */
  source: text("source").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  unique("emailSubscriber_email_key").on(table.email),
])

/**
 * The counter behind the email capture rate limit: one row per submission that
 * was allowed to reach `emailSubscriber`, bucketed by client address.
 *
 * The address is stored only as a salted hash under its own derivation purpose
 * (`hashCaptureIpAddress`), so the table can answer "how many from this client
 * in this window" without holding a client address or anything that joins to
 * an email. Nothing links a row to the address that was submitted, and rows
 * are pruned a day after they are written.
 */
export const emailCaptureAttempt = pgTable("emailCaptureAttempt", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** HMAC of the client address; never the address itself. */
  ipHash: text("ipHash").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("emailCaptureAttempt_ip_created_idx").on(table.ipHash, table.createdAt),
])

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
  token: text("token").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull(),
  activeOrganizationId: text("activeOrganizationId"),
}, (table) => [
  foreignKey({
    columns: [table.userId],
    foreignColumns: [user.id],
    name: "session_userId_fkey",
  }).onDelete("cascade"),
  unique("session_token_key").on(table.token),
])

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull(),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull(),
}, (table) => [
  foreignKey({
    columns: [table.userId],
    foreignColumns: [user.id],
    name: "account_userId_fkey",
  }).onDelete("cascade"),
])

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
})

export const organization = pgTable("organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  logo: text("logo"),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull(),
}, (table) => [
  unique("organization_slug_key").on(table.slug),
])

export const member = pgTable("member", {
  id: text("id").primaryKey(),
  organizationId: text("organizationId").notNull(),
  userId: text("userId").notNull(),
  role: text("role").notNull().default("member"),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull(),
}, (table) => [
  uniqueIndex("member_org_user_unique").on(table.organizationId, table.userId),
  foreignKey({
    columns: [table.organizationId],
    foreignColumns: [organization.id],
    name: "member_organizationId_fkey",
  }).onDelete("cascade"),
  foreignKey({
    columns: [table.userId],
    foreignColumns: [user.id],
    name: "member_userId_fkey",
  }).onDelete("cascade"),
])

export const invitation = pgTable("invitation", {
  id: text("id").primaryKey(),
  organizationId: text("organizationId").notNull(),
  email: text("email").notNull(),
  role: text("role"),
  status: text("status").notNull().default("pending"),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
  inviterId: text("inviterId").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  foreignKey({
    columns: [table.organizationId],
    foreignColumns: [organization.id],
    name: "invitation_organizationId_fkey",
  }).onDelete("cascade"),
  foreignKey({
    columns: [table.inviterId],
    foreignColumns: [user.id],
    name: "invitation_inviterId_fkey",
  }).onDelete("cascade"),
])

export const jwks = pgTable("jwks", {
  id: text("id").primaryKey(),
  publicKey: text("publicKey").notNull(),
  privateKey: text("privateKey").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull(),
  expiresAt: timestamp("expiresAt", { withTimezone: true }),
})

// Better Auth's Kysely adapter stores string[] as JSON text (supportsArrays=false).
export const oauthClient = pgTable("oauthClient", {
  id: text("id").primaryKey(),
  clientId: text("clientId").notNull(),
  clientSecret: text("clientSecret"),
  disabled: boolean("disabled").default(false),
  skipConsent: boolean("skipConsent").default(false),
  enableEndSession: boolean("enableEndSession"),
  subjectType: text("subjectType"),
  scopes: text("scopes"),
  userId: text("userId"),
  referenceId: text("referenceId"),
  name: text("name"),
  uri: text("uri"),
  icon: text("icon"),
  contacts: text("contacts"),
  tos: text("tos"),
  policy: text("policy"),
  softwareId: text("softwareId"),
  softwareVersion: text("softwareVersion"),
  softwareStatement: text("softwareStatement"),
  redirectUris: text("redirectUris").notNull(),
  postLogoutRedirectUris: text("postLogoutRedirectUris"),
  tokenEndpointAuthMethod: text("tokenEndpointAuthMethod"),
  grantTypes: text("grantTypes"),
  responseTypes: text("responseTypes"),
  public: boolean("public"),
  type: text("type"),
  requirePKCE: boolean("requirePKCE"),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  unique("oauthClient_clientId_key").on(table.clientId),
])

export const oauthAccessToken = pgTable("oauthAccessToken", {
  id: text("id").primaryKey(),
  token: text("token").notNull(),
  clientId: text("clientId").notNull(),
  sessionId: text("sessionId"),
  refreshId: text("refreshId"),
  userId: text("userId"),
  referenceId: text("referenceId"),
  scopes: text("scopes").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
}, (table) => [
  foreignKey({
    columns: [table.clientId],
    foreignColumns: [oauthClient.clientId],
    name: "oauthAccessToken_clientId_fkey",
  }).onDelete("cascade"),
  unique("oauthAccessToken_token_key").on(table.token),
])

export const oauthRefreshToken = pgTable("oauthRefreshToken", {
  id: text("id").primaryKey(),
  token: text("token").notNull(),
  clientId: text("clientId").notNull(),
  sessionId: text("sessionId"),
  userId: text("userId").notNull(),
  referenceId: text("referenceId"),
  scopes: text("scopes").notNull(),
  revoked: timestamp("revoked", { withTimezone: true }),
  authTime: timestamp("authTime", { withTimezone: true }),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
}, (table) => [
  foreignKey({
    columns: [table.clientId],
    foreignColumns: [oauthClient.clientId],
    name: "oauthRefreshToken_clientId_fkey",
  }).onDelete("cascade"),
  unique("oauthRefreshToken_token_key").on(table.token),
])

export const oauthConsent = pgTable("oauthConsent", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull(),
  clientId: text("clientId").notNull(),
  referenceId: text("referenceId"),
  scopes: text("scopes").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  foreignKey({
    columns: [table.clientId],
    foreignColumns: [oauthClient.clientId],
    name: "oauthConsent_clientId_fkey",
  }).onDelete("cascade"),
])

export const skill = pgTable("skill", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: text("organizationId").notNull(),
  createdBy: text("createdBy").notNull(),
  githubUrl: text("githubUrl").notNull(),
  skillName: text("skillName").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  repoOwner: text("repoOwner").notNull(),
  repoName: text("repoName").notNull(),
  repoStars: integer("repoStars").notNull().default(0),
  repoUpdatedAt: timestamp("repoUpdatedAt", { withTimezone: true }),
  skillPath: text("skillPath"),
  tags: text("tags").array().notNull().default([]),
  note: text("note"),
  examplePrompts: text("examplePrompts").array().notNull().default(sql`ARRAY[]::text[]`),
  metadataRefreshedAt: timestamp("metadataRefreshedAt", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("skill_org_created_idx").on(table.organizationId, table.createdAt),
  uniqueIndex("skill_org_repo_name_unique").on(table.organizationId, table.githubUrl, table.skillName),
])

export const collection = pgTable("collection", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: text("organizationId").notNull(),
  createdBy: text("createdBy").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  tags: text("tags").array().notNull().default([]),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("collection_org_created_idx").on(table.organizationId, table.createdAt),
])

export const collectionSkill = pgTable("collectionSkill", {
  collectionId: uuid("collectionId").notNull(),
  skillId: uuid("skillId").notNull(),
  addedBy: text("addedBy").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  primaryKey({ name: "collectionSkill_pkey", columns: [table.collectionId, table.skillId] }),
  index("collectionSkill_skill_idx").on(table.skillId),
  foreignKey({
    columns: [table.collectionId],
    foreignColumns: [collection.id],
    name: "collectionSkill_collectionId_fkey",
  }).onDelete("cascade"),
  foreignKey({
    columns: [table.skillId],
    foreignColumns: [skill.id],
    name: "collectionSkill_skillId_fkey",
  }).onDelete("cascade"),
])

export const collectionRelease = pgTable("collectionRelease", {
  id: uuid("id").primaryKey().defaultRandom(),
  collectionId: uuid("collectionId").notNull(),
  revision: integer("revision").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  createdBy: text("createdBy").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
  supersededAt: timestamp("supersededAt", { withTimezone: true }),
}, (table) => [
  unique("collectionRelease_collectionId_revision_key").on(table.collectionId, table.revision),
  unique("collectionRelease_collectionId_id_key").on(table.collectionId, table.id),
  index("collectionRelease_supersededAt_idx")
    .on(table.supersededAt, table.id)
    .where(sql`${table.supersededAt} IS NOT NULL`),
  foreignKey({
    columns: [table.collectionId],
    foreignColumns: [collection.id],
    name: "collectionRelease_collectionId_fkey",
  }).onDelete("cascade"),
])

export const collectionReleaseSkill = pgTable("collectionReleaseSkill", {
  id: uuid("id").primaryKey().defaultRandom(),
  releaseId: uuid("releaseId").notNull(),
  sourceSkillId: uuid("sourceSkillId"),
  position: integer("position").notNull(),
  skillName: text("skillName").notNull(),
  description: text("description").notNull(),
  githubUrl: text("githubUrl").notNull(),
  repoOwner: text("repoOwner").notNull(),
  repoName: text("repoName").notNull(),
  skillPath: text("skillPath").notNull(),
  commitSha: text("commitSha").notNull(),
  artifactDigest: text("artifactDigest").notNull(),
  artifactBase64: text("artifactBase64").notNull(),
  artifactBytes: integer("artifactBytes").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  unique("collectionReleaseSkill_releaseId_skillName_key").on(table.releaseId, table.skillName),
  index("collectionReleaseSkill_releaseId_position_idx").on(table.releaseId, table.position),
  foreignKey({
    columns: [table.releaseId],
    foreignColumns: [collectionRelease.id],
    name: "collectionReleaseSkill_releaseId_fkey",
  }).onDelete("cascade"),
])

export const collectionDistribution = pgTable("collectionDistribution", {
  collectionId: uuid("collectionId").primaryKey(),
  shareId: text("shareId").notNull(),
  activeReleaseId: uuid("activeReleaseId"),
  activeRevision: integer("activeRevision").notNull().default(0),
  publishedAt: timestamp("publishedAt", { withTimezone: true }),
  revokedAt: timestamp("revokedAt", { withTimezone: true }),
  createdBy: text("createdBy").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  unique("collectionDistribution_shareId_key").on(table.shareId),
  foreignKey({
    columns: [table.collectionId],
    foreignColumns: [collection.id],
    name: "collectionDistribution_collectionId_fkey",
  }).onDelete("cascade"),
  foreignKey({
    columns: [table.collectionId, table.activeReleaseId],
    foreignColumns: [collectionRelease.collectionId, collectionRelease.id],
    name: "collectionDistribution_activeReleaseId_fkey",
  }).onDelete("restrict"),
])
