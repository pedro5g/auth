import { NotFoundException } from "../../core/utils/catch-errors";
import { SessionModel } from "../../db/models/session.model";

export class SessionService {
  public async getAllSession(userId: string) {
    const sessions = await SessionModel.find(
      {
        userId,
        expiredAt: { $gt: Date.now() },
      },
      {
        _id: 1,
        userId: 1,
        userAgent: 1,
        createdAt: 1,
        expiredAt: 1,
      },
      {
        sort: {
          createdAt: -1,
        },
      }
    );

    return { sessions };
  }

  public async getSessionById(sessionId: string) {
    const session = await SessionModel.findById(sessionId)
      .populate("userId")
      .select("-expiredAt");

    if (!session) {
      throw new NotFoundException("Session not found");
    }

    const { userId: user } = session;

    return { user };
  }

  public async deleteSession(sessionId: string, userId: string) {
    const deletedSession = await SessionModel.findByIdAndDelete({
      _id: sessionId,
      userId,
    });

    if (!deletedSession) {
      throw new NotFoundException("Session not found");
    }
  }
}
