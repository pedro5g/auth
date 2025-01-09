import { getEnv } from "../core/utils/get-env";

const appConfig = () => ({
  NODE_ENV: getEnv("ENV_NODE"),
  APP_ORIGIN: getEnv("APP_ORIGIN"),
  PORT: getEnv("PORT"),
  BASE_PATH: getEnv("BASE_PATH"),
  MONGO_URI: getEnv("MONOGO_URI"),
  JWT: {
    SECRET: getEnv("JWT_SECRET"),
    EXPIRES_IN: getEnv("JWT_EXPIRES_IN"),
    REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),
    REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_EXPIRES_IN"),
  },
  MAILER_SENDER: getEnv("MAILER_SENDER"),
  RESEND_API_KEY: getEnv("RESEND_API_KEY"),
});

export const config = appConfig();
