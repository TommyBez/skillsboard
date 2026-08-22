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
  // Trusted identity issuer added in Better Auth 1.7. Credential-style
  // accounts use the synthetic "local:<providerId>" namespace; OAuth
  // providers without their own issuer use "local:oauth:<providerId>".
  issuer: text("issuer").notNull(),
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
  uniqueIndex("account_issuer_accountId_uidx").on(table.issuer, table.accountId),
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
  alg: text("alg"),
  crv: text("crv"),
})

// Better Auth's Kysely adapter stores string[] as JSON text (supportsArrays=false).
export const oauthClient = pgTable("oauthClient", {
  id: text("id").primaryKey(),
  clientId: text("clientId").notNull(),
  clientSecret: text("clientSecret"),
  clientDiscoveryId: text("clientDiscoveryId"),
  disabled: boolean("disabled").default(false),
  skipConsent: boolean("skipConsent").default(false),
  enableEndSession: boolean("enableEndSession"),
  subjectType: text("subjectType"),
  scopes: text("scopes"),
  clientCredentialsScopes: text("clientCredentialsScopes"),
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
  backchannelLogoutUri: text("backchannelLogoutUri"),
  backchannelLogoutSessionRequired: boolean("backchannelLogoutSessionRequired"),
  tokenEndpointAuthMethod: text("tokenEndpointAuthMethod"),
  applicationType: text("applicationType"),
  jwks: text("jwks"),
  jwksUri: text("jwksUri"),
  grantTypes: text("grantTypes"),
  responseTypes: text("responseTypes"),
  requirePKCE: boolean("requirePKCE"),
  dpopBoundAccessTokens: boolean("dpopBoundAccessTokens").default(false),
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
  authorizationCodeId: text("authorizationCodeId"),
  resources: text("resources"),
  requestedUserInfoClaims: text("requestedUserInfoClaims"),
  scopes: text("scopes").notNull(),
  revoked: timestamp("revoked", { withTimezone: true }),
  confirmation: text("confirmation"),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
}, (table) => [
  foreignKey({
    columns: [table.clientId],
    foreignColumns: [oauthClient.clientId],
    name: "oauthAccessToken_clientId_fkey",
  }).onDelete("cascade"),
  unique("oauthAccessToken_token_key").on(table.token),
  index("oauthAccessToken_authorizationCodeId_idx").on(table.authorizationCodeId),
])

export const oauthRefreshToken = pgTable("oauthRefreshToken", {
  id: text("id").primaryKey(),
  token: text("token").notNull(),
  clientId: text("clientId").notNull(),
  sessionId: text("sessionId"),
  userId: text("userId").notNull(),
  referenceId: text("referenceId"),
  authorizationCodeId: text("authorizationCodeId"),
  resources: text("resources"),
  requestedUserInfoClaims: text("requestedUserInfoClaims"),
  scopes: text("scopes").notNull(),
  revoked: timestamp("revoked", { withTimezone: true }),
  rotatedAt: timestamp("rotatedAt", { withTimezone: true }),
  rotationReplayResponse: text("rotationReplayResponse"),
  rotationReplayExpiresAt: timestamp("rotationReplayExpiresAt", { withTimezone: true }),
  authTime: timestamp("authTime", { withTimezone: true }),
  confirmation: text("confirmation"),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
}, (table) => [
  foreignKey({
    columns: [table.clientId],
    foreignColumns: [oauthClient.clientId],
    name: "oauthRefreshToken_clientId_fkey",
  }).onDelete("cascade"),
  unique("oauthRefreshToken_token_key").on(table.token),
  index("oauthRefreshToken_authorizationCodeId_idx").on(table.authorizationCodeId),
])

export const oauthConsent = pgTable("oauthConsent", {
  id: text("id").primaryKey(),
  // Nullable since 1.7: client-credentials grants record consent with no user.
  userId: text("userId"),
  clientId: text("clientId").notNull(),
  referenceId: text("referenceId"),
  resources: text("resources"),
  requestedUserInfoClaims: text("requestedUserInfoClaims"),
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

/**
 * Protected resources (RFC 8707) the authorization server issues tokens for.
 * Seeded at boot from the `mcp()` plugin's `resource` option (insert-only) and
 * editable through the admin resource CRUD endpoints.
 */
export const oauthResource = pgTable("oauthResource", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  name: text("name").notNull(),
  accessTokenTtl: integer("accessTokenTtl"),
  refreshTokenTtl: integer("refreshTokenTtl"),
  signingAlgorithm: text("signingAlgorithm"),
  signingKeyId: text("signingKeyId"),
  allowedScopes: text("allowedScopes"),
  customClaims: text("customClaims"),
  dpopBoundAccessTokensRequired: boolean("dpopBoundAccessTokensRequired").default(false),
  disabled: boolean("disabled").default(false),
  policyVersion: integer("policyVersion").default(1),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  unique("oauthResource_identifier_key").on(table.identifier),
])

export const oauthClientResource = pgTable("oauthClientResource", {
  id: text("id").primaryKey(),
  clientId: text("clientId").notNull(),
  resourceId: text("resourceId").notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("oauthClientResource_clientId_resourceId_uidx").on(table.clientId, table.resourceId),
  foreignKey({
    columns: [table.clientId],
    foreignColumns: [oauthClient.clientId],
    name: "oauthClientResource_clientId_fkey",
  }).onDelete("cascade"),
  foreignKey({
    columns: [table.resourceId],
    foreignColumns: [oauthResource.identifier],
    name: "oauthClientResource_resourceId_fkey",
  }).onDelete("cascade"),
])

/**
 * Single-use `jti` replay tombstones for OAuth client assertions
 * (RFC 7523 private_key_jwt). Rows exist only until `expiresAt`.
 */
export const oauthClientAssertion = pgTable("oauthClientAssertion", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
})

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

/**
 * auth.md Agent Verified: the persistent link between an agent-provider
 * identity and a Skills Board user.
 *
 * The stable key is `(issuer, subject, audience)` — never the email. An agent
 * provider's `sub` is the only identifier it guarantees will not change; an
 * email can be reassigned, and treating it as the key would let a provider
 * take over an account by re-asserting a familiar address. Once a row exists,
 * an ID-JAG carrying that triple resolves straight to `userId` with no
 * interaction; until it exists, the first-link ceremony in `agentRegistration`
 * has to run.
 *
 * `revokedAt` is a tombstone rather than a delete: a provider that revokes a
 * delegation must not be able to reinstate it by sending a fresh ID-JAG, so
 * the row stays and is matched against.
 */
export const agentDelegation = pgTable("agentDelegation", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("userId").notNull(),
  issuer: text("issuer").notNull(),
  subject: text("subject").notNull(),
  audience: text("audience").notNull(),
  providerName: text("providerName"),
  lastUsedAt: timestamp("lastUsedAt", { withTimezone: true }),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
  revokedAt: timestamp("revokedAt", { withTimezone: true }),
}, (table) => [
  uniqueIndex("agentDelegation_issuer_subject_audience_uidx").on(
    table.issuer,
    table.subject,
    table.audience,
  ),
  index("agentDelegation_userId_idx").on(table.userId),
  foreignKey({
    columns: [table.userId],
    foreignColumns: [user.id],
    name: "agentDelegation_userId_fkey",
  }).onDelete("cascade"),
])

/**
 * One in-flight `/agent/identity` exchange.
 *
 * A row is written for every accepted ID-JAG, whether or not it resolved
 * straight to a user: `status` records which of the three outcomes the request
 * took, so the claim endpoint has something to poll and an operator can see
 * why a link was refused. Rows for a pending claim carry `claimTokenHash` (the
 * agent's poll credential) and `userCode` (what the human types), and every
 * row expires — this table is a queue, not a ledger.
 */
export const agentRegistration = pgTable("agentRegistration", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type").notNull(),
  issuer: text("issuer").notNull(),
  subject: text("subject").notNull(),
  audience: text("audience").notNull(),
  clientId: text("clientId").notNull(),
  email: text("email"),
  providerName: text("providerName"),
  userId: text("userId"),
  requestedScopes: text("requestedScopes").array().notNull().default(sql`ARRAY[]::text[]`),
  status: text("status").notNull(),
  claimTokenHash: text("claimTokenHash"),
  userCode: text("userCode"),
  attempts: integer("attempts").notNull().default(0),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
  completedAt: timestamp("completedAt", { withTimezone: true }),
}, (table) => [
  uniqueIndex("agentRegistration_userCode_uidx").on(table.userCode),
  index("agentRegistration_expiresAt_idx").on(table.expiresAt),
  index("agentRegistration_lookup_idx").on(table.issuer, table.subject, table.audience),
  foreignKey({
    columns: [table.userId],
    foreignColumns: [user.id],
    name: "agentRegistration_userId_fkey",
  }).onDelete("cascade"),
])

/**
 * Single-use `jti` tombstones for every assertion this deployment consumes —
 * both the provider's ID-JAG and our own identity assertion, told apart by
 * `issuer`. Rows live only until `expiresAt`, which is the assertion's own
 * `exp`: past that the signature check rejects a replay on its own, so keeping
 * the tombstone buys nothing.
 */
export const agentConsumedAssertion = pgTable("agentConsumedAssertion", {
  issuer: text("issuer").notNull(),
  jti: text("jti").notNull(),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
  consumedAt: timestamp("consumedAt", { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  primaryKey({ name: "agentConsumedAssertion_pkey", columns: [table.issuer, table.jti] }),
  index("agentConsumedAssertion_expiresAt_idx").on(table.expiresAt),
])
