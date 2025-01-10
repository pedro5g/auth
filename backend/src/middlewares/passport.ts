import passport from "passport";
import { setupJwtStrategy } from "../core/strategies/jwt.strategy";

const initializePassport = () => {
  setupJwtStrategy(passport);
};

initializePassport();

export { passport };
