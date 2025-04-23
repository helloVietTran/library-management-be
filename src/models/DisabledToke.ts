import { Schema, model, Document } from "mongoose";

export interface IDisabledToken extends Document {
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const DisabledTokenSchema = new Schema<IDisabledToken>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index: xóa sau khi hết hạn
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

const DisabledToken = model<IDisabledToken>(
  "DisabledToken",
  DisabledTokenSchema
);

export default DisabledToken;
