import { ErrorCode } from "../../core/enums/error-code";
import { VerificationEnum } from "../../core/enums/verification-enum";
import { LoginDto, RegisterDto } from "../../core/interface/auth.interface";
import { BadRequestException } from "../../core/utils/catch-errors";
import { minutesFromNow } from "../../core/utils/date-time";
import { refreshTokenSignOptions, signJwtToken } from "../../core/utils/jwt";
import { SessionSchema } from "../../db/models/session.model";
import { UserModel } from "../../db/models/user.model";
import { VerificationCodeModel } from "../../db/models/verification.model";

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

    const verificationCode = await VerificationCodeModel.create({
      userId,
      type: VerificationEnum.EMAIL_VERIFICATION,
      expiredAt: minutesFromNow(45),
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

    const passwordMatch = await user.comparePassword(password);

    if (!passwordMatch) {
      throw new BadRequestException(
        "Invalid email or password",
        ErrorCode.AUTH_USER_NOT_FOUND
      );
    }

    const session = await SessionSchema.create({
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
}
