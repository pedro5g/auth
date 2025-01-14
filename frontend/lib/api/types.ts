import { AxiosInstance } from "axios";

export type ForgotPasswordType = { email: string };
export type ResetPasswordType = { password: string; verificationCode: string };
export type VerifyEmailType = { code: string };
export type VerifyMFAType = { code: string; secretKey: string };
export type MFALoginType = { code: string; email: string };
export type VerifyMFAReturnType = { message: string };
export type RevokeMFAReturnType = { message: string };
export type UserSessionQueryReturnType = { user: UserType };
export type LoginByMagicLink = { email: string };
export type LoginByMagicLinkResponseType = { message: string };

export type LoginType = {
  email: string;
  password: string;
};

export type LoginResponseType = {
  mfaRequired: boolean;
};

export type RegisterType = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type SessionType = {
  _id: string;
  userId: string;
  userAgent: string;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
};

export type UserType = {
  name: string;
  email: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  userPreferences: {
    enable2FA: boolean;
  };
};

export type SessionResponseType = {
  message: string;
  sessions: SessionType[];
};

export type MFAType = {
  message: string;
  secret: string;
  qrImageUrl: string;
};

export type MethodType = "get" | "post" | "put" | "patch" | "delete";

export enum MethodsEnum {
  GET = "get",
  POST = "post",
  DELETE = "delete",
  PATCH = "patch",
  PUT = "put",
}
export type FetchAdapterOpts = RequestInit & {
  baseURL: string;
};

export type RequesterFn = <T>(
  url: string,
  method: MethodType,
  body?: unknown,
  headers?: Record<string, string>
) => Promise<T>;

export type AxiosAdapterType = (instance: AxiosInstance) => RequesterFn;
export type FetchAdapterType = (
  instance: typeof fetch,
  opts?: FetchAdapterOpts
) => RequesterFn;
export interface HttpClient {
  requester<T>(
    url: string,
    method: MethodType,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<T>;
  GET<T>(url: string, headers?: Record<string, string>): Promise<T>;
  POST<T, B = unknown>(
    url: string,
    body?: B,
    headers?: Record<string, string>
  ): Promise<T>;
  PUT<T, B = unknown>(
    url: string,
    body?: B,
    headers?: Record<string, string>
  ): Promise<T>;
  DELETE<T>(url: string, headers?: Record<string, string>): Promise<T>;
  PATCH<T, B = unknown>(
    url: string,
    body?: B,
    headers?: Record<string, string>
  ): Promise<T>;
}
