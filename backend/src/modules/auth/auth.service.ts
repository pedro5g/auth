import { RegisterDto } from "../../core/interface/auth.interface";

export class AuthService {
  public async register(registerDto: RegisterDto) {
    const { name, email, password, userAgent } = registerDto;
  }
}
