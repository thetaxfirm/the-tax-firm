import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, adminProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  createQuestionnaireResponse,
  getAllQuestionnaireResponses,
  getQuestionnaireResponseById,
  updateQuestionnaireResponseStatus,
} from "./db";
import { notifyOwner } from "./_core/notification";

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
    /** Public: submit a questionnaire response (no auth required) */
    submit: publicProcedure
      .input(
        z.object({
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

        // Send notification to owner about new questionnaire submission
        try {
          const details = [
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
            title: `New Discovery Call Request — ${input.email} — Income: ${input.annualIncome}`,
            content: `A new prospect has completed the questionnaire and is booking a discovery call.\n\n${details}`,
          });
        } catch (err) {
          console.warn("[Questionnaire] Failed to send owner notification:", err);
        }

        return result;
      }),

    /** Admin: list all questionnaire responses */
    list: adminProcedure.query(async () => {
      return getAllQuestionnaireResponses();
    }),

    /** Admin: get a single questionnaire response by ID */
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getQuestionnaireResponseById(input.id);
      }),

    /** Admin: update the status and notes of a response */
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
});

export type AppRouter = typeof appRouter;
