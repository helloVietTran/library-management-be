import { Schema, model } from 'mongoose';
import { IDisabledToken } from '../interfaces/common';

const DisabledTokenSchema = new Schema<IDisabledToken>(
  {
    token: {
      type: String,
      required: true,
      unique: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 3600 } // TTL index
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false
  }
);

const DisabledToken = model<IDisabledToken>('DisabledToken', DisabledTokenSchema);

export default DisabledToken;
