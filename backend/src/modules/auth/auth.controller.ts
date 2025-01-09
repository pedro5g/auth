import { setAuthenticationCookies } from "../../core/utils/cookie";
import { HTTP_STATUS } from "../../core/utils/http-status-code";
import {
  loginSchema,
  registerSchema,
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
    const { user, accessToken, refreshToken } = await this.authService.login(
      body
    );

    setAuthenticationCookies({
      res,
      accessToken,
      refreshToken,
    })
      .status(HTTP_STATUS.OK)
      .json({
        message: "User login successfully",
        data: { user },
      });
  });
}
