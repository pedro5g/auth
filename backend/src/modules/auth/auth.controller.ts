import { HTTP_STATUS } from "../../core/utils/http-status-code";
import { registerSchema } from "../../core/validators/auth.validator";
import { asyncHandler } from "../../middlewares/async-handler";
import { AuthService } from "./auth.service";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = asyncHandler(async (req, res) => {
    const userAgent = req.headers["user-agent"];
    const body = registerSchema.parse({ ...req.body, userAgent });

    await this.authService.register(body);

    res
      .status(HTTP_STATUS.OK)
      .json({ message: "User registered successfully" });
  });
}
