import { env, Env } from "../env/env";

type Keys = keyof Env;

export function getEnv<Key extends Keys>(key: Key, value?: (typeof env)[Key]) {
  if (value) {
    return value;
  }
  return env[key];
}
