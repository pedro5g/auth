import { Router } from "express";
import { authController } from "./auth.module";

const authRoutes = Router();

authRoutes.post("/register", authController.register);
authRoutes.post("/login", authController.login);
authRoutes.post("/verify/email", authController.veryEmail);
authRoutes.post("/password/forgot", authController.forgotPassword);
authRoutes.post("/password/rest", authController.resetPassword);

authRoutes.get("/refresh", authController.refreshToken);

export { authRoutes };
