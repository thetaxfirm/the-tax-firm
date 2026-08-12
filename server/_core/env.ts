function parseList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export const ENV = {
  // Logical application identifier embedded in session tokens.
  appId: process.env.VITE_APP_ID || "the-tax-firm",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",

  // Google OAuth (sign-in).
  googleClientId:
    process.env.GOOGLE_CLIENT_ID ?? process.env.VITE_GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  // Emails granted the "admin" role on sign-in (comma-separated, case-insensitive).
  adminEmails: parseList(process.env.ADMIN_EMAILS),
  ownerEmail: process.env.OWNER_EMAIL ?? "",

  // Legacy Manus "Forge" proxy — retained only so dormant _core helpers
  // (imageGeneration/voice/map/dataApi) still type-check. No live feature uses it.
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
