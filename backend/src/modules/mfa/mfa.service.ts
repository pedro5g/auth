import { Request } from "express";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../../core/utils/catch-errors";
import { UserModel } from "../../db/models/user.model";
import { signJwtToken, refreshTokenSignOptions } from "../../core/utils/jwt";
import { SessionModel } from "../../db/models/session.model";

export class MfaService {
  public async generateMFASetup(request: Request) {
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException("User not authorized");
    }

    if (user.userPreferences.enable2FA) {
      return { message: "MFA already enabled" };
    }

    let secretKey = user.userPreferences.twoFactorSecret;
    if (!secretKey) {
      const secret = speakeasy.generateSecret({ name: "Auth" });
      secretKey = secret.base32;
      user.userPreferences.twoFactorSecret = secretKey;
      await user.save();
    }

    const url = speakeasy.otpauthURL({
      secret: secretKey,
      label: user.name,
      issuer: "auth.com",
      encoding: "base32",
    });

    const qrImageUrl = await qrcode.toDataURL(url);

    return {
      message: "Scan the QR code or use tge setup key",
      secret: secretKey,
      qrImageUrl,
    };
  }

  public async verifyMFASetup(
    request: Request,
    code: string,
    secretKey: string
  ) {
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException("User not authorized");
    }

    if (user.userPreferences.enable2FA) {
      return {
        message: "MFA already enabled",
        userPreferences: {
          enable2FA: user.userPreferences.enable2FA,
        },
      };
    }

    const isValid = speakeasy.totp.verify({
      secret: secretKey,
      encoding: "base32",
      token: code,
    });

    if (!isValid) {
      throw new BadRequestException("Invalid MFA code. Please try again");
    }

    user.userPreferences.enable2FA = true;
    await user.save();
    return {
      message: "MFA setup completed successfully",
      userPreferences: {
        enable2FA: user.userPreferences.enable2FA,
      },
    };
  }

  public async revokeMFA(request: Request) {
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException("User not authorized");
    }

    if (!user.userPreferences.enable2FA) {
      return {
        message: "MFA is not enabled",
        userPreferences: {
          enable2FA: user.userPreferences.enable2FA,
        },
      };
    }

    user.userPreferences.twoFactorSecret = undefined;
    user.userPreferences.enable2FA = false;

    await user.save();

    return {
      message: "MFA revoke successfully",
      userPreferences: {
        enable2FA: user.userPreferences.enable2FA,
      },
    };
  }

  public async verifyMFAForLogin(
    code: string,
    email: string,
    userAgent?: string
  ) {
    const user = await UserModel.findOne({ email });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (
      !user.userPreferences.enable2FA ||
      !user.userPreferences.twoFactorSecret
    ) {
      throw new UnauthorizedException("MFA not enabled for this user");
    }

    const isValid = speakeasy.totp.verify({
      secret: user.userPreferences.twoFactorSecret,
      encoding: "base32",
      token: code,
    });

    if (!isValid) {
      throw new BadRequestException("Invalid MFA code. Please try again");
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
    };
  }
}
