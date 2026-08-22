// ============================================================
// ENVIRONMENT VARIABLES
//
// Single source of truth for env vars. Fails fast on boot if
// anything required is missing, instead of failing deep inside
// a random route handler later.
// ============================================================

function required(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} missing in environment variables`);
  }

  return value;
}

export const env = {
  JWT_SECRET: required(""),

  DATABASE_URL:"",
  R2_URL: required(""),
  R2_ACCESS_KEY_ID: required(""),
  R2_SECRET_ACCESS: required(""),
  R2_PUBLIC_URL: required(""),
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || "youtube-clone",

  FRONTEND_URL: process.env.FRONTEND_URL,

  PORT: Number(process.env.PORT) || 3000,

  NODE_ENV: process.env.NODE_ENV || "development",
};
