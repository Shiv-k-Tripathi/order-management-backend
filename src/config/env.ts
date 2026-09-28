
import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(5000),

  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required"),

  FRONTEND_URL: z
    .string()
    .url()
    .default("http://localhost:3000"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment configuration:");
  console.error(z.treeifyError(parsedEnv.error));
  process.exit(1);
}

export const env = parsedEnv.data;