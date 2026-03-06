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
