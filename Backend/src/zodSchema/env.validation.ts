import z from "zod";
export const envSchema = z.object({
  //Node environment
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  PORT: z.coerce.number().default(8000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(8),

  // Google secret setup
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_URL: z.string().url(),

  // GitHub OAuth
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  GITHUB_REDIRECT_URL: z.string().url(),

  // Google gemini
  GOOGLE_GEMINI_API_KEY: z.string().min(1),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),

  // SSLCommerz
  SSL_STORE_ID: z.string().min(1),
  SSL_STORE_PASSWORD: z.string().min(1),
  SSL_IS_LIVE: z.coerce.boolean().default(false),

  // Payment URLs
  SSL_SUCCESS_URL: z.string().url(),
  SSL_FAIL_URL: z.string().url(),
  SSL_CANCEL_URL: z.string().url(),
  SSL_IPN_URL: z.string().url(),

  // Client URL for Frontend
  CLIENT_URL: z.string().url().default("http://localhost:3000"),

  REDIS_URL: z.string().url().default("redis://localhost:6379"),
  CACHE_TTL: z.coerce.number().default(300),
});
