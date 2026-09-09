import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  APP_NAME: z.string().default("Sultan Kudarat Research Journal of Education and Technology (SKRJET)"),
  DATABASE_URL: z.string().min(1).optional(),
  AUTH_SECRET: z.string().min(32),
  AUTH_COOKIE_NAME: z.string().default("journal_session"),
  AUTH_CSRF_COOKIE_NAME: z.string().default("journal_csrf"),
  AUTH_SESSION_TTL_HOURS: z.coerce.number().int().positive().default(12),
  STORAGE_DRIVER: z.enum(["local", "s3", "supabase"]).default("local"),
  STORAGE_LOCAL_PATH: z.string().default(".storage"),
  S3_ENDPOINT: z.string().optional().default(""),
  S3_REGION: z.string().default("us-east-1"),
  S3_BUCKET: z.string().default("journal-platform"),
  S3_ACCESS_KEY_ID: z.string().optional().default(""),
  S3_SECRET_ACCESS_KEY: z.string().optional().default(""),
  S3_FORCE_PATH_STYLE: z
    .union([z.boolean(), z.string()])
    .transform((value) => value === true || value === "true")
    .default(true),
  S3_PUBLIC_BASE_URL: z.string().optional().default(""),
  SUPABASE_URL: z.string().optional().default(""),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(""),
  SUPABASE_STORAGE_BUCKET: z.string().default("journal-files"),
  MAX_PDF_SIZE_MB: z.coerce.number().positive().default(25),
  MAX_SUPPLEMENTARY_SIZE_MB: z.coerce.number().positive().default(50),
  MAX_THUMBNAIL_SIZE_MB: z.coerce.number().positive().default(5),
  EDAS_MODE: z.enum(["mock", "manual", "live"]).default("mock"),
  EDAS_BASE_URL: z.string().optional().default(""),
  EDAS_API_KEY: z.string().optional().default(""),
  EDAS_API_SECRET: z.string().optional().default(""),
  EDAS_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  CROSSREF_MODE: z.enum(["mock", "manual", "live"]).default("mock"),
  CROSSREF_API_URL: z.string().optional().default("https://doi.crossref.org"),
  CROSSREF_LOGIN: z.string().optional().default(""),
  CROSSREF_PASSWORD: z.string().optional().default(""),
  CROSSREF_DEPOSITOR_NAME: z.string().optional().default(""),
  CROSSREF_DEPOSITOR_EMAIL: z.string().optional().default(""),
  CROSSREF_PREFIX: z.string().optional().default("10.5555"),
  ORCID_MODE: z.enum(["mock", "live"]).default("mock"),
  ORCID_API_URL: z.string().optional().default("https://pub.orcid.org/v3.0"),
  ORCID_CLIENT_ID: z.string().optional().default(""),
  ORCID_CLIENT_SECRET: z.string().optional().default(""),
  GOOGLE_SITE_VERIFICATION: z.string().optional().default(""),
  EMAIL_MODE: z.enum(["mock", "live"]).default("mock"),
  EMAIL_FROM: z
    .string()
    .optional()
    .default("SKRJET <noreply@journals.local>"),
  RESEND_API_KEY: z.string().optional().default(""),
  RESEND_API_URL: z.string().optional().default("https://api.resend.com/emails"),
  METRIC_DEDUPE_WINDOW_SECONDS: z.coerce.number().int().positive().default(3600),
});

function isProductionBuild() {
  return process.env.NEXT_PHASE === "phase-production-build";
}

function resolveAuthSecret() {
  const configured = process.env.AUTH_SECRET?.trim();
  if (configured && configured.length >= 32) return configured;
  if (process.env.NODE_ENV !== "production") {
    return "dev-only-change-me-use-openssl-rand-base64-48-chars!!";
  }
  // Next.js imports route modules during `next build`; allow a placeholder only then.
  if (isProductionBuild()) {
    return "build-time-placeholder-secret-min-32-chars!!";
  }
  // Client bundles must never throw — AUTH_SECRET is server-only and unavailable in the browser.
  if (typeof window !== "undefined") {
    return "client-side-placeholder-secret-min-32-chars!";
  }
  throw new Error(
    "AUTH_SECRET must be set in production (at least 32 characters). Add it in Vercel → Project → Settings → Environment Variables.",
  );
}

function resolveAppUrl() {
  const configured = process.env.APP_URL?.trim() || process.env.AUTH_URL?.trim();
  if (configured) return configured;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

function readEnv() {
  return envSchema.parse({
    ...process.env,
    AUTH_SECRET: resolveAuthSecret(),
    APP_URL: resolveAppUrl(),
  });
}

export const env = readEnv();
