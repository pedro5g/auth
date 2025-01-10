import { setAuthenticationCookies } from "../../core/utils/cookie";
import { HTTP_STATUS } from "../../core/utils/http-status-code";
import {
  verifyMfaForLoginSchema,
  verifyMfaSchema,
} from "../../core/validators/mfa.validator";
import { asyncHandler } from "../../middlewares/async-handler";
import { MfaService } from "./mfa.service";

export class MfaController {
  constructor(private readonly mfaService: MfaService) {}

  public generateMFASetup = asyncHandler(async (req, res) => {
    const { secret, qrImageUrl, message } =
      await this.mfaService.generateMFASetup(req);

    res.status(HTTP_STATUS.OK).json({
      message,
      secret,
      qrImageUrl,
    });
  });

  public verifyMFASetup = asyncHandler(async (req, res) => {
    const { code, secretKey } = verifyMfaSchema.parse(req.body);

    const { message, userPreferences } = await this.mfaService.verifyMFASetup(
      req,
      code,
      secretKey
    );
    res.status(HTTP_STATUS.OK).json({
      message,
      userPreferences,
    });
  });

  public revokeMFA = asyncHandler(async (req, res) => {
    const { message, userPreferences } = await this.mfaService.revokeMFA(req);

    res.status(HTTP_STATUS.OK).json({
      message,
      userPreferences,
    });
  });

  public verifyMFAForLogin = asyncHandler(async (req, res) => {
    const { code, email, userAgent } = verifyMfaForLoginSchema.parse({
      ...req.body,
      userAgent: req.headers["user-agent"],
    });
    const { user, accessToken, refreshToken } =
      await this.mfaService.verifyMFAForLogin(code, email, userAgent);
    setAuthenticationCookies({ res, accessToken, refreshToken })
      .status(HTTP_STATUS.OK)
      .json({
        message: "Verified and login successfully",
        user,
      });
  });
}
