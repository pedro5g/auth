import { Router } from "express";
import { authController } from "./auth.module";
import { authenticateJWT } from "../../core/strategies/jwt.strategy";

const authRoutes = Router();

authRoutes.post("/register", authController.register);
authRoutes.post("/login", authController.login);
authRoutes.post("/verify/email", authController.veryEmail);
authRoutes.post("/password/forgot", authController.forgotPassword);
authRoutes.post("/password/rest", authController.resetPassword);
authRoutes.post("/logout", authenticateJWT, authController.logout);

authRoutes.get("/refresh", authController.refreshToken);

export { authRoutes };
