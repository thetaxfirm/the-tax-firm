import { eq, desc, and, lt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, InsertQuestionnaireResponse, InsertEngagement, InsertDocument, InsertMessage, InsertBlogArticle,
  users, questionnaireResponses, engagements, documents, messages, blogArticles
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/* ── Questionnaire Responses ─────────────────────────────────── */

export async function createQuestionnaireResponse(data: InsertQuestionnaireResponse) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(questionnaireResponses).values(data);
  return { success: true };
}

export async function getAllQuestionnaireResponses() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(questionnaireResponses).orderBy(desc(questionnaireResponses.submittedAt));
}

export async function getQuestionnaireResponseById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(questionnaireResponses).where(eq(questionnaireResponses.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateQuestionnaireResponseStatus(id: number, status: "new" | "reviewed" | "contacted", notes?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: Record<string, unknown> = { status };
  if (notes !== undefined) updateData.notes = notes;
  await db.update(questionnaireResponses).set(updateData).where(eq(questionnaireResponses.id, id));
  return { success: true };
}

/* ── Engagements ─────────────────────────────────── */

export async function createEngagement(data: InsertEngagement) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(engagements).values(data);
  return { success: true, id: Number(result[0].insertId) };
}

export async function getEngagementsByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(engagements).where(eq(engagements.userId, userId)).orderBy(desc(engagements.updatedAt));
}

export async function getAllEngagements() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(engagements).orderBy(desc(engagements.updatedAt));
}

export async function updateEngagement(id: number, data: Partial<InsertEngagement>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(engagements).set(data).where(eq(engagements.id, id));
  return { success: true };
}

/* ── Documents ─────────────────────────────────── */

export async function createDocument(data: InsertDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(documents).values(data);
  return { success: true, id: Number(result[0].insertId) };
}

export async function getDocumentById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const rows = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getDocumentsByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(documents).where(eq(documents.userId, userId)).orderBy(desc(documents.createdAt));
}

export async function getAllDocuments() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(documents).orderBy(desc(documents.createdAt));
}

export async function deleteDocument(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(documents).where(eq(documents.id, id));
  return { success: true };
}

/* ── Messages ─────────────────────────────────── */

export async function createMessage(data: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(messages).values(data);
  return { success: true, id: Number(result[0].insertId) };
}

export async function getMessagesByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(messages).where(eq(messages.userId, userId)).orderBy(desc(messages.createdAt));
}

export async function getAllMessages() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(messages).orderBy(desc(messages.createdAt));
}

export async function markMessagesAsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(messages).set({ isRead: true }).where(and(eq(messages.userId, userId), eq(messages.senderRole, "admin")));
  return { success: true };
}

export async function getUnreadMessageCount(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(messages).where(and(eq(messages.userId, userId), eq(messages.senderRole, "admin"), eq(messages.isRead, false)));
  return result.length;
}

/* ── Blog Articles ─────────────────────────────────── */

export async function createBlogArticle(data: InsertBlogArticle) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(blogArticles).values(data);
  return { success: true, id: Number(result[0].insertId) };
}

export async function getBlogArticleBySlug(slug: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(blogArticles).where(eq(blogArticles.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getBlogArticleByExternalId(externalId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(blogArticles).where(eq(blogArticles.externalId, externalId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPublishedBlogArticles(opts?: { limit?: number; cursor?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const limit = opts?.limit ?? 50;
  const query = db.select().from(blogArticles)
    .where(
      opts?.cursor
        ? and(eq(blogArticles.status, "published"), lt(blogArticles.id, opts.cursor))
        : eq(blogArticles.status, "published")
    )
    .orderBy(desc(blogArticles.publishedAt))
    .limit(limit + 1);
  const rows = await query;
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? items[items.length - 1].id : null;
  return { items, nextCursor };
}

export async function getAllBlogArticles() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(blogArticles).orderBy(desc(blogArticles.publishedAt));
}

export async function updateBlogArticle(id: number, data: Partial<InsertBlogArticle>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(blogArticles).set(data).where(eq(blogArticles.id, id));
  return { success: true };
}

export async function deleteBlogArticle(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(blogArticles).where(eq(blogArticles.id, id));
  return { success: true };
}

export async function upsertBlogArticleBySlug(data: InsertBlogArticle) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getBlogArticleBySlug(data.slug);
  if (existing) {
    await db.update(blogArticles).set(data).where(eq(blogArticles.id, existing.id));
    return { success: true, id: existing.id, action: "updated" as const };
  } else {
    const result = await db.insert(blogArticles).values(data);
    return { success: true, id: Number(result[0].insertId), action: "created" as const };
  }
}
