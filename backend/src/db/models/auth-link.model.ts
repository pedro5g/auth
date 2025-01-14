import mongoose, { Document, Schema } from "mongoose";

export interface AuthLinkDocument extends Document {
  userId: mongoose.Types.ObjectId;
  code: string;
  expiredAt: Date;
  createdAt: Date;
}

const authLinkSchema = new Schema<AuthLinkDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    index: true,
    required: true,
  },
  code: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiredAt: {
    type: Date,
    required: true,
  },
});

export const AuthLinkModel = mongoose.model<AuthLinkDocument>(
  "AuthLink",
  authLinkSchema,
  "auth_link"
);
