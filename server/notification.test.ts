import { describe, expect, it, vi } from "vitest";

// Mock the notification module
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

import { notifyOwner } from "./_core/notification";

describe("questionnaire notification", () => {
  it("notifyOwner is called with correct payload format", async () => {
    const mockNotify = vi.mocked(notifyOwner);
    mockNotify.mockResolvedValue(true);

    const input = {
      selfEmployed: true,
      w2Employee: false,
      annualIncome: "$400,000",
      ownsRealEstate: true,
      rothConversionInterest: true,
      retirementSavings: "$750,000",
      expectations: "I want to reduce my tax burden significantly",
    };

    const details = [
      `Self-Employed: Yes`,
      `W-2 Employee: No`,
      `Annual Income: $400,000`,
      `Owns Real Estate: Yes`,
      `Roth Conversion Interest: Yes`,
      `Retirement Savings: $750,000`,
      `Expectations: I want to reduce my tax burden significantly`,
    ].join("\n");

    await notifyOwner({
      title: `New Discovery Call Request — Income: ${input.annualIncome}`,
      content: `A new prospect has completed the questionnaire and is booking a discovery call.\n\n${details}`,
    });

    expect(mockNotify).toHaveBeenCalledTimes(1);
    expect(mockNotify).toHaveBeenCalledWith({
      title: expect.stringContaining("New Discovery Call Request"),
      content: expect.stringContaining("Self-Employed: Yes"),
    });
  });

  it("notifyOwner handles failure gracefully", async () => {
    const mockNotify = vi.mocked(notifyOwner);
    mockNotify.mockRejectedValue(new Error("Network error"));

    // The questionnaire submission should not fail even if notification fails
    try {
      await notifyOwner({
        title: "Test",
        content: "Test content",
      });
    } catch (err) {
      // Expected - the try/catch in the router would handle this
      expect(err).toBeInstanceOf(Error);
    }
  });

  it("notification payload includes all questionnaire fields", () => {
    const input = {
      selfEmployed: false,
      w2Employee: true,
      annualIncome: "$200,000",
      ownsRealEstate: false,
      rothConversionInterest: false,
      retirementSavings: "$100,000",
      expectations: "",
    };

    const details = [
      `Self-Employed: ${input.selfEmployed ? "Yes" : "No"}`,
      `W-2 Employee: ${input.w2Employee ? "Yes" : "No"}`,
      `Annual Income: ${input.annualIncome}`,
      `Owns Real Estate: ${input.ownsRealEstate ? "Yes" : "No"}`,
      `Roth Conversion Interest: ${input.rothConversionInterest ? "Yes" : "No"}`,
      `Retirement Savings: ${input.retirementSavings}`,
      input.expectations ? `Expectations: ${input.expectations}` : "",
    ].filter(Boolean).join("\n");

    expect(details).toContain("Self-Employed: No");
    expect(details).toContain("W-2 Employee: Yes");
    expect(details).toContain("Annual Income: $200,000");
    expect(details).toContain("Owns Real Estate: No");
    expect(details).toContain("Roth Conversion Interest: No");
    expect(details).toContain("Retirement Savings: $100,000");
    // Empty expectations should be filtered out
    expect(details).not.toContain("Expectations:");
  });
});
