import { SessionService } from "./session.service";
import { asyncHandler } from "../../middlewares/async-handler";
import { HTTP_STATUS } from "../../core/utils/http-status-code";
import { NotFoundException } from "../../core/utils/catch-errors";
import { deleteSessionParamsSchema } from "../../core/validators/session.validator";

export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  public getAllSession = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const sessionId = req.sessionId;

    const { sessions } = await this.sessionService.getAllSession(userId);
    const modifySessions = sessions.map((session) => ({
      ...session.toObject(),
      ...(session.id === sessionId && { isCurrent: true }),
    }));

    res.status(HTTP_STATUS.OK).json({
      message: "Retrieved all session successfully",
      sessions: modifySessions,
    });
  });

  public getSession = asyncHandler(async (req, res) => {
    const sessionId = req.sessionId;

    if (!sessionId) {
      throw new NotFoundException("Session ID not fount. Please log in");
    }

    const { user } = await this.sessionService.getSessionById(sessionId);

    res.status(HTTP_STATUS.OK).json({
      message: "Session retrieved successfully",
      user,
    });
  });

  public deleteSession = asyncHandler(async (req, res) => {
    const sessionId = deleteSessionParamsSchema.parse(req.params.id);
    const userId = req?.user?.id;
    await this.sessionService.deleteSession(sessionId, userId);

    res.status(HTTP_STATUS.OK).json({
      message: "Session remove successfully",
    });
  });
}
