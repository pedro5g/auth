import {
  NotFoundException,
  UnauthorizedException,
} from "../../core/utils/catch-errors";
import {
  clearAuthenticationCookies,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  setAuthenticationCookies,
} from "../../core/utils/cookie";
import { HTTP_STATUS } from "../../core/utils/http-status-code";
import {
  emailSchema,
  loginSchema,
  magicAuthenticateSchema,
  registerSchema,
  resetPasswordSchema,
  verificationEmailSchema,
} from "../../core/validators/auth.validator";
import { asyncHandler } from "../../middlewares/async-handler";
import { AuthService } from "./auth.service";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  public register = asyncHandler(async (req, res) => {
    const body = registerSchema.parse({ ...req.body });

    const { user } = await this.authService.register(body);

    res
      .status(HTTP_STATUS.OK)
      .json({ message: "User registered successfully", data: user });
  });

  public login = asyncHandler(async (req, res) => {
    const userAgent = req.headers["user-agent"];
    const body = loginSchema.parse({ ...req.body, userAgent });
    const { user, accessToken, refreshToken, mfaRequired } =
      await this.authService.login(body);

    if (mfaRequired) {
      res.status(HTTP_STATUS.OK).json({
        message: "Verify MFA authentication",
        mfaRequired,
        user,
      });
    }

    setAuthenticationCookies({
      res,
      accessToken,
      refreshToken,
    })
      .status(HTTP_STATUS.OK)
      .json({
        message: "User login successfully",
        mfaRequired,
        user,
      });
  });

  public refreshToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken as string | undefined;

    if (!refreshToken) throw new UnauthorizedException("Missing refresh token");

    const { newRefreshToken, accessToken } =
      await this.authService.refreshToken(refreshToken);

    if (newRefreshToken) {
      res.cookie(
        "refreshToken",
        newRefreshToken,
        getRefreshTokenCookieOptions()
      );
    }

    res
      .status(HTTP_STATUS.OK)
      .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
      .json({ message: "Refresh access token successfully" });
  });

  public veryEmail = asyncHandler(async (req, res) => {
    const { code } = verificationEmailSchema.parse(req.body);
    await this.authService.verifyEmail(code);

    res.status(HTTP_STATUS.OK).json({ message: "Email verified successfully" });
  });

  public forgotPassword = asyncHandler(async (req, res) => {
    const email = emailSchema.parse(req.body.email);
    await this.authService.forgotPassword(email);

    res.status(HTTP_STATUS.OK).json({
      message: "Password reset email sent",
    });
  });

  public resetPassword = asyncHandler(async (req, res) => {
    const body = resetPasswordSchema.parse(req.body);

    await this.authService.resetPassword(body);
    clearAuthenticationCookies(res).status(HTTP_STATUS.OK).json({
      message: "Reset password successfully",
    });
  });

  public logout = asyncHandler(async (req, res) => {
    const sessionId = req.sessionId;

    if (!sessionId) {
      throw new NotFoundException("Session is invalid");
    }
    await this.authService.logout(sessionId);
    clearAuthenticationCookies(res)
      .status(HTTP_STATUS.OK)
      .json({ message: "User logout successfully" });
  });

  public loginByMagicLink = asyncHandler(async (req, res) => {
    const email = emailSchema.parse(req.body.email);

    const { message } = await this.authService.loginByMagicLink(email);

    res.status(HTTP_STATUS.OK).json({ message: message });
  });

  public magicAuthenticate = asyncHandler(async (req, res) => {
    const userAgent = req.headers["user-agent"];
    const { redirect, ...data } = magicAuthenticateSchema.parse({
      ...req.query,
      userAgent,
    });

    const { mfaRequired, accessToken, refreshToken, email } =
      await this.authService.magicAuthenticate(data);

    if (mfaRequired) {
      res
        .status(HTTP_STATUS.REDIRECT)
        .redirect(redirect.concat(`/verify-mfa?email=${email}`));
    }

    setAuthenticationCookies({
      res,
      accessToken,
      refreshToken,
    })
      .status(HTTP_STATUS.REDIRECT)
      .redirect(redirect.concat("/home"));
  });
}
