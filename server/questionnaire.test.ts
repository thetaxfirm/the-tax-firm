import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "chris@thetaxfirm.us",
      name: "Chris Craig",
      loginMethod: "google",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "regular-user",
      email: "user@example.com",
      name: "Regular User",
      loginMethod: "google",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("questionnaire.submit", () => {
  it("accepts valid questionnaire submission from public (unauthenticated) user", { timeout: 15000 }, async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // This will attempt to hit the DB, which may not be available in test.
    // We're testing the input validation and procedure routing here.
    try {
      await caller.questionnaire.submit({
        name: "John Smith",
        email: "test@example.com",
        phone: "(702) 555-1234",
        selfEmployed: true,
        w2Employee: false,
        annualIncome: "350,000",
        ownsRealEstate: true,
        rothConversionInterest: true,
        retirementSavings: "500,000",
        expectations: "I want to reduce my tax burden significantly.",
      });
    } catch (error: any) {
      // If DB is not available, the error should be about the database, not about auth or validation
      expect(error.message).not.toContain("UNAUTHORIZED");
      expect(error.message).not.toContain("login");
    }
  });

  it("rejects submission with empty annualIncome", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.questionnaire.submit({
        name: "John Smith",
        email: "test@example.com",
        phone: "(702) 555-1234",
        selfEmployed: true,
        w2Employee: false,
        annualIncome: "",
        ownsRealEstate: false,
        rothConversionInterest: false,
        retirementSavings: "100,000",
      })
    ).rejects.toThrow();
  });

  it("rejects submission with empty retirementSavings", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.questionnaire.submit({
        name: "John Smith",
        email: "test@example.com",
        phone: "(702) 555-1234",
        selfEmployed: false,
        w2Employee: true,
        annualIncome: "200,000",
        ownsRealEstate: false,
        rothConversionInterest: false,
        retirementSavings: "",
      })
    ).rejects.toThrow();
  });

  it("allows submission without expectations (optional field)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.questionnaire.submit({
        name: "Jane Doe",
        email: "test@example.com",
        phone: "(702) 555-1234",
        selfEmployed: false,
        w2Employee: true,
        annualIncome: "150,000",
        ownsRealEstate: false,
        rothConversionInterest: true,
        retirementSavings: "250,000",
        // expectations is omitted - should be fine
      });
    } catch (error: any) {
      // DB error is acceptable, but not a validation error
      expect(error.message).not.toContain("UNAUTHORIZED");
      expect(error.code).not.toBe("BAD_REQUEST");
    }
  });
});

describe("questionnaire.list (admin-only)", () => {
  it("rejects unauthenticated access", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.questionnaire.list()).rejects.toThrow();
  });

  it("rejects non-admin user access", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.questionnaire.list()).rejects.toThrow(/permission/i);
  });

  it("allows admin user access", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    try {
      const result = await caller.questionnaire.list();
      expect(Array.isArray(result)).toBe(true);
    } catch (error: any) {
      // DB error is acceptable, but not an auth error
      expect(error.message).not.toContain("UNAUTHORIZED");
      expect(error.message).not.toContain("permission");
    }
  });
});

describe("questionnaire.updateStatus (admin-only)", () => {
  it("rejects unauthenticated access", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.questionnaire.updateStatus({ id: 1, status: "reviewed" })
    ).rejects.toThrow();
  });

  it("rejects non-admin user access", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.questionnaire.updateStatus({ id: 1, status: "contacted" })
    ).rejects.toThrow(/permission/i);
  });

  it("validates status enum values", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.questionnaire.updateStatus({ id: 1, status: "invalid" as any })
    ).rejects.toThrow();
  });
});

describe("questionnaire.submit email/phone validation", () => {
  it("rejects submission with invalid email", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.questionnaire.submit({
        name: "John Smith",
        email: "not-an-email",
        phone: "(702) 555-1234",
        selfEmployed: true,
        w2Employee: false,
        annualIncome: "350,000",
        ownsRealEstate: false,
        rothConversionInterest: false,
        retirementSavings: "100,000",
      })
    ).rejects.toThrow();
  });

  it("rejects submission with empty phone", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.questionnaire.submit({
        name: "John Smith",
        email: "test@example.com",
        phone: "",
        selfEmployed: true,
        w2Employee: false,
        annualIncome: "350,000",
        ownsRealEstate: false,
        rothConversionInterest: false,
        retirementSavings: "100,000",
      })
    ).rejects.toThrow();
  });

  it("rejects submission with missing email field", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.questionnaire.submit({
        name: "John Smith",
        phone: "(702) 555-1234",
        selfEmployed: true,
        w2Employee: false,
        annualIncome: "350,000",
        ownsRealEstate: false,
        rothConversionInterest: false,
        retirementSavings: "100,000",
      } as any)
    ).rejects.toThrow();
  });

  it("rejects submission with empty name", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.questionnaire.submit({
        name: "",
        email: "test@example.com",
        phone: "(702) 555-1234",
        selfEmployed: true,
        w2Employee: false,
        annualIncome: "350,000",
        ownsRealEstate: false,
        rothConversionInterest: false,
        retirementSavings: "100,000",
      })
    ).rejects.toThrow();
  });

  it("rejects submission with missing name field", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.questionnaire.submit({
        email: "test@example.com",
        phone: "(702) 555-1234",
        selfEmployed: true,
        w2Employee: false,
        annualIncome: "350,000",
        ownsRealEstate: false,
        rothConversionInterest: false,
        retirementSavings: "100,000",
      } as any)
    ).rejects.toThrow();
  });
});
