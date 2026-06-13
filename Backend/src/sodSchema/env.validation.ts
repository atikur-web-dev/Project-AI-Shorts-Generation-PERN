import z from "zod";
export const envSchema = z.object({
  //Node environment
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  // Port
  PORT: z.coerce.number().default(8000),
  // database url
  DATABASE_URL: z.string().url(),
  // jwt secret tokens
  JWT_SECRET: z.string().min(8),
});
