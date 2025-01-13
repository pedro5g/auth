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
  return { ...defaults, expires, path: "/" };
}
export function getAccessTokenCookieOptions(): CookieOptions {
  const expiresIn = config.JWT.EXPIRES_IN;
  const expires = calculateExpirationDate(expiresIn);
  return { ...defaults, expires, path: "/" };
}

/**
 * decorate express response, applying all cookies in response
 *
 *
 * @param param0 res - Express Response
 * @param param1 accessToken - String
 * @param param2 refreshToken - String
 *
 * @returns returns response decorated with cookies
 */
export function setAuthenticationCookies({
  res,
  accessToken,
  refreshToken,
}: CookiePayload): Response {
  return res
    .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
    .cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());
}

/**
 * remove all request cookies
 *
 * @param res - Express Response
 * @returns returns response without cookies
 */
export function clearAuthenticationCookies(res: Response) {
  return res.clearCookie("accessToken").clearCookie("refreshToken", {
    path: REFRESH_PATH,
  });
}
