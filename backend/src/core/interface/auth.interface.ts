export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginDto {
  email: string;
  password: string;
  userAgent?: string;
}

export interface ResetPasswordDto {
  password: string;
  verificationCode: string;
}

export interface MagicAuthenticateDto {
  code: string;
  userAgent?: string;
}
