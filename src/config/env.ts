import { z } from "zod";

const envSchema = z.object({
  POLYGON_API_KEY: z.string().min(1, "Polygon API key is required"),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

// Use import.meta.env for Vite, process.env for other environments
const getEnvVar = (key: string): string => {
  const value = import.meta.env[key] || process.env[key];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value || "";
};

export const env = envSchema.parse({
  POLYGON_API_KEY: getEnvVar("VITE_POLYGON_API_KEY"),
  NODE_ENV: getEnvVar("NODE_ENV"),
});

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>;
