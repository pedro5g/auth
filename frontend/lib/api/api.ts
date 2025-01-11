import { API } from "./axios";
import { AxiosAdapter, CreateHttpClientAdapter } from "./request-adapter";
import {
  ForgotPasswordType,
  LoginResponseType,
  LoginType,
  MFALoginType,
  MFAType,
  RegisterType,
  ResetPasswordType,
  SessionResponseType,
  VerifyEmailType,
  VerifyMFAType,
} from "./types";

export const api = CreateHttpClientAdapter(AxiosAdapter(API));

export const loginMutationFn = async (data: LoginType) =>
  await api.POST<LoginResponseType>("/auth/login", data);

export const registerMutationFn = async (data: RegisterType) =>
  await api.POST("/auth/register", data);

export const verifyEmailMutationFn = async (data: VerifyEmailType) =>
  await api.POST("/auth/verify/email", data);

export const forgotPasswordMutationFn = async (data: ForgotPasswordType) =>
  await api.POST(`/auth/password/forgot`, data);

export const resetPasswordMutationFn = async (data: ResetPasswordType) =>
  await api.POST(`/auth/password/reset`, data);

export const verifyMFALoginMutationFn = async (data: MFALoginType) =>
  await api.POST(`/mfa/verify-login`, data);

export const logoutMutationFn = async () => await api.POST(`/auth/logout`);

export const mfaSetupQueryFn = async () => {
  return await api.GET<MFAType>(`/mfa/setup`);
};

export const verifyMFAMutationFn = async (data: VerifyMFAType) =>
  await api.POST(`/mfa/verify`, data);

export const revokeMFAMutationFn = async () => await api.PATCH(`/mfa/revoke`);

export const getUserSessionQueryFn = async () => await api.GET(`/session/`);

export const sessionsQueryFn = async () => {
  return await api.GET<SessionResponseType>(`/session/all`);
};

export const sessionDelMutationFn = async (id: string) =>
  await api.DELETE(`/session/${id}`);
