import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "chris@thetaxfirm.us",
      name: "Chris Craig",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

function createUserContext(id = 2): TrpcContext {
  return {
    user: {
      id,
      openId: `user-${id}`,
      email: `user${id}@example.com`,
      name: `Test User ${id}`,
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

/* ══════════════════════════════════════════════════════════════════
   Engagement Procedures
   ══════════════════════════════════════════════════════════════════ */

describe("engagement.myEngagements (protected)", () => {
  it("rejects unauthenticated access", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.engagement.myEngagements()).rejects.toThrow();
  });

  it("allows authenticated user access", async () => {
    const caller = appRouter.createCaller(createUserContext());
    try {
      const result = await caller.engagement.myEngagements();
      expect(Array.isArray(result)).toBe(true);
    } catch (error: any) {
      // DB error is acceptable, not auth error
      expect(error.message).not.toContain("UNAUTHORIZED");
      expect(error.message).not.toContain("login");
    }
  });
});

describe("engagement.list (admin-only)", () => {
  it("rejects unauthenticated access", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.engagement.list()).rejects.toThrow();
  });

  it("rejects non-admin user access", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.engagement.list()).rejects.toThrow(/permission/i);
  });

  it("allows admin access", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    try {
      const result = await caller.engagement.list();
      expect(Array.isArray(result)).toBe(true);
    } catch (error: any) {
      expect(error.message).not.toContain("UNAUTHORIZED");
      expect(error.message).not.toContain("permission");
    }
  });
});

describe("engagement.create (admin-only)", () => {
  it("rejects unauthenticated access", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.engagement.create({
        userId: 2,
        title: "2025 Tax Strategy",
        serviceType: "tax_strategy",
      })
    ).rejects.toThrow();
  });

  it("rejects non-admin user access", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.engagement.create({
        userId: 2,
        title: "2025 Tax Strategy",
        serviceType: "tax_strategy",
      })
    ).rejects.toThrow(/permission/i);
  });

  it("validates service type enum", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    await expect(
      caller.engagement.create({
        userId: 2,
        title: "Test",
        serviceType: "invalid_service" as any,
      })
    ).rejects.toThrow();
  });

  it("validates required title field", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    await expect(
      caller.engagement.create({
        userId: 2,
        title: "",
        serviceType: "tax_strategy",
      })
    ).rejects.toThrow();
  });
});

describe("engagement.update (admin-only)", () => {
  it("rejects unauthenticated access", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.engagement.update({ id: 1, status: "completed" })
    ).rejects.toThrow();
  });

  it("validates status enum", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    await expect(
      caller.engagement.update({ id: 1, status: "invalid_status" as any })
    ).rejects.toThrow();
  });
});

/* ══════════════════════════════════════════════════════════════════
   Document Procedures
   ══════════════════════════════════════════════════════════════════ */

describe("document.myDocuments (protected)", () => {
  it("rejects unauthenticated access", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.document.myDocuments()).rejects.toThrow();
  });

  it("allows authenticated user access", async () => {
    const caller = appRouter.createCaller(createUserContext());
    try {
      const result = await caller.document.myDocuments();
      expect(Array.isArray(result)).toBe(true);
    } catch (error: any) {
      expect(error.message).not.toContain("UNAUTHORIZED");
    }
  });
});

describe("document.upload (protected)", () => {
  it("rejects unauthenticated access", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.document.upload({
        fileName: "test.pdf",
        fileData: "dGVzdA==", // base64 "test"
        mimeType: "application/pdf",
        fileSize: 4,
      })
    ).rejects.toThrow();
  });

  it("validates required fileName", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.document.upload({
        fileName: "",
        fileData: "dGVzdA==",
        mimeType: "application/pdf",
        fileSize: 4,
      })
    ).rejects.toThrow();
  });

  it("validates category enum", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.document.upload({
        fileName: "test.pdf",
        fileData: "dGVzdA==",
        mimeType: "application/pdf",
        fileSize: 4,
        category: "invalid_category" as any,
      })
    ).rejects.toThrow();
  });
});

describe("document.list (admin-only)", () => {
  it("rejects unauthenticated access", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.document.list()).rejects.toThrow();
  });

  it("rejects non-admin user access", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.document.list()).rejects.toThrow(/permission/i);
  });
});

describe("document.delete (admin-only)", () => {
  it("rejects unauthenticated access", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.document.delete({ id: 1 })).rejects.toThrow();
  });

  it("rejects non-admin user access", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.document.delete({ id: 1 })).rejects.toThrow(/permission/i);
  });
});

/* ══════════════════════════════════════════════════════════════════
   Message Procedures
   ══════════════════════════════════════════════════════════════════ */

describe("message.myMessages (protected)", () => {
  it("rejects unauthenticated access", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.message.myMessages()).rejects.toThrow();
  });

  it("allows authenticated user access", async () => {
    const caller = appRouter.createCaller(createUserContext());
    try {
      const result = await caller.message.myMessages();
      expect(Array.isArray(result)).toBe(true);
    } catch (error: any) {
      expect(error.message).not.toContain("UNAUTHORIZED");
    }
  });
});

describe("message.send (protected)", () => {
  it("rejects unauthenticated access", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.message.send({ content: "Hello" })
    ).rejects.toThrow();
  });

  it("validates non-empty content", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.message.send({ content: "" })
    ).rejects.toThrow();
  });
});

describe("message.adminReply (admin-only)", () => {
  it("rejects unauthenticated access", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.message.adminReply({ userId: 2, content: "Reply" })
    ).rejects.toThrow();
  });

  it("rejects non-admin user access", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.message.adminReply({ userId: 2, content: "Reply" })
    ).rejects.toThrow(/permission/i);
  });

  it("validates non-empty content", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    await expect(
      caller.message.adminReply({ userId: 2, content: "" })
    ).rejects.toThrow();
  });
});

describe("message.list (admin-only)", () => {
  it("rejects unauthenticated access", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.message.list()).rejects.toThrow();
  });

  it("rejects non-admin user access", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.message.list()).rejects.toThrow(/permission/i);
  });
});

describe("message.markRead (protected)", () => {
  it("rejects unauthenticated access", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.message.markRead()).rejects.toThrow();
  });
});

describe("message.unreadCount (protected)", () => {
  it("rejects unauthenticated access", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.message.unreadCount()).rejects.toThrow();
  });
});
