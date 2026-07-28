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
