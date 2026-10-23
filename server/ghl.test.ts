import { describe, expect, it } from "vitest";

/**
 * Live smoke tests for the GoHighLevel CRM credentials. They call the real GHL
 * API, so they only run where those credentials are configured (CI with the
 * secrets set, or a local .env) and are skipped otherwise.
 */
const hasCredentials = Boolean(
  process.env.GHL_API_KEY && process.env.GHL_LOCATION_ID
);

if (!hasCredentials) {
  console.warn(
    "[ghl.test] Skipping GoHighLevel tests: set GHL_API_KEY and GHL_LOCATION_ID to run them."
  );
}

describe.skipIf(!hasCredentials)("GoHighLevel API credentials", () => {
  it("should have GHL_API_KEY environment variable set", () => {
    const apiKey = process.env.GHL_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey!.length).toBeGreaterThan(10);
    // Verify it looks like a JWT token
    expect(apiKey!.split(".").length).toBe(3);
  });

  it("should have GHL_LOCATION_ID environment variable set", () => {
    const locationId = process.env.GHL_LOCATION_ID;
    expect(locationId).toBeDefined();
    expect(locationId!.length).toBeGreaterThan(5);
  });

  it("should be able to reach the GHL API", async () => {
    const apiKey = process.env.GHL_API_KEY;

    // Test with a lightweight GET request to search contacts (empty search)
    const response = await fetch(
      `https://rest.gohighlevel.com/v1/contacts/?locationId=${process.env.GHL_LOCATION_ID}&limit=1`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    // 200 means valid credentials, 401 means invalid
    expect(response.status).not.toBe(401);
    expect(response.ok).toBe(true);
  });
});
