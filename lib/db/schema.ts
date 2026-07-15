import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  activeOrganizationId: text("activeOrganizationId"),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

export const organization = pgTable("organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const member = pgTable("member", {
  id: text("id").primaryKey(),
  organizationId: text("organizationId").notNull(),
  userId: text("userId").notNull(),
  role: text("role").notNull().default("member"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const invitation = pgTable("invitation", {
  id: text("id").primaryKey(),
  organizationId: text("organizationId").notNull(),
  email: text("email").notNull(),
  role: text("role"),
  status: text("status").notNull().default("pending"),
  expiresAt: timestamp("expiresAt").notNull(),
  inviterId: text("inviterId").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const jwks = pgTable("jwks", {
  id: text("id").primaryKey(),
  publicKey: text("publicKey").notNull(),
  privateKey: text("privateKey").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const oauthClient = pgTable("oauthClient", {
  id: text("id").primaryKey(),
  clientId: text("clientId").notNull().unique(),
  clientSecret: text("clientSecret"),
  name: text("name"),
  redirectUris: jsonb("redirectUris").$type<string[]>().notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  type: text("type"),
  disabled: boolean("disabled").default(false),
  userId: text("userId"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const oauthAccessToken = pgTable("oauthAccessToken", {
  id: text("id").primaryKey(),
  token: text("token").notNull().unique(),
  clientId: text("clientId").notNull(),
  userId: text("userId"),
  scopes: jsonb("scopes").$type<string[]>().notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  expiresAt: timestamp("expiresAt").notNull(),
})

export const oauthRefreshToken = pgTable("oauthRefreshToken", {
  id: text("id").primaryKey(),
  token: text("token").notNull().unique(),
  clientId: text("clientId").notNull(),
  userId: text("userId").notNull(),
  scopes: jsonb("scopes").$type<string[]>().notNull(),
  revoked: boolean("revoked").default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  expiresAt: timestamp("expiresAt").notNull(),
})

export const oauthConsent = pgTable("oauthConsent", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull(),
  clientId: text("clientId").notNull(),
  scopes: jsonb("scopes").$type<string[]>().notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
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
  repoUpdatedAt: timestamp("repoUpdatedAt"),
  skillPath: text("skillPath"),
  tags: text("tags").array().notNull().default([]),
  metadataRefreshedAt: timestamp("metadataRefreshedAt").notNull().defaultNow(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("skill_org_repo_name_unique").on(table.organizationId, table.githubUrl, table.skillName),
])
