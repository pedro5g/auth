import { Router } from "express";
import { authController } from "./auth.module";

const authRoutes = Router();

authRoutes.post("/register", authController.register);
authRoutes.post("/login", authController.login);

export { authRoutes };
