import {
  ExtractJwt,
  StrategyOptionsWithRequest,
  Strategy as JwtStrategy,
} from "passport-jwt";
import { UnauthorizedException } from "../utils/catch-errors";
import { ErrorCode } from "../enums/error-code";
import { Request } from "express";
import { config } from "../../config/app-config";
import passport, { PassportStatic } from "passport";
import { userService } from "../../modules/user/user.module";

interface JwtPayload {
  userId: string;
  sessionId: string;
}

const options: StrategyOptionsWithRequest = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    (req: Request) => {
      const accessToken = req.cookies.accessToken as string | undefined;
      if (!accessToken) {
        throw new UnauthorizedException(
          "Unauthorized access token",
          ErrorCode.AUTH_TOKEN_NOT_FOUND
        );
      }
      return accessToken;
    },
  ]),
  secretOrKey: config.JWT.SECRET,
  audience: ["user"],
  algorithms: ["HS256"],
  passReqToCallback: true,
};

export const setupJwtStrategy = (passport: PassportStatic) => {
  passport.use(
    new JwtStrategy(
      options,
      async (request: Request, payload: JwtPayload, done) => {
        try {
          const user = await userService.findUserById(payload.userId);
          if (!user) {
            return done(null, false);
          }
          request.sessionId = payload.sessionId;
          done(null, user);
        } catch (e) {
          return done(e, false);
        }
      }
    )
  );
};

export const authenticateJWT = passport.authenticate("jwt", { session: false });
