import * as z from "zod";
import { config } from "dotenv";
config();

const envSchema = z.object({
  PORT: z.coerce.number().default(8080),
  API_BASE_URL: z.string(),
  ENV_NODE: z.enum(["dev", "prod", "test"]).default("dev"),
  MONGO_URI: z.string(),
  BASE_PATH: z.string(),
  APP_ORIGIN: z.string().url(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_REFRESH_EXPIRES_IN: z.string(),
  RESEND_API_KEY: z.string(),
  MAILER_SENDER: z.string(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error(`Invalid environment variables ❌❌❌❌❌`);
  throw new Error(`Invalid environment variables ${_env.error.format()}`);
}

export const env = _env.data;
export type Env = z.infer<typeof envSchema>;
