import { UserModel } from "../../db/models/user.model";

export class UserService {
  public async findUserById(userId: string) {
    const user = await UserModel.findById(userId, { password: false });
    return user || null;
  }
}
