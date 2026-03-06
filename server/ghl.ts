/**
 * GoHighLevel CRM Integration
 * Creates contacts in GHL when questionnaire submissions are received.
 */

const GHL_API_BASE = "https://rest.gohighlevel.com/v1";

interface GHLContactData {
  name: string;
  email: string;
  phone: string;
  selfEmployed: boolean;
  w2Employee: boolean;
  annualIncome: string;
  ownsRealEstate: boolean;
  rothConversionInterest: boolean;
  retirementSavings: string;
  expectations?: string;
}

interface GHLContactResponse {
  success: boolean;
  contactId?: string;
  error?: string;
}

/**
 * Create or update a contact in GoHighLevel CRM with questionnaire data.
 * Uses the GHL v1 REST API to create a contact with custom fields and tags.
 */
export async function createGHLContact(data: GHLContactData): Promise<GHLContactResponse> {
  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;

  if (!apiKey || !locationId) {
    console.warn("[GHL] Missing API key or Location ID — skipping contact creation");
    return { success: false, error: "Missing GHL credentials" };
  }

  // Split name into first and last
  const nameParts = data.name.trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  // Build tags based on questionnaire answers
  const tags: string[] = ["Website Lead", "Discovery Call"];
  if (data.selfEmployed) tags.push("Self-Employed");
  if (data.w2Employee) tags.push("W-2 Employee");
  if (data.ownsRealEstate) tags.push("Real Estate Owner");
  if (data.rothConversionInterest) tags.push("Roth Conversion Interest");

  // Categorize income level for tagging
  const income = parseFloat(data.annualIncome.replace(/[^0-9.]/g, ""));
  if (income >= 500000) tags.push("High Income 500K+");
  else if (income >= 250000) tags.push("Income 250K-500K");
  else if (income >= 100000) tags.push("Income 100K-250K");

  // Build custom field values as notes since custom fields require field IDs
  const noteLines = [
    `--- Questionnaire Submission ---`,
    `Self-Employed: ${data.selfEmployed ? "Yes" : "No"}`,
    `W-2 Employee: ${data.w2Employee ? "Yes" : "No"}`,
    `Annual Income: ${data.annualIncome}`,
    `Owns Real Estate: ${data.ownsRealEstate ? "Yes" : "No"}`,
    `Roth Conversion Interest: ${data.rothConversionInterest ? "Yes" : "No"}`,
    `Retirement Savings: ${data.retirementSavings}`,
  ];
  if (data.expectations) {
    noteLines.push(`Expectations: ${data.expectations}`);
  }
  noteLines.push(`Submitted: ${new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}`);

  const contactPayload = {
    locationId,
    firstName,
    lastName,
    name: data.name,
    email: data.email,
    phone: data.phone,
    tags,
    source: "Website Questionnaire",
  };

  try {
    // Step 1: Create or update the contact
    const contactResponse = await fetch(`${GHL_API_BASE}/contacts/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contactPayload),
    });

    if (!contactResponse.ok) {
      const errorText = await contactResponse.text();
      console.error("[GHL] Failed to create contact:", contactResponse.status, errorText);
      return { success: false, error: `GHL API error: ${contactResponse.status}` };
    }

    const contactResult = await contactResponse.json();
    const contactId = contactResult.contact?.id;

    if (!contactId) {
      console.error("[GHL] No contact ID returned:", contactResult);
      return { success: false, error: "No contact ID returned from GHL" };
    }

    // Step 2: Add a note with the full questionnaire details
    try {
      const noteResponse = await fetch(`${GHL_API_BASE}/contacts/${contactId}/notes/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body: noteLines.join("\n") }),
      });

      if (!noteResponse.ok) {
        // Try alternative format if first attempt fails
        const altNoteResponse = await fetch(`${GHL_API_BASE}/contacts/${contactId}/notes`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: contactId, body: noteLines.join("\n") }),
        });
        if (!altNoteResponse.ok) {
          console.warn("[GHL] Contact created but failed to add note:", altNoteResponse.status);
        }
      }
    } catch (noteErr) {
      console.warn("[GHL] Contact created but note creation threw:", noteErr);
    }

    console.log(`[GHL] Contact created successfully: ${contactId} (${data.name})`);
    return { success: true, contactId };
  } catch (error) {
    console.error("[GHL] Error creating contact:", error);
    return { success: false, error: String(error) };
  }
}
