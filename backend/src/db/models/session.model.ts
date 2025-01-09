import mongoose, { Document, Schema } from "mongoose";
import { thirtyDaysFromNow } from "../../core/utils/date-time";

export interface SessionDocument extends Document {
  userId: mongoose.Types.ObjectId;
  userAgent?: string;
  expiredAt: Date;
  createdAt: Date;
}

const sessionSchema = new Schema<SessionDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    index: true,
    required: true,
  },
  userAgent: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  expiredAt: {
    type: Date,
    default: thirtyDaysFromNow,
    required: true,
  },
});

export const SessionSchema = mongoose.model<SessionDocument>(
  "Session",
  sessionSchema
);
