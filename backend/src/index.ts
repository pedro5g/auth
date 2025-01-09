import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config/app-config";
import passport from "passport";
import { errorHandler } from "./middlewares/error-handler";
import { asyncHandler } from "./middlewares/async-handler";
import { HTTP_STATUS } from "./core/utils/http-status-code";
import { connectDatabase } from "./db/database";
import { authRoutes } from "./modules/auth/auth.routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: config.APP_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(passport.initialize());

app.use(`${config.BASE_PATH}/auth`, authRoutes);

app.get(
  "/",
  asyncHandler(async (req, res) => {
    res.status(HTTP_STATUS.OK).json({ message: "Server is on" });
  })
);
app.use(errorHandler);
app.listen(config.PORT, async () => {
  await connectDatabase();
  console.log(
    `Server is running on port ${config.PORT}, in ${config.NODE_ENV} mode 🚀`
  );
});
