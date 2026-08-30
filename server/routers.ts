import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router, adminProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  createQuestionnaireResponse,
  getAllQuestionnaireResponses,
  getQuestionnaireResponseById,
  updateQuestionnaireResponseStatus,
  createEngagement,
  getEngagementsByUserId,
  getAllEngagements,
  updateEngagement,
  createDocument,
  getDocumentById,
  getDocumentsByUserId,
  getAllDocuments,
  deleteDocument,
  createMessage,
  getMessagesByUserId,
  getAllMessages,
  markMessagesAsRead,
  getUnreadMessageCount,
  getPublishedBlogArticles,
  getAllBlogArticles,
  getBlogArticleBySlug,
  updateBlogArticle,
  deleteBlogArticle,
} from "./db";
import { notifyOwner } from "./_core/notification";
import { createGHLContact } from "./ghl";
import { storagePut, storageGet } from "./storage";
import { nanoid } from "nanoid";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      // No maxAge: clearCookie already sets an epoch `expires`, and passing
      // maxAge alongside it is deprecated (ignored outright in Express 5).
      // What actually has to match for the browser to drop the cookie is the
      // path/domain/secure/sameSite triple, which cookieOptions carries.
      ctx.res.clearCookie(COOKIE_NAME, getSessionCookieOptions(ctx.req));
      return { success: true } as const;
    }),
  }),

  questionnaire: router({
    submit: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          email: z.string().email(),
          phone: z.string().min(1),
          selfEmployed: z.boolean(),
          w2Employee: z.boolean(),
          annualIncome: z.string().min(1),
          ownsRealEstate: z.boolean(),
          rothConversionInterest: z.boolean(),
          retirementSavings: z.string().min(1),
          expectations: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await createQuestionnaireResponse({
          name: input.name,
          email: input.email,
          phone: input.phone,
          selfEmployed: input.selfEmployed,
          w2Employee: input.w2Employee,
          annualIncome: input.annualIncome,
          ownsRealEstate: input.ownsRealEstate,
          rothConversionInterest: input.rothConversionInterest,
          retirementSavings: input.retirementSavings,
          expectations: input.expectations ?? null,
        });

        // Send notification to owner
        try {
          const details = [
            `Name: ${input.name}`,
            `Email: ${input.email}`,
            `Phone: ${input.phone}`,
            `Self-Employed: ${input.selfEmployed ? "Yes" : "No"}`,
            `W-2 Employee: ${input.w2Employee ? "Yes" : "No"}`,
            `Annual Income: ${input.annualIncome}`,
            `Owns Real Estate: ${input.ownsRealEstate ? "Yes" : "No"}`,
            `Roth Conversion Interest: ${input.rothConversionInterest ? "Yes" : "No"}`,
            `Retirement Savings: ${input.retirementSavings}`,
            input.expectations ? `Expectations: ${input.expectations}` : "",
          ].filter(Boolean).join("\n");

          await notifyOwner({
            title: `New Discovery Call Request — ${input.name} — Income: ${input.annualIncome}`,
            content: `A new prospect has completed the questionnaire and is booking a discovery call.\n\n${details}`,
          });
        } catch (err) {
          console.warn("[Questionnaire] Failed to send owner notification:", err);
        }

        // Create contact in GoHighLevel CRM
        try {
          const ghlResult = await createGHLContact({
            name: input.name,
            email: input.email,
            phone: input.phone,
            selfEmployed: input.selfEmployed,
            w2Employee: input.w2Employee,
            annualIncome: input.annualIncome,
            ownsRealEstate: input.ownsRealEstate,
            rothConversionInterest: input.rothConversionInterest,
            retirementSavings: input.retirementSavings,
            expectations: input.expectations,
          });
          if (ghlResult.success) {
            console.log(`[Questionnaire] GHL contact created: ${ghlResult.contactId}`);
          } else {
            console.warn(`[Questionnaire] GHL contact creation failed: ${ghlResult.error}`);
          }
        } catch (err) {
          console.warn("[Questionnaire] Failed to create GHL contact:", err);
        }

        return result;
      }),

    list: adminProcedure.query(async () => {
      return getAllQuestionnaireResponses();
    }),

    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getQuestionnaireResponseById(input.id);
      }),

    updateStatus: adminProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["new", "reviewed", "contacted"]),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return updateQuestionnaireResponseStatus(input.id, input.status, input.notes);
      }),
  }),

  /* ── Client Portal: Engagements ─────────────────── */
  engagement: router({
    /** Client: list my engagements */
    myEngagements: protectedProcedure.query(async ({ ctx }) => {
      return getEngagementsByUserId(ctx.user.id);
    }),

    /** Admin: list all engagements */
    list: adminProcedure.query(async () => {
      return getAllEngagements();
    }),

    /** Admin: create a new engagement for a client */
    create: adminProcedure
      .input(
        z.object({
          userId: z.number(),
          title: z.string().min(1),
          serviceType: z.enum(["tax_strategy", "fractional_cfo", "bookkeeping", "roth_conversion", "other"]),
          description: z.string().optional(),
          status: z.enum(["active", "in_progress", "pending_review", "completed", "on_hold"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        return createEngagement({
          userId: input.userId,
          title: input.title,
          serviceType: input.serviceType,
          description: input.description ?? null,
          status: input.status ?? "active",
        });
      }),

    /** Admin: update an engagement */
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          status: z.enum(["active", "in_progress", "pending_review", "completed", "on_hold"]).optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return updateEngagement(id, data);
      }),
  }),

  /* ── Client Portal: Documents ─────────────────── */
  document: router({
    /** Client: list my documents */
    myDocuments: protectedProcedure.query(async ({ ctx }) => {
      return getDocumentsByUserId(ctx.user.id);
    }),

    /** Client: upload a document */
    upload: protectedProcedure
      .input(
        z.object({
          fileName: z.string().min(1),
          fileData: z.string(), // base64 encoded
          mimeType: z.string().min(1),
          fileSize: z.number(),
          category: z.enum(["tax_return", "w2_1099", "business_docs", "financial_statement", "receipt", "contract", "other"]).optional(),
          engagementId: z.number().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Upload to S3
        const suffix = nanoid(8);
        const fileKey = `portal/${ctx.user.id}/${suffix}-${input.fileName}`;
        const buffer = Buffer.from(input.fileData, "base64");
        const { url } = await storagePut(fileKey, buffer, input.mimeType);

        // Save metadata to DB
        return createDocument({
          userId: ctx.user.id,
          engagementId: input.engagementId ?? null,
          fileName: input.fileName,
          fileKey,
          fileUrl: url,
          fileSize: input.fileSize,
          mimeType: input.mimeType,
          category: input.category ?? "other",
          uploadedBy: "client",
          notes: input.notes ?? null,
        });
      }),

    /** Admin: upload a document for a client */
    adminUpload: adminProcedure
      .input(
        z.object({
          userId: z.number(),
          fileName: z.string().min(1),
          fileData: z.string(), // base64 encoded
          mimeType: z.string().min(1),
          fileSize: z.number(),
          category: z.enum(["tax_return", "w2_1099", "business_docs", "financial_statement", "receipt", "contract", "other"]).optional(),
          engagementId: z.number().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const suffix = nanoid(8);
        const fileKey = `portal/${input.userId}/${suffix}-${input.fileName}`;
        const buffer = Buffer.from(input.fileData, "base64");
        const { url } = await storagePut(fileKey, buffer, input.mimeType);

        return createDocument({
          userId: input.userId,
          engagementId: input.engagementId ?? null,
          fileName: input.fileName,
          fileKey,
          fileUrl: url,
          fileSize: input.fileSize,
          mimeType: input.mimeType,
          category: input.category ?? "other",
          uploadedBy: "admin",
          notes: input.notes ?? null,
        });
      }),

    /** Admin: list all documents */
    list: adminProcedure.query(async () => {
      return getAllDocuments();
    }),

    /**
     * Client or Admin: mint a fresh download URL for one document.
     *
     * Takes a document id, never a raw storage key: the previous signature
     * accepted any fileKey from any signed-in user, so one client could read
     * another client's `portal/<userId>/...` documents just by guessing or
     * observing a key. Ownership is now checked against the document row.
     *
     * Resolving on demand also keeps links working: the stored fileUrl is a
     * presigned URL that expires, so it must not be used as a permanent href.
     */
    getDownloadUrl: protectedProcedure
      .input(z.object({ documentId: z.number() }))
      .query(async ({ ctx, input }) => {
        const doc = await getDocumentById(input.documentId);
        if (!doc) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Document not found" });
        }

        const isOwner = doc.userId === ctx.user.id;
        const isAdmin = ctx.user.role === "admin";
        if (!isOwner && !isAdmin) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not your document" });
        }

        return storageGet(doc.fileKey);
      }),

    /** Admin: delete a document */
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deleteDocument(input.id);
      }),
  }),

  /* ── Client Portal: Messages ─────────────────── */
  message: router({
    /** Client: get my messages */
    myMessages: protectedProcedure.query(async ({ ctx }) => {
      return getMessagesByUserId(ctx.user.id);
    }),

    /** Client: send a message */
    send: protectedProcedure
      .input(
        z.object({
          content: z.string().min(1),
          engagementId: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const result = await createMessage({
          userId: ctx.user.id,
          engagementId: input.engagementId ?? null,
          senderRole: "client",
          senderName: ctx.user.name ?? "Client",
          content: input.content,
        });

        // Notify admin of new client message
        try {
          await notifyOwner({
            title: `New Message from ${ctx.user.name ?? "Client"}`,
            content: input.content.substring(0, 500),
          });
        } catch (err) {
          console.warn("[Portal] Failed to notify owner of message:", err);
        }

        return result;
      }),

    /** Admin: reply to a client */
    adminReply: adminProcedure
      .input(
        z.object({
          userId: z.number(),
          content: z.string().min(1),
          engagementId: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return createMessage({
          userId: input.userId,
          engagementId: input.engagementId ?? null,
          senderRole: "admin",
          senderName: ctx.user.name ?? "The Tax Firm",
          content: input.content,
        });
      }),

    /** Admin: list all messages */
    list: adminProcedure.query(async () => {
      return getAllMessages();
    }),

    /** Client: mark messages as read */
    markRead: protectedProcedure.mutation(async ({ ctx }) => {
      return markMessagesAsRead(ctx.user.id);
    }),

    /** Client: get unread count */
    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      return getUnreadMessageCount(ctx.user.id);
    }),
  }),

  blog: router({
    /** Public: get published dynamic articles with cursor pagination */
    published: publicProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(12),
        cursor: z.number().nullish(),
      }))
      .query(async ({ input }) => {
        return getPublishedBlogArticles({
          limit: input.limit,
          cursor: input.cursor ?? undefined,
        });
      }),

    /** Public: get a single article by slug */
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return getBlogArticleBySlug(input.slug);
      }),

    /** Admin: get all articles including drafts */
    all: adminProcedure.query(async () => {
      return getAllBlogArticles();
    }),

    /** Admin: update article status or content */
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          excerpt: z.string().optional(),
          category: z.string().optional(),
          content: z.string().optional(),
          status: z.enum(["draft", "published", "archived"]).optional(),
          featured: z.boolean().optional(),
          image: z.string().optional(),
          tags: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return updateBlogArticle(id, data);
      }),

    /** Admin: delete article */
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deleteBlogArticle(input.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
