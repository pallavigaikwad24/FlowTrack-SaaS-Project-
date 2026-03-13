import dotenv from "dotenv";
dotenv.config();
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.string().default("5000").transform(Number),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_ACCESS_SECRET: z
    .string()
    .min(5, "JWT_ACCESS_SECRET must be at least 5 characters"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(5, "JWT_REFRESH_SECRET must be at least 5 characters"),
  JWT_ACCESS_EXPIRES_IN: z.string().regex(/^\d+[smhd]$/, "JWT_ACCESS_EXPIRES_IN must be in format like '15m', '7d', '1h'").default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().regex(/^\d+[smhd]$/, "JWT_REFRESH_EXPIRES_IN must be in format like '15m', '7d', '1h'").default("7d"),
  CLIENT_URL: z.url("FRONTEND_URL must be a valid URL"),
  BCRYPT_ROUNDS: z.string().default("12").transform(Number),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
