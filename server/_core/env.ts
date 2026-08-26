function parseList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map(item => item.trim().toLowerCase())
    .filter(Boolean);
}

export const ENV = {
  // Logical application identifier embedded in session tokens. This used to be
  // the Manus project id (VITE_APP_ID); nothing compares it any more — sessions
  // are verified purely by the HS256 signature — so it is a fixed label.
  appId: "the-tax-firm",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  // Legacy escape hatch: grants the "admin" role to a specific openId. Still
  // honoured, but openIds are now "google:<sub>" rather than Manus ids, so an
  // OWNER_OPEN_ID carried over from Manus will never match. Prefer ADMIN_EMAILS.
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",

  // Google OAuth (sign-in).
  googleClientId:
    process.env.GOOGLE_CLIENT_ID ?? process.env.VITE_GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  // Emails granted the "admin" role on sign-in (comma-separated, case-insensitive).
  adminEmails: parseList(process.env.ADMIN_EMAILS),
  ownerEmail: process.env.OWNER_EMAIL ?? "",
};
