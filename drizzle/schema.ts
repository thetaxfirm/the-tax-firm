import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Questionnaire responses submitted by prospects before booking a discovery call.
 */
export const questionnaireResponses = mysqlTable("questionnaire_responses", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 30 }).notNull(),
  selfEmployed: boolean("selfEmployed").notNull(),
  w2Employee: boolean("w2Employee").notNull(),
  annualIncome: varchar("annualIncome", { length: 100 }).notNull(),
  ownsRealEstate: boolean("ownsRealEstate").notNull(),
  rothConversionInterest: boolean("rothConversionInterest").notNull(),
  retirementSavings: varchar("retirementSavings", { length: 100 }).notNull(),
  expectations: text("expectations"),
  status: mysqlEnum("status", ["new", "reviewed", "contacted"]).default("new").notNull(),
  notes: text("notes"),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
});

export type QuestionnaireResponse = typeof questionnaireResponses.$inferSelect;
export type InsertQuestionnaireResponse = typeof questionnaireResponses.$inferInsert;

/**
 * Client engagements — tracks the service relationship between the firm and each client.
 */
export const engagements = mysqlTable("engagements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  serviceType: mysqlEnum("serviceType", ["tax_strategy", "fractional_cfo", "bookkeeping", "roth_conversion", "other"]).notNull(),
  status: mysqlEnum("status", ["active", "in_progress", "pending_review", "completed", "on_hold"]).default("active").notNull(),
  description: text("description"),
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Engagement = typeof engagements.$inferSelect;
export type InsertEngagement = typeof engagements.$inferInsert;

/**
 * Client documents — files uploaded by clients or the firm, stored in S3.
 */
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  engagementId: int("engagementId"),
  fileName: varchar("fileName", { length: 500 }).notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileSize: int("fileSize").notNull(),
  mimeType: varchar("mimeType", { length: 200 }).notNull(),
  category: mysqlEnum("category", ["tax_return", "w2_1099", "business_docs", "financial_statement", "receipt", "contract", "other"]).default("other").notNull(),
  uploadedBy: mysqlEnum("uploadedBy", ["client", "admin"]).default("client").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

/**
 * Messages — communication between clients and the firm.
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  engagementId: int("engagementId"),
  senderRole: mysqlEnum("senderRole", ["client", "admin"]).notNull(),
  senderName: varchar("senderName", { length: 200 }),
  content: text("content").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
