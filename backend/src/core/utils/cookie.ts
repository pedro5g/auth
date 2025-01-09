import { CookieOptions, Response } from "express";
import { config } from "../../config/app-config";
import { calculateExpirationDate } from "./date-time";

interface CookiePayload {
  res: Response;
  accessToken: string;
  refreshToken: string;
}

export const REFRESH_PATH = `${config.BASE_PATH}/auth/refresh`;

const defaults: CookieOptions = {
  httpOnly: true,
  secure: config.NODE_ENV === "prod" ? true : false,
  sameSite: config.NODE_ENV === "prod" ? "strict" : "lax",
};

export function getRefreshTokenCookieOptions(): CookieOptions {
  const expiresIn = config.JWT.REFRESH_EXPIRES_IN;
  const expires = calculateExpirationDate(expiresIn);
  return {
    ...defaults,
    expires,
    path: REFRESH_PATH,
  };
}
export function getAccessTokenCookieOptions(): CookieOptions {
  const expiresIn = config.JWT.EXPIRES_IN;
  const expires = calculateExpirationDate(expiresIn);
  return {
    ...defaults,
    expires,
    path: "/",
  };
}

export function setAuthenticationCookies({
  res,
  accessToken,
  refreshToken,
}: CookiePayload): Response {
  res.cookie("accessToken", accessToken).cookie("refreshToken", refreshToken);

  return res;
}

export function clearAuthenticationCookies(res: Response) {
  res.clearCookie("accessToken").clearCookie("refreshToken", {
    path: REFRESH_PATH,
  });
}
