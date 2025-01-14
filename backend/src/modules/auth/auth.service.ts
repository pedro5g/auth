import { config } from "../../config/app-config";
import { ErrorCode } from "../../core/enums/error-code";
import { VerificationEnum } from "../../core/enums/verification-enum";
import {
  LoginDto,
  MagicAuthenticateDto,
  RegisterDto,
  ResetPasswordDto,
} from "../../core/interface/auth.interface";
import { hashPassword } from "../../core/utils/bcrypt";
import {
  BadRequestException,
  HttpException,
  InternalServerException,
  NotFoundException,
  UnauthorizedException,
} from "../../core/utils/catch-errors";
import {
  anHourFromNow,
  calculateExpirationDate,
  minutesAgo,
  minutesFromNow,
  ONE_DAY_IN_MS,
} from "../../core/utils/date-time";
import { HTTP_STATUS } from "../../core/utils/http-status-code";
import {
  RefreshTokenPayload,
  refreshTokenSignOptions,
  signJwtToken,
  verifyJwtToken,
} from "../../core/utils/jwt";
import { generateUniqueCode } from "../../core/utils/uuid";
import { AuthLinkModel } from "../../db/models/auth-link.model";
import { SessionModel } from "../../db/models/session.model";
import { UserDocument, UserModel } from "../../db/models/user.model";
import { VerificationCodeModel } from "../../db/models/verification.model";
import { sendEmail } from "../../mailers/mailer";
import {
  magicLinkAuthenticationTemplate,
  passwordResetTemplate,
  verifyEmailTemplate,
} from "../../mailers/templates/template";

export class AuthService {
  public async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;

    const existingUser = await UserModel.exists({ email });

    if (existingUser) {
      throw new BadRequestException(
        "User already exists with this email",
        ErrorCode.AUTH_EMAIL_ALREADY_EXISTS
      );
    }

    const newUser = await UserModel.create({
      name,
      email,
      password,
    });

    const userId = newUser._id;

    const verification = await VerificationCodeModel.create({
      userId,
      type: VerificationEnum.EMAIL_VERIFICATION,
      expiresAt: minutesFromNow(45),
    });

    const verificationURL = `${config.APP_ORIGIN}/confirm-account?code=${verification.code}`;

    await sendEmail({
      to: newUser.email,
      ...verifyEmailTemplate(verificationURL),
    });

    return { user: newUser };
  }

  public async login(loginDto: LoginDto) {
    const { email, password, userAgent } = loginDto;

    const user = await UserModel.findOne({ email });

    if (!user) {
      throw new BadRequestException(
        "Invalid email or password",
        ErrorCode.AUTH_USER_NOT_FOUND
      );
    }

    if (!user.isEmailVerified) {
      await this.resendVerificationEmail(user);
    }

    const passwordMatch = await user.comparePassword(password);

    if (!passwordMatch) {
      throw new BadRequestException(
        "Invalid email or password",
        ErrorCode.AUTH_USER_NOT_FOUND
      );
    }

    if (user.userPreferences.enable2FA) {
      return {
        user: null,
        mfaRequired: true,
        accessToken: "",
        refreshToken: "",
      };
    }

    const session = await SessionModel.create({
      userId: user._id,
      userAgent,
    });

    const accessToken = signJwtToken({
      userId: user._id,
      sessionId: session._id,
    });
    const refreshToken = signJwtToken(
      {
        sessionId: session._id,
      },
      refreshTokenSignOptions
    );

    return {
      user,
      accessToken,
      refreshToken,
      mfaRequired: false,
    };
  }

  public async refreshToken(refreshToken: string) {
    const { payload } = verifyJwtToken<RefreshTokenPayload>(refreshToken, {
      secret: refreshTokenSignOptions.secret,
    });

    if (!payload) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const session = await SessionModel.findById(payload.sessionId);
    if (!session) {
      throw new UnauthorizedException("Session does not exist");
    }

    const now = Date.now();
    if (session.expiredAt.getTime() <= now) {
      throw new UnauthorizedException("Session expired");
    }

    const sessionRequiredRefresh =
      session.expiredAt.getTime() - now <= ONE_DAY_IN_MS;

    if (sessionRequiredRefresh) {
      session.expiredAt = calculateExpirationDate(
        config.JWT.REFRESH_EXPIRES_IN
      );
      await session.save();
    }

    const newRefreshToken = sessionRequiredRefresh
      ? signJwtToken(
          {
            sessionId: session._id,
          },
          refreshTokenSignOptions
        )
      : undefined;

    const accessToken = signJwtToken({
      userId: session.userId,
      sessionId: session._id,
    });

    return {
      accessToken,
      newRefreshToken,
    };
  }

  public async verifyEmail(code: string) {
    const validCode = await VerificationCodeModel.findOne({
      code,
      type: VerificationEnum.EMAIL_VERIFICATION,
      expiresAt: { $gt: new Date() },
    });

    if (!validCode) {
      throw new BadRequestException("Invalid or expired verification code");
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      validCode.userId,
      {
        isEmailVerified: true,
      },
      {
        new: true,
      }
    );

    if (!updatedUser) {
      throw new BadRequestException(
        "Unable to verify email address",
        ErrorCode.VALIDATION_ERROR
      );
    }

    await validCode.deleteOne();

    return {
      user: updatedUser,
    };
  }

  public async forgotPassword(email: string) {
    const user = await UserModel.findOne({ email });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (!user.isEmailVerified) {
      await this.resendVerificationEmail(user);
    }

    const timeAgo = minutesAgo(3); // 3 minutes ago
    const maxAttempts = 2;

    const count = await VerificationCodeModel.countDocuments({
      userId: user._id,
      type: VerificationEnum.PASSWORD_RESET,
      createdAt: { $gt: timeAgo },
    });

    if (count >= maxAttempts) {
      throw new HttpException(
        "Too many request, try again later",
        HTTP_STATUS.TOO_MANY_REQUESTS,
        ErrorCode.AUTH_TOO_MANY_ATTEMPTS
      );
    }

    const expiresAt = anHourFromNow();
    const validCode = await VerificationCodeModel.create({
      userId: user._id,
      type: VerificationEnum.PASSWORD_RESET,
      expiresAt,
    });

    const resetLink = `${config.APP_ORIGIN}/reset-password?code=${
      validCode.code
    }&exp=${expiresAt.getTime()}`;

    const { data, error } = await sendEmail({
      to: user.email,
      ...passwordResetTemplate(resetLink),
    });

    if (!data?.id) {
      throw new InternalServerException(`${error?.name} ${error?.message}`);
    }

    return {
      url: resetLink,
      emailId: data.id,
    };
  }

  async resetPassword({ password, verificationCode }: ResetPasswordDto) {
    const validCode = await VerificationCodeModel.findOne({
      code: verificationCode,
      type: VerificationEnum.PASSWORD_RESET,
      expiresAt: { $gt: new Date() },
    });

    if (!validCode) {
      throw new NotFoundException("Invalid or expired verification code");
    }

    const hashedPassword = await hashPassword(password);

    const updatedUser = await UserModel.findByIdAndUpdate(validCode.userId, {
      password: hashedPassword,
    });

    if (!updatedUser) {
      throw new BadRequestException("Failed to reset password!");
    }

    await Promise.all([
      validCode.deleteOne(),
      SessionModel.deleteMany({ userId: updatedUser._id }),
    ]);

    return {
      user: updatedUser,
    };
  }

  public async logout(sessionId: string) {
    return await SessionModel.findByIdAndDelete(sessionId);
  }

  public async loginByMagicLink(email: string) {
    const user = await UserModel.findOne({ email });

    if (!user) {
      throw new NotFoundException("Invalid email address");
    }

    let authCode: string;
    const authLinkOnDatabase = await AuthLinkModel.findOne({
      userId: user._id,
      expiredAt: { $gt: new Date() },
    });

    if (authLinkOnDatabase) {
      authCode = authLinkOnDatabase.code;
    } else {
      authCode = generateUniqueCode();
      await AuthLinkModel.create({
        userId: user._id,
        code: authCode,
        expiredAt: minutesFromNow(10),
      });
    }

    const authLink = new URL(
      "api/v1/auth/magic/authenticate",
      config.API_BASE_URL
    );
    authLink.searchParams.set("code", authCode);
    authLink.searchParams.set("redirect", config.APP_ORIGIN);

    const { error } = await sendEmail({
      ...magicLinkAuthenticationTemplate(authLink.toString()),
      to: user.email,
    });

    return {
      message: error
        ? "Oops, something were wrong to try send magic link"
        : "Authentication link sent successfully, check your email",
    };
  }

  public async magicAuthenticate({ code, userAgent }: MagicAuthenticateDto) {
    const authLink = await AuthLinkModel.findOne({
      code,
      expiredAt: { $gt: new Date() },
    });

    if (!authLink) {
      throw new BadRequestException("Invalid or expired magic link");
    }

    const user = await UserModel.findOne({ _id: authLink.userId });

    if (!user) {
      throw new NotFoundException("User not fond");
    }

    if (user.userPreferences.enable2FA) {
      await authLink.deleteOne();
      return {
        mfaRequired: true,
        email: user.email,
        accessToken: "",
        refreshToken: "",
      };
    }

    const session = await SessionModel.create({
      userId: user._id,
      userAgent,
    });

    const accessToken = signJwtToken({
      userId: user._id,
      sessionId: session._id,
    });
    const refreshToken = signJwtToken(
      {
        sessionId: session._id,
      },
      refreshTokenSignOptions
    );

    await authLink.deleteOne();

    return {
      accessToken,
      refreshToken,
      mfaRequired: false,
    };
  }

  private async resendVerificationEmail(user: UserDocument) {
    let verification = await VerificationCodeModel.findOne({
      userId: user._id,
    });

    const verificationURL = `${config.APP_ORIGIN}/confirm-account?code=`;

    if (
      verification &&
      verification.expiresAt.getTime() < new Date().getTime()
    ) {
      verificationURL.concat(verification.code);
    } else {
      verification = await VerificationCodeModel.create({
        userId: user._id,
        type: VerificationEnum.EMAIL_VERIFICATION,
        expiresAt: minutesFromNow(45),
      });
      verificationURL.concat(verification.code);
    }

    await sendEmail({
      to: user.email,
      ...verifyEmailTemplate(verificationURL),
    });

    throw new BadRequestException(
      "Email does not verified, please verify your email",
      ErrorCode.VERIFICATION_ERROR
    );
  }
}
