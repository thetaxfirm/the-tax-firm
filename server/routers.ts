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
  getDocumentsByUserId,
  getAllDocuments,
  deleteDocument,
  createMessage,
  getMessagesByUserId,
  getAllMessages,
  markMessagesAsRead,
  getUnreadMessageCount,
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
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
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

    /** Client or Admin: get download URL for a document */
    getDownloadUrl: protectedProcedure
      .input(z.object({ fileKey: z.string() }))
      .query(async ({ input }) => {
        return storageGet(input.fileKey);
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
});

export type AppRouter = typeof appRouter;
