import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function context(role?: "admin" | "user"): TrpcContext {
  return {
    user: role
      ? {
          id: 1,
          openId: "test-user",
          email: "test@example.org",
          name: "Test User",
          loginMethod: "google",
          role,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        }
      : null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

// Historical records remain admin-only. New captures use Tely, whose owner
// tests cover validation/replay; NativeForms.test.tsx protects this UI cutover.
describe("historical questionnaire responses", () => {
  it.each([undefined, "user"] as const)(
    "denies list and updates to %s",
    async role => {
      const caller = appRouter.createCaller(context(role));
      await expect(caller.questionnaire.list()).rejects.toThrow();
      await expect(
        caller.questionnaire.updateStatus({ id: 1, status: "reviewed" })
      ).rejects.toThrow();
    }
  );

  it("rejects an invalid status before changing a historical record", async () => {
    const caller = appRouter.createCaller(context("admin"));
    await expect(
      caller.questionnaire.updateStatus({ id: 1, status: "invalid" as never })
    ).rejects.toThrow();
  });
});
